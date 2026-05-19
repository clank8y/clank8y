import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import { toJsonSchema } from '@valibot/to-json-schema'
import type { TSchema } from 'typebox'

export interface DefinedTool {
  name: string
  title?: string
  description?: string
  schema?: any
  execute: (input: any) => Promise<any> | any
}

export interface DefinedToolResultDetails {
  __clank8yDefinedToolResult: true
  structuredContent: unknown
  internal?: unknown
}

function resultText(result: { content?: unknown[] }): string {
  return (result.content ?? [])
    .filter((item: unknown): item is { type: string, text: string } =>
      typeof item === 'object' && item !== null && (item as any).type === 'text' && typeof (item as any).text === 'string',
    )
    .map((item) => item.text)
    .join('\n')
}

export function definedToolToPiTool(definedTool: DefinedTool): AgentTool {
  const parameters = definedTool.schema
    ? toJsonSchema(definedTool.schema) as unknown as TSchema
    : { type: 'object', properties: {}, additionalProperties: false } as unknown as TSchema

  return {
    name: definedTool.name,
    label: definedTool.title ?? definedTool.name,
    description: definedTool.description ?? '',
    parameters,
    execute: async (_toolCallId, params): Promise<AgentToolResult<unknown>> => {
      const result = await definedTool.execute(params)
      if (result?.isError === true) {
        throw new Error(resultText(result) || `Tool ${definedTool.name} failed`)
      }

      const details: DefinedToolResultDetails | unknown = result?.structuredContent !== undefined
        ? {
          __clank8yDefinedToolResult: true,
          structuredContent: result.structuredContent,
          internal: result.internal,
        } satisfies DefinedToolResultDetails
        : result

      return {
        content: Array.isArray(result?.content) ? result.content : [{ type: 'text', text: JSON.stringify(result) }],
        details,
      }
    },
  }
}

export function definedToolsToPiTools(definedTools: DefinedTool[]): AgentTool[] {
  return definedTools.map(definedToolToPiTool)
}
