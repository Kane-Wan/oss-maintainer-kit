#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseArgs } from "node:util";

import { analyze } from "./analyzer.js";
import { payloadToRequest } from "./cli-input.js";
import type { OutputLanguage, TaskKind } from "./types.js";

const HELP = `oss-maintainer <task> [options]

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
    output.write("0.1.0\n");
    return;
  }

  const task = parseTask(positionals[0]);
  const language = parseLanguage(values.language);
  const raw = values.input === "-" ? await readStdin() : await readFile(values.input, "utf8");
  const request = payloadToRequest(task, JSON.parse(raw) as unknown, language);
  const result = await analyze(request, { model: values.model });

  if (values.output) {
    await writeFile(values.output, `${result.markdown}\n`, "utf8");
    output.write(`Wrote ${values.output}\n`);
    return;
  }
  output.write(`${result.markdown}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`oss-maintainer: ${message}\n`);
  process.exitCode = 1;
});
