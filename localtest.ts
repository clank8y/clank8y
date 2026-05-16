import 'dotenv/config'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { runClank8y } from 'clank8y'
import type { PiModelString } from 'clank8y'

const IN_SANDBOX_ENV = 'CLANK8Y_LOCALTEST_IN_SANDBOX'
const DEFAULT_SANDBOX_BRANCH = 'test/clank8y-localtest'

/**
 * Local test runner setup (dotenv-based, Sandcastle Docker sandbox by default)
 *
 * Required env vars:
 * - GITHUB_REPOSITORY
 *   - Format: owner/repo
 *   - Why: runtime uses GitHub context to resolve repository for PR APIs.
 *
 * - PROMPT
 *   - Why: event-level instruction block appended to clank8y base prompt.
 *
 * - CLANK8Y_MODEL or MODEL
 *   - Why: Pi model string in provider:model-id format, e.g. anthropic:claude-sonnet-4-20250514.
 *
 * - Provider API key for the selected model
 *   - Examples: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY.
 *
 * - GH_TOKEN or GITHUB_TOKEN
 *   - Why: local/dev fallback token for GitHub API operations.
 *   - Fine-grained PAT permissions:
 *     - Repository: Contents (read/write for Task)
 *     - Repository: Pull requests (write)
 *     - Repository: Issues (write)
 *
 * Optional env vars:
 * - TIMEOUT_MS
 *   - Maximum time in milliseconds for the clank8y run. Defaults to clank8y's runtime default.
 *
 * - LOCALTEST_BRANCH
 *   - Sandcastle worktree branch. Defaults to test/clank8y-localtest.
 *
 * - CLANK8Y_LOCALTEST_REBUILD_IMAGE=true
 *   - Force rebuilding the local Docker image used by Sandcastle.
 */

function setupActionLikeEnvironment(): void {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required for local test (format: owner/repo)')
  }
}

function repositoryFromEnvironment() {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required for local test (format: owner/repo)')
  }

  const segments = repository.split('/')
  const [owner, repo] = segments
  if (segments.length !== 2 || !owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY value '${repository}'. Expected format: owner/repo.`)
  }

  return { owner, repo }
}

function buildPromptContext(promptContext: string): string {
  const repository = repositoryFromEnvironment()

  return [
    promptContext,
    '',
    '---',
    '',
    'LOCAL EXECUTION CONTEXT:',
    `repository: ${repository.owner}/${repository.repo}`,
    'execution_environment: localtest',
    process.env[IN_SANDBOX_ENV] === 'true' ? 'sandbox: sandcastle-docker' : null,
  ].filter((line): line is string => line !== null).join('\n')
}

function resolveTimeoutInput(): number | undefined {
  const raw = process.env.TIMEOUT_MS?.trim()
  if (!raw) {
    return undefined
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Invalid TIMEOUT_MS value '${raw}'. Expected a positive integer (milliseconds).`)
  }

  return parsed
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required for local test.`)
  }

  return value
}

function resolveGithubToken(): string {
  const token = process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim()
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required for local test.')
  }

  return token
}

function resolveModel(): PiModelString {
  const model = process.env.CLANK8Y_MODEL?.trim() || process.env.MODEL?.trim()
  if (!model) {
    throw new Error('CLANK8Y_MODEL or MODEL is required for local test.')
  }

  return model as PiModelString
}

async function runClank8yLocalTest(): Promise<void> {
  setupActionLikeEnvironment()

  await runClank8y({
    promptContext: buildPromptContext(requireEnv('PROMPT')),
    auth: {
      githubToken: resolveGithubToken(),
    },
    model: resolveModel(),
    timeOutMs: resolveTimeoutInput(),
  })
}

function sandboxBranch(): string {
  return process.env.LOCALTEST_BRANCH?.trim() || DEFAULT_SANDBOX_BRANCH
}

function sandboxImageName(): string {
  const uid = process.getuid?.() ?? 1000
  const gid = process.getgid?.() ?? 1000
  return `clank8y-localtest:node24-${uid}-${gid}`
}

function dockerfileForCurrentUser(): string {
  return `FROM node:24-bookworm
