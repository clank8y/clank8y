import { describe, expect, test } from 'vitest'
import { formatTaskIssueArtifact, formatTaskPullRequestArtifact } from '../../src/formatters'

describe('task artifact formatters', () => {
  test('formats issue artifacts with metadata and comments', () => {
    const content = formatTaskIssueArtifact({
      assignees: [{ login: 'alice' }],
      body: 'Issue body',
      html_url: 'https://example.com/issues/1',
      labels: [{ name: 'bug' }],
      number: 1,
      state: 'open',
      title: 'Fix thing',
      user: { login: 'bob' },
    } as any, [{
      body: 'first comment',
      created_at: '2026-04-12T12:00:00Z',
      id: 10,
      user: { login: 'carol' },
    }] as any)

    expect(content).toContain('# Issue #1')
    expect(content).toContain('title: Fix thing')
    expect(content).toContain('### Comment 10 by carol at 2026-04-12T12:00:00Z')
  })

  test('formats pull request artifacts with review threads and issue references', () => {
    const content = formatTaskPullRequestArtifact({
      issueArtifactPaths: ['.clank8y/issues/1.md'],
      prComments: [{
        body: 'pr comment',
        created_at: '2026-04-12T12:00:00Z',
        id: 20,
        user: { login: 'dave' },
      }] as any,
      pullRequest: {
        assignees: [{ login: 'alice' }],
        base: { ref: 'main' },
        body: 'PR body',
        draft: false,
        head: { ref: 'fix/clank8y-thing', sha: 'abc123' },
        html_url: 'https://example.com/pull/2',
        labels: [{ name: 'task' }],
        merged: false,
        number: 2,
        state: 'open',
        title: 'Implement task',
        user: { login: 'bob' },
      } as any,
      reviewThreads: [{
        comments: [{
          author: 'erin',
          body: 'please fix',
          commentId: 30,
          createdAt: '2026-04-12T12:30:00Z',
          diffHunk: '@@ -1 +1 @@',
          pullRequestReviewId: 'review-id',
          replyToCommentId: null,
          reviewAuthor: 'erin',
          reviewState: 'COMMENTED',
          reviewSubmittedAt: '2026-04-12T12:30:00Z',
          url: 'https://example.com/review/comment/30',
        }],
        id: 'thread-1',
        isOutdated: false,
        isResolved: false,
        line: 12,
        originalLine: 12,
        originalStartLine: null,
        path: 'src/index.ts',
        startLine: null,
      }],
    })

    expect(content).toContain('# Pull Request #2')
    expect(content).toContain('## Related Issue Artifacts')
    expect(content).toContain('.clank8y/issues/1.md')
    expect(content).toContain('## Review Threads')
    expect(content).toContain('### Thread thread-1')
  })
})
