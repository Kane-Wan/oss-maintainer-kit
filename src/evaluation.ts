import type { TaskKind } from "./types.js";

export type EvaluationDatasetKind = "demonstration" | "evaluation";
export type EvaluationControl = "candidate" | "negative-control";

export interface EvaluationChecks {
  requiredText?: string[];
  forbiddenText?: string[];
  minimumCharacters?: number;
  maximumCharacters?: number;
  requireMarkdownHeading?: boolean;
}

export interface EvaluationCase {
  id: string;
  task: TaskKind;
  control: EvaluationControl;
  output: string;
  checks: EvaluationChecks;
  model?: string;
  publicEvidenceUrl?: string;
}

export interface EvaluationDataset {
  datasetKind: EvaluationDatasetKind;
  projectVersion: string;
  description?: string;
  cases: EvaluationCase[];
}

export interface EvaluationCheckResult {
  label: string;
  passed: boolean;
}

export interface EvaluationCaseResult {
  id: string;
  task: TaskKind;
  control: EvaluationControl;
  actualPass: boolean;
  expectationMet: boolean;
  checks: EvaluationCheckResult[];
  model?: string;
  publicEvidenceUrl?: string;
}

export interface EvaluationSummary {
  datasetKind: EvaluationDatasetKind;
  projectVersion: string;
  description?: string;
  totalCases: number;
  candidateCases: number;
  candidatePassed: number;
  candidatePassRate: number | null;
  negativeControls: number;
  negativeControlsCaught: number;
  negativeControlDetectionRate: number | null;
  expectationsMet: number;
  expectationAccuracy: number;
  publicEvidenceUrls: string[];
  results: EvaluationCaseResult[];
}

const tasks: TaskKind[] = ["pr-review", "issue-triage", "release-notes"];
const controls: EvaluationControl[] = ["candidate", "negative-control"];

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

function optionalString(value: unknown, label: string): string | undefined {
  return value === undefined ? undefined : requiredString(value, label);
}

