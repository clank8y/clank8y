import { Buffer } from 'node:buffer'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { encode } from '@toon-format/toon'
import type { Octokit } from 'octokit'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { defineTool } from 'tmcp/tool'
import { tool } from 'tmcp/utils'
import * as v from 'valibot'
import { buildClank8yCommentBody } from '../../../../shared/comment'
import { getOctokit } from '../../../gh'
import type { LocalHTTPMCPServer } from '../../../mcp'
import { getClank8yRuntimeContext } from '../../../setup'
import type { PRFiles } from '../../../types'
import { getReviewArtifactPaths, writeDiffArtifact, writeReviewCommentsArtifact } from '../../../utils/artifacts'
import { formatFilesWithLineNumbers, formatPreviousReviewCommentsArtifact, normalizeToolString } from '../../../formatters'
import { getActivePullRequestContext, setPullRequestContext } from '../context'

type PullRequestReviews = Awaited<ReturnType<Octokit['rest']['pulls']['listReviews']>>['data']
type PullRequestReviewComments = Awaited<ReturnType<Octokit['rest']['pulls']['listReviewComments']>>['data']

export const SET_PULL_REQUEST_CONTEXT_TOOL_NAME = 'set-pull-request-context'
export const PREPARE_PULL_REQUEST_REVIEW_TOOL_NAME = 'prepare-pull-request-review'
export const CREATE_PULL_REQUEST_REVIEW_TOOL_NAME = 'create-pull-request-review'
export const GET_PULL_REQUEST_FILE_CONTENT_TOOL_NAME = 'get-pull-request-file-content'
export const CREATE_PULL_REQUEST_COMMENT_TOOL_NAME = 'create-pull-request-comment'

const FILE_CHUNK_DEFAULT_LIMIT = 200
const FILE_CHUNK_MAX_LIMIT = 400
const FILE_CHUNK_MAX_CHARS = 30_000
const FILE_FULL_MAX_LINES = 250
const FILE_FULL_MAX_CHARS = 20_000

async function fetchAllPullRequestFiles(): Promise<PRFiles> {
  const octokit = await getOctokit()
  const pullRequest = getActivePullRequestContext()

  return await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })
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

export function reviewGitHubMCP(): LocalHTTPMCPServer {
  const mcp = new McpServer({
    name: 'clank8y-review-github-mcp',
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

  const githubMcpTools = [
    defineTool({
      name: SET_PULL_REQUEST_CONTEXT_TOOL_NAME,
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
    }),

    defineTool({
      name: PREPARE_PULL_REQUEST_REVIEW_TOOL_NAME,
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
    }),

    defineTool({
      name: CREATE_PULL_REQUEST_REVIEW_TOOL_NAME,
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
          event: 'COMMENT',
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
    }),

    defineTool({
      name: GET_PULL_REQUEST_FILE_CONTENT_TOOL_NAME,
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
    }),

    defineTool({
      name: CREATE_PULL_REQUEST_COMMENT_TOOL_NAME,
      description: `Post a simple comment on the pull request. Use this instead of ${CREATE_PULL_REQUEST_REVIEW_TOOL_NAME} when you have no inline review findings to submit — for example when the diff is clean or all issues are already covered by open review comments.`,
      title: 'Create Pull Request Comment',
      schema: v.pipe(
        v.object({
          body: v.pipe(
            v.string(),
            v.description('The comment body. Briefly explain why no review was submitted (e.g. no issues found, all issues already covered by open comments). Do not wrap the value in quotation marks.'),
          ),
        }),
        v.description('Payload for posting a simple PR comment without a formal review.'),
      ),
    }, async ({ body }) => {
      try {
        const octokit = await getOctokit()
        const runtimeContext = getClank8yRuntimeContext()
        const pullRequest = getActivePullRequestContext()
        const commentBody = buildClank8yCommentBody(
          normalizeToolString(body),
          { workflowRunUrl: runtimeContext.runInfo?.url ?? null },
        )

        const result = await octokit.rest.issues.createComment({
          owner: pullRequest.owner,
          repo: pullRequest.repo,
          issue_number: pullRequest.number,
          body: commentBody,
        })

        return tool.text(encode({
          success: true,
          comment_id: result.data.id,
          url: result.data.html_url,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create pull request comment: ${message}`)
      }
    }),
  ]

  mcp.tools(githubMcpTools)

  const transport = new HttpTransport(mcp, {
    path: '/mcp',
  })

  const server = serve({
    manual: true,
    port: 0,
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
    serverType: 'http',
    allowedTools: githubMcpTools.map((tool) => tool.name),
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
