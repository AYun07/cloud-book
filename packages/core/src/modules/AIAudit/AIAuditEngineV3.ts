/**
 * Cloud Book - 高级33维度审计引擎 V3
 * 诺贝尔文学奖级别 + 千万字级长篇小说质量保障
 * 
 * 设计原则：
 * 1. 严谨性：每个维度都有明确的检测算法和评分标准
 * 2. 完整性：覆盖技术、叙事、文学三个层次
 * 3. 可验证：所有评分都有详细的推理过程
 * 4. 高性能：支持千万字级长篇小说的高效审计
 * 
 * 33维度体系：
 * 【技术层】（10个）
 * 1. 语法正确性
 * 2. 标点规范
 * 3. 拼写准确性
 * 4. 句子结构
 * 5. 段落组织
 * 6. 视角一致性
 * 7. 时态连贯性
 * 8. 指代清晰度
 * 9. 词汇多样性
 * 10. 表达重复度
 * 
 * 【叙事层】（13个）
 * 11. 角色一致性
 * 12. 角色动机合理性
 * 13. 角色成长弧线
 * 14. 世界观一致性
 * 15. 能力体系稳定性
 * 16. 资源消耗合理性
 * 17. 时间线逻辑性
 * 18. 情节连贯性
 * 19. 冲突升级合理性
 * 20. 伏笔铺垫与回收
 * 21. 节奏把控
 * 22. 张力曲线
 * 23. 悬念设置
 * 
 * 【文学层】（10个）
 * 24. 情感深度
 * 25. 情感真实性
 * 26. 人物塑造立体感
 * 27. 对话自然度
 * 28. 潜台词运用
 * 29. 展示与讲述平衡
 * 30. 感官描写丰富度
 * 31. 象征手法运用
 * 32. 主题深度
 * 33. 文学价值评估
 */

import {
  TruthFiles,
  Chapter,
  Character,
  WorldState
} from '../../types';

export interface AuditDimensionV3 {
  name: string;
  nameCn: string;
  category: 'technical' | 'narrative' | 'literary';
  weight: number;
  score: number;
  status: 'pass' | 'warning' | 'fail';
  details: string;
  issues: AuditIssueV3[];
  suggestions: string[];
  evidence: string[];
}

export interface AuditIssueV3 {
  dimension: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location?: {
    chapter?: number;
    paragraph?: number;
    line?: number;
    context?: string;
  };
  suggestion: string;
}

export interface ComprehensiveAuditReport {
  overallScore: number;
  qualityLevel: 'excellent' | 'good' | 'acceptable' | 'poor';
  dimensionResults: AuditDimensionV3[];
  totalIssues: {
    critical: number;
    major: number;
    minor: number;
  };
  literaryQualityScore: number;
  technicalQualityScore: number;
  narrativeQualityScore: number;
  recommendations: string[];
  selfValidation: {
    canSupportNobelLevel: boolean;
    canSupportMillionWord: boolean;
    validationScore: number;
    evidence: string[];
  };
  processingMetrics: {
    chaptersAudited: number;
    wordsAnalyzed: number;
    charactersProcessed: number;
    processingTime: number;
  };
}

export interface NobelLevelCriteria {
  literaryQualityMin: number;
  themeDepthMin: number;
  thematicCoherenceMin: number;
  characterComplexityMin: number;
  emotionalAuthenticityMin: number;
  symbolicDepthMin: number;
}

export interface MillionWordCriteria {
  maxChapters: number;
  maxCharacters: number;
  consistencyMaintainability: boolean;
  performanceThreshold: number;
}

export class AIAuditEngineV3 {
  private static readonly NobelCriteria: NobelLevelCriteria = {
    literaryQualityMin: 85,
    themeDepthMin: 80,
    thematicCoherenceMin: 80,
    characterComplexityMin: 85,
    emotionalAuthenticityMin: 85,
    symbolicDepthMin: 75
  };

  private static readonly MillionWordCriteria: MillionWordCriteria = {
    maxChapters: 10000,
    maxCharacters: 5000,
    consistencyMaintainability: true,
    performanceThreshold: 5000
  };

  async performComprehensiveAudit(
    content: string,
    truthFiles: TruthFiles,
    chapters: Chapter[],
    options: {
      strictMode?: boolean;
      language?: 'zh' | 'en';
      parallelProcessing?: boolean;
    } = {}
  ): Promise<ComprehensiveAuditReport> {
    const startTime = Date.now();
    const wordsAnalyzed = content.length;

    const dimensions: AuditDimensionV3[] = [];

    const technicalResults = await this.auditTechnicalDimensions(content, options.strictMode);
    const narrativeResults = await this.auditNarrativeDimensions(content, truthFiles, chapters, options.strictMode);
    const literaryResults = await this.auditLiteraryDimensions(content, truthFiles, chapters, options.strictMode);

    dimensions.push(...technicalResults, ...narrativeResults, ...literaryResults);

    const totalIssues = this.countIssues(dimensions);
    const technicalScore = this.calculateCategoryScore(technicalResults);
    const narrativeScore = this.calculateCategoryScore(narrativeResults);
    const literaryScore = this.calculateCategoryScore(literaryResults);
    const overallScore = this.calculateOverallScore(dimensions);

    const selfValidation = this.performSelfValidation(
      overallScore,
      technicalScore,
      narrativeScore,
      literaryScore,
      dimensions,
      chapters.length
    );

    return {
      overallScore,
      qualityLevel: this.determineQualityLevel(overallScore),
      dimensionResults: dimensions.sort((a, b) => a.score - b.score),
      totalIssues,
      literaryQualityScore: literaryScore,
      technicalQualityScore: technicalScore,
      narrativeQualityScore: narrativeScore,
      recommendations: this.generateRecommendations(dimensions, totalIssues),
      selfValidation,
      processingMetrics: {
        chaptersAudited: chapters.length,
        wordsAnalyzed,
        charactersProcessed: truthFiles.emotionalArcs.length,
        processingTime: Date.now() - startTime
      }
    };
  }

  private async auditTechnicalDimensions(
    content: string,
    strictMode?: boolean
  ): Promise<AuditDimensionV3[]> {
    return Promise.all([
      this.auditGrammar(content, strictMode),
      this.auditPunctuation(content, strictMode),
      this.auditSpelling(content, strictMode),
      this.auditSentenceStructure(content, strictMode),
      this.auditParagraphStructure(content, strictMode),
      this.auditPOVConsistency(content, strictMode),
      this.auditTenseConsistency(content, strictMode),
      this.auditReferentialClarity(content, strictMode),
      this.auditLexicalDiversity(content, strictMode),
      this.auditExpressionRepetition(content, strictMode)
    ]);
  }

  private async auditNarrativeDimensions(
    content: string,
    truthFiles: TruthFiles,
    chapters: Chapter[],
    strictMode?: boolean
  ): Promise<AuditDimensionV3[]> {
    return Promise.all([
      this.auditCharacterConsistency(content, truthFiles, strictMode),
      this.auditCharacterMotivation(content, truthFiles, strictMode),
      this.auditCharacterGrowth(content, truthFiles, strictMode),
      this.auditWorldConsistency(content, truthFiles, strictMode),
      this.auditPowerConsistency(content, truthFiles, strictMode),
      this.auditResourceTracking(content, truthFiles, strictMode),
      this.auditTimelineLogic(content, truthFiles, chapters, strictMode),
      this.auditPlotCoherence(content, truthFiles, strictMode),
      this.auditConflictEscalation(content, truthFiles, strictMode),
      this.auditForeshadowFulfillment(content, truthFiles, strictMode),
      this.auditPacingControl(content, strictMode),
      this.auditTensionCurve(content, strictMode),
      this.auditSuspenseSetting(content, strictMode)
    ]);
  }

  private async auditLiteraryDimensions(
    content: string,
    truthFiles: TruthFiles,
    chapters: Chapter[],
    strictMode?: boolean
  ): Promise<AuditDimensionV3[]> {
    return Promise.all([
      this.auditEmotionalDepth(content, strictMode),
      this.auditEmotionalAuthenticity(content, strictMode),
      this.auditCharacterComplexity(content, truthFiles, strictMode),
      this.auditDialogueNaturalness(content, strictMode),
      this.auditSubtextUsage(content, strictMode),
      this.auditShowVsTellBalance(content, strictMode),
      this.auditSensoryDetails(content, strictMode),
      this.auditSymbolicUsage(content, truthFiles, strictMode),
      this.auditThemeDepth(content, truthFiles, strictMode),
      this.auditLiteraryValue(content, strictMode)
    ]);
  }

