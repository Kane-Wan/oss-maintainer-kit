# Quality evaluation workflow

Repo Steward AI includes an offline evaluator for recorded Markdown outputs. It does not call an
API, grade subjective correctness, or prove that an output came from a named model. It provides a
repeatable baseline for structural requirements and simple safety invariants.

The workflow follows the [OpenAI guidance](https://developers.openai.com/api/docs/guides/latest-model#compare-quality-and-cost)
to evaluate representative tasks and preserve evidence needed to judge final-answer completeness.
A useful evaluation should also record latency, token usage, cost, and human judgment when those
values are available.

## Run the demonstration

```bash
pnpm build
node dist/cli.js eval-summary --input examples/evaluation.example.json
```

The included dataset contains three curated candidate outputs and one deliberately defective
negative control. It is marked `demonstration` and must not be presented as live model performance
or external adoption evidence. Its purpose is to show that the harness accepts complete examples
and rejects a missing-review control.

## Record a real evaluation

1. Copy `examples/evaluation.example.json`.
2. Change `datasetKind` to `evaluation`.
3. Replace the curated text with complete, unedited recorded outputs.
4. Record the model only when it is known from the request configuration.
5. Add a public evidence URL only when publishing the source output is authorized.
6. Keep failed outputs and negative controls.
7. Run `eval-summary` and review every failed check manually.

The machine-readable format is described by
[`evaluation-dataset.schema.json`](evaluation-dataset.schema.json).

## Boundaries

- Substring and length checks cannot determine whether technical advice is correct.
- Passing outputs still require maintainer review before comments, labels, merges, or releases.
- Demonstration data is not a benchmark, adoption record, testimonial, or usage statistic.
- A real report should disclose the dataset, version, model, selection method, failures, and public
  evidence boundaries.
