import type { Clank8yMCPServers } from '../../../mcp'
import { angularMCP } from '../../../mcp/angular'
import { codexMCP } from '../../../mcp/codex'
import { incidentFixGitHubMCP } from './github'

export function incidentFixMCPs(): Clank8yMCPServers {
  return {
    github: incidentFixGitHubMCP(),
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
