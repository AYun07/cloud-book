/**
 * Cloud Book - 完整写作管线
 * 实现七步创作法、真相文件系统、流式生成等完整功能
 */

import { 
  NovelProject, 
  Chapter, 
  AuditResult, 
  WritingOptions,
  ChapterSummary,
  ModelRoute,
  LLMConfig
} from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
import { AntiDetectionEngine } from '../AntiDetection/AntiDetectionEngine';
import { ContextManager } from '../ContextManager/ContextManager';
import { v4 as uuidv4 } from 'uuid';

// ==================== 七步创作法 ====================

export enum StepName {
  CONSTITUTION = 'constitution',
  SPECIFY = 'specify',
  CLARIFY = 'clarify',
  PLAN = 'plan',
  TASKS = 'tasks',
  WRITE = 'write',
  ANALYZE = 'analyze'
}

export interface StepResult {
  step: StepName;
  output: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SevenStepResult {
  constitution?: StepResult;
  specify?: StepResult;
  clarify?: StepResult;
  plan?: StepResult;
  tasks?: StepResult;
  write?: StepResult;
  analyze?: StepResult;
  chapter?: Chapter;
}

// ==================== 真相文件系统 ====================

export interface WorldState {
  currentTime: string;
  currentLocation: string;
  currentWeather?: string;
  currentSeason?: string;
  worldStatus: Record<string, any>;
  lastUpdated: Date;
}

export interface ResourceLedger {
  items: Record<string, {
    currentCount: number;
    changes: Array<{
      chapter: number;
      change: number;
      reason: string;
      timestamp: Date;
    }>;
  }>;
  abilities: Record<string, boolean>;
  resources: Record<string, number>;
  lastUpdated: Date;
}

export interface Hook {
  id: string;
  description: string;
  setInChapter: number;
  status: 'pending' | 'foreshadowed' | 'paid_off' | 'expired' | 'active';
  resolvedInChapter?: number;
  priority: 'low' | 'medium' | 'high';
  type: 'character' | 'plot' | 'world' | 'emotional';
}

export interface Subplot {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'active' | 'completed' | 'dormant';
  currentProgress: number;
  chaptersInvolved: number[];
  charactersInvolved: string[];
  lastUpdated: Date;
}

export interface EmotionalArc {
  characterName: string;
  arc: Array<{
    chapter: number;
    emotion: string;
    intensity: number;
    trigger: string;
  }>;
  lastUpdated: Date;
}

export interface CharacterRelationship {
  character1: string;
  character2: string;
  currentRelationship: string;
  history: Array<{
    chapter: number;
    event: string;
    change: string;
  }>;
  lastUpdated: Date;
}

export interface EnhancedTruthFiles {
  protagonist?: {
    name: string;
    location: string;
    status?: string;
  };
  currentState?: {
    protagonist?: {
      name: string;
      location: string;
      status?: string;
    };
  };
  plotOutline?: string;
  characterProfiles?: any[];
  worldRules?: string[];
  worldState: WorldState;
  resourceLedger: ResourceLedger;
  pendingHooks: Hook[];
  subplots: Subplot[];
  emotionalArcs: EmotionalArc[];
  characterMatrix: CharacterRelationship[];
}

// ==================== 完整写作管线 ====================

export class CompleteWritingPipeline {
  private llmManager: LLMManager;
  private auditEngine: AIAuditEngine;
  private antiDetectionEngine: AntiDetectionEngine;
  private contextManager: ContextManager;
  private chapterStates: Map<number, any> = new Map();
  private chapterLocks: Map<number, Promise<void>> = new Map();
  private truthFilesCache: Map<string, EnhancedTruthFiles> = new Map();

  constructor(
    llmManager: LLMManager,
    auditEngine: AIAuditEngine,
    antiDetectionEngine: AntiDetectionEngine
  ) {
    this.llmManager = llmManager;
    this.auditEngine = auditEngine;
    this.antiDetectionEngine = antiDetectionEngine;
    this.contextManager = new ContextManager();
  }

  async runSevenStepCreation(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): Promise<SevenStepResult> {
    const result: SevenStepResult = {};
    
    const constitutionPrompt = this.buildConstitutionPrompt(project, chapterNumber, truthFiles);
    result.constitution = {
      step: StepName.CONSTITUTION,
      output: constitutionPrompt,
      timestamp: new Date()
    };
    
    const specifyPrompt = this.buildSpecifyPrompt(project, chapterNumber, truthFiles);
    result.specify = {
      step: StepName.SPECIFY,
      output: specifyPrompt,
      timestamp: new Date()
    };
    
    const clarifyPrompt = this.buildClarifyPrompt(project, chapterNumber, truthFiles);
    result.clarify = {
      step: StepName.CLARIFY,
      output: clarifyPrompt,
      timestamp: new Date()
    };
    
    const planPrompt = this.buildPlanPrompt(project, chapterNumber, truthFiles);
    result.plan = {
      step: StepName.PLAN,
      output: planPrompt,
      timestamp: new Date()
    };
    
    const tasksPrompt = this.buildTasksPrompt(project, chapterNumber, truthFiles);
    result.tasks = {
      step: StepName.TASKS,
      output: tasksPrompt,
      timestamp: new Date()
    };
    
    const writingPrompt = this.buildWritingPrompt(project, chapterNumber, truthFiles);
    result.write = {
      step: StepName.WRITE,
      output: writingPrompt,
      timestamp: new Date()
    };
    
    const analysisPrompt = this.buildAnalysisPrompt(project, chapterNumber, truthFiles);
    result.analyze = {
      step: StepName.ANALYZE,
      output: analysisPrompt,
      timestamp: new Date()
    };
    
    const content = await this.generateChapterContent(writingPrompt);
    result.chapter = this.createChapter(project.id, chapterNumber, content);
    
    return result;
  }

