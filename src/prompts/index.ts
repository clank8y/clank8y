import type { Clank8yMode } from '../modeSelection'
import { buildReviewPrompt } from './review'

export { buildModeSelectionPrompt } from './selectMode'

export function buildPrompt(mode: Clank8yMode, promptContext: string): string {
  switch (mode) {
    case 'Review':
      return buildReviewPrompt(promptContext)
    default:
      throw new Error(`Unsupported clank8y mode: ${mode satisfies never}`)
  }
}
