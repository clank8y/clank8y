import * as core from "@actions/core";
import { defu } from "defu";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { x } from "tinyexec";
import { consola } from "consola";
import { box } from "consola/utils";
import * as github from "@actions/github";
import { Octokit } from "octokit";
import { Buffer } from "node:buffer";
import { FastResponse, serve } from "srvx";
import { McpServer } from "tmcp";
import { ValibotJsonSchemaAdapter } from "@tmcp/adapter-valibot";
import { tool } from "tmcp/utils";
import * as v from "valibot";
import { HttpTransport } from "@tmcp/transport-http";
import { defineTool as defineTool$1 } from "tmcp/tool";
import { encode } from "@toon-format/toon";
import { toJsonSchema } from "@valibot/to-json-schema";

//#region src/logging.ts
function formatTable(headers, values) {
	const widths = headers.map((header, index) => Math.max(header.length, values[index]?.length ?? 0));
	const top = `╔${widths.map((width) => "═".repeat(width + 2)).join("╤")}╗`;
	const middle = `╟${widths.map((width) => "─".repeat(width + 2)).join("┼")}╢`;
	const bottom = `╚${widths.map((width) => "═".repeat(width + 2)).join("╧")}╝`;
	return [
		top,
		`║ ${headers.map((header, index) => header.padEnd(widths[index] ?? header.length, " ")).join(" │ ")} ║`,
		middle,
		`║ ${values.map((value, index) => value.padEnd(widths[index] ?? value.length, " ")).join(" │ ")} ║`,
		bottom
	].join("\n");
}
function logUsageSummary(totals) {
	console.log(formatTable([
		"Cost",
		"Input",
		"Cache Read",
		"Cache Write",
		"Output"
	], [
		`$${totals.cost.toFixed(4)}`,
		String(totals.inputTokens),
		String(totals.cacheReadTokens),
		String(totals.cacheWriteTokens),
		String(totals.outputTokens)
	]));
}
function logAgentMessage(info, lines) {
	const msg = Array.isArray(lines) ? lines.join("\n") : lines;
	console.log(box(msg, {
		title: ` ${info.agent} - ${info.model} `,
		style: { borderStyle: "double" }
	}));
}

//#endregion
//#region src/prompt.ts
const BASE_REVIEW_PROMPT = [
	"You are reviewing a pull request for Cumulocity IoT (c8y).",
	"Focus on correctness, security, maintainability, and test impact.",
	"Prioritize concrete, actionable feedback with precise file/line context.",
	"",
	"You are running with a dedicated GitHub MCP server for this PR.",
	"Use GitHub MCP tools to inspect PR metadata/files/diff and submit the final review.",
	"",
	"Required workflow:",
	"1) Start with `set-pull-request-context` using the pr_number in EVENT-LEVEL INSTRUCTIONS.",
	"   - Do not call any other GitHub MCP tool before setting pull request context.",
	"2) Continue with `prepare-pull-request-review` (single entrypoint).",
	"   - This preloads PR metadata, file summary, and diff TOC in one call.",
	"   - Then use targeted follow-up reads only when needed.",
	"3) Gather additional context using GitHub MCP tools (`read-pull-request-diff-chunk`, `get-pull-request-file-content`).",
	"   - Read the diff TOC first, then fetch only relevant diff/file chunks.",
	"   - Avoid full-file reads by default; use chunked reads and only expand when required.",
	"   - Treat `full=true` as exceptional and only for tiny files after chunked reads are insufficient.",
	"4) Decide findings and severity (high/medium/low).",
	"5) Submit the review by calling `create-pull-request-review`.",
	"",
	"Completion criteria (mandatory):",
	"- Do not finish without calling `create-pull-request-review`.",
	"- If there are issues, include inline comments with concrete fixes where possible.",
	"- If there are no significant issues, still submit a concise review body stating that.",
	"- End the review body with a direct mention to the actor from EVENT-LEVEL INSTRUCTIONS. ",
	"",
	"Tooling constraints:",
	"- Prefer GitHub MCP tools for this task.",
	"- Avoid unrelated shell or local file exploration tools for review logic."
].join("\n");
function buildReviewPrompt(promptContext) {
	const normalizedPromptContext = promptContext?.trim();
	if (!normalizedPromptContext) return BASE_REVIEW_PROMPT;
	return [
		BASE_REVIEW_PROMPT,
		"",
		normalizedPromptContext
	].join("\n");
}

//#endregion
//#region shared/oidc.ts
const CLANK8Y_OIDC_AUDIENCE = "clank8y";
const CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL = "https://clank8y.dev/api/github/token";

