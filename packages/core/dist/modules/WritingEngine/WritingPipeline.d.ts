/**
 * Cloud Book - 写作管线
 * 整合写作、审计、修订的完整流程
 */
import { NovelProject, Chapter, AuditResult, WritingOptions, TruthFiles } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
import { AntiDetectionEngine } from '../AntiDetection/AntiDetectionEngine';
export interface PipelineStep {
    name: string;
    execute: (input: any) => Promise<any>;
    onError?: (error: Error) => Promise<any>;
}
export declare class WritingPipeline {
    private llmManager;
    private auditEngine;
    private antiDetectionEngine;
    private contextManager;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine, antiDetectionEngine: AntiDetectionEngine);
    /**
     * 执行完整写作流程
     */
    generateChapter(project: NovelProject, chapterNumber: number, truthFiles: TruthFiles, options?: WritingOptions): Promise<{
        chapter: Chapter;
        auditResult?: AuditResult;
        humanized?: string;
    }>;
    /**
     * 生成草稿
     */
    private generateDraft;
    /**
     * 构建写作提示词
     */
    private buildWritingPrompt;
    /**
     * 根据审计结果修订
     */
    reviseChapter(content: string, auditResult: AuditResult, truthFiles: TruthFiles): Promise<string>;
    /**
     * 基于审计修订
     */
    private reviseBasedOnAudit;
    /**
     * 流式生成
     */
    streamGenerate(project: NovelProject, chapterNumber: number, truthFiles: TruthFiles, options: WritingOptions & {
        stream: true;
    }, onChunk: (chunk: string) => void): Promise<string>;
    /**
     * 生成大纲
     */
    generateOutline(project: NovelProject, chapterNumber: number, truthFiles: TruthFiles): Promise<string>;
    /**
     * 生成摘要
     */
    generateSummary(content: string, truthFiles: TruthFiles): Promise<string>;
    /**
     * 生成ID
     */
    private generateId;
    /**
     * 数字转中文
     */
    private toChineseNumber;
    /**
     * 统计字数
     */
    private countWords;
}
export default WritingPipeline;
//# sourceMappingURL=WritingPipeline.d.ts.map