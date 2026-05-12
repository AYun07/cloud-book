"use strict";
/**
 * Cloud Book - 基础向量方案
 * 2026年5月12日 04:58
 * 完全不需要LLM的向量计算方案
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicVectorizer = exports.BasicVectorizer = void 0;
class BasicVectorizer {
    dimensions;
    vocabulary = new Map();
    idf = new Map();
    documentCount = 0;
    constructor(config = { dimensions: 1536, method: 'hash' }) {
        this.dimensions = config.dimensions;
    }
    /**
     * 文本分词（中英文混合）
     */
    tokenize(text) {
        const tokens = [];
        const chineseChars = text.match(/[\u4e00-\u9fa5]+/g) || [];
        for (const chars of chineseChars) {
            for (let i = 0; i < chars.length - 1; i++) {
                tokens.push(chars.substring(i, i + 2));
            }
            if (chars.length === 1)
                tokens.push(chars);
        }
        const englishWords = text.toLowerCase().match(/[a-z]+/g) || [];
        tokens.push(...englishWords);
        return tokens;
    }
    /**
     * 哈希向量（无需训练）
     */
    hashVector(text) {
        const vector = new Array(this.dimensions).fill(0);
        const tokens = this.tokenize(text);
        for (const token of tokens) {
            const hash = this.stringHash(token);
            const index = Math.abs(hash) % this.dimensions;
            vector[index] += 1;
        }
        const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
        return vector.map(v => v / norm);
    }
    /**
     * 字符串哈希
     */
    stringHash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }
    /**
     * TF-IDF向量（需要训练）
     */
    fit(documents) {
        this.documentCount = documents.length;
        const df = new Map();
        for (const doc of documents) {
            const tokens = new Set(this.tokenize(doc));
            for (const token of tokens) {
                df.set(token, (df.get(token) || 0) + 1);
            }
        }
        let vocabIndex = 0;
        for (const [token, freq] of df) {
            this.vocabulary.set(token, vocabIndex++);
            this.idf.set(token, Math.log(this.documentCount / freq));
        }
    }
    /**
     * TF-IDF向量化
     */
    tfidfVector(text) {
        const vector = new Array(this.dimensions).fill(0);
        const tokens = this.tokenize(text);
        const tf = new Map();
        for (const token of tokens) {
            tf.set(token, (tf.get(token) || 0) + 1);
        }
        for (const [token, freq] of tf) {
            const index = this.vocabulary.get(token);
            if (index !== undefined && index < this.dimensions) {
                const idf = this.idf.get(token) || 1;
                vector[index] = (freq / tokens.length) * idf;
            }
        }
        const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
        return vector.map(v => v / norm);
    }
    /**
     * 统一嵌入接口
     */
    embed(text) {
        return this.hashVector(text);
    }
    /**
     * 批量嵌入
     */
    embedBatch(texts) {
        return texts.map(t => this.embed(t));
    }
    /**
     * 余弦相似度
     */
    static cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
    }
    /**
     * 搜索最相似
     */
    search(query, documents, topK = 5) {
        const queryVector = this.embed(query);
        const docVectors = documents.map(d => this.embed(d));
        const scores = docVectors.map((vec, index) => ({
            index,
            score: BasicVectorizer.cosineSimilarity(queryVector, vec),
            text: documents[index]
        }));
        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }
}
exports.BasicVectorizer = BasicVectorizer;
exports.basicVectorizer = new BasicVectorizer();
exports.default = BasicVectorizer;
//# sourceMappingURL=basic-vectorizer.js.map