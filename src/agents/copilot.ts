import type { Clank8yAgent, Clank8yAgentFactory } from '.'
import { consola } from 'consola'
import type { UsageTotals } from '../logging'
import { logAgentMessage, logUsageSummary } from '../logging'
import { mcpServers, startAll, stopAll } from '../mcp'
import { toCopilotMCPServersConfig } from '../mcp/adapters/copilot'
import {
  COPILOT_REVIEW_EXCLUDED_TOOLS,
  copilotPermissionHandler,
  ensureCopilotModelAvailable,
  getCopilotClient,
} from './copilot/client'
import { selectCopilotMode } from './copilot/selectMode'

export const githubCopilotAgent: Clank8yAgentFactory = async (options) => {
  const agentName = 'github-copilot'
  const model = options.model ?? 'claude-sonnet-4.6'
  const client = await getCopilotClient()
  await ensureCopilotModelAvailable(client, model)

  async function runReview(prompt: string): Promise<void> {
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
        model,
        onPermissionRequest: copilotPermissionHandler,
        mcpServers: toCopilotMCPServersConfig(servers, startResults, { timeout: options.tools.maxRuntimeMs }),
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
          // log intent as agent message when {intent: ...} is in args
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
            agent: agentName,
            model,
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
        }, options.timeOutMs)

        if (response?.data.content) {
          logAgentMessage({
            agent: agentName,
            model,
          }, response.data.content)
        } else {
          consola.warn('No response received')
        }
      } finally {
        await session.disconnect()
      }
    } finally {
      logUsageSummary(totals)
      await client.stop()
      await stopAll(servers)
      consola.success('Review run finished')
    }
  }

  const clank8yAgent: Clank8yAgent = {
    name: agentName,
    provider: 'GitHub Copilot',
    model,
    selectMode: (selectModeOptions) => selectCopilotMode({
      client,
      model,
      prompt: selectModeOptions.prompt,
      mcp: selectModeOptions.mcp,
      timeoutMs: options.tools.maxRuntimeMs,
    }),
    run: async ({ mode, prompt }) => {
      switch (mode) {
        case 'Review':
          await runReview(prompt)
          break
        default:
          throw new Error(`Unsupported mode for GitHub Copilot agent: ${mode satisfies never}`)
      }
    },
  }

  return clank8yAgent
}
