/**
 * Cloud Book - 全能AI小说创作引擎
 * 完全原创，整合所有创作功能
 */

import {
  NovelProject,
  Chapter,
  TruthFiles,
  LLMConfig,
  ModelRoute,
  AuditConfig,
  AntiDetectionConfig,
  Genre
} from './types';

import { NovelParser, ParseResult } from './modules/NovelParser/NovelParser';
import { ImitationEngine, ImitationConfig, GenerationContext } from './modules/ImitationEngine/ImitationEngine';
import { AntiDetectionEngine, DetectionResult } from './modules/AntiDetection/AntiDetectionEngine';
import { LLMManager } from './modules/LLMProvider/LLMManager';
import { AIAuditEngine } from './modules/AIAudit/AIAuditEngine';
import { TruthFileManager } from './modules/TruthFiles/TruthFileManager';
import { WritingPipeline } from './modules/WritingEngine/WritingPipeline';
import { ContextManager } from './modules/ContextManager/ContextManager';

import { WorldInfoManager } from './modules/WorldInfo/WorldInfoManager';
import { MemoryManager } from './modules/Memory/MemoryManager';
import { AutoDirector, DirectorConfig } from './modules/AutoDirector/AutoDirector';
import { CreativeHub, RAGDocument } from './modules/CreativeHub/CreativeHub';
import { CardManager } from './modules/Card/CardManager';
import { KnowledgeGraphManager } from './modules/KnowledgeGraph/KnowledgeGraphManager';
import { AgentSystem, AgentTask, AgentResponse } from './modules/AgentSystem/AgentSystem';
import { DaemonService, ScheduledTask, Notification } from './modules/DaemonService/DaemonService';
import { SevenStepMethodology, StepResult } from './modules/SevenStepMethodology/SevenStepMethodology';
import { GenreConfigManager, GenreTemplate } from './modules/GenreConfig/GenreConfigManager';
import { PluginSystem } from './modules/PluginSystem/PluginSystem';
import { CoverGenerator, CoverDesign } from './modules/CoverGenerator/CoverGenerator';
import { MindMapGenerator, MindMapData } from './modules/MindMapGenerator/MindMapGenerator';
import { TrendAnalyzer, TrendReport, CompetitorAnalysis } from './modules/TrendAnalyzer/TrendAnalyzer';
import { I18nManager } from './modules/I18nManager/I18nManager';
import { GlobalLiteraryConfig } from './modules/GlobalLiterary/GlobalLiteraryConfig';
import { LocalAPIServer, OfflineLLMManager, APIKeyConfig } from './modules/LocalAPI/LocalAPIServer';
import { NetworkManager } from './modules/NetworkManager/NetworkManager';
import { CacheManager, MultiLevelCache } from './modules/CacheManager/CacheManager';
import { VersionHistoryManager } from './modules/VersionHistory/VersionHistoryManager';
import { LocalStorage, ProjectData, ChapterData, CardData } from './modules/LocalStorage/LocalStorage';

import * as fs from 'fs';
import * as path from 'path';

export interface CloudBookConfig {
  llmConfigs: LLMConfig[];
  modelRoutes: ModelRoute[];
  auditConfig: AuditConfig;
  antiDetectionConfig: AntiDetectionConfig;
  storagePath?: string;
  daemonConfig?: {
    enabled: boolean;
    intervalMinutes?: number;
  };
  i18nConfig?: {
    primaryLanguage?: string;
    fallbackLanguage?: string;
    autoDetect?: boolean;
  };
  connectionMode?: 'online' | 'offline' | 'hybrid';
  localAPIConfig?: {
    port?: number;
    apiKeys?: APIKeyConfig[];
  };
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

