import { describe, expect, test } from 'vitest'
import { getSelectModeRuntime } from '../../src/modes'

describe('getSelectModeRuntime', () => {
  test('returns a native Pi mode-selection tool', async () => {
    const runtime = getSelectModeRuntime('review this PR', { IncidentFix: true })
    const [tool] = runtime.tools

    expect(tool?.name).toBe('select-clank8y-mode')

    await tool!.execute('call-1', {
      mode: 'Review',
      reason: 'The request is about a pull request review.',
    } as any)

    expect(runtime.getSelection()).toEqual({
      mode: 'Review',
      reason: 'The request is about a pull request review.',
    })
  })
})
