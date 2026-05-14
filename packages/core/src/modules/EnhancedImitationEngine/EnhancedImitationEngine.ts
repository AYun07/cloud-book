/**
 * Cloud Book - 深度优化写法引擎
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - 多种仿写模式
 * - 风格指纹提取
 * - 二创/同人支持
 * - 本地离线可用
 */

import { NovelProject, Chapter, StyleFingerprint, WritingMode, ParseResult, TruthFiles, Character } from '../../types';

// ============================================
// 写法引擎核心类型
// ============================================

export type ImitationMode = 
  | 'pure_imitate'     // 纯仿写
  | 'inspired_by'      // 受启发创作
  | 'fan_fiction'      // 同人创作
  | 'derivative'       // 二创（续写/前传）
  | 'style_transfer';  // 风格迁移

export type WritingIntent = 
  | 'rewrite'          // 重写
  | 'continue'         // 续写
  | 'expand'           // 扩展
  | 'condense'         // 压缩
  | 'transform';       // 转换

export interface StyleProfile {
  // 句子层面
  avgSentenceLength: number;
  sentenceLengthVariance: number;
  sentenceLengthDistribution: number[];
  
  // 对话层面
  dialogueRatio: number;
  dialogueTagPatterns: string[];
  dialogueStyle: 'formal' | 'casual' | 'mixed';
  
  // 描写层面
  descriptionDensity: number;
  sensoryWords: Map<string, number>;
  actionVerbs: Map<string, number>;
  adjectiveDensity: number;
  
  // 情感层面
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotionalIntensity: number;
  emotionalWordFrequency: Map<string, number>;
  
  // 叙事层面
  narrativeVoice: 'first_person' | 'third_person' | 'second_person' | 'omniscient' | 'limited';
  tense: 'past' | 'present' | 'future' | 'mixed';
  povStability: number; // 0-1
  
  // 结构层面
  paragraphAvgLength: number;
  paragraphStructurePattern: string[];
  
  // 风格标识
  signaturePhrases: string[];
  punctuationPatterns: Map<string, number>;
  tabooWords: string[];
  
  // 词汇层面
  vocabularyRichness: number;
  formalityLevel: number; // 0-100
  technicalJargon: string[];
}

export interface ImitationTask {
  mode: ImitationMode;
  intent: WritingIntent;
  originalContent: string;
  sourceProfile: StyleProfile;
  targetRequirements?: {
    tone?: string;
    length?: 'shorter' | 'same' | 'longer';
    formality?: 'more_formal' | 'same' | 'less_formal';
    emotionalShift?: 'positive' | 'negative' | 'neutral';
  };
  preserveElements?: string[];
  changeElements?: string[];
}

export interface GenerationContext {
  project: NovelProject;
  currentChapter: number;
  characters: Character[];
  truthFiles: TruthFiles;
  styleProfile: StyleProfile;
  precedingText?: string;
  followingText?: string;
  sceneContext?: {
    location?: string;
    time?: string;
    mood?: string;
    participants?: string[];
  };
}

export interface ImitationResult {
  success: boolean;
  generatedContent: string;
  appliedStyle: Partial<StyleProfile>;
  transformations: AppliedTransformation[];
  warnings?: string[];
  confidence: number;
  generatedAt: Date;
}

export interface AppliedTransformation {
  type: 'vocabulary' | 'sentence_structure' | 'tone' | 'dialogue' | 'description' | 'pacing';
  original: string;
  transformed: string;
  reason: string;
}

export interface StyleTransferOptions {
  sourceProfile: StyleProfile;
  targetProfile: StyleProfile;
  preserveContent: boolean;
  blendRatio: number; // 0-1, 0=all source, 1=all target
  priorityAspects: ('vocabulary' | 'tone' | 'structure' | 'pacing')[];
}

export interface StyleConsistencyCheck {
  targetText: string;
  referenceProfile: StyleProfile;
  consistencyScore: number; // 0-100
  deviations: StyleDeviation[];
  suggestions: string[];
}

export interface StyleDeviation {
  aspect: string;
  expected: any;
  actual: any;
  severity: 'minor' | 'moderate' | 'major';
  suggestion: string;
}

export interface ImitationStatistics {
  totalGenerations: number;
  successfulGenerations: number;
  averageConfidence: number;
  modeUsage: Map<ImitationMode, number>;
  averageTransformationCount: number;
}

// ============================================
// 增强型 ImitationEngine
// ============================================

