import 'dotenv/config'
import process from 'node:process'
import { runClank8y } from 'clank8y'

/**
 * Local test runner setup (dotenv-based)
 *
 * Required env vars:
 * - GITHUB_REPOSITORY
 *   - Format: owner/repo
 *   - Why: runtime uses GitHub context to resolve repository for PR APIs and token exchange payload.
 *
 * - PROMPT
 *   - Why: event-level instruction block appended to clank8y base prompt.
 *
 * - PI_AGENT_TOKEN
 *   - Why: Pi/model provider authentication for running the agent.
 *
 * - TIMEOUT_MS
 *   - Why: maximum time in milliseconds for the entire PR review process. Optional — defaults to 1200000 (20 minutes).
 *
 * - GH_TOKEN or GITHUB_TOKEN
 *   - Why: local/dev fallback token for Clank8yBotToken (Octokit PR API operations) when OIDC runtime is unavailable.
 *   - Fine-grained PAT permissions:
 *     - Repository: Contents (read)
 *     - Repository: Pull requests (write)
 *     - Repository: Issues (write)
 *
 * > Roles are separate even if token values are identical:
 * > `PI_AGENT_TOKEN` is model auth; `GH_TOKEN`/`GITHUB_TOKEN` is GitHub API auth.
 * >
 * > Local identity note:
 * > - In local test mode, when using `GH_TOKEN`/`GITHUB_TOKEN` fallback,
 * >   the responding GitHub account is the owner of that token (typically your own account).
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
  ].join('\n')
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

async function main(): Promise<void> {
  setupActionLikeEnvironment()

  const timeOutMs = resolveTimeoutInput()
  await runClank8y({
    promptContext: buildPromptContext(requireEnv('PROMPT')),
    auth: {
      githubToken: resolveGithubToken(),
      agentToken: requireEnv('PI_AGENT_TOKEN'),
    },
    timeOutMs,
  })
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`localtest failed: ${message}`)
  process.exit(1)
})
