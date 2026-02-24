import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from 'octokit'
import process from 'node:process'
import { CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL, CLANK8Y_OIDC_AUDIENCE } from '../../shared/oidc'

const OIDC_RETRY_ATTEMPTS = 3
const OIDC_RETRY_DELAYS_MS = [250, 750]

function resolveTokenExchangeUrl(): string {
  const envValue = (process.env.CLANK8Y_TOKEN_URL ?? '').trim()
  return envValue || CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL
}

function isOIDCAvailable(): boolean {
  // OIDC requires both env vars to be set (only in real GitHub Actions with id-token permission)
  return !!(
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL
    && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
  )
}

async function acquireClank8yBotTokenViaOIDC(): Promise<string> {
  const tokenExchangeUrl = resolveTokenExchangeUrl()

  const idToken = await core.getIDToken(CLANK8Y_OIDC_AUDIENCE)
  const response = await fetch(tokenExchangeUrl, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${idToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id: process.env.GITHUB_RUN_ID ?? null,
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Token exchange failed (${response.status} ${response.statusText}): ${details}`)
  }

  const payload = await response.json() as { token?: unknown }
  if (!payload || typeof payload.token !== 'string' || !payload.token) {
    throw new Error('Token exchange response is missing token')
  }

  return payload.token
}

function acquireClank8yBotTokenViaLocalFallback(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (token) {
    return token
  }

  throw new Error('GitHub API token is missing. OIDC is unavailable and neither GH_TOKEN nor GITHUB_TOKEN is set.')
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

async function acquireClank8yBotToken(): Promise<string> {
  if (!isOIDCAvailable()) {
    return acquireClank8yBotTokenViaLocalFallback()
  }

  let lastError: unknown = null

  for (let attempt = 1; attempt <= OIDC_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await acquireClank8yBotTokenViaOIDC()
    } catch (error) {
      lastError = error
      if (!shouldRetryOidcExchange(error) || attempt === OIDC_RETRY_ATTEMPTS) {
        throw error
      }

      await delay(OIDC_RETRY_DELAYS_MS[attempt - 1] ?? 1000)
    }
  }

  throw lastError
}

let _clank8yBotTokenPromise: Promise<string> | null = null
let _octokit: Octokit | null = null

async function getClank8yBotToken(): Promise<string> {
  if (_clank8yBotTokenPromise) {
    return _clank8yBotTokenPromise
  }

  _clank8yBotTokenPromise = acquireClank8yBotToken()

  return await _clank8yBotTokenPromise
}

export async function clank8yOctokit(): Promise<Octokit> {
  if (_octokit) {
    return _octokit
  }

  const clank8yBotToken = await getClank8yBotToken()
  core.setSecret(clank8yBotToken)

  _octokit = new Octokit({
    auth: clank8yBotToken,
  })

  return _octokit
}
