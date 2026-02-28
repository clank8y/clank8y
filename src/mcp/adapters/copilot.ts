import type { MCPServerConfig } from '@github/copilot-sdk'
import { consola } from 'consola'
import type { MCPServer, MCPServerMap, MCPStartResultMap } from '..'

interface CopilotMCPAdapterOptions {
  timeout: number
}

/**
 * Translates a map of started MCP servers into the session config format
 * expected by the Copilot SDK's `createSession({ mcpServers })`.
 *
 * - HTTP servers  → `{ type: 'http', url, tools, timeout }`
 * - Stdio servers → `{ type: 'stdio', command, args, tools, timeout }`
 *
 * Servers with an empty `allowedTools` list are skipped with a warning.
 * Each server's `allowedTools` is forwarded directly as the SDK-level tool allowlist.
 *
 * @param servers - Map of MCP server instances (for allowedTools access)
 * @param startResults - Start results returned by `startAll(servers)`
 * @param options - Adapter options (e.g. per-tool timeout)
 */
export function toCopilotMCPServersConfig<T extends MCPServerMap>(
  servers: T,
  startResults: MCPStartResultMap<T>,
  options: CopilotMCPAdapterOptions,
): Record<string, MCPServerConfig> {
  const config: Record<string, MCPServerConfig> = {}

  for (const [name, server] of Object.entries(servers) as [string, MCPServer][]) {
    const { allowedTools } = server

    if (allowedTools.length === 0) {
      consola.warn(`MCP server "${name}" has an empty allowedTools list — skipping.`)
      continue
    }

    if (allowedTools[0] !== '*') {
      consola.info(`MCP server "${name}" restricted to tools: [${allowedTools.join(', ')}]`)
    }

    const result = (startResults as Record<string, { type: string }>)[name]
    if (!result) {
      continue
    }

    if (result.type === 'http') {
      const { url } = result as { type: 'http', url: string }
      config[name] = {
        type: 'http',
        url,
        tools: allowedTools,
        timeout: options.timeout,
      }
    } else {
      const { command, args } = result as { type: 'stdio', command: string, args: string[] }
      config[name] = {
        type: 'stdio',
        command,
        args,
        tools: allowedTools,
        timeout: options.timeout,
      }
    }
  }

  return config
}
