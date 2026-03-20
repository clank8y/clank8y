import type { Clank8yAgent, Clank8yAgentFactory } from '..'
import { consola } from 'consola'
import {
  ensureCopilotModelAvailable,
  getCopilotClient,
} from './../copilot/client'
import { selectCopilotMode } from './../copilot/selectMode'
import { runCopilotReview } from './review'

export const COPILOT_AGENT_NAME = 'github-copilot'

export const githubCopilotAgent: Clank8yAgentFactory = async (profile) => {
  const agentName = COPILOT_AGENT_NAME
  await ensureCopilotModelAvailable(profile.model)

  const clank8yAgent: Clank8yAgent = {
    name: agentName,
    selectMode: (selectModeOptions) => selectCopilotMode({
      model: profile.model,
      prompt: selectModeOptions.prompt,
      mcp: selectModeOptions.mcp,
      timeoutMs: profile.tools.maxRuntimeMs,
    }),
    run: async ({ mode, prompt, mcps }) => {
      switch (mode) {
        case 'Review':
          await runCopilotReview(prompt, profile, mcps)
          break
        case 'IncidentFix':
          throw new Error('IncidentFix is not wired into the GitHub Copilot agent yet. Revisit Copilot permission handling and available tool restrictions before enabling it here.')
        default:
          throw new Error(`Unsupported mode for GitHub Copilot agent: ${mode satisfies never}`)
      }
    },
    cleanup: async () => {
      // ensure any running sessions are cleaned up
      const client = await getCopilotClient()
      // If normal stop hangs, force stop
      const stopPromise = client.stop()
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000)
      })

      try {
        await Promise.race([stopPromise, timeout])
      } catch {
        consola.warn('Normal stop timed out, forcing stop...')
        await client.forceStop()
      }
    },
  }

  return clank8yAgent
}
