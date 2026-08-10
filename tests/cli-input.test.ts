import { describe, expect, it } from "vitest";

import { payloadToRequest } from "../src/cli-input.js";

describe("payloadToRequest", () => {
  it("accepts diff as PR content", () => {
    expect(
      payloadToRequest(
        "pr-review",
        {
          repository: "example/repo",
          title: "Change behavior",
          body: "Why",
          diff: "+new behavior",
        },
        "en",
      ),
    ).toMatchObject({
      task: "pr-review",
      repository: "example/repo",
      content: "+new behavior",
      language: "en",
    });
  });

  it("accepts changes as release content", () => {
    const request = payloadToRequest(
      "release-notes",
      { version: "1.2.0", changes: "Added caching" },
      "auto",
    );
    expect(request.title).toBe("1.2.0");
    expect(request.content).toBe("Added caching");
  });

  it("rejects non-object or empty input", () => {
    expect(() => payloadToRequest("issue-triage", [], "auto")).toThrow("JSON object");
    expect(() => payloadToRequest("issue-triage", { title: "Bug" }, "auto")).toThrow("content");
  });
});
