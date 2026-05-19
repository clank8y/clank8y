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
  │   │   ├── context.ts      # Runtime context state (auth.githubToken)
  │   │   └── index.ts        # Public setup barrel
  │   ├── formatters/         # Reusable pure formatting helpers shared across MCPs
  │   ├── tools/              # Pi tool assembly from shared/mode Pi tools plus HTTP and stdio/CLI MCP adapters
  │   │   ├── index.ts        # getSharedTools(), createPiToolBundle()
  │   │   └── stdioMcp.ts     # Stdio/CLI MCP JSON-RPC adapter to native Pi AgentTool[]
  │   ├── modes/              # Mode-owned runtime bundles: prompt + external MCPs + native Pi tools per mode
  │   │   ├── index.ts        # getModeRuntime, ModeDefinition
  │   │   ├── basePrompts.ts  # Shared prompt fragments used by multiple modes
  │   │   ├── incidentFix/    # IncidentFix mode runtime for sandboxed repo investigation
  │   │   │   ├── prompt.ts   # IncidentFix investigation prompt builder
  │   │   │   └── tools/      # IncidentFix-specific native Pi GitHub/repository tools
  │   │   ├── review/         # Review mode runtime
  │   │   │   ├── prompt.ts   # Review prompt builder
  │   │   │   └── tools/      # Review-specific native Pi GitHub tools
  │   │   ├── task/           # Task mode runtime for single-repository development work
  │   │   │   ├── context.ts  # Single-repo task context and push-branch binding state
  │   │   │   ├── prompt.ts   # Task workflow prompt builder
  │   │   │   ├── tools/      # Task-specific native Pi GitHub tools
  │   │   │   ├── externalMcpServers.ts # External MCP server assembly
  │   │   │   └── constants.ts # Task tool-name constants
  │   │   └── selectMode/     # Mode-selection runtime
  │   │       ├── prompt.ts   # Mode-selection prompt builder
  │   │       └── tool.ts     # Native Pi mode-selection tool
  │   ├── modeSelection/      # Shared mode-selection metadata and schemas
  │   ├── agents/             # Agent runtime and orchestration helpers
  │   │   ├── index.ts        # executeClank8yAgent, Clank8yAgent, Clank8yAgentFactory
  │   │   └── pi/             # Pi coding agent runtime
  │   │       └── index.ts    # piAgent factory, PI_AGENT_NAME
  │   ├── utils/              # Shared filesystem, git, and shell helpers
  │   │   ├── artifacts.ts    # .clank8y artifact paths and file helpers
  │   │   ├── git.ts          # Shared git execution and repo-local bot config helpers
  │   │   ├── repositories.ts # Shared repository parsing/path helpers for multi-repo workflows
  │   │   └── shell.ts        # extractCommandNames (shell command blocklist helper)
  │   └── mcp/                # Shared external MCP declarations and lifecycle helpers
  │       ├── index.ts        # Interfaces (RemoteHttpMcpServer, StdioMcpServer), startAll/stopAll
  │       ├── httpMcp.ts      # connectMcpServer: Flue-inspired HTTP MCP connector (connect → listTools → wrap as AgentTool[])
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

- Use Node 26 for repo development and CI (`mise.toml` and GitHub workflows pin 26).
- The published JavaScript GitHub Action runs on `node24` via `action.yml`.
- `actions/setup-node` does not change the runtime of the JavaScript action itself; it only affects later workflow steps.
- Treat Node 24+ as required for the published action/package, with Node 26 preferred for local development and custom runtimes.

```sh
pnpm install    # Install dependencies
pnpm -r --include-workspace-root test:run   # Run workspace tests
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
- Run `pnpm -r --include-workspace-root test:run` for running workspace tests
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
  - Keep this file focused on repository/project context for contributors working in this repo; do not store runtime clank8y prompt policy here

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

1. **Run tests** after making changes: `pnpm -r --include-workspace-root test:run` (runs once, no watch mode)
2. **Run linting** to ensure code quality: `pnpm lint`
3. **Run type checking** before committing: `pnpm typecheck`
4. **Update this file** when adding new modules, APIs, or changing architecture
5. **Keep exports in `src/index.ts`** — all public API should be exported from the main entry point
6. **Add tests** for new functionality in the `tests/` directory
7. **Record learnings** — When the user corrects a mistake or provides context about how something should be done, add it to the "Project Context & Learnings" section below if it's a recurring pattern (not a one-time fix)
8. **Notify documentation changes** — When updating `README.md` or `AGENTS.md`, explicitly call out the changes to the user at the end of your response so they can review and don't overlook them
9. **Use available workflow tools first** — When the user asks for branch/commit/PR workflow, use the available workflow tools first. Only fall back to `gh` CLI when those tools are not available.
10. **Use conventional naming for git workflow** — Branch names should use conventional prefixes where appropriate, such as `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `build/`, `types/`, `style/`, `perf/`, `examples/`, and `ci/`. Commit subjects and PR titles should use conventional-commit style with the most appropriate type.
11. **Default PR behavior** — If the current branch already contains the related work, assume the PR should be opened from the current branch to `main` unless the user explicitly asks to isolate only part of the work or use a different base branch.
12. **Always include a PR body** — PRs created for the user must include a body. If a related issue identifier is known, include the appropriate GitHub-style reference.
13. **Prefer autofix first** — Strongly prefer running `pnpm lint:fix` before manually fixing lintable issues by hand. For automated validation, prefer this order: `pnpm -r --include-workspace-root test:run` → `pnpm lint:fix` → `pnpm typecheck`.
14. **Ask when requirements are unclear** — If requirements are ambiguous, ask a focused clarifying question instead of implementing a guessed solution.
15. **Prefer simple inline logic over trivial helpers** — Do not introduce tiny one-line helper/utility functions or throwaway `parse*` helpers for trivial one-off logic. Inline simple normalization or branching unless there is real reuse or a clear API boundary.

