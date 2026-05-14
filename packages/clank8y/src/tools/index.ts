import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import type { TSchema } from 'typebox'

/**
 * Simplified tool definition used by clank8y modes and shared tools.
 *
 * `ToolDef` is clank8y's mode-level tool abstraction. Use `toolDefToAgentTool`
 * to convert it to a Pi SDK `AgentTool` for the Pi agent runtime.
 */
export interface ToolDef<TInput = Record<string, unknown>, TOutput = unknown> {
  name: string
  description?: string
  /**
   * JSON Schema object describing the tool's input parameters.
   */
  parameters: Record<string, unknown>
  execute: (args: TInput, signal?: AbortSignal) => Promise<TOutput>
}

/**
 * Converts a {@link ToolDef} to a Pi SDK {@link AgentTool}.
 *
 * The `parameters` JSON Schema is passed through as an `Unsafe` TypeBox schema
 * so the Pi agent can relay the schema to the LLM without strict local validation.
 * Tool errors should be thrown; the Pi SDK catches them and surfaces them to the LLM.
 * @param toolDef
 */
export function toolDefToAgentTool(toolDef: ToolDef): AgentTool {
  const schema = toolDef.parameters as unknown as TSchema

  return {
    name: toolDef.name,
    label: toolDef.name,
    description: toolDef.description ?? '',
    parameters: schema,
    execute: async (_toolCallId, params, signal): Promise<AgentToolResult<unknown>> => {
      const result = await toolDef.execute(params as Record<string, unknown>, signal)
      const text = typeof result === 'string' ? result : JSON.stringify(result)

      return {
        content: [{ type: 'text', text }],
        details: result,
      }
    },
  }
}
