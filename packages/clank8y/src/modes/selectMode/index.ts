import type { Clank8yDisabledModes } from '../../modeSelection'
import { buildModeSelectionPrompt } from './prompt'
import { createSelectModeToolRuntime } from './tool'

export function getSelectModeRuntime(promptContext: string, disabledModes: Clank8yDisabledModes = {}) {
  const runtime = createSelectModeToolRuntime(disabledModes)

  return {
    prompt: buildModeSelectionPrompt(promptContext),
    ...runtime,
  }
}
