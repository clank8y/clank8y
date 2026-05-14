# AGENTS.md

## Project Overview

**clank8y** (klanki) is a GitHub review and single-repository task bot for Cumulocity IoT (c8y). It automates PR review plus Task-mode development flows using TypeScript, ESM modules, Vitest for testing, ESLint for code quality, and tsdown for automated builds.

## Architecture

```
src/
└── action.ts           # GitHub Action entrypoint, imports the workspace package
shared/
└── oidc.ts             # Action/webhook-shared OIDC constants
packages/
└── clank8y/
  ├── src/
  │   ├── index.ts            # Public package entrypoint for sandbox/custom runtimes
  │   ├── setup/              # Shared runtime context helpers used across modes
  │   │   ├── context.ts      # Runtime context state (auth.agentToken + auth.githubToken)
  │   │   └── index.ts        # Public setup barrel
  │   ├── formatters/         # Reusable pure formatting helpers shared across MCPs
  │   ├── tools/              # ToolDef interface and toolDefToAgentTool adapter
  │   │   └── index.ts        # ToolDef<TInput,TOutput>, toolDefToAgentTool()
  │   ├── modes/              # Mode-owned runtime bundles: prompt + MCP assembly per mode
  │   │   ├── index.ts        # getModeRuntime, getSharedTools, listModeTools, ModeDefinition, ClankModesConfig
  │   │   ├── basePrompts.ts  # Shared prompt fragments used by multiple modes
  │   │   ├── incidentFix/    # IncidentFix mode runtime for sandboxed repo investigation
  │   │   │   ├── prompt.ts   # IncidentFix investigation prompt builder
  │   │   │   └── mcps/       # IncidentFix-specific GitHub/repository MCP servers
  │   │   ├── review/         # Review mode runtime
  │   │   │   ├── prompt.ts   # Review prompt builder
  │   │   │   └── mcps/       # Review-specific MCP servers
  │   │   ├── task/           # Task mode runtime for single-repository development work
  │   │   │   ├── context.ts  # Single-repo task context and push-branch binding state
  │   │   │   ├── prompt.ts   # Task workflow prompt builder
  │   │   │   └── mcps/       # Task-specific GitHub MCP servers and tool-name constants
  │   │   └── selectMode/     # Mode-selection runtime
  │   │       ├── prompt.ts   # Mode-selection prompt builder
  │   │       └── mcps/       # Dedicated select-mode MCP server
  │   ├── modeSelection/      # Shared mode-selection metadata and schemas
  │   ├── agents/             # Agent runtime and orchestration helpers
  │   │   ├── index.ts        # executeClank8yAgent, Clank8yAgent, Clank8yAgentFactory
  │   │   └── pi/             # Pi coding agent runtime
  │   │       └── index.ts    # piAgent factory, resolveModel, PI_AGENT_NAME
  │   ├── utils/              # Shared filesystem, git, and shell helpers
  │   │   ├── artifacts.ts    # .clank8y artifact paths and file helpers
  │   │   ├── git.ts          # Shared git execution and repo-local bot config helpers
  │   │   ├── repositories.ts # Shared repository parsing/path helpers for multi-repo workflows
  │   │   └── shell.ts        # extractCommandNames (shell command blocklist helper)
  │   └── mcp/                # Shared MCP interfaces, adapters, and reusable external MCPs
  │       ├── index.ts        # Interfaces (MCPServer, LocalHTTPMCPServer, LocalStdioMCPServer), startAll/stopAll
  │       ├── remote.ts       # connectMcpServer: Flue-inspired HTTP MCP connector (connect → listTools → wrap as AgentTool[])
  │       ├── angular.ts      # Stdio MCP server (Angular CLI via npx)
  │       └── codex.ts        # Remote HTTP MCP for Cumulocity docs
  ├── shared/
  │   └── comment.ts          # Package-local review comment footer helper
  └── tests/
    └── ...                 # Vitest tests, including formatter and Pi agent tests
```

### Action Source (src/action.ts)

- Main GitHub Action entry point
- Wraps GitHub Actions/OIDC specifics and calls the `clank8y` workspace package
- Uses ESM module format

### Package Source (packages/clank8y/src/index.ts)

- Public package entry point for sandbox/custom runtime consumption
- Exports `runClank8y` and related runtime types
- Does not contain GitHub Action side effects

### Tests (packages/clank8y/tests/)

- Uses Vitest for testing
- Test files follow the `*.test.ts` naming convention
- Import from `../../src` within nested test folders to test the package source code

## Development

```sh
pnpm install    # Install dependencies
pnpm test:run   # Run package tests
pnpm build      # Build the action and the clank8y package
pnpm lint       # Lint with ESLint
pnpm lint:fix   # Lint and auto-fix
pnpm typecheck  # TypeScript type checking for action + package
```

