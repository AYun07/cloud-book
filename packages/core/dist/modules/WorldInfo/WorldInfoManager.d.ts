/**
 * 世界信息管理器
 * 层级化的世界设定信息，支持条件逻辑
 */
import { WorldInfo } from '../../types';
export interface WorldInfoFilter {
    keywords?: string[];
    depth?: number;
    type?: string;
}
export declare class WorldInfoManager {
    private worldInfos;
    private storagePath;
    constructor(storagePath?: string);
    initialize(projectId: string): Promise<void>;
    addWorldInfo(projectId: string, info: Omit<WorldInfo, 'id'>): Promise<WorldInfo>;
    updateWorldInfo(projectId: string, infoId: string, updates: Partial<WorldInfo>): Promise<WorldInfo | null>;
    deleteWorldInfo(projectId: string, infoId: string): Promise<boolean>;
    getWorldInfo(projectId: string, filter?: WorldInfoFilter): Promise<WorldInfo[]>;
    getWorldInfoByContext(projectId: string, context: string): Promise<WorldInfo[]>;
    searchWorldInfo(projectId: string, query: string): Promise<WorldInfo[]>;
    importWorldInfo(projectId: string, data: WorldInfo[]): Promise<void>;
    exportWorldInfo(projectId: string): Promise<WorldInfo[]>;
    buildContextPrompt(projectId: string, context: string): Promise<string>;
    private evaluateCondition;
    private extractValueFromContext;
    private save;
    load(projectId: string): Promise<void>;
    private generateId;
}
export default WorldInfoManager;
//# sourceMappingURL=WorldInfoManager.d.ts.map