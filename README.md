# clank8y

A PR review bot for Cumulocity IoT (c8y). Automated code review and analysis for pull requests.

## Features

- 🚀 TypeScript with strict configuration
- 📦 ESM module format
- ✅ Vitest for testing
- 🎨 ESLint for code quality
- 🔧 tsdown for building
- 🤖 Automated PR reviews for Cumulocity projects

## Getting Started

### Development

```sh
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Usage

The bot integrates with GitHub to analyze and review pull requests for Cumulocity IoT projects. Core functionality is in the `src/` directory.

### GitHub Action configuration

The action accepts the following inputs:

- `prompt` (optional): event-level instruction block appended to the default review prompt

`prompt` is additive and does not replace the built-in base prompt.
For webhook-triggered runs, clank8y expects this block to include metadata such as `pr_number`, `trigger`, and `actor` so the agent can call `set-pull-request-context` first.

#### Copilot authentication (recommended: environment variables)

For CI/CD, set this environment variable:

- `COPILOT_GITHUB_TOKEN` (required)

clank8y requires this token and fails fast if it is missing.
The Copilot SDK requires the `copilot` CLI binary to be available on `PATH`.
clank8y bootstraps this automatically at runtime (install + PATH update), so workflow files do not need a separate CLI installation step.

#### Token type and permissions

Use a **user token** that can access Copilot APIs:

- ✅ Supported: OAuth user tokens (`gho_`, `ghu_`) or fine-grained PAT (`github_pat_`)
- ❌ Not supported: classic PAT (`ghp_`)

The token owner must have an active GitHub Copilot entitlement.

For clank8y:

- The workflow executes the AI review run.
- Copilot model access is authenticated via `COPILOT_GITHUB_TOKEN`.
- PR read/write operations are authenticated via a short-lived bot token minted via OIDC exchange at your website token endpoint.
- Keep `permissions` in workflow at least `id-token: write`, `contents: read`, and `pull-requests: write`.

You can create a fine-grained personal access token in GitHub:

1. Go to GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Generate a token for the org/repo where the action runs
3. Save it as a repository or organization secret, for example: `COPILOT_GITHUB_TOKEN`

Fine-grained PAT permissions for `COPILOT_GITHUB_TOKEN`:

- Account permissions: **Copilot Requests (required)**
- No additional GitHub write permissions are required on this token for clank8y workflow usage.

Local testing token combinations are documented in `localtest.ts` comments.

If you see this error:

`Request models.list failed with message: 401 "unauthorized: Personal Access Token does not have \"Copilot Requests\" permission"`

then regenerate the fine-grained PAT and enable the **Copilot Requests** permission.

#### clank8y GitHub API token (OIDC exchange)

clank8y uses a short-lived GitHub App installation token for PR operations (read diff context + submit review).

- The action requests an OIDC ID token (`id-token: write`) and exchanges it at your clank8y token endpoint.
- The token endpoint validates OIDC claims (issuer, audience, repository, workflow identity) before minting.
- Minted token is scoped to the target repository with minimal permissions.

#### Example workflow

```yaml
name: clank8y-review

on:
    workflow_dispatch:

permissions:
    id-token: write
    contents: read
    pull-requests: write

jobs:
    review:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Run clank8y
                uses: clank8y/clank8y@v0.1.0  # pin to a release tag
                env:
                    COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}

