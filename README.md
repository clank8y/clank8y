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

- `github-token` (required): token used to create the Octokit client
- `prompt-context` (optional): extra context inserted into the default review prompt

`prompt-context` is additive and does not replace the built-in base prompt.

#### Copilot authentication (recommended: environment variables)

For CI/CD, set one of these environment variables (priority order):

- `COPILOT_GITHUB_TOKEN` (recommended)
- `GH_TOKEN`
- `GITHUB_TOKEN`

The SDK reads these automatically. clank8y requires one of them to be set and fails fast if none is present.
The Copilot SDK requires the `copilot` CLI binary to be available on `PATH`.
clank8y bootstraps this automatically at runtime (install + PATH update), so workflow files do not need a separate CLI installation step.

#### Token type and permissions

Use a **user token** that can access Copilot APIs:

- ✅ Supported: OAuth user tokens (`gho_`, `ghu_`) or fine-grained PAT (`github_pat_`)
- ❌ Not supported: classic PAT (`ghp_`)

The token owner must have an active GitHub Copilot entitlement.

For clank8y:

- Copilot model access is authenticated via `COPILOT_GITHUB_TOKEN` (or equivalent env var)
- PR read/write operations are authenticated separately via `github-token` (usually `${{ secrets.GITHUB_TOKEN }}`)
- Keep `permissions` in workflow at least `contents: read`, `pull-requests: write`, and `issues: write` (required for command acknowledgment reaction)

You can create a fine-grained personal access token in GitHub:

1. Go to GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Generate a token for the org/repo where the action runs
3. Save it as a repository or organization secret, for example: `COPILOT_GITHUB_TOKEN`

Fine-grained PAT permissions for this token should be minimal:

- Account permissions: **Copilot Requests (required)**
- Repository permissions: **Contents (read-only)**
- Pull requests are handled by the separate `github-token` input, not by `COPILOT_GITHUB_TOKEN`

In practice: for `COPILOT_GITHUB_TOKEN` you usually do **not** need extra write permissions. If GitHub requires you to pick a repository permission when creating the token, choose the smallest read-only option.

If you see this error:

`Request models.list failed with message: 401 "unauthorized: Personal Access Token does not have \"Copilot Requests\" permission"`

then regenerate the fine-grained PAT and enable the **Copilot Requests** permission.

#### GitHub API token (`github-token`)

Use the standard GitHub Actions token for repo API calls unless you need broader access:

- Recommended: `${{ secrets.GITHUB_TOKEN }}`

#### Example workflow

```yaml
name: clank8y-review

on:
    pull_request:
        types: [opened, reopened]
    issue_comment:
        types: [created]
    workflow_dispatch:

permissions:
    contents: read
    pull-requests: write
    issues: write

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
                    github-token: ${{ secrets.GITHUB_TOKEN }}
                    prompt-context: |
                        Prioritize breaking API changes and missing tests.
                        Treat security-sensitive changes as high priority.

#### Required workflow file for webhook dispatch mode

If you use the webhook server to trigger reviews, each target repository must include:

- `.github/workflows/clank8y.yml` (or set `GITHUB_WORKFLOW_ID` in the webhook server)
- `on.workflow_dispatch` enabled
- inputs that match the dispatched payload (`trigger`, `pr_number`, `actor`, `is_maintainer`, `instruction`)

Minimal example:

```yaml
name: clank8y

on:
    workflow_dispatch:
        inputs:
            trigger:
                type: string
                required: true
            pr_number:
                type: string
                required: true
            actor:
                type: string
                required: true
            is_maintainer:
                type: string
                required: true
            instruction:
                type: string
                required: false

permissions:
    contents: read
    pull-requests: write
    issues: write

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
                    github-token: ${{ secrets.GITHUB_TOKEN }}
                    prompt-context: ${{ inputs.instruction }}
```

Without this file (or with missing `workflow_dispatch` / missing permissions), webhook-triggered runs cannot be dispatched.

### Test in this repository (before publishing)

This repository includes <.github/workflows/review.yml> to test the local action end-to-end:

1. Add a repository secret named `COPILOT_GITHUB_TOKEN`
2. Open or reopen a pull request for automatic review
3. To request another review on an existing PR, comment `/clank8y` (clank8y acknowledges with 👀)
4. Or run **Actions → PR Review → Run workflow** manually
5. The workflow builds `dist/` and runs `uses: ./` with Node 24 (clank8y handles Copilot CLI bootstrap internally)

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