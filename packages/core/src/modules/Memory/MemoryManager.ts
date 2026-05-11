/**
 * Memory 管理器 - KoboldAI-Client 功能
 * 管理记忆、作者笔记和系统提示
 */

import { Memory } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryContext {
  recentChapters?: number;
  characterStates?: Record<string, any>;
  plotProgress?: string;
  emotionalTone?: string;
}

export class MemoryManager {
  private memories: Map<string, Memory[]> = new Map();
  private authorNotes: Map<string, Memory[]> = new Map();
  private systemPrompts: Map<string, Memory[]> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/memory') {
    this.storagePath = storagePath;
  }

  async initialize(projectId: string): Promise<void> {
    this.memories.set(projectId, []);
    this.authorNotes.set(projectId, []);
    this.systemPrompts.set(projectId, []);
  }

  async addMemory(projectId: string, content: string, type: Memory['type'] = 'memory'): Promise<Memory> {
    const memory: Memory = {
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

  async updateMemory(projectId: string, memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const allMemories = await this.getAllMemories(projectId);
    const index = allMemories.findIndex(m => m.id === memoryId);
    if (index === -1) return null;

    const memory = allMemories[index];
    const updated = { ...memory, ...updates };

    switch (memory.type) {
      case 'memory':
        const memories = this.memories.get(projectId) || [];
        const memIndex = memories.findIndex(m => m.id === memoryId);
        if (memIndex !== -1) memories[memIndex] = updated;
        this.memories.set(projectId, memories);
        break;
      case 'authorsNote':
        const notes = this.authorNotes.get(projectId) || [];
        const noteIndex = notes.findIndex(m => m.id === memoryId);
        if (noteIndex !== -1) notes[noteIndex] = updated;
        this.authorNotes.set(projectId, notes);
        break;
      case 'systemPrompt':
        const prompts = this.systemPrompts.get(projectId) || [];
        const promptIndex = prompts.findIndex(m => m.id === memoryId);
        if (promptIndex !== -1) prompts[promptIndex] = updated;
        this.systemPrompts.set(projectId, prompts);
        break;
    }

    await this.save(projectId);
    return updated;
  }

  async deleteMemory(projectId: string, memoryId: string): Promise<boolean> {
    const allMemories = await this.getAllMemories(projectId);
    const memory = allMemories.find(m => m.id === memoryId);
    if (!memory) return false;

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

  async getMemories(projectId: string): Promise<Memory[]> {
    return this.memories.get(projectId) || [];
  }

  async getAuthorNotes(projectId: string): Promise<Memory[]> {
    return this.authorNotes.get(projectId) || [];
  }

  async getSystemPrompts(projectId: string): Promise<Memory[]> {
    return this.systemPrompts.get(projectId) || [];
  }

  async getAllMemories(projectId: string): Promise<Memory[]> {
    return [
      ...(this.memories.get(projectId) || []),
      ...(this.authorNotes.get(projectId) || []),
      ...(this.systemPrompts.get(projectId) || [])
    ];
  }

  async getRelevantMemories(projectId: string, context: MemoryContext): Promise<Memory[]> {
    const allMemories = await this.getAllMemories(projectId);
    
    return allMemories.filter(memory => {
      if (memory.type === 'systemPrompt') return true;
      
      if (context.recentChapters !== undefined && memory.type === 'memory') {
        return true;
      }
      
      if (context.characterStates && memory.type === 'authorsNote') {
        return true;
      }
      
      return true;
    });
  }

  async buildMemoryContext(projectId: string, context: MemoryContext = {}): Promise<string> {
    const parts: string[] = [];
    
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

  async consolidateMemories(projectId: string, summary: string): Promise<void> {
    const memories = await this.getMemories(projectId);
    
    const consolidated: Memory = {
      id: this.generateId(),
      content: `[Previous memories consolidated]: ${summary}`,
      type: 'memory'
    };
    
    this.memories.set(projectId, [consolidated]);
    await this.save(projectId);
  }

  async searchMemories(projectId: string, query: string): Promise<Memory[]> {
    const allMemories = await this.getAllMemories(projectId);
    const queryLower = query.toLowerCase();
    
    return allMemories.filter(memory =>
      memory.content.toLowerCase().includes(queryLower)
    );
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      memories: this.memories.get(projectId) || [],
      authorNotes: this.authorNotes.get(projectId) || [],
      systemPrompts: this.systemPrompts.get(projectId) || []
    };

    fs.writeFileSync(
      path.join(dir, 'memory.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  async load(projectId: string): Promise<void> {
    const filePath = path.join(this.storagePath, projectId, 'memory.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.memories.set(projectId, data.memories || []);
      this.authorNotes.set(projectId, data.authorNotes || []);
      this.systemPrompts.set(projectId, data.systemPrompts || []);
    } else {
      await this.initialize(projectId);
    }
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default MemoryManager;
