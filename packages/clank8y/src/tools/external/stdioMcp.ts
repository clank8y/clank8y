import type { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core'
import { consola } from 'consola'
import type { TSchema } from 'typebox'
import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import type { McpToolInfo, ManagedMcpConnection } from './httpMcp'

interface JsonRpcResponse {
  id?: number | string
  result?: unknown
  error?: unknown
}

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

let _nextStdioRequestId = 1

function mcpResultToPiToolContent(result: unknown): AgentToolResult<unknown>['content'] {
  const content = (result as { content?: AgentToolResult<unknown>['content'] } | null | undefined)?.content
  if (Array.isArray(content)) {
    return content
  }

  return [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }]
}

function createStdioJsonRpcClient(child: ChildProcessWithoutNullStreams) {
  const pending = new Map<number | string, PendingRequest>()
  let stdoutBuffer = ''
  let closed = false

  function rejectPending(error: Error): void {
    for (const request of pending.values()) {
      request.reject(error)
    }
    pending.clear()
  }

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk: string) => {
    stdoutBuffer += chunk

    let newlineIndex = stdoutBuffer.indexOf('\n')
    while (newlineIndex >= 0) {
      const line = stdoutBuffer.slice(0, newlineIndex).trim()
      stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1)
      newlineIndex = stdoutBuffer.indexOf('\n')

      if (!line) {
        continue
      }

      let message: JsonRpcResponse
      try {
        message = JSON.parse(line) as JsonRpcResponse
      } catch {
        continue
      }

      if (message.id === undefined) {
        continue
      }

      const request = pending.get(message.id)
      if (!request) {
        continue
      }

      pending.delete(message.id)
      if (message.error) {
        request.reject(new Error(`MCP error: ${JSON.stringify(message.error)}`))
      } else {
        request.resolve(message.result)
      }
    }
  })

  child.once('error', (error) => {
    closed = true
    rejectPending(error)
  })

  child.once('exit', (code, signal) => {
    closed = true
    rejectPending(new Error(`MCP stdio process exited (${signal ?? code ?? 'unknown'})`))
  })

  function writeMessage(message: Record<string, unknown>): void {
    if (closed || !child.stdin.writable) {
      throw new Error('MCP stdio process is not writable')
    }

    child.stdin.write(`${JSON.stringify(message)}\n`)
  }

  async function request(method: string, params?: unknown, signal?: AbortSignal): Promise<unknown> {
    const id = _nextStdioRequestId++

    return new Promise((resolve, reject) => {
      const abortHandler = () => {
        pending.delete(id)
        reject(new Error(`MCP request aborted: ${method}`))
      }

      if (signal?.aborted) {
        abortHandler()
        return
      }

      if (signal) {
        signal.addEventListener('abort', abortHandler, { once: true })
      }

      pending.set(id, {
        resolve: (value) => {
          signal?.removeEventListener('abort', abortHandler)
          resolve(value)
        },
        reject: (reason) => {
          signal?.removeEventListener('abort', abortHandler)
          reject(reason)
        },
      })

      try {
        writeMessage({
          jsonrpc: '2.0',
          id,
          method,
          ...(params !== undefined ? { params } : {}),
        })
      } catch (error) {
        pending.delete(id)
        signal?.removeEventListener('abort', abortHandler)
        reject(error)
      }
    })
  }

  async function notify(method: string, params?: unknown): Promise<void> {
    writeMessage({
      jsonrpc: '2.0',
      method,
      ...(params !== undefined ? { params } : {}),
    })
  }

  return { request, notify }
}

export async function connectStdioMcpServer(
  name: string,
  command: string,
  args: string[],
  toolNames?: readonly string[],
): Promise<ManagedMcpConnection> {
  const child = spawn(command, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  child.stderr.resume()

  const client = createStdioJsonRpcClient(child)

  await client.request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: 'clank8y', version: '1.0.0' },
  })

  await client.notify('notifications/initialized')

  const toolsResult = await client.request('tools/list')
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

  const agentTools: AgentTool[] = selectedTools.map((tool) => {
    const inputSchema = (tool.inputSchema ?? { type: 'object', properties: {} }) as unknown as TSchema

    return {
      name: `mcp__${name}__${tool.name}`,
      label: tool.name,
      description: tool.description ?? '',
      parameters: inputSchema,
      execute: async (_toolCallId, params, signal): Promise<AgentToolResult<unknown>> => {
        const result = await client.request(
          'tools/call',
          { name: tool.name, arguments: params as Record<string, unknown> },
          signal,
        )
        return {
          content: mcpResultToPiToolContent(result),
          details: result,
        }
      },
    }
  })

  return {
    name,
    tools: agentTools,
    close: async () => {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
    },
  }
}
