import { describe, expect, it } from "vitest";

import {
  createAnalysisRequest,
  formatPullRequestFiles,
  MAX_PATCH_CHARS_PER_FILE,
  resolveTask,
} from "../src/github/format.js";

describe("formatPullRequestFiles", () => {
  it("formats file metadata and patch text", () => {
    const result = formatPullRequestFiles([
      {
        filename: "src/index.ts",
        status: "modified",
        additions: 3,
        deletions: 1,
        patch: "@@ -1 +1 @@\n-old\n+new",
      },
    ]);

    expect(result).toContain("File: src/index.ts");
    expect(result).toContain("Changes: +3 -1");
    expect(result).toContain("+new");
  });

  it("truncates a very large per-file patch", () => {
    const result = formatPullRequestFiles([
      {
        filename: "large.txt",
        status: "modified",
        additions: 1,
        deletions: 1,
        patch: "x".repeat(MAX_PATCH_CHARS_PER_FILE + 10),
      },
    ]);

    expect(result).toContain("[File patch truncated]");
  });
});

describe("resolveTask", () => {
  it.each([
    ["pull_request", "pr-review"],
    ["pull_request_target", "pr-review"],
    ["issues", "issue-triage"],
    ["workflow_dispatch", "release-notes"],
  ] as const)("maps %s to %s", (eventName, expected) => {
    expect(resolveTask(eventName, "auto")).toBe(expected);
  });

  it("honors an explicit supported mode", () => {
    expect(resolveTask("schedule", "release-notes")).toBe("release-notes");
  });

  it("rejects unsupported events and modes", () => {
    expect(() => resolveTask("schedule", "auto")).toThrow("Cannot infer");
    expect(() => resolveTask("issues", "unknown")).toThrow("Unsupported mode");
  });
});

describe("createAnalysisRequest", () => {
  it("rejects empty required fields", () => {
    expect(() =>
      createAnalysisRequest({
        task: "issue-triage",
        repository: "example/repo",
        title: " ",
        content: "body",
      }),
    ).toThrow("title");
  });
});
