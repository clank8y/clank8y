/* eslint-disable @typescript-eslint/no-use-before-define */
import type { LocalHTTPMCPServer } from '.'
import { Buffer } from 'node:buffer'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import type { Octokit } from 'octokit'
import { getOctokit } from '../gh'
import {
  getActivePullRequestContext,
  getClank8yRuntimeContext,
  setPullRequestContext,
} from '../setup'
import type { PRFiles } from '../types'
import { tool } from 'tmcp/utils'
import * as v from 'valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { defineTool } from 'tmcp/tool'
import { encode } from '@toon-format/toon'
import { buildClank8yCommentBody } from '../../shared/comment'
import { writeDiffArtifact, writeReviewCommentsArtifact, getReviewArtifactPaths } from '../utils/artifacts'

interface CachedDiff {
  content: string
  toc: string
}

interface FormattedArtifact {
  content: string
  toc: string
}

type PullRequestReviews = Awaited<ReturnType<Octokit['rest']['pulls']['listReviews']>>['data']
type PullRequestReviewComments = Awaited<ReturnType<Octokit['rest']['pulls']['listReviewComments']>>['data']

const FILE_CHUNK_DEFAULT_LIMIT = 200
const FILE_CHUNK_MAX_LIMIT = 400
const FILE_CHUNK_MAX_CHARS = 30_000
const FILE_FULL_MAX_LINES = 250
const FILE_FULL_MAX_CHARS = 20_000

let _githubMCP: LocalHTTPMCPServer | null = null

function normalizeEscapedNewlines(text: string): string {
  return text.replace(/\\r\\n|\\n|\\r/g, (match) => {
    if (match === '\\r\\n') {
      return '\r\n'
    }

    return '\n'
  })
}

function stripSurroundingQuotes(text: string): string {
  let result = text
  if (result.startsWith('"'))
    result = result.slice(1)
  if (result.endsWith('"'))
    result = result.slice(0, -1)
  return result
}

function normalizeToolString(text: string): string {
  return normalizeEscapedNewlines(stripSurroundingQuotes(text))
}

async function fetchAllPullRequestFiles(): Promise<PRFiles> {
  const octokit = await getOctokit()
  const pullRequest = getActivePullRequestContext()

  const allFiles: PRFiles = []
  let page = 1

  while (true) {
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      page,
      per_page: 100,
    })

    allFiles.push(...files)
    if (files.length < 100) {
      break
    }

    page += 1
  }

  return allFiles
}

async function fetchAllPullRequestReviews(): Promise<PullRequestReviews> {
  const octokit = await getOctokit()
  const pullRequest = getActivePullRequestContext()

  return await octokit.paginate(octokit.rest.pulls.listReviews, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })
}

async function fetchAllPullRequestReviewComments(): Promise<PullRequestReviewComments> {
  const octokit = await getOctokit()
  const pullRequest = getActivePullRequestContext()

  return await octokit.paginate(octokit.rest.pulls.listReviewComments, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })
}

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

export function formatFilesWithLineNumbers(files: PRFiles): CachedDiff {
  const output: string[] = []
  const tocEntries: string[] = []
  let currentLine = 1

  for (const file of files) {
    const fileStartLine = currentLine

    output.push(`## ${file.filename}`)
    output.push(`status: ${file.status}, +${file.additions}/-${file.deletions}`)
    currentLine += 2

    if (!file.patch) {
      output.push('(binary file or no textual patch available)')
      output.push('')
      currentLine += 2
      tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`)
      continue
    }

    const lines = file.patch.split('\n')
    let oldLine = 0
    let newLine = 0

    for (const line of lines) {
      const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (hunkMatch) {
        const oldStart = hunkMatch[1]
        const newStart = hunkMatch[2]
        if (!oldStart || !newStart) {
          continue
        }

        oldLine = Number.parseInt(oldStart, 10)
        newLine = Number.parseInt(newStart, 10)
        output.push(line)
        currentLine += 1
        continue
      }

      const marker = line[0] ?? ' '
      const code = line.slice(1)

      if (marker === '-') {
        output.push(`|${oldLine}|-|${code}`)
        oldLine += 1
      } else if (marker === '+') {
        output.push(`|${newLine}|+|${code}`)
        newLine += 1
      } else {
        output.push(`|${oldLine}|${newLine}||${code}`)
        oldLine += 1
        newLine += 1
      }

      currentLine += 1
    }

    output.push('')
    currentLine += 1
    tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`)
  }

  const toc = ['# TOC', ...tocEntries, ''].join('\n')
  const content = `${toc}${output.join('\n')}`

  return {
    content,
    toc,
  }
}

