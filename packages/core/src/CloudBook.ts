/**
 * Cloud Book - 写作引擎核心
 * 整合所有功能的核心写作系统
 */

import { 
  NovelProject, 
  Chapter, 
  WritingTask,
  TruthFiles,
  LLMConfig,
  ModelRoute,
  AuditConfig,
  AntiDetectionConfig
} from '../types';
import { NovelParser, ParseResult } from './NovelParser/NovelParser';
import { ImitationEngine, ImitationConfig, GenerationContext } from './ImitationEngine/ImitationEngine';
import { AntiDetectionEngine, DetectionResult } from './AntiDetection/AntiDetectionEngine';
import { LLMManager } from './LLMProvider/LLMManager';
import { AIAuditEngine } from './AIAudit/AIAuditEngine';
import { TruthFileManager } from './TruthFiles/TruthFileManager';
import { WritingPipeline } from './WritingEngine/WritingPipeline';
import { ContextManager } from './ContextManager/ContextManager';
import * as fs from 'fs';
import * as path from 'path';

export interface CloudBookConfig {
  llmConfigs: LLMConfig[];
  modelRoutes: ModelRoute[];
  auditConfig: AuditConfig;
  antiDetectionConfig: AntiDetectionConfig;
  storagePath?: string;
}

export interface WritingOptions {
  targetWordCount?: number;
  styleGuidance?: string;
  chapterGuidance?: string;
  autoAudit?: boolean;
  autoHumanize?: boolean;
  parallelCount?: number;
}

export class CloudBook {
  private config: CloudBookConfig;
  private llmManager: LLMManager;
  private parser: NovelParser;
  private auditEngine: AIAuditEngine;
  private antiDetectionEngine: AntiDetectionEngine;
  private truthFileManager: TruthFileManager;
  private contextManager: ContextManager;
  private writingPipeline: WritingPipeline;
  
  private currentProject?: NovelProject;
  private projects: Map<string, NovelProject> = new Map();

  constructor(config: CloudBookConfig) {
    this.config = config;
    
    // 初始化 LLM 管理器
    this.llmManager = new LLMManager();
    for (const llmConfig of config.llmConfigs) {
      this.llmManager.addConfig(llmConfig);
    }
    this.llmManager.setRoutes(config.modelRoutes);
    
    // 初始化其他模块
    this.parser = new NovelParser({
      encoding: 'utf-8',
      extractCharacters: true,
      extractWorldSettings: true,
      analyzeStyle: true
    });
    
    this.auditEngine = new AIAuditEngine(config.auditConfig);
    this.antiDetectionEngine = new AntiDetectionEngine(config.antiDetectionConfig);
    this.truthFileManager = new TruthFileManager();
    this.contextManager = new ContextManager();
    this.writingPipeline = new WritingPipeline(
      this.llmManager,
      this.auditEngine,
      this.antiDetectionEngine
    );
  }

  /**
   * 创建新项目
   */
  async createProject(
    title: string,
    genre: any,
    writingMode: any = 'original'
  ): Promise<NovelProject> {
    const project: NovelProject = {
      id: this.generateId(),
      title,
      genre,
      literaryGenre: 'novel',
      writingMode,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: [],
      worldSetting: {
        id: this.generateId(),
        name: title,
        genre
      }
    };
    
    this.projects.set(project.id, project);
    this.currentProject = project;
    
    // 初始化真相文件
    await this.truthFileManager.initialize(project.id);
    
    return project;
  }

  /**
   * 导入小说进行解析
   */
  async importNovel(filePath: string): Promise<ParseResult> {
    return this.parser.parse(filePath);
  }

  /**
   * 基于解析结果创建仿写项目
   */
  async createImitationProject(
    parseResult: ParseResult,
    mode: any,
    imitationLevel: number = 70
  ): Promise<NovelProject> {
    const config: ImitationConfig = {
      sourceParseResult: parseResult,
      mode,
      imitationLevel
    };
    
    const engine = new ImitationEngine(config);
    engine.setLLMProvider(this.llmManager);
    
    const project: NovelProject = {
      id: this.generateId(),
      title: `${parseResult.title} - 仿写`,
      genre: parseResult.genre || 'fantasy',
      literaryGenre: 'novel',
      writingMode: mode,
      sourceNovel: parseResult.title,
      worldSetting: {
        id: this.generateId(),
        name: parseResult.title,
        genre: parseResult.genre || 'fantasy'
      },
      styleFingerprint: parseResult.styleFingerprint,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: parseResult.characters.map(c => ({
        id: this.generateId(),
        name: c.name,
        aliases: c.aliases,
        background: c.description
      }))
    };
    
    this.projects.set(project.id, project);
    this.currentProject = project;
    
    // 初始化真相文件
    await this.truthFileManager.initialize(project.id);
    
    return project;
  }

