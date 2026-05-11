/**
 * Creative Hub 模块 - AI-Novel-Writing-Assistant 功能
 * 创意中心，支持RAG检索和多工具协作
 */

import { 
  CreativeHubSession, 
  HubMessage, 
  HubTool, 
  HubContext,
  NovelProject,
  Character
} from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import * as fs from 'fs';
import * as path from 'path';

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    type: 'character' | 'world' | 'plot' | 'chapter';
    sourceId?: string;
    chapter?: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: RAGDocument;
  score: number;
  highlights: string[];
}

export class CreativeHub {
  private sessions: Map<string, CreativeHubSession> = new Map();
  private ragDocuments: Map<string, RAGDocument[]> = new Map();
  private llmManager: LLMManager;
  private storagePath: string;

  constructor(llmManager: LLMManager, storagePath: string = './data/creativehub') {
    this.llmManager = llmManager;
    this.storagePath = storagePath;
  }

  async createSession(projectId: string): Promise<CreativeHubSession> {
    const session: CreativeHubSession = {
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

  async sendMessage(
    sessionId: string,
    content: string,
    role: HubMessage['role'] = 'user'
  ): Promise<HubMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const message: HubMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date()
    };

    session.messages.push(message);

    if (role === 'user') {
      const context = await this.buildContext(session);
      const contextPrompt = context ? `\n\n参考信息：\n${context}` : '';
      
      const response = await this.llmManager.complete(
        `${content}${contextPrompt}`,
        { task: 'analysis', temperature: 0.7 }
      );

      const assistantMessage: HubMessage = {
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

  async addTool(sessionId: string, tool: HubTool): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.tools.push(tool);
    await this.saveSession(session);
  }

  async executeTool(sessionId: string, toolName: string, args: any): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const tool = session.tools.find(t => t.name === toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);

    return await tool.execute(args);
  }

  async addRAGDocument(
    projectId: string,
    document: Omit<RAGDocument, 'id'>
  ): Promise<RAGDocument> {
    const doc: RAGDocument = {
      id: this.generateId(),
      ...document
    };

    const docs = this.ragDocuments.get(projectId) || [];
    docs.push(doc);
    this.ragDocuments.set(projectId, docs);

    await this.saveRAGDocuments(projectId);
    return doc;
  }

  async addCharacterToRAG(projectId: string, character: Character): Promise<void> {
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
      metadata: { type: 'character', sourceId: character.id }
    });
  }

  async addWorldSettingToRAG(projectId: string, setting: any): Promise<void> {
    const content = `
世界观：${setting.name}
题材：${setting.genre}
${setting.powerSystem ? `力量体系：${setting.powerSystem}` : ''}
${setting.rules ? `规则：${setting.rules.join('\n')}` : ''}
${setting.locations ? `地点：${setting.locations.map((l: any) => l.name).join(', ')}` : ''}
${setting.factions ? `势力：${setting.factions.map((f: any) => f.name).join(', ')}` : ''}
`.trim();

    await this.addRAGDocument(projectId, {
      content,
      metadata: { type: 'world', sourceId: setting.id }
    });
  }

  async searchRAG(projectId: string, query: string, topK: number = 5): Promise<SearchResult[]> {
    const docs = this.ragDocuments.get(projectId) || [];
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    const scoredDocs = docs.map(doc => {
      const content = doc.content.toLowerCase();
      let score = 0;
      
      for (const term of queryTerms) {
        if (content.includes(term)) {
          score += 1;
          if (content.startsWith(term)) {
            score += 0.5;
          }
        }
      }
      
      const highlights = this.extractHighlights(doc.content, queryTerms);
      
      return { document: doc, score, highlights };
    });

    return scoredDocs
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async buildContext(session: CreativeHubSession): Promise<string> {
    const projectId = session.projectId;
    const recentMessages = session.messages.slice(-5);
    const lastUserMessage = recentMessages.reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) return '';

    const searchResults = await this.searchRAG(projectId, lastUserMessage.content, 3);
    
    if (searchResults.length === 0) return '';

    return searchResults
      .map(r => `[参考] ${r.document.metadata.type.toUpperCase()}\n${r.highlights.join('\n')}`)
      .join('\n\n');
  }

  async updateContext(sessionId: string, updates: Partial<HubContext>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.context = { ...session.context, ...updates };
    await this.saveSession(session);
  }

  async getSession(sessionId: string): Promise<CreativeHubSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async getProjectSessions(projectId: string): Promise<CreativeHubSession[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.projectId === projectId);
  }

  private getDefaultTools(): HubTool[] {
    return [
      {
        name: 'searchCharacter',
        description: '搜索角色信息',
        execute: async (args: { name: string }) => {
          return { found: true, character: args.name };
        }
      },
      {
        name: 'searchWorld',
        description: '搜索世界观设定',
        execute: async (args: { keyword: string }) => {
          return { found: true, setting: args.keyword };
        }
      },
      {
        name: 'getChapterSummary',
        description: '获取章节摘要',
        execute: async (args: { chapterNumber: number }) => {
          return { chapter: args.chapterNumber, summary: '' };
        }
      },
      {
        name: 'suggestPlotTwist',
        description: '建议剧情转折',
        execute: async (args: {}) => {
          return { suggestions: [] };
        }
      }
    ];
  }

  private extractHighlights(content: string, terms: string[]): string[] {
    const highlights: string[] = [];
    const contentLower = content.toLowerCase();

    for (const term of terms) {
      const index = contentLower.indexOf(term);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(content.length, index + term.length + 30);
        let highlight = content.substring(start, end);
        if (start > 0) highlight = '...' + highlight;
        if (end < content.length) highlight = highlight + '...';
        highlights.push(highlight);
      }
    }

    return highlights.slice(0, 3);
  }

  private async saveSession(session: CreativeHubSession): Promise<void> {
    const dir = path.join(this.storagePath, session.projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dir, `${session.id}.json`),
      JSON.stringify(session, null, 2),
      'utf-8'
    );
  }

  private async saveRAGDocuments(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const docs = this.ragDocuments.get(projectId) || [];
    fs.writeFileSync(
      path.join(dir, 'rag.json'),
      JSON.stringify(docs, null, 2),
      'utf-8'
    );
  }

  private generateId(): string {
    return `hub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CreativeHub;
