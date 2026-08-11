import type { TaskKind } from "./types.js";

export type PilotDatasetKind = "demonstration" | "pilot";
export type PilotOutcome = "accepted" | "edited" | "rejected" | "not-rated";

export interface PilotRunRecord {
  id: string;
  task: TaskKind;
  completed: boolean;
  outcome?: PilotOutcome;
  durationSeconds?: number;
  estimatedMinutesSaved?: number;
  blockingFalsePositive?: boolean;
  repository?: string;
  publicEvidenceUrl?: string;
}

export interface PilotDataset {
  datasetKind: PilotDatasetKind;
  projectVersion: string;
  dateRange?: { start: string; end: string };
  maintainers?: number;
  runs: PilotRunRecord[];
}

export interface PilotSummary {
  datasetKind: PilotDatasetKind;
  projectVersion: string;
  dateRange?: { start: string; end: string };
  maintainers: number;
  attempted: number;
  completed: number;
  workflowSuccessRate: number;
  outcomes: Record<PilotOutcome, number>;
  rated: number;
  usefulResultRate: number | null;
  blockingFalsePositives: number;
  medianEstimatedMinutesSaved: number | null;
  timeSavedSampleSize: number;
  repositories: string[];
  evidenceUrls: string[];
  byTask: Record<TaskKind, { attempted: number; completed: number }>;
}

const tasks: TaskKind[] = ["pr-review", "issue-triage", "release-notes"];
const outcomes: PilotOutcome[] = ["accepted", "edited", "rejected", "not-rated"];

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalNonNegativeNumber(value: unknown, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
  return value;
}

