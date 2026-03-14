import * as core from '@actions/core'
import { runClank8y } from './agents'
import { resolveModelInput, resolveTimeoutInput } from './setup'

export async function runClank8yEntry(): Promise<void> {
  const model = resolveModelInput()
  const timeOutMs = resolveTimeoutInput()
  await runClank8y({
    ...(model !== undefined && { model }),
    ...(timeOutMs !== undefined && { timeOutMs }),
  })
}

runClank8yEntry().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  core.setFailed(`clank8y failed to review the pull request: ${message}`)
})
