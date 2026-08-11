# Pilot Data Workflow

Repo Steward AI can turn privacy-conscious run records into a reproducible Markdown summary without
calling an API. It does not collect raw prompts, diffs, issue bodies, emails, or credentials.

## Create a dataset

Copy [`examples/pilot-runs.example.json`](../examples/pilot-runs.example.json). Keep
`datasetKind: "demonstration"` for tutorials and synthetic data. Change it to `pilot` only for
records collected from an authorized real pilot.

The machine-readable format is documented by
[`pilot-record.schema.json`](pilot-record.schema.json). Each run has a unique ID, task, completion
status, optional human rating, optional time-saved estimate, and optional public evidence URL.

## Generate a summary

```bash
pnpm build
node dist/cli.js pilot-summary --input examples/pilot-runs.example.json
```

Or write the summary to a file:

```bash
node dist/cli.js pilot-summary --input pilot-runs.json --output pilot-summary.md
```

The command calculates workflow success, useful-result rate, rating counts, blocking false
positives, median estimated minutes saved, and per-task run counts. Demonstration datasets are
prominently labelled as not being adoption evidence.

## Evidence rules

- Obtain maintainer approval before identifying a repository or maintainer publicly.
- Link public workflow runs, issues, or reports when possible.
- Do not turn stars, forks, or unrelated package downloads into pilot records.
- Keep failed and rejected runs; removing them makes the report misleading.
- Treat time saved as a maintainer estimate, not an automatically measured fact.
- The CLI validates structure but cannot verify that submitted ratings are truthful.
