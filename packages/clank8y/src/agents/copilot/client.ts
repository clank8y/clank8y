import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import type { PermissionHandler } from '@github/copilot-sdk'
import { consola } from 'consola'
import { x } from 'tinyexec'
import { getClank8yRuntimeContext } from '../../setup'
import { isWithinClank8yArtifacts } from '../../utils/artifacts'

const COPILOT_CLI_PACKAGE = '@github/copilot'
const COPILOT_CLI_VERSION = '1.0.2'

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

function resolveRequestPath(rawPath: string | undefined): string | undefined {
  return rawPath
    ? path.resolve(process.cwd(), rawPath)
    : undefined
}

export const copilotPermissionHandler: PermissionHandler = (request) => {
  if (request.kind === 'mcp' || request.kind === 'custom-tool') {
    return {
      kind: 'approved' as const,
    }
  }

  if (request.kind === 'read') {
    const rawTargetPath = 'path' in request && typeof request.path === 'string'
      ? request.path
      : undefined
    const targetPath = resolveRequestPath(rawTargetPath)

    if (targetPath && isWithinClank8yArtifacts(targetPath)) {
      return {
        kind: 'approved' as const,
      }
    }

    return {
      kind: 'denied-by-rules' as const,
      rules: ['Native file reads are only allowed inside .clank8y.'],
    }
  }

  if (request.kind === 'write') {
    const rawTargetPath = 'fileName' in request && typeof request.fileName === 'string'
      ? request.fileName
      : undefined
    const targetPath = resolveRequestPath(rawTargetPath)

    if (targetPath && isWithinClank8yArtifacts(targetPath)) {
      return {
        kind: 'approved' as const,
      }
    }

    return {
      kind: 'denied-by-rules' as const,
      rules: ['Native file writes are only allowed inside .clank8y.'],
    }
  }

  if (request.kind === 'shell') {
    return {
      kind: 'denied-by-rules' as const,
      rules: ['Shell is currently disabled. When enabled for a mode later, commands must stay scoped to .clank8y.'],
    }
  }

  if (request.kind === 'url') {
    return {
      kind: 'denied-by-rules' as const,
      rules: ['URL access is disabled.'],
    }
  }

  return {
    kind: 'denied-by-rules' as const,
    rules: ['Only MCP, mode selection, and native file access inside .clank8y are allowed.'],
  }
}

let _client: CopilotClient | null = null

export async function getCopilotClient(): Promise<CopilotClient> {
  if (_client) {
    return _client
  }
  consola.info('Preparing GitHub Copilot agent')
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

  _client = client

  return client
}

export async function getCopilotModelIds(): Promise<string[]> {
  const client = await getCopilotClient()
  const models = await client.listModels()
  const modelIds = models.map((model) => model.id)

  if (!getClank8yRuntimeContext().options?.suppressModelListing) {
    consola.log(`Available models:\n${modelIds.map((modelId) => `  • ${modelId}`).join('\n')}`)
  }

  return modelIds
}

export async function ensureCopilotModelAvailable(model: string): Promise<void> {
  const modelIds = await getCopilotModelIds()
  if (!modelIds.includes(model)) {
    throw new Error(`Configured model '${model}' is not available for this token/account in the GitHub Copilot CLI. Available models: ${modelIds.join(', ')}.`)
  }
}
