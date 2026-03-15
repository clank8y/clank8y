import type { LocalHTTPMCPServer } from '../../mcp'
import {
  COPILOT_REVIEW_EXCLUDED_TOOLS,
  getCopilotClient,
} from './client'

export const COPILOT_SELECT_MODE_EXCLUDED_TOOLS = [
  ...COPILOT_REVIEW_EXCLUDED_TOOLS,
  'rg',
  'create',
  'edit',
  'view',
]

export async function selectCopilotMode(options: {
  model: string
  prompt: string
  mcp: LocalHTTPMCPServer
  timeoutMs?: number
}): Promise<void> {
  if (options.mcp.status.state !== 'running') {
    throw new Error('Select mode MCP server must be started before mode selection.')
  }

  const client = await getCopilotClient()

  const session = await client.createSession({
    model: options.model,
    // tools in github copilot are prefixed with the mcp server name set in the mcpServers object
    availableTools: [...options.mcp.allowedTools.map((n) => `selectMode-${n}`)],
    onPermissionRequest: (request) => {
      if (request.kind === 'mcp') {
        return {
          kind: 'approved' as const,
        }
      }

      return {
        kind: 'denied-by-rules',
        rules: ['Only the select mode MCP tool may be used during mode selection.'],
      }
    },
    mcpServers: {
      selectMode: {
        type: 'http',
        url: options.mcp.status.url,
        tools: options.mcp.allowedTools,
        timeout: options.timeoutMs ?? 60_000,
      },
    },
  })

  await session.sendAndWait({
    prompt: options.prompt,
  })

  await client.deleteSession(session.sessionId)
}
