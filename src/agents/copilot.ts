import type { Clank8yAgent, Clank8yAgentFactory } from '.'
import { defineTool } from '@github/copilot-sdk'
import { consola } from 'consola'
import type { UsageTotals } from '../logging'
import { logAgentMessage, logUsageSummary } from '../logging'
import { mcpServers, startAll, stopAll } from '../mcp'
import { setPullRequestContext } from '../setup'
import { toCopilotMCPServersConfig } from '../mcp/adapters/copilot'
import { toJsonSchema } from '@valibot/to-json-schema'
import {
  COPILOT_EXCLUDED_TOOLS,
  createCopilotPermissionHandler,
  ensureCopilotModelAvailable,
  getCopilotClient,
} from './copilot/client'
import { selectCopilotMode } from './copilot/selectMode'

import * as v from 'valibot'

const setPRContextTool = defineTool<{
  repository: string
  pr_number: number
}>('set-pull-request-context', {
  description: 'Set the pull request context for the current review session. Call this before any other pull request tools and provide the repository plus pull request number from the prompt context.',
  parameters: toJsonSchema(
    v.object({
      repository: v.pipe(v.string(), v.description('Repository in owner/repo format for the pull request to review.')),
      pr_number: v.pipe(v.number(), v.description('The pull request number to set the context for')),
    }),
    {
      errorMode: 'warn',
    },
  ) as any,
  handler: async ({ repository, pr_number }) => {
    const pullRequest = await setPullRequestContext({
      repository,
      prNumber: pr_number,
    })

    return {
      success: true,
      context: {
        repository: `${pullRequest.owner}/${pullRequest.repo}`,
        pullRequestNumber: pullRequest.number,
        baseRef: pullRequest.baseRef,
        headRef: pullRequest.headRef,
      },
      pullRequest: {
        number: pullRequest.number,
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        headRef: pullRequest.headRef,
        headSha: pullRequest.headSha,
        baseRef: pullRequest.baseRef,
        baseSha: pullRequest.baseSha,
      },
      nextSteps: [
        'Call prepare-pull-request-review.',
        'Read only relevant diff/file chunks.',
        'Submit findings with create-pull-request-review.',
      ],
    }
  },
})

export const githubCopilotAgent: Clank8yAgentFactory = async (options) => {
  const agentName = 'github-copilot'
  const model = options.model ?? 'claude-sonnet-4.6'
  const client = await getCopilotClient()
  await ensureCopilotModelAvailable(client, model)

  async function selectMode(prompt: string) {
    return selectCopilotMode({
      client,
      model,
      prompt,
    })
  }

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
        excludedTools: COPILOT_EXCLUDED_TOOLS,
        model,
        tools: [setPRContextTool],
        onPermissionRequest: createCopilotPermissionHandler(),
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
    selectMode,
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
