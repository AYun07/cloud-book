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

import NovelParser from './modules/NovelParser/NovelParser';
import type { ParseResult } from './types';
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
import CreativeHub from './modules/CreativeHub/CreativeHub';
import { CardManager } from './modules/Card/CardManager';
import KnowledgeGraphManager from './modules/KnowledgeGraphManager/KnowledgeGraphManager';
import { AgentSystem, AgentTask, AgentResponse } from './modules/AgentSystem/AgentSystem';
import { DaemonService, ScheduledTask, Notification } from './modules/DaemonService/DaemonService';
import { SevenStepMethodology, StepResult } from './modules/SevenStepMethodology/SevenStepMethodology';
import { GenreConfigManager, GenreTemplate } from './modules/GenreConfig/GenreConfigManager';
import { PluginSystem } from './modules/PluginSystem/PluginSystem';
import { CoverGenerator, CoverDesign } from './modules/CoverGenerator/CoverGenerator';
import { MindMapGenerator, MindMapData } from './modules/MindMapGenerator/MindMapGenerator';
import { TrendAnalyzer, CompetitiveAnalysis } from './modules/TrendAnalyzer/TrendAnalyzer';
import type { TrendReport } from './types';
import { I18nManager } from './modules/I18nManager/I18nManager';
import { GlobalLiteraryConfig } from './modules/GlobalLiterary/GlobalLiteraryConfig';
import { LocalAPIServer, OfflineLLMManager, APIKeyConfig } from './modules/LocalAPI/LocalAPIServer';
import { NetworkManager } from './modules/NetworkManager/NetworkManager';
import { CacheManager, MultiLevelCache } from './modules/CacheManager/CacheManager';
import { VersionHistoryManager } from './modules/VersionHistory/VersionHistoryManager';
import { LocalStorage, ProjectData, ChapterData, CardData } from './modules/LocalStorage/LocalStorage';
import { ExportManager, ExportFormat, ExportConfig } from './modules/ExportManager/ExportManager';
import { ImportManager, ImportFormat } from './modules/ImportManager/ImportManager';
import { KeyboardShortcuts, Shortcut, ShortcutCategory } from './modules/KeyboardShortcuts/KeyboardShortcuts';
import { GoalManager, WritingGoal, GoalStats, GoalStreak } from './modules/GoalManager/GoalManager';
import { CostTracker, CostRecord, CostBudget, CostStats, CostAlert } from './modules/CostTracker/CostTracker';
import { SnowflakeMethodology, SnowflakeStep, SnowflakeProject } from './modules/SnowflakeMethodology/SnowflakeMethodology';
import { WebScraper, ScrapedContent, ScraperConfig } from './modules/WebScraper/WebScraper';

