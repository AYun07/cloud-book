/**
 * 卡片管理器
 * Schema验证的结构化信息管理
 */
import { Card, CardSchema } from '../../types';
export interface ValidationError {
    field: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export declare class CardManager {
    private cards;
    private schemas;
    private storagePath;
    constructor(storagePath?: string);
    private initializeDefaultSchemas;
    initialize(projectId: string): Promise<void>;
    addSchema(type: string, schema: CardSchema): Promise<void>;
    getSchema(type: string): Promise<CardSchema | undefined>;
    validate(card: Card): ValidationResult;
    private validateField;
    private validateStringFormat;
    createCard(projectId: string, type: string, title: string, content: Record<string, any>, parentId?: string): Promise<Card>;
    updateCard(projectId: string, cardId: string, updates: Partial<{
        title: string;
        content: Record<string, any>;
    }>): Promise<Card | null>;
    deleteCard(projectId: string, cardId: string): Promise<boolean>;
    getCard(projectId: string, cardId: string): Promise<Card | undefined>;
    getCardsByType(projectId: string, type: string): Promise<Card[]>;
    getChildCards(projectId: string, parentId: string): Promise<Card[]>;
    getAllCards(projectId: string): Promise<Card[]>;
    searchCards(projectId: string, query: string): Promise<Card[]>;
    linkCards(projectId: string, sourceId: string, targetId: string): Promise<void>;
    unlinkCards(projectId: string, sourceId: string, targetId: string): Promise<void>;
    exportCards(projectId: string, type?: string): Promise<Card[]>;
    importCards(projectId: string, cards: Card[]): Promise<void>;
    private save;
    load(projectId: string): Promise<void>;
    private generateId;
}
export default CardManager;
//# sourceMappingURL=CardManager.d.ts.map