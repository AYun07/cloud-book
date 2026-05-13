/**
 * 记忆管理器
 * 记忆、作者笔记和系统提示分类管理
 * 集成AdvancedVectorizerV2进行语义搜索
 * 支持真正的对话历史压缩算法
 */

import { Memory } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import { AdvancedVectorizerV2 } from '../../config/advanced-vectorizer-v2.js';

export interface MemoryContext {
  recentChapters?: number;
  characterStates?: Record<string, any>;
  plotProgress?: string;
  emotionalTone?: string;
}

export interface CompressionConfig {
  maxMemories: number;
  compressionThreshold: number;
  summaryLength: number;
  preserveRecentCount: number;
  priorityWeights: {
    high: number;
    medium: number;
    low: number;
    keyword: number;
    recent: number;
    emotional: number;
  };
}

export interface CompressedSegment {
  type: 'summary' | 'key_event' | 'character_moment' | 'plot_twist';
  content: string;
  importance: number;
  keywords: string[];
  chapterRange?: { start: number; end: number };
  timestamp?: number;
}

export interface CompressionResult {
  compressed: Memory[];
  removed: number;
  summary: string;
  segments: CompressedSegment[];
}

const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxMemories: 50,
  compressionThreshold: 0.6,
  summaryLength: 500,
  preserveRecentCount: 10,
  priorityWeights: {
    high: 30,
    medium: 20,
    low: 5,
    keyword: 25,
    recent: 20,
    emotional: 15
  }
};

export class MemoryManager {
  private memories: Map<string, Memory[]> = new Map();
  private authorNotes: Map<string, Memory[]> = new Map();
  private systemPrompts: Map<string, Memory[]> = new Map();
  private storagePath: string;
  private vectorizer: AdvancedVectorizerV2;
  private compressionConfig: CompressionConfig;
  private compressionMetadata: Map<string, {
    lastCompression: number;
    compressionCount: number;
    totalCompressions: number;
  }> = new Map();

