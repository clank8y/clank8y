import process from 'node:process'
import path from 'node:path'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'

export interface ReviewArtifactPaths {
  artifactDir: string
  diffPath: string
  reviewCommentsPath: string
}

const CLANK8Y_ARTIFACT_DIR = '.clank8y'
const DIFF_ARTIFACT_FILE = 'diff.txt'
const REVIEW_COMMENTS_ARTIFACT_FILE = 'review-comments.md'
const REPORT_ARTIFACT_FILE = 'report.md'

export function getClank8yArtifactDirPath(): string {
  return path.join(process.cwd(), CLANK8Y_ARTIFACT_DIR)
}

export function resolveClank8yArtifactPath(...segments: string[]): string {
  return path.join(getClank8yArtifactDirPath(), ...segments)
}

export function getClank8yReposDirPath(): string {
  return resolveClank8yArtifactPath('repos')
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

export async function writeReviewCommentsArtifact(content: string): Promise<string> {
  const { reviewCommentsPath } = getReviewArtifactPaths()
  await writeFile(reviewCommentsPath, content, 'utf-8')
  return reviewCommentsPath
}
