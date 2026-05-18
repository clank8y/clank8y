import { createStdioMcpServer } from '.'

export const ANGULAR_CLI_MCP_PACKAGE = '@angular/cli@21.2.11'
export const ANGULAR_CLI_MCP_ARGS = ['-y', ANGULAR_CLI_MCP_PACKAGE, 'mcp'] as const

/**
 * Tools exposed from the Angular CLI MCP server that clank8y intentionally
 * keeps available for Angular verification without inflating the agent tool
 * surface.
 */
const ANGULAR_TOOL_NAMES = [
  'find_examples',
  'get_best_practices',
  'search_documentation',
]

export function angularMCP() {
  return createStdioMcpServer({
    command: 'npx',
    args: ANGULAR_CLI_MCP_ARGS,
    toolNames: ANGULAR_TOOL_NAMES,
  })
}
