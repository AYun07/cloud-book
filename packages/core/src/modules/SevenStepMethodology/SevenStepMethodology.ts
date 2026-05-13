/**
 * 七步创作法
 * Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
 */

import { 
  WritingStep, 
  Constitution, 
  StorySpec, 
  WritingPlan, 
  TaskItem,
  NovelProject,
  Chapter
} from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';

export interface StepResult {
  step: WritingStep['step'];
  success: boolean;
  data?: any;
  message?: string;
}

export interface MethodologyProgress {
  projectId: string;
  currentStep: WritingStep['step'];
  completedSteps: WritingStep['step'][];
  results: Map<WritingStep['step'], StepResult>;
}

export class SevenStepMethodology {
  private llmManager: LLMManager;
  private progress: Map<string, MethodologyProgress> = new Map();

  constructor(llmManager: LLMManager) {
    this.llmManager = llmManager;
  }

  async initializeProject(projectId: string): Promise<WritingStep[]> {
    const steps: WritingStep[] = [
      { step: 'constitution', name: '宪章制定', description: '确定写作原则和指导方针', status: 'pending' },
      { step: 'specify', name: '规格说明', description: '明确故事规格和目标', status: 'pending' },
      { step: 'clarify', name: '细节澄清', description: '澄清世界观和角色细节', status: 'pending' },
      { step: 'plan', name: '规划制定', description: '制定章节规划和里程碑', status: 'pending' },
      { step: 'tasks', name: '任务分解', description: '将规划分解为具体任务', status: 'pending' },
      { step: 'write', name: '写作执行', description: '执行写作任务', status: 'pending' },
      { step: 'analyze', name: '分析复盘', description: '分析写作结果并优化', status: 'pending' }
    ];

    this.progress.set(projectId, {
      projectId,
      currentStep: 'constitution',
      completedSteps: [],
      results: new Map()
    });

    return steps;
  }

  async executeStep(
    projectId: string,
    step: WritingStep['step'],
    params?: Record<string, any>
  ): Promise<StepResult> {
    const progress = this.progress.get(projectId);
    if (!progress) {
      throw new Error('Project not initialized');
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
        throw new Error(`Unknown step: ${step}`);
    }

    if (result.success) {
      progress.completedSteps.push(step);
      progress.currentStep = this.getNextStep(step);
    }

    progress.results.set(step, result);
    return result;
  }

  private getNextStep(current: WritingStep['step']): WritingStep['step'] {
    const order: WritingStep['step'][] = ['constitution', 'specify', 'clarify', 'plan', 'tasks', 'write', 'analyze'];
    const currentIndex = order.indexOf(current);
    return order[Math.min(currentIndex + 1, order.length - 1)];
  }

  async executeConstitution(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const genre = params?.genre || 'fantasy';
      
      const constitutionPrompt = `为一部${genre}题材小说制定写作宪章。

宪章需要包含：
1. 核心原则（3-5条）：故事的核心价值观和追求
2. 写作指南（5-8条）：具体的写作风格要求
3. 类型规则（3-5条）：该类型必须遵循的规则

请详细阐述每一条原则和规则的理由。`;

      const response = await this.llmManager.complete(constitutionPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const constitution = this.parseConstitution(response, params);

      return {
        step: 'constitution',
        success: true,
        data: constitution,
        message: '宪章制定完成'
      };
    } catch (error: any) {
      return { step: 'constitution', success: false, message: error.message };
    }
  }

  async executeSpecify(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const constitution = params?.constitution || '';
      
      const specPrompt = `基于以下宪章，明确小说的规格说明：

宪章：${constitution}

规格说明需要包含：
1. 标题：小说名称
2. 前提：核心故事概念（一句话）
3. 题材：具体类型（玄幻/都市/科幻等）
4. 目标读者：主要受众群体
5. 目标字数：预计总字数
6. 主题：探讨的核心主题
7. 基调：整体情感氛围
8. 结构：叙事结构选择
9. 要求：特殊需求或限制`;

      const response = await this.llmManager.complete(specPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const spec = this.parseSpec(response, params);

      return {
        step: 'specify',
        success: true,
        data: spec,
        message: '规格说明完成'
      };
    } catch (error: any) {
      return { step: 'specify', success: false, message: error.message };
    }
  }

