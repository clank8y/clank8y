import type { Clank8yModeRuntime } from '..'
import { resetPullRequestContext } from './context'
import { buildReviewPrompt } from './prompt'
import { reviewMCPs } from './mcps'

export function getReviewModeRuntime(promptContext: string): Clank8yModeRuntime {
  resetPullRequestContext()

  return {
    prompt: buildReviewPrompt(promptContext),
    mcps: reviewMCPs(),
  }
}
