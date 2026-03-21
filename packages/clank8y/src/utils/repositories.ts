import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { Octokit } from 'octokit'
import { getClank8yReposDirPath } from './artifacts'
import { configureClank8yGitRepository, GITHUB_HOST, runClank8yGit } from './git'

export interface GitHubRepositoryRef {
  owner: string
  repo: string
}

export interface BranchMeta {
  name: string
  isDefault: boolean
  tipSha: string
  lastCommitDate: string | null
  aheadBy?: number
  behindBy?: number
}

function splitRepository(repository: string): [string, string] {
  const parts = repository.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Repository must be in owner/repo format. Received: ${repository}`)
  }

  return [parts[0], parts[1]]
}

export function parseGitHubRepository(repository: string): GitHubRepositoryRef {
  const [owner, repo] = splitRepository(repository.trim())
  return { owner, repo }
}

export function toGitHubRepositoryKey(repository: GitHubRepositoryRef): string {
  return `${repository.owner.toLowerCase()}--${repository.repo.toLowerCase()}`
}

const CLANK8Y_BRANCH_PATTERN = /^(fix|feat|chore|refactor|ci|docs|style|perf|test|build|revert)\/clank8y-.+$/

export function assertPushBranchAllowed(branch: string, defaultBranch: string): void {
  const normalizedBranch = branch.trim()
  if (!normalizedBranch) {
    throw new Error('Branch name is required for push.')
  }

  if (normalizedBranch === 'HEAD') {
    throw new Error('Cannot push from detached HEAD. Create or check out a branch first.')
  }

  if (normalizedBranch === defaultBranch) {
    throw new Error(`Pushing the default branch '${defaultBranch}' is not allowed in IncidentFix mode.`)
  }

  if (!CLANK8Y_BRANCH_PATTERN.test(normalizedBranch)) {
    throw new Error(
      `Branch '${normalizedBranch}' does not match the required naming convention. `
      + `Use <type>/clank8y-<name> where type is one of: fix, feat, chore, refactor, ci, docs, style, perf, test, build, revert.`,
    )
  }
}

export function assertArtifactOwnedByAuthenticatedUser(params: {
  artifactType: 'issue' | 'pull request'
  authorLogin: string | null | undefined
  authenticatedLogin: string
}): void {
  const authorLogin = params.authorLogin?.trim()
  const authenticatedLogin = params.authenticatedLogin.trim()

  if (!authorLogin) {
    throw new Error(`Cannot update ${params.artifactType}: author is unknown.`)
  }

  if (!authenticatedLogin) {
    throw new Error(`Cannot update ${params.artifactType}: authenticated GitHub login is unknown.`)
  }

  if (authorLogin.toLowerCase() !== authenticatedLogin.toLowerCase()) {
    throw new Error(`Cannot update ${params.artifactType}: only artifacts authored by '${authenticatedLogin}' may be updated.`)
  }
}

function ensurePathStaysWithinRoot(rootPath: string, targetPath: string): void {
  const relativePath = path.relative(rootPath, targetPath)
  if (relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))) {
    return
  }

  throw new Error(`Resolved repository path escaped the allowed root: ${targetPath}`)
}

export function resolveRepositoryPath(repositoryRootPath: string, repository: GitHubRepositoryRef): string {
  const repositoryPath = path.join(repositoryRootPath, toGitHubRepositoryKey(repository))

  try {
    ensurePathStaysWithinRoot(repositoryRootPath, repositoryPath)
  } catch {
    throw new Error(`Resolved repository path escaped the allowed root: ${repositoryPath}`)
  }

  return repositoryPath
}

export async function doesGitRepositoryExist(repositoryPath: string): Promise<boolean> {
  const repoStat = await stat(repositoryPath).catch(() => null)
  const gitStat = await stat(path.join(repositoryPath, '.git')).catch(() => null)
  return Boolean(repoStat?.isDirectory() && gitStat)
}

export async function getRepositoryCurrentBranch(repositoryPath: string): Promise<string> {
  const { stdout } = await runClank8yGit(['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: repositoryPath,
  })

  return stdout.trim()
}

function repositoryRemoteUrl(repository: GitHubRepositoryRef): string {
  return `https://${GITHUB_HOST}/${repository.owner}/${repository.repo}.git`
}

export async function cloneRepository(params: {
  repository: GitHubRepositoryRef
  defaultBranch: string
  token: string
}): Promise<{ path: string, reusedExistingCheckout: boolean }> {
  const reposDir = getClank8yReposDirPath()
  await mkdir(reposDir, { recursive: true })

  const repositoryPath = resolveRepositoryPath(reposDir, params.repository)
  if (await doesGitRepositoryExist(repositoryPath)) {
    await configureClank8yGitRepository(repositoryPath)
    return {
      path: repositoryPath,
      reusedExistingCheckout: true,
    }
  }

  await runClank8yGit([
    'clone',
    '--branch',
    params.defaultBranch,
    '--single-branch',
    '--no-tags',
    repositoryRemoteUrl(params.repository),
    repositoryPath,
  ], { token: params.token })
  await configureClank8yGitRepository(repositoryPath)

  return {
    path: repositoryPath,
    reusedExistingCheckout: false,
  }
}

