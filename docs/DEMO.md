# Ten-minute Demo

The demo uses checked-in examples. It does not claim that tests or repository code were executed
by the model.

## CLI

```bash
pnpm install
pnpm build
export OPENAI_API_KEY="your_key"
node dist/cli.js pr-review --input examples/pr-review.json --output review.md
node dist/cli.js issue-triage --input examples/issue-triage.json --output triage.md
node dist/cli.js release-notes --input examples/release-notes.json --output release.md
```

PowerShell uses `$env:OPENAI_API_KEY = "your_key"`. Never commit the key or generated output that
contains private repository data.

Each command returns the documented Markdown sections for its task. Maintainers must inspect the
result before posting it.

## GitHub Action

Follow the [read-only pilot guide](PILOT_GUIDE.md). The checked-in workflow uses read permissions,
keeps comments off, and writes generated Markdown to the workflow summary.

## Security controls

Run the offline security tests without an API key:

```bash
pnpm test tests/security.test.ts
```

The tests verify that `pull_request_target` requires explicit opt-in, comment posting is disabled
by default, and the pilot workflow does not request write permissions.
