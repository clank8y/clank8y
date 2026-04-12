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
import { runClank8y } from 'clank8y'

async function main() {
  const result = await runClank8y({
    promptContext: process.env.PROMPT ?? '',
    auth: {
      githubToken: process.env.GITHUB_TOKEN ?? '',
      copilotToken: process.env.COPILOT_GITHUB_TOKEN ?? '',
    },
    model: 'claude-sonnet-4.6',
  })

  console.log(result)
}

main().catch(console.error)
```

## Runtime Notes

- You must provide GitHub API credentials and a Copilot token yourself.
- This package does not bootstrap GitHub Actions environment variables for you.
- The agent writes temporary artifacts to `.clank8y/` in the current working directory. This directory is created and cleaned automatically.
- Built-in modes currently include `Review`, `Task`, and `IncidentFix`.
- `Task` is single-repository and artifact-first: it writes `.clank8y/pr.md`, `.clank8y/issues/<number>.md`, `.clank8y/diff.txt`, and `.clank8y/report.md` as needed for the run.
- Mode availability is controlled via top-level `disabledModes`. If omitted, no built-in modes are disabled. Entry points such as the GitHub Action can still disable specific modes explicitly.
- Do not enable future modes in the current GitHub Copilot agent until their permission handler and available tool surface have been reviewed for that mode.
- For GitHub-hosted workflow usage, use the [`clank8y/clank8y` action](https://github.com/clank8y/clank8y) instead.

## License

MIT
