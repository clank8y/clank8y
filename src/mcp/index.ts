export interface LocalMCPServer {
  readonly status: {
    readonly url: string
    readonly state: 'running'
  } | {
    readonly state: 'stopped'
  }

  start: () => Promise<string>
  stop: () => Promise<void>
}

export { githubMCP } from './github'
