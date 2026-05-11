/**
 * Cloud Book - 小说解析器模块
 * 支持百万字级小说的智能拆解与分析
 */

import { 
  ParseResult, 
  ParsedChapter, 
  ExtractedCharacter, 
  ExtractedWorldSetting,
  WritingPattern,
  StyleFingerprint,
  Scene,
  ImportConfig,
  Genre
} from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export type { ParseResult };

export class NovelParser {
  private config: ImportConfig;
  private chunkSize: number = 50000;
  private overlap: number = 2000;

  constructor(config: ImportConfig) {
    this.config = {
      encoding: 'utf-8',
      preserveFormatting: true,
      extractCharacters: true,
      extractWorldSettings: true,
      analyzeStyle: true,
      chunkSize: 50000,
      overlap: 2000,
      ...config
    };
  }

  async parse(filePath: string): Promise<ParseResult> {
    const content = await this.readFile(filePath);
    const basicInfo = this.extractBasicInfo(content);
    const chapters = this.splitChapters(content);
    
    const parsedChapters: ParsedChapter[] = [];
    for (let i = 0; i < chapters.length; i++) {
      const parsed = await this.parseChapter(chapters[i], i + 1);
      parsedChapters.push(parsed);
    }
    
    const characters = this.config.extractCharacters 
      ? await this.extractCharacters(parsedChapters)
      : [];
    
    const worldSettings = this.config.extractWorldSettings
      ? await this.extractWorldSettings(parsedChapters)
      : { locations: [], factions: [], items: [], timeline: [] };
    
    const styleFingerprint = this.config.analyzeStyle
      ? await this.analyzeStyle(parsedChapters)
      : this.getDefaultStyleFingerprint();
    
    const writingPatterns = this.config.analyzeStyle
      ? await this.analyzeWritingPatterns(parsedChapters)
      : [];
    
    return {
      title: basicInfo.title,
      author: basicInfo.author,
      genre: basicInfo.genre,
      estimatedWordCount: this.countWords(content),
      chapters: parsedChapters,
      characters,
      worldSettings,
      writingPatterns,
      styleFingerprint
    };
  }

