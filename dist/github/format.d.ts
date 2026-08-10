import type { AnalysisRequest, OutputLanguage, TaskKind } from "../types.js";
export interface PullRequestFile {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string | null;
}
export declare const MAX_PATCH_CHARS_PER_FILE = 8000;
export declare const MAX_COMBINED_DIFF_CHARS = 50000;
export declare function formatPullRequestFiles(files: PullRequestFile[]): string;
export declare function resolveTask(eventName: string, configuredMode: string): TaskKind;
interface RequestInput {
    task: TaskKind;
    repository: string;
    title: string;
    body?: string;
    content: string;
    labels?: string[];
    version?: string;
    language?: OutputLanguage;
}
export declare function createAnalysisRequest(input: RequestInput): AnalysisRequest;
export {};
