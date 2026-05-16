import { getModel } from '@earendil-works/pi-ai'
import type { Model } from '@earendil-works/pi-ai'
import type { AgentTool } from '@earendil-works/pi-agent-core'
import consola from 'consola'
import { logAgentMessage } from '../logging'
import type { Clank8yDisabledModes, Clank8yMode, Clank8yModeSelection } from '../modeSelection'
import type { ExternalMcpServers } from '../tools/external'
import { getModeRuntime, getSelectModeRuntime } from '../modes'
import { initializeResourcesArtifact, resetClank8yArtifacts, writePromptArtifact } from '../utils/artifacts'
import { piAgent } from './pi'

export type Models = Model<any> | string

interface Clank8yAgentConfiguration {
  /**
   * Model to use for the run.
   * @default Pi model object for claude-sonnet-4-20250514
   */
  model: Model<any>
  /**
   * Time limit for the entire clank8y run.
   * @default 1_200_000 (20 minutes)
   */
  timeOutMs: number
  /**
   * Modes disabled for this run.
   * @default {}
   */
  disabledModes: Clank8yDisabledModes
}

const DEFAULT_CONFIGURATION = {
  model: getModel('anthropic', 'claude-sonnet-4-20250514'),
  timeOutMs: 1_200_000,
  disabledModes: {},
} as const satisfies Clank8yAgentConfiguration

export interface Clank8yAgentOptions {
  /**
   * Pi model object or a `provider:model-id` string resolved through Pi's model registry.
   */
  model?: Models
  timeOutMs?: number
  disabledModes?: Clank8yDisabledModes
}

export interface Clank8yRunInput {
  mode: Clank8yMode
  prompt: string
  externalMcpServers: ExternalMcpServers
  tools?: AgentTool[]
}

export interface SelectModeOptions {
  prompt: string
  tools: AgentTool[]
}

export interface Clank8yAgent {
  name: string
  selectMode: (options: SelectModeOptions) => Promise<void>
  run: (input: Clank8yRunInput) => Promise<void>
  cleanup?: () => Promise<void>
}

export type Clank8yProfile = Clank8yAgentConfiguration

export type Clank8yAgentFactory = (options: Clank8yProfile) => Clank8yAgent

function modelFromInput(model: Models | undefined): Model<any> {
  if (!model) {
    return DEFAULT_CONFIGURATION.model
  }

  if (typeof model !== 'string') {
    return model
  }

  const colonIndex = model.indexOf(':')
  if (colonIndex <= 0 || colonIndex === model.length - 1) {
    throw new Error(`Invalid model '${model}'. Use provider:model-id format.`)
  }

  return getModel(model.slice(0, colonIndex) as any, model.slice(colonIndex + 1) as any)
}

function getClank8y(options: Clank8yAgentOptions): { agent: Clank8yAgent, profile: Clank8yProfile } {
  const profile: Clank8yProfile = {
    model: modelFromInput(options.model),
    timeOutMs: options.timeOutMs ?? DEFAULT_CONFIGURATION.timeOutMs,
    disabledModes: options.disabledModes ?? DEFAULT_CONFIGURATION.disabledModes,
  }

  return {
    agent: piAgent(profile),
    profile,
  }
}

export async function executeClank8yAgent(options: Clank8yAgentOptions & { promptContext: string }): Promise<Clank8yModeSelection> {
  const { agent, profile } = getClank8y(options)

  await resetClank8yArtifacts()
  consola.success('Reset .clank8y artifacts directory.')

  const {
    tools: selectionTools,
    getSelection,
    prompt: selectModePrompt,
  } = getSelectModeRuntime(options.promptContext, profile.disabledModes)

  await agent.selectMode({
    prompt: selectModePrompt,
    tools: selectionTools,
  })

  const selection = getSelection()

  if (!selection) {
    throw new Error('Mode selection failed: the model did not provide a valid clank8y mode selection.')
  }

  if (profile.disabledModes[selection.mode] === true) {
    throw new Error(`Mode selection failed: selected mode '${selection.mode}' is not enabled for this run.`)
  }

  const { prompt, externalMcpServers, tools } = getModeRuntime(selection.mode, options.promptContext)

  await writePromptArtifact(prompt)
  consola.success('Wrote .clank8y/prompt.md.')

  if (selection.mode === 'IncidentFix') {
    await initializeResourcesArtifact()
    consola.success('Initialized .clank8y/resources.md.')
  }

  logAgentMessage({
    agent: agent.name,
    model: profile.model.id,
  }, `Selected mode: ${selection.mode}\nMode selection reason: ${selection.reason}`)

  logAgentMessage({
    agent: agent.name,
    model: profile.model.id,
  }, [
    `mode: ${selection.mode}`,
    '',
    options.promptContext,
  ])

  await agent.run({
    mode: selection.mode,
    prompt,
    externalMcpServers,
    tools,
  })

  await agent.cleanup?.()

  return selection
}
