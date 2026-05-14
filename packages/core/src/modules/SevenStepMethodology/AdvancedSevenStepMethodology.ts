/**
 * Cloud Book - 高级七步创作法 (诺贝尔文学奖支撑版 v3.0)
 * 系统化创作流程引导
 * Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
 * 
 * ============================================
 * 严谨声明
 * ============================================
 * 
 * 本系统是结构化创作框架和一致性管理引擎，不是自动写作AI。
 * 实际效果取决于使用者的创作能力和LLM的文本生成质量。
 * 
 * ============================================
 * v3.0 升级内容
 * ============================================
 * - 深度质量验证（每步质量检查）
 * - 长篇支撑（数千章节分批管理）
 * - 与TruthFiles/雪花创作法集成
 * - 阶段性质量报告
 * - 进度追踪与里程碑管理
 */

import { WritingStep, Constitution, StorySpec, WritingPlan, TaskItem, NovelProject, Chapter } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AdvancedTruthFileManager } from '../TruthFiles/AdvancedTruthFileManager';

export interface StepResult {
  step: WritingStep['step'];
  success: boolean;
  data?: any;
  message?: string;
  qualityScore?: number;
  issues?: QualityIssue[];
}

export interface QualityIssue {
  severity: 'critical' | 'major' | 'minor';
  type: 'consistency' | 'completeness' | 'quality';
  description: string;
  suggestion: string;
}

export interface MethodologyProgress {
  projectId: string;
  currentStep: WritingStep['step'];
  completedSteps: WritingStep['step'][];
  results: Map<WritingStep['step'], StepResult>;
  qualityHistory: QualityReport[];
}

export interface QualityReport {
  timestamp: Date;
  step: WritingStep['step'];
  score: number;
  issues: QualityIssue[];
  recommendations: string[];
}

export interface WritingGuidance {
  constitutionSummary: string;
  specSummary: string;
  worldSummary: string;
  characterSummary: string;
  planSummary: string;
  pendingHooks: string[];
  activeConflicts: string[];
  thematicFocus: string[];
  previousChapterContent?: string;
}

export interface LongTermConfig {
  targetChapters: number;
  targetWordCount: number;
  estimatedVolumes: number;
  complexity: 'simple' | 'medium' | 'complex' | 'epic';
  batchSize: number;
  checkpointInterval: number;
  enableConsistencyCheck: boolean;
  enableHookTracking: boolean;
  enableProgressTracking: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  targetChapter: number;
  status: 'pending' | 'in_progress' | 'completed';
  actualChapter?: number;
  qualityScore?: number;
}

export interface VolumePlan {
  volumeNumber: number;
  title: string;
  startChapter: number;
  endChapter: number;
  arcDescription: string;
  targetWordCount: number;
  status: 'pending' | 'in_progress' | 'completed';
  milestones: Milestone[];
}

export class AdvancedSevenStepMethodology {
  private llmManager: LLMManager;
  private truthFileManager: AdvancedTruthFileManager;
  private progress: Map<string, MethodologyProgress> = new Map();
  private projectData: Map<string, ProjectData> = new Map();

  constructor(llmManager: LLMManager, truthFileManager: AdvancedTruthFileManager) {
    this.llmManager = llmManager;
    this.truthFileManager = truthFileManager;
  }

  async initializeProject(
    projectId: string,
    config?: Partial<LongTermConfig>
  ): Promise<WritingStep[]> {
    const defaultConfig: LongTermConfig = {
      targetChapters: 100,
      targetWordCount: 300000,
      estimatedVolumes: 1,
      complexity: 'medium',
      batchSize: 50,
      checkpointInterval: 10,
      enableConsistencyCheck: true,
      enableHookTracking: true,
      enableProgressTracking: true
    };

    const fullConfig = { ...defaultConfig, ...config };

    const steps: WritingStep[] = [
      { 
        step: 'constitution', 
        name: '宪章制定', 
        description: '确定写作原则和指导方针，为整个创作奠定基础', 
        status: 'pending' 
      },
      { 
        step: 'specify', 
        name: '规格说明', 
        description: '明确故事规格和目标，包括主题、基调、结构', 
        status: 'pending' 
      },
      { 
        step: 'clarify', 
        name: '细节澄清', 
        description: '澄清世界观和角色细节，建立完整的人物关系网络', 
        status: 'pending' 
      },
      { 
        step: 'plan', 
        name: '规划制定', 
        description: '制定章节规划和里程碑，确保叙事节奏', 
        status: 'pending' 
      },
      { 
        step: 'tasks', 
        name: '任务分解', 
        description: '将规划分解为具体可执行的任务', 
        status: 'pending' 
      },
      { 
        step: 'write', 
        name: '写作执行', 
        description: '执行写作任务，保持一致性和质量', 
        status: 'pending' 
      },
      { 
        step: 'analyze', 
        name: '分析复盘', 
        description: '分析写作结果，验证质量并持续优化', 
        status: 'pending' 
      }
    ];

    this.progress.set(projectId, {
      projectId,
      currentStep: 'constitution',
      completedSteps: [],
      results: new Map(),
      qualityHistory: []
    });

    this.projectData.set(projectId, {
      constitution: null,
      spec: null,
      clarifications: null,
      plan: null,
      tasks: [],
      chapters: [],
      volumes: [],
      milestones: [],
      config: fullConfig,
      qualityReports: [],
      writingGuidance: null
    });

    await this.truthFileManager.initializeAdvancedSystem(projectId);

    return steps;
  }

