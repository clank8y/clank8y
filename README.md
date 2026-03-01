# clank8y

AI-powered PR review bot for Cumulocity IoT (c8y) projects. Bring your own key — currently supports GitHub Copilot, but the architecture can be extended to other providers.

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
  id-token: write       # required — OIDC token exchange for PR API access
  contents: read         # required — read repository files and diffs
  pull-requests: write   # required — submit PR reviews

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: clank8y/clank8y@abcde123 # pin to a specific commit SHA instead of a tag
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
        with:
          prompt: ${{ inputs.prompt }} # do not set manually
          # model: claude-sonnet-4.6  # optional — defaults to claude-sonnet-4.6
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

> **Note:** Do not fill in the `prompt` input manually. It is populated automatically by the clank8y webhook server with PR context (number, trigger, actor). Manually dispatching this workflow without that context will cause the agent to fail.

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

clank8y reviews PRs when someone mentions `@clank8y` in a comment.

```
@clank8y <optional instruction>
  │
  ▼
Webhook server receives GitHub event
  │
  ▼
Dispatches clank8y.yml workflow in target repo
  │  (injects PR number, trigger, actor into prompt)
  │
  ▼
Action runs with GitHub Copilot agent
  │
  ├─ Reads PR diff + files via MCP tools
  ├─ Generates review using Copilot
  │
  ▼
Submits GitHub PR review with inline comments
```

### What it does

- ✅ On-demand PR code review triggered by `@clank8y` mention
- ✅ Reviews diffs, files, and PR context
- ✅ Submits structured GitHub PR reviews with inline comments

### What it doesn't do (yet)

- ❌ Push code or apply fixes
- ❌ Resolve review threads
- ❌ Run on push or schedule — only on explicit mention

### Token flow

| Token                  | Purpose                      | Who Sets It                            |
| ---------------------- | ---------------------------- | -------------------------------------- |
| `COPILOT_GITHUB_TOKEN` | Copilot model access         | You (repo secret)                      |
| clank8y bot token      | PR read/write via GitHub API | Auto-minted via OIDC — not set by user |

The `id-token: write` permission allows clank8y to exchange an OIDC token for a short-lived bot token scoped to the target repository.

## Development

```sh
pnpm install    # install dependencies
pnpm test:run   # run tests
pnpm build      # build action artifact (dist/index.mjs)
pnpm lint       # lint
pnpm typecheck  # type check
```

## License

MIT
