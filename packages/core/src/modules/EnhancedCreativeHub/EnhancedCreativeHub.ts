/**
 * Cloud Book - 深度优化 RAG 知识库
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - 多来源知识整合
 * - 本地向量搜索（无网络可用）
 * - 知识图谱关系
 * - 智能引用与溯源
 */

// ============================================
// RAG 系统类型定义
// ============================================

export type KnowledgeSourceType =
  | 'document'        // 普通文档
  | 'web_page'        // 网页
  | 'book'            // 书籍
  | 'article'         // 文章
  | 'world_info'      // 世界设定
  | 'character_bio'   // 人物设定
  | 'reference'       // 参考资料
  | 'style_guide'     // 风格指南
  | 'custom';         // 自定义

export interface KnowledgeSource {
  id: string;
  type: KnowledgeSourceType;
  title: string;
  description?: string;
  url?: string;
  filePath?: string;
  tags: string[];
  language?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  priority: number; // 0-100
  metadata: Record<string, any>;
}

export interface Chunk {
  id: string;
  sourceId: string;
  content: string;
  chunkNumber: number;
  startPosition: number;
  endPosition: number;
  tokens: number;
  keywords: string[];
  topics: string[];
  entities: Entity[];
  vector?: number[];
  summary?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'character' | 'location' | 'item' | 'concept' | 'event' | 'organization';
  description?: string;
  aliases?: string[];
}

export interface EntityRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  description?: string;
  strength: number; // 0-1
}

export interface KnowledgeGraph {
  entities: Map<string, Entity>;
  relationships: EntityRelationship[];
  entityChunks: Map<string, Set<string>>; // entityId -> chunkIds
}

export interface RetrievalQuery {
  text: string;
  context?: RetrievalContext;
  filters?: QueryFilters;
  maxResults: number;
  minRelevance: number; // 0-1
  includeSummary?: boolean;
  includeEntities?: boolean;
  rerank?: boolean;
}

export interface RetrievalContext {
  chapterNumber?: number;
  scene?: string;
  characters?: string[];
  topic?: string;
  currentProject?: string;
  writingMode?: string;
}

export interface QueryFilters {
  sourceTypes?: KnowledgeSourceType[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sourceIds?: string[];
  languages?: string[];
  minTokens?: number;
  maxTokens?: number;
}

export interface RetrievalResult {
  chunk: Chunk;
  source: KnowledgeSource;
  relevance: number;
  similarity: number;
  rerankScore?: number;
  highlight: string;
  context: string;
  entityMatches?: Entity[];
  relatedChunks?: Chunk[];
}

export interface Citation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  chunkId: string;
  position: {
    start: number;
    end: number;
  };
  text: string;
  timestamp: Date;
  confidence: number;
}

export interface KnowledgeSession {
  id: string;
  projectId: string;
  queries: RetrievalQuery[];
  results: RetrievalResult[];
  citations: Citation[];
  entityReferences: Map<string, number>; // entityId -> count
  startTime: Date;
  lastUsed: Date;
}

export interface ChunkingStrategy {
  chunkSize: number;
  chunkOverlap: number;
  chunkBy: 'sentence' | 'paragraph' | 'page' | 'semantic';
  respectBoundaries?: string[];
}

export interface VectorConfig {
  provider: 'memory' | 'qdrant' | 'pinecone' | 'chroma' | 'local';
  dimension: number;
  metric: 'cosine' | 'dot' | 'euclidean';
  config?: Record<string, any>;
}

export interface RAGStatistics {
  totalSources: number;
  totalChunks: number;
  totalEntities: number;
  totalRelationships: number;
  queryCount: number;
  avgRelevance: number;
  avgResponseTime: number;
  cacheHitRate: number;
  sourceUsage: Map<string, number>;
  entityPopularity: Array<{ entity: Entity; count: number }>;
}

// ============================================
// 增强型 CreativeHub (RAG 系统)
// ============================================

export class EnhancedCreativeHub {
  private sources: Map<string, KnowledgeSource> = new Map();
  private chunks: Map<string, Chunk> = new Map();
  private sourceChunks: Map<string, Set<string>> = new Map(); // sourceId -> chunkIds
  private knowledgeGraph: KnowledgeGraph = {
    entities: new Map(),
    relationships: [],
    entityChunks: new Map()
  };
  private sessions: Map<string, KnowledgeSession> = new Map();
  private queryCache: Map<string, { results: RetrievalResult[]; timestamp: Date }> = new Map();
  private defaultChunking: ChunkingStrategy = {
    chunkSize: 512,
    chunkOverlap: 64,
    chunkBy: 'paragraph'
  };
  private vectorConfig: VectorConfig = {
    provider: 'memory',
    dimension: 1536,
    metric: 'cosine'
  };
  private statistics: RAGStatistics = {
    totalSources: 0,
    totalChunks: 0,
    totalEntities: 0,
    totalRelationships: 0,
    queryCount: 0,
    avgRelevance: 0,
    avgResponseTime: 0,
    cacheHitRate: 0,
    sourceUsage: new Map(),
    entityPopularity: []
  };
  
