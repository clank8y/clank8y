import { describe, expect, test } from 'vitest'
import { buildRepoIssueSearchQueries, extractSearchTerms } from '../../../src/utils/githubSearch'

describe('incidentFix GitHub search query helpers', () => {
  test('extracts unique raw search terms', () => {
    expect(extractSearchTerms('lat undefined createPlaybackEvent measurement measurement')).toEqual([
      'lat',
      'undefined',
      'create',
      'playback',
      'event',
      'measurement',
    ])
  })

  test('builds exact-title, exact-body, and OR queries for GitHub search', () => {
    expect(buildRepoIssueSearchQueries('schplitt/realtime-globe-c8y', 'lat undefined createPlaybackEvent measurement')).toEqual([
      'repo:schplitt/realtime-globe-c8y is:open in:title "lat undefined createPlaybackEvent measurement"',
      'repo:schplitt/realtime-globe-c8y is:open in:title,body "lat undefined createPlaybackEvent measurement"',
      'repo:schplitt/realtime-globe-c8y is:open in:title ("lat" OR "undefined" OR "create" OR "playback" OR "event" OR "measurement")',
      'repo:schplitt/realtime-globe-c8y is:open in:title,body ("lat" OR "undefined" OR "create" OR "playback" OR "event" OR "measurement")',
    ])
  })

  test('deduplicates equivalent whitespace in phrase query', () => {
    expect(buildRepoIssueSearchQueries('owner/repo', '  measurement   display  TypeError ')).toEqual([
      'repo:owner/repo is:open in:title "measurement display TypeError"',
      'repo:owner/repo is:open in:title,body "measurement display TypeError"',
      'repo:owner/repo is:open in:title ("measurement" OR "display" OR "type" OR "error")',
      'repo:owner/repo is:open in:title,body ("measurement" OR "display" OR "type" OR "error")',
    ])
  })
})
