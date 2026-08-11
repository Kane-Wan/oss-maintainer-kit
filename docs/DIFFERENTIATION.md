# Project identity and differentiation

The software in this repository is distributed as **Repo Steward AI**. The repository URL remains
`Kane-Wan/oss-maintainer-kit` so existing application and release links continue to resolve.

## What this project does

Repo Steward AI sends bounded, explicitly untrusted repository text to the OpenAI Responses API and
returns reviewable Markdown for pull request review, issue triage, and release preparation. It also
provides an offline command for aggregating opt-in pilot records.

## Name collision disclosure

An unrelated project used the name `oss-maintainer-kit` and published that npm package before this
repository was created. That project focuses on repository scaffolding, templates, labels, and
maintainer documentation. This repository is not affiliated with it and does not claim its npm
downloads, releases, users, or adoption.

Starting with version 0.2.0, this project uses the distinct npm package name `repo-steward-ai` and
the product name Repo Steward AI. The legacy `oss-maintainer` executable remains temporarily as a
compatibility alias; the preferred command is `repo-steward`.

## Verifiable boundaries

- GitHub release assets in this repository belong to Repo Steward AI.
- npm statistics for `oss-maintainer-kit` do not belong to this project.
- External adoption is recorded only with maintainer approval and public evidence.
- Synthetic examples use `datasetKind: "demonstration"` and are never counted as pilots.
