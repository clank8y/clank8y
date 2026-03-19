# TODO

## Done

- Make clank8y runtime more agent/server agnostic.
- Move the GitHub Action specific runtime/bootstrap concerns toward the entry wrapper so `runClank8y(...)` stays reusable.

## First PR After Mode Selection

### Goal

Ship the first review-quality PR after mode selection as a single durable review-state improvement.

This PR should introduce a better review scratchpad so the agent can keep coverage and findings state across a review run while staying MCP-first and read-only.

### Proposed PR title

`Phase 1A: Add review scratchpad`

### In scope

- Add one durable review-state tool in GitHub MCP, preferably a single `review-scratchpad` surface that can:
  - initialize notes/checklist state
  - track reviewed vs remaining files
  - record suspected repeated patterns
  - record validated findings and open questions
- Tighten the `Review` prompt so the agent must use the scratchpad during the run.
- Add focused tests for scratchpad behavior and expected state transitions.

### Explicitly out of scope

- `checkout-pull-request`
- local repo checkout / worktrees
- file editing, commit, or push flows
- reply / resolve review-thread APIs
- previous-review awareness (`list-pull-request-reviews`, `get-review-comments`)
- new modes beyond `Review`
- moving `set-pull-request-context` into MCP
- comment validation / normalization
- review submission hardening / `422` recovery
- branch creation / PR creation
- generalized shell access

### GitHub agent tool stance for this PR

- Do **not** re-enable native `bash`, `create`, or `edit` tools for the GitHub agent in this PR.
- Do **not** re-enable native `rg` or `grep` / `grep` for this PR.
- Prefer an MCP scratchpad surface over reopening native file tools so the workflow stays portable across runtimes.
- Leave the remaining Copilot-specific PR-context tool alone for now; removing it belongs to a later PR.

### Why this is the right slice

- It addresses the largest large-PR weakness first: dropped review state.
- It improves review quality immediately without taking on line-mapping, git safety, or edit-mode risk.
- It keeps the first PR small enough to review and ship quickly.
- It creates the foundation for later validation, search, incremental review, checkout, and fix-mode work.

### Acceptance criteria

- The agent has a durable review-state surface during the run.
- The `Review` prompt clearly instructs the agent to maintain and use that scratchpad.
- Scratchpad behavior is covered by tests.
- `pnpm test:run`, `pnpm lint`, and `pnpm typecheck` pass.

## Likely next PR after that

- Move `set-pull-request-context` into GitHub MCP.
- Add comment validation / normalization before review submission.
- Harden review submission around invalid inline comments / `422` failures.
- Add search over changed PR files / repo files for repeated-pattern expansion.
- Add previous-review awareness tools.
- Then add checkout + fix-mode capabilities as a separate mode.