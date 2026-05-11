/**
 * 世界信息管理器
 * 层级化的世界设定信息，支持条件逻辑
 */

import { WorldInfo } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface WorldInfoFilter {
  keywords?: string[];
  depth?: number;
  type?: string;
}

export class WorldInfoManager {
  private worldInfos: Map<string, WorldInfo[]> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/worldinfo') {
    this.storagePath = storagePath;
  }

  async initialize(projectId: string): Promise<void> {
    this.worldInfos.set(projectId, []);
  }

  async addWorldInfo(projectId: string, info: Omit<WorldInfo, 'id'>): Promise<WorldInfo> {
    const infos = this.worldInfos.get(projectId) || [];
    const newInfo: WorldInfo = {
      id: this.generateId(),
      ...info
    };
    infos.push(newInfo);
    this.worldInfos.set(projectId, infos);
    await this.save(projectId);
    return newInfo;
  }

  async updateWorldInfo(projectId: string, infoId: string, updates: Partial<WorldInfo>): Promise<WorldInfo | null> {
    const infos = this.worldInfos.get(projectId) || [];
    const index = infos.findIndex(i => i.id === infoId);
    if (index === -1) return null;
    
    infos[index] = { ...infos[index], ...updates };
    this.worldInfos.set(projectId, infos);
    await this.save(projectId);
    return infos[index];
  }

  async deleteWorldInfo(projectId: string, infoId: string): Promise<boolean> {
    const infos = this.worldInfos.get(projectId) || [];
    const filtered = infos.filter(i => i.id !== infoId);
    if (filtered.length === infos.length) return false;
    
    this.worldInfos.set(projectId, filtered);
    await this.save(projectId);
    return true;
  }

  async getWorldInfo(projectId: string, filter?: WorldInfoFilter): Promise<WorldInfo[]> {
    let infos = this.worldInfos.get(projectId) || [];
    
    if (filter) {
      if (filter.keywords && filter.keywords.length > 0) {
        infos = infos.filter(info => 
          filter.keywords!.some(kw => 
            info.keywords.includes(kw) || 
            info.content.includes(kw) ||
            info.name.includes(kw)
          )
        );
      }
      if (filter.depth !== undefined) {
        infos = infos.filter(info => (info.depth || 0) <= filter.depth!);
      }
      if (filter.type) {
        infos = infos.filter(info => info.key?.includes(filter.type!));
      }
    }
    
    return infos;
  }

  async getWorldInfoByContext(projectId: string, context: string): Promise<WorldInfo[]> {
    const infos = this.worldInfos.get(projectId) || [];
    const contextLower = context.toLowerCase();
    
    return infos.filter(info => {
      const keywordsMatch = info.keywords.some(kw => 
        contextLower.includes(kw.toLowerCase())
      );
      
      const nameMatch = info.name.toLowerCase().includes(contextLower);
      
      if (info.conditionalLogic) {
        try {
          const conditionMet = this.evaluateCondition(info.conditionalLogic, context);
          return (keywordsMatch || nameMatch) && conditionMet;
        } catch {
          return keywordsMatch || nameMatch;
        }
      }
      
      return keywordsMatch || nameMatch;
    });
  }

  async searchWorldInfo(projectId: string, query: string): Promise<WorldInfo[]> {
    const infos = this.worldInfos.get(projectId) || [];
    const queryLower = query.toLowerCase();
    
    return infos.filter(info =>
      info.name.toLowerCase().includes(queryLower) ||
      info.content.toLowerCase().includes(queryLower) ||
      info.keywords.some(kw => kw.toLowerCase().includes(queryLower))
    );
  }

  async importWorldInfo(projectId: string, data: WorldInfo[]): Promise<void> {
    const existingInfos = this.worldInfos.get(projectId) || [];
    const newInfos = data.map(info => ({
      ...info,
      id: info.id || this.generateId()
    }));
    this.worldInfos.set(projectId, [...existingInfos, ...newInfos]);
    await this.save(projectId);
  }

  async exportWorldInfo(projectId: string): Promise<WorldInfo[]> {
    return this.worldInfos.get(projectId) || [];
  }

  async buildContextPrompt(projectId: string, context: string): Promise<string> {
    const relevantInfos = await this.getWorldInfoByContext(projectId, context);
    
    if (relevantInfos.length === 0) return '';
    
    const sortedInfos = [...relevantInfos].sort((a, b) => 
      (b.depth || 0) - (a.depth || 0)
    );
    
    const promptParts = sortedInfos.map(info => {
      const header = info.secondary 
        ? `[${info.name}]` 
        : `=== ${info.name} ===`;
      return `${header}\n${info.content}`;
    });
    
    return promptParts.join('\n\n');
  }

  private evaluateCondition(condition: string, context: string): boolean {
    const match = condition.match(/(\w+)\s*([<>=!]+)\s*(.+)/);
    if (!match) return true;
    
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

  private extractValueFromContext(context: string, varName: string): string {
    const regex = new RegExp(`${varName}[\\s:]+(.+?)(?:\\n|$)`, 'i');
    const match = context.match(regex);
    return match ? match[1].trim() : '';
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, 'worldinfo.json');
    const infos = this.worldInfos.get(projectId) || [];
    fs.writeFileSync(filePath, JSON.stringify(infos, null, 2), 'utf-8');
  }

  async load(projectId: string): Promise<void> {
    const filePath = path.join(this.storagePath, projectId, 'worldinfo.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      this.worldInfos.set(projectId, JSON.parse(data));
    } else {
      this.worldInfos.set(projectId, []);
    }
  }

  private generateId(): string {
    return `wi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WorldInfoManager;
