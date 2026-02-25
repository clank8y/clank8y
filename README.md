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
                uses: schplitt/clank8y@main
                env:
                    COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
                with:
                    prompt: |
                        EVENT-LEVEL INSTRUCTIONS:
                        You have been mentioned in a PR review.

                        ---

                        trigger: issue_comment
                        pr_number: 123
                        actor: octocat
                        report_back_to: @octocat

#### Why not Pullfrog-level permissions?

clank8y can run with fewer permissions because it does less repository mutation than a general-purpose coding agent.

- `pull-requests: write` — required to submit PR reviews
- `contents: read` — required to read repository files/diffs

Compared with Pullfrog templates, these are intentionally **not** required for clank8y:

- `contents: write` — needed only if the agent edits/pushes code
- `actions: read` / `checks: read` — needed only when reading workflow/check state as part of agent logic

#### Required workflow file for webhook dispatch mode

If you use the webhook server to trigger reviews, each target repository must include:

- `.github/workflows/clank8y.yml` (or set `GITHUB_WORKFLOW_ID` in the webhook server)
- `on.workflow_dispatch` enabled
- optional `prompt` input (webhook injects event metadata into this block)

Minimal example:

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
                uses: schplitt/clank8y@main
                env:
                    COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
                with:
                    prompt: ${{ inputs.prompt }}
```

Without this file (or with missing `workflow_dispatch` / missing permissions), webhook-triggered runs cannot be dispatched.

### Test in this repository (before publishing)

This repository includes <.github/workflows/review.yml> to test the local action end-to-end:

1. Add a repository secret named `COPILOT_GITHUB_TOKEN`
2. Run **Actions → clank8y → Run workflow** (or trigger it from the webhook server)
3. Ensure the dispatched run is associated with the intended pull request context
4. The workflow builds `dist/` and runs `uses: ./` with Node 24 (clank8y handles Copilot CLI bootstrap internally)

If the run succeeds, clank8y should post a PR review using the MCP GitHub tools.

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