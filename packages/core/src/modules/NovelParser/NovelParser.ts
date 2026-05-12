/**
 * Cloud Book - 高性能小说解析器
 * 支持千万字级文学作品解析
 * 包含流式处理、分块处理、智能分章
 */

import { ParseResult, Chapter, Character, WorldSetting } from '../../types';

export interface ParserConfig {
  enableStreaming?: boolean;
  enableSmartChaptering?: boolean;
  extractCharacters?: boolean;
  extractSetting?: boolean;
  chunkSize?: number;
  maxMemoryLimit?: number;
}

export interface ParserProgress {
  totalBytes: number;
  totalChapters: number;
  totalCharacters: number;
  status: 'parsing' | 'analyzing' | 'extracting' | 'complete';
  currentPhase: string;
  error?: string;
}

export class NovelParser {
  private config: Required<ParserConfig>;
  private progress: ParserProgress;
  private onProgress?: (progress: ParserProgress) => void;

  constructor(config?: ParserConfig) {
    this.config = {
      enableStreaming: config?.enableStreaming !== false,
      enableSmartChaptering: config?.enableSmartChaptering !== false,
      extractCharacters: config?.extractCharacters !== false,
      extractSetting: config?.extractSetting !== false,
      chunkSize: config?.chunkSize || 1024 * 1024, // 1MB chunks
      maxMemoryLimit: config?.maxMemoryLimit || 100 * 1024 * 1024, // 100MB
      ...config
    };
    this.progress = {
      totalBytes: 0,
      totalChapters: 0,
      totalCharacters: 0,
      status: 'parsing',
      currentPhase: '初始化'
    };
  }

  setProgressCallback(callback: (progress: ParserProgress) => void) {
    this.onProgress = callback;
  }

  async parseString(content: string): Promise<ParseResult> {
    if (!content) {
      throw new Error('Content cannot be empty');
    }
    this.updateProgress('parsing', '读取内容中...');
    const chapters = this.splitChapters(content);
    this.updateProgress('analyzing', '分析章节结构...');
    const characters = this.extractCharacters(content);
    const setting = this.extractWorldSetting(content);
    this.updateProgress('complete', '解析完成');

    return {
      title: this.extractTitle(content),
      chapters,
      characters,
      setting,
      styleFingerprint: this.analyzeStyle(content),
      metadata: {
        totalWords: content.length,
        totalChapters: chapters.length,
        totalCharacters: characters.length,
        language: this.detectLanguage(content),
        genre: this.detectGenre(content)
      }
    };
  }

  async parseFile(filePath: string): Promise<ParseResult> {
    this.updateProgress('parsing', '读取文件中...');
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    this.progress.totalBytes = Buffer.byteLength(content, 'utf-8');
    this.updateProgress('parsing', '正在解析...');
    return this.parseString(content);
  }

  async parseStream(
    reader: NodeJS.ReadableStream,
    onData?: (chunk: string) => void
  ): Promise<ParseResult> {
    let fullContent = '';
    let buffer = '';

    return new Promise((resolve, reject) => {
      reader.on('data', (chunk) => {
        const chunkStr = chunk.toString('utf-8');
        buffer += chunkStr;
        if (buffer.length >= this.config.chunkSize) {
          if (onData) {
            onData(buffer);
          }
          fullContent += buffer;
          buffer = '';
          this.progress.totalBytes = Buffer.byteLength(fullContent, 'utf-8');
          this.updateProgress('parsing', `已解析 ${(this.progress.totalBytes / 1024 / 1024).toFixed(2)} MB`);
        }
      });

      reader.on('end', () => {
        if (buffer.length > 0) {
          fullContent += buffer;
        }
        this.parseString(fullContent).then(resolve).catch(reject);
      });

      reader.on('error', (err) => {
        this.progress.error = err.message;
        reject(err);
      });
    });
  }

