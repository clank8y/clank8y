import { createAppAuth } from '@octokit/auth-app'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { Octokit } from 'octokit'
import process from 'node:process'
import { defineHandler, HTTPError } from 'nitro/h3'
import { CLANK8Y_OIDC_AUDIENCE } from '../../../../../shared/oidc'
import { getAppId, getAppPrivateKey } from '../../../utils/env'

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

async function verifyWorkflowOidcToken(params: {
  oidcToken: string
  owner: string
  repo: string
}): Promise<void> {
  const { payload } = await jwtVerify(params.oidcToken, GITHUB_OIDC_JWKS, {
    issuer: GITHUB_OIDC_ISSUER,
    audience: CLANK8Y_OIDC_AUDIENCE,
  })

  const repositoryClaim = payload.repository
  if (typeof repositoryClaim !== 'string') {
    throw new Error('OIDC token is missing repository claim')
  }

  const expectedRepository = `${params.owner}/${params.repo}`
  if (repositoryClaim !== expectedRepository) {
    throw new Error(`OIDC repository claim mismatch. Expected ${expectedRepository}, got ${repositoryClaim}`)
  }

  const eventNameClaim = payload.event_name
  if (eventNameClaim !== 'workflow_dispatch') {
    throw new Error(`OIDC event_name claim mismatch. Expected workflow_dispatch, got ${String(eventNameClaim)}`)
  }

  const jobWorkflowRefClaim = payload.job_workflow_ref
  if (typeof jobWorkflowRefClaim !== 'string') {
    throw new Error('OIDC token is missing job_workflow_ref claim')
  }

  const expectedWorkflowPrefix = `${expectedRepository}/${CLANK8Y_WORKFLOW_FILE}@`
  if (!jobWorkflowRefClaim.startsWith(expectedWorkflowPrefix)) {
    throw new Error(
      `OIDC job_workflow_ref claim mismatch. Expected prefix ${expectedWorkflowPrefix}, got ${jobWorkflowRefClaim}`,
    )
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
    throw HTTPError.status(401, 'Unauthorized')
  }

  const payload = await event.req.json().catch(() => null) as {
    owner?: unknown
    repo?: unknown
  } | null

  if (!payload || typeof payload.owner !== 'string' || typeof payload.repo !== 'string') {
    throw HTTPError.status(400, 'Invalid request body. Expected owner and repo.')
  }

  const owner = payload.owner.trim()
  const repo = payload.repo.trim()
  if (!owner || !repo) {
    throw HTTPError.status(400, 'Invalid request body. Expected non-empty owner and repo.')
  }

  try {
    await verifyWorkflowOidcToken({ oidcToken, owner, repo })
  } catch (error) {
    console.error('OIDC token verification failed', error)
    throw HTTPError.status(401, 'Unauthorized')
  }

  const appOctokit = createAppOctokit()

  try {
    const installation = await appOctokit.request('GET /repos/{owner}/{repo}/installation', {
      owner,
      repo,
    })

    const tokenResponse = await appOctokit.request('POST /app/installations/{installation_id}/access_tokens', {
      installation_id: installation.data.id,
      repositories: [repo],
      permissions: {
        contents: 'read',
        pull_requests: 'write',
        issues: 'write',
      },
    })

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
