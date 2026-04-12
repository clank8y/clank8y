import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { defineTool } from 'tmcp/tool'
import { tool } from 'tmcp/utils'
import * as v from 'valibot'
import { buildClank8yCommentBody } from '../../../../shared/comment'
import { formatFilesWithLineNumbers, formatTaskIssueArtifact, formatTaskPullRequestArtifact, normalizeToolString } from '../../../formatters'
import { getOctokit } from '../../../gh'
import type { LocalHTTPMCPServer } from '../../../mcp'
import { getClank8yRuntimeContext } from '../../../setup'
import type { PRFiles } from '../../../types'
import {
  getIssueArtifactPath,
  getPullRequestArtifactPath,
  getReportArtifactPath,
  getTaskArtifactPaths,
  writeDiffArtifact,
  writeIssueArtifact,
  writePullRequestArtifact,
} from '../../../utils/artifacts'
import { runClank8yGit } from '../../../utils/git'
import {
  assertPushBranchAllowed,
  cloneRepository,
  fetchRepositoryBranch,
  getRepositoryBranches,
  parseGitHubRepository,
} from '../../../utils/repositories'
import { getActiveTaskContext, setTaskContext, updateTaskContext } from '../context'
import {
  CREATE_BRANCH_TOOL_NAME,
  CREATE_ISSUE_COMMENT_TOOL_NAME,
  CREATE_PULL_REQUEST_COMMENT_TOOL_NAME,
  CREATE_REPO_PULL_REQUEST_TOOL_NAME,
  GET_ISSUE_TOOL_NAME,
  LIST_REPOSITORY_BRANCHES_TOOL_NAME,
  PREPARE_TASK_WORKSPACE_TOOL_NAME,
  PUSH_TASK_BRANCH_TOOL_NAME,
  REPLY_TO_REVIEW_COMMENT_TOOL_NAME,
  RESOLVE_REVIEW_THREAD_TOOL_NAME,
  UPDATE_REPO_PULL_REQUEST_BODY_TOOL_NAME,
} from './constants'

type Issue = Awaited<ReturnType<Awaited<ReturnType<typeof getOctokit>>['rest']['issues']['get']>>['data']
type IssueComments = Awaited<ReturnType<Awaited<ReturnType<typeof getOctokit>>['rest']['issues']['listComments']>>['data']

interface ReviewThreadQueryResult {
  repository: {
    pullRequest: {
      closingIssuesReferences: {
        nodes: Array<{
          number: number
          repository: { nameWithOwner: string } | null
        }>
      }
      reviewThreads: {
        nodes: Array<{
          comments: {
            nodes: Array<{
              author: { login: string } | null
              body: string
              createdAt: string | null
              databaseId: number | null
              diffHunk: string | null
              pullRequestReview: {
                author: { login: string } | null
                id: string | null
                state: string | null
                submittedAt: string | null
              } | null
              replyTo: { databaseId: number | null } | null
              url: string | null
            }>
          }
          id: string
          isOutdated: boolean
          isResolved: boolean
          line: number | null
          originalLine: number | null
          originalStartLine: number | null
          path: string | null
          startLine: number | null
        }>
        pageInfo: {
          endCursor: string | null
          hasNextPage: boolean
        }
      }
    } | null
  } | null
}

type ReviewThreadNode = NonNullable<NonNullable<ReviewThreadQueryResult['repository']>['pullRequest']>['reviewThreads']['nodes'][number]
type ReviewCommentNode = ReviewThreadNode['comments']['nodes'][number]

const REVIEW_THREADS_QUERY = `
  query TaskReviewThreads($owner: String!, $repo: String!, $number: Int!, $after: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        closingIssuesReferences(first: 50) {
          nodes {
            number
            repository {
              nameWithOwner
            }
          }
        }
        reviewThreads(first: 100, after: $after) {
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            startLine
            originalLine
            originalStartLine
            comments(first: 100) {
              nodes {
                databaseId
                url
                body
                createdAt
                diffHunk
                author {
                  login
                }
                replyTo {
                  databaseId
                }
                pullRequestReview {
                  id
                  state
                  submittedAt
                  author {
                    login
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`

