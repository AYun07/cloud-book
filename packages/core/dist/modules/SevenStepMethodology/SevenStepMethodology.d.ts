/**
 * 七步创作法
 * Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
 */
import { WritingStep } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
export interface StepResult {
    step: WritingStep['step'];
    success: boolean;
    data?: any;
    message?: string;
}
export interface MethodologyProgress {
    projectId: string;
    currentStep: WritingStep['step'];
    completedSteps: WritingStep['step'][];
    results: Map<WritingStep['step'], StepResult>;
}
export declare class SevenStepMethodology {
    private llmManager;
    private progress;
    constructor(llmManager: LLMManager);
    initializeProject(projectId: string): Promise<WritingStep[]>;
    executeStep(projectId: string, step: WritingStep['step'], params?: Record<string, any>): Promise<StepResult>;
    private getNextStep;
    executeConstitution(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executeSpecify(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executeClarify(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executePlan(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executeTasks(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executeWrite(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    executeAnalyze(projectId: string, params?: Record<string, any>): Promise<StepResult>;
    getProgress(projectId: string): MethodologyProgress | undefined;
    getNextAction(projectId: string): WritingStep['step'] | null;
    private parseConstitution;
    private parseSpec;
    private parsePlan;
    private parseTasks;
    private tryParseJSON;
    private looksLikeChapter;
    private toChineseNumber;
    private extractSection;
    private extractList;
    private extractField;
    private extractChapterTitle;
    private extractChapterSummary;
    private extractMilestones;
    private extractSummary;
    private generateId;
}
export default SevenStepMethodology;
//# sourceMappingURL=SevenStepMethodology.d.ts.map