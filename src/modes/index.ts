import type { Clank8yMode } from '../modeSelection'
import { buildReviewModePrompt } from './review'

export interface Clank8yModeDefinition {
  buildPrompt: (promptContext: string) => string
}

export function getModeDefinition(mode: Clank8yMode): Clank8yModeDefinition {
  switch (mode) {
    case 'Review':
      return {
        buildPrompt: buildReviewModePrompt,
      }
    default:
      throw new Error(`Unsupported clank8y mode: ${mode satisfies never}`)
  }
}
