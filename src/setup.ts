import * as core from '@actions/core'
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

function createPullRequestContext(
): PullRequestContext {
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

export interface PullRequestReviewContext {
  pullRequest: PullRequestContext
  copilotToken: string
  githubToken: string
  promptContext: string
  prompt: string
}

const DEFAULT_REVIEW_PROMPT = [
  'You are reviewing a pull request for Cumulocity IoT (c8y).',
  'Focus on correctness, security, maintainability, and test impact.',
  'Prioritize concrete, actionable feedback.',
].join('\n')

let _config: PullRequestReviewContext | null = null

function buildReviewPrompt(basePrompt: string, promptContext: string): string {
  if (!promptContext) {
    return basePrompt
  }

  return [
    basePrompt,
    '',
    'Additional user context:',
    promptContext,
  ].join('\n')
}

function createPullRequestReviewContext(
): PullRequestReviewContext {
  const pullRequest = createPullRequestContext()
  const copilotToken = core.getInput('copilot-token', { required: true })
  const githubToken = core.getInput('github-token', { required: true })
  const promptContext = core.getInput('prompt-context').trim()

  return {
    pullRequest,
    copilotToken,
    githubToken,
    promptContext,
    prompt: buildReviewPrompt(DEFAULT_REVIEW_PROMPT, promptContext),
  }
}

export function getPullRequestReviewContext(): PullRequestReviewContext {
  if (_config) {
    return _config
  }

  _config = createPullRequestReviewContext()
  return _config
}
