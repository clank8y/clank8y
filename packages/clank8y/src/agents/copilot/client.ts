import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CopilotClient } from '@github/copilot-sdk'
import type { PermissionHandler, PermissionRequest } from '@github/copilot-sdk'
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

// ─── IncidentFix permission handler ────────────────────────────────────────────
// Allows shell + file read/write scoped to .clank8y. Blocks destructive shell
// commands and URL access.

// Commands that are never allowed regardless of context.
// Patterns are matched against each parsed command identifier from the SDK.
const BLOCKED_SHELL_COMMANDS = new Set([
  'rm',
  'rmdir',
  'shred',
  'mkfs',
  'dd',
  'truncate',
  'curl',
  'wget',
  'ssh',
  'scp',
  'rsync',
  'nc',
  'ncat',
  'socat',
  'telnet',
  'nmap',
  'docker',
  'podman',
  'kubectl',
  'systemctl',
  'service',
  'crontab',
  'at',
  'shutdown',
  'reboot',
  'halt',
  'poweroff',
  'mount',
  'umount',
  'chown',
  'chmod',
  'chgrp',
  'su',
  'sudo',
  'passwd',
  'useradd',
  'userdel',
  'groupadd',
  'iptables',
  'nft',
  'eval',
])

// Patterns matched against the full command text to catch shell-level
// evasion attempts (pipes to network, encoded payloads, etc.)
const BLOCKED_SHELL_PATTERNS: RegExp[] = [
  // network exfiltration via /dev/tcp or /dev/udp
  /\/dev\/(?:tcp|udp)\//i,
  // base64-decode-pipe execution
  /base64\s+(?:--decode|-d)\s*\|/i,
  // explicit rm -rf / rm -r patterns (catch flags before path)
  /\brm\s+(?:-\w*[rR]\w*\s+|--recursive\s+)/,
]

// Extract individual command names from a shell command string.
// Splits on &&, ||, ;, | and takes the first token of each segment.
export function extractCommandNames(fullCommandText: string): string[] {
  return fullCommandText
    .split(/&&|\|\||[;|]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      // Strip leading env assignments like VAR=value cmd
      const withoutEnv = segment.replace(/^(?:\w+=\S*\s+)+/, '')
      // Take the first token (the command name), strip any leading path
      const firstToken = withoutEnv.split(/\s/)[0] ?? ''
      // Handle paths like /usr/bin/rm → rm
      return firstToken.split('/').pop()?.toLowerCase() ?? ''
    })
    .filter(Boolean)
}

function isBlockedShellCommand(request: PermissionRequest): string | null {
  // The SDK sends the full command chain as fullCommandText — parse it ourselves.
  // commands[].identifier mirrors fullCommandText (not individual commands), so we
  // only rely on fullCommandText for blocklist matching.
  if ('fullCommandText' in request && typeof request.fullCommandText === 'string') {
    const cmdNames = extractCommandNames(request.fullCommandText)
    for (const name of cmdNames) {
      if (BLOCKED_SHELL_COMMANDS.has(name)) {
        return `Blocked command: '${name}' is not allowed.`
      }
    }

    // Check full command text against evasion patterns
    for (const pattern of BLOCKED_SHELL_PATTERNS) {
      if (pattern.test(request.fullCommandText)) {
        return `Blocked: command matches a disallowed pattern.`
      }
    }
  }

  return null
}

export const copilotIncidentFixPermissionHandler: PermissionHandler = (request) => {
  if (request.kind === 'mcp' || request.kind === 'custom-tool') {
    return { kind: 'approved' as const }
  }

  if (request.kind === 'read') {
    const rawTargetPath = 'path' in request && typeof request.path === 'string'
      ? request.path
      : undefined
    const targetPath = resolveRequestPath(rawTargetPath)

    if (targetPath && isWithinClank8yArtifacts(targetPath)) {
      return { kind: 'approved' as const }
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
      return { kind: 'approved' as const }
    }

    return {
      kind: 'denied-by-rules' as const,
      rules: ['Native file writes are only allowed inside .clank8y.'],
    }
  }

  if (request.kind === 'shell') {
    const blockedCmd = isBlockedShellCommand(request)
    if (blockedCmd) {
      return {
        kind: 'denied-by-rules' as const,
        rules: [blockedCmd],
      }
    }

    return { kind: 'approved' as const }
  }

  if (request.kind === 'url') {
    return {
      kind: 'denied-by-rules' as const,
      rules: ['URL access is disabled.'],
    }
  }

  return {
    kind: 'denied-by-rules' as const,
    rules: ['Only MCP, file, and shell access are allowed in IncidentFix mode.'],
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