  private worldInfoManager: WorldInfoManager;
  private memoryManager: MemoryManager;
  private autoDirector: AutoDirector;
  private creativeHub: CreativeHub;
  private cardManager: CardManager;
  private knowledgeGraphManager: KnowledgeGraphManager;
  private agentSystem: AgentSystem;
  private daemonService?: DaemonService;
  private sevenStepMethodology: SevenStepMethodology;
  private genreConfigManager: GenreConfigManager;
  private pluginSystem: PluginSystem;
  private coverGenerator: CoverGenerator;
  private mindMapGenerator: MindMapGenerator;
  private trendAnalyzer: TrendAnalyzer;

  private i18nManager: I18nManager;
  private globalLiteraryConfig: GlobalLiteraryConfig;
  private localAPIServer?: LocalAPIServer;
  private offlineLLMManager?: OfflineLLMManager;
  private networkManager: NetworkManager;
  private cacheManager: CacheManager;
  private versionHistoryManager: VersionHistoryManager;
  private localStorage: LocalStorage;

  private currentProject?: NovelProject;
  private projects: Map<string, NovelProject> = new Map();

  constructor(config: CloudBookConfig) {
    this.config = config;

    this.llmManager = new LLMManager();
    for (const llmConfig of config.llmConfigs) {
      this.llmManager.addConfig(llmConfig);
    }
    this.llmManager.setRoutes(config.modelRoutes);

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

    this.worldInfoManager = new WorldInfoManager(config.storagePath + '/worldinfo');
    this.memoryManager = new MemoryManager(config.storagePath + '/memory');
    this.autoDirector = new AutoDirector(this.llmManager);
    this.creativeHub = new CreativeHub(this.llmManager, config.storagePath + '/creativehub');
    this.cardManager = new CardManager(config.storagePath + '/cards');
    this.knowledgeGraphManager = new KnowledgeGraphManager(config.storagePath + '/knowledgegraph');
    this.agentSystem = new AgentSystem(this.llmManager, this.auditEngine);
    this.sevenStepMethodology = new SevenStepMethodology(this.llmManager);
    this.genreConfigManager = new GenreConfigManager();
    this.pluginSystem = new PluginSystem(config.storagePath + '/plugins');
    this.coverGenerator = new CoverGenerator(this.llmManager);
    this.mindMapGenerator = new MindMapGenerator();
    this.trendAnalyzer = new TrendAnalyzer(this.llmManager);

    this.i18nManager = new I18nManager(config.i18nConfig?.primaryLanguage as any || 'zh-CN');
    this.globalLiteraryConfig = new GlobalLiteraryConfig();
    this.networkManager = new NetworkManager();
    this.cacheManager = new CacheManager({ storageKey: 'cloudbook_cache', maxSize: 1000, ttl: 3600000 });
    this.versionHistoryManager = new VersionHistoryManager(config.storagePath + '/versioning');
    this.localStorage = new LocalStorage({ basePath: config.storagePath || './cloud-book-data' });

    if (config.connectionMode === 'offline' || config.connectionMode === 'hybrid') {
      this.initializeOfflineMode(config.localAPIConfig);
    }

    if (config.daemonConfig?.enabled) {
      this.daemonService = new DaemonService(
        {
          enabled: true,
          intervalMinutes: config.daemonConfig.intervalMinutes || 5,
          notifications: {},
          autoRetry: true,
          maxRetries: 3
        },
        this.llmManager,
        config.storagePath + '/daemon'
      );
    }
  }

  private async initializeOfflineMode(config?: { port?: number; apiKeys?: APIKeyConfig[] }): Promise<void> {
    if (config?.apiKeys && config.apiKeys.length > 0) {
      this.offlineLLMManager = new OfflineLLMManager(config.apiKeys);
      await this.offlineLLMManager.initializeOfflineServer(config.port || 8080);
    }
  }

  // ============================================
  // 多语言和本地化功能
  // ============================================

  setLanguage(language: string): void {
    this.i18nManager.setLocale(language as any);
  }

  getLanguage(): string {
    return this.i18nManager.getLocale();
  }

  detectLanguage(text: string): { language: string; confidence: number } {
    const locale = this.i18nManager.detectSystemLocale();
    return { language: locale, confidence: 1.0 };
  }

