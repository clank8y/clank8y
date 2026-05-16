import type { RemoteHttpMcpServer } from '.'

const CODEX_MCP_URL = 'https://c8y-codex-mcp.schplitt.workers.dev/mcp'
const CODEX_TOOL_NAMES = [
  'get-codex-structure',
  'query-codex',
  'get-codex-documents',
]

let _codexMCP: RemoteHttpMcpServer | null = null

export function codexMCP(): RemoteHttpMcpServer {
  if (!_codexMCP) {
    _codexMCP = createCodexMCP()
  }
  return _codexMCP
}

function createCodexMCP(): RemoteHttpMcpServer {
  return {
    serverType: 'http',
    toolNames: CODEX_TOOL_NAMES,
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
