import { defu } from 'defu'
import type { DeepOptional } from '../types'
import { githubCopilotAgent } from './copilot'

export type AgentEffort = 'low' | 'medium' | 'high'

export type Models
  = 'claude-sonnet-4.6' | 'claude-sonnet-4.5'
    | 'claude-haiku-4.5' | 'claude-opus-4.6'
    | 'claude-opus-4.6-fast' | 'claude-opus-4.5'
    | 'claude-sonnet-4' | 'gemini-3-pro-preview'
    | 'gpt-5.3-codex' | 'gpt-5.2-codex'
    | 'gpt-5.2' | 'gpt-5.1-codex-max'
    | 'gpt-5.1-codex' | 'gpt-5.1'
    | 'gpt-5.1-codex-mini' | 'gpt-5-mini'
    | 'gpt-4.1'

interface PullRequestAgentConfiguration {
  /**
   * Effort level determines what model to use unless model is explicitly specified.
   * @default 'medium'
   */
  effort: AgentEffort
  /**
   * Model to use for the review. If not specified, a model will be chosen based on the effort level.
   */
  model?: Models | (string & {})
  /**
   * Time limit for the entire pull request review process.
   * @default 240_000 (4 minutes)
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
  timeOutMs: 240_000,
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
  const config = defu<PullRequestAgentConfiguration, [PullRequestAgentConfiguration]>(options, DEFAULT_CONFIGURATION)

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
