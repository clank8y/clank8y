import * as core from '@actions/core'
import * as github from '@actions/github'
import type { Octokit } from 'octokit'

export function githubBotOctokit(): Octokit | null {
  const githubToken = core.getInput('github-token')

  if (!githubToken) {
    return null
  }

  return github.getOctokit(githubToken) as Octokit
}
