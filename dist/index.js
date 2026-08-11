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
  formatPilotSummary,
  formatPullRequestFiles,
  parsePilotDataset,
  resolveTask,
  summarizePilot,
  truncateContent
} from "./chunk-GDJ7SAON.js";

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
  formatPilotSummary,
  formatPullRequestFiles,
  parsePilotDataset,
  resolveTask,
  summarizePilot,
  truncateContent
};
//# sourceMappingURL=index.js.map