ARG AGENT_UID=1000
ARG AGENT_GID=1000
ENV PNPM_HOME=/home/agent/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apt-get update \\
  && apt-get install -y --no-install-recommends git ca-certificates openssh-client \\
  && rm -rf /var/lib/apt/lists/*
RUN set -eux; \\
  group_name="$(getent group "\${AGENT_GID}" | cut -d: -f1 || true)"; \\
  if [ -z "$group_name" ]; then groupadd --gid "\${AGENT_GID}" agent; group_name=agent; fi; \\
  if getent passwd "\${AGENT_UID}" >/dev/null; then \\
    user_name="$(getent passwd "\${AGENT_UID}" | cut -d: -f1)"; \\
    usermod --home /home/agent --move-home --gid "\${AGENT_GID}" --shell /bin/bash "$user_name"; \\
  else \\
    useradd --uid "\${AGENT_UID}" --gid "\${AGENT_GID}" --create-home --home-dir /home/agent --shell /bin/bash agent; \\
  fi; \\
  mkdir -p /home/agent/.local/share/pnpm; \\
  chown -R "\${AGENT_UID}:\${AGENT_GID}" /home/agent
RUN npm install -g pnpm@10.30.3
USER \${AGENT_UID}:\${AGENT_GID}
WORKDIR /home/agent/workspace
`
}

function runHostCommand(command: string, args: string[], stdin?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: stdin === undefined ? 'inherit' : ['pipe', 'inherit', 'inherit'],
    })

    if (stdin !== undefined) {
      child.stdin.end(stdin)
    }

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })
}

async function dockerImageExists(imageName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('docker', ['image', 'inspect', imageName], { stdio: 'ignore' })
    child.on('error', () => resolve(false))
    child.on('close', (code) => resolve(code === 0))
  })
}

async function ensureSandboxImage(imageName: string): Promise<void> {
  const forceRebuild = process.env.CLANK8Y_LOCALTEST_REBUILD_IMAGE === 'true'
  if (!forceRebuild && await dockerImageExists(imageName)) {
    return
  }

  const uid = String(process.getuid?.() ?? 1000)
  const gid = String(process.getgid?.() ?? 1000)
  console.info(`Building Sandcastle Docker image '${imageName}' for uid=${uid} gid=${gid}...`)
  await runHostCommand('docker', [
    'build',
    '--build-arg',
    `AGENT_UID=${uid}`,
    '--build-arg',
    `AGENT_GID=${gid}`,
    '-t',
    imageName,
    '-f',
    '-',
    '.',
  ], dockerfileForCurrentUser())
}

function environmentForSandbox(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string') {
      env[key] = value
    }
  }
  env[IN_SANDBOX_ENV] = 'true'
  return env
}

function createClank8yCommandAgent(command: string) {
  return {
    name: 'clank8y-localtest',
    env: {},
    captureSessions: false,
    buildPrintCommand: () => ({
      command,
    }),
    parseStreamLine: (line: string) => [
      {
        type: 'text' as const,
        text: `${line}\n`,
      },
    ],
  }
}

function sandcastleIdleTimeoutSeconds(): number {
  const timeoutMs = resolveTimeoutInput()
  if (!timeoutMs) {
    return 1_500
  }

  return Math.max(600, Math.ceil(timeoutMs / 1000) + 120)
}

async function runInSandcastleDocker(): Promise<void> {
  setupActionLikeEnvironment()
  resolveGithubToken()
  resolveModel()
  requireEnv('PROMPT')

  const [{ run }, { docker }] = await Promise.all([
    import('@ai-hero/sandcastle'),
    import('@ai-hero/sandcastle/sandboxes/docker'),
  ])

  const imageName = sandboxImageName()
  await ensureSandboxImage(imageName)

  const result = await run({
    name: 'clank8y-localtest',
    agent: createClank8yCommandAgent(`${IN_SANDBOX_ENV}=true pnpm dlx jiti ./localtest.ts`),
    sandbox: docker({
      imageName,
      env: environmentForSandbox(),
    }),
    branchStrategy: {
      type: 'branch',
      branch: sandboxBranch(),
    },
    hooks: {
      sandbox: {
        onSandboxReady: [
          { command: 'pnpm install --frozen-lockfile' },
          { command: 'pnpm --filter clank8y build' },
        ],
      },
    },
    prompt: 'Run clank8y localtest inside this Sandcastle Docker sandbox.',
    maxIterations: 1,
    idleTimeoutSeconds: sandcastleIdleTimeoutSeconds(),
    logging: { type: 'stdout' },
  })

  console.info(`Sandcastle localtest completed on branch '${result.branch}'.`)
}

async function main(): Promise<void> {
  if (process.env[IN_SANDBOX_ENV] === 'true') {
    await runClank8yLocalTest()
  } else {
    await runInSandcastleDocker()
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`localtest failed: ${message}`)
  process.exit(1)
})