export function githubMCP(): LocalHTTPMCPServer {
  if (!_githubMCP) {
    _githubMCP = createGitHubMCP()
  }
  return _githubMCP
}

function createGitHubMCP(): LocalHTTPMCPServer {
  const transport = new HttpTransport(mcp, {
    path: '/mcp',
  })

  const server = serve({
    manual: true,
    port: 0, // Use a random available port
    fetch: async (req) => {
      const response = await transport.respond(req)
      if (!response) {
        return new FastResponse('Not found', { status: 404 })
      }

      return response
    },
  })

  let status: LocalHTTPMCPServer['status'] = { state: 'stopped' }

  return {
    serverType: 'http' as const,
    allowedTools: ['*'],
    get status() {
      return status
    },
    start: async () => {
      await server.serve()
      const { url } = await server.ready()
      if (!url) {
        await server.close(true)
        throw new Error('Failed to start GitHub MCP server')
      }
      const actualUrl = url.endsWith('/') ? `${url}mcp` : `${url}/mcp`

      status = { state: 'running', url: actualUrl }
      return { url: actualUrl, toolNames: githubMcpTools.map((tool) => tool.name) }
    },
    stop: async () => {
      await server.close(true)
      status = { state: 'stopped' }
    },
  }
}

export const mcp = new McpServer({
  name: 'clank8y-github-mcp',
  description: 'A MCP server that helps you complete pull request reviews',
  version: '1.0.0',
}, {
  adapter: new ValibotJsonSchemaAdapter(),
  capabilities: {
    tools: {
      listChanged: true,
    },
  },
})

const setPullRequestContextTool = defineTool({
  name: 'set-pull-request-context',
  description: 'Set the pull request context for the current review session. Call this before any other pull request tools and provide the repository plus pull request number from the prompt context.',
  title: 'Set Pull Request Context',
  schema: v.pipe(
    v.object({
      repository: v.pipe(
        v.string(),
        v.description('Repository in owner/repo format for the pull request to review.'),
      ),
      pr_number: v.pipe(
        v.number(),
        v.description('The pull request number to set as the active review context.'),
      ),
    }),
    v.description('Arguments for selecting the active pull request before any review-specific GitHub MCP tools are used.'),
  ),
}, async ({ repository, pr_number }) => {
  try {
    const pullRequest = await setPullRequestContext({
      repository,
      prNumber: pr_number,
    })

    return tool.structured({
      success: true,
      context: {
        repository: `${pullRequest.owner}/${pullRequest.repo}`,
        pullRequestNumber: pullRequest.number,
        baseRef: pullRequest.baseRef,
        headRef: pullRequest.headRef,
      },
      pullRequest: {
        number: pullRequest.number,
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        headRef: pullRequest.headRef,
        headSha: pullRequest.headSha,
        baseRef: pullRequest.baseRef,
        baseSha: pullRequest.baseSha,
      },
    } as any)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to set pull request context: ${message}`)
  }
})

const preparePullRequestReviewTool = defineTool({
  name: 'prepare-pull-request-review',
  description: 'Single entrypoint for review setup: PR metadata, file summary, and diff TOC with chunk-read instructions',
  title: 'Prepare Pull Request Review',
}, async () => {
  try {
    const octokit = await getOctokit()
    const pullRequest = getActivePullRequestContext()

    const [{ data: pr }, files, reviews, reviewComments] = await Promise.all([
      octokit.rest.pulls.get({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
      }),
      fetchAllPullRequestFiles(),
      fetchAllPullRequestReviews(),
      fetchAllPullRequestReviewComments(),
    ])

    const artifactPaths = getReviewArtifactPaths()
    const diff = formatFilesWithLineNumbers(files)
    await writeDiffArtifact(diff.content)

    const previousReviewComments = formatPreviousReviewCommentsArtifact(pr.number, reviews, reviewComments)
    const reviewCommentsPath = await writeReviewCommentsArtifact(previousReviewComments.content)

    const fileSummaries = files.map((file) => ({
      path: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      hasPatch: !!file.patch,
    }))

    return tool.structured({
      pullRequest: {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        url: pr.html_url,
        state: pr.state,
        draft: pr.draft,
        merged: pr.merged,
        author: pr.user?.login ?? null,
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        labels: pr.labels.map((label) => typeof label === 'string' ? label : label.name),
        assignees: pr.assignees?.map((assignee) => assignee.login) ?? [],
        isFork: pr.head.repo?.full_name !== pr.base.repo.full_name,
      },
      files: {
        count: fileSummaries.length,
        summary: fileSummaries,
      },
      diff: {
        path: artifactPaths.diffPath,
        instructions: 'Read the TOC at the top first to map files to line ranges. Then work through file groups selectively. Use rg or grep on this file to search for repeated patterns.',
      },
      previousReviews: {
        path: reviewCommentsPath,
        reviewCount: reviews.length,
        inlineCommentCount: reviewComments.length,
        toc: previousReviewComments.toc,
        instructions: 'Read this separate artifact to see previous review bodies and inline comment history, including who wrote what and when. Use it to avoid repeating already-given feedback unless the new diff introduces a new instance of the same problem.',
      },
    } as any)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to prepare pull request review context: ${message}`)
  }
})

