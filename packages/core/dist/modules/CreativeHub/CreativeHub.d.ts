/**
 * Cloud Book - RAG 知识库 V2
 * 真正的向量检索系统
 * 支持多种 embedding 模型和向量数据库
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
}
export interface VectorStoreConfig {
    type: 'memory' | 'pinecone' | 'qdrant' | 'milvus' | 'weaviate';
    endpoint?: string;
    apiKey?: string;
    indexName?: string;
}
export declare class CreativeHub {
    private embeddingConfig;
    private chunkConfig;
    private vectorStoreConfig;
    private documents;
    private index;
    private llmProvider;
    constructor(embeddingConfig?: Partial<EmbeddingConfig>, chunkConfig?: Partial<ChunkConfig>, vectorStoreConfig?: Partial<VectorStoreConfig>);
    setLLMProvider(provider: any): void;
    /**
     * 添加文档到知识库
     */
    addDocument(content: string, metadata?: Record<string, any>): Promise<Document>;
    /**
     * 批量添加文档
     */
    addDocuments(documents: Array<{
        content: string;
        metadata?: Record<string, any>;
    }>): Promise<Document[]>;
    /**
     * 语义搜索
     */
    search(query: string, topK?: number, filter?: Record<string, any>): Promise<SearchResult[]>;
    /**
     * 混合搜索（关键词 + 语义）
     */
    hybridSearch(query: string, topK?: number, alpha?: number): Promise<SearchResult[]>;
    /**
     * RAG 检索增强生成
     */
    retrieveAndGenerate(query: string, systemPrompt: string, options?: {
        topK?: number;
        maxContextLength?: number;
        temperature?: number;
    }): Promise<{
        answer: string;
        sources: SearchResult[];
    }>;
    /**
     * 生成文本嵌入
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * 调用 OpenAI Embedding API
     */
    private callOpenAIEmbedding;
    /**
     * 调用本地 Embedding 服务（如 Ollama）
     */
    private callLocalEmbedding;
    /**
     * 调用自定义 Embedding API
     */
    private callCustomEmbedding;
    /**
     * 模拟 Embedding（当 API 不可用时）
     */
    private simulateEmbedding;
    private hashString;
    private seededRandom;
    /**
     * 文本分块
     */
    private splitIntoChunks;
    /**
     * 计算余弦相似度
     */
    private cosineSimilarity;
    /**
     * 计算关键词分数
     */
    private calculateKeywordScores;
    /**
     * 提取高亮片段
     */
    private extractHighlights;
    /**
     * 过滤文档
     */
    private filterDocuments;
    /**
     * 删除文档
     */
    deleteDocument(id: string): Promise<void>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalDocuments: number;
        totalChunks: number;
        avgChunkLength: number;
        embeddingDimension: number;
    };
    /**
     * 保存索引到文件
     */
    saveIndex(filePath: string): Promise<void>;
    /**
     * 从文件加载索引
     */
    loadIndex(filePath: string): Promise<void>;
    /**
     * 清空知识库
     */
    clear(): void;
}
export default CreativeHub;
//# sourceMappingURL=CreativeHub.d.ts.map