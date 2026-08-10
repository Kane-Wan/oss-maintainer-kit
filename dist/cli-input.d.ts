import type { AnalysisRequest, OutputLanguage, TaskKind } from "./types.js";
export declare function payloadToRequest(task: TaskKind, payload: unknown, language: OutputLanguage): AnalysisRequest;
