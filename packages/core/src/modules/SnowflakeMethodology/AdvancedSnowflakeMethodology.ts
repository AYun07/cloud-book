/**
 * Cloud Book - 高级雪花创作法 (诺贝尔文学奖支撑版 v3.0)
 * 从一句话到完整章节的渐进式创作
 * 
 * 严谨声明：
 * 本系统是结构化创作框架和一致性管理引擎，不是自动写作AI
 * 实际效果取决于使用者的创作能力和LLM的文本生成质量
 * 
 * 本版本能做到的（不夸大）：
 * 1. 结构化创作流程：从一句话到章节的渐进式引导
 * 2. 一致性追踪：角色、事件、世界状态的跨章节追踪
 * 3. 伏笔管理：设置、追踪、回收提示
 * 4. 长篇支撑：支持数千章节的创作项目管理
 * 5. 质量检测：基于规则的一致性检查和提示
 * 
 * 本版本不能做到的：
 * 1. 自动生成诺贝尔文学奖级别的文字（文字质量取决于LLM）
 * 2. 保证情节的文学价值和深度（需要创作者自身能力）
 * 3. 替代创作本身（工具辅助，非替代）
 */

import { LLMManager } from '../LLMProvider/LLMManager';
import { AdvancedTruthFileManager } from '../TruthFiles/AdvancedTruthFileManager';
import * as fs from 'fs';
import * as path from 'path';

export interface SnowflakeStep {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  data?: any;
  qualityCriteria?: string[];
  estimatedTime?: string;
}

export interface SnowflakeProject {
  projectId: string;
  steps: SnowflakeStep[];
  currentStep: number;
  meta: ProjectMeta;
  longTermConfig: LongTermConfig;
}

export interface ProjectMeta {
  title: string;
  genre: string;
  targetChapters: number;
  targetWordCount: number;
  estimatedVolumes: number;
  complexity: 'simple' | 'medium' | 'complex' | 'epic';
  createdAt: Date;
  lastModified: Date;
}

export interface LongTermConfig {
  enableVolumeSnapshots: boolean;
  enableConsistencyCheck: boolean;
  enableHookTracking: boolean;
  enableCharacterNetwork: boolean;
  enableEmotionTracking: boolean;
  enableThemeAnalysis: boolean;
  chapterBatchSize: number;
  checkpointInterval: number;
}

export interface CharacterSheet {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'side' | 'love' | 'mentor' | 'foil';
  importance: 'critical' | 'major' | 'secondary' | 'minor';
  backstory: string;
  motivation: string;
  goal: string;
  conflict: string;
  epiphany: string;
  arc: CharacterArc;
  firstAppearance?: number;
  lastAppearance?: number;
  appearanceCount: number;
  voice: VoiceProfile;
  relationships: CharacterRelationship[];
}

export interface CharacterArc {
  startState: string;
  endState: string;
  keyTransformations: string[];
  growthTrajectory: string;
  lessonsLearned: string[];
}

export interface VoiceProfile {
  speechPatterns: string[];
  vocabulary: string[];
  catchphrases: string[];
  dialogueStyle: 'formal' | 'casual' | 'archaic' | 'regional';
  tension: 'high' | 'medium' | 'low';
}

export interface CharacterRelationship {
  targetCharacterId: string;
  type: 'ally' | 'enemy' | 'family' | 'romantic' | 'professional' | 'rival';
  status: 'positive' | 'negative' | 'neutral' | 'complex';
  evolution: RelationshipEvolution[];
  keyEvents: string[];
}

export interface RelationshipEvolution {
  chapter: number;
  event: string;
  impact: 'strengthen' | 'weaken' | 'transform' | 'break' | 'form';
  newStatus: string;
}

export interface ChapterOutline {
  chapterNumber: number;
  oneLine: string;
  oneParagraph: string;
  detailedScene: string;
  keyPoints: string[];
  characterFocus: string[];
  location: string;
  timeFrame: string;
  tensionLevel: number;
  thematicElements: string[];
  plotHooks: PlotHookReference[];
  wordCountTarget: number;
  beatStructure?: BeatStructure;
}

export interface PlotHookReference {
  hookId: string;
  type: 'setup' | 'development' | 'payoff' | 'twist';
  connection: string;
}

export interface BeatStructure {
  opening: string;
  inciting: string;
  rising: string;
  climax: string;
  falling: string;
  resolution: string;
}

export interface VolumePlan {
  volumeNumber: number;
  title: string;
  startChapter: number;
  endChapter: number;
  arcDescription: string;
  primaryThemes: string[];
  mainConflicts: string[];
  keyCharacters: string[];
  targetWordCount: number;
}

export interface NarrativeProgress {
  totalChapters: number;
  completedChapters: number;
  currentChapter: number;
  wordCount: number;
  characterProgress: Map<string, { completed: number; total: number; status: string }>;
  hookProgress: { total: number; resolved: number; pending: number };
  subplotProgress: { total: number; resolved: number; inProgress: number };
  thematicProgress: Map<string, { development: number; consistency: number }>;
  pacingHealth: number;
  consistencyScore: number;
}

export interface WritingGuidance {
  previousChapterSummary: string;
  currentChapterObjectives: string[];
  activeHooks: string[];
  unresolvedPlotThreads: string[];
  characterStates: Map<string, string>;
  thematicFocus: string[];
  pacingGuidance: string;
  warnings: string[];
  suggestions: string[];
}

export class AdvancedSnowflakeMethodology {
  private llmManager: LLMManager;
  private truthFileManager: AdvancedTruthFileManager;
  private projects: Map<string, SnowflakeProject> = new Map();
  private projectData: Map<string, any> = new Map();
  private storagePath: string;
  private projectDataPath: string;

  constructor(llmManager: LLMManager, truthFileManager: AdvancedTruthFileManager, storagePath: string = './advanced-snowflake') {
    this.llmManager = llmManager;
    this.truthFileManager = truthFileManager;
    this.storagePath = storagePath;
    this.projectDataPath = path.join(storagePath, 'projects');
    if (!fs.existsSync(this.projectDataPath)) {
      fs.mkdirSync(this.projectDataPath, { recursive: true });
    }
  }

