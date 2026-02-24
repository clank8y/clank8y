import { buildClank8yCommentBody } from '../../../shared/comment'

export function buildWebhookSetupHintBody(params: {
  username: string
  workflowId: string
  reasonLine: string
}): string {
  const readmeSetupUrl = 'https://github.com/clank8y/clank8y#required-workflow-file-for-webhook-dispatch-mode'

  return buildClank8yCommentBody([
    `@${params.username} clank8y could not start for this PR.`,
    '',
    params.reasonLine,
    '',
    `Please verify your workflow setup in the [README](${readmeSetupUrl})`,
    `Expected workflow file: \`.github/workflows/${params.workflowId}\` with \`workflow_dispatch\` configured.`,
  ].join('\n'))
}
