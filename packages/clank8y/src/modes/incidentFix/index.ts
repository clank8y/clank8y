import type { Clank8yModeRuntime } from '..'
import { incidentFixMCPs } from './mcps'
import { buildIncidentFixPrompt } from './prompt'

export { incidentFixMCPs } from './mcps'
export { buildIncidentFixPrompt } from './prompt'

export function getIncidentFixModeRuntime(promptContext: string): Clank8yModeRuntime {
  return {
    prompt: buildIncidentFixPrompt(promptContext),
    mcps: incidentFixMCPs(),
  }
}
