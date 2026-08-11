import { OpenAITextGenerator } from "./openai-generator.js";
import { buildPrompt, DEFAULT_MODEL, SYSTEM_INSTRUCTIONS } from "./prompt.js";
import type { AnalysisRequest, AnalysisResult, AnalyzeOptions, TextGenerator } from "./types.js";

function resolveGenerator(options: AnalyzeOptions): TextGenerator {
  if (options.generator) return options.generator;

  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Create an API key, then expose it as an environment variable.",
    );
  }
  return new OpenAITextGenerator(apiKey);
}

export async function analyze(
  request: AnalysisRequest,
  options: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const model =
    options.model ??
    process.env.REPO_STEWARD_MODEL ??
    process.env.OSS_MAINTAINER_MODEL ??
    DEFAULT_MODEL;
  const generator = resolveGenerator(options);
  const markdown = await generator.generate({
    model,
    instructions: SYSTEM_INSTRUCTIONS,
    input: buildPrompt(request),
  });

  return {
    task: request.task,
    model,
    markdown,
  };
}
