# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog, and
the project uses Semantic Versioning for public releases.

## [Unreleased]

## [0.3.1] - 2026-08-11

### Security

- Upgraded the transitive `esbuild` toolchain to `0.28.1`, which includes the fix for
  `GHSA-g7r4-m6w7-qqqr`.
- Moved GitHub workflow write permissions from workflow scope to the jobs that require them.
- Pinned the npm trusted-publishing bootstrap to npm `11.12.1`.

## [0.3.0] - 2026-08-11

### Added

- Offline `eval-summary` command, machine-readable evaluation schema, negative-control fixture,
  and a committed demonstration report.
- Mocked Responses API contract tests covering request storage, parameter forwarding, empty output,
  and upstream errors without making network calls.
- Dependency Review and OpenSSF Scorecard workflows with pinned action commits.
- SPDX JSON SBOM generation for GitHub Release assets.
- Zero-cost `pnpm demo` workflow and a GitHub Marketplace release brief.

### Changed

- Pinned GitHub Actions dependencies to reviewed immutable commit SHAs.
- Updated the npm trusted-publishing workflow to Node.js 24 and npm's current OIDC requirements.
- Included examples in the npm package and updated immutable Action examples to `v0.3.0`.

### Security

- Added a deterministic negative control that rejects outputs missing review structure or asking to
  merge automatically.
- Added high-severity dependency-change blocking and public supply-chain score publication.

## [0.2.0] - 2026-08-11

### Added

- Offline `pilot-summary` command with validated run records and reproducible Markdown metrics.
- Machine-readable pilot dataset schema and an explicitly synthetic demonstration fixture.
- Project identity and package-name collision disclosure.
- Manual npm trusted-publishing workflow with package provenance.

### Changed

- Adopted the distinct product and npm distribution name Repo Steward AI / `repo-steward-ai` while
  retaining the repository URL and legacy CLI alias.
- Added `REPO_STEWARD_MODEL` as the preferred model override while retaining the legacy variable.
- Updated the read-only pilot workflow and documentation to use immutable tag `v0.2.0`.

### Security

- Pilot metrics contain aggregate-friendly fields rather than raw prompts, diffs, issue bodies, or
  credentials.
- Demonstration summaries are prominently labelled as not being adoption evidence.

## [0.1.0] - 2026-08-10

### Added

- TypeScript CLI for pull request review, issue triage, and release notes.
- GitHub Action with read-only job summaries and opt-in comments.
- English and Simplified Chinese documentation.
- Offline unit tests, CI, CodeQL, Dependabot, contribution guidelines, and security policy.
- Threat model, read-only pilot guide, honest adoption registry, metrics definitions, and pilot
  report templates.
- Automated release verification and GitHub Release workflow.

### Changed

- Updated maintained GitHub Actions dependencies after reviewing Dependabot changes.
- Changed the pilot workflow to read-only permissions and an immutable `v0.1.0` reference.
- Added npm package contents and repeatable prepack and release checks.

### Security

- Marked repository text as untrusted data and capped per-file, combined-diff, and final-content
  input sizes.
- Masked API and GitHub tokens and disabled API response storage.
- Disabled `pull_request_target` by default and required explicit risk acceptance to enable it.
- Added repository security-invariant tests and documented residual risks.

[0.1.0]: https://github.com/Kane-Wan/oss-maintainer-kit/releases/tag/v0.1.0
[0.2.0]: https://github.com/Kane-Wan/oss-maintainer-kit/releases/tag/v0.2.0
[0.3.0]: https://github.com/Kane-Wan/oss-maintainer-kit/releases/tag/v0.3.0
[0.3.1]: https://github.com/Kane-Wan/oss-maintainer-kit/releases/tag/v0.3.1
