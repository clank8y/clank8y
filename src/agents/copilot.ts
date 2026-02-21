/* eslint-disable no-console */
import type { PullReviewAgentFactory } from '.'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import { x } from 'tinyexec'
import { getPullRequestReviewContext } from '../setup'
import { mcpServers } from '../mcp'

function logInfo(message: string): void {
  const now = new Date().toISOString()
  console.log(`[clank8y][${now}] ${message}`)
}

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
  logInfo('Resolving GitHub Copilot CLI path...')
  let cliPath = await resolveCopilotCliPath()
  if (cliPath) {
    logInfo(`Using GitHub Copilot CLI at: ${cliPath}`)
    return cliPath
  }

  logInfo('GitHub Copilot CLI not found. Installing @github/copilot globally...')
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
  logInfo(`Prepended npm global bin to PATH: ${npmGlobalBin}`)

  cliPath = await resolveCopilotCliPath()
  if (!cliPath) {
    throw new Error('GitHub Copilot CLI is required but was not found after installation attempt.')
  }

  logInfo(`GitHub Copilot CLI installed and resolved at: ${cliPath}`)
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
  const configuredModel = 'gpt-5.3-codex'

  logInfo('Preparing GitHub Copilot review agent...')
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
  logInfo('Copilot authentication token detected in environment.')

  const githubToken = resolveCopilotGithubTokenFromEnvironment()
  logInfo('Using explicit GitHub token for Copilot SDK authentication.')

  const context = getPullRequestReviewContext()
  logInfo(`Review target: ${context.pullRequest.owner}/${context.pullRequest.repo}#${context.pullRequest.number}`)
  const client = new CopilotClient({
    cliPath,
    githubToken,
    useLoggedInUser: false,
  })

  const {
    github,
  } = mcpServers()

  return async () => {
    logInfo('Starting GitHub MCP server...')
    const githubMCPUrl = await github.start()
    logInfo(`GitHub MCP server ready at ${githubMCPUrl}`)

    try {
      logInfo('Starting Copilot client connection...')
      await client.start()
      logInfo(`Copilot client state: ${client.getState()}`)

      const authStatus = await client.getAuthStatus()
      logInfo(`Copilot auth status: type=${authStatus.authType ?? 'unknown'} authenticated=${authStatus.isAuthenticated}`)

      if (!authStatus.isAuthenticated) {
        throw new Error('Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.')
      }

      const models = await client.listModels()
      const modelIds = models.map((model) => model.id)
      logInfo(`Available Copilot models (${modelIds.length}): ${modelIds.join(', ')}`)

      if (!modelIds.includes(configuredModel)) {
        throw new Error(`Configured model '${configuredModel}' is not available for this token/account.`)
      }

      logInfo('Creating Copilot client session...')
      const session = await client.createSession({
        model: configuredModel,
        mcpServers: {
          github: {
            type: 'http',
            url: githubMCPUrl,
            tools: ['*'],
            timeout: options.tools.maxRuntimeMs,
          },
        },
      })
      logInfo(`Copilot session created: ${session.sessionId}`)

      session.on((event) => {
        logInfo(`session.event: ${event.type}`)
      })

      session.on('assistant.message', (message) => {
        logInfo(`assistant.message: ${message.data.content}`)
      })

      session.on('assistant.intent', (intent) => {
        logInfo(`assistant.intent: ${intent.data.intent}`)
      })

      session.on('assistant.reasoning', (reasoning) => {
        logInfo(`assistant.reasoning: ${reasoning.data.content}`)
      })

      session.on('assistant.turn_start', () => {
        logInfo('assistant.turn_start')
      })

      session.on('assistant.turn_end', () => {
        logInfo('assistant.turn_end')
      })

      session.on('assistant.usage', (usage) => {
        const inputTokens = usage.data.inputTokens ?? 0
        const outputTokens = usage.data.outputTokens ?? 0
        logInfo(`assistant.usage model=${usage.data.model} input=${inputTokens} output=${outputTokens}`)
      })

      session.on('tool.execution_start', (event) => {
        logInfo(`tool.execution_start: ${event.data.toolName}`)
      })

      session.on('tool.execution_progress', (event) => {
        logInfo(`tool.execution_progress: ${event.data.progressMessage}`)
      })

      session.on('tool.execution_complete', (event) => {
        if (event.data.success) {
          logInfo('tool.execution_complete: success')
          return
        }

        logInfo(`tool.execution_complete: failed ${event.data.error?.message ?? 'unknown error'}`)
      })

      session.on('session.info', (event) => {
        logInfo(`session.info: ${event.data.message}`)
      })

      session.on('session.warning', (event) => {
        logInfo(`session.warning: ${event.data.message}`)
      })

      session.on('session.error', (event) => {
        logInfo(`session.error: ${event.data.message}`)
      })

      session.on('session.model_change', (event) => {
        logInfo(`session.model_change: ${event.data.previousModel ?? 'unknown'} -> ${event.data.newModel}`)
      })

      session.on('session.idle', () => {
        logInfo('session.idle')
      })

      try {
        logInfo('Sending prompt to Copilot and waiting for completion...')
        const response = await session.sendAndWait({
          prompt: context.prompt,
        }, 300_000)

        if (response?.data.content) {
          logInfo(`Final assistant response received (${response.data.content.length} chars).`)
        } else {
          logInfo('Completed without a final assistant.message payload.')
        }
      } finally {
        logInfo('Destroying Copilot session...')
        await session.destroy()
      }
    } finally {
      logInfo('Stopping Copilot client and GitHub MCP server...')
      await client.stop()
      await github.stop()
      logInfo('Review run finished.')
    }
  }
}
