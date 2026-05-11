/**
 * 卡片管理器
 * Schema验证的结构化信息管理
 */

import { Card, CardSchema, SchemaProperty, SchemaDefinition } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export class CardManager {
  private cards: Map<string, Map<string, Card>> = new Map();
  private schemas: Map<string, CardSchema> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/cards') {
    this.storagePath = storagePath;
    this.initializeDefaultSchemas();
  }

  private initializeDefaultSchemas(): void {
    this.schemas.set('character', {
      type: 'object',
      properties: {
        name: { type: 'string', description: '角色名称' },
        aliases: { type: 'array', items: { type: 'string' } },
        gender: { type: 'string', description: '性别' },
        age: { type: 'string', description: '年龄' },
        appearance: { type: 'string', description: '外貌描述' },
        personality: { type: 'string', description: '性格特点' },
        background: { type: 'string', description: '背景故事' },
        goals: { type: 'array', items: { type: 'string' } },
        abilities: { type: 'array', items: { type: 'string' } }
      },
      required: ['name']
    });

    this.schemas.set('location', {
      type: 'object',
      properties: {
        name: { type: 'string', description: '地点名称' },
        description: { type: 'string', description: '地点描述' },
        parentId: { type: 'string', description: '父级地点' },
        connections: { type: 'array', items: { type: 'string' } }
      },
      required: ['name']
    });

    this.schemas.set('item', {
      type: 'object',
      properties: {
        name: { type: 'string', description: '物品名称' },
        description: { type: 'string', description: '物品描述' },
        rarity: { type: 'string', description: '稀有度' },
        owner: { type: 'string', description: '持有者' }
      },
      required: ['name']
    });

    this.schemas.set('faction', {
      type: 'object',
      properties: {
        name: { type: 'string', description: '势力名称' },
        type: { type: 'string', description: '势力类型' },
        description: { type: 'string', description: '势力描述' },
        members: { type: 'array', items: { type: 'string' } },
        territory: { type: 'string', description: '势力范围' }
      },
      required: ['name']
    });

    this.schemas.set('chapter', {
      type: 'object',
      properties: {
        number: { type: 'number', description: '章节序号' },
        title: { type: 'string', description: '章节标题' },
        summary: { type: 'string', description: '章节摘要' },
        keyPoints: { type: 'array', items: { type: 'string' } },
        hooks: { type: 'array', items: { type: 'string' } }
      },
      required: ['number', 'title']
    });

    this.schemas.set('event', {
      type: 'object',
      properties: {
        name: { type: 'string', description: '事件名称' },
        description: { type: 'string', description: '事件描述' },
        chapter: { type: 'number', description: '发生章节' },
        impact: { type: 'string', description: '影响' }
      },
      required: ['name']
    });
  }

  async initialize(projectId: string): Promise<void> {
    this.cards.set(projectId, new Map());
    await this.load(projectId);
  }

  async addSchema(type: string, schema: CardSchema): Promise<void> {
    this.schemas.set(type, schema);
  }

  async getSchema(type: string): Promise<CardSchema | undefined> {
    return this.schemas.get(type);
  }

  validate(card: Card): ValidationResult {
    const schema = this.schemas.get(card.type);
    if (!schema) {
      return { valid: true, errors: [] };
    }

    const errors: ValidationError[] = [];

    if (schema.required) {
      for (const field of schema.required) {
        if (card.content[field] === undefined || card.content[field] === null) {
          errors.push({
            field,
            message: `Field "${field}" is required`
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async createCard(
    projectId: string,
    type: string,
    title: string,
    content: Record<string, any>,
    parentId?: string
  ): Promise<Card> {
    const card: Card = {
      id: this.generateId(),
      type,
      title,
      content,
      schema: this.schemas.get(type),
      parentId
    };

    const validation = this.validate(card);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const projectCards = this.cards.get(projectId) || new Map();
    projectCards.set(card.id, card);
    this.cards.set(projectId, projectCards);

    await this.save(projectId);
    return card;
  }

  async updateCard(
    projectId: string,
    cardId: string,
    updates: Partial<{ title: string; content: Record<string, any> }>
  ): Promise<Card | null> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return null;

    const card = projectCards.get(cardId);
    if (!card) return null;

    const updatedCard: Card = {
      ...card,
      title: updates.title ?? card.title,
      content: updates.content ?? card.content,
      metadata: {
        ...card.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    const validation = this.validate(updatedCard);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    projectCards.set(cardId, updatedCard);
    await this.save(projectId);
    return updatedCard;
  }

  async deleteCard(projectId: string, cardId: string): Promise<boolean> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return false;

    const deleted = projectCards.delete(cardId);
    if (deleted) {
      for (const [id, card] of projectCards) {
        if (card.parentId === cardId) {
          projectCards.delete(id);
        }
      }
      await this.save(projectId);
    }
    return deleted;
  }

  async getCard(projectId: string, cardId: string): Promise<Card | undefined> {
    return this.cards.get(projectId)?.get(cardId);
  }

  async getCardsByType(projectId: string, type: string): Promise<Card[]> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return [];
    return Array.from(projectCards.values()).filter(card => card.type === type);
  }

  async getChildCards(projectId: string, parentId: string): Promise<Card[]> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return [];
    return Array.from(projectCards.values()).filter(card => card.parentId === parentId);
  }

  async getAllCards(projectId: string): Promise<Card[]> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return [];
    return Array.from(projectCards.values());
  }

  async searchCards(projectId: string, query: string): Promise<Card[]> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return [];
    
    const queryLower = query.toLowerCase();
    return Array.from(projectCards.values()).filter(card => 
      card.title.toLowerCase().includes(queryLower) ||
      JSON.stringify(card.content).toLowerCase().includes(queryLower)
    );
  }

  async linkCards(projectId: string, sourceId: string, targetId: string): Promise<void> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return;

    const sourceCard = projectCards.get(sourceId);
    if (!sourceCard) return;

    const children = sourceCard.children || [];
    if (!children.includes(targetId)) {
      children.push(targetId);
      sourceCard.children = children;
      await this.save(projectId);
    }
  }

  async unlinkCards(projectId: string, sourceId: string, targetId: string): Promise<void> {
    const projectCards = this.cards.get(projectId);
    if (!projectCards) return;

    const sourceCard = projectCards.get(sourceId);
    if (!sourceCard || !sourceCard.children) return;

    sourceCard.children = sourceCard.children.filter(id => id !== targetId);
    await this.save(projectId);
  }

  async exportCards(projectId: string, type?: string): Promise<Card[]> {
    if (type) {
      return this.getCardsByType(projectId, type);
    }
    return this.getAllCards(projectId);
  }

  async importCards(projectId: string, cards: Card[]): Promise<void> {
    const projectCards = this.cards.get(projectId) || new Map();
    for (const card of cards) {
      const importedCard = { ...card, id: card.id || this.generateId() };
      projectCards.set(importedCard.id, importedCard);
    }
    this.cards.set(projectId, projectCards);
    await this.save(projectId);
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const projectCards = this.cards.get(projectId);
    if (projectCards) {
      fs.writeFileSync(
        path.join(dir, 'cards.json'),
        JSON.stringify(Array.from(projectCards.values()), null, 2),
        'utf-8'
      );
    }
  }

  async load(projectId: string): Promise<void> {
    const filePath = path.join(this.storagePath, projectId, 'cards.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const cardsMap = new Map<string, Card>();
      for (const card of data) {
        cardsMap.set(card.id, card);
      }
      this.cards.set(projectId, cardsMap);
    } else {
      this.cards.set(projectId, new Map());
    }
  }

  private generateId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CardManager;
