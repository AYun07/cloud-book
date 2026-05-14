/**
 * Cloud Book - 高级长篇质量引擎 V5 (深度优化版)
 * 
 * 【深度优化方向】
 * 1. 伏笔网络分析 - 检测伏笔间的关联和回收质量
 * 2. 叙事节奏算法 - 分析场景节奏模式
 * 3. 角色对话指纹 - 识别不同角色的语言风格
 * 4. 场景连续性检测 - 分析场景转换合理性
 * 5. 情感弧线合理性 - 检测情感变化是否符合情节
 * 6. 主题密度分析 - 检测主题分布密度
 */

import {
  TruthFiles,
  Chapter,
  Hook,
  Subplot,
  EmotionalArc
} from '../../types';

export interface AdvancedIssue {
  id: string;
  type: 
    | 'hook_network_broken'
    | 'pacing_anomaly'
    | 'character_voice_inconsistent'
    | 'scene_transition_weak'
    | 'emotion_arc_illogical'
    | 'theme_density_imbalanced';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  chapters: number[];
  suggestion: string;
  confidence: number;
}

export interface HookNetworkAnalysis {
  totalHooks: number;
  hookNetworks: HookNetwork[];
  orphanedHooks: Hook[];
  suspiciousRecycles: SuspiciousRecycle[];
  networkCoverage: number;
}

export interface HookNetwork {
  rootHookId: string;
  childHookIds: string[];
  relatedHooks: string[];
  depth: number;
  width: number;
  isComplete: boolean;
  completionQuality: number;
}

export interface SuspiciousRecycle {
  hook: Hook;
  reason: string;
  pre铺垫充分度: number;
}

export interface PacingAnalysis {
  overallPacingScore: number;
  chapterPacing: ChapterPacing[];
  pacingPatterns: PacingPattern[];
  anomalies: PacingAnomaly[];
}

export interface ChapterPacing {
  chapter: number;
  pacingScore: number;
  sceneCount: number;
  actionDensity: number;
  dialogueDensity: number;
  internalDensity: number;
  pacingType: 'fast' | 'moderate' | 'slow';
}

export interface PacingPattern {
  type: 'action_dialogue' | 'dialogue_internal' | 'action_internal' | 'mixed';
  chapters: number[];
  frequency: number;
  quality: number;
}

export interface PacingAnomaly {
  chapter: number;
  type: 'too_fast' | 'too_slow' | 'unbalanced';
  description: string;
  suggestion: string;
}

export interface CharacterVoiceAnalysis {
  characterId: string;
  characterName: string;
  vocabularyProfile: VocabularyProfile;
  sentenceProfile: SentenceProfile;
  topicProfile: string[];
  voiceConsistency: number;
  inconsistencies: VoiceInconsistency[];
}

export interface VocabularyProfile {
  frequentWords: Map<string, number>;
  uniqueExpressions: string[];
  speechPatterns: string[];
}

export interface SentenceProfile {
  avgLength: number;
  questionRatio: number;
  exclamationRatio: number;
  fragmentRatio: number;
}

export interface VoiceInconsistency {
  chapter: number;
  description: string;
  deviation: number;
}

export interface SceneContinuityAnalysis {
  sceneCount: number;
  transitions: SceneTransition[];
  continuityGaps: ContinuityGap[];
  overallContinuityScore: number;
}

export interface SceneTransition {
  fromChapter: number;
  toChapter: number;
  transitionType: 'smooth' | 'abrupt' | 'confusing';
  transitionQuality: number;
  issue?: string;
}

export interface ContinuityGap {
  chapter: number;
  type: 'time_jump' | 'location_jump' | 'character_jump' | 'logic_jump';
  description: string;
  severity: number;
}

export interface EmotionArcAnalysis {
  characterId: string;
  characterName: string;
  arcType: 'progressive' | 'regressive' | 'cyclical' | 'erratic';
  transitions: EmotionTransition[];
  illogicalTransitions: IllogicalTransition[];
  arcQuality: number;
}

export interface EmotionTransition {
  fromChapter: number;
  toChapter: number;
  fromEmotion: string;
  toEmotion: string;
  trigger?: string;
  isJustified: boolean;
}

export interface IllogicalTransition {
  fromChapter: number;
  toChapter: number;
  fromEmotion: string;
  toEmotion: string;
  reason: string;
  plotContext?: string;
}

export interface ThemeDensityAnalysis {
  theme: string;
  densityByChapter: Map<number, number>;
  overallDensity: number;
  densityTrend: 'increasing' | 'stable' | 'decreasing' | 'fluctuating';
  peakChapters: number[];
  valleyChapters: number[];
  themeCoherence: number;
}

export interface ComprehensiveQualityReport {
  hookNetworkAnalysis: HookNetworkAnalysis;
  pacingAnalysis: PacingAnalysis;
  characterVoiceAnalysis: CharacterVoiceAnalysis[];
  sceneContinuityAnalysis: SceneContinuityAnalysis;
  emotionArcAnalysis: EmotionArcAnalysis[];
  themeDensityAnalysis: ThemeDensityAnalysis[];
  
  overallQualityScore: number;
  qualityBreakdown: {
    hookManagement: number;
    pacingControl: number;
    characterVoice: number;
    sceneContinuity: number;
    emotionArc: number;
    themeDepth: number;
  };
  
  criticalIssues: AdvancedIssue[];
  recommendations: string[];
}

