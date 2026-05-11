"use strict";
/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性
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
exports.TruthFileManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TruthFileManager {
    storagePath;
    constructor(storagePath = './truth-files') {
        this.storagePath = storagePath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
    }
    /**
     * 初始化项目的真相文件
     */
    async initialize(projectId) {
        const truthFiles = {
            currentState: {
                protagonist: {
                    id: '',
                    name: '',
                    location: '',
                    status: ''
                },
                knownFacts: [],
                currentConflicts: [],
                relationshipSnapshot: {},
                activeSubplots: []
            },
            particleLedger: [],
            pendingHooks: [],
            chapterSummaries: [],
            subplotBoard: [],
            emotionalArcs: [],
            characterMatrix: []
        };
        await this.saveTruthFiles(projectId, truthFiles);
        return truthFiles;
    }
    /**
     * 获取真相文件
     */
    async getTruthFiles(projectId) {
        const filePath = this.getFilePath(projectId);
        if (!fs.existsSync(filePath)) {
            return this.initialize(projectId);
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    /**
     * 保存真相文件
     */
    async saveTruthFiles(projectId, truthFiles) {
        const filePath = this.getFilePath(projectId);
        fs.writeFileSync(filePath, JSON.stringify(truthFiles, null, 2), 'utf-8');
    }
    /**
     * 更新章节摘要
     */
    async updateChapterSummary(projectId, chapter) {
        const truthFiles = await this.getTruthFiles(projectId);
        const summary = {
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            title: chapter.title,
            charactersPresent: chapter.characters || [],
            keyEvents: this.extractKeyEvents(chapter.content || ''),
            stateChanges: [],
            newHooks: chapter.hooks?.filter(h => h.setInChapter === chapter.number).map(h => h.description) || [],
            resolvedHooks: chapter.hooks?.filter(h => h.payoffChapter === chapter.number).map(h => h.description) || []
        };
        // 更新或添加章节摘要
        const existingIndex = truthFiles.chapterSummaries.findIndex(s => s.chapterId === chapter.id);
        if (existingIndex >= 0) {
            truthFiles.chapterSummaries[existingIndex] = summary;
        }
        else {
            truthFiles.chapterSummaries.push(summary);
        }
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 更新世界状态
     */
    async updateWorldState(projectId, state) {
        const truthFiles = await this.getTruthFiles(projectId);
        truthFiles.currentState = { ...truthFiles.currentState, ...state };
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 添加资源
     */
    async addResource(projectId, resource) {
        const truthFiles = await this.getTruthFiles(projectId);
        truthFiles.particleLedger.push(resource);
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 更新资源
     */
    async updateResource(projectId, resourceId, change, chapterNumber) {
        const truthFiles = await this.getTruthFiles(projectId);
        const resource = truthFiles.particleLedger.find(r => r.id === resourceId);
        if (resource) {
            resource.changeLog.push({ chapter: chapterNumber, change });
            resource.lastUpdatedChapter = chapterNumber;
        }
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 添加伏笔
     */
    async addHook(projectId, hook) {
        const truthFiles = await this.getTruthFiles(projectId);
        truthFiles.pendingHooks.push(hook);
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 回收伏笔
     */
    async fulfillHook(projectId, hookId, chapterNumber) {
        const truthFiles = await this.getTruthFiles(projectId);
        const hook = truthFiles.pendingHooks.find(h => h.id === hookId);
        if (hook) {
            hook.status = 'paid_off';
            hook.payoffChapter = chapterNumber;
        }
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 添加角色互动
     */
    async addCharacterInteraction(projectId, characterId1, characterId2, chapterNumber, type, summary) {
        const truthFiles = await this.getTruthFiles(projectId);
        let interaction = truthFiles.characterMatrix.find(i => i.characterId1 === characterId1 && i.characterId2 === characterId2);
        if (!interaction) {
            interaction = {
                characterId1,
                characterId2,
                interactions: []
            };
            truthFiles.characterMatrix.push(interaction);
        }
        interaction.interactions.push({ chapter: chapterNumber, type, summary });
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 更新情感弧线
     */
    async updateEmotionalArc(projectId, characterId, characterName, chapterNumber, emotion, intensity) {
        const truthFiles = await this.getTruthFiles(projectId);
        let arc = truthFiles.emotionalArcs.find(a => a.characterId === characterId);
        if (!arc) {
            arc = {
                characterId,
                characterName,
                arcType: 'complex',
                points: []
            };
            truthFiles.emotionalArcs.push(arc);
        }
        arc.points.push({ chapter: chapterNumber, emotion, intensity });
        // 重新分析弧线类型
        arc.arcType = this.analyzeArcType(arc.points);
        await this.saveTruthFiles(projectId, truthFiles);
    }
    /**
     * 获取上下文摘要
     */
    async getContextSummary(projectId, chapterNumber) {
        const truthFiles = await this.getTruthFiles(projectId);
        const recentChapters = truthFiles.chapterSummaries
            .filter(s => s.chapterNumber < chapterNumber)
            .sort((a, b) => b.chapterNumber - a.chapterNumber)
            .slice(0, 3);
        const pendingHooks = truthFiles.pendingHooks.filter(h => h.status !== 'paid_off');
        const recentInteractions = truthFiles.characterMatrix
            .flatMap(i => i.interactions)
            .filter(inter => inter.chapter >= chapterNumber - 5)
            .slice(-5);
        let summary = '## 近期情节\n';
        for (const chapter of recentChapters) {
            summary += `- ${chapter.title}: ${chapter.keyEvents.join('; ')}\n`;
        }
        if (pendingHooks.length > 0) {
            summary += '\n## 待回收伏笔\n';
            for (const hook of pendingHooks.slice(0, 5)) {
                summary += `- ${hook.description} (设置于第${hook.setInChapter}章)\n`;
            }
        }
        return summary;
    }
    /**
     * 分析弧线类型
     */
    analyzeArcType(points) {
        if (points.length < 3)
            return 'flat';
        const first = points[0].intensity;
        const last = points[points.length - 1].intensity;
        const middle = points.slice(1, -1);
        const middleAvg = middle.reduce((sum, p) => sum + p.intensity, 0) / middle.length;
        if (last > first && middleAvg > first * 1.2)
            return 'rise';
        if (last < first && middleAvg < first * 0.8)
            return 'fall';
        if (first < middleAvg && middleAvg > last)
            return 'rise_fall';
        if (Math.abs(last - first) < 0.2)
            return 'flat';
        return 'complex';
    }
    /**
     * 提取关键事件
     */
    extractKeyEvents(content) {
        const events = [];
        // 简单的事件提取逻辑
        const eventPatterns = [
            /（[^）]+）/, // 括号内的事件
            /突然([^，,]+)/, // "突然..."
            /最终([^，,]+)/, // "最终..."
            /就在这时([^，,]+)/, // "就在这时..."
        ];
        for (const pattern of eventPatterns) {
            const matches = content.match(new RegExp(pattern, 'g'));
            if (matches) {
                events.push(...matches.slice(0, 3));
            }
        }
        return [...new Set(events)].slice(0, 5);
    }
    /**
     * 获取文件路径
     */
    getFilePath(projectId) {
        return path.join(this.storagePath, `${projectId}-truth-files.json`);
    }
}
exports.TruthFileManager = TruthFileManager;
exports.default = TruthFileManager;
//# sourceMappingURL=TruthFileManager.js.map