import { describe, expect, test } from 'vitest'
import { ANGULAR_CLI_MCP_ARGS } from '../../src/tools/external/angular'
import { connectStdioMcpServer } from '../../src/tools/external/stdioMcp'

describe('connectStdioMcpServer', () => {
  test('converts selected Angular CLI MCP tools to Pi tools', async () => {
    const connection = await connectStdioMcpServer('angular', 'npx', [...ANGULAR_CLI_MCP_ARGS], [
      'find_examples',
      'get_best_practices',
      'search_documentation',
    ])

    try {
      expect(connection.tools.map((tool) => tool.name).sort()).toEqual([
        'mcp__angular__find_examples',
        'mcp__angular__get_best_practices',
        'mcp__angular__search_documentation',
      ])

      for (const tool of connection.tools) {
        expect(tool.label).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.parameters).toBeTruthy()
        expect(typeof tool.execute).toBe('function')
      }
    } finally {
      await connection.close()
    }
  }, 60_000)

  test('converts only requested Angular CLI MCP tools', async () => {
    const connection = await connectStdioMcpServer('angular', 'npx', [...ANGULAR_CLI_MCP_ARGS], [
      'get_best_practices',
    ])

    try {
      expect(connection.tools.map((tool) => tool.name)).toEqual([
        'mcp__angular__get_best_practices',
      ])
    } finally {
      await connection.close()
    }
  }, 60_000)
})
