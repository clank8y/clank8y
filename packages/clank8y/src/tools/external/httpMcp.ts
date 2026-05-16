import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import { consola } from 'consola'
import type { TSchema } from 'typebox'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface McpToolInfo {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

/**
 * An active connection to a remote MCP server.
 *
 * The `tools` array contains Pi SDK `AgentTool` entries whose names are
 * namespaced as `mcp__<serverName>__<toolName>` to avoid collisions.
 *
 * Call `close()` when the connection is no longer needed to clean up
 * the server-side session (if the server supports session deletion).
 */
export interface ManagedMcpConnection {
  name: string
  tools: AgentTool[]
  close: () => Promise<void>
}

// ─── JSON-RPC request counter (module-local) ─────────────────────────────────

let _nextRequestId = 1

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

/**
 * Parses `data:` lines from an SSE response body.
 * Multiple consecutive data lines are joined (per SSE spec).
 * @param text
 */
export function parseSseData(text: string): string | null {
  const dataLines: string[] = []
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6))
    }
  }

  return dataLines.length > 0 ? dataLines.join('') : null
}

interface McpPostResult {
  result: unknown
  /**
   * Session ID returned by the server in `Mcp-Session-Id` response header.
   */
  sessionId?: string
}

/**
 * Sends a single JSON-RPC POST to an MCP endpoint and returns the parsed result.
 *
 * Handles both plain-JSON and `text/event-stream` (SSE) responses as required
 * by the MCP Streamable HTTP Transport specification (2025-03-26).
 * @param url
 * @param body
 * @param sessionId
 * @param signal
 */
async function mcpPost(
  url: string,
  body: string,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<McpPostResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  }

  if (sessionId) {
    headers['Mcp-Session-Id'] = sessionId
  }

  const response = await fetch(url, { method: 'POST', headers, body, signal })

  // 202 Accepted — used for notifications that don't return a body
  if (response.status === 202) {
    return {
      result: undefined,
      sessionId: response.headers.get('Mcp-Session-Id') ?? undefined,
    }
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`MCP request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ''}`)
  }

  const responseSessionId = response.headers.get('Mcp-Session-Id') ?? undefined
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('text/event-stream')) {
    const text = await response.text()
    const data = parseSseData(text)
    if (!data) {
      return { result: undefined, sessionId: responseSessionId }
    }

    const parsed = JSON.parse(data) as { result?: unknown, error?: unknown }
    if (parsed.error) {
      throw new Error(`MCP error: ${JSON.stringify(parsed.error)}`)
    }

    return { result: parsed.result, sessionId: responseSessionId }
  }

  const json = await response.json() as { result?: unknown, error?: unknown }
  if (json.error) {
    throw new Error(`MCP error: ${JSON.stringify(json.error)}`)
  }

  return { result: json.result, sessionId: responseSessionId }
}

// ─── MCP request helpers ──────────────────────────────────────────────────────

async function sendRequest(
  url: string,
  method: string,
  params?: unknown,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<McpPostResult> {
  const id = _nextRequestId++

  return mcpPost(
    url,
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      ...(params !== undefined ? { params } : {}),
    }),
    sessionId,
    signal,
  )
}

async function sendNotification(
  url: string,
  method: string,
  params?: unknown,
  sessionId?: string,
): Promise<void> {
  // Notifications have no `id` field and don't require a result
  await mcpPost(
    url,
    JSON.stringify({
      jsonrpc: '2.0',
      method,
      ...(params !== undefined ? { params } : {}),
    }),
    sessionId,
  )
}

// ─── Tool call execution ─────────────────────────────────────────────────────

async function callMcpTool(
  url: string,
  toolName: string,
  args: Record<string, unknown>,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const { result } = await sendRequest(
    url,
    'tools/call',
    { name: toolName, arguments: args },
    sessionId,
    signal,
  )

  return result
}

function mcpResultToPiToolContent(result: unknown): AgentToolResult<unknown>['content'] {
  const content = (result as { content?: AgentToolResult<unknown>['content'] } | null | undefined)?.content
  if (Array.isArray(content)) {
    return content
  }

  return [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }]
}

// ─── connectMcpServer ─────────────────────────────────────────────────────────

/**
 * Connects to a remote MCP server via Streamable HTTP, lists its tools, wraps
 * selected tools as Pi SDK `AgentTool` objects with namespaced names
 * `mcp__<name>__<toolName>`, and returns the connection handle.
 *
 * Inspired by Astro's Flue pattern: connect → listTools → wrap → execute → close.
 *
 * @param name - Logical server name used for tool namespacing.
 * @param url  - Full URL of the MCP HTTP endpoint.
 * @param toolNames - Optional tool names to convert. Omit to convert all listed tools.
 */
export async function connectMcpServer(
  name: string,
  url: string,
  toolNames?: readonly string[],
): Promise<ManagedMcpConnection> {
  // ── 1. Initialize ──────────────────────────────────────────────────────────
  const { result: _initResult, sessionId } = await sendRequest(url, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: 'clank8y', version: '1.0.0' },
  })

  // ── 2. Confirm initialization ──────────────────────────────────────────────
  await sendNotification(url, 'notifications/initialized', undefined, sessionId)

  // ── 3. List tools ──────────────────────────────────────────────────────────
  const { result: toolsResult } = await sendRequest(url, 'tools/list', undefined, sessionId)
  const rawTools: McpToolInfo[] = (toolsResult as { tools?: McpToolInfo[] })?.tools ?? []
  const rawToolNames = new Set(rawTools.map((tool) => tool.name))
  const selectedToolNames = toolNames && toolNames.length > 0 ? new Set(toolNames) : null

  if (selectedToolNames) {
    for (const requestedToolName of selectedToolNames) {
      if (!rawToolNames.has(requestedToolName)) {
        consola.warn(`MCP '${name}' requested tool '${requestedToolName}', but the server did not list it.`)
      }
    }
  }

  const selectedTools = selectedToolNames
    ? rawTools.filter((tool) => selectedToolNames.has(tool.name))
    : rawTools

  // ── 4. Wrap each selected tool as an AgentTool ─────────────────────────────
  const mcpSessionId = sessionId
  const agentTools: AgentTool[] = selectedTools.map((tool) => {
    const inputSchema = (tool.inputSchema ?? { type: 'object', properties: {} }) as unknown as TSchema

    const agentTool: AgentTool = {
      name: `mcp__${name}__${tool.name}`,
      label: tool.name,
      description: tool.description ?? '',
      parameters: inputSchema,
      execute: async (_toolCallId, params, signal): Promise<AgentToolResult<unknown>> => {
        const result = await callMcpTool(
          url,
          tool.name,
          params as Record<string, unknown>,
          mcpSessionId,
          signal,
        )

        return {
          content: mcpResultToPiToolContent(result),
          details: result,
        }
      },
    }

    return agentTool
  })

  // ── 5. Return connection handle ────────────────────────────────────────────
  return {
    name,
    tools: agentTools,
    close: async () => {
      // For session-aware MCP servers, we'd send DELETE /session here.
      // Most stateless servers don't require explicit cleanup.
    },
  }
}
