import * as core from '@actions/core'

async function reviewPullRequest(): Promise<void> {

  // TODO: setup copilot and review the pull request
}

reviewPullRequest().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`Clank8y failed to review the pull request: ${message}`)
})
