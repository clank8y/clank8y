/* eslint-disable @typescript-eslint/no-use-before-define */
import type { LocalMCPServer } from '.'
import { Buffer } from 'node:buffer'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { getOctokit } from '../gh'
import {
  getActivePullRequestContext,
  getPullRequestReviewContext,
} from '../setup'
import type { PRFiles } from '../types'
import { tool } from 'tmcp/utils'
import * as v from 'valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { defineTool } from 'tmcp/tool'
import { encode } from '@toon-format/toon'
import { buildClank8yCommentBody } from '../../shared/comment'

interface CachedDiff {
  content: string
  toc: string
}

const DIFF_CHUNK_DEFAULT_LIMIT = 200
const DIFF_CHUNK_MAX_LIMIT = 400
const DIFF_CHUNK_MAX_CHARS = 30_000
const FILE_CHUNK_DEFAULT_LIMIT = 200
const FILE_CHUNK_MAX_LIMIT = 400
const FILE_CHUNK_MAX_CHARS = 30_000
const FILE_FULL_MAX_LINES = 250
const FILE_FULL_MAX_CHARS = 20_000

let _githubMCP: LocalMCPServer | null = null
const prDiffCache = new Map<string, CachedDiff>()

async function getDiffCacheKey(): Promise<string> {
  const pullRequest = getActivePullRequestContext()
  return `${pullRequest.owner}/${pullRequest.repo}#${pullRequest.number}:${pullRequest.headSha}`
}

function padNum(n: number): string {
  return n.toString().padStart(4, ' ')
}

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

function formatFilesWithLineNumbers(files: PRFiles): CachedDiff {
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
        output.push(`| ${padNum(oldLine)} | ---- | - | ${code}`)
        oldLine += 1
      } else if (marker === '+') {
        output.push(`| ---- | ${padNum(newLine)} | + | ${code}`)
        newLine += 1
      } else {
        output.push(`| ${padNum(oldLine)} | ${padNum(newLine)} |   | ${code}`)
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

async function getOrBuildPullRequestDiff(): Promise<CachedDiff> {
  const cacheKey = await getDiffCacheKey()
  const cachedDiff = prDiffCache.get(cacheKey)
  if (cachedDiff) {
    return cachedDiff
  }

  const files = await fetchAllPullRequestFiles()
  const diff = formatFilesWithLineNumbers(files)
  prDiffCache.set(cacheKey, diff)
  return diff
}

export function githubMCP(): LocalMCPServer {
  if (!_githubMCP) {
    _githubMCP = createGitHubMCP()
  }
  return _githubMCP
}

function createGitHubMCP(): LocalMCPServer {
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

  let status: LocalMCPServer['status'] = { state: 'stopped' }

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
        await server.close()
        throw new Error('Failed to start GitHub MCP server')
      }
      const actualUrl = url.endsWith('/') ? `${url}mcp` : `${url}/mcp`

      status = { state: 'running', url: actualUrl }
      return { url: actualUrl, toolNames: githubMcpTools.map((tool) => tool.name) }
    },
    stop: async () => {
      await server.close()
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

const preparePullRequestReviewTool = defineTool({
  name: 'prepare-pull-request-review',
  description: 'Single entrypoint for review setup: PR metadata, file summary, and diff TOC with chunk-read instructions',
  title: 'Prepare Pull Request Review',
}, async () => {
  try {
    const octokit = await getOctokit()
    const pullRequest = getActivePullRequestContext()

    const [{ data: pr }, files] = await Promise.all([
      octokit.rest.pulls.get({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
      }),
      fetchAllPullRequestFiles(),
    ])

    const diff = formatFilesWithLineNumbers(files)
    const cacheKey = await getDiffCacheKey()
    prDiffCache.set(cacheKey, diff)

    const totalDiffLines = diff.content.split('\n').length
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
        totalLines: totalDiffLines,
        toc: diff.toc,
      },
      nextSteps: [
        'Use read-pull-request-diff-chunk with small offset/limit windows, guided by TOC line ranges.',
        'Use get-pull-request-file-content with offset/limit for relevant files only; avoid full=true unless required.',
        'Submit findings with create-pull-request-review.',
      ],
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
    const reviewContext = await getPullRequestReviewContext()
    const pullRequest = getActivePullRequestContext()
    const reviewCommentsInput = comments ?? []
    const reviewBody = buildClank8yCommentBody(
      body === undefined ? undefined : normalizeToolString(body),
      { workflowRunUrl: reviewContext.workflowRun?.url ?? null },
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

const readPullRequestDiffChunkTool = defineTool({
  name: 'read-pull-request-diff-chunk',
  description: 'Read a line range from the cached pull request diff',
  title: 'Read Pull Request Diff Chunk',
  schema: v.pipe(
    v.object({
      offset: v.optional(v.pipe(
        v.number(),
        v.description('1-based starting line number in the cached formatted diff. Defaults to 1.'),
      )),
      limit: v.optional(v.pipe(
        v.number(),
        v.description('Maximum number of lines to return. Defaults to 200 and is capped at 400.'),
      )),
    }),
    v.description('Chunk selection arguments for reading the cached pull request diff.'),
  ),
}, async ({ offset, limit }) => {
  try {
    const diff = await getOrBuildPullRequestDiff()
    const lines = diff.content.split('\n')
    const totalLines = lines.length

    const requestedOffset = offset ?? 1
    const startLine = Math.max(1, requestedOffset)
    const requestedLimit = limit ?? DIFF_CHUNK_DEFAULT_LIMIT
    const normalizedLimit = Math.max(1, Math.min(DIFF_CHUNK_MAX_LIMIT, requestedLimit))
    const endLine = Math.min(totalLines, startLine + normalizedLimit - 1)

    const rawChunk = lines.slice(startLine - 1, endLine).join('\n')
    const chunk = rawChunk.length > DIFF_CHUNK_MAX_CHARS
      ? `${rawChunk.slice(0, DIFF_CHUNK_MAX_CHARS)}\n\n[truncated: chunk exceeded ${DIFF_CHUNK_MAX_CHARS} characters]`
      : rawChunk

    return tool.text([
      `Diff chunk ${startLine}-${endLine} of ${totalLines}`,
      `Remaining lines after this chunk: ${Math.max(0, totalLines - endLine)}`,
      '',
      chunk,
    ].join('\n'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to read pull request diff chunk: ${message}`)
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
  preparePullRequestReviewTool,
  createPullRequestReviewTool,
  readPullRequestDiffChunkTool,
  getPullRequestFileContentTool,
]

mcp.tools(githubMcpTools)
