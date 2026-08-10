# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog, and
the project uses Semantic Versioning for public releases.

## [Unreleased]

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
