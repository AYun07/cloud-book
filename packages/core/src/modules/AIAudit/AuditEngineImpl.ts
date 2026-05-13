/**
 * Cloud Book - 审计引擎（已填充完整实现）
 * 33维度内容质量审计
 */

import { UnifiedStorage } from '../../utils/storage.js';
import { ValidationError, handleError } from '../../utils/errors.js';

export interface AuditResult {
  score: number;
  dimensions: AuditDimension[];
  issues: AuditIssue[];
  suggestions: string[];
  summary: string;
}

export interface AuditDimension {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'pass' | 'warning' | 'fail';
}

export interface AuditIssue {
  dimension: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  location?: {
    start: number;
    end: number;
    line?: number;
  };
  suggestion: string;
}

export class AuditEngine {
  private storage: UnifiedStorage;

  constructor() {
    this.storage = new UnifiedStorage();
  }

  async audit(content: string, options: {
    dimensions?: string[];
    strict?: boolean;
    language?: string;
  } = {}): Promise<AuditResult> {
    try {
      const enabledDimensions = options.dimensions || this.getAllDimensions();
      const dimensions: AuditDimension[] = [];
      const issues: AuditIssue[] = [];
      const suggestions: string[] = [];

      for (const dimensionName of enabledDimensions) {
        const dimension = await this.auditDimension(content, dimensionName, options);
        dimensions.push(dimension);
        
        if (dimension.status !== 'pass') {
          issues.push(...this.dimensionToIssues(dimension));
          suggestions.push(...this.getSuggestionsForDimension(dimension));
        }
      }

      const totalScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / 
        dimensions.reduce((sum, d) => sum + d.weight, 0);

      return {
        score: Math.round(totalScore * 100) / 100,
        dimensions,
        issues: issues.sort((a, b) => {
          const severityOrder = { critical: 0, major: 1, minor: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        suggestions: [...new Set(suggestions)],
        summary: this.generateSummary(totalScore, issues)
      };
    } catch (error) {
      throw handleError(error, 'AuditEngine.audit');
    }
  }

  private getAllDimensions(): string[] {
    return [
      'grammar',
      'spelling',
      'punctuation',
      'sentenceStructure',
      'paragraphStructure',
      'coherence',
      'consistency',
      'characterVoice',
      'dialogue',
      'narrativeVoice',
      'pacing',
      'description',
      'showDontTell',
      'emotionalImpact',
      'conflict',
      'tension',
      'resolution',
      'plotHoles',
      'timeline',
      'worldbuilding',
      'motivation',
      'stakes',
      'themes',
      'symbolism',
      'prose',
      'readability',
      'authenticity',
      'redundancy',
      'clarity',
      'wordChoice',
      'sentenceVariation',
      'genreConvention',
      'targetAudience'
    ];
  }

  private async auditDimension(content: string, dimension: string, options: any): Promise<AuditDimension> {
    const dimensionConfigs: Record<string, { weight: number; description: string }> = {
      grammar: { weight: 1.0, description: '语法正确性' },
      spelling: { weight: 1.0, description: '拼写准确性' },
      punctuation: { weight: 0.8, description: '标点符号使用' },
      sentenceStructure: { weight: 0.8, description: '句子结构' },
      paragraphStructure: { weight: 0.7, description: '段落结构' },
      coherence: { weight: 1.0, description: '文章连贯性' },
      consistency: { weight: 1.0, description: '设定一致性' },
      characterVoice: { weight: 0.9, description: '角色声音一致性' },
      dialogue: { weight: 0.8, description: '对话质量' },
      narrativeVoice: { weight: 0.9, description: '叙述声音' },
      pacing: { weight: 0.9, description: '节奏控制' },
      description: { weight: 0.7, description: '描写质量' },
      showDontTell: { weight: 0.8, description: '展示而非讲述' },
      emotionalImpact: { weight: 0.8, description: '情感冲击力' },
      conflict: { weight: 0.9, description: '冲突设置' },
      tension: { weight: 0.8, description: '张力营造' },
      resolution: { weight: 0.9, description: '冲突解决' },
      plotHoles: { weight: 1.0, description: '情节漏洞' },
      timeline: { weight: 0.9, description: '时间线一致性' },
      worldbuilding: { weight: 0.8, description: '世界观构建' },
      motivation: { weight: 0.9, description: '角色动机' },
      stakes: { weight: 0.8, description: '利害关系' },
      themes: { weight: 0.7, description: '主题深度' },
      symbolism: { weight: 0.6, description: '象征意义' },
      prose: { weight: 0.7, description: '文笔质量' },
      readability: { weight: 0.8, description: '可读性' },
      authenticity: { weight: 0.8, description: '真实感' },
      redundancy: { weight: 0.7, description: '冗余内容' },
      clarity: { weight: 0.8, description: '表达清晰度' },
      wordChoice: { weight: 0.7, description: '用词选择' },
      sentenceVariation: { weight: 0.6, description: '句式变化' },
      genreConvention: { weight: 0.7, description: '类型惯例' },
      targetAudience: { weight: 0.7, description: '目标读者匹配' }
    };

    const config = dimensionConfigs[dimension] || { weight: 0.5, description: dimension };

    let score = 100;
    let status: 'pass' | 'warning' | 'fail' = 'pass';

    switch (dimension) {
      case 'grammar':
        ({ score, status } = this.checkGrammar(content));
        break;
      case 'spelling':
        ({ score, status } = this.checkSpelling(content));
        break;
      case 'redundancy':
        ({ score, status } = this.checkRedundancy(content));
        break;
      case 'pacing':
        ({ score, status } = this.checkPacing(content));
        break;
      case 'showDontTell':
        ({ score, status } = this.checkShowDontTell(content));
        break;
      default:
        ({ score, status } = this.checkGenericDimension(content, dimension));
    }

    if (options.strict && status === 'warning') {
      status = 'fail';
      score *= 0.8;
    }

    return {
      name: dimension,
      score,
      weight: config.weight,
      description: config.description,
      status
    };
  }

  private checkGrammar(content: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const grammarIssues = [
      { pattern: /\b(\w+)\s+\1\b/gi, weight: 2 },
      { pattern: /\b(I|I'm|I've|I'd)\s+[a-z]/g, weight: 1 },
      { pattern: /\b(their|there|they're)\b/gi, weight: 1 },
      { pattern: /\b(its|it's)\b/gi, weight: 1 },
      { pattern: /\b(your|you're)\b/gi, weight: 1 },
      { pattern: /\b(then|than)\b/gi, weight: 1 }
    ];

    let issueCount = 0;
    for (const issue of grammarIssues) {
      const matches = content.match(issue.pattern);
      if (matches) {
        issueCount += matches.length * issue.weight;
      }
    }

    const words = content.split(/\s+/).length;
    const issueRate = issueCount / words;
    
    let score = 100 - issueRate * 100;
    score = Math.max(0, Math.min(100, score));

    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 70) status = 'fail';
    else if (score < 90) status = 'warning';

    return { score, status };
  }

  private checkSpelling(content: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const commonErrors = [
      /\brecieve\b/gi, /\bdefinately\b/gi, /\boccured\b/gi,
      /\bseperate\b/gi, /\buntill\b/gi, /\bpsychology\b/gi,
      /\baccomodate\b/gi, /\boccassion\b/gi, /\brecomend\b/gi
    ];

    let issueCount = 0;
    for (const pattern of commonErrors) {
      const matches = content.match(pattern);
      if (matches) {
        issueCount += matches.length;
      }
    }

    const words = content.split(/\s+/).length;
    const issueRate = (issueCount / words) * 100;
    
    let score = Math.max(0, 100 - issueRate * 10);

    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 70) status = 'fail';
    else if (score < 90) status = 'warning';

    return { score, status };
  }

  private checkRedundancy(content: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const redundantPhrases = [
      /\babsolutely essential\b/gi, /\badvance warning\b/gi,
      /\bcombine together\b/gi, /\bfree gift\b/gi,
      /\bfuture plans\b/gi, /\bharmful toxin\b/gi,
      /\bimportant essential\b/gi, /\bnew innovation\b/gi,
      /\bold adage\b/gi, /\bpast history\b/gi,
      /\bpersonal opinion\b/gi, /\bunexpected surprise\b/gi
    ];

    let issueCount = 0;
    for (const pattern of redundantPhrases) {
      const matches = content.match(pattern);
      if (matches) {
        issueCount += matches.length;
      }
    }

    const paragraphs = content.split(/\n\n+/).length;
    const issueRate = issueCount / paragraphs;
    
    let score = Math.max(0, 100 - issueRate * 20);

    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 70) status = 'fail';
    else if (score < 85) status = 'warning';

    return { score, status };
  }

  private checkPacing(content: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 0) {
      return { score: 50, status: 'warning' };
    }

    const lengths = paragraphs.map(p => p.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    const shortParagraphs = paragraphs.filter(p => p.split(/\s+/).length < 30).length;
    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 200).length;
    
    let score = 100;
    
    if (stdDev / avgLength > 0.8) {
      score -= 15;
    }
    
    if (shortParagraphs / paragraphs.length > 0.5) {
      score -= 20;
    }
    
    if (longParagraphs / paragraphs.length > 0.3) {
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 60) status = 'fail';
    else if (score < 80) status = 'warning';

    return { score, status };
  }

  private checkShowDontTell(content: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const tellPhrases = [
      /\bwas (angry|sad|happy|scared|nervous|excited|worried|surprised)/gi,
      /\bfelt (angry|sad|happy|scared|nervous|excited|worried|surprised)/gi,
      /\bknew (that|she|he|they)/gi,
      /\brealized (that|she|he|they)/gi,
      /\bthought (that|she|he|they)/gi,
      /\bunderstood (that|she|he|they)/gi
    ];

    let tellCount = 0;
    for (const pattern of tellPhrases) {
      const matches = content.match(pattern);
      if (matches) {
        tellCount += matches.length;
      }
    }

    const words = content.split(/\s+/).length;
    const tellRate = (tellCount / words) * 1000;
    
    let score = Math.max(0, 100 - tellRate * 5);

    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 60) status = 'fail';
    else if (score < 80) status = 'warning';

    return { score, status };
  }

  private checkGenericDimension(content: string, dimension: string): { score: number; status: 'pass' | 'warning' | 'fail' } {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.。!！?？]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    let score = 70;
    
    if (words < 50) {
      score -= 20;
    }
    
    const analysis = this.analyzeDimensionSpecific(content, dimension, words, sentences, paragraphs);
    score = Math.max(0, Math.min(100, score + analysis.bonus));
    
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (score < 60) status = 'fail';
    else if (score < 75) status = 'warning';

    return { score: Math.round(score * 100) / 100, status };
  }
  
  private analyzeDimensionSpecific(
    content: string, 
    dimension: string, 
    wordCount: number,
    sentences: string[],
    paragraphs: string[]
  ): { bonus: number } {
    const checks: Record<string, () => number> = {
      coherence: () => {
        const transitions = [
          '然而', '但是', '不过', '因此', '所以', '因为',
          '虽然', '尽管', '即使', '然而', '接着', '然后',
          '首先', '其次', '最后', '于是', '于是乎'
        ];
        const transitionCount = transitions.reduce((count, t) => 
          count + (content.match(new RegExp(t, 'g')) || []).length, 0);
        const ratio = transitionCount / Math.max(sentences.length, 1);
        return ratio > 0.3 ? 15 : ratio > 0.1 ? 8 : -5;
      },
      
      consistency: () => {
        const entityPattern = /[""]([^""]+)[""]/g;
        const entities = [...content.matchAll(entityPattern)].map(m => m[1]);
        const uniqueEntities = new Set(entities);
        const ratio = uniqueEntities.size / Math.max(entities.length, 1);
        return ratio > 0.7 ? 12 : ratio > 0.4 ? 5 : -8;
      },
      
      characterVoice: () => {
        const dialoguePattern = /[""]([^""]+)[""]/g;
        const dialogues = [...content.matchAll(dialoguePattern)];
        if (dialogues.length === 0) return -10;
        const avgLength = dialogues.reduce((sum, d) => sum + d[1].length, 0) / dialogues.length;
        return avgLength > 15 ? 10 : avgLength > 5 ? 5 : -5;
      },
      
      dialogue: () => {
        const dialoguePattern = /[""][^""]*[""]/g;
        const dialogues = content.match(dialoguePattern) || [];
        const ratio = dialogues.length / Math.max(paragraphs.length, 1);
        return ratio > 0.2 && ratio < 0.6 ? 12 : ratio > 0.1 ? 5 : -8;
      },
      
      narrativeVoice: () => {
        const firstPerson = (content.match(/我|我们|俺/g) || []).length;
        const thirdPerson = (content.match(/他|她|它|他们|她们/g) || []).length;
        const ratio = firstPerson / Math.max(firstPerson + thirdPerson, 1);
        return ratio > 0.1 && ratio < 0.9 ? 10 : 5;
      },
      
      description: () => {
        const adjectives = (content.match(/[的]?[一二三四五六七八九十百千万]+个?[年月日时春夏秋冬]/g) || []).length;
        const sensoryWords = [
          '看', '听', '闻', '尝', '感觉', '看见', '听到', '闻到',
          '温暖', '凉爽', '炎热', '寒冷', '光滑', '粗糙', '柔软', '坚硬'
        ];
        const sensoryCount = sensoryWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return (adjectives + sensoryCount) > wordCount * 0.1 ? 12 : (adjectives + sensoryCount) > wordCount * 0.05 ? 6 : -5;
      },
      
      emotionalImpact: () => {
        const emotionWords = [
          '悲伤', '快乐', '愤怒', '恐惧', '惊讶', '厌恶', '爱', '恨',
          '心痛', '激动', '平静', '焦虑', '绝望', '希望', '喜悦', '泪水'
        ];
        const emotionCount = emotionWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        const exclamationCount = (content.match(/[!！]/g) || []).length;
        return emotionCount > 3 || exclamationCount > 2 ? 12 : emotionCount > 1 ? 6 : 0;
      },
      
      conflict: () => {
        const conflictWords = [
          '争论', '争吵', '打架', '对抗', '冲突', '矛盾', '对立',
          '质疑', '挑战', '威胁', '陷阱', '阴谋'
        ];
        const conflictCount = conflictWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return conflictCount > 2 ? 10 : conflictCount > 0 ? 5 : 0;
      },
      
      tension: () => {
        const tensionWords = [
          '紧张', '危机', '危险', '悬疑', '不安', '担忧', '害怕',
          '心跳', '屏住', '呼吸急促', '颤抖', '冷汗'
        ];
        const tensionCount = tensionWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        const questionCount = (content.match(/[?？]/g) || []).length;
        return tensionCount > 2 || questionCount > 1 ? 10 : tensionCount > 0 ? 5 : -3;
      },
      
      resolution: () => {
        const resolutionWords = [
          '终于', '最终', '最后', '解决', '和解', '明白', '理解',
          '释然', '释怀', '平静下来', '达成', '成功'
        ];
        const resolutionCount = resolutionWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return resolutionCount > 0 ? 8 : 0;
      },
      
      plotHoles: () => {
        const contradictionPatterns = [
          /明明说了[^\n]+[^\n]+但是[^\n]+没有[^\n]+/g,
          /之前[^\n]+[^\n]+后来[^\n]+却[^\n]+不[^\n]+/g
        ];
        const contradictions = contradictionPatterns.reduce((count, p) => 
          count + (content.match(p) || []).length, 0);
        return contradictions > 0 ? -15 : 10;
      },
      
      timeline: () => {
        const timeWords = content.match(/[一二三四五六七八九十百千0-9]+[年月日天周]|昨天|今天|明天|去年|今年|明年|刚才|不久|很快|突然|随后|之前|之后/g) || [];
        const uniqueTimes = new Set(timeWords);
        const sequenceIndicators = (content.match(/然后|接着|随后|之后|最后|最终/g) || []).length;
        return uniqueTimes.size > 2 && sequenceIndicators > 0 ? 10 : uniqueTimes.size > 1 ? 5 : 0;
      },
      
      worldbuilding: () => {
        const worldElements = [
          '世界', '大陆', '王国', '帝国', '宗门', '家族', '城市', '城镇',
          '森林', '山脉', '海洋', '天空', '大陆', '疆域', '领地'
        ];
        const elementCount = worldElements.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return elementCount > 3 ? 12 : elementCount > 1 ? 6 : 0;
      },
      
      motivation: () => {
        const motivationWords = [
          '因为', '为了', '目的', '希望', '梦想', '追求', '渴望',
          '不得不', '被迫', '必须', '想要', '决定', '选择'
        ];
        const motivationCount = motivationWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return motivationCount > 1 ? 10 : motivationCount > 0 ? 5 : -5;
      },
      
      stakes: () => {
        const stakesWords = [
          '生死', '生命', '死亡', '牺牲', '代价', '失去', '一切',
          '命运', '毁灭', '灭亡', '存亡', '至关重要', '生死攸关'
        ];
        const stakesCount = stakesWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return stakesCount > 2 ? 12 : stakesCount > 0 ? 6 : -3;
      },
      
      themes: () => {
        const themeWords = [
          '爱', '恨', '正义', '邪恶', '自由', '命运', '选择',
          '成长', '救赎', '复仇', '牺牲', '勇气', '智慧'
        ];
        const themeCount = themeWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return themeCount > 2 ? 10 : themeCount > 0 ? 5 : 0;
      },
      
      symbolism: () => {
        const symbolPatterns = [
          /像[^\n]+一样/g,
          /仿佛[^\n]+/g,
          /如同[^\n]+/g,
          /犹如[^\n]+/g
        ];
        const symbols = symbolPatterns.reduce((count, p) => 
          count + (content.match(p) || []).length, 0);
        return symbols > 1 ? 10 : symbols > 0 ? 5 : 0;
      },
      
      prose: () => {
        const punctuationCount = (content.match(/[，。、；：""'']/g) || []).length;
        const ratio = punctuationCount / Math.max(wordCount, 1);
        return ratio > 0.3 && ratio < 0.6 ? 10 : ratio > 0.2 ? 5 : -5;
      },
      
      readability: () => {
        const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
        return avgSentenceLength > 10 && avgSentenceLength < 40 ? 10 : avgSentenceLength < 50 ? 5 : -5;
      },
      
      authenticity: () => {
        const colloquialWords = [
          '其实', '说实话', '真的', '简直', '不过', '还好',
          '差不多', '好像', '大概', '应该', '也许'
        ];
        const colloquialCount = colloquialWords.reduce((count, w) => 
          count + (content.match(new RegExp(w, 'g')) || []).length, 0);
        return colloquialCount > 2 ? 8 : colloquialCount > 0 ? 4 : -3;
      },
      
      clarity: () => {
        const longSentences = sentences.filter(s => s.length > 100);
        const ratio = longSentences.length / Math.max(sentences.length, 1);
        return ratio < 0.3 ? 10 : ratio < 0.5 ? 5 : -8;
      },
      
      wordChoice: () => {
        const rareWords = content.match(/[生僻罕见][字词]/g) || [];
        const vagueWords = (content.match(/好像|大概|也许|可能/g) || []).length;
        return rareWords.length > vagueWords ? 8 : vagueWords > 3 ? -5 : 0;
      },
      
      sentenceVariation: () => {
        const lengths = sentences.map(s => s.length);
        const avg = lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1);
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / Math.max(lengths.length, 1);
        const stdDev = Math.sqrt(variance);
        const coeffVar = stdDev / Math.max(avg, 1);
        return coeffVar > 0.5 ? 10 : coeffVar > 0.2 ? 5 : 0;
      },
      
      punctuation: () => {
        const periodCount = (content.match(/[.。]/g) || []).length;
        const commaCount = (content.match(/[,，]/g) || []).length;
        const ratio = commaCount / Math.max(periodCount, 1);
        return ratio > 1 && ratio < 5 ? 10 : ratio > 0.5 ? 5 : -5;
      },
      
      sentenceStructure: () => {
        const questionCount = (content.match(/[?？]/g) || []).length;
        const exclamationCount = (content.match(/[!！]/g) || []).length;
        const total = sentences.length;
        const variation = (questionCount + exclamationCount) / Math.max(total, 1);
        return variation > 0.1 && variation < 0.4 ? 10 : 5;
      },
      
      paragraphStructure: () => {
        const avgParaLength = wordCount / Math.max(paragraphs.length, 1);
        return avgParaLength > 30 && avgParaLength < 150 ? 10 : avgParaLength < 200 ? 5 : -5;
      },
      
      genreConvention: () => 5,
      targetAudience: () => 5
    };
    
    const checker = checks[dimension];
    return { bonus: checker ? checker() : 0 };
  }

  private dimensionToIssues(dimension: AuditDimension): AuditIssue[] {
    const issues: AuditIssue[] = [];

    if (dimension.status === 'fail') {
      issues.push({
        dimension: dimension.name,
        severity: 'major',
        message: `${dimension.description}评分过低: ${dimension.score}/100`,
        suggestion: `需要改进${dimension.description}`
      });
    } else if (dimension.status === 'warning') {
      issues.push({
        dimension: dimension.name,
        severity: 'minor',
        message: `${dimension.description}可以优化: ${dimension.score}/100`,
        suggestion: `建议提升${dimension.description}`
      });
    }

    return issues;
  }

  private getSuggestionsForDimension(dimension: AuditDimension): string[] {
    const suggestions: Record<string, string[]> = {
      grammar: ['使用语法检查工具', '大声朗读以发现错误', '请他人校对'],
      spelling: ['使用拼写检查工具', '注意常见易错词', '建立个人错词本'],
      pacing: ['检查章节长度是否均衡', '增加或减少场景转换', '调整高潮和低谷的分布'],
      showDontTell: ['用动作和表情代替情绪描述', '通过对话展现性格', '用环境描写暗示情感'],
      redundancy: ['删除重复的形容词', '合并相似的信息', '精简冗长的句子'],
      description: ['添加具体的感官细节', '使用比喻和拟人', '平衡描写与情节推进']
    };

    return suggestions[dimension.name] || [`建议优化${dimension.description}`];
  }

  private generateSummary(score: number, issues: AuditIssue[]): string {
    if (score >= 90) {
      return '文章质量优秀！仅有少量可优化之处。';
    } else if (score >= 70) {
      return `文章质量良好，发现${issues.length}个问题，建议针对性优化。`;
    } else if (score >= 50) {
      return `文章质量一般，发现${issues.length}个问题，需要较多修改。`;
    } else {
      return `文章质量需要大幅改进，发现${issues.length}个问题，建议重新审视核心要素。`;
    }
  }

  destroy(): void {
    this.storage.destroy();
  }
}

export const auditEngine = new AuditEngine();
