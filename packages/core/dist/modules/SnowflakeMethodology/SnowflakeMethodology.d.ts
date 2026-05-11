/**
 * 雪花创作法（Snowflake Method）
 * 从一句话开始，逐步扩展为完整小说
 * Step 1: 一句话概括 → Step 2: 扩展为一段 → Step 3: 人物设定
 * Step 4: 一句话章节大纲 → Step 5: 段落章节大纲 → Step 6: 角色情节图
 * Step 7: 详细场景 → Step 8: 开始写作
 */
import { LLMManager } from '../LLMProvider/LLMManager';
export interface SnowflakeStep {
    step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    data?: any;
}
export interface SnowflakeProject {
    projectId: string;
    steps: SnowflakeStep[];
    currentStep: number;
}
export interface CharacterSheet {
    id: string;
    name: string;
    role: 'protagonist' | 'antagonist' | 'side' | 'love';
    backstory: string;
    motivation: string;
    goal: string;
    conflict: string;
    epiphany: string;
    oneLineSummary: string;
    oneParagraphSummary: string;
}
export interface ChapterOutline {
    chapterNumber: number;
    oneLine: string;
    oneParagraph?: string;
    detailedScene?: string;
    keyPoints?: string[];
    characterFocus?: string[];
}
export declare class SnowflakeMethodology {
    private llmManager;
    private projects;
    constructor(llmManager: LLMManager);
    initializeProject(projectId: string): Promise<SnowflakeStep[]>;
    executeStep(projectId: string, step: number, params?: Record<string, any>): Promise<{
        success: boolean;
        data?: any;
        message: string;
    }>;
    private executeStep1;
    private executeStep2;
    private executeStep3;
    private generateCharacters;
    private executeStep4;
    private executeStep5;
    private executeStep6;
    private executeStep7;
    private executeStep8;
    getProject(projectId: string): SnowflakeProject | undefined;
    getCurrentStep(projectId: string): number | null;
    getStepData(projectId: string, step: number): any;
    private parseOneLineChapters;
    private generateId;
}
export default SnowflakeMethodology;
//# sourceMappingURL=SnowflakeMethodology.d.ts.map