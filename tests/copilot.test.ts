import { describe, expect, test } from 'vitest'
import { getCopilotClientOptions, getPinnedCopilotCliVersion } from '../src/agents/copilot'

describe('getPinnedCopilotCliVersion', () => {
  test('extracts the pinned Copilot CLI version from the SDK dependency range', () => {
    expect(getPinnedCopilotCliVersion({
      dependencies: {
        '@github/copilot': '^0.0.420',
      },
    })).toBe('0.0.420')
  })
})

describe('getCopilotClientOptions', () => {
  test('uses the pinned global cli path with explicit token auth', () => {
    expect(getCopilotClientOptions('token', '/usr/local/bin/copilot')).toEqual({
      cliPath: '/usr/local/bin/copilot',
      githubToken: 'token',
      useLoggedInUser: false,
    })
  })
})
