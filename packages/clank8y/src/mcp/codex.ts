import type { RemoteHTTPMCPServer } from '.'

const CODEX_MCP_URL = 'https://c8y-codex-mcp.schplitt.workers.dev/mcp'

let _codexMCP: RemoteHTTPMCPServer | null = null

export function codexMCP(): RemoteHTTPMCPServer {
  if (!_codexMCP) {
    _codexMCP = createCodexMCP()
  }
  return _codexMCP
}

function createCodexMCP(): RemoteHTTPMCPServer {
  return {
    serverType: 'http',
    allowedTools: ['*'],
    get status() {
      return { state: 'running' as const }
    },
    start: async () => ({
      url: CODEX_MCP_URL,
      toolNames: [],
    }),
    stop: async () => {},
  }
}
