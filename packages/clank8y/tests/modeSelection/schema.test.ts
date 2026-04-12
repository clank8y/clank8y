import { describe, expect, test } from 'vitest'
import { safeParse } from 'valibot'
import {
  createClank8yModeSelectionSchema,
} from '../../src/modeSelection'
import { buildModeSelectionPrompt } from '../../src/modes/selectMode/prompt'

describe('mode availability gating', () => {
  test('fails fast when every mode is disabled', () => {
    expect(() => createClank8yModeSelectionSchema({ Review: true, Task: true, IncidentFix: true })).toThrow('No clank8y modes are enabled')
  })

  test('selection schema rejects modes that are not enabled for the run', () => {
    const schema = createClank8yModeSelectionSchema({ Task: true, IncidentFix: true })

    expect(safeParse(schema, { mode: 'Review', reason: 'Fits the run.' }).success).toBe(true)
    expect(safeParse(schema, { mode: 'Task', reason: 'Should be rejected.' }).success).toBe(false)
    expect(safeParse(schema, { mode: 'IncidentFix', reason: 'Should be rejected.' }).success).toBe(false)
  })

  test('selection schema allows enabled modes when nothing is disabled', () => {
    const schema = createClank8yModeSelectionSchema()

    expect(safeParse(schema, { mode: 'Review', reason: 'Fits the run.' }).success).toBe(true)
    expect(safeParse(schema, { mode: 'Task', reason: 'Fits the run.' }).success).toBe(true)
    expect(safeParse(schema, { mode: 'IncidentFix', reason: 'Fits the run.' }).success).toBe(true)
  })

  test('mode selection prompt does not enumerate modes', () => {
    const prompt = buildModeSelectionPrompt('Need a PR review')

    expect(prompt).toContain('Use the tool schema descriptions for the exact meaning of each selectable mode.')
    expect(prompt).not.toContain('Review: choose this for pull request review')
    expect(prompt).not.toContain('Task: choose this for single-repository development work')
    expect(prompt).not.toContain('IncidentFix: choose this for sandboxed incident investigation')
  })
})
