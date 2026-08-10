# Security Policy

## Supported versions

Until `v1.0.0`, security fixes are applied to the latest release only.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose API keys, tokens, private repository content, or allow unintended GitHub writes.

Use GitHub's private vulnerability reporting feature after the repository is published. If that feature is unavailable, contact the maintainer privately through the email address shown on the maintainer's verified GitHub profile.

Include:

- affected version or commit;
- reproduction steps that do not contain real credentials;
- expected impact;
- a suggested fix, if available.

You should receive an acknowledgement within seven days. No bounty is currently offered.

## Security boundaries

- This project never needs a personal GitHub password.
- API keys belong in environment variables or GitHub Actions secrets.
- Pull request and issue content is untrusted input.
- Generated text is advisory and must not be treated as proof that code is safe.
- `pull_request_target` is rejected unless a maintainer explicitly enables it after reviewing the
  secret, permission, and API-spend risks.

The complete trust-boundary analysis, current controls, and residual risks are documented in
[THREAT_MODEL.md](THREAT_MODEL.md).
