/**
 * 创意中心模块
 * RAG检索增强，支持多工具协作
 */
import { CreativeHubSession, HubMessage, HubTool, HubContext, Character } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
export interface RAGDocument {
    id: string;
    content: string;
    metadata: {
        type: 'character' | 'world' | 'plot' | 'chapter' | 'theme' | 'event';
        sourceId?: string;
        chapter?: number;
        tags?: string[];
        createdAt: Date;
    };
    embedding?: number[];
}
export interface SearchResult {
    document: RAGDocument;
    score: number;
    highlights: string[];
}
export interface ChunkConfig {
    chunkSize: number;
    chunkOverlap: number;
    minChunkLength: number;
}
export declare class CreativeHub {
    private sessions;
    private ragDocuments;
    private llmManager;
    private storagePath;
    private chunkConfig;
    constructor(llmManager: LLMManager, storagePath?: string);
    /**
     * 添加文档并自动分块
     */
    addDocumentWithChunking(projectId: string, document: Omit<RAGDocument, 'id' | 'embedding'>): Promise<RAGDocument[]>;
    /**
     * 文本分块
     */
    private chunkText;
    /**
     * 句子分割
     */
    private splitIntoSentences;
    /**
     * 生成文本嵌入（模拟向量）
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * 计算余弦相似度
     */
    private cosineSimilarity;
    /**
     * 增强的RAG搜索
     */
    enhancedSearch(projectId: string, query: string, options?: {
        topK?: number;
        filters?: {
            types?: RAGDocument['metadata']['type'][];
            tags?: string[];
            chapterRange?: {
                min?: number;
                max?: number;
            };
        };
        useHybridSearch?: boolean;
        rerank?: boolean;
    }): Promise<SearchResult[]>;
    /**
     * 计算文本相关度分数
     */
    private calculateTextScore;
    /**
     * 结果重排序
     */
    private rerankResults;
    /**
     * 批量添加文档
     */
    batchAddDocuments(projectId: string, documents: Omit<RAGDocument, 'id'>[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    /**
     * 语义搜索
     */
    semanticSearch(projectId: string, query: string, intent?: 'character' | 'plot' | 'world' | 'theme'): Promise<SearchResult[]>;
    /**
     * 获取项目知识库统计
     */
    getKnowledgeStats(projectId: string): Promise<{
        totalDocuments: number;
        byType: Record<string, number>;
        byChapter: Record<number, number>;
        avgChunkLength: number;
        lastUpdated: Date | null;
    }>;
    createSession(projectId: string): Promise<CreativeHubSession>;
    sendMessage(sessionId: string, content: string, role?: HubMessage['role']): Promise<HubMessage>;
    addTool(sessionId: string, tool: HubTool): Promise<void>;
    executeTool(sessionId: string, toolName: string, args: any): Promise<any>;
    addRAGDocument(projectId: string, document: Omit<RAGDocument, 'id'>): Promise<RAGDocument>;
    addCharacterToRAG(projectId: string, character: Character): Promise<void>;
    addWorldSettingToRAG(projectId: string, setting: any): Promise<void>;
    searchRAG(projectId: string, query: string, topK?: number): Promise<SearchResult[]>;
    buildContext(session: CreativeHubSession): Promise<string>;
    updateContext(sessionId: string, updates: Partial<HubContext>): Promise<void>;
    getSession(sessionId: string): Promise<CreativeHubSession | undefined>;
    getProjectSessions(projectId: string): Promise<CreativeHubSession[]>;
    private getDefaultTools;
    private extractHighlights;
    private saveSession;
    private saveRAGDocuments;
    private generateId;
}
export default CreativeHub;
//# sourceMappingURL=CreativeHub.d.ts.map