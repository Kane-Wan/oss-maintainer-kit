import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { assertEventAllowed } from "../src/security.js";

describe("event safety", () => {
  it("blocks pull_request_target unless a maintainer explicitly opts in", () => {
    expect(() => assertEventAllowed("pull_request_target")).toThrow("disabled by default");
    expect(() =>
      assertEventAllowed("pull_request_target", { allowPullRequestTarget: true }),
    ).not.toThrow();
  });

  it.each(["pull_request", "issues", "workflow_dispatch"])("allows %s", (eventName) => {
    expect(() => assertEventAllowed(eventName)).not.toThrow();
  });
});

describe("repository security invariants", () => {
  it("keeps comment posting and pull_request_target opt-in by default", () => {
    const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");

    expect(action).toMatch(/post-comment:[\s\S]*?default: "false"/);
    expect(action).toMatch(/allow-pull-request-target:[\s\S]*?default: "false"/);
  });

  it("ships a read-only pilot workflow", () => {
    const workflow = readFileSync(new URL("../examples/maintainer.yml", import.meta.url), "utf8");

    expect(workflow).toContain("pull-requests: read");
    expect(workflow).toContain("issues: read");
    expect(workflow).not.toMatch(/:\s*write\b/);
    expect(workflow).toContain('post-comment: "false"');
  });

  it("does not trigger project workflows with pull_request_target", () => {
    const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
    const codeql = readFileSync(
      new URL("../.github/workflows/codeql.yml", import.meta.url),
      "utf8",
    );

    expect(`${ci}\n${codeql}`).not.toContain("pull_request_target");
  });
});
