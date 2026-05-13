/**
 * Character System - 角色管理系统
 * 提供角色设定、关系追踪、性别平衡、家谱和角色画像功能
 */

import { Character, Relationship, FamilyMember, CharacterArc } from '../../types.js';
import * as fs from 'fs';
import * as path from 'path';

export interface CharacterWithMetadata extends Character {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CharacterProfile {
  characterId: string;
  basicInfo: {
    name: string;
    age: string;
    gender: string;
    appearance: string;
  };
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    fears: string[];
    desires: string[];
  };
  background: {
    summary: string;
    keyEvents: string[];
    motivations: string[];
  };
  relationships: {
    type: string;
    target: string;
    description: string;
  }[];
  characterArc: {
    type: string;
    currentStage: string;
    trajectory: string;
  };
  speakingStyle: {
    patterns: string[];
    vocabulary: string[];
    examplePhrases: string[];
  };
  psychologicalProfile: {
    mbti?: string;
    enneagram?: string;
    attachmentStyle?: string;
    coreWounds: string[];
    defenseMechanisms: string[];
  };
  generation: number;
  ageGroup: string;
}

export interface GenderBalanceReport {
  totalCharacters: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  malePercentage: number;
  femalePercentage: number;
  otherPercentage: number;
  isBalanced: boolean;
  recommendations: string[];
}

export interface FamilyTreeNode {
  character: Character;
  children: FamilyTreeNode[];
  spouse?: Character;
  generation: number;
}

export interface RelationshipFilter {
  sourceId?: string;
  targetId?: string;
  type?: string;
  status?: string;
}

export interface CharacterSearchQuery {
  name?: string;
  gender?: 'male' | 'female' | 'other';
  ageGroup?: string;
  tags?: string[];
  hasRelationship?: string;
  relationshipType?: string;
}

