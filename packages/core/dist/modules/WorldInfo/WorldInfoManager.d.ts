/**
 * World Info Manager - 世界信息管理器
 * 层级化的世界设定信息，支持条件逻辑、动态变量、智能匹配
 * 增强版：完善的层级系统和高级功能
 */
import { WorldInfo } from '../../types';
export interface WorldInfoFilter {
    keywords?: string[];
    depth?: number;
    type?: string;
    tags?: string[];
    parentId?: string;
    activeOnly?: boolean;
}
export interface WorldInfoTemplate {
    id: string;
    name: string;
    description: string;
    categories: string[];
    structure: Omit<WorldInfo, 'id'>[];
}
export interface WorldInfoRelationship {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'parent' | 'child' | 'related' | 'opposite' | 'partOf';
    description?: string;
}
export interface ContextVariable {
    name: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean' | 'date' | 'list';
}
export declare class WorldInfoManager {
    private worldInfos;
    private relationships;
    private templates;
    private storagePath;
    constructor(storagePath?: string);
    /**
     * 初始化项目
     */
    initialize(projectId: string): Promise<void>;
    /**
     * 添加世界设定信息
     */
    addWorldInfo(projectId: string, info: Omit<WorldInfo, 'id'>): Promise<WorldInfo>;
    /**
     * 更新世界设定信息
     */
    updateWorldInfo(projectId: string, infoId: string, updates: Partial<WorldInfo>): Promise<WorldInfo | null>;
    /**
     * 删除世界设定信息（级联删除相关关系）
     */
    deleteWorldInfo(projectId: string, infoId: string): Promise<boolean>;
    /**
     * 获取世界设定信息（支持多种过滤方式）
     */
    getWorldInfo(projectId: string, filter?: WorldInfoFilter): Promise<WorldInfo[]>;
    /**
     * 根据上下文获取相关世界设定（增强版）
     */
    getWorldInfoByContext(projectId: string, context: string, options?: {
        maxResults?: number;
        maxDepth?: number;
        includeInactive?: boolean;
    }): Promise<WorldInfo[]>;
    /**
     * 搜索世界设定（模糊搜索）
     */
    searchWorldInfo(projectId: string, query: string, options?: {
        fuzzy?: boolean;
        maxResults?: number;
    }): Promise<WorldInfo[]>;
    /**
     * 获取层级结构
     */
    getHierarchy(projectId: string, rootId?: string): Promise<WorldInfo[]>;
    /**
     * 添加关系
     */
    addRelationship(projectId: string, relationship: Omit<WorldInfoRelationship, 'id'>): Promise<WorldInfoRelationship>;
    /**
     * 获取相关设定
     */
    getRelatedWorldInfo(projectId: string, infoId: string, relationshipTypes?: WorldInfoRelationship['type'][]): Promise<WorldInfo[]>;
    /**
     * 获取世界设定的所有子项
     */
    getChildren(projectId: string, parentId: string): Promise<WorldInfo[]>;
    /**
     * 获取世界设定的父项
     */
    getParent(projectId: string, childId: string): Promise<WorldInfo | undefined>;
    /**
     * 导入世界设定
     */
    importWorldInfo(projectId: string, data: WorldInfo[]): Promise<void>;
    /**
     * 导出世界设定
     */
    exportWorldInfo(projectId: string): Promise<{
        worldInfos: WorldInfo[];
        relationships: WorldInfoRelationship[];
    }>;
    /**
     * 构建上下文提示词（增强版）
     */
    buildContextPrompt(projectId: string, context: string, options?: {
        maxTokens?: number;
        includeRelationships?: boolean;
        format?: 'text' | 'json' | 'yaml';
    }): Promise<string>;
    /**
     * 应用模板
     */
    applyTemplate(projectId: string, templateId: string): Promise<WorldInfo[]>;
    /**
     * 创建模板
     */
    createTemplate(projectId: string, template: Omit<WorldInfoTemplate, 'id'>): Promise<WorldInfoTemplate>;
    /**
     * 获取所有模板
     */
    getTemplates(projectId: string): Promise<WorldInfoTemplate[]>;
    /**
     * 使用动态变量渲染内容
     */
    renderContent(projectId: string, infoId: string, variables: ContextVariable[]): Promise<string>;
    /**
     * 批量更新标签
     */
    batchUpdateTags(projectId: string, infoIds: string[], tagsToAdd?: string[], tagsToRemove?: string[]): Promise<void>;
    /**
     * 条件逻辑评估（增强版）
     */
    private evaluateCondition;
    /**
     * 从上下文中提取值
     */
    private extractValueFromContext;
    /**
     * 加载内置模板
     */
    private loadBuiltinTemplates;
    /**
     * 保存数据
     */
    private save;
    /**
     * 保存模板
     */
    private saveTemplates;
    /**
     * 加载数据
     */
    load(projectId: string): Promise<void>;
    /**
     * 生成ID
     */
    private generateId;
}
export default WorldInfoManager;
//# sourceMappingURL=WorldInfoManager.d.ts.map