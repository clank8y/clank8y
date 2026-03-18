import { MODE_SELECTION_TOOL_DESCRIPTION, MODE_SELECTION_TOOL_NAME } from '../../modeSelection'

const MODE_SELECTION_WORKFLOW = [
  '## Mode selection',
  '',
  'You are an agent for choosing the best clank8y execution mode for this run.',
  `Call \`${MODE_SELECTION_TOOL_NAME}\` exactly once with a valid mode and a concise reason.`,
  `Tool intent: ${MODE_SELECTION_TOOL_DESCRIPTION}`,
  'Choose `Review` when the instructions are about pull request review.',
  'Do not do any other work in this step.',
].join('\n')

const BASE_MODE_SELECTION_PROMPT = [
  MODE_SELECTION_WORKFLOW,
].join('\n')

export function buildModeSelectionPrompt(promptContext: string): string {
  const normalized = promptContext.trim()
  if (!normalized) {
    return BASE_MODE_SELECTION_PROMPT
  }

  return [
    BASE_MODE_SELECTION_PROMPT,
    '',
    'Here is the prompt context for this run:',
    normalized,
  ].join('\n')
}
