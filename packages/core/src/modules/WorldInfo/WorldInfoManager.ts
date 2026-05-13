/**
 * World Info Manager - 世界信息管理器
 * 层级化的世界设定信息，支持条件逻辑、动态变量、智能匹配
 * 增强版：完善的层级系统和高级功能
 */

import { WorldInfo } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

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

export interface GenerationOptions {
  genre?: string;
  theme?: string;
  storySeed?: string;
  depth?: number;
  modelName?: string;
}

export interface GeneratedWorldContent {
  overview: string;
  elements: Array<{
    name: string;
    key: string;
    content: string;
    keywords: string[];
    depth: number;
    parentKey?: string;
  }>;
}

export class WorldInfoManager {
  private worldInfos: Map<string, WorldInfo[]> = new Map();
  private relationships: Map<string, WorldInfoRelationship[]> = new Map();
  private templates: Map<string, WorldInfoTemplate[]> = new Map();
  private storagePath: string;
  private llmManager?: any;

  constructor(storagePath: string = './data/worldinfo', llmManager?: any) {
    this.storagePath = storagePath;
    this.llmManager = llmManager;
    this.loadBuiltinTemplates();
  }

  /**
   * 初始化项目
   */
  async initialize(projectId: string): Promise<void> {
    this.worldInfos.set(projectId, []);
    this.relationships.set(projectId, []);
  }

  /**
   * 添加世界设定信息
   */
  async addWorldInfo(projectId: string, info: Omit<WorldInfo, 'id'>): Promise<WorldInfo> {
    const infos = this.worldInfos.get(projectId) || [];
    const newInfo: WorldInfo = {
      id: this.generateId(),
      ...info,
      createdAt: info.createdAt || new Date(),
      updatedAt: new Date()
    };
    infos.push(newInfo);
    this.worldInfos.set(projectId, infos);
    await this.save(projectId);
    return newInfo;
  }

  /**
   * 更新世界设定信息
   */
  async updateWorldInfo(projectId: string, infoId: string, updates: Partial<WorldInfo>): Promise<WorldInfo | null> {
    const infos = this.worldInfos.get(projectId) || [];
    const index = infos.findIndex(i => i.id === infoId);
    if (index === -1) return null;
    
    infos[index] = { 
      ...infos[index], 
      ...updates,
      updatedAt: new Date()
    };
    this.worldInfos.set(projectId, infos);
    await this.save(projectId);
    return infos[index];
  }

  /**
   * 删除世界设定信息（级联删除相关关系）
   */
  async deleteWorldInfo(projectId: string, infoId: string): Promise<boolean> {
    const infos = this.worldInfos.get(projectId) || [];
    const filtered = infos.filter(i => i.id !== infoId);
    if (filtered.length === infos.length) return false;
    
    this.worldInfos.set(projectId, filtered);
    
    // 删除相关关系
    const rels = this.relationships.get(projectId) || [];
    const filteredRels = rels.filter(r => r.sourceId !== infoId && r.targetId !== infoId);
    this.relationships.set(projectId, filteredRels);
    
    await this.save(projectId);
    return true;
  }

  /**
   * 获取世界设定信息（支持多种过滤方式）
   */
  async getWorldInfo(projectId: string, filter?: WorldInfoFilter): Promise<WorldInfo[]> {
    let infos = this.worldInfos.get(projectId) || [];
    
    if (filter) {
      // 按关键词过滤
      if (filter.keywords && filter.keywords.length > 0) {
        infos = infos.filter(info => 
          filter.keywords!.some(kw => 
            info.keywords.includes(kw) || 
            info.content.includes(kw) ||
            info.name.includes(kw) ||
            info.key?.includes(kw)
          )
        );
      }
      
      // 按深度过滤
      if (filter.depth !== undefined) {
        infos = infos.filter(info => (info.depth || 0) <= filter.depth!);
      }
      
      // 按类型过滤
      if (filter.type) {
        infos = infos.filter(info => info.key?.startsWith(filter.type!));
      }
      
      // 按标签过滤
      if (filter.tags && filter.tags.length > 0) {
        infos = infos.filter(info => 
          filter.tags!.every(tag => info.tags?.includes(tag))
        );
      }
      
      // 按父级ID过滤
      if (filter.parentId) {
        infos = infos.filter(info => info.parentId === filter.parentId);
      }
      
      // 只显示激活的
      if (filter.activeOnly) {
        infos = infos.filter(info => info.active !== false);
      }
    }
    
    return infos;
  }

