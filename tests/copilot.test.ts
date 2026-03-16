import { describe, expect, it, vi } from 'vitest'

const {
  client,
  ensureCopilotModelAvailableMock,
  getCopilotClientMock,
  selectCopilotModeMock,
} = vi.hoisted(() => {
  const client = {
    stop: vi.fn(),
  }

  return {
    client,
    getCopilotClientMock: vi.fn(async () => client),
    ensureCopilotModelAvailableMock: vi.fn(async () => {}),
    selectCopilotModeMock: vi.fn(async () => {}),
  }
})

vi.mock('../src/agents/copilot/client', () => ({
  COPILOT_REVIEW_EXCLUDED_TOOLS: [],
  copilotPermissionHandler: vi.fn(),
  ensureCopilotModelAvailable: ensureCopilotModelAvailableMock,
  getCopilotClient: getCopilotClientMock,
}))

vi.mock('../src/agents/copilot/selectMode', () => ({
  selectCopilotMode: selectCopilotModeMock,
}))

describe('githubCopilotAgent', () => {
  it('reuses a single Copilot client across mode selection and cleanup', async () => {
    const { githubCopilotAgent } = await import('../src/agents/copilot')
    const agent = await githubCopilotAgent({
      model: 'test-model',
      timeOutMs: 1_000,
      tools: {
        maxCalls: 1,
        maxRuntimeMs: 2_000,
      },
    })

    await agent.selectMode({
      prompt: 'select a mode',
      mcp: {} as never,
    })

    await agent.cleanup?.()

    expect(getCopilotClientMock).toHaveBeenCalledTimes(1)
    expect(ensureCopilotModelAvailableMock).toHaveBeenCalledWith(client, 'test-model')
    expect(selectCopilotModeMock).toHaveBeenCalledWith(expect.objectContaining({
      client,
      mcp: {},
      model: 'test-model',
      prompt: 'select a mode',
      timeoutMs: 2_000,
    }))
    expect(client.stop).toHaveBeenCalledTimes(1)
  })
})
