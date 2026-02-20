import * as github from '@actions/github'

export type GitHubActionContext = Pick<typeof github.context, 'repo' | 'payload'>

export interface PullRequestActionContext extends GitHubActionContext {
  payload: GitHubActionContext['payload'] & {
    pull_request: {
      number: number
      head: {
        sha: string
        ref: string
      }
      base: {
        sha: string
        ref: string
      }
    }
  }
}

export interface PullRequestContext {
  owner: string
  repo: string
  number: number
  headSha: string
  headRef: string
  baseSha: string
  baseRef: string
}

export function validatePullRequestContext(
  context: GitHubActionContext = github.context,
): asserts context is PullRequestActionContext {
  const pr = context.payload.pull_request

  if (
    !pr
    || typeof pr.number !== 'number'
    || typeof pr.head?.sha !== 'string'
    || typeof pr.head?.ref !== 'string'
    || typeof pr.base?.sha !== 'string'
    || typeof pr.base?.ref !== 'string'
  ) {
    throw new Error('This action must run in a pull_request context')
  }
}

export function getPullRequestContext(
  context: GitHubActionContext = github.context,
): PullRequestContext {
  validatePullRequestContext(context)

  const pr = context.payload.pull_request

  return {
    owner: context.repo.owner,
    repo: context.repo.repo,
    number: pr.number,
    headSha: pr.head.sha,
    headRef: pr.head.ref,
    baseSha: pr.base.sha,
    baseRef: pr.base.ref,
  }
}
