import { buildReviewPrompt } from '../prompts/review'

export function buildReviewModePrompt(promptContext: string): string {
  return buildReviewPrompt(promptContext)
}