function buildInitialTaskReport(params: {
  repository: string
  target: { kind: 'issue', number: number } | { kind: 'pull_request', number: number }
}): string {
  return [
    '# Task Report',
    '',
    '## Request',
    '',
    'Pending agent analysis.',
    '',
    '## Target',
    '',
    `repository: ${params.repository}`,
    `kind: ${params.target.kind}`,
    `number: ${params.target.number}`,
    '',
    '## Plan',
    '',
    'Pending agent plan.',
    '',
    '## Findings',
    '',
    'Pending findings.',
    '',
    '## Changes Made',
    '',
    'Pending changes.',
    '',
    '## Validation',
    '',
    'Pending validation.',
    '',
    '## Remote Actions',
    '',
    'Pending remote actions.',
    '',
    '## Remaining Uncertainty',
    '',
    'Pending uncertainty analysis.',
    '',
    '## Follow-up',
    '',
    'Pending follow-up.',
    '',
  ].join('\n')
}

async function fetchIssueAndComments(repository: { owner: string, repo: string }, issueNumber: number): Promise<{ issue: Issue, comments: IssueComments }> {
  const octokit = await getOctokit()
  const [{ data: issue }, comments] = await Promise.all([
    octokit.rest.issues.get({
      owner: repository.owner,
      repo: repository.repo,
      issue_number: issueNumber,
    }),
    octokit.paginate(octokit.rest.issues.listComments, {
      owner: repository.owner,
      repo: repository.repo,
      issue_number: issueNumber,
      per_page: 100,
    }),
  ])

  return { issue, comments }
}

async function fetchPullRequestReviewThreads(repository: { owner: string, repo: string }, pullRequestNumber: number) {
  const octokit = await getOctokit()
  const reviewThreads: ReviewThreadNode[] = []
  const linkedIssueNumbers = new Set<number>()
  let after: string | null = null

  while (true) {
    const result: ReviewThreadQueryResult = await octokit.graphql(REVIEW_THREADS_QUERY, {
      owner: repository.owner,
      repo: repository.repo,
      number: pullRequestNumber,
      after,
    })

    const pullRequest = result.repository?.pullRequest
    if (!pullRequest) {
      break
    }

    for (const linkedIssue of pullRequest.closingIssuesReferences.nodes) {
      if (linkedIssue.repository?.nameWithOwner === `${repository.owner}/${repository.repo}`) {
        linkedIssueNumbers.add(linkedIssue.number)
      }
    }

    reviewThreads.push(...pullRequest.reviewThreads.nodes)

    if (!pullRequest.reviewThreads.pageInfo.hasNextPage) {
      break
    }

    after = pullRequest.reviewThreads.pageInfo.endCursor
  }

  return {
    linkedIssueNumbers: [...linkedIssueNumbers].sort((left, right) => left - right),
    reviewThreads: reviewThreads.map((thread: ReviewThreadNode) => ({
      comments: thread.comments.nodes.map((comment: ReviewCommentNode) => ({
        author: comment.author?.login ?? null,
        body: comment.body,
        commentId: comment.databaseId,
        createdAt: comment.createdAt,
        diffHunk: comment.diffHunk,
        pullRequestReviewId: comment.pullRequestReview?.id ?? null,
        replyToCommentId: comment.replyTo?.databaseId ?? null,
        reviewAuthor: comment.pullRequestReview?.author?.login ?? null,
        reviewState: comment.pullRequestReview?.state ?? null,
        reviewSubmittedAt: comment.pullRequestReview?.submittedAt ?? null,
        url: comment.url,
      })),
      id: thread.id,
      isOutdated: thread.isOutdated,
      isResolved: thread.isResolved,
      line: thread.line,
      originalLine: thread.originalLine,
      originalStartLine: thread.originalStartLine,
      path: thread.path,
      startLine: thread.startLine,
    })),
  }
}

async function ensureCleanTaskWorktree(repositoryPath: string) {
  const { stdout } = await runClank8yGit(['status', '--porcelain'], { cwd: repositoryPath })
  if (stdout.trim()) {
    throw new Error('Working tree is not clean. Finish or discard local changes before creating a new task branch.')
  }
}

