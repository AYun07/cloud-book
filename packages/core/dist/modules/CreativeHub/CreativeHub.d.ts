/**
 * Cloud Book - RAG 知识库 V2
 * 真正的向量检索系统
 * 支持 Pinecone、Qdrant、Milvus 等向量数据库
 * 实现两阶段检索和重排序
 */
export interface EmbeddingConfig {
    provider: 'openai' | 'local' | 'custom';
    apiKey?: string;
    endpoint?: string;
    model?: string;
    dimension?: number;
}
export interface ChunkConfig {
    chunkSize: number;
    overlap: number;
    separators?: string[];
}
export interface Document {
    id: string;
    content: string;
    metadata?: Record<string, any>;
    embedding?: number[];
}
export interface SearchResult {
    document: Document;
    score: number;
    highlights: string[];
    rerankedScore?: number;
}
export interface VectorStoreConfig {
    type: 'memory' | 'pinecone' | 'qdrant' | 'milvus' | 'weaviate';
    endpoint?: string;
    apiKey?: string;
    indexName?: string;
    dimension?: number;
    metric?: 'cosine' | 'euclidean' | 'dotproduct';
    metadata?: Record<string, any>;
    topK?: number;
    batchSize?: number;
}
export interface RerankConfig {
    provider: 'cohere' | 'openai' | 'local';
    apiKey?: string;
    endpoint?: string;
    model?: string;
    topN?: number;
}
export interface VectorStoreConnector {
    initialize(): Promise<void>;
    upsert(id: string, embedding: number[], metadata: Record<string, any>): Promise<void>;
    upsertBatch(items: Array<{
        id: string;
        embedding: number[];
        metadata: Record<string, any>;
    }>): Promise<void>;
    search(queryEmbedding: number[], topK: number, filter?: Record<string, any>): Promise<Array<{
        id: string;
        score: number;
        metadata: Record<string, any>;
    }>>;
    delete(id: string): Promise<void>;
    deleteCollection(): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export declare class CreativeHub {
    private embeddingConfig;
    private chunkConfig;
    private vectorStoreConfig;
    private rerankConfig?;
    private documents;
    private index;
    private llmProvider;
    private vectorStore;
    private initialized;
    private useVectorStore;
    constructor(embeddingConfig?: Partial<EmbeddingConfig>, chunkConfig?: Partial<ChunkConfig>, vectorStoreConfig?: Partial<VectorStoreConfig>, rerankConfig?: Partial<RerankConfig>);
    initialize(): Promise<void>;
    private createVectorStoreConnector;
    setLLMProvider(provider: any): void;
    addDocument(content: string, metadata?: Record<string, any>): Promise<Document>;
    addDocuments(documents: Array<{
        content: string;
        metadata?: Record<string, any>;
    }>): Promise<Document[]>;
    search(query: string, topK?: number, filter?: Record<string, any>): Promise<SearchResult[]>;
    private vectorStoreSearch;
    private localSearch;
    private applyReranking;
    private rerankResults;
    private cohereRerank;
    private openaiRerank;
    private localRerank;
    private calculateRelevanceScore;
    hybridSearch(query: string, topK?: number, alpha?: number): Promise<SearchResult[]>;
    retrieveAndGenerate(query: string, systemPrompt: string, options?: {
        topK?: number;
        maxContextLength?: number;
        temperature?: number;
        useHybrid?: boolean;
        alpha?: number;
    }): Promise<{
        answer: string;
        sources: SearchResult[];
    }>;
    generateEmbedding(text: string): Promise<number[]>;
    private callOpenAIEmbedding;
    private callLocalEmbedding;
    private callCustomEmbedding;
    private simulateEmbedding;
    private hashString;
    private seededRandom;
    private splitIntoChunks;
    private cosineSimilarity;
    private calculateKeywordScores;
    private extractHighlights;
    deleteDocument(id: string): Promise<void>;
    deleteAllDocuments(): Promise<void>;
    getStats(): {
        totalDocuments: number;
        totalChunks: number;
        avgChunkLength: number;
        embeddingDimension: number;
        vectorStoreType: string;
        isConnected: boolean;
    };
    saveIndex(filePath: string): Promise<void>;
    loadIndex(filePath: string): Promise<void>;
    healthCheck(): Promise<{
        healthy: boolean;
        vectorStoreConnected: boolean;
        documentCount: number;
    }>;
    clear(): void;
}
export default CreativeHub;
//# sourceMappingURL=CreativeHub.d.ts.map