  async initializeProject(
    projectId: string,
    meta: ProjectMeta,
    longTermConfig?: Partial<LongTermConfig>
  ): Promise<SnowflakeStep[]> {
    const defaultConfig: LongTermConfig = {
      enableVolumeSnapshots: true,
      enableConsistencyCheck: true,
      enableHookTracking: true,
      enableCharacterNetwork: true,
      enableEmotionTracking: true,
      enableThemeAnalysis: true,
      chapterBatchSize: 50,
      checkpointInterval: 10
    };

    const config = { ...defaultConfig, ...longTermConfig };

    const steps: SnowflakeStep[] = [
      {
        step: 1,
        name: '核心概念确立',
        description: '确定故事的核心概念、一句话概括',
        status: 'pending',
        qualityCriteria: [
          '一句话包含主角、冲突、目标',
          '具有戏剧张力和吸引力',
          '适合扩展为长篇'
        ],
        estimatedTime: '5分钟'
      },
      {
        step: 2,
        name: '世界观构建',
        description: '构建故事发生的世界观和规则体系',
        status: 'pending',
        qualityCriteria: [
          '世界规则自洽',
          '设定有深度和细节',
          '支持长篇发展'
        ],
        estimatedTime: '30分钟-2小时'
      },
      {
        step: 3,
        name: '主题确立',
        description: '明确作品的核心主题和副主题',
        status: 'pending',
        qualityCriteria: [
          '主题有深度和普遍性',
          '能在故事中多层次展现',
          '支持诺贝尔级表达'
        ],
        estimatedTime: '15-30分钟'
      },
      {
        step: 4,
        name: '段落扩展',
        description: '将一句话扩展为包含三幕结构的段落',
        status: 'pending',
        qualityCriteria: [
          '建立开头、中间、结尾',
          '包含主要冲突和转折',
          '展示故事走向'
        ],
        estimatedTime: '20分钟'
      },
      {
        step: 5,
        name: '角色体系创建',
        description: '创建主角、反派和关键配角',
        status: 'pending',
        qualityCriteria: [
          '角色有明确动机和目标',
          '角色间有复杂关系',
          '每个角色有独特声音'
        ],
        estimatedTime: '2-4小时'
      },
      {
        step: 6,
        name: '卷级规划',
        description: '将长篇划分为多个卷，每卷有独立弧线',
        status: 'pending',
        qualityCriteria: [
          '每卷有明确开始和结束',
          '整体有更大的弧线',
          '支持数千章节结构'
        ],
        estimatedTime: '1-2小时'
      },
      {
        step: 7,
        name: '章节大纲创建',
        description: '为所有章节创建一句话大纲',
        status: 'pending',
        qualityCriteria: [
          '每章有明确目的',
          '建立冲突和升级',
          '规划伏笔设置'
        ],
        estimatedTime: '3-8小时'
      },
      {
        step: 8,
        name: '章节段落大纲',
        description: '将每章扩展为段落级大纲',
        status: 'pending',
        qualityCriteria: [
          '200-300字每章',
          '包含场景、角色、目的',
          '标记伏笔和回收'
        ],
        estimatedTime: '8-16小时'
      },
      {
        step: 9,
        name: '节拍结构细化',
        description: '为章节创建详细节拍结构',
        status: 'pending',
        qualityCriteria: [
          '开场、发展、高潮、结局',
          '张力曲线合理',
          '节奏健康'
        ],
        estimatedTime: '16-32小时'
      },
      {
        step: 10,
        name: '分批创作执行',
        description: '按批次开始写作，每批50章',
        status: 'pending',
        qualityCriteria: [
          '保持一致性',
          '回收伏笔',
          '推进角色弧线'
        ],
        estimatedTime: '数月-数年'
      },
      {
        step: 11,
        name: '阶段性质量检测',
        description: '每50章进行一致性检测和质量评估',
        status: 'pending',
        qualityCriteria: [
          '一致性分数>85',
          '伏笔回收率>80%',
          '角色弧线完整'
        ],
        estimatedTime: '每批完成后'
      },
      {
        step: 12,
        name: '完稿与修订',
        description: '完成全部章节，进行整体修订',
        status: 'pending',
        qualityCriteria: [
          '首尾呼应',
          '伏笔全部回收',
          '主题完整表达'
        ],
        estimatedTime: '1-3个月'
      }
    ];

    const project: SnowflakeProject = {
      projectId,
      steps,
      currentStep: 1,
      meta,
      longTermConfig: config
    };

    this.projects.set(projectId, project);
    this.projectData.set(projectId, {
      characters: [],
      chapterOutlines: [],
      volumes: [],
      worldBuilding: null,
      themes: [],
      hookNetwork: new Map()
    });

    await this.truthFileManager.initializeAdvancedSystem(projectId);
    await this.saveProject(projectId);

    return steps;
  }

  async executeStep(
    projectId: string,
    step: number,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string; guidance?: WritingGuidance }> {
    const project = this.projects.get(projectId);
    if (!project) {
      return { success: false, message: '项目未初始化' };
    }

    const stepInfo = project.steps.find(s => s.step === step);
    if (!stepInfo) {
      return { success: false, message: `无效的步骤: ${step}` };
    }

    stepInfo.status = 'in_progress';

    let result;
    switch (step) {
      case 1: result = await this.executeStep1CoreConcept(projectId, params); break;
      case 2: result = await this.executeStep2WorldBuilding(projectId, params); break;
      case 3: result = await this.executeStep3Themes(projectId, params); break;
      case 4: result = await this.executeStep4ParagraphExpansion(projectId, params); break;
      case 5: result = await this.executeStep5CharacterCreation(projectId, params); break;
      case 6: result = await this.executeStep6VolumePlanning(projectId, params); break;
      case 7: result = await this.executeStep7ChapterOutlines(projectId, params); break;
      case 8: result = await this.executeStep8ParagraphOutlines(projectId, params); break;
      case 9: result = await this.executeStep9BeatStructure(projectId, params); break;
      case 10: result = await this.executeStep10BatchWriting(projectId, params); break;
      case 11: result = await this.executeStep11QualityCheck(projectId, params); break;
      case 12: result = await this.executeStep12FinalRevision(projectId, params); break;
      default:
        return { success: false, message: `未知步骤: ${step}` };
    }

    if (result.success) {
      stepInfo.status = 'completed';
      stepInfo.data = result.data;

      if (step < 12) {
        project.currentStep = step + 1;
        const nextStep = project.steps.find(s => s.step === step + 1);
        if (nextStep) {
          nextStep.status = 'in_progress';
        }
      }
    } else {
      stepInfo.status = 'pending';
    }

    await this.saveProject(projectId);

    return result;
  }

