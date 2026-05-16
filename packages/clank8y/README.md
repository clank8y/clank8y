# clank8y

Run the clank8y agent programmatically in sandboxed or custom automation environments.

> **Looking for the GitHub Action?** Use [`clank8y/clank8y`](https://github.com/clank8y/clank8y) directly in your workflow instead of this package.

## ⚠️ Important Warnings

- **This package creates, reads, writes, and deletes files on disk.** It uses a `.clank8y/` working directory in the current working directory for diff artifacts, review comments, and other temporary files.
- **Only run this package inside a sandboxed environment** such as a CI runner, container, or disposable VM. Do not run it on a machine with important local state.
- This is **not** a general-purpose library. It is a runtime package for clank8y agent execution in isolated environments.

## Intended Use

Use this package when you want to:

- run the clank8y review agent outside GitHub Actions in a **sandboxed runner**
- execute reviews in your own container, worker runtime, or disposable VM
- build cross-repo review flows orchestrated by your own system
- run single-repository Task workflows that materialize GitHub context into `.clank8y/` and perform constrained local development work

Do **not** use this package:

- on your local machine without understanding that it will modify the filesystem
- as a general-purpose library or SDK
- when the [GitHub Action](https://github.com/clank8y/clank8y) covers your use case

## Install

```sh
pnpm add clank8y
```

## Usage

```ts
import { createRemoteHttpMcpServer, createStdioMcpServer, runClank8y } from 'clank8y'
import type { PiModelString } from 'clank8y'

async function main() {
  const result = await runClank8y({
    promptContext: process.env.PROMPT ?? '',
    auth: {
      githubToken: process.env.GITHUB_TOKEN ?? '',
    },
    model: process.env.CLANK8Y_MODEL as PiModelString,
    externalMcpServers: {
      // Optional: add any number of extra external MCP servers.
      docs: createRemoteHttpMcpServer({
        url: 'https://example.com/mcp',
        toolNames: ['search-docs'],
      }),
      customCli: createStdioMcpServer({
        command: 'custom-mcp',
        args: ['--stdio'],
        toolNames: ['custom-tool'],
      }),
    },
  })

  console.log(result)
}

main().catch(console.error)
```

## Runtime Notes

- You must provide GitHub API credentials and provider credentials for Pi model access yourself.
- The required `model` option accepts either Pi's native `Model<any>` object or a typed `provider:model-id` string from the exported `PiModelString` union. clank8y does not choose a default model for you.
- clank8y does not pass model-provider tokens through its runtime context. Pi / `@earendil-works/pi-ai` reads provider credentials from standard environment variables such as `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, or `OPENROUTER_API_KEY`. See Pi's provider API key docs for setup details: <https://pi.dev/docs/latest/providers#api-keys>
- This package does not bootstrap GitHub Actions environment variables for you.
- The agent writes temporary artifacts to `.clank8y/` in the current working directory. This directory is created and cleaned automatically.
- Built-in modes currently include `Review`, `Task`, and `IncidentFix`.
- `Task` is single-repository and artifact-first: it writes `.clank8y/pr.md`, `.clank8y/issues/<number>.md`, `.clank8y/diff.txt`, and `.clank8y/report.md` as needed for the run.
- Mode availability is controlled via top-level `disabledModes`. If omitted, no built-in modes are disabled. Entry points such as the GitHub Action can still disable specific modes explicitly.
- Pi receives one native tool list composed from shared Pi tools, mode-local Pi tools, and selected remote HTTP / stdio CLI MCP tools discovered at connection time.
- `externalMcpServers` can be a record or `(mode) => record`, and supports any number of remote HTTP and stdio/CLI MCP server definitions created with `createRemoteHttpMcpServer` or `createStdioMcpServer`.
- For GitHub-hosted workflow usage, use the [`clank8y/clank8y` action](https://github.com/clank8y/clank8y) instead.

## License

MIT
