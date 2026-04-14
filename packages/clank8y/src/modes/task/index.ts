import type { Clank8yModeRuntime } from '..'
import { resetTaskContext } from './context'
import { taskMCPs } from './mcps'
import { buildTaskPrompt } from './prompt'

export function getTaskModeRuntime(promptContext: string): Clank8yModeRuntime {
  resetTaskContext()

  return {
    prompt: buildTaskPrompt(promptContext),
    mcps: taskMCPs(),
  }
}
