import {
  DEFAULT_MODEL,
  MAX_COMBINED_DIFF_CHARS,
  MAX_CONTENT_CHARS,
  MAX_PATCH_CHARS_PER_FILE,
  OpenAITextGenerator,
  SYSTEM_INSTRUCTIONS,
  VERSION,
  analyze,
  buildPrompt,
  createAnalysisRequest,
  formatEvaluationSummary,
  formatPilotSummary,
  formatPullRequestFiles,
  parseEvaluationDataset,
  parsePilotDataset,
  resolveTask,
  summarizeEvaluation,
  summarizePilot,
  truncateContent
} from "./chunk-T76MMFPG.js";

// src/security.ts
function assertEventAllowed(eventName, options = {}) {
  if (eventName === "pull_request_target" && !options.allowPullRequestTarget) {
    throw new Error(
      "pull_request_target is disabled by default because it can expose repository secrets to untrusted pull request content. Use pull_request when possible. If you have reviewed the risks and do not check out or execute contribution code, set allow-pull-request-target to true explicitly."
    );
  }
}
export {
  DEFAULT_MODEL,
  MAX_COMBINED_DIFF_CHARS,
  MAX_CONTENT_CHARS,
  MAX_PATCH_CHARS_PER_FILE,
  OpenAITextGenerator,
  SYSTEM_INSTRUCTIONS,
  VERSION,
  analyze,
  assertEventAllowed,
  buildPrompt,
  createAnalysisRequest,
  formatEvaluationSummary,
  formatPilotSummary,
  formatPullRequestFiles,
  parseEvaluationDataset,
  parsePilotDataset,
  resolveTask,
  summarizeEvaluation,
  summarizePilot,
  truncateContent
};
//# sourceMappingURL=index.js.map