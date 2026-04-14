import type { Octokit } from 'octokit'

type Issue = Awaited<ReturnType<Octokit['rest']['issues']['get']>>['data']
type IssueComments = Awaited<ReturnType<Octokit['rest']['issues']['listComments']>>['data']
type PullRequest = Awaited<ReturnType<Octokit['rest']['pulls']['get']>>['data']

export interface TaskReviewThreadComment {
  author: string | null
  body: string
  commentId: number | null
  createdAt: string | null
  diffHunk: string | null
  pullRequestReviewId: string | null
  replyToCommentId: number | null
  reviewAuthor: string | null
  reviewState: string | null
  reviewSubmittedAt: string | null
  url: string | null
}

export interface TaskReviewThread {
  comments: TaskReviewThreadComment[]
  id: string
  isOutdated: boolean
  isResolved: boolean
  line: number | null
  originalLine: number | null
  originalStartLine: number | null
  path: string | null
  startLine: number | null
}

function pushCommentSection(lines: string[], title: string, comments: IssueComments) {
  lines.push(`## ${title}`)
  lines.push('')

  if (comments.length === 0) {
    lines.push('No comments.')
    lines.push('')
    return
  }

  for (const comment of comments) {
    lines.push(`### Comment ${comment.id} by ${comment.user?.login ?? 'unknown'} at ${comment.created_at ?? 'unknown time'}`)
    lines.push('')
    lines.push(comment.body?.trim() || '(no comment body)')
    lines.push('')
  }
}

export function formatTaskIssueArtifact(issue: Issue, comments: IssueComments): string {
  const lines: string[] = [
    `# Issue #${issue.number}`,
    '',
    `title: ${issue.title}`,
    `url: ${issue.html_url}`,
    `state: ${issue.state}`,
    `author: ${issue.user?.login ?? 'unknown'}`,
    `assignees: ${issue.assignees?.map((assignee) => assignee.login).join(', ') || '(none)'}`,
    `labels: ${issue.labels.map((label) => typeof label === 'string' ? label : label.name).join(', ') || '(none)'}`,
    '',
    '## Body',
    '',
    issue.body?.trim() || '(no issue body)',
    '',
  ]

  pushCommentSection(lines, 'Comments', comments)

  return lines.join('\n')
}

export function formatTaskPullRequestArtifact(params: {
  issueArtifactPaths: string[]
  pullRequest: PullRequest
  prComments: IssueComments
  reviewThreads: TaskReviewThread[]
}): string {
  const { issueArtifactPaths, prComments, pullRequest, reviewThreads } = params

  const lines: string[] = [
    `# Pull Request #${pullRequest.number}`,
    '',
    `title: ${pullRequest.title}`,
    `url: ${pullRequest.html_url}`,
    `state: ${pullRequest.state}`,
    `draft: ${String(pullRequest.draft)}`,
    `merged: ${String(pullRequest.merged)}`,
    `author: ${pullRequest.user?.login ?? 'unknown'}`,
    `assignees: ${pullRequest.assignees?.map((assignee) => assignee.login).join(', ') || '(none)'}`,
    `labels: ${pullRequest.labels.map((label) => typeof label === 'string' ? label : label.name).join(', ') || '(none)'}`,
    `base_branch: ${pullRequest.base.ref}`,
    `head_branch: ${pullRequest.head.ref}`,
    `head_sha: ${pullRequest.head.sha}`,
    '',
    '## Body',
    '',
    pullRequest.body?.trim() || '(no pull request body)',
    '',
  ]

  if (issueArtifactPaths.length > 0) {
    lines.push('## Related Issue Artifacts')
    lines.push('')
    for (const issueArtifactPath of issueArtifactPaths) {
      lines.push(`- ${issueArtifactPath}`)
    }
    lines.push('')
  }

  pushCommentSection(lines, 'PR Comments', prComments)

  lines.push('## Review Threads')
  lines.push('')

  if (reviewThreads.length === 0) {
    lines.push('No review threads.')
    lines.push('')
    return lines.join('\n')
  }

  for (const thread of reviewThreads) {
    lines.push(`### Thread ${thread.id}`)
    lines.push('')
    lines.push(`path: ${thread.path ?? '(unknown path)'}`)
    lines.push(`line: ${thread.line ?? 'unknown'}`)
    lines.push(`start_line: ${thread.startLine ?? 'unknown'}`)
    lines.push(`original_line: ${thread.originalLine ?? 'unknown'}`)
    lines.push(`original_start_line: ${thread.originalStartLine ?? 'unknown'}`)
    lines.push(`resolved: ${String(thread.isResolved)}`)
    lines.push(`outdated: ${String(thread.isOutdated)}`)
    lines.push('')

    for (const comment of thread.comments) {
      lines.push(`#### Comment ${comment.commentId ?? 'unknown'} by ${comment.author ?? 'unknown'} at ${comment.createdAt ?? 'unknown time'}`)
      lines.push('')
      lines.push(`reply_to: ${comment.replyToCommentId ?? 'root'}`)
      lines.push(`review_author: ${comment.reviewAuthor ?? 'unknown'}`)
      lines.push(`review_state: ${comment.reviewState ?? 'unknown'}`)
      lines.push(`review_submitted_at: ${comment.reviewSubmittedAt ?? 'unknown'}`)
      lines.push(`url: ${comment.url ?? '(none)'}`)
      lines.push('')

      if (comment.diffHunk) {
        lines.push('```diff')
        lines.push(comment.diffHunk)
        lines.push('```')
        lines.push('')
      }

      lines.push(comment.body.trim() || '(no review comment body)')
      lines.push('')
    }
  }

  return lines.join('\n')
}
