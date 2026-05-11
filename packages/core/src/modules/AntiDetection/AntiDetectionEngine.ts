/**
 * Cloud Book - 反AI检测与去AI味模块
 * 帮助用户生成更自然的人类化文本
 */

import { AntiDetectionConfig } from '../../types';

export interface DetectionResult {
  isAI: boolean;
  confidence: number;
  indicators: AIIndicator[];
  suggestions: string[];
}

export interface AIIndicator {
  type: string;
  description: string;
  severity: number; // 0-1
  location?: string;
}

export interface StyleAnalysis {
  averageSentenceLength: number;
  sentenceLengthVariance: number;
  vocabularyRichness: number;
  transitionWordFrequency: number;
  emotionalWordDensity: number;
  paragraphStructure: number;
  dialoguePattern: string[];
  repetitionRate: number;
}

export class AntiDetectionEngine {
  private config: AntiDetectionConfig;
  
  // AI 常用词汇表
  private aiWordList = [
    '然而', '因此', '所以', '但是', '不过', '与此同时',
    '值得注意的是', '毋庸置疑', '毫无疑问', '显而易见',
    '综上所述', '总的来说', '从某种意义上说', '可以说',
    '众所周知', '不得不承认', '在此基础上', '进一步',
    '首先', '其次', '最后', '第一', '第二', '第三',
    '一方面', '另一方面', '与此同时'
  ];
  
  // 人称代词统计
  private pronounPatterns = {
    ai: ['我们', '您', '它的', '这些', '那些'],
    human: ['我', '咱们', '俺', '俺们', '咱', '咱们的']
  };

  constructor(config: Partial<AntiDetectionConfig> = {}) {
    const defaultConfig: AntiDetectionConfig = {
      enabled: true,
      intensity: 5,
      replaceAIWords: true,
      varySentenceStructure: true,
      addColloquialism: false,
      enhanceEmotion: true,
      addImperfection: true,
      mixStyles: false
    };
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 检测AI痕迹
   */
  detectAI(text: string): DetectionResult {
    const indicators: AIIndicator[] = [];
    
    // 1. 词汇检测
    const wordIndicators = this.detectAIWords(text);
    indicators.push(...wordIndicators);
    
    // 2. 句式检测
    const sentenceIndicators = this.detectSentencePatterns(text);
    indicators.push(...sentenceIndicators);
    
    // 3. 结构检测
    const structureIndicators = this.detectStructurePatterns(text);
    indicators.push(...structureIndicators);
    
    // 4. 情感检测
    const emotionIndicators = this.detectEmotionPatterns(text);
    indicators.push(...emotionIndicators);
    
    // 计算综合置信度
    const maxSeverity = Math.max(...indicators.map(i => i.severity), 0);
    const avgSeverity = indicators.length > 0 
      ? indicators.reduce((sum, i) => sum + i.severity, 0) / indicators.length 
      : 0;
    
    const confidence = Math.min(1, (maxSeverity * 0.6 + avgSeverity * 0.4) * 1.5);
    
    // 生成建议
    const suggestions = this.generateSuggestions(indicators);
    
    return {
      isAI: confidence > 0.5,
      confidence,
      indicators,
      suggestions
    };
  }

  /**
   * 检测AI常用词汇
   */
  private detectAIWords(text: string): AIIndicator[] {
    const indicators: AIIndicator[] = [];
    
    for (const word of this.aiWordList) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) {
        const frequency = matches.length / text.length * 1000; // 每千字出现次数
        if (frequency > 2) { // 超过阈值
          indicators.push({
            type: 'ai_word',
            description: `过度使用"${word}"（每千字出现${frequency.toFixed(1)}次）`,
            severity: Math.min(1, frequency / 10),
            location: `出现于多处`
          });
        }
      }
    }
    
