import { describe, expect, test } from 'vitest'
import { parseSseData } from '../../src/mcp/remote'

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
