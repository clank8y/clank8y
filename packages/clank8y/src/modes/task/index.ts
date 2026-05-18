import type { Clank8yModeRuntime } from '..'
import { resetTaskContext } from './context'
import { taskExternalMcpServers } from './externalMcpServers'
import { taskGitHubTools } from './tools/github'
import { buildTaskPrompt } from './prompt'
import { taskBuiltinTools } from '../../tools/piBuiltins'

export function getTaskModeRuntime(promptContext: string): Clank8yModeRuntime {
  resetTaskContext()

  return {
    prompt: buildTaskPrompt(promptContext),
    externalMcpServers: taskExternalMcpServers(),
    tools: [
      ...taskBuiltinTools(),
      ...taskGitHubTools(),
    ],
  }
}
