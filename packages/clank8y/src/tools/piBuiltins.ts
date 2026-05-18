import process from 'node:process'
import type { AgentTool } from '@earendil-works/pi-agent-core'
import { createCodingTools, createReadOnlyTools } from '@earendil-works/pi-coding-agent'

// TODO: Re-root Pi built-ins away from process.cwd().
// Right now this works because clank8y stores all local state under `.clank8y/`
// inside the run cwd, so the agent can still access:
// - `.clank8y/report.md`
// - `.clank8y/diff.txt`
// - `.clank8y/repos/<owner>/<repo>/...`
//
// But this also means the agent has to explicitly navigate into `.clank8y/...`
// instead of getting a tighter workspace root automatically.
//
// Preferred follow-up:
// - root Review tools at `.clank8y`
// - root Task/IncidentFix tools at the active prepared repository path once setup ran
function getWorkspaceRoot(): string {
  return process.cwd()
}

export function taskBuiltinTools(): AgentTool[] {
  return createCodingTools(getWorkspaceRoot())
}

export function incidentFixBuiltinTools(): AgentTool[] {
  return createCodingTools(getWorkspaceRoot())
}

export function reviewBuiltinTools(): AgentTool[] {
  return createReadOnlyTools(getWorkspaceRoot())
}
