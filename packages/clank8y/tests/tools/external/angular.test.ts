import { describe, expect, test } from 'vitest'
import {
  ANGULAR_CLI_MCP_ARGS,
  ANGULAR_CLI_MCP_PACKAGE,
  angularMCP,
} from '../../../src/tools/external/angular'

describe('angularMCP', () => {
  test('pins the Angular CLI package version and intended tool subset', async () => {
    const server = angularMCP()

    expect(ANGULAR_CLI_MCP_PACKAGE).toBe('@angular/cli@21.2.11')
    expect(ANGULAR_CLI_MCP_ARGS).toEqual(['-y', '@angular/cli@21.2.11', 'mcp'])
    expect(server.toolNames).toEqual([
      'find_examples',
      'get_best_practices',
      'search_documentation',
    ])

    const started = await server.start()

    expect(started).toEqual({
      command: 'npx',
      args: ['-y', '@angular/cli@21.2.11', 'mcp'],
      toolNames: [
        'find_examples',
        'get_best_practices',
        'search_documentation',
      ],
    })

    await server.stop()
    expect(server.status).toEqual({ state: 'stopped' })
  })
})
