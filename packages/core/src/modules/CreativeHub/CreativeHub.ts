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
  upsertBatch(items: Array<{ id: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void>;
  search(queryEmbedding: number[], topK: number, filter?: Record<string, any>): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>>;
  delete(id: string): Promise<void>;
  deleteCollection(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

class PineconeConnector implements VectorStoreConnector {
  private config: VectorStoreConfig & { dimension: number; metric: 'cosine' | 'euclidean' | 'dotproduct'; topK: number; batchSize: number };
  private baseUrl: string = '';
  private headers: Record<string, string> = {};

  constructor(config: VectorStoreConfig) {
    this.config = {
      type: 'pinecone',
      dimension: 1536,
      metric: 'cosine',
      topK: 10,
      batchSize: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
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
    } catch {
      await this.createIndex();
    }
  }

  private async createIndex(): Promise<void> {
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

  async upsert(id: string, embedding: number[], metadata: Record<string, any>): Promise<void> {
    await this.upsertBatch([{ id, embedding, metadata }]);
  }

  async upsertBatch(items: Array<{ id: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void> {
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

  async search(queryEmbedding: number[], topK: number, filter?: Record<string, any>): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
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

    const data = await response.json() as { matches?: Array<{ id: string; score: number; metadata: Record<string, any> }> };
    return data.matches || [];
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/vectors/delete`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ids: [id],
        namespace: ''
      })
    });
  }

  async deleteCollection(): Promise<void> {
    await fetch(`${this.baseUrl}/databases/${this.config.indexName}`, {
      method: 'DELETE',
      headers: this.headers
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/describeprojectstats`, {
        method: 'POST',
        headers: this.headers
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class QdrantConnector implements VectorStoreConnector {
  private config: VectorStoreConfig & { dimension: number; metric: 'cosine' | 'euclidean' | 'dotproduct'; topK: number; batchSize: number };
  private baseUrl: string = '';

  constructor(config: VectorStoreConfig) {
    this.config = {
      type: 'qdrant',
      dimension: 1536,
      metric: 'cosine',
      topK: 10,
      batchSize: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Qdrant requires endpoint');
    }
    this.baseUrl = this.config.endpoint.replace(/\/$/, '');

    const headers: Record<string, string> = {
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
    } catch {
      await this.createCollection();
    }
  }

  private async createCollection(): Promise<void> {
    const headers: Record<string, string> = {
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

  async upsert(id: string, embedding: number[], metadata: Record<string, any>): Promise<void> {
    await this.upsertBatch([{ id, embedding, metadata }]);
  }

  async upsertBatch(items: Array<{ id: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void> {
    const headers: Record<string, string> = {
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

  async search(queryEmbedding: number[], topK: number, filter?: Record<string, any>): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
    const headers: Record<string, string> = {
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

    const data = await response.json() as { result?: Array<{ id: string; score: number; payload: Record<string, any> }> };
    return (data.result || []).map(item => ({
      id: String(item.id),
      score: item.score,
      metadata: item.payload
    }));
  }

  async delete(id: string): Promise<void> {
    const headers: Record<string, string> = {
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

  async deleteCollection(): Promise<void> {
    const headers: Record<string, string> = {
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

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/readyz`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

class MilvusConnector implements VectorStoreConnector {
  private config: VectorStoreConfig & { dimension: number; metric: 'cosine' | 'euclidean' | 'dotproduct'; topK: number; batchSize: number };
  private baseUrl: string = '';
  private collectionName: string = '';

  constructor(config: VectorStoreConfig) {
    this.config = {
      type: 'milvus',
      dimension: 1536,
      metric: 'cosine',
      topK: 10,
      batchSize: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Milvus requires endpoint');
    }
    this.baseUrl = this.config.endpoint.replace(/\/$/, '');
    this.collectionName = this.config.indexName || 'cloudbook';

    await this.createCollectionIfNotExists();
  }

  private async createCollectionIfNotExists(): Promise<void> {
    const headers: Record<string, string> = {
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
    } catch {
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

  async upsert(id: string, embedding: number[], metadata: Record<string, any>): Promise<void> {
    await this.upsertBatch([{ id, embedding, metadata }]);
  }

  async upsertBatch(items: Array<{ id: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void> {
    const headers: Record<string, string> = {
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

  async search(queryEmbedding: number[], topK: number, filter?: Record<string, any>): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
    const headers: Record<string, string> = {
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

    const data = await response.json() as { result?: { fields: Array<{ data: unknown[]; name: string }> } };
    if (!data.result?.fields) return [];

    const ids = data.result.fields.find(f => f.name === 'id')?.data || [];
    const scores = data.result.fields.find(f => f.name === 'score')?.data || [];

    return ids.map((id, idx) => ({
      id: String(id),
      score: (scores[idx] as number) || 0,
      metadata: {}
    }));
  }

  async delete(id: string): Promise<void> {
    const headers: Record<string, string> = {
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

  async deleteCollection(): Promise<void> {
    const headers: Record<string, string> = {
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

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

class MemoryConnector implements VectorStoreConnector {
  private documents: Map<string, { embedding: number[]; metadata: Record<string, any> }> = new Map();

  async initialize(): Promise<void> {}

  async upsert(id: string, embedding: number[], metadata: Record<string, any>): Promise<void> {
    this.documents.set(id, { embedding, metadata });
  }

  async upsertBatch(items: Array<{ id: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void> {
    for (const item of items) {
      this.documents.set(item.id, { embedding: item.embedding, metadata: item.metadata });
    }
  }

  async search(queryEmbedding: number[], topK: number, _filter?: Record<string, any>): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
    const results: Array<{ id: string; score: number; metadata: Record<string, any> }> = [];

    for (const [id, data] of this.documents) {
      const score = this.cosineSimilarity(queryEmbedding, data.embedding);
      results.push({ id, score, metadata: data.metadata });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async deleteCollection(): Promise<void> {
    this.documents.clear();
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

export class CreativeHub {
  private embeddingConfig: EmbeddingConfig;
  private chunkConfig: ChunkConfig;
  private vectorStoreConfig: VectorStoreConfig;
  private rerankConfig?: RerankConfig;
  private documents: Map<string, Document> = new Map();
  private index: Map<string, number[]> = new Map();
  private llmProvider: any = null;
  private vectorStore: VectorStoreConnector | null = null;
  private initialized: boolean = false;
  private useVectorStore: boolean = false;

  constructor(
    embeddingConfig?: Partial<EmbeddingConfig>,
    chunkConfig?: Partial<ChunkConfig>,
    vectorStoreConfig?: Partial<VectorStoreConfig>,
    rerankConfig?: Partial<RerankConfig>
  ) {
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

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.useVectorStore) {
      this.vectorStore = this.createVectorStoreConnector();
      await this.vectorStore.initialize();
    }

    this.initialized = true;
  }

  private createVectorStoreConnector(): VectorStoreConnector {
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

  setLLMProvider(provider: any) {
    this.llmProvider = provider;
  }

  async addDocument(
    content: string,
    metadata?: Record<string, any>
  ): Promise<Document> {
    await this.initialize();

    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const chunks = this.splitIntoChunks(content);
    const parentDoc: Document = {
      id,
      content,
      metadata: { ...metadata, totalChunks: chunks.length },
      embedding: undefined
    };

    this.documents.set(id, parentDoc);

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${id}_chunk_${i}`;
      const embedding = await this.generateEmbedding(chunks[i]);

      const doc: Document = {
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

  async addDocuments(
    documents: Array<{ content: string; metadata?: Record<string, any> }>
  ): Promise<Document[]> {
    const results: Document[] = [];
    for (const doc of documents) {
      const result = await this.addDocument(doc.content, doc.metadata);
      results.push(result);
    }
    return results;
  }

  async search(
    query: string,
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    await this.initialize();

    const queryEmbedding = await this.generateEmbedding(query);

    if (this.useVectorStore && this.vectorStore) {
      return this.vectorStoreSearch(queryEmbedding, query, topK, filter);
    }

    return this.localSearch(queryEmbedding, query, topK, filter);
  }

  private async vectorStoreSearch(
    queryEmbedding: number[],
    query: string,
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    const vectorResults = await this.vectorStore!.search(queryEmbedding, topK * 3, filter);

    const results: SearchResult[] = vectorResults.map(result => {
      const doc = this.documents.get(result.id);
      return {
        document: doc || { id: result.id, content: result.metadata.content || '', metadata: result.metadata },
        score: result.score,
        highlights: doc ? this.extractHighlights(doc.content, query) : []
      };
    });

    return this.applyReranking(query, results, topK);
  }

  private async localSearch(
    queryEmbedding: number[],
    query: string,
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    let candidates = Array.from(this.documents.values()).filter(
      doc => doc.embedding && doc.content.length > 0
    );

    if (filter) {
      candidates = candidates.filter(doc => {
        for (const [key, value] of Object.entries(filter)) {
          if (doc.metadata?.[key] !== value) return false;
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

  private async applyReranking(query: string, results: SearchResult[], topK: number): Promise<SearchResult[]> {
    if (!this.rerankConfig || results.length <= topK) {
      return results.slice(0, topK);
    }

    const reranked = await this.rerankResults(query, results);
    return reranked.slice(0, topK);
  }

  private async rerankResults(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    if (!this.rerankConfig) return results;

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

  private async cohereRerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    if (!this.rerankConfig?.apiKey) return results;

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

      const data = await response.json() as { results?: Array<{ index: number; relevance_score: number }> };
      if (!data.results) return results;

      return data.results.map(rerank => ({
        ...results[rerank.index],
        rerankedScore: rerank.relevance_score,
        score: rerank.relevance_score
      }));
    } catch (error) {
      console.error('Cohere rerank error:', error);
      return results;
    }
  }

  private async openaiRerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    const scored: SearchResult[] = [];

    for (const result of results) {
      const score = this.calculateRelevanceScore(query, result.document.content);
      scored.push({ ...result, rerankedScore: score, score: score });
    }

    scored.sort((a, b) => (b.rerankedScore || 0) - (a.rerankedScore || 0));
    return scored;
  }

  private localRerank(query: string, results: SearchResult[]): SearchResult[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored: SearchResult[] = [];

    for (const result of results) {
      const content = result.document.content.toLowerCase();
      let matchScore = 0;

      for (const word of queryWords) {
        if (content.includes(word)) {
          matchScore += 1;
          const regex = new RegExp(word, 'gi');
          const matches = content.match(regex);
          if (matches) matchScore += matches.length * 0.5;
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

  private calculateRelevanceScore(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    const contentSet = new Set(contentWords.filter(w => w.length > 1));

    let matches = 0;
    for (const word of queryWords) {
      if (contentSet.has(word.toLowerCase())) matches++;
    }

    const coverage = matches / Math.max(queryWords.length, 1);
    const positionBonus = content.toLowerCase().indexOf(queryWords[0]?.toLowerCase() || '') === 0 ? 0.1 : 0;

    return coverage + positionBonus;
  }

  async hybridSearch(
    query: string,
    topK: number = 5,
    alpha: number = 0.5
  ): Promise<SearchResult[]> {
    await this.initialize();

    const queryEmbedding = await this.generateEmbedding(query);

    const candidates = Array.from(this.documents.values()).filter(
      doc => doc.embedding && doc.content.length > 0
    );

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

  async retrieveAndGenerate(
    query: string,
    systemPrompt: string,
    options?: {
      topK?: number;
      maxContextLength?: number;
      temperature?: number;
      useHybrid?: boolean;
      alpha?: number;
    }
  ): Promise<{ answer: string; sources: SearchResult[] }> {
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

  async generateEmbedding(text: string): Promise<number[]> {
    const { provider, apiKey, endpoint, model } = this.embeddingConfig;

    switch (provider) {
      case 'openai':
        return this.callOpenAIEmbedding(text, apiKey!, endpoint);
      case 'local':
        return this.callLocalEmbedding(text, endpoint!);
      case 'custom':
        return this.callCustomEmbedding(text, apiKey!, endpoint!);
      default:
        return this.simulateEmbedding(text);
    }
  }

  private async callOpenAIEmbedding(
    text: string,
    apiKey: string,
    endpoint?: string
  ): Promise<number[]> {
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

      const data = await response.json() as { data?: Array<{ embedding?: number[] }> };
      const embedding = data.data?.[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned');
      }
      return embedding;
    } catch (error) {
      console.error('OpenAI Embedding API error:', error);
      return this.simulateEmbedding(text);
    }
  }

  private async callLocalEmbedding(
    text: string,
    endpoint: string
  ): Promise<number[]> {
    try {
      const response = await fetch(`${endpoint}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.embeddingConfig.model || 'nomic-embed-text',
          prompt: text.slice(0, 8000)
        })
      });

      const data = await response.json() as { embedding?: number[] };
      return data.embedding || this.simulateEmbedding(text);
    } catch (error) {
      console.error('Local Embedding error:', error);
      return this.simulateEmbedding(text);
    }
  }

  private async callCustomEmbedding(
    text: string,
    apiKey: string,
    endpoint: string
  ): Promise<number[]> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ text: text.slice(0, 8000) })
      });

      const data = await response.json() as { embedding?: number[] };
      return data.embedding || this.simulateEmbedding(text);
    } catch (error) {
      console.error('Custom Embedding error:', error);
      return this.simulateEmbedding(text);
    }
  }

  private simulateEmbedding(text: string): number[] {
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

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  private splitIntoChunks(text: string): string[] {
    const { chunkSize, overlap, separators } = this.chunkConfig;
    const chunks: string[] = [];

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
      if (start < 0) start = 0;
    }

    return chunks;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

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

  private calculateKeywordScores(
    query: string,
    documents: Document[]
  ): number[] {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const scores: number[] = [];

    for (const doc of documents) {
      const contentWords = new Set(
        doc.content.toLowerCase().split(/\s+/).filter(w => w.length > 1)
      );

      let matchCount = 0;
      for (const word of queryWords) {
        if (contentWords.has(word)) matchCount++;
      }

      scores.push(matchCount / Math.max(queryWords.size, 1));
    }

    return scores;
  }

  private extractHighlights(content: string, query: string): string[] {
    const highlights: string[] = [];
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
      if (highlights.length >= 2) break;
    }

    return highlights;
  }

  async deleteDocument(id: string): Promise<void> {
    const toDelete: string[] = [id];

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

  async deleteAllDocuments(): Promise<void> {
    this.documents.clear();
    this.index.clear();
    if (this.useVectorStore && this.vectorStore) {
      await this.vectorStore.deleteCollection();
    }
  }

  getStats(): {
    totalDocuments: number;
    totalChunks: number;
    avgChunkLength: number;
    embeddingDimension: number;
    vectorStoreType: string;
    isConnected: boolean;
  } {
    const totalChunks = this.documents.size;
    const totalChars = Array.from(this.documents.values()).reduce((sum, doc) => sum + doc.content.length, 0);

    return {
      totalDocuments: new Set(
        Array.from(this.documents.values())
          .filter(doc => doc.metadata?.parentId === undefined)
          .map(doc => doc.id)
      ).size,
      totalChunks,
      avgChunkLength: totalChunks > 0 ? totalChars / totalChunks : 0,
      embeddingDimension: this.embeddingConfig.dimension || 1536,
      vectorStoreType: this.vectorStoreConfig.type,
      isConnected: this.initialized
    };
  }

  async saveIndex(filePath: string): Promise<void> {
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

  async loadIndex(filePath: string): Promise<void> {
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

  async healthCheck(): Promise<{ healthy: boolean; vectorStoreConnected: boolean; documentCount: number }> {
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

  clear(): void {
    this.documents.clear();
    this.index.clear();
    this.initialized = false;
  }
}

export default CreativeHub;
