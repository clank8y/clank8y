function normalizeGitHubIssueQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ')
}

export function buildRepoIssueSearchQuery(repository: string, query: string): string {
  const normalizedQuery = normalizeGitHubIssueQuery(query)
  if (!normalizedQuery) {
    throw new Error('GitHub issue search query must not be empty.')
  }

  return `repo:${repository} ${normalizedQuery}`
}
