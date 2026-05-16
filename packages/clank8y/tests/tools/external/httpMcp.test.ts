import { afterEach, describe, expect, test } from 'vitest'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { connectMcpServer, parseSseData } from '../../../src/tools/external/httpMcp'

const servers: Server[] = []

afterEach(async () => {
  await Promise.all(servers.map((server) => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })))
  servers.length = 0
})

async function startFakeHttpMcpServer(): Promise<string> {
  const server = createServer((request, response) => {
    let rawBody = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      rawBody += chunk
    })
    request.on('end', () => {
      const body = JSON.parse(rawBody) as { id?: number, method: string }

      response.setHeader('content-type', 'application/json')
      response.setHeader('Mcp-Session-Id', 'test-session')

      if (!body.id) {
        response.statusCode = 202
        response.end()
        return
      }

      if (body.method === 'initialize') {
        response.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: {} }))
        return
      }

      if (body.method === 'tools/list') {
        response.end(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: [
              { name: 'keep', description: 'Keep me', inputSchema: { type: 'object', properties: {} } },
              { name: 'drop', description: 'Drop me', inputSchema: { type: 'object', properties: {} } },
            ],
          },
        }))
        return
      }

      response.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'ok' }] } }))
    })
  })

  servers.push(server)

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve()
    })
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind fake MCP server')
  }

  return `http://127.0.0.1:${address.port}/mcp`
}

describe('connectMcpServer', () => {
  test('converts only requested remote HTTP MCP tools', async () => {
    const url = await startFakeHttpMcpServer()
    const connection = await connectMcpServer('fake', url, ['keep'])

    try {
      expect(connection.tools.map((tool) => tool.name)).toEqual(['mcp__fake__keep'])
    } finally {
      await connection.close()
    }
  })

  test('converts all remote HTTP MCP tools when no tool names are requested', async () => {
    const url = await startFakeHttpMcpServer()
    const connection = await connectMcpServer('fake', url)

    try {
      expect(connection.tools.map((tool) => tool.name).sort()).toEqual([
        'mcp__fake__drop',
        'mcp__fake__keep',
      ])
    } finally {
      await connection.close()
    }
  })
})

describe('parseSseData', () => {
  test('returns null for empty string', () => {
    expect(parseSseData('')).toBeNull()
  })

  test('returns null when no data: lines', () => {
    expect(parseSseData('event: message\nretry: 3000\n')).toBeNull()
  })

  test('extracts a single data line', () => {
    expect(parseSseData('data: {"jsonrpc":"2.0","id":1,"result":{}}\n')).toBe('{"jsonrpc":"2.0","id":1,"result":{}}')
  })

  test('joins multiple data lines', () => {
    const sse = 'data: {"partial":\ndata: "value"}\n'
    expect(parseSseData(sse)).toBe('{"partial":"value"}')
  })

  test('ignores non-data lines', () => {
    const sse = [
      'event: message',
      'id: 1',
      'data: {"result":"ok"}',
      '',
    ].join('\n')
    expect(parseSseData(sse)).toBe('{"result":"ok"}')
  })
})