function optionalUrl(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  const url = requiredString(value, label);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} must be an absolute HTTP or HTTPS URL.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must be an absolute HTTP or HTTPS URL.`);
  }
  return url;
}

function parseDateRange(value: unknown): PilotDataset["dateRange"] {
  if (value === undefined) return undefined;
  const range = asRecord(value, "dateRange");
  const start = requiredString(range.start, "dateRange.start");
  const end = requiredString(range.end, "dateRange.end");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    throw new Error("dateRange values must use YYYY-MM-DD.");
  }
  if (start > end) throw new Error("dateRange.start must not be after dateRange.end.");
  return { start, end };
}

function parseRun(value: unknown, index: number): PilotRunRecord {
  const data = asRecord(value, `runs[${index}]`);
  const id = requiredString(data.id, `runs[${index}].id`);
  const task = requiredString(data.task, `runs[${index}].task`) as TaskKind;
  if (!tasks.includes(task)) throw new Error(`runs[${index}].task is not supported.`);
  if (typeof data.completed !== "boolean") {
    throw new Error(`runs[${index}].completed must be a boolean.`);
  }

  let outcome: PilotOutcome | undefined;
  if (data.outcome !== undefined) {
    outcome = requiredString(data.outcome, `runs[${index}].outcome`) as PilotOutcome;
    if (!outcomes.includes(outcome)) throw new Error(`runs[${index}].outcome is not supported.`);
  }
  if (!data.completed && outcome && outcome !== "not-rated") {
    throw new Error(`runs[${index}] cannot rate an incomplete run as ${outcome}.`);
  }

  const blockingFalsePositive = data.blockingFalsePositive;
  if (blockingFalsePositive !== undefined && typeof blockingFalsePositive !== "boolean") {
    throw new Error(`runs[${index}].blockingFalsePositive must be a boolean.`);
  }

  return {
    id,
    task,
    completed: data.completed,
    outcome,
    durationSeconds: optionalNonNegativeNumber(
      data.durationSeconds,
      `runs[${index}].durationSeconds`,
    ),
    estimatedMinutesSaved: optionalNonNegativeNumber(
      data.estimatedMinutesSaved,
      `runs[${index}].estimatedMinutesSaved`,
    ),
    blockingFalsePositive,
    repository:
      data.repository === undefined
        ? undefined
        : requiredString(data.repository, `runs[${index}].repository`),
    publicEvidenceUrl: optionalUrl(data.publicEvidenceUrl, `runs[${index}].publicEvidenceUrl`),
  };
}

export function parsePilotDataset(value: unknown): PilotDataset {
  const data = asRecord(value, "Pilot dataset");
  const datasetKind = requiredString(data.datasetKind, "datasetKind") as PilotDatasetKind;
  if (datasetKind !== "demonstration" && datasetKind !== "pilot") {
    throw new Error('datasetKind must be "demonstration" or "pilot".');
  }
  if (!Array.isArray(data.runs) || data.runs.length === 0) {
    throw new Error("runs must be a non-empty array.");
  }

  const maintainers = optionalNonNegativeNumber(data.maintainers, "maintainers");
  if (maintainers !== undefined && !Number.isInteger(maintainers)) {
    throw new Error("maintainers must be an integer.");
  }

  const runs = data.runs.map(parseRun);
  const ids = new Set<string>();
  for (const run of runs) {
    if (ids.has(run.id)) throw new Error(`Duplicate run id: ${run.id}.`);
    ids.add(run.id);
  }

  return {
    datasetKind,
    projectVersion: requiredString(data.projectVersion, "projectVersion"),
    dateRange: parseDateRange(data.dateRange),
    maintainers,
    runs,
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[midpoint]!
    : (sorted[midpoint - 1]! + sorted[midpoint]!) / 2;
}

export function summarizePilot(dataset: PilotDataset): PilotSummary {
  const resultOutcomes: Record<PilotOutcome, number> = {
    accepted: 0,
    edited: 0,
    rejected: 0,
    "not-rated": 0,
  };
  const byTask: PilotSummary["byTask"] = {
    "pr-review": { attempted: 0, completed: 0 },
    "issue-triage": { attempted: 0, completed: 0 },
    "release-notes": { attempted: 0, completed: 0 },
  };

  let completed = 0;
  let blockingFalsePositives = 0;
  const timeSaved: number[] = [];
  const repositories = new Set<string>();
  const evidenceUrls = new Set<string>();

  for (const run of dataset.runs) {
    byTask[run.task].attempted += 1;
    if (run.completed) {
      completed += 1;
      byTask[run.task].completed += 1;
    }
    if (run.outcome) resultOutcomes[run.outcome] += 1;
    if (run.blockingFalsePositive) blockingFalsePositives += 1;
    if (run.estimatedMinutesSaved !== undefined) timeSaved.push(run.estimatedMinutesSaved);
    if (run.repository) repositories.add(run.repository);
    if (run.publicEvidenceUrl) evidenceUrls.add(run.publicEvidenceUrl);
  }

  const rated = resultOutcomes.accepted + resultOutcomes.edited + resultOutcomes.rejected;
  return {
    datasetKind: dataset.datasetKind,
    projectVersion: dataset.projectVersion,
    dateRange: dataset.dateRange,
    maintainers: dataset.maintainers ?? 0,
    attempted: dataset.runs.length,
    completed,
    workflowSuccessRate: completed / dataset.runs.length,
    outcomes: resultOutcomes,
    rated,
    usefulResultRate:
      rated === 0 ? null : (resultOutcomes.accepted + resultOutcomes.edited) / rated,
    blockingFalsePositives,
    medianEstimatedMinutesSaved: median(timeSaved),
    timeSavedSampleSize: timeSaved.length,
    repositories: [...repositories].sort(),
    evidenceUrls: [...evidenceUrls].sort(),
    byTask,
  };
}

function percent(value: number | null): string {
  return value === null ? "not available" : `${(value * 100).toFixed(1)}%`;
}

export function formatPilotSummary(summary: PilotSummary): string {
  const title =
    summary.datasetKind === "demonstration"
      ? "Demonstration summary — not adoption evidence"
      : "Pilot summary";
  const lines = [
    `# ${title}`,
    "",
    "> Generated from aggregate-friendly run records. This command does not verify repository ownership or the truth of submitted ratings.",
    "",
    `- Project version: ${summary.projectVersion}`,
    `- Date range: ${summary.dateRange ? `${summary.dateRange.start} to ${summary.dateRange.end}` : "not provided"}`,
    `- Maintainers providing feedback: ${summary.maintainers}`,
    `- Public repositories represented: ${summary.repositories.length}`,
    `- Attempted runs: ${summary.attempted}`,
    `- Completed runs: ${summary.completed}`,
    `- Workflow success rate: ${percent(summary.workflowSuccessRate)}`,
    `- Useful-result rate: ${percent(summary.usefulResultRate)}`,
    `- Blocking false positives: ${summary.blockingFalsePositives}`,
    `- Median estimated minutes saved: ${summary.medianEstimatedMinutesSaved ?? "not available"} (n=${summary.timeSavedSampleSize})`,
    "",
    "## Ratings",
    "",
    "| Accepted | Edited | Rejected | Not rated |",
    "| ---: | ---: | ---: | ---: |",
    `| ${summary.outcomes.accepted} | ${summary.outcomes.edited} | ${summary.outcomes.rejected} | ${summary.outcomes["not-rated"]} |`,
    "",
    "## Runs by task",
    "",
    "| Task | Attempted | Completed |",
    "| --- | ---: | ---: |",
    ...tasks.map(
      (task) =>
        `| ${task} | ${summary.byTask[task].attempted} | ${summary.byTask[task].completed} |`,
    ),
    "",
    "## Public evidence",
    "",
  ];

  if (summary.evidenceUrls.length === 0) {
    lines.push("No public evidence URLs were provided.");
  } else {
    lines.push(...summary.evidenceUrls.map((url) => `- ${url}`));
  }

  return lines.join("\n");
}