export class AdvancedNovelQualityEngine {
  private truthFiles: TruthFiles;
  private chapters: Chapter[];

  constructor(truthFiles: TruthFiles, chapters: Chapter[]) {
    this.truthFiles = truthFiles;
    this.chapters = chapters.sort((a, b) => a.number - b.number);
  }

  async performComprehensiveAnalysis(): Promise<ComprehensiveQualityReport> {
    const hookAnalysis = await this.analyzeHookNetwork();
    const pacingAnalysis = await this.analyzePacing();
    const voiceAnalysis = await this.analyzeCharacterVoices();
    const continuityAnalysis = await this.analyzeSceneContinuity();
    const emotionAnalysis = await this.analyzeEmotionArcs();
    const themeAnalysis = await this.analyzeThemeDensity();

    const qualityBreakdown = {
      hookManagement: this.calculateHookManagementScore(hookAnalysis),
      pacingControl: pacingAnalysis.overallPacingScore,
      characterVoice: this.calculateVoiceScore(voiceAnalysis),
      sceneContinuity: continuityAnalysis.overallContinuityScore,
      emotionArc: this.calculateEmotionArcScore(emotionAnalysis),
      themeDepth: this.calculateThemeDepthScore(themeAnalysis)
    };

    const overallScore = Math.round(
      (qualityBreakdown.hookManagement * 0.15 +
      qualityBreakdown.pacingControl * 0.15 +
      qualityBreakdown.characterVoice * 0.15 +
      qualityBreakdown.sceneContinuity * 0.20 +
      qualityBreakdown.emotionArc * 0.20 +
      qualityBreakdown.themeDepth * 0.15)
    );

    const criticalIssues = this.aggregateCriticalIssues(
      hookAnalysis,
      pacingAnalysis,
      voiceAnalysis,
      continuityAnalysis,
      emotionAnalysis
    );

    return {
      hookNetworkAnalysis: hookAnalysis,
      pacingAnalysis,
      characterVoiceAnalysis: voiceAnalysis,
      sceneContinuityAnalysis: continuityAnalysis,
      emotionArcAnalysis: emotionAnalysis,
      themeDensityAnalysis: themeAnalysis,
      overallQualityScore: overallScore,
      qualityBreakdown,
      criticalIssues,
      recommendations: this.generateRecommendations(criticalIssues, qualityBreakdown)
    };
  }

  /**
   * 1. 伏笔网络分析
   * 不仅检测单个伏笔，还分析伏笔之间的关系
   */
  private async analyzeHookNetwork(): Promise<HookNetworkAnalysis> {
    const hooks = this.truthFiles.pendingHooks;
    const hookNetworks: HookNetwork[] = [];
    const orphanedHooks: Hook[] = [];
    const suspiciousRecycles: SuspiciousRecycle[] = [];

    const hookById = new Map<string, Hook>();
    for (const hook of hooks) {
      hookById.set(hook.id, hook);
    }

    for (const hook of hooks) {
      const network = this.buildHookNetwork(hook, hookById, new Set());
      if (network) {
        hookNetworks.push(network);
      }
    }

    for (const hook of hooks) {
      if (this.isOrphanedHook(hook, hookNetworks)) {
        orphanedHooks.push(hook);
      }
    }

    for (const hook of hooks) {
      if (hook.status === 'paid_off') {
        const pre铺垫充分度 = this.calculateHookPreparationQuality(hook);
        if (pre铺垫充分度 < 30) {
          suspiciousRecycles.push({
            hook,
            reason: '伏笔铺垫不足就回收',
            pre铺垫充分度
          });
        }
      }
    }

    const totalPossibleConnections = hooks.length * (hooks.length - 1) / 2;
    const actualConnections = hookNetworks.reduce((sum, n) => sum + n.childHookIds.length + n.relatedHooks.length, 0);
    const networkCoverage = totalPossibleConnections > 0 
      ? Math.round(actualConnections / totalPossibleConnections * 100) 
      : 0;

    return {
      totalHooks: hooks.length,
      hookNetworks,
      orphanedHooks,
      suspiciousRecycles,
      networkCoverage
    };
  }

  private buildHookNetwork(
    hook: Hook, 
    hookById: Map<string, Hook>,
    visited: Set<string>
  ): HookNetwork | null {
    if (visited.has(hook.id)) return null;
    visited.add(hook.id);

    const childHookIds: string[] = [];
    const relatedHooks: string[] = [];

    for (const otherHook of this.truthFiles.pendingHooks) {
      if (otherHook.id === hook.id) continue;

      if (this.areHooksRelated(hook, otherHook)) {
        relatedHooks.push(otherHook.id);
      }
    }

    let depth = 0;
    let width = relatedHooks.length;

    return {
      rootHookId: hook.id,
      childHookIds,
      relatedHooks,
      depth,
      width,
      isComplete: hook.status === 'paid_off',
      completionQuality: hook.status === 'paid_off' 
        ? this.calculateHookPreparationQuality(hook) 
        : 0
    };
  }

