import type { AgentTool } from '@earendil-works/pi-agent-core'
import type { ExternalMcpServers, ExternalMcpStartResult } from './external'
import { connectMcpServer } from './external/httpMcp'
import type { ManagedMcpConnection } from './external/httpMcp'
import { connectStdioMcpServer } from './external/stdioMcp'

export interface PiToolBundle {
  tools: AgentTool[]
  close: () => Promise<void>
}

/**
 * Returns Pi SDK tools that are active for every clank8y mode.
 *
 * Mode selection and mode-local MCP tools are kept separate so the active mode
 * still owns its prompt and MCP surface while Pi gets one flat native tool list.
 */
export function getSharedTools(): AgentTool[] {
  return []
}

export async function createPiToolBundle(
  externalMcpServers: ExternalMcpServers,
  startResults: Record<string, ExternalMcpStartResult>,
  modeTools: AgentTool[] = [],
): Promise<PiToolBundle> {
  const connections: ManagedMcpConnection[] = []

  try {
    for (const [name, server] of Object.entries(externalMcpServers)) {
      const result = startResults[name]

      if (server.serverType === 'http') {
        const httpResult = result as { type: 'http', url: string, toolNames: string[] } | undefined
        if (!httpResult?.url) {
          continue
        }

        connections.push(await connectMcpServer(name, httpResult.url, server.toolNames ?? httpResult.toolNames))
        continue
      }

      const stdioResult = result as { type: 'stdio', command: string, args: string[], toolNames: string[] } | undefined
      if (!stdioResult?.command) {
        continue
      }

      connections.push(await connectStdioMcpServer(name, stdioResult.command, stdioResult.args, server.toolNames ?? stdioResult.toolNames))
    }
  } catch (error) {
    await Promise.all(connections.map((connection) => connection.close()))
    throw error
  }

  return {
    tools: [
      ...getSharedTools(),
      ...modeTools,
      ...connections.flatMap((connection) => connection.tools),
    ],
    close: async () => {
      await Promise.all(connections.map((connection) => connection.close()))
    },
  }
}
