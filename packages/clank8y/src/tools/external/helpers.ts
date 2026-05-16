import type { AgentToolResult } from '@earendil-works/pi-agent-core'
import { consola } from 'consola'
import type { McpToolInfo } from './httpMcp'

export function safeToolNamePart(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
  return sanitized || 'unnamed'
}

export function namespacedMcpToolName(serverName: string, toolName: string): string {
  return `mcp__${safeToolNamePart(serverName)}__${safeToolNamePart(toolName)}`
}

export function selectMcpTools(
  serverName: string,
  rawTools: McpToolInfo[],
  toolNames?: readonly string[],
): McpToolInfo[] {
  const rawToolNames = new Set(rawTools.map((tool) => tool.name))
  const selectedToolNames = toolNames && toolNames.length > 0 ? new Set(toolNames) : null

  if (selectedToolNames) {
    for (const requestedToolName of selectedToolNames) {
      if (!rawToolNames.has(requestedToolName)) {
        consola.warn(`MCP '${serverName}' requested tool '${requestedToolName}', but the server did not list it.`)
      }
    }
  }

  return selectedToolNames
    ? rawTools.filter((tool) => selectedToolNames.has(tool.name))
    : rawTools
}

export function assertUniqueToolNames(toolNames: readonly string[], context: string): void {
  const seen = new Set<string>()
  for (const toolName of toolNames) {
    if (seen.has(toolName)) {
      throw new Error(`Duplicate Pi tool name '${toolName}' while ${context}.`)
    }
    seen.add(toolName)
  }
}

export function mcpResultToPiToolContent(result: unknown): AgentToolResult<unknown>['content'] {
  const typedResult = result as { content?: AgentToolResult<unknown>['content'], isError?: boolean } | null | undefined
  if (typedResult?.isError === true) {
    const text = Array.isArray(typedResult.content)
      ? typedResult.content
          .filter((item): item is { type: 'text', text: string } =>
            typeof item === 'object' && item !== null && (item as any).type === 'text' && typeof (item as any).text === 'string',
          )
          .map((item) => item.text)
          .join('\n')
      : ''
    throw new Error(text || 'MCP tool returned an error')
  }

  if (Array.isArray(typedResult?.content)) {
    return typedResult.content
  }

  return [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }]
}
