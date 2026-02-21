import type { PullReviewAgentFactory } from '.'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import { x } from 'tinyexec'
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
  let cliPath = await resolveCopilotCliPath()
  if (cliPath) {
    return cliPath
  }

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

  cliPath = await resolveCopilotCliPath()
  if (!cliPath) {
    throw new Error('GitHub Copilot CLI is required but was not found after installation attempt.')
  }

  return cliPath
}

function hasCopilotTokenInEnvironment(): boolean {
  return Boolean(
    process.env.COPILOT_GITHUB_TOKEN
    || process.env.GH_TOKEN
    || process.env.GITHUB_TOKEN,
  )
}

export const githubCopilotAgent: PullReviewAgentFactory = async (options) => {
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

  const context = getPullRequestReviewContext()
  const client = new CopilotClient({
    cliPath,
    useLoggedInUser: false,
  })

  const {
    github,
  } = mcpServers()

  return async () => {
    const githubMCPUrl = await github.start()

    try {
      const session = await client.createSession({
        model: 'gpt-5.3-codex',
        mcpServers: {
          github: {
            type: 'http',
            url: githubMCPUrl,
            tools: ['*'],
            timeout: options.tools.maxRuntimeMs,
          },
        },
      })

      try {
        await session.sendAndWait({
          prompt: context.prompt,
        }, 300_000)
      } finally {
        await session.destroy()
      }
    } finally {
      await client.stop()
      await github.stop()
    }
  }
}
