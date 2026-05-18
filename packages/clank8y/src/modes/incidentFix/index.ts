import type { Clank8yModeRuntime } from '..'
import { incidentFixExternalMcpServers } from './externalMcpServers'
import { incidentFixGitHubTools } from './tools/github'
import { buildIncidentFixPrompt } from './prompt'
import { incidentFixBuiltinTools } from '../../tools/piBuiltins'

export { incidentFixExternalMcpServers } from './externalMcpServers'
export { buildIncidentFixPrompt } from './prompt'

export function getIncidentFixModeRuntime(promptContext: string): Clank8yModeRuntime {
  return {
    prompt: buildIncidentFixPrompt(promptContext),
    externalMcpServers: incidentFixExternalMcpServers(),
    tools: [
      ...incidentFixBuiltinTools(),
      ...incidentFixGitHubTools(),
    ],
  }
}
