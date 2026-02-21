import * as core from '@actions/core'

async function startClank8y(): Promise<void> {

  // TODO: setup copilot and review the pull request
}

startClank8y().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`Clank8y failed to review the pull request: ${message}`)
})
