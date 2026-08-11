import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyzer.js";
import type { GenerateTextRequest, TextGenerator } from "../src/types.js";

describe("analyze", () => {
  it("uses an injected generator without requiring an API key", async () => {
    let captured: GenerateTextRequest | undefined;
    const generator: TextGenerator = {
      async generate(request) {
        captured = request;
        return "# Pull request review\n\nNo blocking findings.";
      },
    };

    const result = await analyze(
      {
        task: "pr-review",
        repository: "example/project",
        title: "Add validation",
        content: "+ validate(input)",
        language: "en",
      },
      { generator, model: "test-model" },
    );

    expect(result).toEqual({
      task: "pr-review",
      model: "test-model",
      markdown: "# Pull request review\n\nNo blocking findings.",
    });
    expect(captured).toMatchObject({ model: "test-model" });
    expect(captured?.input).toContain("Add validation");
  });

  it("fails with an actionable message when no key or generator is available", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(analyze({ task: "issue-triage", title: "Bug", content: "Steps" })).rejects.toThrow(
      "OPENAI_API_KEY is not set",
    );

    if (previous) process.env.OPENAI_API_KEY = previous;
  });

  it("prefers the Repo Steward model environment variable over the legacy alias", async () => {
    const previousPreferred = process.env.REPO_STEWARD_MODEL;
    const previousLegacy = process.env.OSS_MAINTAINER_MODEL;
    process.env.REPO_STEWARD_MODEL = "preferred-model";
    process.env.OSS_MAINTAINER_MODEL = "legacy-model";

    try {
      const generator: TextGenerator = {
        async generate() {
          return "# Issue triage";
        },
      };
      const result = await analyze(
        { task: "issue-triage", title: "Bug", content: "Steps" },
        { generator },
      );

      expect(result.model).toBe("preferred-model");
    } finally {
      if (previousPreferred === undefined) delete process.env.REPO_STEWARD_MODEL;
      else process.env.REPO_STEWARD_MODEL = previousPreferred;
      if (previousLegacy === undefined) delete process.env.OSS_MAINTAINER_MODEL;
      else process.env.OSS_MAINTAINER_MODEL = previousLegacy;
    }
  });
});
