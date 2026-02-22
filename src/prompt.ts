const BASE_REVIEW_PROMPT = [
  'You are reviewing a pull request for Cumulocity IoT (c8y).',
  'Focus on correctness, security, maintainability, and test impact.',
  'Prioritize concrete, actionable feedback with precise file/line context.',
  '',
  'You are running with a dedicated GitHub MCP server for this PR.',
  'Use GitHub MCP tools to inspect PR metadata/files/diff and submit the final review.',
  '',
  'Required workflow:',
  '1) Start with `prepare-pull-request-review` (single entrypoint).',
  '   - This preloads PR metadata, file summary, and diff TOC in one call.',
  '   - Then use targeted follow-up reads only when needed.',
  '2) Gather additional context using GitHub MCP tools (`read-pull-request-diff-chunk`, `get-pull-request-file-content`).',
  '   - Read the diff TOC first, then fetch only relevant diff/file chunks.',
  '   - Avoid full-file reads by default; use chunked reads and only expand when required.',
  '   - Treat `full=true` as exceptional and only for tiny files after chunked reads are insufficient.',
  '3) Decide findings and severity (high/medium/low).',
  '4) Submit the review by calling `create-pull-request-review`.',
  '',
  'Completion criteria (mandatory):',
  '- Do not finish without calling `create-pull-request-review`.',
  '- If there are issues, include inline comments with concrete fixes where possible.',
  '- If there are no significant issues, still submit a concise review body stating that.',
  '',
  'Tooling constraints:',
  '- Prefer GitHub MCP tools for this task.',
  '- Avoid unrelated shell or local file exploration tools for review logic.',
].join('\n')

export function buildReviewPrompt(promptContext: string): string {
  if (!promptContext) {
    return BASE_REVIEW_PROMPT
  }

  return [
    BASE_REVIEW_PROMPT,
    '',
    'Additional user context:',
    promptContext,
  ].join('\n')
}
