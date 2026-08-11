import type { TaskKind } from "./types.js";
export type EvaluationDatasetKind = "demonstration" | "evaluation";
export type EvaluationControl = "candidate" | "negative-control";
export interface EvaluationChecks {
    requiredText?: string[];
    forbiddenText?: string[];
    minimumCharacters?: number;
    maximumCharacters?: number;
    requireMarkdownHeading?: boolean;
}
export interface EvaluationCase {
    id: string;
    task: TaskKind;
    control: EvaluationControl;
    output: string;
    checks: EvaluationChecks;
    model?: string;
    publicEvidenceUrl?: string;
}
export interface EvaluationDataset {
    datasetKind: EvaluationDatasetKind;
    projectVersion: string;
    description?: string;
    cases: EvaluationCase[];
}
export interface EvaluationCheckResult {
    label: string;
    passed: boolean;
}
export interface EvaluationCaseResult {
    id: string;
    task: TaskKind;
    control: EvaluationControl;
    actualPass: boolean;
    expectationMet: boolean;
    checks: EvaluationCheckResult[];
    model?: string;
    publicEvidenceUrl?: string;
}
export interface EvaluationSummary {
    datasetKind: EvaluationDatasetKind;
    projectVersion: string;
    description?: string;
    totalCases: number;
    candidateCases: number;
    candidatePassed: number;
    candidatePassRate: number | null;
    negativeControls: number;
    negativeControlsCaught: number;
    negativeControlDetectionRate: number | null;
    expectationsMet: number;
    expectationAccuracy: number;
    publicEvidenceUrls: string[];
    results: EvaluationCaseResult[];
}
export declare function parseEvaluationDataset(value: unknown): EvaluationDataset;
export declare function summarizeEvaluation(dataset: EvaluationDataset): EvaluationSummary;
export declare function formatEvaluationSummary(summary: EvaluationSummary): string;
