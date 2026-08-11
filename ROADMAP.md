# Roadmap

The roadmap is evidence-driven. Priorities may change after feedback from real maintainers.

## v0.1 - Foundation and public release

- [x] Pull request review from file metadata and patches
- [x] Issue triage and draft replies
- [x] Release note generation
- [x] CLI and GitHub Action entry points
- [x] English and Simplified Chinese documentation
- [x] Offline unit tests, CI, CodeQL, and release checks
- [x] Read-only pilot workflow and `pull_request_target` opt-in guard
- [x] Threat model, pilot metrics, and adoption-evidence process
- [x] Publish the first immutable GitHub Release
- [ ] Complete npm ownership and authentication setup

## v0.2 - Evidence-ready pilots

- [x] Adopt a distinct distribution name and disclose the pre-existing package-name collision
- [x] Add structured pilot run records and an offline metrics summary command
- [x] Mark synthetic demonstration data so it cannot be mistaken for adoption evidence
- [x] Prepare manual npm trusted publishing with provenance
- [ ] Run read-only pilots in at least five public repositories
- [ ] Publish opt-in pilot reports with maintainer approval
- [ ] Add configurable repository review rules
- [ ] Deduplicate repeated bot comments
- [ ] Add cost and token-usage summaries
- [ ] Collect opt-in quality feedback from maintainers

## v0.3 - Safer automation

- [ ] Member or label approval gate for fork pull requests
- [ ] Idempotent label suggestions with an explicit write mode
- [ ] Release note generation from Git tags and merged pull requests
- [ ] Redaction rules for configurable sensitive paths and patterns

## v1.0 - Stable maintainer workflow

- [ ] Stable configuration and output contracts
- [ ] Documented upgrade and deprecation policy
- [ ] Integration tests against a dedicated public fixture repository
- [ ] Published npm package and immutable major GitHub Action tag
- [ ] Evidence from multiple independently maintained repositories

## Evidence gates

A roadmap checkbox is not proof of adoption. Releases must link to source commits and passing
checks; adopters require public evidence and maintainer approval; metrics must follow
[docs/METRICS.md](docs/METRICS.md). Artificial stars, downloads, installations, or testimonials
are never accepted as evidence.
