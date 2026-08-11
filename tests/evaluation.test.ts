import { describe, expect, it } from "vitest";

import {
  formatEvaluationSummary,
  parseEvaluationDataset,
  summarizeEvaluation,
} from "../src/evaluation.js";

const validCase = {
  id: "valid",
  task: "pr-review",
  control: "candidate",
  output: "# Review\n\nNo blocking findings.",
  checks: { requireMarkdownHeading: true },
};

describe("offline output evaluation", () => {
  it("scores candidate outputs and detects a negative control", () => {
    const dataset = parseEvaluationDataset({
      datasetKind: "demonstration",
      projectVersion: "0.3.0",
      cases: [
        {
          id: "candidate",
          task: "pr-review",
          control: "candidate",
          output: "# Review\n\n## Risks\n\nNo blocking findings.",
          checks: {
            requireMarkdownHeading: true,
            requiredText: ["Risks", "No blocking findings"],
            forbiddenText: ["merge automatically"],
          },
        },
        {
          id: "negative",
          task: "issue-triage",
          control: "negative-control",
          output: "Looks fine.",
          checks: { requireMarkdownHeading: true, requiredText: ["Missing information"] },
        },
      ],
    });

    const summary = summarizeEvaluation(dataset);
    expect(summary.candidatePassRate).toBe(1);
    expect(summary.negativeControlDetectionRate).toBe(1);
    expect(summary.expectationAccuracy).toBe(1);
    expect(formatEvaluationSummary(summary)).toContain("not live model evidence");
    expect(formatEvaluationSummary(summary)).toContain("negative: contains a Markdown heading");
  });

  it("rejects empty checks, duplicate IDs, and invalid bounds", () => {
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [
          {
            id: "empty",
            task: "pr-review",
            control: "candidate",
            output: "# Review",
            checks: {},
          },
        ],
      }),
    ).toThrow("at least one check");

    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [
          {
            id: "same",
            task: "pr-review",
            control: "candidate",
            output: "# Review",
            checks: { minimumCharacters: 20, maximumCharacters: 10 },
          },
        ],
      }),
    ).toThrow("minimum cannot exceed maximum");

    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [
          {
            id: "same",
            task: "pr-review",
            control: "candidate",
            output: "# Review",
            checks: { requireMarkdownHeading: true },
          },
          {
            id: "same",
            task: "issue-triage",
            control: "candidate",
            output: "# Triage",
            checks: { requireMarkdownHeading: true },
          },
        ],
      }),
    ).toThrow("Duplicate evaluation case id");
  });

  it("validates public evidence URLs", () => {
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [
          {
            id: "bad-url",
            task: "release-notes",
            control: "candidate",
            output: "# Release notes",
            checks: { requireMarkdownHeading: true },
            publicEvidenceUrl: "file:///private/output.md",
          },
        ],
      }),
    ).toThrow("absolute HTTP or HTTPS URL");

    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [{ ...validCase, publicEvidenceUrl: "not a URL" }],
      }),
    ).toThrow("absolute HTTP or HTTPS URL");
  });

  it("rejects malformed datasets and unsupported values", () => {
    expect(() => parseEvaluationDataset(null)).toThrow("must be a JSON object");
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "benchmark",
        projectVersion: "0.3.0",
        cases: [validCase],
      }),
    ).toThrow("datasetKind");
    expect(() =>
      parseEvaluationDataset({ datasetKind: "evaluation", projectVersion: "0.3.0", cases: [] }),
    ).toThrow("non-empty array");
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [{ ...validCase, task: "unsupported" }],
      }),
    ).toThrow("task is not supported");
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [{ ...validCase, control: "baseline" }],
      }),
    ).toThrow("control is not supported");
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [{ ...validCase, checks: { requireMarkdownHeading: "yes" } }],
      }),
    ).toThrow("must be a boolean");
  });

  it("validates arrays, positive integers, and required strings", () => {
    for (const checks of [
      { requiredText: [] },
      { requiredText: [""] },
      { minimumCharacters: 0 },
      { maximumCharacters: 1.5 },
    ]) {
      expect(() =>
        parseEvaluationDataset({
          datasetKind: "evaluation",
          projectVersion: "0.3.0",
          cases: [{ ...validCase, checks }],
        }),
      ).toThrow();
    }
    expect(() =>
      parseEvaluationDataset({
        datasetKind: "evaluation",
        projectVersion: "0.3.0",
        cases: [{ ...validCase, output: "" }],
      }),
    ).toThrow("non-empty string");
  });

  it("reports optional evidence and unavailable cohort rates", () => {
    const negativeOnly = parseEvaluationDataset({
      datasetKind: "evaluation",
      projectVersion: "0.3.0",
      description: "External evidence set",
      cases: [
        {
          ...validCase,
          id: "negative-only",
          control: "negative-control",
          model: "recorded-model",
          publicEvidenceUrl: "https://example.com/evidence",
          checks: {
            requireMarkdownHeading: false,
            minimumCharacters: 1,
            maximumCharacters: 100,
          },
        },
      ],
    });
    const negativeSummary = summarizeEvaluation(negativeOnly);
    expect(negativeSummary.candidatePassRate).toBeNull();
    expect(negativeSummary.negativeControlDetectionRate).toBe(0);
    expect(negativeSummary.publicEvidenceUrls).toEqual(["https://example.com/evidence"]);
    expect(formatEvaluationSummary(negativeSummary)).toContain("https://example.com/evidence");

    const candidateOnly = parseEvaluationDataset({
      datasetKind: "evaluation",
      projectVersion: "0.3.0",
      cases: [
        {
          ...validCase,
          checks: { minimumCharacters: 1, maximumCharacters: 100 },
        },
      ],
    });
    const candidateSummary = summarizeEvaluation(candidateOnly);
    expect(candidateSummary.negativeControlDetectionRate).toBeNull();
    expect(formatEvaluationSummary(candidateSummary)).toContain("No checks failed.");
    expect(formatEvaluationSummary(candidateSummary)).toContain("No public evidence URLs");
  });
});
