import type { ExternalMcpServers } from '../../tools/external'
import { angularMCP } from '../../tools/external/angular'
import { codexMCP } from '../../tools/external/codex'

export function incidentFixExternalMcpServers(): ExternalMcpServers {
  return {
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
