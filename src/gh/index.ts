import type { Octokit } from 'octokit'
import { clank8yOctokit } from './octokit-clank8y'

let _oktokitPromise: Promise<Octokit> | null = null

export async function getOctokit(): Promise<Octokit> {
  if (_oktokitPromise) {
    return _oktokitPromise
  }

  _oktokitPromise = clank8yOctokit()

  return _oktokitPromise
}
