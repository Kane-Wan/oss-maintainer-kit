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
});