  private areHooksRelated(hook1: Hook, hook2: Hook): boolean {
    const keywords1 = this.extractKeywords(hook1.description);
    const keywords2 = this.extractKeywords(hook2.description);
    
    const intersection = keywords1.filter(k => keywords2.includes(k));
    return intersection.length >= 2;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['的', '了', '是', '在', '有', '和', '与', '或', '等', '这', '那']);
    const words = text.split('').filter(w => !stopWords.has(w) && w.trim().length > 0);
    const wordCount = new Map<string, number>();
    
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    
    return Array.from(wordCount.entries())
      .filter(([_, count]) => count >= 2)
      .map(([word]) => word);
  }

  private isOrphanedHook(hook: Hook, networks: HookNetwork[]): boolean {
    for (const network of networks) {
      if (network.rootHookId === hook.id) return false;
      if (network.relatedHooks.includes(hook.id)) return false;
    }
    return true;
  }

  private calculateHookPreparationQuality(hook: Hook): number {
    const chapters = this.chapters.filter(c => c.number < hook.setInChapter);
    let qualityScore = 0;

    for (const chapter of chapters) {
      const content = chapter.content || '';
      const hookKeywords = this.extractKeywords(hook.description);
      
      let keywordsFound = 0;
      for (const keyword of hookKeywords.slice(0, 5)) {
        if (content.includes(keyword)) {
          keywordsFound++;
        }
      }
      
      qualityScore += keywordsFound * 20;
    }

    return Math.min(100, qualityScore);
  }

  private calculateHookManagementScore(analysis: HookNetworkAnalysis): number {
    let score = 100;

    score -= analysis.orphanedHooks.length * 5;
    score -= analysis.suspiciousRecycles.length * 10;
    score -= Math.max(0, 30 - analysis.networkCoverage);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 2. 叙事节奏算法
   * 分析场景节奏模式，检测异常节奏
   */
  private async analyzePacing(): Promise<PacingAnalysis> {
    const chapterPacing: ChapterPacing[] = [];
    const pacingPatterns: PacingPattern[] = [];
    const anomalies: PacingAnomaly[] = [];

    for (const chapter of this.chapters) {
      const pacing = this.analyzeChapterPacing(chapter);
      chapterPacing.push(pacing);
    }

    for (let i = 1; i < chapterPacing.length; i++) {
      const prev = chapterPacing[i - 1];
      const curr = chapterPacing[i];

      if (Math.abs(curr.pacingScore - prev.pacingScore) > 40) {
        anomalies.push({
          chapter: curr.chapter,
          type: Math.abs(curr.pacingScore - prev.pacingScore) > 60 ? 'too_fast' : 'unbalanced',
          description: `节奏从${prev.pacingType}突变到${curr.pacingType}`,
          suggestion: '考虑平滑过渡，避免节奏突变'
        });
      }
    }

    const patternGroups = this.detectPacingPatterns(chapterPacing);
    for (const group of patternGroups) {
      pacingPatterns.push(group);
    }

    const avgPacing = chapterPacing.reduce((sum, p) => sum + p.pacingScore, 0) / Math.max(chapterPacing.length, 1);
    
    let tooFast = 0, tooSlow = 0;
    for (const pacing of chapterPacing) {
      if (pacing.pacingScore > avgPacing + 30) tooFast++;
      if (pacing.pacingScore < avgPacing - 30) tooSlow++;
    }

    const overallPacingScore = Math.max(0, 100 - (tooFast + tooSlow) * 5);

    return {
      overallPacingScore,
      chapterPacing,
      pacingPatterns,
      anomalies
    };
  }

  private analyzeChapterPacing(chapter: Chapter): ChapterPacing {
    const content = chapter.content || '';
    
    const actionWords = ['打', '冲', '跑', '跳', '战斗', '攻击', '逃跑', '追'];
    const dialogueMarkers = ['：', '"', '"', '「', '」', '说', '道', '问', '答'];
    const internalWords = ['想', '觉得', '感到', '明白', '意识到', '回忆', '记得'];

    let actionCount = 0, dialogueCount = 0, internalCount = 0;

    for (const word of actionWords) {
      actionCount += (content.match(new RegExp(word, 'g')) || []).length;
    }
    for (const marker of dialogueMarkers) {
      dialogueCount += (content.match(new RegExp(marker, 'g')) || []).length;
    }
    for (const word of internalWords) {
      internalCount += (content.match(new RegExp(word, 'g')) || []).length;
    }

    const totalDensity = actionCount + dialogueCount + internalCount;
    const actionDensity = totalDensity > 0 ? actionCount / totalDensity : 0;
    const dialogueDensity = totalDensity > 0 ? dialogueCount / totalDensity : 0;
    const internalDensity = totalDensity > 0 ? internalCount / totalDensity : 0;

    let pacingScore = 50;
    if (actionDensity > 0.4) pacingScore += 30;
    else if (actionDensity > 0.2) pacingScore += 15;
    
    if (internalDensity > 0.4) pacingScore -= 20;
    else if (internalDensity > 0.2) pacingScore -= 10;

    const sentences = content.split(/[。！？]/);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(sentences.length, 1);
    if (avgLength > 80) pacingScore += 10;
    if (avgLength < 30) pacingScore -= 10;

    let pacingType: 'fast' | 'moderate' | 'slow' = 'moderate';
    if (pacingScore > 70) pacingType = 'fast';
    if (pacingScore < 40) pacingType = 'slow';

    return {
      chapter: chapter.number,
      pacingScore: Math.max(0, Math.min(100, pacingScore)),
      sceneCount: this.countScenes(content),
      actionDensity: Math.round(actionDensity * 100),
      dialogueDensity: Math.round(dialogueDensity * 100),
      internalDensity: Math.round(internalDensity * 100),
      pacingType
    };
  }

  private countScenes(content: string): number {
    const sceneMarkers = ['。', '！', '？', '\n'];
    let scenes = 1;
    for (const marker of sceneMarkers) {
      scenes += (content.match(new RegExp(marker, 'g')) || []).length;
    }
    return Math.round(scenes / 10);
  }

  private detectPacingPatterns(pacing: ChapterPacing[]): PacingPattern[] {
    const patterns: PacingPattern[] = [];
    
    for (let i = 1; i < pacing.length; i++) {
      const prev = pacing[i - 1];
      const curr = pacing[i];
      
      let type: PacingPattern['type'] = 'mixed';
      
      if (prev.pacingType === 'fast' && curr.pacingType === 'fast') {
        type = 'action_dialogue';
      } else if (prev.pacingType === 'slow' && curr.pacingType === 'slow') {
        type = 'dialogue_internal';
      }
      
      if (patterns.length > 0) {
        const lastPattern = patterns[patterns.length - 1];
        if (lastPattern.type === type) {
          lastPattern.chapters.push(curr.chapter);
          lastPattern.frequency++;
        } else {
          patterns.push({
            type,
            chapters: [prev.chapter, curr.chapter],
            frequency: 1,
            quality: this.evaluatePatternQuality(type)
          });
        }
      } else {
        patterns.push({
          type,
          chapters: [prev.chapter, curr.chapter],
          frequency: 1,
          quality: this.evaluatePatternQuality(type)
        });
      }
    }
    
    return patterns;
  }

  private evaluatePatternQuality(type: PacingPattern['type']): number {
    switch (type) {
      case 'action_dialogue': return 70;
      case 'dialogue_internal': return 65;
      case 'mixed': return 80;
      default: return 60;
    }
  }

  /**
   * 3. 角色对话指纹分析
   * 识别不同角色的语言风格
   */
  private async analyzeCharacterVoices(): Promise<CharacterVoiceAnalysis[]> {
    const analyses: CharacterVoiceAnalysis[] = [];

    for (const arc of this.truthFiles.emotionalArcs) {
      const analysis = this.analyzeSingleCharacterVoice(arc);
      analyses.push(analysis);
    }

    return analyses;
  }

  private analyzeSingleCharacterVoice(arc: EmotionalArc): CharacterVoiceAnalysis {
    const characterName = arc.characterName;
    const dialogueSegments = this.extractCharacterDialogues(characterName);

    const vocabularyProfile = this.buildVocabularyProfile(dialogueSegments);
    const sentenceProfile = this.buildSentenceProfile(dialogueSegments);
    const topicProfile = this.extractTopics(dialogueSegments);

    const inconsistencies = this.detectVoiceInconsistencies(
      characterName,
      dialogueSegments
    );

    const voiceConsistency = Math.max(0, 100 - inconsistencies.length * 15);

    return {
      characterId: arc.characterId,
      characterName,
      vocabularyProfile,
      sentenceProfile,
      topicProfile,
      voiceConsistency,
      inconsistencies
    };
  }

  private extractCharacterDialogues(characterName: string): string[] {
    const segments: string[] = [];
    
    for (const chapter of this.chapters) {
      const content = chapter.content || '';
      const regex = new RegExp(`${characterName}[：:][^。！？]+[。！？]?`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        segments.push(...matches);
      }
    }
    
    return segments;
  }

  private buildVocabularyProfile(dialogues: string[]): VocabularyProfile {
    const wordCount = new Map<string, number>();
    const uniqueExpressions: string[] = [];

    for (const dialogue of dialogues) {
      const words = dialogue.split('').filter(w => w.trim().length > 0);
      for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    }

    const frequentWords = new Map(
      Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    );

    for (const [word, count] of wordCount) {
      if (count === 1 && word.length >= 3) {
        uniqueExpressions.push(word);
      }
    }

    const speechPatterns = this.detectSpeechPatterns(dialogues);

    return {
      frequentWords,
      uniqueExpressions: uniqueExpressions.slice(0, 10),
      speechPatterns
    };
  }

  private detectSpeechPatterns(dialogues: string[]): string[] {
    const patterns: string[] = [];
    
    const startsWithQuestion = dialogues.filter(d => d.includes('？') || d.includes('?'));
    if (startsWithQuestion.length > dialogues.length * 0.3) {
      patterns.push('常以问句开头');
    }

    const usesFirstPerson = dialogues.filter(d => d.includes('我') || d.includes('咱们'));
    if (usesFirstPerson.length > dialogues.length * 0.5) {
      patterns.push('常使用第一人称');
    }

    const shortDialogues = dialogues.filter(d => d.length < 20);
    if (shortDialogues.length > dialogues.length * 0.4) {
      patterns.push('对话简短');
    }

    return patterns;
  }

  private buildSentenceProfile(dialogues: string[]): SentenceProfile {
    const avgLength = dialogues.reduce((sum, d) => sum + d.length, 0) / Math.max(dialogues.length, 1);
    const questions = dialogues.filter(d => d.includes('？') || d.includes('?')).length;
    const exclamations = dialogues.filter(d => d.includes('！')).length;

    return {
      avgLength: Math.round(avgLength),
      questionRatio: Math.round(questions / Math.max(dialogues.length, 1) * 100),
      exclamationRatio: Math.round(exclamations / Math.max(dialogues.length, 1) * 100),
      fragmentRatio: Math.round(dialogues.filter(d => d.length < 10).length / Math.max(dialogues.length, 1) * 100)
    };
  }

  private extractTopics(dialogues: string[]): string[] {
    const topics = new Set<string>();
    
    const topicKeywords = {
      'family': ['家', '父母', '孩子', '亲人', '家庭'],
      'work': ['工作', '事业', '任务', '责任'],
      'love': ['爱', '喜欢', '感情', '恋爱'],
      'conflict': ['打', '战斗', '敌人', '威胁'],
      'future': ['将来', '未来', '希望', '梦想']
    };

    for (const dialogue of dialogues) {
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        for (const keyword of keywords) {
          if (dialogue.includes(keyword)) {
            topics.add(topic);
            break;
          }
        }
      }
    }

    return Array.from(topics);
  }

  private detectVoiceInconsistencies(
    characterName: string,
    dialogues: string[]
  ): VoiceInconsistency[] {
    const inconsistencies: VoiceInconsistency[] = [];

    if (dialogues.length < 10) return inconsistencies;

    const halfPoint = Math.floor(dialogues.length / 2);
    const firstHalf = dialogues.slice(0, halfPoint);
    const secondHalf = dialogues.slice(halfPoint);

    const firstVocab = this.buildVocabularyProfile(firstHalf);
    const secondVocab = this.buildVocabularyProfile(secondHalf);

    const vocabOverlap = this.calculateVocabOverlap(
      firstVocab.frequentWords,
      secondVocab.frequentWords
    );

    if (vocabOverlap < 0.3) {
      inconsistencies.push({
        chapter: this.chapters.length,
        description: '角色前后用词差异较大，可能存在风格不一致',
        deviation: Math.round((0.3 - vocabOverlap) * 100)
      });
    }

    return inconsistencies;
  }

  private calculateVocabOverlap(
    vocab1: Map<string, number>,
    vocab2: Map<string, number>
  ): number {
    const set1 = new Set(vocab1.keys());
    const set2 = new Set(vocab2.keys());
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateVoiceScore(analyses: CharacterVoiceAnalysis[]): number {
    if (analyses.length === 0) return 100;
    
    const totalConsistency = analyses.reduce((sum, a) => sum + a.voiceConsistency, 0);
    return Math.round(totalConsistency / analyses.length);
  }

  /**
   * 4. 场景连续性分析
   * 检测场景转换的合理性
   */
  private async analyzeSceneContinuity(): Promise<SceneContinuityAnalysis> {
    const transitions: SceneTransition[] = [];
    const continuityGaps: ContinuityGap[] = [];

    for (let i = 1; i < this.chapters.length; i++) {
      const prevChapter = this.chapters[i - 1];
      const currChapter = this.chapters[i];
      
      const transition = this.analyzeTransition(prevChapter, currChapter);
      transitions.push(transition);
      
      if (transition.transitionQuality < 50) {
        continuityGaps.push({
          chapter: currChapter.number,
          type: this.classifyGapType(prevChapter, currChapter),
          description: transition.issue || '场景转换质量低',
          severity: 100 - transition.transitionQuality
        });
      }
    }

    const avgQuality = transitions.reduce((sum, t) => sum + t.transitionQuality, 0) / 
                      Math.max(transitions.length, 1);

    return {
      sceneCount: transitions.length + 1,
      transitions,
      continuityGaps,
      overallContinuityScore: Math.round(avgQuality)
    };
  }

  private analyzeTransition(
    prevChapter: Chapter,
    currChapter: Chapter
  ): SceneTransition {
    const prevContent = prevChapter.content || '';
    const currContent = currChapter.content || '';

    let transitionQuality = 80;

    const timeIndicators = ['第二天', '随后', '不久', '过了', '终于', '突然'];
    let hasTimeTransition = false;
    for (const indicator of timeIndicators) {
      if (currContent.includes(indicator)) {
        hasTimeTransition = true;
        break;
      }
    }

    if (!hasTimeTransition) {
      transitionQuality -= 20;
    }

    const locationMentions = this.extractLocationMentions(currContent);
    if (locationMentions.length > 0) {
      const prevLocations = this.extractLocationMentions(prevContent);
      if (prevLocations.length > 0 && !this.locationsOverlap(prevLocations, locationMentions)) {
        transitionQuality -= 30;
      }
    }

    const prevLastLines = prevContent.split('\n').slice(-3).join('');
    const currFirstLines = currContent.split('\n').slice(0, 3).join('');

    if (!this.hasConnection(prevLastLines, currFirstLines)) {
      transitionQuality -= 15;
    }

    const hasContinuation = this.checkContinuation(prevContent, currContent);
    if (hasContinuation) {
      transitionQuality += 10;
    }

    let transitionType: 'smooth' | 'abrupt' | 'confusing' = 'smooth';
    let issue: string | undefined;

    if (transitionQuality < 40) {
      transitionType = 'confusing';
      issue = '场景转换混乱，缺少必要的过渡信息';
    } else if (transitionQuality < 60) {
      transitionType = 'abrupt';
      issue = '场景转换突兀';
    }

    return {
      fromChapter: prevChapter.number,
      toChapter: currChapter.number,
      transitionType,
      transitionQuality: Math.max(0, Math.min(100, transitionQuality)),
      issue
    };
  }

  private extractLocationMentions(content: string): string[] {
    const locationMarkers = ['在', '来到', '到达', '去了', '回到'];
    const locations: string[] = [];

    for (const marker of locationMarkers) {
      const regex = new RegExp(`${marker}[^。！？,，]+`, 'g');
      const matches = content.match(regex);
      if (matches) {
        locations.push(...matches);
      }
    }

    return locations;
  }

  private locationsOverlap(locations1: string[], locations2: string[]): boolean {
    for (const loc1 of locations1) {
      for (const loc2 of locations2) {
        if (loc1.includes(loc2) || loc2.includes(loc1)) {
          return true;
        }
      }
    }
    return false;
  }

  private hasConnection(text1: string, text2: string): boolean {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    
    const overlap = keywords1.filter(k => keywords2.includes(k));
    return overlap.length >= 2;
  }

  private checkContinuation(text1: string, text2: string): boolean {
    const continuationWords = ['继续', '接着', '于是', '然后', '就这样'];
    for (const word of continuationWords) {
      if (text2.includes(word)) {
        return true;
      }
    }
    return false;
  }

  private classifyGapType(
    prevChapter: Chapter,
    currChapter: Chapter
  ): ContinuityGap['type'] {
    const prevContent = prevChapter.content || '';
    const currContent = currChapter.content || '';

    const timeWords = ['天', '年', '月', '小时', '分钟'];
    const locationWords = ['在', '来到', '去了', '到达'];

    let maxTimeJump = 0;
    let maxLocationJump = 0;

    for (const word of timeWords) {
      const matches1 = (prevContent.match(new RegExp(word, 'g')) || []).length;
      const matches2 = (currContent.match(new RegExp(word, 'g')) || []).length;
      if (Math.abs(matches1 - matches2) > maxTimeJump) {
        maxTimeJump = Math.abs(matches1 - matches2);
      }
    }

    for (const word of locationWords) {
      const matches1 = (prevContent.match(new RegExp(word, 'g')) || []).length;
      const matches2 = (currContent.match(new RegExp(word, 'g')) || []).length;
      if (Math.abs(matches1 - matches2) > maxLocationJump) {
        maxLocationJump = Math.abs(matches1 - matches2);
      }
    }

    if (maxTimeJump > 10) return 'time_jump';
    if (maxLocationJump > 5) return 'location_jump';
    
    return 'logic_jump';
  }

  /**
   * 5. 情感弧线合理性分析
   * 检测情感变化是否符合情节发展
   */
  private async analyzeEmotionArcs(): Promise<EmotionArcAnalysis[]> {
    const analyses: EmotionArcAnalysis[] = [];

    for (const arc of this.truthFiles.emotionalArcs) {
      const analysis = this.analyzeSingleEmotionArc(arc);
      analyses.push(analysis);
    }

    return analyses;
  }

  private analyzeSingleEmotionArc(arc: EmotionalArc): EmotionArcAnalysis {
    const points = arc.points || [];
    const transitions: EmotionTransition[] = [];
    const illogicalTransitions: IllogicalTransition[] = [];

    if (points.length < 2) {
      return {
        characterId: arc.characterId,
        characterName: arc.characterName,
        arcType: 'erratic',
        transitions: [],
        illogicalTransitions: [],
        arcQuality: 50
      };
    }

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      const trigger = this.findEmotionTrigger(prev.chapter, curr.chapter, prev.emotion, curr.emotion);
      const isJustified = this.isEmotionTransitionJustified(prev, curr);

      transitions.push({
        fromChapter: prev.chapter,
        toChapter: curr.chapter,
        fromEmotion: prev.emotion,
        toEmotion: curr.emotion,
        trigger,
        isJustified
      });

      if (!isJustified) {
        illogicalTransitions.push({
          fromChapter: prev.chapter,
          toChapter: curr.chapter,
          fromEmotion: prev.emotion,
          toEmotion: curr.emotion,
          reason: this.explainIllogicalTransition(prev, curr),
          plotContext: this.getPlotContext(curr.chapter)
        });
      }
    }

    const arcType = this.classifyArcType(transitions);
    const arcQuality = this.calculateArcQuality(transitions, illogicalTransitions);

    return {
      characterId: arc.characterId,
      characterName: arc.characterName,
      arcType,
      transitions,
      illogicalTransitions,
      arcQuality
    };
  }

  private findEmotionTrigger(
    fromChapter: number,
    toChapter: number,
    fromEmotion: string,
    toEmotion: string
  ): string | undefined {
    const chapters = this.chapters.filter(
      c => c.number > fromChapter && c.number <= toChapter
    );

    for (const chapter of chapters) {
      const content = chapter.content || '';

      if (this.emotionCausesTransition(fromEmotion, toEmotion)) {
        if (content.includes('成功') || content.includes('胜利')) return '正面事件触发';
        if (content.includes('失败') || content.includes('挫折')) return '负面事件触发';
        if (content.includes('意外') || content.includes('突然')) return '突发事件触发';
      }
    }

    return undefined;
  }

  private emotionCausesTransition(from: string, to: string): boolean {
    const emotionGroups = {
      'positive': ['高兴', '开心', '兴奋', '期待', '满意'],
      'negative': ['悲伤', '愤怒', '恐惧', '失望', '绝望'],
      'neutral': ['平静', '平淡', '平常']
    };

    let fromGroup = 'neutral';
    let toGroup = 'neutral';

    for (const [group, emotions] of Object.entries(emotionGroups)) {
      if (emotions.includes(from)) fromGroup = group;
      if (emotions.includes(to)) toGroup = group;
    }

    return fromGroup !== toGroup;
  }

  private isEmotionTransitionJustified(
    from: { chapter: number; emotion: string; intensity: number },
    to: { chapter: number; emotion: string; intensity: number }
  ): boolean {
    const chapterGap = to.chapter - from.chapter;

    if (chapterGap <= 5 && from.emotion !== to.emotion) {
      const chapter = this.chapters.find(c => c.number === to.chapter);
      if (chapter) {
        const content = chapter.content || '';
        const transitionMarkers = ['突然', '意外', '得知', '发现', '听说', '然而', '但是'];
        
        for (const marker of transitionMarkers) {
          if (content.includes(marker)) {
            return true;
          }
        }
      }
    }

    if (Math.abs(to.intensity - from.intensity) > 4) {
      return chapterGap <= 10;
    }

    return true;
  }

  private explainIllogicalTransition(
    from: { chapter: number; emotion: string; intensity: number },
    to: { chapter: number; emotion: string; intensity: number }
  ): string {
    const gap = to.chapter - from.chapter;

    if (gap <= 3) {
      return '情感在短时间内发生剧烈变化，但未见明显触发事件';
    }

    if (Math.abs(to.intensity - from.intensity) > 5) {
      return '情感强度变化过大，缺少过渡';
    }

    return '情感变化缺乏合理的触发因素';
  }

  private getPlotContext(chapterNumber: number): string | undefined {
    const chapter = this.chapters.find(c => c.number === chapterNumber);
    if (!chapter) return undefined;

    const content = chapter.content || '';
    if (content.length < 200) return content;
    return content.substring(0, 200) + '...';
  }

  private classifyArcType(transitions: EmotionTransition[]): EmotionArcAnalysis['arcType'] {
    if (transitions.length < 3) return 'erratic';

    let progressiveCount = 0;
    let regressiveCount = 0;
    let reversalCount = 0;

    for (let i = 1; i < transitions.length; i++) {
      const prev = transitions[i - 1];
      const curr = transitions[i];

      if (this.emotionIntensityIncreases(prev.toEmotion, curr.toEmotion)) {
        progressiveCount++;
      } else if (this.emotionIntensityDecreases(prev.toEmotion, curr.toEmotion)) {
        regressiveCount++;
      } else {
        reversalCount++;
      }
    }

    if (reversalCount > transitions.length * 0.4) return 'cyclical';
    if (reversalCount > transitions.length * 0.2) return 'erratic';
    if (progressiveCount > regressiveCount) return 'progressive';
    if (regressiveCount > progressiveCount) return 'regressive';
    
    return 'cyclical';
  }

  private emotionIntensityIncreases(from: string, to: string): boolean {
    const intensityMap: Record<string, number> = {
      '绝望': 1, '悲伤': 2, '恐惧': 3, '失望': 4, '平静': 5,
      '期待': 6, '高兴': 7, '兴奋': 8, '狂喜': 9
    };

    return (intensityMap[to] || 5) > (intensityMap[from] || 5);
  }

  private emotionIntensityDecreases(from: string, to: string): boolean {
    return this.emotionIntensityIncreases(to, from);
  }

  private calculateArcQuality(
    transitions: EmotionTransition[],
    illogicals: IllogicalTransition[]
  ): number {
    if (transitions.length === 0) return 50;

    const justifiedRatio = (transitions.length - illogicals.length) / transitions.length;
    return Math.round(justifiedRatio * 100);
  }

  private calculateEmotionArcScore(analyses: EmotionArcAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const totalQuality = analyses.reduce((sum, a) => sum + a.arcQuality, 0);
    return Math.round(totalQuality / analyses.length);
  }

  /**
   * 6. 主题密度分析
   * 检测主题在章节中的分布密度
   */
  private async analyzeThemeDensity(): Promise<ThemeDensityAnalysis[]> {
    const themes = ['爱', '恨', '生死', '自由', '命运', '正义', '权力', '救赎'];
    const analyses: ThemeDensityAnalysis[] = [];

    for (const theme of themes) {
      const analysis = this.analyzeSingleThemeDensity(theme);
      if (analysis.overallDensity > 0) {
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  private analyzeSingleThemeDensity(theme: string): ThemeDensityAnalysis {
    const densityByChapter = new Map<number, number>();
    
    for (const chapter of this.chapters) {
      const content = chapter.content || '';
      const mentions = (content.match(new RegExp(theme, 'g')) || []).length;
      const density = mentions / (content.length / 1000);
      densityByChapter.set(chapter.number, Math.round(density * 10) / 10);
    }

    const densities = Array.from(densityByChapter.values());
    const overallDensity = densities.reduce((sum, d) => sum + d, 0) / Math.max(densities.length, 1);

    const densityTrend = this.calculateDensityTrend(densities);

    const avgDensity = overallDensity;
    const peakChapters: number[] = [];
    const valleyChapters: number[] = [];

    for (const [chapter, density] of densityByChapter) {
      if (density > avgDensity * 1.5) peakChapters.push(chapter);
      if (density < avgDensity * 0.3 && density > 0) valleyChapters.push(chapter);
    }

    const themeCoherence = this.calculateThemeCoherence(densityByChapter);

    return {
      theme,
      densityByChapter,
      overallDensity: Math.round(overallDensity * 10) / 10,
      densityTrend,
      peakChapters,
      valleyChapters,
      themeCoherence
    };
  }

  private calculateDensityTrend(densities: number[]): ThemeDensityAnalysis['densityTrend'] {
    if (densities.length < 5) return 'stable';

    const firstHalf = densities.slice(0, Math.floor(densities.length / 2));
    const secondHalf = densities.slice(Math.floor(densities.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const variance = this.calculateVariance(densities);
    
    if (variance > 10) return 'fluctuating';
    if (secondAvg > firstAvg * 1.3) return 'increasing';
    if (secondAvg < firstAvg * 0.7) return 'decreasing';
    
    return 'stable';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateThemeCoherence(densityByChapter: Map<number, number>): number {
    const densities = Array.from(densityByChapter.values());
    if (densities.length < 2) return 100;

    let coherence = 100;
    
    for (let i = 1; i < densities.length; i++) {
      const diff = Math.abs(densities[i] - densities[i - 1]);
      if (diff > 2) {
        coherence -= 5;
      }
    }

    return Math.max(0, coherence);
  }

  private calculateThemeDepthScore(analyses: ThemeDensityAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const avgCoherence = analyses.reduce((sum, a) => sum + a.themeCoherence, 0) / analyses.length;
    const densityCount = analyses.filter(a => a.overallDensity > 0.5).length;
    
    return Math.round((avgCoherence * 0.6 + (densityCount / Math.max(analyses.length, 1)) * 40));
  }

  /**
   * 汇总关键问题
   */
  private aggregateCriticalIssues(
    hookAnalysis: HookNetworkAnalysis,
    pacingAnalysis: PacingAnalysis,
    voiceAnalysis: CharacterVoiceAnalysis[],
    continuityAnalysis: SceneContinuityAnalysis,
    emotionAnalysis: EmotionArcAnalysis[]
  ): AdvancedIssue[] {
    const issues: AdvancedIssue[] = [];

    for (const hook of hookAnalysis.suspiciousRecycles) {
      issues.push({
        id: `hook_${hook.hook.id}`,
        type: 'hook_network_broken',
        severity: 'warning',
        description: `伏笔"${hook.hook.description.substring(0, 30)}..."铺垫不足就被回收`,
        chapters: [hook.hook.setInChapter],
        suggestion: '增加伏笔的铺垫次数',
        confidence: 80
      });
    }

    for (const anomaly of pacingAnalysis.anomalies) {
      issues.push({
        id: `pacing_${anomaly.chapter}`,
        type: 'pacing_anomaly',
        severity: 'warning',
        description: anomaly.description,
        chapters: [anomaly.chapter],
        suggestion: anomaly.suggestion,
        confidence: 75
      });
    }

    for (const voice of voiceAnalysis) {
      for (const inconsistency of voice.inconsistencies) {
        issues.push({
          id: `voice_${voice.characterId}_${inconsistency.chapter}`,
          type: 'character_voice_inconsistent',
          severity: 'info',
          description: `角色${voice.characterName}${inconsistency.description}`,
          chapters: [inconsistency.chapter],
          suggestion: '保持角色语言风格一致',
          confidence: inconsistency.deviation
        });
      }
    }

    for (const gap of continuityAnalysis.continuityGaps) {
      issues.push({
        id: `continuity_${gap.chapter}`,
        type: 'scene_transition_weak',
        severity: gap.severity > 70 ? 'critical' : 'warning',
        description: gap.description,
        chapters: [gap.chapter],
        suggestion: '增强场景转换的过渡',
        confidence: gap.severity
      });
    }

    for (const arc of emotionAnalysis) {
      for (const illogical of arc.illogicalTransitions) {
        issues.push({
          id: `emotion_${arc.characterId}_${illogical.fromChapter}`,
          type: 'emotion_arc_illogical',
          severity: 'warning',
          description: `角色${arc.characterName}的情感从"${illogical.fromEmotion}"突变到"${illogical.toEmotion}"缺少铺垫`,
          chapters: [illogical.fromChapter, illogical.toChapter],
          suggestion: illogical.reason,
          confidence: 70
        });
      }
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    issues: AdvancedIssue[],
    breakdown: ComprehensiveQualityReport['qualityBreakdown']
  ): string[] {
    const recommendations: string[] = [];

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (criticalCount > 0) {
      recommendations.push(`存在${criticalCount}个关键问题需要立即处理`);
    }

    if (breakdown.hookManagement < 80) {
      recommendations.push('伏笔管理需要改进：增加伏笔之间的关联性，确保充分铺垫后再回收');
    }

    if (breakdown.pacingControl < 80) {
      recommendations.push('叙事节奏需要优化：避免节奏突变，保持节奏的平滑过渡');
    }

    if (breakdown.characterVoice < 80) {
      recommendations.push('角色语言风格需要统一：注意保持不同角色的对话特点');
    }

    if (breakdown.sceneContinuity < 80) {
      recommendations.push('场景连续性需要加强：增加场景转换的过渡描写');
    }

    if (breakdown.emotionArc < 80) {
      recommendations.push('情感弧线需要优化：确保情感变化有合理的触发因素');
    }

    if (warningCount > 10) {
      recommendations.push(`存在${warningCount}个警告级别问题，建议逐一处理`);
    }

    if (recommendations.length === 0) {
      recommendations.push('作品质量整体良好，继续保持当前创作状态');
    }

    return recommendations;
  }
}

export default AdvancedNovelQualityEngine;
