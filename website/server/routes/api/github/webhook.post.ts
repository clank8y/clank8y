import { defineHandler, HTTPError } from 'nitro/h3'
import { Webhooks } from '@octokit/webhooks'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'
import process from 'node:process'
import { buildReportBackInstruction, buildWebhookSetupHintBody, isClank8ySelfActor } from '../../../utils/github'
import { getAppId, getAppPrivateKey, getWebhookSecret } from '../../../utils/env'

const WORKFLOW_ID = 'clank8y.yml'
const BOT_TRIGGER = '@clank8y'

type DispatchFailureReason = 'missing_workflow' | 'missing_permissions' | 'unknown'
type DispatchTrigger = 'issue_comment' | 'pull_request_review_comment' | 'pull_request_review_requested' | 'issues_assigned'

function createAppOctokit(): Octokit {
  const appId = getAppId()
  const privateKey = getAppPrivateKey()

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  })
}

async function createInstallationOctokit(owner: string, repo: string): Promise<Octokit> {
  const appOctokit = createAppOctokit()

  const installation = await appOctokit.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo,
  })

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: getAppId(),
      privateKey: getAppPrivateKey(),
      installationId: installation.data.id,
    },
  })
}

function hasBotMention(commentBody: string): boolean {
  return commentBody.toLowerCase().includes(BOT_TRIGGER)
}

function isOnlyBotMention(commentBody: string): boolean {
  return commentBody.trim().toLowerCase() === BOT_TRIGGER
}

function buildDispatchPromptContext(params: {
  trigger: DispatchTrigger
  owner: string
  repo: string
  defaultBranch: string
  actor: string
  source:
    | { kind: 'issue_comment', commentId: number, commentUrl: string }
    | { kind: 'pull_request_review_comment', commentId: number, commentUrl: string }
    | { kind: 'pull_request_review_requested', reviewer: string }
    | { kind: 'issues_assigned', assignee: string }
  target:
    | { kind: 'issue', issueNumber: number }
    | { kind: 'pull_request', pullNumber: number, prBaseBranch: string, prHeadBranch: string }
  instruction?: string
}): string {
  const modeGuidance = params.source.kind === 'pull_request_review_requested'
    ? [
        '- You were explicitly requested as the reviewer for this pull request.',
        '- Prefer Review unless the quoted instruction clearly asks you to implement or fix something.',
      ]
    : params.source.kind === 'issues_assigned'
      ? [
          '- You were explicitly assigned this issue to take care of it.',
          '- Prefer Task unless the quoted instruction clearly asks for read-only review or analysis only.',
        ]
      : [
          '- Prefer Review for read-only review, explanation, or analysis requests.',
          '- Prefer Task for single-repository implementation work, fixes, replies, validation, or pull-request follow-up.',
        ]

  const lines = [
    'EVENT-LEVEL INSTRUCTIONS:',
    'You were invoked from GitHub. Select the best clank8y mode for this run using the event metadata and any quoted user instruction below.',
    ...modeGuidance,
    '',
    '---',
    '',
    `trigger: ${params.trigger}`,
    `owner: ${params.owner}`,
    `repo: ${params.repo}`,
    `default_branch: ${params.defaultBranch}`,
    `actor: ${params.actor}`,
    buildReportBackInstruction(params.actor),
  ]

  if (params.source.kind === 'pull_request_review_requested') {
    lines.push('source_kind: pull_request_review_requested')
    lines.push(`requested_reviewer: ${params.source.reviewer}`)
    lines.push('automatic_invocation: true')
  } else if (params.source.kind === 'issues_assigned') {
    lines.push('source_kind: issues_assigned')
    lines.push(`assigned_issue_to: ${params.source.assignee}`)
    lines.push('automatic_invocation: true')
  } else {
    lines.push(`source_kind: ${params.source.kind}`)
    lines.push(`source_comment_id: ${params.source.commentId}`)
    lines.push(`source_comment_url: ${params.source.commentUrl}`)
  }

  lines.push(`target_kind: ${params.target.kind}`)
  if (params.target.kind === 'issue') {
    lines.push(`issue_number: ${params.target.issueNumber}`)
  } else {
    lines.push(`pull_number: ${params.target.pullNumber}`)
    lines.push(`pr_base_branch: ${params.target.prBaseBranch}`)
    lines.push(`pr_head_branch: ${params.target.prHeadBranch}`)
  }

  if (isClank8ySelfActor(params.actor)) {
    lines.push('notification_instruction: do not mention @clank8y in comments or reviews')
  }

  const normalizedInstruction = params.instruction?.trim()
  if (normalizedInstruction && !isOnlyBotMention(normalizedInstruction)) {
    lines.push(
      '',
      'ADDITIONAL USER INSTRUCTION (quoted from mention comment):',
      normalizedInstruction,
    )
  } else if (params.source.kind === 'pull_request_review_requested') {
    lines.push('', 'ADDITIONAL USER INSTRUCTION: none provided; this run was triggered because clank8y was explicitly requested as the pull request reviewer.')
  } else if (params.source.kind === 'issues_assigned') {
    lines.push('', 'ADDITIONAL USER INSTRUCTION: none provided; this run was triggered because clank8y was explicitly assigned to the issue.')
  }

  return lines.join('\n')
}

