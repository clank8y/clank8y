import { writeFile } from 'node:fs/promises'
import { consola } from 'consola'
import type { UsageTotals } from '../../logging'
import { logAgentMessage, logUsageSummary } from '../../logging'
import type { Clank8yMCPServers } from '../../mcp'
import { startAll, stopAll } from '../../mcp'
import { toCopilotMCPServersConfig } from '../../mcp/adapters/copilot'
import { doesReportArtifactExist, getReportArtifactPath } from '../../utils/artifacts'
import { copilotIncidentFixPermissionHandler, getCopilotClient } from './client'
import type { Clank8yProfile } from '..'
import { COPILOT_AGENT_NAME } from '.'

/**
 * IncidentFix keeps the agent administrative tools blocked but unlocks
 * shell, file creation, and glob so the agent can clone repos, run
 * builds/tests, read code trees, and write the report + local fixes.
 */
export const COPILOT_INCIDENT_FIX_EXCLUDED_TOOLS = [
  'github-say-hello',
  'web_fetch',
]

export async function runCopilotIncidentFix(prompt: string, profile: Clank8yProfile, mcps: Clank8yMCPServers): Promise<void> {
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
      excludedTools: COPILOT_INCIDENT_FIX_EXCLUDED_TOOLS,
      model: profile.model,
      onPermissionRequest: copilotIncidentFixPermissionHandler,
      mcpServers: toCopilotMCPServersConfig(servers, startResults, { timeout: profile.timeOutMs }),
    })

    const collectedMessages: { content?: string, reasoningText?: string }[] = []

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
      collectedMessages.push({
        content: event.data.content || undefined,
        reasoningText: event.data.reasoningText || undefined,
      })

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

    const MAX_REPORT_RETRIES = 3
    const REPORT_REMINDER_PROMPT = [
      'Your investigation report file at `.clank8y/report.md` is missing.',
      'You MUST create this file now using a normal file write tool.',
      'Include: incident summary, confirmed facts, rejected hypotheses,',
      'repositories inspected, branches inspected, changes made (if any),',
      'fix direction, and open questions.',
    ].join(' ')

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

      // Check for report.md and re-prompt if missing
      let reportExists = await doesReportArtifactExist()

      for (let attempt = 1; attempt <= MAX_REPORT_RETRIES && !reportExists; attempt++) {
        consola.warn(`report.md not found after run (attempt ${attempt}/${MAX_REPORT_RETRIES}), re-prompting agent...`)

        const retryResponse = await session.sendAndWait({
          prompt: REPORT_REMINDER_PROMPT,
        }, profile.timeOutMs)

        if (retryResponse?.data.content) {
          logAgentMessage({
            agent: COPILOT_AGENT_NAME,
            model: profile.model,
          }, retryResponse.data.content)
        }

        reportExists = await doesReportArtifactExist()
      }

      // Fallback: build report from collected assistant messages
      if (!reportExists) {
        consola.warn('Agent did not produce report.md after retries — generating fallback report from collected messages.')
        const fallbackReport = buildFallbackReport(collectedMessages)
        await writeFile(getReportArtifactPath(), fallbackReport, 'utf-8')
        consola.info(`Fallback report written to ${getReportArtifactPath()}`)
      }
    } finally {
      await client.deleteSession(session.sessionId)
    }
  } finally {
    logUsageSummary(totals)
    await stopAll(servers)
  }
}

function buildFallbackReport(messages: { content?: string, reasoningText?: string }[]): string {
  const sections: string[] = [
    '# IncidentFix Report (auto-generated fallback)',
    '',
    '> This report was generated automatically because the agent did not produce `.clank8y/report.md`.',
    '',
  ]

  const reasoning = messages
    .map((m) => m.reasoningText)
    .filter(Boolean)
  const content = messages
    .map((m) => m.content)
    .filter(Boolean)

  if (reasoning.length > 0) {
    sections.push('## Agent Reasoning', '')
    for (const text of reasoning) {
      sections.push(text!, '')
    }
  }

  if (content.length > 0) {
    sections.push('## Agent Responses', '')
    for (const text of content) {
      sections.push(text!, '')
    }
  }

  if (reasoning.length === 0 && content.length === 0) {
    sections.push('No agent messages were captured during this run.', '')
  }

  return sections.join('\n')
}
