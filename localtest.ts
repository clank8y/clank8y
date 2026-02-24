import 'dotenv/config'
import process from 'node:process'
import { reviewPullRequest } from './src/agents'

/**
 * Local test runner setup (dotenv-based)
 *
 * Required env vars:
 * - GITHUB_REPOSITORY
 *   - Format: owner/repo
 *   - Why: runtime uses GitHub context to resolve repository for PR APIs and token exchange payload.
 *
 * - PROMPT
 *   - Why: event-level instruction block appended to clank8y base prompt.
 *
 * - COPILOT_GITHUB_TOKEN
 *   - Why: Copilot SDK authentication for running the review agent.
 *   - Get from: GitHub user token with Copilot entitlement and Copilot Requests permission.
 *
 * - GH_TOKEN or GITHUB_TOKEN
 *   - Why: local/dev fallback token for Clank8yBotToken (Octokit PR API operations) when OIDC runtime is unavailable.
 *
 * > Note: GH_TOKEN/GITHUB_TOKEN and COPILOT_GITHUB_TOKEN can be the same token if it has all required permissions.
 * > They are separated by role: CopilotAgentToken (model auth) vs Clank8yBotToken (GitHub PR API auth).
 */

function setupActionLikeEnvironment(): void {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required for local test (format: owner/repo)')
  }
}

async function main(): Promise<void> {
  setupActionLikeEnvironment()

  await reviewPullRequest({
  })
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`localtest failed: ${message}`)
  process.exitCode = 1
})
