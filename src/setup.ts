import * as core from '@actions/core'
import * as github from '@actions/github'
import { buildReviewPrompt } from './prompt'

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

function validatePullRequestContext(
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

async function createPullRequestContext(
): Promise<PullRequestContext> {
  if (github.context.payload.pull_request) {
    validatePullRequestContext(github.context)

    const pr = github.context.payload.pull_request

    return {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      number: pr.number,
      headSha: pr.head.sha,
      headRef: pr.head.ref,
      baseSha: pr.base.sha,
      baseRef: pr.base.ref,
    }
  }

  const issueNumber = github.context.payload.issue?.number
  const hasPullRequestReference = !!github.context.payload.issue?.pull_request

  if (!hasPullRequestReference || typeof issueNumber !== 'number') {
    throw new Error('This action must run in a pull_request context or issue_comment on a pull request')
  }

  const githubToken = core.getInput('github-token', { required: true })
  const octokit = github.getOctokit(githubToken)
  const { data: pr } = await octokit.rest.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: issueNumber,
  })

  return {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    number: pr.number,
    headSha: pr.head.sha,
    headRef: pr.head.ref,
    baseSha: pr.base.sha,
    baseRef: pr.base.ref,
  }
}

export interface PullRequestReviewContext {
  pullRequest: PullRequestContext
  githubToken: string
  promptContext: string
  prompt: string
}

let _config: PullRequestReviewContext | null = null
let _configPromise: Promise<PullRequestReviewContext> | null = null

async function createPullRequestReviewContext(
): Promise<PullRequestReviewContext> {
  const pullRequest = await createPullRequestContext()
  const githubToken = core.getInput('github-token', { required: true })
  const promptContext = core.getInput('prompt-context').trim()

  return {
    pullRequest,
    githubToken,
    promptContext,
    prompt: buildReviewPrompt(promptContext),
  }
}

export async function getPullRequestReviewContext(): Promise<PullRequestReviewContext> {
  if (_config) {
    return _config
  }

  if (!_configPromise) {
    _configPromise = createPullRequestReviewContext()
  }

  _config = await _configPromise
  return _config
}