  private buildConstitutionPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第1步：宪法确立】
    
项目: ${project.title}
类型: ${project.genre || project.literaryGenre || '通用'}
当前章节: 第${chapterNumber}章

世界观状态:
- 时间: ${truthFiles.worldState?.currentTime || '第一章开始'}
- 地点: ${truthFiles.worldState?.currentLocation || '未设定'}

核心规则:
${truthFiles.worldRules?.join('\n') || '遵循基础叙事逻辑'}

请确立本章的创作宪法，包括核心主题、情感基调、叙事风格。`;
  }

  private buildSpecifyPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第2步：明确边界】

项目: ${project.title}
章节: 第${chapterNumber}章

主角: ${truthFiles.protagonist?.name || '未设定'}

待解决的钩子:
${truthFiles.pendingHooks?.map(h => `- ${h.description} (优先级: ${h.priority})`).join('\n') || '无'}

支线任务:
${truthFiles.subplots?.map(s => `- ${s.title}: ${s.description}`).join('\n') || '无'}

请明确本章的范围、边界和具体目标。`;
  }

  private buildClarifyPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第3步：澄清疑问】

项目: ${project.title}
章节: 第${chapterNumber}章

情感弧线:
${truthFiles.emotionalArcs?.map(e => `- ${e.characterName}: ${e.arc[e.arc.length - 1]?.emotion || '初始'}`).join('\n') || '无'}

人物关系:
${truthFiles.characterMatrix?.map(r => `- ${r.character1} ↔ ${r.character2}: ${r.currentRelationship}`).join('\n') || '无'}

资源状态:
${Object.entries(truthFiles.resourceLedger?.items || {}).map(([k, v]) => `- ${k}: ${v.currentCount}`).join('\n') || '无'}

请澄清本章中可能存在的疑问和矛盾。`;
  }

  private buildPlanPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第4步：制定计划】

项目: ${project.title}
章节: 第${chapterNumber}章

计划本章的结构:
1. 开端 - 引入冲突/变化
2. 发展 - 深化矛盾
3. 高潮 - 关键转折
4. 结局 - 留下钩子

请制定详细的写作计划。`;
  }

  private buildTasksPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第5步：分配任务】

项目: ${project.title}
章节: 第${chapterNumber}章

具体任务:
- 描写 ${truthFiles.worldState?.currentLocation || '主要场景'} 的氛围
- 推进 ${truthFiles.protagonist?.name || '主角'} 的命运
- 埋设或回收 ${truthFiles.pendingHooks?.length || 0} 个钩子
- 发展 ${truthFiles.subplots?.length || 0} 条支线

