export type TaskKind = "pr-review" | "issue-triage" | "release-notes";

export type OutputLanguage = "auto" | "en" | "zh-CN";

export interface AnalysisRequest {
  task: TaskKind;
  title: string;
  content: string;
  repository?: string;
  body?: string;
  labels?: string[];
  version?: string;
  language?: OutputLanguage;
}

export interface AnalysisResult {
  task: TaskKind;
  model: string;
  markdown: string;
}

export interface GenerateTextRequest {
  model: string;
  instructions: string;
  input: string;
}

export interface TextGenerator {
  generate(request: GenerateTextRequest): Promise<string>;
}

export interface AnalyzeOptions {
  apiKey?: string;
  model?: string;
  generator?: TextGenerator;
}