import * as fs from 'fs';
import * as path from 'path';
import { createModelConfigs, createModelRoutes, getDefaultLLMConfig, MODEL_CAPABILITIES, API_CONFIG_INFO } from './config/model-config';

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
  costTracking?: {
    enabled?: boolean;
    budgets?: CostBudget;
  };
  creativeHubConfig?: {
    provider?: string;
    embeddingConfig?: Partial<{
      provider: string;
      apiKey?: string;
      endpoint?: string;
      model?: string;
      dimension?: number;
    }>;
    vectorStoreConfig?: Partial<{
      type: string;
      endpoint?: string;
      apiKey?: string;
      indexName?: string;
    }>;
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
  
  // 新增模块
  private exportManager: ExportManager;
  private importManager: ImportManager;
  private keyboardShortcuts: KeyboardShortcuts;
  private goalManager: GoalManager;
  private costTracker: CostTracker;
  private snowflakeMethodology: SnowflakeMethodology;
  private webScraper: WebScraper;

  private currentProject?: NovelProject;
  private projects: Map<string, NovelProject> = new Map();

  constructor(config: CloudBookConfig) {
    this.config = config;

    const llmConfigs = config.useDefaultModels ? createModelConfigs() : config.llmConfigs;
    const modelRoutes = config.useDefaultModels ? createModelRoutes() : config.modelRoutes;

    this.llmManager = new LLMManager();
    for (const llmConfig of llmConfigs) {
      this.llmManager.addConfig(llmConfig);
    }
    this.llmManager.setRoutes(modelRoutes);

    this.parser = new NovelParser({
      
      extractCharacters: true,
      extractSetting: true
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

    const storagePath = config.storagePath || './cloud-book-data';
    
    this.worldInfoManager = new WorldInfoManager(path.join(storagePath, 'worldinfo'));
    this.memoryManager = new MemoryManager(path.join(storagePath, 'memory'));
    this.autoDirector = new AutoDirector(this.llmManager);
    this.creativeHub = new CreativeHub(
      config.creativeHubConfig?.embeddingConfig,
      undefined,
      config.creativeHubConfig?.vectorStoreConfig as any
    );
    this.creativeHub.setLLMProvider(this.llmManager);
    this.cardManager = new CardManager(path.join(storagePath, 'cards'));
    this.knowledgeGraphManager = new KnowledgeGraphManager();
    this.agentSystem = new AgentSystem(this.llmManager, this.auditEngine);
    this.sevenStepMethodology = new SevenStepMethodology(this.llmManager);
    this.genreConfigManager = new GenreConfigManager();
    this.pluginSystem = new PluginSystem(path.join(storagePath, 'plugins'));
    this.coverGenerator = new CoverGenerator(this.llmManager);
    this.mindMapGenerator = new MindMapGenerator();
    this.trendAnalyzer = new TrendAnalyzer({ enabled: true, platforms: ['qidian', 'jjwxc', 'zongheng'] });

    this.i18nManager = new I18nManager(config.i18nConfig?.primaryLanguage as any || 'zh-CN');
    this.globalLiteraryConfig = new GlobalLiteraryConfig();
    this.networkManager = new NetworkManager({
      autoSwitch: true,
      switchDebounceMs: 2000
    });
    this.cacheManager = new CacheManager({ storageKey: 'cloudbook_cache', maxSize: 1000, ttl: 3600000 });
    this.versionHistoryManager = new VersionHistoryManager(path.join(storagePath, 'versioning'));
    this.localStorage = new LocalStorage({ basePath: storagePath });
    
    this.networkManager.onModeSwitch((newMode, reason) => {
      console.log(`[CloudBook] 模式切换: ${newMode}, 原因: ${reason}`);
      if (reason === 'network_recovered' && newMode === 'online') {
        console.log('[CloudBook] 网络已恢复，切换到在线模式');
      } else if (reason === 'network_lost' && newMode === 'offline') {
        console.log('[CloudBook] 网络已断开，切换到离线模式');
      }
    });
    
    this.exportManager = new ExportManager();
    this.importManager = new ImportManager();
    this.keyboardShortcuts = new KeyboardShortcuts();
    this.goalManager = new GoalManager();
    this.costTracker = new CostTracker();
    if (config.costTracking?.budgets) {
      this.costTracker.setBudget(config.costTracking.budgets);
    }
    if (config.costTracking?.enabled !== false) {
      this.llmManager.setCostTracker(this.costTracker);
    }
    this.snowflakeMethodology = new SnowflakeMethodology(this.llmManager);
    this.webScraper = new WebScraper();
    
    if (config.connectionMode === 'offline') {
      this.networkManager.setMode('offline');
      this.initializeOfflineMode(config.localAPIConfig);
    } else if (config.connectionMode === 'hybrid') {
      this.networkManager.setMode('hybrid');
      this.initializeOfflineMode(config.localAPIConfig);
    } else {
      this.networkManager.setMode('online');
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
        path.join(storagePath, 'daemon')
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

  detectLanguage(text: string): { language: string; confidence: number; details?: Record<string, number> } {
    const languageRanges: Array<{ name: string; range: [number, number]; script?: string }> = [
      { name: 'zh-CN', range: [0x4E00, 0x9FFF] },
      { name: 'ja', range: [0x3040, 0x309F], script: 'hiragana' },
      { name: 'ja', range: [0x30A0, 0x30FF], script: 'katakana' },
      { name: 'ko', range: [0xAC00, 0xD7AF], script: 'hangul' },
      { name: 'ko', range: [0x1100, 0x11FF], script: 'jamo' },
      { name: 'th', range: [0x0E00, 0x0E7F], script: 'thai' },
      { name: 'vi', range: [0x1EA0, 0x1EF9], script: 'vietnamese' },
      { name: 'ar', range: [0x0600, 0x06FF], script: 'arabic' },
      { name: 'he', range: [0x0590, 0x05FF], script: 'hebrew' },
      { name: 'hi', range: [0x0900, 0x097F], script: 'hindi' },
      { name: 'th', range: [0x0E00, 0x0E7F], script: 'thai' },
      { name: 'ru', range: [0x0400, 0x04FF], script: 'cyrillic' },
      { name: 'el', range: [0x0370, 0x03FF], script: 'greek' },
      { name: 'th', range: [0x0E00, 0x0E7F], script: 'thai' },
      { name: 'en', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'en', range: [0x0061, 0x007A], script: 'latin' },
      { name: 'es', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'fr', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'de', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'pt', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'it', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'nl', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'pl', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'tr', range: [0x0041, 0x005A], script: 'latin' },
      { name: 'vi', range: [0x0041, 0x005A], script: 'latin' }
    ];
    
    const charLangCounts: Record<string, number> = {};
    const uniqueChars = new Set(text.slice(0, 500));
    
    for (const char of uniqueChars) {
      const code = char.codePointAt(0) || 0;
      for (const lang of languageRanges) {
        if (code >= lang.range[0] && code <= lang.range[1]) {
          charLangCounts[lang.name] = (charLangCounts[lang.name] || 0) + 1;
        }
      }
    }
    
    const englishPattern = /[a-zA-Z]/g;
    const englishCount = (text.match(englishPattern) || []).length;
    if (englishCount > 0) {
      charLangCounts['en'] = (charLangCounts['en'] || 0) + englishCount * 0.5;
    }
    
    const chinesePattern = /[\u4e00-\u9fa5]/g;
    const chineseCount = (text.match(chinesePattern) || []).length;
    if (chineseCount > 0) {
      charLangCounts['zh-CN'] = chineseCount;
    }
    
    const totalLangChars = Object.values(charLangCounts).reduce((a, b) => a + b, 0);
    const langRatios: Record<string, number> = {};
    for (const [lang, count] of Object.entries(charLangCounts)) {
      langRatios[lang] = count / Math.max(totalLangChars, 1);
    }
    
    const sortedLangs = Object.entries(charLangCounts)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedLangs.length === 0 || sortedLangs[0][1] < 3) {
      const locale = this.i18nManager.detectSystemLocale();
      return { language: locale, confidence: 0.3, details: {} };
    }
    
    const [primaryLang, primaryCount] = sortedLangs[0];
    const totalChars = text.length;
    const confidence = Math.min(0.95, primaryCount / Math.max(totalChars * 0.3, 1));
    
    const langNameMap: Record<string, string> = {
      'zh-CN': 'zh-Hans',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'ar': 'ar-SA',
      'he': 'he-IL',
      'hi': 'hi-IN',
      'ru': 'ru-RU',
      'el': 'el-GR',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'tr': 'tr-TR'
    };
    
    return {
      language: langNameMap[primaryLang] || primaryLang,
      confidence: Math.round(confidence * 100) / 100,
      details: langRatios
    };
  }

  async checkGrammar(text: string): Promise<any> {
    const errors: Array<{ type: string; text: string; position: number; suggestion: string }> = [];
    const suggestions: string[] = [];
    
    const repeatedWords = text.match(/(.{2,})\1+/g);
    if (repeatedWords && repeatedWords.length > 0) {
      for (const match of repeatedWords) {
        errors.push({
          type: 'repeatedPhrase',
          text: match,
          position: text.indexOf(match),
          suggestion: `删除重复的"${match.slice(0, 4)}..."部分`
        });
      }
    }
    
    const chineseRepeatedChars = text.match(/(.)\1{2,}/g);
    if (chineseRepeatedChars) {
      for (const match of chineseRepeatedChars) {
        errors.push({
          type: 'repeatedChar',
          text: match,
          position: text.indexOf(match),
          suggestion: `"${match[0]}"重复过多，请精简表达`
        });
      }
    }
    
    const longSentences = text.split(/[。！？；]/).filter(s => s.trim().length > 50);
    for (const sentence of longSentences) {
      const pos = text.indexOf(sentence);
      errors.push({
        type: 'longSentence',
        text: sentence.slice(0, 30) + '...',
        position: pos,
        suggestion: `句子过长（${sentence.length}字），建议拆分`
      });
    }
    
    const emptyLines = text.match(/\n{3,}/g);
    if (emptyLines) {
      suggestions.push('建议减少过多的空行，保持文章连贯性');
    }
    
    const redundantPatterns = [
      { pattern: /白白地/g, replacement: '白白' },
      { pattern: /慢慢地/g, replacement: '缓缓' },
      { pattern: /非常地/g, replacement: '极为' },
      { pattern: /不断地/g, replacement: '持续' },
      { pattern: /各种各样/g, replacement: '各种' },
      { pattern: /一模一样/g, replacement: '相同' },
      { pattern: /自言自语地说/g, replacement: '说道' },
      { pattern: /突然之间/g, replacement: '突然' },
      { pattern: /总的来看/g, replacement: '总体来看' },
      { pattern: /因为的原因/g, replacement: '因为' }
    ];
    
    for (const { pattern, replacement } of redundantPatterns) {
      if (pattern.test(text)) {
        const matches = text.match(pattern);
        if (matches) {
          errors.push({
            type: 'redundantExpression',
            text: pattern.source,
            position: text.search(pattern),
            suggestion: `建议将"${pattern.source}"替换为"${replacement}"`
          });
        }
      }
    }
    
    const wrongWordPatterns = [
      { pattern: /不孚众望/g, correct: '不负众望', note: '不负众望：不辜负大家的期望' },
      { pattern: /首当其冲/g, correct: '冲锋在前', note: '首当其冲：指首先受到冲击，不是冲在最前' },
      { pattern: /望其项背/g, correct: '难以企及', note: '望其项背：表示赶得上，多用于否定' },
      { pattern: /万人空巷/g, correct: '盛况空前', note: '万人空巷：指人们都从巷子里出来庆祝，不是无人' },
      { pattern: /不以为然/g, correct: '不以为意', note: '不以为然：不认为对。不以为意：不放在心上' },
      { pattern: /美轮美奂/g, correct: '精美绝伦', note: '美轮美奂：形容房屋建筑高大华美，不用于其他' }
    ];
    
    for (const { pattern, correct, note } of wrongWordPatterns) {
      if (pattern.test(text)) {
        errors.push({
          type: 'wrongWord',
          text: pattern.source,
          position: text.search(pattern),
          suggestion: `${note}，建议改为"${correct}"`
        });
      }
    }
    
    const sentenceStarters = text.split(/[。！？]/).filter(s => s.trim().length > 10);
    const starterCounts: Record<string, number> = {};
    for (const starter of sentenceStarters.slice(0, 10)) {
      const firstWords = starter.trim().slice(0, 6);
      starterCounts[firstWords] = (starterCounts[firstWords] || 0) + 1;
    }
    for (const [starter, count] of Object.entries(starterCounts)) {
      if (count >= 3) {
        suggestions.push(`"${starter}..."开头的句子重复较多，建议变换句式`);
        break;
      }
    }
    
    const wordCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const punctuationCount = (text.match(/[，。！？；：、""'']/g) || []).length;
    const ratio = punctuationCount / Math.max(wordCount, 1);
    
    if (ratio < 0.15) {
      suggestions.push('标点符号使用较少，建议增加句号、逗号使用以提高可读性');
    } else if (ratio > 0.5) {
      suggestions.push('标点符号使用过于密集，建议精简表达或合并句子');
    }
    
    const totalIssues = errors.length;
    const suggestionCount = suggestions.length;
    const baseScore = Math.max(0.4, 1 - (totalIssues * 0.08 + suggestionCount * 0.03));
    
    return {
      errors,
      suggestions,
      totalIssues,
      issueBreakdown: {
        repeatedPhrases: repeatedWords?.length || 0,
        longSentences: longSentences.length,
        redundantExpressions: redundantPatterns.filter(p => p.pattern.test(text)).length,
        wrongWords: wrongWordPatterns.filter(p => p.pattern.test(text)).length
      },
      statistics: {
        wordCount,
        punctuationCount,
        punctuationRatio: Math.round(ratio * 100) / 100
      },
      score: Math.round(baseScore * 100) / 100
    };
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

  async setConnectionMode(mode: 'online' | 'offline' | 'hybrid'): Promise<void> {
    if (mode === 'online') {
      await this.networkManager.switchToOnline();
    } else if (mode === 'offline') {
      await this.networkManager.switchToOffline();
    } else {
      await this.networkManager.switchToHybrid();
    }
  }

  getConnectionMode(): 'online' | 'offline' | 'hybrid' {
    return this.networkManager.getMode();
  }

  setAutoNetworkSwitch(enabled: boolean): void {
    this.networkManager.setAutoSwitch(enabled);
  }

  onModeSwitch(callback: (mode: 'online' | 'offline' | 'hybrid', reason: string) => void): () => void {
    return this.networkManager.onModeSwitch((newMode, reason) => {
      callback(newMode, reason);
    });
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
    await this.truthFileManager.initialize(project.id);
    await this.sevenStepMethodology.initializeProject(project.id);

    project.genreConfig = await this.genreConfigManager.createProjectConfig(genre);

    return project;
  }

  async importNovel(filePath: string): Promise<ParseResult> {
    return this.parser.parseString(filePath);
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
    await this.truthFileManager.initialize(project.id);

    return project;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    this.projects.delete(projectId);
    return this.localStorage.deleteProject(projectId);
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
    return { sessionId: projectId };
  }

  async sendCreativeMessage(sessionId: string, content: string) {
    return this.llmManager.complete(content);
  }

  async addToRAG(projectId: string, document: { content: string; type: string; sourceId?: string }) {
    return this.creativeHub.addDocument(document.content, {
      type: document.type, sourceId: document.sourceId, createdAt: new Date()
    });
  }

  async searchRAG(projectId: string, query: string) {
    return this.creativeHub.search(query);
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
    return this.knowledgeGraphManager.addNode('character',projectId, character);
  }

  async addLocationToGraph(projectId: string, location: any) {
    return this.knowledgeGraphManager.addNode('location',projectId, location);
  }

  async addFactionToGraph(projectId: string, faction: any) {
    return this.knowledgeGraphManager.addNode('faction',projectId, faction);
  }

  async addRelation(projectId: string, source: string, target: string, type: string) {
    return this.knowledgeGraphManager.addRelationship(source, target, type);
  }

  async findPath(projectId: string, from: string, to: string) {
    return this.knowledgeGraphManager.findShortestPath(from, to);
  }

  async getCharacterNetwork(projectId: string, characterId: string, depth?: number) {
    return this.knowledgeGraphManager.traverseBFS(characterId, { maxDepth: depth || 2 });
  }

  async exportGraph(projectId: string) {
    return this.knowledgeGraphManager.exportToJSON();
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

  async analyzeMarketTrends() {
    return this.trendAnalyzer.analyzeTrends();
  }

  async analyzeCompetitor(bookInfo: { title?: string; url?: string; genre?: Genre }) {
    const title = bookInfo.title || '未知作品';
    return this.trendAnalyzer.analyzeCompetitor(title);
  }

  async generateInspiration(genre: Genre, type?: 'plot' | 'character' | 'world' | 'all') {
    const inspirations = await this.trendAnalyzer.generateInspiration(genre);
    if (type && type !== 'all') {
      return inspirations.slice(0, 2);
    }
    return inspirations;
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

  async auditContent(content: string, options?: any) {
    return this.auditEngine.audit(content, options);
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

  // ============================================
  // Export Manager - 导出功能
  // ============================================

  async exportProjectFull(
    projectId: string,
    format: ExportFormat,
    config?: ExportConfig
  ): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    return this.exportManager.exportProject(project, format, config);
  }

  async exportChapter(
    projectId: string,
    chapterId: string,
    format: ExportFormat
  ): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    const chapter = project.chapters?.find(c => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');
    return this.exportManager.exportChapter(chapter, format);
  }

  getExportFormats(): ExportFormat[] {
    return this.exportManager.getSupportedFormats();
  }

  // ============================================
  // Import Manager - 导入功能
  // ============================================

  async importProjectFromFile(
    filePath: string,
    format?: ImportFormat
  ): Promise<NovelProject> {
    const imported = await this.importManager.importProject(filePath, format);
    this.projects.set(imported.id, imported);
    return imported;
  }

  async importChapterFromFile(
    projectId: string,
    filePath: string,
    format?: ImportFormat
  ): Promise<Chapter> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    const chapter = await this.importManager.importChapter(filePath, format);
    project.chapters = project.chapters || [];
    project.chapters.push(chapter);
    return chapter;
  }

  detectImportFormat(filePath: string): string {
    return this.importManager.detectFormat(filePath) as string;
  }

  // ============================================
  // Keyboard Shortcuts - 快捷键
  // ============================================

  registerShortcut(shortcut: Shortcut): void {
    this.keyboardShortcuts.register(shortcut);
  }

  getShortcuts(category?: string): Shortcut[] {
    if (category) {
      return this.keyboardShortcuts.getByCategory(category as any);
    }
    return this.keyboardShortcuts.getAll();
  }

  executeShortcut(key: string, modifiers?: string[]): boolean {
    return this.keyboardShortcuts.execute(key, modifiers as any);
  }

  // ============================================
  // Goal Manager - 目标管理
  // ============================================

  setWritingGoal(goal: WritingGoal): void {
    this.goalManager.setGoal(goal);
  }

  getCurrentGoal(): WritingGoal | null {
    return this.goalManager.getCurrentGoal();
  }

  recordWriting(words: number, date?: Date): void {
    this.goalManager.recordWriting(words, date);
  }

  getGoalStats(): GoalStats {
    return this.goalManager.getStats();
  }

  getStreak(): GoalStreak {
    return this.goalManager.getStreak();
  }

  // ============================================
  // Cost Tracker - 费用追踪
  // ============================================

  async recordCost(
    model: string,
    provider: string,
    inputTokens: number,
    outputTokens: number,
    operation: string,
    projectId?: string,
    chapterId?: string
  ): Promise<CostRecord> {
    return this.costTracker.recordCost(model, provider, inputTokens, outputTokens, operation, projectId, chapterId);
  }

  recordCostFromRecord(record: CostRecord): void {
    this.costTracker.record(record);
  }

  getCostStats(startDate?: Date, endDate?: Date, projectId?: string): CostStats {
    return this.costTracker.getStats(startDate, endDate, projectId);
  }

  predictMonthlyCost(): number {
    return this.costTracker.predictMonthlyCost();
  }

  checkAlerts(): CostAlert[] {
    return this.costTracker.checkAlerts();
  }

  setBudget(budget: CostBudget): void {
    this.costTracker.setBudget(budget);
  }

  getBudget(): CostBudget | null {
    return this.costTracker.getBudget();
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    return this.costTracker.estimateCost(model, inputTokens, outputTokens);
  }

  getCostRecords(limit?: number, offset?: number, filters?: {
    projectId?: string;
    model?: string;
    operation?: string;
    startDate?: Date;
    endDate?: Date;
  }): { records: CostRecord[]; total: number } {
    return this.costTracker.getRecords(limit, offset, filters);
  }

  onCostEvent(event: 'costRecorded' | 'alert' | 'budgetChanged', callback: (data: CostRecord | CostAlert | CostBudget) => void): void {
    this.costTracker.on(event, callback);
  }

  offCostEvent(event: 'costRecorded' | 'alert' | 'budgetChanged', callback: (data: CostRecord | CostAlert | CostBudget) => void): void {
    this.costTracker.off(event, callback);
  }

  exportCostRecords(format: 'json' | 'csv' = 'json'): string {
    return this.costTracker.exportRecords(format);
  }

  // ============================================
  // Snowflake Methodology - 雪花创作法
  // ============================================

  async executeSnowflakeStep(
    projectId: string,
    step: number,
    params?: Record<string, any>
  ): Promise<{ success: boolean; data?: any; message: string }> {
    return this.snowflakeMethodology.executeStep(projectId, step, params);
  }

  async initializeSnowflake(projectId: string): Promise<SnowflakeStep[]> {
    return this.snowflakeMethodology.initializeProject(projectId);
  }

  // ============================================
  // Web Scraper - 网页爬取
  // ============================================

  async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    const result = await this.webScraper.scrape(url);
    return result.success ? result.data || null : null;
  }

  async scrapeNovelChapter(url: string): Promise<{
    title: string;
    content: string;
    chapterNumber?: number;
    nextChapterUrl?: string;
    prevChapterUrl?: string;
  } | null> {
    const result = await this.webScraper.scrapeNovelChapter(url);
    return result.success ? result.data || null : null;
  }

  async scrapeBatchUrls(urls: string[]): Promise<ScrapedContent[]> {
    const results = await this.webScraper.scrapeBatch(urls);
    return results.filter(r => r.success && r.data).map(r => r.data!);
  }

  // ============================================
  // 模型配置查询
  // ============================================

  getAvailableModels(): string[] {
    return this.llmManager.listModels().map(m => m.name);
  }

  getModelCapability(modelName: string): any {
    return MODEL_CAPABILITIES[modelName] || null;
  }

  getAllCapabilities(): Record<string, any> {
    return MODEL_CAPABILITIES;
  }

  getDefaultModel(): string {
    const defaultConfig = getDefaultLLMConfig();
    return defaultConfig.name;
  }

  getAPIStatus(): { endpoint: string; status: string } {
    return {
      endpoint: API_CONFIG_INFO.endpoint,
      status: API_CONFIG_INFO.status
    };
  }

  setDefaultModel(modelName: string): void {
    this.llmManager.setDefault(modelName);
  }
}

export default CloudBook;
