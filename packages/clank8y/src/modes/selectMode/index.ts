import type { Clank8yDisabledModes } from '../../modeSelection'
import { buildModeSelectionPrompt } from './prompt'
import { createSelectModeMCPRuntime } from './mcps'

export function getSelectModeRuntime(promptContext: string, disabledModes: Clank8yDisabledModes = {}) {
  const runtime = createSelectModeMCPRuntime({ disabledModes })

  return {
    prompt: buildModeSelectionPrompt(promptContext),
    ...runtime,
  }
}
