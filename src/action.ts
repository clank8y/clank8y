import * as core from '@actions/core'
import * as github from '@actions/github'
import process from 'node:process'
import { CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL, CLANK8Y_OIDC_AUDIENCE } from '../shared/oidc'
import { runClank8y } from 'clank8y'
import type { RepositoryContext, RunInfo } from 'clank8y'

function resolveRequiredInput(name: string): string {
  const value = core.getInput(name).trim()
  if (!value) {
    throw new Error(`GitHub Action input '${name}' is required.`)
  }

  return value
}

function resolveOptionalInput(name: string): string | undefined {
  const value = core.getInput(name).trim()
  return value || undefined
}

function requireGitHubActionRuntime(): void {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    throw new Error('clank8y action entry requires GitHub Actions runtime.')
  }

  if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    throw new Error('OIDC is required in GitHub Actions. Ensure id-token: write permission is configured.')
  }
}

function requireRepositoryContext(): RepositoryContext {
  const { owner, repo } = github.context.repo
  if (!owner || !repo) {
    throw new Error('GitHub repository context is missing. Expected github.context.repo.owner and github.context.repo.repo.')
  }

  return { owner, repo }
}

function resolveTimeoutInput(): number | undefined {
  const raw = resolveOptionalInput('timeout-ms')
  if (!raw) {
    return undefined
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Invalid timeout-ms value '${raw}'. Expected a positive integer (milliseconds).`)
  }

  return parsed
}

function requireRunInfo(repository: RepositoryContext): RunInfo {
  if (typeof github.context.runId !== 'number') {
    throw new Error('GitHub workflow run id is missing from github.context.runId.')
  }

  return {
    runner: 'github-action',
    id: github.context.runId,
    url: `https://github.com/${repository.owner}/${repository.repo}/actions/runs/${github.context.runId}`,
  }
}

function resolveCopilotToken(): string {
  const token = process.env.COPILOT_GITHUB_TOKEN?.trim()
  if (!token) {
    throw new Error('Copilot authentication token is missing. Set COPILOT_GITHUB_TOKEN.')
  }

  return token
}

function resolveTokenExchangeUrl(): string {
  // optional overwrite
  const envValue = process.env.CLANK8Y_OIDC_URL?.trim() || process.env.CLANK8Y_TOKEN_URL?.trim()
  return envValue || CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL
}

function shouldRetryOidcExchange(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.name === 'AbortError'
    || error.message.includes('fetch failed')
    || error.message.includes('ECONNRESET')
    || error.message.includes('ETIMEDOUT')
    || error.message.includes('Token exchange failed')
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function acquireClank8yBotTokenViaOIDC(repository: RepositoryContext): Promise<string> {
  const runId = process.env.GITHUB_RUN_ID
  if (!runId) {
    throw new Error('GITHUB_RUN_ID is not set. Cannot perform OIDC token exchange without run_id.')
  }

  const idToken = await core.getIDToken(CLANK8Y_OIDC_AUDIENCE)
  const response = await fetch(resolveTokenExchangeUrl(), {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${idToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      owner: repository.owner,
      repo: repository.repo,
      run_id: runId,
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Token exchange failed (${response.status} ${response.statusText}): ${details}`)
  }

  const payload = await response.json() as { token?: unknown }
  if (typeof payload.token !== 'string' || !payload.token) {
    throw new Error('Token exchange response is missing token')
  }

  return payload.token
}

async function resolveGitHubToken(repository: RepositoryContext): Promise<string> {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await acquireClank8yBotTokenViaOIDC(repository)
    } catch (error) {
      lastError = error
      if (!shouldRetryOidcExchange(error) || attempt === 3) {
        throw error
      }

      await delay(attempt === 1 ? 250 : 750)
    }
  }

  throw lastError
}

async function runClank8yEntry(): Promise<void> {
  requireGitHubActionRuntime()

  const model = resolveOptionalInput('model')
  const timeOutMs = resolveTimeoutInput()
  const repository = requireRepositoryContext()
  const githubToken = await resolveGitHubToken(repository)
  const copilotToken = resolveCopilotToken()
  core.setSecret(githubToken)
  core.setSecret(copilotToken)

  await runClank8y({
    promptContext: resolveRequiredInput('prompt'),
    auth: {
      githubToken,
      copilotToken,
    },
    runInfo: requireRunInfo(repository),
    options: {
      suppressModelListing: true,
    },
    model,
    timeOutMs,
  })
}

runClank8yEntry().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`clank8y failed to review the pull request: ${message}`)
})
