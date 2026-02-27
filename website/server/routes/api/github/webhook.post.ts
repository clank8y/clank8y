import { defineHandler, HTTPError } from 'nitro/h3'
import { Webhooks } from '@octokit/webhooks'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'
import process from 'node:process'
import { buildWebhookSetupHintBody } from '../../../utils/github'

type DispatchFailureReason = 'missing_workflow' | 'missing_permissions' | 'unknown'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required.`)
  }

  return value
}

function createAppOctokit(): Octokit {
  const appId = getRequiredEnv('GITHUB_APP_ID')
  const privateKey = getRequiredEnv('GITHUB_APP_PRIVATE_KEY').replace(/\\n/g, '\n')

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  })
}

async function createInstallationOctokit(owner: string, repo: string): Promise<Octokit> {
  const appId = getRequiredEnv('GITHUB_APP_ID')
  const privateKey = getRequiredEnv('GITHUB_APP_PRIVATE_KEY').replace(/\\n/g, '\n')
  const appOctokit = createAppOctokit()

  const installation = await appOctokit.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo,
  })

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId: installation.data.id,
    },
  })
}

function hasBotMention(commentBody: string): boolean {
  return commentBody.toLowerCase().includes('@clank8y')
}

function isOnlyBotMention(commentBody: string): boolean {
  return commentBody.trim().toLowerCase() === '@clank8y'
}

function buildDispatchPromptContext(params: {
  trigger: 'pull_request_opened' | 'issue_comment'
  prNumber: number
  actor: string
  instruction?: string
}): string {
  const baseInstruction = params.trigger === 'issue_comment'
    ? 'You have been mentioned in a PR review. Address the feedback in the comments that mention you.'
    : 'A new PR has just been opened. Review this pull request and provide actionable, high-signal feedback.'

  const lines = [
    'EVENT-LEVEL INSTRUCTIONS:',
    baseInstruction,
    '',
    '---',
    '',
    `trigger: ${params.trigger}`,
    `pr_number: ${params.prNumber}`,
    `actor: ${params.actor}`,
    `report_back_to: @${params.actor}`,
  ]

  const normalizedInstruction = params.instruction?.trim()
  if (normalizedInstruction && !isOnlyBotMention(normalizedInstruction)) {
    lines.push(
      '',
      'ADDITIONAL USER INSTRUCTION (quoted from mention comment):',
      normalizedInstruction,
    )
  }

  return lines.join('\n')
}

async function dispatchWorkflow(params: {
  owner: string
  repo: string
  ref: string
  trigger: 'pull_request_opened' | 'issue_comment'
  prNumber: number
  actor: string
  instruction?: string
}): Promise<void> {
  const workflowId = process.env.GITHUB_WORKFLOW_ID || 'clank8y.yml'
  const octokit = await createInstallationOctokit(params.owner, params.repo)

  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: params.owner,
    repo: params.repo,
    workflow_id: workflowId,
    ref: params.ref,
    inputs: {
      prompt: buildDispatchPromptContext({
        trigger: params.trigger,
        prNumber: params.prNumber,
        actor: params.actor,
        ...(params.instruction ? { instruction: params.instruction } : {}),
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
  prNumber: number
  username: string
  reason: DispatchFailureReason
}): Promise<void> {
  const workflowId = process.env.GITHUB_WORKFLOW_ID || 'clank8y.yml'
  const octokit = await createInstallationOctokit(params.owner, params.repo)

  const reasonLine
    = params.reason === 'missing_workflow'
      ? `I could not find \`.github/workflows/${workflowId}\` with a \`workflow_dispatch\` trigger.`
      : params.reason === 'missing_permissions'
        ? 'The app installation does not currently have permission to dispatch workflows (Actions write is required).'
        : 'I could not dispatch the workflow because repository setup is incomplete.'

  const body = buildWebhookSetupHintBody({
    username: params.username,
    workflowId,
    reasonLine,
  })

  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: params.owner,
    repo: params.repo,
    issue_number: params.prNumber,
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

  const webhooks = new Webhooks({ secret: process.env.GITHUB_WEBHOOK_SECRET })

  webhooks.on('pull_request.opened', async ({ payload }) => {
    try {
      await dispatchWorkflow({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        ref: payload.pull_request.head.ref,
        trigger: 'pull_request_opened',
        prNumber: payload.pull_request.number,
        actor: payload.sender.login,
      })

      console.log(
        `[webhook] dispatched workflow for pull_request.opened repo=${payload.repository.full_name} pr=#${payload.pull_request.number}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        prNumber: payload.pull_request.number,
        username: payload.pull_request.user.login,
        reason,
      })

      console.error(`[webhook] failed to dispatch workflow for pull_request.opened. Status:${getErrorStatus(error)} Reason: ${reason}`, error)
    }
  })

  webhooks.on('issue_comment.created', async ({ payload }) => {
    if (!payload.issue.pull_request) {
      console.log(`[webhook] ignoring issue_comment.created for non-PR issue #${payload.issue.number} in repo=${payload.repository.full_name}`)
      return
    }

    const commentBody = payload.comment.body || ''
    if (!hasBotMention(commentBody)) {
      return
    }

    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const installationOctokit = await createInstallationOctokit(owner, repo)
    const pr = await installationOctokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner,
      repo,
      pull_number: payload.issue.number,
    })

    try {
      await dispatchWorkflow({
        owner,
        repo,
        ref: pr.data.head.ref,
        trigger: 'issue_comment',
        prNumber: payload.issue.number,
        actor: payload.sender.login,
        instruction: commentBody,
      })

      await installationOctokit.request('POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions', {
        owner,
        repo,
        comment_id: payload.comment.id,
        content: 'eyes',
      })

      console.log(
        `[webhook] dispatched workflow for issue_comment.created repo=${payload.repository.full_name} pr=#${payload.issue.number} actor=${payload.sender.login}`,
      )
    } catch (error) {
      const reason = classifyDispatchFailure(error)

      await commentSetupHint({
        owner,
        repo,
        prNumber: payload.issue.number,
        username: payload.sender.login,
        reason,
      })

      console.error('[webhook] failed to dispatch workflow for issue_comment.created', error)
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
