import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { HttpTransport } from '@tmcp/transport-http'
import { FastResponse, serve } from 'srvx'
import { McpServer } from 'tmcp'
import { defineTool } from 'tmcp/tool'
import { tool } from 'tmcp/utils'
import * as v from 'valibot'
import { getOctokit } from '../../../gh'
import type { LocalHTTPMCPServer } from '../../../mcp'
import { getClank8yRuntimeContext } from '../../../setup'
import { appendResourcesArtifactEntry } from '../../../utils/artifacts'
import { buildRepoIssueSearchQuery } from '../../../utils/githubSearch'
import {
  assertArtifactOwnedByAuthenticatedUser,
  cloneRepository,
  fetchRepositoryBranch,
  getRepositoryBranches,
  parseGitHubRepository,
  pushRepositoryBranch,
} from '../../../utils/repositories'

export const GET_REPO_BRANCHES_TOOL_NAME = 'get-repo-branches'
export const SEARCH_REPO_ARTIFACTS_TOOL_NAME = 'search-repo-artifacts'
export const CLONE_REPO_TOOL_NAME = 'clone-repo'
export const FETCH_REPO_BRANCH_TOOL_NAME = 'fetch-repo-branch'
export const PUSH_REPO_BRANCH_TOOL_NAME = 'push-repo-branch'
export const CREATE_REPO_ISSUE_TOOL_NAME = 'create-repo-issue'
export const UPDATE_REPO_ISSUE_TOOL_NAME = 'update-repo-issue'
export const CREATE_REPO_PULL_REQUEST_TOOL_NAME = 'create-repo-pull-request'
export const UPDATE_REPO_PULL_REQUEST_BODY_TOOL_NAME = 'update-repo-pull-request-body'

const RESOURCES_ARTIFACT_NOTE = 'This action was recorded in .clank8y/resources.md — read it to recover context.'

async function getAuthenticatedLogin() {
  const octokit = await getOctokit()
  const { data } = await octokit.rest.users.getAuthenticated()
  return data.login
}

