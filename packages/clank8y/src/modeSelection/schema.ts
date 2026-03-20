import * as v from 'valibot'

export const CLANK8Y_MODES = ['Review', 'IncidentFix'] as const

export type Clank8yMode = (typeof CLANK8Y_MODES)[number]

export type Clank8yDisabledModes = {
  [Mode in Clank8yMode]?: true
}

const MODE_DESCRIPTIONS: Record<Clank8yMode, string> = {
  Review: 'Review: choose this for pull request review in a repository context.',
  IncidentFix: 'IncidentFix: choose this for sandboxed incident investigation or deep-fix workflows that may inspect one or more repositories and produce a .clank8y/report.md artifact.',
}

export function createClank8yModeSchema(disabledModes: Clank8yDisabledModes = {}) {
  const enabledModes = CLANK8Y_MODES.filter((mode) => disabledModes[mode] !== true)
  if (enabledModes.length === 0) {
    throw new Error('No clank8y modes are enabled for this run.')
  }

  const modeSchemas = enabledModes.map((mode) => v.pipe(
    v.literal(mode),
    v.description(MODE_DESCRIPTIONS[mode]),
  ))

  return v.pipe(
    v.union(modeSchemas as [typeof modeSchemas[number], ...Array<typeof modeSchemas[number]>]),
    v.description('The execution mode selected for the current clank8y run.'),
  )
}

export function createClank8yModeSelectionSchema(disabledModes: Clank8yDisabledModes = {}) {
  return v.object({
    mode: createClank8yModeSchema(disabledModes),
    reason: v.pipe(
      v.string(),
      // TODO: tmcp valibot adapter take have options and fails here
      // v.trim(),
      v.minLength(1, 'Mode selection reason is required.'),
      v.description('A concise explanation for why this mode fits the current run.'),
    ),
  })
}

export interface Clank8yModeSelection {
  mode: Clank8yMode
  reason: string
}