  constructor(storagePath: string = './data/memory', config?: Partial<CompressionConfig>) {
    this.storagePath = storagePath;
    this.vectorizer = new AdvancedVectorizerV2();
    this.compressionConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config };
  }

  async initialize(projectId: string): Promise<void> {
    this.memories.set(projectId, []);
    this.authorNotes.set(projectId, []);
    this.systemPrompts.set(projectId, []);
    this.compressionMetadata.set(projectId, {
      lastCompression: 0,
      compressionCount: 0,
      totalCompressions: 0
    });
  }

  async addMemory(projectId: string, content: string, type: Memory['type'] = 'memory'): Promise<Memory> {
    const memory: Memory = {
      id: this.generateId(),
      content,
      type
    };

    switch (type) {
      case 'memory':
        const memories = this.memories.get(projectId) || [];
        memories.push(memory);
        this.memories.set(projectId, memories);
        break;
      case 'authorsNote':
        const notes = this.authorNotes.get(projectId) || [];
        notes.push(memory);
        this.authorNotes.set(projectId, notes);
        break;
      case 'systemPrompt':
        const prompts = this.systemPrompts.get(projectId) || [];
        prompts.push(memory);
        this.systemPrompts.set(projectId, prompts);
        break;
    }

    await this.save(projectId);
    return memory;
  }

  async updateMemory(projectId: string, memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const allMemories = await this.getAllMemories(projectId);
    const index = allMemories.findIndex(m => m.id === memoryId);
    if (index === -1) return null;

    const memory = allMemories[index];
    const updated = { ...memory, ...updates };

    switch (memory.type) {
      case 'memory':
        const memories = this.memories.get(projectId) || [];
        const memIndex = memories.findIndex(m => m.id === memoryId);
        if (memIndex !== -1) memories[memIndex] = updated;
        this.memories.set(projectId, memories);
        break;
      case 'authorsNote':
        const notes = this.authorNotes.get(projectId) || [];
        const noteIndex = notes.findIndex(m => m.id === memoryId);
        if (noteIndex !== -1) notes[noteIndex] = updated;
        this.authorNotes.set(projectId, notes);
        break;
      case 'systemPrompt':
        const prompts = this.systemPrompts.get(projectId) || [];
        const promptIndex = prompts.findIndex(m => m.id === memoryId);
        if (promptIndex !== -1) prompts[promptIndex] = updated;
        this.systemPrompts.set(projectId, prompts);
        break;
    }

    await this.save(projectId);
    return updated;
  }

  async deleteMemory(projectId: string, memoryId: string): Promise<boolean> {
    const allMemories = await this.getAllMemories(projectId);
    const memory = allMemories.find(m => m.id === memoryId);
    if (!memory) return false;

    switch (memory.type) {
      case 'memory':
        const memories = (this.memories.get(projectId) || []).filter(m => m.id !== memoryId);
        this.memories.set(projectId, memories);
        break;
      case 'authorsNote':
        const notes = (this.authorNotes.get(projectId) || []).filter(m => m.id !== memoryId);
        this.authorNotes.set(projectId, notes);
        break;
      case 'systemPrompt':
        const prompts = (this.systemPrompts.get(projectId) || []).filter(m => m.id !== memoryId);
        this.systemPrompts.set(projectId, prompts);
        break;
    }

    await this.save(projectId);
    return true;
  }

  async getMemories(projectId: string): Promise<Memory[]> {
    return this.memories.get(projectId) || [];
  }

  async getAuthorNotes(projectId: string): Promise<Memory[]> {
    return this.authorNotes.get(projectId) || [];
  }

  async getSystemPrompts(projectId: string): Promise<Memory[]> {
    return this.systemPrompts.get(projectId) || [];
  }

  async getAllMemories(projectId: string): Promise<Memory[]> {
    return [
      ...(this.memories.get(projectId) || []),
      ...(this.authorNotes.get(projectId) || []),
      ...(this.systemPrompts.get(projectId) || [])
    ];
  }

  async getRelevantMemories(projectId: string, context: MemoryContext): Promise<Memory[]> {
    const allMemories = await this.getAllMemories(projectId);
    
    const scoredMemories: Array<{ memory: Memory; score: number }> = [];
    
    for (const memory of allMemories) {
      let score = 0;
      
      switch (memory.type) {
        case 'systemPrompt':
          score = 100;
          break;
          
        case 'memory':
          score = this.calculateMemoryScore(memory, context);
          break;
          
        case 'authorsNote':
          score = this.calculateAuthorsNoteScore(memory, context);
          break;
      }
      
      if (score > 0) {
        scoredMemories.push({ memory, score });
      }
    }
    
    scoredMemories.sort((a, b) => b.score - a.score);
    
    const limit = context.recentChapters || 20;
    return scoredMemories.slice(0, limit).map(sm => sm.memory);
  }
  
  private calculateMemoryScore(memory: Memory, context: MemoryContext): number {
    let score = 50;
    
    if (!memory.metadata) return score;
    
    if (context.recentChapters !== undefined) {
      const memoryChapter = memory.metadata.chapterNumber || 0;
      const relevance = Math.max(0, 1 - (context.recentChapters - memoryChapter) / context.recentChapters);
      score += relevance * 30;
    }
    
    if (context.plotProgress && memory.metadata.keywords) {
      const keywords = context.plotProgress.toLowerCase().split(/[,\s]+/);
      const hasMatch = memory.metadata.keywords.some((kw: string) => 
        keywords.some(k => k.includes(kw.toLowerCase()) || kw.includes(kw.toLowerCase()))
      );
      if (hasMatch) score += 20;
    }
    
    if (context.emotionalTone && memory.metadata.emotionalTone) {
      if (memory.metadata.emotionalTone === context.emotionalTone) {
        score += 15;
      } else {
        const oppositeTones: Record<string, string> = {
          'happy': 'sad', 'sad': 'happy',
          'tense': 'relaxed', 'relaxed': 'tense',
          'angry': 'calm', 'calm': 'angry'
        };
        if (oppositeTones[memory.metadata.emotionalTone] === context.emotionalTone) {
          score -= 10;
        }
      }
    }
    
    if (context.characterStates) {
      for (const [charName, state] of Object.entries(context.characterStates)) {
        if (memory.content.includes(charName) && state) {
          score += 10;
          if (memory.metadata.characterStates?.[charName] === state) {
            score += 5;
          }
        }
      }
    }
    
    if (memory.metadata.priority === 'high') {
      score += 20;
    } else if (memory.metadata.priority === 'low') {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateAuthorsNoteScore(memory: Memory, context: MemoryContext): number {
    let score = 30;
    
    if (!context.characterStates && !context.emotionalTone && !context.plotProgress) {
      return score;
    }
    
    if (context.characterStates) {
      for (const charName of Object.keys(context.characterStates)) {
        if (memory.content.includes(charName)) {
          score += 25;
        }
      }
    }
    
    if (context.emotionalTone) {
      const emotionalKeywords: Record<string, string[]> = {
        'happy': ['幸福', '快乐', '开心', '高兴', '喜悦'],
        'sad': ['悲伤', '难过', '伤心', '痛苦', '绝望'],
        'tense': ['紧张', '担忧', '焦虑', '不安', '害怕'],
        'relaxed': ['放松', '舒适', '悠闲', '平静', '宁静'],
        'angry': ['愤怒', '生气', '恼火', '怨恨', '不满']
      };
      
      const keywords = emotionalKeywords[context.emotionalTone] || [];
      const hasEmotion = keywords.some(kw => memory.content.includes(kw));
      if (hasEmotion) score += 30;
    }
    
    if (context.plotProgress && memory.metadata?.scope === 'global') {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  async buildMemoryContext(projectId: string, context: MemoryContext = {}): Promise<string> {
    const parts: string[] = [];
    
    const systemPrompts = await this.getSystemPrompts(projectId);
    if (systemPrompts.length > 0) {
      parts.push('=== System Prompts ===');
      parts.push(...systemPrompts.map(p => p.content));
    }
    
    const relevantMemories = await this.getRelevantMemories(projectId, context);
    if (relevantMemories.length > 0) {
      parts.push('\n=== Memories ===');
      parts.push(...relevantMemories.map(m => m.content));
    }
    
    const authorNotes = await this.getAuthorNotes(projectId);
    if (authorNotes.length > 0) {
      parts.push('\n=== Author Notes ===');
      parts.push(...authorNotes.map(n => n.content));
    }
    
    return parts.join('\n');
  }

  private extractKeywords(text: string, topN: number = 10): string[] {
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
      '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall'
    ]);

    const words = text
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));

    const wordFreq: Map<string, number> = new Map();
    for (const word of words) {
      const lower = word.toLowerCase();
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
    }

    const totalWords = words.length || 1;
    const tfidfScores: Array<{ word: string; score: number }> = [];

    wordFreq.forEach((freq, word) => {
      const tf = freq / totalWords;
      const idf = 1 + Math.log((this.memories.size + 1) / (1 + 1));
      tfidfScores.push({ word, score: tf * idf * freq });
    });

    tfidfScores.sort((a, b) => b.score - a.score);
    return tfidfScores.slice(0, topN).map(item => item.word);
  }

  private classifySegmentType(memory: Memory): CompressedSegment['type'] {
    const content = memory.content.toLowerCase();
    const plotKeywords = ['转折', '揭露', '发现', '背叛', 'reveal', 'twist', 'betrayal', 'discovery'];
    const characterKeywords = ['感受', '心情', '成长', '改变', 'feel', 'grow', 'change', 'emotion'];
    const eventKeywords = ['发生', '事件', '行动', '做了', 'happened', 'action', 'event'];

    for (const kw of plotKeywords) {
      if (content.includes(kw)) return 'plot_twist';
    }
    for (const kw of characterKeywords) {
      if (content.includes(kw)) return 'character_moment';
    }
    for (const kw of eventKeywords) {
      if (content.includes(kw)) return 'key_event';
    }
    return 'summary';
  }

  private calculateSegmentImportance(memory: Memory): number {
    const weights = this.compressionConfig.priorityWeights;
    let importance = 50;

    if (memory.metadata?.priority === 'high') {
      importance += weights.high;
    } else if (memory.metadata?.priority === 'low') {
      importance += weights.low;
    } else {
      importance += weights.medium;
    }

    if (memory.metadata?.keywords?.length > 0) {
      importance += weights.keyword * Math.min(memory.metadata.keywords.length / 5, 1);
    }

    if (memory.metadata?.chapterNumber) {
      importance += weights.recent * (1 - (memory.metadata.chapterNumber / 100));
    }

    if (memory.metadata?.emotionalTone) {
      importance += weights.emotional;
    }

    return Math.min(100, Math.max(0, importance));
  }

  private rankMemoriesForCompression(memories: Memory[]): Array<{ memory: Memory; rank: number }> {
    const scored = memories.map(memory => ({
      memory,
      score: this.calculateSegmentImportance(memory)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.map((item, index) => ({
      memory: item.memory,
      rank: 100 - index
    }));
  }

  private extractSummary(memories: Memory[], maxLength: number): { summary: string; segments: CompressedSegment[] } {
    const segments: CompressedSegment[] = [];
    const ranked = this.rankMemoriesForCompression(memories);

    for (const { memory, rank } of ranked) {
      const segmentType = this.classifySegmentType(memory);
      const keywords = memory.metadata?.keywords || this.extractKeywords(memory.content, 5);

      segments.push({
        type: segmentType,
        content: memory.content,
        importance: rank,
        keywords,
        chapterRange: memory.metadata?.chapterNumber
          ? { start: memory.metadata.chapterNumber, end: memory.metadata.chapterNumber }
          : undefined,
        timestamp: memory.metadata?.createdAt 
          ? memory.metadata.createdAt.getTime() 
          : Date.now()
      });
    }

    segments.sort((a, b) => {
      if (a.type === 'plot_twist' && b.type !== 'plot_twist') return -1;
      if (b.type === 'plot_twist' && a.type !== 'plot_twist') return 1;
      return b.importance - a.importance;
    });

    const highPrioritySegments = segments.filter(s => s.importance > 70);
    const mediumPrioritySegments = segments.filter(s => s.importance >= 40 && s.importance <= 70);

    const summaryParts: string[] = [];

    if (highPrioritySegments.length > 0) {
      summaryParts.push('【重要事件】');
      for (const seg of highPrioritySegments.slice(0, 5)) {
        summaryParts.push(`• ${seg.content.substring(0, 200)}${seg.content.length > 200 ? '...' : ''}`);
      }
    }

    if (mediumPrioritySegments.length > 0) {
      summaryParts.push('\n【一般事件】');
      for (const seg of mediumPrioritySegments.slice(0, 3)) {
        summaryParts.push(`• ${seg.content.substring(0, 150)}${seg.content.length > 150 ? '...' : ''}`);
      }
    }

    const summary = summaryParts.join('\n');
    const truncatedSummary = summary.length > maxLength
      ? summary.substring(0, maxLength - 50) + '...(已压缩)'
      : summary;

    return { summary: truncatedSummary, segments };
  }

  private async incrementalCompress(
    memories: Memory[],
    preservedIndices: Set<number>
  ): Promise<Memory[]> {
    const preserved: Memory[] = [];
    const toCompress: Memory[] = [];

    memories.forEach((mem, idx) => {
      if (preservedIndices.has(idx)) {
        preserved.push(mem);
      } else {
        toCompress.push(mem);
      }
    });

    if (toCompress.length === 0) {
      return preserved;
    }

    const { summary, segments } = this.extractSummary(
      toCompress,
      this.compressionConfig.summaryLength
    );

    const compressedMemory: Memory = {
      id: this.generateId(),
      content: `[压缩摘要 ${toCompress.length}条记忆]:\n${summary}`,
      type: 'memory',
      metadata: {
        keywords: this.extractKeywords(summary, 10),
        priority: 'normal',
        createdAt: new Date(),
        importance: 50
      }
    };

    (compressedMemory.metadata as any).compressedFrom = toCompress.length;
    (compressedMemory.metadata as any).segments = segments.map(s => ({
      type: s.type,
      importance: s.importance,
      keywords: s.keywords
    }));

    return [...preserved, compressedMemory];
  }

  async consolidateMemories(
    projectId: string,
    options?: {
      forceFullCompression?: boolean;
      preserveRecent?: number;
      customSummary?: string;
    }
  ): Promise<CompressionResult> {
    const memories = await this.getMemories(projectId);
    const { forceFullCompression, preserveRecent, customSummary } = options || {};

    const preserveCount = preserveRecent ?? this.compressionConfig.preserveRecentCount;

    let compressed: Memory[];
    let removed: number;
    let summary: string;
    let segments: CompressedSegment[];

    if (memories.length <= this.compressionConfig.maxMemories && !forceFullCompression) {
      return {
        compressed: memories,
        removed: 0,
        summary: customSummary || '无需压缩，记忆数量在限制范围内',
        segments: []
      };
    }

    const metadata = this.compressionMetadata.get(projectId) || {
      lastCompression: 0,
      compressionCount: 0,
      totalCompressions: 0
    };
    metadata.lastCompression = Date.now();
    metadata.compressionCount++;
    metadata.totalCompressions++;
    this.compressionMetadata.set(projectId, metadata);

    if (forceFullCompression || memories.length > this.compressionConfig.maxMemories * 2) {
      const { summary: extractedSummary, segments: extractedSegments } = this.extractSummary(
        memories,
        this.compressionConfig.summaryLength
      );

      const recentMemories = memories.slice(-preserveCount);
      const oldMemories = memories.slice(0, -preserveCount);

      const { summary: oldSummary } = this.extractSummary(
        oldMemories,
        this.compressionConfig.summaryLength
      );

      const consolidatedSummary = customSummary || `${extractedSummary}\n\n【历史摘要】\n${oldSummary}`;

      const highPriorityMemories: Memory[] = [];
      const regularMemories: Memory[] = [];

      for (const mem of recentMemories) {
        if (mem.metadata?.priority === 'high') {
          highPriorityMemories.push(mem);
        } else {
          regularMemories.push(mem);
        }
      }

      const ranked = this.rankMemoriesForCompression(regularMemories);
      const importantCount = Math.min(
        Math.ceil(preserveCount * 0.5),
        this.compressionConfig.maxMemories - highPriorityMemories.length
      );

      const preservedIndices = new Set<number>();
      for (const { memory, rank } of ranked) {
        if (preservedIndices.size >= importantCount) break;
        if (rank > 60) {
          const idx = recentMemories.indexOf(memory);
          if (idx !== -1) preservedIndices.add(idx);
        }
      }

      const additionalPreserved = recentMemories
        .map((m, i) => ({ memory: m, index: i }))
        .filter(({ index }) => !preservedIndices.has(index))
        .slice(0, preserveCount - importantCount)
        .map(({ index }) => index);

      additionalPreserved.forEach(idx => preservedIndices.add(idx));
      highPriorityMemories.forEach(hp => {
        const idx = recentMemories.indexOf(hp);
        if (idx !== -1) preservedIndices.add(idx);
      });

      compressed = await this.incrementalCompress(memories, preservedIndices);
      removed = memories.length - compressed.length;
      summary = consolidatedSummary;
      segments = extractedSegments;

    } else {
      const preservedIndices = new Set<number>();
      for (let i = memories.length - preserveCount; i < memories.length; i++) {
        preservedIndices.add(i);
      }

      const ranked = this.rankMemoriesForCompression(memories.slice(0, -preserveCount));
      const additionalPreserve = Math.min(
        this.compressionConfig.maxMemories - preserveCount,
        ranked.filter(r => r.rank > 70).length
      );

      ranked
        .filter(r => r.rank > 70)
        .slice(0, additionalPreserve)
        .forEach(r => {
          const idx = memories.indexOf(r.memory);
          if (idx !== -1) preservedIndices.add(idx);
        });

      compressed = await this.incrementalCompress(memories, preservedIndices);
      removed = memories.length - compressed.length;

      const { summary: extractedSummary, segments: extractedSegments } = this.extractSummary(
        memories.filter((_, i) => !preservedIndices.has(i)),
        this.compressionConfig.summaryLength
      );
      summary = customSummary || extractedSummary;
      segments = extractedSegments;
    }

    this.memories.set(projectId, compressed);
    await this.save(projectId);

    return { compressed, removed, summary, segments };
  }

  async shouldCompress(projectId: string): Promise<boolean> {
    const memories = await this.getMemories(projectId);
    const ratio = memories.length / this.compressionConfig.maxMemories;
    return ratio >= this.compressionConfig.compressionThreshold;
  }

  getCompressionStats(projectId: string): {
    memoryCount: number;
    lastCompression: number | null;
    compressionCount: number;
    totalCompressions: number;
  } {
    const memories = this.memories.get(projectId) || [];
    const metadata = this.compressionMetadata.get(projectId);

    return {
      memoryCount: memories.length,
      lastCompression: metadata?.lastCompression || null,
      compressionCount: metadata?.compressionCount || 0,
      totalCompressions: metadata?.totalCompressions || 0
    };
  }

  async searchMemories(projectId: string, query: string, limit: number = 10): Promise<Memory[]> {
    const allMemories = await this.getAllMemories(projectId);
    if (allMemories.length === 0) return [];
    
    const texts = allMemories.map(m => m.content);
    const results = this.vectorizer.search(query, texts, limit);
    
    return results.map(result => {
      const memory = allMemories.find(m => m.content === result.text);
      return memory ? { ...memory, score: result.score } : null;
    }).filter(Boolean) as (Memory & { score?: number })[];
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      memories: this.memories.get(projectId) || [],
      authorNotes: this.authorNotes.get(projectId) || [],
      systemPrompts: this.systemPrompts.get(projectId) || [],
      compressionMetadata: this.compressionMetadata.get(projectId)
    };

    fs.writeFileSync(
      path.join(dir, 'memory.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  async load(projectId: string): Promise<void> {
    const filePath = path.join(this.storagePath, projectId, 'memory.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.memories.set(projectId, data.memories || []);
      this.authorNotes.set(projectId, data.authorNotes || []);
      this.systemPrompts.set(projectId, data.systemPrompts || []);
      if (data.compressionMetadata) {
        this.compressionMetadata.set(projectId, data.compressionMetadata);
      }
    } else {
      await this.initialize(projectId);
    }
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default MemoryManager;
