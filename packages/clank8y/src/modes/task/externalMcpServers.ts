import { angularMCP } from '../../tools/external/angular'
import { codexMCP } from '../../tools/external/codex'
import type { ExternalMcpServers } from '../../tools/external'

export function taskExternalMcpServers(): ExternalMcpServers {
  return {
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