export async function fetchRepositoryBranch(params: {
  repository: GitHubRepositoryRef
  branch: string
  token: string
}): Promise<{ path: string, localRef: string }> {
  const repositoryPath = resolveRepositoryPath(getClank8yReposDirPath(), params.repository)
  if (!(await doesGitRepositoryExist(repositoryPath))) {
    throw new Error(`Repository checkout does not exist at ${repositoryPath}. Call clone-repo first.`)
  }

  await configureClank8yGitRepository(repositoryPath)

  await runClank8yGit([
    'fetch',
    '--no-tags',
    'origin',
    `refs/heads/${params.branch}:refs/remotes/origin/${params.branch}`,
  ], {
    cwd: repositoryPath,
    token: params.token,
  })

  return {
    path: repositoryPath,
    localRef: `origin/${params.branch}`,
  }
}

export async function pushRepositoryBranch(params: {
  repository: GitHubRepositoryRef
  defaultBranch: string
  token: string
  branch: string
}): Promise<{ path: string, branch: string, remoteRef: string }> {
  const repositoryPath = resolveRepositoryPath(getClank8yReposDirPath(), params.repository)
  if (!(await doesGitRepositoryExist(repositoryPath))) {
    throw new Error(`Repository checkout does not exist at ${repositoryPath}. Call clone-repo first.`)
  }

  await configureClank8yGitRepository(repositoryPath)

  const branch = params.branch.trim()
  assertPushBranchAllowed(branch, params.defaultBranch)

  await runClank8yGit(['check-ref-format', '--branch', branch], {
    cwd: repositoryPath,
  })

  await runClank8yGit([
    'push',
    '--set-upstream',
    'origin',
    `HEAD:refs/heads/${branch}`,
  ], {
    cwd: repositoryPath,
    token: params.token,
  })

  return {
    path: repositoryPath,
    branch,
    remoteRef: `refs/heads/${branch}`,
  }
}

async function getBranchLastCommitDate(octokit: Octokit, repository: GitHubRepositoryRef, sha: string): Promise<string | null> {
  const { data } = await octokit.rest.repos.getCommit({
    owner: repository.owner,
    repo: repository.repo,
    ref: sha,
  })

  return data.commit.committer?.date ?? data.commit.author?.date ?? null
}

async function getAheadBehind(octokit: Octokit, repository: GitHubRepositoryRef, defaultBranch: string, branch: string): Promise<Pick<BranchMeta, 'aheadBy' | 'behindBy'>> {
  if (branch === defaultBranch) {
    return { aheadBy: 0, behindBy: 0 }
  }

  try {
    const { data } = await octokit.rest.repos.compareCommits({
      owner: repository.owner,
      repo: repository.repo,
      base: defaultBranch,
      head: branch,
    })

    return {
      aheadBy: data.ahead_by,
      behindBy: data.behind_by,
    }
  } catch {
    return {}
  }
}

export async function getRepositoryBranches(params: {
  octokit: Octokit
  repository: GitHubRepositoryRef
}): Promise<{ defaultBranch: string, branches: BranchMeta[] }> {
  const { octokit, repository } = params
  const { data: repoData } = await octokit.rest.repos.get({
    owner: repository.owner,
    repo: repository.repo,
  })

  const defaultBranch = repoData.default_branch
  const branches = await octokit.paginate(octokit.rest.repos.listBranches, {
    owner: repository.owner,
    repo: repository.repo,
    per_page: 100,
  })

  const enrichedBranches = await Promise.all(branches.map(async (branch) => {
    const [lastCommitDate, comparison] = await Promise.all([
      getBranchLastCommitDate(octokit, repository, branch.commit.sha),
      getAheadBehind(octokit, repository, defaultBranch, branch.name),
    ])

    return {
      name: branch.name,
      isDefault: branch.name === defaultBranch,
      tipSha: branch.commit.sha,
      lastCommitDate,
      ...comparison,
    } satisfies BranchMeta
  }))

  enrichedBranches.sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1
    }

    const leftTime = left.lastCommitDate ? Date.parse(left.lastCommitDate) : 0
    const rightTime = right.lastCommitDate ? Date.parse(right.lastCommitDate) : 0
    return rightTime - leftTime
  })

  return {
    defaultBranch,
    branches: enrichedBranches,
  }
}
