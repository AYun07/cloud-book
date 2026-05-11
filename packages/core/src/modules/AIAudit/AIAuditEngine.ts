/**
 * Cloud Book - AI 审计引擎
 * 多维度内容质量检查
 */

import { 
  AuditConfig, 
  AuditResult, 
  AuditDimension,
  Issue,
  TruthFiles,
  AUDIT_DIMENSIONS
} from '../../types';

export interface AIAuditEngineConfig extends AuditConfig {
  dimensions: string[];
  threshold: number;
  autoFix: boolean;
  maxIterations: number;
}

export class AIAuditEngine {
  private config: AIAuditEngineConfig;
  private llmProvider: any;

  constructor(config?: Partial<AIAuditEngineConfig>) {
    this.config = {
      dimensions: [...AUDIT_DIMENSIONS] as string[],
      threshold: 0.7,
      autoFix: true,
      maxIterations: 3,
      ...config
    };
  }

  /**
   * 设置 LLM 提供者
   */
  setLLMProvider(provider: any) {
    this.llmProvider = provider;
  }

  /**
   * 审计内容
   */
  async audit(content: string, truthFiles: TruthFiles): Promise<AuditResult> {
    const dimensions: AuditDimension[] = [];
    const issues: Issue[] = [];
    
    // 逐个维度检查
    for (const dimension of this.config.dimensions) {
      const result = await this.checkDimension(content, dimension, truthFiles);
      dimensions.push(result.dimension);
      issues.push(...result.issues);
    }
    
    // 计算总分
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
    const passed = totalScore >= this.config.threshold && 
                  !issues.some(i => i.severity === 'critical');
    
    return {
      passed,
      dimensions,
      issues,
      score: totalScore
    };
  }

  /**
   * 检查单个维度
   */
  private async checkDimension(
    content: string,
    dimension: string,
    truthFiles: TruthFiles
  ): Promise<{ dimension: AuditDimension; issues: Issue[] }> {
    const issues: Issue[] = [];
    let score = 1.0;
    let details = '';
    
    switch (dimension) {
      case 'characterConsistency':
        ({ score, issues, details } = this.checkCharacterConsistency(content, truthFiles));
        break;
      case 'worldConsistency':
        ({ score, issues, details } = this.checkWorldConsistency(content, truthFiles));
        break;
      case 'timelineConsistency':
        ({ score, issues, details } = this.checkTimelineConsistency(content, truthFiles));
        break;
      case 'plotLogic':
        ({ score, issues, details } = this.checkPlotLogic(content, truthFiles));
        break;
      case 'foreshadowFulfillment':
        ({ score, issues, details } = this.checkForeshadowFulfillment(content, truthFiles));
        break;
      case 'resourceTracking':
        ({ score, issues, details } = this.checkResourceTracking(content, truthFiles));
        break;
      case 'emotionalArc':
        ({ score, issues, details } = this.checkEmotionalArc(content, truthFiles));
        break;
      case 'narrativePacing':
        ({ score, issues, details } = this.checkNarrativePacing(content));
        break;
      case 'aiDetection':
        ({ score, issues, details } = this.checkAIDetection(content));
        break;
      case 'repetitiveness':
        ({ score, issues, details } = this.checkRepetitiveness(content));
        break;
      case 'powerConsistency':
        ({ score, issues, details } = this.checkPowerConsistency(content, truthFiles));
        break;
      default:
        score = 0.9;
        details = '使用默认评估';
    }
    
    return {
      dimension: {
        name: dimension,
        score,
        passed: score >= this.config.threshold,
        details
      },
      issues
    };
  }

  /**
   * 角色一致性检查
   */
  private checkCharacterConsistency(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    const protagonist = truthFiles.currentState?.protagonist;
    
    if (!protagonist) {
      return { score: 1.0, issues: [], details: '无角色数据，跳过检查' };
    }
    
    // 检查角色名一致性
    const nameOccurrences = this.countOccurrences(content, protagonist.name);
    const aliases = this.getAliases(protagonist.name);
    let totalNameOccurrences = nameOccurrences;
    
    for (const alias of aliases) {
      totalNameOccurrences += this.countOccurrences(content, alias);
    }
    
    if (totalNameOccurrences === 0) {
      issues.push({
        type: 'character_consistency',
        severity: 'warning',
        description: `角色"${protagonist.name}"在正文中未提及`,
        location: { chapterId: '' }
      });
    }
    
    // 检查称呼一致性
    const firstPersonOccurrences = this.countOccurrences(content, '我');
    const thirdPersonOccurrences = this.countOccurrences(content, protagonist.name);
    
    // 混用第一人称和第三人称可能是一致性问题
    if (firstPersonOccurrences > 10 && thirdPersonOccurrences > 10) {
      issues.push({
        type: 'character_consistency',
        severity: 'info',
        description: '检测到视角可能存在第一人称和第三人称混用',
        location: { chapterId: '' }
      });
    }
    
    const score = issues.filter(i => i.severity === 'critical').length > 0 
      ? 0.5 
      : issues.length > 0 ? 0.8 : 1.0;
    
    return {
      score,
      issues,
      details: `检查了角色"${protagonist.name}"的一致性，发现${issues.length}个问题`
    };
  }

