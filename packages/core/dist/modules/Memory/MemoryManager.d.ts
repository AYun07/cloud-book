/**
 * 记忆管理器
 * 记忆、作者笔记和系统提示分类管理
 * 集成AdvancedVectorizerV2进行语义搜索
 * 支持真正的对话历史压缩算法
 */
import { Memory } from '../../types';
export interface MemoryContext {
    recentChapters?: number;
    characterStates?: Record<string, any>;
    plotProgress?: string;
    emotionalTone?: string;
}
export interface CompressionConfig {
    maxMemories: number;
    compressionThreshold: number;
    summaryLength: number;
    preserveRecentCount: number;
    priorityWeights: {
        high: number;
        medium: number;
        low: number;
        keyword: number;
        recent: number;
        emotional: number;
    };
}
export interface CompressedSegment {
    type: 'summary' | 'key_event' | 'character_moment' | 'plot_twist';
    content: string;
    importance: number;
    keywords: string[];
    chapterRange?: {
        start: number;
        end: number;
    };
    timestamp?: number;
}
export interface CompressionResult {
    compressed: Memory[];
    removed: number;
    summary: string;
    segments: CompressedSegment[];
}
export declare class MemoryManager {
    private memories;
    private authorNotes;
    private systemPrompts;
    private storagePath;
    private vectorizer;
    private compressionConfig;
    private compressionMetadata;
    constructor(storagePath?: string, config?: Partial<CompressionConfig>);
    initialize(projectId: string): Promise<void>;
    addMemory(projectId: string, content: string, type?: Memory['type'], metadata?: Partial<Memory['metadata']>): Promise<Memory>;
    updateMemory(projectId: string, memoryId: string, updates: Partial<Memory>): Promise<Memory | null>;
    deleteMemory(projectId: string, memoryId: string): Promise<boolean>;
    getMemories(projectId: string): Promise<Memory[]>;
    getAuthorNotes(projectId: string): Promise<Memory[]>;
    getSystemPrompts(projectId: string): Promise<Memory[]>;
    getAllMemories(projectId: string): Promise<Memory[]>;
    getRelevantMemories(projectId: string, context: MemoryContext): Promise<Memory[]>;
    private calculateMemoryScore;
    private calculateAuthorsNoteScore;
    buildMemoryContext(projectId: string, context?: MemoryContext): Promise<string>;
    private extractKeywords;
    private classifySegmentType;
    private calculateSegmentImportance;
    private rankMemoriesForCompression;
    private extractSummary;
    private incrementalCompress;
    consolidateMemories(projectId: string, options?: {
        forceFullCompression?: boolean;
        preserveRecent?: number;
        customSummary?: string;
    }): Promise<CompressionResult>;
    shouldCompress(projectId: string): Promise<boolean>;
    getCompressionStats(projectId: string): {
        memoryCount: number;
        lastCompression: number | null;
        compressionCount: number;
        totalCompressions: number;
    };
    searchMemories(projectId: string, query: string, limit?: number): Promise<Memory[]>;
    private save;
    load(projectId: string): Promise<void>;
    private generateId;
}
export default MemoryManager;
//# sourceMappingURL=MemoryManager.d.ts.map