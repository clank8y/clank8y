import { Buffer } from 'node:buffer'
import process from 'node:process'
import { x } from 'tinyexec'

export const GITHUB_HOST = 'github.com'
export const CLANK8Y_BOT_LOGIN = 'clank8y[bot]'
export const CLANK8Y_BOT_ID = 263439080
export const CLANK8Y_GIT_USER_NAME = CLANK8Y_BOT_LOGIN
export const CLANK8Y_GIT_USER_EMAIL = `${CLANK8Y_BOT_ID}+${CLANK8Y_BOT_LOGIN}@users.noreply.github.com`

export interface Clank8yGitOptions {
  cwd?: string
  token?: string
  githubHost?: string
}

function buildGitHubBasicAuthHeader(token: string): string {
  const basic = Buffer.from(`x-access-token:${token}`, 'utf-8').toString('base64')
  return `AUTHORIZATION: basic ${basic}`
}

function getClank8yGitEnv(options?: Pick<Clank8yGitOptions, 'token' | 'githubHost'>): Record<string, string | undefined> {
  const githubHost = options?.githubHost ?? GITHUB_HOST
  const env: Record<string, string | undefined> = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
  }

  if (options?.token) {
    env.GIT_CONFIG_COUNT = '1'
    env.GIT_CONFIG_KEY_0 = `http.https://${githubHost}/.extraheader`
    env.GIT_CONFIG_VALUE_0 = buildGitHubBasicAuthHeader(options.token)
  }

  return env
}

export async function runClank8yGit(args: string[], options?: Clank8yGitOptions): Promise<{ stdout: string, stderr: string }> {
  const result = await x('git', args, {
    throwOnError: false,
    nodeOptions: {
      cwd: options?.cwd,
      env: getClank8yGitEnv(options),
    },
  })

  const stdout = result.stdout.trim()
  const stderr = result.stderr.trim()

  if (result.exitCode !== 0) {
    const message = stderr || stdout || `git ${args.join(' ')} failed with exit code ${result.exitCode}`
    throw new Error(message)
  }

  return {
    stdout,
    stderr,
  }
}

export async function configureClank8yGitRepository(repositoryPath: string): Promise<void> {
  await runClank8yGit(['config', '--local', 'user.name', CLANK8Y_GIT_USER_NAME], { cwd: repositoryPath })
  await runClank8yGit(['config', '--local', 'user.email', CLANK8Y_GIT_USER_EMAIL], { cwd: repositoryPath })
  await runClank8yGit(['config', '--local', 'credential.helper', ''], { cwd: repositoryPath })
}