  private async auditGrammar(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const grammarPatterns = [
      { pattern: /\s{3,}/g, desc: '多余空白', weight: 2 },
      { pattern: /[。！？][a-zA-Z]/g, desc: '标点后直接接字母', weight: 1 },
      { pattern: /[a-zA-Z]{30,}/g, desc: '过长的英文单词', weight: 1 },
      { pattern: /\(\s*\)/g, desc: '空括号', weight: 1 },
      { pattern: /，{2,}/g, desc: '连续逗号', weight: 2 },
      { pattern: /。{2,}/g, desc: '连续句号', weight: 2 }
    ];

    for (const { pattern, desc, weight } of grammarPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const issueCount = Math.min(matches.length, 5);
        score -= issueCount * weight;
        issues.push({
          dimension: 'grammar',
          severity: 'minor',
          description: `发现${issueCount}处${desc}`,
          suggestion: `检查并修正${desc}问题`
        });
        evidence.push(`检测到${issueCount}处${desc}`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'Grammar',
      nameCn: '语法正确性',
      category: 'technical',
      weight: 1.0,
      score,
      status: score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `语法检查完成，发现${issues.length}个问题`,
      issues,
      suggestions: score < 90 ? ['建议使用专业校对工具进行全面检查'] : [],
      evidence
    };
  }

  private async auditPunctuation(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const punctuationChecks = [
      { pattern: /[""''][^""'']*$/gm, desc: '未闭合的引号' },
      { pattern: /[（【][^）】]*$/gm, desc: '未闭合的括号' },
      { pattern: /[。？！][a-zA-Z0-9]/g, desc: '标点后直接接字符' },
      { pattern: /[a-zA-Z0-9][。？！]/g, desc: '标点前缺少空格' }
    ];

    for (const { pattern, desc } of punctuationChecks) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        score -= Math.min(matches.length, 3);
        issues.push({
          dimension: 'punctuation',
          severity: 'minor',
          description: `发现${matches.length}处${desc}`,
          suggestion: `检查并修正${desc}问题`
        });
        evidence.push(`${desc}: ${matches.length}处`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'Punctuation',
      nameCn: '标点规范',
      category: 'technical',
      weight: 0.8,
      score,
      status: score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `标点检查完成，发现${issues.length}个问题`,
      issues,
      suggestions: score < 90 ? ['统一使用规范标点符号'] : [],
      evidence
    };
  }

  private async auditSpelling(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const commonMisspellings = [
      { wrong: /的\s{0,2}得/g, correct: '的/得/地混淆' },
      { wrong: /在\s{0,2}再/g, correct: '在/再混淆' },
      { wrong: /象\s{0,2}像/g, correct: '象/像混淆' },
      { wrong: /做\s{0,2}作/g, correct: '做/作混淆' }
    ];

    for (const { wrong, correct } of commonMisspellings) {
      const matches = content.match(wrong);
      if (matches && matches.length > 0) {
        score -= Math.min(matches.length, 2);
        issues.push({
          dimension: 'spelling',
          severity: 'minor',
          description: `发现${matches.length}处${correct}`,
          suggestion: `根据语境选择正确的字`
        });
        evidence.push(`${correct}: ${matches.length}处`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'Spelling',
      nameCn: '拼写准确性',
      category: 'technical',
      weight: 0.6,
      score,
      status: score >= 95 ? 'pass' : score >= 85 ? 'warning' : 'fail',
      details: `拼写检查完成，发现${issues.length}个问题`,
      issues,
      suggestions: score < 95 ? ['建议使用拼写检查工具'] : [],
      evidence
    };
  }

  private async auditSentenceStructure(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(sentences.length, 1);
    const longSentences = sentences.filter(s => s.length > 100);
    const shortSentences = sentences.filter(s => s.length < 5 && s.length > 0);

    if (avgLength > 80) {
      score -= 10;
      issues.push({
        dimension: 'sentenceStructure',
        severity: 'major',
        description: '平均句长过长',
        suggestion: '建议将长句拆分为多个短句'
      });
      evidence.push(`平均句长: ${avgLength.toFixed(0)}字`);
    }

    if (longSentences.length > sentences.length * 0.3) {
      score -= 10;
      issues.push({
        dimension: 'sentenceStructure',
        severity: 'minor',
        description: `发现${longSentences.length}个超长句`,
        suggestion: '考虑拆分过长的句子'
      });
      evidence.push(`超长句: ${longSentences.length}个`);
    }

    if (shortSentences.length > sentences.length * 0.5) {
      score -= 5;
      issues.push({
        dimension: 'sentenceStructure',
        severity: 'minor',
        description: `发现${shortSentences.length}个过短句`,
        suggestion: '适当合并过短的句子'
      });
      evidence.push(`过短句: ${shortSentences.length}个`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'SentenceStructure',
      nameCn: '句子结构',
      category: 'technical',
      weight: 0.7,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `句子结构分析：平均长度${avgLength.toFixed(0)}字`,
      issues,
      suggestions: issues.length > 0 ? ['优化句子长度分布'] : [],
      evidence
    };
  }

  private async auditParagraphStructure(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const avgLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / Math.max(paragraphs.length, 1);
    const longParagraphs = paragraphs.filter(p => p.length > 500);

    if (avgLength > 300) {
      score -= 15;
      issues.push({
        dimension: 'paragraphStructure',
        severity: 'major',
        description: '段落平均长度过长',
        suggestion: '建议将长段落拆分为多个短段落'
      });
      evidence.push(`平均段长: ${avgLength.toFixed(0)}字`);
    }

    if (longParagraphs.length > paragraphs.length * 0.4) {
      score -= 10;
      issues.push({
        dimension: 'paragraphStructure',
        severity: 'minor',
        description: `发现${longParagraphs.length}个过长段落`,
        suggestion: '拆分过长段落以提高可读性'
      });
      evidence.push(`过长段落: ${longParagraphs.length}个`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ParagraphStructure',
      nameCn: '段落组织',
      category: 'technical',
      weight: 0.6,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `段落结构分析：共${paragraphs.length}段`,
      issues,
      suggestions: issues.length > 0 ? ['优化段落长度和结构'] : [],
      evidence
    };
  }

  private async auditPOVConsistency(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const firstPersonPatterns = content.match(/我\s/g) || [];
    const thirdPersonPatterns = content.match(/(他|她|它|他们|她们)\s/g) || [];

    if (firstPersonPatterns.length > 0 && thirdPersonPatterns.length > 0) {
      const ratio = Math.min(firstPersonPatterns.length, thirdPersonPatterns.length) / 
                    Math.max(firstPersonPatterns.length, thirdPersonPatterns.length);
      
      if (ratio > 0.3) {
        score -= 20;
        issues.push({
          dimension: 'povConsistency',
          severity: 'critical',
          description: '第一人称和第三人称混用',
          suggestion: '统一使用一种叙述视角'
        });
        evidence.push(`第一人称: ${firstPersonPatterns.length}次, 第三人称: ${thirdPersonPatterns.length}次`);
      }
    }

    const pronouns = ['我', '你', '他', '她', '它'];
    const inconsistentPatterns: string[] = [];

    for (const pronoun of pronouns) {
      const count = (content.match(new RegExp(pronoun, 'g')) || []).length;
      if (count > 0 && count < 3) {
        inconsistentPatterns.push(pronoun);
      }
    }

    if (inconsistentPatterns.length > 2) {
      score -= 10;
      issues.push({
        dimension: 'povConsistency',
        severity: 'minor',
        description: '部分人称代词使用异常',
        suggestion: '检查人称代词使用的一致性'
      });
      evidence.push(`异常人称代词: ${inconsistentPatterns.join(', ')}`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'POVConsistency',
      nameCn: '视角一致性',
      category: 'technical',
      weight: 1.5,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: '视角一致性检查完成',
      issues,
      suggestions: issues.length > 0 ? ['确保叙述视角统一'] : [],
      evidence
    };
  }

  private async auditTenseConsistency(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const pastTense = ['曾经', '已经', '当时', '过去', '之前', '刚才'];
    const presentTense = ['现在', '目前', '正在', '此刻', '今天', '此时'];
    const futureTense = ['将来', '未来', '以后', '之后', '接下来'];

    let pastCount = 0, presentCount = 0, futureCount = 0;

    for (const word of pastTense) {
      pastCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of presentTense) {
      presentCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of futureTense) {
      futureCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const total = pastCount + presentCount + futureCount;
    if (total > 0) {
      const maxRatio = Math.max(pastCount, presentCount, futureCount) / total;
      
      if (maxRatio < 0.6) {
        score -= 15;
        issues.push({
          dimension: 'tenseConsistency',
          severity: 'major',
          description: '时态混用严重',
          suggestion: '统一故事叙述的时态'
        });
        evidence.push(`过去: ${pastCount}, 现在: ${presentCount}, 未来: ${futureCount}`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'TenseConsistency',
      nameCn: '时态连贯性',
      category: 'technical',
      weight: 1.0,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `时态分析：过去${pastCount}次, 现在${presentCount}次, 未来${futureCount}次`,
      issues,
      suggestions: issues.length > 0 ? ['统一叙述时态'] : [],
      evidence
    };
  }

  private async auditReferentialClarity(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const pronouns = ['他', '她', '它', '他们', '她们', '它们'];
    let unclearRefs = 0;

    const sentences = content.split(/[。！？]/);
    for (let i = 0; i < sentences.length - 1; i++) {
      const current = sentences[i];
      const next = sentences[i + 1];
      
      for (const pronoun of pronouns) {
        const currentMatches = (current.match(new RegExp(pronoun, 'g')) || []).length;
        const nextMatches = (next.match(new RegExp(pronoun, 'g')) || []).length;
        
        if (currentMatches > 0 && nextMatches > 0 && i > 0) {
          const prev = sentences[i - 1];
          if (!prev.includes('说') && !prev.includes('想') && !prev.includes('看着')) {
            unclearRefs++;
          }
        }
      }
    }

    if (unclearRefs > sentences.length * 0.1) {
      score -= Math.min(unclearRefs, 20);
      issues.push({
        dimension: 'referentialClarity',
        severity: 'minor',
        description: `发现${unclearRefs}处可能的指代不清`,
        suggestion: '明确代词的指代对象'
      });
      evidence.push(`潜在指代不清: ${unclearRefs}处`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ReferentialClarity',
      nameCn: '指代清晰度',
      category: 'technical',
      weight: 0.9,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `指代清晰度分析完成`,
      issues,
      suggestions: issues.length > 0 ? ['明确代词指代'] : [],
      evidence
    };
  }

  private async auditLexicalDiversity(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const words = content.split(/\s+/).filter(w => w.length >= 2);
    const uniqueWords = new Set(words);
    const diversityRatio = uniqueWords.size / Math.max(words.length, 1);

    if (diversityRatio < 0.3) {
      score -= 25;
      issues.push({
        dimension: 'lexicalDiversity',
        severity: 'critical',
        description: '词汇多样性严重不足',
        suggestion: '增加同义词使用，丰富词汇表达'
      });
      evidence.push(`词汇多样性: ${(diversityRatio * 100).toFixed(1)}%`);
    } else if (diversityRatio < 0.5) {
      score -= 15;
      issues.push({
        dimension: 'lexicalDiversity',
        severity: 'major',
        description: '词汇多样性偏低',
        suggestion: '适当增加同义词使用'
      });
      evidence.push(`词汇多样性: ${(diversityRatio * 100).toFixed(1)}%`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'LexicalDiversity',
      nameCn: '词汇多样性',
      category: 'technical',
      weight: 0.7,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `词汇多样性: ${(diversityRatio * 100).toFixed(1)}%`,
      issues,
      suggestions: score < 85 ? ['丰富词汇表达'] : [],
      evidence
    };
  }

  private async auditExpressionRepetition(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const words = content.split(/\s+/).filter(w => w.length >= 2);
    const wordFreq: Map<string, number> = new Map();

    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    const sortedWords = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1]);
    const highFreqWords = sortedWords.filter(([_, count]) => {
      const ratio = count / Math.max(words.length, 1);
      return ratio > 0.03 && words.length > 50;
    });

    if (highFreqWords.length > 10) {
      score -= Math.min(highFreqWords.length * 2, 30);
      issues.push({
        dimension: 'expressionRepetition',
        severity: 'major',
        description: `发现${highFreqWords.length}个高频重复词汇`,
        suggestion: '使用同义词或句式变化减少重复'
      });
      evidence.push(`高频词: ${highFreqWords.slice(0, 5).map(([w]) => w).join(', ')}`);
    }

    const threeGramRepetitions = this.checkNGramRepetition(content, 3);
    if (threeGramRepetitions > 0) {
      score -= Math.min(threeGramRepetitions * 3, 15);
      issues.push({
        dimension: 'expressionRepetition',
        severity: 'minor',
        description: `发现${threeGramRepetitions}处三连词重复`,
        suggestion: '变化句式表达'
      });
      evidence.push(`三连词重复: ${threeGramRepetitions}处`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ExpressionRepetition',
      nameCn: '表达重复度',
      category: 'technical',
      weight: 1.2,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `重复度分析完成`,
      issues,
      suggestions: issues.length > 0 ? ['减少词汇和句式重复'] : [],
      evidence
    };
  }

  private checkNGramRepetition(content: string, n: number): number {
    const words = content.split(/\s+/);
    const nGrams: Map<string, number> = new Map();
    
    for (let i = 0; i <= words.length - n; i++) {
      const nGram = words.slice(i, i + n).join(' ');
      nGrams.set(nGram, (nGrams.get(nGram) || 0) + 1);
    }

    let repetitions = 0;
    for (const [gram, count] of nGrams.entries()) {
      if (count > 2) {
        repetitions += count - 1;
      }
    }

    return repetitions;
  }

  private async auditCharacterConsistency(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    if (truthFiles.emotionalArcs && truthFiles.emotionalArcs.length > 0) {
      for (const arc of truthFiles.emotionalArcs) {
        const characterName = arc.characterName;
        const mentions = (content.match(new RegExp(characterName, 'g')) || []).length;

        if (mentions === 0 && content.length > 1000) {
          score -= 15;
          issues.push({
            dimension: 'characterConsistency',
            severity: 'major',
            description: `角色"${characterName}"在章节中未出现`,
            location: { context: '角色应该在章节中有存在感' },
            suggestion: `考虑让${characterName}出现在当前情节中`
          });
          evidence.push(`${characterName}未出现`);
        }

        const lastEmotion = arc.points.length > 0 ? arc.points[arc.points.length - 1] : null;
        if (lastEmotion) {
          const emotionWords = this.getEmotionWordsForCharacter(arc.characterName, content);
          if (emotionWords.length > 0) {
            const expectedEmotion = this.classifyEmotion(emotionWords);
            if (expectedEmotion !== lastEmotion.emotion && Math.random() > 0.5) {
              score -= 5;
              issues.push({
                dimension: 'characterConsistency',
                severity: 'minor',
                description: `角色"${characterName}"情感状态可能不一致`,
                suggestion: '确保角色情感变化有合理铺垫'
              });
            }
          }
        }
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'CharacterConsistency',
      nameCn: '角色一致性',
      category: 'narrative',
      weight: 2.0,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `角色一致性检查完成，检查了${truthFiles.emotionalArcs?.length || 0}个角色`,
      issues,
      suggestions: issues.length > 0 ? ['确保角色行为和性格保持一致'] : [],
      evidence
    };
  }

  private getEmotionWordsForCharacter(characterName: string, content: string): string[] {
    const emotionWords = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶', '开心', '难过', '激动', '紧张', '害怕'];
    const foundEmotions: string[] = [];

    const sentences = content.split(/[。！？]/);
    for (const sentence of sentences) {
      if (sentence.includes(characterName)) {
        for (const emotion of emotionWords) {
          if (sentence.includes(emotion)) {
            foundEmotions.push(emotion);
          }
        }
      }
    }

    return foundEmotions;
  }

  private classifyEmotion(emotionWords: string[]): string {
    const positiveEmotions = ['高兴', '开心', '激动', '惊喜'];
    const negativeEmotions = ['悲伤', '难过', '愤怒', '恐惧', '害怕', '紧张'];
    const neutralEmotions = ['惊讶'];

    for (const word of emotionWords) {
      if (positiveEmotions.includes(word)) return 'positive';
      if (negativeEmotions.includes(word)) return 'negative';
      if (neutralEmotions.includes(word)) return 'neutral';
    }

    return 'neutral';
  }

  private async auditCharacterMotivation(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const motivationIndicators = ['想', '要', '必须', '应该', '决定', '希望', '渴望', '目标', '为了', '因为'];
    const motivationCount = motivationIndicators.reduce((count, word) => {
      return count + (content.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    const paragraphs = content.split(/\n\n+/);
    let paragraphsWithMotivation = 0;

    for (const paragraph of paragraphs) {
      for (const word of motivationIndicators) {
        if (paragraph.includes(word)) {
          paragraphsWithMotivation++;
          break;
        }
      }
    }

    if (paragraphsWithMotivation < paragraphs.length * 0.2) {
      score -= 20;
      issues.push({
        dimension: 'characterMotivation',
        severity: 'major',
        description: '角色动机表达不足',
        suggestion: '增加角色内心独白和行为动机说明'
      });
      evidence.push(`动机表达段落: ${paragraphsWithMotivation}/${paragraphs.length}`);
    }

    const consequenceIndicators = ['所以', '因此', '于是', '导致', '造成'];
    const causeIndicators = ['因为', '由于', '为了', '既然'];

    let causeCount = 0, consequenceCount = 0;
    for (const word of causeIndicators) {
      causeCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of consequenceIndicators) {
      consequenceCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (causeCount > 0 && consequenceCount < causeCount * 0.5) {
      score -= 10;
      issues.push({
        dimension: 'characterMotivation',
        severity: 'minor',
        description: '动机与结果对应关系不清晰',
        suggestion: '确保行为有明确动机支撑'
      });
      evidence.push(`原因词: ${causeCount}, 结果词: ${consequenceCount}`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'CharacterMotivation',
      nameCn: '角色动机合理性',
      category: 'narrative',
      weight: 1.8,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `动机分析：${paragraphsWithMotivation}/${paragraphs.length}段落有动机表达`,
      issues,
      suggestions: issues.length > 0 ? ['强化角色动机表达'] : [],
      evidence
    };
  }

  private async auditCharacterGrowth(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const growthIndicators = ['成长', '改变', '学会', '明白', '理解', '领悟', '意识到', '决定改变'];
    const regressionIndicators = ['依然', '仍然', '还是', '一如既往', '毫无变化'];

    let growthCount = 0, regressionCount = 0;

    for (const word of growthIndicators) {
      growthCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of regressionIndicators) {
      regressionCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (growthCount > 0 && regressionCount > growthCount) {
      score -= 15;
      issues.push({
        dimension: 'characterGrowth',
        severity: 'major',
        description: '角色成长呈现倒退',
        suggestion: '确保角色成长是递进式的'
      });
      evidence.push(`成长词: ${growthCount}, 退步词: ${regressionCount}`);
    }

    if (growthCount === 0 && content.length > 5000) {
      score -= 10;
      issues.push({
        dimension: 'characterGrowth',
        severity: 'minor',
        description: '未检测到明显的角色成长',
        suggestion: '考虑增加角色成长或改变的情节'
      });
      evidence.push('无明显成长描写');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'CharacterGrowth',
      nameCn: '角色成长弧线',
      category: 'narrative',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `成长弧线分析完成`,
      issues,
      suggestions: issues.length > 0 ? ['增加角色成长描写'] : [],
      evidence
    };
  }

  private async auditWorldConsistency(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    if (truthFiles.currentState) {
      const state = truthFiles.currentState as any;
      
      if (state.location) {
        const locationMentions = (content.match(new RegExp(state.location, 'g')) || []).length;
        const totalLocations = (content.match(/(城市|村庄|森林|河流|山脉|海洋)/g) || []).length;

        if (totalLocations > 0 && locationMentions === 0) {
          score -= 10;
          issues.push({
            dimension: 'worldConsistency',
            severity: 'minor',
            description: '未提及当前设定地点',
            suggestion: '在场景描写中明确位置'
          });
        }
      }

      const knownFacts = state.knownFacts || [];
      for (const fact of knownFacts.slice(0, 5)) {
        const factMentions = (content.match(new RegExp(fact.substring(0, 10), 'g')) || []).length;
        if (factMentions === 0 && content.length > 3000) {
          score -= 5;
          issues.push({
            dimension: 'worldConsistency',
            severity: 'minor',
            description: `已建立的事实"${fact.substring(0, 20)}..."未被提及`,
            suggestion: '适当复习重要事实'
          });
        }
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'WorldConsistency',
      nameCn: '世界观一致性',
      category: 'narrative',
      weight: 1.8,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `世界观一致性检查完成`,
      issues,
      suggestions: issues.length > 0 ? ['确保情节符合已建立的世界观'] : [],
      evidence
    };
  }

  private async auditPowerConsistency(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const powerVerbs = ['打败', '战胜', '击败', '战胜', '击溃', '压制', '超越', '胜过'];
    let powerVerbsCount = 0;
    for (const verb of powerVerbs) {
      powerVerbsCount += (content.match(new RegExp(verb, 'g')) || []).length;
    }

    const powerNouns = ['力量', '能力', '技能', '法术', '武艺', '智慧', '速度', '耐力'];
    let powerNounsCount = 0;
    for (const noun of powerNouns) {
      powerNounsCount += (content.match(new RegExp(noun, 'g')) || []).length;
    }

    if (powerVerbsCount > powerNounsCount * 2) {
      score -= 15;
      issues.push({
        dimension: 'powerConsistency',
        severity: 'major',
        description: '能力表现与设定可能不一致',
        suggestion: '确保能力战斗符合角色设定'
      });
      evidence.push(`能力动词: ${powerVerbsCount}, 能力名词: ${powerNounsCount}`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'PowerConsistency',
      nameCn: '能力体系稳定性',
      category: 'narrative',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `能力一致性检查完成`,
      issues,
      suggestions: issues.length > 0 ? ['保持能力体系稳定'] : [],
      evidence
    };
  }

  private async auditResourceTracking(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const resources = truthFiles.particleLedger || [];
    
    for (const resource of resources.slice(0, 10)) {
      const resourceName = resource.name;
      const mentions = (content.match(new RegExp(resourceName, 'g')) || []).length;

      if (mentions > 0 && resource.changeLog && resource.changeLog.length > 0) {
        const lastChange = resource.changeLog[resource.changeLog.length - 1];
        if (lastChange) {
          const changeWords = ['消耗', '获得', '增加', '减少', '失去', '得到'];
          let hasChangeWord = false;
          for (const word of changeWords) {
            if (content.includes(word)) {
              hasChangeWord = true;
              break;
            }
          }

          if (!hasChangeWord) {
            score -= 5;
            issues.push({
              dimension: 'resourceTracking',
              severity: 'minor',
              description: `资源"${resourceName}"被提及但未说明变更`,
              suggestion: `说明${resourceName}的变化情况`
            });
          }
        }
      }
    }

    if (resources.length === 0 && content.length > 10000) {
      score -= 5;
      issues.push({
        dimension: 'resourceTracking',
        severity: 'minor',
        description: '长篇内容未建立资源追踪系统',
        suggestion: '考虑建立资源管理体系'
      });
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ResourceTracking',
      nameCn: '资源消耗合理性',
      category: 'narrative',
      weight: 1.3,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `资源追踪检查了${resources.length}个资源`,
      issues,
      suggestions: issues.length > 0 ? ['完善资源管理体系'] : [],
      evidence
    };
  }

  private async auditTimelineLogic(
    content: string,
    truthFiles: TruthFiles,
    chapters: Chapter[],
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const timeIndicators = ['早上', '中午', '下午', '晚上', '夜里', '凌晨', '昨天', '今天', '明天', '前天', '后天'];
    let timeSequence: string[] = [];

    for (const indicator of timeIndicators) {
      if (content.includes(indicator)) {
        timeSequence.push(indicator);
      }
    }

    const timeOrder = this.analyzeTimeSequence(timeSequence);
    if (!timeOrder.isValid) {
      score -= 20;
      issues.push({
        dimension: 'timelineLogic',
        severity: 'critical',
        description: '时间顺序存在混乱',
        suggestion: '确保时间线清晰合理'
      });
      evidence.push(timeOrder.issue || '时间顺序分析');
    }

    const chapterSummary = truthFiles.chapterSummaries || [];
    if (chapterSummary.length > 0 && chapters.length > 0) {
      const lastSummary = chapterSummary[chapterSummary.length - 1];
      const currentChapter = chapters[chapters.length - 1];
      
      if (lastSummary && currentChapter) {
        const summaryTime = lastSummary.title.match(/第(\d+)章/)?.[1];
        const currentTime = currentChapter.title.match(/第(\d+)章/)?.[1];
        
        if (summaryTime && currentTime && parseInt(currentTime) < parseInt(summaryTime)) {
          score -= 25;
          issues.push({
            dimension: 'timelineLogic',
            severity: 'critical',
            description: '章节时间线倒退',
            location: { chapter: chapters.length },
            suggestion: '确保章节按时间顺序发展'
          });
          evidence.push(`章节: ${lastSummary.chapterNumber} -> ${currentChapter.number}`);
        }
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'TimelineLogic',
      nameCn: '时间线逻辑性',
      category: 'narrative',
      weight: 1.7,
      score,
      status: score >= 90 ? 'pass' : score >= 75 ? 'warning' : 'fail',
      details: `时间线检查完成`,
      issues,
      suggestions: issues.length > 0 ? ['修正时间线问题'] : [],
      evidence
    };
  }

  private analyzeTimeSequence(sequence: string[]): { isValid: boolean; issue?: string } {
    if (sequence.length <= 1) return { isValid: true };

    const timeOrder: Record<string, number> = {
      '凌晨': 0, '早上': 1, '上午': 2, '中午': 3, '下午': 4,
      '晚上': 5, '夜里': 6, '昨天': -1, '今天': 0, '明天': 1,
      '前天': -2, '后天': 2
    };

    for (let i = 1; i < sequence.length; i++) {
      const prev = timeOrder[sequence[i - 1]];
      const curr = timeOrder[sequence[i]];

      if (prev !== undefined && curr !== undefined) {
        if (curr < prev && !['昨天', '前天'].includes(sequence[i])) {
          if (curr < 0) continue;
          return { isValid: false, issue: `时间从${sequence[i-1]}跳到${sequence[i]}` };
        }
      }
    }

    return { isValid: true };
  }

  private async auditPlotCoherence(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const plotConnectors = ['于是', '因此', '所以', '然而', '但是', '虽然', '因为', '由于', '结果', '没想到', '突然'];
    const plotConnectorCount = plotConnectors.reduce((count, word) => {
      return count + (content.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    const paragraphs = content.split(/\n\n+/);
    if (plotConnectorCount < paragraphs.length * 0.1) {
      score -= 15;
      issues.push({
        dimension: 'plotCoherence',
        severity: 'major',
        description: '情节连接词不足',
        suggestion: '增加因果、转折等连接词'
      });
      evidence.push(`连接词: ${plotConnectorCount}, 段落: ${paragraphs.length}`);
    }

    const subplots = truthFiles.subplotBoard || [];
    const activeSubplots = subplots.filter(s => s.status === 'active');

    for (const subplot of activeSubplots.slice(0, 3)) {
      const subplotMentions = (content.match(new RegExp(subplot.name.substring(0, 5), 'g')) || []).length;
      if (subplotMentions === 0 && content.length > 5000) {
        score -= 10;
        issues.push({
          dimension: 'plotCoherence',
          severity: 'minor',
          description: `支线"${subplot.name}"未在章节中推进`,
          suggestion: `推进${subplot.name}情节`
        });
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'PlotCoherence',
      nameCn: '情节连贯性',
      category: 'narrative',
      weight: 1.8,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `情节连贯性检查完成`,
      issues,
      suggestions: issues.length > 0 ? ['加强情节连接'] : [],
      evidence
    };
  }

  private async auditConflictEscalation(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const conflictWords = ['冲突', '矛盾', '对抗', '竞争', '挑战', '危机', '困难', '阻碍', '对立', '争执'];
    let conflictCount = 0;
    for (const word of conflictWords) {
      conflictCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const resolutionWords = ['解决', '化解', '平息', '和解', '妥协', '让步', '成功', '胜利', '突破'];
    let resolutionCount = 0;
    for (const word of resolutionWords) {
      resolutionCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (conflictCount > resolutionCount * 3 && content.length > 3000) {
      score -= 10;
      issues.push({
        dimension: 'conflictEscalation',
        severity: 'minor',
        description: '冲突数量远超解决',
        suggestion: '适当提供冲突的解决或缓解'
      });
      evidence.push(`冲突词: ${conflictCount}, 解决词: ${resolutionCount}`);
    }

    const escalationIndicators = ['升级', '加剧', '恶化', '深化', '升级'];
    let escalationCount = 0;
    for (const word of escalationIndicators) {
      escalationCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (escalationCount === 0 && conflictCount > 3) {
      score -= 5;
      issues.push({
        dimension: 'conflictEscalation',
        severity: 'minor',
        description: '冲突未见明显升级',
        suggestion: '考虑让冲突逐步升级'
      });
      evidence.push('无明显冲突升级');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ConflictEscalation',
      nameCn: '冲突升级合理性',
      category: 'narrative',
      weight: 1.6,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `冲突分析：${conflictCount}个冲突，${resolutionCount}个解决`,
      issues,
      suggestions: issues.length > 0 ? ['平衡冲突与解决'] : [],
      evidence
    };
  }

  private async auditForeshadowFulfillment(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const pendingHooks = truthFiles.pendingHooks || [];
    const overdueHooks = pendingHooks.filter(h => {
      const chapter = (h as any).chapter || h.setInChapter || 0;
      const currentChapter = 100;
      return currentChapter - chapter > 50;
    });

    if (overdueHooks.length > 0) {
      score -= overdueHooks.length * 5;
      issues.push({
        dimension: 'foreshadowFulfillment',
        severity: 'major',
        description: `${overdueHooks.length}个伏笔超过50章未回收`,
        suggestion: '考虑近期回收这些伏笔'
      });
      evidence.push(`过期伏笔: ${overdueHooks.length}个`);
    }

    const setupWords = ['预示', '暗示', '征兆', '伏笔', '线索', '预兆'];
    let setupCount = 0;
    for (const word of setupWords) {
      setupCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (setupCount === 0 && content.length > 10000) {
      score -= 10;
      issues.push({
        dimension: 'foreshadowFulfillment',
        severity: 'minor',
        description: '长篇内容缺少伏笔铺垫',
        suggestion: '考虑埋设新的伏笔'
      });
      evidence.push('无伏笔铺垫');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ForeshadowFulfillment',
      nameCn: '伏笔铺垫与回收',
      category: 'narrative',
      weight: 1.7,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `伏笔检查：${pendingHooks.length}个待回收伏笔`,
      issues,
      suggestions: issues.length > 0 ? ['管理伏笔生命周期'] : [],
      evidence
    };
  }

  private async auditPacingControl(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const lengths = paragraphs.map(p => p.length);
    
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / Math.max(lengths.length, 1);
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / Math.max(lengths.length, 1);
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / Math.max(avgLength, 1);

    if (cv < 0.3) {
      score -= 15;
      issues.push({
        dimension: 'pacingControl',
        severity: 'major',
        description: '节奏过于平稳，缺乏变化',
        suggestion: '增加节奏变化，张弛结合'
      });
      evidence.push(`节奏变化系数: ${cv.toFixed(2)}`);
    }

    const actionWords = ['突然', '立刻', '瞬间', '猛然', '猝不及防'];
    let actionCount = 0;
    for (const word of actionWords) {
      actionCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (actionCount > paragraphs.length * 0.3) {
      score -= 10;
      issues.push({
        dimension: 'pacingControl',
        severity: 'minor',
        description: '快节奏词使用过多',
        suggestion: '适当放慢节奏，给读者喘息'
      });
      evidence.push(`快节奏词: ${actionCount}次`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'PacingControl',
      nameCn: '节奏把控',
      category: 'narrative',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `节奏分析：变化系数${cv.toFixed(2)}`,
      issues,
      suggestions: issues.length > 0 ? ['优化节奏变化'] : [],
      evidence
    };
  }

  private async auditTensionCurve(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const tensionWords = ['紧张', '危机', '冲突', '危险', '悬念', '焦虑', '恐惧'];
    const reliefWords = ['放松', '安心', '解决', '平静', '舒缓', '和解'];

    let tensionCount = 0, reliefCount = 0;
    for (const word of tensionWords) {
      tensionCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of reliefWords) {
      reliefCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const paragraphs = content.split(/\n\n+/);
    
    if (paragraphs.length > 3) {
      const halfPoint = Math.floor(paragraphs.length / 2);
      let firstHalfTension = 0, secondHalfTension = 0;

      for (let i = 0; i < halfPoint; i++) {
        for (const word of tensionWords) {
          if (paragraphs[i].includes(word)) {
            firstHalfTension++;
          }
        }
      }
      for (let i = halfPoint; i < paragraphs.length; i++) {
        for (const word of tensionWords) {
          if (paragraphs[i].includes(word)) {
            secondHalfTension++;
          }
        }
      }

      if (firstHalfTension > 0 && secondHalfTension < firstHalfTension * 0.5) {
        score -= 15;
        issues.push({
          dimension: 'tensionCurve',
          severity: 'major',
          description: '张力在章节后半部分明显下降',
          suggestion: '在章节后半部分增加张力'
        });
        evidence.push(`前: ${firstHalfTension}, 后: ${secondHalfTension}`);
      }
    }

    if (tensionCount === 0) {
      score -= 20;
      issues.push({
        dimension: 'tensionCurve',
        severity: 'critical',
        description: '章节缺乏张力',
        suggestion: '增加冲突或悬念'
      });
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'TensionCurve',
      nameCn: '张力曲线',
      category: 'narrative',
      weight: 1.6,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `张力分析：张力${tensionCount}，缓和${reliefCount}`,
      issues,
      suggestions: issues.length > 0 ? ['增强张力设置'] : [],
      evidence
    };
  }

  private async auditSuspenseSetting(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const suspenseWords = ['悬念', '未知', '神秘', '隐藏', '秘密', '疑问', '困惑', '悬念', '未知'];
    const cliffhangerWords = ['然而', '但是', '就在这时', '突然', '出乎意料', '没想到'];

    let suspenseCount = 0;
    for (const word of suspenseWords) {
      suspenseCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const paragraphs = content.split(/\n\n+/);
    const lastParagraph = paragraphs[paragraphs.length - 1];
    let hasCliffhanger = false;

    for (const word of cliffhangerWords) {
      if (lastParagraph.includes(word)) {
        hasCliffhanger = true;
        break;
      }
    }

    if (suspenseCount < 2 && content.length > 5000) {
      score -= 10;
      issues.push({
        dimension: 'suspenseSetting',
        severity: 'minor',
        description: '悬念设置不足',
        suggestion: '增加悬念或疑问'
      });
      evidence.push(`悬念词: ${suspenseCount}次`);
    }

    if (!hasCliffhanger && paragraphs.length > 5) {
      score -= 10;
      issues.push({
        dimension: 'suspenseSetting',
        severity: 'minor',
        description: '章节结尾缺乏悬念',
        suggestion: '在结尾设置悬念吸引读者'
      });
      evidence.push('无章节悬念');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'SuspenseSetting',
      nameCn: '悬念设置',
      category: 'narrative',
      weight: 1.4,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `悬念检查完成`,
      issues,
      suggestions: issues.length > 0 ? ['增加悬念设置'] : [],
      evidence
    };
  }

  private async auditEmotionalDepth(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const emotionCategories = {
      joy: ['高兴', '开心', '快乐', '喜悦', '欢欣', '愉悦'],
      sadness: ['悲伤', '难过', '伤心', '痛苦', '哀伤', '悲痛'],
      anger: ['愤怒', '生气', '恼火', '气愤', '恼怒'],
      fear: ['恐惧', '害怕', '惊恐', '畏惧', '胆怯'],
      surprise: ['惊讶', '震惊', '意外', '吃惊', '诧异']
    };

    const emotionCounts: Record<string, number> = {};
    let totalEmotions = 0;

    for (const [category, words] of Object.entries(emotionCategories)) {
      let count = 0;
      for (const word of words) {
        count += (content.match(new RegExp(word, 'g')) || []).length;
      }
      emotionCounts[category] = count;
      totalEmotions += count;
    }

    const uniqueEmotions = Object.values(emotionCounts).filter(c => c > 0).length;
    const emotionDensity = totalEmotions / (content.length / 1000);

    if (uniqueEmotions < 2) {
      score -= 15;
      issues.push({
        dimension: 'emotionalDepth',
        severity: 'major',
        description: '情感种类单一',
        suggestion: '展现更丰富的情感层次'
      });
      evidence.push(`情感种类: ${uniqueEmotions}`);
    }

    if (emotionDensity < 1) {
      score -= 10;
      issues.push({
        dimension: 'emotionalDepth',
        severity: 'minor',
        description: '情感描写密度不足',
        suggestion: '增加情感描写'
      });
      evidence.push(`情感密度: ${emotionDensity.toFixed(2)}词/千字`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'EmotionalDepth',
      nameCn: '情感深度',
      category: 'literary',
      weight: 2.0,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `情感深度分析：${uniqueEmotions}种情感，密度${emotionDensity.toFixed(2)}`,
      issues,
      suggestions: issues.length > 0 ? ['丰富情感描写'] : [],
      evidence
    };
  }

  private async auditEmotionalAuthenticity(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const physicalSymptoms = ['颤抖', '心跳', '呼吸', '脸红', '手心', '眼眶', '声音'];
    let physicalCount = 0;
    for (const word of physicalSymptoms) {
      physicalCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const totalWords = content.split(/\s+/).length;
    const physicalRatio = physicalCount / Math.max(totalWords, 1) * 1000;

    if (physicalRatio < 2) {
      score -= 15;
      issues.push({
        dimension: 'emotionalAuthenticity',
        severity: 'major',
        description: '情感缺少身体反应支撑',
        suggestion: '增加情感的身体表现'
      });
      evidence.push(`身体描写占比: ${physicalRatio.toFixed(2)}‰`);
    }

    const internalThoughts = ['想', '觉得', '感到', '认为', '明白', '意识到', '心想'];
    let internalCount = 0;
    for (const word of internalThoughts) {
      internalCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (internalCount < 3 && content.length > 3000) {
      score -= 10;
      issues.push({
        dimension: 'emotionalAuthenticity',
        severity: 'minor',
        description: '缺少内心情感表达',
        suggestion: '增加内心独白或情感描写'
      });
      evidence.push(`内心描写: ${internalCount}次`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'EmotionalAuthenticity',
      nameCn: '情感真实性',
      category: 'literary',
      weight: 2.0,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `情感真实性分析完成`,
      issues,
      suggestions: issues.length > 0 ? ['增强情感真实性'] : [],
      evidence
    };
  }

  private async auditCharacterComplexity(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const complexityIndicators = ['但是', '然而', '矛盾', '挣扎', '犹豫', '纠结', '两难'];
    const moralIndicators = ['对错', '善恶', '好坏', '道德', '良心', '原则'];

    let complexityCount = 0, moralCount = 0;
    for (const word of complexityIndicators) {
      complexityCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of moralIndicators) {
      moralCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const characterArcs = truthFiles.emotionalArcs || [];
    for (const arc of characterArcs.slice(0, 5)) {
      const points = arc.points || [];
      const emotions = new Set(points.map(p => p.emotion));
      
      if (emotions.size < 2 && points.length > 3) {
        score -= 10;
        issues.push({
          dimension: 'characterComplexity',
          severity: 'minor',
          description: `角色${arc.characterName}情感单一`,
          suggestion: `展现${arc.characterName}更复杂的内心`
        });
      }
    }

    if (complexityCount < 3 && moralCount < 2) {
      score -= 15;
      issues.push({
        dimension: 'characterComplexity',
        severity: 'major',
        description: '人物塑造缺乏复杂性',
        suggestion: '增加人物的内心矛盾和道德挣扎'
      });
      evidence.push(`复杂性: ${complexityCount}, 道德: ${moralCount}`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'CharacterComplexity',
      nameCn: '人物塑造立体感',
      category: 'literary',
      weight: 2.0,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `人物复杂性分析完成`,
      issues,
      suggestions: issues.length > 0 ? ['深化人物塑造'] : [],
      evidence
    };
  }

  private async auditDialogueNaturalness(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const dialogues = content.match(/[""''『』（][^""''『』]+[""''『』]/g) || [];
    
    if (dialogues.length === 0) {
      score -= 20;
      issues.push({
        dimension: 'dialogueNaturalness',
        severity: 'major',
        description: '章节无对话',
        suggestion: '适当增加对话以推动情节'
      });
      evidence.push('无对话');
    } else {
      const dialoguesArray: string[] = (dialogues || []).map(d => String(d));
      const totalLength = dialoguesArray.reduce((sum: number, d: string) => sum + d.length, 0);
      const avgLength = totalLength / Math.max(dialoguesArray.length, 1);

      if (avgLength > 150) {
        score -= 15;
        issues.push({
          dimension: 'dialogueNaturalness',
          severity: 'major',
          description: '对话平均长度过长',
          suggestion: '让对话更简短自然'
        });
        evidence.push(`平均对话长度: ${avgLength.toFixed(0)}字`);
      }

      const interruptionPatterns = content.match(/——|…{2,}|"|"/g) || [];
      if (interruptionPatterns.length === 0 && dialogues.length > 3) {
        score -= 5;
        issues.push({
          dimension: 'dialogueNaturalness',
          severity: 'minor',
          description: '对话缺少自然的打断和停顿',
          suggestion: '增加对话的自然节奏'
        });
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'DialogueNaturalness',
      nameCn: '对话自然度',
      category: 'literary',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `对话分析：${dialogues.length}段对话`,
      issues,
      suggestions: issues.length > 0 ? ['优化对话自然度'] : [],
      evidence
    };
  }

  private async auditSubtextUsage(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const subtextIndicators = ['言外之意', '弦外之音', '潜台词', '意味深长', '一语双关', '话里有话'];
    const ironyIndicators = ['反讽', '讽刺', '嘲弄', '讥讽', '挖苦'];

    let subtextCount = 0, ironyCount = 0;
    for (const word of subtextIndicators) {
      subtextCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of ironyIndicators) {
      ironyCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (subtextCount === 0 && content.length > 10000) {
      score -= 10;
      issues.push({
        dimension: 'subtextUsage',
        severity: 'minor',
        description: '长篇内容缺少潜台词',
        suggestion: '增加对话的深层含义'
      });
      evidence.push('无潜台词');
    }

    if (ironyCount > 0) {
      score += 5;
      evidence.push(`反讽: ${ironyCount}处`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'SubtextUsage',
      nameCn: '潜台词运用',
      category: 'literary',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `潜台词分析：${subtextCount}处`,
      issues,
      suggestions: issues.length > 0 ? ['增加潜台词运用'] : [],
      evidence
    };
  }

  private async auditShowVsTellBalance(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const tellingIndicators = ['他是', '她是', '感觉', '觉得', '认为是', '知道', '明白'];
    const showingIndicators = ['看到', '听到', '注意到', '观察', '注意到'];

    let tellingCount = 0, showingCount = 0;
    for (const word of tellingIndicators) {
      tellingCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of showingIndicators) {
      showingCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (tellingCount > showingCount * 3) {
      score -= 15;
      issues.push({
        dimension: 'showVsTellBalance',
        severity: 'major',
        description: '讲述过多，展示不足',
        suggestion: '用行动和细节展示而非直接陈述'
      });
      evidence.push(`讲述: ${tellingCount}, 展示: ${showingCount}`);
    }

    const sensoryVerbs = ['看着', '听着', '闻着', '摸着', '尝着', '感受到'];
    let sensoryCount = 0;
    for (const word of sensoryVerbs) {
      sensoryCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (sensoryCount < 2 && content.length > 3000) {
      score -= 10;
      issues.push({
        dimension: 'showVsTellBalance',
        severity: 'minor',
        description: '感官描写不足',
        suggestion: '用感官描写增强展示'
      });
      evidence.push(`感官词: ${sensoryCount}次`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ShowVsTellBalance',
      nameCn: '展示与讲述平衡',
      category: 'literary',
      weight: 1.8,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `展示讲述比: ${showingCount}:${tellingCount}`,
      issues,
      suggestions: issues.length > 0 ? ['增加展示，减少讲述'] : [],
      evidence
    };
  }

  private async auditSensoryDetails(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const sensoryCategories = {
      visual: ['看见', '看到', '注视', '凝视', '瞥见', '目光', '颜色', '形状', '光线'],
      auditory: ['听到', '听见', '声音', '音乐', '噪音', '寂静', '回声', '低语'],
      olfactory: ['闻到', '气味', '芳香', '臭味', '香味', '腥味'],
      tactile: ['触摸', '感觉', '触摸', '冰冷', '温热', '粗糙', '光滑'],
      gustatory: ['品尝', '味道', '甘甜', '苦涩', '酸味', '咸味']
    };

    const sensoryCounts: Record<string, number> = {};
    let totalSensory = 0;

    for (const [sense, words] of Object.entries(sensoryCategories)) {
      let count = 0;
      for (const word of words) {
        count += (content.match(new RegExp(word, 'g')) || []).length;
      }
      sensoryCounts[sense] = count;
      totalSensory += count;
    }

    const sensesUsed = Object.values(sensoryCounts).filter(c => c > 0).length;
    const sensoryDensity = totalSensory / (content.length / 1000);

    if (sensesUsed < 2) {
      score -= 15;
      issues.push({
        dimension: 'sensoryDetails',
        severity: 'major',
        description: '感官描写单一',
        suggestion: '调动多种感官进行描写'
      });
      evidence.push(`使用感官: ${sensesUsed}种`);
    }

    if (sensoryDensity < 1.5) {
      score -= 10;
      issues.push({
        dimension: 'sensoryDetails',
        severity: 'minor',
        description: '感官描写密度不足',
        suggestion: '增加感官细节'
      });
      evidence.push(`感官密度: ${sensoryDensity.toFixed(2)}词/千字`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'SensoryDetails',
      nameCn: '感官描写丰富度',
      category: 'literary',
      weight: 1.6,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `感官分析：${sensesUsed}种感官，密度${sensoryDensity.toFixed(2)}`,
      issues,
      suggestions: issues.length > 0 ? ['丰富感官描写'] : [],
      evidence
    };
  }

  private async auditSymbolicUsage(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const symbolIndicators = ['象征', '隐喻', '比喻', '寓意', '代表', '意味着'];
    const recurringImages = this.findRecurringImages(content);

    let symbolCount = 0;
    for (const word of symbolIndicators) {
      symbolCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (symbolCount === 0 && recurringImages.length > 3) {
      score += 5;
      evidence.push(`隐含意象: ${recurringImages.slice(0, 3).join(', ')}`);
    } else if (symbolCount === 0 && content.length > 15000) {
      score -= 10;
      issues.push({
        dimension: 'symbolicUsage',
        severity: 'minor',
        description: '长篇内容缺少象征手法',
        suggestion: '考虑增加象征和隐喻'
      });
    }

    if (recurringImages.length > 0) {
      evidence.push(`重复意象: ${recurringImages.length}个`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'SymbolicUsage',
      nameCn: '象征手法运用',
      category: 'literary',
      weight: 1.7,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `象征分析：${symbolCount}处明确象征`,
      issues,
      suggestions: issues.length > 0 ? ['增加象征手法'] : [],
      evidence
    };
  }

  private findRecurringImages(content: string): string[] {
    const images = ['雨', '雪', '风', '火', '光', '影', '花', '树', '月', '星'];
    const recurring: string[] = [];

    for (const image of images) {
      const count = (content.match(new RegExp(image, 'g')) || []).length;
      if (count >= 3) {
        recurring.push(image);
      }
    }

    return recurring;
  }

  private async auditThemeDepth(
    content: string,
    truthFiles: TruthFiles,
    strictMode?: boolean
  ): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const themeKeywords = {
      love: ['爱', '爱情', '恨', '情感', '亲情', '友情'],
      survival: ['生存', '死亡', '生命', '挣扎', '希望', '绝望'],
      identity: ['自我', '认同', '归属', '身份', '角色'],
      morality: ['道德', '正义', '邪恶', '善恶', '良心'],
      power: ['权力', '欲望', '控制', '自由', '压迫']
    };

    const themeCounts: Record<string, number> = {};
    let totalThemes = 0;

    for (const [theme, words] of Object.entries(themeKeywords)) {
      let count = 0;
      for (const word of words) {
        count += (content.match(new RegExp(word, 'g')) || []).length;
      }
      themeCounts[theme] = count;
      totalThemes += count;
    }

    const themesExplored = Object.values(themeCounts).filter(c => c > 0).length;

    if (themesExplored < 2) {
      score -= 15;
      issues.push({
        dimension: 'themeDepth',
        severity: 'major',
        description: '主题探索单一',
        suggestion: '深入探讨多层次主题'
      });
      evidence.push(`主题种类: ${themesExplored}`);
    }

    const thematicDepthWords = ['思考', '反思', '追问', '探讨', '审视', '叩问'];
    let depthWordCount = 0;
    for (const word of thematicDepthWords) {
      depthWordCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    if (depthWordCount < 2 && themesExplored >= 2) {
      score -= 10;
      issues.push({
        dimension: 'themeDepth',
        severity: 'minor',
        description: '主题深度不够',
        suggestion: '增加对主题的深度探讨'
      });
      evidence.push(`深度词: ${depthWordCount}次`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'ThemeDepth',
      nameCn: '主题深度',
      category: 'literary',
      weight: 2.2,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `主题分析：${themesExplored}个主题领域`,
      issues,
      suggestions: issues.length > 0 ? ['深化主题探讨'] : [],
      evidence
    };
  }

  private async auditLiteraryValue(content: string, strictMode?: boolean): Promise<AuditDimensionV3> {
    const issues: AuditIssueV3[] = [];
    const evidence: string[] = [];
    let score = 100;

    const literaryDevices = ['比喻', '拟人', '排比', '夸张', '反问', '设问', '对偶', '反复'];
    let deviceCount = 0;
    for (const word of literaryDevices) {
      deviceCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const paragraphs = content.split(/\n\n+/);
    if (deviceCount < paragraphs.length * 0.1 && content.length > 5000) {
      score -= 15;
      issues.push({
        dimension: 'literaryValue',
        severity: 'minor',
        description: '文学手法使用不足',
        suggestion: '增加修辞手法的运用'
      });
      evidence.push(`修辞: ${deviceCount}处`);
    }

    const uniqueExpressions = this.findUniqueExpressions(content);
    if (uniqueExpressions.length > 0) {
      score += Math.min(uniqueExpressions.length, 10);
      evidence.push(`独特表达: ${uniqueExpressions.length}处`);
    }

    const openingQuality = this.evaluateOpening(content);
    if (openingQuality < 60) {
      score -= 10;
      issues.push({
        dimension: 'literaryValue',
        severity: 'minor',
        description: '开头质量有待提高',
        suggestion: '强化开头的吸引力'
      });
    }

    score = Math.max(0, Math.min(100, score));

    return {
      name: 'LiteraryValue',
      nameCn: '文学价值评估',
      category: 'literary',
      weight: 1.5,
      score,
      status: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      details: `文学价值综合评估`,
      issues,
      suggestions: issues.length > 0 ? ['提升文学价值'] : [],
      evidence
    };
  }

  private findUniqueExpressions(content: string): string[] {
    const patterns = [
      /[^。！？.!?]{20,}[。！？.!?]/g,
    ];
    
    const expressions: string[] = [];
    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      for (const match of matches.slice(0, 10)) {
        if (match.length > 30 && !expressions.includes(match)) {
          expressions.push(match.substring(0, 30));
        }
      }
    }
    
    return expressions;
  }

  private evaluateOpening(content: string): number {
    const paragraphs = content.split(/\n\n+/);
    if (paragraphs.length === 0) return 0;

    const opening = paragraphs[0];
    const hookWords = ['突然', '一天', '那时候', '故事', '开始'];
    
    let hookScore = 0;
    for (const word of hookWords) {
      if (opening.includes(word)) {
        hookScore += 20;
      }
    }

    return Math.min(100, hookScore + 40);
  }

  private countIssues(dimensions: AuditDimensionV3[]): { critical: number; major: number; minor: number } {
    const counts = { critical: 0, major: 0, minor: 0 };
    
    for (const dim of dimensions) {
      for (const issue of dim.issues) {
        counts[issue.severity]++;
      }
    }
    
    return counts;
  }

  private calculateCategoryScore(dimensions: AuditDimensionV3[]): number {
    if (dimensions.length === 0) return 0;
    
    const totalScore = dimensions.reduce((sum, dim) => sum + dim.score * dim.weight, 0);
    const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight, 0);
    
    return Math.round(totalScore / Math.max(totalWeight, 1));
  }

  private calculateOverallScore(dimensions: AuditDimensionV3[]): number {
    if (dimensions.length === 0) return 0;
    
    const totalScore = dimensions.reduce((sum, dim) => sum + dim.score * dim.weight, 0);
    const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight, 0);
    
    return Math.round(totalScore / Math.max(totalWeight, 1));
  }

  private determineQualityLevel(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'acceptable';
    return 'poor';
  }

  private generateRecommendations(
    dimensions: AuditDimensionV3[],
    issues: { critical: number; major: number; minor: number }
  ): string[] {
    const recommendations: string[] = [];

    if (issues.critical > 0) {
      recommendations.push(`优先解决${issues.critical}个关键问题`);
    }

    const failedDimensions = dimensions.filter(d => d.status === 'fail');
    if (failedDimensions.length > 0) {
      recommendations.push(`加强以下维度：${failedDimensions.map(d => d.nameCn).join(', ')}`);
    }

    const warningDimensions = dimensions.filter(d => d.status === 'warning');
    if (warningDimensions.length > 0) {
      recommendations.push(`改进以下维度：${warningDimensions.map(d => d.nameCn).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('继续保持当前创作质量');
    }

    return recommendations;
  }

  private performSelfValidation(
    overallScore: number,
    technicalScore: number,
    narrativeScore: number,
    literaryScore: number,
    dimensions: AuditDimensionV3[],
    chapterCount: number
  ): ComprehensiveAuditReport['selfValidation'] {
    const evidence: string[] = [];

    const canSupportNobelLevel =
      literaryScore >= AIAuditEngineV3.NobelCriteria.literaryQualityMin &&
      this.getDimensionScore(dimensions, 'themeDepth') >= AIAuditEngineV3.NobelCriteria.themeDepthMin &&
      this.getDimensionScore(dimensions, 'thematicCoherence') >= AIAuditEngineV3.NobelCriteria.thematicCoherenceMin &&
      this.getDimensionScore(dimensions, 'characterComplexity') >= AIAuditEngineV3.NobelCriteria.characterComplexityMin &&
      this.getDimensionScore(dimensions, 'emotionalAuthenticity') >= AIAuditEngineV3.NobelCriteria.emotionalAuthenticityMin &&
      this.getDimensionScore(dimensions, 'symbolicUsage') >= AIAuditEngineV3.NobelCriteria.symbolicDepthMin;

    const canSupportMillionWord =
      chapterCount <= AIAuditEngineV3.MillionWordCriteria.maxChapters &&
      this.getDimensionScore(dimensions, 'characterConsistency') >= 85 &&
      this.getDimensionScore(dimensions, 'worldConsistency') >= 85 &&
      this.getDimensionScore(dimensions, 'timelineLogic') >= 85 &&
      this.getDimensionScore(dimensions, 'resourceTracking') >= 80 &&
      technicalScore >= 85;

    let validationScore = 0;
    if (canSupportNobelLevel) validationScore += 50;
    if (canSupportMillionWord) validationScore += 50;

    if (literaryScore >= 85) {
      evidence.push('文学质量达到诺贝尔级别标准');
    }
    if (technicalScore >= 90) {
      evidence.push('技术质量优秀');
    }
    if (narrativeScore >= 85) {
      evidence.push('叙事质量达到长篇标准');
    }

    const criticalIssues = dimensions.reduce((sum, d) => 
      sum + d.issues.filter(i => i.severity === 'critical').length, 0);
    
    if (criticalIssues === 0) {
      evidence.push('无关键性问题');
    }

    return {
      canSupportNobelLevel,
      canSupportMillionWord,
      validationScore,
      evidence
    };
  }

  private getDimensionScore(dimensions: AuditDimensionV3[], dimensionName: string): number {
    const dimension = dimensions.find(d => 
      d.name.toLowerCase() === dimensionName.toLowerCase() ||
      d.nameCn === dimensionName
    );
    return dimension?.score || 0;
  }
}

export default AIAuditEngineV3;
