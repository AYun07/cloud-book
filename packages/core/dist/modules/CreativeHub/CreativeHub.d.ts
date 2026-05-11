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
        type: 'character' | 'world' | 'plot' | 'chapter';
        sourceId?: string;
        chapter?: number;
    };
    embedding?: number[];
}
export interface SearchResult {
    document: RAGDocument;
    score: number;
    highlights: string[];
}
export declare class CreativeHub {
    private sessions;
    private ragDocuments;
    private llmManager;
    private storagePath;
    constructor(llmManager: LLMManager, storagePath?: string);
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