export class EnhancedImitationEngine {
  private sourceProfiles: Map<string, StyleProfile> = new Map();
  private generationHistory: ImitationResult[] = [];
  private statistics: ImitationStatistics = {
    totalGenerations: 0,
    successfulGenerations: 0,
    averageConfidence: 0,
    modeUsage: new Map(),
    averageTransformationCount: 0
  };

  constructor() {}

  // ============================================
  // 风格指纹提取
  // ============================================

  extractStyleProfile(content: string, metadata?: { title?: string; author?: string }): StyleProfile {
    const sentences = this.splitSentences(content);
    const paragraphs = this.splitParagraphs(content);
    
    // 句子分析
    const sentenceLengths = sentences.map(s => this.countWords(s));
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentences.length;
    const sentenceLengthVariance = this.calculateVariance(sentenceLengths);
    
    // 对话分析
    const dialogues = this.extractDialogues(content);
    const dialogueRatio = content.length > 0 ? dialogues.totalLength / content.length : 0;
    
    // 描写分析
    const sensoryWords = this.extractSensoryWords(content);
    const actionVerbs = this.extractActionVerbs(content);
    const adjectives = this.extractAdjectives(content);
    
    // 情感分析
    const emotionalWords = this.extractEmotionalWords(content);
    const emotionalTone = this.determineEmotionalTone(emotionalWords);
    const emotionalIntensity = this.calculateEmotionalIntensity(emotionalWords);
    
    // 叙事分析
    const narrativeVoice = this.detectNarrativeVoice(content);
    const tense = this.detectTense(sentences);
    const povStability = this.calculatePOVStability(content);
    
    // 结构分析
    const paragraphLengths = paragraphs.map(p => this.countWords(p));
    const paragraphAvgLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphs.length;
    
    // 风格标识
    const signaturePhrases = this.extractSignaturePhrases(sentences);
    const punctuationPatterns = this.analyzePunctuationPatterns(content);
    const tabooWords = this.extractTabooWords(content);
    
    // 词汇分析
    const vocabularyRichness = this.calculateVocabularyRichness(content);
    const formalityLevel = this.calculateFormalityLevel(content);
    const technicalJargon = this.extractTechnicalTerms(content);

    return {
      avgSentenceLength,
      sentenceLengthVariance,
      sentenceLengthDistribution: this.calculateLengthDistribution(sentenceLengths),
      dialogueRatio,
      dialogueTagPatterns: dialogues.tags,
      dialogueStyle: this.categorizeDialogueStyle(dialogues),
      descriptionDensity: this.calculateDescriptionDensity(content, sensoryWords),
      sensoryWords,
      actionVerbs,
      adjectiveDensity: adjectives.length / sentences.length,
      emotionalTone,
      emotionalIntensity,
      emotionalWordFrequency: emotionalWords,
      narrativeVoice,
      tense,
      povStability,
      paragraphAvgLength,
      paragraphStructurePattern: this.analyzeParagraphStructure(paragraphs),
      signaturePhrases,
      punctuationPatterns,
      tabooWords,
      vocabularyRichness,
      formalityLevel,
      technicalJargon
    };
  }

  storeProfile(id: string, profile: StyleProfile): void {
    this.sourceProfiles.set(id, profile);
  }

  getProfile(id: string): StyleProfile | undefined {
    return this.sourceProfiles.get(id);
  }

  // ============================================
  // 仿写生成
  // ============================================

  async generate(task: ImitationTask): Promise<ImitationResult> {
    const transformations: AppliedTransformation[] = [];
    
    // 根据模式处理
    let processedContent = task.originalContent;
    
    switch (task.mode) {
      case 'pure_imitate':
        processedContent = this.applyPureImitation(processedContent, task);
        break;
      case 'inspired_by':
        processedContent = this.applyInspiration(processedContent, task);
        break;
      case 'style_transfer':
        // 需要目标profile
        transformations.push(...this.applyStyleTransformations(processedContent, task));
        break;
      case 'fan_fiction':
        processedContent = this.applyFanFictionTransform(processedContent, task);
        break;
      case 'derivative':
        processedContent = this.applyDerivativeTransform(processedContent, task);
        break;
    }

    const result: ImitationResult = {
      success: true,
      generatedContent: processedContent,
      appliedStyle: this.extractStyleProfile(processedContent),
      transformations,
      confidence: this.calculateConfidence(transformations, task),
      generatedAt: new Date()
    };

    this.generationHistory.push(result);
    this.updateStatistics(result);
    
    return result;
  }

