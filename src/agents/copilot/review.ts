import { consola } from 'consola'
import type { UsageTotals } from '../../logging'
import { logAgentMessage, logUsageSummary } from '../../logging'
import { mcpServers, startAll, stopAll } from '../../mcp'
import { toCopilotMCPServersConfig } from '../../mcp/adapters/copilot'
import { copilotPermissionHandler, getCopilotClient } from './client'
import type { Clank8yProfile } from '..'
import { COPILOT_AGENT_NAME } from '.'

// allowed built in tools: report_intent, task
// ! allowedTools array does not seem to work as expected currently
export const COPILOT_REVIEW_EXCLUDED_TOOLS = [
  'bash',
  'create',
  'github-say-hello',
  'glob',
  // 'grep',
  'list_agents',
  'list_bash',
  'read_agent',
  'read_bash',
  'sql',
  'stop_bash',
  'task',
  'web_fetch',
  'write_bash',
  // 'rg',
]

export async function runCopilotReview(prompt: string, profile: Clank8yProfile): Promise<void> {
  const client = await getCopilotClient()

  const thoughtStarts = new Map<string, number>()
  const totals: UsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    cost: 0,
  }

  const servers = mcpServers()
  const startResults = await startAll(servers)

  try {
    const session = await client.createSession({
      excludedTools: COPILOT_REVIEW_EXCLUDED_TOOLS,
      model: profile.model,
      onPermissionRequest: copilotPermissionHandler,
      mcpServers: toCopilotMCPServersConfig(servers, startResults, { timeout: profile.timeOutMs }),
    })

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
    } finally {
      await client.deleteSession(session.sessionId)
    }
  } finally {
    logUsageSummary(totals)
    await stopAll(servers)
  }
}
