import type { Clank8yMode } from '../modeSelection'
import type { ExternalMcpServers } from '../tools/external'
import type { AgentTool } from '@earendil-works/pi-agent-core'
import { getIncidentFixModeRuntime } from './incidentFix'
import { getReviewModeRuntime } from './review'
import { getSelectModeRuntime } from './selectMode'
import { getTaskModeRuntime } from './task'

export interface Clank8yModeRuntime {
  prompt: string
  externalMcpServers: ExternalMcpServers
  /**
   * Mode-local Pi SDK tools that are added alongside shared tools and MCP tools.
   */
  tools?: AgentTool[]
}

export type ModeDefinition = Clank8yModeRuntime

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
