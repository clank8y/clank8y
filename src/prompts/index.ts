import type { Clank8yMode } from '../modeSelection'
import { getModeDefinition } from '../modes'

export { buildModeSelectionPrompt } from './selectMode'

export function buildPrompt(mode: Clank8yMode, promptContext: string): string {
  return getModeDefinition(mode).buildPrompt(promptContext)
}
