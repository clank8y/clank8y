import { PREPARE_TASK_WORKSPACE_TOOL_NAME } from './mcps/constants'

export interface TaskContext {
  allowedPushBranch: string | null
  baseBranch: string
  branchCreationAllowed: boolean
  defaultBranch: string
  repositoryPath: string
  target: { kind: 'issue', issueNumber: number } | { kind: 'pull_request', pullRequestNumber: number }
  repository: { owner: string, repo: string }
}

let activeTaskContext: TaskContext | null = null

export function resetTaskContext(): void {
  activeTaskContext = null
}

export function setTaskContext(context: TaskContext): TaskContext {
  activeTaskContext = context
  return context
}

export function updateTaskContext(context: Partial<Pick<TaskContext, 'allowedPushBranch' | 'branchCreationAllowed'>>): TaskContext {
  if (!activeTaskContext) {
    throw new Error(`Task context is not initialized. Call ${PREPARE_TASK_WORKSPACE_TOOL_NAME} first.`)
  }

  activeTaskContext = {
    ...activeTaskContext,
    ...context,
  }

  return activeTaskContext
}

export function getActiveTaskContext(): TaskContext {
  if (!activeTaskContext) {
    throw new Error(`Task context is not initialized. Call ${PREPARE_TASK_WORKSPACE_TOOL_NAME} first.`)
  }

  return activeTaskContext
}
