import { githubMCP } from './github'

export interface LocalMCPServer {
  readonly status: {
    readonly url: string
    readonly state: 'running'
  } | {
    readonly state: 'stopped'
  }

  /**
   * Already returns the exact URL where the MCP server can be reached, including protocol and port.
   * The URL should be stable across multiple calls to `start` as long as `stop` is not called.
   */
  start: () => Promise<{
    url: string
    toolNames: string[]
  }>
  stop: () => Promise<void>
}

export function mcpServers() {
  const github = githubMCP()

  return {
    github,
  }
}
