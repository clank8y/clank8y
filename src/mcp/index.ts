import { angularMCP } from './angular'
import { codexMCP } from './codex'
import { githubMCP } from './github'

// ─── Base interface ────────────────────────────────────────────────────────────

export interface MCPServer {
  readonly serverType: 'http' | 'stdio'
  readonly status: { readonly state: 'running' } | { readonly state: 'stopped' }
  /**
   * Tools exposed to agents from this server.
   * `['*']` means all available tools; any other value is an exact-match allowlist.
   */
  readonly allowedTools: string[]
  stop: () => Promise<void>
}

// ─── HTTP (in-process) MCP server ─────────────────────────────────────────────

export interface LocalMCPServer extends MCPServer {
  readonly serverType: 'http'
  readonly status:
    | { readonly url: string, readonly state: 'running' }
    | { readonly state: 'stopped' }
  /**
   * Starts the HTTP server and returns the URL it is listening on.
   * The URL is stable across multiple calls as long as `stop` is not called.
   */
  start: () => Promise<{ url: string, toolNames: string[] }>
}
// ─── Remote HTTP MCP server ─────────────────────────────────────────────────────

/**
 * Always-running external HTTP MCP server. `start()` returns the static URL;
 * `stop()` is a no-op. `status` is always `running`.
 */
export interface RemoteMCPServer extends MCPServer {
  readonly serverType: 'http'
  readonly status: { readonly state: 'running' }
  start: () => Promise<{ url: string, toolNames: string[] }>
}
// ─── Stdio MCP server ─────────────────────────────────────────────────────────

export interface LocalStdioMCPServer extends MCPServer {
  readonly serverType: 'stdio'
  /**
   * Returns the `command` and `args` for the agent SDK to spawn the server process.
   * The SDK owns the process lifecycle; `stop` is a state-reset no-op.
   */
  start: () => Promise<{ command: string, args: string[], toolNames: string[] }>
}

// ─── Discriminated start results ──────────────────────────────────────────────

export interface HTTPStartResult {
  type: 'http'
  url: string
  toolNames: string[]
}

export interface StdioStartResult {
  type: 'stdio'
  command: string
  args: string[]
  toolNames: string[]
}

export type MCPStartResult = HTTPStartResult | StdioStartResult

// ─── Lifecycle helpers ────────────────────────────────────────────────────────

export type MCPServerMap = Record<string, LocalMCPServer | RemoteMCPServer | LocalStdioMCPServer>
export type MCPStartResultMap<T extends MCPServerMap> = {
  [K in keyof T]: T[K] extends LocalStdioMCPServer ? StdioStartResult : HTTPStartResult
}

export async function startAll<T extends MCPServerMap>(servers: T): Promise<MCPStartResultMap<T>> {
  const results: Record<string, MCPStartResult> = {}

  for (const [name, server] of Object.entries(servers)) {
    if (server.serverType === 'http') {
      const { url, toolNames } = await (server as LocalMCPServer).start()
      results[name] = { type: 'http', url, toolNames }
    } else {
      const { command, args, toolNames } = await (server as LocalStdioMCPServer).start()
      results[name] = { type: 'stdio', command, args, toolNames }
    }
  }

  return results as MCPStartResultMap<T>
}

export async function stopAll(servers: MCPServerMap): Promise<void> {
  await Promise.all(Object.values(servers).map((s) => s.stop()))
}

// ─── Server registry ──────────────────────────────────────────────────────────

export function mcpServers() {
  return {
    github: githubMCP(),
    codex: codexMCP(),
    angular: angularMCP(),
  }
}
