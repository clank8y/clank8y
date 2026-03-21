import { executeClank8yAgent } from './agents'
import type { Clank8yAgentOptions, Models } from './agents'
import {
  getClank8yRuntimeContext,
  setClank8yRuntimeContext,
} from './setup'
import type { Clank8yRuntimeContext } from './setup'

export interface Clank8yRunResult {
  status: 'completed'
  mode: string
  summary: string
}

export interface RunClank8yOptions extends Clank8yAgentOptions, Clank8yRuntimeContext {}

export async function runClank8y(options: RunClank8yOptions): Promise<Clank8yRunResult> {
  const runtimeContextInput: Clank8yRuntimeContext = {
    promptContext: options.promptContext,
    auth: options.auth,
    runInfo: options.runInfo,
    options: options.options,
  }

  setClank8yRuntimeContext(runtimeContextInput)

  const runtimeContext = getClank8yRuntimeContext()
  const selection = await executeClank8yAgent({
    promptContext: runtimeContext.promptContext,
    disabledModes: options.disabledModes,
    model: options.model,
    timeOutMs: options.timeOutMs,
    tools: options.tools,
  })

  // TODO: decide waht to give back from model
  return {
    status: 'completed',
    mode: selection.mode,
    summary: `clank8y completed in mode '${selection.mode}'.`,
  }
}

export type { Clank8yAgentOptions, Clank8yRuntimeContext, Models }
