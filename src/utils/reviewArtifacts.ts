import process from 'node:process'
import path from 'node:path'
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises'

export interface ReviewArtifactPaths {
  artifactDir: string
  diffPath: string
}

const CLANK8Y_ARTIFACT_DIR = '.clank8y'
const DIFF_ARTIFACT_FILE = 'diff.txt'

export function getReviewArtifactPaths(): ReviewArtifactPaths {
  const workspaceRoot = process.cwd()
  const artifactDir = path.join(workspaceRoot, CLANK8Y_ARTIFACT_DIR)

  return {
    artifactDir,
    diffPath: path.join(artifactDir, DIFF_ARTIFACT_FILE),
  }
}

export async function ensureReviewArtifactDir(): Promise<ReviewArtifactPaths> {
  const artifactPaths = getReviewArtifactPaths()
  await mkdir(artifactPaths.artifactDir, { recursive: true })
  return artifactPaths
}

export async function clearReviewArtifacts(): Promise<void> {
  const { artifactDir } = getReviewArtifactPaths()
  await unlink(path.join(artifactDir, DIFF_ARTIFACT_FILE)).catch(() => null)
}

export async function doesDiffArtifactExist(): Promise<boolean> {
  const { diffPath } = getReviewArtifactPaths()
  const stats = await stat(diffPath).catch(() => null)
  return stats?.isFile() ?? false
}

export async function writeDiffArtifact(content: string): Promise<void> {
  const { diffPath } = getReviewArtifactPaths()
  await mkdir(path.dirname(diffPath), { recursive: true })
  await writeFile(diffPath, content, 'utf-8')
}