  constructor() {}
  
  // ============================================
  // 知识源管理
  // ============================================
  
  async addSource(
    source: Omit<KnowledgeSource, 'id' | 'createdAt' | 'updatedAt'>,
    content: string,
    options: {
      chunking?: Partial<ChunkingStrategy>;
      extractEntities?: boolean;
      generateSummary?: boolean;
    } = {}
  ): Promise<KnowledgeSource> {
    const newSource: KnowledgeSource = {
      ...source,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      priority: source.priority || 50,
      metadata: source.metadata || {}
    };
    
    this.sources.set(newSource.id, newSource);
    this.statistics.totalSources++;
    
    // 分块处理
    const chunks = await this.chunkContent(newSource.id, content, options.chunking || this.defaultChunking);
    
    // 提取实体
    if (options.extractEntities) {
      await this.extractEntities(chunks, newSource.id);
    }
    
    // 生成摘要
    if (options.generateSummary) {
      await this.generateChunkSummaries(chunks);
    }
    
    // 存储分块
    const sourceChunkIds = new Set<string>();
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
      sourceChunkIds.add(chunk.id);
      this.statistics.totalChunks++;
    }
    this.sourceChunks.set(newSource.id, sourceChunkIds);
    
    // 更新源统计
    this.statistics.sourceUsage.set(newSource.id, 0);
    
