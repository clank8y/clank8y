# clank8y

AI-powered GitHub review and single-repository task bot for Cumulocity IoT (c8y) projects. Bring your own key — currently supports GitHub Copilot, but the architecture can be extended to other providers.

**[Install the GitHub App →](https://github.com/apps/clank8y)**

## Getting Started

Add `.github/workflows/clank8y.yml` to any repo you want clank8y to review and **commit it to the default branch** — the workflow must exist on the default branch before the bot can dispatch it:

```yaml
name: clank8y

on:
  workflow_dispatch:
    inputs:
      prompt: # internal — filled automatically by the webhook server
        type: string
        required: false

permissions:
  id-token: write       # required — OIDC token exchange for the clank8y bot token

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: clank8y/clank8y@<sha> # pin to a specific commit SHA instead of a tag
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
        with:
          prompt: ${{ inputs.prompt }} # do not set manually
          # model: claude-sonnet-4.6  # optional — defaults to claude-sonnet-4.6
          # timeout-ms: 1200000      # optional — defaults to 1200000 (20 minutes)
          #
          # Known models (as of 2026-03):
          #   claude-sonnet-4.6      (default) — best balance of quality and speed
          #   claude-sonnet-4.5
          #   claude-haiku-4.5       — fastest, lowest cost
          #   claude-opus-4.6        — highest quality
          #   claude-opus-4.6-fast
          #   claude-opus-4.5
          #   claude-sonnet-4
          #   gpt-5.1
          #   gpt-5.1-codex
          #   gpt-5.1-codex-mini
          #   gpt-5-mini
          #   gpt-4.1
```

> **Note:** Do not fill in the `prompt` input manually. It is populated automatically by the clank8y webhook server with GitHub event metadata, target context, actor, and any quoted user instruction. Manually dispatching this workflow without that context will cause the agent to fail.

## Copilot Token

clank8y needs a token with access to GitHub Copilot APIs. Add it as a repository secret named `COPILOT_GITHUB_TOKEN`.

### Supported token types

- ✅ Fine-grained PAT (`github_pat_...`)
- ✅ OAuth user tokens (`gho_...`, `ghu_...`)
- ❌ Classic PATs (`ghp_...`) — not supported

### Required permissions

- **Copilot Requests** (account permission) — this is the only permission needed on this token

The token owner must have an active GitHub Copilot entitlement.

### How to create

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Create a token for the org/repo where the action runs
3. Enable the **Copilot Requests** account permission
4. Save it as `COPILOT_GITHUB_TOKEN` in repo **Settings → Secrets and variables → Actions**

If you see `401 "unauthorized: Personal Access Token does not have \"Copilot Requests\" permission"`, regenerate the token with Copilot Requests enabled.

## How It Works

clank8y is dispatched from GitHub webhooks and selects the best execution mode for the incoming request.

```
@clank8y <optional instruction>
  │
  ▼
Webhook server receives GitHub event
  │
  ▼
Dispatches clank8y.yml workflow in target repo
  │  (injects structured trigger, target, actor, and instruction context into prompt)
  │
  ▼
Action runs with GitHub Copilot agent
  │
  ├─ Selects Review or Task mode from the injected context
  ├─ Reads PR/issue/review context via MCP tools
  ├─ Reviews or implements with Copilot
  │
  ▼
Reports back on GitHub as clank8y
```

### What it does

- ✅ Mention-driven runs from issue comments, PR comments, and inline PR review comments
- ✅ Reviewer-assignment runs when clank8y is requested as the PR reviewer
- ✅ Issue-assignment runs when clank8y is assigned to the issue
- ✅ AI-powered mode selection between `Review` and `Task` in the GitHub Actions runtime
- ✅ Read-only PR reviews with structured GitHub feedback
- ✅ Single-repository Task runs that can edit code, validate locally, push task branches, and report back on GitHub as clank8y

`IncidentFix` remains available only for sandboxed/custom environments and is disabled in the GitHub Actions runtime.

### What it doesn't do (yet)

- ❌ Cross-repository incident work in GitHub Actions
- ❌ Automatic PR-open review without an explicit mention or assignment trigger
- ❌ Automatic push/schedule triggers without webhook dispatch
- ❌ Fully autonomous mode forcing from the website; the webhook injects context and the agent selects the mode

Reviewer assignments and issue assignments use source-specific prompt guidance from the website webhook: reviewer assignment nudges toward `Review`, while issue assignment nudges toward `Task`. Those are still hints, not forced mode routing.

### Token flow

| Token                  | Purpose                                       | Who Sets It                            |
| ---------------------- | --------------------------------------------- | -------------------------------------- |
| `COPILOT_GITHUB_TOKEN` | Copilot model access                          | You (repo secret)                      |
| clank8y bot token      | Review/Task GitHub API access and repo writes | Auto-minted via OIDC — not set by user |

The `id-token: write` permission allows clank8y to exchange an OIDC token for a short-lived bot token scoped to the target repository. The website token exchange currently mints repository-scoped permissions for `contents: write`, `pull_requests: write`, and `issues: write` so the GitHub-hosted runtime can complete both Review and Task workflows.

## Development

```sh
pnpm install    # install dependencies
pnpm test:run   # run package tests
pnpm build      # build action artifact (.action/index.mjs) and package dist
pnpm lint       # lint
pnpm typecheck  # type check
```

## npm Package

The repo also publishes the `clank8y` npm package from `packages/clank8y`.

That package is intended for running the clank8y agent in sandboxed or custom automation environments. It is not the recommended path for GitHub-hosted workflow usage; for GitHub Actions, use the action in this repository instead.

## License

MIT
