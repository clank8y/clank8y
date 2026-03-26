import { defu } from 'defu'
import { logAgentMessage } from '../logging'
import type { DeepOptional } from '../types'
import type { Clank8yDisabledModes, Clank8yMode, Clank8yModeSelection } from '../modeSelection'
import type { Clank8yMCPServers, LocalHTTPMCPServer } from '../mcp'
import { getModeRuntime, getSelectModeRuntime } from '../modes'
import { githubCopilotAgent } from './copilot'
import { initializeResourcesArtifact, resetClank8yArtifacts, writePromptArtifact } from '../utils/artifacts'
import consola from 'consola'

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
  /**
   * Modes disabled for this run.
   * @default {}
   */
  disabledModes: Clank8yDisabledModes
}

const DEFAULT_CONFIGURATION = {
  model: 'claude-sonnet-4.6',
  timeOutMs: 1_200_000,
  tools: {
    maxCalls: 60,
    maxRuntimeMs: 60_000,
  },
  agent: 'github-copilot',
  disabledModes: {},
} as const satisfies Clank8yAgentConfiguration

export type Clank8yAgentOptions = DeepOptional<Omit<Clank8yAgentConfiguration, 'agent'>>

export interface Clank8yRunInput {
  mode: Clank8yMode
  prompt: string
  mcps: Clank8yMCPServers
}

export interface SelectModeOptions {
  prompt: string
  mcp: LocalHTTPMCPServer
}

export interface Clank8yAgent {
  name: string
  selectMode: (options: SelectModeOptions) => Promise<void>
  run: (input: Clank8yRunInput) => Promise<void>
  cleanup?: () => Promise<void>
}

export type Clank8yProfile = Omit<Clank8yAgentConfiguration, 'agent'>

export type Clank8yAgentFactory = (options: Clank8yProfile) => Clank8yAgent | Promise<Clank8yAgent>

async function getClank8y(options: Clank8yAgentOptions): Promise<{ agent: Clank8yAgent, profile: Clank8yProfile }> {
  const config = defu<Clank8yAgentConfiguration, [Clank8yAgentOptions]>(options, DEFAULT_CONFIGURATION) as Clank8yAgentConfiguration

  const { agent: agentName, ...profile } = config

  let agent: Clank8yAgent | Promise<Clank8yAgent>
  switch (agentName) {
    case 'github-copilot':
      agent = githubCopilotAgent(profile)
      break
    default:
      throw new Error(`Unsupported agent: ${agentName}`)
  }

  agent = await agent

  return {
    agent,
    profile,
  }
}

export async function executeClank8yAgent(options: Clank8yAgentOptions & { promptContext: string }): Promise<Clank8yModeSelection> {
  const { agent, profile } = await getClank8y(options)

  await resetClank8yArtifacts()
  consola.success('Reset .clank8y artifacts directory.')

  const {
    mcp,
    getSelection,
    prompt: selectModePrompt,
  } = getSelectModeRuntime(options.promptContext, profile.disabledModes)

  await mcp.start()

  await agent.selectMode({
    prompt: selectModePrompt,
    mcp,
  })

  await mcp.stop()

  const selection = getSelection()

  if (!selection) {
    throw new Error('Mode selection failed: the model did not provide a valid clank8y mode selection.')
  }

  if (profile.disabledModes[selection.mode] === true) {
    throw new Error(`Mode selection failed: selected mode '${selection.mode}' is not enabled for this run.`)
  }

  const { prompt, mcps } = getModeRuntime(selection.mode, options.promptContext)

  await writePromptArtifact(prompt)
  consola.success('Wrote .clank8y/prompt.md.')

  if (selection.mode === 'IncidentFix') {
    await initializeResourcesArtifact()
    consola.success('Initialized .clank8y/resources.md.')
  }

  logAgentMessage({
    agent: agent.name,
    model: profile.model,
  }, `Selected mode: ${selection.mode}\nMode selection reason: ${selection.reason}`)

  logAgentMessage({
    agent: agent.name,
    model: profile.model,
  }, [
    `mode: ${selection.mode}`,
    '',
    options.promptContext,
  ])

  await agent.run({
    mode: selection.mode,
    prompt,
    mcps,
  })

  await agent.cleanup?.()

  return selection
}