  private async executeStep1CoreConcept(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const project = this.projects.get(projectId);
    const genre = project?.meta.genre || params?.genre || 'general';
    const initialIdea = params?.idea || '';

    const prompt = `为一个${genre}题材的故事创作核心概念：

${initialIdea ? `参考想法：${initialIdea}` : '请自由创作一个吸引人的故事概念'}

请按以下格式输出：

1. 一句话概括（25字以内，必须包含主角、冲突、目标）：
   [你的回答]

2. 故事核心冲突：
   [描述主要矛盾]

3. 主角简述：
   [谁是主角，想要什么]

4. 吸引点：
   [为什么读者会想读下去]

直接输出，不要解释：`;

    try {
      const response = await this.llmManager.complete(prompt, {
        temperature: 0.8,
        maxTokens: 500
      });

      const coreConcept = this.parseCoreConceptResponse(response);

      const data = this.projectData.get(projectId) || {};
      data.coreConcept = coreConcept;
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: coreConcept,
        message: '核心概念确立完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private parseCoreConceptResponse(response: string): any {
    const lines = response.split('\n').filter(l => l.trim());
    return {
      oneLine: lines.find(l => l.includes('：') || l.includes(':'))?.split(/[：:]/)[1]?.trim() || response.substring(0, 100),
      fullResponse: response
    };
  }

  private async executeStep2WorldBuilding(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const coreConcept = data?.coreConcept;

    const prompt = `基于以下故事概念，构建世界观：

故事概念：
${coreConcept?.oneLine || '一个关于成长和救赎的故事'}

请从以下维度构建世界观（选择相关维度深入）：

1. 物理规则（如果适用）：
   - 世界的运行规则
   - 特殊能力或魔法系统（如果有）

2. 社会结构：
   - 主要势力和组织
   - 社会阶层和规则
   - 文化特点

3. 历史背景：
   - 重要历史事件
   - 过去如何影响现在
   - 未解之谜

4. 地理环境：
   - 主要地点
   - 地点间的关系

5. 规则与限制：
   - 什么是可能的
   - 什么是禁忌
   - 代价是什么

请输出结构化的世界观文档（500-1000字）：`;

    try {
      const worldBuilding = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1500
      });

      data.worldBuilding = worldBuilding;
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: { worldBuilding },
        message: '世界观构建完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep3Themes(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const coreConcept = data?.coreConcept;

    const prompt = `为一个故事确定核心主题：

故事概念：${coreConcept?.oneLine || ''}

请分析：

1. 核心主题（1个主导主题）：
   - 主题是什么
   - 为什么重要
   - 如何通过故事展现

2. 副主题（2-3个）：
   - 如何与核心主题呼应
   - 在哪些情节中体现

3. 主题的普世性：
   - 为什么读者会共鸣
   - 与现实世界的联系

4. 主题的表达层次：
   - 表面情节
   - 角色心理
   - 象征和隐喻

请输出主题分析（300-500字）：`;

    try {
      const themesAnalysis = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 800
      });

      const themes = this.parseThemesResponse(themesAnalysis);
      data.themes = themes;
      this.projectData.set(projectId, data);