//#endregion
//#region src/gh/octokit-clank8y.ts
const OIDC_RETRY_ATTEMPTS = 3;
const OIDC_RETRY_DELAYS_MS = [250, 750];
function resolveTokenExchangeUrl() {
	return (process.env.CLANK8Y_TOKEN_URL ?? "").trim() || CLANK8Y_DEFAULT_TOKEN_EXCHANGE_URL;
}
function isOIDCAvailable() {
	return !!(process.env.ACTIONS_ID_TOKEN_REQUEST_URL && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN);
}
async function acquireClank8yBotTokenViaOIDC() {
	const tokenExchangeUrl = resolveTokenExchangeUrl();
	const idToken = await core.getIDToken(CLANK8Y_OIDC_AUDIENCE);
	const response = await fetch(tokenExchangeUrl, {
		method: "POST",
		headers: {
			"authorization": `Bearer ${idToken}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			run_id: process.env.GITHUB_RUN_ID ?? null
		})
	});
	if (!response.ok) {
		const details = await response.text().catch(() => "");
		throw new Error(`Token exchange failed (${response.status} ${response.statusText}): ${details}`);
	}
	const payload = await response.json();
	if (!payload || typeof payload.token !== "string" || !payload.token) throw new Error("Token exchange response is missing token");
	return payload.token;
}
function acquireClank8yBotTokenViaLocalFallback() {
	const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
	if (token) return token;
	throw new Error("GitHub API token is missing. OIDC is unavailable and neither GH_TOKEN nor GITHUB_TOKEN is set.");
}
function shouldRetryOidcExchange(error) {
	if (!(error instanceof Error)) return false;
	return error.name === "AbortError" || error.message.includes("fetch failed") || error.message.includes("ECONNRESET") || error.message.includes("ETIMEDOUT") || error.message.includes("Token exchange failed");
}
function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
async function acquireClank8yBotToken() {
	if (!isOIDCAvailable()) return acquireClank8yBotTokenViaLocalFallback();
	let lastError = null;
	for (let attempt = 1; attempt <= OIDC_RETRY_ATTEMPTS; attempt += 1) try {
		return await acquireClank8yBotTokenViaOIDC();
	} catch (error) {
		lastError = error;
		if (!shouldRetryOidcExchange(error) || attempt === OIDC_RETRY_ATTEMPTS) throw error;
		await delay(OIDC_RETRY_DELAYS_MS[attempt - 1] ?? 1e3);
	}
	throw lastError;
}
let _clank8yBotTokenPromise = null;
let _octokit = null;
async function getClank8yBotToken() {
	if (_clank8yBotTokenPromise) return _clank8yBotTokenPromise;
	_clank8yBotTokenPromise = acquireClank8yBotToken();
	return await _clank8yBotTokenPromise;
}
async function clank8yOctokit() {
	if (_octokit) return _octokit;
	const clank8yBotToken = await getClank8yBotToken();
	if (process.env.GITHUB_ACTIONS) core.setSecret(clank8yBotToken);
	_octokit = new Octokit({ auth: clank8yBotToken });
	return _octokit;
}

//#endregion
//#region src/gh/index.ts
let _oktokitPromise = null;
async function getOctokit() {
	if (_oktokitPromise) return _oktokitPromise;
	_oktokitPromise = clank8yOctokit();
	return _oktokitPromise;
}

//#endregion
//#region src/setup.ts
function parseRepositoryFromEnvironment() {
	const repository = process.env.GITHUB_REPOSITORY?.trim();
	if (!repository) throw new Error("GITHUB_REPOSITORY is required (format: owner/repo).");
	const [owner, repo] = repository.split("/");
	if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY value '${repository}'. Expected format: owner/repo.`);
	return {
		owner,
		repo
	};
}
function createRepositoryContext() {
	if (github?.context?.repo?.owner && github?.context?.repo?.repo) return {
		owner: github.context.repo.owner,
		repo: github.context.repo.repo
	};
	return parseRepositoryFromEnvironment();
}
function resolvePromptContext() {
	const inputPrompt = core.getInput("prompt").trim();
	if (inputPrompt) return inputPrompt;
	return (process.env.PROMPT ?? "").trim();
}
function resolveRunIdValue() {
	if (typeof github?.context?.runId === "number") return String(github.context.runId);
	return null;
}
function createWorkflowRunContext(repository) {
	const runIdValue = resolveRunIdValue();
	if (!runIdValue) return null;
	const runId = Number.parseInt(runIdValue, 10);
	if (Number.isNaN(runId)) return null;
	return {
		id: runId,
		url: `https://github.com/${repository.owner}/${repository.repo}/actions/runs/${runId}`
	};
}
let _activePullRequestContext = null;
async function setPullRequestContext(prNumber) {
	if (!Number.isFinite(prNumber) || prNumber < 1) throw new Error(`Invalid pull request number '${String(prNumber)}'.`);
	const repository = (await getPullRequestReviewContext()).repository;
	const { data: pr } = await (await getOctokit()).rest.pulls.get({
		owner: repository.owner,
		repo: repository.repo,
		pull_number: prNumber
	});
	_activePullRequestContext = {
		owner: repository.owner,
		repo: repository.repo,
		number: pr.number,
		headSha: pr.head.sha,
		headRef: pr.head.ref,
		baseSha: pr.base.sha,
		baseRef: pr.base.ref
	};
	return _activePullRequestContext;
}
function getActivePullRequestContext() {
	if (!_activePullRequestContext) throw new Error("Pull request context is not initialized. Call set-pull-request-context first.");
	return _activePullRequestContext;
}
let _config = null;
let _configPromise = null;
async function createPullRequestReviewContext() {
	const repository = createRepositoryContext();
	const workflowRun = createWorkflowRunContext(repository);
	const promptContext = resolvePromptContext();
	return {
		repository,
		workflowRun,
		promptContext,
		prompt: buildReviewPrompt(promptContext)
	};
}
async function getPullRequestReviewContext() {
	if (_config) return _config;
	if (!_configPromise) _configPromise = createPullRequestReviewContext();
	_config = await _configPromise;
	return _config;
}

//#endregion
//#region shared/comment.ts
const CLANK8Y_REPO_URL = "https://github.com/clank8y/clank8y";
const CUMULOCITY_URL = "https://cumulocity.com";
function buildClank8yCommentBody(rawBody, options) {
	const normalizedBody = (rawBody ?? "").trim();
	const footerLinks = [{
		label: "clank8y",
		url: CLANK8Y_REPO_URL
	}, {
		label: "cumulocity",
		url: CUMULOCITY_URL
	}];
	if (options?.workflowRunUrl) footerLinks.push({
		label: "workflow run",
		url: options.workflowRunUrl
	});
	const footer = footerLinks.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join(" | ");
	return [
		normalizedBody || "_No summary provided._",
		"",
		`<sub>${footer}</sub>`
	].join("\n");
}

//#endregion
//#region src/mcp/github.ts
const DIFF_CHUNK_DEFAULT_LIMIT = 200;
const DIFF_CHUNK_MAX_LIMIT = 400;
const DIFF_CHUNK_MAX_CHARS = 3e4;
const FILE_CHUNK_DEFAULT_LIMIT = 200;
const FILE_CHUNK_MAX_LIMIT = 400;
const FILE_CHUNK_MAX_CHARS = 3e4;
const FILE_FULL_MAX_LINES = 250;
const FILE_FULL_MAX_CHARS = 2e4;
let _githubMCP = null;
const prDiffCache = /* @__PURE__ */ new Map();
function logToolInput(toolName, input) {
	consola.info(`${toolName}: ${JSON.stringify(input ?? {})}`);
}
async function getDiffCacheKey() {
	const pullRequest = getActivePullRequestContext();
	return `${pullRequest.owner}/${pullRequest.repo}#${pullRequest.number}:${pullRequest.headSha}`;
}
function padNum(n) {
	return n.toString().padStart(4, " ");
}
function normalizeEscapedNewlines(text) {
	return text.replace(/\\r\\n|\\n|\\r/g, (match) => {
		if (match === "\\r\\n") return "\r\n";
		return "\n";
	});
}
async function fetchAllPullRequestFiles() {
	const octokit = await getOctokit();
	const pullRequest = getActivePullRequestContext();
	const allFiles = [];
	let page = 1;
	while (true) {
		const { data: files } = await octokit.rest.pulls.listFiles({
			owner: pullRequest.owner,
			repo: pullRequest.repo,
			pull_number: pullRequest.number,
			page,
			per_page: 100
		});
		allFiles.push(...files);
		if (files.length < 100) break;
		page += 1;
	}
	return allFiles;
}
function formatFilesWithLineNumbers(files) {
	const output = [];
	const tocEntries = [];
	let currentLine = 1;
	for (const file of files) {
		const fileStartLine = currentLine;
		output.push(`## ${file.filename}`);
		output.push(`status: ${file.status}, +${file.additions}/-${file.deletions}`);
		currentLine += 2;
		if (!file.patch) {
			output.push("(binary file or no textual patch available)");
			output.push("");
			currentLine += 2;
			tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`);
			continue;
		}
		const lines = file.patch.split("\n");
		let oldLine = 0;
		let newLine = 0;
		for (const line of lines) {
			const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
			if (hunkMatch) {
				const oldStart = hunkMatch[1];
				const newStart = hunkMatch[2];
				if (!oldStart || !newStart) continue;
				oldLine = Number.parseInt(oldStart, 10);
				newLine = Number.parseInt(newStart, 10);
				output.push(line);
				currentLine += 1;
				continue;
			}
			const marker = line[0] ?? " ";
			const code = line.slice(1);
			if (marker === "-") {
				output.push(`| ${padNum(oldLine)} | ---- | - | ${code}`);
				oldLine += 1;
			} else if (marker === "+") {
				output.push(`| ---- | ${padNum(newLine)} | + | ${code}`);
				newLine += 1;
			} else {
				output.push(`| ${padNum(oldLine)} | ${padNum(newLine)} |   | ${code}`);
				oldLine += 1;
				newLine += 1;
			}
			currentLine += 1;
		}
		output.push("");
		currentLine += 1;
		tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`);
	}
	const toc = [
		"# TOC",
		...tocEntries,
		""
	].join("\n");
	return {
		content: `${toc}${output.join("\n")}`,
		toc
	};
}
async function getOrBuildPullRequestDiff() {
	const cacheKey = await getDiffCacheKey();
	const cachedDiff = prDiffCache.get(cacheKey);
	if (cachedDiff) return cachedDiff;
	const diff = formatFilesWithLineNumbers(await fetchAllPullRequestFiles());
	prDiffCache.set(cacheKey, diff);
	return diff;
}
function githubMCP() {
	if (!_githubMCP) _githubMCP = createGitHubMCP();
	return _githubMCP;
}
function createGitHubMCP() {
	const transport = new HttpTransport(mcp, { path: "/mcp" });
	const server = serve({
		manual: true,
		port: 0,
		fetch: async (req) => {
			const response = await transport.respond(req);
			if (!response) return new FastResponse("Not found", { status: 404 });
			return response;
		}
	});
	let status = { state: "stopped" };
	return {
		get status() {
			return status;
		},
		start: async () => {
			await server.serve();
			const { url } = await server.ready();
			if (!url) {
				await server.close();
				throw new Error("Failed to start GitHub MCP server");
			}
			const actualUrl = url.endsWith("/") ? `${url}mcp` : `${url}/mcp`;
			status = {
				state: "running",
				url: actualUrl
			};
			return {
				url: actualUrl,
				toolNames: githubMcpTools.map((tool) => tool.name)
			};
		},
		stop: async () => {
			await server.close();
			status = { state: "stopped" };
		}
	};
}
const mcp = new McpServer({
	name: "clank8y-github-mcp",
	description: "A MCP server that helps you complete pull request reviews",
	version: "1.0.0"
}, {
	adapter: new ValibotJsonSchemaAdapter(),
	capabilities: { tools: { listChanged: true } }
});
const preparePullRequestReviewTool = defineTool$1({
	name: "prepare-pull-request-review",
	description: "Single entrypoint for review setup: PR metadata, file summary, and diff TOC with chunk-read instructions",
	title: "Prepare Pull Request Review"
}, async () => {
	try {
		logToolInput("prepare-pull-request-review", {});
		const octokit = await getOctokit();
		const pullRequest = getActivePullRequestContext();
		const [{ data: pr }, files] = await Promise.all([octokit.rest.pulls.get({
			owner: pullRequest.owner,
			repo: pullRequest.repo,
			pull_number: pullRequest.number
		}), fetchAllPullRequestFiles()]);
		const diff = formatFilesWithLineNumbers(files);
		const cacheKey = await getDiffCacheKey();
		prDiffCache.set(cacheKey, diff);
		const totalDiffLines = diff.content.split("\n").length;
		const fileSummaries = files.map((file) => ({
			path: file.filename,
			status: file.status,
			additions: file.additions,
			deletions: file.deletions,
			hasPatch: !!file.patch
		}));
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
					sha: pr.base.sha
				},
				head: {
					ref: pr.head.ref,
					sha: pr.head.sha
				},
				labels: pr.labels.map((label) => typeof label === "string" ? label : label.name),
				assignees: pr.assignees?.map((assignee) => assignee.login) ?? [],
				isFork: pr.head.repo?.full_name !== pr.base.repo.full_name
			},
			files: {
				count: fileSummaries.length,
				summary: fileSummaries
			},
			diff: {
				totalLines: totalDiffLines,
				toc: diff.toc
			},
			nextSteps: [
				"Use read-pull-request-diff-chunk with small offset/limit windows, guided by TOC line ranges.",
				"Use get-pull-request-file-content with offset/limit for relevant files only; avoid full=true unless required.",
				"Submit findings with create-pull-request-review."
			]
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return tool.error(`Failed to prepare pull request review context: ${message}`);
	}
});
const createPullRequestReviewTool = defineTool$1({
	name: "create-pull-request-review",
	description: "Submit a review for the current pull request with optional inline comments",
	title: "Create Pull Request Review",
	schema: v.pipe(v.object({
		body: v.optional(v.pipe(v.string(), v.description("1-2 sentence summary for the review. Put most actionable feedback in inline comments."))),
		commit_id: v.optional(v.pipe(v.string(), v.description("Optional commit SHA for the review. Defaults to current PR head SHA."))),
		comments: v.optional(v.pipe(v.array(v.pipe(v.object({
			path: v.pipe(v.string(), v.description("Path of the file to comment on, relative to repository root.")),
			line: v.pipe(v.number(), v.description("End line of the comment range in the diff (new file line numbering).")),
			start_line: v.optional(v.pipe(v.number(), v.description("Start line of the comment range. For single-line comments, set equal to line."))),
			side: v.optional(v.pipe(v.picklist(["LEFT", "RIGHT"]), v.description("Diff side: LEFT for old/deleted lines, RIGHT for new/unchanged lines. Defaults to RIGHT."))),
			body: v.optional(v.pipe(v.string(), v.description("Explanatory comment text. Optional if suggestion is provided."))),
			suggestion: v.optional(v.pipe(v.string(), v.description("Replacement code for [start_line, line]. Must preserve indentation.")))
		}), v.description("Single inline review comment payload."))), v.description("Inline review comments. Use these for line-level feedback in the diff.")))
	}), v.description("Payload for submitting a pull request review in one API call."))
}, async ({ body, commit_id, comments }) => {
	try {
		logToolInput("create-pull-request-review", {
			body,
			commit_id,
			comments
		});
		const octokit = await getOctokit();
		const reviewContext = await getPullRequestReviewContext();
		const pullRequest = getActivePullRequestContext();
		const reviewCommentsInput = comments ?? [];
		const reviewBody = buildClank8yCommentBody(body === void 0 ? void 0 : normalizeEscapedNewlines(body), { workflowRunUrl: reviewContext.workflowRun?.url ?? null });
		let commitSha = commit_id;
		if (!commitSha) {
			const { data: pr } = await octokit.rest.pulls.get({
				owner: pullRequest.owner,
				repo: pullRequest.repo,
				pull_number: pullRequest.number
			});
			commitSha = pr.head.sha;
		}
		const apiComments = reviewCommentsInput.map((comment) => {
			const side = comment.side ?? "RIGHT";
			const startLine = comment.start_line ?? comment.line;
			let commentBody = normalizeEscapedNewlines(comment.body ?? "");
			if (comment.suggestion !== void 0) {
				const suggestionBlock = `\`\`\`suggestion\n${normalizeEscapedNewlines(comment.suggestion)}\n\`\`\``;
				commentBody = commentBody ? `${commentBody}\n\n${suggestionBlock}` : suggestionBlock;
			}
			return {
				path: comment.path,
				line: comment.line,
				side,
				body: commentBody,
				start_line: startLine,
				start_side: side
			};
		});
		const params = {
			owner: pullRequest.owner,
			repo: pullRequest.repo,
			pull_number: pullRequest.number,
			event: "COMMENT",
			commit_id: commitSha
		};
		params.body = reviewBody;
		if (apiComments.length > 0) params.comments = apiComments;
		const result = await octokit.rest.pulls.createReview(params);
		return tool.text(encode({
			success: true,
			review_id: result.data.id,
			state: result.data.state,
			url: result.data.html_url,
			submitted_at: result.data.submitted_at,
			comment_count: apiComments.length
		}));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return tool.error(`Failed to create pull request review: ${message}`);
	}
});
const readPullRequestDiffChunkTool = defineTool$1({
	name: "read-pull-request-diff-chunk",
	description: "Read a line range from the cached pull request diff",
	title: "Read Pull Request Diff Chunk",
	schema: v.pipe(v.object({
		offset: v.optional(v.pipe(v.number(), v.description("1-based starting line number in the cached formatted diff. Defaults to 1."))),
		limit: v.optional(v.pipe(v.number(), v.description("Maximum number of lines to return. Defaults to 200 and is capped at 400.")))
	}), v.description("Chunk selection arguments for reading the cached pull request diff."))
}, async ({ offset, limit }) => {
	try {
		logToolInput("read-pull-request-diff-chunk", {
			offset,
			limit
		});
		const lines = (await getOrBuildPullRequestDiff()).content.split("\n");
		const totalLines = lines.length;
		const requestedOffset = offset ?? 1;
		const startLine = Math.max(1, requestedOffset);
		const requestedLimit = limit ?? DIFF_CHUNK_DEFAULT_LIMIT;
		const normalizedLimit = Math.max(1, Math.min(DIFF_CHUNK_MAX_LIMIT, requestedLimit));
		const endLine = Math.min(totalLines, startLine + normalizedLimit - 1);
		const rawChunk = lines.slice(startLine - 1, endLine).join("\n");
		const chunk = rawChunk.length > DIFF_CHUNK_MAX_CHARS ? `${rawChunk.slice(0, DIFF_CHUNK_MAX_CHARS)}\n\n[truncated: chunk exceeded ${DIFF_CHUNK_MAX_CHARS} characters]` : rawChunk;
		return tool.text([
			`Diff chunk ${startLine}-${endLine} of ${totalLines}`,
			`Remaining lines after this chunk: ${Math.max(0, totalLines - endLine)}`,
			"",
			chunk
		].join("\n"));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return tool.error(`Failed to read pull request diff chunk: ${message}`);
	}
});
const getPullRequestFileContentTool = defineTool$1({
	name: "get-pull-request-file-content",
	description: "Get content for a changed pull request file, with chunked reads by default",
	title: "Get Pull Request File Content",
	schema: v.pipe(v.object({
		filename: v.pipe(v.string(), v.description("Path of a file changed in the current pull request.")),
		offset: v.optional(v.pipe(v.number(), v.description("1-based starting line number for chunked file reads. Defaults to 1."))),
		limit: v.optional(v.pipe(v.number(), v.description("Maximum number of lines to return for chunked reads. Defaults to 200 and is capped at 400."))),
		full: v.optional(v.pipe(v.boolean(), v.description("Return full file content when true. Allowed only for small files (max 250 lines and 20,000 characters).")))
	}), v.description("Arguments for fetching the head-version content of a changed pull request file with optional chunking."))
}, async ({ filename, offset, limit, full }) => {
	try {
		logToolInput("get-pull-request-file-content", {
			filename,
			offset,
			limit,
			full
		});
		const octokit = await getOctokit();
		const pullRequest = getActivePullRequestContext();
		if (!(await fetchAllPullRequestFiles()).find((f) => f.filename === filename)) return tool.error(`File ${filename} not found in pull request`);
		const { data: content } = await octokit.rest.repos.getContent({
			owner: pullRequest.owner,
			repo: pullRequest.repo,
			path: filename,
			ref: pullRequest.headSha
		});
		if (Array.isArray(content)) return tool.error(`Path ${filename} resolved to a directory, expected a file`);
		if (!("content" in content) || !content.content) return tool.error(`No textual content available for ${filename}`);
		const encoding = content.encoding === "base64" ? "base64" : "utf-8";
		const decodedContent = Buffer.from(content.content, encoding).toString("utf-8");
		const lines = decodedContent.split("\n");
		const totalLines = lines.length;
		if (full) {
			if (totalLines > FILE_FULL_MAX_LINES || decodedContent.length > FILE_FULL_MAX_CHARS) return tool.error([
				`Refusing full file read for ${filename}.`,
				`Hard limits: <= ${FILE_FULL_MAX_LINES} lines and <= ${FILE_FULL_MAX_CHARS} characters.`,
				`Actual: ${totalLines} lines, ${decodedContent.length} characters.`,
				"Use chunked reads with offset + limit instead."
			].join(" "));
			return tool.text(decodedContent);
		}
		const requestedOffset = offset ?? 1;
		const startLine = Math.max(1, requestedOffset);
		const requestedLimit = limit ?? FILE_CHUNK_DEFAULT_LIMIT;
		const normalizedLimit = Math.max(1, Math.min(FILE_CHUNK_MAX_LIMIT, requestedLimit));
		const endLine = Math.min(totalLines, startLine + normalizedLimit - 1);
		const rawChunk = lines.slice(startLine - 1, endLine).join("\n");
		const chunk = rawChunk.length > FILE_CHUNK_MAX_CHARS ? `${rawChunk.slice(0, FILE_CHUNK_MAX_CHARS)}\n\n[truncated: chunk exceeded ${FILE_CHUNK_MAX_CHARS} characters]` : rawChunk;
		return tool.text([
			`File chunk ${startLine}-${endLine} of ${totalLines} for ${filename}`,
			`Remaining lines after this chunk: ${Math.max(0, totalLines - endLine)}`,
			"",
			chunk
		].join("\n"));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return tool.error(`Failed to load PR file content: ${message}`);
	}
});
const githubMcpTools = [
	preparePullRequestReviewTool,
	createPullRequestReviewTool,
	readPullRequestDiffChunkTool,
	getPullRequestFileContentTool
];
mcp.tools(githubMcpTools);

