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

  it("pins third-party actions in repository workflows to immutable commits", () => {
    const workflows = [
      "ci.yml",
      "codeql.yml",
      "dependency-review.yml",
      "npm-publish.yml",
      "release.yml",
      "scorecard.yml",
    ]
      .map((name) => readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), "utf8"))
      .join("\n");

    expect(workflows).not.toMatch(/uses:\s+[^\s@]+@v\d/);
    expect(workflows).toContain("publish_results: true");
    expect(workflows).toContain("fail-on-severity: high");
  });

  it("keeps every CodeQL action step on one compatible release", () => {
    const codeql = readFileSync(
      new URL("../.github/workflows/codeql.yml", import.meta.url),
      "utf8",
    );
    const scorecard = readFileSync(
      new URL("../.github/workflows/scorecard.yml", import.meta.url),
      "utf8",
    );
    const references = `${codeql}\n${scorecard}`.match(
      /github\/codeql-action\/[\w-]+@([0-9a-f]{40})/g,
    );
    expect(references).toHaveLength(3);
    expect(new Set(references?.map((reference) => reference.split("@")[1])).size).toBe(1);
  });

  it("groups CodeQL action updates in Dependabot", () => {
    const dependabot = readFileSync(new URL("../.github/dependabot.yml", import.meta.url), "utf8");

    expect(dependabot).toContain("codeql-action:");
    expect(dependabot).toContain("github/codeql-action");
  });
});
