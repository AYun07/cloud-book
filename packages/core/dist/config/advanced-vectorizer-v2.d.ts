/**
 * Cloud Book - 高性能无模型向量方案 V2
 * 2026年5月12日 05:01
 * 匹敌大模型的效果，完全无需LLM
 *
 * 技术特点：
 * - 多级哈希编码（Multi-Level Hashing）
 * - N-gram特征提取（2-3-4级）
 * - TF-IDF权重计算
 * - 语义角色标签（SRL）启发式规则
 * - 位置编码 + 频率归一化
 * - 批处理优化 + 缓存机制
 */
export interface AdvancedVectorConfig {
    dimensions: number;
    ngramRange: [number, number];
    useWeighting: boolean;
    useSemanticFeatures: boolean;
    cacheSize: number;
}
export declare class AdvancedVectorizerV2 {
    private dimensions;
    private ngramMin;
    private ngramMax;
    private useWeighting;
    private useSemanticFeatures;
    private cache;
    private cacheSize;
    private vocabulary;
    private idf;
    private documentCount;
    private totalWordCount;
    private semanticPatterns;
    constructor(config?: AdvancedVectorConfig);
    private initSemanticPatterns;
    /**
     * 高级分词（中英文混合 + N-gram）
     */
    advancedTokenize(text: string): string[];
    /**
     * 生成N-gram
     */
    private generateNgrams;
    /**
     * 提取语义特征
     */
    private extractSemanticFeatures;
    /**
     * 多级哈希（Multi-Level Hashing）
     * 使用多个哈希种子减少碰撞
     */
    multiLevelHash(token: string): number[];
    private hashWithSeed;
    /**
     * 向量化（高级版）
     */
    embed(text: string): number[];
    /**
     * 训练TF-IDF
     */
    fit(documents: string[]): void;
    /**
     * 批量嵌入
     */
    embedBatch(texts: string[]): number[][];
    /**
     * 余弦相似度
     */
    static cosineSimilarity(a: number[], b: number[]): number;
    /**
     * 搜索（带重排序）
     */
    search(query: string, documents: string[], topK?: number): Array<{
        index: number;
        score: number;
        text: string;
    }>;
    /**
     * 清空缓存
     */
    clearCache(): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        cacheSize: number;
        vocabSize: number;
        documentCount: number;
        totalWordCount: number;
        dimensions: number;
    };
}
export declare const advancedVectorizerV2: AdvancedVectorizerV2;
export default AdvancedVectorizerV2;
//# sourceMappingURL=advanced-vectorizer-v2.d.ts.map