#!/usr/bin/env node
import {
  VERSION,
  analyze,
  createAnalysisRequest,
  formatEvaluationSummary,
  formatPilotSummary,
  parseEvaluationDataset,
  parsePilotDataset,
  summarizeEvaluation,
  summarizePilot
} from "./chunk-3Q3MB5VV.js";

// src/cli.ts
import { readFile, writeFile } from "fs/promises";
import { stdin as input, stdout as output } from "process";
import { parseArgs } from "util";

// src/cli-input.ts
function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input must be a JSON object.");
  }
  return value;
}
function optionalString(value) {
  return typeof value === "string" ? value : void 0;
}
function stringArray(value) {
  if (!Array.isArray(value)) return void 0;
  return value.filter((item) => typeof item === "string");
}
function payloadToRequest(task, payload, language) {
  const data = asRecord(payload);
  const title = optionalString(data.title) ?? optionalString(data.version) ?? task;
  const contentCandidates = [data.content, data.diff, data.changes, data.body];
  const content = contentCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
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
    language
  });
}

// src/cli.ts
var HELP = `repo-steward <command> [options]

Analysis commands:
  pr-review       Review pull request metadata and a diff
  issue-triage    Triage an issue and draft a maintainer reply
  release-notes   Turn a change list into release notes

Evidence command:
  pilot-summary   Aggregate privacy-conscious pilot run records without an API call
  eval-summary    Run deterministic checks on recorded outputs without an API call

Options:
  -i, --input <path>       JSON input path, or - for stdin (default: -)
  -o, --output <path>      Write Markdown to a file instead of stdout
      --model <name>       OpenAI model (default: REPO_STEWARD_MODEL or gpt-5.6-luna)
      --language <value>   auto, en, or zh-CN (default: auto)
  -h, --help               Show this help
  -v, --version            Show the package version

Environment:
  OPENAI_API_KEY           Required for live analysis
  REPO_STEWARD_MODEL       Optional model override
  OSS_MAINTAINER_MODEL     Legacy model override
`;
async function readStdin() {
  const chunks = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
function parseTask(value) {
  if (value === "pr-review" || value === "issue-triage" || value === "release-notes") {
    return value;
  }
  throw new Error("Choose one task: pr-review, issue-triage, or release-notes.");
}
function parseLanguage(value) {
  if (!value) return "auto";
  if (value === "auto" || value === "en" || value === "zh-CN") return value;
  throw new Error("Language must be auto, en, or zh-CN.");
}
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      input: { type: "string", short: "i", default: "-" },
      output: { type: "string", short: "o" },
      model: { type: "string" },
      language: { type: "string", default: "auto" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false }
    }
  });
  if (values.help) {
    output.write(HELP);
    return;
  }
  if (values.version) {
    output.write(`${VERSION}
`);
    return;
  }
  const raw = values.input === "-" ? await readStdin() : await readFile(values.input, "utf8");
  const command = positionals[0];
  let markdown;
  if (command === "pilot-summary") {
    const dataset = parsePilotDataset(JSON.parse(raw));
    markdown = formatPilotSummary(summarizePilot(dataset));
  } else if (command === "eval-summary") {
    const dataset = parseEvaluationDataset(JSON.parse(raw));
    markdown = formatEvaluationSummary(summarizeEvaluation(dataset));
  } else {
    const task = parseTask(command);
    const language = parseLanguage(values.language);
    const request = payloadToRequest(task, JSON.parse(raw), language);
    const result = await analyze(request, { model: values.model });
    markdown = result.markdown;
  }
  if (values.output) {
    await writeFile(values.output, `${markdown}
`, "utf8");
    output.write(`Wrote ${values.output}
`);
    return;
  }
  output.write(`${markdown}
`);
}
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`repo-steward: ${message}
`);
  process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map