export function incidentFixGitHubMCP(): LocalHTTPMCPServer {
  const mcp = new McpServer({
    name: 'clank8y-incident-fix-github-mcp',
    description: 'A MCP server that helps incident-fix workflows inspect branches and manage repo checkouts safely.',
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
      name: GET_REPO_BRANCHES_TOOL_NAME,
      description: 'Read-only GitHub-backed branch metadata for a repository. Call this near the start before deciding whether the default branch is the right base.',
      title: 'Get Repository Branches',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format. Use this to inspect candidate branches before cloning or fetching additional branches.')),
        }),
        v.description('Arguments for fetching branch metadata for an IncidentFix target repository.'),
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
        return tool.error(`Failed to load repository branches: ${message}`)
      }
    }),

    defineTool({
      name: SEARCH_REPO_ARTIFACTS_TOOL_NAME,
      description: 'Search repository issues and pull requests using a normal GitHub search fragment. The repository scope is added automatically.',
      title: 'Search Repository Artifacts',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format to search.')),
          query: v.pipe(v.string(), v.description('GitHub issues search fragment. Use standard GitHub qualifiers like is:issue, is:pull-request, is:open, is:closed, label:, author:, head:, or in:title,body as needed. Do not include repo:.')),
        }),
        v.description('Arguments for searching repository issues and pull requests.'),
      ),
    }, async ({ repository, query }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const repositoryKey = `${parsed.owner}/${parsed.repo}`
        const seenArtifactNumbers = new Set<number>()
        const searchQuery = buildRepoIssueSearchQuery(repositoryKey, query)
        const items: Array<{
          number: number
          title: string
          url: string
          type: 'issue' | 'pull_request'
          state: string
          author: string | null
          labels: Array<string | undefined>
          updatedAt: string
          matchedBy: string
        }> = []

        const { data } = await octokit.rest.search.issuesAndPullRequests({
          q: searchQuery,
          per_page: 10,
          sort: 'updated',
          order: 'desc',
        })

        for (const item of data.items) {
          if (seenArtifactNumbers.has(item.number)) {
            continue
          }

          seenArtifactNumbers.add(item.number)
          items.push({
            number: item.number,
            title: item.title,
            url: item.html_url,
            type: item.pull_request ? 'pull_request' : 'issue',
            state: item.state,
            author: item.user?.login ?? null,
            labels: item.labels.map((label) => typeof label === 'string' ? label : label.name),
            updatedAt: item.updated_at,
            matchedBy: searchQuery,
          })
        }

        return tool.structured({
          repository: repositoryKey,
          query,
          searchQuery,
          searchStrategy: 'github-search-api',
          matchedCount: items.length,
          items,
          note: items.length > 0
            ? 'Matched via GitHub issue and pull request search queries.'
            : 'No GitHub search matches found.',
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to search repository issues: ${message}`)
      }
    }),

    defineTool({
      name: CLONE_REPO_TOOL_NAME,
      description: 'Clone a repository into .clank8y/repos using only its default branch. Use get-repo-branches first if you need branch context before cloning.',
      title: 'Clone Repository',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format to clone into .clank8y/repos. The tool clones only the default branch to minimize bandwidth.')),
        }),
        v.description('Arguments for cloning an IncidentFix repository checkout.'),
      ),
    }, async ({ repository }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const { data: repoData } = await octokit.rest.repos.get({ owner: parsed.owner, repo: parsed.repo })

        const result = await cloneRepository({
          repository: parsed,
          defaultBranch: repoData.default_branch,
          token: getClank8yRuntimeContext().auth.githubToken,
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          path: result.path,
          defaultBranch: repoData.default_branch,
          reusedExistingCheckout: result.reusedExistingCheckout,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to clone repository: ${message}`)
      }
    }),

    defineTool({
      name: FETCH_REPO_BRANCH_TOOL_NAME,
      description: 'Fetch one specific remote branch into an existing IncidentFix checkout. Use this when get-repo-branches suggests a better base than the default branch.',
      title: 'Fetch Repository Branch',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format. The repo must already be cloned with clone-repo.')),
          branch: v.pipe(v.string(), v.description('Remote branch name to fetch. This fetches only the requested branch to avoid pulling every branch locally.')),
        }),
        v.description('Arguments for fetching a single additional branch into an IncidentFix repository checkout.'),
      ),
    }, async ({ repository, branch }) => {
      try {
        const parsed = parseGitHubRepository(repository)
        const result = await fetchRepositoryBranch({
          repository: parsed,
          branch,
          token: getClank8yRuntimeContext().auth.githubToken,
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          branch,
          path: result.path,
          localRef: result.localRef,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to fetch repository branch: ${message}`)
      }
    }),

    defineTool({
      name: PUSH_REPO_BRANCH_TOOL_NAME,
      description: 'Push a local branch for an IncidentFix checkout. Branch must follow <type>/clank8y-<name> naming (e.g. fix/clank8y-auth-leak). Default-branch pushes are blocked.',
      title: 'Push Repository Branch',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format. The repo must already be cloned into .clank8y/repos.')),
          branch: v.pipe(v.string(), v.description('Local branch name to push. Must follow <type>/clank8y-<name> convention (fix, feat, chore, refactor, etc.).')),
        }),
        v.description('Arguments for pushing a local IncidentFix branch to origin.'),
      ),
    }, async ({ repository, branch }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const { data: repoData } = await octokit.rest.repos.get({ owner: parsed.owner, repo: parsed.repo })

        const result = await pushRepositoryBranch({
          repository: parsed,
          defaultBranch: repoData.default_branch,
          token: getClank8yRuntimeContext().auth.githubToken,
          branch,
        })

        await appendResourcesArtifactEntry({
          action: 'push-repo-branch',
          repository: `${parsed.owner}/${parsed.repo}`,
          branch: result.branch,
          summary: `Pushed branch '${result.branch}' to origin.`,
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          branch: result.branch,
          path: result.path,
          remoteRef: result.remoteRef,
          defaultBranch: repoData.default_branch,
          note: RESOURCES_ARTIFACT_NOTE,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to push repository branch: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_REPO_ISSUE_TOOL_NAME,
      description: 'Create an issue in a repository once the investigation has a concrete, evidence-backed fix path or follow-up item.',
      title: 'Create Repository Issue',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format where the issue should be created.')),
          title: v.pipe(v.string(), v.description('Issue title. Keep it crisp and repository-specific.')),
          body: v.pipe(v.string(), v.description('Issue body in markdown. Include the concrete problem, fix direction, and any relevant cross-references already known.')),
          labels: v.pipe(
            v.array(v.pipe(v.string(), v.description('Label name to apply to the issue.'))),
            v.description('Label names to add to the issue. Pass an empty array if none.'),
          ),
        }),
        v.description('Arguments for creating an IncidentFix issue in a target repository.'),
      ),
    }, async ({ repository, title, body, labels }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const result = await octokit.rest.issues.create({
          owner: parsed.owner,
          repo: parsed.repo,
          title,
          body,
          labels: labels.length > 0 ? labels : undefined,
        })

        await appendResourcesArtifactEntry({
          action: 'create-repo-issue',
          repository: `${parsed.owner}/${parsed.repo}`,
          number: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          summary: 'Created repository issue.',
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          issueNumber: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          state: result.data.state,
          labels: result.data.labels.map((label) => typeof label === 'string' ? label : label.name),
          note: RESOURCES_ARTIFACT_NOTE,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create repository issue: ${message}`)
      }
    }),

    defineTool({
      name: UPDATE_REPO_ISSUE_TOOL_NAME,
      description: 'Update an existing bot-authored issue title and body. Use this to backfill cross-references after related repos get their own issues or PRs.',
      title: 'Update Repository Issue',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format for the issue to update.')),
          issue_number: v.pipe(v.number(), v.description('Issue number to update.')),
          title: v.pipe(v.string(), v.description('Replacement issue title.')),
          body: v.pipe(v.string(), v.description('Replacement issue body. Use this to add later-created cross-references.')),
        }),
        v.description('Arguments for updating a bot-authored IncidentFix issue.'),
      ),
    }, async ({ repository, issue_number, title, body }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const authenticatedLogin = await getAuthenticatedLogin()
        const { data: issue } = await octokit.rest.issues.get({
          owner: parsed.owner,
          repo: parsed.repo,
          issue_number,
        })

        if ('pull_request' in issue && issue.pull_request) {
          throw new Error(`Issue #${issue_number} is a pull request. Use ${UPDATE_REPO_PULL_REQUEST_BODY_TOOL_NAME} instead.`)
        }

        assertArtifactOwnedByAuthenticatedUser({
          artifactType: 'issue',
          authorLogin: issue.user?.login ?? null,
          authenticatedLogin,
        })

        const result = await octokit.rest.issues.update({
          owner: parsed.owner,
          repo: parsed.repo,
          issue_number,
          title,
          body,
        })

        await appendResourcesArtifactEntry({
          action: 'update-repo-issue',
          repository: `${parsed.owner}/${parsed.repo}`,
          number: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          summary: 'Updated repository issue.',
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          issueNumber: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          state: result.data.state,
          note: RESOURCES_ARTIFACT_NOTE,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to update repository issue: ${message}`)
      }
    }),

    defineTool({
      name: CREATE_REPO_PULL_REQUEST_TOOL_NAME,
      description: 'Create a pull request for a pushed branch. Use this once the fix direction is concrete and the branch is ready for review.',
      title: 'Create Repository Pull Request',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format where the pull request should be created.')),
          title: v.pipe(v.string(), v.description('Pull request title. Keep it repository-specific and concise.')),
          body: v.pipe(v.string(), v.description('Pull request body in markdown. Include the concrete fix summary and any cross-references already known.')),
          base_branch: v.pipe(v.string(), v.description('Base branch for the PR (e.g. main, develop).')),
          head_branch: v.pipe(v.string(), v.description('Head branch for the PR. Must match the pushed branch name.')),
          draft: v.pipe(v.boolean(), v.description('Whether to create the pull request as draft.')),
        }),
        v.description('Arguments for creating an IncidentFix pull request from a prepared local checkout.'),
      ),
    }, async ({ repository, title, body, base_branch, head_branch, draft }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)

        const result = await octokit.rest.pulls.create({
          owner: parsed.owner,
          repo: parsed.repo,
          title,
          body,
          head: head_branch,
          base: base_branch,
          draft,
        })

        await appendResourcesArtifactEntry({
          action: 'create-repo-pull-request',
          repository: `${parsed.owner}/${parsed.repo}`,
          number: result.data.number,
          branch: result.data.head.ref,
          title: result.data.title,
          url: result.data.html_url,
          summary: `Created pull request into '${result.data.base.ref}'.`,
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          pullRequestNumber: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          state: result.data.state,
          draft: result.data.draft,
          headBranch: result.data.head.ref,
          baseBranch: result.data.base.ref,
          note: RESOURCES_ARTIFACT_NOTE,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to create repository pull request: ${message}`)
      }
    }),

    defineTool({
      name: UPDATE_REPO_PULL_REQUEST_BODY_TOOL_NAME,
      description: 'Update the body of an existing bot-authored pull request. Use this to backfill cross-references after related issues or PRs are created in other repositories.',
      title: 'Update Repository Pull Request Body',
      schema: v.pipe(
        v.object({
          repository: v.pipe(v.string(), v.description('Repository in owner/repo format for the pull request to update.')),
          pull_number: v.pipe(v.number(), v.description('Pull request number to update.')),
          body: v.pipe(v.string(), v.description('Replacement pull request body. Use this to add later-created cross-references and final context.')),
        }),
        v.description('Arguments for updating the body of a bot-authored IncidentFix pull request.'),
      ),
    }, async ({ repository, pull_number, body }) => {
      try {
        const octokit = await getOctokit()
        const parsed = parseGitHubRepository(repository)
        const authenticatedLogin = await getAuthenticatedLogin()
        const { data: pullRequest } = await octokit.rest.pulls.get({
          owner: parsed.owner,
          repo: parsed.repo,
          pull_number,
        })

        assertArtifactOwnedByAuthenticatedUser({
          artifactType: 'pull request',
          authorLogin: pullRequest.user?.login ?? null,
          authenticatedLogin,
        })

        const result = await octokit.rest.pulls.update({
          owner: parsed.owner,
          repo: parsed.repo,
          pull_number,
          body,
        })

        await appendResourcesArtifactEntry({
          action: 'update-repo-pull-request-body',
          repository: `${parsed.owner}/${parsed.repo}`,
          number: result.data.number,
          branch: result.data.head.ref,
          title: result.data.title,
          url: result.data.html_url,
          summary: 'Updated pull request body.',
        })

        return tool.structured({
          repository: `${parsed.owner}/${parsed.repo}`,
          pullRequestNumber: result.data.number,
          title: result.data.title,
          url: result.data.html_url,
          state: result.data.state,
          draft: result.data.draft,
          note: RESOURCES_ARTIFACT_NOTE,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to update repository pull request body: ${message}`)
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
        throw new Error('Failed to start IncidentFix GitHub MCP server')
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
