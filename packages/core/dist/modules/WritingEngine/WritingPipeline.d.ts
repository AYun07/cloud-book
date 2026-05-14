/**
 * Cloud Book - 写作管线
 * 整合写作、审计、修订的完整流程
 */
import { NovelProject, Chapter, AuditResult, WritingOptions, TruthFiles, ChapterSummary } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
import { AntiDetectionEngine } from '../AntiDetection/AntiDetectionEngine';
export interface PipelineStep {
    name: string;
    execute: (input: any) => Promise<any>;
    onError?: (error: Error) => Promise<any>;
}
export interface ChapterContextState {
    chapterNumber: number;
    auditResult?: AuditResult;
    contextSnapshot?: string;
    completedAt?: Date;
    summary?: ChapterSummary;
    status: 'pending' | 'writing' | 'auditing' | 'completed' | 'failed';
    error?: string;
}
export interface ContextSyncOptions {
    enableSequentialSync: boolean;
    waitForAuditResult: boolean;
    enableConsistencyCheck: boolean;
    maxWaitTimeMs: number;
}
export declare class WritingPipeline {
    private llmManager;
    private auditEngine;
    private antiDetectionEngine;
    private contextManager;
    private chapterStates;
    private chapterLocks;
    private syncOptions;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine, antiDetectionEngine: AntiDetectionEngine, syncOptions?: Partial<ContextSyncOptions>);
    /**
     * 获取章节上下文状态
     */
    getChapterContextState(chapterNumber: number): ChapterContextState | undefined;
    /**
     * 获取所有章节状态
     */
    getAllChapterStates(): Map<number, ChapterContextState>;
    /**
     * 清除章节状态（用于新项目）
     */
    clearChapterStates(): void;
    /**
     * 等待前面的章节完成
     */
    private waitForPreviousChapters;
    /**
     * 获取前面章节的审计结果
     */
    private getPreviousAuditResults;
    /**
     * 获取前面章节的摘要
     */
    private getPreviousChapterSummaries;
    /**
     * 上下文一致性检查
     */
    private checkContextConsistency;
    /**
     * 更新章节上下文状态
     */
    private updateChapterState;
    /**
     * 注册章节锁
     */
    private registerChapterLock;
    /**
     * 释放章节锁
     */
    private releaseChapterLock;
    /**
     * 构建增强的上下文（包含前面章节的审计结果）
     */
    private buildEnhancedContext;
    /**
     * 执行完整写作流程
     */
    generateChapter(project: NovelProject, chapterNumber: number, truthFiles: TruthFiles, options?: WritingOptions): Promise<{
        chapter: Chapter;
        auditResult?: AuditResult;
        humanized?: string;
    }>;
    /**
     * 检查审计结果一致性
     */
    private checkAuditConsistency;
    /**
     * 生成章节摘要
     */
    private generateChapterSummary;
    private extractKeyEvents;
    private extractCharacters;
    private extractNewHooks;
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
    /**
     * 批量生成章节
     * 支持跨章节上下文同步
     */
    generateChaptersBatch(project: NovelProject, startChapter: number, endChapter: number, truthFiles: TruthFiles, options?: WritingOptions, onProgress?: (current: number, total: number, chapter?: Chapter) => void): Promise<Chapter[]>;
    /**
     * 顺序执行批次（确保跨章节上下文同步）
     */
    private executeSequentialBatch;
    /**
     * 并行执行批次（保持有限并行）
     */
    private executeParallelBatch;
    /**
     * 续写现有小说
     */
    continueWriting(project: NovelProject, lastChapterNumber: number, newChaptersCount: number, truthFiles: TruthFiles, options?: WritingOptions): Promise<Chapter[]>;
    /**
     * 同人创作
     */
    writeFanfiction(sourceNovel: NovelProject, targetChapterNumber: number, premise: string, truthFiles: TruthFiles, options?: WritingOptions): Promise<{
        chapter: Chapter;
        deviationNote?: string;
    }>;
    /**
     * 番外篇创作
     */
    writeSideStory(project: NovelProject, sideStoryTitle: string, viewpointCharacter: string, timelinePosition: string, truthFiles: TruthFiles, options?: WritingOptions): Promise<{
        chapter: Chapter;
        sideStoryNote?: string;
    }>;
    /**
     * 多视角叙事
     */
    writeMultiPOV(project: NovelProject, chapterNumber: number, viewpoints: string[], truthFiles: TruthFiles, options?: WritingOptions): Promise<Chapter[]>;
    /**
     * 自动化完整创作流程
     */
    autoGenerateNovel(project: NovelProject, chapterCount: number, onPhase?: (phase: string, progress: number) => void): Promise<{
        chapters: Chapter[];
        truthFiles: TruthFiles;
    }>;
    private getOrCreateTruthFiles;
    private generateBatchOutlines;
    private updateTruthFilesAfterChapter;
    /**
     * 冒险模式 - 类似AI Dungeon的互动冒险
     */
    adventureMode(project: NovelProject, storyPrompt: string, userAction: string, truthFiles: TruthFiles): Promise<{
        narrative: string;
        newWorldInfo: string[];
    }>;
    /**
     * 聊天机器人模式 - 与角色互动对话
     */
    chatbotMode(project: NovelProject, characterId: string, userMessage: string, truthFiles: TruthFiles): Promise<{
        characterName: string;
        response: string;
        emotion: string;
    }>;
    /**
     * 从叙事中提取新的世界信息
     */
    private extractNewWorldInfo;
    /**
     * 检测对话情感
     */
    private detectEmotion;
    /**
     * 多模式写作入口
     */
    writeWithMode(project: NovelProject, mode: 'novel' | 'adventure' | 'chatbot', options: {
        chapterNumber?: number;
        userAction?: string;
        characterId?: string;
        storyPrompt?: string;
    }, truthFiles: TruthFiles): Promise<any>;
}
export default WritingPipeline;
//# sourceMappingURL=WritingPipeline.d.ts.map