  private async readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, this.config.encoding as BufferEncoding, (err, data) => {
        if (err) reject(err);
        else resolve(data as string);
      });
    });
  }

  private extractBasicInfo(content: string): { title: string; author?: string; genre?: Genre } {
    const lines = content.split('\n').filter((l: string) => l.trim());
    
    let title = '未命名';
    for (const line of lines.slice(0, 20)) {
      const titleMatch = line.match(/^#\s*(.+)$/) || 
                        line.match(/^《(.+)》$/) ||
                        line.match(/^(.{1,50})$/);
      if (titleMatch && titleMatch[1].length > 2) {
        title = titleMatch[1].trim();
        break;
      }
    }
    
    let author: string | undefined;
    for (const line of lines.slice(0, 30)) {
      const authorMatch = line.match(/作者[：:]\s*(.+)$/) ||
                         line.match(/^作者[：:]\s*(.+)$/);
      if (authorMatch) {
        author = authorMatch[1].trim();
        break;
      }
    }
    
    return { title, author, genre: undefined };
  }

  private splitChapters(content: string): { title: string; content: string }[] {
    const patterns = [
      /^(第[一二三四五六七八九十百千\d]+章)\s*(.+)?$/gm,
      /^(第[一二三四五六七八九十百千\d]+节)\s*(.+)?$/gm,
      /^(Chapter\s*\d+)\s*:?\s*(.+)?$/gim,
      /^(CHAPTER\s*\d+)\s*:?\s*(.+)?$/gim,
      /^#{1,3}\s*(.+)$/gm,
    ];
    
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length >= 2) {
        return this.splitByMatches(content, matches);
      }
    }
    
    return this.splitByLength(content);
  }

  private splitByMatches(
    content: string, 
    matches: RegExpMatchArray[]
  ): { title: string; content: string }[] {
    const chapters: { title: string; content: string }[] = [];
    
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index!;
      const end = i < matches.length - 1 
        ? matches[i + 1].index! 
        : content.length;
      
      const chapterContent = content.slice(start, end).trim();
      const title = matches[i][1] + (matches[i][2] ? ' ' + matches[i][2] : '');
      
      if (chapterContent.length > 100) {
        chapters.push({ title, content: chapterContent });
      }
    }
    
    return chapters;
  }

  private splitByLength(content: string): { title: string; content: string }[] {
    const chapters: { title: string; content: string }[] = [];
    const chapterLength = 5000;
    
    for (let i = 0; i < content.length; i += chapterLength) {
      const chapterContent = content.slice(i, i + chapterLength).trim();
      if (chapterContent.length > 100) {
        chapters.push({ 
          title: `第${this.toChineseNumber(Math.floor(i / chapterLength) + 1)}章`, 
          content: chapterContent 
        });
      }
    }
    
    return chapters;
  }

  private async parseChapter(
    chapter: { title: string; content: string }, 
    index: number
  ): Promise<ParsedChapter> {
    const content = chapter.content;
    const scenes = this.extractScenes(content);
    const characters = this.extractCharacterNames(content);
    
    return {
      index,
      title: chapter.title,
      content,
      wordCount: this.countWords(content),
      characters,
      scenes
    };
  }

  private extractScenes(content: string): Scene[] {
    const scenes: Scene[] = [];
    const scenePatterns = [
      /^(【[^】]+】)\s*(.+)?$/gm,
      /^#\s*场景[：:]\s*(.+)$/gm,
    ];
    
    for (const pattern of scenePatterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        scenes.push({
          location: match[1] || '未知地点',
          time: '未知时间',
          characters: [],
          summary: match[2] || ''
        });
      }
    }
    
    return scenes;
  }

  private extractCharacterNames(content: string): string[] {
    const names = new Set<string>();
    
    const surnames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连';
    
    const secondChars = surnames;
    
    const twoCharRegex = new RegExp(`[${surnames}][${secondChars}]`, 'g');
    const matches = content.match(twoCharRegex) || [];
    
    for (const match of matches) {
      if (match.length === 2) {
        names.add(match);
      }
    }
    
    return Array.from(names);
  }

  private async extractCharacters(
    chapters: ParsedChapter[]
  ): Promise<ExtractedCharacter[]> {
    const nameCount = new Map<string, number>();
    
    for (const chapter of chapters) {
      for (const name of chapter.characters) {
        nameCount.set(name, (nameCount.get(name) || 0) + 1);
      }
    }
    
    const characters: ExtractedCharacter[] = [];
    for (const [name, count] of nameCount) {
      if (count >= 3) {
        characters.push({
          name,
          aliases: [],
          description: '',
          appearances: chapters
            .filter(c => c.characters.includes(name))
            .map(c => c.index),
          relationships: []
        });
      }
    }
    
    return characters;
  }

  private async extractWorldSettings(
    chapters: ParsedChapter[]
  ): Promise<ExtractedWorldSetting> {
    const locations = new Set<string>();
    const factions = new Set<string>();
    const items = new Set<string>();
    const timeline: { event: string; chapter?: number }[] = [];
    
    const locationPatterns = [
      /【([^【】]+)】/g,
      /在(.+?)举行/g,
      /来到(.+?)[，,。]/g,
    ];
    
    const factionPatterns = [
      /([^\s]+)派/g,
      /([^\s]+)宗/g,
      /([^\s]+)门/g,
      /([^\s]+)家族/g,
      /([^\s]+)学院/g,
    ];
    
    for (const chapter of chapters) {
      for (const pattern of locationPatterns) {
        const matches = [...chapter.content.matchAll(pattern)];
        for (const match of matches) {
          locations.add(match[1]);
        }
      }
      
      for (const pattern of factionPatterns) {
        const matches = [...chapter.content.matchAll(pattern)];
        for (const match of matches) {
          if (match[1].length < 10) {
            factions.add(match[1]);
          }
        }
      }
    }
    
    return {
      powerSystem: undefined,
      locations: Array.from(locations).slice(0, 100),
      factions: Array.from(factions).slice(0, 50),
      items: Array.from(items),
      timeline
    };
  }

  private async analyzeStyle(
    chapters: ParsedChapter[]
  ): Promise<StyleFingerprint> {
    const sampleSize = Math.min(10, chapters.length);
    const sampleChapters = chapters.slice(0, sampleSize);
    
    let totalWords = 0;
    let totalSentences = 0;
    const sentenceLengths: number[] = [];
    const wordFrequency = new Map<string, number>();
    const emotionalWords: string[] = [];
    let dialogueCount = 0;
    let descriptionCount = 0;
    
    const emotionalWordList = [
      '高兴', '悲伤', '愤怒', '恐惧', '惊讶', '喜欢', '讨厌',
      '爱', '恨', '开心', '难过', '激动', '紧张', '害怕'
    ];
    
    for (const chapter of sampleChapters) {
      const content = chapter.content;
      totalWords += chapter.wordCount;
      
      const sentences = content.split(/[。！？；\n]/);
      totalSentences += sentences.length;
      
      for (const sentence of sentences) {
        if (sentence.trim()) {
          sentenceLengths.push(sentence.trim().length);
        }
      }
      
      for (const word of emotionalWordList) {
        if (content.includes(word)) {
          emotionalWords.push(word);
        }
      }
      
      const dialogues = content.match(/"[^"]*"/g) || [];
      dialogueCount += dialogues.length;
      
      const descriptionWords = ['看着', '听见', '感受', '只见', '只见得', '仿佛', '似乎'];
      for (const word of descriptionWords) {
        descriptionCount += (content.match(new RegExp(word, 'g')) || []).length;
      }
    }
    
    return {
      sentenceLengthDistribution: this.calculateDistribution(sentenceLengths),
      wordFrequency: Object.fromEntries(wordFrequency),
      punctuationPattern: '',
      dialogueRatio: dialogueCount / Math.max(totalSentences, 1),
      descriptionDensity: descriptionCount / Math.max(totalWords, 1),
      narrativeVoice: 'third_person',
      tense: 'present',
      emotionalWords: [...new Set(emotionalWords)],
      signaturePhrases: [],
      tabooWords: []
    };
  }

  private async analyzeWritingPatterns(
    chapters: ParsedChapter[]
  ): Promise<WritingPattern[]> {
    const patterns: WritingPattern[] = [];
    
    patterns.push({
      type: 'opening',
      frequency: 0.8,
      examples: chapters.slice(0, 5).map(c => {
        const lines = c.content.split('\n').filter((l: string) => l.trim());
        return lines[0] || '';
      })
    });
    
    return patterns;
  }

  private calculateDistribution(values: number[]): number[] {
    const buckets = new Array(10).fill(0);
    for (const v of values) {
      const bucket = Math.min(9, Math.floor(v / 10));
      buckets[bucket]++;
    }
    return buckets.map(count => count / values.length);
  }

  private getDefaultStyleFingerprint(): StyleFingerprint {
    return {
      sentenceLengthDistribution: new Array(10).fill(0.1),
      wordFrequency: {},
      punctuationPattern: '',
      dialogueRatio: 0.3,
      descriptionDensity: 0.1,
      narrativeVoice: 'third_person',
      tense: 'present',
      emotionalWords: [],
      signaturePhrases: [],
      tabooWords: []
    };
  }

  private countWords(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private toChineseNumber(num: number): string {
    const units = ['', '十', '百', '千', '万'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
    if (num === 0) return '零';
    
    let result = '';
    let unitIndex = 0;
    
    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = digits[digit] + units[unitIndex] + result;
      } else if (result && !result.startsWith('零')) {
        result = '零' + result;
      }
      num = Math.floor(num / 10);
      unitIndex++;
    }
    
    return result.replace(/零+$/, '');
  }
}

export default NovelParser;
