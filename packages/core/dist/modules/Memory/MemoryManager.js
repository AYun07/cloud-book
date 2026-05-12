"use strict";
/**
 * 记忆管理器
 * 记忆、作者笔记和系统提示分类管理
 * 集成AdvancedVectorizerV2进行语义搜索
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
exports.MemoryManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const advanced_vectorizer_v2_js_1 = require("../../config/advanced-vectorizer-v2.js");
class MemoryManager {
    memories = new Map();
    authorNotes = new Map();
    systemPrompts = new Map();
    storagePath;
    vectorizer;
    constructor(storagePath = './data/memory') {
        this.storagePath = storagePath;
        this.vectorizer = new advanced_vectorizer_v2_js_1.AdvancedVectorizerV2();
    }
    async initialize(projectId) {
        this.memories.set(projectId, []);
        this.authorNotes.set(projectId, []);
        this.systemPrompts.set(projectId, []);
    }
    async addMemory(projectId, content, type = 'memory') {
        const memory = {
            id: this.generateId(),
            content,
            type
        };
        switch (type) {
            case 'memory':
                const memories = this.memories.get(projectId) || [];
                memories.push(memory);
                this.memories.set(projectId, memories);
                break;
            case 'authorsNote':
                const notes = this.authorNotes.get(projectId) || [];
                notes.push(memory);
                this.authorNotes.set(projectId, notes);
                break;
            case 'systemPrompt':
                const prompts = this.systemPrompts.get(projectId) || [];
                prompts.push(memory);
                this.systemPrompts.set(projectId, prompts);
                break;
        }
        await this.save(projectId);
        return memory;
    }
    async updateMemory(projectId, memoryId, updates) {
        const allMemories = await this.getAllMemories(projectId);
        const index = allMemories.findIndex(m => m.id === memoryId);
        if (index === -1)
            return null;
        const memory = allMemories[index];
        const updated = { ...memory, ...updates };
        switch (memory.type) {
            case 'memory':
                const memories = this.memories.get(projectId) || [];
                const memIndex = memories.findIndex(m => m.id === memoryId);
                if (memIndex !== -1)
                    memories[memIndex] = updated;
                this.memories.set(projectId, memories);
                break;
            case 'authorsNote':
                const notes = this.authorNotes.get(projectId) || [];
                const noteIndex = notes.findIndex(m => m.id === memoryId);
                if (noteIndex !== -1)
                    notes[noteIndex] = updated;
                this.authorNotes.set(projectId, notes);
                break;
            case 'systemPrompt':
                const prompts = this.systemPrompts.get(projectId) || [];
                const promptIndex = prompts.findIndex(m => m.id === memoryId);
                if (promptIndex !== -1)
                    prompts[promptIndex] = updated;
                this.systemPrompts.set(projectId, prompts);
                break;
        }
        await this.save(projectId);
        return updated;
    }
    async deleteMemory(projectId, memoryId) {
        const allMemories = await this.getAllMemories(projectId);
        const memory = allMemories.find(m => m.id === memoryId);
        if (!memory)
            return false;
        switch (memory.type) {
            case 'memory':
                const memories = (this.memories.get(projectId) || []).filter(m => m.id !== memoryId);
                this.memories.set(projectId, memories);
                break;
            case 'authorsNote':
                const notes = (this.authorNotes.get(projectId) || []).filter(m => m.id !== memoryId);
                this.authorNotes.set(projectId, notes);
                break;
            case 'systemPrompt':
                const prompts = (this.systemPrompts.get(projectId) || []).filter(m => m.id !== memoryId);
                this.systemPrompts.set(projectId, prompts);
                break;
        }
        await this.save(projectId);
        return true;
    }
    async getMemories(projectId) {
        return this.memories.get(projectId) || [];
    }
    async getAuthorNotes(projectId) {
        return this.authorNotes.get(projectId) || [];
    }
    async getSystemPrompts(projectId) {
        return this.systemPrompts.get(projectId) || [];
    }
    async getAllMemories(projectId) {
        return [
            ...(this.memories.get(projectId) || []),
            ...(this.authorNotes.get(projectId) || []),
            ...(this.systemPrompts.get(projectId) || [])
        ];
    }
    async getRelevantMemories(projectId, context) {
        const allMemories = await this.getAllMemories(projectId);
        return allMemories.filter(memory => {
            if (memory.type === 'systemPrompt')
                return true;
            if (context.recentChapters !== undefined && memory.type === 'memory') {
                return true;
            }
            if (context.characterStates && memory.type === 'authorsNote') {
                return true;
            }
            return true;
        });
    }
    async buildMemoryContext(projectId, context = {}) {
        const parts = [];
        const systemPrompts = await this.getSystemPrompts(projectId);
        if (systemPrompts.length > 0) {
            parts.push('=== System Prompts ===');
            parts.push(...systemPrompts.map(p => p.content));
        }
        const relevantMemories = await this.getRelevantMemories(projectId, context);
        if (relevantMemories.length > 0) {
            parts.push('\n=== Memories ===');
            parts.push(...relevantMemories.map(m => m.content));
        }
        const authorNotes = await this.getAuthorNotes(projectId);
        if (authorNotes.length > 0) {
            parts.push('\n=== Author Notes ===');
            parts.push(...authorNotes.map(n => n.content));
        }
        return parts.join('\n');
    }
    async consolidateMemories(projectId, summary) {
        const memories = await this.getMemories(projectId);
        const consolidated = {
            id: this.generateId(),
            content: `[Previous memories consolidated]: ${summary}`,
            type: 'memory'
        };
        this.memories.set(projectId, [consolidated]);
        await this.save(projectId);
    }
    async searchMemories(projectId, query, limit = 10) {
        const allMemories = await this.getAllMemories(projectId);
        if (allMemories.length === 0)
            return [];
        // 使用高级向量器进行语义搜索
        const texts = allMemories.map(m => m.content);
        const results = this.vectorizer.search(query, texts, limit);
        // 将搜索结果映射回Memory对象
        return results.map(result => {
            const memory = allMemories.find(m => m.content === result.text);
            return memory ? { ...memory, score: result.score } : null;
        }).filter(Boolean);
    }
    async save(projectId) {
        const dir = path.join(this.storagePath, projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = {
            memories: this.memories.get(projectId) || [],
            authorNotes: this.authorNotes.get(projectId) || [],
            systemPrompts: this.systemPrompts.get(projectId) || []
        };
        fs.writeFileSync(path.join(dir, 'memory.json'), JSON.stringify(data, null, 2), 'utf-8');
    }
    async load(projectId) {
        const filePath = path.join(this.storagePath, projectId, 'memory.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            this.memories.set(projectId, data.memories || []);
            this.authorNotes.set(projectId, data.authorNotes || []);
            this.systemPrompts.set(projectId, data.systemPrompts || []);
        }
        else {
            await this.initialize(projectId);
        }
    }
    generateId() {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.MemoryManager = MemoryManager;
exports.default = MemoryManager;
//# sourceMappingURL=MemoryManager.js.map