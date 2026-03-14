import { PERSONA } from './prompt'

export const MODE_SELECTION_TOOL_NAME = 'select-clank8y-mode'
export const MODE_SELECTION_TOOL_TITLE = 'Select clank8y mode'
export const MODE_SELECTION_TOOL_DESCRIPTION = 'Select the best clank8y execution mode for the current instructions. Call this exactly once with the chosen mode and a concise reason.'

const MODE_SELECTION_WORKFLOW = [
  '## Mode selection',
  '',
  'You are choosing the best clank8y execution mode for this run.',
  `Call \`${MODE_SELECTION_TOOL_NAME}\` exactly once with a valid mode and a concise reason.`,
  `Tool intent: ${MODE_SELECTION_TOOL_DESCRIPTION}`,
  'Choose `Review` when the instructions are about pull request review.',
  'Do not do any other work in this step.',

].join('\n')

const BASE_MODE_SELECTION_PROMPT = [
  PERSONA,
  '',
  MODE_SELECTION_WORKFLOW,
].join('\n')

export function buildModeSelectionPrompt(promptContext: string): string {
  const normalizedPromptContext = promptContext.trim()
  if (!normalizedPromptContext) {
    return BASE_MODE_SELECTION_PROMPT
  }

  return [
    BASE_MODE_SELECTION_PROMPT,
    '',
    normalizedPromptContext,
  ].join('\n')
}
