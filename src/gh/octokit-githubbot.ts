import * as github from '@actions/github'
import type { Octokit } from 'octokit'
import { getPullRequestReviewContext } from '../setup'

export function githubBotOctokit(): Octokit | null {
  const githubToken = getPullRequestReviewContext().githubToken

  if (!githubToken) {
    return null
  }

  return github.getOctokit(githubToken) as Octokit
}
