import type { StdioMcpServer } from '.'

const ANGULAR_MCP_COMMAND = 'npx'
const ANGULAR_MCP_ARGS = ['-y', '@angular/cli', 'mcp']

/**
 * Tools exposed from the Angular CLI MCP server.
 * - `find_examples`       — authoritative Angular code examples (local)
 * - `get_best_practices`  — Angular best practices guide (local)
 * - `search_documentation`— searches angular.dev (remote)
 */
const ANGULAR_TOOL_NAMES = [
  'find_examples',
  'get_best_practices',
  'search_documentation',
]

let _angularMCP: StdioMcpServer | null = null

export function angularMCP(): StdioMcpServer {
  if (!_angularMCP) {
    _angularMCP = createAngularMCP()
  }
  return _angularMCP
}

function createAngularMCP(): StdioMcpServer {
  let status: StdioMcpServer['status'] = { state: 'stopped' }

  return {
    serverType: 'stdio',
    toolNames: ANGULAR_TOOL_NAMES,
    get status() {
      return status
    },
    start: async () => {
      status = { state: 'running' }
      return {
        command: ANGULAR_MCP_COMMAND,
        args: ANGULAR_MCP_ARGS,
        toolNames: ANGULAR_TOOL_NAMES,
      }
    },
    stop: async () => {
      // The active Pi MCP adapter connection owns the child process — resetting local declaration state only.
      status = { state: 'stopped' }
    },
  }
}
