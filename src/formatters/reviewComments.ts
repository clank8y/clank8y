import type { Octokit } from 'octokit'

export interface FormattedArtifact {
  content: string
  toc: string
}

type PullRequestReviews = Awaited<ReturnType<Octokit['rest']['pulls']['listReviews']>>['data']
type PullRequestReviewComments = Awaited<ReturnType<Octokit['rest']['pulls']['listReviewComments']>>['data']

function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return 'unknown time'
  }

  return timestamp
}

function firstNonEmptyValue<T>(...values: Array<T | null | undefined>): T | null {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value
    }
  }

  return null
}

function buildReviewHeader(review: PullRequestReviews[number]): string {
  const reviewer = review.user?.login ?? 'unknown'
  const submittedAt = formatTimestamp(review.submitted_at)
  const state = review.state ?? 'UNKNOWN'

  return `Review ${review.id} by ${reviewer} at ${submittedAt} [${state}]`
}

function buildThreadLocation(comment: PullRequestReviewComments[number], rootCommentId: number): string {
  const path = comment.path ?? '(no file path)'
  const line = firstNonEmptyValue(comment.line, comment.original_line, comment.start_line, comment.original_start_line)

  if (line === null) {
    return `${path} [thread ${rootCommentId}]`
  }

  return `${path}:${line}`
}

export function formatPreviousReviewCommentsArtifact(
  pullRequestNumber: number,
  reviews: PullRequestReviews,
  comments: PullRequestReviewComments,
): FormattedArtifact {
  const lines: string[] = []
  const tocEntries: string[] = []
  const reviewById = new Map(reviews.map((review) => [review.id, review]))
  const commentById = new Map(comments.map((comment) => [comment.id, comment]))
  const threadMap = new Map<number, PullRequestReviewComments>()

  function getRootCommentId(comment: PullRequestReviewComments[number]): number {
    let current = comment
    let rootId = current.id
    const seen = new Set<number>()

    while (current.in_reply_to_id) {
      if (seen.has(current.id)) {
        break
      }

      seen.add(current.id)
      const parent = commentById.get(current.in_reply_to_id)
      if (!parent) {
        rootId = current.in_reply_to_id
        break
      }

      current = parent
      rootId = current.id
    }

    return rootId
  }

  for (const comment of comments) {
    const rootCommentId = getRootCommentId(comment)
    const threadComments = threadMap.get(rootCommentId)
    if (threadComments) {
      threadComments.push(comment)
    } else {
      threadMap.set(rootCommentId, [comment])
    }
  }

  const threads = [...threadMap.entries()]
    .flatMap(([rootCommentId, threadComments]) => {
      const sortedComments = [...threadComments].sort((left, right) => {
        const leftTime = left.created_at ?? ''
        const rightTime = right.created_at ?? ''
        return leftTime.localeCompare(rightTime) || left.id - right.id
      })

      const rootComment = sortedComments.find((comment) => comment.id === rootCommentId) ?? sortedComments[0]
      if (!rootComment) {
        return []
      }

      return {
        rootCommentId,
        rootComment,
        comments: sortedComments,
      }
    })
    .sort((left, right) => {
      const leftPath = left.rootComment.path ?? ''
      const rightPath = right.rootComment.path ?? ''
      const pathCompare = leftPath.localeCompare(rightPath)
      if (pathCompare !== 0) {
        return pathCompare
      }

      const leftLine = firstNonEmptyValue(left.rootComment.line, left.rootComment.original_line, left.rootComment.start_line, left.rootComment.original_start_line) ?? 0
      const rightLine = firstNonEmptyValue(right.rootComment.line, right.rootComment.original_line, right.rootComment.start_line, right.rootComment.original_start_line) ?? 0
      if (leftLine !== rightLine) {
        return leftLine - rightLine
      }

      return left.rootCommentId - right.rootCommentId
    })

  lines.push(`# Previous Review Comments For PR #${pullRequestNumber}`)
  lines.push('')
  lines.push(`reviews: ${reviews.length}`)
  lines.push(`inline_comments: ${comments.length}`)
  lines.push('')

  if (reviews.length > 0) {
    lines.push('## Reviews')
    lines.push('')
    for (const review of [...reviews].sort((left, right) => {
      const leftTime = left.submitted_at ?? ''
      const rightTime = right.submitted_at ?? ''
      return leftTime.localeCompare(rightTime) || left.id - right.id
    })) {
      lines.push(`### ${buildReviewHeader(review)}`)
      lines.push('')
      lines.push(review.body?.trim() || '(no review body)')
      lines.push('')
    }
  }

  if (threads.length > 0) {
    lines.push('## Thread TOC')
    lines.push('')
    for (const thread of threads) {
      tocEntries.push(`- ${buildThreadLocation(thread.rootComment, thread.rootCommentId)}`)
    }
    lines.push(...tocEntries)
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  if (threads.length === 0) {
    lines.push('No inline review comments found on this pull request yet.')
    lines.push('')
  }

  for (const thread of threads) {
    const location = buildThreadLocation(thread.rootComment, thread.rootCommentId)
    const review = thread.rootComment.pull_request_review_id
      ? reviewById.get(thread.rootComment.pull_request_review_id) ?? null
      : null

    lines.push(`## ${location}`)
    lines.push('')
    lines.push(`root_comment_id: ${thread.rootCommentId}`)
    lines.push(`review_id: ${thread.rootComment.pull_request_review_id ?? 'unknown'}`)
    lines.push(`reviewer: ${review?.user?.login ?? 'unknown'}`)
    lines.push(`review_state: ${review?.state ?? 'unknown'}`)
    lines.push(`thread_comments: ${thread.comments.length}`)
    lines.push('')

    if (thread.rootComment.diff_hunk) {
      lines.push('```diff')
      lines.push(thread.rootComment.diff_hunk)
      lines.push('```')
      lines.push('')
    }

    for (const comment of thread.comments) {
      const author = comment.user?.login ?? 'unknown'
      lines.push(`### ${author} at ${formatTimestamp(comment.created_at)}`)
      lines.push('')
      lines.push(`comment_id: ${comment.id}`)
      lines.push(`reply_to: ${comment.in_reply_to_id ?? 'root'}`)
      lines.push(comment.body?.trim() || '(no comment body)')
      lines.push('')
    }
  }

  return {
    toc: tocEntries.join('\n'),
    content: lines.join('\n'),
  }
}
