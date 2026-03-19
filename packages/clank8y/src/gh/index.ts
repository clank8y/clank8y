import type { Octokit } from 'octokit'
import { clank8yOctokit } from './octokit-clank8y'

export async function getOctokit(): Promise<Octokit> {
  return await clank8yOctokit()
}
