import type { RemoteMCPServer } from '.'

const CODEX_MCP_URL = 'https://c8y-codex-mcp.schplitt.workers.dev/mcp'

let _codexMCP: RemoteMCPServer | null = null

export function codexMCP(): RemoteMCPServer {
  if (!_codexMCP) {
    _codexMCP = createCodexMCP()
  }
  return _codexMCP
}

function createCodexMCP(): RemoteMCPServer {
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