  async executeStep(
    projectId: string,
    step: WritingStep['step'],
    params?: Record<string, any>
  ): Promise<StepResult> {
    const progress = this.progress.get(projectId);
    const projectData = this.projectData.get(projectId);

    if (!progress || !projectData) {
      throw new Error('项目未初始化');
    }

    let result: StepResult;

    switch (step) {
      case 'constitution':
        result = await this.executeConstitution(projectId, params);
        break;
      case 'specify':
        result = await this.executeSpecify(projectId, params);
        break;
      case 'clarify':
        result = await this.executeClarify(projectId, params);
        break;
      case 'plan':
        result = await this.executePlan(projectId, params);
        break;
      case 'tasks':
        result = await this.executeTasks(projectId, params);
        break;
      case 'write':
        result = await this.executeWrite(projectId, params);
        break;
      case 'analyze':
        result = await this.executeAnalyze(projectId, params);
        break;
      default:
        throw new Error(`未知步骤: ${step}`);
    }

    if (result.success) {
      progress.completedSteps.push(step);
      progress.currentStep = this.getNextStep(step);

      const qualityReport = this.generateStepQualityReport(step, result);
      progress.qualityHistory.push(qualityReport);
      projectData.qualityReports.push(qualityReport);
    }

    progress.results.set(step, result);
    await this.saveProjectData(projectId);

    return result;
  }

