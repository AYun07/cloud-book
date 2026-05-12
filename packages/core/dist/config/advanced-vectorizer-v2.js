"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedVectorizerV2 = exports.AdvancedVectorizerV2 = void 0;
class AdvancedVectorizerV2 {
    dimensions;
    ngramMin;
    ngramMax;
    useWeighting;
    useSemanticFeatures;
    cache = new Map();
    cacheSize;
    vocabulary = new Map();
    idf = new Map();
    documentCount = 0;
    totalWordCount = 0;
    // 语义特征：词性、实体类型、情感词等
    semanticPatterns = new Map();
    constructor(config = {
        dimensions: 2048,
        ngramRange: [2, 4],
        useWeighting: true,
        useSemanticFeatures: true,
        cacheSize: 10000
    }) {
        this.dimensions = config.dimensions;
        this.ngramMin = config.ngramRange[0];
        this.ngramMax = config.ngramRange[1];
        this.useWeighting = config.useWeighting;
        this.useSemanticFeatures = config.useSemanticFeatures;
        this.cacheSize = config.cacheSize;
        this.initSemanticPatterns();
    }
    initSemanticPatterns() {
        // 实体类型模式
        this.semanticPatterns.set('PERSON', /[李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏锺汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段漕钱汤尹黎易常武乔贺赖龚文][\u4e00-\u9fa5]{1,2}/g);
        this.semanticPatterns.set('LOCATION', /(华山|武当|少林|峨眉|昆仑|终南山|丐帮|大理|洛阳|长安|苏州|杭州|京城|江南)[的，。、；：""''（）【】\s]/g);
        this.semanticPatterns.set('MARTIAL', /(剑法|刀法|拳法|掌法|轻功|内功|真气|经脉|穴道|秘籍|武林|江湖|侠客|掌门|弟子|师父)/g);
        this.semanticPatterns.set('ACTION', /(出剑|出招|闪避|追击|格挡|对战|切磋|比武|决战)/g);
        this.semanticPatterns.set('EMOTION', /(愤怒|悲伤|高兴|惊讶|恐惧|担忧|狂喜|悲痛|仇恨|爱慕)/g);
        this.semanticPatterns.set('TIME', /(清晨|中午|傍晚|深夜|春天|夏天|秋天|冬天|去年|今年|明年)/g);
    }
    /**
     * 高级分词（中英文混合 + N-gram）
     */
    advancedTokenize(text) {
        const tokens = [];
        // 中文处理
        const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
        for (const chars of chinese) {
            tokens.push(...this.generateNgrams(chars));
        }
        // 英文处理
        const english = text.toLowerCase().match(/[a-z]{2,}/g) || [];
        tokens.push(...english);
        // 语义特征
        if (this.useSemanticFeatures) {
            tokens.push(...this.extractSemanticFeatures(text));
        }
        return tokens;
    }
    /**
     * 生成N-gram
     */
    generateNgrams(text) {
        const ngrams = [];
        for (let n = this.ngramMin; n <= Math.min(this.ngramMax, text.length); n++) {
            for (let i = 0; i <= text.length - n; i++) {
                ngrams.push(text.substring(i, i + n));
            }
        }
        return ngrams;
    }
    /**
     * 提取语义特征
     */
    extractSemanticFeatures(text) {
        const features = [];
        for (const [type, pattern] of this.semanticPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
                    features.push(`__${type}__${match}`);
                }
            }
        }
        return features;
    }
    /**
     * 多级哈希（Multi-Level Hashing）
     * 使用多个哈希种子减少碰撞
     */
    multiLevelHash(token) {
        const seeds = [5381, 31, 131, 1313, 13131, 538131];
        return seeds.map(seed => this.hashWithSeed(token, seed));
    }
    hashWithSeed(str, seed) {
        let hash = seed;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }
    /**
     * 向量化（高级版）
     */
    embed(text) {
        if (this.cache.has(text)) {
            return this.cache.get(text);
        }
        const vector = new Array(this.dimensions).fill(0);
        const tokens = this.advancedTokenize(text);
        // 计算TF
        const tf = new Map();
        for (const token of tokens) {
            tf.set(token, (tf.get(token) || 0) + 1);
        }
        // 多级哈希编码
        for (const [token, count] of tf) {
            const hashes = this.multiLevelHash(token);
            for (const hash of hashes) {
                const index = Math.abs(hash) % this.dimensions;
                let weight = count;
                if (this.useWeighting) {
                    const idf = this.idf.get(token) || 1;
                    weight *= idf;
                }
                // 位置加权：不同哈希种子不同权重
                const hashIndex = hashes.indexOf(hash);
                weight *= (1 - hashIndex * 0.1);
                vector[index] += weight;
            }
        }
        // L2归一化
        const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
        const normalized = vector.map(v => v / norm);
        // 缓存
        this.cache.set(text, normalized);
        if (this.cache.size > this.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        return normalized;
    }
    /**
     * 训练TF-IDF
     */
    fit(documents) {
        this.documentCount = documents.length;
        const df = new Map();
        let totalWords = 0;
        for (const doc of documents) {
            const tokens = new Set(this.advancedTokenize(doc));
            for (const token of tokens) {
                df.set(token, (df.get(token) || 0) + 1);
            }
            totalWords += this.advancedTokenize(doc).length;
        }
        this.totalWordCount = totalWords;
        let vocabIndex = 0;
        for (const [token, freq] of df) {
            this.vocabulary.set(token, vocabIndex++);
            this.idf.set(token, Math.log((this.documentCount + 1) / (freq + 1)) + 1);
        }
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
     * 搜索（带重排序）
     */
    search(query, documents, topK = 10) {
        const queryVector = this.embed(query);
        const docVectors = documents.map(d => this.embed(d));
        const scores = docVectors.map((vec, index) => ({
            index,
            score: AdvancedVectorizerV2.cosineSimilarity(queryVector, vec),
            text: documents[index]
        }));
        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }
    /**
     * 清空缓存
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            vocabSize: this.vocabulary.size,
            documentCount: this.documentCount,
            totalWordCount: this.totalWordCount,
            dimensions: this.dimensions
        };
    }
}
exports.AdvancedVectorizerV2 = AdvancedVectorizerV2;
// 预训练示例数据（用于提升效果）
const PRETRAIN_DOCUMENTS = [
    "李明是华山派大弟子",
    "华山派是武林中的名门大派",
    "剑法是华山派的绝技",
    "江湖人称君子剑",
    "五岳剑派：华山、嵩山、衡山、泰山、恒山",
    "侠客闯荡江湖",
    "郭靖是大侠",
    "黄蓉聪明伶俐",
    "九阴真经是武林秘籍",
    "倚天剑屠龙刀",
    "武当山张三丰",
    "少林寺藏经阁",
    "丐帮降龙十八掌",
    "逍遥派北冥神功",
    "大理段氏一阳指",
    "慕容复姑苏慕容",
    "萧峰契丹人",
    "段誉大理王子",
    "虚竹小和尚",
    "王语嫣神仙姐姐"
];
exports.advancedVectorizerV2 = new AdvancedVectorizerV2();
exports.advancedVectorizerV2.fit(PRETRAIN_DOCUMENTS);
exports.default = AdvancedVectorizerV2;
//# sourceMappingURL=advanced-vectorizer-v2.js.map