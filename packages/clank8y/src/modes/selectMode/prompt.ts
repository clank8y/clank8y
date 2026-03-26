import { MODE_SELECTION_TOOL_DESCRIPTION, MODE_SELECTION_TOOL_NAME } from '../../modeSelection'

const MODE_SELECTION_WORKFLOW = [
  '## Mode selection',
  '',
  'You are an agent for choosing the best clank8y execution mode for this run.',
  `Call \`${MODE_SELECTION_TOOL_NAME}\` exactly once with a valid mode and a concise reason.`,
  `Tool intent: ${MODE_SELECTION_TOOL_DESCRIPTION}`,
  'Use the tool schema descriptions for the exact meaning of each selectable mode.',
  'Do not do any other work in this step.',
]

export function buildModeSelectionPrompt(promptContext: string): string {
  const basePrompt = MODE_SELECTION_WORKFLOW.join('\n')

  const normalized = promptContext.trim()
  if (!normalized) {
    return basePrompt
  }

  return [
    basePrompt,
    '',
    'Here is the prompt context for this run:',
    normalized,
  ].join('\n')
}
