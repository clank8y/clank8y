import { createAppAuth } from '@octokit/auth-app'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { Octokit } from 'octokit'
import process from 'node:process'
import * as v from 'valibot'
import { defineHandler, HTTPError } from 'nitro/h3'
import { CLANK8Y_OIDC_AUDIENCE } from '../../../../../shared/oidc'
import { getAppId, getAppPrivateKey } from '../../../utils/env'
import { OidcBasicClaimsSchema, OidcRefClaimsSchema, TokenRequestSchema } from '../../../utils/schemas'

const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com'
const GITHUB_OIDC_JWKS = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'))
const CLANK8Y_WORKFLOW_FILE = '.github/workflows/clank8y.yml'

function createAppOctokit(): Octokit {
  const appId = getAppId()
  const privateKey = getAppPrivateKey()

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  })
}

function createInstallationOctokit(installationId: number): Octokit {
  const appId = getAppId()
  const privateKey = getAppPrivateKey()

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  })
}

function getBearerToken(header: string | null): string | null {
  if (!header) {
    return null
  }

  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match) {
    return null
  }

  return match[1]?.trim() ?? null
}

/**
 * Phase 1: Verify OIDC signature and claims that do NOT require an API call.
 * This runs before any GitHub API requests to avoid burning app rate limits on
 * unauthenticated or malicious callers.
 *
 * Returns the verified JWT payload for use in phase 2.
 * @param params - OIDC token and expected repository identity
 * @param params.oidcToken - raw Bearer token from the request
 * @param params.owner - expected repository owner
 * @param params.repo - expected repository name
 */
async function verifyOidcTokenBasicClaims(params: {
  oidcToken: string
  owner: string
  repo: string
}): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(params.oidcToken, GITHUB_OIDC_JWKS, {
    issuer: GITHUB_OIDC_ISSUER,
    audience: CLANK8Y_OIDC_AUDIENCE,
  })

  const claims = v.parse(OidcBasicClaimsSchema, payload)

  const expectedRepository = `${params.owner}/${params.repo}`
  if (claims.repository !== expectedRepository) {
    throw new Error(`OIDC repository claim mismatch. Expected ${expectedRepository}, got ${claims.repository}`)
  }

  if (claims.repository_owner !== params.owner) {
    throw new Error(`OIDC repository_owner claim mismatch. Expected ${params.owner}, got ${claims.repository_owner}`)
  }

  if (claims.event_name !== 'workflow_dispatch') {
    throw new Error(`OIDC event_name claim mismatch. Expected workflow_dispatch, got ${claims.event_name}`)
  }

  if (claims.runner_environment !== 'github-hosted') {
    throw new Error(`OIDC runner_environment claim mismatch. Expected github-hosted, got ${claims.runner_environment}`)
  }

  return payload as Record<string, unknown>
}

/**
 * Phase 2: Verify ref-pinning and run-binding claims that depend on data
 * fetched from the GitHub API (defaultBranch). Only called after phase 1
 * has already authenticated the caller.
 * @param params - verified payload and ref-binding context
 * @param params.payload - JWT payload from phase 1
 * @param params.owner - repository owner
 * @param params.repo - repository name
 * @param params.defaultBranch - canonical default branch from the GitHub API
 * @param params.runId - workflow run ID from the request body
 */
function verifyOidcTokenRefClaims(params: {
  payload: Record<string, unknown>
  owner: string
  repo: string
  defaultBranch: string
  runId: string
}): void {
  const claims = v.parse(OidcRefClaimsSchema, params.payload)

  const expectedRepository = `${params.owner}/${params.repo}`
  const trustedRef = `refs/heads/${params.defaultBranch}`

  if (claims.ref !== trustedRef) {
    throw new Error(`OIDC ref claim mismatch. Expected ${trustedRef}, got ${claims.ref}`)
  }

  const expectedWorkflowRef = `${expectedRepository}/${CLANK8Y_WORKFLOW_FILE}@${trustedRef}`
  if (claims.job_workflow_ref !== expectedWorkflowRef) {
    throw new Error(
      `OIDC job_workflow_ref claim mismatch. Expected ${expectedWorkflowRef}, got ${claims.job_workflow_ref}`,
    )
  }

  if (String(claims.run_id) !== params.runId) {
    throw new Error(`OIDC run_id claim mismatch. Expected ${params.runId}, got ${String(claims.run_id)}`)
  }
}

