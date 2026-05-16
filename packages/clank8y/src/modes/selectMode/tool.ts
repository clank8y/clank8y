import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import { Type } from '@earendil-works/pi-ai'
import type { TSchema } from 'typebox'
import { CLANK8Y_MODES, MODE_SELECTION_TOOL_DESCRIPTION, MODE_SELECTION_TOOL_NAME, MODE_SELECTION_TOOL_TITLE } from '../../modeSelection'
import type { Clank8yDisabledModes, Clank8yMode, Clank8yModeSelection } from '../../modeSelection'

export interface SelectModeToolRuntime {
  tools: AgentTool[]
  getSelection: () => Clank8yModeSelection | null
}

const MODE_DESCRIPTIONS: Record<Clank8yMode, string> = {
  Review: 'Review: choose this for pull request review in a repository context.',
  Task: 'Task: choose this for single-repository development work such as addressing requested changes on an issue or pull request, making local edits, validating them, and reporting back on GitHub.',
  IncidentFix: 'IncidentFix: choose this for sandboxed incident investigation or deep-fix workflows that may inspect one or more repositories and produce a .clank8y/report.md artifact.',
}

function createModeSelectionParameters(disabledModes: Clank8yDisabledModes): TSchema {
  const enabledModes = CLANK8Y_MODES.filter((mode) => disabledModes[mode] !== true)
  if (enabledModes.length === 0) {
    throw new Error('No clank8y modes are enabled for this run.')
  }

  const modeSchemas = enabledModes.map((mode) => Type.Literal(mode, {
    description: MODE_DESCRIPTIONS[mode],
  }))
  const modeSchema = modeSchemas.length === 1
    ? modeSchemas[0] as TSchema
    : Type.Union(modeSchemas as unknown as [TSchema, TSchema, ...TSchema[]])

  return Type.Object({
    mode: modeSchema,
    reason: Type.String({
      minLength: 1,
      description: 'A concise explanation for why this mode fits the current run.',
    }),
  }, {
    additionalProperties: false,
    description: MODE_SELECTION_TOOL_DESCRIPTION,
  })
}

export function createSelectModeToolRuntime(disabledModes: Clank8yDisabledModes): SelectModeToolRuntime {
  let selection: Clank8yModeSelection | null = null

  const selectionTool: AgentTool = {
    name: MODE_SELECTION_TOOL_NAME,
    label: MODE_SELECTION_TOOL_TITLE,
    description: MODE_SELECTION_TOOL_DESCRIPTION,
    parameters: createModeSelectionParameters(disabledModes),
    execute: async (_toolCallId, params): Promise<AgentToolResult<Clank8yModeSelection>> => {
      selection = params as Clank8yModeSelection

      return {
        content: [{ type: 'text', text: `${MODE_SELECTION_TOOL_TITLE} received: ${selection.mode}.` }],
        details: selection,
        terminate: true,
      }
    },
  }

  return {
    tools: [selectionTool],
    getSelection: () => selection,
  }
}