  async checkGrammar(text: string): Promise<any> {
    return { errors: [], suggestions: [] };
  }

  getSupportedLanguages(): any[] {
    return this.i18nManager.getAvailableLocales();
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.i18nManager.t(key, params);
  }

  // ============================================
  // 全球文学功能
  // ============================================

  getGlobalGenreConfig(genre: Genre): any {
    return this.globalLiteraryConfig.getGenreConfig(genre);
  }

  getGlobalGenres(): any[] {
    return this.globalLiteraryConfig.getAllGenres();
  }

  searchGenres(query: string, language?: string): any[] {
    return this.globalLiteraryConfig.searchGenres(query, (language as any) || this.i18nManager.getLocale());
  }

  // ============================================
  // 网络和缓存功能
  // ============================================

  async getNetworkStatus(): Promise<any> {
    return this.networkManager.getStatus();
  }

  async checkConnection(): Promise<boolean> {
    return this.networkManager.checkConnection();
  }

  onNetworkChange(callback: (status: any) => void): () => void {
    return this.networkManager.onStatusChange(callback);
  }

  async getCacheStats(): Promise<any> {
    return this.cacheManager.getStats();
  }

  clearCache(): void {
    this.cacheManager.clear();
  }

  // ============================================
  // 版本历史功能
  // ============================================

  async createVersion(projectId: string, content: string, summary?: string): Promise<any> {
    return this.versionHistoryManager.createVersion(projectId, content, { summary });
  }

  async getVersionHistory(projectId: string, limit?: number): Promise<any[]> {
    return this.versionHistoryManager.getVersionHistory(projectId, { limit });
  }

  async restoreVersion(projectId: string, versionId: string): Promise<any> {
    return this.versionHistoryManager.restoreVersion(projectId, versionId);
  }

  async createBranch(projectId: string, name: string, description?: string): Promise<any> {
    return this.versionHistoryManager.createBranch(projectId, name, description);
  }

  async compareVersions(projectId: string, v1: string, v2: string): Promise<any[]> {
    return this.versionHistoryManager.compareVersions(projectId, v1, v2);
  }

  // ============================================
  // 项目管理 - 基础功能
  // ============================================

  async createProject(
    title: string,
    genre: Genre,
    writingMode: 'original' | 'imitation' | 'derivative' | 'fanfic' = 'original'
  ): Promise<NovelProject> {
    // 使用 LocalStorage 持久化
    const projectData = await this.localStorage.createProject({
      title,
      genre: genre as string,
      creationMode: writingMode,
      language: this.i18nManager.getLocale()
    });

    const project: NovelProject = {
      id: projectData.id,
      title,
      genre,
      literaryGenre: 'novel',
      writingMode,
      status: 'planning',
      createdAt: new Date(projectData.createdAt),
      updatedAt: new Date(projectData.updatedAt),
      chapters: [],
      characters: [],
      worldSetting: {
        id: this.generateId(),
        name: title,
        genre,
        literaryGenre: 'novel'
      }
    };

    this.projects.set(project.id, project);
    this.currentProject = project;

    await this.worldInfoManager.initialize(project.id);
    await this.memoryManager.initialize(project.id);
    await this.cardManager.initialize(project.id);
    await this.knowledgeGraphManager.initialize(project.id);
    await this.truthFileManager.initialize(project.id);
    await this.creativeHub.createSession(project.id);
    await this.sevenStepMethodology.initializeProject(project.id);

    project.genreConfig = await this.genreConfigManager.createProjectConfig(genre);

    return project;
  }

  async importNovel(filePath: string): Promise<ParseResult> {
    return this.parser.parse(filePath);
  }

  async listProjects(): Promise<ProjectData[]> {
    return this.localStorage.listProjects();
  }

