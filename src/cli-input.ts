import { createAnalysisRequest } from "./github/format.js";
import type { AnalysisRequest, OutputLanguage, TaskKind } from "./types.js";

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input must be a JSON object.");
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

export function payloadToRequest(
  task: TaskKind,
  payload: unknown,
  language: OutputLanguage,
): AnalysisRequest {
  const data = asRecord(payload);
  const title = optionalString(data.title) ?? optionalString(data.version) ?? task;
  const contentCandidates = [data.content, data.diff, data.changes, data.body];
  const content = contentCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  if (!content) {
    throw new Error('Input must contain non-empty "content", "diff", "changes", or "body" text.');
  }

  return createAnalysisRequest({
    task,
    repository: optionalString(data.repository) ?? "local",
    title,
    body: optionalString(data.body),
    content,
    labels: stringArray(data.labels),
    version: optionalString(data.version),
    language,
  });
}
