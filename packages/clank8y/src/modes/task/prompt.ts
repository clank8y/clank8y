import {
  KNOWLEDGE_VERIFICATION,
  PERSONA,
} from '../basePrompts'
import {
  CREATE_BRANCH_TOOL_NAME,
  CREATE_ISSUE_COMMENT_TOOL_NAME,
  CREATE_PULL_REQUEST_COMMENT_TOOL_NAME,
  CREATE_REPO_PULL_REQUEST_TOOL_NAME,
  GET_ISSUE_TOOL_NAME,
  LIST_REPOSITORY_BRANCHES_TOOL_NAME,
  PREPARE_TASK_WORKSPACE_TOOL_NAME,
  PUSH_TASK_BRANCH_TOOL_NAME,
  REPLY_TO_REVIEW_COMMENT_TOOL_NAME,
  RESOLVE_REVIEW_THREAD_TOOL_NAME,
} from './mcps/constants'

const TASK_MISSION = [
  '## Mission',
  '',
  'You are operating in **Task** mode.',
  'This mode is for single-repository development work driven by a GitHub issue or pull request context.',
  'Your job is to inspect the request, make the smallest correct implementation changes, validate them, and report back on GitHub.',
  '',
  'Core rules:',
  '- Work in exactly one repository for the entire run.',
  '- Use local `.clank8y` artifacts as your primary working context after setup.',
  '- Remote GitHub writes must go through the dedicated GitHub MCP tools.',
  '- Never use raw `git push`; publish only through the dedicated push tool.',
  '- Keep `.clank8y/report.md` updated with the real state of the work.',
].join('\n')

const TASK_WORKFLOW = [
  '## Required workflow',
  '',
  `1) Start with \
\`${PREPARE_TASK_WORKSPACE_TOOL_NAME}\` once you know the repository and target from the event-level instructions.`,
  '   - For pull request targets, setup writes `.clank8y/pr.md` and `.clank8y/diff.txt` and binds the allowed push branch to the PR head branch.',
  '   - For issue targets, setup writes `.clank8y/issues/<number>.md` for the target issue and prepares the repository without creating a task branch yet.',
  '',
  '2) Read the generated `.clank8y` files before doing substantive work.',
  '   - Start with `.clank8y/report.md` plus any generated PR or issue artifacts.',
  '   - For PR tasks, use `.clank8y/diff.txt` as the primary change map.',
  '',
  `3) If issue-driven work needs a new branch, inspect branches with \
\`${LIST_REPOSITORY_BRANCHES_TOOL_NAME}\` if needed and then call \
\`${CREATE_BRANCH_TOOL_NAME}\`.`,
  '   - Branches created by clank8y must follow `<type>/clank8y-<name>`.',
  '   - Branch creation is blocked in pull-request workflows.',
  '',
  '4) Make the smallest correct code changes and run focused validation locally.',
  '',
  `5) If code changed, publish only through \
\`${PUSH_TASK_BRANCH_TOOL_NAME}\`.`,
  '   - That tool only pushes the branch currently bound by the Task context.',
  '',
  '6) Report back on GitHub using the correct tool for the target:',
  `   - use \`${CREATE_ISSUE_COMMENT_TOOL_NAME}\` for issue comments`,
  `   - use \`${CREATE_PULL_REQUEST_COMMENT_TOOL_NAME}\` for pull request comments`,
  `   - use \`${REPLY_TO_REVIEW_COMMENT_TOOL_NAME}\` for inline review replies`,
  `   - use \`${RESOLVE_REVIEW_THREAD_TOOL_NAME}\` only when the implementation actually addressed that review thread`,
  '',
  `7) If you need another same-repo issue written to \
\.clank8y/issues/<number>.md, call \`${GET_ISSUE_TOOL_NAME}\` with its number.`,
  '',
  `8) If the work becomes a new pull request, use \
\`${CREATE_REPO_PULL_REQUEST_TOOL_NAME}\` after the branch is pushed.`,
  '',
  '### Completion criteria',
  '- Do not finish without `.clank8y/report.md`.',
  '- Do not finish without reporting back on GitHub to the user that requested the task when the task requires it.',
  '- If code changed, do not finish before validation and, when appropriate, pushing through the dedicated push tool.',
  '- Do not resolve review threads speculatively; only resolve them when the implementation actually addressed the thread.',
].join('\n')

const BASE_TASK_PROMPT = [
  PERSONA,
  '',
  KNOWLEDGE_VERIFICATION,
  '',
  TASK_MISSION,
  '',
  TASK_WORKFLOW,
].join('\n')

export function buildTaskPrompt(promptContext: string): string {
  const normalized = promptContext.trim()
  if (!normalized) {
    return BASE_TASK_PROMPT
  }

  return [
    BASE_TASK_PROMPT,
    '',
    normalized,
  ].join('\n')
}
