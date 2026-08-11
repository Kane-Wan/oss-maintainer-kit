# Threat Model

This document describes the security boundaries of Repo Steward AI `v0.2.x`. It is not a
claim that AI output is safe or that every threat is eliminated.

## Assets to protect

- OpenAI API keys and GitHub tokens;
- private repository content and contributor personal data;
- maintainer permissions, comments, labels, and release workflows;
- API budget and GitHub Actions minutes;
- the integrity of generated reviews and published packages.

## Trust boundaries

```text
GitHub event payload and diff (untrusted)
        |
        v
Repo Steward AI action -------> OpenAI Responses API
        |                              |
        v                              v
job summary (default)          generated Markdown (untrusted advice)
        |
        +----> GitHub comment (explicit opt-in only)
```

Repository titles, issue bodies, labels, patches, and release notes are attacker-controlled
inputs. Generated Markdown is also untrusted until a maintainer reviews it.

## Threats and controls

| Threat                                     | Current control                                                                                                       | Residual risk                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Prompt injection in repository text        | System instructions mark all repository content as untrusted data; unit tests cover common instruction-injection text | A model may still produce incorrect or manipulated advice                            |
| Secret exposure in logs                    | Action inputs are masked with `core.setSecret`; examples use GitHub secrets                                           | A maintainer can still paste a secret into an issue, diff, or custom workflow        |
| Execution of contribution code             | The action reads metadata and patches through the GitHub API and never checks out or executes PR code                 | A consumer workflow could add an unsafe checkout or shell step                       |
| `pull_request_target` privilege escalation | The event is rejected by default and requires explicit `allow-pull-request-target: "true"`                            | Opted-in workflows can expose secrets or spend API budget if poorly designed         |
| Excessive token or API spend               | Per-file, combined-diff, and final-content limits; fork PRs do not receive repository secrets by default              | Repeated authorized events can still consume budget                                  |
| Unauthorized GitHub writes                 | `post-comment` defaults to `false`; the pilot workflow is read-only                                                   | Enabling comments grants a write path and requires a token with suitable permissions |
| Data retention by the API                  | Responses requests set `store: false`                                                                                 | Provider and organization policies still apply to transmitted content                |
| Dependency or Action compromise            | Lockfile, Dependabot, CodeQL, CI, and reviewed version updates                                                        | Tags can move and dependencies can still be compromised upstream                     |
| Hallucinated security findings             | Output is advisory; default delivery is a job summary; documentation requires maintainer review                       | Maintainers can over-trust confident but incorrect output                            |

## Safe deployment requirements

1. Start with `post-comment: "false"` and read-only GitHub permissions.
2. Do not use `pull_request_target` unless the workflow never checks out or executes contributor
   code and the maintainer accepts the API-spend risk.
3. Store API keys only in Actions secrets or approved secret managers.
4. Do not send private or regulated repository content unless the organization permits it.
5. Review generated Markdown before copying it into an issue, pull request, or release.
6. Pin immutable release tags for production use and review upgrades.

## Security non-goals

- proving that a pull request is safe to merge;
- executing tests or validating runtime behavior;
- scanning repositories the operator does not own or administer;
- replacing code review, incident response, or a professional security audit.

## Reporting and response

Follow [SECURITY.md](SECURITY.md) for private reporting. A credible report should identify the
affected version, trust boundary, reproduction steps without real credentials, and expected
impact. Maintainers should rotate exposed credentials, disable affected workflows, preserve
minimal logs, and publish a remediation after affected users can update.
