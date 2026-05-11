/**
 * 创意中心模块
 * RAG检索增强，支持多工具协作
 */

import { 
  CreativeHubSession, 
  HubMessage, 
  HubTool, 
  HubContext,
  NovelProject,
  Character
} from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import * as fs from 'fs';
import * as path from 'path';

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    type: 'character' | 'world' | 'plot' | 'chapter' | 'theme' | 'event';
    sourceId?: string;
    chapter?: number;
    tags?: string[];
    createdAt: Date;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: RAGDocument;
  score: number;
  highlights: string[];
}

export interface ChunkConfig {
  chunkSize: number;
  chunkOverlap: number;
  minChunkLength: number;
}

export class CreativeHub {
  private sessions: Map<string, CreativeHubSession> = new Map();
  private ragDocuments: Map<string, RAGDocument[]> = new Map();
  private llmManager: LLMManager;
  private storagePath: string;
  private chunkConfig: ChunkConfig = {
    chunkSize: 500,
    chunkOverlap: 100,
    minChunkLength: 50
  };

  constructor(llmManager: LLMManager, storagePath: string = './data/creativehub') {
    this.llmManager = llmManager;
    this.storagePath = storagePath;
  }

  /**
   * 添加文档并自动分块
   */
  async addDocumentWithChunking(
    projectId: string,
    document: Omit<RAGDocument, 'id' | 'embedding'>
  ): Promise<RAGDocument[]> {
    const chunks = this.chunkText(document.content, this.chunkConfig);
    const results: RAGDocument[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkDoc: RAGDocument = {
        id: `${document.metadata.sourceId || 'doc'}_chunk_${i}`,
        content: chunks[i],
        metadata: {
          ...document.metadata,
          tags: [...(document.metadata.tags || []), `chunk:${i + 1}/${chunks.length}`]
        }
      };

      const added = await this.addRAGDocument(projectId, chunkDoc);
      results.push(added);
    }

    return results;
  }

  /**
   * 文本分块
   */
  private chunkText(text: string, config: ChunkConfig): string[] {
    const chunks: string[] = [];
    const sentences = this.splitIntoSentences(text);
    let currentChunk = '';
    let currentLength = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;

      if (currentLength + sentenceLength > config.chunkSize && currentChunk.length > config.minChunkLength) {
        chunks.push(currentChunk.trim());
        
        const words = currentChunk.split('');
        const overlapStart = Math.max(0, words.length - config.chunkOverlap);
        currentChunk = words.slice(overlapStart).join('') + sentence;
        currentLength = currentChunk.length;
      } else {
        currentChunk += sentence;
        currentLength += sentenceLength;
      }
    }

    if (currentChunk.length > config.minChunkLength) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * 句子分割
   */
  private splitIntoSentences(text: string): string[] {
    const sentenceEndings = /[。！？；\n]+/g;
    const sentences: string[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(sentenceEndings)) {
      const sentence = text.substring(lastIndex, match.index! + match[0].length).trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = match.index! + match[0].length;
    }

    const remaining = text.substring(lastIndex).trim();
    if (remaining.length > 0) {
      sentences.push(remaining);
    }

    return sentences;
  }

