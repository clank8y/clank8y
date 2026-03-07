import { describe, expect, test } from 'vitest'
import { getCopilotClientOptions } from '../src/agents/copilot'

describe('getCopilotClientOptions', () => {
  test('uses the SDK bundled CLI by omitting cliPath', () => {
    expect(getCopilotClientOptions('token')).toEqual({
      githubToken: 'token',
      useLoggedInUser: false,
    })
  })
})
