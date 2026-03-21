function normalizeSearchTerm(term: string): string {
  return term.replace(/^"+|"+$/g, '').trim().toLowerCase()
}

function quoteSearchTerm(term: string): string {
  return `"${term.replace(/"/g, '')}"`
}

export function extractSearchTerms(query: string): string[] {
  const terms = query
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .map(normalizeSearchTerm)
    .map((term) => term.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
    .filter(Boolean)
    .filter((term) => term.length >= 3)

  return [...new Set(terms)]
}

export function buildRepoIssueSearchQueries(repository: string, query: string): string[] {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ')
  const terms = extractSearchTerms(normalizedQuery)
  const queries: string[] = []

  if (normalizedQuery) {
    queries.push(`repo:${repository} is:open in:title ${quoteSearchTerm(normalizedQuery)}`)
    queries.push(`repo:${repository} is:open in:title,body ${quoteSearchTerm(normalizedQuery)}`)
  }

  if (terms.length > 0) {
    const orTerms = terms.slice(0, 6).map(quoteSearchTerm).join(' OR ')
    queries.push(`repo:${repository} is:open in:title (${orTerms})`)
    queries.push(`repo:${repository} is:open in:title,body (${orTerms})`)
  }

  return [...new Set(queries)]
}
