export interface RepositoryContext {
  owner: string
  repo: string
}

export interface RunInfo {
  runner: 'github-action'
  id: number
  url: string
}

export interface Clank8yRuntimeContext {
  promptContext: string
  auth: {
    githubToken: string
    copilotToken: string
  }
  // Added by the GitHub Actions wrapper when the current execution has a workflow run URL.
  runInfo?: RunInfo
  options?: {
    suppressModelListing?: boolean
  }
}

let _runtimeContext: Clank8yRuntimeContext | null = null

function requireRuntimeContext(): Clank8yRuntimeContext {
  if (!_runtimeContext) {
    throw new Error('Clank8y runtime context is not initialized. Call setClank8yRuntimeContext first.')
  }

  return _runtimeContext
}

function normalizeRuntimeContext(context: Clank8yRuntimeContext): Clank8yRuntimeContext {
  if (!context.promptContext.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty promptContext.')
  }

  if (!context.auth.githubToken.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty auth.githubToken.')
  }

  if (!context.auth.copilotToken.trim()) {
    throw new Error('Clank8y runtime context requires a non-empty auth.copilotToken.')
  }

  return {
    ...context,
    promptContext: context.promptContext.trim(),
    auth: {
      githubToken: context.auth.githubToken.trim(),
      copilotToken: context.auth.copilotToken.trim(),
    },
  }
}

export function setClank8yRuntimeContext(context: Clank8yRuntimeContext): void {
  _runtimeContext = normalizeRuntimeContext(context)
}

export function getClank8yRuntimeContext(): Clank8yRuntimeContext {
  return requireRuntimeContext()
}

export function resetClank8yRuntimeContextForTests(): void {
  _runtimeContext = null
}
