import { describe, expect, test } from 'vitest'
import { defineTool, tool } from '../../src/tools/define'
import { definedToolToPiTool } from '../../src/tools/defined'

describe('definedToolToPiTool', () => {
  test('keeps structured content user-visible while carrying internal metadata in details', async () => {
    const piTool = definedToolToPiTool(defineTool({
      name: 'prepare-task-workspace',
      description: 'test tool',
    }, async () => tool.structured({
      repository: 'clank8y/clank8y',
      agentsFilePath: '/tmp/repo/AGENTS.md',
    }, {
      repositoryAgentsFileContext: {
        path: '/tmp/repo/AGENTS.md',
        content: '# Repo context\n',
        steeringMessage: '[SYSTEM REPOSITORY CONTEXT]\n# Repo context\n',
      },
    })))

    const result = await piTool.execute('tool-call-1', {})

    expect(result.content).toEqual([{
      type: 'text',
      text: JSON.stringify({
        repository: 'clank8y/clank8y',
        agentsFilePath: '/tmp/repo/AGENTS.md',
      }),
    }])
    expect(result.details).toEqual({
      __clank8yDefinedToolResult: true,
      structuredContent: {
        repository: 'clank8y/clank8y',
        agentsFilePath: '/tmp/repo/AGENTS.md',
      },
      internal: {
        repositoryAgentsFileContext: {
          path: '/tmp/repo/AGENTS.md',
          content: '# Repo context\n',
          steeringMessage: '[SYSTEM REPOSITORY CONTEXT]\n# Repo context\n',
        },
      },
    })
  })
})
