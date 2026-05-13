/**
 * 记忆管理器
 * 记忆、作者笔记和系统提示分类管理
 * 集成AdvancedVectorizerV2进行语义搜索
 */
import { Memory } from '../../types';
export interface MemoryContext {
    recentChapters?: number;
    characterStates?: Record<string, any>;
    plotProgress?: string;
    emotionalTone?: string;
}
export declare class MemoryManager {
    private memories;
    private authorNotes;
    private systemPrompts;
    private storagePath;
    private vectorizer;
    constructor(storagePath?: string);
    initialize(projectId: string): Promise<void>;
    addMemory(projectId: string, content: string, type?: Memory['type']): Promise<Memory>;
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
    consolidateMemories(projectId: string, summary: string): Promise<void>;
    searchMemories(projectId: string, query: string, limit?: number): Promise<Memory[]>;
    private save;
    load(projectId: string): Promise<void>;
    private generateId;
}
export default MemoryManager;
//# sourceMappingURL=MemoryManager.d.ts.map