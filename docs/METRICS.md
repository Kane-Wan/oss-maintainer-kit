# Pilot Metrics

Metrics exist to improve maintainer workflows, not to manufacture popularity.

## Definitions

| Metric                  | Definition                                                                 |
| ----------------------- | -------------------------------------------------------------------------- |
| Opt-in public adopter   | A repository with public usage evidence and maintainer approval            |
| Active pilot            | An approved repository that ran the tool during the last 30 days           |
| Rated result            | A generated result marked `accepted`, `edited`, `rejected`, or `not-rated` |
| Useful-result rate      | `(accepted + edited) / rated results excluding not-rated`                  |
| Blocking false positive | A reported blocking problem that a maintainer verified as incorrect        |
| Workflow success rate   | Completed analysis runs divided by attempted runs                          |
| Estimated time saved    | Maintainer-provided range, reported as a median and sample size            |

## Minimum report

Publish the date range, tool version, public repository links, number of attempted and completed
runs, rating counts, known false positives, and the number of maintainers who provided feedback.
Always distinguish measured values from estimates.

Use the offline `pilot-summary` command to calculate these definitions consistently from structured
records. See [PILOT_DATA.md](PILOT_DATA.md). The command validates data shape and calculations but
does not verify repository ownership or whether human ratings are truthful.

## Privacy rules

- Collect aggregate counts, not raw prompts, diffs, issue bodies, emails, or credentials.
- Do not identify a maintainer or repository without opt-in approval.
- Do not report private-repository adoption publicly.
- Keep `not-rated` results in the denominator for workflow reliability but not output usefulness.
- Correct published metrics when their source evidence changes.

## Current baseline

There are currently no verified external pilots. GitHub stars, forks, package downloads, and
workflow runs should be read directly from their public sources and never copied into this file as
timeless claims.

The npm package named `oss-maintainer-kit` belongs to an unrelated project. Its downloads are not
evidence for this repository. See [DIFFERENTIATION.md](DIFFERENTIATION.md).
