interface FooterLink {
  label: string
  url: string
}

const CLANK8Y_REPO_URL = 'https://github.com/clank8y/clank8y'
const CUMULOCITY_URL = 'https://cumulocity.com'

export function buildClank8yCommentBody(rawBody: string | undefined, options?: { workflowRunUrl?: string | null }): string {
  const normalizedBody = (rawBody ?? '').trim()

  const footerLinks: FooterLink[] = [
    { label: 'clank8y', url: CLANK8Y_REPO_URL },
    { label: 'cumulocity', url: CUMULOCITY_URL },
  ]

  if (options?.workflowRunUrl) {
    footerLinks.push({ label: 'workflow run', url: options.workflowRunUrl })
  }

  const footer = footerLinks
    .map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`)
    .join(' | ')

  return [
    normalizedBody || '_No summary provided._',
    '',
    `<sub>${footer}</sub>`,
  ].join('\n')
}
