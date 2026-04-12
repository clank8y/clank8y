import { writeFile } from 'node:fs/promises'
import { consola } from 'consola'
import type { Clank8yProfile } from '..'
import type { UsageTotals } from '../../logging'
import { logAgentMessage, logUsageSummary } from '../../logging'
import type { Clank8yMCPServers } from '../../mcp'
import { startAll, stopAll } from '../../mcp'
import { toCopilotMCPServersConfig } from '../../mcp/adapters/copilot'
import { doesReportArtifactExist, getReportArtifactPath } from '../../utils/artifacts'
import { copilotTaskPermissionHandler, getCopilotClient } from './client'
import { COPILOT_AGENT_NAME } from '.'

export const COPILOT_TASK_EXCLUDED_TOOLS = [
  'github-say-hello',
]

export async function runCopilotTask(prompt: string, profile: Clank8yProfile, mcps: Clank8yMCPServers): Promise<void> {
  const client = await getCopilotClient()

  const thoughtStarts = new Map<string, number>()
  const totals: UsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    cost: 0,
  }

  const servers = mcps
  const startResults = await startAll(servers)

  try {
    const session = await client.createSession({
      excludedTools: COPILOT_TASK_EXCLUDED_TOOLS,
      model: profile.model,
      onPermissionRequest: copilotTaskPermissionHandler,
      mcpServers: toCopilotMCPServersConfig(servers, startResults, { timeout: profile.timeOutMs }),
    })

    const collectedMessages: string[] = []

    session.on('assistant.turn_start', (event) => {
      thoughtStarts.set(event.data.turnId, Date.now())
    })

    session.on('assistant.turn_end', (event) => {
      const thoughtStart = thoughtStarts.get(event.data.turnId)
      thoughtStarts.delete(event.data.turnId)

      if (thoughtStart) {
        consola.info(`thought for ${((Date.now() - thoughtStart) / 1000).toFixed(1)}s`)
      }
    })

    session.on('tool.execution_start', (event) => {
      const { toolName, mcpServerName, mcpToolName, arguments: args } = event.data
      const label = mcpServerName ? `${mcpServerName}/${mcpToolName ?? toolName}` : toolName
      if (label === 'report_intent') {
        const intent = args?.intent
        if (!intent)
          return
        consola.info(`🤖 clanking next... ${intent}`)
        return
      }
      consola.info(`→ tool: ${label}${args !== undefined ? ` ${JSON.stringify(args)}` : ''}`)
    })

    session.on('assistant.message', (event) => {
      if (event.data.reasoningText) {
        logAgentMessage({
          agent: COPILOT_AGENT_NAME,
          model: profile.model,
        }, event.data.reasoningText)
      }

      if (event.data.content) {
        collectedMessages.push(event.data.content)
      }
    })

    session.on('assistant.usage', (usage) => {
      totals.inputTokens += usage.data.inputTokens ?? 0
      totals.outputTokens += usage.data.outputTokens ?? 0
      totals.cacheReadTokens += usage.data.cacheReadTokens ?? 0
      totals.cacheWriteTokens += usage.data.cacheWriteTokens ?? 0
      totals.cost += usage.data.cost ?? 0
    })

    try {
      consola.info('clank8y getting to work...')
      const response = await session.sendAndWait({
        prompt,
      }, profile.timeOutMs)

      if (response?.data.content) {
        logAgentMessage({
          agent: COPILOT_AGENT_NAME,
          model: profile.model,
        }, response.data.content)
      } else {
        consola.warn('No response received')
      }

      if (!(await doesReportArtifactExist())) {
        await writeFile(getReportArtifactPath(), [
          '# Task Report (auto-generated fallback)',
          '',
          '> This report was generated automatically because the agent did not produce `.clank8y/report.md`.',
          '',
          ...collectedMessages,
          '',
        ].join('\n'), 'utf-8')
      }
    } finally {
      await client.deleteSession(session.sessionId)
    }
  } finally {
    logUsageSummary(totals)
    await stopAll(servers)
  }
}
