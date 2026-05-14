import type { Clank8yMode } from '../modeSelection'
import type { Clank8yMCPServers } from '../mcp'
import type { AgentTool } from '@earendil-works/pi-agent-core'
import { getIncidentFixModeRuntime } from './incidentFix'
import { getReviewModeRuntime } from './review'
import { getSelectModeRuntime } from './selectMode'
import { getTaskModeRuntime } from './task'

export interface Clank8yModeRuntime {
  prompt: string
  mcps: Clank8yMCPServers
}

/**
 * Extended mode runtime that may also declare mode-specific local tools.
 */
export interface ModeDefinition extends Clank8yModeRuntime {
  /**
   * Mode-local Pi SDK tools that are added to the agent alongside the shared
   * tools and tools exposed by the mode's MCP servers.
   * Define these directly as `AgentTool` objects using the Pi SDK's native type.
   */
  tools?: AgentTool[]
}

/**
 * Configuration shape for the modes system.
 * `sharedTools` are always enabled regardless of the active mode.
 */
export interface ClankModesConfig {
  sharedTools: AgentTool[]
  modes: Partial<Record<Clank8yMode, ModeDefinition>>
}

// ─── Shared tools (always active) ────────────────────────────────────────────

/**
 * Returns the Pi SDK tools that are active for every mode.
 * Add `AgentTool` objects here that should be available across all modes.
 */
export function getSharedTools(): AgentTool[] {
  return []
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

/**
 * Lists the tool names that will be active for a given mode.
 *
 * Includes:
 * - All shared tools (from {@link getSharedTools})
 * - All tools declared by the mode's MCP servers (`allowedTools`)
 * - Any mode-local `tools` returned alongside the MCP servers
 * @param mode
 * @param promptContext
 */
export function listModeTools(mode: Clank8yMode, promptContext = ''): string[] {
  const sharedNames = getSharedTools().map((t) => t.name)

  const runtime = getModeRuntime(mode, promptContext)

  const mcpNames = Object.entries(runtime.mcps).flatMap(([serverName, server]) => {
    const { allowedTools } = server
    if (allowedTools[0] === '*') {
      return [`${serverName}/*`]
    }

    return allowedTools.map((n) => `mcp__${serverName}__${n}`)
  })

  const modeLocalNames = (runtime as ModeDefinition).tools?.map((t) => t.name) ?? []

  return [...sharedNames, ...mcpNames, ...modeLocalNames]
}
