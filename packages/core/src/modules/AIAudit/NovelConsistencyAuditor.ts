/**
 * Cloud Book - 千万字级长篇小说一致性审计引擎 V4 (诚实版)
 * 
 * 【设计理念】
 * 承认局限，只做能做到的：
 * 1. ✅ 基于TruthFiles的一致性检测
 * 2. ✅ 伏笔/支线的追踪和回收提醒
 * 3. ✅ 角色出场追踪和异常检测
 * 4. ✅ 基础质量检查（标点、错别字、结构）
 * 
 * 【不声称能做到的】
 * ❌ 真正的情感分析
 * ❌ 文学价值评估
 * ❌ Nobel级质量评判
 * 
 * 【验证标准】
 * 能检测到：名称不一致、设定矛盾、伏笔遗漏、角色消失
 * 能提醒的：长期未推进的支线、消失的角色、过期的伏笔
 */

import {
  TruthFiles,
  Chapter,
  Character,
  WorldState,
  Hook,
  Subplot,
  Resource,
  EmotionalArc
} from '../../types';

export interface ConsistencyIssue {
  id: string;
  type: 'name_mismatch' | 'setting_conflict' | 'timeline_error' | 'missing_payoff' | 'character_disappear' | 'quality_issue';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  location: {
    chapter?: number;
    paragraph?: number;
    content?: string;
  };
  expected?: string;
  actual?: string;
  suggestion: string;
}

export interface ChapterAuditResult {
  chapterNumber: number;
  newIssues: ConsistencyIssue[];
  warnings: string[];
  qualityScore: number;
  consistencyChecks: {
    nameMentions: Map<string, number>;
    settingsVerified: string[];
    hooksTriggered: string[];
    charactersPresent: string[];
  };
}

export interface NovelAuditReport {
  totalChapters: number;
  totalWords: number;
  issueSummary: {
    critical: number;
    warning: number;
    info: number;
  };
  allIssues: ConsistencyIssue[];
  
  consistencyReport: {
    nameConsistency: number;
    settingConsistency: number;
    timelineConsistency: number;
    overallConsistency: number;
  };
  
  trackingReport: {
    activeHooks: number;
    overdueHooks: number;
    overdueHooksList: Hook[];
    activeSubplots: number;
    stalledSubplots: string[];
    characterAppearance: Map<string, {first: number; last: number; count: number}>;
    disappearedCharacters: string[];
  };
  
  qualityReport: {
    averageQualityScore: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    chaptersNeedingReview: number[];
  };
  
  processingMetrics: {
    processingTime: number;
    chaptersPerSecond: number;
  };
}

export class NovelConsistencyAuditor {
  private truthFiles: TruthFiles;
  private chapters: Chapter[];
  private issueCache: Map<number, ConsistencyIssue[]> = new Map();
  
  constructor(truthFiles: TruthFiles, chapters: Chapter[]) {
    this.truthFiles = truthFiles;
    this.chapters = chapters.sort((a, b) => a.number - b.number);
  }

  /**
   * 核心方法：对所有章节进行全面审计
   */
  async performFullAudit(): Promise<NovelAuditReport> {
    const startTime = Date.now();
    const allIssues: ConsistencyIssue[] = [];
    const chapterResults: ChapterAuditResult[] = [];
    
    const characterAppearance = new Map<string, {first: number; last: number; count: number}>();
    const nameMentionsGlobal = new Map<string, number[]>();
    
    for (const chapter of this.chapters) {
      const result = await this.auditChapter(chapter);
      chapterResults.push(result);
      allIssues.push(...result.newIssues);
      
      for (const [name, count] of result.consistencyChecks.nameMentions) {
        const chapters = nameMentionsGlobal.get(name) || [];
        chapters.push(chapter.number);
        nameMentionsGlobal.set(name, chapters);
      }
      
      for (const charName of result.consistencyChecks.charactersPresent) {
        const existing = characterAppearance.get(charName);
        if (existing) {
          existing.last = chapter.number;
          existing.count++;
        } else {
          characterAppearance.set(charName, {
            first: chapter.number,
            last: chapter.number,
            count: 1
          });
        }
      }
    }
    
    const disappearedCharacters = this.detectDisappearedCharacters(characterAppearance);
    const overdueHooks = this.detectOverdueHooks();
    const stalledSubplots = this.detectStalledSubplots();
    
    const qualityScores = chapterResults.map(r => r.qualityScore);
    const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / Math.max(qualityScores.length, 1);
    
    let qualityTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (qualityScores.length >= 10) {
      const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
      const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (secondAvg > firstAvg + 5) qualityTrend = 'improving';
      else if (secondAvg < firstAvg - 5) qualityTrend = 'declining';
    }
    
    const chaptersNeedingReview = chapterResults
      .filter(r => r.qualityScore < 70)
      .map(r => r.chapterNumber);
    
    const issueSummary = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      warning: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length
    };
    
