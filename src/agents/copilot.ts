import type { PullReviewAgentFactory } from '.'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import { x } from 'tinyexec'
import { getPullRequestReviewContext } from '../setup'
import { mcpServers } from '../mcp'

async function ensureCopilotCliInstalled(): Promise<void> {
  const versionResult = await x('copilot', ['--version'])
  if (versionResult.exitCode === 0) {
    return
  }

  await x('npm', ['install', '-g', '@github/copilot'], {
    throwOnError: true,
    nodeOptions: {
      env: {
        ...process.env,
        npm_config_ignore_scripts: 'false',
      },
    },
  })

  const verifyResult = await x('copilot', ['--version'])
  if (verifyResult.exitCode !== 0) {
    throw new Error('GitHub Copilot CLI is not installed. Install via: npm install -g @github/copilot')
  }
}

export const githubCopilotAgent: PullReviewAgentFactory = async (options) => {
  await ensureCopilotCliInstalled()

  const context = getPullRequestReviewContext()
  const client = new CopilotClient({
    githubToken: context.copilotToken,
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
