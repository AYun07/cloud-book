/**
 * 雪花创作法（Snowflake Method）
 * 从一句话开始，逐步扩展为完整小说
 * Step 1: 一句话概括 → Step 2: 扩展为一段 → Step 3: 人物设定
 * Step 4: 一句话章节大纲 → Step 5: 段落章节大纲 → Step 6: 角色情节图
 * Step 7: 详细场景 → Step 8: 开始写作
 */

import { LLMManager } from '../LLMProvider/LLMManager';

export interface SnowflakeStep {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  data?: any;
}

export interface SnowflakeProject {
  projectId: string;
  steps: SnowflakeStep[];
  currentStep: number;
}

export interface CharacterSheet {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'side' | 'love';
  backstory: string;
  motivation: string;
  goal: string;
  conflict: string;
  epiphany: string;
  oneLineSummary: string;
  oneParagraphSummary: string;
}

export interface ChapterOutline {
  chapterNumber: number;
  oneLine: string;
  oneParagraph?: string;
  detailedScene?: string;
  keyPoints?: string[];
  characterFocus?: string[];
}

export class SnowflakeMethodology {
  private llmManager: LLMManager;
  private projects: Map<string, SnowflakeProject> = new Map();

  constructor(llmManager: LLMManager) {
    this.llmManager = llmManager;
  }

  async initializeProject(projectId: string): Promise<SnowflakeStep[]> {
    const steps: SnowflakeStep[] = [
      {
        step: 1,
        name: '一句话概括',
        description: '用一句话概括整个故事的核心',
        status: 'pending'
      },
      {
        step: 2,
        name: '扩展为一段',
        description: '将一句话扩展为一个完整的段落',
        status: 'pending'
      },
      {
        step: 3,
        name: '人物设定',
        description: '为主要人物创建详细设定',
        status: 'pending'
      },
      {
        step: 4,
        name: '一句话章节大纲',
        description: '用一句话描述每一章',
        status: 'pending'
      },
      {
        step: 5,
        name: '段落章节大纲',
        description: '将每章扩展为段落',
        status: 'pending'
      },
      {
        step: 6,
        name: '角色情节图',
        description: '追踪每个角色的情节线',
        status: 'pending'
      },
      {
        step: 7,
        name: '详细场景',
        description: '为每章创建详细的场景',
        status: 'pending'
      },
      {
        step: 8,
        name: '开始写作',
        description: '根据大纲开始写作',
        status: 'pending'
      }
    ];

    this.projects.set(projectId, {
      projectId,
      steps,
      currentStep: 1
    });

    return steps;
  }

  async executeStep(
    projectId: string,
    step: number,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not initialized');
    }

    const stepInfo = project.steps.find(s => s.step === step);
    if (!stepInfo) {
      throw new Error(`Invalid step: ${step}`);
    }

    stepInfo.status = 'in_progress';

    let result;

    switch (step) {
      case 1:
        result = await this.executeStep1(projectId, params);
        break;
      case 2:
        result = await this.executeStep2(projectId, params);
        break;
      case 3:
        result = await this.executeStep3(projectId, params);
        break;
      case 4:
        result = await this.executeStep4(projectId, params);
        break;
      case 5:
        result = await this.executeStep5(projectId, params);
        break;
      case 6:
        result = await this.executeStep6(projectId, params);
        break;
      case 7:
        result = await this.executeStep7(projectId, params);
        break;
      case 8:
        result = await this.executeStep8(projectId, params);
        break;
      default:
        throw new Error(`Unknown step: ${step}`);
    }

    if (result.success) {
      stepInfo.status = 'completed';
      stepInfo.data = result.data;
      
      if (step < 8) {
        project.currentStep = step + 1;
        const nextStep = project.steps.find(s => s.step === step + 1);
        if (nextStep) {
          nextStep.status = 'in_progress';
        }
      }
    } else {
      stepInfo.status = 'pending';
    }

