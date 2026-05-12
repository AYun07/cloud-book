"use strict";
/**
 * Cloud Book - 创意中心（已填充完整实现）
 * 基于AdvancedVectorizerV2的RAG知识库
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreativeHub = void 0;
const advanced_vectorizer_v2_js_1 = require("../../config/advanced-vectorizer-v2.js");
const storage_js_1 = require("../../utils/storage.js");
const errors_js_1 = require("../../utils/errors.js");
class CreativeHub {
    vectorizer;
    storage;
    config;
    sessions = new Map();
    documentCache = new Map();
    constructor(config) {
        this.config = config;
        this.vectorizer = new advanced_vectorizer_v2_js_1.AdvancedVectorizerV2();
        this.storage = new storage_js_1.UnifiedStorage();
    }
    async createSession(projectId) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = {
            sessionId,
            projectId,
            documents: [],
            createdAt: new Date(),
            lastAccessed: new Date(),
            queryHistory: [],
            contextWindow: this.config.contextWindow || 5
        };
        this.sessions.set(sessionId, session);
        await this.saveSession(session);
        return session;
    }
    async getSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            session.lastAccessed = new Date();
            return session;
        }
        try {
            const content = await this.storage.read(`sessions/${sessionId}.json`);
            const session = JSON.parse(content);
            this.sessions.set(sessionId, session);
            return session;
        }
        catch {
            return null;
        }
    }
    async addDocument(sessionId, document) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new errors_js_1.CloudBookError('Session not found', 'SESSION_NOT_FOUND');
            }
            const embedding = this.vectorizer.embed(document.content);
            const processedDoc = {
                ...document,
                embedding,
                metadata: {
                    ...document.metadata,
                    addedAt: new Date().toISOString()
                }
            };
            session.documents.push(processedDoc);
            this.documentCache.set(document.id, processedDoc);
            await this.saveSession(session);
            await this.saveDocument(processedDoc);
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CreativeHub.addDocument');
        }
    }
    async search(sessionId, query, limit = 5) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new errors_js_1.CloudBookError('Session not found', 'SESSION_NOT_FOUND');
            }
            if (session.documents.length === 0) {
                return [];
            }
            const texts = session.documents.map(doc => doc.content);
            const searchResults = this.vectorizer.search(query, texts, limit);
            return searchResults.map(result => {
                const doc = session.documents.find(d => d.content === result.text);
                return {
                    document: doc,
                    relevanceScore: result.score,
                    matchedSegments: this.extractMatchedSegments(doc.content, query)
                };
            }).filter(r => r.relevanceScore > 0.1);
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CreativeHub.search');
        }
    }
    extractMatchedSegments(content, query, contextChars = 50) {
        const segments = [];
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        let index = 0;
        while ((index = contentLower.indexOf(queryLower, index)) !== -1) {
            const start = Math.max(0, index - contextChars);
            const end = Math.min(content.length, index + query.length + contextChars);
            segments.push('...' + content.slice(start, end) + '...');
            index += query.length;
            if (segments.length >= 3)
                break;
        }
        return segments;
    }
    async sendMessage(sessionId, message, useRAG = true) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new errors_js_1.CloudBookError('Session not found', 'SESSION_NOT_FOUND');
            }
            session.queryHistory.push({
                query: message,
                timestamp: new Date()
            });
            let context = [];
            if (useRAG && session.documents.length > 0) {
                const results = await this.search(sessionId, message, session.contextWindow);
                context = results.map(r => r.document);
            }
            await this.saveSession(session);
            return {
                response: this.generateContextualResponse(message, context),
                context
            };
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CreativeHub.sendMessage');
        }
    }
    generateContextualResponse(message, context) {
        if (context.length === 0) {
            return `我理解您想要探讨"${message}"。当前知识库中暂无相关信息。您可以：\n1. 添加相关文档到知识库\n2. 直接创作，我会基于已有世界观进行创作\n3. 描述您想要的世界设定，我会帮您整理`;
        }
        const summary = context.map(doc => {
            const tags = doc.metadata?.tags?.join(', ') || '无标签';
            return `[${doc.metadata?.source || '未知来源'}] (标签: ${tags})`;
        }).join('\n');
        return `根据您的知识库，以下内容可能与"${message}"相关：\n\n${summary}\n\n基于以上上下文，我可以帮您：\n1. 继续深入探讨这个话题\n2. 基于已有设定进行创作\n3. 补充完善相关设定`;
    }
    async clearSession(sessionId) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new errors_js_1.CloudBookError('Session not found', 'SESSION_NOT_FOUND');
            }
            session.documents = [];
            session.queryHistory = [];
            this.documentCache.clear();
            await this.saveSession(session);
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CreativeHub.clearSession');
        }
    }
    async deleteSession(sessionId) {
        try {
            this.sessions.delete(sessionId);
            await this.storage.delete(`sessions/${sessionId}.json`);
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CreativeHub.deleteSession');
        }
    }
    async getStatistics(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new errors_js_1.CloudBookError('Session not found', 'SESSION_NOT_FOUND');
        }
        const documentCount = session.documents.length;
        const totalCharacters = session.documents.reduce((sum, doc) => sum + doc.content.length, 0);
        const queryCount = session.queryHistory.length;
        return {
            documentCount,
            totalCharacters,
            averageRelevance: 0,
            queryCount
        };
    }
    async saveSession(session) {
        await this.storage.write(`sessions/${session.sessionId}.json`, JSON.stringify(session));
    }
    async saveDocument(document) {
        await this.storage.write(`documents/${document.id}.json`, JSON.stringify(document));
    }
    destroy() {
        this.sessions.clear();
        this.documentCache.clear();
        this.storage.destroy();
    }
}
exports.CreativeHub = CreativeHub;
//# sourceMappingURL=CreativeHubImpl.js.map