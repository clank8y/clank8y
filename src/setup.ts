import { getOctokit } from './gh'

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

export interface RunInfo {
  runner: 'github-action'
  id: number
  url: string
}

export interface Clank8yRuntimeContext {
  promptContext: string
  auth: {
    githubToken: string
    copilotToken: string
  }
  // Added by the GitHub Actions wrapper when the current execution has a workflow run URL.
  runInfo?: RunInfo
  options?: {
    suppressModelListing?: boolean
  }
}

let _runtimeContext: Clank8yRuntimeContext | null = null
let _activePullRequestContext: PullRequestContext | null = null

function requireRuntimeContext(): Clank8yRuntimeContext {
  if (!_runtimeContext) {
    throw new Error('Clank8y runtime context is not initialized. Call setClank8yRuntimeContext first.')
  }

  return _runtimeContext
}

function parseRepository(repository: string): RepositoryContext {
  const normalizedRepository = repository.trim()
  if (!normalizedRepository) {
    throw new Error('Repository is required (format: owner/repo).')
  }

  const segments = normalizedRepository.split('/')
  const [owner, repo] = segments
  if (segments.length !== 2 || !owner || !repo) {
    throw new Error(`Invalid repository value '${normalizedRepository}'. Expected format: owner/repo.`)
  }

  return { owner, repo }
}

function normalizeRuntimeContext(context: Clank8yRuntimeContext): Clank8yRuntimeContext {
  if (!context.promptContext.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty promptContext.')
  }

  if (!context.auth.githubToken.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty auth.githubToken.')
  }

  if (!context.auth.copilotToken.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty auth.copilotToken.')
  }

  return {
    ...context,
    promptContext: context.promptContext.trim(),
    auth: {
      githubToken: context.auth.githubToken.trim(),
      copilotToken: context.auth.copilotToken.trim(),
    },
  }
}

export function setClank8yRuntimeContext(context: Clank8yRuntimeContext): void {
  _runtimeContext = normalizeRuntimeContext(context)
  _activePullRequestContext = null
}

export function getClank8yRuntimeContext(): Clank8yRuntimeContext {
  return requireRuntimeContext()
}

export function resetClank8yRuntimeContextForTests(): void {
  _runtimeContext = null
  _activePullRequestContext = null
}

export async function setPullRequestContext(params: { repository: string, prNumber: number }): Promise<PullRequestContext> {
  if (!Number.isFinite(params.prNumber) || params.prNumber < 1) {
    throw new Error(`Invalid pull request number '${String(params.prNumber)}'.`)
  }

  const repository = parseRepository(params.repository)
  const octokit = await getOctokit()
  const { data: pr } = await octokit.rest.pulls.get({
    owner: repository.owner,
    repo: repository.repo,
    pull_number: params.prNumber,
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