export default defineHandler(async (event) => {
  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
    console.error('GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY is not set. Cannot mint installation token.')
    throw HTTPError.status(500, 'Internal server error')
  }

  const authorization = event.req.headers.get('authorization')
  const oidcToken = getBearerToken(authorization)
  if (!oidcToken) {
    console.error('Missing or invalid Authorization header')
    throw HTTPError.status(401, 'Unauthorized')
  }

  const rawPayload = await event.req.json().catch(() => null)
  const result = v.safeParse(TokenRequestSchema, rawPayload)
  if (!result.success) {
    throw HTTPError.status(400, `Invalid request body: ${v.summarize(result.issues)}`)
  }

  const { owner, repo, run_id: runId } = result.output

  // Phase 1: verify OIDC signature + basic claims BEFORE any GitHub API calls.
  // This prevents unauthenticated callers from burning app rate limits.
  let oidcPayload: Record<string, unknown>
  try {
    oidcPayload = await verifyOidcTokenBasicClaims({ oidcToken, owner, repo })
  } catch (error) {
    console.error('OIDC token verification failed (basic claims)', error)
    throw HTTPError.status(401, 'Unauthorized')
  }

  // Only now, with a verified caller, do we make API calls.
  // App-level JWT is only valid for app-management endpoints (get installation).
  // All repository operations require an installation token — createInstallationOctokit
  // handles that automatically once we have the installation ID.
  const appOctokit = createAppOctokit()

  let installationId: number
  try {
    const installation = await appOctokit.request('GET /repos/{owner}/{repo}/installation', {
      owner,
      repo,
    })
    installationId = installation.data.id
  } catch (error) {
    console.error('Failed to find app installation for repository', error)
    throw HTTPError.status(500, 'Failed to find app installation for repository')
  }

  // All subsequent requests use the installation-scoped Octokit, which activates
  // the app's installed permissions (Contents: read, Pull requests: write, etc.).
  const installationOctokit = createInstallationOctokit(installationId)

  let defaultBranch: string | undefined
  try {
    const { data: repository } = await installationOctokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    })
    if (repository.default_branch) {
      defaultBranch = repository.default_branch
    }
  } catch (error) {
    console.error('Failed to fetch repository metadata', error)
    throw HTTPError.status(500, 'Failed to resolve repository default branch')
  }

  if (!defaultBranch) {
    console.error('Repository has no default branch configured')
    throw HTTPError.status(500, 'Failed to resolve repository default branch')
  }

  // Phase 2: verify ref-pinning and run-binding claims that need defaultBranch.
  try {
    verifyOidcTokenRefClaims({ payload: oidcPayload, owner, repo, defaultBranch, runId })
  } catch (error) {
    console.error('OIDC token verification failed (ref claims)', error)
    throw HTTPError.status(401, 'Unauthorized')
  }

  try {
    const tokenResponse = await installationOctokit.request(
      'POST /app/installations/{installation_id}/access_tokens',
      {
        installation_id: installationId,
        repositories: [repo],
        permissions: {
          contents: 'read',
          pull_requests: 'write',
          issues: 'write',
        },
      },
    )

    console.log('Minted installation token successfully')

    return {
      token: tokenResponse.data.token,
      expires_at: tokenResponse.data.expires_at,
    }
  } catch (error) {
    console.error('Failed to mint installation token', error)
    throw HTTPError.status(500, 'Failed to mint installation token')
  }
})
