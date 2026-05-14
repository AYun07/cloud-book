/**
 * Cloud Book - 深度优化角色资产管理系统
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - 角色全生命周期管理
 * - 关系网络追踪
 * - 家谱系统
 * - 角色画像与心理学
 * - 性别平衡报告
 */

import { Character, Relationship, FamilyMember, CharacterArc } from '../../types';

// ============================================
// 角色资产管理核心类型
// ============================================

export type CharacterType = 
  | 'protagonist'      // 主角
  | 'antagonist'       // 反派
  | 'mentor'           // 导师
  | 'supporting'      // 配角
  | 'minor'           // 次要角色
  | 'narrator';      // 叙述者

export type Gender = 'male' | 'female' | 'non_binary' | 'other' | 'unknown';

export type AgeGroup = 
  | 'child'           // 儿童 (0-12)
  | 'teenager'        // 青少年 (13-19)
  | 'young_adult'     // 年轻成人 (20-35)
  | 'middle_aged'     // 中年 (36-55)
  | 'elderly';       // 老年 (56+)

export interface CharacterAsset extends Character {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  
  // 基础信息
  type: CharacterType;
  gender: Gender;
  age: string;
  ageGroup: AgeGroup;
  
  // 外貌
  appearance: {
    general: string;
    facialFeatures?: string;
    bodyType?: string;
    distinguishingMarks?: string[];
    clothing?: string;
  };
  
  // 性格
  personality: {
    traits: PersonalityTrait[];
    strengths: string[];
    weaknesses: string[];
    fears: string[];
    desires: string[];
    moralAlignment?: string;
  };
  
  // 背景
  background: {
    summary: string;
    birthplace?: string;
    education?: string;
    occupation?: string;
    keyLifeEvents: LifeEvent[];
    familyHistory?: string;
  };
  
  // 心理学
  psychology: {
    mbti?: string;
    enneagram?: string;
    attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
    bigFive?: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    coreWounds: string[];
    defenseMechanisms: string[];
    loveLanguage?: string[];
  };
  
  // 说话风格
  speakingStyle: {
    vocabulary: string[];
    speechPatterns: string[];
    dialect?: string;
    exampleDialogues: DialogueSample[];
  };
  
  // 能力
  abilities: {
    physical: string[];
    mental: string[];
    social: string[];
    special?: string[];
  };
  
  // 发展
  characterArc: {
    startState: string;
    endState: string;
    currentStage: 'setup' | 'rising' | 'climax' | 'resolution';
    milestones: ArcMilestone[];
  };
  
  // 元数据
  metadata: {
    tags: string[];
    importance: number; // 0-100
    isRecurring: boolean;
    relatedWorks?: string[];
    authorNotes?: string;
  };
}

export interface PersonalityTrait {
  name: string;
  intensity: number; // 0-100
  description?: string;
}

export interface LifeEvent {
  id: string;
  age: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'transformative';
  relatedCharacters: string[];
}

export interface ArcMilestone {
  chapter: number;
  title: string;
  description: string;
  type: 'trigger' | 'breakthrough' | 'setback' | 'transformation';
}

export interface DialogueSample {
  id: string;
  context: string;
  dialogue: string;
  chapter?: number;
}

export interface CharacterRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  subtype?: string;
  description: string;
  startChapter?: number;
  endChapter?: number;
  intimacy: number; // -100 to 100
  trust: number; // -100 to 100
  conflict: number; // 0 to 100
  status: 'developing' | 'stable' | 'deteriorating' | 'ended';
  history: RelationshipEvent[];
}

export type RelationshipType = 
  | 'family'
  | 'romantic'
  | 'friendship'
  | 'rivalry'
  | 'mentor'
  | 'enemy'
  | 'professional'
  | 'stranger';

export interface RelationshipEvent {
  chapter: number;
  event: string;
  intimacyChange: number;
  trustChange: number;
  conflictChange: number;
}

export interface FamilyTree {
  rootId: string;
  generations: FamilyGeneration[];
  relationships: FamilyRelationship[];
}

