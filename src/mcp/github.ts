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
  lines: string[]
}

// ─── Staged review state ──────────────────────────────────────────────────────

interface StagedComment {
  path: string
  line: number
  start_line?: number
  side: 'LEFT' | 'RIGHT'
  body: string
  suggestion?: string
  severity: 'high' | 'medium' | 'low'
}

const stagedComments: StagedComment[] = []
const reviewedFiles = new Set<string>()

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
const prFilesCache = new Map<string, PRFiles>()
const fileContentCache = new Map<string, string>()

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
  const cacheKey = await getDiffCacheKey()
  const cached = prFilesCache.get(cacheKey)
  if (cached)
    return cached

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

  prFilesCache.set(cacheKey, allFiles)
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
    lines: content.split('\n'),
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

    const totalDiffLines = diff.lines.length
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
        'Use search-pull-request-diff to find patterns across the entire diff (e.g. lodash imports, @Input() decorators).',
        'Use read-pull-request-diff-chunk with small offset/limit windows, guided by TOC line ranges.',
        'Use get-pull-request-file-content with offset/limit for relevant files only; avoid full=true unless required.',
        'Stage findings with stage-review-comment as you go — do not hold findings in memory.',
        'Use get-review-progress to track which files you have reviewed and what is pending.',
        'When done, call submit-staged-review to push all staged findings as a single review.',
      ],
    } as any)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to prepare pull request review context: ${message}`)
  }
})

const SEARCH_MAX_RESULTS = 50
const SEARCH_CONTEXT_LINES = 2

const searchPullRequestDiffTool = defineTool({
  name: 'search-pull-request-diff',
  description: 'Search the full cached pull request diff for a regex or text pattern. Returns matching lines with file context. Use this to find recurring patterns across all files (e.g. lodash imports, @Input() decorators, BehaviorSubject usage).',
  title: 'Search Pull Request Diff',
  schema: v.pipe(
    v.object({
      pattern: v.pipe(
        v.string(),
        v.description('Regex pattern to search for (case-insensitive). Example: "@Input\\\\(\\\\)", "_.get", "BehaviorSubject".'),
      ),
      max_results: v.optional(v.pipe(
        v.number(),
        v.description(`Maximum matches to return. Defaults to ${SEARCH_MAX_RESULTS}.`),
      )),
    }),
    v.description('Search arguments for querying the cached pull request diff.'),
  ),
}, async ({ pattern, max_results }) => {
  try {
    const diff = await getOrBuildPullRequestDiff()
    const lines = diff.lines
    const limit = Math.max(1, Math.min(max_results ?? SEARCH_MAX_RESULTS, 200))

    let regex: RegExp
    try {
      regex = new RegExp(pattern, 'i')
    } catch {
      return tool.error(`Invalid regex pattern: ${pattern}`)
    }

    interface SearchMatch {
      diffLine: number
      file: string
      text: string
      context: string[]
    }

    const results: SearchMatch[] = []
    let currentFile = '(unknown)'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const fileHeader = line.match(/^## (.+)$/)
      if (fileHeader?.[1]) {
        currentFile = fileHeader[1]
        continue
      }

      if (regex.test(line)) {
        const contextStart = Math.max(0, i - SEARCH_CONTEXT_LINES)
        const contextEnd = Math.min(lines.length - 1, i + SEARCH_CONTEXT_LINES)
        const context = lines.slice(contextStart, contextEnd + 1)

        results.push({
          diffLine: i + 1,
          file: currentFile,
          text: line,
          context,
        })

        if (results.length >= limit)
          break
      }
    }

    if (results.length === 0) {
      return tool.text(`No matches for pattern: ${pattern}`)
    }

    const formatted = results.map((r) => [
      `### ${r.file} (diff line ${r.diffLine})`,
      '```',
      ...r.context,
      '```',
    ].join('\n')).join('\n\n')

    return tool.text([
      `Found ${results.length} match${results.length === 1 ? '' : 'es'} for: ${pattern}`,
      '',
      formatted,
    ].join('\n'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to search pull request diff: ${message}`)
  }
})

const stageReviewCommentTool = defineTool({
  name: 'stage-review-comment',
  description: 'Stage a review finding for later submission. Findings are stored server-side — call this as you review each file so findings do not consume your context window. Call submit-staged-review when done.',
  title: 'Stage Review Comment',
  schema: v.pipe(
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
        v.description('Start line of the comment range. For single-line comments, omit or set equal to line.'),
      )),
      side: v.optional(v.pipe(
        v.picklist(['LEFT', 'RIGHT']),
        v.description('Diff side: LEFT for old/deleted lines, RIGHT for new/unchanged lines. Defaults to RIGHT.'),
      )),
      body: v.pipe(
        v.string(),
        v.description('Explanatory comment text with actionable feedback.'),
      ),
      suggestion: v.optional(v.pipe(
        v.string(),
        v.description('Replacement code for [start_line, line]. Must preserve indentation.'),
      )),
      severity: v.pipe(
        v.picklist(['high', 'medium', 'low']),
        v.description('Severity of the finding: high (security/runtime errors), medium (non-idiomatic/missing platform utility), low (style/minor improvement).'),
      ),
      mark_file_reviewed: v.optional(v.pipe(
        v.boolean(),
        v.description('Mark this file as reviewed after staging this comment. Defaults to false. Set to true when this is the last finding for the file.'),
      )),
    }),
    v.description('Payload for staging a single review finding.'),
  ),
}, async ({ path, line, start_line, side, body, suggestion, severity, mark_file_reviewed }) => {
  try {
    const comment: StagedComment = {
      path,
      line,
      side: side ?? 'RIGHT',
      body: normalizeToolString(body),
      severity,
    }
    if (start_line !== undefined)
      comment.start_line = start_line
    if (suggestion !== undefined)
      comment.suggestion = normalizeToolString(suggestion)
    stagedComments.push(comment)

    if (mark_file_reviewed) {
      reviewedFiles.add(path)
    }

    return tool.text(encode({
      success: true,
      staged_count: stagedComments.length,
      file: path,
      severity,
      reviewed_files: reviewedFiles.size,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to stage review comment: ${message}`)
  }
})