    return indicators;
  }

  /**
   * 检测句式模式
   */
  private detectSentencePatterns(text: string): AIIndicator[] {
    const indicators: AIIndicator[] = [];
    const sentences = text.split(/[。！？]/).filter(s => s.trim());
    
    if (sentences.length < 3) return indicators;
    
    // 句长分析
    const lengths = sentences.map(s => s.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    // 句长过于均匀（方差小）可能是AI
    if (variance < 100) {
      indicators.push({
        type: 'sentence_length',
        description: `句长过于均匀（方差${variance.toFixed(1)}），人类写作句长变化更大`,
        severity: 0.6,
        location: '全文'
      });
    }
    
    // 句子长度检查
    const longSentences = sentences.filter(s => s.length > 100);
    if (longSentences.length > sentences.length * 0.5) {
      indicators.push({
        type: 'long_sentence_ratio',
        description: `长句比例过高（${(longSentences.length / sentences.length * 100).toFixed(1)}%）`,
        severity: 0.5,
        location: '全文'
      });
    }
    
    return indicators;
  }

  /**
   * 检测结构模式
   */
  private detectStructurePatterns(text: string): AIIndicator[] {
    const indicators: AIIndicator[] = [];
    
    // 段落开头模式
    const paragraphStarts = text.split('\n\n').map(p => {
      const lines = p.trim().split('\n');
      return lines[0] || '';
    });
    
    // 检测重复的开头模式
    const startPatterns = paragraphStarts.map(s => {
      // 提取前20个字符作为模式
      return s.substring(0, Math.min(20, s.length));
    });
    
    const uniqueStarts = new Set(startPatterns);
    if (uniqueStarts.size < startPatterns.length * 0.3) {
      indicators.push({
        type: 'paragraph_structure',
        description: '段落开头模式过于重复',
        severity: 0.7,
        location: '多处'
      });
    }
    
    return indicators;
  }

  /**
   * 检测情感模式
   */
  private detectEmotionPatterns(text: string): AIIndicator[] {
    const indicators: AIIndicator[] = [];
    
    const emotionalWords = [
      '激动', '感慨', '欣慰', '沉重', '复杂', '澎湃',
      '震撼', '沉痛', '愤慨', '感慨万千'
    ];
    
    let emotionCount = 0;
    for (const word of emotionalWords) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) {
        emotionCount += matches.length;
      }
    }
    
    const emotionDensity = emotionCount / text.length * 10000; // 每万字
    
    // 情感词密度过低可能是AI
    if (emotionDensity < 5) {
      indicators.push({
        type: 'emotion_density',
        description: `情感词汇密度较低（每万字${emotionDensity.toFixed(1)}个）`,
        severity: 0.4,
        location: '全文'
      });
    }
    
    return indicators;
  }

  /**
   * 生成修改建议
   */
  private generateSuggestions(indicators: AIIndicator[]): string[] {
    const suggestions: string[] = [];
    
    for (const indicator of indicators) {
      if (indicator.type === 'ai_word') {
        suggestions.push(`将"${indicator.description.match(/"([^"]+)"/)?.[1]}"替换为更口语化的表达`);
      } else if (indicator.type === 'sentence_length') {
        suggestions.push('增加句长变化，混合长短句');
      } else if (indicator.type === 'long_sentence_ratio') {
        suggestions.push('适当拆分长句，增加短句节奏');
      } else if (indicator.type === 'paragraph_structure') {
        suggestions.push('变化段落开头方式');
      } else if (indicator.type === 'emotion_density') {
        suggestions.push('增加情感描写和内心活动');
      }
    }
    
    return [...new Set(suggestions)];
  }

  /**
   * 去AI味处理
   */
  async humanize(text: string, llmProvider?: any): Promise<string> {
    if (!this.config.enabled) return text;
    
    const intensity = this.config.intensity / 10; // 0.1 - 1.0
    
    let result = text;
    
    // 1. 词汇替换
    if (this.config.replaceAIWords && intensity >= 0.3) {
      result = this.replaceAIWords(result, intensity);
    }
    
    // 2. 句式变化
    if (this.config.varySentenceStructure && intensity >= 0.4) {
      result = this.varySentenceStructure(result, intensity);
    }
    
    // 3. 口语化处理
    if (this.config.addColloquialism && intensity >= 0.5) {
      result = this.addColloquialism(result, intensity);
    }
    
    // 4. 情感增强
    if (this.config.enhanceEmotion && intensity >= 0.3) {
      result = await this.enhanceEmotion(result, llmProvider);
    }
    
    // 5. 人为不完美
    if (this.config.addImperfection && intensity >= 0.4) {
      result = this.addImperfection(result, intensity);
    }
    
    return result;
  }

  /**
   * 替换AI词汇
   */
  private replaceAIWords(text: string, intensity: number): string {
    const replacements: Record<string, string[]> = {
      '然而': ['可', '但', '只是', '不过'],
      '因此': ['于是', '就', '这么着'],
      '所以': ['就', '于是', '这不'],
      '但是': ['可', '只是', '然而'],
      '不过': ['只是', '然而', '可'],
      '与此同时': ['这当口', '这会儿', '这时候'],
      '综上所述': ['总的说来', '这么看'],
      '总的来说': ['总体来看', '总的来讲'],
      '首先': ['头一个', '一上来', '先说'],
      '其次': ['再一个', '还有'],
      '最后': ['末了', '到头来', '收尾时'],
      '一方面': ['一头', '一边'],
      '另一方面': ['另一头', '另一边', '再说'],
    };
    
    let result = text;
    
    for (const [aiWord, humanWords] of Object.entries(replacements)) {
      const regex = new RegExp(aiWord, 'g');
      result = result.replace(regex, () => {
        // 随机选择一个替换词
        return humanWords[Math.floor(Math.random() * humanWords.length)];
      });
    }
    
    return result;
  }

  /**
   * 变化句式结构
   */
  private varySentenceStructure(text: string, intensity: number): string {
    const sentences = text.split(/([。！？])/);
    const result: string[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';
      
      if (!sentence.trim()) {
        result.push(sentence, punctuation);
        continue;
      }
      
      // 随机拆分长句
      if (sentence.length > 80 && Math.random() < intensity * 0.3) {
        const midpoint = Math.floor(sentence.length / 2);
        const splitPoint = sentence.indexOf('，', midpoint - 20);
        
        if (splitPoint > 0) {
          const part1 = sentence.substring(0, splitPoint + 1);
          const part2 = sentence.substring(splitPoint + 1);
          result.push(part1, '，');
          result.push(part2, punctuation);
          continue;
        }
      }
      
      result.push(sentence, punctuation);
    }
    
    return result.join('');
  }

  /**
   * 添加口语化表达
   */
  private addColloquialism(text: string, intensity: number): string {
    const colloquialPatterns = [
      { from: '非常', to: ['老', '贼', '可', '真'] },
      { from: '觉得', to: ['寻思', '寻思着', '琢磨', '琢磨着'] },
      { from: '认为', to: ['觉着', '感觉', '以为'] },
      { from: '突然', to: ['猛地', '忽地', '一下', '冷不丁'] },
      { from: '然后', to: ['这当口', '完了', '紧跟着'] },
    ];
    
    let result = text;
    
    if (Math.random() < intensity * 0.3) {
      for (const pattern of colloquialPatterns) {
        const regex = new RegExp(pattern.from, 'g');
        result = result.replace(regex, () => {
          return pattern.to[Math.floor(Math.random() * pattern.to.length)];
        });
      }
    }
    
    return result;
  }

  /**
   * 增强情感
   */
  private async enhanceEmotion(text: string, llmProvider?: any): Promise<string> {
    if (llmProvider) {
      const prompt = `请为以下文本增强情感表达，保持原文风格的同时增加更多情感描写和内心活动：

${text}

要求：
1. 保持原文情节和人物
2. 增加自然的情感流露
3. 添加适当的内心独白
4. 不要过度煽情

请直接输出修改后的文本：`;
      
      try {
        const result = await llmProvider.generate(prompt, {
          temperature: 0.7,
          maxTokens: 2000
        });
        return result.text;
      } catch (error) {
        console.error('情感增强失败:', error);
      }
    }
    
    return text;
  }

  /**
   * 添加人为不完美
   */
  private addImperfection(text: string, intensity: number): string {
    let result = text;
    
    // 添加一些轻微的重复（人类写作常见）
    if (Math.random() < intensity * 0.2) {
      const sentences = result.split(/[。！？]/);
      if (sentences.length > 3) {
        const randomIndex = Math.floor(Math.random() * (sentences.length - 2)) + 1;
        sentences[randomIndex] += ' ' + sentences[randomIndex].trim();
        result = sentences.join('。');
      }
    }
    
    return result;
  }

  /**
   * 分析文本风格
   */
  analyzeStyle(text: string): StyleAnalysis {
    const sentences = text.split(/[。！？]/).filter(s => s.trim());
    const lengths = sentences.map(s => s.length);
    
    return {
      averageSentenceLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
      sentenceLengthVariance: this.calculateVariance(lengths),
      vocabularyRichness: this.calculateVocabularyRichness(text),
      transitionWordFrequency: this.calculateTransitionWordFrequency(text),
      emotionalWordDensity: this.calculateEmotionalWordDensity(text),
      paragraphStructure: this.analyzeParagraphStructure(text),
      dialoguePattern: this.extractDialoguePatterns(text),
      repetitionRate: this.calculateRepetitionRate(text)
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateVocabularyRichness(text: string): number {
    const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
    const uniqueWords = new Set(words);
    return uniqueWords.size / Math.max(words.length, 1);
  }

  private calculateTransitionWordFrequency(text: string): number {
    const transitionWords = ['然后', '接着', '于是', '之后', '后来', '随后'];
    let count = 0;
    for (const word of transitionWords) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) count += matches.length;
    }
    return count / text.length * 1000;
  }

  private calculateEmotionalWordDensity(text: string): number {
    const emotionalWords = [
      '高兴', '悲伤', '愤怒', '恐惧', '惊讶', '喜欢', '讨厌',
      '爱', '恨', '开心', '难过', '激动', '紧张', '害怕',
      '心疼', '心酸', '欣慰', '感动', '委屈', '无奈'
    ];
    let count = 0;
    for (const word of emotionalWords) {
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      if (matches) count += matches.length;
    }
    return count / text.length * 10000;
  }

  private analyzeParagraphStructure(text: string): number {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.length / Math.max(text.length / 1000, 1);
  }

  private extractDialoguePatterns(text: string): string[] {
    const dialogues = text.match(/"[^"]*"/g) || [];
    return dialogues.slice(0, 10);
  }

  private calculateRepetitionRate(text: string): number {
    const ngrams = new Map<string, number>();
    const trigrams = text.match(/.{3}/g) || [];
    
    for (const trigram of trigrams) {
      ngrams.set(trigram, (ngrams.get(trigram) || 0) + 1);
    }
    
    const repeated = Array.from(ngrams.values()).filter(count => count > 1).length;
    return repeated / Math.max(ngrams.size, 1);
  }
}

export default AntiDetectionEngine;
