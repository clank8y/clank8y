# AGENTS.md

## Project Overview

**clank8y** (klanki) is a PR review bot for Cumulocity IoT (c8y). It automates code review and analysis of pull requests using TypeScript, ESM modules, Vitest for testing, ESLint for code quality, and tsdown for automated builds.

## Architecture

```
src/
├── index.ts            # Main action entrypoint
├── setup.ts            # Action inputs + PR context assembly
├── prompt.ts           # Base PR review prompt + prompt-context composition
├── agents/             # Review agent runtime (Copilot SDK)
└── mcp/                # Local GitHub MCP server and tools
tests/
└── greet.test.ts       # Tests using Vitest
```

### Source (src/index.ts)

- Main entry point for the bot
- All public PR review functions and utilities should be exported here
- Uses ESM module format

### Tests (tests/)

- Uses Vitest for testing
- Test files follow the `*.test.ts` naming convention
- Import from `../src` to test the source code

## Development

```sh
pnpm install    # Install dependencies
pnpm test:run   # Run tests
pnpm build      # Build with tsdown
pnpm lint       # Lint with ESLint
pnpm lint:fix   # Lint and auto-fix
pnpm typecheck  # TypeScript type checking
```

## Code Style

- ESM only (`"type": "module"`)
- TypeScript strict mode enabled
- Uses `tsdown` for building
- Uses `@schplitt/eslint-config` for linting
- Uses `vitest` for testing

## Testing

- Write tests in the `tests/` directory
- Use `*.test.ts` file naming convention
- Run `pnpm test:run` for running tests
- Import modules from `../src`

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

## v1 Implementation Checklist

### POC Scope (required now)

### Setup & Runtime

- [ ] Initialize GitHub Copilot runtime in CI (install + start)
- [ ] Configure Copilot with clank8y MCP server(s)
- [ ] Add action triggers for PR workflows (open/sync/reopen) and optional manual trigger
- [ ] Finalize action workflow (permissions, environment variables, execution entrypoint)

### MCP Review Surface

- [x] Implement PR context, file list, diff build/chunk read tools
- [x] Implement one-shot review submission tool (`create-pull-request-review`)

### Quality Gates

- [ ] Add integration-style validation in a dedicated test repository
- [ ] Keep lint + typecheck + tests green in CI

### Docs & DX

- [ ] Keep README action setup up-to-date with real workflow examples
- [ ] Document each MCP tool contract (inputs, outputs, error cases)
- [ ] Add troubleshooting notes for auth, event context, and invalid diff line mappings

### Future Scope (post-POC)

- [ ] Implement follow-up review tools (`list-pull-request-reviews`, `resolve-review-thread`)
- [ ] Implement review-thread retrieval tool (`get-review-comments`) for address-feedback mode
- [ ] Add automation flow for addressing existing feedback (thread read → fix → reply → resolve)

## Project Context & Learnings

This section captures project-specific knowledge, tool quirks, and lessons learned during development. When the user provides corrections or context about how things should be done in this project, add them here if they are recurring patterns (not a one-time fix).

> **Note:** Before adding something here, consider: Is this a one-time fix, or will it come up again? Only document patterns that are likely to recur or are notable enough to prevent future mistakes.

### Tools & Dependencies

- MCP tool handlers should return `tool.error(...)` for user-facing tool failures instead of throwing from inside handlers.

### Patterns & Conventions

- For Valibot schemas in MCP tools, keep schemas inline (no extra standalone schema variables when not needed).
- Add field-level guidance via `v.pipe(..., v.description(...))` so agents get better tool-usage hints.
- Keep GitHub Action input names kebab-case (`copilot-token`, `github-token`, `prompt-context`) and map them via `core.getInput(...)`.
- `prompt-context` is additive: insert user context into the base prompt, never replace the entire default prompt.
- For Copilot SDK auth in CI, pass explicit `githubToken` and set `useLoggedInUser: false` to avoid fallback to local/`gh` credentials.
- Keep GitHub Action input names kebab-case (`github-token`, `prompt-context`) and map them via `core.getInput(...)`.
- Prefer Copilot SDK authentication via CI environment variable (`COPILOT_GITHUB_TOKEN`) and fail fast when no supported env token is present.
- Fine-grained PATs used as `COPILOT_GITHUB_TOKEN` must include **Copilot Requests** permission, otherwise `models.list` fails with 401 unauthorized.
- Keep the PR review base prompt in `src/prompt.ts` and make `prompt-context` strictly additive.
- Prefer clean, simple, reusable solutions over one-off or ad-hoc implementations.
- If requirements are ambiguous, ask a focused clarifying question instead of implementing a guessed solution.

### Common Mistakes to Avoid

- Avoid mixing throw-based control flow with MCP error responses inside tool handlers.
- Avoid under-described schemas; missing descriptions reduces agent tool-call quality.
