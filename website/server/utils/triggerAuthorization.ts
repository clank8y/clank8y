import * as v from 'valibot'
import { buildUnauthorizedTriggerBody } from './github'
import type { Octokit } from 'octokit'

const CLANK8Y_CONFIG_PATH = 'clank8y.json'

type RequiredRepositoryPermission = 'write' | 'maintain' | 'admin'

type TriggerAuthorizationResult = { authorized: true } | { authorized: false, reason: string }

interface TriggerAuthorizationConfig {
  allowedTriggerPermission: RequiredRepositoryPermission
  allowedClank8yTriggerers: string[]
}

const DEFAULT_TRIGGER_AUTHORIZATION_CONFIG: TriggerAuthorizationConfig = {
  allowedTriggerPermission: 'write',
  allowedClank8yTriggerers: [],
}

const TriggerAuthorizationConfigSchema = v.object({
  allowedTriggerPermission: v.optional(v.picklist(['write', 'maintain', 'admin'])),
  allowedClank8yTriggerers: v.optional(v.array(v.string())),
})

function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') {
    return error.status
  }

  return null
}

function hasRequiredRepositoryPermission(actual: string, required: RequiredRepositoryPermission): boolean {
  if (required === 'admin') {
    return actual === 'admin'
  }

  if (required === 'maintain') {
    return actual === 'maintain' || actual === 'admin'
  }

  return actual === 'write' || actual === 'maintain' || actual === 'admin'
}

function decodeBase64Content(content: string): string {
  const binary = atob(content.replaceAll('\n', ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function readTriggerAuthorizationConfig(params: {
  owner: string
  repo: string
  defaultBranch: string
  octokit: Octokit
}): Promise<TriggerAuthorizationConfig | { error: string }> {
  let configContent: string | null = null
  try {
    const { data } = await params.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: params.owner,
      repo: params.repo,
      path: CLANK8Y_CONFIG_PATH,
      ref: params.defaultBranch,
    })

    if (Array.isArray(data) || data.type !== 'file' || !('content' in data) || typeof data.content !== 'string') {
      return { error: `expected a JSON file at repository root path \`${CLANK8Y_CONFIG_PATH}\`.` }
    }

    try {
      configContent = decodeBase64Content(data.content)
    } catch (error) {
      return { error: `could not decode file content: ${error instanceof Error ? error.message : String(error)}` }
    }
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      return DEFAULT_TRIGGER_AUTHORIZATION_CONFIG
    }

    return { error: `could not read \`${CLANK8Y_CONFIG_PATH}\`: ${error instanceof Error ? error.message : String(error)}` }
  }

  let rawConfig: unknown
  try {
    rawConfig = JSON.parse(configContent)
  } catch (error) {
    return { error: `invalid JSON: ${error instanceof Error ? error.message : String(error)}` }
  }

  const result = v.safeParse(TriggerAuthorizationConfigSchema, rawConfig)
  if (!result.success) {
    return { error: v.summarize(result.issues) }
  }

  const allowedClank8yTriggerers = result.output.allowedClank8yTriggerers ?? DEFAULT_TRIGGER_AUTHORIZATION_CONFIG.allowedClank8yTriggerers
  for (const entry of allowedClank8yTriggerers) {
    const trigger = allowedClank8yTriggererFromConfigEntry(entry)
    if ('error' in trigger) {
      return { error: trigger.error }
    }
  }

  return {
    allowedTriggerPermission: result.output.allowedTriggerPermission ?? DEFAULT_TRIGGER_AUTHORIZATION_CONFIG.allowedTriggerPermission,
    allowedClank8yTriggerers,
  }
}

async function fetchActorRepositoryPermission(params: {
  owner: string
  repo: string
  actor: string
  octokit: Octokit
}): Promise<{ permission: string } | { error: string }> {
  try {
    const { data } = await params.octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
      owner: params.owner,
      repo: params.repo,
      username: params.actor,
    })

    return { permission: data.permission }
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      return { permission: 'none' }
    }

    return { error: `could not verify @${params.actor}'s repository permission: ${error instanceof Error ? error.message : String(error)}` }
  }
}

