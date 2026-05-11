"use strict";
/**
 * 创意中心模块
 * RAG检索增强，支持多工具协作
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
exports.CreativeHub = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CreativeHub {
    sessions = new Map();
    ragDocuments = new Map();
    llmManager;
    storagePath;
    chunkConfig = {
        chunkSize: 500,
        chunkOverlap: 100,
        minChunkLength: 50
    };
    constructor(llmManager, storagePath = './data/creativehub') {
        this.llmManager = llmManager;
        this.storagePath = storagePath;
    }
    /**
     * 添加文档并自动分块
     */
    async addDocumentWithChunking(projectId, document) {
        const chunks = this.chunkText(document.content, this.chunkConfig);
        const results = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunkDoc = {
                id: `${document.metadata.sourceId || 'doc'}_chunk_${i}`,
                content: chunks[i],
                metadata: {
                    ...document.metadata,
                    tags: [...(document.metadata.tags || []), `chunk:${i + 1}/${chunks.length}`]
                }
            };
            const added = await this.addRAGDocument(projectId, chunkDoc);
            results.push(added);
        }
        return results;
    }
    /**
     * 文本分块
     */
    chunkText(text, config) {
        const chunks = [];
        const sentences = this.splitIntoSentences(text);
        let currentChunk = '';
        let currentLength = 0;
        for (const sentence of sentences) {
            const sentenceLength = sentence.length;
            if (currentLength + sentenceLength > config.chunkSize && currentChunk.length > config.minChunkLength) {
                chunks.push(currentChunk.trim());
                const words = currentChunk.split('');
                const overlapStart = Math.max(0, words.length - config.chunkOverlap);
                currentChunk = words.slice(overlapStart).join('') + sentence;
                currentLength = currentChunk.length;
            }
            else {
                currentChunk += sentence;
                currentLength += sentenceLength;
            }
        }
        if (currentChunk.length > config.minChunkLength) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }
    /**
     * 句子分割
     */
    splitIntoSentences(text) {
        const sentenceEndings = /[。！？；\n]+/g;
        const sentences = [];
        let lastIndex = 0;
        for (const match of text.matchAll(sentenceEndings)) {
            const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
            if (sentence.length > 0) {
                sentences.push(sentence);
            }
            lastIndex = match.index + match[0].length;
        }
        const remaining = text.substring(lastIndex).trim();
        if (remaining.length > 0) {
            sentences.push(remaining);
        }
        return sentences;
    }
    /**
     * 生成文本嵌入（模拟向量）
     */
    async generateEmbedding(text) {
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(128).fill(0);
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const charCode = word.charCodeAt(j);
                const index = (charCode + i + j) % 128;
                embedding[index] += (charCode % 10) / 10;
            }
        }
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }
    /**
     * 计算余弦相似度
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator > 0 ? dotProduct / denominator : 0;
    }
    /**
     * 增强的RAG搜索
     */
    async enhancedSearch(projectId, query, options) {
        const docs = this.ragDocuments.get(projectId) || [];
        const topK = options?.topK || 5;
        const filters = options?.filters;
        let filteredDocs = docs;
        if (filters) {
            if (filters.types?.length) {
                filteredDocs = filteredDocs.filter(d => filters.types.includes(d.metadata.type));
            }
            if (filters.tags?.length) {
                filteredDocs = filteredDocs.filter(d => filters.tags.some(tag => d.metadata.tags?.includes(tag)));
            }
            if (filters.chapterRange) {
                filteredDocs = filteredDocs.filter(d => {
                    const chapter = d.metadata.chapter || 0;
                    if (filters.chapterRange?.min !== undefined && chapter < filters.chapterRange.min)
                        return false;
                    if (filters.chapterRange?.max !== undefined && chapter > filters.chapterRange.max)
                        return false;
                    return true;
                });
            }
        }
        const queryTerms = query.toLowerCase().split(/\s+/);
        const queryEmbedding = await this.generateEmbedding(query);
        const scoredDocs = filteredDocs.map(doc => {
            let score = 0;
            if (options?.useHybridSearch !== false) {
                const textScore = this.calculateTextScore(doc.content, queryTerms);
                const embeddingScore = doc.embedding
                    ? this.cosineSimilarity(queryEmbedding, doc.embedding)
                    : 0;
                score = textScore * 0.4 + embeddingScore * 0.6;
            }
            else {
                score = this.calculateTextScore(doc.content, queryTerms);
            }
            const highlights = this.extractHighlights(doc.content, queryTerms);
            return { document: doc, score, highlights };
        });
        let results = scoredDocs
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score);
        if (options?.rerank) {
            results = this.rerankResults(query, results);
        }
        return results.slice(0, topK);
    }
    /**
     * 计算文本相关度分数
     */
    calculateTextScore(content, queryTerms) {
        const contentLower = content.toLowerCase();
        let score = 0;
        let matchCount = 0;
        for (const term of queryTerms) {
            const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                matchCount += matches.length;
                if (contentLower.startsWith(term)) {
                    score += 2;
                }
                else if (content.includes(term)) {
                    score += 1;
                }
                const wordBoundaryBonus = new RegExp(`\\b${term}\\b`, 'gi').test(content) ? 0.5 : 0;
                score += wordBoundaryBonus;
            }
        }
        const lengthPenalty = 1 / Math.log2(content.length + 1);
        score += matchCount * 0.1 * (1 + lengthPenalty);
        return score;
    }
    /**
     * 结果重排序
     */
    rerankResults(query, results) {
        const queryWords = query.split(/\s+/);
        return results.sort((a, b) => {
            let scoreDiff = b.score - a.score;
            const aFirstWord = a.document.content.toLowerCase().startsWith(queryWords[0] || '');
            const bFirstWord = b.document.content.toLowerCase().startsWith(queryWords[0] || '');
            if (aFirstWord && !bFirstWord)
                scoreDiff += 0.1;
            if (bFirstWord && !aFirstWord)
                scoreDiff -= 0.1;
            const aLength = a.document.content.length;
            const bLength = b.document.content.length;
            if (aLength > 100 && aLength < 1000)
                scoreDiff += 0.05;
            if (bLength > 100 && bLength < 1000)
                scoreDiff -= 0.05;
            return scoreDiff;
        });
    }
    /**
     * 批量添加文档
     */
    async batchAddDocuments(projectId, documents) {
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const doc of documents) {
            try {
                await this.addRAGDocument(projectId, doc);
                success++;
            }
            catch (error) {
                failed++;
                errors.push(`${doc.metadata.sourceId || 'unknown'}: ${error.message}`);
            }
        }
        await this.saveRAGDocuments(projectId);
        return { success, failed, errors };
    }
    /**
     * 语义搜索
     */
    async semanticSearch(projectId, query, intent) {
        let typeFilter;
        if (intent) {
            switch (intent) {
                case 'character':
                    typeFilter = ['character'];
                    break;
                case 'plot':
                    typeFilter = ['plot', 'chapter', 'event'];
                    break;
                case 'world':
                    typeFilter = ['world'];
                    break;
                case 'theme':
                    typeFilter = ['theme'];
                    break;
            }
        }
        return this.enhancedSearch(projectId, query, {
            topK: 5,
            filters: typeFilter ? { types: typeFilter } : undefined,
            useHybridSearch: true,
            rerank: true
        });
    }
    /**
     * 获取项目知识库统计
     */
    async getKnowledgeStats(projectId) {
        const docs = this.ragDocuments.get(projectId) || [];
        const byType = {};
        const byChapter = {};
        let totalLength = 0;
        let lastUpdated = null;
        for (const doc of docs) {
            const type = doc.metadata.type;
            byType[type] = (byType[type] || 0) + 1;
            const chapter = doc.metadata.chapter;
            if (chapter !== undefined) {
                byChapter[chapter] = (byChapter[chapter] || 0) + 1;
            }
            totalLength += doc.content.length;
            const docDate = new Date(doc.metadata.createdAt);
            if (!lastUpdated || docDate > lastUpdated) {
                lastUpdated = docDate;
            }
        }
        return {
            totalDocuments: docs.length,
            byType,
            byChapter,
            avgChunkLength: docs.length > 0 ? totalLength / docs.length : 0,
            lastUpdated
        };
    }
    async createSession(projectId) {
        const session = {
            id: this.generateId(),
            projectId,
            messages: [],
            tools: this.getDefaultTools(),
            context: {
                characters: [],
                worldSettings: [],
                pendingTasks: []
            }
        };
        this.sessions.set(session.id, session);
        this.ragDocuments.set(projectId, []);
        await this.saveSession(session);
        return session;
    }
    async sendMessage(sessionId, content, role = 'user') {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        const message = {
            id: this.generateId(),
            role,
            content,
            timestamp: new Date()
        };
        session.messages.push(message);
        if (role === 'user') {
            const context = await this.buildContext(session);
            const contextPrompt = context ? `\n\n参考信息：\n${context}` : '';
            const response = await this.llmManager.complete(`${content}${contextPrompt}`, { task: 'analysis', temperature: 0.7 });
            const assistantMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            session.messages.push(assistantMessage);
            await this.saveSession(session);
            return assistantMessage;
        }
        await this.saveSession(session);
        return message;
    }
    async addTool(sessionId, tool) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        session.tools.push(tool);
        await this.saveSession(session);
    }
    async executeTool(sessionId, toolName, args) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        const tool = session.tools.find(t => t.name === toolName);
        if (!tool)
            throw new Error(`Tool ${toolName} not found`);
        return await tool.execute(args);
    }
    async addRAGDocument(projectId, document) {
        const doc = {
            id: this.generateId(),
            ...document,
            metadata: {
                ...document.metadata,
                createdAt: document.metadata.createdAt || new Date()
            }
        };
        doc.embedding = await this.generateEmbedding(doc.content);
        const docs = this.ragDocuments.get(projectId) || [];
        docs.push(doc);
        this.ragDocuments.set(projectId, docs);
        await this.saveRAGDocuments(projectId);
        return doc;
    }
    async addCharacterToRAG(projectId, character) {
        const content = `
角色：${character.name}
${character.aliases ? `别名：${character.aliases.join(', ')}` : ''}
${character.gender ? `性别：${character.gender}` : ''}
${character.age ? `年龄：${character.age}` : ''}
${character.appearance ? `外貌：${character.appearance}` : ''}
${character.personality ? `性格：${character.personality}` : ''}
${character.background ? `背景：${character.background}` : ''}
${character.goals ? `目标：${character.goals.join(', ')}` : ''}
${character.abilities ? `能力：${character.abilities.join(', ')}` : ''}
${character.speakingStyle ? `说话风格：${character.speakingStyle}` : ''}
`.trim();
        await this.addRAGDocument(projectId, {
            content,
            metadata: { type: 'character', sourceId: character.id, createdAt: new Date() }
        });
    }
    async addWorldSettingToRAG(projectId, setting) {
        const content = `
世界观：${setting.name}
题材：${setting.genre}
${setting.powerSystem ? `力量体系：${setting.powerSystem}` : ''}
${setting.rules ? `规则：${setting.rules.join('\n')}` : ''}
${setting.locations ? `地点：${setting.locations.map((l) => l.name).join(', ')}` : ''}
${setting.factions ? `势力：${setting.factions.map((f) => f.name).join(', ')}` : ''}
`.trim();
        await this.addRAGDocument(projectId, {
            content,
            metadata: { type: 'world', sourceId: setting.id, createdAt: new Date() }
        });
    }
    async searchRAG(projectId, query, topK = 5) {
        return this.enhancedSearch(projectId, query, { topK });
    }
    async buildContext(session) {
        const projectId = session.projectId;
        const recentMessages = session.messages.slice(-5);
        const lastUserMessage = recentMessages.reverse().find(m => m.role === 'user');
        if (!lastUserMessage)
            return '';
        const searchResults = await this.searchRAG(projectId, lastUserMessage.content, 3);
        if (searchResults.length === 0)
            return '';
        return searchResults
            .map(r => `[参考] ${r.document.metadata.type.toUpperCase()}\n${r.highlights.join('\n')}`)
            .join('\n\n');
    }
    async updateContext(sessionId, updates) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        session.context = { ...session.context, ...updates };
        await this.saveSession(session);
    }
    async getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    async getProjectSessions(projectId) {
        return Array.from(this.sessions.values())
            .filter(s => s.projectId === projectId);
    }
    getDefaultTools() {
        return [
            {
                name: 'searchCharacter',
                description: '搜索角色信息',
                execute: async (args) => {
                    return { found: true, character: args.name };
                }
            },
            {
                name: 'searchWorld',
                description: '搜索世界观设定',
                execute: async (args) => {
                    return { found: true, setting: args.keyword };
                }
            },
            {
                name: 'getChapterSummary',
                description: '获取章节摘要',
                execute: async (args) => {
                    return { chapter: args.chapterNumber, summary: '' };
                }
            },
            {
                name: 'suggestPlotTwist',
                description: '建议剧情转折',
                execute: async (args) => {
                    return { suggestions: [] };
                }
            },
            {
                name: 'ragSearch',
                description: 'RAG知识库搜索',
                execute: async (args) => {
                    const projectId = args.query;
                    const results = await this.searchRAG(projectId, args.query, args.topK || 5);
                    return results;
                }
            },
            {
                name: 'semanticSearch',
                description: '语义搜索',
                execute: async (args) => {
                    const projectId = args.query;
                    const intent = args.intent;
                    const results = await this.semanticSearch(projectId, args.query, intent);
                    return results;
                }
            }
        ];
    }
    extractHighlights(content, terms) {
        const highlights = [];
        const contentLower = content.toLowerCase();
        for (const term of terms) {
            const index = contentLower.indexOf(term);
            if (index !== -1) {
                const start = Math.max(0, index - 30);
                const end = Math.min(content.length, index + term.length + 30);
                let highlight = content.substring(start, end);
                if (start > 0)
                    highlight = '...' + highlight;
                if (end < content.length)
                    highlight = highlight + '...';
                highlights.push(highlight);
            }
        }
        return highlights.slice(0, 3);
    }
    async saveSession(session) {
        const dir = path.join(this.storagePath, session.projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, `${session.id}.json`), JSON.stringify(session, null, 2), 'utf-8');
    }
    async saveRAGDocuments(projectId) {
        const dir = path.join(this.storagePath, projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const docs = this.ragDocuments.get(projectId) || [];
        fs.writeFileSync(path.join(dir, 'rag.json'), JSON.stringify(docs, null, 2), 'utf-8');
    }
    generateId() {
        return `hub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CreativeHub = CreativeHub;
exports.default = CreativeHub;
//# sourceMappingURL=CreativeHub.js.map