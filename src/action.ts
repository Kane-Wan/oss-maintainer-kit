import * as core from "@actions/core";
import * as github from "@actions/github";

import { analyze } from "./analyzer.js";
import {
  createAnalysisRequest,
  formatPullRequestFiles,
  resolveTask,
  type PullRequestFile,
} from "./github/format.js";
import { assertEventAllowed } from "./security.js";
import type { AnalysisRequest, OutputLanguage } from "./types.js";

function getLanguage(): OutputLanguage {
  const value = core.getInput("language") || "auto";
  if (value === "auto" || value === "en" || value === "zh-CN") return value;
  throw new Error("The language input must be auto, en, or zh-CN.");
}

function labelsFromIssue(issue: unknown): string[] {
  const labels = (issue as { labels?: unknown }).labels;
  if (!Array.isArray(labels)) return [];

  return labels
    .map((label) => {
      if (typeof label === "string") return label;
      if (label && typeof label === "object" && "name" in label) {
        const name = (label as { name?: unknown }).name;
        return typeof name === "string" ? name : undefined;
      }
      return undefined;
    })
    .filter((label): label is string => Boolean(label));
}

async function requestFromContext(
  task: ReturnType<typeof resolveTask>,
  language: OutputLanguage,
  token: string,
): Promise<{ request: AnalysisRequest; commentNumber?: number }> {
  const { owner, repo } = github.context.repo;
  const repository = `${owner}/${repo}`;

  if (task === "pr-review") {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) throw new Error("The event payload does not contain a pull request.");
    if (!token) throw new Error("github-token is required to read pull request files.");

    const octokit = github.getOctokit(token);
    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: pullRequest.number,
      per_page: 100,
    });
    const formattedFiles: PullRequestFile[] = files.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
    }));

    return {
      request: createAnalysisRequest({
        task,
        repository,
        title: pullRequest.title,
        body: pullRequest.body ?? "",
        content: formatPullRequestFiles(formattedFiles),
        language,
      }),
      commentNumber: pullRequest.number,
    };
  }

  if (task === "issue-triage") {
    const issue = github.context.payload.issue;
    if (!issue) throw new Error("The event payload does not contain an issue.");

    return {
      request: createAnalysisRequest({
        task,
        repository,
        title: issue.title,
        body: issue.body ?? "",
        content: issue.body ?? "No issue description was supplied.",
        labels: labelsFromIssue(issue),
        language,
      }),
      commentNumber: issue.number,
    };
  }

  const content = core.getInput("content", { required: true });
  const version = core.getInput("version") || "Unreleased";
  return {
    request: createAnalysisRequest({
      task,
      repository,
      title: core.getInput("title") || `Release ${version}`,
      version,
      content,
      language,
    }),
  };
}

async function run(): Promise<void> {
  assertEventAllowed(github.context.eventName, {
    allowPullRequestTarget: core.getBooleanInput("allow-pull-request-target"),
  });

  const apiKey = core.getInput("openai-api-key") || process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("openai-api-key is required.");
  core.setSecret(apiKey);

  const token = core.getInput("github-token") || process.env.GITHUB_TOKEN || "";
  if (token) core.setSecret(token);

  const mode = core.getInput("mode") || "auto";
  const task = resolveTask(github.context.eventName, mode);
  const language = getLanguage();
  const { request, commentNumber } = await requestFromContext(task, language, token);
  const result = await analyze(request, {
    apiKey,
    model: core.getInput("model") || undefined,
  });

  core.setOutput("task", result.task);
  core.setOutput("result", result.markdown);
  await core.summary.addHeading("Repo Steward AI").addRaw(result.markdown).write();

  if (core.getBooleanInput("post-comment")) {
    if (!commentNumber) throw new Error("This task has no issue or pull request to comment on.");
    if (!token) throw new Error("github-token is required when post-comment is true.");
    const { owner, repo } = github.context.repo;
    const octokit = github.getOctokit(token);
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: commentNumber,
      body: result.markdown,
    });
  }
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
