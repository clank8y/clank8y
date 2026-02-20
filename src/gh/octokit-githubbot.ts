import * as github from '@actions/github'
import * as core from '@actions/core'
import type { Octokit } from 'octokit'

export function githubBotOctokit(): Octokit | null {
  const myToken = core.getInput('myToken')

  if (!myToken) {
    return null
  }

  return github.getOctokit(myToken) as Octokit
}