function allowedClank8yTriggererFromConfigEntry(entry: string):
  | { kind: 'user', login: string }
  | { kind: 'team', org: string, teamSlug: string }
  | { error: string } {
  const parts = entry.split('/')
  if (parts.length === 1 && parts[0]) {
    return { kind: 'user', login: parts[0] }
  }

  if (parts.length === 2 && parts[0] && parts[1]) {
    return { kind: 'team', org: parts[0], teamSlug: parts[1] }
  }

  return { error: `allowed trigger entry \`${entry}\` must be either \`<userName>\` or \`<orgName>/<teamSlug>\`.` }
}

async function isActorInTeam(params: {
  actor: string
  org: string
  teamSlug: string
  octokit: Octokit
}): Promise<'member' | 'not_member' | 'unknown'> {
  try {
    const { data } = await params.octokit.request('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
      org: params.org,
      team_slug: params.teamSlug,
      username: params.actor,
    })

    return data.state === 'active' ? 'member' : 'not_member'
  } catch (error) {
    const status = getErrorStatus(error)
    if (status === 404) {
      return 'not_member'
    }

    if (status === 403) {
      return 'unknown'
    }

    return 'unknown'
  }
}

async function isExplicitlyAllowed(params: {
  owner: string
  actor: string
  allowedClank8yTriggerers: string[]
  octokit: Octokit
}): Promise<TriggerAuthorizationResult> {
  let teamMembershipUnknown = false
  let hasTeamFromDifferentOrg = false

  for (const entry of params.allowedClank8yTriggerers) {
    const trigger = allowedClank8yTriggererFromConfigEntry(entry)
    if ('error' in trigger) {
      return { authorized: false, reason: `This repository's \`${CLANK8Y_CONFIG_PATH}\` is invalid: ${trigger.error}` }
    }

    if (trigger.kind === 'user') {
      if (trigger.login === params.actor) {
        return { authorized: true }
      }

      continue
    }

    if (trigger.org !== params.owner) {
      hasTeamFromDifferentOrg = true
      continue
    }

    const membership = await isActorInTeam({
      actor: params.actor,
      org: trigger.org,
      teamSlug: trigger.teamSlug,
      octokit: params.octokit,
    })
    if (membership === 'member') {
      return { authorized: true }
    }

    if (membership === 'unknown') {
      teamMembershipUnknown = true
    }
  }

  return {
    authorized: false,
    reason: hasTeamFromDifferentOrg
      ? `This repository's \`${CLANK8Y_CONFIG_PATH}\` includes a team from a different organization. Team entries must use \`<repo-owner-org>/<team-slug>\` for this repository.`
      : teamMembershipUnknown
        ? `This repository's \`${CLANK8Y_CONFIG_PATH}\` restricts clank8y to configured users or teams, but I could not verify team membership. Team entries must use \`<repo-owner-org>/<team-slug>\`, and the GitHub App needs organization Members read access to check them.`
        : `This repository's \`${CLANK8Y_CONFIG_PATH}\` restricts clank8y to configured users or teams, and @${params.actor} is not included.`,
  }
}

export async function authorizeTrigger(params: {
  owner: string
  repo: string
  defaultBranch: string
  actor: string
  octokit: Octokit
}): Promise<TriggerAuthorizationResult> {
  const config = await readTriggerAuthorizationConfig(params)
  if ('error' in config) {
    return {
      authorized: false,
      reason: `This repository's \`${CLANK8Y_CONFIG_PATH}\` is invalid: ${config.error}`,
    }
  }

  if (config.allowedClank8yTriggerers.length > 0) {
    return isExplicitlyAllowed({
      owner: params.owner,
      actor: params.actor,
      allowedClank8yTriggerers: config.allowedClank8yTriggerers,
      octokit: params.octokit,
    })
  }

  const actorPermission = await fetchActorRepositoryPermission(params)
  if ('error' in actorPermission) {
    return { authorized: false, reason: actorPermission.error }
  }

  if (hasRequiredRepositoryPermission(actorPermission.permission, config.allowedTriggerPermission)) {
    return { authorized: true }
  }

  return {
    authorized: false,
    reason: `@${params.actor} has repository permission \`${actorPermission.permission}\`, but clank8y requires at least \`${config.allowedTriggerPermission}\` permission to start.`,
  }
}

export async function commentUnauthorizedTrigger(params: {
  owner: string
  repo: string
  issueNumber: number
  username: string
  reason: string
  octokit: Octokit
}): Promise<void> {
  await params.octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
    body: buildUnauthorizedTriggerBody({
      username: params.username,
      reason: params.reason,
    }),
  })
}
