"use strict";
/**
 * Cloud Book - 核心导出
 * 全能AI小说创作引擎
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionHistoryManager = exports.MultiLevelCache = exports.CacheManager = exports.NetworkManager = exports.OfflineLLMManager = exports.LocalAPIServer = exports.GlobalLiteraryConfig = exports.SpellChecker = exports.GrammarChecker = exports.I18nManager = exports.TrendAnalyzer = exports.MindMapGenerator = exports.CoverGenerator = exports.PluginSystem = exports.GenreConfigManager = exports.SevenStepMethodology = exports.DaemonService = exports.AgentSystem = exports.KnowledgeGraphManager = exports.CardManager = exports.CreativeHub = exports.AutoDirector = exports.MemoryManager = exports.WorldInfoManager = exports.ContextManager = exports.WritingPipeline = exports.TruthFileManager = exports.AIAuditEngine = exports.LLMManager = exports.AntiDetectionEngine = exports.ImitationEngine = exports.NovelParser = exports.CloudBook = void 0;
var CloudBook_1 = require("./CloudBook");
Object.defineProperty(exports, "CloudBook", { enumerable: true, get: function () { return CloudBook_1.CloudBook; } });
__exportStar(require("./types"), exports);
var NovelParser_1 = require("./modules/NovelParser/NovelParser");
Object.defineProperty(exports, "NovelParser", { enumerable: true, get: function () { return NovelParser_1.NovelParser; } });
var ImitationEngine_1 = require("./modules/ImitationEngine/ImitationEngine");
Object.defineProperty(exports, "ImitationEngine", { enumerable: true, get: function () { return ImitationEngine_1.ImitationEngine; } });
var AntiDetectionEngine_1 = require("./modules/AntiDetection/AntiDetectionEngine");
Object.defineProperty(exports, "AntiDetectionEngine", { enumerable: true, get: function () { return AntiDetectionEngine_1.AntiDetectionEngine; } });
var LLMManager_1 = require("./modules/LLMProvider/LLMManager");
Object.defineProperty(exports, "LLMManager", { enumerable: true, get: function () { return LLMManager_1.LLMManager; } });
var AIAuditEngine_1 = require("./modules/AIAudit/AIAuditEngine");
Object.defineProperty(exports, "AIAuditEngine", { enumerable: true, get: function () { return AIAuditEngine_1.AIAuditEngine; } });
var TruthFileManager_1 = require("./modules/TruthFiles/TruthFileManager");
Object.defineProperty(exports, "TruthFileManager", { enumerable: true, get: function () { return TruthFileManager_1.TruthFileManager; } });
var WritingPipeline_1 = require("./modules/WritingEngine/WritingPipeline");
Object.defineProperty(exports, "WritingPipeline", { enumerable: true, get: function () { return WritingPipeline_1.WritingPipeline; } });
var ContextManager_1 = require("./modules/ContextManager/ContextManager");
Object.defineProperty(exports, "ContextManager", { enumerable: true, get: function () { return ContextManager_1.ContextManager; } });
var WorldInfoManager_1 = require("./modules/WorldInfo/WorldInfoManager");
Object.defineProperty(exports, "WorldInfoManager", { enumerable: true, get: function () { return WorldInfoManager_1.WorldInfoManager; } });
var MemoryManager_1 = require("./modules/Memory/MemoryManager");
Object.defineProperty(exports, "MemoryManager", { enumerable: true, get: function () { return MemoryManager_1.MemoryManager; } });
var AutoDirector_1 = require("./modules/AutoDirector/AutoDirector");
Object.defineProperty(exports, "AutoDirector", { enumerable: true, get: function () { return AutoDirector_1.AutoDirector; } });
var CreativeHub_1 = require("./modules/CreativeHub/CreativeHub");
Object.defineProperty(exports, "CreativeHub", { enumerable: true, get: function () { return CreativeHub_1.CreativeHub; } });
var CardManager_1 = require("./modules/Card/CardManager");
Object.defineProperty(exports, "CardManager", { enumerable: true, get: function () { return CardManager_1.CardManager; } });
var KnowledgeGraphManager_1 = require("./modules/KnowledgeGraph/KnowledgeGraphManager");
Object.defineProperty(exports, "KnowledgeGraphManager", { enumerable: true, get: function () { return KnowledgeGraphManager_1.KnowledgeGraphManager; } });
var AgentSystem_1 = require("./modules/AgentSystem/AgentSystem");
Object.defineProperty(exports, "AgentSystem", { enumerable: true, get: function () { return AgentSystem_1.AgentSystem; } });
var DaemonService_1 = require("./modules/DaemonService/DaemonService");
Object.defineProperty(exports, "DaemonService", { enumerable: true, get: function () { return DaemonService_1.DaemonService; } });
var SevenStepMethodology_1 = require("./modules/SevenStepMethodology/SevenStepMethodology");
Object.defineProperty(exports, "SevenStepMethodology", { enumerable: true, get: function () { return SevenStepMethodology_1.SevenStepMethodology; } });
var GenreConfigManager_1 = require("./modules/GenreConfig/GenreConfigManager");
Object.defineProperty(exports, "GenreConfigManager", { enumerable: true, get: function () { return GenreConfigManager_1.GenreConfigManager; } });
var PluginSystem_1 = require("./modules/PluginSystem/PluginSystem");
Object.defineProperty(exports, "PluginSystem", { enumerable: true, get: function () { return PluginSystem_1.PluginSystem; } });
var CoverGenerator_1 = require("./modules/CoverGenerator/CoverGenerator");
Object.defineProperty(exports, "CoverGenerator", { enumerable: true, get: function () { return CoverGenerator_1.CoverGenerator; } });
var MindMapGenerator_1 = require("./modules/MindMapGenerator/MindMapGenerator");
Object.defineProperty(exports, "MindMapGenerator", { enumerable: true, get: function () { return MindMapGenerator_1.MindMapGenerator; } });
var TrendAnalyzer_1 = require("./modules/TrendAnalyzer/TrendAnalyzer");
Object.defineProperty(exports, "TrendAnalyzer", { enumerable: true, get: function () { return TrendAnalyzer_1.TrendAnalyzer; } });
var I18nManager_1 = require("./modules/I18n/I18nManager");
Object.defineProperty(exports, "I18nManager", { enumerable: true, get: function () { return I18nManager_1.I18nManager; } });
Object.defineProperty(exports, "GrammarChecker", { enumerable: true, get: function () { return I18nManager_1.GrammarChecker; } });
Object.defineProperty(exports, "SpellChecker", { enumerable: true, get: function () { return I18nManager_1.SpellChecker; } });
var GlobalLiteraryConfig_1 = require("./modules/GlobalLiterary/GlobalLiteraryConfig");
Object.defineProperty(exports, "GlobalLiteraryConfig", { enumerable: true, get: function () { return GlobalLiteraryConfig_1.GlobalLiteraryConfig; } });
var LocalAPIServer_1 = require("./modules/LocalAPI/LocalAPIServer");
Object.defineProperty(exports, "LocalAPIServer", { enumerable: true, get: function () { return LocalAPIServer_1.LocalAPIServer; } });
Object.defineProperty(exports, "OfflineLLMManager", { enumerable: true, get: function () { return LocalAPIServer_1.OfflineLLMManager; } });
var NetworkManager_1 = require("./modules/NetworkManager/NetworkManager");
Object.defineProperty(exports, "NetworkManager", { enumerable: true, get: function () { return NetworkManager_1.NetworkManager; } });
var CacheManager_1 = require("./modules/CacheManager/CacheManager");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return CacheManager_1.CacheManager; } });
Object.defineProperty(exports, "MultiLevelCache", { enumerable: true, get: function () { return CacheManager_1.MultiLevelCache; } });
var VersionHistoryManager_1 = require("./modules/VersionHistory/VersionHistoryManager");
Object.defineProperty(exports, "VersionHistoryManager", { enumerable: true, get: function () { return VersionHistoryManager_1.VersionHistoryManager; } });
//# sourceMappingURL=index.js.map