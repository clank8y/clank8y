import { buildClank8yCommentBody } from '../../../shared/comment'

const SELF_ACTOR_LOGINS = new Set(['clank8y', 'clank8y[bot]'])

export function isClank8ySelfActor(login: string): boolean {
  return SELF_ACTOR_LOGINS.has(login.trim().toLowerCase())
}

export function buildReportBackInstruction(actor: string): string {
  return isClank8ySelfActor(actor)
    ? 'report_back_to: none'
    : `report_back_to: @${actor}`
}

export function buildWebhookSetupHintBody(params: {
  username: string
  workflowId: string
  reasonLine: string
}): string {
  const readmeSetupUrl = 'https://github.com/clank8y/clank8y#required-workflow-file-for-webhook-dispatch-mode'
  const greeting = isClank8ySelfActor(params.username)
    ? 'clank8y could not start for this PR.'
    : `@${params.username} clank8y could not start for this PR.`

  return buildClank8yCommentBody([
    greeting,
    '',
    params.reasonLine,
    '',
    `Please verify your workflow setup in the [README](${readmeSetupUrl})`,
    `Expected workflow file: \`.github/workflows/${params.workflowId}\` with \`workflow_dispatch\` configured.`,
  ].join('\n'))
}
