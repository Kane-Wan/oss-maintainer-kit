# OSS Maintainer Kit

[简体中文](README.zh-CN.md)

OSS Maintainer Kit is an open-source CLI and GitHub Action that helps maintainers:

- review pull request metadata and diffs;
- triage issues and draft maintainer replies;
- turn change lists into structured release notes.

It uses the OpenAI Responses API, treats repository content as untrusted data, and never executes code from a pull request.

> Status: early preview (`v0.1.0`). Maintainer judgment is required before posting or acting on generated text.

## Why this project exists

Small open-source teams spend substantial time reading changes, requesting missing reproduction details, and preparing releases. This project provides a transparent, self-hostable starting point for those repetitive workflows without replacing the maintainer's final decision.

## Quick start: CLI

Requirements:

- Node.js 20 or later;
- an OpenAI API key exposed as `OPENAI_API_KEY`.

```bash
pnpm install
pnpm build

export OPENAI_API_KEY="your_key"
node dist/cli.js pr-review --input examples/pr-review.json
node dist/cli.js issue-triage --input examples/issue-triage.json
node dist/cli.js release-notes --input examples/release-notes.json
```

PowerShell:

```powershell
$env:OPENAI_API_KEY = "your_key"
node dist/cli.js issue-triage --input examples/issue-triage.json --language zh-CN
```

Do not commit `.env` files or API keys. The SDK reads the key from the environment.

## JSON input

Every command accepts a JSON file or stdin (`--input -`). The following aliases are supported for analysis content:

| Task            | Common input field     |
| --------------- | ---------------------- |
| `pr-review`     | `diff` or `content`    |
| `issue-triage`  | `body` or `content`    |
| `release-notes` | `changes` or `content` |

Common optional fields include `repository`, `title`, `body`, `labels`, and `version`.

```bash
Get-Content examples/issue-triage.json | node dist/cli.js issue-triage --input -
```

Use `--output review.md` to save Markdown and `--model <model>` to override the model. The default is `gpt-5.6-luna`, chosen for cost-sensitive maintenance automation; `OSS_MAINTAINER_MODEL` can also set the default.

## GitHub Action

After this repository has a `v1` release, consumers can add:

```yaml
name: Maintainer assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issues:
    types: [opened]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  assist:
    runs-on: ubuntu-latest
    steps:
      - uses: Kane-Wan/oss-maintainer-kit@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ github.token }}
          language: auto
          post-comment: "false"
```

The full example is in [`examples/maintainer.yml`](examples/maintainer.yml).

`post-comment` defaults to `false`. Results are written to the workflow job summary and exposed as the `result` output. Turn comments on only after reviewing the behavior in your repository.

### Fork pull requests

GitHub does not expose repository secrets to workflows triggered by pull requests from forks. Do not switch to `pull_request_target` and check out or execute untrusted pull request code. If you use `pull_request_target`, keep permissions minimal, do not run contributed code, and add an authorization or manual-approval gate to control API spend.

## Action inputs

| Input            | Required     | Default        | Description                                     |
| ---------------- | ------------ | -------------- | ----------------------------------------------- |
| `openai-api-key` | yes          | —              | OpenAI key stored in Actions secrets            |
| `github-token`   | PR/comments  | —              | Reads PR files and optionally posts comments    |
| `mode`           | no           | `auto`         | `pr-review`, `issue-triage`, or `release-notes` |
| `model`          | no           | `gpt-5.6-luna` | OpenAI model                                    |
| `language`       | no           | `auto`         | `auto`, `en`, or `zh-CN`                        |
| `post-comment`   | no           | `false`        | Post the generated Markdown                     |
| `content`        | release mode | —              | Change list for release notes                   |
| `title`          | no           | inferred       | Release title                                   |
| `version`        | no           | `Unreleased`   | Release version                                 |

## Security and privacy

- Repository text is marked as untrusted and is never executed.
- The action masks provided tokens in workflow logs.
- Requests set `store: false`.
- Diffs are capped at 8,000 characters per file and 50,000 characters overall; the final prompt content is capped at 60,000 characters.
- API output can be wrong. Maintainers remain responsible for reviews, labels, comments, and releases.
- Private or sensitive repository content is sent to the configured API provider. Use this tool only when that transfer is permitted by your project and organization.

Report vulnerabilities according to [SECURITY.md](SECURITY.md).

## Development

```bash
pnpm install
pnpm check
```

`pnpm check` verifies formatting, TypeScript types, tests, and both distributable bundles. The compiled `dist/action.cjs` must be committed when publishing an Action release because GitHub runners do not install dependencies for JavaScript actions.

## Project governance

- [Roadmap](ROADMAP.md)
- [Contributing guide](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

MIT © 2026 Kane-Wan
