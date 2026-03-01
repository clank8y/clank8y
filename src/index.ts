import * as core from '@actions/core'
import { reviewPullRequest } from './agents'
import { resolveModelInput } from './setup'

async function startClank8y(): Promise<void> {
  const model = resolveModelInput()
  await reviewPullRequest({
    ...(model !== undefined && { model }),
  })
}

startClank8y().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`clank8y failed to review the pull request: ${message}`)
})
