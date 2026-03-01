import * as github from '@actions/github'
import process from 'node:process'
import { buildReviewPrompt } from './prompt'
import { getOctokit } from './gh'

import * as core from '@actions/core'

export type GitHubActionContext = Pick<typeof github.context, 'repo' | 'payload'>

export interface RepositoryContext {
  owner: string
  repo: string
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

export interface WorkflowRunContext {
  id: number
  url: string
}

function parseRepositoryFromEnvironment(): RepositoryContext {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required (format: owner/repo).')
  }

  const segments = repository.split('/')
  const [owner, repo] = segments
  if (segments.length !== 2 || !owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY value '${repository}'. Expected format: owner/repo.`)
  }

  return { owner, repo }
}

function createRepositoryContext(): RepositoryContext {
  // Prefer GitHub Actions runtime context when available.
  if (github?.context?.repo?.owner && github?.context?.repo?.repo) {
    return {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    }
  }

  // Local development fallback (e.g. localtest.ts).
  return parseRepositoryFromEnvironment()
}

function resolvePromptContext(): string {
  // Prefer action input in workflow runs.
  const inputPrompt = core.getInput('prompt').trim()
  if (inputPrompt) {
    return inputPrompt
  }

  // Local development fallback.
  return (process.env.PROMPT ?? '').trim()
}

export function resolveModelInput(): string | undefined {
  // Prefer action input in workflow runs.
  const inputModel = core.getInput('model').trim()
  if (inputModel) {
    return inputModel
  }

  // Local development fallback.
  return process.env.MODEL?.trim() || undefined
}

export function resolveTimeoutInput(): number | undefined {
  // Prefer action input in workflow runs.
  const inputTimeout = core.getInput('timeout-ms').trim()
  const raw = inputTimeout || process.env.TIMEOUT_MS?.trim()
  if (!raw) {
    return undefined
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Invalid timeout-ms value '${raw}'. Expected a positive integer (milliseconds).`)
  }

  return parsed
}

function resolveRunIdValue(): string | null {
  // Prefer GitHub Actions context value when present.
  if (typeof github?.context?.runId === 'number') {
    return String(github.context.runId)
  }

  // Outside GitHub Actions there is no workflow run id.
  return null
}

function createWorkflowRunContext(repository: RepositoryContext): WorkflowRunContext | null {
  const runIdValue = resolveRunIdValue()
  if (!runIdValue) {
    return null
  }

  const runId = Number.parseInt(runIdValue, 10)
  if (Number.isNaN(runId)) {
    return null
  }

  return {
    id: runId,
    url: `https://github.com/${repository.owner}/${repository.repo}/actions/runs/${runId}`,
  }
}

let _activePullRequestContext: PullRequestContext | null = null

export async function setPullRequestContext(prNumber: number): Promise<PullRequestContext> {
  if (!Number.isFinite(prNumber) || prNumber < 1) {
    throw new Error(`Invalid pull request number '${String(prNumber)}'.`)
  }

  const reviewContext = await getPullRequestReviewContext()
  const repository = reviewContext.repository
  const octokit = await getOctokit()
  const { data: pr } = await octokit.rest.pulls.get({
    owner: repository.owner,
    repo: repository.repo,
    pull_number: prNumber,
  })

  _activePullRequestContext = {
    owner: repository.owner,
    repo: repository.repo,
    number: pr.number,
    headSha: pr.head.sha,
    headRef: pr.head.ref,
    baseSha: pr.base.sha,
    baseRef: pr.base.ref,
  }

  return _activePullRequestContext
}

export function getActivePullRequestContext(): PullRequestContext {
  if (!_activePullRequestContext) {
    throw new Error('Pull request context is not initialized. Call set-pull-request-context first.')
  }

  return _activePullRequestContext
}

export interface PullRequestReviewContext {
  repository: RepositoryContext
  workflowRun: WorkflowRunContext | null
  promptContext: string
  prompt: string
}

let _config: PullRequestReviewContext | null = null
let _configPromise: Promise<PullRequestReviewContext> | null = null

async function createPullRequestReviewContext(
): Promise<PullRequestReviewContext> {
  const repository = createRepositoryContext()
  const workflowRun = createWorkflowRunContext(repository)
  const promptContext = resolvePromptContext()

  return {
    repository,
    workflowRun,
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
