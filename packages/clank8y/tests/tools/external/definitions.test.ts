import { describe, expect, test } from 'vitest'
import { createRemoteHttpMcpServer, createStdioMcpServer, startAll, stopAll } from '../../../src/tools/external'

describe('external MCP server definitions', () => {
  test('supports multiple remote HTTP MCP servers', async () => {
    const servers = {
      docs: createRemoteHttpMcpServer({
        url: 'https://example.com/docs/mcp',
        toolNames: ['search-docs'],
      }),
      codex: createRemoteHttpMcpServer({
        url: 'https://example.com/codex/mcp',
        toolNames: ['query-codex'],
      }),
    }

    const started = await startAll(servers)

    expect(started.docs).toEqual({
      type: 'http',
      url: 'https://example.com/docs/mcp',
      toolNames: ['search-docs'],
    })
    expect(started.codex).toEqual({
      type: 'http',
      url: 'https://example.com/codex/mcp',
      toolNames: ['query-codex'],
    })

    await stopAll(servers)
  })

  test('supports multiple stdio MCP servers', async () => {
    const servers = {
      angular: createStdioMcpServer({
        command: 'ng',
        args: ['mcp'],
        toolNames: ['get_best_practices'],
      }),
      custom: createStdioMcpServer({
        command: 'custom-mcp',
        args: ['--stdio'],
        toolNames: ['custom-tool'],
      }),
    }

    const started = await startAll(servers)

    expect(started.angular).toEqual({
      type: 'stdio',
      command: 'ng',
      args: ['mcp'],
      toolNames: ['get_best_practices'],
    })
    expect(started.custom).toEqual({
      type: 'stdio',
      command: 'custom-mcp',
      args: ['--stdio'],
      toolNames: ['custom-tool'],
    })

    await stopAll(servers)
  })
})
