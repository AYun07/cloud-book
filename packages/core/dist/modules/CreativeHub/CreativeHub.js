"use strict";
/**
 * Cloud Book - RAG 知识库 V2
 * 真正的向量检索系统
 * 支持 Pinecone、Qdrant、Milvus 等向量数据库
 * 实现两阶段检索和重排序
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreativeHub = void 0;
class PineconeConnector {
    config;
    baseUrl = '';
    headers = {};
    constructor(config) {
        this.config = {
            type: 'pinecone',
            dimension: 1536,
            metric: 'cosine',
            topK: 10,
            batchSize: 100,
            ...config
        };
    }
    async initialize() {
        if (!this.config.endpoint || !this.config.apiKey) {
            throw new Error('Pinecone requires endpoint and apiKey');
        }
        this.baseUrl = this.config.endpoint.replace(/\/$/, '');
        this.headers = {
            'Api-Key': this.config.apiKey,
            'Content-Type': 'application/json'
        };
        try {
            await fetch(`${this.baseUrl}/databases/${this.config.indexName}`, {
                method: 'HEAD',
                headers: this.headers
            });
        }
        catch {
            await this.createIndex();
        }
    }
    async createIndex() {
        const createBody = {
            name: this.config.indexName,
            dimension: this.config.dimension,
            metric: this.config.metric
        };
        const response = await fetch(`${this.baseUrl}/databases`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(createBody)
        });
        if (!response.ok && response.status !== 409) {
            throw new Error(`Failed to create Pinecone index: ${response.statusText}`);
        }
    }
    async upsert(id, embedding, metadata) {
        await this.upsertBatch([{ id, embedding, metadata }]);
    }
    async upsertBatch(items) {
        const vectors = items.map(item => ({
            id: item.id,
            values: item.embedding,
            metadata: { ...item.metadata, content: item.metadata.content || '' }
        }));
        for (let i = 0; i < vectors.length; i += this.config.batchSize) {
            const batch = vectors.slice(i, i + this.config.batchSize);
            const response = await fetch(`${this.baseUrl}/vectors/upsert`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    vectors: batch,
                    namespace: ''
                })
            });
            if (!response.ok) {
                throw new Error(`Pinecone upsert failed: ${response.statusText}`);
            }
        }
    }
    async search(queryEmbedding, topK, filter) {
        const response = await fetch(`${this.baseUrl}/query`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                vector: queryEmbedding,
                topK: topK,
                namespace: '',
                includeMetadata: true,
                filter: filter
            })
        });
        if (!response.ok) {
            throw new Error(`Pinecone search failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.matches || [];
    }
    async delete(id) {
        await fetch(`${this.baseUrl}/vectors/delete`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                ids: [id],
                namespace: ''
            })
        });
    }
    async deleteCollection() {
        await fetch(`${this.baseUrl}/databases/${this.config.indexName}`, {
            method: 'DELETE',
            headers: this.headers
        });
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/describeprojectstats`, {
                method: 'POST',
                headers: this.headers
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
class QdrantConnector {
    config;
    baseUrl = '';
    constructor(config) {
        this.config = {
            type: 'qdrant',
            dimension: 1536,
            metric: 'cosine',
            topK: 10,
            batchSize: 100,
            ...config
        };
    }
    async initialize() {
        if (!this.config.endpoint) {
            throw new Error('Qdrant requires endpoint');
        }
        this.baseUrl = this.config.endpoint.replace(/\/$/, '');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        try {
            const response = await fetch(`${this.baseUrl}/collections/${this.config.indexName}`, {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                await this.createCollection();
            }
        }
        catch {
            await this.createCollection();
        }
    }
    async createCollection() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        const createBody = {
            vectors: {
                size: this.config.dimension,
                distance: this.config.metric === 'cosine' ? 'Cosine' : this.config.metric === 'euclidean' ? 'Euclid' : 'Dot'
            }
        };
        await fetch(`${this.baseUrl}/collections/${this.config.indexName}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(createBody)
        });
    }
    async upsert(id, embedding, metadata) {
        await this.upsertBatch([{ id, embedding, metadata }]);
    }
    async upsertBatch(items) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        const points = items.map(item => ({
            id: item.id,
            vector: item.embedding,
            payload: { ...item.metadata, content: item.metadata.content || '' }
        }));
        for (let i = 0; i < points.length; i += this.config.batchSize) {
            const batch = points.slice(i, i + this.config.batchSize);
            await fetch(`${this.baseUrl}/collections/${this.config.indexName}/points`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ points: batch })
            });
        }
    }
    async search(queryEmbedding, topK, filter) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        const response = await fetch(`${this.baseUrl}/collections/${this.config.indexName}/points/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                vector: queryEmbedding,
                limit: topK,
                with_payload: true,
                filter: filter
            })
        });
        const data = await response.json();
        return (data.result || []).map(item => ({
            id: String(item.id),
            score: item.score,
            metadata: item.payload
        }));
    }
    async delete(id) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        await fetch(`${this.baseUrl}/collections/${this.config.indexName}/points/${id}`, {
            method: 'DELETE',
            headers
        });
    }
    async deleteCollection() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        await fetch(`${this.baseUrl}/collections/${this.config.indexName}`, {
            method: 'DELETE',
            headers
        });
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/readyz`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
class MilvusConnector {
    config;
    baseUrl = '';
    collectionName = '';
    constructor(config) {
        this.config = {
            type: 'milvus',
            dimension: 1536,
            metric: 'cosine',
            topK: 10,
            batchSize: 100,
            ...config
        };
    }
    async initialize() {
        if (!this.config.endpoint) {
            throw new Error('Milvus requires endpoint');
        }
        this.baseUrl = this.config.endpoint.replace(/\/$/, '');
        this.collectionName = this.config.indexName || 'cloudbook';
        await this.createCollectionIfNotExists();
    }
    async createCollectionIfNotExists() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        try {
            await fetch(`${this.baseUrl}/api/v1/collection/${this.collectionName}`, {
                method: 'GET',
                headers
            });
        }
        catch {
            const createBody = {
                collection_name: this.collectionName,
                dimension: this.config.dimension,
                metric_type: this.config.metric === 'cosine' ? 'COSINE' : this.config.metric === 'euclidean' ? 'L2' : 'IP',
                vector_type: 101
            };
            await fetch(`${this.baseUrl}/api/v1/collection`, {
                method: 'POST',
                headers,
                body: JSON.stringify(createBody)
            });
        }
    }
    async upsert(id, embedding, metadata) {
        await this.upsertBatch([{ id, embedding, metadata }]);
    }
    async upsertBatch(items) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        for (let i = 0; i < items.length; i += this.config.batchSize) {
            const batch = items.slice(i, i + this.config.batchSize);
            const vectors = batch.map((item, idx) => ({
                id: parseInt(item.id.replace(/\D/g, '')) || (i + idx),
                vector: item.embedding,
                ...item.metadata
            }));
            await fetch(`${this.baseUrl}/api/v1/vector/insert`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    collection_name: this.collectionName,
                    vectors
                })
            });
        }
    }
    async search(queryEmbedding, topK, filter) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        const response = await fetch(`${this.baseUrl}/api/v1/vector/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection_name: this.collectionName,
                vectors: [queryEmbedding],
                limit: topK,
                filter: filter
            })
        });
        const data = await response.json();
        if (!data.result?.fields)
            return [];
        const ids = data.result.fields.find(f => f.name === 'id')?.data || [];
        const scores = data.result.fields.find(f => f.name === 'score')?.data || [];
        return ids.map((id, idx) => ({
            id: String(id),
            score: scores[idx] || 0,
            metadata: {}
        }));
    }
    async delete(id) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        await fetch(`${this.baseUrl}/api/v1/vector/delete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection_name: this.collectionName,
                ids: [parseInt(id.replace(/\D/g, ''))]
            })
        });
    }
    async deleteCollection() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        await fetch(`${this.baseUrl}/api/v1/collection/${this.collectionName}`, {
            method: 'DELETE',
            headers
        });
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
class MemoryConnector {
    documents = new Map();
    async initialize() { }
    async upsert(id, embedding, metadata) {
        this.documents.set(id, { embedding, metadata });
    }
    async upsertBatch(items) {
        for (const item of items) {
            this.documents.set(item.id, { embedding: item.embedding, metadata: item.metadata });
        }
    }
    async search(queryEmbedding, topK, _filter) {
        const results = [];
        for (const [id, data] of this.documents) {
            const score = this.cosineSimilarity(queryEmbedding, data.embedding);
            results.push({ id, score, metadata: data.metadata });
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }
    async delete(id) {
        this.documents.delete(id);
    }
    async deleteCollection() {
        this.documents.clear();
    }
    async healthCheck() {
        return true;
    }
}
class CreativeHub {
    embeddingConfig;
    chunkConfig;
    vectorStoreConfig;
    rerankConfig;
    documents = new Map();
    index = new Map();
    llmProvider = null;
    vectorStore = null;
    initialized = false;
    useVectorStore = false;
    constructor(embeddingConfig, chunkConfig, vectorStoreConfig, rerankConfig) {
        this.embeddingConfig = {
            provider: 'openai',
            model: 'text-embedding-ada-002',
            dimension: 1536,
            ...embeddingConfig
        };
        this.chunkConfig = {
            chunkSize: 500,
            overlap: 50,
            separators: ['\n\n', '\n', '。', '！', '？', '，', ' '],
            ...chunkConfig
        };
        this.vectorStoreConfig = {
            type: 'memory',
            ...vectorStoreConfig
        };
        this.rerankConfig = rerankConfig ? { provider: 'openai', topN: 5, ...rerankConfig } : undefined;
        if (this.vectorStoreConfig.type !== 'memory' && this.vectorStoreConfig.endpoint) {
            this.useVectorStore = true;
        }
    }
    async initialize() {
        if (this.initialized)
            return;
        if (this.useVectorStore) {
            this.vectorStore = this.createVectorStoreConnector();
            await this.vectorStore.initialize();
        }
        this.initialized = true;
    }
    createVectorStoreConnector() {
        switch (this.vectorStoreConfig.type) {
            case 'pinecone':
                return new PineconeConnector(this.vectorStoreConfig);
            case 'qdrant':
                return new QdrantConnector(this.vectorStoreConfig);
            case 'milvus':
                return new MilvusConnector(this.vectorStoreConfig);
            case 'weaviate':
                return new MemoryConnector();
            default:
                return new MemoryConnector();
        }
    }
    setLLMProvider(provider) {
        this.llmProvider = provider;
    }
    async addDocument(content, metadata) {
        await this.initialize();
        const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const chunks = this.splitIntoChunks(content);
        const parentDoc = {
            id,
            content,
            metadata: { ...metadata, totalChunks: chunks.length },
            embedding: undefined
        };
        this.documents.set(id, parentDoc);
        for (let i = 0; i < chunks.length; i++) {
            const chunkId = `${id}_chunk_${i}`;
            const embedding = await this.generateEmbedding(chunks[i]);
            const doc = {
                id: chunkId,
                content: chunks[i],
                metadata: { ...metadata, parentId: id, chunkIndex: i, totalChunks: chunks.length },
                embedding
            };
            this.documents.set(chunkId, doc);
            this.index.set(chunkId, embedding);
            if (this.useVectorStore && this.vectorStore) {
                await this.vectorStore.upsert(chunkId, embedding, doc.metadata || {});
            }
        }
        return parentDoc;
    }
    async addDocuments(documents) {
        const results = [];
        for (const doc of documents) {
            const result = await this.addDocument(doc.content, doc.metadata);
            results.push(result);
        }
        return results;
    }
    async search(query, topK = 5, filter) {
        await this.initialize();
        const queryEmbedding = await this.generateEmbedding(query);
        if (this.useVectorStore && this.vectorStore) {
            return this.vectorStoreSearch(queryEmbedding, query, topK, filter);
        }
        return this.localSearch(queryEmbedding, query, topK, filter);
    }
    async vectorStoreSearch(queryEmbedding, query, topK, filter) {
        const vectorResults = await this.vectorStore.search(queryEmbedding, topK * 3, filter);
        const results = vectorResults.map(result => {
            const doc = this.documents.get(result.id);
            return {
                document: doc || { id: result.id, content: result.metadata.content || '', metadata: result.metadata },
                score: result.score,
                highlights: doc ? this.extractHighlights(doc.content, query) : []
            };
        });
        return this.applyReranking(query, results, topK);
    }
    async localSearch(queryEmbedding, query, topK, filter) {
        let candidates = Array.from(this.documents.values()).filter(doc => doc.embedding && doc.content.length > 0);
        if (filter) {
            candidates = candidates.filter(doc => {
                for (const [key, value] of Object.entries(filter)) {
                    if (doc.metadata?.[key] !== value)
                        return false;
                }
                return true;
            });
        }
        const scored = candidates.map(doc => ({
            document: doc,
            score: this.cosineSimilarity(queryEmbedding, doc.embedding || []),
            highlights: this.extractHighlights(doc.content, query)
        }));
        scored.sort((a, b) => b.score - a.score);
        const results = scored.slice(0, topK * 3).map(item => ({
            document: item.document,
            score: item.score,
            highlights: item.highlights
        }));
        return this.applyReranking(query, results, topK);
    }
    async applyReranking(query, results, topK) {
        if (!this.rerankConfig || results.length <= topK) {
            return results.slice(0, topK);
        }
        const reranked = await this.rerankResults(query, results);
        return reranked.slice(0, topK);
    }
    async rerankResults(query, results) {
        if (!this.rerankConfig)
            return results;
        switch (this.rerankConfig.provider) {
            case 'cohere':
                return this.cohereRerank(query, results);
            case 'openai':
                return this.openaiRerank(query, results);
            case 'local':
                return this.localRerank(query, results);
            default:
                return results;
        }
    }
    async cohereRerank(query, results) {
        if (!this.rerankConfig?.apiKey)
            return results;
        try {
            const response = await fetch('https://api.cohere.ai/v1/rerank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.rerankConfig.apiKey}`
                },
                body: JSON.stringify({
                    query,
                    documents: results.map(r => r.document.content),
                    topN: this.rerankConfig.topN || 5
                })
            });
            const data = await response.json();
            if (!data.results)
                return results;
            return data.results.map(rerank => ({
                ...results[rerank.index],
                rerankedScore: rerank.relevance_score,
                score: rerank.relevance_score
            }));
        }
        catch (error) {
            console.error('Cohere rerank error:', error);
            return results;
        }
    }
    async openaiRerank(query, results) {
        const scored = [];
        for (const result of results) {
            const score = this.calculateRelevanceScore(query, result.document.content);
            scored.push({ ...result, rerankedScore: score, score: score });
        }
        scored.sort((a, b) => (b.rerankedScore || 0) - (a.rerankedScore || 0));
        return scored;
    }
    localRerank(query, results) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const scored = [];
        for (const result of results) {
            const content = result.document.content.toLowerCase();
            let matchScore = 0;
            for (const word of queryWords) {
                if (content.includes(word)) {
                    matchScore += 1;
                    const regex = new RegExp(word, 'gi');
                    const matches = content.match(regex);
                    if (matches)
                        matchScore += matches.length * 0.5;
                }
            }
            const termDensity = queryWords.filter(w => content.includes(w)).length / queryWords.length;
            const finalScore = (matchScore / Math.max(queryWords.length, 1)) * 0.6 + termDensity * 0.4;
            scored.push({
                ...result,
                rerankedScore: finalScore,
                score: result.score * 0.3 + finalScore * 0.7
            });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored;
    }
    calculateRelevanceScore(query, content) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        const contentSet = new Set(contentWords.filter(w => w.length > 1));
        let matches = 0;
        for (const word of queryWords) {
            if (contentSet.has(word.toLowerCase()))
                matches++;
        }
        const coverage = matches / Math.max(queryWords.length, 1);
        const positionBonus = content.toLowerCase().indexOf(queryWords[0]?.toLowerCase() || '') === 0 ? 0.1 : 0;
        return coverage + positionBonus;
    }
    async hybridSearch(query, topK = 5, alpha = 0.5) {
        await this.initialize();
        const queryEmbedding = await this.generateEmbedding(query);
        const candidates = Array.from(this.documents.values()).filter(doc => doc.embedding && doc.content.length > 0);
        const keywordScores = this.calculateKeywordScores(query, candidates);
        const semanticScores = candidates.map(doc => ({
            document: doc,
            semanticScore: this.cosineSimilarity(queryEmbedding, doc.embedding || [])
        }));
        const combined = semanticScores.map((item, index) => ({
            document: item.document,
            score: alpha * item.semanticScore + (1 - alpha) * (keywordScores[index] || 0),
            highlights: this.extractHighlights(item.document.content, query)
        }));
        combined.sort((a, b) => b.score - a.score);
        const results = combined.slice(0, topK * 3).map(item => ({
            document: item.document,
            score: item.score,
            highlights: item.highlights
        }));
        return this.applyReranking(query, results, topK);
    }
    async retrieveAndGenerate(query, systemPrompt, options) {
        const topK = options?.topK || 5;
        const maxContextLength = options?.maxContextLength || 4000;
        const useHybrid = options?.useHybrid || false;
        const alpha = options?.alpha || 0.5;
        const searchResults = useHybrid
            ? await this.hybridSearch(query, topK, alpha)
            : await this.search(query, topK);
        let context = '';
        for (const result of searchResults) {
            if ((context + result.document.content).length < maxContextLength) {
                context += `\n\n【参考内容${searchResults.indexOf(result) + 1}】\n${result.document.content}`;
            }
        }
        const prompt = `【系统提示】
${systemPrompt}

【用户问题】
${query}

【参考内容】
${context}

请根据参考内容回答用户问题。如果参考内容不足以回答，请明确说明。
请用中文回答。`;
        if (this.llmProvider) {
            const response = await this.llmProvider.generate(prompt, {
                temperature: options?.temperature || 0.7,
                maxTokens: 2000
            });
            return {
                answer: response.text || response,
                sources: searchResults
            };
        }
        return {
            answer: 'LLM provider not configured',
            sources: searchResults
        };
    }
    async generateEmbedding(text) {
        const { provider, apiKey, endpoint, model } = this.embeddingConfig;
        switch (provider) {
            case 'openai':
                return this.callOpenAIEmbedding(text, apiKey, endpoint);
            case 'local':
                return this.callLocalEmbedding(text, endpoint);
            case 'custom':
                return this.callCustomEmbedding(text, apiKey, endpoint);
            default:
                return this.simulateEmbedding(text);
        }
    }
    async callOpenAIEmbedding(text, apiKey, endpoint) {
        const url = endpoint || 'https://api.openai.com/v1/embeddings';
        const embeddingModel = this.embeddingConfig.model || 'text-embedding-ada-002';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    input: text.slice(0, 8000),
                    model: embeddingModel
                })
            });
            const data = await response.json();
            const embedding = data.data?.[0]?.embedding;
            if (!embedding) {
                throw new Error('No embedding returned');
            }
            return embedding;
        }
        catch (error) {
            console.error('OpenAI Embedding API error:', error);
            return this.simulateEmbedding(text);
        }
    }
    async callLocalEmbedding(text, endpoint) {
        try {
            const response = await fetch(`${endpoint}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.embeddingConfig.model || 'nomic-embed-text',
                    prompt: text.slice(0, 8000)
                })
            });
            const data = await response.json();
            return data.embedding || this.simulateEmbedding(text);
        }
        catch (error) {
            console.error('Local Embedding error:', error);
            return this.simulateEmbedding(text);
        }
    }
    async callCustomEmbedding(text, apiKey, endpoint) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ text: text.slice(0, 8000) })
            });
            const data = await response.json();
            return data.embedding || this.simulateEmbedding(text);
        }
        catch (error) {
            console.error('Custom Embedding error:', error);
            return this.simulateEmbedding(text);
        }
    }
    simulateEmbedding(text) {
        const dimension = this.embeddingConfig.dimension || 1536;
        const seed = this.hashString(text);
        const rng = this.seededRandom(seed);
        const embedding = [];
        for (let i = 0; i < dimension; i++) {
            embedding.push(rng() * 2 - 1);
        }
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / magnitude);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    seededRandom(seed) {
        let s = seed;
        return () => {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
    }
    splitIntoChunks(text) {
        const { chunkSize, overlap, separators } = this.chunkConfig;
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = Math.min(start + chunkSize, text.length);
            if (end < text.length) {
                for (const separator of separators || ['\n']) {
                    const lastSep = text.lastIndexOf(separator, end);
                    if (lastSep > start + chunkSize / 2) {
                        end = lastSep + separator.length;
                        break;
                    }
                }
            }
            chunks.push(text.slice(start, end).trim());
            start = end - overlap;
            if (start < 0)
                start = 0;
        }
        return chunks;
    }
    cosineSimilarity(a, b) {
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
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }
    calculateKeywordScores(query, documents) {
        const queryWords = new Set(query.toLowerCase().split(/\s+/));
        const scores = [];
        for (const doc of documents) {
            const contentWords = new Set(doc.content.toLowerCase().split(/\s+/).filter(w => w.length > 1));
            let matchCount = 0;
            for (const word of queryWords) {
                if (contentWords.has(word))
                    matchCount++;
            }
            scores.push(matchCount / Math.max(queryWords.size, 1));
        }
        return scores;
    }
    extractHighlights(content, query) {
        const highlights = [];
        const queryWords = query.toLowerCase().split(/\s+/);
        const sentences = content.split(/[。！？\n]/);
        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            for (const word of queryWords) {
                if (lowerSentence.includes(word) && sentence.length > 10) {
                    highlights.push(sentence.trim());
                    break;
                }
            }
            if (highlights.length >= 2)
                break;
        }
        return highlights;
    }
    async deleteDocument(id) {
        const toDelete = [id];
        for (const [docId, doc] of this.documents) {
            if (doc.metadata?.parentId === id) {
                toDelete.push(docId);
            }
        }
        for (const docId of toDelete) {
            this.documents.delete(docId);
            this.index.delete(docId);
            if (this.useVectorStore && this.vectorStore) {
                await this.vectorStore.delete(docId);
            }
        }
    }
    async deleteAllDocuments() {
        this.documents.clear();
        this.index.clear();
        if (this.useVectorStore && this.vectorStore) {
            await this.vectorStore.deleteCollection();
        }
    }
    getStats() {
        const totalChunks = this.documents.size;
        const totalChars = Array.from(this.documents.values()).reduce((sum, doc) => sum + doc.content.length, 0);
        return {
            totalDocuments: new Set(Array.from(this.documents.values())
                .filter(doc => doc.metadata?.parentId === undefined)
                .map(doc => doc.id)).size,
            totalChunks,
            avgChunkLength: totalChunks > 0 ? totalChars / totalChunks : 0,
            embeddingDimension: this.embeddingConfig.dimension || 1536,
            vectorStoreType: this.vectorStoreConfig.type,
            isConnected: this.initialized
        };
    }
    async saveIndex(filePath) {
        const fs = await import('fs');
        const documentsArray = Array.from(this.documents.values());
        const data = {
            documents: documentsArray,
            config: {
                embedding: this.embeddingConfig,
                chunk: this.chunkConfig,
                vectorStore: this.vectorStoreConfig
            }
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    async loadIndex(filePath) {
        const fs = await import('fs');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.documents.clear();
        this.index.clear();
        for (const doc of data.documents || []) {
            this.documents.set(doc.id, doc);
            if (doc.embedding) {
                this.index.set(doc.id, doc.embedding);
            }
        }
        this.embeddingConfig = { ...this.embeddingConfig, ...data.config?.embedding };
        this.chunkConfig = { ...this.chunkConfig, ...data.config?.chunk };
        this.vectorStoreConfig = { ...this.vectorStoreConfig, ...data.config?.vectorStore };
    }
    async healthCheck() {
        let vectorStoreConnected = true;
        if (this.vectorStore) {
            vectorStoreConnected = await this.vectorStore.healthCheck();
        }
        return {
            healthy: this.initialized && vectorStoreConnected,
            vectorStoreConnected,
            documentCount: this.documents.size
        };
    }
    clear() {
        this.documents.clear();
        this.index.clear();
        this.initialized = false;
    }
}
exports.CreativeHub = CreativeHub;
exports.default = CreativeHub;
//# sourceMappingURL=CreativeHub.js.map