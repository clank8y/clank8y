import { angularMCP } from '../../../mcp/angular'
import { codexMCP } from '../../../mcp/codex'
import type { Clank8yMCPServers } from '../../../mcp'
import { reviewGitHubMCP } from './github'

export function reviewMCPs(): Clank8yMCPServers {
  return {
    github: reviewGitHubMCP(),
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
