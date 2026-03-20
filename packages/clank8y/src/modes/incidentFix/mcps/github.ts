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
import {
  cloneRepository,
  fetchRepositoryBranch,
  getRepositoryBranches,
  parseGitHubRepository,
} from '../../../utils/repositories'

export const GET_REPO_BRANCHES_TOOL_NAME = 'get-repo-branches'
export const CLONE_REPO_TOOL_NAME = 'clone-repo'
export const FETCH_REPO_BRANCH_TOOL_NAME = 'fetch-repo-branch'

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
          repository: v.pipe(
            v.string(),
            v.description('Repository in owner/repo format. Use this to inspect candidate branches before cloning or fetching additional branches.'),
          ),
        }),
        v.description('Arguments for fetching branch metadata for an IncidentFix target repository.'),
      ),
    }, async ({ repository }) => {
      try {
        const octokit = await getOctokit()
        const parsedRepository = parseGitHubRepository(repository)
        const result = await getRepositoryBranches({
          octokit,
          repository: parsedRepository,
        })

        return tool.structured({
          repository: `${parsedRepository.owner}/${parsedRepository.repo}`,
          defaultBranch: result.defaultBranch,
          branches: result.branches,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to load repository branches: ${message}`)
      }
    }),

    defineTool({
      name: CLONE_REPO_TOOL_NAME,
      description: 'Clone a repository into .clank8y/repos using only its default branch. Use get-repo-branches first if you need branch context before cloning.',
      title: 'Clone Repository',
      schema: v.pipe(
        v.object({
          repository: v.pipe(
            v.string(),
            v.description('Repository in owner/repo format to clone into .clank8y/repos. The tool clones only the default branch to minimize bandwidth.'),
          ),
        }),
        v.description('Arguments for cloning an IncidentFix repository checkout.'),
      ),
    }, async ({ repository }) => {
      try {
        const octokit = await getOctokit()
        const parsedRepository = parseGitHubRepository(repository)
        const { data: repoData } = await octokit.rest.repos.get({
          owner: parsedRepository.owner,
          repo: parsedRepository.repo,
        })

        const result = await cloneRepository({
          repository: parsedRepository,
          defaultBranch: repoData.default_branch,
          token: getClank8yRuntimeContext().auth.githubToken,
        })

        return tool.structured({
          repository: `${parsedRepository.owner}/${parsedRepository.repo}`,
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
          repository: v.pipe(
            v.string(),
            v.description('Repository in owner/repo format. The repo must already be cloned with clone-repo.'),
          ),
          branch: v.pipe(
            v.string(),
            v.description('Remote branch name to fetch. This fetches only the requested branch to avoid pulling every branch locally.'),
          ),
        }),
        v.description('Arguments for fetching a single additional branch into an IncidentFix repository checkout.'),
      ),
    }, async ({ repository, branch }) => {
      try {
        const parsedRepository = parseGitHubRepository(repository)
        const result = await fetchRepositoryBranch({
          repository: parsedRepository,
          branch,
          token: getClank8yRuntimeContext().auth.githubToken,
        })

        return tool.structured({
          repository: `${parsedRepository.owner}/${parsedRepository.repo}`,
          branch,
          path: result.path,
          localRef: result.localRef,
        } as any)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return tool.error(`Failed to fetch repository branch: ${message}`)
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
