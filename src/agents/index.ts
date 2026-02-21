import { defu } from 'defu'
import type { DeepOptional } from '../types'
import { githubCopilotAgent } from './copilot'

export type AgentEffort = 'low' | 'medium' | 'high'

interface PullRequestAgentConfiguration {
  /**
   * Effort level determines what model to use unless model is explicitly specified.
   * @default 'medium'
   */
  effort: AgentEffort
  /**
   * Model to use for the review. If not specified, a model will be chosen based on the effort level.
   */
  model?: string
  /**
   * Time limit for output generation.
   * When work is detected, the timeout is reset.
   * @default 120_000 (2 minutes)
   */
  timeOutMs: number
  tools: {
    /**
     * Maximum number of tool calls allowed during the review process.
     * When the limit is reached, the agent will stop making tool calls and proceed with the review based on the information it has.
     * @default 30
     */
    maxCalls: number
    /**
     * Maximum runtime for each tool call.
     * @default 60_000 (60 seconds)
     */
    maxRuntimeMs: number
  }
  /**
   * Agent to use for pull request review.
   * @default 'github-copilot'
   */
  agent?: 'github-copilot'
}

const DEFAULT_CONFIGURATION = {
  effort: 'medium',
  timeOutMs: 120_000,
  tools: {
    maxCalls: 30,
    maxRuntimeMs: 60_000,
  },
  agent: 'github-copilot',
} as const satisfies PullRequestAgentConfiguration

export type PullRequestAgentOptions = DeepOptional<Omit<PullRequestAgentConfiguration, 'agent'>>

export type PullRequestReviewFn = () => Promise<void>
export type PullReviewAgentFactory = (options: PullRequestAgentConfiguration) => PullRequestReviewFn | Promise<PullRequestReviewFn>

async function getPullRequestAgent(options: PullRequestAgentOptions): Promise<PullRequestReviewFn> {
  const config: PullRequestAgentConfiguration = defu(options, DEFAULT_CONFIGURATION)

  const { agent, ...profile } = config

  switch (agent) {
    case 'github-copilot':
      return githubCopilotAgent(profile)
    default:
      throw new Error(`Unsupported agent: ${agent}`)
  }
}

export async function reviewPullRequest(options: PullRequestAgentOptions): Promise<void> {
  const review = await getPullRequestAgent(options)
  await review()
}