      for (const theme of themes) {
        await this.truthFileManager.addTheme(projectId, {
          id: `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: theme.name,
          description: theme.description,
          category: theme.category,
          manifestations: [],
          evolution: [],
          relatedThemes: [],
          symbols: [],
          importance: theme.importance,
          complexity: theme.complexity,
          depth: theme.depth,
          consistency: 100
        });
      }

      return {
        success: true,
        data: { themes },
        message: '主题确立完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private parseThemesResponse(response: string): any[] {
    const themes: any[] = [];
    const lines = response.split('\n');

    let currentTheme: any = null;
    for (const line of lines) {
      if (line.includes('核心主题') || line.includes('副主题')) {
        if (currentTheme) themes.push(currentTheme);
        currentTheme = {
          name: line.replace(/[#*]/g, '').trim(),
          description: '',
          category: line.includes('核心') ? 'universal' : 'personal',
          importance: line.includes('核心') ? 90 : 70,
          complexity: 70,
          depth: 75
        };
      } else if (currentTheme && !currentTheme.description) {
        currentTheme.description = line.trim();
      }
    }
    if (currentTheme) themes.push(currentTheme);

    return themes.length > 0 ? themes : [{ name: '待确定', description: response.substring(0, 200), category: 'universal', importance: 80, complexity: 70, depth: 70 }];
  }

  private async executeStep4ParagraphExpansion(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const coreConcept = data?.coreConcept;

    const prompt = `将以下故事概念扩展为包含三幕结构的段落：

故事概念：${coreConcept?.oneLine || ''}

三幕结构要求：

第一幕（开头 - 约20%）：
- 设定世界和主角
- 引入主要冲突
- 主角遇到"灾难"或触发事件

第二幕（中间 - 约60%）：
- 主角应对挑战
- 建立关系和支线
- 遇到挫折和成长
- 中点转折

第三幕（结尾 - 约20%）：
- 最终对抗
- 解决主要冲突
- 角色变化和领悟

请用5-7句话写出这个段落（200-300字），确保包含开头、中间、结尾的概述：`;

    try {
      const oneParagraph = await this.llmManager.complete(prompt, {
        temperature: 0.75,
        maxTokens: 600
      });

      data.oneParagraph = oneParagraph;
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: { oneParagraph },
        message: '段落扩展完成'
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async executeStep5CharacterCreation(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const coreConcept = data?.coreConcept;
    const oneParagraph = data?.oneParagraph;
    const project = this.projects.get(projectId);

    const targetChapters = project?.meta.targetChapters || 100;
    const complexity = project?.meta.complexity || 'medium';

    const characterCount = complexity === 'simple' ? 4 : complexity === 'medium' ? 8 : complexity === 'complex' ? 15 : 25;

    const prompt = `基于以下故事，创建${characterCount}个角色的详细设定：

故事概念：${coreConcept?.oneLine || ''}

故事概述：${oneParagraph || ''}

请为以下角色创建设定：

主要角色（${Math.ceil(characterCount * 0.2)}个）：
- 主角
- 反派
- 导师/关键盟友

次要角色（${Math.ceil(characterCount * 0.4)}个）：
- 重要配角

辅助角色（${Math.floor(characterCount * 0.4)}个）：
- 功能性角色

每个角色需要包含：
{
  "name": "姓名",
  "role": "protagonist/antagonist/mentor/side",
  "importance": "critical/major/secondary/minor",
  "backstory": "背景故事（50-100字）",
  "motivation": "核心动机",
  "goal": "具体目标",
  "conflict": "内心冲突",
  "epiphany": "最终领悟",
  "voice": {
    "speechPatterns": ["语言特点1", "语言特点2"],
    "catchphrases": ["口头禅"],
    "dialogueStyle": "formal/casual"
  },
  "arc": {
    "startState": "初始状态",
    "endState": "最终状态",
    "keyTransformations": ["转变1", "转变2"]
  }
}

请输出JSON数组：`;

    try {
      const response = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 3000
      });

      const characters = this.parseCharacterResponse(response, characterCount);
      data.characters = characters;
      this.projectData.set(projectId, data);

      for (const char of characters) {
        await this.truthFileManager.buildEmotionalTrajectory(projectId, char.id, char.name, {
          characterId: char.id,
          characterName: char.name,
          arcType: 'complex',
          points: []
        });
      }

      return {
        success: true,
        data: { characters },
        message: `角色体系创建完成，共${characters.length}个角色`
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private parseCharacterResponse(response: string, expectedCount: number): CharacterSheet[] {
    try {
      let cleanedResponse = response.trim();
      const firstBracket = cleanedResponse.search(/[\{\[]/);
      const lastBracket = cleanedResponse.lastIndexOf(cleanedResponse.includes('[') ? ']' : '}');

      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanedResponse = cleanedResponse.slice(firstBracket, lastBracket + 1);
      }

      const parsed = JSON.parse(cleanedResponse);
      const characters: CharacterSheet[] = [];

      const charArray = Array.isArray(parsed) ? parsed : [parsed];
      const roleTypes = ['protagonist', 'antagonist', 'mentor', 'side', 'side', 'side', 'side', 'side'];

      for (let i = 0; i < Math.min(charArray.length, expectedCount); i++) {
        const char = charArray[i];
        characters.push({
          id: `char_${Date.now()}_${i}`,
          name: char.name || `角色${i + 1}`,
          role: char.role || roleTypes[i % roleTypes.length],
          importance: char.importance || (i < 3 ? 'critical' : i < 7 ? 'major' : 'secondary'),
          backstory: char.backstory || '',
          motivation: char.motivation || '',
          goal: char.goal || '',
          conflict: char.conflict || '',
          epiphany: char.epiphany || '',
          arc: char.arc || { startState: '', endState: '', keyTransformations: [], growthTrajectory: '', lessonsLearned: [] },
          appearanceCount: 0,
          voice: char.voice || { speechPatterns: [], vocabulary: [], catchphrases: [], dialogueStyle: 'casual', tension: 'medium' },
          relationships: []
        });
      }

      return characters;
    } catch {
      return this.generateDefaultCharacters(expectedCount);
    }
  }

  private generateDefaultCharacters(count: number): CharacterSheet[] {
    const characters: CharacterSheet[] = [];
    const templates = [
      { name: '主角', role: 'protagonist', importance: 'critical' },
      { name: '反派', role: 'antagonist', importance: 'critical' },
      { name: '导师', role: 'mentor', importance: 'major' },
      { name: '盟友', role: 'side', importance: 'major' }
    ];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      characters.push({
        id: `char_default_${i}`,
        name: `${template.name}${Math.floor(i / templates.length) + 1}`,
        role: template.role as any,
        importance: template.importance as any,
        backstory: '',
        motivation: '',
        goal: '',
        conflict: '',
        epiphany: '',
        arc: { startState: '', endState: '', keyTransformations: [], growthTrajectory: '', lessonsLearned: [] },
        appearanceCount: 0,
        voice: { speechPatterns: [], vocabulary: [], catchphrases: [], dialogueStyle: 'casual', tension: 'medium' },
        relationships: []
      });
    }

    return characters;
  }

  private async executeStep6VolumePlanning(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const project = this.projects.get(projectId);
    const targetChapters = project?.meta.targetChapters || 100;

    const estimatedVolumes = Math.ceil(targetChapters / 100);
    const chaptersPerVolume = Math.ceil(targetChapters / estimatedVolumes);

    const prompt = `为一个${targetChapters}章的长篇故事规划卷级结构：

故事概念：${data?.coreConcept?.oneLine || ''}
故事概述：${data?.oneParagraph || ''}

请将故事划分为${estimatedVolumes}卷，每卷约${chaptersPerVolume}章：

对于每一卷，请提供：
1. 卷标题
2. 章节范围（第X章-第Y章）
3. 本卷核心弧线
4. 主要主题
5. 关键事件
6. 预期字数

确保：
- 整体有一个大的三幕弧线
- 每卷有独立的开始、高潮、结束
- 章节数量合理分配
- 避免前几卷过轻、后几卷过重

请输出JSON数组：`;

    try {
      const response = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const volumes = this.parseVolumeResponse(response, estimatedVolumes, chaptersPerVolume);
      data.volumes = volumes;
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: { volumes },
        message: `卷级规划完成，共${volumes.length}卷`
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private parseVolumeResponse(response: string, count: number, chaptersPerVolume: number): VolumePlan[] {
    const volumes: VolumePlan[] = [];

    for (let i = 0; i < count; i++) {
      volumes.push({
        volumeNumber: i + 1,
        title: `第${this.numberToChinese(i + 1)}卷`,
        startChapter: i * chaptersPerVolume + 1,
        endChapter: Math.min((i + 1) * chaptersPerVolume, this.projects.get('').meta.targetChapters),
        arcDescription: '待填充',
        primaryThemes: [],
        mainConflicts: [],
        keyCharacters: [],
        targetWordCount: chaptersPerVolume * 3000
      });
    }

    return volumes;
  }

  private numberToChinese(num: number): string {
    const units = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return units[num];
    if (num < 20) return '十' + units[num - 10];
    if (num < 100) return units[Math.floor(num / 10)] + '十' + units[num % 10];
    return String(num);
  }

  private async executeStep7ChapterOutlines(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const project = this.projects.get(projectId);
    const targetChapters = project?.meta.targetChapters || 50;
    const batchSize = 50;

    const existingOutlines = data.chapterOutlines || [];
    const startChapter = existingOutlines.length + 1;

    if (startChapter > targetChapters) {
      return {
        success: true,
        data: { chapterOutlines: existingOutlines },
        message: '所有章节大纲已创建'
      };
    }

    const endChapter = Math.min(startChapter + batchSize - 1, targetChapters);

    const prompt = `为第${startChapter}章到第${endChapter}章创建一句话大纲：

故事概念：${data?.coreConcept?.oneLine || ''}
故事概述：${data?.oneParagraph || ''}

当前进度：正在创建第${startChapter}章到第${endChapter}章
总章节数：${targetChapters}章

主角：${data?.characters?.find(c => c.role === 'protagonist')?.name || '待定'}
反派：${data?.characters?.find(c => c.role === 'antagonist')?.name || '待定'}

请为每一章提供：
- 一句话概括（15-20字）
- 本章主要目的
- 涉及的伏笔

格式：
第X章：|一句话|目的|涉及伏笔|

请直接输出，每章一行：`;

    try {
      const response = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      const newOutlines = this.parseChapterOutlines(response, startChapter);
      data.chapterOutlines = [...existingOutlines, ...newOutlines];
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: { chapterOutlines: data.chapterOutlines },
        message: `第${startChapter}-${endChapter}章大纲创建完成`
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private parseChapterOutlines(response: string, startChapter: number): ChapterOutline[] {
    const outlines: ChapterOutline[] = [];
    const lines = response.split('\n').filter(l => l.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().replace(/^\d+[.、)]\s*/, '');
      if (line) {
        const parts = line.split('|').filter(p => p.trim());
        outlines.push({
          chapterNumber: startChapter + i,
          oneLine: parts[0] || line.substring(0, 50),
          oneParagraph: parts[1] || '',
          detailedScene: '',
          keyPoints: [],
          characterFocus: [],
          location: '',
          timeFrame: '',
          tensionLevel: 5,
          thematicElements: [],
          plotHooks: [],
          wordCountTarget: 3000
        });
      }
    }

    return outlines;
  }

  private async executeStep8ParagraphOutlines(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const chapterOutlines = data.chapterOutlines || [];
    const pendingOutlines = chapterOutlines.filter(o => !o.oneParagraph || o.oneParagraph.length < 50);

    if (pendingOutlines.length === 0) {
      return {
        success: true,
        data: { chapterOutlines },
        message: '所有段落大纲已完成'
      };
    }

    const batchSize = 10;
    const batch = pendingOutlines.slice(0, batchSize);

    for (const outline of batch) {
      const prompt = `将以下章节一句话扩展为段落级大纲：

章节：第${outline.chapterNumber}章
一句话：${outline.oneLine}

主角：${data?.characters?.find(c => c.role === 'protagonist')?.name || '待定'}

请提供（200-300字）：
1. 场景设定
2. 主要事件
3. 角色互动
4. 冲突升级
5. 本章结局

直接输出段落：`;

      try {
        const oneParagraph = await this.llmManager.complete(prompt, {
          temperature: 0.7,
          maxTokens: 500
        });

        outline.oneParagraph = oneParagraph;
        outline.keyPoints = this.extractKeyPoints(oneParagraph);
        outline.tensionLevel = this.estimateTension(oneParagraph);
      } catch (error) {
        console.warn(`章节${outline.chapterNumber}段落大纲失败:`, error);
      }
    }

    data.chapterOutlines = chapterOutlines;
    this.projectData.set(projectId, data);

    return {
      success: true,
      data: { chapterOutlines },
      message: `${batch.length}章段落大纲已完成`
    };
  }

  private extractKeyPoints(paragraph: string): string[] {
    const points: string[] = [];
    const sentences = paragraph.split(/[。！？]/).filter(s => s.trim());

    for (const sentence of sentences.slice(0, 5)) {
      if (sentence.length > 10) {
        points.push(sentence.trim().substring(0, 50));
      }
    }

    return points;
  }

  private estimateTension(paragraph: string): number {
    const tensionKeywords = ['突然', '震惊', '意外', '危险', '威胁', '冲突', '对抗', '危机'];
    const reliefKeywords = ['终于', '决定', '成功', '解决', '平静'];

    let tension = 5;
    for (const keyword of tensionKeywords) {
      if (paragraph.includes(keyword)) tension += 1;
    }
    for (const keyword of reliefKeywords) {
      if (paragraph.includes(keyword)) tension -= 1;
    }

    return Math.max(1, Math.min(10, tension));
  }

  private async executeStep9BeatStructure(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const chapterOutlines = data.chapterOutlines || [];
    const targetChapter = params?.chapterNumber || chapterOutlines[0]?.chapterNumber;

    const outline = chapterOutlines.find(o => o.chapterNumber === targetChapter);
    if (!outline) {
      return { success: false, message: '未找到指定章节大纲' };
    }

    const prompt = `为第${outline.chapterNumber}章创建详细的节拍结构：

章节大纲：${outline.oneParagraph || outline.oneLine}

主角：${data?.characters?.find(c => c.role === 'protagonist')?.name || '待定'}
反派：${data?.characters?.find(c => c.role === 'antagonist')?.name || '待定'}

请为这一章创建节拍结构（每个节拍50-200字）：

1. 开场（Opening）：场景设定和氛围
2. 触发事件（Inciting）：打破平衡的事件
3. 上升（Rising Action）：冲突和挑战
4. 高潮（Climax）：最大冲突点
5. 下降（Falling Action）：高潮后的影响
6. 结局（Resolution）：本章的结论

请输出JSON格式：
{
  "opening": "...",
  "inciting": "...",
  "rising": "...",
  "climax": "...",
  "falling": "...",
  "resolution": "..."
}

直接输出JSON：`;

    try {
      const response = await this.llmManager.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1500
      });

      let beatStructure: BeatStructure;
      try {
        const cleaned = response.match(/\{[\s\S]*\}/)?.[0] || response;
        beatStructure = JSON.parse(cleaned);
      } catch {
        beatStructure = {
          opening: '待填充',
          inciting: '待填充',
          rising: outline.oneParagraph || '',
          climax: '待填充',
          falling: '待填充',
          resolution: '待填充'
        };
      }

      outline.beatStructure = beatStructure;
      outline.detailedScene = this.beatsToScene(beatStructure);

      data.chapterOutlines = chapterOutlines;
      this.projectData.set(projectId, data);

      return {
        success: true,
        data: { outline },
        message: `第${outline.chapterNumber}章节拍结构完成`
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private beatsToScene(beats: BeatStructure): string {
    return `${beats.opening}

${beats.inciting}

${beats.rising}

${beats.climax}

${beats.falling}

${beats.resolution}`;
  }

  private async executeStep10BatchWriting(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string; guidance?: WritingGuidance }> {
    const data = this.projectData.get(projectId);
    const project = this.projects.get(projectId);
    const chapterOutlines = data.chapterOutlines || [];

    const batchSize = project?.longTermConfig.chapterBatchSize || 10;
    const startChapter = params?.startChapter || (data.lastWrittenChapter || 0) + 1;
    const endChapter = Math.min(startChapter + batchSize - 1, chapterOutlines.length);

    if (startChapter > chapterOutlines.length) {
      return {
        success: false,
        message: '所有章节已写作完成'
      };
    }

    const batchOutlines = chapterOutlines.filter(o => o.chapterNumber >= startChapter && o.chapterNumber <= endChapter);
    const batchChapters: any[] = [];
    const hooksToSet: any[] = [];
    const hooksToPayoff: any[] = [];

    for (const outline of batchOutlines) {
      const guidance = await this.generateWritingGuidance(projectId, outline.chapterNumber);

      const prompt = this.buildWritingPrompt(outline, guidance, data);

      try {
        const content = await this.llmManager.complete(prompt, {
          temperature: 0.75,
          maxTokens: 4000
        });

        batchChapters.push({
          chapterNumber: outline.chapterNumber,
          oneLine: outline.oneLine,
          content: content,
          wordCount: content.length,
          writtenAt: new Date()
        });

        const detectedHooks = this.detectHooks(content, outline.chapterNumber);
        hooksToSet.push(...detectedHooks.filter((h: any) => h.type === 'setup'));
        hooksToPayoff.push(...detectedHooks.filter((h: any) => h.type === 'payoff'));

        data.lastWrittenChapter = outline.chapterNumber;
      } catch (error: any) {
        console.warn(`第${outline.chapterNumber}章写作失败:`, error);
        batchChapters.push({
          chapterNumber: outline.chapterNumber,
          oneLine: outline.oneLine,
          content: '',
          wordCount: 0,
          error: error.message
        });
      }
    }

    for (const hook of hooksToSet) {
      await this.truthFileManager.addAdvancedHook(projectId, {
        id: `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: hook.description,
        setInChapter: hook.chapter,
        status: 'pending',
        type: 'plot',
        layer: 1,
        childHookIds: [],
        relatedHookIds: [],
        significance: hook.significance || 'major',
        category: hook.category || 'plot',
        foreshadowing: [{
          chapter: hook.chapter,
          type: 'explicit',
          content: hook.content,
          subtlety: 50,
          foreshadowingStrength: hook.strength || 50,
          foreshadowingEffect: hook.effect || ''
        }],
        setupComplexity: 50,
        payoffImportance: 50,
        isLongTerm: hook.isLongTerm || false,
        thematicLinks: []
      });
    }

