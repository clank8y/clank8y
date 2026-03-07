import type { PullReviewAgentFactory } from '.'
import process from 'node:process'
import { CopilotClient, defineTool } from '@github/copilot-sdk'
import type { CopilotClientOptions } from '@github/copilot-sdk'
import { consola } from 'consola'
import type { UsageTotals } from '../logging'
import { logAgentMessage, logUsageSummary } from '../logging'
import { getPullRequestReviewContext, setPullRequestContext } from '../setup'
import { mcpServers, startAll, stopAll } from '../mcp'
import { toCopilotMCPServersConfig } from '../mcp/adapters/copilot'
import { toJsonSchema } from '@valibot/to-json-schema'

import * as v from 'valibot'

function hasCopilotAgentTokenInEnvironment(): boolean {
  return !!process.env.COPILOT_GITHUB_TOKEN
}

function resolveCopilotAgentTokenFromEnvironment(): string {
  const copilotAgentToken = process.env.COPILOT_GITHUB_TOKEN

  if (!copilotAgentToken) {
    throw new Error(
      'Copilot authentication token is missing. Set COPILOT_GITHUB_TOKEN.',
    )
  }

  return copilotAgentToken
}

export function getCopilotClientOptions(githubToken: string): CopilotClientOptions {
  return {
    githubToken,
    useLoggedInUser: false,
  }
}

const setPRContextTool = defineTool<{
  pr_number: number
}>('set-pull-request-context', {
  description: 'Set the pull request context for the current review session. Call this before any other tools to initialize the PR context.',
  parameters: toJsonSchema(
    v.object({
      pr_number: v.pipe(v.number(), v.description('The pull request number to set the context for')),
    }),
  ) as any,
  handler: async ({ pr_number }) => {
    const pullRequest = await setPullRequestContext(pr_number)

    return {
      success: true,
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

export const githubCopilotAgent: PullReviewAgentFactory = async (options) => {
  const agent = 'github-copilot'
  const model = options.model ?? 'claude-sonnet-4.6'

  consola.info('Preparing GitHub Copilot review agent')
  consola.info('Using the Copilot SDK bundled CLI to keep SDK and CLI protocol versions aligned')

  if (!hasCopilotAgentTokenInEnvironment()) {
    throw new Error(
      [
        'Copilot authentication token is missing.',
        'Set COPILOT_GITHUB_TOKEN in the workflow environment,',
        'before starting clank8y.',
      ].join(' '),
    )
  }
  consola.info('Copilot authentication token detected in environment')

  const copilotAgentToken = resolveCopilotAgentTokenFromEnvironment()
  consola.info('Using explicit GitHub token for Copilot SDK authentication')

  const context = await getPullRequestReviewContext()

  // TODO: post input context prompt
  /*   logAgentMessage({
    agent,
    model,
  }, [
    `repository: ${context.repository.owner}/${context.repository.repo}`,
  ]) */

  const client = new CopilotClient({
    ...getCopilotClientOptions(copilotAgentToken),
  })

  const servers = mcpServers()

  return async () => {
    const thoughtStarts = new Map<string, number>()
    const totals: UsageTotals = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 0,
    }
    const startResults = await startAll(servers)

    try {
      await client.start()

      const authStatus = await client.getAuthStatus()

      if (!authStatus.isAuthenticated) {
        throw new Error('Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.')
      }

      const models = await client.listModels()
      const modelIds = models.map((model) => model.id)

      if (!process.env.GITHUB_ACTIONS) {
        consola.log(`Available models:\n${modelIds.map((m) => `  • ${m}`).join('\n')}`)
      }

      if (!modelIds.includes(model)) {
        throw new Error(`Configured model '${model}' is not available for this token/account.`)
      }

      if (!process.env.GITHUB_ACTIONS) {
        const availableTools = [
        // Built-in Copilot agent tools kept from the original excluded list
          'report_intent',
          'task',
          // Custom in-process tool
          setPRContextTool.name,
          // All tools exposed by registered MCP servers (filtered per-server via allowedTools)
          ...Object.values(startResults).flatMap((r) => r.toolNames),
        ]

        consola.log(`Available tools for this session:\n${availableTools.map((t) => `  • ${t}`).join('\n')}`)
      }

      const session = await client.createSession({
        excludedTools: ['bash', 'create', 'edit', 'github-say-hello', 'glob', 'grep', 'list_agents', 'list_bash', 'read_agent', 'read_bash', 'sql', 'stop_bash', 'task', 'view', 'web_fetch', 'write_bash'],
        model,
        tools: [setPRContextTool],
        onPermissionRequest: async (request) => {
          if (request.kind === 'mcp' || request.kind === 'custom-tool' || request.kind === 'read') {
            return {
              kind: 'approved',
            }
          }
          return {
            kind: 'denied-by-rules',
          }
        },
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
        consola.info(`→ tool: ${label}${args !== undefined ? ` ${JSON.stringify(args)}` : ''}`)
      })

      session.on('assistant.message', (event) => {
        // only log if the model outputs something
        if (event.data.reasoningText) {
          logAgentMessage({
            agent,
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
          prompt: context.prompt,
        }, options.timeOutMs)

        if (response?.data.content) {
          logAgentMessage({
            agent,
            model,
          }, response.data.content)
        } else {
          consola.warn('No response received')
        }
      } finally {
        await session.destroy()
      }
    } finally {
      logUsageSummary(totals)
      await client.stop()
      await stopAll(servers)
      consola.success('Review run finished')
    }
  }
}
