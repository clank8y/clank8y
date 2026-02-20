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