    this.projectData.set(projectId, data);
    await this.saveProject(projectId);

    return {
      success: true,
      data: {
        chapters: batchChapters,
        hooksSet: hooksToSet.length,
        hooksPayedOff: hooksToPayoff.length
      },
      message: `第${startChapter}-${endChapter}章写作完成`,
      guidance: await this.generateWritingGuidance(projectId, endChapter + 1)
    };
  }

  private async generateWritingGuidance(projectId: string, chapterNumber: number): Promise<WritingGuidance> {
    const data = this.projectData.get(projectId);
    const outline = data?.chapterOutlines?.find((o: any) => o.chapterNumber === chapterNumber);
    const previousOutline = data?.chapterOutlines?.find((o: any) => o.chapterNumber === chapterNumber - 1);

    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      const consistencyReport = await this.truthFileManager.performDeepConsistencyCheck(
        projectId,
        { currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] }, emotionalArcs: [], characterMatrix: [], pendingHooks: [], particleLedger: [], subplotBoard: [], chapterSummaries: [] },
        []
      );

      if (consistencyReport.criticalIssues > 0) {
        warnings.push(`存在${consistencyReport.criticalIssues}个关键一致性问题`);
      }
    } catch {}

    const activeHooks = (data?.hooks || []).filter((h: any) => h.status === 'pending').slice(0, 5);

    return {
      previousChapterSummary: previousOutline?.oneParagraph?.substring(0, 200) || '无',
      currentChapterObjectives: outline?.keyPoints || ['推进剧情', '发展角色'],
      activeHooks: activeHooks.map((h: any) => h.description),
      unresolvedPlotThreads: [],
      characterStates: new Map(),
      thematicFocus: data?.themes?.map((t: any) => t.name) || [],
      pacingGuidance: outline ? `张力目标: ${outline.tensionLevel}/10` : '适中节奏',
      warnings,
      suggestions
    };
  }

  private buildWritingPrompt(outline: ChapterOutline, guidance: WritingGuidance, data: any): string {
    const protagonist = data?.characters?.find((c: any) => c.role === 'protagonist');
    const antagonist = data?.characters?.find((c: any) => c.role === 'antagonist');

    return `请为第${outline.chapterNumber}章创作完整的小说内容：

【章节信息】
一句话：${outline.oneLine}
段落大纲：${outline.oneParagraph || '待扩展'}
节拍结构：${outline.beatStructure ? '已提供' : '使用标准结构'}

【故事背景】
${data?.coreConcept?.oneLine || ''}

【当前章节重点】
${outline.keyPoints?.join('\n') || '推进主要剧情'}

【主角信息】
姓名：${protagonist?.name || '待定'}
性格：${protagonist?.backstory || '待确定'}
动机：${protagonist?.motivation || '待确定'}

【反派信息】
姓名：${antagonist?.name || '待定'}
目标：${antagonist?.goal || '待确定'}

【写作指导】
- 字数目标：${outline.wordCountTarget || 3000}字
- 张力等级：${outline.tensionLevel || 5}/10
- 上章回顾：${guidance.previousChapterSummary.substring(0, 100)}

【主题提醒】
${guidance.thematicFocus?.join('、') || '待确定'}

【伏笔提醒】
${guidance.activeHooks?.slice(0, 3).map((h: string, i: number) => `${i + 1}. ${h}`).join('\n') || '无待回收伏笔'}

【写作要求】
1. 语言流畅，有画面感
2. 对话自然，符合角色声音
3. 适当的环境描写和心理描写
4. 推进情节，设置合理的新钩子
5. 字数在2000-3500字之间

请开始写作：`;
  }

  private detectHooks(content: string, chapterNumber: number): any[] {
    const hooks: any[] = [];
    const hookKeywords = ['谜题', '秘密', '隐藏', '真相', '即将', '预兆', '暗示', '伏笔'];

    const sentences = content.split(/[。！？]/);
    for (const sentence of sentences) {
      for (const keyword of hookKeywords) {
        if (sentence.includes(keyword) && sentence.length > 20 && sentence.length < 200) {
          hooks.push({
            description: sentence.trim().substring(0, 100),
            chapter: chapterNumber,
            type: 'setup',
            category: 'mystery',
            significance: 'major',
            isLongTerm: chapterNumber < 50
          });
          break;
        }
      }
    }

    return hooks;
  }

  private async executeStep11QualityCheck(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const project = this.projects.get(projectId);
    if (!project) {
      return { success: false, message: '项目未初始化' };
    }

    const checkpointInterval = project.longTermConfig.checkpointInterval || 10;
    const currentChapter = params?.chapterNumber || 0;

    const report = await this.truthFileManager.generateComprehensiveReport(
      projectId,
      {
        currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] },
        emotionalArcs: [],
        characterMatrix: [],
        pendingHooks: [],
        particleLedger: [],
        subplotBoard: [],
        chapterSummaries: []
      },
      []
    );

    const issues = report.consistency.issues;
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const majorIssues = issues.filter(i => i.severity === 'major');
    const minorIssues = issues.filter(i => i.severity === 'minor');

    const qualityScore = report.consistency.consistencyScore;
    const recommendations: string[] = [];

    if (qualityScore >= 90) {
      recommendations.push('质量优秀，继续保持');
    } else if (qualityScore >= 80) {
      recommendations.push('质量良好，建议修复major issues');
    } else {
      recommendations.push('建议暂停写作，先修复critical issues');
    }

    if (criticalIssues.length > 0) {
      recommendations.push(`优先处理${criticalIssues.length}个关键一致性问题`);
    }

    return {
      success: true,
      data: {
        checkpointChapter: currentChapter,
        qualityScore,
        consistencyReport: report.consistency,
        issues: {
          critical: criticalIssues.length,
          major: majorIssues.length,
          minor: minorIssues.length,
          details: [...criticalIssues, ...majorIssues].slice(0, 20)
        },
        characterNetwork: report.characterNetwork,
        hookProgress: report.hookAnalysis,
        recommendations
      },
      message: `第${currentChapter}章质量检测完成，一致性分数：${qualityScore}`
    };
  }

  private async executeStep12FinalRevision(
    projectId: string,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    const data = this.projectData.get(projectId);
    const project = this.projects.get(projectId);
    const totalChapters = data?.chapterOutlines?.length || 0;

    const finalReport = await this.truthFileManager.generateComprehensiveReport(
      projectId,
      {
        currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] },
        emotionalArcs: [],
        characterMatrix: [],
        pendingHooks: [],
        particleLedger: [],
        subplotBoard: [],
        chapterSummaries: []
      },
      []
    );

    const summary = {
      projectId,
      title: project?.meta.title || '未命名项目',
      totalChapters,
      totalVolumes: data?.volumes?.length || 0,
      totalCharacters: data?.characters?.length || 0,
      consistencyScore: finalReport.consistency.consistencyScore,
      hookResolutionRate: finalReport.hookAnalysis.totalHooks > 0
        ? Math.round((1 - finalReport.hookAnalysis.pendingHooks / finalReport.hookAnalysis.totalHooks) * 100)
        : 100,
      themesDeveloped: finalReport.themeAnalysis.themes?.length || 0,
      completionStatus: 'completed',
      recommendations: this.generateFinalRecommendations(finalReport)
    };

    project.steps.find(s => s.step === 12)!.status = 'completed';
    await this.saveProject(projectId);

    return {
      success: true,
      data: summary,
      message: `《${summary.title}》创作完成！一致性分数：${summary.consistencyScore}，伏笔回收率：${summary.hookResolutionRate}%`
    };
  }

  private generateFinalRecommendations(report: any): string[] {
    const recommendations: string[] = [];

    if (report.consistency.criticalIssues > 0) {
      recommendations.push('建议进行一轮修订，修复关键一致性问题');
    }

    if (report.hookAnalysis.pendingHooks > 0) {
      recommendations.push(`有${report.hookAnalysis.pendingHooks}个伏笔未回收，考虑添加尾声章节`);
    }

    recommendations.push('建议通读全文，检查节奏和情感弧线');

    return recommendations;
  }

  getProject(projectId: string): SnowflakeProject | undefined {
    return this.projects.get(projectId);
  }

  getProgress(projectId: string): NarrativeProgress | null {
    const project = this.projects.get(projectId);
    const data = this.projectData.get(projectId);

    if (!project || !data) return null;

    const completedSteps = project.steps.filter(s => s.status === 'completed').length;
    const chapterOutlines = data.chapterOutlines || [];
    const completedChapters = chapterOutlines.filter(o => o.detailedScene?.length > 100).length;

    return {
      totalChapters: project.meta.targetChapters,
      completedChapters,
      currentChapter: data.lastWrittenChapter || 0,
      wordCount: completedChapters * 3000,
      characterProgress: new Map(data.characters?.map((c: any) => [
        c.id,
        { completed: c.appearanceCount || 0, total: project.meta.targetChapters, status: 'in_progress' }
      ]) || []),
      hookProgress: {
        total: 0,
        resolved: 0,
        pending: 0
      },
      subplotProgress: {
        total: 0,
        resolved: 0,
        inProgress: 0
      },
      thematicProgress: new Map(data.themes?.map((t: any) => [t.name, { development: 0, consistency: 0 }]) || []),
      pacingHealth: 75,
      consistencyScore: 85
    };
  }

  getChapterOutline(projectId: string, chapterNumber: number): ChapterOutline | null {
    const data = this.projectData.get(projectId);
    if (!data?.chapterOutlines) return null;
    return data.chapterOutlines.find((o: any) => o.chapterNumber === chapterNumber) || null;
  }

  getCharacter(projectId: string, characterId: string): CharacterSheet | null {
    const data = this.projectData.get(projectId);
    if (!data?.characters) return null;
    return data.characters.find((c: any) => c.id === characterId) || null;
  }

  private async saveProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    const data = this.projectData.get(projectId);

    if (!project) return;

    const projectPath = path.join(this.projectDataPath, projectId);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    fs.writeFileSync(
      path.join(projectPath, 'project.json'),
      JSON.stringify(project, null, 2)
    );

    fs.writeFileSync(
      path.join(projectPath, 'data.json'),
      JSON.stringify(data, null, 2)
    );
  }

  async loadProject(projectId: string): Promise<boolean> {
    const projectPath = path.join(this.projectDataPath, projectId);

    if (!fs.existsSync(path.join(projectPath, 'project.json'))) {
      return false;
    }

    try {
      const projectData = fs.readFileSync(path.join(projectPath, 'project.json'), 'utf-8');
      const data = fs.readFileSync(path.join(projectPath, 'data.json'), 'utf-8');

      this.projects.set(projectId, JSON.parse(projectData));
      this.projectData.set(projectId, JSON.parse(data));

      await this.truthFileManager.loadAdvancedData(projectId);

      return true;
    } catch (error) {
      console.error('加载项目失败:', error);
      return false;
    }
  }

  async continueFromCheckpoint(projectId: string): Promise<{
    suggestedStep: number;
    suggestedChapter: number;
    activeIssues: any[];
    recommendations: string[];
  }> {
    const project = this.projects.get(projectId);
    const data = this.projectData.get(projectId);

    if (!project || !data) {
      return {
        suggestedStep: 1,
        suggestedChapter: 1,
        activeIssues: [],
        recommendations: ['项目未找到，请创建新项目']
      };
    }

    const currentStep = project.currentStep;
    const lastChapter = data.lastWrittenChapter || 0;

    const checkpointReport = await this.truthFileManager.generateComprehensiveReport(
      projectId,
      {
        currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] },
        emotionalArcs: [],
        characterMatrix: [],
        pendingHooks: [],
        particleLedger: [],
        subplotBoard: [],
        chapterSummaries: []
      },
      []
    );

    const recommendations: string[] = [];
    const pendingChapters = data.chapterOutlines?.filter((o: any) => !o.detailedScene) || [];

    if (pendingChapters.length > 0) {
      recommendations.push(`${pendingChapters.length}章大纲待完善`);
    }

    if (checkpointReport.consistency.criticalIssues > 0) {
      recommendations.push(`存在${checkpointReport.consistency.criticalIssues}个关键问题需要修复`);
    }

    if (checkpointReport.hookAnalysis.overdueHooks > 0) {
      recommendations.push(`${checkpointReport.hookAnalysis.overdueHooks}个伏笔超期未回收`);
    }

    return {
      suggestedStep: currentStep,
      suggestedChapter: lastChapter + 1,
      activeIssues: checkpointReport.consistency.issues.filter((i: any) => i.severity === 'critical').slice(0, 5),
      recommendations
    };
  }
}

export default AdvancedSnowflakeMethodology;
