import type { Clank8yMode } from '../modeSelection'
import type { Clank8yMCPServers } from '../mcp'
import { getReviewModeRuntime } from './review'
import { getSelectModeRuntime } from './selectMode'

export interface Clank8yModeRuntime {
  prompt: string
  mcps: Clank8yMCPServers
}

export { getSelectModeRuntime }

export function getModeRuntime(mode: Clank8yMode, promptContext: string): Clank8yModeRuntime {
  switch (mode) {
    case 'Review':
      return getReviewModeRuntime(promptContext)
    default:
      throw new Error(`Unsupported clank8y mode: ${mode satisfies never}`)
  }
}
