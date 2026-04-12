import { angularMCP } from '../../../mcp/angular'
import { codexMCP } from '../../../mcp/codex'
import type { Clank8yMCPServers } from '../../../mcp'
import { taskGitHubMCP } from './github'

export function taskMCPs(): Clank8yMCPServers {
  return {
    github: taskGitHubMCP(),
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