export class CharacterManager {
  private characters: Map<string, Map<string, Character>> = new Map();
  private relationships: Map<string, Relationship[]> = new Map();
  private familyTrees: Map<string, FamilyTreeNode[]> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/characters') {
    this.storagePath = storagePath;
  }

  async initialize(projectId: string): Promise<void> {
    this.characters.set(projectId, new Map());
    this.relationships.set(projectId, []);
    this.familyTrees.set(projectId, []);
  }

  async createCharacter(projectId: string, character: Omit<Character, 'id'>): Promise<CharacterWithMetadata> {
    const projectCharacters = this.characters.get(projectId) || new Map();
    
    const newCharacter: CharacterWithMetadata = {
      id: this.generateId(),
      ...character,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projectCharacters.set(newCharacter.id, newCharacter);
    this.characters.set(projectId, projectCharacters);
    
    await this.save(projectId);
    return newCharacter;
  }

  async getCharacter(projectId: string, characterId: string): Promise<CharacterWithMetadata | null> {
    const projectCharacters = this.characters.get(projectId);
    return (projectCharacters?.get(characterId) as CharacterWithMetadata) || null;
  }

  async getAllCharacters(projectId: string): Promise<CharacterWithMetadata[]> {
    const projectCharacters = this.characters.get(projectId);
    return Array.from(projectCharacters?.values() || []) as CharacterWithMetadata[];
  }

  async updateCharacter(projectId: string, characterId: string, updates: Partial<Character>): Promise<CharacterWithMetadata | null> {
    const projectCharacters = this.characters.get(projectId);
    if (!projectCharacters) return null;

    const character = projectCharacters.get(characterId) as CharacterWithMetadata;
    if (!character) return null;

    const updated: CharacterWithMetadata = {
      ...character,
      ...updates,
      id: characterId,
      updatedAt: new Date()
    };

    projectCharacters.set(characterId, updated);
    await this.save(projectId);
    return updated;
  }

  async deleteCharacter(projectId: string, characterId: string): Promise<boolean> {
    const projectCharacters = this.characters.get(projectId);
    if (!projectCharacters) return false;

    if (!projectCharacters.has(characterId)) return false;

    projectCharacters.delete(characterId);
    
    const projectRelationships = this.relationships.get(projectId) || [];
    const filteredRelationships = projectRelationships.filter(
      r => r.targetId !== characterId
    );
    this.relationships.set(projectId, filteredRelationships);

    await this.save(projectId);
    return true;
  }

  async addRelationship(projectId: string, relationship: Omit<Relationship, 'targetId'> & { targetId: string }): Promise<Relationship> {
    const projectRelationships = this.relationships.get(projectId) || [];
    
    const existingIndex = projectRelationships.findIndex(
      r => r.targetId === relationship.targetId && r.type === relationship.type
    );

    if (existingIndex !== -1) {
      projectRelationships[existingIndex] = {
        ...projectRelationships[existingIndex],
        ...relationship
      };
    } else {
      projectRelationships.push({
        ...relationship,
        targetId: relationship.targetId
      });
    }

    this.relationships.set(projectId, projectRelationships);
    await this.save(projectId);
    
    return projectRelationships[existingIndex !== -1 ? existingIndex : projectRelationships.length - 1];
  }

  async getRelationships(projectId: string, filter?: RelationshipFilter): Promise<Relationship[]> {
    let relationships = this.relationships.get(projectId) || [];

    if (filter) {
      if (filter.sourceId) {
        relationships = relationships.filter(r => {
          const source = this.findCharacterById(projectId, filter.sourceId!);
          return source?.relationships?.some(sr => sr.targetId === r.targetId);
        });
      }
      if (filter.targetId) {
        relationships = relationships.filter(r => r.targetId === filter.targetId);
      }
      if (filter.type) {
        relationships = relationships.filter(r => r.type === filter.type);
      }
      if (filter.status) {
        relationships = relationships.filter(r => r.status === filter.status);
      }
    }

    return relationships;
  }

  async getCharacterRelationships(projectId: string, characterId: string): Promise<Relationship[]> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character?.relationships) return [];

    return character.relationships;
  }

  async updateRelationship(projectId: string, characterId: string, targetId: string, updates: Partial<Relationship>): Promise<Relationship | null> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character?.relationships) return null;

    const relIndex = character.relationships.findIndex(r => r.targetId === targetId);
    if (relIndex === -1) return null;

    character.relationships[relIndex] = {
      ...character.relationships[relIndex],
      ...updates
    };

    await this.updateCharacter(projectId, characterId, { relationships: character.relationships });
    return character.relationships[relIndex];
  }

  async deleteRelationship(projectId: string, characterId: string, targetId: string): Promise<boolean> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character?.relationships) return false;

    const originalLength = character.relationships.length;
    character.relationships = character.relationships.filter(r => r.targetId !== targetId);

    if (character.relationships.length === originalLength) return false;

    await this.updateCharacter(projectId, characterId, { relationships: character.relationships });
    return true;
  }

  async buildFamilyTree(projectId: string): Promise<FamilyTreeNode[]> {
    const characters = await this.getAllCharacters(projectId);
    const roots: FamilyTreeNode[] = [];

    const characterMap = new Map(characters.map(c => [c.id, c]));

    const buildNode = (character: Character, visited: Set<string>, generation: number): FamilyTreeNode | null => {
      if (visited.has(character.id)) return null;
      visited.add(character.id);

      const children: FamilyTreeNode[] = [];
      const spouse = characters.find(c =>
        c.familyTree?.some(f =>
          (f.relation === 'spouse' || f.relation === 'partner') &&
          f.name === character.name
        )
      );

      if (character.familyTree) {
        for (const member of character.familyTree) {
          if (member.relation === 'child') {
            const child = characters.find(c => c.name === member.name);
            if (child) {
              const childNode = buildNode(child, new Set(visited), generation + 1);
              if (childNode) children.push(childNode);
            }
          }
        }
      }

      return {
        character,
        children,
        spouse,
        generation
      };
    };

    for (const character of characters) {
      if (!character.familyTree?.some(f => f.relation === 'child')) {
        const root = buildNode(character, new Set(), 1);
        if (root) roots.push(root);
      }
    }

    this.familyTrees.set(projectId, roots);
    return roots;
  }

  async addFamilyMember(projectId: string, characterId: string, member: FamilyMember): Promise<boolean> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character) return false;

    const familyTree = character.familyTree || [];
    const existingIndex = familyTree.findIndex(m => m.name === member.name && m.relation === member.relation);

    if (existingIndex !== -1) {
      familyTree[existingIndex] = member;
    } else {
      familyTree.push(member);
    }

    await this.updateCharacter(projectId, characterId, { familyTree });
    return true;
  }

  async removeFamilyMember(projectId: string, characterId: string, memberName: string): Promise<boolean> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character?.familyTree) return false;

    const originalLength = character.familyTree.length;
    character.familyTree = character.familyTree.filter(m => m.name !== memberName);

    if (character.familyTree.length === originalLength) return false;

    await this.updateCharacter(projectId, characterId, { familyTree: character.familyTree });
    return true;
  }

  async analyzeGenderBalance(projectId: string): Promise<GenderBalanceReport> {
    const characters = await this.getAllCharacters(projectId);
    
    const maleCount = characters.filter(c => c.gender === 'male').length;
    const femaleCount = characters.filter(c => c.gender === 'female').length;
    const otherCount = characters.filter(c => c.gender === 'other').length;
    const totalCharacters = characters.length;

    const malePercentage = totalCharacters > 0 ? (maleCount / totalCharacters) * 100 : 0;
    const femalePercentage = totalCharacters > 0 ? (femaleCount / totalCharacters) * 100 : 0;
    const otherPercentage = totalCharacters > 0 ? (otherCount / totalCharacters) * 100 : 0;

    const isBalanced = malePercentage >= 40 && malePercentage <= 60 && 
                       femalePercentage >= 40 && femalePercentage <= 60;

    const recommendations: string[] = [];

    if (femalePercentage < 30) {
      recommendations.push('建议增加女性角色以提升性别多样性');
    }
    if (malePercentage < 30) {
      recommendations.push('建议增加男性角色以提升性别多样性');
    }
    if (malePercentage > 70) {
      recommendations.push('角色以男性为主，建议考虑增加女性角色平衡叙事视角');
    }
    if (femalePercentage > 70) {
      recommendations.push('角色以女性为主，建议考虑增加男性角色丰富故事层次');
    }

    const protagonist = characters.find(c => 
      c.background?.toLowerCase().includes('主角') || 
      c.goals?.some(g => g.includes('主角'))
    );
    if (protagonist && protagonist.gender === 'other') {
      recommendations.push('考虑为非二元性别主角增加更多元化的配角');
    }

    return {
      totalCharacters,
      maleCount,
      femaleCount,
      otherCount,
      malePercentage,
      femalePercentage,
      otherPercentage,
      isBalanced,
      recommendations
    };
  }

  async generateCharacterProfile(projectId: string, characterId: string): Promise<CharacterProfile | null> {
    const character = await this.getCharacter(projectId, characterId);
    if (!character) return null;

    const relationships = await this.getCharacterRelationships(projectId, characterId);
    const relationshipDetails = relationships.map(r => {
      const target = this.findCharacterById(projectId, r.targetId);
      return {
        type: r.type,
        target: target?.name || r.targetId,
        description: r.description || ''
      };
    });

    const traits = this.extractTraits(character.personality);
    const background = this.analyzeBackground(character.background);

    return {
      characterId: character.id,
      basicInfo: {
        name: character.name,
        age: character.age || '未知',
        gender: character.gender || '未知',
        appearance: character.appearance || '未描述'
      },
      personality: {
        traits: traits.traits,
        strengths: traits.strengths,
        weaknesses: traits.weaknesses,
        fears: traits.fears,
        desires: character.goals || []
      },
      background: {
        summary: character.background || '暂无背景设定',
        keyEvents: background.keyEvents,
        motivations: background.motivations
      },
      relationships: relationshipDetails,
      characterArc: this.analyzeCharacterArc(character.arc),
      speakingStyle: this.analyzeSpeakingStyle(character.speakingStyle),
      psychologicalProfile: this.generatePsychologicalProfile(character, traits),
      generation: this.estimateGeneration(character.age),
      ageGroup: this.determineAgeGroup(character.age)
    };
  }

  private extractTraits(personality?: string): { traits: string[]; strengths: string[]; weaknesses: string[]; fears: string[] } {
    if (!personality) {
      return { traits: [], strengths: [], weaknesses: [], fears: [] };
    }

    const positiveTraits = ['勇敢', '善良', '聪明', '正直', '忠诚', '勤奋', '乐观', '自信', '慷慨', '谦虚', '坚韧', '智慧', '果断', '热情', '宽容'];
    const strengths = positiveTraits.filter(t => personality.includes(t));

    const negativeTraits = ['自私', '懦弱', '狡猾', '傲慢', '懒惰', '悲观', '自卑', '贪婪', '残忍', '冲动', '固执', '冷漠', '虚伪', '嫉妒'];
    const weaknesses = negativeTraits.filter(t => personality.includes(t));

    return {
      traits: [...strengths, ...weaknesses],
      strengths,
      weaknesses,
      fears: []
    };
  }

  private analyzeBackground(background?: string): { keyEvents: string[]; motivations: string[] } {
    if (!background) {
      return { keyEvents: [], motivations: [] };
    }

    return {
      keyEvents: [],
      motivations: []
    };
  }

  private analyzeCharacterArc(arc?: CharacterArc): { type: string; currentStage: string; trajectory: string } {
    if (!arc) {
      return {
        type: '未定义',
        currentStage: '初始状态',
        trajectory: '待发展'
      };
    }

    const stageDescriptions: Record<string, string> = {
      positive: '正向成长',
      negative: '负面堕落',
      flat: '保持稳定',
      circular: '循环往复',
      transformation: '彻底转变'
    };

    return {
      type: stageDescriptions[arc.arcType] || arc.arcType,
      currentStage: arc.stages.length > 0 ? arc.stages[arc.stages.length - 1].description : '初始状态',
      trajectory: this.calculateTrajectory(arc)
    };
  }

  private calculateTrajectory(arc: CharacterArc): string {
    if (arc.stages.length < 2) return '发展初期';

    const firstStage = arc.stages[0];
    const lastStage = arc.stages[arc.stages.length - 1];

    return `${firstStage.change} → ${lastStage.change}`;
  }

  private analyzeSpeakingStyle(style?: string): { patterns: string[]; vocabulary: string[]; examplePhrases: string[] } {
    if (!style) {
      return { patterns: [], vocabulary: [], examplePhrases: [] };
    }

    return {
      patterns: [style],
      vocabulary: [],
      examplePhrases: []
    };
  }

  private generatePsychologicalProfile(character: Character, traits: { traits: string[]; strengths: string[]; weaknesses: string[] }): {
    mbti?: string;
    enneagram?: string;
    attachmentStyle?: string;
    coreWounds: string[];
    defenseMechanisms: string[];
  } {
    const coreWounds: string[] = [];
    const defenseMechanisms: string[] = [];

    if (traits.weaknesses.includes('自卑')) {
      coreWounds.push('自我价值感低');
      defenseMechanisms.push('过度补偿');
    }
    if (traits.weaknesses.includes('恐惧')) {
      coreWounds.push('不安全感');
      defenseMechanisms.push('回避');
    }

    return {
      mbti: this.inferMBTI(character),
      coreWounds,
      defenseMechanisms
    };
  }

  private inferMBTI(character: Character): string {
    const traits = this.extractTraits(character.personality);
    
    let mbti = 'I'; // 内向/外向
    if (traits.traits.some(t => ['热情', '慷慨', '自信'].includes(t))) {
      mbti = 'E';
    }

    mbti += 'S'; // 感觉/直觉

    if (traits.traits.some(t => ['聪明', '智慧', '果断'].includes(t))) {
      mbti += 'T';
    } else {
      mbti += 'F';
    }

    mbti += 'J'; // 判断/知觉
    return mbti;
  }

  private estimateGeneration(age?: string): number {
    if (!age) return 1;

    const match = age.match(/\d+/);
    if (!match) return 1;

    const numAge = parseInt(match[0]);
    
    if (numAge <= 18) return 1;
    if (numAge <= 35) return 2;
    if (numAge <= 55) return 3;
    return 4;
  }

  private determineAgeGroup(age?: string): string {
    if (!age) return '未指定';

    const match = age.match(/\d+/);
    if (!match) return '未指定';

    const numAge = parseInt(match[0]);
    
    if (numAge <= 12) return '儿童';
    if (numAge <= 17) return '青少年';
    if (numAge <= 25) return '青年';
    if (numAge <= 40) return '中年';
    return '老年';
  }

  async searchCharacters(projectId: string, query: CharacterSearchQuery): Promise<Character[]> {
    let characters = await this.getAllCharacters(projectId);

    if (query.name) {
      const nameLower = query.name.toLowerCase();
      characters = characters.filter(c => 
        c.name.toLowerCase().includes(nameLower) ||
        c.aliases?.some(a => a.toLowerCase().includes(nameLower))
      );
    }

    if (query.gender) {
      characters = characters.filter(c => c.gender === query.gender);
    }

    if (query.ageGroup) {
      characters = characters.filter(c => {
        const group = this.determineAgeGroup(c.age);
        return group === query.ageGroup;
      });
    }

    if (query.hasRelationship) {
      characters = characters.filter(c =>
        c.relationships?.some(r => r.targetId === query.hasRelationship)
      );
    }

    if (query.relationshipType) {
      characters = characters.filter(c =>
        c.relationships?.some(r => r.type === query.relationshipType)
      );
    }

    return characters;
  }

  async exportCharacters(projectId: string): Promise<{
    characters: Character[];
    relationships: Relationship[];
  }> {
    return {
      characters: await this.getAllCharacters(projectId),
      relationships: this.relationships.get(projectId) || []
    };
  }

  async importCharacters(projectId: string, data: { characters: Character[]; relationships?: Relationship[] }): Promise<void> {
    const projectCharacters = this.characters.get(projectId) || new Map();

    for (const character of data.characters) {
      const charWithMeta = character as CharacterWithMetadata;
      const imported: CharacterWithMetadata = {
        ...charWithMeta,
        id: charWithMeta.id || this.generateId(),
        createdAt: charWithMeta.createdAt || new Date(),
        updatedAt: new Date()
      };
      projectCharacters.set(imported.id, imported);
    }

    this.characters.set(projectId, projectCharacters);

    if (data.relationships) {
      this.relationships.set(projectId, data.relationships);
    }

    await this.save(projectId);
  }

  async getCharacterStats(projectId: string): Promise<{
    totalCharacters: number;
    maleCount: number;
    femaleCount: number;
    otherCount: number;
    averageAge: number | null;
    mostCommonRelationship: string | null;
    charactersWithArcs: number;
    charactersWithFamilyTree: number;
  }> {
    const characters = await this.getAllCharacters(projectId);
    const relationships = this.relationships.get(projectId) || [];

    const maleCount = characters.filter(c => c.gender === 'male').length;
    const femaleCount = characters.filter(c => c.gender === 'female').length;
    const otherCount = characters.filter(c => c.gender === 'other').length;

    const ages = characters
      .map(c => parseInt(c.age?.match(/\d+/)?.[0] || ''))
      .filter(a => !isNaN(a));
    const averageAge = ages.length > 0 
      ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
      : null;

    const relationshipCounts = new Map<string, number>();
    for (const rel of relationships) {
      relationshipCounts.set(rel.type, (relationshipCounts.get(rel.type) || 0) + 1);
    }
    let mostCommonRelationship: string | null = null;
    let maxCount = 0;
    relationshipCounts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonRelationship = type;
      }
    });

    const charactersWithArcs = characters.filter(c => c.arc).length;
    const charactersWithFamilyTree = characters.filter(c => c.familyTree && c.familyTree.length > 0).length;

    return {
      totalCharacters: characters.length,
      maleCount,
      femaleCount,
      otherCount,
      averageAge,
      mostCommonRelationship,
      charactersWithArcs,
      charactersWithFamilyTree
    };
  }

  private findCharacterById(projectId: string, characterId: string): Character | undefined {
    const projectCharacters = this.characters.get(projectId);
    return projectCharacters?.get(characterId);
  }

  private generateId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const projectCharacters = this.characters.get(projectId);
    const charactersPath = path.join(dir, 'characters.json');
    const charactersData = projectCharacters ? Array.from(projectCharacters.values()) : [];
    fs.writeFileSync(charactersPath, JSON.stringify(charactersData, null, 2), 'utf-8');

    const relationshipsPath = path.join(dir, 'relationships.json');
    const relationshipsData = this.relationships.get(projectId) || [];
    fs.writeFileSync(relationshipsPath, JSON.stringify(relationshipsData, null, 2), 'utf-8');
  }

  async load(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    
    const charactersPath = path.join(dir, 'characters.json');
    if (fs.existsSync(charactersPath)) {
      const data = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
      const charMap = new Map<string, Character>();
      for (const char of data) {
        charMap.set(char.id, char);
      }
      this.characters.set(projectId, charMap);
    } else {
      await this.initialize(projectId);
    }

    const relationshipsPath = path.join(dir, 'relationships.json');
    if (fs.existsSync(relationshipsPath)) {
      const data = JSON.parse(fs.readFileSync(relationshipsPath, 'utf-8'));
      this.relationships.set(projectId, data);
    }
  }
}

export default CharacterManager;
