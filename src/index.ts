import * as core from '@actions/core'
import { reviewPullRequest } from './agents'
import { resolveModelInput, resolveTimeoutInput } from './setup'

async function startClank8y(): Promise<void> {
  const model = resolveModelInput()
  const timeOutMs = resolveTimeoutInput()
  await reviewPullRequest({
    ...(model !== undefined && { model }),
    ...(timeOutMs !== undefined && { timeOutMs }),
  })
}

startClank8y().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`clank8y failed to review the pull request: ${message}`)
})
