# Evaluation harness demonstration — not live model evidence

> Deterministic checks can detect missing sections and unsafe phrases, but they do not replace maintainer judgment or verify that recorded outputs came from a named model.

- Project version: 0.3.0
- Cases: 4
- Candidate output pass rate: 100.0% (3/3)
- Negative-control detection rate: 100.0% (1/1)
- Expected behavior matched: 100.0% (4/4)

## Case results

| Case                            | Task          | Control          | Result | Expectation |
| ------------------------------- | ------------- | ---------------- | ------ | ----------- |
| demo-pr-review                  | pr-review     | candidate        | pass   | met         |
| demo-issue-triage               | issue-triage  | candidate        | pass   | met         |
| demo-release-notes              | release-notes | candidate        | pass   | met         |
| negative-control-missing-review | pr-review     | negative-control | fail   | met         |

## Failed checks

- negative-control-missing-review: contains a Markdown heading
- negative-control-missing-review: contains required text: Risks
- negative-control-missing-review: contains required text: Validation
- negative-control-missing-review: omits forbidden text: merge automatically

## Public evidence

No public evidence URLs were provided.

This committed report is generated from [`examples/evaluation.example.json`](../examples/evaluation.example.json).
The source dataset is explicitly synthetic, so this report demonstrates evaluator behavior rather
than model quality or external adoption.
