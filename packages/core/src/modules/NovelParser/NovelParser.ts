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
  ImportConfig
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class NovelParser {
  private config: ImportConfig;
  private chunkSize: number = 50000; // 每块50K字符
  private overlap: number = 2000;    // 2K重叠

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

  /**
   * 解析小说文件
   */
  async parse(filePath: string): Promise<ParseResult> {
    // 读取文件
    const content = await this.readFile(filePath);
    
    // 提取基本信息
    const basicInfo = this.extractBasicInfo(content);
    
    // 分割章节
    const chapters = this.splitChapters(content);
    
    // 解析每个章节
    const parsedChapters: ParsedChapter[] = [];
    for (let i = 0; i < chapters.length; i++) {
      const parsed = await this.parseChapter(chapters[i], i + 1);
      parsedChapters.push(parsed);
    }
    
    // 提取角色
    const characters = this.config.extractCharacters 
      ? await this.extractCharacters(parsedChapters)
      : [];
    
    // 提取世界观
    const worldSettings = this.config.extractWorldSettings
      ? await this.extractWorldSettings(parsedChapters)
      : { locations: [], factions: [], items: [], timeline: [] };
    
    // 分析写作风格
    const styleFingerprint = this.config.analyzeStyle
      ? await this.analyzeStyle(parsedChapters)
      : this.getDefaultStyleFingerprint();
    
    // 分析写作模式
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

  /**
   * 读取文件
   */
  private async readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, this.config.encoding as BufferEncoding, (err, data) => {
        if (err) reject(err);
        else resolve(data as string);
      });
    });
  }

  /**
   * 提取基本信息
   */
  private extractBasicInfo(content: string): { title: string; author?: string; genre?: string } {
    const lines = content.split('\n').filter(l => l.trim());
    
    // 尝试从开头提取书名
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
    
    // 尝试提取作者
    let author: string | undefined;
    for (const line of lines.slice(0, 30)) {
      const authorMatch = line.match(/作者[：:]\s*(.+)$/) ||
                         line.match(/^作者[：:]\s*(.+)$/);
      if (authorMatch) {
        author = authorMatch[1].trim();
        break;
      }
    }
    
    return { title, author };
  }

  /**
   * 分割章节
   */
  private splitChapters(content: string): { title: string; content: string }[] {
    // 章节分割模式
    const patterns = [
      /^(第[一二三四五六七八九十百千\d]+章)\s*(.+)?$/gm,  // 第一章 xxx
      /^(第[一二三四五六七八九十百千\d]+节)\s*(.+)?$/gm,  // 第一节 xxx
      /^(Chapter\s*\d+)\s*:?\s*(.+)?$/gim,              // Chapter 1: xxx
      /^(CHAPTER\s*\d+)\s*:?\s*(.+)?$/gim,              // CHAPTER 1: xxx
      /^#{1,3}\s*(.+)$/gm,                               // # 第一章 或 ## 第一节
    ];
    
    // 尝试每种模式
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length >= 2) {
        return this.splitByMatches(content, matches);
      }
    }
    
    // 默认按固定长度分割
    return this.splitByLength(content);
  }

  /**
   * 根据匹配结果分割
   */
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
      
      if (chapterContent.length > 100) { // 过滤过短的章节
        chapters.push({ title, content: chapterContent });
      }
    }
    
    return chapters;
  }

  /**
   * 按长度分割（备用方案）
   */
  private splitByLength(content: string): { title: string; content: string }[] {
    const chapters: { title: string; content: string }[] = [];
    const chapterLength = 5000; // 每章约5K字符
    
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

  /**
   * 解析单个章节
   */
  private async parseChapter(
    chapter: { title: string; content: string }, 
    index: number
  ): Promise<ParsedChapter> {
    const content = chapter.content;
    
    // 提取场景
    const scenes = this.extractScenes(content);
    
    // 提取引用的人物名
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

  /**
   * 提取场景
   */
  private extractScenes(content: string): Scene[] {
    const scenes: Scene[] = [];
    const scenePatterns = [
      /^(【[^】]+】)\s*(.+)?$/gm,  // 【场景描述】
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

  /**
   * 提取引用的人物名
   */
  private extractCharacterNames(content: string): string[] {
    const names = new Set<string>();
    
    // 常见姓名模式
    const namePatterns = [
      /[赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云/,
    ];
    
    // 简单中文姓名
    const simpleNameRegex = /[赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云][●○《"]([●○《"'][赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云/,
    ];
    
    // 提取双字和三字姓名
    const twoCharNames = content.match(/[赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云][赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云][赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑雷贺倪汤滕殷罗毕郝郝邬安常乐于时傅皮卡齐康余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽焦邸户佴利麻翟黄贾路江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左右崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥连车驾稂蓬萃拔邬束楷召曜詹翦邸枣贲筠柔楷玛 Tennag SNh教歧鹿苑洪邪苍 Chadoud 综澳 Kushal 阿莱 Khanna 赵云/,
    ]?/g;
    
    if (twoCharNames) {
      twoCharNames.forEach(name => {
        const cleanName = name.replace(/[●○《"']/g, '');
        if (cleanName.length >= 2) {
          names.add(cleanName);
        }
      });
    }
    
    return Array.from(names);
  }

  /**
   * 提取角色
   */
  private async extractCharacters(
    chapters: ParsedChapter[]
  ): Promise<ExtractedCharacter[]> {
    // 收集所有人物名
    const nameCount = new Map<string, number>();
    
    for (const chapter of chapters) {
      for (const name of chapter.characters) {
        nameCount.set(name, (nameCount.get(name) || 0) + 1);
      }
    }
    
    // 过滤出现次数较多的（排除噪声）
    const characters: ExtractedCharacter[] = [];
    for (const [name, count] of nameCount) {
      if (count >= 3) { // 至少出现3次
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

  /**
   * 提取世界观设定
   */
  private async extractWorldSettings(
    chapters: ParsedChapter[]
  ): Promise<ExtractedWorldSetting> {
    const locations = new Set<string>();
    const factions = new Set<string>();
    const items = new Set<string>();
    const timeline: { event: string; chapter?: number }[] = [];
    
    // 地点模式
    const locationPatterns = [
      /【([^【】]+)】/g,
      /在(.+?)举行/g,
      /来到(.+?)[，,。]/g,
    ];
    
    // 门派/组织模式
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
          if (match[1].length < 10) { // 过滤过长的
            factions.add(match[1]);
          }
        }
      }
    }
    
    return {
      powerSystem: undefined, // 需要更复杂的分析
      locations: Array.from(locations).slice(0, 100),
      factions: Array.from(factions).slice(0, 50),
      items: Array.from(items),
      timeline
    };
  }

  /**
   * 分析写作风格
   */
  private async analyzeStyle(
    chapters: ParsedChapter[]
  ): Promise<StyleFingerprint> {
    // 采样部分章节进行分析
    const sampleSize = Math.min(10, chapters.length);
    const sampleChapters = chapters.slice(0, sampleSize);
    
    let totalWords = 0;
    let totalSentences = 0;
    const sentenceLengths: number[] = [];
    const wordFrequency = new Map<string, number>();
    const emotionalWords: string[] = [];
    const dialogueCount = 0;
    let descriptionCount = 0;
    
    const emotionalWordList = [
      '高兴', '悲伤', '愤怒', '恐惧', '惊讶', '喜欢', '讨厌',
      '爱', '恨', '开心', '难过', '激动', '紧张', '害怕'
    ];
    
    for (const chapter of sampleChapters) {
      const content = chapter.content;
      totalWords += chapter.wordCount;
      
      // 分割句子
      const sentences = content.split(/[。！？；\n]/);
      totalSentences += sentences.length;
      
      for (const sentence of sentences) {
        if (sentence.trim()) {
          sentenceLengths.push(sentence.trim().length);
        }
      }
      
      // 统计词频
      for (const word of emotionalWordList) {
        if (content.includes(word)) {
          emotionalWords.push(word);
        }
      }
      
      // 对话统计
      const dialogues = content.match(/"[^"]*"/g) || [];
      dialogueCount += dialogues.length;
      
      // 描写词统计
      const descriptionWords = ['看着', '听见', '感受', '只见', '只见得', '仿佛', '似乎'];
      for (const word of descriptionWords) {
        descriptionCount += (content.match(new RegExp(word, 'g')) || []).length;
      }
    }
    
    return {
      sentenceLengthDistribution: this.calculateDistribution(sentenceLengths),
      wordFrequency: Object.fromEntries(wordFrequency),
      punctuationPattern: '',
      dialogueRatio: dialogueCount / totalSentences,
      descriptionDensity: descriptionCount / totalWords,
      narrativeVoice: 'third_person',
      tense: 'present',
      emotionalWords: [...new Set(emotionalWords)],
      signaturePhrases: [],
      tabooWords: []
    };
  }

  /**
   * 分析写作模式
   */
  private async analyzeWritingPatterns(
    chapters: ParsedChapter[]
  ): Promise<WritingPattern[]> {
    const patterns: WritingPattern[] = [];
    
    // 开场模式
    patterns.push({
      type: 'opening',
      frequency: 0.8,
      examples: chapters.slice(0, 5).map(c => {
        const lines = c.content.split('\n').filter(l => l.trim());
        return lines[0] || '';
      })
    });
    
    return patterns;
  }

  /**
   * 计算分布
   */
  private calculateDistribution(values: number[]): number[] {
    const buckets = new Array(10).fill(0);
    for (const v of values) {
      const bucket = Math.min(9, Math.floor(v / 10));
      buckets[bucket]++;
    }
    return buckets.map(count => count / values.length);
  }

  /**
   * 获取默认风格指纹
   */
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

  /**
   * 统计字数
   */
  private countWords(content: string): number {
    // 中文字符
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 英文单词
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 数字转中文
   */
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
