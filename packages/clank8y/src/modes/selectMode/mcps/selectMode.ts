import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { defineTool } from 'tmcp/tool'
import { tool } from 'tmcp/utils'
import type { LocalHTTPMCPServer } from '../../../mcp'
import { MODE_SELECTION_TOOL_DESCRIPTION, MODE_SELECTION_TOOL_NAME, MODE_SELECTION_TOOL_TITLE, createClank8yModeSelectionSchema } from '../../../modeSelection'
import type { Clank8yDisabledModes, Clank8yModeSelection } from '../../../modeSelection'

export interface SelectModeMCPRuntime {
  mcp: LocalHTTPMCPServer
  getSelection: () => Clank8yModeSelection | null
}

export interface CreateSelectModeMCPRuntimeOptions {
  disabledModes: Clank8yDisabledModes
}

export function createSelectModeMCPRuntime(options: CreateSelectModeMCPRuntimeOptions): SelectModeMCPRuntime {
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
    schema: createClank8yModeSelectionSchema(options.disabledModes),
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

  return {
    mcp: {
      serverType: 'http',
      allowedTools: [MODE_SELECTION_TOOL_NAME],
      get status() {
        return status
      },
      start: async () => {
        await server.serve()
        const { url } = await server.ready()
        if (!url) {
          await server.close(true)
          throw new Error('Failed to start select mode MCP server')
        }

        const actualUrl = url.endsWith('/') ? `${url}mcp` : `${url}/mcp`
        status = { state: 'running', url: actualUrl }
        return { url: actualUrl, toolNames: [MODE_SELECTION_TOOL_NAME] }
      },
      stop: async () => {
        await server.close(true)
        status = { state: 'stopped' }
      },
    },
    getSelection: () => selection,
  }
}
