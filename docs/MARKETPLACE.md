# GitHub Marketplace release brief

This document prepares the repository for a future GitHub Actions Marketplace release. Publishing
is a separate maintainer action that requires accepting GitHub's Marketplace Developer Agreement,
selecting categories, using two-factor authentication, and publishing a release through the GitHub
release form.

## Listing fields

- **Action name:** Repo Steward AI
- **Primary category:** Code quality
- **Secondary category:** Utilities
- **Short description:** Reviews pull requests, triages issues, and drafts release notes with the OpenAI Responses API.
- **Repository:** `Kane-Wan/oss-maintainer-kit`
- **Runtime:** JavaScript action on Node.js 20
- **Entry point:** `dist/action.cjs`
- **Default posture:** read-only job summary; comment posting is opt-in

## Suggested listing copy

Repo Steward AI gives open-source maintainers a safety-conscious starting point for reviewing pull
request metadata and diffs, triaging issues, and drafting structured release notes. Repository text
is treated as untrusted data, request storage is disabled, inputs are bounded, and the action never
executes contributed code. Results remain advisory and require maintainer judgment.

The action supports English, Simplified Chinese, automatic language selection, configurable OpenAI
models, read-only pilot workflows, and optional comment posting after maintainers review behavior
and permissions.

## Release checklist

- [x] Public repository with one root `action.yml`
- [x] Unique proposed action name checked before release preparation
- [x] Name, description, author, branding, inputs, outputs, and Node entry point present
- [x] Compiled `dist/action.cjs` committed
- [x] Immutable release tags and automated release checks
- [x] Security policy and threat model
- [ ] Accept the Marketplace Developer Agreement
- [ ] Select categories and publish an immutable release through the Marketplace release form
- [ ] Confirm the listing displays the read-only default and API-key requirements accurately
