import type { PullReviewAgentFactory } from '.'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import { x } from 'tinyexec'
import { consola } from 'consola'
import type { UsageTotals } from '../logging'
import { logAgentMessage, logUsageSummary } from '../logging'
import { getPullRequestReviewContext } from '../setup'
import { mcpServers } from '../mcp'

function prependPath(entries: string[]): string {
  const current = process.env.PATH ?? ''
  const all = [...entries, current]
  return all.filter(Boolean).join(path.delimiter)
}

async function getNpmGlobalBin(): Promise<string> {
  const result = await x('npm', ['prefix', '-g'], {
    throwOnError: true,
  })

  return path.join(result.stdout.trim(), 'bin')
}

function getCopilotExecutableName(): string {
  return process.platform === 'win32' ? 'copilot.cmd' : 'copilot'
}

async function isCopilotCliAvailable(command = 'copilot'): Promise<boolean> {
  try {
    const result = await x(command, ['--version'], {
      throwOnError: false,
    })
    return result.exitCode === 0
  } catch {
    return false
  }
}

async function resolveCopilotCliPath(): Promise<string | null> {
  const npmGlobalBin = await getNpmGlobalBin()
  const npmInstalledCliPath = path.join(npmGlobalBin, getCopilotExecutableName())

  if (existsSync(npmInstalledCliPath) && await isCopilotCliAvailable(npmInstalledCliPath)) {
    return npmInstalledCliPath
  }

  const whichResult = await x('which', ['copilot'], {
    throwOnError: false,
  })

  if (whichResult.exitCode === 0) {
    const resolvedPath = whichResult.stdout.trim()
    if (resolvedPath && await isCopilotCliAvailable(resolvedPath)) {
      return resolvedPath
    }
  }

  if (await isCopilotCliAvailable('copilot')) {
    return 'copilot'
  }

  return null
}

async function ensureCopilotCliInstalled(): Promise<string> {
  consola.info('Resolving GitHub Copilot CLI path...')
  let cliPath = await resolveCopilotCliPath()
  if (cliPath) {
    consola.info(`Using GitHub Copilot CLI at: ${cliPath}`)
    return cliPath
  }

  consola.info('GitHub Copilot CLI not found. Installing @github/copilot globally...')
  if (!await isCopilotCliAvailable()) {
    await x('npm', ['install', '-g', '@github/copilot'], {
      throwOnError: true,
      nodeOptions: {
        env: {
          ...process.env,
          npm_config_ignore_scripts: 'false',
        },
      },
    })
  }

  const npmGlobalBin = await getNpmGlobalBin()
  process.env.PATH = prependPath([npmGlobalBin])
  consola.info(`Prepended npm global bin to PATH: ${npmGlobalBin}`)

  cliPath = await resolveCopilotCliPath()
  if (!cliPath) {
    throw new Error('GitHub Copilot CLI is required but was not found after installation attempt.')
  }

  consola.info(`GitHub Copilot CLI installed and resolved at: ${cliPath}`)
  return cliPath
}

function hasCopilotTokenInEnvironment(): boolean {
  return Boolean(
    process.env.COPILOT_GITHUB_TOKEN
    || process.env.GH_TOKEN
    || process.env.GITHUB_TOKEN,
  )
}

function resolveCopilotGithubTokenFromEnvironment(): string {
  const token = process.env.COPILOT_GITHUB_TOKEN
    || process.env.GH_TOKEN
    || process.env.GITHUB_TOKEN

  if (!token) {
    throw new Error(
      'Copilot authentication token is missing. Set COPILOT_GITHUB_TOKEN (preferred), GH_TOKEN, or GITHUB_TOKEN.',
    )
  }

  return token
}

export const githubCopilotAgent: PullReviewAgentFactory = async (options) => {
  const agent = 'github-copilot'
  const model = options.model ?? 'claude-haiku-4.5'

  consola.info('Preparing GitHub Copilot review agent')
  const cliPath = await ensureCopilotCliInstalled()

  if (!hasCopilotTokenInEnvironment()) {
    throw new Error(
      [
        'Copilot authentication token is missing.',
        'Set one of COPILOT_GITHUB_TOKEN, GH_TOKEN, or GITHUB_TOKEN in the workflow environment,',
        'before starting clank8y.',
      ].join(' '),
    )
  }
  consola.info('Copilot authentication token detected in environment')

  const githubToken = resolveCopilotGithubTokenFromEnvironment()
  consola.info('Using explicit GitHub token for Copilot SDK authentication')

  const context = await getPullRequestReviewContext()
  logAgentMessage({
    agent,
    model,
  }, [
    `repository: ${context.pullRequest.owner}/${context.pullRequest.repo}`,
    `pullrequest #: ${context.pullRequest.number}`,
    `branch: ${context.pullRequest.headRef}`,
  ])

  const client = new CopilotClient({
    cliPath,
    githubToken,
    useLoggedInUser: false,

  })

  const {
    github,
  } = mcpServers()

  return async () => {
    const thoughtStarts = new Map<string, number>()
    const totals: UsageTotals = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 0,
    }
    const { url: githubMCPUrl } = await github.start()

    try {
      await client.start()

      const authStatus = await client.getAuthStatus()

      if (!authStatus.isAuthenticated) {
        throw new Error('Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.')
      }

      const models = await client.listModels()
      const modelIds = models.map((model) => model.id)

      if (!modelIds.includes(model)) {
        throw new Error(`Configured model '${model}' is not available for this token/account.`)
      }

      const session = await client.createSession({
        disabledSkills: ['bash', 'create', 'edit', 'github-say-hello', 'glob', 'grep', 'list_agents', 'list_bash', 'read_agent', 'read_bash'/* , 'report_intent' */, 'sql', 'stop_bash'/* , 'task' */, 'view', 'web_fetch', 'write_bash'],
        model,
        mcpServers: {
          github: {
            type: 'http',
            url: githubMCPUrl,
            tools: ['*'],
            timeout: options.tools.maxRuntimeMs,
          },
        },
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

      session.on('assistant.usage', (usage) => {
        totals.inputTokens += usage.data.inputTokens ?? 0
        totals.outputTokens += usage.data.outputTokens ?? 0
        totals.cacheReadTokens += usage.data.cacheReadTokens ?? 0
        totals.cacheWriteTokens += usage.data.cacheWriteTokens ?? 0
        totals.cost += usage.data.cost ?? 0
      })

      session.on('tool.execution_start', (event) => {
        consola.info(`tool: ${event.data.mcpToolName ?? event.data.toolName}`)
      })

      try {
        consola.info('Clank8y getting to work...')
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
      await github.stop()
      consola.success('Review run finished')
    }
  }
}