  async executeClarify(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const spec = params?.spec || '';
      
      const clarifyPrompt = `基于以下规格说明，澄清世界观和角色细节：

规格：${spec}

需要澄清的内容：
1. 世界观细节：
   - 世界背景和历史
   - 地理环境
   - 社会结构
   - 力量/能力体系

2. 角色细节：
   - 主角详细设定
   - 主要配角设定
   - 反派/对手设定
   - 重要NPC设定

3. 关系网络：
   - 角色之间的关系
   - 势力/组织设定
   - 关键物品/地点

请详细描述每个方面。`;

      const response = await this.llmManager.complete(clarifyPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const clarifications = {
        worldDetails: this.extractSection(response, '世界观'),
        characterDetails: this.extractSection(response, '角色'),
        relationshipNetwork: this.extractSection(response, '关系')
      };

      return {
        step: 'clarify',
        success: true,
        data: clarifications,
        message: '细节澄清完成'
      };
    } catch (error: any) {
      return { step: 'clarify', success: false, message: error.message };
    }
  }

  async executePlan(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const clarifications = params?.clarifications || '';
      const targetChapters = params?.targetChapters || 50;
      
      const planPrompt = `基于以下细节澄清，制定详细的章节规划：

细节：${clarifications}

需要生成：
1. 章节大纲（${targetChapters}章）
   - 每章标题
   - 每章摘要
   - 每章关键事件
   - 每章结尾钩子

2. 里程碑设置：
   - 第一幕结束（第X章）
   - 中点转折（第X章）
   - 第二幕结束（第X章）
   - 高潮（第X章）
   - 结局（第X章）

3. 伏笔规划：
   - 埋下的伏笔列表
   - 伏笔回收章节

请确保节奏感和情节连贯性。`;

      const response = await this.llmManager.complete(planPrompt, {
        temperature: 0.75,
        maxTokens: 3000
      });

      const plan = this.parsePlan(response, targetChapters);

      return {
        step: 'plan',
        success: true,
        data: plan,
        message: '章节规划完成'
      };
    } catch (error: any) {
      return { step: 'plan', success: false, message: error.message };
    }
  }

  async executeTasks(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const plan = params?.plan || '';
      
      const tasksPrompt = `基于以下章节规划，将写作工作分解为具体任务：

规划：${plan}

任务分解要求：
1. 将每个章节分解为具体写作任务
2. 每个任务包含：
   - 任务描述
   - 关联章节
   - 预计时间
   - 优先级
3. 标记依赖关系
4. 确定并行任务

请列出所有写作任务。`;

      const response = await this.llmManager.complete(tasksPrompt, {
        temperature: 0.6,
        maxTokens: 2000
      });

      const tasks = this.parseTasks(response);

      return {
        step: 'tasks',
        success: true,
        data: tasks,
        message: '任务分解完成'
      };
    } catch (error: any) {
      return { step: 'tasks', success: false, message: error.message };
    }
  }

  async executeWrite(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const task = params?.task;
      const context = params?.context;
      
      if (!task) {
        return { step: 'write', success: false, message: 'No task provided' };
      }

      const writePrompt = `基于以下上下文，执行写作任务：

任务：${task.description}
章节：${task.chapterId}

上下文：
- 章节大纲：${context?.outline || ''}
- 上一章摘要：${context?.previousSummary || ''}
- 角色设定：${context?.characterSummary || ''}
- 世界观：${context?.worldSummary || ''}

写作要求：
1. 严格遵循章节大纲
2. 保持风格一致性
3. 控制字数在2000-3000字
4. 结尾设置钩子

请开始写作：`;

      const content = await this.llmManager.complete(writePrompt, {
        temperature: 0.75,
        maxTokens: 3000
      });

      return {
        step: 'write',
        success: true,
        data: { content, taskId: task.id },
        message: '章节写作完成'
      };
    } catch (error: any) {
      return { step: 'write', success: false, message: error.message };
    }
  }

  async executeAnalyze(projectId: string, params?: Record<string, any>): Promise<StepResult> {
    try {
      const chapters = params?.chapters || [];
      
      const analyzePrompt = `分析以下章节的表现，提供优化建议：

章节列表：
${chapters.map((c: any, i: number) => `${i + 1}. 第${c.number}章 "${c.title}"`).join('\n')}

分析维度：
1. 整体节奏评估
2. 角色发展评估
3. 情节推进评估
4. 世界观一致性
5. 伏笔管理
6. 读者反馈预测

请提供详细的分析报告和改进建议。`;

      const response = await this.llmManager.complete(analyzePrompt, {
        temperature: 0.6,
        maxTokens: 2000
      });

      const analysis = {
        report: response,
        summary: this.extractSummary(response)
      };

      return {
        step: 'analyze',
        success: true,
        data: analysis,
        message: '分析复盘完成'
      };
    } catch (error: any) {
      return { step: 'analyze', success: false, message: error.message };
    }
  }

  getProgress(projectId: string): MethodologyProgress | undefined {
    return this.progress.get(projectId);
  }

  getNextAction(projectId: string): WritingStep['step'] | null {
    const progress = this.progress.get(projectId);
    if (!progress) return null;
    return progress.currentStep;
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

  private parsePlan(response: string, targetChapters: number): WritingPlan {
    const jsonResult = this.tryParseJSON(response);
    let chapters: any[] = [];
    
    if (jsonResult && jsonResult.chapters) {
      chapters = jsonResult.chapters.slice(0, targetChapters).map((ch: any, i: number) => ({
        number: ch.number || ch.chapterNumber || i + 1,
        title: ch.title || `第${this.toChineseNumber(i + 1)}章`,
        summary: ch.summary || ch.description || ch.content || '',
        wordCountTarget: ch.wordCountTarget || ch.wordCount || 2500,
        keyPoints: ch.keyPoints || ch.keyEvents || [],
        hooks: ch.hooks || ch.ending || []
      }));
    } else {
      const outlineMatch = response.match(/章节大纲[\s\S]*?(?=里程碑|伏笔|$)/i);
      if (outlineMatch) {
        const lines = outlineMatch[0].split('\n').filter((l: string) => l.trim());
        let chapterCount = 0;
        
        for (const line of lines) {
          if (chapterCount >= targetChapters) break;
          if (this.looksLikeChapter(line)) {
            chapterCount++;
            chapters.push({
              number: chapterCount,
              title: this.extractChapterTitle(line) || `第${this.toChineseNumber(chapterCount)}章`,
              summary: this.extractChapterSummary(line),
              wordCountTarget: 2500,
              keyPoints: [],
              hooks: []
            });
          }
        }
        
        if (chapterCount === 0) {
          const paragraphs = response.split(/\n\n+/).filter((p: string) => p.trim().length > 50);
          for (let i = 0; i < Math.min(paragraphs.length, targetChapters); i++) {
            chapters.push({
              number: i + 1,
              title: `第${this.toChineseNumber(i + 1)}章`,
              summary: paragraphs[i].slice(0, 200),
              wordCountTarget: 2500,
              keyPoints: [],
              hooks: []
            });
          }
        }
      }
    }

    return {
      id: this.generateId(),
      chapters,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      milestones: this.extractMilestones(response)
    };
  }

  private parseTasks(response: string): TaskItem[] {
    const jsonResult = this.tryParseJSON(response);
    if (jsonResult) {
      const tasks = Array.isArray(jsonResult) ? jsonResult : jsonResult.tasks;
      if (Array.isArray(tasks)) {
        return tasks.map((t: any, i: number) => ({
          id: t.id || this.generateId(),
          description: t.description || t.content || t.text || '',
          status: 'pending' as const,
          priority: t.priority || (i < 5 ? 'high' : 'medium'),
          estimatedTime: t.estimatedTime || t.time || 60,
          dependencies: t.dependencies || []
        }));
      }
    }
    
    const tasks: TaskItem[] = [];
    const lines = response.split('\n').filter((l: string) => l.trim());
    let currentSection = '';
    
    for (const line of lines) {
      if (line.match(/^\d+[.、]/)) {
        tasks.push({
          id: this.generateId(),
          description: line.replace(/^\d+[.、]\s*/, '').trim(),
          status: 'pending'
        });
      } else if (line.match(/^[-*◆]/)) {
        if (tasks.length > 0) {
          tasks[tasks.length - 1].description += ' ' + line.replace(/^[-*◆]\s*/, '').trim();
        }
      } else if (line.match(/^[一二三四五六七八九十]+[.、]/)) {
        const chineseNum = line.match(/^([一二三四五六七八九十]+)/)?.[1] || '';
        tasks.push({
          id: this.generateId(),
          description: line.replace(/^[一二三四五六七八九十]+[.、]\s*/, '').trim(),
          status: 'pending'
        });
      }
    }

    return tasks;
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
    
    const jsonLikeStart = text.indexOf('{');
    const jsonLikeEnd = text.lastIndexOf('}');
    if (jsonLikeStart !== -1 && jsonLikeEnd !== -1 && jsonLikeStart < jsonLikeEnd) {
      try {
        const jsonStr = text.slice(jsonLikeStart, jsonLikeEnd + 1);
        const result = JSON.parse(jsonStr);
        if (typeof result === 'object' && result !== null) {
          return result;
        }
      } catch {}
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

  private extractSection(text: string, section: string): string {
    const match = text.match(new RegExp(`${section}[：:]([\\s\\S]*?)(?=\\n\\n|\\n[\\u4e00-\\u9fa5])`, 'i'));
    return match ? match[1].trim() : '';
  }

  private extractList(text: string, category: string): string[] {
    const section = this.extractSection(text, category);
    if (!section) return [];
    return section.split(/[、，,；;]/).map(s => s.trim()).filter(Boolean);
  }

  private extractField(text: string, field: string): string {
    const match = text.match(new RegExp(`${field}[：:]\\s*(.+?)(?:\\n|$)`, 'i'));
    return match ? match[1].trim() : '';
  }

  private extractChapterTitle(line: string): string {
    const match = line.match(/第[一二三四五六七八九十百千\\d]+章[^""]*["""](.+?)["""]/);
    return match ? match[1] : '';
  }

  private extractChapterSummary(line: string): string {
    const match = line.match(/[:：]\s*(.+?)$/);
    return match ? match[1].trim() : '';
  }

  private extractMilestones(text: string): any[] {
    const milestones: any[] = [];
    const milestonesSection = this.extractSection(text, '里程碑');
    
    const patterns = [
      { name: '第一幕结束', pattern: /第一幕.*?第?([\\d]+)章/i },
      { name: '中点转折', pattern: /中点.*?第?([\\d]+)章/i },
      { name: '第二幕结束', pattern: /第二幕.*?第?([\\d]+)章/i },
      { name: '高潮', pattern: /高潮.*?第?([\\d]+)章/i },
      { name: '结局', pattern: /结局.*?第?([\\d]+)章/i }
    ];

    for (const p of patterns) {
      const match = milestonesSection.match(p.pattern);
      if (match) {
        milestones.push({
          id: this.generateId(),
          description: p.name,
          targetChapter: parseInt(match[1]),
          completed: false
        });
      }
    }

    return milestones;
  }

  private extractSummary(text: string): string {
    const summaryMatch = text.match(/总结[：:]([\\s\\S]*?)$/i);
    return summaryMatch ? summaryMatch[1].trim() : text.slice(0, 200);
  }

  private generateId(): string {
    return `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SevenStepMethodology;
