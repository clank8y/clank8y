import type {
  Octokit,
} from 'octokit'

export type PRFiles = Awaited<ReturnType<Octokit['rest']['pulls']['listFiles']>>['data']