  private splitChapters(content: string): Chapter[] {
    const chapters: Chapter[] = [];
    const chapterPatterns = [
      /^第[零一二三四五六七八九十百千万\d]+章/mg,
      /^第[零一二三四五六七八九十百千万\d]+节/mg,
      /^VOLUME\s+\d+/img,
      /^第[零一二三四五六七八九十百千万\d]+回/mg,
      /^Chapter\s+\d+/img,
      /^\d+\./mg,
      /^第[零一二三四五六七八九十百千万\d]+卷/mg
    ];

    const allMatches: { index: number; match: string }[] = [];

    for (const pattern of chapterPatterns) {
      let match;
      const regex = new RegExp(pattern);
      while ((match = regex.exec(content)) !== null) {
        if (match.index !== undefined) {
          allMatches.push({ index: match.index, match: match[0] });
        }
      }
    }

    allMatches.sort((a, b) => a.index - b.index);

    if (allMatches.length > 0) {
      let previousIndex = 0;
      for (let i = 0; i < allMatches.length; i++) {
        const current = allMatches[i];
        if (i > 0 && current.index - previousIndex < 50) {
          continue;
        }
        if (i > 0) {
          const chapterContent = content.slice(allMatches[i - 1].index, current.index);
          if (chapterContent.trim().length > 100) {
            chapters.push({
              id: `chapter-${chapters.length}`,
              number: chapters.length,
              title: this.cleanTitle(allMatches[i - 1].match),
              content: chapterContent.trim(),
              status: 'draft',
              wordCount: chapterContent.length,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        previousIndex = current.index;
      }

      if (allMatches.length > 0) {
        const lastContent = content.slice(allMatches[allMatches.length - 1].index);
        if (lastContent.trim().length > 100) {
          chapters.push({
            id: `chapter-${chapters.length}`,
            number: chapters.length,
            title: this.cleanTitle(allMatches[allMatches.length - 1].match),
            content: lastContent.trim(),
            status: 'draft',
            wordCount: lastContent.length,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    } else {
      chapters.push({
        id: 'chapter-0',
        number: 0,
        title: '第一章',
        content: content.trim(),
        status: 'draft',
        wordCount: content.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    this.progress.totalChapters = chapters.length;
    return chapters;
  }

  private cleanTitle(match: string): string {
    return match.trim();
  }

  private extractCharacters(content: string): Character[] {
    const characters: Character[] = [];
    const names = new Set<string>();
    const chineseName = /[\u4e00-\u9fa5]{2,4}/g;
    let match;
    while ((match = chineseName.exec(content)) !== null) {
      names.add(match[0].trim());
    }

    let index = 0;
    for (const name of names) {
      if (name.length >= 2 && name.length <= 4 && !['说道', '了', '的', '是', '在', '有'].includes(name)) {
        characters.push({
          id: `char-${index}`,
          name,
          description: '',
          traits: [],
          relationships: {}
        });
        index++;
      }
    }

    this.progress.totalCharacters = characters.length;
    return characters;
  }

  private extractWorldSetting(content: string): WorldSetting {
    return {
      locations: [],
      magicSystem: '',
      history: '',
      rules: [],
      timeline: []
    };
  }

  private extractTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length < 100 && firstLine.length > 0) {
      return firstLine;
    }
    return '未命名作品';
  }

  private analyzeStyle(content: string) {
    const avgSentenceLength = this.calculateAvgSentenceLength(content);
    const sentenceVariance = this.calculateSentenceVariance(content);
    return {
      avgSentenceLength,
      sentenceVariance,
      vocabularyRichness: this.calculateVocabularyRichness(content),
      dialogueRatio: this.calculateDialogueRatio(content)
    };
  }

  private calculateAvgSentenceLength(content: string): number {
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    return sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length;
  }

  private calculateSentenceVariance(content: string): number {
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    const avg = this.calculateAvgSentenceLength(content);
    const variance = sentences.reduce((sum, s) => sum + Math.pow(s.trim().length - avg, 2), 0) / sentences.length;
    return variance;
  }

  private calculateVocabularyRichness(content: string): number {
    const chars = content.split('').filter(c => c.trim().length > 0);
    const uniqueChars = new Set(chars);
    return uniqueChars.size / Math.max(chars.length, 1);
  }

  private calculateDialogueRatio(content: string): number {
    const dialogueMatches = content.match(/["「『][^」』"]+["」』]/g) || [];
    const dialogueLength = dialogueMatches.reduce((sum, m) => sum + m.length, 0);
    return dialogueLength / Math.max(content.length, 1);
  }

  private detectLanguage(content: string): string {
    const chineseCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishCount = (content.match(/[a-zA-Z]/g) || []).length;
    return chineseCount > englishCount ? 'zh' : 'en';
  }

  private detectGenre(content: string): string {
    const genreKeywords: Record<string, string[]> = {
      xianxia: ['修仙', '仙', '灵气', '修真'],
      fantasy: ['魔法', '精灵', '魔兽', '龙族'],
      urban: ['都市', '校园', '总裁', '豪门'],
      romance: ['爱情', '恋爱', '感情'],
      mystery: ['悬疑', '推理', '破案'],
      scifi: ['未来', '星际', '宇宙', '科技'],
      horror: ['恐怖', '惊悚', '鬼'],
      historical: ['穿越', '古代', '历史']
    };

    let bestMatch = 'other';
    let bestScore = 0;

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const count = (content.match(new RegExp(keyword, 'g')) || []).length;
        score += count;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = genre;
      }
    }

    return bestMatch;
  }

  private updateProgress(status: ParserProgress['status'], phase: string) {
    this.progress.status = status;
    this.progress.currentPhase = phase;
    if (this.onProgress) {
      this.onProgress(this.progress);
    }
  }
}

export default NovelParser;