  /**
   * 根据上下文获取相关世界设定（增强版）
   */
  async getWorldInfoByContext(projectId: string, context: string, options?: {
    maxResults?: number;
    maxDepth?: number;
    includeInactive?: boolean;
  }): Promise<WorldInfo[]> {
    const opts = {
      maxResults: 20,
      maxDepth: 3,
      includeInactive: false,
      ...options
    };

    const infos = this.worldInfos.get(projectId) || [];
    const contextLower = context.toLowerCase();
    
    // 计算匹配分数
    const scoredInfos = infos
      .filter(info => opts.includeInactive || info.active !== false)
      .map(info => {
        let score = 0;
        
        // 关键词匹配得分
        const keywordMatches = info.keywords.filter(kw => 
          contextLower.includes(kw.toLowerCase())
        ).length;
        score += keywordMatches * 10;
        
        // 名称匹配得分
        if (info.name.toLowerCase().includes(contextLower)) {
          score += 20;
        }
        
        // 内容匹配得分
        if (info.content.toLowerCase().includes(contextLower)) {
          score += 5;
        }
        
        // 深度惩罚（层级越高优先级越低）
        const depth = info.depth || 0;
        if (depth <= opts.maxDepth) {
          score -= depth * 2;
        } else {
          score = 0; // 超过最大深度则排除
        }
        
        // 条件逻辑评估
        if (info.conditionalLogic) {
          try {
            const conditionMet = this.evaluateCondition(info.conditionalLogic, context);
            if (!conditionMet) {
              score = 0;
            } else {
              score += 15; // 条件满足加分
            }
          } catch {
            // 条件评估失败，不影响匹配
          }
        }
        
        // 活跃度加分
        if (info.active) {
          score += 5;
        }
        
        return { info, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.maxResults);
    
    return scoredInfos.map(item => item.info);
  }

  /**
   * 搜索世界设定（模糊搜索）
   */
  async searchWorldInfo(projectId: string, query: string, options?: {
    fuzzy?: boolean;
    maxResults?: number;
  }): Promise<WorldInfo[]> {
    const opts = {
      fuzzy: true,
      maxResults: 10,
      ...options
    };

    const infos = this.worldInfos.get(projectId) || [];
    const queryLower = query.toLowerCase();
    
    const scoredInfos = infos.map(info => {
      let score = 0;
      
      // 精确匹配
      if (info.name.toLowerCase() === queryLower) score += 100;
      if (info.key?.toLowerCase() === queryLower) score += 80;
      
      // 包含匹配
      if (info.name.toLowerCase().includes(queryLower)) score += 50;
      if (info.key?.toLowerCase().includes(queryLower)) score += 30;
      if (info.content.toLowerCase().includes(queryLower)) score += 20;
      
      // 关键词匹配
      const keywordMatches = info.keywords.filter(kw => 
        kw.toLowerCase().includes(queryLower)
      ).length;
      score += keywordMatches * 15;
      
      // 标签匹配
      const tagMatches = info.tags?.filter(tag => 
        tag.toLowerCase().includes(queryLower)
      ).length || 0;
      score += tagMatches * 10;
      
      return { info, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.maxResults);
    
    return scoredInfos.map(item => item.info);
  }

  /**
   * 获取层级结构
   */
  async getHierarchy(projectId: string, rootId?: string): Promise<WorldInfo[]> {
    const infos = this.worldInfos.get(projectId) || [];
    
    const buildTree = (parentId?: string): WorldInfo[] => {
      const children = infos.filter(info => info.parentId === parentId);
      return children.map(child => ({
        ...child,
        children: buildTree(child.id)
      } as any));
    };
    
    return buildTree(rootId);
  }

  /**
   * 添加关系
   */
  async addRelationship(projectId: string, relationship: Omit<WorldInfoRelationship, 'id'>): Promise<WorldInfoRelationship> {
    const rels = this.relationships.get(projectId) || [];
    const newRel: WorldInfoRelationship = {
      id: this.generateId(),
      ...relationship
    };
    rels.push(newRel);
    this.relationships.set(projectId, rels);
    await this.save(projectId);
    return newRel;
  }

  /**
   * 获取相关设定
   */
  async getRelatedWorldInfo(projectId: string, infoId: string, relationshipTypes?: WorldInfoRelationship['type'][]): Promise<WorldInfo[]> {
    const rels = this.relationships.get(projectId) || [];
    const infos = this.worldInfos.get(projectId) || [];
    
    const filteredRels = rels.filter(r => 
      (r.sourceId === infoId || r.targetId === infoId) &&
      (!relationshipTypes || relationshipTypes.includes(r.type))
    );
    
    const relatedIds = new Set<string>();
    for (const rel of filteredRels) {
      if (rel.sourceId === infoId) {
        relatedIds.add(rel.targetId);
      } else {
        relatedIds.add(rel.sourceId);
      }
    }
    
    return infos.filter(info => relatedIds.has(info.id));
  }

  /**
   * 获取世界设定的所有子项
   */
  async getChildren(projectId: string, parentId: string): Promise<WorldInfo[]> {
    const infos = this.worldInfos.get(projectId) || [];
    return infos.filter(info => info.parentId === parentId);
  }

  /**
   * 获取世界设定的父项
   */
  async getParent(projectId: string, childId: string): Promise<WorldInfo | undefined> {
    const infos = this.worldInfos.get(projectId) || [];
    const child = infos.find(info => info.id === childId);
    if (!child?.parentId) return undefined;
    return infos.find(info => info.id === child.parentId);
  }

  /**
   * 导入世界设定
   */
  async importWorldInfo(projectId: string, data: WorldInfo[]): Promise<void> {
    const existingInfos = this.worldInfos.get(projectId) || [];
    const newInfos = data.map(info => ({
      ...info,
      id: info.id || this.generateId(),
      createdAt: info.createdAt || new Date(),
      updatedAt: new Date()
    }));
    this.worldInfos.set(projectId, [...existingInfos, ...newInfos]);
    await this.save(projectId);
  }

  /**
   * 导出世界设定
   */
  async exportWorldInfo(projectId: string): Promise<{
    worldInfos: WorldInfo[];
    relationships: WorldInfoRelationship[];
  }> {
    return {
      worldInfos: this.worldInfos.get(projectId) || [],
      relationships: this.relationships.get(projectId) || []
    };
  }

  /**
   * 构建上下文提示词（增强版）
   */
  async buildContextPrompt(projectId: string, context: string, options?: {
    maxTokens?: number;
    includeRelationships?: boolean;
    format?: 'text' | 'json' | 'yaml';
  }): Promise<string> {
    const opts = {
      maxTokens: 4096,
      includeRelationships: true,
      format: 'text' as const,
      ...options
    };

    const relevantInfos = await this.getWorldInfoByContext(projectId, context, {
      maxResults: 20,
      maxDepth: 3
    });

    if (relevantInfos.length === 0) return '';

    let prompt = '';

    if (opts.format === 'text') {
      const sortedInfos = [...relevantInfos].sort((a, b) => 
        (b.depth || 0) - (a.depth || 0)
      );

      for (const info of sortedInfos) {
        const header = info.secondary 
          ? `[${info.name}]` 
          : `=== ${info.name} ===`;
        
        let content = `${header}\n${info.content}`;
        
        // 如果启用关系，添加相关信息
        if (opts.includeRelationships) {
          const related = await this.getRelatedWorldInfo(projectId, info.id, ['related']);
          if (related.length > 0) {
            content += `\n\n相关设定: ${related.map(r => r.name).join(', ')}`;
          }
        }
        
        if (prompt.length + content.length + 2 <= opts.maxTokens) {
          prompt += (prompt ? '\n\n' : '') + content;
        } else {
          break;
        }
      }
    } else if (opts.format === 'json') {
      const structured = relevantInfos.map(info => ({
        id: info.id,
        name: info.name,
        key: info.key,
        content: info.content,
        depth: info.depth,
        keywords: info.keywords
      }));
      prompt = JSON.stringify(structured, null, 2);
    } else if (opts.format === 'yaml') {
      const yamlParts = relevantInfos.map(info => `
- name: "${info.name}"
  key: "${info.key || ''}"
  depth: ${info.depth || 0}
  keywords:
${info.keywords.map(kw => `    - "${kw}"`).join('\n')}
  content: |
${info.content.split('\n').map(line => `    ${line}`).join('\n')}
`);
      prompt = yamlParts.join('');
    }

    return prompt;
  }

  /**
   * 使用 LLM 自动生成世界设定内容
   */
  async generateWorldContent(
    projectId: string,
    options: GenerationOptions
  ): Promise<WorldInfo[]> {
    const { genre = '奇幻', theme, storySeed, depth = 2, modelName } = options;

    if (!this.llmManager) {
      throw new Error('LLM Manager not configured. Please provide LLMManager instance.');
    }

    const prompt = this.buildGenerationPrompt(genre, theme, storySeed, depth);
    const response = await this.llmManager.generate(prompt, modelName, {
      temperature: 0.8,
      maxTokens: 4096
    });

    return this.parseGeneratedContent(projectId, response.text, depth);
  }

  /**
   * 构建生成提示词
   */
  private buildGenerationPrompt(
    genre: string,
    theme?: string,
    storySeed?: string,
    depth?: number
  ): string {
    const depthDescription = depth === 0
      ? '仅生成世界观概览'
      : depth === 1
        ? '生成概览和主要设定（如主要种族、地理、政治等）'
        : '生成概览、主要设定和细节设定（如具体地点、组织、物品等）';

    return `你是一位资深的小说世界构建专家。请为以下题材的小说生成详细的世界观设定：

题材类型：${genre}
${theme ? `核心主题：${theme}` : ''}
${storySeed ? `故事种子：${storySeed}` : ''}

生成要求：
1. ${depthDescription}
2. 每个设定需要包含：名称、英文键名（用于代码引用）、描述内容、关键词（用于触发匹配）
3. 设定之间应该有层级关系和逻辑关联
4. 内容要具体、有细节，便于在写作时直接使用
5. 关键词要能覆盖常见的写作场景

请以JSON格式输出，结构如下：
{
  "overview": "世界观概览（100-200字）",
  "elements": [
    {
      "name": "设定名称",
      "key": "setting_key",
      "content": "详细描述（200-500字）",
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "depth": 0,
      "parentKey": null
    }
  ]
}

注意：
- depth 0 表示顶层概览，1 表示主要设定，2+ 表示详细设定
- parentKey 填入父级设定的 key，顶层设定填 null
- 确保 keywords 能被写作上下文触发匹配
- 输出必须是合法的 JSON 格式`;
  }

  /**
   * 解析 LLM 生成的内容
   */
  private async parseGeneratedContent(
    projectId: string,
    llmResponse: string,
    maxDepth: number
  ): Promise<WorldInfo[]> {
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse LLM response as JSON');
    }

    const generated: GeneratedWorldContent = JSON.parse(jsonMatch[0]);
    const createdInfos: WorldInfo[] = [];
    const parentIdMap = new Map<string, string>();

    if (generated.overview) {
      const overview = await this.addWorldInfo(projectId, {
        name: '世界观概览',
        key: 'world_overview',
        content: generated.overview,
        keywords: ['世界', '世界观', '概览', '背景'],
        depth: 0,
        active: true
      });
      createdInfos.push(overview);
      parentIdMap.set('world_overview', overview.id);
    }

    for (const element of generated.elements) {
      if (element.depth > maxDepth) continue;

      let parentId: string | undefined;
      if (element.parentKey && parentIdMap.has(element.parentKey)) {
        parentId = parentIdMap.get(element.parentKey);
      }

      const info = await this.addWorldInfo(projectId, {
        name: element.name,
        key: element.key,
        content: element.content,
        keywords: element.keywords,
        depth: element.depth,
        parentId,
        active: true
      });

      createdInfos.push(info);
      if (element.key) {
        parentIdMap.set(element.key, info.id);
      }
    }

    return createdInfos;
  }

  /**
   * 设置 LLM Manager（用于后续配置）
   */
  setLLMManager(llmManager: any): void {
    this.llmManager = llmManager;
  }

  /**
   * 应用模板
   */
  async applyTemplate(projectId: string, templateId: string): Promise<WorldInfo[]> {
    const projectTemplates = this.templates.get(projectId) || [];
    const globalTemplates = this.templates.get('global') || [];
    
    const template = projectTemplates.find(t => t.id === templateId) || 
                     globalTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const createdInfos: WorldInfo[] = [];
    for (const structure of template.structure) {
      const info = await this.addWorldInfo(projectId, structure);
      createdInfos.push(info);
    }
    
    return createdInfos;
  }

  /**
   * 创建模板
   */
  async createTemplate(projectId: string, template: Omit<WorldInfoTemplate, 'id'>): Promise<WorldInfoTemplate> {
    const templates = this.templates.get(projectId) || [];
    const newTemplate: WorldInfoTemplate = {
      id: this.generateId(),
      ...template
    };
    templates.push(newTemplate);
    this.templates.set(projectId, templates);
    await this.saveTemplates(projectId);
    return newTemplate;
  }

  /**
   * 获取所有模板
   */
  async getTemplates(projectId: string): Promise<WorldInfoTemplate[]> {
    const projectTemplates = this.templates.get(projectId) || [];
    const globalTemplates = this.templates.get('global') || [];
    return [...globalTemplates, ...projectTemplates];
  }

  /**
   * 使用动态变量渲染内容
   */
  async renderContent(projectId: string, infoId: string, variables: ContextVariable[]): Promise<string> {
    const infos = this.worldInfos.get(projectId) || [];
    const info = infos.find(i => i.id === infoId);
    
    if (!info) {
      throw new Error(`WorldInfo ${infoId} not found`);
    }
    
    let content = info.content;
    
    // 替换变量
    for (const variable of variables) {
      const placeholder = `{{${variable.name}}}`;
      const value = String(variable.value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // 支持嵌套引用其他世界设定
    const referenceRegex = /\[\[(\w+)\]\]/g;
    let match;
    while ((match = referenceRegex.exec(content)) !== null) {
      const refId = match[1];
      const refInfo = infos.find(i => i.key === refId || i.id === refId);
      if (refInfo) {
        content = content.replace(match[0], refInfo.content);
      }
    }
    
    return content;
  }

  /**
   * 批量更新标签
   */
  async batchUpdateTags(projectId: string, infoIds: string[], tagsToAdd?: string[], tagsToRemove?: string[]): Promise<void> {
    const infos = this.worldInfos.get(projectId) || [];
    
    for (const infoId of infoIds) {
      const info = infos.find(i => i.id === infoId);
      if (info) {
        let currentTags = info.tags || [];
        
        if (tagsToAdd) {
          currentTags = [...new Set([...currentTags, ...tagsToAdd])];
        }
        
        if (tagsToRemove) {
          currentTags = currentTags.filter(t => !tagsToRemove.includes(t));
        }
        
        info.tags = currentTags;
        info.updatedAt = new Date();
      }
    }
    
    await this.save(projectId);
  }

  /**
   * 条件逻辑评估（增强版）
   */
  private evaluateCondition(condition: string, context: string): boolean {
    // 支持复杂条件表达式
    const contextLower = context.toLowerCase();
    
    // 解析条件表达式
    const expressions = condition.split(/\s+(and|or)\s+/i);
    let result = true;
    let operator = 'and';
    
    for (const expr of expressions) {
      const trimmed = expr.trim().toLowerCase();
      
      if (trimmed === 'and' || trimmed === 'or') {
        operator = trimmed;
        continue;
      }
      
      const match = trimmed.match(/(\w+)\s*([<>=!]+)\s*['"]?(.+?)['"]?$/);
      if (!match) continue;
      
      const [, varName, op, value] = match;
      const contextValue = this.extractValueFromContext(context, varName);
      const contextValueLower = contextValue.toLowerCase();
      const valueLower = value.toLowerCase();
      
      let exprResult = false;
      
      switch (op) {
        case '==':
        case '=':
          exprResult = contextValueLower === valueLower;
          break;
        case '!=':
          exprResult = contextValueLower !== valueLower;
          break;
        case '>':
          exprResult = Number(contextValue) > Number(value);
          break;
        case '<':
          exprResult = Number(contextValue) < Number(value);
          break;
        case '>=':
          exprResult = Number(contextValue) >= Number(value);
          break;
        case '<=':
          exprResult = Number(contextValue) <= Number(value);
          break;
        case 'contains':
        case 'includes':
          exprResult = contextValueLower.includes(valueLower);
          break;
        case 'notcontains':
        case 'notincludes':
          exprResult = !contextValueLower.includes(valueLower);
          break;
        case 'exists':
          exprResult = contextValue !== '';
          break;
        case 'notexists':
          exprResult = contextValue === '';
          break;
        case 'matches':
          try {
            exprResult = new RegExp(value).test(contextValue);
          } catch {
            exprResult = false;
          }
          break;
        default:
          exprResult = true;
      }
      
      if (operator === 'and') {
        result = result && exprResult;
      } else {
        result = result || exprResult;
      }
    }
    
    return result;
  }

  /**
   * 从上下文中提取值
   */
  private extractValueFromContext(context: string, varName: string): string {
    // 尝试多种提取方式
    const patterns = [
      new RegExp(`${varName}\\s*[:=]\\s*([^\\n]+)`, 'i'),
      new RegExp(`${varName}\\s+(.+?)(?:\\s+|\\n|$)`, 'i'),
      new RegExp(`"${varName}"\\s*[:=]\\s*["']?([^"']+)["']?`, 'i'),
      new RegExp(`'${varName}'\\s*[:=]\\s*["']?([^"']+)["']?`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = context.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '';
  }

  /**
   * 加载内置模板
   */
  private loadBuiltinTemplates(): void {
    const globalTemplates: WorldInfoTemplate[] = [
      {
        id: 'template_fantasy_world',
        name: '奇幻世界基础模板',
        description: '适用于奇幻题材小说的基础世界设定模板',
        categories: ['奇幻', '模板'],
        structure: [
          {
            name: '世界观概览',
            key: 'world_overview',
            content: '这是一个充满魔法与冒险的奇幻世界，拥有独特的历史、地理和文化。',
            keywords: ['世界', '世界观', '概览'],
            depth: 0,
            active: true
          },
          {
            name: '魔法体系',
            key: 'magic_system',
            content: '世界中的魔法分为元素魔法、黑暗魔法、光明魔法三大体系。魔法师通过冥想与自然元素沟通。',
            keywords: ['魔法', '魔法体系', '元素'],
            depth: 1,
            active: true,
            parentId: 'wi_placeholder_1'
          },
          {
            name: '主要种族',
            key: 'races',
            content: '人类、精灵、矮人、兽人、龙族等多个种族共同生活在这个世界。',
            keywords: ['种族', '精灵', '矮人', '兽人'],
            depth: 1,
            active: true,
            parentId: 'wi_placeholder_1'
          }
        ]
      },
      {
        id: 'template_xianxia',
        name: '仙侠世界模板',
        description: '适用于仙侠题材小说的世界设定模板',
        categories: ['仙侠', '模板'],
        structure: [
          {
            name: '修炼体系',
            key: 'cultivation_system',
            content: '练气、筑基、金丹、元婴、化神、渡劫、飞升',
            keywords: ['修炼', '境界', '修为'],
            depth: 0,
            active: true
          },
          {
            name: '宗门势力',
            key: 'sects',
            content: '正道三大宗门：青云宗、天音寺、仙剑派；魔道：血魔门、幽冥宗',
            keywords: ['宗门', '势力', '门派'],
            depth: 1,
            active: true,
            parentId: 'wi_placeholder_2'
          }
        ]
      }
    ];
    
    this.templates.set('global', globalTemplates);
  }

  /**
   * 保存数据
   */
  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 保存世界设定
    const infosPath = path.join(dir, 'worldinfo.json');
    const infos = this.worldInfos.get(projectId) || [];
    fs.writeFileSync(infosPath, JSON.stringify(infos, null, 2), 'utf-8');
    
    // 保存关系
    const relsPath = path.join(dir, 'relationships.json');
    const rels = this.relationships.get(projectId) || [];
    fs.writeFileSync(relsPath, JSON.stringify(rels, null, 2), 'utf-8');
  }

  /**
   * 保存模板
   */
  private async saveTemplates(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const templatesPath = path.join(dir, 'templates.json');
    const templates = this.templates.get(projectId) || [];
    fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf-8');
  }

  /**
   * 加载数据
   */
  async load(projectId: string): Promise<void> {
    // 加载世界设定
    const infosPath = path.join(this.storagePath, projectId, 'worldinfo.json');
    if (fs.existsSync(infosPath)) {
      const data = fs.readFileSync(infosPath, 'utf-8');
      this.worldInfos.set(projectId, JSON.parse(data));
    } else {
      this.worldInfos.set(projectId, []);
    }
    
    // 加载关系
    const relsPath = path.join(this.storagePath, projectId, 'relationships.json');
    if (fs.existsSync(relsPath)) {
      const data = fs.readFileSync(relsPath, 'utf-8');
      this.relationships.set(projectId, JSON.parse(data));
    } else {
      this.relationships.set(projectId, []);
    }
    
    // 加载模板
    const templatesPath = path.join(this.storagePath, projectId, 'templates.json');
    if (fs.existsSync(templatesPath)) {
      const data = fs.readFileSync(templatesPath, 'utf-8');
      this.templates.set(projectId, JSON.parse(data));
    }
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `wi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WorldInfoManager;