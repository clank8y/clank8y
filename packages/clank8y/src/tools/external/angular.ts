import { createStdioMcpServer } from '.'

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

export function angularMCP() {
  return createStdioMcpServer({
    command: 'npx',
    args: ['-y', '@angular/cli', 'mcp'],
    toolNames: ANGULAR_TOOL_NAMES,
  })
}