    return newSource;
  }
  
  async updateSource(sourceId: string, updates: Partial<KnowledgeSource>): Promise<KnowledgeSource | null> {
    const source = this.sources.get(sourceId);
    if (!source) return null;
    
    const updated: KnowledgeSource = {
      ...source,
      ...updates,
      updatedAt: new Date()
    };
    
    this.sources.set(sourceId, updated);
    return updated;
  }
  
  async deleteSource(sourceId: string): Promise<boolean> {
    const source = this.sources.get(sourceId);
    if (!source) return false;
    
    // 删除相关分块
    const chunkIds = this.sourceChunks.get(sourceId) || new Set();
    for (const chunkId of chunkIds) {
      this.chunks.delete(chunkId);
    }
    
    // 清理知识图谱
    // （简化实现）
    
    this.sources.delete(sourceId);
    this.sourceChunks.delete(sourceId);
    this.statistics.totalSources--;
    this.statistics.totalChunks -= chunkIds.size;
    
    return true;
  }
  
  getSource(sourceId: string): KnowledgeSource | undefined {
    return this.sources.get(sourceId);
  }
  
  getSources(filters?: { type?: KnowledgeSourceType; tags?: string[] }): KnowledgeSource[] {
    let sources = Array.from(this.sources.values());
    
    if (filters?.type) {
      sources = sources.filter(s => s.type === filters.type);
    }
    
    if (filters?.tags?.length) {
      sources = sources.filter(s => filters.tags!.some(t => s.tags.includes(t)));
    }
    
    return sources;
  }
  
  // ============================================
  // 分块与索引
  // ============================================
  
  private async chunkContent(
    sourceId: string,
    content: string,
    strategy: ChunkingStrategy
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = [];
    
    if (strategy.chunkBy === 'paragraph') {
      const paragraphs = content.split(/\n\s*\n/);
      let currentChunk = '';
      let chunkNumber = 0;
      let position = 0;
      
      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > strategy.chunkSize) {
          chunks.push({
            id: this.generateId(),
            sourceId,
            content: currentChunk.trim(),
            chunkNumber,
            startPosition: position - currentChunk.length,
            endPosition: position,
            tokens: Math.ceil(currentChunk.length / 4),
            keywords: this.extractKeywords(currentChunk),
            topics: this.extractTopics(currentChunk),
            entities: []
          });
          chunkNumber++;
          currentChunk = paragraph + '\n\n';
        } else {
          currentChunk += paragraph + '\n\n';
        }
        position += paragraph.length + 2;
      }
      
      if (currentChunk.trim()) {
        chunks.push({
          id: this.generateId(),
          sourceId,
          content: currentChunk.trim(),
          chunkNumber,
          startPosition: position - currentChunk.length,
          endPosition: position,
          tokens: Math.ceil(currentChunk.length / 4),
          keywords: this.extractKeywords(currentChunk),
          topics: this.extractTopics(currentChunk),
          entities: []
        });
      }
    }
    
    return chunks;
  }
  
  private extractKeywords(text: string): string[] {
    // 简单关键词提取
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at']);
    const freq: Map<string, number> = new Map();
    
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        freq.set(word, (freq.get(word) || 0) + 1);
      }
    }
    
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  private extractTopics(text: string): string[] {
    // 简单主题提取
    const keywords = this.extractKeywords(text);
    return keywords.slice(0, 5);
  }
  
  private async extractEntities(chunks: Chunk[], sourceId: string): Promise<void> {
    // 简单实体识别（实际需要 NLP）
    const patterns: { type: Entity['type']; regex: RegExp }[] = [
      { type: 'character', regex: /[A-Z][a-z]+ [A-Z][a-z]+/g }
    ];
    
    for (const chunk of chunks) {
      for (const pattern of patterns) {
        const matches = chunk.content.match(pattern.regex) || [];
        for (const match of matches.slice(0, 5)) {
          const entity: Entity = {
            id: this.generateId(),
            name: match,
            type: pattern.type
          };
          
          if (!this.knowledgeGraph.entities.has(entity.id)) {
            this.knowledgeGraph.entities.set(entity.id, entity);
            this.knowledgeGraph.entityChunks.set(entity.id, new Set());
            this.statistics.totalEntities++;
          }
          
          this.knowledgeGraph.entityChunks.get(entity.id)?.add(chunk.id);
          chunk.entities.push(entity);
        }
      }
    }
  }
  
  private async generateChunkSummaries(chunks: Chunk[]): Promise<void> {
    // 简单摘要生成（实际需要 LLM）
    for (const chunk of chunks) {
      chunk.summary = chunk.content.slice(0, 100) + '...';
    }
  }
  
  // ============================================
  // 搜索与检索
  // ============================================
  
  async search(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    // 检查缓存
    const cacheKey = this.getQueryCacheKey(query);
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
      this.statistics.cacheHitRate = Math.min(1, this.statistics.cacheHitRate + 0.01);
      return cached.results;
    }
    
    // 应用过滤器
    let candidateChunks = Array.from(this.chunks.values());
    if (query.filters) {
      if (query.filters.sourceIds?.length) {
        const allowedChunkIds = new Set<string>();
        for (const sourceId of query.filters.sourceIds) {
          const chunks = this.sourceChunks.get(sourceId) || new Set();
          chunks.forEach(c => allowedChunkIds.add(c));
        }
        candidateChunks = candidateChunks.filter(c => allowedChunkIds.has(c.id));
      }
    }
    
    // 计算相似度
    const results: RetrievalResult[] = [];
    for (const chunk of candidateChunks) {
      const similarity = this.computeSimilarity(query.text, chunk);
      const relevance = this.computeRelevance(query, chunk);
      
      if (similarity >= query.minRelevance) {
        results.push({
          chunk,
          source: this.sources.get(chunk.sourceId)!,
          relevance,
          similarity,
          highlight: this.createHighlight(query.text, chunk.content),
          context: this.buildContext(chunk),
          entityMatches: chunk.entities
        });
      }
    }
    
    // 排序
    results.sort((a, b) => (b.relevance * b.similarity) - (a.relevance * a.similarity));
    
    // 限制结果数量
    const finalResults = results.slice(0, query.maxResults);
    
    // 更新统计
    this.statistics.queryCount++;
    const avgRel = finalResults.reduce((sum, r) => sum + r.relevance, 0) / (finalResults.length || 1);
    this.statistics.avgRelevance = (this.statistics.avgRelevance + avgRel) / 2;
    this.statistics.avgResponseTime = (this.statistics.avgResponseTime + (Date.now() - startTime)) / 2;
    
    // 更新源使用
    for (const result of finalResults) {
      const current = this.statistics.sourceUsage.get(result.source.id) || 0;
      this.statistics.sourceUsage.set(result.source.id, current + 1);
    }
    
    // 缓存
    this.queryCache.set(cacheKey, {
      results: finalResults,
      timestamp: new Date()
    });
    
    return finalResults;
  }
  
  private computeSimilarity(queryText: string, chunk: Chunk): number {
    // 简化的关键词匹配相似度
    const queryKeywords = new Set(queryText.toLowerCase().split(/\W+/));
    const chunkKeywords = new Set(chunk.keywords);
    
    let intersection = 0;
    for (const kw of queryKeywords) {
      if (chunkKeywords.has(kw)) intersection++;
    }
    
    const union = queryKeywords.size + chunkKeywords.size - intersection;
    return union > 0 ? intersection / union : 0;
  }
  
  private computeRelevance(query: RetrievalQuery, chunk: Chunk): number {
    let relevance = this.computeSimilarity(query.text, chunk);
    
    // 源优先级
    const source = this.sources.get(chunk.sourceId);
    if (source) {
      relevance *= 0.7 + 0.3 * (source.priority / 100);
    }
    
    return Math.min(1, relevance);
  }
  
  private createHighlight(query: string, content: string): string {
    // 简单高亮
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) {
      return content.slice(0, 200) + '...';
    }
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);
    
    return '...' + content.slice(start, end) + '...';
  }
  
  private buildContext(chunk: Chunk): string {
    // 构建周围上下文
    const contextPieces: string[] = [];
    
    const source = this.sources.get(chunk.sourceId);
    if (source) {
      contextPieces.push(`Source: ${source.title}`);
    }
    
    if (chunk.entities.length) {
      contextPieces.push(`Entities: ${chunk.entities.map(e => e.name).join(', ')}`);
    }
    
    return contextPieces.join(' | ');
  }
  
  private getQueryCacheKey(query: RetrievalQuery): string {
    return JSON.stringify({
      text: query.text,
      filters: query.filters,
      maxResults: query.maxResults
    });
  }
  
  // ============================================
  // 知识图谱
  // ============================================
  
  getRelatedEntities(entityId: string): Array<{ entity: Entity; relationship: EntityRelationship }> {
    const relationships = this.knowledgeGraph.relationships.filter(
      r => r.fromEntityId === entityId || r.toEntityId === entityId
    );
    
    return relationships.map(r => ({
      entity: this.knowledgeGraph.entities.get(r.fromEntityId === entityId ? r.toEntityId : r.fromEntityId)!,
      relationship: r
    }));
  }
  
  getEntityOccurrences(entityId: string): Chunk[] {
    const chunkIds = this.knowledgeGraph.entityChunks.get(entityId) || new Set();
    return Array.from(chunkIds).map(id => this.chunks.get(id)!).filter(Boolean);
  }
  
  // ============================================
  // 引用管理
  // ============================================
  
  async createCitation(
    result: RetrievalResult,
    text: string,
    position: { start: number; end: number }
  ): Promise<Citation> {
    const citation: Citation = {
      id: this.generateId(),
      sourceId: result.source.id,
      sourceTitle: result.source.title,
      chunkId: result.chunk.id,
      position,
      text,
      timestamp: new Date(),
      confidence: result.relevance
    };
    
    // 更新实体引用
    for (const entity of result.entityMatches || []) {
      const current = (this.statistics.entityPopularity.find(e => e.entity.id === entity.id)?.count) || 0;
      if (!this.statistics.entityPopularity.find(e => e.entity.id === entity.id)) {
        this.statistics.entityPopularity.push({ entity, count: 0 });
      }
      const entry = this.statistics.entityPopularity.find(e => e.entity.id === entity.id)!;
      entry.count = current + 1;
    }
    
    return citation;
  }
  
  // ============================================
  // 会话管理
  // ============================================
  
  async startSession(projectId: string): Promise<KnowledgeSession> {
    const session: KnowledgeSession = {
      id: this.generateId(),
      projectId,
      queries: [],
      results: [],
      citations: [],
      entityReferences: new Map(),
      startTime: new Date(),
      lastUsed: new Date()
    };
    
    this.sessions.set(session.id, session);
    return session;
  }
  
  async addToSession(sessionId: string, query: RetrievalQuery, results: RetrievalResult[]): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.queries.push(query);
    session.results.push(...results);
    session.lastUsed = new Date();
  }
  
  // ============================================
  // 统计与分析
  // ============================================
  
  getStatistics(): RAGStatistics {
    return { ...this.statistics };
  }
  
  getRecommendations(context: RetrievalContext): RetrievalResult[] {
    // 基于上下文的推荐
    const recommendations: RetrievalResult[] = [];
    
    // 推荐热门实体相关内容
    const topEntities = this.statistics.entityPopularity.slice(0, 5);
    for (const { entity } of topEntities) {
      const chunks = this.getEntityOccurrences(entity.id);
      for (const chunk of chunks.slice(0, 1)) {
        const source = this.sources.get(chunk.sourceId);
        if (source) {
          recommendations.push({
            chunk,
            source,
            relevance: 0.5 + entity.id.length * 0.01,
            similarity: 0.6,
            highlight: chunk.content.slice(0, 150) + '...',
            context: `Popular entity: ${entity.name}`,
            entityMatches: [entity]
          });
        }
      }
    }
    
    return recommendations;
  }
  
  // ============================================
  // 辅助方法
  // ============================================
  
  private generateId(): string {
    return `rag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default EnhancedCreativeHub;
