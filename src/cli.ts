#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseArgs } from "node:util";

import { analyze } from "./analyzer.js";
import { payloadToRequest } from "./cli-input.js";
import {
  formatEvaluationSummary,
  parseEvaluationDataset,
  summarizeEvaluation,
} from "./evaluation.js";
import { formatPilotSummary, parsePilotDataset, summarizePilot } from "./pilot.js";
import type { OutputLanguage, TaskKind } from "./types.js";
import { VERSION } from "./version.js";

const HELP = `repo-steward <command> [options]

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

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function parseTask(value: string | undefined): TaskKind {
  if (value === "pr-review" || value === "issue-triage" || value === "release-notes") {
    return value;
  }
  throw new Error("Choose one task: pr-review, issue-triage, or release-notes.");
}

function parseLanguage(value: string | undefined): OutputLanguage {
  if (!value) return "auto";
  if (value === "auto" || value === "en" || value === "zh-CN") return value;
  throw new Error("Language must be auto, en, or zh-CN.");
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      input: { type: "string", short: "i", default: "-" },
      output: { type: "string", short: "o" },
      model: { type: "string" },
      language: { type: "string", default: "auto" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });

  if (values.help) {
    output.write(HELP);
    return;
  }
  if (values.version) {
    output.write(`${VERSION}\n`);
    return;
  }

  const raw = values.input === "-" ? await readStdin() : await readFile(values.input, "utf8");
  const command = positionals[0];
  let markdown: string;

  if (command === "pilot-summary") {
    const dataset = parsePilotDataset(JSON.parse(raw) as unknown);
    markdown = formatPilotSummary(summarizePilot(dataset));
  } else if (command === "eval-summary") {
    const dataset = parseEvaluationDataset(JSON.parse(raw) as unknown);
    markdown = formatEvaluationSummary(summarizeEvaluation(dataset));
  } else {
    const task = parseTask(command);
    const language = parseLanguage(values.language);
    const request = payloadToRequest(task, JSON.parse(raw) as unknown, language);
    const result = await analyze(request, { model: values.model });
    markdown = result.markdown;
  }

  if (values.output) {
    await writeFile(values.output, `${markdown}\n`, "utf8");
    output.write(`Wrote ${values.output}\n`);
    return;
  }
  output.write(`${markdown}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`repo-steward: ${message}\n`);
  process.exitCode = 1;
});
