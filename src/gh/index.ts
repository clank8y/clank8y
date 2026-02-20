import type { Octokit } from 'octokit'
import { clank8yOctokit } from './octokit-clank8y'
import { githubBotOctokit } from './octokit-githubbot'

let _oktokit: Octokit | null = null

export function getOctokit(): Octokit {
  if (_oktokit) {
    return _oktokit
  }
  _oktokit = clank8yOctokit()
  if (!_oktokit) {
    _oktokit = githubBotOctokit()
  }
  if (!_oktokit) {
    throw new Error('No Octokit instance available')
  }

  return _oktokit
}