export interface FamilyGeneration {
  generation: number;
  characters: CharacterAsset[];
  connections: FamilyConnection[];
}

export interface FamilyConnection {
  parentId: string;
  childId: string;
  type: 'biological' | 'adoptive' | 'step' | 'foster';
}

export interface FamilyRelationship {
  characterId: string;
  relation: string;
  generation: number;
}

export interface CharacterSearchQuery {
  name?: string;
  type?: CharacterType[];
  gender?: Gender[];
  ageGroup?: AgeGroup[];
  tags?: string[];
  hasRelationship?: string;
  relationshipType?: RelationshipType;
  importanceMin?: number;
  traits?: string[];
}

export interface CharacterGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  leaderId?: string;
}

export interface GenderBalanceReport {
  overview: {
    totalCharacters: number;
    maleCount: number;
    femaleCount: number;
    nonBinaryCount: number;
    unknownCount: number;
  };
  percentages: {
    male: number;
    female: number;
    nonBinary: number;
    unknown: number;
  };
  ageGroupDistribution: Map<AgeGroup, { male: number; female: number; other: number }>;
  typeDistribution: Map<CharacterType, { male: number; female: number; other: number }>;
  isBalanced: boolean;
  balanceScore: number; // 0-100
  recommendations: BalanceRecommendation[];
}

export interface BalanceRecommendation {
  type: 'add_character' | 'modify_existing' | 'change_arc';
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedGender?: Gender;
  suggestedType?: CharacterType;
}

export interface CharacterNetwork {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  clusters: CharacterCluster[];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: CharacterType;
  importance: number;
  gender: Gender;
  cluster?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number; // 0-1
}

export interface CharacterCluster {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  centralCharacterId: string;
}

// ============================================
// 增强型 CharacterManager
// ============================================

export class EnhancedCharacterManager {
  private characters: Map<string, Map<string, CharacterAsset>> = new Map(); // projectId -> characterId -> character
  private relationships: Map<string, CharacterRelationship[]> = new Map(); // projectId -> relationships
  private familyTrees: Map<string, FamilyTree> = new Map(); // projectId -> familyTree
  private characterGroups: Map<string, CharacterGroup[]> = new Map(); // projectId -> groups
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {}

  // ============================================
  // 项目初始化
  // ============================================

  async initialize(projectId: string): Promise<void> {
    if (!this.characters.has(projectId)) {
      this.characters.set(projectId, new Map());
      this.relationships.set(projectId, []);
      this.familyTrees.set(projectId, { rootId: '', generations: [], relationships: [] });
      this.characterGroups.set(projectId, []);
    }
  }

  // ============================================
  // 角色 CRUD
  // ============================================