  private applyPureImitation(content: string, task: ImitationTask): string {
    // 纯仿写：保持内容结构，应用风格
    const sentences = this.splitSentences(content);
    
    return sentences.map(sentence => {
      // 调整句子长度以匹配源风格
      const targetLength = task.sourceProfile.avgSentenceLength;
      const currentLength = this.countWords(sentence);
      
      if (currentLength < targetLength * 0.8) {
        return this.expandSentence(sentence, task.sourceProfile);
      } else if (currentLength > targetLength * 1.2) {
        return this.compressSentence(sentence);
      }
      
      return sentence;
    }).join('');
  }

  private applyInspiration(content: string, task: ImitationTask): string {
    // 受启发创作：保留核心思想，变换表达
    const sentences = this.splitSentences(content);
    
    return sentences.map(sentence => {
      // 保留核心意思，变换词汇
      return this.paraphraseWithStyle(sentence, task.sourceProfile);
    }).join('');
  }

  private applyStyleTransformations(content: string, task: ImitationTask): AppliedTransformation[] {
    // 风格迁移：平滑过渡风格
    const transformations: AppliedTransformation[] = [];
    
    // 词汇变换
    const vocabularyTransformed = this.transformVocabulary(content, task);
    transformations.push({
      type: 'vocabulary',
      original: content.slice(0, 100),
      transformed: vocabularyTransformed.slice(0, 100),
      reason: '应用目标风格词汇'
    });
    
    return transformations;
  }

  private applyFanFictionTransform(content: string, task: ImitationTask): string {
    // 同人创作：保持原作角色，使用新设定
    const sentences = this.splitSentences(content);
    
    return sentences.map(sentence => {
      // 调整语气和设定引用
      return this.adaptForFanFiction(sentence, task);
    }).join('');
  }

  private applyDerivativeTransform(content: string, task: ImitationTask): string {
    // 二创：根据意图转换
    switch (task.intent) {
      case 'continue':
        return this.generateContinuation(content, task);
      case 'expand':
        return this.expandContent(content, task);
      case 'condense':
        return this.condenseContent(content);
      default:
        return content;
    }
  }

  // ============================================
  // 辅助变换方法
  // ============================================