  async loadProject(projectId: string): Promise<NovelProject | null> {
    const projectData = await this.localStorage.getProject(projectId);
    if (!projectData) {
      return null;
    }

    const project: NovelProject = {
      id: projectData.id,
      title: projectData.title,
      genre: projectData.genre as Genre,
      literaryGenre: 'novel',
      writingMode: projectData.creationMode as any,
      status: 'writing',
      createdAt: new Date(projectData.createdAt),
      updatedAt: new Date(projectData.updatedAt),
      chapters: projectData.chapters.map((c: any) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        content: c.content,
        wordCount: c.wordCount,
        status: c.status,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      })),
      characters: [],
      worldSetting: projectData.settings?.worldSettings || {
        id: this.generateId(),
        name: projectData.title,
        genre: projectData.genre as Genre,
        literaryGenre: 'novel'
      }
    };

    this.projects.set(project.id, project);
    this.currentProject = project;

    await this.worldInfoManager.initialize(project.id);
    await this.memoryManager.initialize(project.id);
    await this.cardManager.initialize(project.id);
    await this.knowledgeGraphManager.initialize(project.id);
    await this.truthFileManager.initialize(project.id);
    await this.creativeHub.createSession(project.id);

    return project;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    this.projects.delete(projectId);
    return this.localStorage.deleteProject(projectId);
  }

  async exportChapter(projectId: string, chapterId: string, format: 'txt' | 'md'): Promise<string | null> {
    return this.localStorage.exportChapter(projectId, chapterId, format);
  }

  async createImitationProject(
    parseResult: ParseResult,
    mode: 'imitation' | 'derivative' | 'fanfic',
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
      title: `${parseResult.title} - ${mode === 'imitation' ? '仿写' : mode === 'derivative' ? '二创' : '同人'}`,
      genre: parseResult.genre || 'fantasy',
      literaryGenre: 'novel',
      writingMode: mode,
      sourceNovel: parseResult.title,
      worldSetting: {
        id: this.generateId(),
        name: parseResult.title,
        genre: parseResult.genre || 'fantasy',
        literaryGenre: parseResult.literaryGenre || 'novel'
      },
      styleFingerprint: parseResult.styleFingerprint,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: parseResult.characters.map((c: any) => ({
        id: this.generateId(),
        name: c.name,
        aliases: c.aliases,
        background: c.description
      }))
    };

    this.projects.set(project.id, project);
    this.currentProject = project;

    await this.worldInfoManager.initialize(project.id);
    await this.memoryManager.initialize(project.id);
    await this.cardManager.initialize(project.id);
    await this.knowledgeGraphManager.initialize(project.id);
    await this.truthFileManager.initialize(project.id);
    await this.sevenStepMethodology.initializeProject(project.id);

    return project;
  }

  // ============================================
  // 世界信息管理
  // ============================================

  async addWorldInfo(projectId: string, info: { name: string; keywords: string[]; content: string; depth?: number }) {
    return this.worldInfoManager.addWorldInfo(projectId, info);
  }

  async getWorldInfo(projectId: string, keywords?: string[]) {
    return this.worldInfoManager.getWorldInfo(projectId, { keywords });
  }

  async buildWorldInfoContext(projectId: string, context: string): Promise<string> {
    return this.worldInfoManager.buildContextPrompt(projectId, context);
  }

  // ============================================
  // Memory 管理 (KoboldAI-Client)
  // ============================================

  async addMemory(projectId: string, content: string, type: 'memory' | 'authorsNote' | 'systemPrompt') {
    return this.memoryManager.addMemory(projectId, content, type);
  }

  async buildMemoryContext(projectId: string, context?: { recentChapters?: number }) {
    return this.memoryManager.buildMemoryContext(projectId, context || {});
  }

  async getMemories(projectId: string) {
    return this.memoryManager.getAllMemories(projectId);
  }

  // ============================================
  // Auto Director (AI-Novel-Writing-Assistant)
  // ============================================

  async analyzeTrends() {
    return this.autoDirector.analyzeTrends();
  }

  async generateDirections(project: Partial<NovelProject>, count: number = 3) {
    return this.autoDirector.generateDirections(project, count);
  }

  async createProjectPlan(direction: any, config?: DirectorConfig) {
    return this.autoDirector.createProjectPlan(direction, config);
  }

  async generateChapterPlan(direction: any, totalChapters: number = 100) {
    return this.autoDirector.generateChapterPlan(direction, totalChapters);
  }

  // ============================================
  // Creative Hub (AI-Novel-Writing-Assistant)
  // ============================================

  async createCreativeSession(projectId: string) {
    return this.creativeHub.createSession(projectId);
  }

  async sendCreativeMessage(sessionId: string, content: string) {
    return this.creativeHub.sendMessage(sessionId, content);
  }

  async addToRAG(projectId: string, document: { content: string; type: string; sourceId?: string }) {
    return this.creativeHub.addRAGDocument(projectId, {
      content: document.content,
      metadata: { type: document.type as any, sourceId: document.sourceId, createdAt: new Date() }
    });
  }

  async searchRAG(projectId: string, query: string) {
    return this.creativeHub.searchRAG(projectId, query);
  }

  // ============================================
  // Card Manager (NovelForge)
  // ============================================

  async createCard(projectId: string, type: string, title: string, content: Record<string, any>, parentId?: string) {
    return this.cardManager.createCard(projectId, type, title, content, parentId);
  }

  async getCards(projectId: string, type?: string) {
    if (type) {
      return this.cardManager.getCardsByType(projectId, type);
    }
    return this.cardManager.getAllCards(projectId);
  }

  async searchCards(projectId: string, query: string) {
    return this.cardManager.searchCards(projectId, query);
  }

  // ============================================
  // Knowledge Graph (NovelForge/Neo4j)
  // ============================================

  async addCharacterToGraph(projectId: string, character: any) {
    return this.knowledgeGraphManager.addCharacterNode(projectId, character);
  }

  async addLocationToGraph(projectId: string, location: any) {
    return this.knowledgeGraphManager.addLocationNode(projectId, location);
  }

  async addFactionToGraph(projectId: string, faction: any) {
    return this.knowledgeGraphManager.addFactionNode(projectId, faction);
  }

  async addRelation(projectId: string, source: string, target: string, type: string) {
    return this.knowledgeGraphManager.addRelation(projectId, source, target, type);
  }

  async findPath(projectId: string, from: string, to: string) {
    return this.knowledgeGraphManager.findPath(projectId, from, to);
  }

  async getCharacterNetwork(projectId: string, characterId: string, depth?: number) {
    return this.knowledgeGraphManager.getCharacterNetwork(projectId, characterId, depth || 2);
  }

  async exportGraph(projectId: string) {
    return this.knowledgeGraphManager.exportGraph(projectId);
  }

  // ============================================
  // Agent System (InkOS)
  // ============================================

  getAgents() {
    return this.agentSystem.getAllAgents();
  }

  async executeArchitectTask(project: NovelProject, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>) {
    return this.agentSystem.executeArchitectTask(project, task, params);
  }

  async executeWriterTask(project: NovelProject, chapterNumber: number, options?: { outline?: string; guidance?: string }) {
    return this.agentSystem.executeWriterTask(project, chapterNumber, options);
  }

  async executeAuditorTask(content: string, truthFiles: TruthFiles, autoFix?: boolean) {
    return this.agentSystem.executeAuditorTask(content, truthFiles, { autoFix });
  }

  async executePipeline(project: NovelProject, chapterNumber: number) {
    return this.agentSystem.executePipeline(project, chapterNumber);
  }

  // ============================================
  // Seven Step Methodology (novel-writer)
  // ============================================

  async executeMethodologyStep(projectId: string, step: 'constitution' | 'specify' | 'clarify' | 'plan' | 'tasks' | 'write' | 'analyze', params?: Record<string, any>): Promise<StepResult> {
    return this.sevenStepMethodology.executeStep(projectId, step, params);
  }

  getMethodologyProgress(projectId: string) {
    return this.sevenStepMethodology.getProgress(projectId);
  }

  getMethodologyNextAction(projectId: string) {
    return this.sevenStepMethodology.getNextAction(projectId);
  }

  // ============================================
  // 题材配置
  // ============================================

  getGenreTemplates(): GenreTemplate[] {
    return this.genreConfigManager.getAllTemplates();
  }

  getGenreTemplate(genre: Genre): GenreTemplate | undefined {
    return this.genreConfigManager.getTemplate(genre);
  }

  getGenreGuidance(genre: Genre): string {
    return this.genreConfigManager.getWritingGuidance(genre);
  }

  // ============================================
  // Plugin System
  // ============================================

  async registerPlugin(plugin: any) {
    return this.pluginSystem.register(plugin);
  }

  async executePluginCommand(commandName: string, args: any, context?: any) {
    return this.pluginSystem.executeCommand(commandName, args, context || {});
  }

  getPluginCommands() {
    return this.pluginSystem.getAllCommands();
  }

  // ============================================
  // Cover Generator
  // ============================================

  async generateCoverDesign(project: Partial<NovelProject>, config?: { style?: 'fantasy' | 'modern' | 'scifi' | 'romance' | 'historical' | 'custom'; mainColor?: string }) {
    return this.coverGenerator.generateDesign(project, config);
  }

  async generateCoverPrompt(project: Partial<NovelProject>, config?: { style?: 'fantasy' | 'modern' | 'scifi' | 'romance' | 'historical' | 'custom'; mainColor?: string }) {
    return this.coverGenerator.generateImagePrompt(project, config);
  }

  // ============================================
  // Mind Map Generator
  // ============================================

  async generateProjectMindMap(project: NovelProject): Promise<MindMapData> {
    return this.mindMapGenerator.generateProjectMindMap(project);
  }

  async generateCharacterRelationMap(characters: any[]): Promise<MindMapData> {
    return this.mindMapGenerator.generateCharacterRelationshipMap(characters);
  }

  async generateChapterOutlineMap(chapters: any[]): Promise<MindMapData> {
    return this.mindMapGenerator.generateChapterOutlineMap(chapters);
  }

  // ============================================
  // Trend Analyzer
  // ============================================

  async analyzeMarketTrends(platform: string, genre: Genre) {
    return this.trendAnalyzer.analyzeTrends(platform, genre);
  }

  async analyzeCompetitor(bookInfo: { title?: string; url?: string; genre?: Genre }) {
    return this.trendAnalyzer.analyzeCompetitor(bookInfo);
  }

  async generateInspiration(genre: Genre, type?: 'plot' | 'character' | 'world' | 'all') {
    return this.trendAnalyzer.generateInspiration(genre, type);
  }

  // ============================================
  // Daemon Service
  // ============================================

  async startDaemon() {
    if (this.daemonService) {
      await this.daemonService.start();
    }
  }

  async stopDaemon() {
    if (this.daemonService) {
      await this.daemonService.stop();
    }
  }

  async scheduleTask(task: { type: string; schedule: string; params: Record<string, any> }) {
    if (this.daemonService) {
      return this.daemonService.addTask(task as any);
    }
  }

  getNotifications(unreadOnly?: boolean): Notification[] {
    if (this.daemonService) {
      return this.daemonService.getNotifications(unreadOnly);
    }
    return [];
  }

  // ============================================
  // 写作核心功能
  // ============================================

  async generateChapter(
    projectId: string,
    chapterNumber: number,
    options?: WritingOptions
  ): Promise<Chapter> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const context = await this.buildContext(project, chapterNumber);

    if (project.writingMode === 'imitation' ||
        project.writingMode === 'derivative' ||
        project.writingMode === 'fanfic') {
      const imitationEngine = new ImitationEngine({
        sourceParseResult: {
          title: project.sourceNovel || '',
          estimatedWordCount: 0,
          chapters: [],
          characters: (project.characters || []).map(c => ({
            name: c.name,
            aliases: c.aliases || [],
            description: c.background || '',
            appearances: [],
            relationships: []
          })),
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

      const outline = await imitationEngine.generateOutline(
        chapterNumber,
        project.worldSetting!,
        project.characters || [],
        project.chapters?.[chapterNumber - 2]?.summary
      );

      const content = await imitationEngine.generateImitation(context);

      let auditResult;
      if (options?.autoAudit !== false) {
        auditResult = await this.auditEngine.audit(
          content,
          await this.truthFileManager.getTruthFiles(projectId)
        );
      }

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

      project.chapters = project.chapters || [];
      project.chapters.push(chapter);
      project.updatedAt = new Date();

      // 保存到本地存储
      await this.localStorage.updateChapter(projectId, chapter.id, {
        number: chapter.number,
        title: chapter.title,
        content: chapter.content,
        status: chapter.status as 'draft' | 'revised' | 'final',
        wordCount: chapter.wordCount,
        auditResult: chapter.auditResult
      });

      await this.truthFileManager.updateChapterSummary(projectId, chapter);

      return chapter;
    }

    const result = await this.writingPipeline.generateChapter(project, chapterNumber, await this.truthFileManager.getTruthFiles(projectId), options);
    
    // 保存到本地存储
    if (result.chapter) {
      await this.localStorage.updateChapter(projectId, result.chapter.id, {
        number: result.chapter.number,
        title: result.chapter.title,
        content: result.chapter.content,
        status: result.chapter.status as 'draft' | 'revised' | 'final',
        wordCount: result.chapter.wordCount
      });
    }
    
    return result.chapter;
  }

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

  async auditChapter(projectId: string, chapterId: string) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const chapter = project.chapters?.find(c => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');

    const truthFiles = await this.truthFileManager.getTruthFiles(projectId);
    return this.auditEngine.audit(chapter.content!, truthFiles);
  }

  async reviseChapter(
    projectId: string,
    chapterId: string,
    auditResult?: any
  ): Promise<Chapter> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const chapter = project.chapters?.find(c => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');

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

  detectAI(text: string): DetectionResult {
    return this.antiDetectionEngine.detectAI(text);
  }

  async humanize(text: string): Promise<string> {
    return this.antiDetectionEngine.humanize(text, this.llmManager);
  }

  // ============================================
  // 项目管理辅助功能
  // ============================================

  private async buildContext(project: NovelProject, chapterNumber: number): Promise<GenerationContext> {
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
        genre: 'fantasy',
        literaryGenre: 'novel'
      },
      previousChapterSummary: project.chapters?.[chapterNumber - 2]?.summary
    };
  }

  async saveProject(projectId: string, storagePath?: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const basePath = storagePath || this.config.storagePath || './projects';
    const filePath = path.join(basePath, `${projectId}.json`);

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }

  getProject(projectId: string): NovelProject | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): NovelProject[] {
    return Array.from(this.projects.values());
  }

  getCurrentProject(): NovelProject | undefined {
    return this.currentProject;
  }

  setCurrentProject(projectId: string): void {
    this.currentProject = this.projects.get(projectId);
  }

  addModel(config: LLMConfig): void {
    this.llmManager.addConfig(config);
    if (!this.config.llmConfigs.find(c => c.name === config.name)) {
      this.config.llmConfigs.push(config);
    }
  }

  updateRoutes(routes: ModelRoute[]): void {
    this.llmManager.setRoutes(routes);
    this.config.modelRoutes = routes;
  }

  async exportProject(
    projectId: string,
    format: 'txt' | 'md' | 'json',
    storagePath?: string
  ): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const basePath = storagePath || this.config.storagePath || './exports';

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const fileName = `${project.title}.${format}`;
    const filePath = path.join(basePath, fileName);

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

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  private countWords(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }
}

export default CloudBook;
