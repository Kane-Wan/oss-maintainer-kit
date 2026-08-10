#!/usr/bin/env node
import {
  analyze,
  createAnalysisRequest
} from "./chunk-5N2BGQQX.js";

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
var HELP = `oss-maintainer <task> [options]

Tasks:
  pr-review       Review pull request metadata and a diff
  issue-triage    Triage an issue and draft a maintainer reply
  release-notes   Turn a change list into release notes

Options:
  -i, --input <path>       JSON input path, or - for stdin (default: -)
  -o, --output <path>      Write Markdown to a file instead of stdout
      --model <name>       OpenAI model (default: OSS_MAINTAINER_MODEL or gpt-5.6-luna)
      --language <value>   auto, en, or zh-CN (default: auto)
  -h, --help               Show this help
  -v, --version            Show the package version

Environment:
  OPENAI_API_KEY           Required for live analysis
  OSS_MAINTAINER_MODEL     Optional model override
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
    output.write("0.1.0\n");
    return;
  }
  const task = parseTask(positionals[0]);
  const language = parseLanguage(values.language);
  const raw = values.input === "-" ? await readStdin() : await readFile(values.input, "utf8");
  const request = payloadToRequest(task, JSON.parse(raw), language);
  const result = await analyze(request, { model: values.model });
  if (values.output) {
    await writeFile(values.output, `${result.markdown}
`, "utf8");
    output.write(`Wrote ${values.output}
`);
    return;
  }
  output.write(`${result.markdown}
`);
}
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`oss-maintainer: ${message}
`);
  process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map