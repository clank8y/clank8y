# clank8y website

The clank8y webhook server and landing page, built with [Nitro](https://v3.nitro.build) and deployed to Cloudflare Workers.

## Responsibilities

- Receives GitHub webhook events for clank8y-triggered automation
- Dispatches `.github/workflows/clank8y.yml` in the target repository
- Injects structured GitHub event metadata and quoted user instructions into the action prompt
- Exchanges GitHub Actions OIDC tokens for short-lived installation tokens used by clank8y

## Current webhook triggers

- `issue_comment.created` when the comment mentions `@clank8y`
- `pull_request_review_comment.created` when the comment mentions `@clank8y`
- `pull_request.review_requested` when clank8y is the requested reviewer
- `issues.assigned` when clank8y is assigned to the issue

The webhook does not hard-force a runtime mode for mention-driven or assignment-driven requests. It passes the GitHub event context into the prompt and lets clank8y select the best mode in the action runtime.

Assignment triggers inject source-specific guidance:

- reviewer assignment biases toward `Review`
- issue assignment biases toward `Task`

Those are prompt-level hints only. The final mode choice still happens inside clank8y.

## Token exchange

The website token endpoint mints installation tokens scoped to the target repository with:

- `contents: write`
- `pull_requests: write`
- `issues: write`

Those permissions allow the GitHub-hosted clank8y runtime to complete both read-only Review runs and single-repository Task runs.

## Development

```sh
pnpm install
pnpm dev
```