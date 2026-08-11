# Read-only Pilot Guide

This guide helps a maintainer run a small, reversible pilot and produce honest adoption evidence.

## Before the pilot

- Use a public repository you own or administer.
- Confirm that sending repository text to the configured API is permitted.
- Create an API-spend budget and an owner who can stop the workflow.
- Start with `post-comment: "false"` and read-only GitHub permissions.
- Never place API keys in workflow YAML, issues, logs, or screenshots.

## Install

Copy [`examples/maintainer.yml`](../examples/maintainer.yml) to
`.github/workflows/maintainer-assistant.yml` and add `OPENAI_API_KEY` as an Actions secret.

The example writes results to the job summary. It does not post comments or modify repository
content. Keep the immutable `v0.3.1` reference during the pilot and review upgrades explicitly.

## Suggested 14-day pilot

1. Select 5–20 representative pull requests or issues.
2. Record whether the workflow completed, without copying private input into metrics.
3. Have a maintainer rate each result as `accepted`, `edited`, `rejected`, or `not-rated`.
4. Record blocking false positives and an estimated time-saved range.
5. Stop the pilot if output leaks sensitive data, API spend exceeds the budget, or maintainers
   cannot reliably review results.

Record only aggregate-friendly fields using [PILOT_DATA.md](PILOT_DATA.md), then generate the
summary locally with `repo-steward pilot-summary`. Do not store raw prompts or repository content in
the metrics dataset.

## Publish useful evidence

Use [PILOT_REPORT_TEMPLATE.md](PILOT_REPORT_TEMPLATE.md). Link only public artifacts and obtain
maintainer approval before adding a repository to [ADOPTERS.md](../ADOPTERS.md). Negative and
mixed results are welcome; they are more useful than inflated success claims.

## Roll back

Disable or remove the workflow, revoke the repository secret if exposure is suspected, delete
unwanted bot comments through normal GitHub controls, and file a private security report when
appropriate. Removing the workflow does not delete data already sent to an API provider.
