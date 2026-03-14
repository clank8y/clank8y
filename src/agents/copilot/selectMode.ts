import { defineTool } from '@github/copilot-sdk'
import type { CopilotClient } from '@github/copilot-sdk'
import { toJsonSchema } from '@valibot/to-json-schema'
import { clank8yModeSelectionSchema } from '../modes'
import type { Clank8yModeSelection } from '../modes'
import {
  buildModeSelectionPrompt,
  MODE_SELECTION_TOOL_DESCRIPTION,
  MODE_SELECTION_TOOL_NAME,
  MODE_SELECTION_TOOL_TITLE,
} from '../../modeSelection'
import {
  COPILOT_EXCLUDED_TOOLS,
  createCopilotPermissionHandler,
} from './client'

export async function selectCopilotMode(options: {
  client: CopilotClient
  model: string
  prompt: string
}): Promise<Clank8yModeSelection> {
  let selection: Clank8yModeSelection | null = null

  const session = await options.client.createSession({
    model: options.model,
    excludedTools: COPILOT_EXCLUDED_TOOLS,
    onPermissionRequest: createCopilotPermissionHandler(),
    tools: [
      defineTool<Clank8yModeSelection>(MODE_SELECTION_TOOL_NAME, {
        description: MODE_SELECTION_TOOL_DESCRIPTION,
        parameters: toJsonSchema(clank8yModeSelectionSchema, {
          errorMode: 'warn',
        }) as any,
        handler: async (input) => {
          selection = input
          return {
            success: true,
            message: `${MODE_SELECTION_TOOL_TITLE} received: ${input.mode}.`,
          }
        },
      }),
    ],
  })

  try {
    await session.sendAndWait({
      prompt: buildModeSelectionPrompt(options.prompt),
    })
  } finally {
    await session.disconnect()
  }

  if (!selection) {
    throw new Error('Mode selection failed: the model did not provide a valid clank8y mode selection.')
  }

  return selection
}
