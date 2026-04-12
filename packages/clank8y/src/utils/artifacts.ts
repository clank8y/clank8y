import process from 'node:process'
import path from 'node:path'
import { appendFile, mkdir, rm, stat, writeFile } from 'node:fs/promises'

export interface ReviewArtifactPaths {
  artifactDir: string
  diffPath: string
  reviewCommentsPath: string
}

export interface TaskArtifactPaths {
  artifactDir: string
  diffPath: string
  issueDirPath: string
  prPath: string
  reportPath: string
}

const CLANK8Y_ARTIFACT_DIR = '.clank8y'
const DIFF_ARTIFACT_FILE = 'diff.txt'
const REVIEW_COMMENTS_ARTIFACT_FILE = 'review-comments.md'
const REPORT_ARTIFACT_FILE = 'report.md'
const PROMPT_ARTIFACT_FILE = 'prompt.md'
const RESOURCES_ARTIFACT_FILE = 'resources.md'
const PR_ARTIFACT_FILE = 'pr.md'
const ISSUES_ARTIFACT_DIR = 'issues'

export function getClank8yArtifactDirPath(): string {
  return path.join(process.cwd(), CLANK8Y_ARTIFACT_DIR)
}

export function resolveClank8yArtifactPath(...segments: string[]): string {
  return path.join(getClank8yArtifactDirPath(), ...segments)
}

export function getClank8yReposDirPath(): string {
  return resolveClank8yArtifactPath('repos')
}

export function isWithinClank8yRepos(targetPath: string): boolean {
  const reposDir = getClank8yReposDirPath()
  const relativePath = path.relative(reposDir, targetPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

export function isWithinNestedClank8yRepoArtifact(targetPath: string): boolean {
  const reposDir = getClank8yReposDirPath()
  const relativePath = path.relative(reposDir, targetPath)
  if (relativePath === '' || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return false
  }

  const segments = relativePath.split(path.sep).filter(Boolean)
  if (segments.length < 2) {
    return false
  }

  return segments.slice(1).includes('.clank8y')
}

export function isWithinClank8yArtifacts(targetPath: string): boolean {
  const artifactDir = getClank8yArtifactDirPath()
  const relativePath = path.relative(artifactDir, targetPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

export function getReviewArtifactPaths(): ReviewArtifactPaths {
  const artifactDir = getClank8yArtifactDirPath()

  return {
    artifactDir,
    diffPath: resolveClank8yArtifactPath(DIFF_ARTIFACT_FILE),
    reviewCommentsPath: resolveClank8yArtifactPath(REVIEW_COMMENTS_ARTIFACT_FILE),
  }
}

export function getTaskArtifactPaths(): TaskArtifactPaths {
  const artifactDir = getClank8yArtifactDirPath()

  return {
    artifactDir,
    diffPath: resolveClank8yArtifactPath(DIFF_ARTIFACT_FILE),
    issueDirPath: resolveClank8yArtifactPath(ISSUES_ARTIFACT_DIR),
    prPath: resolveClank8yArtifactPath(PR_ARTIFACT_FILE),
    reportPath: resolveClank8yArtifactPath(REPORT_ARTIFACT_FILE),
  }
}

export async function clearClank8yArtifacts(): Promise<void> {
  const { artifactDir } = getReviewArtifactPaths()
  await rm(artifactDir, { force: true, recursive: true })
}

export async function resetClank8yArtifacts(): Promise<ReviewArtifactPaths> {
  const artifactPaths = getReviewArtifactPaths()
  await rm(artifactPaths.artifactDir, { force: true, recursive: true })
  await mkdir(artifactPaths.artifactDir, { recursive: true })
  return artifactPaths
}

export function getReportArtifactPath(): string {
  return resolveClank8yArtifactPath(REPORT_ARTIFACT_FILE)
}

export function getPullRequestArtifactPath(): string {
  return resolveClank8yArtifactPath(PR_ARTIFACT_FILE)
}

export function getIssuesArtifactDirPath(): string {
  return resolveClank8yArtifactPath(ISSUES_ARTIFACT_DIR)
}

export function getIssueArtifactPath(issueNumber: number): string {
  return resolveClank8yArtifactPath(ISSUES_ARTIFACT_DIR, `${issueNumber}.md`)
}

export function getPromptArtifactPath(): string {
  return resolveClank8yArtifactPath(PROMPT_ARTIFACT_FILE)
}

export function getResourcesArtifactPath(): string {
  return resolveClank8yArtifactPath(RESOURCES_ARTIFACT_FILE)
}

export async function doesReportArtifactExist(): Promise<boolean> {
  const reportPath = getReportArtifactPath()
  const stats = await stat(reportPath).catch(() => null)
  return stats?.isFile() ?? false
}

export async function doesDiffArtifactExist(): Promise<boolean> {
  const { diffPath } = getReviewArtifactPaths()
  const stats = await stat(diffPath).catch(() => null)
  return stats?.isFile() ?? false
}

export async function doesReviewCommentsArtifactExist(): Promise<boolean> {
  const { reviewCommentsPath } = getReviewArtifactPaths()
  const stats = await stat(reviewCommentsPath).catch(() => null)
  return stats?.isFile() ?? false
}

export async function writeDiffArtifact(content: string): Promise<void> {
  const { diffPath } = getReviewArtifactPaths()
  await writeFile(diffPath, content, 'utf-8')
}

export async function writePullRequestArtifact(content: string): Promise<string> {
  const prPath = getPullRequestArtifactPath()
  await writeFile(prPath, content, 'utf-8')
  return prPath
}

export async function writeIssueArtifact(issueNumber: number, content: string): Promise<string> {
  const issuesDirPath = getIssuesArtifactDirPath()
  await mkdir(issuesDirPath, { recursive: true })
  const issuePath = getIssueArtifactPath(issueNumber)
  await writeFile(issuePath, content, 'utf-8')
  return issuePath
}

export async function writePromptArtifact(content: string): Promise<string> {
  const promptPath = getPromptArtifactPath()
  await writeFile(promptPath, content, 'utf-8')
  return promptPath
}

export async function initializeResourcesArtifact(): Promise<string> {
  const resourcesPath = getResourcesArtifactPath()
  await writeFile(resourcesPath, [
    '# IncidentFix Resources',
    '',
    '> Durable MCP-maintained record of remote artifacts created or updated during this run.',
    '> Read this file when context gets fuzzy. Do not rely on memory for issue/PR numbers or URLs.',
    '',
  ].join('\n'), 'utf-8')
  return resourcesPath
}

export async function appendResourcesArtifactEntry(params: {
  action: string
  repository: string
  summary: string
  title?: string
  url?: string
  number?: number
  branch?: string
}): Promise<string> {
  const resourcesPath = getResourcesArtifactPath()
  const lines = [
    `## ${new Date().toISOString()} ${params.action}`,
    '',
    `- repository: ${params.repository}`,
  ]

  if (params.number !== undefined) {
    lines.push(`- number: ${params.number}`)
  }

  if (params.branch) {
    lines.push(`- branch: ${params.branch}`)
  }

  if (params.title) {
    lines.push(`- title: ${params.title}`)
  }

  if (params.url) {
    lines.push(`- url: ${params.url}`)
  }

  lines.push(`- summary: ${params.summary}`, '')

  await appendFile(resourcesPath, `${lines.join('\n')}\n`, 'utf-8')
  return resourcesPath
}

export async function writeReviewCommentsArtifact(content: string): Promise<string> {
  const { reviewCommentsPath } = getReviewArtifactPaths()
  await writeFile(reviewCommentsPath, content, 'utf-8')
  return reviewCommentsPath
}