async function fetchPullRequestContext(params: { owner: string, repo: string, pullNumber: number, octokit: Octokit }) {
  const { data: pullRequest } = await params.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner: params.owner,
    repo: params.repo,
    pull_number: params.pullNumber,
  })

  return {
    prBaseBranch: pullRequest.base.ref,
    prHeadBranch: pullRequest.head.ref,
  }
}

async function dispatchWorkflow(params: {
  owner: string
  repo: string
  defaultBranch: string
  trigger: DispatchTrigger
  actor: string
  source:
    | { kind: 'issue_comment', commentId: number, commentUrl: string }
    | { kind: 'pull_request_review_comment', commentId: number, commentUrl: string }
    | { kind: 'pull_request_review_requested', reviewer: string }
    | { kind: 'issues_assigned', assignee: string }
  target:
    | { kind: 'issue', issueNumber: number }
    | { kind: 'pull_request', pullNumber: number, prBaseBranch: string, prHeadBranch: string }
  instruction?: string
}): Promise<void> {
  const octokit = await createInstallationOctokit(params.owner, params.repo)

  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: params.owner,
    repo: params.repo,
    workflow_id: WORKFLOW_ID,
    ref: params.defaultBranch,
    inputs: {
      prompt: buildDispatchPromptContext({
        owner: params.owner,
        repo: params.repo,
        defaultBranch: params.defaultBranch,
        trigger: params.trigger,
        actor: params.actor,
        source: params.source,
        target: params.target,
        instruction: params.instruction,
      }),
    },
  })
}

function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') {
    return error.status
  }

  return null
}

function classifyDispatchFailure(error: unknown): DispatchFailureReason {
  const status = getErrorStatus(error)

  if (status === 404) {
    return 'missing_workflow'
  }

  if (status === 403) {
    return 'missing_permissions'
  }

  return 'unknown'
}

async function commentSetupHint(params: {
  owner: string
  repo: string
  issueNumber: number
  username: string
  reason: DispatchFailureReason
}): Promise<void> {
  const octokit = await createInstallationOctokit(params.owner, params.repo)

  const reasonLine
    = params.reason === 'missing_workflow'
      ? `I could not find \`.github/workflows/${WORKFLOW_ID}\` with a \`workflow_dispatch\` trigger.`
      : params.reason === 'missing_permissions'
        ? 'The app installation does not currently have permission to dispatch workflows (Actions write is required).'
        : 'I could not dispatch the workflow because repository setup is incomplete.'

  const body = buildWebhookSetupHintBody({
    username: params.username,
    workflowId: WORKFLOW_ID,
    reasonLine,
  })

  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
    body,
  })
}

