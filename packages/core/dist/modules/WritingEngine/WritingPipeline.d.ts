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
    syncIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
}
export interface BatchOptions {
    mode: 'sequential' | 'parallel' | 'adaptive';
    parallelCount: number;
    enableContextSync: boolean;
    enableAutoRetry: boolean;
    enableProgressReport: boolean;
    onChapterStart?: (chapterNumber: number) => void;
    onChapterComplete?: (chapter: Chapter, chapterNumber: number) => void;
    onBatchProgress?: (completed: number, total: number, currentChapter?: number) => void;
    onBatchError?: (error: Error, chapterNumber: number) => void;
}
export interface AdaptiveBatchConfig {
    enabled: boolean;
    initialParallelCount: number;
    maxParallelCount: number;
    minParallelCount: number;
    slowChapterThreshold: number;
    speedUpIncrement: number;
    slowDownDecrement: number;
    measurementWindow: number;
}
export interface WritingStrategy {
    type: 'fast' | 'balanced' | 'quality';
    autoAudit: boolean;
    autoHumanize: boolean;
    maxRevisionIterations: number;
    enableStyleTransfer: boolean;
    enableConsistencyBoost: boolean;
}
export declare class WritingPipeline {
    private llmManager;
    private auditEngine;
    private antiDetectionEngine;
    private contextManager;
    private chapterStates;
    private chapterLocks;
    private syncOptions;
    private adaptiveConfig;
    private writingStrategy;
    private abortControllers;
    private isAborted;
    private chapterTimings;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine, antiDetectionEngine: AntiDetectionEngine, syncOptions?: Partial<ContextSyncOptions>, adaptiveConfig?: Partial<AdaptiveBatchConfig>, writingStrategy?: Partial<WritingStrategy>);
    /**
     * 设置自适应批次配置
     */
    setAdaptiveConfig(config: Partial<AdaptiveBatchConfig>): void;
    /**
     * 设置写作策略
     */
    setWritingStrategy(strategy: Partial<WritingStrategy>): void;
    /**
     * 中止当前所有章节生成
     */
    abortAll(): void;
    /**
     * 中止特定章节的生成
     */
    abortChapter(chapterNumber: number): void;
    /**
     * 重置中止状态
     */
    resetAbort(): void;
    /**
     * 获取章节生成统计
     */
    getChapterStatistics(): {
        totalChapters: number;
        completed: number;
        failed: number;
        pending: number;
        averageTimingMs: number;
        estimatedRemainingTimeMs: number;
    };
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
     * 智能等待前面的章节完成（带重试机制）
     */
    private waitForPreviousChaptersWithRetry;
    /**
     * 延迟工具函数
     */
    private delay;
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
     * 支持顺序同步、并行、及自适应模式
     */
    generateChaptersBatch(project: NovelProject, startChapter: number, endChapter: number, truthFiles: TruthFiles, options?: WritingOptions, onProgress?: (current: number, total: number, chapter?: Chapter) => void): Promise<Chapter[]>;
    /**
     * 顺序执行批次（确保跨章节上下文同步）
     */
    private executeSequentialBatch;
    /**
     * 并行执行批次（保持有限并行）
     * 注意：同批次内无上下文同步
     */
    private executeParallelBatch;
    /**
     * 自适应批次执行（根据性能动态调整并行数）
     */
    private executeAdaptiveBatch;
    /**
     * 智能批次执行（结合顺序和并行优点）
     * 使用流水线模式：主线程顺序生成，同时预热下一批
     */
    private executeIntelligentBatch;
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