  /**
   * 世界观一致性检查
   */
  private checkWorldConsistency(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查已知事实是否被违背
    const knownFacts = truthFiles.currentState?.knownFacts || [];
    for (const fact of knownFacts) {
      // 简单检查：如果文本直接否定了已知事实
      if (content.includes(`不是${fact}`) || content.includes(`没有${fact}`)) {
        issues.push({
          type: 'world_consistency',
          severity: 'critical',
          description: `文本内容可能与已知事实"${fact}"矛盾`,
          location: { chapterId: '' }
        });
      }
    }
    
    const score = issues.filter(i => i.severity === 'critical').length > 0 
      ? 0.3 
      : issues.length > 0 ? 0.7 : 1.0;
    
    return {
      score,
      issues,
      details: `检查了世界观一致性，发现${issues.length}个问题`
    };
  }

  /**
   * 时间线一致性检查
   */
  private checkTimelineConsistency(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查时间悖论（未来事件发生在过去之前）
    const timelinePhrases = [
      '昨天', '今天', '明天', '前天', '后天',
      '去年', '今年', '明年', '上个月', '下个月'
    ];
    
    const timelineMentions = timelinePhrases.filter(phrase => 
      content.includes(phrase)
    );
    
    if (timelineMentions.length > 3) {
      issues.push({
        type: 'timeline_consistency',
        severity: 'warning',
        description: '文本中时间描述较多，请确保时间线逻辑正确',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.8 : 1.0,
      issues,
      details: `检查了时间线，发现${issues.length}个潜在问题`
    };
  }

  /**
   * 情节逻辑检查
   */
  private checkPlotLogic(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查因果关系
    const causePhrases = ['因为', '由于', '为了'];
    const effectPhrases = ['所以', '因此', '于是', '导致'];
    
    let causeCount = 0;
    let effectCount = 0;
    
    for (const phrase of causePhrases) {
      causeCount += this.countOccurrences(content, phrase);
    }
    for (const phrase of effectPhrases) {
      effectCount += this.countOccurrences(content, phrase);
    }
    
    // 如果有很多"因为"但很少"所以"，可能存在逻辑问题
    if (causeCount > 5 && effectCount < causeCount * 0.5) {
      issues.push({
        type: 'plot_logic',
        severity: 'info',
        description: '因果关系表述可能不够完整',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: `检查了情节逻辑，发现${issues.length}个问题`
    };
  }

  /**
   * 伏笔回收检查
   */
  private checkForeshadowFulfillment(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    const pendingHooks = truthFiles.pendingHooks || [];
    
    for (const hook of pendingHooks) {
      // 检查伏笔关键词是否在正文中出现
      const keywords = hook.description.split(/[,，]/).map(k => k.trim());
      const found = keywords.some(k => content.includes(k));
      
      if (!found && hook.status === 'foreshadowed') {
        issues.push({
          type: 'foreshadow_fulfillment',
          severity: 'warning',
          description: `伏笔"${hook.description}"设置后尚未回收`,
          location: { chapterId: '' }
        });
      }
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: `检查了伏笔，发现${issues.length}个未回收的伏笔`
    };
  }

  /**
   * 资源追踪检查
   */
  private checkResourceTracking(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    const resources = truthFiles.particleLedger || [];
    
    for (const resource of resources) {
      // 检查资源是否被消耗但未记录
      const consumePhrases = ['用完了', '消耗了', '失去了', '丢了'];
      const gainPhrases = ['获得了', '得到了', '得到了', '捡到了'];
      
      for (const phrase of consumePhrases) {
        if (content.includes(`${resource.name}${phrase}`) || 
            content.includes(`${phrase}${resource.name}`)) {
          // 检查是否在变更日志中有记录
          const hasLog = resource.changeLog.some(
            log => log.change.includes(phrase)
          );
          if (!hasLog) {
            issues.push({
              type: 'resource_tracking',
              severity: 'warning',
              description: `资源"${resource.name}"被消耗但未记录`,
              location: { chapterId: '' }
            });
          }
        }
      }
    }
    
    return {
      score: issues.length > 0 ? 0.8 : 1.0,
      issues,
      details: `检查了${resources.length}个资源，发现${issues.length}个追踪问题`
    };
  }

  /**
   * 情感弧线检查
   */
  private checkEmotionalArc(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const emotionalWords = [
      '高兴', '悲伤', '愤怒', '恐惧', '惊讶', '开心', '难过',
      '激动', '紧张', '害怕', '心疼', '感动', '委屈'
    ];
    
    let emotionCount = 0;
    for (const word of emotionalWords) {
      emotionCount += this.countOccurrences(content, word);
    }
    
    const emotionDensity = emotionCount / content.length * 10000;
    
    // 情感密度过低
    if (emotionDensity < 3) {
      return {
        score: 0.7,
        issues: [{
          type: 'emotional_arc',
          severity: 'warning',
          description: '情感描写较少，可能影响读者代入感',
          location: { chapterId: '' }
        }],
        details: '情感描写密度较低'
      };
    }
    
    return {
      score: 1.0,
      issues: [],
      details: '情感描写密度正常'
    };
  }

  /**
   * 叙事节奏检查
   */
  private checkNarrativePacing(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查段落长度
    const paragraphs = content.split(/\n\n+/);
    const longParagraphs = paragraphs.filter(p => p.length > 500);
    const shortParagraphs = paragraphs.filter(p => p.length < 50);
    
    if (longParagraphs.length > paragraphs.length * 0.6) {
      issues.push({
        type: 'narrative_pacing',
        severity: 'info',
        description: '长段落较多，可能影响阅读节奏',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: `检查了叙事节奏，发现${issues.length}个问题`
    };
  }

  /**
   * AI 痕迹检测
   */
  private checkAIDetection(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // AI 常用词汇
    const aiWords = [
      '然而', '因此', '所以', '值得注意的是', '毋庸置疑',
      '毫无疑问', '显而易见', '综上所述', '总的来说'
    ];
    
    let aiWordCount = 0;
    for (const word of aiWords) {
      aiWordCount += this.countOccurrences(content, word);
    }
    
    const aiWordDensity = aiWordCount / content.length * 1000;
    
    if (aiWordDensity > 2) {
      issues.push({
        type: 'ai_detection',
        severity: 'warning',
        description: '文本中包含较多 AI 常见表达，建议优化',
        location: { chapterId: '' }
      });
    }
    
    // 检查句长均匀度
    const sentences = content.split(/[。！？]/);
    if (sentences.length > 5) {
      const lengths = sentences.map(s => s.length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
      
      if (variance < 100) {
        issues.push({
          type: 'ai_detection',
          severity: 'info',
          description: '句长变化较小，可能存在 AI 生成特征',
          location: { chapterId: '' }
        });
      }
    }
    
    return {
      score: issues.length > 0 ? 0.75 : 1.0,
      issues,
      details: `AI 特征检测，发现${issues.length}个潜在 AI 痕迹`
    };
  }

  /**
   * 重复性检查
   */
  private checkRepetitiveness(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查连续重复的词
    const words = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordCounts = new Map<string, number>();
    
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    
    // 找出重复次数过多的词
    for (const [word, count] of wordCounts) {
      if (count > 10 && word.length >= 3) {
        issues.push({
          type: 'repetitiveness',
          severity: 'warning',
          description: `词语"${word}"出现了${count}次，可能过于重复`,
          location: { chapterId: '' }
        });
      }
    }
    
    return {
      score: issues.length > 0 ? 0.8 : 1.0,
      issues,
      details: `检查了重复性，发现${issues.length}个重复问题`
    };
  }

  /**
   * 能力一致性检查（修仙等）
   */
  private checkPowerConsistency(
    content: string, 
    truthFiles: TruthFiles
  ): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查等级变化
    const levelPatterns = [
      /筑基/, /金丹/, /元婴/, /化神/, /炼气/,
      /初级/, /中级/, /高级/, /大师/, /宗师/
    ];
    
    const levels: { name: string; index: number }[] = [];
    for (const pattern of levelPatterns) {
      const match = content.match(pattern);
      if (match) {
        levels.push({ name: match[0], index: levelPatterns.indexOf(pattern) });
      }
    }
    
    // 简单检查：等级不能倒退
    if (levels.length >= 2) {
      for (let i = 1; i < levels.length; i++) {
        if (levels[i].index < levels[i - 1].index) {
          issues.push({
            type: 'power_consistency',
            severity: 'critical',
            description: `检测到境界倒退：从"${levels[i - 1].name}"到"${levels[i].name}"`,
            location: { chapterId: '' }
          });
        }
      }
    }
    
    return {
      score: issues.filter(i => i.severity === 'critical').length > 0 ? 0.3 : 1.0,
      issues,
      details: `检查了能力体系，发现${issues.length}个一致性问题`
    };
  }

  /**
   * 统计词频
   */
  private countOccurrences(text: string, word: string): number {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * 获取角色别名
   */
  private getAliases(name: string): string[] {
    // 简单实现，实际应该从角色数据中获取
    const aliases: string[] = [];
    
    // 添加常见称呼
    if (name.length === 2) {
      aliases.push(name[0]); // 姓
      aliases.push(`${name}兄`);
      aliases.push(`${name}道友`);
    }
    
    return aliases;
  }
}

export default AIAuditEngine;
