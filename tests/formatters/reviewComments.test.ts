import { expect, test } from 'vitest'
import { formatPreviousReviewCommentsArtifact } from '../../src/formatters'

test('formatPreviousReviewCommentsArtifact groups threads and review metadata', () => {
  const reviews = [
    {
      id: 100,
      state: 'COMMENTED',
      submitted_at: '2026-03-16T10:00:00Z',
      body: 'Please tighten the review.',
      user: { login: 'alice' },
    },
  ] as any

  const comments = [
    {
      id: 10,
      path: 'src/example.ts',
      line: 12,
      original_line: 12,
      start_line: null,
      original_start_line: null,
      created_at: '2026-03-16T10:01:00Z',
      body: 'Consider using a signal here.',
      in_reply_to_id: null,
      diff_hunk: '@@ -10,1 +12,1 @@',
      pull_request_review_id: 100,
      user: { login: 'alice' },
    },
    {
      id: 11,
      path: 'src/example.ts',
      line: 12,
      original_line: 12,
      start_line: null,
      original_start_line: null,
      created_at: '2026-03-16T10:02:00Z',
      body: 'Agreed, I will change it.',
      in_reply_to_id: 10,
      diff_hunk: null,
      pull_request_review_id: 100,
      user: { login: 'bob' },
    },
  ] as any

  expect(formatPreviousReviewCommentsArtifact(42, reviews, comments)).toMatchInlineSnapshot(`
    {
      "content": "# Previous Review Comments For PR #42

    reviews: 1
    inline_comments: 2

    ## Reviews

    ### Review 100 by alice at 2026-03-16T10:00:00Z [COMMENTED]

    Please tighten the review.

    ## Thread TOC

    - src/example.ts:12

    ---

    ## src/example.ts:12

    root_comment_id: 10
    review_id: 100
    reviewer: alice
    review_state: COMMENTED
    thread_comments: 2

    \`\`\`diff
    @@ -10,1 +12,1 @@
    \`\`\`

    ### alice at 2026-03-16T10:01:00Z

    comment_id: 10
    reply_to: root
    Consider using a signal here.

    ### bob at 2026-03-16T10:02:00Z

    comment_id: 11
    reply_to: 10
    Agreed, I will change it.
    ",
      "toc": "- src/example.ts:12",
    }
  `)
})