  async createCharacter(
    projectId: string, 
    character: Omit<CharacterAsset, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<CharacterAsset> {
    await this.initialize(projectId);

    const newCharacter: CharacterAsset = {
      ...character,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    this.characters.get(projectId)!.set(newCharacter.id, newCharacter);
    this.emit('characterCreated', newCharacter);
    
    return newCharacter;
  }

  async updateCharacter(
    projectId: string, 
    characterId: string, 
    updates: Partial<CharacterAsset>
  ): Promise<CharacterAsset | null> {
    const character = this.getCharacter(projectId, characterId);
    if (!character) return null;

    const updated: CharacterAsset = {
      ...character,
      ...updates,
      id: characterId,
      updatedAt: new Date(),
      version: character.version + 1
    };

    this.characters.get(projectId)!.set(characterId, updated);
    this.emit('characterUpdated', updated);
    
    return updated;
  }

  async deleteCharacter(projectId: string, characterId: string): Promise<boolean> {
    const deleted = this.characters.get(projectId)?.delete(characterId);
    if (deleted) {
      // 删除相关关系
      const rels = this.relationships.get(projectId) || [];
      const filtered = rels.filter(r => r.sourceId !== characterId && r.targetId !== characterId);
      this.relationships.set(projectId, filtered);
      
      this.emit('characterDeleted', { id: characterId });
    }
    return deleted || false;
  }

  getCharacter(projectId: string, characterId: string): CharacterAsset | null {
    return this.characters.get(projectId)?.get(characterId) || null;
  }

  getAllCharacters(projectId: string): CharacterAsset[] {
    return Array.from(this.characters.get(projectId)?.values() || []);
  }

  // ============================================
  // 高级查询
  // ============================================

  async searchCharacters(projectId: string, query: CharacterSearchQuery): Promise<CharacterAsset[]> {
    let characters = this.getAllCharacters(projectId);

    // 应用过滤器
    if (query.name) {
      characters = characters.filter(c => 
        c.name.toLowerCase().includes(query.name!.toLowerCase())
      );
    }

    if (query.type?.length) {
      characters = characters.filter(c => query.type!.includes(c.type));
    }

    if (query.gender?.length) {
      characters = characters.filter(c => query.gender!.includes(c.gender));
    }

    if (query.ageGroup?.length) {
      characters = characters.filter(c => query.ageGroup!.includes(c.ageGroup));
    }

    if (query.tags?.length) {
      characters = characters.filter(c => 
        query.tags!.some(t => c.metadata.tags.includes(t))
      );
    }

    if (query.importanceMin !== undefined) {
      characters = characters.filter(c => c.metadata.importance >= query.importanceMin!);
    }

    if (query.traits?.length) {
      characters = characters.filter(c =>
        query.traits!.some(t => c.personality.traits.some(pt => pt.name.includes(t)))
      );
    }

    return characters;
  }

  async getCharactersByType(projectId: string, type: CharacterType): Promise<CharacterAsset[]> {
    return this.searchCharacters(projectId, { type: [type] });
  }

  async getProtagonists(projectId: string): Promise<CharacterAsset[]> {
    return this.getCharactersByType(projectId, 'protagonist');
  }

  // ============================================
  // 关系管理
  // ============================================

  async addRelationship(
    projectId: string,
    relationship: Omit<CharacterRelationship, 'id'>
  ): Promise<CharacterRelationship> {
    await this.initialize(projectId);

    const newRelationship: CharacterRelationship = {
      ...relationship,
      id: this.generateId()
    };

    const rels = this.relationships.get(projectId) || [];
    rels.push(newRelationship);
    this.relationships.set(projectId, rels);

    this.emit('relationshipAdded', newRelationship);
    return newRelationship;
  }

  async updateRelationship(
    projectId: string,
    relationshipId: string,
    updates: Partial<CharacterRelationship>
  ): Promise<CharacterRelationship | null> {
    const rels = this.relationships.get(projectId) || [];
    const index = rels.findIndex(r => r.id === relationshipId);
    
    if (index === -1) return null;

    rels[index] = { ...rels[index], ...updates };
    this.relationships.set(projectId, rels);

    this.emit('relationshipUpdated', rels[index]);
    return rels[index];
  }

  getRelationships(projectId: string, characterId?: string): CharacterRelationship[] {
    const rels = this.relationships.get(projectId) || [];
    
    if (characterId) {
      return rels.filter(r => r.sourceId === characterId || r.targetId === characterId);
    }
    
    return rels;
  }

  getRelationshipNetwork(projectId: string): CharacterNetwork {
    const characters = this.getAllCharacters(projectId);
    const rels = this.getRelationships(projectId);

    const nodes: NetworkNode[] = characters.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      importance: c.metadata.importance,
      gender: c.gender
    }));

    const edges: NetworkEdge[] = rels.map(r => ({
      source: r.sourceId,
      target: r.targetId,
      type: r.type,
      strength: Math.abs(r.intimacy) / 100
    }));

    // 检测角色簇
    const clusters = this.detectClusters(nodes, edges);