  /**
   * 生成文本嵌入（模拟向量）
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i + j) % 128;
        embedding[index] += (charCode % 10) / 10;
      }
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
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
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * 增强的RAG搜索
   */
  async enhancedSearch(
    projectId: string,
    query: string,
    options?: {
      topK?: number;
      filters?: {
        types?: RAGDocument['metadata']['type'][];
        tags?: string[];
        chapterRange?: { min?: number; max?: number };
      };
      useHybridSearch?: boolean;
      rerank?: boolean;
    }
  ): Promise<SearchResult[]> {
    const docs = this.ragDocuments.get(projectId) || [];
    const topK = options?.topK || 5;
    const filters = options?.filters;

    let filteredDocs = docs;

    if (filters) {
      if (filters.types?.length) {
        filteredDocs = filteredDocs.filter(d => filters.types!.includes(d.metadata.type));
      }
      if (filters.tags?.length) {
        filteredDocs = filteredDocs.filter(d =>
          filters.tags!.some(tag => d.metadata.tags?.includes(tag))
        );
      }
      if (filters.chapterRange) {
        filteredDocs = filteredDocs.filter(d => {
          const chapter = d.metadata.chapter || 0;
          if (filters.chapterRange?.min !== undefined && chapter < filters.chapterRange.min) return false;
          if (filters.chapterRange?.max !== undefined && chapter > filters.chapterRange.max) return false;
          return true;
        });
      }
    }

    const queryTerms = query.toLowerCase().split(/\s+/);
    const queryEmbedding = await this.generateEmbedding(query);

    const scoredDocs = filteredDocs.map(doc => {
      let score = 0;

      if (options?.useHybridSearch !== false) {
        const textScore = this.calculateTextScore(doc.content, queryTerms);
        const embeddingScore = doc.embedding 
          ? this.cosineSimilarity(queryEmbedding, doc.embedding)
          : 0;
        
        score = textScore * 0.4 + embeddingScore * 0.6;
      } else {
        score = this.calculateTextScore(doc.content, queryTerms);
      }

      const highlights = this.extractHighlights(doc.content, queryTerms);

      return { document: doc, score, highlights };
    });

    let results = scoredDocs
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    if (options?.rerank) {
      results = this.rerankResults(query, results);
    }

    return results.slice(0, topK);
  }

  /**
   * 计算文本相关度分数
   */
  private calculateTextScore(content: string, queryTerms: string[]): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    let matchCount = 0;

    for (const term of queryTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = contentLower.match(regex);
      
      if (matches) {
        matchCount += matches.length;
        
        if (contentLower.startsWith(term)) {
          score += 2;
        } else if (content.includes(term)) {
          score += 1;
        }

        const wordBoundaryBonus = new RegExp(`\\b${term}\\b`, 'gi').test(content) ? 0.5 : 0;
        score += wordBoundaryBonus;
      }
    }

    const lengthPenalty = 1 / Math.log2(content.length + 1);
    score += matchCount * 0.1 * (1 + lengthPenalty);

