import { defu } from 'defu'
import { consola } from 'consola'
import { logAgentMessage } from '../logging'
import { buildReviewPrompt } from '../prompt'
import { getPullRequestReviewContext } from '../setup'
import type { DeepOptional } from '../types'
import { githubCopilotAgent } from './copilot'
import type { Clank8yMode, Clank8yModeSelection } from './modes'

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

interface Clank8yAgentConfiguration {
  /**
   * Model to use for the run.
   * @default 'claude-sonnet-4.6'
   */
  model: Models | (string & {})
  /**
   * Time limit for the entire clank8y run.
   * @default 1_200_000 (20 minutes)
   */
  timeOutMs: number
  tools: {
    /**
     * Maximum number of tool calls allowed during the review process.
     * When the limit is reached, the agent will stop making tool calls and proceed with the review based on the information it has.
     * @default 60
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
  agent: 'github-copilot'
}

const DEFAULT_CONFIGURATION = {
  model: 'claude-sonnet-4.6',
  timeOutMs: 1_200_000,
  tools: {
    maxCalls: 60,
    maxRuntimeMs: 60_000,
  },
  agent: 'github-copilot',
} as const satisfies Clank8yAgentConfiguration

export type Clank8yAgentOptions = DeepOptional<Omit<Clank8yAgentConfiguration, 'agent'>>

export interface Clank8yRunInput {
  mode: Clank8yMode
  prompt: string
}

export interface Clank8yAgent {
  name: string
  provider: string
  model: string
  selectMode: (prompt: string) => Promise<Clank8yModeSelection>
  run: (input: Clank8yRunInput) => Promise<void>
}

export type Clank8yAgentFactory = (options: Omit<Clank8yAgentConfiguration, 'agent'>) => Clank8yAgent | Promise<Clank8yAgent>

async function getClank8yAgent(options: Clank8yAgentOptions): Promise<Clank8yAgent> {
  const config = defu<Clank8yAgentConfiguration, [Clank8yAgentOptions]>(options, DEFAULT_CONFIGURATION) as Clank8yAgentConfiguration

  const { agent, ...profile } = config

  switch (agent) {
    case 'github-copilot':
      return githubCopilotAgent(profile)
    default:
      throw new Error(`Unsupported agent: ${agent}`)
  }
}

function buildClank8yPrompt(mode: Clank8yMode, promptContext: string): string {
  switch (mode) {
    case 'Review':
      return buildReviewPrompt(promptContext)
    default:
      throw new Error(`Unsupported clank8y mode: ${mode satisfies never}`)
  }
}

export async function runClank8y(options: Clank8yAgentOptions): Promise<void> {
  const agent = await getClank8yAgent(options)
  const context = await getPullRequestReviewContext()
  const selection = await agent.selectMode(context.promptContext)
  const prompt = buildClank8yPrompt(selection.mode, context.promptContext)

  consola.info(`Selected mode: ${selection.mode}`)
  consola.info(`Mode selection reason: ${selection.reason}`)

  logAgentMessage({
    agent: agent.provider,
    model: agent.model,
  }, [
    `repository: ${context.repository.owner}/${context.repository.repo}`,
    `mode: ${selection.mode}`,
    '',
    context.promptContext,
  ])

  await agent.run({
    mode: selection.mode,
    prompt,
  })
}
