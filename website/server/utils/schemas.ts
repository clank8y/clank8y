import * as v from 'valibot'

const runIdSchema = v.pipe(
  v.union([v.string(), v.number()], 'run_id is required and must be a string or number'),
  v.transform((input) => String(input)),
  v.trim(),
  v.nonEmpty('run_id must not be empty'),
)

/**
 * Request body schema for the token exchange endpoint.
 * Validates owner, repo, and run_id from the incoming POST body.
 */
export const TokenRequestSchema = v.pipe(
  v.object({
    owner: v.pipe(v.string(), v.trim(), v.nonEmpty('owner must not be empty')),
    repo: v.pipe(v.string(), v.trim(), v.nonEmpty('repo must not be empty')),
    run_id: runIdSchema,
  }),
)

export type TokenRequest = v.InferOutput<typeof TokenRequestSchema>

/**
 * OIDC JWT payload claims verified in Phase 1 (basic claims).
 * These do NOT depend on any GitHub API data.
 */
export const OidcBasicClaimsSchema = v.object({
  repository: v.string('OIDC token is missing repository claim'),
  repository_owner: v.string('OIDC token is missing repository_owner claim'),
  event_name: v.string('OIDC token is missing event_name claim'),
  runner_environment: v.string('OIDC token is missing runner_environment claim'),
})

export type OidcBasicClaims = v.InferOutput<typeof OidcBasicClaimsSchema>

/**
 * OIDC JWT payload claims verified in Phase 2 (ref-pinning claims).
 * These require the repository's default branch from the GitHub API.
 */
export const OidcRefClaimsSchema = v.object({
  ref: v.string('OIDC token is missing ref claim'),
  job_workflow_ref: v.string('OIDC token is missing job_workflow_ref claim'),
  run_id: runIdSchema,
})

export type OidcRefClaims = v.InferOutput<typeof OidcRefClaimsSchema>
