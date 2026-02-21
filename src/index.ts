import * as core from '@actions/core'
import { reviewPullRequest } from './agents'

async function startClank8y(): Promise<void> {
  await reviewPullRequest({})
}

startClank8y().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`Clank8y failed to review the pull request: ${message}`)
})
