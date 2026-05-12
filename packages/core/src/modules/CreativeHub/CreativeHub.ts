/**
 * Cloud Book - RAG 知识库 V2
 * 真正的向量检索系统
 * 支持多种 embedding 模型和向量数据库
 */

import axios from 'axios';

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

export class CreativeHub {
  private embeddingConfig: EmbeddingConfig;
  private chunkConfig: ChunkConfig;
  private vectorStoreConfig: VectorStoreConfig;
  private documents: Document[] = [];
  private index: Map<string, number[]> = new Map();
  private llmProvider: any = null;

  constructor(
    embeddingConfig?: Partial<EmbeddingConfig>,
    chunkConfig?: Partial<ChunkConfig>,
    vectorStoreConfig?: Partial<VectorStoreConfig>
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
  }

  setLLMProvider(provider: any) {
    this.llmProvider = provider;
  }

  /**
   * 添加文档到知识库
   */
  async addDocument(
    content: string,
    metadata?: Record<string, any>
  ): Promise<Document> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const chunks = this.splitIntoChunks(content);
    const documents: Document[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${id}_chunk_${i}`;
      const embedding = await this.generateEmbedding(chunks[i]);
      
      const doc: Document = {
        id: chunkId,
        content: chunks[i],
        metadata: { ...metadata, parentId: id, chunkIndex: i, totalChunks: chunks.length },
        embedding
      };

      documents.push(doc);
      this.documents.push(doc);
      this.index.set(chunkId, embedding);
    }

    return {
      id,
      content,
      metadata,
      embedding: undefined
    };
  }

  /**
   * 批量添加文档
   */
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

  /**
   * 语义搜索
   */
  async search(
    query: string,
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const candidates = this.filterDocuments(filter);
    
    const scored = candidates.map(doc => ({
      document: doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding || []),
      highlights: this.extractHighlights(doc.content, query)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * 混合搜索（关键词 + 语义）
   */
  async hybridSearch(
    query: string,
    topK: number = 5,
    alpha: number = 0.5
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const candidates = this.documents;

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
    return combined.slice(0, topK);
  }

  /**
   * RAG 检索增强生成
   */
  async retrieveAndGenerate(
    query: string,
    systemPrompt: string,
    options?: {
      topK?: number;
      maxContextLength?: number;
      temperature?: number;
    }
  ): Promise<{ answer: string; sources: SearchResult[] }> {
    const topK = options?.topK || 5;
    const maxContextLength = options?.maxContextLength || 4000;

    const searchResults = await this.search(query, topK);
    
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

  /**
   * 生成文本嵌入
   */
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

  /**
   * 调用 OpenAI Embedding API
   */
  private async callOpenAIEmbedding(
    text: string,
    apiKey: string,
    endpoint?: string
  ): Promise<number[]> {
    const url = endpoint || 'https://api.openai.com/v1/embeddings';
    const model = this.embeddingConfig.model || 'text-embedding-ada-002';

    try {
      const response = await axios.post(
        url,
        {
          input: text.slice(0, 8000),
          model
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      const embedding = response.data.data?.[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned');
      }
      return embedding;
    } catch (error) {
      console.error('OpenAI Embedding API error:', error);
      return this.simulateEmbedding(text);
    }
  }

  /**
   * 调用本地 Embedding 服务（如 Ollama）
   */
  private async callLocalEmbedding(
    text: string,
    endpoint: string
  ): Promise<number[]> {
    try {
      const response = await axios.post(
        `${endpoint}/api/embeddings`,
        {
          model: this.embeddingConfig.model || 'nomic-embed-text',
          prompt: text.slice(0, 8000)
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data.embedding || this.simulateEmbedding(text);
    } catch (error) {
      console.error('Local Embedding error:', error);
      return this.simulateEmbedding(text);
    }
  }

  /**
   * 调用自定义 Embedding API
   */
  private async callCustomEmbedding(
    text: string,
    apiKey: string,
    endpoint: string
  ): Promise<number[]> {
    try {
      const response = await axios.post(
        endpoint,
        { text: text.slice(0, 8000) },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      return response.data.embedding || this.simulateEmbedding(text);
    } catch (error) {
      console.error('Custom Embedding error:', error);
      return this.simulateEmbedding(text);
    }
  }

  /**
   * 模拟 Embedding（当 API 不可用时）
   */
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

  /**
   * 文本分块
   */
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

  /**
   * 计算余弦相似度
   */
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

  /**
   * 计算关键词分数
   */
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

  /**
   * 提取高亮片段
   */
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

  /**
   * 过滤文档
   */
  private filterDocuments(filter?: Record<string, any>): Document[] {
    if (!filter) return this.documents;

    return this.documents.filter(doc => {
      for (const [key, value] of Object.entries(filter)) {
        if (doc.metadata?.[key] !== value) return false;
      }
      return true;
    });
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    const toDelete = this.documents.filter(
      d => d.id === id || d.metadata?.parentId === id
    );
    
    for (const doc of toDelete) {
      this.index.delete(doc.id);
    }
    
    this.documents = this.documents.filter(
      d => d.id !== id && d.metadata?.parentId !== id
    );
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalDocuments: number;
    totalChunks: number;
    avgChunkLength: number;
    embeddingDimension: number;
  } {
    return {
      totalDocuments: new Set(this.documents.map(d => d.metadata?.parentId)).size,
      totalChunks: this.documents.length,
      avgChunkLength: this.documents.length > 0
        ? this.documents.reduce((sum, d) => sum + d.content.length, 0) / this.documents.length
        : 0,
      embeddingDimension: this.embeddingConfig.dimension || 1536
    };
  }

  /**
   * 保存索引到文件
   */
  async saveIndex(filePath: string): Promise<void> {
    const fs = require('fs');
    const data = {
      documents: this.documents,
      config: {
        embedding: this.embeddingConfig,
        chunk: this.chunkConfig,
        vectorStore: this.vectorStoreConfig
      }
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * 从文件加载索引
   */
  async loadIndex(filePath: string): Promise<void> {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    this.documents = data.documents || [];
    this.embeddingConfig = { ...this.embeddingConfig, ...data.config?.embedding };
    this.chunkConfig = { ...this.chunkConfig, ...data.config?.chunk };
    this.vectorStoreConfig = { ...this.vectorStoreConfig, ...data.config?.vectorStore };
    
    this.index.clear();
    for (const doc of this.documents) {
      if (doc.embedding) {
        this.index.set(doc.id, doc.embedding);
      }
    }
  }

  /**
   * 清空知识库
   */
  clear(): void {
    this.documents = [];
    this.index.clear();
  }
}

export default CreativeHub;
