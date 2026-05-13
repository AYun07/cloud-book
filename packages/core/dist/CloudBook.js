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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBook = void 0;
const NovelParser_1 = __importDefault(require("./modules/NovelParser/NovelParser"));
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
const CreativeHub_1 = __importDefault(require("./modules/CreativeHub/CreativeHub"));
const CardManager_1 = require("./modules/Card/CardManager");
const KnowledgeGraphManager_1 = __importDefault(require("./modules/KnowledgeGraphManager/KnowledgeGraphManager"));
const AgentSystem_1 = require("./modules/AgentSystem/AgentSystem");
const DaemonService_1 = require("./modules/DaemonService/DaemonService");
const SevenStepMethodology_1 = require("./modules/SevenStepMethodology/SevenStepMethodology");
const GenreConfigManager_1 = require("./modules/GenreConfig/GenreConfigManager");
const PluginSystem_1 = require("./modules/PluginSystem/PluginSystem");
const CoverGenerator_1 = require("./modules/CoverGenerator/CoverGenerator");
const MindMapGenerator_1 = require("./modules/MindMapGenerator/MindMapGenerator");
const TrendAnalyzer_1 = require("./modules/TrendAnalyzer/TrendAnalyzer");
const I18nManager_1 = require("./modules/I18nManager/I18nManager");
const GlobalLiteraryConfig_1 = require("./modules/GlobalLiterary/GlobalLiteraryConfig");
const LocalAPIServer_1 = require("./modules/LocalAPI/LocalAPIServer");
const NetworkManager_1 = require("./modules/NetworkManager/NetworkManager");
const CacheManager_1 = require("./modules/CacheManager/CacheManager");
const VersionHistoryManager_1 = require("./modules/VersionHistory/VersionHistoryManager");
const LocalStorage_1 = require("./modules/LocalStorage/LocalStorage");
const ExportManager_1 = require("./modules/ExportManager/ExportManager");
const ImportManager_1 = require("./modules/ImportManager/ImportManager");
const KeyboardShortcuts_1 = require("./modules/KeyboardShortcuts/KeyboardShortcuts");
const GoalManager_1 = require("./modules/GoalManager/GoalManager");
const CostTracker_1 = require("./modules/CostTracker/CostTracker");
const SnowflakeMethodology_1 = require("./modules/SnowflakeMethodology/SnowflakeMethodology");
const WebScraper_1 = require("./modules/WebScraper/WebScraper");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const model_config_1 = require("./config/model-config");
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
    // 新增模块
    exportManager;
    importManager;
    keyboardShortcuts;
    goalManager;
    costTracker;
    snowflakeMethodology;
    webScraper;
    currentProject;
    projects = new Map();
    constructor(config) {
        this.config = config;
        const llmConfigs = config.useDefaultModels ? (0, model_config_1.createModelConfigs)() : config.llmConfigs;
        const modelRoutes = config.useDefaultModels ? (0, model_config_1.createModelRoutes)() : config.modelRoutes;
        this.llmManager = new LLMManager_1.LLMManager();
        for (const llmConfig of llmConfigs) {
            this.llmManager.addConfig(llmConfig);
        }
        this.llmManager.setRoutes(modelRoutes);
        this.parser = new NovelParser_1.default({
            extractCharacters: true,
            extractSetting: true
        });
        this.auditEngine = new AIAuditEngine_1.AIAuditEngine(config.auditConfig);
        this.antiDetectionEngine = new AntiDetectionEngine_1.AntiDetectionEngine(config.antiDetectionConfig);
        this.truthFileManager = new TruthFileManager_1.TruthFileManager();
        this.contextManager = new ContextManager_1.ContextManager();
        this.writingPipeline = new WritingPipeline_1.WritingPipeline(this.llmManager, this.auditEngine, this.antiDetectionEngine);
        this.worldInfoManager = new WorldInfoManager_1.WorldInfoManager(config.storagePath + '/worldinfo');
        this.memoryManager = new MemoryManager_1.MemoryManager(config.storagePath + '/memory');
        this.autoDirector = new AutoDirector_1.AutoDirector(this.llmManager);
        this.creativeHub = new CreativeHub_1.default({ provider: 'openai' });
        this.creativeHub.setLLMProvider(this.llmManager);
        this.cardManager = new CardManager_1.CardManager(config.storagePath + '/cards');
        this.knowledgeGraphManager = new KnowledgeGraphManager_1.default();
        this.agentSystem = new AgentSystem_1.AgentSystem(this.llmManager, this.auditEngine);
        this.sevenStepMethodology = new SevenStepMethodology_1.SevenStepMethodology(this.llmManager);
        this.genreConfigManager = new GenreConfigManager_1.GenreConfigManager();
        this.pluginSystem = new PluginSystem_1.PluginSystem(config.storagePath + '/plugins');
        this.coverGenerator = new CoverGenerator_1.CoverGenerator(this.llmManager);
        this.mindMapGenerator = new MindMapGenerator_1.MindMapGenerator();
        this.trendAnalyzer = new TrendAnalyzer_1.TrendAnalyzer(this.llmManager);
        this.i18nManager = new I18nManager_1.I18nManager(config.i18nConfig?.primaryLanguage || 'zh-CN');
        this.globalLiteraryConfig = new GlobalLiteraryConfig_1.GlobalLiteraryConfig();
        this.networkManager = new NetworkManager_1.NetworkManager();
        this.cacheManager = new CacheManager_1.CacheManager({ storageKey: 'cloudbook_cache', maxSize: 1000, ttl: 3600000 });
        this.versionHistoryManager = new VersionHistoryManager_1.VersionHistoryManager(config.storagePath + '/versioning');
        this.localStorage = new LocalStorage_1.LocalStorage({ basePath: config.storagePath || './cloud-book-data' });
        // 初始化新增模块
        this.exportManager = new ExportManager_1.ExportManager();
        this.importManager = new ImportManager_1.ImportManager();
        this.keyboardShortcuts = new KeyboardShortcuts_1.KeyboardShortcuts();
        this.goalManager = new GoalManager_1.GoalManager();
        this.costTracker = new CostTracker_1.CostTracker();
        this.snowflakeMethodology = new SnowflakeMethodology_1.SnowflakeMethodology(this.llmManager);
        this.webScraper = new WebScraper_1.WebScraper();
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
        const languageRanges = [
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
        const charLangCounts = {};
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
        const langRatios = {};
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
        const langNameMap = {
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
    async checkGrammar(text) {
        const errors = [];
        const suggestions = [];
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
        const starterCounts = {};
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
        }
        else if (ratio > 0.5) {
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
    getSupportedLanguages() {
        return this.i18nManager.getAvailableLocales();
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
        await this.truthFileManager.initialize(project.id);
        await this.sevenStepMethodology.initializeProject(project.id);
        project.genreConfig = await this.genreConfigManager.createProjectConfig(genre);
        return project;
    }
    async importNovel(filePath) {
        return this.parser.parseString(filePath);
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
        await this.truthFileManager.initialize(project.id);
        return project;
    }
    async deleteProject(projectId) {
        this.projects.delete(projectId);
        return this.localStorage.deleteProject(projectId);
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
        return { sessionId: projectId };
    }
    async sendCreativeMessage(sessionId, content) {
        return this.llmManager.complete(content);
    }
    async addToRAG(projectId, document) {
        return this.creativeHub.addDocument(document.content, {
            type: document.type, sourceId: document.sourceId, createdAt: new Date()
        });
    }
    async searchRAG(projectId, query) {
        return this.creativeHub.search(query);
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
        return this.knowledgeGraphManager.addNode('character', projectId, character);
    }
    async addLocationToGraph(projectId, location) {
        return this.knowledgeGraphManager.addNode('location', projectId, location);
    }
    async addFactionToGraph(projectId, faction) {
        return this.knowledgeGraphManager.addNode('faction', projectId, faction);
    }
    async addRelation(projectId, source, target, type) {
        return this.knowledgeGraphManager.addRelationship(source, target, type);
    }
    async findPath(projectId, from, to) {
        return this.knowledgeGraphManager.findShortestPath(from, to);
    }
    async getCharacterNetwork(projectId, characterId, depth) {
        return this.knowledgeGraphManager.traverseBFS(characterId, { maxDepth: depth || 2 });
    }
    async exportGraph(projectId) {
        return this.knowledgeGraphManager.exportToJSON();
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
    // ============================================
    // Export Manager - 导出功能
    // ============================================
    async exportProjectFull(projectId, format, config) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        return this.exportManager.exportProject(project, format, config);
    }
    async exportChapter(projectId, chapterId, format) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const chapter = project.chapters?.find(c => c.id === chapterId);
        if (!chapter)
            throw new Error('Chapter not found');
        return this.exportManager.exportChapter(chapter, format);
    }
    getExportFormats() {
        return this.exportManager.getSupportedFormats();
    }
    // ============================================
    // Import Manager - 导入功能
    // ============================================
    async importProjectFromFile(filePath, format) {
        const imported = await this.importManager.importProject(filePath, format);
        this.projects.set(imported.id, imported);
        return imported;
    }
    async importChapterFromFile(projectId, filePath, format) {
        const project = this.projects.get(projectId);
        if (!project)
            throw new Error('Project not found');
        const chapter = await this.importManager.importChapter(filePath, format);
        project.chapters = project.chapters || [];
        project.chapters.push(chapter);
        return chapter;
    }
    detectImportFormat(filePath) {
        return this.importManager.detectFormat(filePath);
    }
    // ============================================
    // Keyboard Shortcuts - 快捷键
    // ============================================
    registerShortcut(shortcut) {
        this.keyboardShortcuts.register(shortcut);
    }
    getShortcuts(category) {
        if (category) {
            return this.keyboardShortcuts.getByCategory(category);
        }
        return this.keyboardShortcuts.getAll();
    }
    executeShortcut(key, modifiers) {
        return this.keyboardShortcuts.execute(key, modifiers);
    }
    // ============================================
    // Goal Manager - 目标管理
    // ============================================
    setWritingGoal(goal) {
        this.goalManager.setGoal(goal);
    }
    getCurrentGoal() {
        return this.goalManager.getCurrentGoal();
    }
    recordWriting(words, date) {
        this.goalManager.recordWriting(words, date);
    }
    getGoalStats() {
        return this.goalManager.getStats();
    }
    getStreak() {
        return this.goalManager.getStreak();
    }
    // ============================================
    // Cost Tracker - 费用追踪
    // ============================================
    recordCost(record) {
        this.costTracker.record(record);
    }
    getCostStats() {
        return this.costTracker.getStats();
    }
    setBudget(budget) {
        this.costTracker.setBudget(budget);
    }
    getBudget() {
        return this.costTracker.getBudget();
    }
    // ============================================
    // Snowflake Methodology - 雪花创作法
    // ============================================
    async executeSnowflakeStep(projectId, step, params) {
        return this.snowflakeMethodology.executeStep(projectId, step, params);
    }
    async initializeSnowflake(projectId) {
        return this.snowflakeMethodology.initializeProject(projectId);
    }
    // ============================================
    // Web Scraper - 网页爬取
    // ============================================
    async scrapeUrl(url) {
        const result = await this.webScraper.scrape(url);
        return result.success ? result.data || null : null;
    }
    async scrapeNovelChapter(url) {
        const result = await this.webScraper.scrapeNovelChapter(url);
        return result.success ? result.data || null : null;
    }
    async scrapeBatchUrls(urls) {
        const results = await this.webScraper.scrapeBatch(urls);
        return results.filter(r => r.success && r.data).map(r => r.data);
    }
    // ============================================
    // 模型配置查询
    // ============================================
    getAvailableModels() {
        return this.llmManager.listModels().map(m => m.name);
    }
    getModelCapability(modelName) {
        return model_config_1.MODEL_CAPABILITIES[modelName] || null;
    }
    getAllCapabilities() {
        return model_config_1.MODEL_CAPABILITIES;
    }
    getDefaultModel() {
        const defaultConfig = (0, model_config_1.getDefaultLLMConfig)();
        return defaultConfig.name;
    }
    getAPIStatus() {
        return {
            endpoint: model_config_1.API_CONFIG_INFO.endpoint,
            status: model_config_1.API_CONFIG_INFO.status
        };
    }
    setDefaultModel(modelName) {
        this.llmManager.setDefault(modelName);
    }
}
exports.CloudBook = CloudBook;
exports.default = CloudBook;
//# sourceMappingURL=CloudBook.js.map