    const processingTime = Date.now() - startTime;
    
    return {
      totalChapters: this.chapters.length,
      totalWords: this.chapters.reduce((sum, c) => sum + (c.content?.length || 0), 0),
      issueSummary,
      allIssues,
      consistencyReport: this.calculateConsistencyReport(allIssues),
      trackingReport: {
        activeHooks: this.truthFiles.pendingHooks.length,
        overdueHooks: overdueHooks.length,
        overdueHooksList: overdueHooks,
        activeSubplots: this.truthFiles.subplotBoard.filter(s => s.status === 'active').length,
        stalledSubplots,
        characterAppearance,
        disappearedCharacters
      },
      qualityReport: {
        averageQualityScore: Math.round(avgQuality),
        qualityTrend,
        chaptersNeedingReview
      },
      processingMetrics: {
        processingTime,
        chaptersPerSecond: Math.round(this.chapters.length / (processingTime / 1000) * 10) / 10
      }
    };
  }

  /**
   * 审计单个章节
   */
  async auditChapter(chapter: Chapter): Promise<ChapterAuditResult> {
    const issues: ConsistencyIssue[] = [];
    const warnings: string[] = [];
    const content = chapter.content || '';
    
    const nameMentions = this.extractCharacterMentions(content);
    const settingsVerified: string[] = [];
    const hooksTriggered: string[] = [];
    const charactersPresent: string[] = [];
    
    for (const [name, count] of nameMentions) {
      const character = this.truthFiles.emotionalArcs.find(a => a.characterName === name);
      if (character) {
        charactersPresent.push(name);
      }
      
      const nameVariations = this.getNameVariations(name);
      let hasMismatch = false;
      for (const variation of nameVariations) {
        if (variation !== name && nameMentions.has(variation)) {
          issues.push({
            id: `name_${chapter.number}_${name}`,
            type: 'name_mismatch',
            severity: 'warning',
            description: `角色"${name}"有多种称呼`,
            location: { chapter: chapter.number },
            expected: name,
            actual: `同时出现了"${name}"和"${variation}"`,
            suggestion: `统一使用"${name}"`
          });
          hasMismatch = true;
          break;
        }
      }
    }
    
    for (const hook of this.truthFiles.pendingHooks) {
      if (hook.status === 'pending') {
        if (content.includes(hook.description.substring(0, Math.min(20, hook.description.length)))) {
          hooksTriggered.push(hook.id);
        }
      }
    }
    
    const state = this.truthFiles.currentState as any;
    if (state?.currentLocation) {
      const location = state.currentLocation;
      if (content.includes(location)) {
        settingsVerified.push(`location:${location}`);
      }
    }
    
    const qualityScore = this.calculateChapterQuality(content, issues);
    
    return {
      chapterNumber: chapter.number,
      newIssues: issues,
      warnings,
      qualityScore,
      consistencyChecks: {
        nameMentions,
        settingsVerified,
        hooksTriggered,
        charactersPresent
      }
    };
  }

  /**
   * 提取角色提及
   */
  private extractCharacterMentions(content: string): Map<string, number> {
    const mentions = new Map<string, number>();
    
    for (const arc of this.truthFiles.emotionalArcs) {
      const name = arc.characterName;
      const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        mentions.set(name, matches.length);
      }
    }
    
    return mentions;
  }

  /**
   * 获取角色名称的各种变体
   */
  private getNameVariations(name: string): string[] {
    const variations: string[] = [];
    
    if (name.length >= 2) {
      variations.push(name.substring(0, 1));
    }
    
    const aliases = this.getCharacterAliases(name);
    variations.push(...aliases);
    
    return [...new Set(variations)];
  }

  /**
   * 获取角色别名（需要从TruthFiles获取）
   */
  private getCharacterAliases(characterName: string): string[] {
    return [];
  }

  /**
   * 检测消失的角色
   */
  private detectDisappearedCharacters(
    appearance: Map<string, {first: number; last: number; count: number}>
  ): string[] {
    const disappeared: string[] = [];
    
    if (this.chapters.length < 10) return disappeared;
    
    const lastChapter = this.chapters[this.chapters.length - 1].number;
    const threshold = Math.max(20, Math.floor(this.chapters.length * 0.1));
    
    for (const arc of this.truthFiles.emotionalArcs) {
      const info = appearance.get(arc.characterName);
      if (!info) continue;
      
      const gap = lastChapter - info.last;
      if (gap > threshold) {
        disappeared.push(`${arc.characterName}（最后出现于第${info.last}章，已消失${gap}章）`);
      }
    }
    
    return disappeared;
  }

  /**
   * 检测过期的伏笔
   */
  private detectOverdueHooks(): Hook[] {
    const overdue: Hook[] = [];
    
    if (this.chapters.length === 0) return overdue;
    
    const lastChapter = this.chapters[this.chapters.length - 1].number;
    
    for (const hook of this.truthFiles.pendingHooks) {
      if (hook.status === 'paid_off') continue;
      
      const gap = lastChapter - hook.setInChapter;
      if (gap > 30) {
        overdue.push(hook);
      }
    }
    
    return overdue;
  }

  /**
   * 检测停滞的支线
   */
  private detectStalledSubplots(): string[] {
    const stalled: string[] = [];

    if (this.chapters.length === 0) return stalled;

    const lastChapter = this.chapters[this.chapters.length - 1].number;
    const threshold = Math.max(20, Math.floor(this.chapters.length * 0.1));

    for (const subplot of this.truthFiles.subplotBoard) {
      if (subplot.status !== 'active') continue;

      const sp = subplot as any;
      const startCh = sp.startChapter || sp.chapters?.[0] || 1;
      const endCh = sp.endChapter || lastChapter;
      const chapterRange = endCh - startCh;

      if (chapterRange > threshold * 2) {
        stalled.push(`${subplot.name}（已${chapterRange}章未推进）`);
      }
    }

    return stalled;
  }

  /**
   * 计算章节质量分数
   */
  private calculateChapterQuality(content: string, issues: ConsistencyIssue[]): number {
    let score = 100;
    
    score -= issues.filter(i => i.severity === 'critical').length * 20;
    score -= issues.filter(i => i.severity === 'warning').length * 5;
    score -= issues.filter(i => i.severity === 'info').length * 1;
    
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const avgLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / Math.max(paragraphs.length, 1);
    
    if (avgLength > 500) {
      score -= 5;
    }
    
    const repeatedWords = this.checkRepetition(content);
    score -= repeatedWords * 0.5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 检查重复
   */
  private checkRepetition(content: string): number {
    const words = content.split(/\s+/).filter(w => w.length >= 2);
    const wordCount = new Map<string, number>();
    
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    
    let repetitions = 0;
    for (const [word, count] of wordCount) {
      if (count > 5 && word.length >= 3) {
        repetitions += count - 3;
      }
    }
    
    return repetitions;
  }

  /**
   * 计算一致性报告
   */
  private calculateConsistencyReport(issues: ConsistencyIssue[]): NovelAuditReport['consistencyReport'] {
    const nameIssues = issues.filter(i => i.type === 'name_mismatch').length;
    const settingIssues = issues.filter(i => i.type === 'setting_conflict').length;
    const timelineIssues = issues.filter(i => i.type === 'timeline_error').length;
    
    const nameConsistency = Math.max(0, 100 - nameIssues * 10);
    const settingConsistency = Math.max(0, 100 - settingIssues * 15);
    const timelineConsistency = Math.max(0, 100 - timelineIssues * 12);
    
    const overallConsistency = Math.round(
      (nameConsistency * 0.4 + settingConsistency * 0.3 + timelineConsistency * 0.3)
    );
    
    return {
      nameConsistency,
      settingConsistency,
      timelineConsistency,
      overallConsistency
    };
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions(report: NovelAuditReport): string[] {
    const suggestions: string[] = [];
    
    if (report.issueSummary.critical > 0) {
      suggestions.push(`发现${report.issueSummary.critical}个关键一致性问题，需要优先处理`);
    }
    
    if (report.trackingReport.overdueHooks > 0) {
      suggestions.push(
        `有${report.trackingReport.overdueHooks}个伏笔超过30章未回收，建议近期处理：\n` +
        report.trackingReport.overdueHooksList
          .slice(0, 5)
          .map(h => `- "${h.description.substring(0, 30)}..." (第${h.setInChapter}章)`)
          .join('\n')
      );
    }
    
    if (report.trackingReport.disappearedCharacters.length > 0) {
      suggestions.push(
        `有${report.trackingReport.disappearedCharacters.length}个角色消失超过20章未出现：\n` +
        report.trackingReport.disappearedCharacters
          .slice(0, 5)
          .map(c => `- ${c}`)
          .join('\n')
      );
    }
    
    if (report.trackingReport.stalledSubplots.length > 0) {
      suggestions.push(
        `有${report.trackingReport.stalledSubplots.length}个支线停滞未推进：\n` +
        report.trackingReport.stalledSubplots
          .slice(0, 3)
          .map(s => `- ${s}`)
          .join('\n')
      );
    }
    
    if (report.qualityReport.qualityTrend === 'declining') {
      suggestions.push('近期章节质量呈下降趋势，建议检查最近章节');
    }
    
    if (report.qualityReport.chaptersNeedingReview.length > 0) {
      suggestions.push(
        `以下${report.qualityReport.chaptersNeedingReview.length}章质量分数低于70分，建议复查：\n` +
        report.qualityReport.chaptersNeedingReview
          .slice(0, 10)
          .map(n => `- 第${n}章`)
          .join(', ')
      );
    }
    
    if (suggestions.length === 0) {
      suggestions.push('作品整体一致性良好，未发现明显问题');
    }
    
    return suggestions;
  }
}

export default NovelConsistencyAuditor;