function optionalUrl(value: unknown, label: string): string | undefined {
  const url = optionalString(value, label);
  if (!url) return undefined;
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

function optionalPositiveInteger(value: unknown, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return value;
}

function optionalStringArray(value: unknown, label: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array of strings.`);
  }
  return value.map((item, index) => requiredString(item, `${label}[${index}]`));
}

function parseChecks(value: unknown, index: number): EvaluationChecks {
  const data = asRecord(value, `cases[${index}].checks`);
  const checks: EvaluationChecks = {
    requiredText: optionalStringArray(data.requiredText, `cases[${index}].checks.requiredText`),
    forbiddenText: optionalStringArray(data.forbiddenText, `cases[${index}].checks.forbiddenText`),
    minimumCharacters: optionalPositiveInteger(
      data.minimumCharacters,
      `cases[${index}].checks.minimumCharacters`,
    ),
    maximumCharacters: optionalPositiveInteger(
      data.maximumCharacters,
      `cases[${index}].checks.maximumCharacters`,
    ),
  };

  if (data.requireMarkdownHeading !== undefined) {
    if (typeof data.requireMarkdownHeading !== "boolean") {
      throw new Error(`cases[${index}].checks.requireMarkdownHeading must be a boolean.`);
    }
    checks.requireMarkdownHeading = data.requireMarkdownHeading;
  }

  if (
    checks.minimumCharacters !== undefined &&
    checks.maximumCharacters !== undefined &&
    checks.minimumCharacters > checks.maximumCharacters
  ) {
    throw new Error(`cases[${index}].checks minimum cannot exceed maximum.`);
  }
  if (
    checks.requiredText === undefined &&
    checks.forbiddenText === undefined &&
    checks.minimumCharacters === undefined &&
    checks.maximumCharacters === undefined &&
    checks.requireMarkdownHeading === undefined
  ) {
    throw new Error(`cases[${index}].checks must define at least one check.`);
  }
  return checks;
}

function parseCase(value: unknown, index: number): EvaluationCase {
  const data = asRecord(value, `cases[${index}]`);
  const task = requiredString(data.task, `cases[${index}].task`) as TaskKind;
  if (!tasks.includes(task)) throw new Error(`cases[${index}].task is not supported.`);
  const control = requiredString(data.control, `cases[${index}].control`) as EvaluationControl;
  if (!controls.includes(control)) throw new Error(`cases[${index}].control is not supported.`);

  return {
    id: requiredString(data.id, `cases[${index}].id`),
    task,
    control,
    output: requiredString(data.output, `cases[${index}].output`),
    checks: parseChecks(data.checks, index),
    model: optionalString(data.model, `cases[${index}].model`),
    publicEvidenceUrl: optionalUrl(data.publicEvidenceUrl, `cases[${index}].publicEvidenceUrl`),
  };
}

export function parseEvaluationDataset(value: unknown): EvaluationDataset {
  const data = asRecord(value, "Evaluation dataset");
  const datasetKind = requiredString(data.datasetKind, "datasetKind") as EvaluationDatasetKind;
  if (datasetKind !== "demonstration" && datasetKind !== "evaluation") {
    throw new Error('datasetKind must be "demonstration" or "evaluation".');
  }
  if (!Array.isArray(data.cases) || data.cases.length === 0) {
    throw new Error("cases must be a non-empty array.");
  }

  const cases = data.cases.map(parseCase);
  const ids = new Set<string>();
  for (const item of cases) {
    if (ids.has(item.id)) throw new Error(`Duplicate evaluation case id: ${item.id}.`);
    ids.add(item.id);
  }

  return {
    datasetKind,
    projectVersion: requiredString(data.projectVersion, "projectVersion"),
    description: optionalString(data.description, "description"),
    cases,
  };
}

function evaluateCase(item: EvaluationCase): EvaluationCaseResult {
  const output = item.output;
  const normalized = output.toLocaleLowerCase("en-US");
  const checks: EvaluationCheckResult[] = [];

  if (item.checks.requireMarkdownHeading !== undefined) {
    checks.push({
      label: "contains a Markdown heading",
      passed: !item.checks.requireMarkdownHeading || /^#{1,6}\s+\S+/m.test(output),
    });
  }
  for (const text of item.checks.requiredText ?? []) {
    checks.push({
      label: `contains required text: ${text}`,
      passed: normalized.includes(text.toLocaleLowerCase("en-US")),
    });
  }
  for (const text of item.checks.forbiddenText ?? []) {
    checks.push({
      label: `omits forbidden text: ${text}`,
      passed: !normalized.includes(text.toLocaleLowerCase("en-US")),
    });
  }
  if (item.checks.minimumCharacters !== undefined) {
    checks.push({
      label: `has at least ${item.checks.minimumCharacters} characters`,
      passed: output.length >= item.checks.minimumCharacters,
    });
  }
  if (item.checks.maximumCharacters !== undefined) {
    checks.push({
      label: `has at most ${item.checks.maximumCharacters} characters`,
      passed: output.length <= item.checks.maximumCharacters,
    });
  }

  const actualPass = checks.every((check) => check.passed);
  return {
    id: item.id,
    task: item.task,
    control: item.control,
    actualPass,
    expectationMet: item.control === "candidate" ? actualPass : !actualPass,
    checks,
    model: item.model,
    publicEvidenceUrl: item.publicEvidenceUrl,
  };
}

export function summarizeEvaluation(dataset: EvaluationDataset): EvaluationSummary {
  const results = dataset.cases.map(evaluateCase);
  const candidateResults = results.filter((result) => result.control === "candidate");
  const negativeResults = results.filter((result) => result.control === "negative-control");
  const candidatePassed = candidateResults.filter((result) => result.actualPass).length;
  const negativeControlsCaught = negativeResults.filter((result) => !result.actualPass).length;
  const expectationsMet = results.filter((result) => result.expectationMet).length;

  return {
    datasetKind: dataset.datasetKind,
    projectVersion: dataset.projectVersion,
    description: dataset.description,
    totalCases: results.length,
    candidateCases: candidateResults.length,
    candidatePassed,
    candidatePassRate:
      candidateResults.length === 0 ? null : candidatePassed / candidateResults.length,
    negativeControls: negativeResults.length,
    negativeControlsCaught,
    negativeControlDetectionRate:
      negativeResults.length === 0 ? null : negativeControlsCaught / negativeResults.length,
    expectationsMet,
    expectationAccuracy: expectationsMet / results.length,
    publicEvidenceUrls: [
      ...new Set(results.flatMap((result) => result.publicEvidenceUrl ?? [])),
    ].sort(),
    results,
  };
}

function percent(value: number | null): string {
  return value === null ? "not available" : `${(value * 100).toFixed(1)}%`;
}

export function formatEvaluationSummary(summary: EvaluationSummary): string {
  const title =
    summary.datasetKind === "demonstration"
      ? "Evaluation harness demonstration — not live model evidence"
      : "Evaluation report";
  const lines = [
    `# ${title}`,
    "",
    "> Deterministic checks can detect missing sections and unsafe phrases, but they do not replace maintainer judgment or verify that recorded outputs came from a named model.",
    "",
    `- Project version: ${summary.projectVersion}`,
    `- Cases: ${summary.totalCases}`,
    `- Candidate output pass rate: ${percent(summary.candidatePassRate)} (${summary.candidatePassed}/${summary.candidateCases})`,
    `- Negative-control detection rate: ${percent(summary.negativeControlDetectionRate)} (${summary.negativeControlsCaught}/${summary.negativeControls})`,
    `- Expected behavior matched: ${percent(summary.expectationAccuracy)} (${summary.expectationsMet}/${summary.totalCases})`,
    "",
    "## Case results",
    "",
    "| Case | Task | Control | Result | Expectation |",
    "| --- | --- | --- | --- | --- |",
    ...summary.results.map(
      (result) =>
        `| ${result.id} | ${result.task} | ${result.control} | ${result.actualPass ? "pass" : "fail"} | ${result.expectationMet ? "met" : "missed"} |`,
    ),
    "",
    "## Failed checks",
    "",
  ];

  const failures = summary.results.flatMap((result) =>
    result.checks.filter((check) => !check.passed).map((check) => `- ${result.id}: ${check.label}`),
  );
  lines.push(...(failures.length === 0 ? ["No checks failed."] : failures));
  lines.push("", "## Public evidence", "");
  lines.push(
    ...(summary.publicEvidenceUrls.length === 0
      ? ["No public evidence URLs were provided."]
      : summary.publicEvidenceUrls.map((url) => `- ${url}`)),
  );
  return lines.join("\n");
}
