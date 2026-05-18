# clank8y

AI-powered GitHub review and single-repository task bot for Cumulocity IoT (c8y) projects. Bring your own Pi/model-provider key.

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
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          prompt: ${{ inputs.prompt }} # do not set manually
          model: anthropic:claude-sonnet-4-20250514 # required — provider:model-id
          # timeout-ms: 1200000                    # optional — defaults to 1200000 (20 minutes)
```

> **Note:** Do not fill in the `prompt` input manually. It is populated automatically by the clank8y webhook server with GitHub event metadata, target context, actor, and any quoted user instruction. Manually dispatching this workflow without that context will cause the agent to fail.

## Trigger Authorization

The clank8y webhook server checks whether the GitHub actor is allowed to trigger clank8y before it dispatches the workflow. Unauthorized triggers receive a short GitHub comment and no GitHub Actions run or AI model call is started.

If no config file exists, clank8y defaults to requiring at least `write` repository permission. Add `clank8y.json` to the repository root to change that policy:

```json
{
  "allowedTriggerPermission": "write"
}
```

Supported permission values are `write`, `maintain`, and `admin`. The permissions are ordered from weakest to strongest, so `write` also allows `maintain` and `admin`. Use `maintain` if only maintainers/admins should be able to trigger runs.

To allow only specific users or organization teams, set `allowedClank8yTriggerers`. Entries are either GitHub usernames or teams in `<orgName>/<teamSlug>` form:

```json
{
  "allowedClank8yTriggerers": [
    "octocat",
    "my-org/platform-maintainers"
  ]
}
```

When `allowedClank8yTriggerers` is non-empty, only those users or team members can trigger clank8y; `allowedTriggerPermission` is ignored. Team entries must use the same organization that owns the repository.

## Model and Provider API Keys

clank8y needs a model string and provider credentials for Pi model access.

- `model` is a required GitHub Action input in `provider:model-id` format, for example `anthropic:claude-sonnet-4-20250514`.
- Provider credentials are read directly by Pi / `@earendil-works/pi-ai` from the standard provider environment variables.
- clank8y does not pass model-provider tokens through its own runtime context. Set the environment variable that matches the selected `model` provider.

Common examples:

| Model Provider | Example `model`                          | Secret/env Var to Set                                                                                                |
| -------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Anthropic      | `anthropic:claude-sonnet-4-20250514`     | `ANTHROPIC_API_KEY` or `ANTHROPIC_OAUTH_TOKEN`                                                                       |
| OpenAI         | `openai:gpt-5.1`                         | `OPENAI_API_KEY`                                                                                                     |
| Google Gemini  | `google:gemini-3-pro-preview`            | `GEMINI_API_KEY`                                                                                                     |
| Mistral        | `mistral:mistral-large-latest`           | `MISTRAL_API_KEY`                                                                                                    |
| OpenRouter     | `openrouter:anthropic/claude-sonnet-4.5` | `OPENROUTER_API_KEY`                                                                                                 |
| Groq           | `groq:llama-3.3-70b-versatile`           | `GROQ_API_KEY`                                                                                                       |
| Amazon Bedrock | `amazon-bedrock:<model-id>`              | standard AWS credentials, e.g. `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`, `AWS_PROFILE`, or Bedrock bearer token |
| Google Vertex  | `google-vertex:<model-id>`               | `GOOGLE_CLOUD_API_KEY` or Application Default Credentials with project/location env vars                             |

For the full list of supported provider environment variables and setup details, see Pi's provider API key docs: <https://pi.dev/docs/latest/providers#api-keys>

clank8y exports the allowed typed model-string union as `PiModelString` from the `clank8y` package for TypeScript consumers. The GitHub Action still receives `model` as a string and casts it at the Action boundary; invalid provider/model combinations fail when Pi resolves or uses the model.

### How to configure

1. Pick the Pi model string and set the workflow `model` input.
2. Create or obtain the token expected by that model provider.
3. Save the matching provider token as a repository secret, for example `ANTHROPIC_API_KEY` for `anthropic:*` or `OPENAI_API_KEY` for `openai:*`.
4. Pass that secret as an environment variable in the clank8y workflow step.

## How It Works

clank8y is dispatched from a small set of GitHub webhook events and selects the best execution mode for the incoming request. The workflow is dispatched on the repository default branch; creating a branch, pushing commits, or opening a pull request does not by itself start a run.

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
Action runs with the Pi agent
  │
  ├─ Selects Review or Task mode from the injected context
  ├─ Reads PR/issue/review context via MCP tools
  ├─ Reviews or implements with the configured model
  │
  ▼
Reports back on GitHub as clank8y
```

### What it does

- ✅ Mention-driven runs from issue comments, PR comments, and inline PR review comments that include `@clank8y`
- ✅ Reviewer-assignment runs when clank8y is requested as the PR reviewer
- ✅ Assignment runs when clank8y is assigned to an issue or pull request
- ✅ AI-powered mode selection between `Review` and `Task` in the GitHub Actions runtime
- ✅ Read-only PR reviews with structured GitHub feedback
- ✅ Single-repository Task runs that can edit code, validate locally, push task branches, open same-repo pull requests for issue-driven work, and report back on GitHub as clank8y

### What it doesn't do (yet)

- ❌ Cross-repository incident work in GitHub Actions
- ❌ Automatic branch-create, push, or schedule triggers
- ❌ Automatic PR-open review without an explicit mention, reviewer request, or assignment trigger
- ❌ Fully autonomous mode forcing from the website; the webhook injects context and the agent selects the mode

Reviewer requests and issue/PR assignments use source-specific prompt guidance from the website webhook: reviewer requests nudge toward `Review`, while assignments nudge toward `Task`. Those are still hints, not forced mode routing.

### Token flow

| Token             | Purpose                                                       | Who Sets It                                      |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| Provider API key  | Pi/model access, e.g. `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` | You (repo secret mapped to the matching env var) |
| clank8y bot token | Review/Task GitHub API access and repo writes                 | Auto-minted via OIDC — not set by user           |

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
