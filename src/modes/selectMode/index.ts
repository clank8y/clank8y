import { buildModeSelectionPrompt } from './prompt'
import { createSelectModeMCPRuntime } from './mcps'

export function getSelectModeRuntime(promptContext: string) {
  const runtime = createSelectModeMCPRuntime()

  return {
    prompt: buildModeSelectionPrompt(promptContext),
    ...runtime,
  }
}
