import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import type { PermissionHandler } from '@github/copilot-sdk'
import { consola } from 'consola'
import { x } from 'tinyexec'
import { getClank8yRuntimeContext } from '../../setup'

const COPILOT_CLI_PACKAGE = '@github/copilot'
const COPILOT_CLI_VERSION = '1.0.2'

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

  consola.info(`GitHub Copilot CLI ${COPILOT_CLI_VERSION} not found. Installing ${COPILOT_CLI_PACKAGE}@${COPILOT_CLI_VERSION} globally...`)
  await x('npm', ['install', '-g', `${COPILOT_CLI_PACKAGE}@${COPILOT_CLI_VERSION}`], {
    throwOnError: true,
    nodeOptions: {
      env: {
        ...process.env,
        npm_config_ignore_scripts: 'false',
      },
    },
  })

  const npmGlobalBin = await getNpmGlobalBin()
  process.env.PATH = prependPath([npmGlobalBin])
  consola.info(`Prepended npm global bin to PATH: ${npmGlobalBin}`)

  cliPath = await resolveCopilotCliPath()
  if (!cliPath) {
    throw new Error(`GitHub Copilot CLI ${COPILOT_CLI_VERSION} is required but was not found after installation attempt.`)
  }

  consola.info(`GitHub Copilot CLI installed and resolved at: ${cliPath}`)
  return cliPath
}

function resolveCopilotAgentToken(): string {
  return getClank8yRuntimeContext().auth.copilotToken
}

export const copilotPermissionHandler: PermissionHandler = (request) => {
  const scratchpadPath = path.resolve(process.cwd(), '.clank8y', 'scratchpad.txt')
  const diffPath = path.resolve(process.cwd(), '.clank8y', 'diff.txt')
  const canWrite = [scratchpadPath]
  const canRead = [...canWrite, diffPath]

  if (request.kind === 'mcp' || request.kind === 'custom-tool') {
    return {
      kind: 'approved' as const,
    }
  }

  if (request.kind === 'read') {
    const rawTargetPath = 'path' in request && typeof request.path === 'string'
      ? request.path
      : undefined
    const targetPath = rawTargetPath
      ? path.resolve(process.cwd(), rawTargetPath)
      : undefined

    if (targetPath && canRead.includes(targetPath)) {
      return {
        kind: 'approved' as const,
      }
    }

    return {
      kind: 'denied-by-rules' as const,
      rules: ['Review mode may only read .clank8y/diff.txt and .clank8y/scratchpad.txt via native file tools.'],
    }
  }

  if (request.kind === 'write') {
    const rawTargetPath = 'fileName' in request && typeof request.fileName === 'string'
      ? request.fileName
      : undefined
    const targetPath = rawTargetPath
      ? path.resolve(process.cwd(), rawTargetPath)
      : undefined

    if (targetPath && canWrite.includes(targetPath)) {
      return {
        kind: 'approved' as const,
      }
    }

    return {
      kind: 'denied-by-rules' as const,
      rules: ['Review mode may only write .clank8y/scratchpad.txt via native file tools.'],
    }
  }

  return {
    kind: 'denied-by-rules' as const,
    rules: ['Only MCP, mode selection, reading .clank8y artifacts, searching .clank8y/diff.txt via rg, and writing .clank8y/scratchpad.txt are allowed in review mode.'],
  }
}

export async function getCopilotClient(): Promise<CopilotClient> {
  consola.info('Preparing GitHub Copilot review agent')
  const cliPath = await ensureCopilotCliInstalled()
  const copilotAgentToken = resolveCopilotAgentToken()
  consola.info('Using explicit GitHub token for Copilot SDK authentication')

  const client = new CopilotClient({
    cliPath,
    githubToken: copilotAgentToken,
    useLoggedInUser: false,
  })

  await client.start()

  const authStatus = await client.getAuthStatus()
  if (!authStatus.isAuthenticated) {
    throw new Error('Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.')
  }

  return client
}

export async function getCopilotModelIds(client: CopilotClient): Promise<string[]> {
  const models = await client.listModels()
  const modelIds = models.map((model) => model.id)

  if (!getClank8yRuntimeContext().options?.suppressModelListing) {
    consola.log(`Available models:\n${modelIds.map((modelId) => `  • ${modelId}`).join('\n')}`)
  }

  return modelIds
}

export async function ensureCopilotModelAvailable(client: CopilotClient, model: string): Promise<void> {
  const modelIds = await getCopilotModelIds(client)
  if (!modelIds.includes(model)) {
    throw new Error(`Configured model '${model}' is not available for this token/account in the GitHub Copilot CLI. Available models: ${modelIds.join(', ')}.`)
  }
}
