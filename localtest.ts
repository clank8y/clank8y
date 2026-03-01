import 'dotenv/config'
import process from 'node:process'
import { reviewPullRequest } from './src/agents'
import { resolveModelInput } from './src/setup'

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
 *   - Fine-grained PAT permissions:
 *     - Repository: Contents (read)
 *     - Repository: Pull requests (write)
 *     - Repository: Issues (write)
 *
 * > Single-token option:
 * > - You can use one token value for both `COPILOT_GITHUB_TOKEN` and `GH_TOKEN`/`GITHUB_TOKEN`.
 * > - That token must include: Copilot Requests + Contents (read) + Pull requests (write)
 * >   (+ Issues (write) only if needed).
 * >
 * > Split-token option:
 * > - `COPILOT_GITHUB_TOKEN`: Copilot Requests only (plus minimal read if GitHub requires selecting repo scope).
 * > - `GH_TOKEN`/`GITHUB_TOKEN`: Contents (read) + Pull requests (write)
 * >   (+ Issues (write) only if needed).
 * >
 * > Roles are still separate even if token values are identical:
 * > CopilotAgentToken (model auth) vs Clank8yBotToken (GitHub PR API auth).
 * >
 * > Local identity note:
 * > - In local test mode, when using `GH_TOKEN`/`GITHUB_TOKEN` fallback,
 * >   the responding GitHub account is the owner of that token (typically your own account).
 */

function setupActionLikeEnvironment(): void {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required for local test (format: owner/repo)')
  }
}

async function main(): Promise<void> {
  setupActionLikeEnvironment()

  const model = resolveModelInput()
  await reviewPullRequest({
    ...(model !== undefined && { model }),
  })
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`localtest failed: ${message}`)
  process.exitCode = 1
})
