"use strict";
/**
 * Cloud Book - 全能AI小说创作引擎
 * 完全原创，整合所有创作功能
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBook = void 0;
const NovelParser_1 = require("./modules/NovelParser/NovelParser");
const ImitationEngine_1 = require("./modules/ImitationEngine/ImitationEngine");
const AntiDetectionEngine_1 = require("./modules/AntiDetection/AntiDetectionEngine");
const LLMManager_1 = require("./modules/LLMProvider/LLMManager");
const AIAuditEngine_1 = require("./modules/AIAudit/AIAuditEngine");
const TruthFileManager_1 = require("./modules/TruthFiles/TruthFileManager");
const WritingPipeline_1 = require("./modules/WritingEngine/WritingPipeline");
const ContextManager_1 = require("./modules/ContextManager/ContextManager");
const WorldInfoManager_1 = require("./modules/WorldInfo/WorldInfoManager");
const MemoryManager_1 = require("./modules/Memory/MemoryManager");
const AutoDirector_1 = require("./modules/AutoDirector/AutoDirector");
const CreativeHub_1 = require("./modules/CreativeHub/CreativeHub");
const CardManager_1 = require("./modules/Card/CardManager");
const KnowledgeGraphManager_1 = require("./modules/KnowledgeGraph/KnowledgeGraphManager");
const AgentSystem_1 = require("./modules/AgentSystem/AgentSystem");
const DaemonService_1 = require("./modules/DaemonService/DaemonService");
const SevenStepMethodology_1 = require("./modules/SevenStepMethodology/SevenStepMethodology");
const GenreConfigManager_1 = require("./modules/GenreConfig/GenreConfigManager");
const PluginSystem_1 = require("./modules/PluginSystem/PluginSystem");
const CoverGenerator_1 = require("./modules/CoverGenerator/CoverGenerator");
const MindMapGenerator_1 = require("./modules/MindMapGenerator/MindMapGenerator");
const TrendAnalyzer_1 = require("./modules/TrendAnalyzer/TrendAnalyzer");
const I18nManager_1 = require("./modules/I18n/I18nManager");
const GlobalLiteraryConfig_1 = require("./modules/GlobalLiterary/GlobalLiteraryConfig");
const LocalAPIServer_1 = require("./modules/LocalAPI/LocalAPIServer");
const NetworkManager_1 = require("./modules/NetworkManager/NetworkManager");
const CacheManager_1 = require("./modules/CacheManager/CacheManager");
const VersionHistoryManager_1 = require("./modules/VersionHistory/VersionHistoryManager");
const LocalStorage_1 = require("./modules/LocalStorage/LocalStorage");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CloudBook {
    config;
    llmManager;
    parser;
    auditEngine;
    antiDetectionEngine;
    truthFileManager;
    contextManager;
    writingPipeline;
    worldInfoManager;
    memoryManager;
    autoDirector;
    creativeHub;
    cardManager;
    knowledgeGraphManager;
    agentSystem;
    daemonService;
    sevenStepMethodology;
    genreConfigManager;
    pluginSystem;
    coverGenerator;
    mindMapGenerator;
    trendAnalyzer;
    i18nManager;
    globalLiteraryConfig;
    localAPIServer;
    offlineLLMManager;
    networkManager;
    cacheManager;
    versionHistoryManager;
    localStorage;
    currentProject;
    projects = new Map();
    constructor(config) {
        this.config = config;
        this.llmManager = new LLMManager_1.LLMManager();
        for (const llmConfig of config.llmConfigs) {
            this.llmManager.addConfig(llmConfig);
        }
        this.llmManager.setRoutes(config.modelRoutes);
        this.parser = new NovelParser_1.NovelParser({
            encoding: 'utf-8',
            extractCharacters: true,
            extractWorldSettings: true,
            analyzeStyle: true
        });
        this.auditEngine = new AIAuditEngine_1.AIAuditEngine(config.auditConfig);
        this.antiDetectionEngine = new AntiDetectionEngine_1.AntiDetectionEngine(config.antiDetectionConfig);
        this.truthFileManager = new TruthFileManager_1.TruthFileManager();
        this.contextManager = new ContextManager_1.ContextManager();
        this.writingPipeline = new WritingPipeline_1.WritingPipeline(this.llmManager, this.auditEngine, this.antiDetectionEngine);
        this.worldInfoManager = new WorldInfoManager_1.WorldInfoManager(config.storagePath + '/worldinfo');
        this.memoryManager = new MemoryManager_1.MemoryManager(config.storagePath + '/memory');
        this.autoDirector = new AutoDirector_1.AutoDirector(this.llmManager);
        this.creativeHub = new CreativeHub_1.CreativeHub(this.llmManager, config.storagePath + '/creativehub');
        this.cardManager = new CardManager_1.CardManager(config.storagePath + '/cards');
        this.knowledgeGraphManager = new KnowledgeGraphManager_1.KnowledgeGraphManager(config.storagePath + '/knowledgegraph');
        this.agentSystem = new AgentSystem_1.AgentSystem(this.llmManager, this.auditEngine);
        this.sevenStepMethodology = new SevenStepMethodology_1.SevenStepMethodology(this.llmManager);
        this.genreConfigManager = new GenreConfigManager_1.GenreConfigManager();
        this.pluginSystem = new PluginSystem_1.PluginSystem(config.storagePath + '/plugins');
        this.coverGenerator = new CoverGenerator_1.CoverGenerator(this.llmManager);
        this.mindMapGenerator = new MindMapGenerator_1.MindMapGenerator();
        this.trendAnalyzer = new TrendAnalyzer_1.TrendAnalyzer(this.llmManager);
        this.i18nManager = new I18nManager_1.I18nManager({
            primary: config.i18nConfig?.primaryLanguage || 'zh-CN',
            fallback: config.i18nConfig?.fallbackLanguage || 'en-US',
            autoDetect: config.i18nConfig?.autoDetect ?? true
        });
        this.globalLiteraryConfig = new GlobalLiteraryConfig_1.GlobalLiteraryConfig();
        this.networkManager = new NetworkManager_1.NetworkManager();
        this.cacheManager = new CacheManager_1.CacheManager({ storageKey: 'cloudbook_cache', maxSize: 1000, ttl: 3600000 });
        this.versionHistoryManager = new VersionHistoryManager_1.VersionHistoryManager(config.storagePath + '/versioning');
        this.localStorage = new LocalStorage_1.LocalStorage({ basePath: config.storagePath || './cloud-book-data' });
        if (config.connectionMode === 'offline' || config.connectionMode === 'hybrid') {
            this.initializeOfflineMode(config.localAPIConfig);
        }
        if (config.daemonConfig?.enabled) {
            this.daemonService = new DaemonService_1.DaemonService({
                enabled: true,
                intervalMinutes: config.daemonConfig.intervalMinutes || 5,
                notifications: {},
                autoRetry: true,
                maxRetries: 3
            }, this.llmManager, config.storagePath + '/daemon');
        }
    }
    async initializeOfflineMode(config) {
        if (config?.apiKeys && config.apiKeys.length > 0) {
            this.offlineLLMManager = new LocalAPIServer_1.OfflineLLMManager(config.apiKeys);
            await this.offlineLLMManager.initializeOfflineServer(config.port || 8080);
        }
    }
    // ============================================
    // 多语言和本地化功能
    // ============================================
    setLanguage(language) {
        this.i18nManager.setLocale(language);
    }
    getLanguage() {
        return this.i18nManager.getLocale();
    }
    detectLanguage(text) {
        return this.i18nManager.detectLanguage(text);
    }
    async checkGrammar(text) {
        const checker = new I18nManager_1.GrammarChecker(this.i18nManager.getLocale(), this.llmManager);
        return checker.checkGrammar(text);
    }
    getSupportedLanguages() {
        return this.i18nManager.getSupportedLanguages();
    }
    translate(key, params) {
        return this.i18nManager.t(key, params);
    }
    // ============================================
    // 全球文学功能
    // ============================================
    getGlobalGenreConfig(genre) {
        return this.globalLiteraryConfig.getGenreConfig(genre);
    }
    getGlobalGenres() {
        return this.globalLiteraryConfig.getAllGenres();
    }
    searchGenres(query, language) {
        return this.globalLiteraryConfig.searchGenres(query, language || this.i18nManager.getLocale());
    }
    // ============================================
    // 网络和缓存功能
    // ============================================
    async getNetworkStatus() {
        return this.networkManager.getStatus();
    }
    async checkConnection() {
        return this.networkManager.checkConnection();
    }
    onNetworkChange(callback) {
        return this.networkManager.onStatusChange(callback);
    }
    async getCacheStats() {
        return this.cacheManager.getStats();
    }
    clearCache() {
        this.cacheManager.clear();
    }
    // ============================================
    // 版本历史功能
    // ============================================
    async createVersion(projectId, content, summary) {
        return this.versionHistoryManager.createVersion(projectId, content, { summary });
    }
    async getVersionHistory(projectId, limit) {
        return this.versionHistoryManager.getVersionHistory(projectId, { limit });
    }
    async restoreVersion(projectId, versionId) {
        return this.versionHistoryManager.restoreVersion(projectId, versionId);
    }
    async createBranch(projectId, name, description) {
        return this.versionHistoryManager.createBranch(projectId, name, description);
    }
    async compareVersions(projectId, v1, v2) {
        return this.versionHistoryManager.compareVersions(projectId, v1, v2);
    }
    // ============================================
    // 项目管理 - 基础功能
    // ============================================
    async createProject(title, genre, writingMode = 'original') {
        // 使用 LocalStorage 持久化
        const projectData = await this.localStorage.createProject({
            title,
            genre: genre,
            creationMode: writingMode,
            language: this.i18nManager.getLocale()
        });
        const project = {
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
    async importNovel(filePath) {
        return this.parser.parse(filePath);
    }
    async listProjects() {
        return this.localStorage.listProjects();
    }
    async loadProject(projectId) {
        const projectData = await this.localStorage.getProject(projectId);
        if (!projectData) {
            return null;
        }
        const project = {
            id: projectData.id,
            title: projectData.title,
            genre: projectData.genre,
            literaryGenre: 'novel',
            writingMode: projectData.creationMode,
            status: 'writing',
            createdAt: new Date(projectData.createdAt),
            updatedAt: new Date(projectData.updatedAt),
            chapters: projectData.chapters.map((c) => ({
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
                genre: projectData.genre,
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
    async deleteProject(projectId) {
        this.projects.delete(projectId);
        return this.localStorage.deleteProject(projectId);
    }
    async exportChapter(projectId, chapterId, format) {
        return this.localStorage.exportChapter(projectId, chapterId, format);
    }
    async createImitationProject(parseResult, mode, imitationLevel = 70) {
        const config = {
            sourceParseResult: parseResult,
            mode,
            imitationLevel
        };
        const engine = new ImitationEngine_1.ImitationEngine(config);
        engine.setLLMProvider(this.llmManager);
        const project = {
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
            characters: parseResult.characters.map((c) => ({
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
    async addWorldInfo(projectId, info) {
        return this.worldInfoManager.addWorldInfo(projectId, info);
    }
    async getWorldInfo(projectId, keywords) {
        return this.worldInfoManager.getWorldInfo(projectId, { keywords });
    }
    async buildWorldInfoContext(projectId, context) {
        return this.worldInfoManager.buildContextPrompt(projectId, context);
    }
    // ============================================
    // Memory 管理 (KoboldAI-Client)
    // ============================================
    async addMemory(projectId, content, type) {
        return this.memoryManager.addMemory(projectId, content, type);
    }
    async buildMemoryContext(projectId, context) {
        return this.memoryManager.buildMemoryContext(projectId, context || {});
    }
    async getMemories(projectId) {
        return this.memoryManager.getAllMemories(projectId);
    }
    // ============================================
    // Auto Director (AI-Novel-Writing-Assistant)
    // ============================================
    async analyzeTrends() {
        return this.autoDirector.analyzeTrends();
    }
    async generateDirections(project, count = 3) {
        return this.autoDirector.generateDirections(project, count);
    }
    async createProjectPlan(direction, config) {
        return this.autoDirector.createProjectPlan(direction, config);
    }
    async generateChapterPlan(direction, totalChapters = 100) {
        return this.autoDirector.generateChapterPlan(direction, totalChapters);
    }
    // ============================================
    // Creative Hub (AI-Novel-Writing-Assistant)
    // ============================================
    async createCreativeSession(projectId) {
        return this.creativeHub.createSession(projectId);
    }
    async sendCreativeMessage(sessionId, content) {
        return this.creativeHub.sendMessage(sessionId, content);
    }
    async addToRAG(projectId, document) {
        return this.creativeHub.addRAGDocument(projectId, {
            content: document.content,
            metadata: { type: document.type, sourceId: document.sourceId }
        });
    }
    async searchRAG(projectId, query) {
        return this.creativeHub.searchRAG(projectId, query);
    }
    // ============================================
    // Card Manager (NovelForge)
    // ============================================
    async createCard(projectId, type, title, content, parentId) {
        return this.cardManager.createCard(projectId, type, title, content, parentId);
    }
    async getCards(projectId, type) {
        if (type) {
            return this.cardManager.getCardsByType(projectId, type);
        }
        return this.cardManager.getAllCards(projectId);
    }
    async searchCards(projectId, query) {
        return this.cardManager.searchCards(projectId, query);
    }
    // ============================================
    // Knowledge Graph (NovelForge/Neo4j)
    // ============================================
    async addCharacterToGraph(projectId, character) {
        return this.knowledgeGraphManager.addCharacterNode(projectId, character);
    }
    async addLocationToGraph(projectId, location) {
        return this.knowledgeGraphManager.addLocationNode(projectId, location);
    }
    async addFactionToGraph(projectId, faction) {
        return this.knowledgeGraphManager.addFactionNode(projectId, faction);
    }
    async addRelation(projectId, source, target, type) {
        return this.knowledgeGraphManager.addRelation(projectId, source, target, type);
    }
    async findPath(projectId, from, to) {
        return this.knowledgeGraphManager.findPath(projectId, from, to);
    }
    async getCharacterNetwork(projectId, characterId, depth) {
        return this.knowledgeGraphManager.getCharacterNetwork(projectId, characterId, depth || 2);
    }
    async exportGraph(projectId) {
        return this.knowledgeGraphManager.exportGraph(projectId);
    }
    // ============================================
    // Agent System (InkOS)
    // ============================================
    getAgents() {
        return this.agentSystem.getAllAgents();
    }
    async executeArchitectTask(project, task, params) {
        return this.agentSystem.executeArchitectTask(project, task, params);
    }
    async executeWriterTask(project, chapterNumber, options) {
        return this.agentSystem.executeWriterTask(project, chapterNumber, options);
    }
    async executeAuditorTask(content, truthFiles, autoFix) {
        return this.agentSystem.executeAuditorTask(content, truthFiles, { autoFix });
    }
    async executePipeline(project, chapterNumber) {
        return this.agentSystem.executePipeline(project, chapterNumber);
    }
    // ============================================
    // Seven Step Methodology (novel-writer)
    // ============================================
    async executeMethodologyStep(projectId, step, params) {
        return this.sevenStepMethodology.executeStep(projectId, step, params);
    }
    getMethodologyProgress(projectId) {
        return this.sevenStepMethodology.getProgress(projectId);
    }
    getMethodologyNextAction(projectId) {
        return this.sevenStepMethodology.getNextAction(projectId);
    }
    // ============================================
    // 题材配置
    // ============================================
    getGenreTemplates() {
        return this.genreConfigManager.getAllTemplates();
    }
    getGenreTemplate(genre) {
        return this.genreConfigManager.getTemplate(genre);
    }
    getGenreGuidance(genre) {
        return this.genreConfigManager.getWritingGuidance(genre);
    }
    // ============================================
    // Plugin System
    // ============================================
    async registerPlugin(plugin) {
        return this.pluginSystem.register(plugin);
    }
    async executePluginCommand(commandName, args, context) {
        return this.pluginSystem.executeCommand(commandName, args, context || {});
    }
    getPluginCommands() {
        return this.pluginSystem.getAllCommands();
    }
    // ============================================
    // Cover Generator
    // ============================================
    async generateCoverDesign(project, config) {
        return this.coverGenerator.generateDesign(project, config);
    }
    async generateCoverPrompt(project, config) {
        return this.coverGenerator.generateImagePrompt(project, config);
    }
    // ============================================
    // Mind Map Generator
    // ============================================
    async generateProjectMindMap(project) {
        return this.mindMapGenerator.generateProjectMindMap(project);
    }
    async generateCharacterRelationMap(characters) {
        return this.mindMapGenerator.generateCharacterRelationshipMap(characters);
    }
    async generateChapterOutlineMap(chapters) {
        return this.mindMapGenerator.generateChapterOutlineMap(chapters);
    }
    // ============================================
    // Trend Analyzer
    // ============================================
    async analyzeMarketTrends(platform, genre) {
        return this.trendAnalyzer.analyzeTrends(platform, genre);
    }
    async analyzeCompetitor(bookInfo) {
        return this.trendAnalyzer.analyzeCompetitor(bookInfo);
    }
    async generateInspiration(genre, type) {
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
    async scheduleTask(task) {
        if (this.daemonService) {
            return this.daemonService.addTask(task);
        }
    }
    getNotifications(unreadOnly) {
        if (this.daemonService) {
            return this.daemonService.getNotifications(unreadOnly);
        }
        return [];
    }
    // ============================================
    // 写作核心功能
    // ============================================
    async generateChapter(projectId, chapterNumber, options) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const context = await this.buildContext(project, chapterNumber);
        if (project.writingMode === 'imitation' ||
            project.writingMode === 'derivative' ||
            project.writingMode === 'fanfic') {
            const imitationEngine = new ImitationEngine_1.ImitationEngine({
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
            const outline = await imitationEngine.generateOutline(chapterNumber, project.worldSetting, project.characters || [], project.chapters?.[chapterNumber - 2]?.summary);
            const content = await imitationEngine.generateImitation(context);
            let auditResult;
            if (options?.autoAudit !== false) {
                auditResult = await this.auditEngine.audit(content, await this.truthFileManager.getTruthFiles(projectId));
            }
            let finalContent = content;
            if (options?.autoHumanize) {
                finalContent = await this.antiDetectionEngine.humanize(content, this.llmManager);
            }
            const chapter = {
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
                status: chapter.status,
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
                status: result.chapter.status,
                wordCount: result.chapter.wordCount
            });
        }
        return result.chapter;
    }
    async batchGenerateChapters(projectId, startChapter, count, options) {
        const chapters = [];
        const parallelCount = options?.parallelCount || 3;
        for (let i = 0; i < count; i += parallelCount) {
            const batch = Math.min(parallelCount, count - i);
            const promises = [];
            for (let j = 0; j < batch; j++) {
                promises.push(this.generateChapter(projectId, startChapter + i + j, options)
                    .catch(err => ({ error: err.message })));
            }
            const results = await Promise.all(promises);
            chapters.push(...results.filter(r => !r.error));
        }
        return chapters;
    }
    async auditChapter(projectId, chapterId) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const chapter = project.chapters?.find(c => c.id === chapterId);
        if (!chapter)
            throw new Error('Chapter not found');
        const truthFiles = await this.truthFileManager.getTruthFiles(projectId);
        return this.auditEngine.audit(chapter.content, truthFiles);
    }
    async reviseChapter(projectId, chapterId, auditResult) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const chapter = project.chapters?.find(c => c.id === chapterId);
        if (!chapter)
            throw new Error('Chapter not found');
        const revisedContent = await this.writingPipeline.reviseChapter(chapter.content, auditResult || chapter.auditResult, await this.truthFileManager.getTruthFiles(projectId));
        chapter.content = revisedContent;
        chapter.status = 'draft';
        chapter.auditResult = undefined;
        chapter.updatedAt = new Date();
        return chapter;
    }
    detectAI(text) {
        return this.antiDetectionEngine.detectAI(text);
    }
    async humanize(text) {
        return this.antiDetectionEngine.humanize(text, this.llmManager);
    }
    // ============================================
    // 项目管理辅助功能
    // ============================================
    async buildContext(project, chapterNumber) {
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
    async saveProject(projectId, storagePath) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const basePath = storagePath || this.config.storagePath || './projects';
        const filePath = path.join(basePath, `${projectId}.json`);
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
    }
    getProject(projectId) {
        return this.projects.get(projectId);
    }
    getAllProjects() {
        return Array.from(this.projects.values());
    }
    getCurrentProject() {
        return this.currentProject;
    }
    setCurrentProject(projectId) {
        this.currentProject = this.projects.get(projectId);
    }
    addModel(config) {
        this.llmManager.addConfig(config);
        if (!this.config.llmConfigs.find(c => c.name === config.name)) {
            this.config.llmConfigs.push(config);
        }
    }
    updateRoutes(routes) {
        this.llmManager.setRoutes(routes);
        this.config.modelRoutes = routes;
    }
    async exportProject(projectId, format, storagePath) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const basePath = storagePath || this.config.storagePath || './exports';
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
        const fileName = `${project.title}.${format}`;
        const filePath = path.join(basePath, fileName);
        let content = '';
        if (format === 'json') {
            content = JSON.stringify(project, null, 2);
        }
        else if (format === 'md') {
            content = this.projectToMarkdown(project);
        }
        else {
            content = this.projectToText(project);
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        return filePath;
    }
    projectToMarkdown(project) {
        let md = `# ${project.title}\n\n`;
        if (project.subtitle)
            md += `## ${project.subtitle}\n\n`;
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
                if (char.personality)
                    md += `${char.personality}\n\n`;
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
    projectToText(project) {
        let text = `${project.title}\n\n`;
        for (const chapter of project.chapters || []) {
            text += `${chapter.title}\n\n`;
            text += `${chapter.content}\n\n`;
        }
        return text;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    toChineseNumber(num) {
        const units = ['', '十', '百', '千', '万'];
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (num === 0)
            return '零';
        let result = '';
        let unitIndex = 0;
        while (num > 0) {
            const digit = num % 10;
            if (digit !== 0) {
                result = digits[digit] + units[unitIndex] + result;
            }
            else if (result && !result.startsWith('零')) {
                result = '零' + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }
        return result.replace(/零+$/, '');
    }
    countWords(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
}
exports.CloudBook = CloudBook;
exports.default = CloudBook;
//# sourceMappingURL=CloudBook.js.map