"use strict";
/**
 * 世界信息管理器
 * 层级化的世界设定信息，支持条件逻辑
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
exports.WorldInfoManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class WorldInfoManager {
    worldInfos = new Map();
    storagePath;
    constructor(storagePath = './data/worldinfo') {
        this.storagePath = storagePath;
    }
    async initialize(projectId) {
        this.worldInfos.set(projectId, []);
    }
    async addWorldInfo(projectId, info) {
        const infos = this.worldInfos.get(projectId) || [];
        const newInfo = {
            id: this.generateId(),
            ...info
        };
        infos.push(newInfo);
        this.worldInfos.set(projectId, infos);
        await this.save(projectId);
        return newInfo;
    }
    async updateWorldInfo(projectId, infoId, updates) {
        const infos = this.worldInfos.get(projectId) || [];
        const index = infos.findIndex(i => i.id === infoId);
        if (index === -1)
            return null;
        infos[index] = { ...infos[index], ...updates };
        this.worldInfos.set(projectId, infos);
        await this.save(projectId);
        return infos[index];
    }
    async deleteWorldInfo(projectId, infoId) {
        const infos = this.worldInfos.get(projectId) || [];
        const filtered = infos.filter(i => i.id !== infoId);
        if (filtered.length === infos.length)
            return false;
        this.worldInfos.set(projectId, filtered);
        await this.save(projectId);
        return true;
    }
    async getWorldInfo(projectId, filter) {
        let infos = this.worldInfos.get(projectId) || [];
        if (filter) {
            if (filter.keywords && filter.keywords.length > 0) {
                infos = infos.filter(info => filter.keywords.some(kw => info.keywords.includes(kw) ||
                    info.content.includes(kw) ||
                    info.name.includes(kw)));
            }
            if (filter.depth !== undefined) {
                infos = infos.filter(info => (info.depth || 0) <= filter.depth);
            }
            if (filter.type) {
                infos = infos.filter(info => info.key?.includes(filter.type));
            }
        }
        return infos;
    }
    async getWorldInfoByContext(projectId, context) {
        const infos = this.worldInfos.get(projectId) || [];
        const contextLower = context.toLowerCase();
        return infos.filter(info => {
            const keywordsMatch = info.keywords.some(kw => contextLower.includes(kw.toLowerCase()));
            const nameMatch = info.name.toLowerCase().includes(contextLower);
            if (info.conditionalLogic) {
                try {
                    const conditionMet = this.evaluateCondition(info.conditionalLogic, context);
                    return (keywordsMatch || nameMatch) && conditionMet;
                }
                catch {
                    return keywordsMatch || nameMatch;
                }
            }
            return keywordsMatch || nameMatch;
        });
    }
    async searchWorldInfo(projectId, query) {
        const infos = this.worldInfos.get(projectId) || [];
        const queryLower = query.toLowerCase();
        return infos.filter(info => info.name.toLowerCase().includes(queryLower) ||
            info.content.toLowerCase().includes(queryLower) ||
            info.keywords.some(kw => kw.toLowerCase().includes(queryLower)));
    }
    async importWorldInfo(projectId, data) {
        const existingInfos = this.worldInfos.get(projectId) || [];
        const newInfos = data.map(info => ({
            ...info,
            id: info.id || this.generateId()
        }));
        this.worldInfos.set(projectId, [...existingInfos, ...newInfos]);
        await this.save(projectId);
    }
    async exportWorldInfo(projectId) {
        return this.worldInfos.get(projectId) || [];
    }
    async buildContextPrompt(projectId, context) {
        const relevantInfos = await this.getWorldInfoByContext(projectId, context);
        if (relevantInfos.length === 0)
            return '';
        const sortedInfos = [...relevantInfos].sort((a, b) => (b.depth || 0) - (a.depth || 0));
        const promptParts = sortedInfos.map(info => {
            const header = info.secondary
                ? `[${info.name}]`
                : `=== ${info.name} ===`;
            return `${header}\n${info.content}`;
        });
        return promptParts.join('\n\n');
    }
    evaluateCondition(condition, context) {
        const match = condition.match(/(\w+)\s*([<>=!]+)\s*(.+)/);
        if (!match)
            return true;
        const [, varName, operator, value] = match;
        const contextValue = this.extractValueFromContext(context, varName);
        switch (operator) {
            case '==': return contextValue === value;
            case '!=': return contextValue !== value;
            case '>': return Number(contextValue) > Number(value);
            case '<': return Number(contextValue) < Number(value);
            case 'contains': return contextValue.includes(value);
            default: return true;
        }
    }
    extractValueFromContext(context, varName) {
        const regex = new RegExp(`${varName}[\\s:]+(.+?)(?:\\n|$)`, 'i');
        const match = context.match(regex);
        return match ? match[1].trim() : '';
    }
    async save(projectId) {
        const dir = path.join(this.storagePath, projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'worldinfo.json');
        const infos = this.worldInfos.get(projectId) || [];
        fs.writeFileSync(filePath, JSON.stringify(infos, null, 2), 'utf-8');
    }
    async load(projectId) {
        const filePath = path.join(this.storagePath, projectId, 'worldinfo.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            this.worldInfos.set(projectId, JSON.parse(data));
        }
        else {
            this.worldInfos.set(projectId, []);
        }
    }
    generateId() {
        return `wi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.WorldInfoManager = WorldInfoManager;
exports.default = WorldInfoManager;
//# sourceMappingURL=WorldInfoManager.js.map