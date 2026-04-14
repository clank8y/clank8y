import type { Clank8yMode } from '../modeSelection'
import type { Clank8yMCPServers } from '../mcp'
import { getIncidentFixModeRuntime } from './incidentFix'
import { getReviewModeRuntime } from './review'
import { getSelectModeRuntime } from './selectMode'
import { getTaskModeRuntime } from './task'

export interface Clank8yModeRuntime {
  prompt: string
  mcps: Clank8yMCPServers
}

export { getSelectModeRuntime }

export function getModeRuntime(mode: Clank8yMode, promptContext: string): Clank8yModeRuntime {
  switch (mode) {
    case 'Review':
      return getReviewModeRuntime(promptContext)
    case 'Task':
      return getTaskModeRuntime(promptContext)
    case 'IncidentFix':
      return getIncidentFixModeRuntime(promptContext)
    default:
      throw new Error(`Unsupported clank8y mode: ${mode satisfies never}`)
  }
}
