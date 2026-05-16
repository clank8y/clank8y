// ─── Base interface ────────────────────────────────────────────────────────────

export interface ExternalMcpServer {
  readonly serverType: 'http' | 'stdio'
  readonly status: { readonly state: 'running' } | { readonly state: 'stopped' }
  /**
   * Optional static tool names exposed by this external MCP server.
   * Remote servers may omit this when the tools are discovered at connection time.
   */
  readonly toolNames?: readonly string[]
  stop: () => Promise<void>
}

// ─── Remote HTTP MCP server ─────────────────────────────────────────────────────

/**
 * Always-running external HTTP MCP server. `start()` returns the static URL;
 * `stop()` is a no-op. `status` is always `running`.
 */
export interface RemoteHttpMcpServer extends ExternalMcpServer {
  readonly serverType: 'http'
  readonly status: { readonly state: 'running' }
  start: () => Promise<{ url: string, toolNames: string[] }>
}
// ─── Stdio MCP server ─────────────────────────────────────────────────────────

export interface StdioMcpServer extends ExternalMcpServer {
  readonly serverType: 'stdio'
  /**
   * Returns the `command` and `args` for the Pi tool adapter to spawn the server process.
   * `stop` resets local declaration state; the active adapter connection owns its child process.
   */
  start: () => Promise<{ command: string, args: string[], toolNames: string[] }>
}

export type ExternalMcpServerDefinition = RemoteHttpMcpServer | StdioMcpServer

export type ExternalMcpServers = Record<string, ExternalMcpServerDefinition>

// ─── Discriminated start results ──────────────────────────────────────────────

export interface HttpMcpStartResult {
  type: 'http'
  url: string
  toolNames: string[]
}

export interface StdioMcpStartResult {
  type: 'stdio'
  command: string
  args: string[]
  toolNames: string[]
}

export type ExternalMcpStartResult = HttpMcpStartResult | StdioMcpStartResult

// ─── Lifecycle helpers ────────────────────────────────────────────────────────

export type ExternalMcpServerMap = Record<string, RemoteHttpMcpServer | StdioMcpServer>
export type ExternalMcpStartResultMap<T extends ExternalMcpServerMap> = {
  [K in keyof T]: T[K] extends StdioMcpServer ? StdioMcpStartResult : HttpMcpStartResult
}

export async function startAll<T extends ExternalMcpServerMap>(servers: T): Promise<ExternalMcpStartResultMap<T>> {
  const results: Record<string, ExternalMcpStartResult> = {}

  for (const [name, server] of Object.entries(servers)) {
    if (server.serverType === 'http') {
      const { url, toolNames } = await (server as RemoteHttpMcpServer).start()
      results[name] = { type: 'http', url, toolNames }
    } else {
      const { command, args, toolNames } = await (server as StdioMcpServer).start()
      results[name] = { type: 'stdio', command, args, toolNames }
    }
  }

  return results as ExternalMcpStartResultMap<T>
}

export async function stopAll(servers: ExternalMcpServerMap): Promise<void> {
  await Promise.all(Object.values(servers).map((s) => s.stop()))
}