const createPullRequestReviewTool = defineTool({
  name: 'create-pull-request-review',
  description: 'Submit a review for the current pull request with optional inline comments',
  title: 'Create Pull Request Review',
  schema: v.pipe(
    v.object({
      body: v.optional(v.pipe(
        v.string(),
        v.description('1-2 sentence summary for the review. Put most actionable feedback in inline comments. Do not wrap the value in quotation marks.'),
      )),
      commit_id: v.optional(v.pipe(
        v.string(),
        v.description('Optional commit SHA for the review. Defaults to current PR head SHA.'),
      )),
      comments: v.optional(v.pipe(
        v.array(v.pipe(
          v.object({
            path: v.pipe(
              v.string(),
              v.description('Path of the file to comment on, relative to repository root.'),
            ),
            line: v.pipe(
              v.number(),
              v.description('End line of the comment range in the diff (new file line numbering).'),
            ),
            start_line: v.optional(v.pipe(
              v.number(),
              v.description('Start line of the comment range. For single-line comments, set equal to line.'),
            )),
            side: v.optional(v.pipe(
              v.picklist(['LEFT', 'RIGHT']),
              v.description('Diff side: LEFT for old/deleted lines, RIGHT for new/unchanged lines. Defaults to RIGHT.'),
            )),
            body: v.optional(v.pipe(
              v.string(),
              v.description('Explanatory comment text. Optional if suggestion is provided.'),
            )),
            suggestion: v.optional(v.pipe(
              v.string(),
              v.description('Replacement code for [start_line, line]. Must preserve indentation.'),
            )),
          }),
          v.description('Single inline review comment payload.'),
        )),
        v.description('Inline review comments. Use these for line-level feedback in the diff.'),
      )),
    }),
    v.description('Payload for submitting a pull request review in one API call.'),
  ),
}, async ({ body, commit_id, comments }) => {
  try {
    const octokit = await getOctokit()
    const runtimeContext = getClank8yRuntimeContext()
    const pullRequest = getActivePullRequestContext()
    const reviewCommentsInput = comments ?? []
    const reviewBody = buildClank8yCommentBody(
      body === undefined ? undefined : normalizeToolString(body),
      { workflowRunUrl: runtimeContext.runInfo?.url ?? null },
    )

    let commitSha = commit_id
    if (!commitSha) {
      const { data: pr } = await octokit.rest.pulls.get({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
      })
      commitSha = pr.head.sha
    }

    const apiComments = reviewCommentsInput.map((comment) => {
      const side = comment.side ?? 'RIGHT'
      const startLine = comment.start_line ?? comment.line

      let commentBody = normalizeToolString(comment.body ?? '')
      if (comment.suggestion !== undefined) {
        const suggestionBlock = `\`\`\`suggestion\n${normalizeToolString(comment.suggestion)}\n\`\`\``
        commentBody = commentBody
          ? `${commentBody}\n\n${suggestionBlock}`
          : suggestionBlock
      }

      return {
        path: comment.path,
        line: comment.line,
        side,
        body: commentBody,
        start_line: startLine,
        start_side: side,
      }
    })

    const params: {
      owner: string
      repo: string
      pull_number: number
      event: 'COMMENT'
      commit_id: string
      body?: string
      comments?: Array<{
        path: string
        line: number
        side: 'LEFT' | 'RIGHT'
        body: string
        start_line: number
        start_side: 'LEFT' | 'RIGHT'
      }>
    } = {
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      event: 'COMMENT' as const,
      commit_id: commitSha,
    }

    params.body = reviewBody
    if (apiComments.length > 0) {
      params.comments = apiComments
    }

    const result = await octokit.rest.pulls.createReview(params)

    return tool.text(encode({
      success: true,
      review_id: result.data.id,
      state: result.data.state,
      url: result.data.html_url,
      submitted_at: result.data.submitted_at,
      comment_count: apiComments.length,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to create pull request review: ${message}`)
  }
})

const getPullRequestFileContentTool = defineTool({
  name: 'get-pull-request-file-content',
  description: 'Get content for a changed pull request file, with chunked reads by default',
  title: 'Get Pull Request File Content',
  schema: v.pipe(
    v.object({
      filename: v.pipe(
        v.string(),
        v.description('Path of a file changed in the current pull request.'),
      ),
      offset: v.optional(v.pipe(
        v.number(),
        v.description('1-based starting line number for chunked file reads. Defaults to 1.'),
      )),
      limit: v.optional(v.pipe(
        v.number(),
        v.description('Maximum number of lines to return for chunked reads. Defaults to 200 and is capped at 400.'),
      )),
      full: v.optional(v.pipe(
        v.boolean(),
        v.description('Return full file content when true. Allowed only for small files (max 250 lines and 20,000 characters).'),
      )),
    }),
    v.description('Arguments for fetching the head-version content of a changed pull request file with optional chunking.'),
  ),
}, async ({ filename, offset, limit, full }) => {
  try {
    const octokit = await getOctokit()
    const pullRequest = getActivePullRequestContext()
    const files = await fetchAllPullRequestFiles()

    const file = files.find((f) => f.filename === filename)
    if (!file) {
      return tool.error(`File ${filename} not found in pull request`)
    }

    const { data: content } = await octokit.rest.repos.getContent({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      path: filename,
      ref: pullRequest.headSha,
    })

    if (Array.isArray(content)) {
      return tool.error(`Path ${filename} resolved to a directory, expected a file`)
    }

    if (!('content' in content) || !content.content) {
      return tool.error(`No textual content available for ${filename}`)
    }

    const encoding = content.encoding === 'base64' ? 'base64' : 'utf-8'
    const decodedContent = Buffer.from(content.content, encoding).toString('utf-8')
    const lines = decodedContent.split('\n')
    const totalLines = lines.length

    if (full) {
      if (totalLines > FILE_FULL_MAX_LINES || decodedContent.length > FILE_FULL_MAX_CHARS) {
        return tool.error([
          `Refusing full file read for ${filename}.`,
          `Hard limits: <= ${FILE_FULL_MAX_LINES} lines and <= ${FILE_FULL_MAX_CHARS} characters.`,
          `Actual: ${totalLines} lines, ${decodedContent.length} characters.`,
          'Use chunked reads with offset + limit instead.',
        ].join(' '))
      }

      return tool.text(decodedContent)
    }

    const requestedOffset = offset ?? 1
    const startLine = Math.max(1, requestedOffset)
    const requestedLimit = limit ?? FILE_CHUNK_DEFAULT_LIMIT
    const normalizedLimit = Math.max(1, Math.min(FILE_CHUNK_MAX_LIMIT, requestedLimit))
    const endLine = Math.min(totalLines, startLine + normalizedLimit - 1)
    const rawChunk = lines.slice(startLine - 1, endLine).join('\n')
    const chunk = rawChunk.length > FILE_CHUNK_MAX_CHARS
      ? `${rawChunk.slice(0, FILE_CHUNK_MAX_CHARS)}\n\n[truncated: chunk exceeded ${FILE_CHUNK_MAX_CHARS} characters]`
      : rawChunk

    return tool.text([
      `File chunk ${startLine}-${endLine} of ${totalLines} for ${filename}`,
      `Remaining lines after this chunk: ${Math.max(0, totalLines - endLine)}`,
      '',
      chunk,
    ].join('\n'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to load PR file content: ${message}`)
  }
})

export const githubMcpTools = [
  setPullRequestContextTool,
  preparePullRequestReviewTool,
  createPullRequestReviewTool,
  getPullRequestFileContentTool,
]

mcp.tools(githubMcpTools)