## CI/CD Workflows

- `ci.yml`: PR validation (build/test/lint/typecheck)
- `autofix.yml`: starter-style autofix on `main` pushes (`pnpm lint:fix` + autofix commit)
- `release.yml`: tag-triggered workflow (`v*`) that validates, publishes `clank8y` to npm with trusted publishing, deploys the website, and creates the GitHub release
- `website-preview-deploy.yml`: Wrangler deploy for `preview` branch and manual runs

## Code Style

- ESM only (`"type": "module"`)
- TypeScript strict mode enabled
- Uses `tsdown` for building
- Uses `@schplitt/eslint-config` for linting
- Uses `vitest` for testing

## Testing

- Write tests in the `packages/clank8y/tests/` directory
- Use `*.test.ts` file naming convention
- Run `pnpm test:run` for running tests
- Import modules from `../../src` when the test file is in a nested package test directory
- When tests are in a folder 3 levels deep (e.g. `tests/agents/pi/`), use `../../../src` to reach source files

Example test structure:

```ts
import { expect, test } from 'vitest'
import { myFunction } from '../src'

test('should do something', () => {
  expect(myFunction()).toBe(expectedValue)
})
```

## Maintaining Documentation

When making changes to the project:

- **`AGENTS.md`** — Update with technical details, architecture, and best practices for AI agents
  - Project architecture and file structure
  - Internal patterns and conventions
  - Development workflows
  - Testing strategies
  - Build/deployment processes
  - Code organization principles
  - Tool configurations and quirks

- **`README.md`** — Update with user-facing documentation for end users:
  - ✅ New exported utilities or functions from the package
  - ✅ New configuration options users can set
  - ✅ New CLI commands or features
  - ✅ Changes to existing API behavior
  - ✅ Environment variables users can set
  - ✅ Any feature users can configure, use, or interact with
  - ✅ Installation or setup instructions
  - ✅ Usage examples and code snippets

## Agent Guidelines

When working on this project:

1. **Run tests** after making changes: `pnpm test:run` (runs once, no watch mode)
2. **Run linting** to ensure code quality: `pnpm lint`
3. **Run type checking** before committing: `pnpm typecheck`
4. **Update this file** when adding new modules, APIs, or changing architecture
5. **Keep exports in `src/index.ts`** — all public API should be exported from the main entry point
6. **Add tests** for new functionality in the `tests/` directory
7. **Record learnings** — When the user corrects a mistake or provides context about how something should be done, add it to the "Project Context & Learnings" section below if it's a recurring pattern (not a one-time fix)
8. **Notify documentation changes** — When updating `README.md` or `AGENTS.md`, explicitly call out the changes to the user at the end of your response so they can review and don't overlook them

## Project Context & Learnings

This section captures project-specific knowledge, tool quirks, and lessons learned during development. When the user provides corrections or context about how things should be done in this project, add them here if they are recurring patterns (not a one-time fix).

> **Note:** Before adding something here, consider: Is this a one-time fix, or will it come up again? Only document patterns that are likely to recur or are notable enough to prevent future mistakes.

### Tools & Dependencies

- MCP tool handlers should return `tool.error(...)` for user-facing tool failures instead of throwing from inside handlers.
- The Pi SDK packages (`@earendil-works/pi-agent-core`, `@earendil-works/pi-ai`) must be declared as `external` in both tsdown configs. `@earendil-works/pi-ai` pulls in `@google/genai` whose DTS files reference `@types/node-fetch` with relative paths that don't resolve in pnpm's virtual store. Marking them external avoids DTS bundling issues and keeps the bundle lighter.
- The Pi SDK's `getModel(provider, id)` uses strict union types for provider names and model IDs. Use `as any` casts when passing arbitrary strings (e.g., runtime-resolved model names or heuristic fallbacks) rather than maintaining exhaustive lists.
- `@types/node-fetch` must be installed at workspace root (declared in catalog) as a dev dep for `@google/genai`'s type declarations to resolve during TS language-server and `tsc` runs.

### Patterns & Conventions

