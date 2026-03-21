import { describe, expect, test } from 'vitest'
import { buildRepoIssueSearchQuery } from '../../../src/utils/githubSearch'

describe('incidentFix GitHub search query helpers', () => {
  test('adds repository scope to a normal GitHub search fragment', () => {
    expect(buildRepoIssueSearchQuery('schplitt/realtime-globe-c8y', 'is:open in:title,body "has valid position"')).toBe(
      'repo:schplitt/realtime-globe-c8y is:open in:title,body "has valid position"',
    )
  })

  test('preserves mixed issue and pull request qualifiers exactly as provided', () => {
    expect(buildRepoIssueSearchQuery('owner/repo', 'is:pull-request is:closed head:fix/clank8y-has-valid-position')).toBe(
      'repo:owner/repo is:pull-request is:closed head:fix/clank8y-has-valid-position',
    )
  })

  test('rejects empty queries', () => {
    expect(() => buildRepoIssueSearchQuery('owner/repo', '   ')).toThrow('must not be empty')
  })
})