  /**
   * 设置世界观
   */
  setWorldSetting(projectId: string, worldSetting: any): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.worldSetting = worldSetting;
      project.updatedAt = new Date();
    }
  }

  /**
   * 添加角色
   */
  addCharacter(projectId: string, character: any): void {
    const project = this.projects.get(projectId);
    if (project) {
      if (!project.characters) project.characters = [];
      project.characters.push({
        id: this.generateId(),
        ...character
      });
      project.updatedAt = new Date();
    }
  }

  /**
   * 生成章节
   */
  async generateChapter(
    projectId: string,
    chapterNumber: number,
    options?: WritingOptions
  ): Promise<Chapter> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    // 获取上下文
    const context = await this.buildContext(project, chapterNumber);
    
    // 确定模式
    if (project.writingMode === 'imitation' || 
        project.writingMode === 'derivative' || 
        project.writingMode === 'fanfic') {
      const imitationEngine = new ImitationEngine({
        sourceParseResult: {
          title: project.sourceNovel || '',
          estimatedWordCount: 0,
          chapters: [],
          characters: project.characters || [],
          worldSettings: {
            locations: [],
            factions: [],
            items: [],
            timeline: []
          },
          writingPatterns: [],
          styleFingerprint: project.styleFingerprint || {
            sentenceLengthDistribution: [],
            wordFrequency: {},
            punctuationPattern: '',
            dialogueRatio: 0.3,
            descriptionDensity: 0.1,
            narrativeVoice: 'third_person',
            tense: 'present',
            emotionalWords: [],
            signaturePhrases: [],
            tabooWords: []
          }
        },
        mode: project.writingMode
      });
      imitationEngine.setLLMProvider(this.llmManager);
      
      // 生成大纲
      const outline = await imitationEngine.generateOutline(
        chapterNumber,
        project.worldSetting!,
        project.characters || [],
        project.chapters?.[chapterNumber - 2]?.summary
      );
      
      // 生成正文
      const content = await imitationEngine.generateImitation(context);
      
      // 审计
      let auditResult;
      if (options?.autoAudit !== false) {
        auditResult = await this.auditEngine.audit(
          content,
          await this.truthFileManager.getTruthFiles(projectId)
        );
      }
      
      // 去AI味
      let finalContent = content;
      if (options?.autoHumanize) {
        finalContent = await this.antiDetectionEngine.humanize(content, this.llmManager);
      }
      
      const chapter: Chapter = {
        id: this.generateId(),
        number: chapterNumber,
        title: `第${this.toChineseNumber(chapterNumber)}章`,
        status: auditResult?.passed ? 'draft' : 'reviewing',
        wordCount: this.countWords(finalContent),
        outline,
        content: finalContent,
        auditResult,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      project.chapters?.push(chapter);
      project.updatedAt = new Date();
      
      // 更新真相文件
      await this.truthFileManager.updateChapterSummary(projectId, chapter);
      
      return chapter;
    }
    
    // 原创模式
    return this.writingPipeline.generateChapter(project, chapterNumber, options);
  }

  /**
   * 批量生成章节
   */
  async batchGenerateChapters(
    projectId: string,
    startChapter: number,
    count: number,
    options?: WritingOptions
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    const parallelCount = options?.parallelCount || 3;
    
    for (let i = 0; i < count; i += parallelCount) {
      const batch = Math.min(parallelCount, count - i);
      const promises = [];
      
      for (let j = 0; j < batch; j++) {
        promises.push(
          this.generateChapter(projectId, startChapter + i + j, options)
            .catch(err => ({ error: err.message } as any))
        );
      }
      
      const results = await Promise.all(promises);
      chapters.push(...results.filter(r => !r.error));
    }
    
    return chapters;
  }

  /**
   * 审计章节
   */
  async auditChapter(projectId: string, chapterId: string): Promise<any> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const chapter = project.chapters?.find(c => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');
    
    const truthFiles = await this.truthFileManager.getTruthFiles(projectId);
    return this.auditEngine.audit(chapter.content!, truthFiles);
  }

  /**
   * 修订章节
   */
  async reviseChapter(
    projectId: string,
    chapterId: string,
    auditResult?: any
  ): Promise<Chapter> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const chapter = project.chapters?.find(c => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');
    
    // 使用管线进行修订
    const revisedContent = await this.writingPipeline.reviseChapter(
      chapter.content!,
      auditResult || chapter.auditResult,
      await this.truthFileManager.getTruthFiles(projectId)
    );
    
    chapter.content = revisedContent;
    chapter.status = 'draft';
    chapter.auditResult = undefined;
    chapter.updatedAt = new Date();
    
    return chapter;
  }

  /**
   * 检测AI痕迹
   */
  detectAI(text: string): DetectionResult {
    return this.antiDetectionEngine.detectAI(text);
  }

  /**
   * 去AI味处理
   */
  async humanize(text: string): Promise<string> {
    return this.antiDetectionEngine.humanize(text, this.llmManager);
  }

  /**
   * 构建上下文
   */
  private async buildContext(
    project: NovelProject,
    chapterNumber: number
  ): Promise<GenerationContext> {
    const truthFiles = await this.truthFileManager.getTruthFiles(project.id);
    
    return {
      currentChapter: chapterNumber,
      styleFingerprint: project.styleFingerprint || {
        sentenceLengthDistribution: [],
        wordFrequency: {},
        punctuationPattern: '',
        dialogueRatio: 0.3,
        descriptionDensity: 0.1,
        narrativeVoice: 'third_person',
        tense: 'present',
        emotionalWords: [],
        signaturePhrases: [],
        tabooWords: []
      },
      truthFiles,
      characters: project.characters || [],
      worldSetting: project.worldSetting || {
        id: '',
        name: '',
        genre: 'fantasy'
      },
      previousChapterSummary: project.chapters?.[chapterNumber - 2]?.summary
    };
  }

  /**
   * 保存项目
   */
  async saveProject(projectId: string, storagePath?: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const path = storagePath || this.config.storagePath || './projects';
    const filePath = path.join(path, `${projectId}.json`);
    
    // 确保目录存在
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }

  /**
   * 加载项目
   */
  async loadProject(projectId: string, storagePath?: string): Promise<NovelProject> {
    const path = storagePath || this.config.storagePath || './projects';
    const filePath = path.join(path, `${projectId}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Project not found');
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const project = JSON.parse(data) as NovelProject;
    
    this.projects.set(project.id, project);
    this.currentProject = project;
    
    return project;
  }

  /**
   * 获取项目
   */
  getProject(projectId: string): NovelProject | undefined {
    return this.projects.get(projectId);
  }

  /**
   * 获取所有项目
   */
  getAllProjects(): NovelProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * 获取当前项目
   */
  getCurrentProject(): NovelProject | undefined {
    return this.currentProject;
  }

  /**
   * 设置当前项目
   */
  setCurrentProject(projectId: string): void {
    this.currentProject = this.projects.get(projectId);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 数字转中文
   */
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

  /**
   * 统计字数
   */
  private countWords(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 添加模型配置
   */
  addModel(config: LLMConfig): void {
    this.llmManager.addConfig(config);
    if (!this.config.llmConfigs.find(c => c.name === config.name)) {
      this.config.llmConfigs.push(config);
    }
  }

  /**
   * 更新模型路由
   */
  updateRoutes(routes: ModelRoute[]): void {
    this.llmManager.setRoutes(routes);
    this.config.modelRoutes = routes;
  }

  /**
   * 导出项目
   */
  async exportProject(
    projectId: string,
    format: 'txt' | 'md' | 'json',
    storagePath?: string
  ): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const path = storagePath || this.config.storagePath || './exports';
    
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    
    const fileName = `${project.title}.${format}`;
    const filePath = path.join(path, fileName);
    
    let content = '';
    
    if (format === 'json') {
      content = JSON.stringify(project, null, 2);
    } else if (format === 'md') {
      content = this.projectToMarkdown(project);
    } else {
      content = this.projectToText(project);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return filePath;
  }

  private projectToMarkdown(project: NovelProject): string {
    let md = `# ${project.title}\n\n`;
    
    if (project.subtitle) md += `## ${project.subtitle}\n\n`;
    
    md += `**题材**: ${project.genre}\n`;
    md += `**类型**: ${project.literaryGenre}\n\n`;
    
    if (project.worldSetting) {
      md += `## 世界设定\n\n`;
      md += `${project.worldSetting.powerSystem || '无特殊力量体系'}\n\n`;
    }
    
    if (project.characters && project.characters.length > 0) {
      md += `## 角色\n\n`;
      for (const char of project.characters) {
        md += `### ${char.name}\n\n`;
        if (char.personality) md += `${char.personality}\n\n`;
      }
    }
    
    if (project.chapters) {
      md += `## 正文\n\n`;
      for (const chapter of project.chapters) {
        md += `### ${chapter.title}\n\n`;
        md += `${chapter.content}\n\n`;
      }
    }
    
    return md;
  }

  private projectToText(project: NovelProject): string {
    let text = `${project.title}\n\n`;
    
    for (const chapter of project.chapters || []) {
      text += `${chapter.title}\n\n`;
      text += `${chapter.content}\n\n`;
    }
    
    return text;
  }
}

export default CloudBook;
