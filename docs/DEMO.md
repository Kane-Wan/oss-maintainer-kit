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

## Offline pilot summary

The checked-in dataset is explicitly synthetic and does not require an API key:

```bash
node dist/cli.js pilot-summary --input examples/pilot-runs.example.json
```

The report heading states that it is not adoption evidence. Replace it only with authorized real
records collected according to [PILOT_DATA.md](PILOT_DATA.md).

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