export function taskGitHubMCP(): LocalHTTPMCPServer {
  const mcp = new McpServer({
    name: 'clank8y-task-github-mcp',
    description: 'A MCP server that prepares single-repository task workspaces and performs constrained GitHub write operations.',
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
      name: LIST_REPOSITORY_BRANCHES_TOOL_NAME,
      description: 'List branches for a single repository before preparing an issue-driven task workspace from a specific base branch.',
      title: 'List Repository Branches',
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format.')),
        }),
        v.description('Arguments for listing repository branches before an issue-driven Task run.'),
      ),
    }, async ({ repository }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const result = await getRepositoryBranches({ octokit, repository: parsed })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          defaultBranch: result.defaultBranch,
          branches: result.branches,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to list repository branches: ${message}`)
      }
    }),

    defineTool({
      name: PREPARE_TASK_WORKSPACE_TOOL_NAME,
      description: 'Prepare the single-repository Task workspace, write local `.clank8y` context artifacts, and bind push state when applicable.',
      title: 'Prepare Task Workspace',
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format for the Task run.')),
          target: v.variant('kind', [
            v.object({
              kind: v.pipe(v.literal('pull_request'), v.description('Prepare an existing pull request task workflow.')),
              pull_number: v.pipe(v.number(), v.description('Pull request number to prepare.')),
            }),
            v.object({
              kind: v.pipe(v.literal('issue'), v.description('Prepare an issue-driven task workflow.')),
              issue_number: v.pipe(v.number(), v.description('Issue number to prepare.')),
              base_branch: v.optional(v.pipe(v.string(), v.description('Optional base branch to check out for the issue workflow. Defaults to the repository default branch.'))),
            }),
          ]),
        }),
        v.description('Arguments for preparing the local Task workspace before code changes or GitHub replies.'),
      ),
    }, async ({ repository, target }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const { data: repoData } = await octokit.rest.repos.get({ owner: parsed.owner, repo: parsed.repo })
        const cloneResult = await cloneRepository({
          repository: parsed,
          defaultBranch: repoData.default_branch,
          token: getClank8yRuntimeContext().auth.githubToken,
        })
        const reportPath = getReportArtifactPath()
        const repositoryKey = `${parsed.owner}/${parsed.repo}`

        if (target.kind === 'pull_request') {
          const pullRequestNumber = target.pull_number
          const [{ data: pullRequest }, files, prComments, reviewData] = await Promise.all([
            octokit.rest.pulls.get({
              owner: parsed.owner,
              repo: parsed.repo,
              pull_number: pullRequestNumber,
            }),
            octokit.paginate(octokit.rest.pulls.listFiles, {
              owner: parsed.owner,
              repo: parsed.repo,
              pull_number: pullRequestNumber,
              per_page: 100,
            }) as Promise<PRFiles>,
            octokit.paginate(octokit.rest.issues.listComments, {
              owner: parsed.owner,
              repo: parsed.repo,
              issue_number: pullRequestNumber,
              per_page: 100,
            }),
            fetchPullRequestReviewThreads(parsed, pullRequestNumber),
          ])

          if (pullRequest.head.ref !== repoData.default_branch) {
            await fetchRepositoryBranch({
              repository: parsed,
              branch: pullRequest.head.ref,
              token: getClank8yRuntimeContext().auth.githubToken,
            })
            const hasLocalBranch = await runClank8yGit(['show-ref', '--verify', '--quiet', `refs/heads/${pullRequest.head.ref}`], {
              cwd: cloneResult.path,
            }).then(() => true).catch(() => false)
            await runClank8yGit(
              hasLocalBranch
                ? ['checkout', pullRequest.head.ref]
                : ['checkout', '-b', pullRequest.head.ref, '--track', `origin/${pullRequest.head.ref}`],
              { cwd: cloneResult.path },
            )
          } else {
            await runClank8yGit(['checkout', repoData.default_branch], { cwd: cloneResult.path })
          }

          const issueArtifactPaths: string[] = []
          for (const issueNumber of reviewData.linkedIssueNumbers) {
            const { issue, comments } = await fetchIssueAndComments(parsed, issueNumber)
            if ('pull_request' in issue && issue.pull_request) {
              continue
            }
            await writeIssueArtifact(issue.number, formatTaskIssueArtifact(issue, comments))
            issueArtifactPaths.push(getIssueArtifactPath(issue.number))
          }

          await writePullRequestArtifact(formatTaskPullRequestArtifact({
            issueArtifactPaths: issueArtifactPaths.map((issuePath) => issuePath.replace(`${process.cwd()}/`, '')),
            pullRequest,
            prComments,
            reviewThreads: reviewData.reviewThreads,
          }))

          await writeDiffArtifact(formatFilesWithLineNumbers(files).content)
          await writeFile(reportPath, buildInitialTaskReport({
            repository: repositoryKey,
            target: { kind: 'pull_request', number: pullRequest.number },
          }), 'utf-8')

          setTaskContext({
            allowedPushBranch: pullRequest.head.ref,
            baseBranch: pullRequest.base.ref,
            branchCreationAllowed: false,
            defaultBranch: repoData.default_branch,
            repository: parsed,
            repositoryPath: cloneResult.path,
            target: { kind: 'pull_request', pullRequestNumber },
          })

          return tool.structured({
            repository: repositoryKey,
            target: {
              kind: 'pull_request',
              pullRequestNumber,
            },
            checkout: {
              path: cloneResult.path,
              baseBranch: pullRequest.base.ref,
              currentBranch: pullRequest.head.ref,
              defaultBranch: repoData.default_branch,
            },
            branchBinding: {
              allowedPushBranch: pullRequest.head.ref,
              branchCreationAllowed: false,
            },
            artifacts: {
              diffPath: getTaskArtifactPaths().diffPath,
              prPath: getPullRequestArtifactPath(),
              relatedIssuePaths: issueArtifactPaths,
              reportPath,
            },
          } as any)
        }

        const issueNumber = target.issue_number
        const baseBranch = target.base_branch?.trim() || repoData.default_branch
        if (baseBranch !== repoData.default_branch) {
          await fetchRepositoryBranch({
            repository: parsed,
            branch: baseBranch,
            token: getClank8yRuntimeContext().auth.githubToken,
          })
          const hasLocalBranch = await runClank8yGit(['show-ref', '--verify', '--quiet', `refs/heads/${baseBranch}`], {
            cwd: cloneResult.path,
          }).then(() => true).catch(() => false)
          await runClank8yGit(
            hasLocalBranch
              ? ['checkout', baseBranch]
              : ['checkout', '-b', baseBranch, '--track', `origin/${baseBranch}`],
            { cwd: cloneResult.path },
          )
        } else {
          await runClank8yGit(['checkout', repoData.default_branch], { cwd: cloneResult.path })
        }

        const { issue, comments } = await fetchIssueAndComments(parsed, issueNumber)
        if ('pull_request' in issue && issue.pull_request) {
          throw new Error(`Issue #${issueNumber} is a pull request. Use a pull_request target instead.`)
        }

        const issuePath = await writeIssueArtifact(issue.number, formatTaskIssueArtifact(issue, comments))
        await writeFile(reportPath, buildInitialTaskReport({
          repository: repositoryKey,
          target: { kind: 'issue', number: issue.number },
        }), 'utf-8')

        setTaskContext({
          allowedPushBranch: null,
          baseBranch,
          branchCreationAllowed: true,
          defaultBranch: repoData.default_branch,
          repository: parsed,
          repositoryPath: cloneResult.path,
          target: { kind: 'issue', issueNumber },
        })

        return tool.structured({
          repository: repositoryKey,
          target: {
            kind: 'issue',
            issueNumber,
          },
          checkout: {
            path: cloneResult.path,
            baseBranch,
            currentBranch: baseBranch,
            defaultBranch: repoData.default_branch,
          },
          branchBinding: {
            allowedPushBranch: null,
            branchCreationAllowed: true,
          },
          artifacts: {
            issuePath,
            reportPath,
          },
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to prepare Task workspace: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_BRANCH_TOOL_NAME,
      description: 'Create and check out the single clank8y task branch for an issue-driven Task workflow.',
      title: 'Create Branch',
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
      },
      schema: v.pipe(
        v.object({
          type: v.pipe(v.picklist(['fix', 'feat', 'chore', 'refactor', 'ci', 'docs', 'style', 'perf', 'test', 'build', 'revert']), v.description('Branch type prefix.')),
          name: v.pipe(v.string(), v.description('Short branch name suffix. The final branch name becomes <type>/clank8y-<name>.')),
          base_branch: v.optional(v.pipe(v.string(), v.description('Optional base branch override. If omitted, the prepared issue base branch is used.'))),
        }),
        v.description('Arguments for creating the single allowed clank8y task branch in an issue workflow.'),
      ),
    }, async ({ type, name, base_branch }) => {
      try {
        const taskContext = getActiveTaskContext()
        if (taskContext.target.kind !== 'issue') {
          throw new Error(`${CREATE_BRANCH_TOOL_NAME} is only available in issue-driven Task workflows.`)
        }
        if (!taskContext.branchCreationAllowed) {
          throw new Error('A task branch has already been created for this run.')
        }

        const repositoryPath = taskContext.repositoryPath
        await ensureCleanTaskWorktree(repositoryPath)

        const baseBranch = base_branch?.trim() || taskContext.baseBranch
        if (baseBranch !== taskContext.baseBranch) {
          if (baseBranch !== taskContext.defaultBranch) {
            await fetchRepositoryBranch({
              repository: taskContext.repository,
              branch: baseBranch,
              token: getClank8yRuntimeContext().auth.githubToken,
            })
            await runClank8yGit(['checkout', '--detach', `origin/${baseBranch}`], { cwd: repositoryPath })
          } else {
            await runClank8yGit(['checkout', taskContext.defaultBranch], { cwd: repositoryPath })
          }
        }

        const branchName = `${type}/clank8y-${name.trim()}`
        assertPushBranchAllowed(branchName, taskContext.defaultBranch)
        await runClank8yGit(['checkout', '-b', branchName], { cwd: repositoryPath })

        updateTaskContext({
          allowedPushBranch: branchName,
          branchCreationAllowed: false,
        })

        return tool.structured({
          repository: `${taskContext.repository.owner}/${taskContext.repository.repo}`,
          branch: branchName,
          baseBranch,
          path: repositoryPath,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create task branch: ${message}`)
      }
    }),

    defineTool({
      name: PUSH_TASK_BRANCH_TOOL_NAME,
      description: 'Push the branch currently bound by the active Task workflow. This tool never accepts arbitrary branch destinations.',
      title: 'Push Task Branch',
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
    }, async () => {
      try {
        const taskContext = getActiveTaskContext()
        if (!taskContext.allowedPushBranch) {
          throw new Error('No push branch is currently bound for this Task run.')
        }

        const currentBranch = await runClank8yGit(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: taskContext.repositoryPath })
        const branchName = currentBranch.stdout.trim()
        if (branchName !== taskContext.allowedPushBranch) {
          throw new Error(`Current branch '${branchName}' does not match the allowed push branch '${taskContext.allowedPushBranch}'.`)
        }

        if (taskContext.target.kind === 'issue') {
          assertPushBranchAllowed(branchName, taskContext.defaultBranch)
        } else if (branchName === taskContext.defaultBranch) {
          throw new Error(`Pushing the default branch '${taskContext.defaultBranch}' is not allowed.`)
        }

        await runClank8yGit([
          'push',
          '--set-upstream',
          'origin',
          `refs/heads/${branchName}:refs/heads/${branchName}`,
        ], {
          cwd: taskContext.repositoryPath,
          token: getClank8yRuntimeContext().auth.githubToken,
        })

        return tool.structured({
          repository: `${taskContext.repository.owner}/${taskContext.repository.repo}`,
          branch: branchName,
          path: taskContext.repositoryPath,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to push task branch: ${message}`)
      }
    }),

    defineTool({
      name: GET_ISSUE_TOOL_NAME,
      description: 'Fetch a same-repo issue and write it to `.clank8y/issues/<number>.md` for later local reading and grep.',
      title: 'Get Issue',
      annotations: {
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          issue_number: v.pipe(v.number(), v.description('Same-repo issue number to write into `.clank8y/issues/<number>.md`. Pull requests are rejected.')),
        }),
        v.description('Arguments for writing a same-repo issue artifact for the active Task repository.'),
      ),
    }, async ({ issue_number }) => {
      try {
        const taskContext = getActiveTaskContext()
        const { issue, comments } = await fetchIssueAndComments(taskContext.repository, issue_number)
        if ('pull_request' in issue && issue.pull_request) {
          throw new Error(`Issue #${issue_number} is a pull request and cannot be fetched with ${GET_ISSUE_TOOL_NAME}.`)
        }

        const issuePath = await writeIssueArtifact(issue.number, formatTaskIssueArtifact(issue, comments))
        return tool.structured({
          repository: `${taskContext.repository.owner}/${taskContext.repository.repo}`,
          issueNumber: issue.number,
          issuePath,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to fetch issue: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_ISSUE_COMMENT_TOOL_NAME,
      description: 'Create a same-repo issue comment as clank8y.',
      title: 'Create Issue Comment',
      annotations: {
        destructiveHint: false,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          issue_number: v.pipe(v.number(), v.description('Issue number in the active Task repository.')),
          body: v.pipe(v.string(), v.description('Issue comment body in markdown.')),
        }),
        v.description('Arguments for creating a same-repo issue comment as clank8y.'),
      ),
    }, async ({ issue_number, body }) => {
      try {
        const taskContext = getActiveTaskContext()
        const octokit = await getOctokit()
        const result = await octokit.rest.issues.createComment({
          owner: taskContext.repository.owner,
          repo: taskContext.repository.repo,
          issue_number,
          body: buildClank8yCommentBody(normalizeToolString(body), { workflowRunUrl: getClank8yRuntimeContext().runInfo?.url ?? null }),
        })

        return tool.structured({
          issueNumber: issue_number,
          commentId: result.data.id,
          url: result.data.html_url,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create issue comment: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_PULL_REQUEST_COMMENT_TOOL_NAME,
      description: 'Create a same-repo pull request comment as clank8y.',
      title: 'Create Pull Request Comment',
      annotations: {
        destructiveHint: false,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          pull_number: v.pipe(v.number(), v.description('Pull request number in the active Task repository.')),
          body: v.pipe(v.string(), v.description('Pull request comment body in markdown.')),
        }),
        v.description('Arguments for creating a same-repo pull request comment as clank8y.'),
      ),
    }, async ({ pull_number, body }) => {
      try {
        const taskContext = getActiveTaskContext()
        const octokit = await getOctokit()
        const result = await octokit.rest.issues.createComment({
          owner: taskContext.repository.owner,
          repo: taskContext.repository.repo,
          issue_number: pull_number,
          body: buildClank8yCommentBody(normalizeToolString(body), { workflowRunUrl: getClank8yRuntimeContext().runInfo?.url ?? null }),
        })

        return tool.structured({
          pullRequestNumber: pull_number,
          commentId: result.data.id,
          url: result.data.html_url,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create pull request comment: ${message}`)
      }
    }),

    defineTool({
      name: REPLY_TO_REVIEW_COMMENT_TOOL_NAME,
      description: 'Reply to an existing inline pull request review comment as clank8y.',
      title: 'Reply To Review Comment',
      annotations: {
        destructiveHint: false,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          comment_id: v.pipe(v.number(), v.description('Database comment ID from `.clank8y/pr.md`.')),
          body: v.pipe(v.string(), v.description('Reply body in markdown.')),
        }),
        v.description('Arguments for replying to an inline review comment on the active pull request task.'),
      ),
    }, async ({ comment_id, body }) => {
      try {
        const taskContext = getActiveTaskContext()
        if (taskContext.target.kind !== 'pull_request') {
          throw new Error('reply-to-review-comment is only available in pull request Task workflows.')
        }

        const octokit = await getOctokit()
        const response = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies', {
          owner: taskContext.repository.owner,
          repo: taskContext.repository.repo,
          pull_number: taskContext.target.pullRequestNumber,
          comment_id,
          body: buildClank8yCommentBody(normalizeToolString(body), { workflowRunUrl: getClank8yRuntimeContext().runInfo?.url ?? null }),
        })

        return tool.structured({
          commentId: comment_id,
          replyId: response.data.id,
          url: response.data.html_url,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to reply to review comment: ${message}`)
      }
    }),

    defineTool({
      name: RESOLVE_REVIEW_THREAD_TOOL_NAME,
      description: 'Resolve a pull request review thread by its thread ID from `.clank8y/pr.md`.',
      title: 'Resolve Review Thread',
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          thread_id: v.pipe(v.string(), v.description('GraphQL review thread ID from `.clank8y/pr.md`.')),
        }),
        v.description('Arguments for resolving a pull request review thread after the implementation actually addressed it.'),
      ),
    }, async ({ thread_id }) => {
      try {
        const taskContext = getActiveTaskContext()
        if (taskContext.target.kind !== 'pull_request') {
          throw new Error('resolve-review-thread is only available in pull request Task workflows.')
        }

        const octokit = await getOctokit()
        const result = await octokit.graphql<{ resolveReviewThread: { thread: { id: string, isResolved: boolean } } }>(`
          mutation ResolveTaskReviewThread($threadId: ID!) {
            resolveReviewThread(input: { threadId: $threadId }) {
              thread {
                id
                isResolved
              }
            }
          }
        `, { threadId: thread_id })

        return tool.structured({
          threadId: result.resolveReviewThread.thread.id,
          isResolved: result.resolveReviewThread.thread.isResolved,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to resolve review thread: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_REPO_PULL_REQUEST_TOOL_NAME,
      description: 'Create a same-repo pull request from the currently bound task branch.',
      title: 'Create Repository Pull Request',
      annotations: {
        destructiveHint: false,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          title: v.pipe(v.string(), v.description('Pull request title.')),
          body: v.pipe(v.string(), v.description('Pull request body in markdown.')),
          draft: v.pipe(v.boolean(), v.description('Whether to create the pull request as draft.')),
        }),
        v.description('Arguments for creating a pull request from an issue-driven Task workflow.'),
      ),
    }, async ({ title, body, draft }) => {
      try {
        const taskContext = getActiveTaskContext()
        if (taskContext.target.kind !== 'issue') {
          throw new Error('create-repo-pull-request is only available in issue-driven Task workflows.')
        }
        if (!taskContext.allowedPushBranch) {
          throw new Error('No task branch is currently bound. Create and push the task branch first.')
        }

        const octokit = await getOctokit()
        const result = await octokit.rest.pulls.create({
          owner: taskContext.repository.owner,
          repo: taskContext.repository.repo,
          title,
          body,
          head: taskContext.allowedPushBranch,
          base: taskContext.baseBranch,
          draft,
        })

        return tool.structured({
          pullRequestNumber: result.data.number,
          url: result.data.html_url,
          headBranch: result.data.head.ref,
          baseBranch: result.data.base.ref,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create repository pull request: ${message}`)
      }
    }),

    defineTool({
      name: UPDATE_REPO_PULL_REQUEST_BODY_TOOL_NAME,
      description: 'Update the body of an existing same-repo pull request as clank8y.',
      title: 'Update Repository Pull Request Body',
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
      schema: v.pipe(
        v.object({
          pull_number: v.pipe(v.number(), v.description('Pull request number in the active Task repository.')),
          body: v.pipe(v.string(), v.description('Replacement pull request body in markdown.')),
        }),
        v.description('Arguments for updating a pull request body during a Task workflow.'),
      ),
    }, async ({ pull_number, body }) => {
      try {
        const taskContext = getActiveTaskContext()
        const octokit = await getOctokit()
        const result = await octokit.rest.pulls.update({
          owner: taskContext.repository.owner,
          repo: taskContext.repository.repo,
          pull_number,
          body,
        })

        return tool.structured({
          pullRequestNumber: result.data.number,
          url: result.data.html_url,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to update pull request body: ${message}`)
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
    allowedTools: githubMcpTools.map((definedTool) => definedTool.name),
    get status() {
      return status
    },
    start: async () => {
      await server.serve()
      const { url } = await server.ready()
      if (!url) {
        await server.close(true)
        throw new Error('Failed to start Task GitHub MCP server')
      }

      const actualUrl = url.endsWith('/') ? `${url}mcp` : `${url}/mcp`
      status = { state: 'running', url: actualUrl }
      return { url: actualUrl, toolNames: githubMcpTools.map((definedTool) => definedTool.name) }
    },
    stop: async () => {
      await server.close(true)
      status = { state: 'stopped' }
    },
  }
}
