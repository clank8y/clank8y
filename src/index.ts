import * as core from '@actions/core'
import * as github from '@actions/github'
import { consola } from 'consola'
import { reviewPullRequest } from './agents'
import { getOctokit } from './gh'

function isClank8yCommand(commentBody: string): boolean {
  return commentBody === '/clank8y' || commentBody === '/clank8y review'
}

async function acknowledgeIssueCommentIfNeeded(): Promise<boolean> {
  if (github.context.eventName !== 'issue_comment') {
    return true
  }

  const commentBody = github.context.payload.comment?.body
  if (typeof commentBody !== 'string' || !isClank8yCommand(commentBody)) {
    consola.info('Issue comment event received without /clank8y command. Skipping review run.')
    return false
  }

  const commentId = github.context.payload.comment?.id
  if (typeof commentId !== 'number') {
    consola.warn('Could not acknowledge /clank8y command: missing issue comment id.')
    return true
  }

  const octokit = getOctokit()

  await octokit.rest.reactions.createForIssueComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    comment_id: commentId,
    content: 'eyes',
  })

  return true
}

async function startClank8y(): Promise<void> {
  const shouldRun = await acknowledgeIssueCommentIfNeeded()
  if (!shouldRun) {
    return
  }

  await reviewPullRequest({})
}

startClank8y().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`clank8y failed to review the pull request: ${message}`)
})