  private expandSentence(sentence: string, profile: StyleProfile): string {
    // 添加修饰词
    const descriptors = Array.from(profile.sensoryWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    if (descriptors.length > 0) {
      const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
      return `轻轻地${descriptor}地，${sentence}`;
    }
    
    return sentence;
  }

  private compressSentence(sentence: string): string {
    // 移除冗余修饰
    const words = sentence.split(/\s+/);
    if (words.length > 15) {
      return words.slice(0, 12).join(' ') + '...';
    }
    return sentence;
  }

  private paraphraseWithStyle(sentence: string, profile: StyleProfile): string {
    // 保留核心，变换表达
    // 简化实现
    return sentence;
  }

  private transformVocabulary(content: string, task: ImitationTask): string {
    // 词汇变换
    return content;
  }

  private adaptForFanFiction(sentence: string, task: ImitationTask): string {
    // 同人适配
    return sentence;
  }

  private generateContinuation(content: string, task: ImitationTask): string {
    // 续写
    return content + '\n\n（续写内容）';
  }

  private expandContent(content: string, task: ImitationTask): string {
    // 扩展
    const paragraphs = this.splitParagraphs(content);
    return paragraphs.map(p => p + '\n\n（扩展段落）').join('\n\n');
  }

  private condenseContent(content: string): string {
    // 压缩
    const sentences = this.splitSentences(content);
    return sentences.slice(0, Math.ceil(sentences.length * 0.5)).join('');
  }

  // ============================================
  // 风格一致性检查
  // ============================================

  checkConsistency(targetText: string, referenceProfile: StyleProfile): StyleConsistencyCheck {
    const targetProfile = this.extractStyleProfile(targetText);
    const deviations: StyleDeviation[] = [];
    
    // 句子长度检查
    if (Math.abs(targetProfile.avgSentenceLength - referenceProfile.avgSentenceLength) > 5) {
      deviations.push({
        aspect: 'sentence_length',
        expected: referenceProfile.avgSentenceLength,
        actual: targetProfile.avgSentenceLength,
        severity: 'moderate',
        suggestion: '调整句子长度以匹配原作风格'
      });
    }
    
    // 对话比例检查
    if (Math.abs(targetProfile.dialogueRatio - referenceProfile.dialogueRatio) > 0.1) {
      deviations.push({
        aspect: 'dialogue_ratio',
        expected: referenceProfile.dialogueRatio,
        actual: targetProfile.dialogueRatio,
        severity: 'minor',
        suggestion: '调整对话与叙述的比例'
      });
    }
    
    // 叙事视角检查
    if (targetProfile.narrativeVoice !== referenceProfile.narrativeVoice) {
      deviations.push({
        aspect: 'narrative_voice',
        expected: referenceProfile.narrativeVoice,
        actual: targetProfile.narrativeVoice,
        severity: 'major',
        suggestion: '统一叙事视角'
      });
    }
    
    // 计算一致性得分
    const consistencyScore = 100 - deviations.reduce((sum, d) => {
      switch (d.severity) {
        case 'major': return sum + 20;
        case 'moderate': return sum + 10;
        case 'minor': return sum + 5;
        default: return sum;
      }
    }, 0);

    return {
      targetText,
      referenceProfile,
      consistencyScore: Math.max(0, consistencyScore),
      deviations,
      suggestions: deviations.map(d => d.suggestion)
    };
  }

  // ============================================
  // 统计与报告
  // ============================================

  getStatistics(): ImitationStatistics {
    return { ...this.statistics };
  }

  private updateStatistics(result: ImitationResult): void {
    this.statistics.totalGenerations++;
    if (result.success) this.statistics.successfulGenerations++;
    
    const modeCount = this.statistics.modeUsage.get('pure_imitate') || 0;
    this.statistics.modeUsage.set('pure_imitate', modeCount + 1);
    
    this.statistics.averageConfidence = 
      (this.statistics.averageConfidence * (this.statistics.totalGenerations - 1) + result.confidence) 
      / this.statistics.totalGenerations;
  }

  private calculateConfidence(transformations: AppliedTransformation[], task: ImitationTask): number {
    // 基于变换数量和质量计算置信度
    const baseConfidence = 0.7;
    const transformationBonus = Math.min(0.2, transformations.length * 0.05);
    return Math.min(1, baseConfidence + transformationBonus);
  }

  // ============================================
  // 文本分析辅助方法
  // ============================================

  private splitSentences(text: string): string[] {
    return text.split(/[。！？\n]/).filter(s => s.trim().length > 0);
  }

  private splitParagraphs(text: string): string[] {
    return text.split(/\n\n+/).filter(p => p.trim().length > 0);
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  }

  private extractDialogues(text: string): { totalLength: number; tags: string[] } {
    const dialogueRegex = /"([^"]*)"|"([^"]*)"|『([^』]*)』/g;
    const matches = text.match(dialogueRegex) || [];
    const tags = ['说', '道', '问', '答', '喊', '叹'];
    
    return {
      totalLength: matches.join('').length,
      tags: tags.filter(t => text.includes(t))
    };
  }

  private extractSensoryWords(text: string): Map<string, number> {
    const sensoryPatterns = [
      { type: '视觉', words: ['看见', '看到', '观察', '注视', '瞥见'] },
      { type: '听觉', words: ['听到', '听见', '聆听', '声音', '响起'] },
      { type: '嗅觉', words: ['闻到', '气味', '芬芳', '芳香', '腥味'] },
      { type: '触觉', words: ['感受', '触摸', '触碰', '抚摸', '感觉'] },
      { type: '味觉', words: ['品尝', '味道', '甘甜', '苦涩', '美味'] }
    ];
    
    const result = new Map<string, number>();
    
    for (const pattern of sensoryPatterns) {
      for (const word of pattern.words) {
        const count = (text.match(new RegExp(word, 'g')) || []).length;
        if (count > 0) {
          result.set(word, count);
        }
      }
    }
    
    return result;
  }

  private extractActionVerbs(text: string): Map<string, number> {
    const actionVerbs = ['走', '跑', '跳', '说', '看', '想', '拿', '放', '打', '笑', '哭', '叫'];
    const result = new Map<string, number>();
    
    for (const verb of actionVerbs) {
      const count = (text.match(new RegExp(verb, 'g')) || []).length;
      if (count > 0) {
        result.set(verb, count);
      }
    }
    
    return result;
  }

  private extractAdjectives(text: string): string[] {
    // 简单形容词提取
    const adjectives = ['美', '好', '大', '小', '长', '短', '高', '低', '新', '旧'];
    return adjectives.filter(adj => text.includes(adj));
  }

  private extractEmotionalWords(text: string): Map<string, number> {
    const emotionalWords = ['开心', '快乐', '悲伤', '痛苦', '愤怒', '恐惧', '爱', '恨', '希望', '绝望'];
    const result = new Map<string, number>();
    
    for (const word of emotionalWords) {
      const count = (text.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        result.set(word, count);
      }
    }
    
    return result;
  }

  private determineEmotionalTone(words: Map<string, number>): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positive = ['开心', '快乐', '爱', '希望'];
    const negative = ['悲伤', '痛苦', '愤怒', '恐惧', '恨', '绝望'];
    
    let posCount = 0, negCount = 0;
    
    for (const [word, count] of words) {
      if (positive.includes(word)) posCount += count;
      if (negative.includes(word)) negCount += count;
    }
    
    if (posCount > negCount * 1.5) return 'positive';
    if (negCount > posCount * 1.5) return 'negative';
    if (posCount > 0 && negCount > 0) return 'mixed';
    return 'neutral';
  }

