/**
 * Agent 智能体系统
 * 六类创作智能体：架构师、写作者、审计员、修订师、风格工程师、雷达
 */
import { Agent, AgentType, NovelProject, Chapter, TruthFiles } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
export interface AgentTask {
    id: string;
    type: AgentType;
    description: string;
    context: Record<string, any>;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: any;
    error?: string;
}
export interface AgentResponse {
    success: boolean;
    data?: any;
    message: string;
    error?: string;
}
export declare class AgentSystem {
    private agents;
    private tasks;
    private llmManager;
    private auditEngine;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine);
    private initializeAgents;
    getAgent(type: AgentType): Agent | undefined;
    getAllAgents(): Agent[];
    executeArchitectTask(project: Partial<NovelProject>, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>): Promise<AgentResponse>;
    executeWriterTask(project: NovelProject, chapterNumber: number, options?: {
        outline?: string;
        guidance?: string;
    }): Promise<AgentResponse>;
    executeAuditorTask(content: string, truthFiles: TruthFiles, options?: {
        autoFix?: boolean;
    }): Promise<AgentResponse>;
    executeReviserTask(content: string, issues: any[], truthFiles: TruthFiles): Promise<AgentResponse>;
    executeStyleEngineerTask(content: string, task: 'extract_style' | 'apply_style' | 'humanize', styleSource?: string): Promise<AgentResponse>;
    executeRadarTask(task: 'trend_analysis' | 'performance_review' | 'risk_alert', params?: Record<string, any>): Promise<AgentResponse>;
    executePipeline(project: NovelProject, chapterNumber: number): Promise<{
        chapter?: Chapter;
        issues?: any[];
    }>;
    private architectWorldBuilding;
    private architectCharacterDesign;
    private architectPlotPlanning;
    private architectOutlineGeneration;
    private buildWriterPrompt;
    private buildReviserPrompt;
    private extractStyle;
    private applyStyle;
    private humanizeContent;
    private analyzeTrends;
    private reviewPerformance;
    private checkRiskAlert;
    private generateFixes;
    private countWords;
    executeParallelTasks(tasks: AgentTask[]): Promise<AgentResponse[]>;
    private createTask;
    private updateTaskStatus;
    getTaskStatus(taskId: string): AgentTask | undefined;
    getAllTasks(): AgentTask[];
    executeChaptersBatch(project: NovelProject, startChapter: number, endChapter: number, parallelCount?: number): Promise<{
        chapters: Chapter[];
        allResults: AgentResponse[];
    }>;
    executeFullPipeline(project: NovelProject, chapterCount: number, onProgress?: (agent: string, status: string, progress: number) => void): Promise<{
        chapters: Chapter[];
        truthFiles: TruthFiles;
    }>;
}
export default AgentSystem;
//# sourceMappingURL=AgentSystem.d.ts.map