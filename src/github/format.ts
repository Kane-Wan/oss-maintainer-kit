import type { AnalysisRequest, OutputLanguage, TaskKind } from "../types.js";

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string | null;
}

export const MAX_PATCH_CHARS_PER_FILE = 8_000;
export const MAX_COMBINED_DIFF_CHARS = 50_000;

export function formatPullRequestFiles(files: PullRequestFile[]): string {
  const chunks: string[] = [];
  let used = 0;

  for (const file of files) {
    const patch = file.patch?.slice(0, MAX_PATCH_CHARS_PER_FILE) ?? "[Patch unavailable]";
    const patchNote =
      file.patch && file.patch.length > MAX_PATCH_CHARS_PER_FILE ? "\n[File patch truncated]" : "";
    const chunk = `File: ${file.filename}\nStatus: ${file.status}\nChanges: +${file.additions} -${file.deletions}\n${patch}${patchNote}`;

    if (used + chunk.length > MAX_COMBINED_DIFF_CHARS) {
      chunks.push("[Remaining files omitted because the combined diff limit was reached]");
      break;
    }

    chunks.push(chunk);
    used += chunk.length;
  }

  return chunks.join("\n\n---\n\n");
}

export function resolveTask(eventName: string, configuredMode: string): TaskKind {
  const allowed: TaskKind[] = ["pr-review", "issue-triage", "release-notes"];
  if (configuredMode !== "auto") {
    if (allowed.includes(configuredMode as TaskKind)) return configuredMode as TaskKind;
    throw new Error(`Unsupported mode: ${configuredMode}`);
  }

  if (eventName === "pull_request" || eventName === "pull_request_target") return "pr-review";
  if (eventName === "issues") return "issue-triage";
  if (eventName === "workflow_dispatch") return "release-notes";
  throw new Error(
    `Cannot infer a task from the ${eventName} event. Set the mode input explicitly.`,
  );
}

interface RequestInput {
  task: TaskKind;
  repository: string;
  title: string;
  body?: string;
  content: string;
  labels?: string[];
  version?: string;
  language?: OutputLanguage;
}

export function createAnalysisRequest(input: RequestInput): AnalysisRequest {
  if (!input.title.trim()) throw new Error("A non-empty title is required.");
  if (!input.content.trim()) throw new Error("Non-empty content is required.");

  return {
    task: input.task,
    repository: input.repository,
    title: input.title,
    body: input.body,
    content: input.content,
    labels: input.labels,
    version: input.version,
    language: input.language,
  };
}
