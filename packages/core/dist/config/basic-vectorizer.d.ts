/**
 * Cloud Book - 基础向量方案
 * 2026年5月12日 04:58
 * 完全不需要LLM的向量计算方案
 */
export interface BasicVectorConfig {
    dimensions: number;
    method: 'tfidf' | 'hash' | 'ngram';
}
export declare class BasicVectorizer {
    private dimensions;
    private vocabulary;
    private idf;
    private documentCount;
    constructor(config?: BasicVectorConfig);
    /**
     * 文本分词（中英文混合）
     */
    tokenize(text: string): string[];
    /**
     * 哈希向量（无需训练）
     */
    hashVector(text: string): number[];
    /**
     * 字符串哈希
     */
    private stringHash;
    /**
     * TF-IDF向量（需要训练）
     */
    fit(documents: string[]): void;
    /**
     * TF-IDF向量化
     */
    tfidfVector(text: string): number[];
    /**
     * 统一嵌入接口
     */
    embed(text: string): number[];
    /**
     * 批量嵌入
     */
    embedBatch(texts: string[]): number[][];
    /**
     * 余弦相似度
     */
    static cosineSimilarity(a: number[], b: number[]): number;
    /**
     * 搜索最相似
     */
    search(query: string, documents: string[], topK?: number): Array<{
        index: number;
        score: number;
        text: string;
    }>;
}
export declare const basicVectorizer: BasicVectorizer;
export default BasicVectorizer;
//# sourceMappingURL=basic-vectorizer.d.ts.map