//#endregion
//#region src/mcp/index.ts
function mcpServers() {
	return { github: githubMCP() };
}

//#endregion
//#region src/agents/copilot.ts
function prependPath(entries) {
	const current = process.env.PATH ?? "";
	return [...entries, current].filter(Boolean).join(path.delimiter);
}
async function getNpmGlobalBin() {
	const result = await x("npm", ["prefix", "-g"], { throwOnError: true });
	return path.join(result.stdout.trim(), "bin");
}
function getCopilotExecutableName() {
	return process.platform === "win32" ? "copilot.cmd" : "copilot";
}
async function isCopilotCliAvailable(command = "copilot") {
	try {
		return (await x(command, ["--version"], { throwOnError: false })).exitCode === 0;
	} catch {
		return false;
	}
}
async function resolveCopilotCliPath() {
	const npmGlobalBin = await getNpmGlobalBin();
	const npmInstalledCliPath = path.join(npmGlobalBin, getCopilotExecutableName());
	if (existsSync(npmInstalledCliPath) && await isCopilotCliAvailable(npmInstalledCliPath)) return npmInstalledCliPath;
	const whichResult = await x("which", ["copilot"], { throwOnError: false });
	if (whichResult.exitCode === 0) {
		const resolvedPath = whichResult.stdout.trim();
		if (resolvedPath && await isCopilotCliAvailable(resolvedPath)) return resolvedPath;
	}
	if (await isCopilotCliAvailable("copilot")) return "copilot";
	return null;
}
async function ensureCopilotCliInstalled() {
	consola.info("Resolving GitHub Copilot CLI path...");
	let cliPath = await resolveCopilotCliPath();
	if (cliPath) {
		consola.info(`Using GitHub Copilot CLI at: ${cliPath}`);
		return cliPath;
	}
	consola.info("GitHub Copilot CLI not found. Installing @github/copilot globally...");
	if (!await isCopilotCliAvailable()) await x("npm", [
		"install",
		"-g",
		"@github/copilot"
	], {
		throwOnError: true,
		nodeOptions: { env: {
			...process.env,
			npm_config_ignore_scripts: "false"
		} }
	});
	const npmGlobalBin = await getNpmGlobalBin();
	process.env.PATH = prependPath([npmGlobalBin]);
	consola.info(`Prepended npm global bin to PATH: ${npmGlobalBin}`);
	cliPath = await resolveCopilotCliPath();
	if (!cliPath) throw new Error("GitHub Copilot CLI is required but was not found after installation attempt.");
	consola.info(`GitHub Copilot CLI installed and resolved at: ${cliPath}`);
	return cliPath;
}
function hasCopilotAgentTokenInEnvironment() {
	return !!process.env.COPILOT_GITHUB_TOKEN;
}
function resolveCopilotAgentTokenFromEnvironment() {
	const copilotAgentToken = process.env.COPILOT_GITHUB_TOKEN;
	if (!copilotAgentToken) throw new Error("Copilot authentication token is missing. Set COPILOT_GITHUB_TOKEN.");
	return copilotAgentToken;
}
const setPRContextTool = defineTool("set-pull-request-context", {
	description: "Set the pull request context for the current review session. Call this before any other tools to initialize the PR context.",
	parameters: toJsonSchema(v.object({ prNumber: v.pipe(v.number(), v.description("The pull request number to set the context for")) })),
	handler: async ({ prNumber }) => {
		const pullRequest = await setPullRequestContext(prNumber);
		return {
			success: true,
			pullRequest: {
				number: pullRequest.number,
				owner: pullRequest.owner,
				repo: pullRequest.repo,
				headRef: pullRequest.headRef,
				headSha: pullRequest.headSha,
				baseRef: pullRequest.baseRef,
				baseSha: pullRequest.baseSha
			},
			nextSteps: [
				"Call prepare-pull-request-review.",
				"Read only relevant diff/file chunks.",
				"Submit findings with create-pull-request-review."
			]
		};
	}
});
const githubCopilotAgent = async (options) => {
	const agent = "github-copilot";
	const model = options.model ?? "claude-haiku-4.5";
	consola.info("Preparing GitHub Copilot review agent");
	const cliPath = await ensureCopilotCliInstalled();
	if (!hasCopilotAgentTokenInEnvironment()) throw new Error([
		"Copilot authentication token is missing.",
		"Set COPILOT_GITHUB_TOKEN in the workflow environment,",
		"before starting clank8y."
	].join(" "));
	consola.info("Copilot authentication token detected in environment");
	const copilotAgentToken = resolveCopilotAgentTokenFromEnvironment();
	consola.info("Using explicit GitHub token for Copilot SDK authentication");
	const context = await getPullRequestReviewContext();
	const client = new CopilotClient({
		cliPath,
		githubToken: copilotAgentToken,
		useLoggedInUser: false
	});
	const { github } = mcpServers();
	return async () => {
		const thoughtStarts = /* @__PURE__ */ new Map();
		const totals = {
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			cost: 0
		};
		const { url: githubMCPUrl } = await github.start();
		try {
			await client.start();
			if (!(await client.getAuthStatus()).isAuthenticated) throw new Error("Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.");
			if (!(await client.listModels()).map((model) => model.id).includes(model)) throw new Error(`Configured model '${model}' is not available for this token/account.`);
			const session = await client.createSession({
				excludedTools: [
					"bash",
					"create",
					"edit",
					"github-say-hello",
					"glob",
					"grep",
					"list_agents",
					"list_bash",
					"read_agent",
					"read_bash",
					"sql",
					"stop_bash",
					"view",
					"web_fetch",
					"write_bash"
				],
				model,
				tools: [setPRContextTool],
				mcpServers: { github: {
					type: "http",
					url: githubMCPUrl,
					tools: ["*"],
					timeout: options.tools.maxRuntimeMs
				} }
			});
			session.on("assistant.turn_start", (event) => {
				thoughtStarts.set(event.data.turnId, Date.now());
			});
			session.on("assistant.turn_end", (event) => {
				const thoughtStart = thoughtStarts.get(event.data.turnId);
				thoughtStarts.delete(event.data.turnId);
				if (thoughtStart) consola.info(`thought for ${((Date.now() - thoughtStart) / 1e3).toFixed(1)}s`);
			});
			session.on("assistant.usage", (usage) => {
				totals.inputTokens += usage.data.inputTokens ?? 0;
				totals.outputTokens += usage.data.outputTokens ?? 0;
				totals.cacheReadTokens += usage.data.cacheReadTokens ?? 0;
				totals.cacheWriteTokens += usage.data.cacheWriteTokens ?? 0;
				totals.cost += usage.data.cost ?? 0;
			});
			try {
				consola.info("clank8y getting to work...");
				const response = await session.sendAndWait({ prompt: context.prompt }, options.timeOutMs);
				if (response?.data.content) logAgentMessage({
					agent,
					model
				}, response.data.content);
				else consola.warn("No response received");
			} finally {
				await session.destroy();
			}
		} finally {
			logUsageSummary(totals);
			await client.stop();
			await github.stop();
			consola.success("Review run finished");
		}
	};
};

//#endregion
//#region src/agents/index.ts
const DEFAULT_CONFIGURATION = {
	effort: "medium",
	timeOutMs: 24e4,
	tools: {
		maxCalls: 30,
		maxRuntimeMs: 6e4
	},
	agent: "github-copilot"
};
async function getPullRequestAgent(options) {
	const { agent, ...profile } = defu(options, DEFAULT_CONFIGURATION);
	switch (agent) {
		case "github-copilot": return githubCopilotAgent(profile);
		default: throw new Error(`Unsupported agent: ${agent}`);
	}
}
async function reviewPullRequest(options) {
	await (await getPullRequestAgent(options))();
}

//#endregion
//#region src/index.ts
async function startClank8y() {
	await reviewPullRequest({});
}
startClank8y().catch((error) => {
	const message = error instanceof Error ? error.message : String(error);
	core.setFailed(`clank8y failed to review the pull request: ${message}`);
});

//#endregion
export {  };