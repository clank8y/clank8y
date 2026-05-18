import type { Clank8yModeRuntime } from '..'
import { resetPullRequestContext } from './context'
import { buildReviewPrompt } from './prompt'
import { reviewExternalMcpServers } from './externalMcpServers'
import { reviewGitHubTools } from './tools/github'
import { reviewBuiltinTools } from '../../tools/piBuiltins'

export function getReviewModeRuntime(promptContext: string): Clank8yModeRuntime {
  resetPullRequestContext()

  return {
    prompt: buildReviewPrompt(promptContext),
    externalMcpServers: reviewExternalMcpServers(),
    tools: [
      ...reviewBuiltinTools(),
      ...reviewGitHubTools(),
    ],
  }
}