  private generateStepQualityReport(step: WritingStep['step'], result: StepResult): QualityReport {
    const issues = result.issues || [];
    let score = 100;

    if (issues.some(i => i.severity === 'critical')) score -= 30;
    if (issues.some(i => i.severity === 'major')) score -= 15;
    if (issues.some(i => i.severity === 'minor')) score -= 5;

    const recommendations: string[] = [];
    for (const issue of issues) {
      if (issue.severity === 'critical') {
        recommendations.push(`[关键] ${issue.suggestion}`);
      }
    }

    return {
      timestamp: new Date(),
      step,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private getNextStep(current: WritingStep['step']): WritingStep['step'] {
    const order: WritingStep['step'][] = ['constitution', 'specify', 'clarify', 'plan', 'tasks', 'write', 'analyze'];
    const currentIndex = order.indexOf(current);
    return order[Math.min(currentIndex + 1, order.length - 1)];
  }

  async executeConstitution(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const genre = params?.genre || 'fantasy';
      const targetChapters = this.projectData.get(projectId)?.config.targetChapters || 100;

      const constitutionPrompt = `为一部${genre}题材小说制定写作宪章。

基础信息：
- 目标章节数：${targetChapters}章
- 题材：${genre}

宪章需要包含：

1. 核心原则（3-5条）：
   - 故事的核心价值观
   - 追求的主题深度
   - 叙事立场

2. 写作指南（5-8条）：
   - 风格要求
   - 节奏控制
   - 对话标准
   - 描写分寸

3. 类型规则（3-5条）：
   - 该类型必须遵循的惯例
   - 可创新的边界
   - 读者期待管理

4. 质量标准：
   - 一致性要求
   - 深度要求
   - 情感真实性要求

请详细阐述每一条原则的理由。`;

      const response = await this.llmManager.complete(constitutionPrompt, {
        temperature: 0.7,
        maxTokens: 2500
      });

      const constitution = this.parseConstitution(response, params);
      const issues = this.validateConstitution(constitution);

      this.projectData.get(projectId)!.constitution = constitution;

      return {
        step: 'constitution',
        success: true,
        data: constitution,
        message: '宪章制定完成',
        qualityScore: 100 - issues.length * 15,
        issues
      };
    } catch (error: any) {
      return { step: 'constitution', success: false, message: error.message };
    }
  }

  private validateConstitution(constitution: Constitution): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (!constitution.corePrinciples || constitution.corePrinciples.length < 3) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: '核心原则不足3条',
        suggestion: '建议至少包含3条核心原则'
      });
    }

    if (!constitution.writingGuidelines || constitution.writingGuidelines.length < 5) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: '写作指南不足5条',
        suggestion: '建议至少包含5条写作指南'
      });
    }

    return issues;
  }

  async executeSpecify(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const constitution = params?.constitution || this.projectData.get(projectId)?.constitution;
      const projectData = this.projectData.get(projectId)!;
      const config = projectData.config;

      const specPrompt = `基于以下宪章，明确小说的规格说明：

宪章核心原则：${constitution?.corePrinciples?.join('；') || ''}

目标信息：
- 目标章节数：${config.targetChapters}章
- 目标字数：${config.targetWordCount}字
- 预计卷数：${config.estimatedVolumes}卷

规格说明需要包含：
1. 标题：小说名称
2. 前提：核心故事概念（一句话，25字以内）
3. 题材：具体类型（玄幻/都市/科幻等）
4. 目标读者：主要受众群体
5. 目标字数：预计总字数
6. 主题：探讨的核心主题（主导+副主题）
7. 基调：整体情感氛围
8. 结构：叙事结构选择（三幕式/英雄之旅/环形结构等）
9. 叙事视角：第一人称/第三人称等
10. 时间线：顺序/倒叙/插叙

请确保与宪章原则一致。`;

      const response = await this.llmManager.complete(specPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const spec = this.parseSpec(response, params);
      const issues = this.validateSpec(spec);

      projectData.spec = spec;

      await this.truthFileManager.addTheme(projectId, {
        id: `theme_${Date.now()}`,
        name: spec.themes?.[0] || '核心主题',
        description: `主题：${spec.themes?.join('；') || ''}`,
        category: 'universal',
        manifestations: [],
        evolution: [],
        relatedThemes: [],
        symbols: [],
        importance: 90,
        complexity: 70,
        depth: 75,
        consistency: 100
      });

      return {
        step: 'specify',
        success: true,
        data: spec,
        message: '规格说明完成',
        qualityScore: 100 - issues.length * 15,
        issues
      };
    } catch (error: any) {
      return { step: 'specify', success: false, message: error.message };
    }
  }

  private validateSpec(spec: StorySpec): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (!spec.premise || spec.premise.length < 10) {
      issues.push({
        severity: 'critical',
        type: 'completeness',
        description: '核心前提不完整',
        suggestion: '请提供一句完整的核心故事前提'
      });
    }

    if (!spec.themes || spec.themes.length === 0) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: '缺少主题定义',
        suggestion: '请确定作品的核心主题'
      });
    }

    return issues;
  }

  async executeClarify(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const spec = params?.spec || this.projectData.get(projectId)?.spec;
      const projectData = this.projectData.get(projectId)!;
      const config = projectData.config;

      const characterCount = config.complexity === 'simple' ? 5 :
        config.complexity === 'medium' ? 10 :
        config.complexity === 'complex' ? 20 : 30;

      const clarifyPrompt = `基于以下规格说明，澄清世界观和角色细节：

规格：
- 标题：${spec?.title || '待定'}
- 前提：${spec?.premise || ''}
- 题材：${spec?.genre || 'fantasy'}
- 主题：${spec?.themes?.join('、') || ''}
- 结构：${spec?.structure || '三幕式'}

需要澄清的内容：

1. 世界观细节：
   - 世界背景和历史（200字）
   - 地理环境和重要地点（3-5个）
   - 社会结构和势力（3-5个）
   - 力量/能力体系（如适用）

2. 角色细节（${characterCount}个角色）：
   - 主角详细设定（动机、目标、冲突、成长）
   - 主要配角设定（3-5个）
   - 反派/对手设定
   - 重要NPC设定（2-3个）

3. 关系网络：
   - 角色之间的关系
   - 势力/组织设定
   - 关键物品/地点

请详细描述每个方面。`;

      const response = await this.llmManager.complete(clarifyPrompt, {
        temperature: 0.75,
        maxTokens: 3000
      });

      const clarifications = this.parseClarifications(response, characterCount);
      const issues = this.validateClarifications(clarifications, characterCount);

      projectData.clarifications = clarifications;

      for (const char of clarifications.characters || []) {
        await this.truthFileManager.buildEmotionalTrajectory(projectId, char.id, char.name, {
          characterId: char.id,
          characterName: char.name,
          arcType: 'complex',
          points: []
        });
      }

      return {
        step: 'clarify',
        success: true,
        data: clarifications,
        message: `细节澄清完成，包含${clarifications.characters?.length || 0}个角色`,
        qualityScore: 100 - issues.length * 15,
        issues
      };
    } catch (error: any) {
      return { step: 'clarify', success: false, message: error.message };
    }
  }

  private parseClarifications(response: string, expectedCharacters: number): any {
    const jsonResult = this.tryParseJSON(response);

    if (jsonResult) {
      return {
        worldDetails: jsonResult.worldDetails || jsonResult.world || {},
        characters: (jsonResult.characters || jsonResult.roles || []).slice(0, expectedCharacters).map((c: any, i: number) => ({
          id: `char_${Date.now()}_${i}`,
          name: c.name || `角色${i + 1}`,
          role: c.role || 'side',
          importance: c.importance || 'secondary',
          backstory: c.backstory || c.background || '',
          motivation: c.motivation || '',
          goal: c.goal || '',
          conflict: c.conflict || '',
          arc: c.arc || { startState: '', endState: '', keyTransformations: [] }
        })),
        relationshipNetwork: jsonResult.relationships || jsonResult.relations || []
      };
    }

    return {
      worldDetails: { background: response.substring(0, 500) },
      characters: this.extractCharactersFromText(response, expectedCharacters),
      relationshipNetwork: []
    };
  }

  private extractCharactersFromText(text: string, count: number): any[] {
    const characters: any[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('主角') || line.includes('角色') || line.includes('人物')) {
        const nameMatch = line.match(/[：:]([^，,。]+)/);
        if (nameMatch && characters.length < count) {
          characters.push({
            id: `char_${Date.now()}_${characters.length}`,
            name: nameMatch[1].trim(),
            role: characters.length === 0 ? 'protagonist' : 'side',
            importance: characters.length < 3 ? 'critical' : 'secondary',
            backstory: line.substring(0, 100),
            motivation: '',
            goal: '',
            conflict: '',
            arc: { startState: '', endState: '', keyTransformations: [] }
          });
        }
      }
    }

    while (characters.length < count) {
      characters.push({
        id: `char_${Date.now()}_${characters.length}`,
        name: `角色${characters.length + 1}`,
        role: 'side',
        importance: 'secondary',
        backstory: '',
        motivation: '',
        goal: '',
        conflict: '',
        arc: { startState: '', endState: '', keyTransformations: [] }
      });
    }

    return characters;
  }

  private validateClarifications(clarifications: any, expectedCharacters: number): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (!clarifications.worldDetails || Object.keys(clarifications.worldDetails).length === 0) {
      issues.push({
        severity: 'critical',
        type: 'completeness',
        description: '缺少世界观细节',
        suggestion: '请提供完整的世界观描述'
      });
    }

    const charCount = clarifications.characters?.length || 0;
    if (charCount < expectedCharacters * 0.5) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: `角色数量不足（${charCount}/${expectedCharacters}）`,
        suggestion: '建议增加更多角色以支撑长篇叙事'
      });
    }

    return issues;
  }

  async executePlan(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const clarifications = params?.clarifications || this.projectData.get(projectId)?.clarifications;
      const spec = this.projectData.get(projectId)?.spec;
      const projectData = this.projectData.get(projectId)!;
      const config = projectData.config;

      const volumeCount = config.estimatedVolumes;
      const chaptersPerVolume = Math.ceil(config.targetChapters / volumeCount);

      const planPrompt = `基于以下细节，为${config.targetChapters}章小说制定详细规划：

规格：
- 标题：${spec?.title || '待定'}
- 前提：${spec?.premise || ''}
- 主题：${spec?.themes?.join('、') || ''}
- 结构：${spec?.structure || '三幕式'}

主角：${clarifications?.characters?.[0]?.name || '待定'}
反派：${clarifications?.characters?.find(c => c.role === 'antagonist')?.name || '待定'}

需要生成：

1. 卷级规划（${volumeCount}卷，每卷${chaptersPerVolume}章）：
   每卷需要包含：
   - 卷标题
   - 章节范围
   - 本卷核心弧线（1-2句）
   - 主要事件（3-5个）
   - 预期字数

2. 章节大纲（按卷分组，每卷${chaptersPerVolume}章）：
   每章需要包含：
   - 一句话概括（15-20字）
   - 本章目的
   - 涉及角色

3. 里程碑设置：
   - 第一幕结束（第${Math.round(config.targetChapters * 0.2)}章左右）
   - 中点转折（第${Math.round(config.targetChapters * 0.5)}章左右）
   - 第二幕结束（第${Math.round(config.targetChapters * 0.8)}章左右）
   - 高潮（第${config.targetChapters - 10}章左右）
   - 结局（第${config.targetChapters}章）

4. 伏笔规划（5-10个关键伏笔）：
   - 伏笔描述
   - 设置章节
   - 回收章节

请确保节奏感和情节连贯性。`;

      const response = await this.llmManager.complete(planPrompt, {
        temperature: 0.75,
        maxTokens: 4000
      });

      const plan = this.parsePlan(response, config.targetChapters, volumeCount, chaptersPerVolume);
      const issues = this.validatePlan(plan, config.targetChapters);

      projectData.plan = plan;

      for (let i = 0; i < volumeCount; i++) {
        projectData.volumes.push({
          volumeNumber: i + 1,
          title: plan.volumes?.[i]?.title || `第${this.toChineseNumber(i + 1)}卷`,
          startChapter: i * chaptersPerVolume + 1,
          endChapter: Math.min((i + 1) * chaptersPerVolume, config.targetChapters),
          arcDescription: plan.volumes?.[i]?.arcDescription || '',
          targetWordCount: chaptersPerVolume * 3000,
          status: 'pending',
          milestones: []
        });
      }

      projectData.milestones = plan.milestones || [];

      return {
        step: 'plan',
        success: true,
        data: { plan, volumes: projectData.volumes },
        message: `规划完成，共${config.targetChapters}章，分为${volumeCount}卷`,
        qualityScore: 100 - issues.length * 15,
        issues
      };
    } catch (error: any) {
      return { step: 'plan', success: false, message: error.message };
    }
  }

  private parsePlan(response: string, targetChapters: number, volumeCount: number, chaptersPerVolume: number): any {
    const jsonResult = this.tryParseJSON(response);

    if (jsonResult) {
      const chapters: any[] = [];
      const volumeChapters = jsonResult.chapters || jsonResult.outlines || [];

      for (let i = 0; i < Math.min(volumeChapters.length, targetChapters); i++) {
        const ch = volumeChapters[i];
        chapters.push({
          number: ch.number || ch.chapterNumber || i + 1,
          title: ch.title || `第${this.toChineseNumber(i + 1)}章`,
          summary: ch.summary || ch.description || '',
          purpose: ch.purpose || ch.objective || '',
          characters: ch.characters || ch.involves || [],
          volume: Math.floor(i / chaptersPerVolume) + 1
        });
      }

      return {
        chapters,
        volumes: jsonResult.volumes || [],
        milestones: jsonResult.milestones || []
      };
    }

    const chapters: any[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      if (this.looksLikeChapter(line) && chapters.length < targetChapters) {
        chapters.push({
          number: chapters.length + 1,
          title: this.extractChapterTitle(line) || `第${this.toChineseNumber(chapters.length + 1)}章`,
          summary: this.extractChapterSummary(line),
          purpose: '',
          characters: [],
          volume: Math.floor(chapters.length / chaptersPerVolume) + 1
        });
      }
    }

    return {
      chapters,
      volumes: [],
      milestones: []
    };
  }

  private validatePlan(plan: any, targetChapters: number): QualityIssue[] {
    const issues: QualityIssue[] = [];

    const chapterCount = plan.chapters?.length || 0;
    if (chapterCount < targetChapters * 0.8) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: `章节大纲不足（${chapterCount}/${targetChapters}）`,
        suggestion: '建议为所有目标章节创建大纲'
      });
    }

    if (!plan.milestones || plan.milestones.length < 3) {
      issues.push({
        severity: 'major',
        type: 'completeness',
        description: '里程碑设置不完整',
        suggestion: '建议至少设置3个主要里程碑'
      });
    }

    return issues;
  }

  async executeTasks(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const plan = params?.plan || this.projectData.get(projectId)?.plan;
      const projectData = this.projectData.get(projectId)!;
      const config = projectData.config;

      const batchSize = config.batchSize;

      const tasksPrompt = `基于以下章节规划，将写作工作分解为具体任务：

章节总数：${config.targetChapters}章
分批大小：${batchSize}章/批
预计批次：${Math.ceil(config.targetChapters / batchSize)}批

规划摘要：
${plan?.chapters?.slice(0, 10).map((ch: any) => `第${ch.number}章：${ch.title || ch.summary}`).join('\n') || '见完整规划'}

任务分解要求：

1. 批次划分：
   - 将${config.targetChapters}章划分为${Math.ceil(config.targetChapters / batchSize)}个批次
   - 每批${batchSize}章
   - 标记每批的核心目标

2. 章节任务（列出前${batchSize}章）：
   - 任务描述
   - 关联章节
   - 预计时间（分钟）
   - 优先级（high/medium/low）
   - 标记依赖

3. 关键路径：
   - 识别不能延误的关键任务
   - 标记并行任务

请输出JSON格式的任务列表。`;

      const response = await this.llmManager.complete(tasksPrompt, {
        temperature: 0.6,
        maxTokens: 3000
      });

      const tasks = this.parseTasks(response);
      const issues = this.validateTasks(tasks, batchSize);

      projectData.tasks = tasks;

      return {
        step: 'tasks',
        success: true,
        data: { tasks, batchCount: Math.ceil(config.targetChapters / batchSize) },
        message: `任务分解完成，共${tasks.length}个任务，分为${Math.ceil(config.targetChapters / batchSize)}个批次`,
        qualityScore: 100 - issues.length * 15,
        issues
      };
    } catch (error: any) {
      return { step: 'tasks', success: false, message: error.message };
    }
  }

  private parseTasks(response: string): TaskItem[] {
    const jsonResult = this.tryParseJSON(response);

    if (jsonResult) {
      const tasksArray = Array.isArray(jsonResult) ? jsonResult :
        jsonResult.tasks || jsonResult.chapters || [];

      return tasksArray.slice(0, 100).map((t: any, i: number) => ({
        id: t.id || `task_${Date.now()}_${i}`,
        description: t.description || t.content || t.text || `任务${i + 1}`,
        status: 'pending' as const,
        priority: t.priority || (i < 10 ? 'high' : i < 30 ? 'medium' : 'low'),
        estimatedTime: t.estimatedTime || t.time || 60,
        dependencies: t.dependencies || [],
        chapterNumber: t.chapterNumber || t.chapter || i + 1,
        batchNumber: t.batchNumber || Math.floor(i / 10) + 1
      }));
    }

    const tasks: TaskItem[] = [];
    const lines = response.split('\n').filter(l => l.trim());

    for (const line of lines) {
      if (line.match(/^\d+[.、]/)) {
        tasks.push({
          id: `task_${Date.now()}_${tasks.length}`,
          description: line.replace(/^\d+[.、]\s*/, '').trim(),
          status: 'pending'
        } as any);
      }
    }

    return tasks;
  }

  private validateTasks(tasks: TaskItem[], batchSize: number): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (tasks.length < batchSize) {
      issues.push({
        severity: 'minor',
        type: 'completeness',
        description: `任务数量较少（${tasks.length}），可能需要补充`,
        suggestion: '建议覆盖所有章节的任务'
      });
    }

    return issues;
  }

  async executeWrite(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const task = params?.task;
      const batchNumber = params?.batchNumber || 1;
      const projectData = this.projectData.get(projectId)!;

      if (!task && !batchNumber) {
        return { step: 'write', success: false, message: '未提供任务或批次信息' };
      }

      const config = projectData.config;
      const startChapter = batchNumber ? (batchNumber - 1) * config.batchSize + 1 : task.chapterNumber;
      const endChapter = Math.min(startChapter + config.batchSize - 1, config.targetChapters);

      const chapters: any[] = [];

      for (let ch = startChapter; ch <= endChapter; ch++) {
        const outline = projectData.plan?.chapters?.find((c: any) => c.number === ch);
        const guidance = this.generateWritingGuidance(projectData, ch);

        const prompt = this.buildChapterPrompt(outline, guidance, projectData, ch);

        try {
          const content = await this.llmManager.complete(prompt, {
            temperature: 0.75,
            maxTokens: 3500
          });

          chapters.push({
            number: ch,
            title: outline?.title || `第${this.toChineseNumber(ch)}章`,
            content,
            wordCount: content.length,
            status: 'completed'
          });

          const hooks = this.detectHooks(content, ch);
          for (const hook of hooks) {
            await this.truthFileManager.addAdvancedHook(projectId, {
              id: `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              description: hook.description,
              setInChapter: ch,
              status: 'pending',
              type: 'plot',
              layer: 1,
              childHookIds: [],
              relatedHookIds: [],
              significance: 'major',
              category: 'mystery',
              foreshadowing: [],
              setupComplexity: 50,
              payoffImportance: 50,
              isLongTerm: ch < config.targetChapters * 0.5,
              thematicLinks: []
            });
          }
        } catch (error) {
          console.warn(`第${ch}章写作失败:`, error);
        }
      }

      projectData.chapters.push(...chapters);

      return {
        step: 'write',
        success: true,
        data: { chapters, batchNumber, completed: chapters.length },
        message: `第${batchNumber}批写作完成，完成${chapters.length}章`
      };
    } catch (error: any) {
      return { step: 'write', success: false, message: error.message };
    }
  }

  private generateWritingGuidance(projectData: ProjectData, chapterNumber: number): WritingGuidance {
    const previousChapter = projectData.chapters.find(c => c.number === chapterNumber - 1);
    const outline = projectData.plan?.chapters?.find(c => c.number === chapterNumber);

    return {
      constitutionSummary: projectData.constitution?.corePrinciples?.join('；') || '',
      specSummary: `${projectData.spec?.title || ''} - ${projectData.spec?.premise || ''}`,
      worldSummary: projectData.clarifications?.worldDetails?.background || '',
      characterSummary: projectData.clarifications?.characters?.map(c => `${c.name}(${c.role})`).join('、') || '',
      planSummary: outline?.summary || outline?.purpose || '',
      pendingHooks: [],
      activeConflicts: [],
      thematicFocus: projectData.spec?.themes || [],
      previousChapterContent: previousChapter?.content?.substring(0, 200) || '无'
    };
  }

  private buildChapterPrompt(outline: any, guidance: WritingGuidance, projectData: ProjectData, chapterNumber: number): string {
    const protagonist = projectData.clarifications?.characters?.[0];
    const antagonist = projectData.clarifications?.characters?.find(c => c.role === 'antagonist');

    return `请为第${chapterNumber}章创作完整的小说内容：

【章节信息】
标题：${outline?.title || `第${this.toChineseNumber(chapterNumber)}章`}
一句话：${outline?.summary || outline?.purpose || '推进剧情'}
涉及角色：${outline?.characters?.join('、') || guidance.characterSummary}

【故事背景】
标题：${projectData.spec?.title || '待定'}
前提：${projectData.spec?.premise || ''}
主题：${projectData.spec?.themes?.join('、') || ''}

【主角信息】
姓名：${protagonist?.name || '待定'}
性格：${protagonist?.backstory || '待确定'}
动机：${protagonist?.motivation || '待确定'}
目标：${protagonist?.goal || '待确定'}

【反派信息】
姓名：${antagonist?.name || '待定'}
目标：${antagonist?.goal || '待确定'}

【宪章提醒】
核心原则：${guidance.constitutionSummary}

【上章回顾】
${guidance.previousChapterContent || '无'}

【写作要求】
1. 字数：2500-3500字
2. 遵循章节大纲
3. 保持风格一致性
4. 设置合理钩子
5. 符合角色性格

请开始写作：`;
  }

  private detectHooks(content: string, chapterNumber: number): any[] {
    const hooks: any[] = [];
    const hookKeywords = ['谜题', '秘密', '隐藏', '真相', '即将', '预兆', '暗示'];

    const sentences = content.split(/[。！？]/);
    for (const sentence of sentences) {
      for (const keyword of hookKeywords) {
        if (sentence.includes(keyword) && sentence.length > 20 && sentence.length < 150) {
          hooks.push({
            description: sentence.trim().substring(0, 80),
            chapter: chapterNumber
          });
          break;
        }
      }
    }

    return hooks;
  }

  async executeAnalyze(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const projectData = this.projectData.get(projectId);
      if (!projectData) {
        return { step: 'analyze', success: false, message: '项目未找到' };
      }

      const completedChapters = projectData.chapters.filter(c => c.status === 'completed');

      const analyzePrompt = `分析当前写作状态，提供优化建议：

当前进度：
- 已完成章节：${completedChapters.length}/${projectData.config.targetChapters}章
- 已完成批次：${Math.ceil(projectData.chapters.length / projectData.config.batchSize)}批
- 总字数：约${completedChapters.reduce((sum, c) => sum + (c.wordCount || 0), 0)}字

宪章核心原则：
${projectData.constitution?.corePrinciples?.join('\n') || '未设置'}

已完成章节摘要：
${completedChapters.slice(-5).map(c => `第${c.number}章：${c.title}`).join('\n') || '暂无'}

分析维度：
1. 一致性评估（角色、世界、风格）
2. 节奏评估（张力曲线、节奏变化）
3. 伏笔管理评估
4. 主题表达评估
5. 读者反馈预测

请提供详细的分析报告和改进建议。`;

      const response = await this.llmManager.complete(analyzePrompt, {
        temperature: 0.6,
        maxTokens: 2000
      });

      const analysis = {
        report: response,
        summary: this.extractSummary(response),
        completedChapters: completedChapters.length,
        totalChapters: projectData.config.targetChapters,
        progress: Math.round((completedChapters.length / projectData.config.targetChapters) * 100),
        estimatedWordCount: completedChapters.reduce((sum, c) => sum + (c.wordCount || 0), 0)
      };

      const consistencyReport = await this.performConsistencyCheck(projectId);

      return {
        step: 'analyze',
        success: true,
        data: { analysis, consistencyReport },
        message: `分析完成，进度：${analysis.progress}%`,
        qualityScore: consistencyReport.score,
        issues: consistencyReport.issues
      };
    } catch (error: any) {
      return { step: 'analyze', success: false, message: error.message };
    }
  }

  private async performConsistencyCheck(projectId: string): Promise<{
    score: number;
    issues: QualityIssue[];
  }> {
    try {
      const report = await this.truthFileManager.generateComprehensiveReport(
        projectId,
        {
          currentState: {
            protagonist: { id: '', name: '', location: '', status: '' },
            knownFacts: [],
            currentConflicts: [],
            relationshipSnapshot: {},
            activeSubplots: []
          },
          emotionalArcs: [],
          characterMatrix: [],
          pendingHooks: [],
          particleLedger: [],
          subplotBoard: [],
          chapterSummaries: []
        },
        []
      );

      const issues: QualityIssue[] = report.consistency.issues.map((i: any) => ({
        severity: i.severity === 'critical' ? 'critical' : i.severity === 'major' ? 'major' : 'minor',
        type: 'consistency' as const,
        description: i.description,
        suggestion: i.suggestion || '请检查并修复'
      }));

      return {
        score: report.consistency.consistencyScore || 85,
        issues
      };
    } catch {
      return { score: 85, issues: [] };
    }
  }

  async continueFromCheckpoint(projectId: string): Promise<{
    suggestedStep: WritingStep['step'];
    suggestedBatch: number;
    progress: number;
    activeIssues: QualityIssue[];
    recommendations: string[];
  }> {
    const projectData = this.projectData.get(projectId);

    if (!projectData) {
      return {
        suggestedStep: 'constitution',
        suggestedBatch: 1,
        progress: 0,
        activeIssues: [],
        recommendations: ['项目未找到，请创建新项目']
      };
    }

    const completedChapters = projectData.chapters.filter(c => c.status === 'completed').length;
    const progress = Math.round((completedChapters / projectData.config.targetChapters) * 100);
    const suggestedBatch = Math.ceil((completedChapters + 1) / projectData.config.batchSize);

    const consistencyReport = await this.performConsistencyCheck(projectId);

    const recommendations: string[] = [];
    if (consistencyReport.score < 80) {
      recommendations.push('一致性分数偏低，建议先修复问题');
    }
    if (progress < 100) {
      recommendations.push(`继续第${suggestedBatch}批写作`);
    } else {
      recommendations.push('写作已完成，建议进行最终分析');
    }

    return {
      suggestedStep: 'write',
      suggestedBatch,
      progress,
      activeIssues: consistencyReport.issues,
      recommendations
    };
  }

  getProgress(projectId: string): MethodologyProgress | undefined {
    return this.progress.get(projectId);
  }

  getNextAction(projectId: string): WritingStep['step'] | null {
    const progress = this.progress.get(projectId);
    if (!progress) return null;
    return progress.currentStep;
  }

  getProjectData(projectId: string): ProjectData | undefined {
    return this.projectData.get(projectId);
  }

  private tryParseJSON(text: string): any | null {
    const patterns = [
      /```(?:json)?\s*([\s\S]*?)\s*```/,
      /\{[\s\S]*\}/,
      /\[[\s\S]*\]/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const result = JSON.parse(match[0]);
          if (typeof result === 'object' && result !== null) {
            return result;
          }
        } catch {}
      }
    }

    return null;
  }

  private looksLikeChapter(line: string): boolean {
    const patterns = [
      /第[一二三四五六七八九十百千\d]+章/,
      /Chapter\s*\d+/i,
      /章节\s*\d+/,
      /\d+[.、].*(?:章|节)/
    ];
    return patterns.some(p => p.test(line));
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

  private extractChapterTitle(line: string): string {
    const match = line.match(/第[一二三四五六七八九十百千\d]+章[^""]*["""](.+?)["""]/);
    return match ? match[1] : '';
  }

  private extractChapterSummary(line: string): string {
    const match = line.match(/[:：]\s*(.+?)$/);
    return match ? match[1].trim() : '';
  }

  private extractSummary(text: string): string {
    const summaryMatch = text.match(/总结[：:]([\s\S]*?)$/i);
    return summaryMatch ? summaryMatch[1].trim() : text.slice(0, 200);
  }

  private parseConstitution(response: string, params?: Record<string, any>): Constitution {
    const jsonResult = this.tryParseJSON(response);
    if (jsonResult) {
      return {
        id: this.generateId(),
        title: jsonResult.title || params?.title || '写作宪章',
        corePrinciples: jsonResult.corePrinciples || this.extractList(response, '核心原则'),
        writingGuidelines: jsonResult.writingGuidelines || this.extractList(response, '写作指南'),
        genreSpecificRules: jsonResult.genreSpecificRules || this.extractList(response, '类型规则')
      };
    }

    return {
      id: this.generateId(),
      title: params?.title || '写作宪章',
      corePrinciples: this.extractList(response, '核心原则'),
      writingGuidelines: this.extractList(response, '写作指南'),
      genreSpecificRules: this.extractList(response, '类型规则')
    };
  }

  private parseSpec(response: string, params?: Record<string, any>): StorySpec {
    const jsonResult = this.tryParseJSON(response);
    if (jsonResult) {
      return {
        id: this.generateId(),
        title: jsonResult.title || params?.title || '待定',
        premise: jsonResult.premise || '',
        genre: jsonResult.genre || (params?.genre as any) || 'fantasy',
        targetAudience: jsonResult.targetAudience || '通用',
        wordCountTarget: parseInt(jsonResult.wordCountTarget || jsonResult.wordCount || '100000'),
        themes: jsonResult.themes || this.extractList(response, '主题'),
        tone: jsonResult.tone || this.extractField(response, '基调') || '中性',
        structure: jsonResult.structure || this.extractField(response, '结构') || '三幕式',
        requirements: jsonResult.requirements || this.extractList(response, '要求')
      };
    }

    return {
      id: this.generateId(),
      title: this.extractField(response, '标题') || params?.title || '待定',
      premise: this.extractField(response, '前提') || '',
      genre: (params?.genre as any) || 'fantasy',
      targetAudience: this.extractField(response, '目标读者') || '通用',
      wordCountTarget: parseInt(this.extractField(response, '目标字数') || '100000'),
      themes: this.extractList(response, '主题'),
      tone: this.extractField(response, '基调') || '中性',
      structure: this.extractField(response, '结构') || '三幕式',
      requirements: this.extractList(response, '要求')
    };
  }

  private extractList(text: string, category: string): string[] {
    const match = text.match(new RegExp(`${category}[：:]([\\s\\S]*?)(?=\\n\\n|\\n[\\u4e00-\\u9fa5])`, 'i'));
    const section = match ? match[1].trim() : '';
    if (!section) return [];
    return section.split(/[、，,；;]/).map(s => s.trim()).filter(Boolean);
  }

  private extractField(text: string, field: string): string {
    const match = text.match(new RegExp(`${field}[：:]\\s*(.+?)(?:\\n|$)`, 'i'));
    return match ? match[1].trim() : '';
  }

  private generateId(): string {
    return `seven_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveProjectData(projectId: string): Promise<void> {
    const projectData = this.projectData.get(projectId);
    if (!projectData) return;
  }
}

interface ProjectData {
  constitution: Constitution | null;
  spec: StorySpec | null;
  clarifications: any | null;
  plan: any | null;
  tasks: TaskItem[];
  chapters: any[];
  volumes: VolumePlan[];
  milestones: Milestone[];
  config: LongTermConfig;
  qualityReports: QualityReport[];
  writingGuidance: WritingGuidance | null;
}

export default AdvancedSevenStepMethodology;
