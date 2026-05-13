/**
 * Cloud Book - 全能AI小说创作引擎
 * 完全原创，整合所有创作功能
 */
import { NovelProject, Chapter, TruthFiles, LLMConfig, ModelRoute, AuditConfig, AntiDetectionConfig, Genre } from './types';
import type { ParseResult } from './types';
import { DetectionResult } from './modules/AntiDetection/AntiDetectionEngine';
import { DirectorConfig } from './modules/AutoDirector/AutoDirector';
import { AgentResponse } from './modules/AgentSystem/AgentSystem';
import { ScheduledTask, Notification } from './modules/DaemonService/DaemonService';
import { StepResult } from './modules/SevenStepMethodology/SevenStepMethodology';
import { GenreTemplate } from './modules/GenreConfig/GenreConfigManager';
import { CoverDesign } from './modules/CoverGenerator/CoverGenerator';
import { MindMapData } from './modules/MindMapGenerator/MindMapGenerator';
import { TrendReport, CompetitorAnalysis } from './modules/TrendAnalyzer/TrendAnalyzer';
import { APIKeyConfig } from './modules/LocalAPI/LocalAPIServer';
import { ProjectData } from './modules/LocalStorage/LocalStorage';
import { ExportFormat, ExportConfig } from './modules/ExportManager/ExportManager';
import { ImportFormat } from './modules/ImportManager/ImportManager';
import { Shortcut } from './modules/KeyboardShortcuts/KeyboardShortcuts';
import { WritingGoal, GoalStats, GoalStreak } from './modules/GoalManager/GoalManager';
import { CostRecord, CostBudget, CostStats } from './modules/CostTracker/CostTracker';
import { SnowflakeStep } from './modules/SnowflakeMethodology/SnowflakeMethodology';
import { ScrapedContent } from './modules/WebScraper/WebScraper';
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
    useDefaultModels?: boolean;
}
export interface WritingOptions {
    targetWordCount?: number;
    styleGuidance?: string;
    chapterGuidance?: string;
    autoAudit?: boolean;
    autoHumanize?: boolean;
    parallelCount?: number;
}
export declare class CloudBook {
    private config;
    private llmManager;
    private parser;
    private auditEngine;
    private antiDetectionEngine;
    private truthFileManager;
    private contextManager;
    private writingPipeline;
    private worldInfoManager;
    private memoryManager;
    private autoDirector;
    private creativeHub;
    private cardManager;
    private knowledgeGraphManager;
    private agentSystem;
    private daemonService?;
    private sevenStepMethodology;
    private genreConfigManager;
    private pluginSystem;
    private coverGenerator;
    private mindMapGenerator;
    private trendAnalyzer;
    private i18nManager;
    private globalLiteraryConfig;
    private localAPIServer?;
    private offlineLLMManager?;
    private networkManager;
    private cacheManager;
    private versionHistoryManager;
    private localStorage;
    private exportManager;
    private importManager;
    private keyboardShortcuts;
    private goalManager;
    private costTracker;
    private snowflakeMethodology;
    private webScraper;
    private currentProject?;
    private projects;
    constructor(config: CloudBookConfig);
    private initializeOfflineMode;
    setLanguage(language: string): void;
    getLanguage(): string;
    detectLanguage(text: string): {
        language: string;
        confidence: number;
        details?: Record<string, number>;
    };
    checkGrammar(text: string): Promise<any>;
    getSupportedLanguages(): any[];
    translate(key: string, params?: Record<string, string>): string;
    getGlobalGenreConfig(genre: Genre): any;
    getGlobalGenres(): any[];
    searchGenres(query: string, language?: string): any[];
    getNetworkStatus(): Promise<any>;
    checkConnection(): Promise<boolean>;
    onNetworkChange(callback: (status: any) => void): () => void;
    getCacheStats(): Promise<any>;
    clearCache(): void;
    createVersion(projectId: string, content: string, summary?: string): Promise<any>;
    getVersionHistory(projectId: string, limit?: number): Promise<any[]>;
    restoreVersion(projectId: string, versionId: string): Promise<any>;
    createBranch(projectId: string, name: string, description?: string): Promise<any>;
    compareVersions(projectId: string, v1: string, v2: string): Promise<any[]>;
    createProject(title: string, genre: Genre, writingMode?: 'original' | 'imitation' | 'derivative' | 'fanfic'): Promise<NovelProject>;
    importNovel(filePath: string): Promise<ParseResult>;
    listProjects(): Promise<ProjectData[]>;
    loadProject(projectId: string): Promise<NovelProject | null>;
    deleteProject(projectId: string): Promise<boolean>;
    createImitationProject(parseResult: ParseResult, mode: 'imitation' | 'derivative' | 'fanfic', imitationLevel?: number): Promise<NovelProject>;
    addWorldInfo(projectId: string, info: {
        name: string;
        keywords: string[];
        content: string;
        depth?: number;
    }): Promise<import("./types").WorldInfo>;
    getWorldInfo(projectId: string, keywords?: string[]): Promise<import("./types").WorldInfo[]>;
    buildWorldInfoContext(projectId: string, context: string): Promise<string>;
    addMemory(projectId: string, content: string, type: 'memory' | 'authorsNote' | 'systemPrompt'): Promise<import("./types").Memory>;
    buildMemoryContext(projectId: string, context?: {
        recentChapters?: number;
    }): Promise<string>;
    getMemories(projectId: string): Promise<import("./types").Memory[]>;
    analyzeTrends(): Promise<import("./modules/AutoDirector/AutoDirector").TrendAnalysis>;
    generateDirections(project: Partial<NovelProject>, count?: number): Promise<import("./types").StoryDirection[]>;
    createProjectPlan(direction: any, config?: DirectorConfig): Promise<import("./types").AutoDirectorResult>;
    generateChapterPlan(direction: any, totalChapters?: number): Promise<import("./types").ChapterPlan[]>;
    createCreativeSession(projectId: string): Promise<{
        sessionId: string;
    }>;
    sendCreativeMessage(sessionId: string, content: string): Promise<string>;
    addToRAG(projectId: string, document: {
        content: string;
        type: string;
        sourceId?: string;
    }): Promise<import("./modules/CreativeHub/CreativeHub").Document>;
    searchRAG(projectId: string, query: string): Promise<import("./modules/CreativeHub/CreativeHub").SearchResult[]>;
    createCard(projectId: string, type: string, title: string, content: Record<string, any>, parentId?: string): Promise<import("./types").Card>;
    getCards(projectId: string, type?: string): Promise<import("./types").Card[]>;
    searchCards(projectId: string, query: string): Promise<import("./types").Card[]>;
    addCharacterToGraph(projectId: string, character: any): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGNode>;
    addLocationToGraph(projectId: string, location: any): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGNode>;
    addFactionToGraph(projectId: string, faction: any): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGNode>;
    addRelation(projectId: string, source: string, target: string, type: string): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGRelationship>;
    findPath(projectId: string, from: string, to: string): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGPath>;
    getCharacterNetwork(projectId: string, characterId: string, depth?: number): Promise<import("./modules/KnowledgeGraphManager/KnowledgeGraphManager").KGNode[]>;
    exportGraph(projectId: string): Promise<string>;
    getAgents(): import("./types").Agent[];
    executeArchitectTask(project: NovelProject, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>): Promise<AgentResponse>;
    executeWriterTask(project: NovelProject, chapterNumber: number, options?: {
        outline?: string;
        guidance?: string;
    }): Promise<AgentResponse>;
    executeAuditorTask(content: string, truthFiles: TruthFiles, autoFix?: boolean): Promise<AgentResponse>;
    executePipeline(project: NovelProject, chapterNumber: number): Promise<{
        chapter?: Chapter;
        issues?: any[];
    }>;
    executeMethodologyStep(projectId: string, step: 'constitution' | 'specify' | 'clarify' | 'plan' | 'tasks' | 'write' | 'analyze', params?: Record<string, any>): Promise<StepResult>;
    getMethodologyProgress(projectId: string): import("./modules/SevenStepMethodology/SevenStepMethodology").MethodologyProgress;
    getMethodologyNextAction(projectId: string): "constitution" | "specify" | "clarify" | "plan" | "tasks" | "write" | "analyze";
    getGenreTemplates(): GenreTemplate[];
    getGenreTemplate(genre: Genre): GenreTemplate | undefined;
    getGenreGuidance(genre: Genre): string;
    registerPlugin(plugin: any): Promise<void>;
    executePluginCommand(commandName: string, args: any, context?: any): Promise<import("./modules/PluginSystem/PluginSystem").CommandResult>;
    getPluginCommands(): import("./types").PluginCommand[];
    generateCoverDesign(project: Partial<NovelProject>, config?: {
        style?: 'fantasy' | 'modern' | 'scifi' | 'romance' | 'historical' | 'custom';
        mainColor?: string;
    }): Promise<CoverDesign>;
    generateCoverPrompt(project: Partial<NovelProject>, config?: {
        style?: 'fantasy' | 'modern' | 'scifi' | 'romance' | 'historical' | 'custom';
        mainColor?: string;
    }): Promise<string>;
    generateProjectMindMap(project: NovelProject): Promise<MindMapData>;
    generateCharacterRelationMap(characters: any[]): Promise<MindMapData>;
    generateChapterOutlineMap(chapters: any[]): Promise<MindMapData>;
    analyzeMarketTrends(platform: string, genre: Genre): Promise<TrendReport>;
    analyzeCompetitor(bookInfo: {
        title?: string;
        url?: string;
        genre?: Genre;
    }): Promise<CompetitorAnalysis>;
    generateInspiration(genre: Genre, type?: 'plot' | 'character' | 'world' | 'all'): Promise<string[]>;
    startDaemon(): Promise<void>;
    stopDaemon(): Promise<void>;
    scheduleTask(task: {
        type: string;
        schedule: string;
        params: Record<string, any>;
    }): Promise<ScheduledTask>;
    getNotifications(unreadOnly?: boolean): Notification[];
    generateChapter(projectId: string, chapterNumber: number, options?: WritingOptions): Promise<Chapter>;
    batchGenerateChapters(projectId: string, startChapter: number, count: number, options?: WritingOptions): Promise<Chapter[]>;
    auditChapter(projectId: string, chapterId: string): Promise<import("./types").AuditResult>;
    reviseChapter(projectId: string, chapterId: string, auditResult?: any): Promise<Chapter>;
    detectAI(text: string): DetectionResult;
    humanize(text: string): Promise<string>;
    private buildContext;
    saveProject(projectId: string, storagePath?: string): Promise<void>;
    getProject(projectId: string): NovelProject | undefined;
    getAllProjects(): NovelProject[];
    getCurrentProject(): NovelProject | undefined;
    setCurrentProject(projectId: string): void;
    addModel(config: LLMConfig): void;
    updateRoutes(routes: ModelRoute[]): void;
    exportProject(projectId: string, format: 'txt' | 'md' | 'json', storagePath?: string): Promise<string>;
    private projectToMarkdown;
    private projectToText;
    private generateId;
    private toChineseNumber;
    private countWords;
    exportProjectFull(projectId: string, format: ExportFormat, config?: ExportConfig): Promise<string>;
    exportChapter(projectId: string, chapterId: string, format: ExportFormat): Promise<string>;
    getExportFormats(): ExportFormat[];
    importProjectFromFile(filePath: string, format?: ImportFormat): Promise<NovelProject>;
    importChapterFromFile(projectId: string, filePath: string, format?: ImportFormat): Promise<Chapter>;
    detectImportFormat(filePath: string): string;
    registerShortcut(shortcut: Shortcut): void;
    getShortcuts(category?: string): Shortcut[];
    executeShortcut(key: string, modifiers?: string[]): boolean;
    setWritingGoal(goal: WritingGoal): void;
    getCurrentGoal(): WritingGoal | null;
    recordWriting(words: number, date?: Date): void;
    getGoalStats(): GoalStats;
    getStreak(): GoalStreak;
    recordCost(record: CostRecord): void;
    getCostStats(): CostStats;
    setBudget(budget: CostBudget): void;
    getBudget(): CostBudget | null;
    executeSnowflakeStep(projectId: string, step: number, params?: Record<string, any>): Promise<{
        success: boolean;
        data?: any;
        message: string;
    }>;
    initializeSnowflake(projectId: string): Promise<SnowflakeStep[]>;
    scrapeUrl(url: string): Promise<ScrapedContent | null>;
    scrapeNovelChapter(url: string): Promise<{
        title: string;
        content: string;
        chapterNumber?: number;
        nextChapterUrl?: string;
        prevChapterUrl?: string;
    } | null>;
    scrapeBatchUrls(urls: string[]): Promise<ScrapedContent[]>;
    getAvailableModels(): string[];
    getModelCapability(modelName: string): any;
    getAllCapabilities(): Record<string, any>;
    getDefaultModel(): string;
    getAPIStatus(): {
        endpoint: string;
        status: string;
    };
    setDefaultModel(modelName: string): void;
}
export default CloudBook;
//# sourceMappingURL=CloudBook.d.ts.map