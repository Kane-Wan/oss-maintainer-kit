import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { formatPilotSummary, parsePilotDataset, summarizePilot } from "../src/pilot.js";
import { VERSION } from "../src/version.js";

describe("pilot evidence summaries", () => {
  it("computes workflow, usefulness, false-positive, and time-saved metrics", () => {
    const dataset = parsePilotDataset({
      datasetKind: "pilot",
      projectVersion: "0.2.0",
      dateRange: { start: "2026-08-01", end: "2026-08-10" },
      maintainers: 2,
      runs: [
        {
          id: "one",
          task: "pr-review",
          completed: true,
          outcome: "accepted",
          estimatedMinutesSaved: 8,
          repository: "example/one",
          publicEvidenceUrl: "https://github.com/example/one/actions/runs/1",
        },
        {
          id: "two",
          task: "issue-triage",
          completed: true,
          outcome: "edited",
          estimatedMinutesSaved: 4,
          repository: "example/two",
        },
        {
          id: "three",
          task: "release-notes",
          completed: false,
          outcome: "not-rated",
          blockingFalsePositive: true,
        },
      ],
    });

    const summary = summarizePilot(dataset);
    expect(summary.workflowSuccessRate).toBeCloseTo(2 / 3);
    expect(summary.usefulResultRate).toBe(1);
    expect(summary.medianEstimatedMinutesSaved).toBe(6);
    expect(summary.blockingFalsePositives).toBe(1);
    expect(summary.repositories).toEqual(["example/one", "example/two"]);
    expect(formatPilotSummary(summary)).toContain("Pilot summary");
  });

  it("marks demonstration data as non-evidence", () => {
    const summary = summarizePilot(
      parsePilotDataset({
        datasetKind: "demonstration",
        projectVersion: "0.2.0",
        runs: [{ id: "demo", task: "pr-review", completed: true, outcome: "not-rated" }],
      }),
    );

    expect(formatPilotSummary(summary)).toContain("not adoption evidence");
    expect(summary.usefulResultRate).toBeNull();
  });

  it("rejects duplicate IDs and invalid ratings on incomplete runs", () => {
    expect(() =>
      parsePilotDataset({
        datasetKind: "pilot",
        projectVersion: "0.2.0",
        runs: [
          { id: "same", task: "pr-review", completed: true },
          { id: "same", task: "issue-triage", completed: true },
        ],
      }),
    ).toThrow("Duplicate run id");

    expect(() =>
      parsePilotDataset({
        datasetKind: "pilot",
        projectVersion: "0.2.0",
        runs: [{ id: "bad", task: "pr-review", completed: false, outcome: "accepted" }],
      }),
    ).toThrow("cannot rate an incomplete run");
  });

  it("keeps the CLI version synchronized with package metadata", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { name: string; version: string };

    expect(VERSION).toBe(packageJson.version);
    expect(packageJson.name).toBe("repo-steward-ai");
  });
});