    return { nodes, edges, clusters };
  }

  private detectClusters(nodes: NetworkNode[], edges: NetworkEdge[]): CharacterCluster[] {
    // 简化聚类算法
    const visited = new Set<string>();
    const clusters: CharacterCluster[] = [];

    for (const node of nodes) {
      if (visited.has(node.id)) continue;

      const clusterNodes = this.bfsCluster(node.id, edges, visited);
      if (clusterNodes.length > 1) {
        const centralNode = clusterNodes.find(n => 
          nodes.find(nn => nn.id === n)?.importance === Math.max(...clusterNodes.map(id => 
            nodes.find(nn => nn.id === id)?.importance || 0
          ))
        ) || clusterNodes[0];

        clusters.push({
          id: `cluster-${clusters.length}`,
          name: `角色群 ${clusters.length + 1}`,
          description: '',
          memberIds: clusterNodes,
          centralCharacterId: centralNode
        });
      }
    }

    return clusters;
  }

  private bfsCluster(startId: string, edges: NetworkEdge[], visited: Set<string>): string[] {
    const cluster: string[] = [];
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      cluster.push(current);

      for (const edge of edges) {
        if (edge.source === current && !visited.has(edge.target)) {
          queue.push(edge.target);
        }
        if (edge.target === current && !visited.has(edge.source)) {
          queue.push(edge.source);
        }
      }
    }

    return cluster;
  }

  // ============================================
  // 家谱系统
  // ============================================

  async buildFamilyTree(projectId: string, rootId: string): Promise<FamilyTree> {
    const characters = this.getAllCharacters(projectId);
    const rels = this.getRelationships(projectId);
    
    const familyRels = rels.filter(r => r.type === 'family');
    
    // 构建家谱
    const generations: FamilyGeneration[] = [];
    const processed = new Set<string>();
    
    const buildGeneration = (characterIds: string[], generation: number): void => {
      const chars = characters.filter(c => characterIds.includes(c.id) && !processed.has(c.id));
      if (chars.length === 0) return;
      
      chars.forEach(c => processed.add(c.id));
      
      const connections: FamilyConnection[] = [];
      for (const char of chars) {
        for (const rel of familyRels) {
          if (rel.sourceId === char.id || rel.targetId === char.id) {
            const otherId = rel.sourceId === char.id ? rel.targetId : rel.sourceId;
            if (!processed.has(otherId)) {
              connections.push({
                parentId: char.id,
                childId: otherId,
                type: 'biological'
              });
            }
          }
        }
      }
      
      generations.push({ generation, characters: chars, connections });
    };
    
    buildGeneration([rootId], 0);
    
    const familyTree: FamilyTree = {
      rootId,
      generations,
      relationships: []
    };
    
    this.familyTrees.set(projectId, familyTree);
    return familyTree;
  }

  // ============================================
  // 角色组
  // ============================================

  async createGroup(
    projectId: string,
    group: Omit<CharacterGroup, 'id'>
  ): Promise<CharacterGroup> {
    await this.initialize(projectId);

    const newGroup: CharacterGroup = {
      ...group,
      id: this.generateId()
    };

    const groups = this.characterGroups.get(projectId) || [];
    groups.push(newGroup);
    this.characterGroups.set(projectId, groups);

    return newGroup;
  }

  getGroups(projectId: string): CharacterGroup[] {
    return this.characterGroups.get(projectId) || [];
  }

  // ============================================
  // 性别平衡报告
  // ============================================

  async generateGenderBalanceReport(projectId: string): Promise<GenderBalanceReport> {
    const characters = this.getAllCharacters(projectId);
    
    const counts = {
      total: characters.length,
      male: 0,
      female: 0,
      nonBinary: 0,
      unknown: 0
    };

    for (const char of characters) {
      switch (char.gender) {
        case 'male': counts.male++; break;
        case 'female': counts.female++; break;
        case 'non_binary': counts.nonBinary++; break;
        default: counts.unknown++;
      }
    }

    const percentages = {
      male: counts.total > 0 ? (counts.male / counts.total) * 100 : 0,
      female: counts.total > 0 ? (counts.female / counts.total) * 100 : 0,
      nonBinary: counts.total > 0 ? (counts.nonBinary / counts.total) * 100 : 0,
      unknown: counts.total > 0 ? (counts.unknown / counts.total) * 100 : 0
    };

    // 年龄组分布
    const ageGroupDistribution = new Map<AgeGroup, { male: number; female: number; other: number }>();
    for (const group of ['child', 'teenager', 'young_adult', 'middle_aged', 'elderly'] as AgeGroup[]) {
      const chars = characters.filter(c => c.ageGroup === group);
      ageGroupDistribution.set(group, {
        male: chars.filter(c => c.gender === 'male').length,
        female: chars.filter(c => c.gender === 'female').length,
        other: chars.filter(c => c.gender !== 'male' && c.gender !== 'female').length
      });
    }

    // 类型分布
    const typeDistribution = new Map<CharacterType, { male: number; female: number; other: number }>();
    for (const type of ['protagonist', 'antagonist', 'mentor', 'supporting', 'minor'] as CharacterType[]) {
      const chars = characters.filter(c => c.type === type);
      typeDistribution.set(type, {
        male: chars.filter(c => c.gender === 'male').length,
        female: chars.filter(c => c.gender === 'female').length,
        other: chars.filter(c => c.gender !== 'male' && c.gender !== 'female').length
      });
    }

    // 平衡评分
    const genderDiff = Math.abs(percentages.male - percentages.female);
    const balanceScore = Math.max(0, 100 - genderDiff);
    const isBalanced = genderDiff <= 20 && percentages.unknown < 30;

    // 建议
    const recommendations: BalanceRecommendation[] = [];
    
    if (percentages.unknown > 30) {
      recommendations.push({
        type: 'modify_existing',
        description: '为未知性别的角色明确设定性别',
        priority: 'high'
      });
    }

    if (genderDiff > 30) {
      const underRepresented = percentages.male > percentages.female ? 'female' : 'male';
      recommendations.push({
        type: 'add_character',
        description: `增加${underRepresented === 'female' ? '女性' : '男性'}角色以平衡性别比例`,
        priority: 'high',
        suggestedGender: underRepresented
      });
    }

    // 检查主角性别平衡
    const protagonists = characters.filter(c => c.type === 'protagonist');
    const femaleProtagonists = protagonists.filter(c => c.gender === 'female').length;
    const maleProtagonists = protagonists.filter(c => c.gender === 'male').length;

    if (protagonists.length > 0 && (femaleProtagonists === 0 || maleProtagonists === 0)) {
      recommendations.push({
        type: 'add_character',
        description: '考虑增加不同性别的主角以增加多样性',
        priority: 'medium'
      });
    }

    return {
      overview: counts,
      percentages,
      ageGroupDistribution,
      typeDistribution,
      isBalanced,
      balanceScore,
      recommendations
    };
  }

  // ============================================
  // 角色画像
  // ============================================

  async getCharacterProfile(projectId: string, characterId: string): Promise<CharacterAsset | null> {
    return this.getCharacter(projectId, characterId);
  }

  async getCharacterRelationships(projectId: string, characterId: string): Promise<{
    outgoing: CharacterRelationship[];
    incoming: CharacterRelationship[];
    summary: {
      totalRelationships: number;
      familyCount: number;
      romanticCount: number;
      friendCount: number;
      enemyCount: number;
    };
  }> {
    const rels = this.getRelationships(projectId, characterId);
    
    const outgoing = rels.filter(r => r.sourceId === characterId);
    const incoming = rels.filter(r => r.targetId === characterId);

    return {
      outgoing,
      incoming,
      summary: {
        totalRelationships: rels.length,
        familyCount: rels.filter(r => r.type === 'family').length,
        romanticCount: rels.filter(r => r.type === 'romantic').length,
        friendCount: rels.filter(r => r.type === 'friendship').length,
        enemyCount: rels.filter(r => r.type === 'enemy').length
      }
    };
  }

  // ============================================
  // 辅助方法
  // ============================================

  private generateId(): string {
    return `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // 事件系统
  // ============================================

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)!) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      }
    }
  }
}

export default EnhancedCharacterManager;
