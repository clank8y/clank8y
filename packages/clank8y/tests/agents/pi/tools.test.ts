import { describe, expect, test } from 'vitest'
import { toolDefToAgentTool } from '../../../src/tools'
import type { ToolDef } from '../../../src/tools'

describe('toolDefToAgentTool', () => {
  test('preserves name, label, and description', () => {
    const toolDef: ToolDef = {
      name: 'my-tool',
      description: 'A test tool',
      parameters: { type: 'object', properties: { msg: { type: 'string' } } },
      execute: async () => 'ok',
    }

    const agentTool = toolDefToAgentTool(toolDef)

    expect(agentTool.name).toBe('my-tool')
    expect(agentTool.label).toBe('my-tool')
    expect(agentTool.description).toBe('A test tool')
  })

  test('uses empty string for missing description', () => {
    const toolDef: ToolDef = {
      name: 'no-desc',
      parameters: {},
      execute: async () => 'done',
    }

    const agentTool = toolDefToAgentTool(toolDef)
    expect(agentTool.description).toBe('')
  })

  test('wraps execute to return AgentToolResult with text content', async () => {
    const toolDef: ToolDef = {
      name: 'echo',
      parameters: {},
      execute: async (args) => (args as { msg: string }).msg,
    }

    const agentTool = toolDefToAgentTool(toolDef)
    const result = await agentTool.execute('call-1', { msg: 'hello' } as any)

    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({ type: 'text', text: 'hello' })
    expect(result.details).toBe('hello')
  })

  test('JSON-serialises non-string return values', async () => {
    const toolDef: ToolDef = {
      name: 'json-tool',
      parameters: {},
      execute: async () => ({ status: 'done', count: 3 }),
    }

    const agentTool = toolDefToAgentTool(toolDef)
    const result = await agentTool.execute('call-2', {} as any)

    expect(result.content[0]).toEqual({
      type: 'text',
      text: JSON.stringify({ status: 'done', count: 3 }),
    })
  })

  test('propagates thrown errors from execute', async () => {
    const toolDef: ToolDef = {
      name: 'failing-tool',
      parameters: {},
      execute: async () => {
        throw new Error('tool failed')
      },
    }

    const agentTool = toolDefToAgentTool(toolDef)
    await expect(agentTool.execute('call-3', {} as any)).rejects.toThrow('tool failed')
  })
})
