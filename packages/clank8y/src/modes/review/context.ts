import { getOctokit } from '../../gh'
import { SET_PULL_REQUEST_CONTEXT_TOOL_NAME } from './mcps/github'

export interface PullRequestContext {
  owner: string
  repo: string
  number: number
  headSha: string
  headRef: string
  baseSha: string
  baseRef: string
}

let _activePullRequestContext: PullRequestContext | null = null

function parseRepository(repository: string): { owner: string, repo: string } {
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

export function resetPullRequestContext(): void {
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
    throw new Error(`Pull request context is not initialized. Call ${SET_PULL_REQUEST_CONTEXT_TOOL_NAME} first.`)
  }

  return _activePullRequestContext
}