- For Valibot schemas in MCP tools, keep schemas inline (no extra standalone schema variables when not needed).
- Add field-level guidance via `v.pipe(..., v.description(...))` so agents get better tool-usage hints.
- Keep GitHub Action input names kebab-case and map them via `core.getInput(...)`.
- `prompt` is additive: inject event-level instruction metadata into the base prompt, never replace the entire default prompt.
- Website webhook dispatch should inject structured GitHub event metadata plus any quoted user instruction and let clank8y select `Review` vs `Task`; do not hard-force the mode for mention-driven or assignment-driven invocations. Source-specific prompt guidance is fine when it stays advisory, such as nudging reviewer assignment toward `Review` and issue assignment toward `Task`.
- Pi agent authentication uses `agentToken` (formerly `copilotToken`) from `Clank8yRuntimeContext`. The `getApiKey` callback returns this token for every provider. Set `PI_AGENT_TOKEN` env var in the GitHub Actions runtime.
- Pi agent models are resolved via `resolveModel(string)` in `src/agents/pi/index.ts`. Prefer `provider:model-id` format (e.g. `anthropic:claude-sonnet-4-20250514`) for explicit control; legacy clank8y model names are mapped via `LEGACY_MODEL_MAP`.
- Keep shared prompt fragments in `src/modes/basePrompts.ts`; do not introduce a `shared/` subdirectory under `src/modes/`.
- Keep shared runtime context helpers under `src/setup/`; place reusable git execution/config helpers under `src/utils/` rather than inside a single mode implementation.
- Current git auth still uses env-injected extraheaders for remote operations; stricter ASKPASS-style auth remains future hardening work, not current behavior.
- Gate mode availability at the runtime entry boundary via the top-level `disabledModes` config; derive the selectable mode array from that before building the mode-selection tool schema. The GitHub Actions runtime disables `IncidentFix` but allows `Review` and `Task` to be selected from webhook-provided context.
- Treat each mode as the runtime ownership boundary: `src/modes/<mode>/` owns its prompt plus MCP assembly.
- Keep shared modes agent-agnostic. Agent-specific runtime policy belongs in the agent runtime layer, not in shared `src/modes/` definitions.
- Keep mode-selection prompt text and MCP server under `src/modes/selectMode/`, while shared mode-selection metadata/schema stays in `src/modeSelection/`.
- Prefer dedicated MCP tools over agent-specific custom tools when the capability should be reusable across agent runtimes.
- For IncidentFix-style multi-repo work, keep branch discovery GitHub-backed: use a read-only MCP tool for branch metadata first, then clone default branch and fetch only specific additional branches on demand.
- Resolve PR API token via OIDC exchange first (audience `clank8y`), with `GH_TOKEN`/`GITHUB_TOKEN` local fallback when OIDC runtime is unavailable.
- For GitHub-hosted Review/Task runs, the website token exchange should mint repository-scoped installation tokens with at least `contents: write`, `pull_requests: write`, and `issues: write`.
- Require the agent to set PR context via `set-pull-request-context` before any PR MCP tool calls.
- Prefer clean, simple, reusable solutions over one-off or ad-hoc implementations.
- If requirements are ambiguous, ask a focused clarifying question instead of implementing a guessed solution.
- Use a starter-style `autofix.yml` (main-branch push trigger + `autofix-ci/action`) for lint auto-fixes.
- Keep release publishing tag-driven (`on.push.tags: v*`) instead of manual version bumping inside CI.
- Keep website deploy automation Wrangler-only (preview branch/manual), not main-branch auto-deploy.
- MCP server interfaces: `LocalHTTPMCPServer` = HTTP (in-process, srvx), `LocalStdioMCPServer` = stdio (SDK spawns external process). Both extend `MCPServer` base with `serverType`, `allowedTools`, `status`, and `stop`. Agents should receive the mode-assembled MCP map and use `startAll(servers)` / `stopAll(servers)` as the lifecycle entry points.
- Each MCP server declares its own `allowedTools` (exact tool name allowlist, or `['*']` for all). The `connectMcpServer` helper in `src/mcp/remote.ts` reads `allowedTools` and filters tools accordingly.
- Remote MCP connections via `connectMcpServer` follow the MCP Streamable HTTP Transport spec (2025-03-26): initialize → initialized notification → tools/list → tools/call. Tool names are namespaced as `mcp__<serverName>__<toolName>`.
- Stdio MCP servers are listed in mode configs but skipped by the Pi agent (only HTTP MCPs are connected via `connectMcpServer`). Stdio support remains future work.
- Add shared tools (always active regardless of mode) to `getSharedTools()` in `src/modes/index.ts`. Use `listModeTools(mode)` to discover what tools a given mode will have available.
- In review mode, previous PR feedback should be materialized into one stable artifact at `.clank8y/review-comments.md` during `prepare-pull-request-review`; do not shard it per review ID unless a later non-review workflow requires that.
- Keep GitHub MCP implementations mode-local when their semantics depend on that mode's workflow; do not force review-specific GitHub tools into a shared global abstraction.
- When prompts, errors, or context messages mention a mode-local MCP tool name, import the tool-name constant and interpolate it instead of hardcoding the string.
- Task mode should be artifact-first: setup materializes PR and issue context into `.clank8y/` files, and the agent should work primarily from those files instead of custom chunking reads.

### Common Mistakes to Avoid

- Avoid mixing throw-based control flow with MCP error responses inside tool handlers.
- Avoid under-described schemas; missing descriptions reduces agent tool-call quality.
