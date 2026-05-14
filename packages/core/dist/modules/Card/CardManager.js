"use strict";
/**
 * 卡片管理器
 * Schema验证的结构化信息管理
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
exports.CardManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CardManager {
    cards = new Map();
    schemas = new Map();
    storagePath;
    constructor(storagePath = './data/cards') {
        this.storagePath = storagePath;
        this.initializeDefaultSchemas();
    }
    initializeDefaultSchemas() {
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
    async initialize(projectId) {
        this.cards.set(projectId, new Map());
        await this.load(projectId);
    }
    async addSchema(type, schema) {
        this.schemas.set(type, schema);
    }
    async getSchema(type) {
        return this.schemas.get(type);
    }
    validate(card) {
        const schema = this.schemas.get(card.type);
        if (!schema) {
            return { valid: true, errors: [] };
        }
        const errors = [];
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
        for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
            const value = card.content[fieldName];
            if (value === undefined || value === null) {
                continue;
            }
            const fieldErrors = this.validateField(fieldName, value, fieldDef, schema);
            errors.push(...fieldErrors);
        }
        return { valid: errors.length === 0, errors };
    }
    validateField(fieldName, value, fieldDef, schema) {
        const errors = [];
        if (fieldDef.$ref) {
            const refDef = schema.$defs?.[fieldDef.$ref];
            if (refDef) {
                for (const [nestedField, nestedDef] of Object.entries(refDef.properties)) {
                    const nestedValue = value[nestedField];
                    const nestedErrors = this.validateField(`${fieldName}.${nestedField}`, nestedValue, nestedDef, schema);
                    errors.push(...nestedErrors);
                }
            }
            return errors;
        }
        switch (fieldDef.type) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push({
                        field: fieldName,
                        message: `Field "${fieldName}" must be a string`
                    });
                }
                else {
                    if (fieldDef.format) {
                        const formatError = this.validateStringFormat(fieldName, value, fieldDef.format);
                        if (formatError)
                            errors.push(formatError);
                    }
                }
                break;
            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    errors.push({
                        field: fieldName,
                        message: `Field "${fieldName}" must be a number`
                    });
                }
                else {
                    if (fieldDef.minimum !== undefined && value < fieldDef.minimum) {
                        errors.push({
                            field: fieldName,
                            message: `Field "${fieldName}" must be >= ${fieldDef.minimum}`
                        });
                    }
                    if (fieldDef.maximum !== undefined && value > fieldDef.maximum) {
                        errors.push({
                            field: fieldName,
                            message: `Field "${fieldName}" must be <= ${fieldDef.maximum}`
                        });
                    }
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push({
                        field: fieldName,
                        message: `Field "${fieldName}" must be a boolean`
                    });
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    errors.push({
                        field: fieldName,
                        message: `Field "${fieldName}" must be an array`
                    });
                }
                else if (fieldDef.items) {
                    for (let i = 0; i < value.length; i++) {
                        const itemErrors = this.validateField(`${fieldName}[${i}]`, value[i], fieldDef.items, schema);
                        errors.push(...itemErrors);
                    }
                }
                break;
            case 'object':
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    errors.push({
                        field: fieldName,
                        message: `Field "${fieldName}" must be an object`
                    });
                }
                break;
        }
        return errors;
    }
    validateStringFormat(fieldName, value, format) {
        switch (format) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid email` };
                }
                break;
            case 'uri':
            case 'url':
                try {
                    new URL(value);
                }
                catch {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid URL` };
                }
                break;
            case 'uuid':
                if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid UUID` };
                }
                break;
            case 'date':
                if (isNaN(Date.parse(value))) {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid date` };
                }
                break;
            case 'date-time':
                if (isNaN(Date.parse(value)) || !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid ISO datetime` };
                }
                break;
            case 'regex':
                try {
                    new RegExp(value);
                }
                catch {
                    return { field: fieldName, message: `Field "${fieldName}" must be a valid regex pattern` };
                }
                break;
            default:
                break;
        }
        return null;
    }
    async createCard(projectId, type, title, content, parentId) {
        const schema = this.schemas.get(type);
        if (!schema) {
            throw new Error(`Unknown card type: ${type}`);
        }
        const card = {
            id: this.generateId(),
            type,
            title,
            content,
            schema,
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
    async updateCard(projectId, cardId, updates) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return null;
        const card = projectCards.get(cardId);
        if (!card)
            return null;
        const updatedCard = {
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
    async deleteCard(projectId, cardId) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return false;
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
    async getCard(projectId, cardId) {
        return this.cards.get(projectId)?.get(cardId);
    }
    async getCardsByType(projectId, type) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return [];
        return Array.from(projectCards.values()).filter(card => card.type === type);
    }
    async getChildCards(projectId, parentId) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return [];
        return Array.from(projectCards.values()).filter(card => card.parentId === parentId);
    }
    async getAllCards(projectId) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return [];
        return Array.from(projectCards.values());
    }
    async searchCards(projectId, query) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return [];
        const queryLower = query.toLowerCase();
        return Array.from(projectCards.values()).filter(card => card.title.toLowerCase().includes(queryLower) ||
            JSON.stringify(card.content).toLowerCase().includes(queryLower));
    }
    async linkCards(projectId, sourceId, targetId) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return;
        const sourceCard = projectCards.get(sourceId);
        if (!sourceCard)
            return;
        const children = sourceCard.children || [];
        if (!children.includes(targetId)) {
            children.push(targetId);
            sourceCard.children = children;
            await this.save(projectId);
        }
    }
    async unlinkCards(projectId, sourceId, targetId) {
        const projectCards = this.cards.get(projectId);
        if (!projectCards)
            return;
        const sourceCard = projectCards.get(sourceId);
        if (!sourceCard || !sourceCard.children)
            return;
        sourceCard.children = sourceCard.children.filter(id => id !== targetId);
        await this.save(projectId);
    }
    async exportCards(projectId, type) {
        if (type) {
            return this.getCardsByType(projectId, type);
        }
        return this.getAllCards(projectId);
    }
    async importCards(projectId, cards) {
        const projectCards = this.cards.get(projectId) || new Map();
        for (const card of cards) {
            const importedCard = { ...card, id: card.id || this.generateId() };
            projectCards.set(importedCard.id, importedCard);
        }
        this.cards.set(projectId, projectCards);
        await this.save(projectId);
    }
    async save(projectId) {
        const dir = path.join(this.storagePath, projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const projectCards = this.cards.get(projectId);
        if (projectCards) {
            fs.writeFileSync(path.join(dir, 'cards.json'), JSON.stringify(Array.from(projectCards.values()), null, 2), 'utf-8');
        }
    }
    async load(projectId) {
        const filePath = path.join(this.storagePath, projectId, 'cards.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const cardsMap = new Map();
            for (const card of data) {
                cardsMap.set(card.id, card);
            }
            this.cards.set(projectId, cardsMap);
        }
        else {
            this.cards.set(projectId, new Map());
        }
    }
    generateId() {
        return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CardManager = CardManager;
exports.default = CardManager;
//# sourceMappingURL=CardManager.js.map