请将任务分配到具体的段落和场景中。`;
  }

  private buildWritingPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第6步：执行写作】

项目: ${project.title}
章节: 第${chapterNumber}章

请撰写完整的章节内容，包含:
- 生动的场景描写
- 自然的对话
- 合理的情感发展
- 与真相文件的一致性

起始上下文:
- 地点: ${truthFiles.worldState?.currentLocation || '主要场景'}
- 时间: ${truthFiles.worldState?.currentTime || '故事时间'}

请开始写作。`;
  }

  private buildAnalysisPrompt(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles
  ): string {
    return `【七步创作法 - 第7步：分析反思】

项目: ${project.title}
章节: 第${chapterNumber}章

请分析:
1. 本章是否实现了预期目标
2. 与真相文件的一致性
3. 需要在下章注意的事项
4. 可能的改进方向`;
  }

  private async generateChapterContent(
    prompt: string,
    modelRoute?: { model?: string; provider?: string }
  ): Promise<string> {
    try {
      const modelName = modelRoute?.model || 'gpt-4o';

      const result = await this.llmManager.generate(
        prompt,
        modelName,
        {
          temperature: 0.7,
          maxTokens: 8192
        }
      );

      if (typeof result === 'string') {
        return result;
      }
      return (result as any).content || (result as any).text || JSON.stringify(result);
    } catch (error) {
      console.error('生成章节内容失败:', error);
      return `[系统提示：章节内容生成失败，请检查模型配置]\n\n${prompt}`;
    }
  }

  private createChapter(
    projectId: string,
    chapterNumber: number,
    content: string
  ): any {
    return {
      id: uuidv4(),
      number: chapterNumber,
      title: `第${chapterNumber}章`,
      content,
      summary: this.extractSummary(content),
      wordCount: content.length,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private extractSummary(content: string): string {
    const firstParagraph = content.split('\n\n')[0] || '';
    return firstParagraph.slice(0, 200) + (firstParagraph.length > 200 ? '...' : '');
  }

  async streamGenerate(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: EnhancedTruthFiles,
    onChunk: (chunk: string) => void,
    options?: any
  ): Promise<any> {
    const lock = this.chapterLocks.get(chapterNumber);
    if (lock) {
      await lock;
    }

    const writingPrompt = this.buildWritingPrompt(project, chapterNumber, truthFiles);
    let fullContent = '';

    try {
      const modelName = options?.modelRoute?.model || 'gpt-4o';

      await this.llmManager.streamGenerate(
        writingPrompt,
        modelName,
        {
          temperature: options?.temperature || 0.7,
          maxTokens: 8192
        },
        (chunk) => {
          fullContent += chunk;
          onChunk(chunk);
        }
      );

      const chapter = this.createChapter(project.id, chapterNumber, fullContent);
      this.chapterStates.set(chapterNumber, { content: fullContent, status: 'completed' });

      return chapter;
    } catch (error) {
      console.error('流式生成失败:', error);
      throw error;
    } finally {
      this.chapterLocks.delete(chapterNumber);
    }
  }

  async writeFanfiction(
    project: NovelProject,
    chapterNumber: number,
    premise: string,
    truthFiles: EnhancedTruthFiles
  ): Promise<any> {
    const prompt = `【同人创作】
    
原作品: ${project.title}
同人设定: ${premise}

请基于同人设定创作第${chapterNumber}章，保持原作品世界观但融入新的创意。`;

    const content = await this.generateChapterContent(prompt);
    return this.createChapter(project.id, chapterNumber, content);
  }

  async writeSideStory(
    project: NovelProject,
    sideStoryTitle: string,
    viewpointCharacter: string,
    timelinePosition: string,
    truthFiles: EnhancedTruthFiles
  ): Promise<any> {
    const prompt = `【番外篇创作】
    
主作品: ${project.title}
番外标题: ${sideStoryTitle}
视角人物: ${viewpointCharacter}
时间线位置: ${timelinePosition}

请从 ${viewpointCharacter} 的视角创作番外故事。`;

    const content = await this.generateChapterContent(prompt);
    return this.createChapter(project.id, 0, content);
  }

  async writeMultiPOV(
    project: NovelProject,
    chapterNumber: number,
    viewpoints: string[],
    truthFiles: EnhancedTruthFiles
  ): Promise<any[]> {
    const chapters: any[] = [];

    for (const viewpoint of viewpoints) {
      const prompt = `【多视角叙事 - ${viewpoint}视角】
      
作品: ${project.title}
章节: 第${chapterNumber}章
视角: ${viewpoint}

请从 ${viewpoint} 的独特视角创作这一章，展现不同于其他角色的观察和感受。`;

      const content = await this.generateChapterContent(prompt);
      chapters.push(this.createChapter(project.id, chapterNumber, content));
    }

    return chapters;
  }

  async continueWriting(
    project: NovelProject,
    lastChapterNumber: number,
    additionalChapters: number,
    truthFiles: EnhancedTruthFiles,
    options?: any
  ): Promise<any[]> {
    const chapters: any[] = [];
    let currentChapter = lastChapterNumber;

    for (let i = 0; i < additionalChapters; i++) {
      currentChapter++;
      const prompt = this.buildWritingPrompt(project, currentChapter, truthFiles);
      const content = await this.generateChapterContent(prompt);
      chapters.push(this.createChapter(project.id, currentChapter, content));
    }

    return chapters;
  }

  async autoGenerateNovel(
    project: NovelProject,
    totalChapters: number,
    truthFiles: EnhancedTruthFiles,
    onPhase?: (phase: string, progress: number) => void
  ): Promise<{ chapters: Chapter[]; truthFiles: EnhancedTruthFiles }> {
    const chapters: Chapter[] = [];

    onPhase?.('初始化', 0);

    for (let i = 1; i <= totalChapters; i++) {
      onPhase?.(`生成第${i}章`, (i / totalChapters) * 100);

      const result = await this.runSevenStepCreation(project, i, truthFiles);
      if (result.chapter) {
        chapters.push(result.chapter);
      }
    }

    onPhase?.('完成', 100);

    return { chapters, truthFiles };
  }

  getChapterState(chapterNumber: number): any {
    return this.chapterStates.get(chapterNumber);
  }

  getTruthFilesCache(projectId: string): EnhancedTruthFiles | undefined {
    return this.truthFilesCache.get(projectId);
  }

  setTruthFilesCache(projectId: string, truthFiles: EnhancedTruthFiles): void {
    this.truthFilesCache.set(projectId, truthFiles);
  }

  clearCache(): void {
    this.chapterStates.clear();
    this.truthFilesCache.clear();
  }
}
