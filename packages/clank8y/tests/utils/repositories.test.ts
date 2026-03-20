import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  CLANK8Y_GIT_USER_EMAIL,
  CLANK8Y_GIT_USER_NAME,
  configureClank8yGitRepository,
  runClank8yGit,
} from '../../src/utils/git'
import { parseGitHubRepository, resolveRepositoryPath, toGitHubRepositoryKey } from '../../src/utils/repositories'

describe('repository helpers', () => {
  test('parses owner/repo repository references', () => {
    expect(parseGitHubRepository('Clank8y/Repo')).toEqual({
      owner: 'Clank8y',
      repo: 'Repo',
    })
  })

  test('rejects invalid repository references', () => {
    expect(() => parseGitHubRepository('missing-slash')).toThrow('owner/repo')
  })

  test('builds a deterministic repository key', () => {
    expect(toGitHubRepositoryKey({ owner: 'Clank8y', repo: 'Repo' })).toBe('clank8y--repo')
  })

  test('resolves repository checkout paths inside .clank8y/repos', () => {
    const repoPath = resolveRepositoryPath('/workspace/.clank8y/repos', { owner: 'Clank8y', repo: 'Repo' })

    expect(repoPath).toContain('clank8y--repo')
    expect(repoPath).toMatch(/\.clank8y[\/\\]repos[\/\\]clank8y--repo$/)
  })

  test('configures git locally inside the repository .git/config', async () => {
    const repositoryPath = await mkdtemp(path.join(tmpdir(), 'clank8y-git-test-'))

    try {
      await runClank8yGit(['init'], { cwd: repositoryPath })
      await configureClank8yGitRepository(repositoryPath)

      const gitConfig = await readFile(path.join(repositoryPath, '.git', 'config'), 'utf-8')

      expect(gitConfig).toContain('[user]')
      expect(gitConfig).toContain(`name = ${CLANK8Y_GIT_USER_NAME}`)
      expect(gitConfig).toContain(`email = ${CLANK8Y_GIT_USER_EMAIL}`)
      expect(gitConfig).toContain('[credential]')
      expect(gitConfig).toContain('helper =')
    } finally {
      await rm(repositoryPath, { force: true, recursive: true })
    }
  })
})