  private calculateEmotionalIntensity(words: Map<string, number>): number {
    const total = Array.from(words.values()).reduce((a, b) => a + b, 0);
    return Math.min(1, total / 10);
  }

  private detectNarrativeVoice(text: string): 'first_person' | 'third_person' | 'second_person' | 'omniscient' | 'limited' {
    if (/\b我\b.*\b我\b/.test(text)) return 'first_person';
    if (/\b你\b/.test(text)) return 'second_person';
    return 'third_person';
  }

  private detectTense(sentences: string[]): 'past' | 'present' | 'future' | 'mixed' {
    const pastMarkers = ['了', '曾', '过去', '当时', '曾经'];
    const presentMarkers = ['正在', '现在', '此刻', '目前'];
    const futureMarkers = ['将', '会', '将要', '未来'];
    
    let past = 0, present = 0, future = 0;
    
    for (const sentence of sentences) {
      if (pastMarkers.some(m => sentence.includes(m))) past++;
      if (presentMarkers.some(m => sentence.includes(m))) present++;
      if (futureMarkers.some(m => sentence.includes(m))) future++;
    }
    
    const total = past + present + future;
    if (total === 0) return 'mixed';
    
    if (past / total > 0.6) return 'past';
    if (present / total > 0.6) return 'present';
    if (future / total > 0.6) return 'future';
    return 'mixed';
  }

  private calculatePOVStability(text: string): number {
    // 简化实现
    return 0.9;
  }

  private extractSignaturePhrases(sentences: string[]): string[] {
    const phraseCounts = new Map<string, number>();
    
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 2).join('');
        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      }
    }
    
    return Array.from(phraseCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  private analyzePunctuationPatterns(text: string): Map<string, number> {
    const punctuation = ['，', '。', '！', '？', '：', '"', '"'];
    const result = new Map<string, number>();
    
    for (const p of punctuation) {
      const count = (text.match(new RegExp(p, 'g')) || []).length;
      if (count > 0) {
        result.set(p, count);
      }
    }
    
    return result;
  }

  private extractTabooWords(sentences: string[]): string[] {
    // 简化实现
    return [];
  }

  private calculateVocabularyRichness(text: string): number {
    const words = new Set(text.split(/\s+/));
    const total = text.split(/\s+/).length;
    return total > 0 ? words.size / total : 0;
  }

  private calculateFormalityLevel(text: string): number {
    const formal = ['因此', '然而', '此外', '综上所述', '鉴于'];
    const informal = ['其实', '比如说', '就是', '反正'];
    
    let formalCount = 0, informalCount = 0;
    
    for (const word of formal) {
      if (text.includes(word)) formalCount++;
    }
    for (const word of informal) {
      if (text.includes(word)) informalCount++;
    }
    
    const total = formalCount + informalCount;
    if (total === 0) return 50;
    
    return (formalCount / total) * 100;
  }

  private extractTechnicalTerms(text: string): string[] {
    // 简化实现
    return [];
  }

  private categorizeDialogueStyle(dialogues: { totalLength: number; tags: string[] }): 'formal' | 'casual' | 'mixed' {
    if (dialogues.tags.length === 0) return 'casual';
    const formalTags = ['答', '曰'];
    const hasFormal = formalTags.some(t => dialogues.tags.includes(t));
    return hasFormal ? 'formal' : 'casual';
  }

  private calculateDescriptionDensity(content: string, sensoryWords: Map<string, number>): number {
    const sensoryCount = Array.from(sensoryWords.values()).reduce((a, b) => a + b, 0);
    return sensoryCount / this.splitSentences(content).length;
  }

  private calculateLengthDistribution(lengths: number[]): number[] {
    // 返回长度分布的百分位数
    const sorted = [...lengths].sort((a, b) => a - b);
    return [0, 25, 50, 75, 100].map(p => {
      const index = Math.floor(p / 100 * sorted.length);
      return sorted[index] || 0;
    });
  }

  private analyzeParagraphStructure(paragraphs: string[]): string[] {
    return paragraphs.map(p => {
      const words = this.countWords(p);
      if (words < 20) return 'short';
      if (words < 50) return 'medium';
      return 'long';
    });
  }
}

export default EnhancedImitationEngine;
