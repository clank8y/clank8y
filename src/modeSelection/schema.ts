import * as v from 'valibot'

export const CLANK8Y_MODES = ['Review'] as const

export type Clank8yMode = (typeof CLANK8Y_MODES)[number]

export const clank8yModeSchema = v.pipe(
  v.picklist(CLANK8Y_MODES),
  v.description('The execution mode selected for the current clank8y run.'),
)

export const clank8yModeSelectionSchema = v.object({
  mode: clank8yModeSchema,
  reason: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Mode selection reason is required.'),
    v.description('A concise explanation for why this mode fits the current run.'),
  ),
})

export type Clank8yModeSelection = v.InferOutput<typeof clank8yModeSelectionSchema>