const markFileReviewedTool = defineTool({
  name: 'mark-file-reviewed',
  description: 'Mark one or more files as reviewed (no findings). Use this for files you inspected but found no issues in.',
  title: 'Mark File Reviewed',
  schema: v.pipe(
    v.object({
      paths: v.pipe(
        v.array(v.string()),
        v.description('File paths to mark as reviewed.'),
      ),
    }),
    v.description('Mark files as reviewed with no findings.'),
  ),
}, async ({ paths }) => {
  for (const p of paths) {
    reviewedFiles.add(p)
  }

  return tool.text(encode({
    success: true,
    marked: paths,
    reviewed_files: reviewedFiles.size,
  }))
})

const getReviewProgressTool = defineTool({
  name: 'get-review-progress',
  description: 'Get current review progress: which files are reviewed, which are pending, and a summary of all staged findings. Use this to track progress and spot patterns across files.',
  title: 'Get Review Progress',
}, async () => {
  try {
    const diff = await getOrBuildPullRequestDiff()
    const tocLines = diff.toc.split('\n')
    const allFiles = tocLines
      .filter((line) => line.startsWith('- '))
      .map((line) => {
        const match = line.match(/^- (.+?) -> lines/)
        return match?.[1] ?? null
      })
      .filter((f): f is string => f !== null)

    const pending = allFiles.filter((f) => !reviewedFiles.has(f))

    const findingsByFile = new Map<string, Array<{ severity: string, line: number, bodyPreview: string }>>()
    for (const comment of stagedComments) {
      const existing = findingsByFile.get(comment.path) ?? []
      existing.push({
        severity: comment.severity,
        line: comment.line,
        bodyPreview: comment.body.slice(0, 120),
      })
      findingsByFile.set(comment.path, existing)
    }

    const severityCounts = { high: 0, medium: 0, low: 0 }
    for (const comment of stagedComments) {
      severityCounts[comment.severity]++
    }

    return tool.structured({
      progress: {
        total_files: allFiles.length,
        reviewed: reviewedFiles.size,
        pending: pending.length,
      },
      staged_findings: {
        total: stagedComments.length,
        by_severity: severityCounts,
        by_file: Object.fromEntries(findingsByFile),
      },
      pending_files: pending,
      reviewed_files: [...reviewedFiles],
    } as any)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to get review progress: ${message}`)
  }
})

const submitStagedReviewTool = defineTool({
  name: 'submit-staged-review',
  description: 'Submit all staged findings as a single pull request review. This compiles every staged comment into one API call. Call this once at the end of your review.',
  title: 'Submit Staged Review',
  schema: v.pipe(
    v.object({
      body: v.optional(v.pipe(
        v.string(),
        v.description('1-2 sentence summary for the review. Staged findings become inline comments automatically. Do not wrap the value in quotation marks.'),
      )),
    }),
    v.description('Payload for submitting the staged review.'),
  ),
}, async ({ body }) => {
  try {
    const octokit = await getOctokit()
    const reviewContext = await getPullRequestReviewContext()
    const pullRequest = getActivePullRequestContext()
    const reviewBody = buildClank8yCommentBody(
      body === undefined ? undefined : normalizeToolString(body),
      { workflowRunUrl: reviewContext.workflowRun?.url ?? null },
    )

    const { data: pr } = await octokit.rest.pulls.get({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
    })
    const commitSha = pr.head.sha

    const apiComments = stagedComments.map((comment) => {
      const startLine = comment.start_line ?? comment.line

      let commentBody = comment.body
      if (comment.suggestion !== undefined) {
        const suggestionBlock = `\`\`\`suggestion\n${comment.suggestion}\n\`\`\``
        commentBody = commentBody
          ? `${commentBody}\n\n${suggestionBlock}`
          : suggestionBlock
      }

      return {
        path: comment.path,
        line: comment.line,
        side: comment.side,
        body: commentBody,
        start_line: startLine,
        start_side: comment.side,
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

    // Clear staged state after successful submission
    const submittedCount = stagedComments.length
    stagedComments.length = 0
    reviewedFiles.clear()

    return tool.text(encode({
      success: true,
      review_id: result.data.id,
      state: result.data.state,
      url: result.data.html_url,
      submitted_at: result.data.submitted_at,
      comment_count: submittedCount,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return tool.error(`Failed to submit staged review: ${message}`)
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
    const lines = diff.lines
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
    const pullRequest = getActivePullRequestContext()
    const files = await fetchAllPullRequestFiles()

    const file = files.find((f) => f.filename === filename)
    if (!file) {
      return tool.error(`File ${filename} not found in pull request`)
    }

    const contentCacheKey = `${pullRequest.owner}/${pullRequest.repo}@${pullRequest.headSha}:${filename}`
    let decodedContent = fileContentCache.get(contentCacheKey)

    if (decodedContent === undefined) {
      const octokit = await getOctokit()
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
      decodedContent = Buffer.from(content.content, encoding).toString('utf-8')
      fileContentCache.set(contentCacheKey, decodedContent)
    }
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
  searchPullRequestDiffTool,
  stageReviewCommentTool,
  markFileReviewedTool,
  getReviewProgressTool,
  submitStagedReviewTool,
  readPullRequestDiffChunkTool,
  getPullRequestFileContentTool,
]

mcp.tools(githubMcpTools)
