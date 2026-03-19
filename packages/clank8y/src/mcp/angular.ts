import type { LocalStdioMCPServer } from '.'

const ANGULAR_MCP_COMMAND = 'npx'
const ANGULAR_MCP_ARGS = ['-y', '@angular/cli', 'mcp']

/**
 * Tools exposed from the Angular CLI MCP server.
 * - `find_examples`       — authoritative Angular code examples (local)
 * - `get_best_practices`  — Angular best practices guide (local)
 * - `search_documentation`— searches angular.dev (remote)
 */
const ANGULAR_ALLOWED_TOOLS = [
  'find_examples',
  'get_best_practices',
  'search_documentation',
]

let _angularMCP: LocalStdioMCPServer | null = null

export function angularMCP(): LocalStdioMCPServer {
  if (!_angularMCP) {
    _angularMCP = createAngularMCP()
  }
  return _angularMCP
}

function createAngularMCP(): LocalStdioMCPServer {
  let status: LocalStdioMCPServer['status'] = { state: 'stopped' }

  return {
    serverType: 'stdio',
    allowedTools: ANGULAR_ALLOWED_TOOLS,
    get status() {
      return status
    },
    start: async () => {
      status = { state: 'running' }
      return {
        command: ANGULAR_MCP_COMMAND,
        args: ANGULAR_MCP_ARGS,
        toolNames: ANGULAR_ALLOWED_TOOLS,
      }
    },
    stop: async () => {
      // The SDK owns this process lifecycle — resetting local state only.
      status = { state: 'stopped' }
    },
  }
}
