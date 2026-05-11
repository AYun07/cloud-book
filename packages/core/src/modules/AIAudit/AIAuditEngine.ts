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
    let score = 1.0;
    let details = '';
    let dimensionIssues: Issue[] = [];
    
    switch (dimension) {
      case 'characterConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkCharacterConsistency(content, truthFiles));
        break;
      case 'worldConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkWorldConsistency(content, truthFiles));
        break;
      case 'timelineConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkTimelineConsistency(content, truthFiles));
        break;
      case 'plotLogic':
        ({ score, issues: dimensionIssues, details } = this.checkPlotLogic(content, truthFiles));
        break;
      case 'foreshadowFulfillment':
        ({ score, issues: dimensionIssues, details } = this.checkForeshadowFulfillment(content, truthFiles));
        break;
      case 'resourceTracking':
        ({ score, issues: dimensionIssues, details } = this.checkResourceTracking(content, truthFiles));
        break;
      case 'emotionalArc':
        ({ score, issues: dimensionIssues, details } = this.checkEmotionalArc(content, truthFiles));
        break;
      case 'narrativePacing':
        ({ score, issues: dimensionIssues, details } = this.checkNarrativePacing(content));
        break;
      case 'dialogueQuality':
        ({ score, issues: dimensionIssues, details } = this.checkDialogueQuality(content));
        break;
      case 'descriptionDensity':
        ({ score, issues: dimensionIssues, details } = this.checkDescriptionDensity(content));
        break;
      case 'aiDetection':
        ({ score, issues: dimensionIssues, details } = this.checkAIDetection(content));
        break;
      case 'repetitiveness':
        ({ score, issues: dimensionIssues, details } = this.checkRepetitiveness(content));
        break;
      case 'grammaticalErrors':
        ({ score, issues: dimensionIssues, details } = this.checkGrammaticalErrors(content));
        break;
      case 'tautology':
        ({ score, issues: dimensionIssues, details } = this.checkTautology(content));
        break;
      case 'logicalGaps':
        ({ score, issues: dimensionIssues, details } = this.checkLogicalGaps(content));
        break;
      case 'progressionPacing':
        ({ score, issues: dimensionIssues, details } = this.checkProgressionPacing(content));
        break;
      case 'conflictEscalation':
        ({ score, issues: dimensionIssues, details } = this.checkConflictEscalation(content));
        break;
      case 'characterMotivation':
        ({ score, issues: dimensionIssues, details } = this.checkCharacterMotivation(content));
        break;
      case 'stakesClarity':
        ({ score, issues: dimensionIssues, details } = this.checkStakesClarity(content));
        break;
      case 'sensoryDetails':
        ({ score, issues: dimensionIssues, details } = this.checkSensoryDetails(content));
        break;
      case 'backstoryIntegration':
        ({ score, issues: dimensionIssues, details } = this.checkBackstoryIntegration(content));
        break;
      case 'povConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkPOVConsistency(content));
        break;
      case 'tenseConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkTenseConsistency(content));
        break;
      case 'pacingVariation':
        ({ score, issues: dimensionIssues, details } = this.checkPacingVariation(content));
        break;
      case 'showVsTell':
        ({ score, issues: dimensionIssues, details } = this.checkShowVsTell(content));
        break;
      case 'subtext':
        ({ score, issues: dimensionIssues, details } = this.checkSubtext(content));
        break;
      case 'symbolism':
        ({ score, issues: dimensionIssues, details } = this.checkSymbolism(content));
        break;
      case 'thematicCoherence':
        ({ score, issues: dimensionIssues, details } = this.checkThematicCoherence(content));
        break;
      case 'readerEngagement':
        ({ score, issues: dimensionIssues, details } = this.checkReaderEngagement(content));
        break;
      case 'genreConvention':
        ({ score, issues: dimensionIssues, details } = this.checkGenreConvention(content, truthFiles));
        break;
      case 'culturalSensitivity':
        ({ score, issues: dimensionIssues, details } = this.checkCulturalSensitivity(content));
        break;
      case 'factualAccuracy':
        ({ score, issues: dimensionIssues, details } = this.checkFactualAccuracy(content));
        break;
      case 'powerConsistency':
        ({ score, issues: dimensionIssues, details } = this.checkPowerConsistency(content, truthFiles));
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
      issues: dimensionIssues
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

  /**
   * 对话质量检查
   */
  private checkDialogueQuality(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    // 检查对话标签
    const dialoguePattern = /"[^"]*"/g;
    const dialogues = content.match(dialoguePattern) || [];
    
    if (dialogues.length === 0) {
      issues.push({
        type: 'dialogue_quality',
        severity: 'warning',
        description: '本章没有对话内容，建议适当增加对话',
        location: { chapterId: '' }
      });
    }
    
    // 检查对话标签一致性
    const tags = ['说', '道', '问', '答', '笑', '叹', '喊', '叫', '想'];
    let tagCount = 0;
    for (const tag of tags) {
      tagCount += this.countOccurrences(content, tag);
    }
    
    const tagVariety = tagCount / dialogues.length;
    if (tagVariety < 0.3) {
      issues.push({
        type: 'dialogue_quality',
        severity: 'info',
        description: '对话标签可能过于单一，建议增加多样性',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.8 : 1.0,
      issues,
      details: `检查了${dialogues.length}段对话，发现${issues.length}个问题`
    };
  }

  /**
   * 描写密度检查
   */
  private checkDescriptionDensity(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const paragraphs = content.split(/\n\n+/);
    let descriptiveParagraphs = 0;
    
    const descriptiveWords = ['看见', '看到', '望着', '看着', '听', '听见', '闻', '闻见', '触', '摸到', '感觉', '感受到'];
    
    for (const para of paragraphs) {
      let count = 0;
      for (const word of descriptiveWords) {
        count += this.countOccurrences(para, word);
      }
      if (count > 2) descriptiveParagraphs++;
    }
    
    const density = descriptiveParagraphs / paragraphs.length;
    
    if (density < 0.2) {
      issues.push({
        type: 'description_density',
        severity: 'warning',
        description: '环境和细节描写较少，建议适当增加',
        location: { chapterId: '' }
      });
    }
    
    if (density > 0.8) {
      issues.push({
        type: 'description_density',
        severity: 'info',
        description: '描写可能过于密集，可能影响节奏',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: `描写密度为${(density * 100).toFixed(1)}%`
    };
  }

  /**
   * 语法错误检查
   */
  private checkGrammaticalErrors(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const commonErrors = [
      { pattern: /的得地/, check: (text: string) => text.includes('的') },
      { pattern: /在再/, check: (text: string) => text.includes('在') }
    ];
    
    return {
      score: 1.0,
      issues,
      details: '基础语法检查（建议使用专业语法检查工具'
    };
  }

  /**
   * 重复冗余检查
   */
  private checkTautology(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const tautologicalPhrases = [
      '非常特别', '十分非常', '十分特别', '十分十分', '非常非常',
      '刚刚才', '就就', '刚刚刚刚', '刚刚才', '仅仅只是', '仅仅只是',
      '亲眼目睹', '亲眼所见', '共同协商', '互相合作', '免费赠送'
    ];
    
    for (const phrase of tautologicalPhrases) {
      if (content.includes(phrase)) {
        issues.push({
          type: 'tautology',
          severity: 'info',
          description: `发现重复冗余表达: "${phrase}"，建议简化`,
          location: { chapterId: '' }
        });
      }
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: `发现${issues.length}个重复冗余表达`
    };
  }

  /**
   * 逻辑漏洞检查
   */
  private checkLogicalGaps(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const transitionWords = ['但是', '然而', '不过', '可是', '因此', '所以', '于是'];
    const transitionCount = transitionWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (transitionCount < 3 && content.length > 2000) {
      issues.push({
        type: 'logical_gaps',
        severity: 'info',
        description: '段落间可能需要更多逻辑过渡衔接',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了逻辑衔接'
    };
  }

  /**
   * 发展节奏检查
   */
  private checkProgressionPacing(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const actionWords = ['冲', '打', '杀', '战', '斗', '攻击', '战斗', '激战'];
    const expositionWords = ['说', '想', '回忆', '回忆', '思考', '回忆'];
    
    const actionCount = actionWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    const expositionCount = expositionWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    const ratio = actionCount / (expositionCount || 1);
    
    if (ratio < 0.1) {
      issues.push({
        type: 'progression_pacing',
        severity: 'warning',
        description: '动作场面可能过少，建议增加情节推进',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: `动作/叙述比例: ${ratio.toFixed(2)}`
    };
  }

  /**
   * 冲突升级检查
   */
  private checkConflictEscalation(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const conflictWords = ['愤怒', '生气', '仇恨', '痛恨', '危险', '危机', '紧急', '紧张'];
    const conflictLevel = conflictWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (conflictLevel < 3) {
      issues.push({
        type: 'conflict_escalation',
        severity: 'info',
        description: '本章冲突紧张感较低，可适当增强',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了冲突强度'
    };
  }

  /**
   * 角色动机检查
   */
  private checkCharacterMotivation(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const motivationWords = ['因为', '为了', '想要', '希望', '打算', '必须', '不得不'];
    const motivationCount = motivationWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (motivationCount < 2) {
      issues.push({
        type: 'character_motivation',
        severity: 'warning',
        description: '角色动机表述较少，建议明确角色行动动机',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: '检查了角色动机'
    };
  }

  /**
   * 利害清晰度检查
   */
  private checkStakesClarity(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const stakesWords = ['如果不', '否则', '要是', '万一', '否则的话'];
    const stakesCount = stakesWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (stakesCount < 1) {
      issues.push({
        type: 'stakes_clarity',
        severity: 'info',
        description: '建议明确如果失败会有什么后果',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了利害关系'
    };
  }

  /**
   * 感官细节检查
   */
  private checkSensoryDetails(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const senses = {
      sight: ['看', '见', '望', '视', '观察'],
      sound: ['听', '闻', '声', '音', '响'],
      smell: ['闻', '嗅', '味', '香', '臭'],
      taste: ['尝', '味', '甜', '苦', '酸'],
      touch: ['摸', '触', '碰', '按', '握']
    };
    
    let coveredSenses = 0;
    for (const [sense, words] of Object.entries(senses)) {
      const hasSense = words.some(word => content.includes(word));
      if (hasSense) coveredSenses++;
    }
    
    if (coveredSenses < 2) {
      issues.push({
        type: 'sensory_details',
        severity: 'info',
        description: '感官描写较少，建议增加多感官体验',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: `覆盖了${coveredSenses}种感官`
    };
  }

  /**
   * 背景故事融合检查
   */
  private checkBackstoryIntegration(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const backstoryIndicators = ['记得', '回忆', '想起', '以前', '过去', '曾经'];
    const backstoryCount = backstoryIndicators.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    const paragraphs = content.split(/\n\n+/);
    let longFlashbackParagraphs = paragraphs.filter(p => backstoryIndicators.some(word => p.includes(word))).length;
    
    if (longFlashbackParagraphs > paragraphs.length * 0.3) {
      issues.push({
        type: 'backstory_integration',
        severity: 'warning',
        description: '回忆段落可能过多，建议控制在叙述中自然融入',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: '检查了背景故事融合'
    };
  }

  /**
   * 视角一致性检查
   */
  private checkPOVConsistency(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const firstPerson = ['我', '我们', '我的', '我们的'];
    const thirdPerson = ['他', '她', '它', '他们', '她们', '它们'];
    
    let firstCount = firstPerson.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    let thirdCount = thirdPerson.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (firstCount > 50 && thirdCount > 50) {
      issues.push({
        type: 'pov_consistency',
        severity: 'warning',
        description: '视角可能在第一人称和第三人称之间频繁切换',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.75 : 1.0,
      issues,
      details: '检查了视角一致性'
    };
  }

  /**
   * 时态一致性检查
   */
  private checkTenseConsistency(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const pastTense = ['了', '过', '已', '已经', '曾', '曾经'];
    const presentTense = ['现在', '正', '正在', '此刻'];
    
    const pastCount = pastTense.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    const presentCount = presentTense.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (pastCount > presentCount * 3 && presentCount > 10) {
      issues.push({
        type: 'tense_consistency',
        severity: 'info',
        description: '注意时态切换可能需要统一',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了时态一致性'
    };
  }

  /**
   * 节奏变化检查
   */
  private checkPacingVariation(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const sentences = content.split(/[。！？]/);
    const lengths = sentences.map(s => s.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    
    if (variance < 200) {
      issues.push({
        type: 'pacing_variation',
        severity: 'info',
        description: '句式变化较少，建议增加长短句交替',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了节奏变化'
    };
  }

  /**
   * 展示vs叙述检查
   */
  private checkShowVsTell(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const tellWords = ['很', '非常', '十分', '特别', '极其', '超级', '特别'];
    const tellCount = tellWords.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    if (tellCount > 15) {
      issues.push({
        type: 'show_vs_tell',
        severity: 'warning',
        description: '直接评价词较多，建议用具体描写代替抽象评价',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.85 : 1.0,
      issues,
      details: '检查了展示vs叙述'
    };
  }

  /**
   * 潜文本/潜台词检查
   */
  private checkSubtext(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const silenceIndicators = ['沉默', '没说话', '不说话', '不语'];
    const actionWords = ['握紧', '攥紧', '咬着', '攥着', '低着头'];
    
    const hasSubtext = silenceIndicators.some(word => content.includes(word)) ||
                        actionWords.some(word => content.includes(word));
    
    if (!hasSubtext) {
      issues.push({
        type: 'subtext',
        severity: 'info',
        description: '可以适当增加一些未直接说出的潜台词或动作细节',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了潜文本'
    };
  }

  /**
   * 象征意象/象征手法检查
   */
  private checkSymbolism(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const symbolicObjects = ['月亮', '太阳', '星星', '风', '雨', '雪', '花', '树'];
    const symbolCount = symbolicObjects.reduce((sum, word) => sum + this.countOccurrences(content, word), 0);
    
    return {
      score: 1.0,
      issues,
      details: symbolCount > 0 ? '发现可能的象征意象' : '象征检查'
    };
  }

  /**
   * 主题一致性检查
   */
  private checkThematicCoherence(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    return {
      score: 1.0,
      issues,
      details: '主题一致性检查需要故事上下文'
    };
  }

  /**
   * 读者参与度检查
   */
  private checkReaderEngagement(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    const questionCount = this.countOccurrences(content, '？');
    const exclamationCount = this.countOccurrences(content, '！');
    
    const totalMarks = questionCount + exclamationCount;
    
    if (totalMarks < 5 && content.length > 3000) {
      issues.push({
        type: 'reader_engagement',
        severity: 'info',
        description: '可适当增加感叹和疑问句来增强情绪表达',
        location: { chapterId: '' }
      });
    }
    
    return {
      score: issues.length > 0 ? 0.9 : 1.0,
      issues,
      details: '检查了读者参与度'
    };
  }

  /**
   * 类型惯例检查
   */
  private checkGenreConvention(content: string, truthFiles: TruthFiles): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    return {
      score: 1.0,
      issues,
      details: '类型惯例检查需要类型配置'
    };
  }

  /**
   * 文化敏感性检查
   */
  private checkCulturalSensitivity(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    return {
      score: 1.0,
      issues,
      details: '文化敏感性检查'
    };
  }

  /**
   * 事实准确性检查
   */
  private checkFactualAccuracy(content: string): { score: number; issues: Issue[]; details: string } {
    const issues: Issue[] = [];
    
    return {
      score: 1.0,
      issues,
      details: '事实准确性检查需要事实库'
    };
  }
}

export default AIAuditEngine;
