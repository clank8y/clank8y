import type { LocalHTTPMCPServer } from '.'
import { FastResponse, serve } from 'srvx'
import { HttpTransport } from '@tmcp/transport-http'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { McpServer } from 'tmcp'
import { defineTool } from 'tmcp/tool'
import { tool } from 'tmcp/utils'
import { MODE_SELECTION_TOOL_DESCRIPTION, MODE_SELECTION_TOOL_NAME, MODE_SELECTION_TOOL_TITLE, clank8yModeSelectionSchema } from '../modeSelection'
import type { Clank8yModeSelection } from '../modeSelection'

export function selectModeMCP(): { mcp: LocalHTTPMCPServer, selection: Clank8yModeSelection | null } {
  let selection: Clank8yModeSelection | null = null

  const mcp = new McpServer({
    name: 'clank8y-select-mode-mcp',
    description: 'A MCP server that selects the clank8y execution mode for the current run.',
    version: '1.0.0',
  }, {
    adapter: new ValibotJsonSchemaAdapter(),
    capabilities: {
      tools: {
        listChanged: true,
      },
    },
  })

  const selectModeTool = defineTool({
    name: MODE_SELECTION_TOOL_NAME,
    description: MODE_SELECTION_TOOL_DESCRIPTION,
    title: MODE_SELECTION_TOOL_TITLE,
    schema: clank8yModeSelectionSchema,
  }, async (input) => {
    selection = input

    return tool.text(`${MODE_SELECTION_TOOL_TITLE} received: ${input.mode}.`)
  })

  mcp.tools([selectModeTool])

  const transport = new HttpTransport(mcp, {
    path: '/mcp',
  })

  const server = serve({
    manual: true,
    port: 0,
    fetch: async (req) => {
      const response = await transport.respond(req)
      if (!response) {
        return new FastResponse('Not found', { status: 404 })
      }

      return response
    },
  })

  let status: LocalHTTPMCPServer['status'] = { state: 'stopped' }

  const localMcp: LocalHTTPMCPServer = {
    serverType: 'http',
    allowedTools: [MODE_SELECTION_TOOL_NAME],
    get status() {
      return status
    },
    start: async () => {
      await server.serve()
      const { url } = await server.ready()
      if (!url) {
        await server.close()
        throw new Error('Failed to start select mode MCP server')
      }

      const actualUrl = url.endsWith('/') ? `${url}mcp` : `${url}/mcp`
      status = { state: 'running', url: actualUrl }
      return { url: actualUrl, toolNames: [MODE_SELECTION_TOOL_NAME] }
    },
    stop: async () => {
      await server.close()
      status = { state: 'stopped' }
    },
  }

  return {
    mcp: localMcp,
    selection,
  }
}
