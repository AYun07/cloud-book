/**
 * Cloud Book - 创意中心（已填充完整实现）
 * 基于AdvancedVectorizerV2的RAG知识库
 */
import { CreativeHubConfig, CreativeSession, CreativeDocument, SearchResult } from '../../types.js';
export declare class CreativeHub {
    private vectorizer;
    private storage;
    private config;
    private sessions;
    private documentCache;
    constructor(config: CreativeHubConfig);
    createSession(projectId: string): Promise<CreativeSession>;
    getSession(sessionId: string): Promise<CreativeSession | null>;
    addDocument(sessionId: string, document: CreativeDocument): Promise<void>;
    search(sessionId: string, query: string, limit?: number): Promise<SearchResult[]>;
    private extractMatchedSegments;
    sendMessage(sessionId: string, message: string, useRAG?: boolean): Promise<{
        response: string;
        context: CreativeDocument[];
    }>;
    private generateContextualResponse;
    clearSession(sessionId: string): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
    getStatistics(sessionId: string): Promise<{
        documentCount: number;
        totalCharacters: number;
        averageRelevance: number;
        queryCount: number;
    }>;
    private saveSession;
    private saveDocument;
    destroy(): void;
}
//# sourceMappingURL=CreativeHubImpl.d.ts.map