    return result;
  }

  private async executeStep1(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const genre = params?.genre || 'fantasy';
      const initialIdea = params?.idea || '';
      
      const prompt = `请用一句话概括一个${genre}题材的故事核心。

${initialIdea ? `参考想法：${initialIdea}` : ''}

要求：
1. 不要超过25个字
2. 包含主角、冲突和目标
3. 要有悬念或戏剧性
4. 简洁有力

请直接输出这句话：`;

      const oneLine = await this.llmManager.complete(prompt, {
        temperature: 0.8,
        maxTokens: 100
      });

      return {
        success: true,
        data: { oneLine },
        message: '一句话概括完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep2(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const oneLine = params?.oneLine || '';
      
      const prompt = `将以下一句话扩展为一个完整的段落：

${oneLine}

要求：
1. 扩展为5-7句话
2. 建立三幕结构（开头、中间、结尾）
3. 第一句：设定舞台和灾难
4. 中间：描述主要冲突和转折
5. 最后一句：展示结局
6. 200-300字

请直接输出这个段落：`;

      const oneParagraph = await this.llmManager.complete(prompt, {
        temperature: 0.75,
        maxTokens: 500
      });

      return {
        success: true,
        data: { oneParagraph },
        message: '段落扩展完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep3(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const oneParagraph = params?.oneParagraph || '';
      
      const characters = await this.generateCharacters(oneParagraph);
      
      return {
        success: true,
        data: { characters },
        message: '人物设定完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async generateCharacters(storyParagraph: string): Promise<CharacterSheet[]> {
    const prompt = `基于以下故事段落，创建主要角色的详细设定：

${storyParagraph}

请为以下角色创建设定（每个角色单独输出）：
1. 主角（Protagonist）
2. 反派（Antagonist）
3. 配角1
4. 配角2

每个角色需要包含：
- name: 角色姓名
- role: protagonist/antagonist/side
- oneLineSummary: 一句话概括
- oneParagraphSummary: 一段概括
- backstory: 背景故事
- motivation: 动机
- goal: 目标
- conflict: 冲突
- epiphany: 领悟/成长

请用JSON数组格式输出，只返回JSON，不要其他内容：`;

    const response = await this.llmManager.complete(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    });

    // 尝试解析 LLM 的响应
    try {
      // 清理响应，只保留 JSON 部分
      let cleanedResponse = response.trim();
      // 找到第一个 { 或 [ 和最后一个 } 或 ]
      const firstBracket = cleanedResponse.search(/[\{\[]/);
      const lastBracket = cleanedResponse.lastIndexOf(cleanedResponse.includes('[') ? ']' : '}');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanedResponse = cleanedResponse.slice(firstBracket, lastBracket + 1);
      }
      
      const parsed = JSON.parse(cleanedResponse);
      
      if (Array.isArray(parsed)) {
        const roleTypes = ['protagonist', 'antagonist', 'side', 'side'];
        return parsed.map((char, index) => ({
          id: `char_${index + 1}`,
          name: char.name || `角色${index + 1}`,
          role: char.role || roleTypes[index] || 'side',
          backstory: char.backstory || '',
          motivation: char.motivation || '',
          goal: char.goal || '',
          conflict: char.conflict || '',
          epiphany: char.epiphany || '',
          oneLineSummary: char.oneLineSummary || '',
          oneParagraphSummary: char.oneParagraphSummary || ''
        }));
      }
    } catch (parseError) {
      console.warn('解析角色设定失败，使用默认角色');
    }

    // 解析失败时返回默认角色，但至少填充一些默认值
    const roleTypes = ['protagonist', 'antagonist', 'side', 'side'];
    const characters: CharacterSheet[] = [];
    
    for (let i = 0; i < 4; i++) {
      characters.push({
        id: `char_${i + 1}`,
        name: `角色${i + 1}`,
        role: roleTypes[i] as any,
        backstory: '',
        motivation: '',
        goal: '',
        conflict: '',
        epiphany: '',
        oneLineSummary: '',
        oneParagraphSummary: ''
      });
    }

    return characters;
  }

  private async executeStep4(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const oneParagraph = params?.oneParagraph || '';
      const characters = params?.characters || [];
      const targetChapters = params?.targetChapters || 50;
      
      const prompt = `基于以下故事和角色，创建${targetChapters}章的一句话大纲：

故事：${oneParagraph}
角色：${characters.map((c: any) => c.name).join(', ')}

要求：
1. 每章用一句话描述
2. 建立冲突和升级
3. 每章有明确的目的
4. 规划伏笔和回收
5. 安排好三幕结构

请按顺序输出，每一行是一章：`;

      const response = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1500
      });

      const outlines = this.parseOneLineChapters(response, targetChapters);
      
      return {
        success: true,
        data: { chapterOutlines: outlines },
        message: '一句话章节大纲完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep5(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const chapterOutlines = params?.chapterOutlines || [];
      const characters = params?.characters || [];
      
      const expandedOutlines: ChapterOutline[] = [];
      
      for (const outline of chapterOutlines) {
        const prompt = `将以下一句话扩展为一个完整的段落：

${outline.oneLine}

相关角色：${characters.map((c: any) => c.name).join(', ')}

要求：
1. 200-300字
2. 包含冲突、发展、结果
3. 明确场景
4. 标记角色出现
5. 有明确的目标和阻碍

请直接输出：`;

        const oneParagraph = await this.llmManager.complete(prompt, {
          temperature: 0.7,
          maxTokens: 400
        });

        expandedOutlines.push({
          ...outline,
          oneParagraph
        });
      }
      
      return {
        success: true,
        data: { chapterOutlines: expandedOutlines },
        message: '段落章节大纲完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep6(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const chapterOutlines = params?.chapterOutlines || [];
      const characters = params?.characters || [];
      
      const characterPlots: Record<string, { chapters: number[]; keyMoments: string[] }> = {};
      
      for (const char of characters) {
        characterPlots[char.name] = {
          chapters: [],
          keyMoments: []
        };
      }
      
      for (let i = 0; i < chapterOutlines.length; i++) {
        const outline = chapterOutlines[i];
        for (const char of characters) {
          if (outline.oneParagraph?.includes(char.name)) {
            characterPlots[char.name].chapters.push(i + 1);
          }
        }
      }
      
      return {
        success: true,
        data: { characterPlots },
        message: '角色情节图完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep7(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const chapterOutlines = params?.chapterOutlines || [];
      
      const detailedScenes: ChapterOutline[] = [];
      
      for (const outline of chapterOutlines) {
        const prompt = `将以下章节大纲扩展为详细的场景描述：

章节：第${outline.chapterNumber}章
大纲：${outline.oneParagraph}

要求：
1. 详细的场景描述
2. 明确的开场、发展、高潮、结局
3. 对话要点
4. 动作序列
5. 情感变化
6. 500-800字

请直接输出：`;

        const detailedScene = await this.llmManager.complete(prompt, {
          temperature: 0.7,
          maxTokens: 1000
        });

        detailedScenes.push({
          ...outline,
          detailedScene
        });
      }
      
      return {
        success: true,
        data: { chapterOutlines: detailedScenes },
        message: '详细场景完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep8(projectId: string, params?: Record<string, any>): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const project = this.projects.get(projectId);
      if (!project) {
        return { success: false, message: 'Project not found' };
      }

      const step7 = project.steps.find(s => s.step === 7);
      const step4 = project.steps.find(s => s.step === 4);
      const step2 = project.steps.find(s => s.step === 2);

      const detailedScenes = step7?.data?.chapterOutlines || [];
      const chapters: Array<{ chapterNumber: number; oneLine: string; content: string }> = [];

      for (const scene of detailedScenes) {
        let prompt = `请根据以下信息，为第 ${scene.chapterNumber} 章创作完整的小说内容:\n\n`;
        
        if (step2?.data?.summary) {
          prompt += `故事概要: ${step2.data.summary}\n\n`;
        }
        
        if (scene.oneLine) {
          prompt += `章节概要: ${scene.oneLine}\n\n`;
        }
        
        if (scene.detailedScene) {
          prompt += `详细场景: ${scene.detailedScene}\n\n`;
        }
        
        prompt += '要求:\n1. 语言流畅，有画面感\n2. 对话自然\n3. 适当的环境描写和心理描写\n4. 字数在 2000-3000 字';

        const response = await this.llmManager.complete(prompt, {
          temperature: 0.7,
          maxTokens: 3000
        });

        chapters.push({
          chapterNumber: scene.chapterNumber,
          oneLine: scene.oneLine || '',
          content: response
        });
      }

      return {
        success: true,
        data: { chapters, message: '章节内容生成完成' },
        message: '雪花创作法完成，章节已生成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  getProject(projectId: string): SnowflakeProject | undefined {
    return this.projects.get(projectId);
  }

  getCurrentStep(projectId: string): number | null {
    const project = this.projects.get(projectId);
    return project ? project.currentStep : null;
  }

  getStepData(projectId: string, step: number): any {
    const project = this.projects.get(projectId);
    if (!project) return null;
    const stepInfo = project.steps.find(s => s.step === step);
    return stepInfo?.data;
  }

  private parseOneLineChapters(text: string, targetChapters: number): ChapterOutline[] {
    const outlines: ChapterOutline[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    for (let i = 0; i < Math.min(lines.length, targetChapters); i++) {
      let line = lines[i].trim();
      line = line.replace(/^\d+[.、]\s*/, '');
      line = line.replace(/^[-*]\s*/, '');
      
      if (line) {
        outlines.push({
          chapterNumber: i + 1,
          oneLine: line
        });
      }
    }
    
    // 如果不够，填充空的
    while (outlines.length < targetChapters) {
      outlines.push({
        chapterNumber: outlines.length + 1,
        oneLine: `第${outlines.length + 1}章待写`
      });
    }
    
    return outlines;
  }

  private generateId(): string {
    return `snowflake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SnowflakeMethodology;
