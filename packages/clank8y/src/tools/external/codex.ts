import { createRemoteHttpMcpServer } from '.'

const CODEX_MCP_URL = 'https://c8y-codex-mcp.schplitt.workers.dev/mcp'
const CODEX_TOOL_NAMES = [
  'get-codex-structure',
  'query-codex',
  'get-codex-documents',
]

export function codexMCP() {
  return createRemoteHttpMcpServer({
    url: CODEX_MCP_URL,
    toolNames: CODEX_TOOL_NAMES,
  })
}