```

- `actions: read` / `checks: read` — needed only when reading workflow/check state as part of agent logic

#### Required workflow file for webhook dispatch mode

If you use the webhook server to trigger reviews, each target repository must include:

- `.github/workflows/clank8y.yml` (or set `GITHUB_WORKFLOW_ID` in the webhook server)
- `on.workflow_dispatch` enabled
- optional `prompt` input (webhook injects event metadata into this block)

Without this file (or with missing `workflow_dispatch` / missing permissions), webhook-triggered runs cannot be dispatched.

### Repository automation workflows

CI/release/deploy automation lives in `.github/workflows`:

| Workflow      | Trigger       | Purpose                                                                                                           |
| ------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `autofix.yml` | push `main`   | `pnpm lint:fix` + auto-commit via `autofix-ci/action`                                                             |
| `ci.yml`      | pull request  | build · test · lint · typecheck; then deploys website preview to CF Workers via `versions upload --preview-alias` |
| `release.yml` | push `v*` tag | validates, builds action artifacts + website, deploys website to production CF Worker, publishes changelog        |

#### Secrets required for website deploy

| Secret                  | Where                     |
| ----------------------- | ------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Repo → Settings → Secrets |
| `CLOUDFLARE_ACCOUNT_ID` | Repo → Settings → Secrets |

Wrangler project name is `clank8y-website` (configured in `website/nitro.config.ts`).

The Worker must be created with a manual first deploy before CI can deploy:

```sh
cd website && pnpm exec nitro build && pnpm exec wrangler deploy
```

### Setting up clank8y in a target repository

This section covers how to add clank8y to any repo you want it to review.

#### 1. How `uses:` references work

GitHub resolves the `uses:` field directly from the published git tree — no build step runs in the consumer repo. This means the built `dist/index.mjs` artifact **must be committed** to the ref you target:

| Reference                        | When to Use                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `clank8y/clank8y@v0.1.0`         | ✅ Recommended for production — pinned, stable                       |
| `clank8y/clank8y@main`           | Latest from `main` branch                                            |
| `clank8y/clank8y@feat/my-branch` | Testing an unreleased branch (dist must be committed to that branch) |

Releases are published automatically when a `v*` tag is pushed to this repo.

#### 2. Required secret

Add one secret to the target repository (**Settings → Secrets → Actions**):

| Secret                 | Description                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `COPILOT_GITHUB_TOKEN` | Fine-grained PAT or OAuth token with **Copilot Requests** account permission and an active Copilot entitlement |

#### 3. Workflow template

Create `.github/workflows/clank8y.yml` in the target repo:

```yaml
name: clank8y

on:
  workflow_dispatch:
    inputs:
      prompt:
        type: string
        required: false

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run clank8y
        uses: clank8y/clank8y@v0.1.0
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
        with:
          prompt: ${{ inputs.prompt }}
```

`id-token: write` is required so clank8y can obtain a short-lived token for PR read/write operations via OIDC exchange.

#### 4. Testing the self-hosted action (this repo)

This repo includes `.github/workflows/clank8y.yml` to test the local action end-to-end using `uses: ./`:

1. Add a `COPILOT_GITHUB_TOKEN` secret to this repo
2. Run **Actions → clank8y → Run workflow**
3. The workflow runs `uses: ./` with Node 24 (`dist/index.mjs` must be present)

clank8y bootstraps the Copilot CLI at runtime — no separate CLI install step needed.

## Roadmap

### POC (required now)

#### Setup

- [ ] Initialize GitHub Copilot runtime in CI (install + start)
- [ ] Configure Copilot to use the clank8y MCP server(s)
- [ ] Add GitHub Action triggers (PR opened/synchronize/reopened, optional manual trigger)
- [ ] Finalize GitHub Action workflow (inputs, permissions, environment, run command)

#### Core Review Flow

- [x] PR metadata + file list + diff build/chunk tools
- [x] One-shot `create-pull-request-review` MCP tool

#### Testing (pragmatic POC)

- [ ] Create a dedicated test repository for end-to-end validation
- [ ] Add repeatable manual acceptance scenarios (obvious bug PR, clean PR, large diff PR)
- [ ] Keep lint/typecheck/test checks green in CI

### Testing

- [ ] Unit tests for schema validation and review request mapping (as available)
- [ ] Integration test for review submission on a test PR repo

### Documentation

- [ ] Document full action setup in README with example workflows
- [ ] Document MCP tools and expected request/response shapes
- [ ] Add troubleshooting section (missing token, invalid PR context, invalid review line)

### Future Scope (post-POC)

- [ ] Add follow-up review tools (`list-pull-request-reviews`, `resolve-review-thread`)
- [ ] Add review-comment retrieval tool for address-feedback mode (`get-review-comments`)
- [ ] Add autonomous fix/address-feedback mode (apply fixes, reply in threads, resolve whollow-up when feedback remains open and should be handled by a dedicated future mode.

## License

MIT

```