export default defineHandler(async (event) => {
  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    console.error('GITHUB_WEBHOOK_SECRET is not set. Cannot verify webhook signatures.')
    throw HTTPError.status(500, 'Internal server error')
  }

  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
    console.error('GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY is not set. Cannot dispatch workflows.')
    throw HTTPError.status(500, 'Internal server error')
  }

  const body = await event.req.text()

  const deliveryId = event.req.headers.get('x-github-delivery')
  const eventName = event.req.headers.get('x-github-event')
  const signature = event.req.headers.get('x-hub-signature-256')
  if (!deliveryId || !eventName || !signature || !body) {
    console.error('Missing required GitHub webhook headers or body')
    throw HTTPError.status(400, 'Missing GitHub webhook headers and/or body')
  }

  console.log(`Processing GitHub webhook event: ${eventName} with delivery ID: ${deliveryId}`)

  const webhooks = new Webhooks({ secret: getWebhookSecret() })

  webhooks.on('issue_comment.created', async ({ payload }) => {
    if (isClank8ySelfActor(payload.sender.login)) {
      console.log(
        `[webhook] ignoring issue_comment.created from self repo=${payload.repository.full_name} issue_or_pr=#${payload.issue.number}`,
      )
      return
    }

    const commentBody = payload.comment.body || ''
    if (!hasBotMention(commentBody)) {
      return
    }

    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const installationOctokit = await createInstallationOctokit(owner, repo)

    try {
      const target = payload.issue.pull_request
        ? {
            kind: 'pull_request' as const,
            pullNumber: payload.issue.number,
            ...(await fetchPullRequestContext({
              owner,
              repo,
              pullNumber: payload.issue.number,
              octokit: installationOctokit,
            })),
          }
        : {
            kind: 'issue' as const,
            issueNumber: payload.issue.number,
          }

      await dispatchWorkflow({
        owner,
        repo,
        defaultBranch: payload.repository.default_branch,
        trigger: 'issue_comment',
        actor: payload.sender.login,
        source: {
          kind: 'issue_comment',
          commentId: payload.comment.id,
          commentUrl: payload.comment.html_url,
        },
        target,
        instruction: commentBody,
      })

      await installationOctokit.request('POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions', {
        owner,
        repo,
        comment_id: payload.comment.id,
        content: 'eyes',
      })

      console.log(
        `[webhook] dispatched workflow for issue_comment.created repo=${payload.repository.full_name} issue_or_pr=#${payload.issue.number} actor=${payload.sender.login}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner,
        repo,
        issueNumber: payload.issue.number,
        username: payload.sender.login,
        reason,
      })

      console.error('[webhook] failed to dispatch workflow for issue_comment.created', error)
    }
  })

  webhooks.on('pull_request_review_comment.created', async ({ payload }) => {
    if (isClank8ySelfActor(payload.sender.login)) {
      console.log(
        `[webhook] ignoring pull_request_review_comment.created from self repo=${payload.repository.full_name} pr=#${payload.pull_request.number}`,
      )
      return
    }

    const commentBody = payload.comment.body || ''
    if (!hasBotMention(commentBody)) {
      return
    }

    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const installationOctokit = await createInstallationOctokit(owner, repo)

    try {
      const pullRequestContext = await fetchPullRequestContext({
        owner,
        repo,
        pullNumber: payload.pull_request.number,
        octokit: installationOctokit,
      })

      await dispatchWorkflow({
        owner,
        repo,
        defaultBranch: payload.repository.default_branch,
        trigger: 'pull_request_review_comment',
        actor: payload.sender.login,
        source: {
          kind: 'pull_request_review_comment',
          commentId: payload.comment.id,
          commentUrl: payload.comment.html_url,
        },
        target: {
          kind: 'pull_request',
          pullNumber: payload.pull_request.number,
          ...pullRequestContext,
        },
        instruction: commentBody,
      })

      await installationOctokit.request('POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions', {
        owner,
        repo,
        comment_id: payload.comment.id,
        content: 'eyes',
      })

      console.log(
        `[webhook] dispatched workflow for pull_request_review_comment.created repo=${payload.repository.full_name} pr=#${payload.pull_request.number} actor=${payload.sender.login}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner,
        repo,
        issueNumber: payload.pull_request.number,
        username: payload.sender.login,
        reason,
      })

      console.error('[webhook] failed to dispatch workflow for pull_request_review_comment.created', error)
    }
  })

  webhooks.on('pull_request.review_requested', async ({ payload }) => {
    const requestedReviewer = payload.requested_reviewer?.login
    if (!requestedReviewer || !isClank8ySelfActor(requestedReviewer)) {
      return
    }

    if (isClank8ySelfActor(payload.sender.login)) {
      console.log(
        `[webhook] ignoring pull_request.review_requested from self repo=${payload.repository.full_name} pr=#${payload.pull_request.number}`,
      )
      return
    }

    try {
      await dispatchWorkflow({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        defaultBranch: payload.repository.default_branch,
        trigger: 'pull_request_review_requested',
        actor: payload.sender.login,
        source: {
          kind: 'pull_request_review_requested',
          reviewer: requestedReviewer,
        },
        target: {
          kind: 'pull_request',
          pullNumber: payload.pull_request.number,
          prBaseBranch: payload.pull_request.base.ref,
          prHeadBranch: payload.pull_request.head.ref,
        },
      })

      console.log(
        `[webhook] dispatched workflow for pull_request.review_requested repo=${payload.repository.full_name} pr=#${payload.pull_request.number} actor=${payload.sender.login}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issueNumber: payload.pull_request.number,
        username: requestedReviewer,
        reason,
      })

      console.error('[webhook] failed to dispatch workflow for pull_request.review_requested', error)
    }
  })

  webhooks.on('issues.assigned', async ({ payload }) => {
    const assignee = payload.assignee?.login
    if (!assignee || !isClank8ySelfActor(assignee)) {
      return
    }

    if (isClank8ySelfActor(payload.sender.login)) {
      console.log(
        `[webhook] ignoring issues.assigned from self repo=${payload.repository.full_name} issue=#${payload.issue.number}`,
      )
      return
    }

    try {
      await dispatchWorkflow({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        defaultBranch: payload.repository.default_branch,
        trigger: 'issues_assigned',
        actor: payload.sender.login,
        source: {
          kind: 'issues_assigned',
          assignee,
        },
        target: payload.issue.pull_request
          ? {
              kind: 'pull_request',
              pullNumber: payload.issue.number,
              ...(await fetchPullRequestContext({
                owner: payload.repository.owner.login,
                repo: payload.repository.name,
                pullNumber: payload.issue.number,
                octokit: await createInstallationOctokit(payload.repository.owner.login, payload.repository.name),
              })),
            }
          : {
              kind: 'issue',
              issueNumber: payload.issue.number,
            },
      })

      console.log(
        `[webhook] dispatched workflow for issues.assigned repo=${payload.repository.full_name} issue_or_pr=#${payload.issue.number} actor=${payload.sender.login}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issueNumber: payload.issue.number,
        username: assignee,
        reason,
      })

      console.error('[webhook] failed to dispatch workflow for issues.assigned', error)
    }
  })

  try {
    await webhooks.verifyAndReceive({
      id: deliveryId,
      name: eventName,
      signature,
      payload: body,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error verifying GitHub webhook signature:', error)
    throw HTTPError.status(401, 'Invalid webhook signature')
  }
})