    return score;
  }

  /**
   * 结果重排序
   */
  private rerankResults(query: string, results: SearchResult[]): SearchResult[] {
    const queryWords = query.split(/\s+/);
    
    return results.sort((a, b) => {
      let scoreDiff = b.score - a.score;

      const aFirstWord = a.document.content.toLowerCase().startsWith(queryWords[0] || '');
      const bFirstWord = b.document.content.toLowerCase().startsWith(queryWords[0] || '');
      if (aFirstWord && !bFirstWord) scoreDiff += 0.1;
      if (bFirstWord && !aFirstWord) scoreDiff -= 0.1;

      const aLength = a.document.content.length;
      const bLength = b.document.content.length;
      if (aLength > 100 && aLength < 1000) scoreDiff += 0.05;
      if (bLength > 100 && bLength < 1000) scoreDiff -= 0.05;

      return scoreDiff;
    });
  }

  /**
   * 批量添加文档
   */
  async batchAddDocuments(
    projectId: string,
    documents: Omit<RAGDocument, 'id'>[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const doc of documents) {
      try {
        await this.addRAGDocument(projectId, doc);
        success++;
      } catch (error: any) {
        failed++;
        errors.push(`${doc.metadata.sourceId || 'unknown'}: ${error.message}`);
      }
    }

    await this.saveRAGDocuments(projectId);
    return { success, failed, errors };
  }

  /**
   * 语义搜索
   */
  async semanticSearch(
    projectId: string,
    query: string,
    intent?: 'character' | 'plot' | 'world' | 'theme'
  ): Promise<SearchResult[]> {
    let typeFilter: RAGDocument['metadata']['type'][] | undefined;
    
    if (intent) {
      switch (intent) {
        case 'character':
          typeFilter = ['character'];
          break;
        case 'plot':
          typeFilter = ['plot', 'chapter', 'event'];
          break;
        case 'world':
          typeFilter = ['world'];
          break;
        case 'theme':
          typeFilter = ['theme'];
          break;
      }
    }

    return this.enhancedSearch(projectId, query, {
      topK: 5,
      filters: typeFilter ? { types: typeFilter } : undefined,
      useHybridSearch: true,
      rerank: true
    });
  }

  /**
   * 获取项目知识库统计
   */
  async getKnowledgeStats(projectId: string): Promise<{
    totalDocuments: number;
    byType: Record<string, number>;
    byChapter: Record<number, number>;
    avgChunkLength: number;
    lastUpdated: Date | null;
  }> {
    const docs = this.ragDocuments.get(projectId) || [];
    
    const byType: Record<string, number> = {};
    const byChapter: Record<number, number> = {};
    let totalLength = 0;
    let lastUpdated: Date | null = null;

    for (const doc of docs) {
      const type = doc.metadata.type;
      byType[type] = (byType[type] || 0) + 1;

      const chapter = doc.metadata.chapter;
      if (chapter !== undefined) {
        byChapter[chapter] = (byChapter[chapter] || 0) + 1;
      }

      totalLength += doc.content.length;

      const docDate = new Date(doc.metadata.createdAt);
      if (!lastUpdated || docDate > lastUpdated) {
        lastUpdated = docDate;
      }
    }

    return {
      totalDocuments: docs.length,
      byType,
      byChapter,
      avgChunkLength: docs.length > 0 ? totalLength / docs.length : 0,
      lastUpdated
    };
  }

  async createSession(projectId: string): Promise<CreativeHubSession> {
    const session: CreativeHubSession = {
      id: this.generateId(),
      projectId,
      messages: [],
      tools: this.getDefaultTools(),
      context: {
        characters: [],
        worldSettings: [],
        pendingTasks: []
      }
    };

    this.sessions.set(session.id, session);
    this.ragDocuments.set(projectId, []);
    
    await this.saveSession(session);
    return session;
  }

  async sendMessage(
    sessionId: string,
    content: string,
    role: HubMessage['role'] = 'user'
  ): Promise<HubMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const message: HubMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date()
    };

    session.messages.push(message);

    if (role === 'user') {
      const context = await this.buildContext(session);
      const contextPrompt = context ? `\n\n参考信息：\n${context}` : '';
      
      const response = await this.llmManager.complete(
        `${content}${contextPrompt}`,
        { task: 'analysis', temperature: 0.7 }
      );

      const assistantMessage: HubMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      session.messages.push(assistantMessage);
      await this.saveSession(session);
      return assistantMessage;
    }

    await this.saveSession(session);
    return message;
  }

  async addTool(sessionId: string, tool: HubTool): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.tools.push(tool);
    await this.saveSession(session);
  }

  async executeTool(sessionId: string, toolName: string, args: any): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const tool = session.tools.find(t => t.name === toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);

    return await tool.execute(args);
  }

  async addRAGDocument(
    projectId: string,
    document: Omit<RAGDocument, 'id'>
  ): Promise<RAGDocument> {
    const doc: RAGDocument = {
      id: this.generateId(),
      ...document,
      metadata: {
        ...document.metadata,
        createdAt: document.metadata.createdAt || new Date()
      }
    };

    doc.embedding = await this.generateEmbedding(doc.content);

    const docs = this.ragDocuments.get(projectId) || [];
    docs.push(doc);
    this.ragDocuments.set(projectId, docs);

    await this.saveRAGDocuments(projectId);
    return doc;
  }

  async addCharacterToRAG(projectId: string, character: Character): Promise<void> {
    const content = `
角色：${character.name}
${character.aliases ? `别名：${character.aliases.join(', ')}` : ''}
${character.gender ? `性别：${character.gender}` : ''}
${character.age ? `年龄：${character.age}` : ''}
${character.appearance ? `外貌：${character.appearance}` : ''}
${character.personality ? `性格：${character.personality}` : ''}
${character.background ? `背景：${character.background}` : ''}
${character.goals ? `目标：${character.goals.join(', ')}` : ''}
${character.abilities ? `能力：${character.abilities.join(', ')}` : ''}
${character.speakingStyle ? `说话风格：${character.speakingStyle}` : ''}
`.trim();

    await this.addRAGDocument(projectId, {
      content,
      metadata: { type: 'character', sourceId: character.id, createdAt: new Date() }
    });
  }

  async addWorldSettingToRAG(projectId: string, setting: any): Promise<void> {
    const content = `
世界观：${setting.name}
题材：${setting.genre}
${setting.powerSystem ? `力量体系：${setting.powerSystem}` : ''}
${setting.rules ? `规则：${setting.rules.join('\n')}` : ''}
${setting.locations ? `地点：${setting.locations.map((l: any) => l.name).join(', ')}` : ''}
${setting.factions ? `势力：${setting.factions.map((f: any) => f.name).join(', ')}` : ''}
`.trim();

    await this.addRAGDocument(projectId, {
      content,
      metadata: { type: 'world', sourceId: setting.id, createdAt: new Date() }
    });
  }

  async searchRAG(projectId: string, query: string, topK: number = 5): Promise<SearchResult[]> {
    return this.enhancedSearch(projectId, query, { topK });
  }

  async buildContext(session: CreativeHubSession): Promise<string> {
    const projectId = session.projectId;
    const recentMessages = session.messages.slice(-5);
    const lastUserMessage = recentMessages.reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) return '';

    const searchResults = await this.searchRAG(projectId, lastUserMessage.content, 3);
    
    if (searchResults.length === 0) return '';

    return searchResults
      .map(r => `[参考] ${r.document.metadata.type.toUpperCase()}\n${r.highlights.join('\n')}`)
      .join('\n\n');
  }

  async updateContext(sessionId: string, updates: Partial<HubContext>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.context = { ...session.context, ...updates };
    await this.saveSession(session);
  }

  async getSession(sessionId: string): Promise<CreativeHubSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async getProjectSessions(projectId: string): Promise<CreativeHubSession[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.projectId === projectId);
  }

  private getDefaultTools(): HubTool[] {
    return [
      {
        name: 'searchCharacter',
        description: '搜索角色信息',
        execute: async (args: { name: string }) => {
          return { found: true, character: args.name };
        }
      },
      {
        name: 'searchWorld',
        description: '搜索世界观设定',
        execute: async (args: { keyword: string }) => {
          return { found: true, setting: args.keyword };
        }
      },
      {
        name: 'getChapterSummary',
        description: '获取章节摘要',
        execute: async (args: { chapterNumber: number }) => {
          return { chapter: args.chapterNumber, summary: '' };
        }
      },
      {
        name: 'suggestPlotTwist',
        description: '建议剧情转折',
        execute: async (args: {}) => {
          return { suggestions: [] };
        }
      },
      {
        name: 'ragSearch',
        description: 'RAG知识库搜索',
        execute: async (args: { query: string; topK?: number }) => {
          const projectId = args.query;
          const results = await this.searchRAG(projectId, args.query, args.topK || 5);
          return results;
        }
      },
      {
        name: 'semanticSearch',
        description: '语义搜索',
        execute: async (args: { query: string; intent?: string }) => {
          const projectId = args.query;
          const intent = args.intent as 'character' | 'plot' | 'world' | 'theme' | undefined;
          const results = await this.semanticSearch(projectId, args.query, intent);
          return results;
        }
      }
    ];
  }

  private extractHighlights(content: string, terms: string[]): string[] {
    const highlights: string[] = [];
    const contentLower = content.toLowerCase();

    for (const term of terms) {
      const index = contentLower.indexOf(term);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(content.length, index + term.length + 30);
        let highlight = content.substring(start, end);
        if (start > 0) highlight = '...' + highlight;
        if (end < content.length) highlight = highlight + '...';
        highlights.push(highlight);
      }
    }

    return highlights.slice(0, 3);
  }

  private async saveSession(session: CreativeHubSession): Promise<void> {
    const dir = path.join(this.storagePath, session.projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dir, `${session.id}.json`),
      JSON.stringify(session, null, 2),
      'utf-8'
    );
  }

  private async saveRAGDocuments(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const docs = this.ragDocuments.get(projectId) || [];
    fs.writeFileSync(
      path.join(dir, 'rag.json'),
      JSON.stringify(docs, null, 2),
      'utf-8'
    );
  }

  private generateId(): string {
    return `hub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CreativeHub;
