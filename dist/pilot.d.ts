import type { TaskKind } from "./types.js";
export type PilotDatasetKind = "demonstration" | "pilot";
export type PilotOutcome = "accepted" | "edited" | "rejected" | "not-rated";
export interface PilotRunRecord {
    id: string;
    task: TaskKind;
    completed: boolean;
    outcome?: PilotOutcome;
    durationSeconds?: number;
    estimatedMinutesSaved?: number;
    blockingFalsePositive?: boolean;
    repository?: string;
    publicEvidenceUrl?: string;
}
export interface PilotDataset {
    datasetKind: PilotDatasetKind;
    projectVersion: string;
    dateRange?: {
        start: string;
        end: string;
    };
    maintainers?: number;
    runs: PilotRunRecord[];
}
export interface PilotSummary {
    datasetKind: PilotDatasetKind;
    projectVersion: string;
    dateRange?: {
        start: string;
        end: string;
    };
    maintainers: number;
    attempted: number;
    completed: number;
    workflowSuccessRate: number;
    outcomes: Record<PilotOutcome, number>;
    rated: number;
    usefulResultRate: number | null;
    blockingFalsePositives: number;
    medianEstimatedMinutesSaved: number | null;
    timeSavedSampleSize: number;
    repositories: string[];
    evidenceUrls: string[];
    byTask: Record<TaskKind, {
        attempted: number;
        completed: number;
    }>;
}
export declare function parsePilotDataset(value: unknown): PilotDataset;
export declare function summarizePilot(dataset: PilotDataset): PilotSummary;
export declare function formatPilotSummary(summary: PilotSummary): string;
