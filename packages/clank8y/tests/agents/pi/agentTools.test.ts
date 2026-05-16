import { describe, expect, test } from 'vitest'
import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import { Type } from '@earendil-works/pi-ai'
import { getSharedTools } from '../../../src/tools'

// Helper: build a minimal native Pi SDK AgentTool without a custom abstraction layer.
function makeAgentTool(name: string, execute?: AgentTool['execute']): AgentTool {
  const defaultExecute: AgentTool['execute'] = async (_id, _params): Promise<AgentToolResult<string>> => ({
    content: [{ type: 'text', text: 'ok' }],
    details: 'ok',
  })

  return {
    name,
    label: name,
    description: `Tool: ${name}`,
    parameters: Type.Object({ msg: Type.String() }),
    execute: execute ?? defaultExecute,
  }
}

describe('getSharedTools', () => {
  test('returns an empty array by default', () => {
    expect(getSharedTools()).toEqual([])
  })
})

describe('native AgentTool construction', () => {
  test('creates a tool with the correct name and label', () => {
    const tool = makeAgentTool('my-tool')

    expect(tool.name).toBe('my-tool')
    expect(tool.label).toBe('my-tool')
    expect(tool.description).toBe('Tool: my-tool')
  })

  test('execute returns AgentToolResult with text content', async () => {
    const tool = makeAgentTool('echo', async (_id, params): Promise<AgentToolResult<string>> => {
      const msg = (params as { msg: string }).msg
      return { content: [{ type: 'text', text: msg }], details: msg }
    })

    const result = await tool.execute('call-1', { msg: 'hello' } as any)

    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({ type: 'text', text: 'hello' })
    expect(result.details).toBe('hello')
  })

  test('execute throws errors naturally (Pi SDK handles them)', async () => {
    const tool = makeAgentTool('failing', async () => {
      throw new Error('tool failed')
    })

    await expect(tool.execute('call-2', {} as any)).rejects.toThrow('tool failed')
  })
})