## Project Context & Learnings

This section captures project-specific knowledge, tool quirks, and lessons learned during development. When the user provides corrections or context about how things should be done in this project, add them here if they are recurring patterns (not a one-time fix).

> **Note:** Before adding something here, consider: Is this a one-time fix, or will it come up again? Only document patterns that are likely to recur or are notable enough to prevent future mistakes.

### Tools & Dependencies

- MCP tool handlers should return `tool.error(...)` for user-facing tool failures instead of throwing from inside handlers.
- The root GitHub Action build must stay self-contained: do not externalize Pi SDK packages in the root `tsdown.config.ts`, because GitHub Actions runs the checked-in `dist/index.mjs` without installing package dependencies. The package build may still externalize SDK dependencies for npm consumers.
- Runtime policy: keep the published JavaScript action pinned via `action.yml` `runs.using: node24`. Use `actions/setup-node` 26 for workflow build/test steps, but do not expect it to change the action runtime. Document Node 24+ as required and Node 26 as preferred for development/custom runtimes.
- Use `pnpm -r --include-workspace-root test:run` in automated workflows. Do not use `pnpm test` there because it starts watch mode.
- Prefer `pnpm lint:fix` before spending time on manual lint/style cleanup.

### Patterns & Conventions

- For Valibot schemas in MCP tools, keep schemas inline (no extra standalone schema variables when not needed).
- Add field-level guidance via `v.pipe(..., v.description(...))` so agents get better tool-usage hints.
- Keep GitHub Action input names kebab-case and map them via `core.getInput(...)`.
- `prompt` is additive: inject event-level instruction metadata into the base prompt, never replace the entire default prompt.
- Website webhook dispatch should inject structured GitHub event metadata plus any quoted user instruction and let clank8y select `Review` vs `Task`; do not hard-force the mode for mention-driven or assignment-driven invocations. Source-specific prompt guidance is fine when it stays advisory, such as nudging reviewer assignment toward `Review` and issue assignment toward `Task`.
- Trigger authorization is enforced in the website webhook before workflow dispatch, not in the GitHub Action. The webhook reads `clank8y.json` from the repository default branch, defaults to `allowedTriggerPermission: write`, supports only `write`/`maintain`/`admin` for permission config, and uses explicit `allowedClank8yTriggerers` users/`<repo-owner-org>/<team-slug>` teams as an exclusive allowlist when present.
- Pi agent authentication relies on provider-specific Pi environment variables such as `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, and `OPENROUTER_API_KEY`. Do not pass model-provider tokens through `Clank8yRuntimeContext`; the Pi provider layer reads its own environment variables.
- Pi agent model options accept Pi's native `Model<any>` object or a simple `provider:model-id` string resolved once at the clank8y boundary with Pi's `getModel`. Do not add legacy alias maps or heuristic model-name mapping.
- Keep shared prompt fragments in `src/modes/basePrompts.ts`; do not introduce a `shared/` subdirectory under `src/modes/`.
- Keep shared runtime context helpers under `src/setup/`; place reusable git execution/config helpers under `src/utils/` rather than inside a single mode implementation.
- Current git auth still uses env-injected extraheaders for remote operations; stricter ASKPASS-style auth remains future hardening work, not current behavior.
- Gate mode availability at the runtime entry boundary via the top-level `disabledModes` config; derive the selectable mode array from that before building the mode-selection tool schema. The GitHub Actions runtime disables `IncidentFix` but allows `Review` and `Task` to be selected from webhook-provided context.
- Treat each mode as the runtime ownership boundary: `src/modes/<mode>/` owns its prompt plus MCP assembly.
- Keep shared modes agent-agnostic. Agent-specific runtime policy belongs in the agent runtime layer, not in shared `src/modes/` definitions.
- Keep mode-selection prompt text and native Pi selection tool under `src/modes/selectMode/`, while shared mode-selection metadata/schema stays in `src/modeSelection/`.
- Prefer dedicated MCP tools over agent-specific custom tools when the capability should be reusable across agent runtimes.
- For IncidentFix-style multi-repo work, keep branch discovery GitHub-backed: use a read-only MCP tool for branch metadata first, then clone default branch and fetch only specific additional branches on demand.
- Resolve PR API token via OIDC exchange first (audience `clank8y`), with `GH_TOKEN`/`GITHUB_TOKEN` local fallback when OIDC runtime is unavailable.
- For GitHub-hosted Review/Task runs, the website token exchange should mint repository-scoped installation tokens with at least `contents: write`, `pull_requests: write`, and `issues: write`.
- PR MCP tools require pull-request context to be initialized via `set-pull-request-context` before use.
- Prefer clean, simple, reusable solutions over one-off or ad-hoc implementations.
- Use conventional branch prefixes and conventional-commit style commit subjects / PR titles.
- Keep trivial one-off normalization and branching inline instead of extracting tiny helper functions too early.
- If requirements are ambiguous, ask a focused clarifying question instead of implementing a guessed solution.
- Use a starter-style `autofix.yml` (main-branch push trigger + `autofix-ci/action`) for lint auto-fixes.
- Keep release publishing tag-driven (`on.push.tags: v*`) instead of manual version bumping inside CI.
- Keep website deploy automation Wrangler-only (preview branch/manual), not main-branch auto-deploy.
- MCP server interfaces are external-only: `RemoteHttpMcpServer` = already-running HTTP endpoint, `StdioMcpServer` = stdio/CLI MCP process. They extend `ExternalMcpServer` with `serverType`, optional static `toolNames`, `status`, and `stop`. Agents should receive the mode-assembled `ExternalMcpServers` map and use `startAll(servers)` / `stopAll(servers)` as lifecycle entry points. Use `createRemoteHttpMcpServer` and `createStdioMcpServer` to define any number of additional remote HTTP or stdio/CLI MCP servers.
- Pi tool assembly lives in `src/tools/`. `createPiToolBundle()` combines shared Pi tools, mode-local native Pi tools, remote HTTP MCP tools, and stdio/CLI MCP tools into one native Pi `AgentTool[]`.
- Do not add permission-style MCP filtering. The active mode decides which MCP servers exist; optional `toolNames` are token-optimization selections for conversion to Pi tools, not security boundaries. Log warnings when requested tool names are not listed by the MCP server.
- For the Angular CLI stdio MCP server, pin the `npx` package version in code and reuse that exact arg list in tests so runtime behavior does not drift with newly published Angular CLI releases.
- Remote MCP connections via `connectMcpServer` follow the MCP Streamable HTTP Transport spec (2025-03-26): initialize → initialized notification → tools/list → tools/call. Tool names are namespaced as `mcp__<serverName>__<toolName>`.
- Stdio/CLI MCP connections are adapted in `src/tools/external/stdioMcp.ts` using JSON-RPC over newline-delimited stdio and are also namespaced as `mcp__<serverName>__<toolName>`.
- Add shared Pi tools (always active regardless of mode) to `getSharedTools()` in `src/tools/index.ts`.
- In review mode, previous PR feedback should be materialized into one stable artifact at `.clank8y/review-comments.md` during `prepare-pull-request-review`; do not shard it per review ID unless a later non-review workflow requires that.
- Keep GitHub native Pi tool implementations mode-local when their semantics depend on that mode's workflow; do not force review-specific GitHub tools into a shared global abstraction.
- When prompts, errors, or context messages mention a mode-local MCP tool name, import the tool-name constant and interpolate it instead of hardcoding the string.
- Task setup materializes PR and issue context into `.clank8y/` files as the durable local workflow context.
- Repository clone flows should check only the cloned repository root for a case-insensitive `AGENTS.md` file and inject its full contents into the agent via harness-level system steering after clone/setup, not via tool-return text.

### Common Mistakes to Avoid

- Avoid mixing throw-based control flow with MCP error responses inside tool handlers.
- Avoid under-described schemas; missing descriptions reduces agent tool-call quality.
- Avoid adding `parse*` helper functions for simple one-off input handling. Prefer inline handling at the boundary, or a clearly named adapter (for example `modelFromInput`) only when a real API boundary needs it. Reusable parsers are fine for real domain formats used in multiple places.
- Avoid generic `normalize*` helper functions. For configured GitHub users/orgs/teams, compare exact values and let typos fail visibly.
- Do not use `pnpm test` in automation.
- Do not guess when the requested behavior or scope is unclear.
