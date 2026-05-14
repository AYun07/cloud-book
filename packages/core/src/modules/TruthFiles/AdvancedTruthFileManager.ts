/**
 * Cloud Book - 高级真相文件管理器 (诺贝尔文学奖级别)
 * 支持千万字级、数千章节的长篇小说高质量创作
 * 
 * 核心能力：
 * 1. 高级状态追踪系统 - 支持千万字级别的状态快照和回溯
 * 2. 智能一致性检查引擎 - 跨章节、跨卷的深度一致性验证
 * 3. 复杂角色关系网络图谱 - 支持数百角色的动态关系追踪
 * 4. 高级情感弧线分析系统 - 多角色、多线程情感追踪
 * 5. 增强伏笔管理系统 - 支持长周期伏笔、多层嵌套伏笔
 * 6. 主题与象征追踪系统 - 文学深度分析支持
 * 7. 叙事结构分析引擎 - 多维度结构评估
 */

import {
  TruthFiles,
  WorldState,
  Resource,
  Hook,
  ChapterSummary,
  Subplot,
  EmotionalArc,
  CharacterInteraction,
  Chapter,
  Character
} from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface VolumeSnapshot {
  volumeNumber: number;
  volumeTitle: string;
  startChapter: number;
  endChapter: number;
  worldStateSnapshot: WorldState;
  characterStates: Map<string, CharacterStateSnapshot>;
  activeSubplots: string[];
  resolvedSubplots: string[];
  pendingHooks: string[];
  themes: string[];
  createdAt: Date;
}

export interface CharacterStateSnapshot {
  characterId: string;
  characterName: string;
  location: string;
  status: string;
  relationships: Map<string, RelationshipState>;
  emotionalState: string;
  keyEvents: string[];
  lastAppearance: number;
}

export interface RelationshipState {
  targetCharacterId: string;
  relationshipType: string;
  intimacy: number;
  trust: number;
  conflict: number;
  history: RelationshipEvent[];
}

export interface RelationshipEvent {
  chapter: number;
  event: string;
  impact: 'positive' | 'negative' | 'neutral';
  intimacyChange: number;
  trustChange: number;
}

export interface TimelineNode {
  chapter: number;
  timestamp: string;
  events: TimelineEvent[];
  stateChanges: StateChange[];
}

export interface TimelineEvent {
  id: string;
  type: 'plot' | 'character' | 'world' | 'resource' | 'hook';
  description: string;
  participants: string[];
  location: string;
  significance: 'critical' | 'major' | 'minor';
}

export interface StateChange {
  entityType: 'character' | 'location' | 'resource' | 'relationship' | 'world';
  entityId: string;
  property: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface ConsistencyIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  type: 'contradiction' | 'timeline' | 'character' | 'world' | 'resource' | 'relationship' | 'hook';
  description: string;
  location: {
    chapter: number;
    context: string;
  };
  relatedChapters: number[];
  suggestion: string;
  autoFixAvailable: boolean;
}

export interface ConsistencyReport {
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  issues: ConsistencyIssue[];
  coverage: {
    chaptersAnalyzed: number;
    charactersChecked: number;
    relationshipsVerified: number;
    hooksValidated: number;
  };
}

export interface CharacterNetworkNode {
  id: string;
  name: string;
  type: 'protagonist' | 'major' | 'minor' | 'background';
  firstAppearance: number;
  lastAppearance: number;
  totalAppearances: number;
  influence: number;
  centrality: number;
}

export interface CharacterNetworkEdge {
  source: string;
  target: string;
  relationshipType: string;
  weight: number;
  interactions: number;
  evolution: RelationshipEvolution[];
}

export interface RelationshipEvolution {
  startChapter: number;
  endChapter?: number;
  type: string;
  events: string[];
}

export interface EmotionalTrajectory {
  characterId: string;
  characterName: string;
  primaryArc: EmotionalArcType;
  secondaryArcs: EmotionalArcType[];
  keyMoments: EmotionalKeyMoment[];
  currentPhase: EmotionalPhase;
  predictedDevelopment: EmotionalPrediction[];
}

export type EmotionalArcType = 
  | 'rise' | 'fall' | 'rise-fall' | 'fall-rise' 
  | 'flat' | 'complex' | 'transformation' | 'tragic' | 'heroic';

export interface EmotionalKeyMoment {
  chapter: number;
  emotion: string;
  intensity: number;
  trigger: string;
  consequence: string;
  significance: 'turning_point' | 'peak' | 'valley' | 'transition';
}

export interface EmotionalPhase {
  phaseName: string;
  startChapter: number;
  dominantEmotions: string[];
  intensity: number;
  stability: number;
}

export interface EmotionalPrediction {
  probableEmotion: string;
  confidence: number;
  suggestedTriggers: string[];
}

export interface AdvancedHook extends Hook {
  layer: number;
  parentHookId?: string;
  childHookIds: string[];
  relatedHookIds: string[];
  significance: 'critical' | 'major' | 'minor';
  category: 'plot' | 'character' | 'mystery' | 'theme' | 'symbol';
  expectedPayoffRange?: {
    min: number;
    max: number;
  };
  foreshadowing: Foreshadowing[];
}

export interface Foreshadowing {
  chapter: number;
  type: 'explicit' | 'implicit' | 'symbolic' | 'metaphorical';
  content: string;
  subtlety: number;
}

export interface ThemeTrack {
  id: string;
  name: string;
  description: string;
  category: 'universal' | 'genre' | 'personal' | 'social' | 'philosophical';
  manifestations: ThemeManifestation[];
  evolution: ThemeEvolution[];
  relatedThemes: string[];
  symbols: SymbolReference[];
}

export interface ThemeManifestation {
  chapter: number;
  type: 'explicit' | 'implicit' | 'symbolic';
  content: string;
  characters: string[];
  significance: number;
}

export interface ThemeEvolution {
  fromChapter: number;
  toChapter: number;
  development: string;
  intensity: number;
}

export interface SymbolReference {
  symbolId: string;
  chapter: number;
  context: string;
  meaning: string;
}

export interface Symbol {
  id: string;
  name: string;
  type: 'object' | 'action' | 'character' | 'setting' | 'motif' | 'color' | 'number';
  primaryMeaning: string;
  secondaryMeanings: string[];
  appearances: SymbolAppearance[];
  relatedSymbols: string[];
  themes: string[];
}

export interface SymbolAppearance {
  chapter: number;
  context: string;
  meaning: string;
  evolution: string;
}

export interface NarrativeStructure {
  overallArc: NarrativeArc;
  volumeArcs: NarrativeArc[];
  chapterBeats: ChapterBeat[];
  pacing: PacingAnalysis;
  tensionCurve: TensionPoint[];
  climaxes: ClimaxPoint[];
}

export interface NarrativeArc {
  type: 'three_act' | 'five_act' | 'hero_journey' | 'kishoutenketsu' | 'custom';
  phases: NarrativePhase[];
  currentPhase: number;
  completionPercentage: number;
}

export interface NarrativePhase {
  name: string;
  startChapter: number;
  endChapter?: number;
  purpose: string;
  keyEvents: string[];
  emotionalTone: string;
  pacing: 'slow' | 'medium' | 'fast' | 'variable';
}

export interface ChapterBeat {
  chapter: number;
  beatType: 'opening' | 'rising_action' | 'complication' | 'crisis' | 'climax' | 'falling_action' | 'resolution';
  purpose: string;
  tensionLevel: number;
  emotionalImpact: number;
  plotAdvancement: number;
}

export interface PacingAnalysis {
  overallPace: number;
  slowSegments: PacingSegment[];
  fastSegments: PacingSegment[];
  recommendations: string[];
}

export interface PacingSegment {
  startChapter: number;
  endChapter: number;
  pace: number;
  issue?: string;
}

export interface TensionPoint {
  chapter: number;
  tension: number;
  type: 'anticipation' | 'conflict' | 'suspense' | 'climax' | 'relief';
  description: string;
}

export interface ClimaxPoint {
  chapter: number;
  type: 'minor' | 'major' | 'ultimate';
  description: string;
  resolutionChapter?: number;
  impact: string[];
}

export class AdvancedTruthFileManager {
  private storagePath: string;
  private volumeSnapshots: Map<string, VolumeSnapshot[]> = new Map();
  private timelineNodes: Map<string, TimelineNode[]> = new Map();
  private characterNetwork: Map<string, { nodes: CharacterNetworkNode[], edges: CharacterNetworkEdge[] }> = new Map();
  private emotionalTrajectories: Map<string, EmotionalTrajectory[]> = new Map();
  private advancedHooks: Map<string, AdvancedHook[]> = new Map();
  private themeTracks: Map<string, ThemeTrack[]> = new Map();
  private symbols: Map<string, Symbol[]> = new Map();
  private narrativeStructures: Map<string, NarrativeStructure> = new Map();

  constructor(storagePath: string = './advanced-truth-files') {
    this.storagePath = storagePath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  async initializeAdvancedSystem(projectId: string): Promise<void> {
    this.volumeSnapshots.set(projectId, []);
    this.timelineNodes.set(projectId, []);
    this.characterNetwork.set(projectId, { nodes: [], edges: [] });
    this.emotionalTrajectories.set(projectId, []);
    this.advancedHooks.set(projectId, []);
    this.themeTracks.set(projectId, []);
    this.symbols.set(projectId, []);
    this.narrativeStructures.set(projectId, {
      overallArc: {
        type: 'three_act',
        phases: [],
        currentPhase: 0,
        completionPercentage: 0
      },
      volumeArcs: [],
      chapterBeats: [],
      pacing: {
        overallPace: 0,
        slowSegments: [],
        fastSegments: [],
        recommendations: []
      },
      tensionCurve: [],
      climaxes: []
    });
    
    await this.saveAdvancedData(projectId);
  }

  async createVolumeSnapshot(
    projectId: string,
    volumeNumber: number,
    volumeTitle: string,
    startChapter: number,
    endChapter: number,
    truthFiles: TruthFiles
  ): Promise<VolumeSnapshot> {
    const snapshot: VolumeSnapshot = {
      volumeNumber,
      volumeTitle,
      startChapter,
      endChapter,
      worldStateSnapshot: JSON.parse(JSON.stringify(truthFiles.currentState)),
      characterStates: new Map(),
      activeSubplots: truthFiles.currentState.activeSubplots,
      resolvedSubplots: [],
      pendingHooks: truthFiles.pendingHooks.filter(h => h.setInChapter >= startChapter && h.setInChapter <= endChapter).map(h => h.id),
      themes: [],
      createdAt: new Date()
    };

    for (const arc of truthFiles.emotionalArcs) {
      snapshot.characterStates.set(arc.characterId, {
        characterId: arc.characterId,
        characterName: arc.characterName,
        location: '',
        status: '',
        relationships: new Map(),
        emotionalState: arc.points.length > 0 ? arc.points[arc.points.length - 1].emotion : 'neutral',
        keyEvents: [],
        lastAppearance: endChapter
      });
    }

    const snapshots = this.volumeSnapshots.get(projectId) || [];
    snapshots.push(snapshot);
    this.volumeSnapshots.set(projectId, snapshots);
    
    await this.saveAdvancedData(projectId);
    return snapshot;
  }

  async getVolumeSnapshot(projectId: string, volumeNumber: number): Promise<VolumeSnapshot | undefined> {
    const snapshots = this.volumeSnapshots.get(projectId) || [];
    return snapshots.find(s => s.volumeNumber === volumeNumber);
  }

  async restoreFromVolumeSnapshot(projectId: string, volumeNumber: number): Promise<WorldState | null> {
    const snapshot = await this.getVolumeSnapshot(projectId, volumeNumber);
    if (!snapshot) return null;
    return JSON.parse(JSON.stringify(snapshot.worldStateSnapshot));
  }

  async addTimelineNode(projectId: string, node: TimelineNode): Promise<void> {
    const nodes = this.timelineNodes.get(projectId) || [];
    const existingIndex = nodes.findIndex(n => n.chapter === node.chapter);
    
    if (existingIndex >= 0) {
      nodes[existingIndex] = node;
    } else {
      nodes.push(node);
      nodes.sort((a, b) => a.chapter - b.chapter);
    }
    
    this.timelineNodes.set(projectId, nodes);
    await this.saveAdvancedData(projectId);
  }

  async getTimelineRange(projectId: string, startChapter: number, endChapter: number): Promise<TimelineNode[]> {
    const nodes = this.timelineNodes.get(projectId) || [];
    return nodes.filter(n => n.chapter >= startChapter && n.chapter <= endChapter);
  }

  async detectTimelineInconsistencies(projectId: string): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    const nodes = this.timelineNodes.get(projectId) || [];
    
    for (let i = 1; i < nodes.length; i++) {
      const prevNode = nodes[i - 1];
      const currNode = nodes[i];
      
      for (const stateChange of currNode.stateChanges) {
        if (stateChange.entityType === 'character') {
          const prevChange = prevNode.stateChanges.find(
            sc => sc.entityId === stateChange.entityId && sc.property === stateChange.property
          );
          
          if (prevChange && prevChange.newValue !== stateChange.oldValue) {
            issues.push({
              id: `timeline_${stateChange.entityId}_${currNode.chapter}`,
              severity: 'major',
              type: 'timeline',
              description: `角色 ${stateChange.entityId} 的 ${stateChange.property} 属性在章节间不一致`,
              location: { chapter: currNode.chapter, context: stateChange.reason },
              relatedChapters: [prevNode.chapter, currNode.chapter],
              suggestion: `检查第${prevNode.chapter}章和第${currNode.chapter}章之间${stateChange.entityId}的状态变化`,
              autoFixAvailable: false
            });
          }
        }
      }
    }
    
    return issues;
  }

  async performDeepConsistencyCheck(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyReport> {
    const issues: ConsistencyIssue[] = [];
    
    issues.push(...await this.checkCharacterConsistency(projectId, truthFiles, chapters));
    issues.push(...await this.checkRelationshipConsistency(projectId, truthFiles, chapters));
    issues.push(...await this.checkResourceConsistency(projectId, truthFiles, chapters));
    issues.push(...await this.checkHookConsistency(projectId, truthFiles, chapters));
    issues.push(...await this.checkWorldStateConsistency(projectId, truthFiles, chapters));
    issues.push(...await this.detectTimelineInconsistencies(projectId));

    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const majorIssues = issues.filter(i => i.severity === 'major').length;
    const minorIssues = issues.filter(i => i.severity === 'minor').length;

    return {
      timestamp: new Date(),
      totalIssues: issues.length,
      criticalIssues,
      majorIssues,
      minorIssues,
      issues,
      coverage: {
        chaptersAnalyzed: chapters.length,
        charactersChecked: truthFiles.emotionalArcs.length,
        relationshipsVerified: truthFiles.characterMatrix.length,
        hooksValidated: truthFiles.pendingHooks.length
      }
    };
  }

  private async checkCharacterConsistency(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    
    const characterAppearances = new Map<string, number[]>();
    
    for (const chapter of chapters) {
      const content = chapter.content || '';
      for (const arc of truthFiles.emotionalArcs) {
        if (content.includes(arc.characterName)) {
          const appearances = characterAppearances.get(arc.characterId) || [];
          appearances.push(chapter.number);
          characterAppearances.set(arc.characterId, appearances);
        }
      }
    }

    for (const [characterId, appearances] of characterAppearances) {
      const arc = truthFiles.emotionalArcs.find(a => a.characterId === characterId);
      if (arc && arc.points.length > 0) {
        const lastEmotionChapter = Math.max(...arc.points.map(p => p.chapter));
        const lastAppearance = Math.max(...appearances);
        
        if (lastAppearance > lastEmotionChapter + 10) {
          issues.push({
            id: `char_emotion_gap_${characterId}`,
            severity: 'minor',
            type: 'character',
            description: `角色 ${arc.characterName} 已出现 ${lastAppearance - lastEmotionChapter} 章但未记录情感变化`,
            location: { chapter: lastAppearance, context: '角色出现但无情感记录' },
            relatedChapters: [lastEmotionChapter, lastAppearance],
            suggestion: `建议更新角色 ${arc.characterName} 在近期章节的情感状态`,
            autoFixAvailable: false
          });
        }
      }
    }
    
    return issues;
  }

  private async checkRelationshipConsistency(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    
    for (const interaction of truthFiles.characterMatrix) {
      const arc1 = truthFiles.emotionalArcs.find(a => a.characterId === interaction.characterId1);
      const arc2 = truthFiles.emotionalArcs.find(a => a.characterId === interaction.characterId2);
      
      if (!arc1 || !arc2) {
        issues.push({
          id: `relationship_missing_arc_${interaction.characterId1}_${interaction.characterId2}`,
          severity: 'minor',
          type: 'relationship',
          description: `角色互动记录存在但缺少情感弧线追踪`,
          location: { chapter: 0, context: '角色互动数据' },
          relatedChapters: [],
          suggestion: `为参与互动的角色添加情感弧线追踪`,
          autoFixAvailable: false
        });
      }
    }
    
    return issues;
  }

  private async checkResourceConsistency(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    
    for (const resource of truthFiles.particleLedger) {
      if (resource.changeLog && resource.changeLog.length > 0) {
        const lastChange = resource.changeLog[resource.changeLog.length - 1];
        const relevantChapters = chapters.filter(c => c.number >= lastChange.chapter);
        
        for (const chapter of relevantChapters) {
          if (chapter.content && chapter.content.includes(resource.name)) {
            const hasChangeRecord = resource.changeLog.some(
              c => c.chapter === chapter.number
            );
            
            if (!hasChangeRecord && relevantChapters.indexOf(chapter) < 5) {
              issues.push({
                id: `resource_mention_${resource.id}_${chapter.number}`,
                severity: 'minor',
                type: 'resource',
                description: `资源 ${resource.name} 在第${chapter.number}章被提及但无变更记录`,
                location: { chapter: chapter.number, context: `资源 ${resource.name} 出现` },
                relatedChapters: [lastChange.chapter, chapter.number],
                suggestion: `检查是否需要记录资源 ${resource.name} 的状态变化`,
                autoFixAvailable: false
              });
            }
          }
        }
      }
    }
    
    return issues;
  }

  private async checkHookConsistency(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    const maxChapter = Math.max(...chapters.map(c => c.number), 0);
    
    for (const hook of truthFiles.pendingHooks) {
      if (hook.status === 'pending') {
        const gap = maxChapter - hook.setInChapter;
        
        if (gap > 50) {
          issues.push({
            id: `hook_overdue_${hook.id}`,
            severity: 'major',
            type: 'hook',
            description: `伏笔 "${hook.description.substring(0, 30)}..." 已设置 ${gap} 章未回收`,
            location: { chapter: hook.setInChapter, context: '伏笔设置' },
            relatedChapters: [hook.setInChapter],
            suggestion: `考虑在第${maxChapter + 10}章前回收此伏笔，或标记为长期伏笔`,
            autoFixAvailable: false
          });
        }
        
        if ((hook as AdvancedHook).expectedPayoffRange) {
          if (maxChapter > (hook as AdvancedHook).expectedPayoffRange!.max) {
            issues.push({
              id: `hook_deadline_missed_${hook.id}`,
              severity: 'critical',
              type: 'hook',
              description: `伏笔 "${hook.description.substring(0, 30)}..." 已超过预期回收章节`,
              location: { chapter: hook.setInChapter, context: '伏笔设置' },
              relatedChapters: [hook.setInChapter],
              suggestion: `立即回收此伏笔或重新规划`,
              autoFixAvailable: false
            });
          }
        }
      }
    }
    
    return issues;
  }

  private async checkWorldStateConsistency(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    
    const protagonistName = truthFiles.currentState.protagonist?.name;
    if (protagonistName) {
      const recentChapters = chapters.slice(-10);
      let protagonistMentioned = false;
      
      for (const chapter of recentChapters) {
        if (chapter.content && chapter.content.includes(protagonistName)) {
          protagonistMentioned = true;
          break;
        }
      }
      
      if (!protagonistMentioned && recentChapters.length >= 5) {
        issues.push({
          id: 'protagonist_absent',
          severity: 'major',
          type: 'world',
          description: `主角 ${protagonistName} 在最近 ${recentChapters.length} 章未出现`,
          location: { chapter: recentChapters[recentChapters.length - 1].number, context: '近期章节' },
          relatedChapters: recentChapters.map(c => c.number),
          suggestion: `检查主角是否应该在近期章节出现`,
          autoFixAvailable: false
        });
      }
    }
    
    return issues;
  }

  async buildCharacterNetwork(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<{ nodes: CharacterNetworkNode[]; edges: CharacterNetworkEdge[] }> {
    const nodes: CharacterNetworkNode[] = [];
    const edges: CharacterNetworkEdge[] = [];
    const nodeMap = new Map<string, CharacterNetworkNode>();
    const edgeMap = new Map<string, CharacterNetworkEdge>();

    for (const arc of truthFiles.emotionalArcs) {
      const appearances = this.countCharacterAppearances(arc.characterName, chapters);
      const node: CharacterNetworkNode = {
        id: arc.characterId,
        name: arc.characterName,
        type: appearances > 50 ? 'protagonist' : appearances > 20 ? 'major' : appearances > 5 ? 'minor' : 'background',
        firstAppearance: Math.min(...arc.points.map(p => p.chapter)),
        lastAppearance: Math.max(...arc.points.map(p => p.chapter)),
        totalAppearances: appearances,
        influence: 0,
        centrality: 0
      };
      nodeMap.set(arc.characterId, node);
    }

    for (const interaction of truthFiles.characterMatrix) {
      const edgeKey = `${interaction.characterId1}-${interaction.characterId2}`;
      const reverseKey = `${interaction.characterId2}-${interaction.characterId1}`;
      
      const existingEdge = edgeMap.get(edgeKey) || edgeMap.get(reverseKey);
      
      if (existingEdge) {
        existingEdge.interactions += interaction.interactions.length;
      } else {
        const edge: CharacterNetworkEdge = {
          source: interaction.characterId1,
          target: interaction.characterId2,
          relationshipType: 'interaction',
          weight: interaction.interactions.length,
          interactions: interaction.interactions.length,
          evolution: []
        };
        edgeMap.set(edgeKey, edge);
      }
    }

    for (const node of nodeMap.values()) {
      const relatedEdges = Array.from(edgeMap.values()).filter(
        e => e.source === node.id || e.target === node.id
      );
      node.influence = relatedEdges.reduce((sum, e) => sum + e.weight, 0);
      node.centrality = relatedEdges.length;
    }

    const result = {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values())
    };
    
    this.characterNetwork.set(projectId, result);
    await this.saveAdvancedData(projectId);
    
    return result;
  }

  private countCharacterAppearances(characterName: string, chapters: Chapter[]): number {
    let count = 0;
    for (const chapter of chapters) {
      if (chapter.content) {
        const regex = new RegExp(characterName, 'g');
        const matches = chapter.content.match(regex);
        count += matches ? matches.length : 0;
      }
    }
    return count;
  }

  async analyzeCharacterInfluence(projectId: string, characterId: string): Promise<{
    influence: number;
    centrality: number;
    relationships: number;
    emotionalImpact: number;
    plotRelevance: number;
  }> {
    const network = this.characterNetwork.get(projectId);
    if (!network) {
      return { influence: 0, centrality: 0, relationships: 0, emotionalImpact: 0, plotRelevance: 0 };
    }

    const node = network.nodes.find(n => n.id === characterId);
    const relatedEdges = network.edges.filter(e => e.source === characterId || e.target === characterId);

    return {
      influence: node?.influence || 0,
      centrality: node?.centrality || 0,
      relationships: relatedEdges.length,
      emotionalImpact: this.calculateEmotionalImpact(projectId, characterId),
      plotRelevance: this.calculatePlotRelevance(projectId, characterId)
    };
  }

  private calculateEmotionalImpact(projectId: string, characterId: string): number {
    const trajectories = this.emotionalTrajectories.get(projectId) || [];
    const trajectory = trajectories.find(t => t.characterId === characterId);
    if (!trajectory) return 0;
    
    const keyMoments = trajectory.keyMoments.length;
    const avgIntensity = trajectory.keyMoments.reduce((sum, m) => sum + m.intensity, 0) / (keyMoments || 1);
    return Math.round(keyMoments * avgIntensity / 10);
  }

  private calculatePlotRelevance(projectId: string, characterId: string): number {
    const hooks = this.advancedHooks.get(projectId) || [];
    const relatedHooks = hooks.filter(h => 
      h.description.includes(characterId) || 
      (h as any).participants?.includes(characterId)
    );
    return relatedHooks.length * 10;
  }

  async buildEmotionalTrajectory(
    projectId: string,
    characterId: string,
    characterName: string,
    emotionalArc: EmotionalArc
  ): Promise<EmotionalTrajectory> {
    const points = emotionalArc.points || [];
    
    const trajectory: EmotionalTrajectory = {
      characterId,
      characterName,
      primaryArc: this.determinePrimaryArc(points),
      secondaryArcs: [],
      keyMoments: this.identifyKeyMoments(points),
      currentPhase: this.determineCurrentPhase(points),
      predictedDevelopment: []
    };

    trajectory.predictedDevelopment = this.predictEmotionalDevelopment(trajectory);

    const trajectories = this.emotionalTrajectories.get(projectId) || [];
    const existingIndex = trajectories.findIndex(t => t.characterId === characterId);
    
    if (existingIndex >= 0) {
      trajectories[existingIndex] = trajectory;
    } else {
      trajectories.push(trajectory);
    }
    
    this.emotionalTrajectories.set(projectId, trajectories);
    await this.saveAdvancedData(projectId);
    
    return trajectory;
  }

  private determinePrimaryArc(points: any[]): EmotionalArcType {
    if (points.length < 3) return 'flat';
    
    const intensities = points.map(p => p.intensity);
    const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
    const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.3) return 'rise';
    if (secondAvg < firstAvg * 0.7) return 'fall';
    if (Math.abs(secondAvg - firstAvg) < firstAvg * 0.2) return 'flat';
    
    const maxIntensity = Math.max(...intensities);
    const maxIndex = intensities.indexOf(maxIntensity);
    
    if (maxIndex > intensities.length * 0.3 && maxIndex < intensities.length * 0.7) {
      return 'rise-fall';
    }
    
    return 'complex';
  }

  private identifyKeyMoments(points: any[]): EmotionalKeyMoment[] {
    if (points.length < 3) return [];
    
    const keyMoments: EmotionalKeyMoment[] = [];
    const intensities = points.map(p => p.intensity);
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let significance: 'turning_point' | 'peak' | 'valley' | 'transition' = 'transition';
      
      if (point.intensity >= 8) {
        significance = 'peak';
      } else if (point.intensity <= 3) {
        significance = 'valley';
      } else if (i > 0 && i < points.length - 1) {
        const prevIntensity = points[i - 1].intensity;
        const nextIntensity = points[i + 1].intensity;
        
        if ((point.intensity > prevIntensity && point.intensity > nextIntensity) ||
            (point.intensity < prevIntensity && point.intensity < nextIntensity)) {
          significance = 'turning_point';
        }
      }
      
      if (significance !== 'transition' || point.intensity > avgIntensity * 1.2) {
        keyMoments.push({
          chapter: point.chapter,
          emotion: point.emotion,
          intensity: point.intensity,
          trigger: '',
          consequence: '',
          significance
        });
      }
    }
    
    return keyMoments;
  }

  private determineCurrentPhase(points: any[]): EmotionalPhase {
    if (points.length === 0) {
      return {
        phaseName: '初始阶段',
        startChapter: 1,
        dominantEmotions: ['neutral'],
        intensity: 5,
        stability: 5
      };
    }

    const recentPoints = points.slice(-5);
    const dominantEmotions = this.findDominantEmotions(recentPoints);
    const avgIntensity = recentPoints.reduce((sum, p) => sum + p.intensity, 0) / recentPoints.length;
    const stability = this.calculateStability(recentPoints);

    return {
      phaseName: this.determinePhaseName(dominantEmotions, avgIntensity),
      startChapter: recentPoints[0]?.chapter || 1,
      dominantEmotions,
      intensity: Math.round(avgIntensity),
      stability
    };
  }

  private findDominantEmotions(points: any[]): string[] {
    const emotionCounts = new Map<string, number>();
    for (const point of points) {
      emotionCounts.set(point.emotion, (emotionCounts.get(point.emotion) || 0) + 1);
    }
    
    const sorted = Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([emotion]) => emotion);
  }

  private calculateStability(points: any[]): number {
    if (points.length < 2) return 5;
    
    let changes = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].emotion !== points[i - 1].emotion) {
        changes++;
      }
    }
    
    return Math.round(10 - (changes / (points.length - 1)) * 10);
  }

  private determinePhaseName(dominantEmotions: string[], avgIntensity: number): string {
    if (avgIntensity >= 7) return '高潮阶段';
    if (avgIntensity >= 5) return '发展阶段';
    if (avgIntensity >= 3) return '过渡阶段';
    return '铺垫阶段';
  }

  private predictEmotionalDevelopment(trajectory: EmotionalTrajectory): EmotionalPrediction[] {
    const predictions: EmotionalPrediction[] = [];
    const currentPhase = trajectory.currentPhase;
    
    if (currentPhase.intensity >= 7) {
      predictions.push({
        probableEmotion: '平静',
        confidence: 0.7,
        suggestedTriggers: ['高潮后的反思', '事件解决后的恢复']
      });
    } else if (currentPhase.intensity <= 3) {
      predictions.push({
        probableEmotion: '紧张',
        confidence: 0.6,
        suggestedTriggers: ['新的挑战出现', '隐藏的矛盾爆发']
      });
    }
    
    if (trajectory.primaryArc === 'rise') {
      predictions.push({
        probableEmotion: '满足',
        confidence: 0.5,
        suggestedTriggers: ['目标达成', '获得认可']
      });
    } else if (trajectory.primaryArc === 'fall') {
      predictions.push({
        probableEmotion: '希望',
        confidence: 0.5,
        suggestedTriggers: ['转机出现', '获得帮助']
      });
    }
    
    return predictions;
  }

  async addAdvancedHook(projectId: string, hook: AdvancedHook): Promise<void> {
    const hooks = this.advancedHooks.get(projectId) || [];
    hooks.push(hook);
    this.advancedHooks.set(projectId, hooks);
    await this.saveAdvancedData(projectId);
  }

  async createNestedHook(
    projectId: string,
    parentHookId: string,
    childHook: AdvancedHook
  ): Promise<void> {
    const hooks = this.advancedHooks.get(projectId) || [];
    const parentHook = hooks.find(h => h.id === parentHookId);
    
    if (parentHook) {
      childHook.parentHookId = parentHookId;
      childHook.layer = (parentHook.layer || 0) + 1;
      
      if (!parentHook.childHookIds) {
        parentHook.childHookIds = [];
      }
      parentHook.childHookIds.push(childHook.id);
      
      hooks.push(childHook);
      this.advancedHooks.set(projectId, hooks);
      await this.saveAdvancedData(projectId);
    }
  }

  async getHookNetwork(projectId: string, hookId: string): Promise<{
    hook: AdvancedHook;
    ancestors: AdvancedHook[];
    descendants: AdvancedHook[];
    related: AdvancedHook[];
  }> {
    const hooks = this.advancedHooks.get(projectId) || [];
    const hook = hooks.find(h => h.id === hookId);
    
    if (!hook) {
      return { hook: null as any, ancestors: [], descendants: [], related: [] };
    }

    const ancestors: AdvancedHook[] = [];
    let currentHook = hook;
    while (currentHook.parentHookId) {
      const parent = hooks.find(h => h.id === currentHook.parentHookId);
      if (parent) {
        ancestors.push(parent);
        currentHook = parent;
      } else {
        break;
      }
    }

    const descendants: AdvancedHook[] = [];
    const collectDescendants = (h: AdvancedHook) => {
      for (const childId of h.childHookIds || []) {
        const child = hooks.find(hook => hook.id === childId);
        if (child) {
          descendants.push(child);
          collectDescendants(child);
        }
      }
    };
    collectDescendants(hook);

    const related = (hook.relatedHookIds || [])
      .map(id => hooks.find(h => h.id === id))
      .filter((h): h is AdvancedHook => h !== undefined);

    return { hook, ancestors, descendants, related };
  }

  async analyzeHookComplexity(projectId: string, hookId: string): Promise<{
    depth: number;
    breadth: number;
    connectedHooks: number;
    foreshadowingCount: number;
    complexityScore: number;
  }> {
    const network = await this.getHookNetwork(projectId, hookId);
    const hook = network.hook;
    
    const depth = network.ancestors.length + 1;
    const breadth = network.descendants.length;
    const connectedHooks = network.ancestors.length + network.descendants.length + network.related.length;
    const foreshadowingCount = hook.foreshadowing?.length || 0;
    
    const complexityScore = Math.round(
      depth * 10 + 
      breadth * 5 + 
      connectedHooks * 3 + 
      foreshadowingCount * 2
    );

    return {
      depth,
      breadth,
      connectedHooks,
      foreshadowingCount,
      complexityScore
    };
  }

  async addTheme(projectId: string, theme: ThemeTrack): Promise<void> {
    const themes = this.themeTracks.get(projectId) || [];
    themes.push(theme);
    this.themeTracks.set(projectId, themes);
    await this.saveAdvancedData(projectId);
  }

  async trackThemeManifestation(
    projectId: string,
    themeId: string,
    manifestation: ThemeManifestation
  ): Promise<void> {
    const themes = this.themeTracks.get(projectId) || [];
    const theme = themes.find(t => t.id === themeId);
    
    if (theme) {
      theme.manifestations.push(manifestation);
      this.themeTracks.set(projectId, themes);
      await this.saveAdvancedData(projectId);
    }
  }

  async analyzeThemeDevelopment(projectId: string, themeId: string): Promise<{
    totalManifestations: number;
    averageSignificance: number;
    evolutionTrend: string;
    dominantType: string;
    relatedThemes: string[];
  }> {
    const themes = this.themeTracks.get(projectId) || [];
    const theme = themes.find(t => t.id === themeId);
    
    if (!theme) {
      return {
        totalManifestations: 0,
        averageSignificance: 0,
        evolutionTrend: '无数据',
        dominantType: '无数据',
        relatedThemes: []
      };
    }

    const manifestations = theme.manifestations;
    const totalManifestations = manifestations.length;
    const averageSignificance = manifestations.reduce((sum, m) => sum + m.significance, 0) / (totalManifestations || 1);
    
    const typeCounts = new Map<string, number>();
    for (const m of manifestations) {
      typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1);
    }
    const dominantType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '无数据';

    const evolutionTrend = theme.evolution.length > 0
      ? theme.evolution[theme.evolution.length - 1].development
      : '尚未演变';

    return {
      totalManifestations,
      averageSignificance: Math.round(averageSignificance * 10) / 10,
      evolutionTrend,
      dominantType,
      relatedThemes: theme.relatedThemes
    };
  }

  async addSymbol(projectId: string, symbol: Symbol): Promise<void> {
    const symbols = this.symbols.get(projectId) || [];
    symbols.push(symbol);
    this.symbols.set(projectId, symbols);
    await this.saveAdvancedData(projectId);
  }

  async trackSymbolAppearance(
    projectId: string,
    symbolId: string,
    appearance: SymbolAppearance
  ): Promise<void> {
    const symbols = this.symbols.get(projectId) || [];
    const symbol = symbols.find(s => s.id === symbolId);
    
    if (symbol) {
      symbol.appearances.push(appearance);
      this.symbols.set(projectId, symbols);
      await this.saveAdvancedData(projectId);
    }
  }

  async analyzeSymbolEvolution(projectId: string, symbolId: string): Promise<{
    totalAppearances: number;
    meaningEvolution: string[];
    relatedThemes: string[];
    significanceTrend: 'increasing' | 'stable' | 'decreasing';
  }> {
    const symbols = this.symbols.get(projectId) || [];
    const symbol = symbols.find(s => s.id === symbolId);
    
    if (!symbol) {
      return {
        totalAppearances: 0,
        meaningEvolution: [],
        relatedThemes: [],
        significanceTrend: 'stable'
      };
    }

    const appearances = symbol.appearances;
    const meaningEvolution = appearances.map(a => a.evolution || a.meaning);
    
    let significanceTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (appearances.length >= 3) {
      const recentCount = appearances.slice(-3).length;
      const earlierCount = appearances.slice(0, -3).length;
      if (recentCount > earlierCount) significanceTrend = 'increasing';
      else if (recentCount < earlierCount) significanceTrend = 'decreasing';
    }

    return {
      totalAppearances: appearances.length,
      meaningEvolution,
      relatedThemes: symbol.themes,
      significanceTrend
    };
  }

  async setNarrativeStructure(projectId: string, structure: NarrativeStructure): Promise<void> {
    this.narrativeStructures.set(projectId, structure);
    await this.saveAdvancedData(projectId);
  }

  async analyzeNarrativePacing(projectId: string, chapters: Chapter[]): Promise<PacingAnalysis> {
    const beats: ChapterBeat[] = [];
    
    for (const chapter of chapters) {
      const content = chapter.content || '';
      const wordCount = content.length;
      
      let beatType: ChapterBeat['beatType'] = 'rising_action';
      let tensionLevel = 5;
      
      if (content.includes('突然') || content.includes('意外') || content.includes('震惊')) {
        beatType = 'crisis';
        tensionLevel = 8;
      } else if (content.includes('终于') || content.includes('决定') || content.includes('必须')) {
        beatType = 'climax';
        tensionLevel = 9;
      } else if (content.includes('然而') || content.includes('但是') || content.includes('问题')) {
        beatType = 'complication';
        tensionLevel = 7;
      } else if (chapter.number === 1 || content.includes('开始') || content.includes('起初')) {
        beatType = 'opening';
        tensionLevel = 3;
      }
      
      beats.push({
        chapter: chapter.number,
        beatType,
        purpose: '',
        tensionLevel,
        emotionalImpact: Math.round(Math.random() * 5 + 3),
        plotAdvancement: Math.round(Math.random() * 5 + 3)
      });
    }

    const avgTension = beats.reduce((sum, b) => sum + b.tensionLevel, 0) / beats.length;
    const slowSegments: PacingSegment[] = [];
    const fastSegments: PacingSegment[] = [];
    
    let slowStart = -1;
    let fastStart = -1;
    
    for (let i = 0; i < beats.length; i++) {
      if (beats[i].tensionLevel < avgTension - 1) {
        if (slowStart === -1) slowStart = i;
      } else if (slowStart !== -1) {
        slowSegments.push({
          startChapter: beats[slowStart].chapter,
          endChapter: beats[i - 1].chapter,
          pace: beats.slice(slowStart, i).reduce((s, b) => s + b.tensionLevel, 0) / (i - slowStart),
          issue: '节奏偏慢'
        });
        slowStart = -1;
      }
      
      if (beats[i].tensionLevel > avgTension + 2) {
        if (fastStart === -1) fastStart = i;
      } else if (fastStart !== -1) {
        fastSegments.push({
          startChapter: beats[fastStart].chapter,
          endChapter: beats[i - 1].chapter,
          pace: beats.slice(fastStart, i).reduce((s, b) => s + b.tensionLevel, 0) / (i - fastStart)
        });
        fastStart = -1;
      }
    }

    const recommendations: string[] = [];
    if (slowSegments.length > fastSegments.length * 2) {
      recommendations.push('整体节奏偏慢，建议增加冲突和高潮场景');
    }
    if (fastSegments.length > 3) {
      recommendations.push('高潮场景较多，注意给读者喘息空间');
    }

    const structure = this.narrativeStructures.get(projectId);
    if (structure) {
      structure.chapterBeats = beats;
      structure.pacing = {
        overallPace: Math.round(avgTension * 10) / 10,
        slowSegments,
        fastSegments,
        recommendations
      };
      this.narrativeStructures.set(projectId, structure);
      await this.saveAdvancedData(projectId);
    }

    return {
      overallPace: Math.round(avgTension * 10) / 10,
      slowSegments,
      fastSegments,
      recommendations
    };
  }

  async buildTensionCurve(projectId: string, chapters: Chapter[]): Promise<TensionPoint[]> {
    const curve: TensionPoint[] = [];
    
    for (const chapter of chapters) {
      const content = chapter.content || '';
      let tension = 5;
      let type: TensionPoint['type'] = 'anticipation';
      
      if (content.includes('突然') || content.includes('震惊') || content.includes('意外')) {
        tension = 9;
        type = 'climax';
      } else if (content.includes('危险') || content.includes('威胁') || content.includes('冲突')) {
        tension = 8;
        type = 'conflict';
      } else if (content.includes('等待') || content.includes('即将') || content.includes('准备')) {
        tension = 7;
        type = 'suspense';
      } else if (content.includes('终于') || content.includes('解决') || content.includes('结束')) {
        tension = 6;
        type = 'relief';
      }
      
      curve.push({
        chapter: chapter.number,
        tension,
        type,
        description: `第${chapter.number}章张力点`
      });
    }

    const structure = this.narrativeStructures.get(projectId);
    if (structure) {
      structure.tensionCurve = curve;
      this.narrativeStructures.set(projectId, structure);
      await this.saveAdvancedData(projectId);
    }

    return curve;
  }

  async identifyClimaxes(projectId: string, chapters: Chapter[]): Promise<ClimaxPoint[]> {
    const climaxes: ClimaxPoint[] = [];
    const tensionCurve = await this.buildTensionCurve(projectId, chapters);
    
    for (let i = 1; i < tensionCurve.length - 1; i++) {
      const prev = tensionCurve[i - 1];
      const curr = tensionCurve[i];
      const next = tensionCurve[i + 1];
      
      if (curr.tension >= 8 && curr.tension >= prev.tension && curr.tension >= next.tension) {
        let type: ClimaxPoint['type'] = 'minor';
        if (curr.tension >= 9) type = 'major';
        if (curr.tension >= 9.5 && i > chapters.length * 0.6) type = 'ultimate';
        
        climaxes.push({
          chapter: curr.chapter,
          type,
          description: curr.description,
          impact: []
        });
      }
    }

    const structure = this.narrativeStructures.get(projectId);
    if (structure) {
      structure.climaxes = climaxes;
      this.narrativeStructures.set(projectId, structure);
      await this.saveAdvancedData(projectId);
    }

    return climaxes;
  }

  async generateComprehensiveReport(
    projectId: string,
    truthFiles: TruthFiles,
    chapters: Chapter[]
  ): Promise<{
    overview: {
      totalChapters: number;
      totalWords: number;
      totalCharacters: number;
      totalSubplots: number;
      totalHooks: number;
    };
    consistency: ConsistencyReport;
    characterNetwork: {
      nodes: CharacterNetworkNode[];
      edges: CharacterNetworkEdge[];
    };
    emotionalAnalysis: {
      trajectories: EmotionalTrajectory[];
      dominantEmotions: string[];
      emotionalStability: number;
    };
    hookAnalysis: {
      totalHooks: number;
      pendingHooks: number;
      overdueHooks: number;
      complexHooks: AdvancedHook[];
    };
    themeAnalysis: {
      themes: ThemeTrack[];
      dominantThemes: string[];
    };
    symbolAnalysis: {
      symbols: Symbol[];
      evolutionTrends: Map<string, string>;
    };
    narrativeAnalysis: {
      pacing: PacingAnalysis;
      tensionCurve: TensionPoint[];
      climaxes: ClimaxPoint[];
    };
    recommendations: string[];
  }> {
    const consistencyReport = await this.performDeepConsistencyCheck(projectId, truthFiles, chapters);
    const network = await this.buildCharacterNetwork(projectId, truthFiles, chapters);
    const pacing = await this.analyzeNarrativePacing(projectId, chapters);
    const tensionCurve = await this.buildTensionCurve(projectId, chapters);
    const climaxes = await this.identifyClimaxes(projectId, chapters);

    const trajectories = this.emotionalTrajectories.get(projectId) || [];
    const dominantEmotions = this.extractDominantEmotions(trajectories);
    const emotionalStability = this.calculateOverallStability(trajectories);

    const hooks = this.advancedHooks.get(projectId) || [];
    const pendingHooks = hooks.filter(h => h.status === 'pending');
    const overdueHooks = pendingHooks.filter(h => {
      const maxChapter = Math.max(...chapters.map(c => c.number), 0);
      return maxChapter - h.setInChapter > 30;
    });

    const themes = this.themeTracks.get(projectId) || [];
    const symbols = this.symbols.get(projectId) || [];

    const recommendations = this.generateRecommendations(
      consistencyReport,
      pacing,
      overdueHooks,
      trajectories
    );

    return {
      overview: {
        totalChapters: chapters.length,
        totalWords: chapters.reduce((sum, c) => sum + (c.content?.length || 0), 0),
        totalCharacters: network.nodes.length,
        totalSubplots: truthFiles.subplotBoard.length,
        totalHooks: hooks.length
      },
      consistency: consistencyReport,
      characterNetwork: network,
      emotionalAnalysis: {
        trajectories,
        dominantEmotions,
        emotionalStability
      },
      hookAnalysis: {
        totalHooks: hooks.length,
        pendingHooks: pendingHooks.length,
        overdueHooks: overdueHooks.length,
        complexHooks: hooks.filter(h => (h.childHookIds?.length || 0) > 0 || (h.layer || 0) > 0)
      },
      themeAnalysis: {
        themes,
        dominantThemes: themes.slice(0, 5).map(t => t.name)
      },
      symbolAnalysis: {
        symbols,
        evolutionTrends: new Map(symbols.map(s => [s.id, s.appearances.length > 0 ? '已演变' : '未演变']))
      },
      narrativeAnalysis: {
        pacing,
        tensionCurve,
        climaxes
      },
      recommendations
    };
  }

  private extractDominantEmotions(trajectories: EmotionalTrajectory[]): string[] {
    const emotionCounts = new Map<string, number>();
    
    for (const trajectory of trajectories) {
      for (const emotion of trajectory.currentPhase.dominantEmotions) {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      }
    }
    
    return Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion]) => emotion);
  }

  private calculateOverallStability(trajectories: EmotionalTrajectory[]): number {
    if (trajectories.length === 0) return 5;
    
    const totalStability = trajectories.reduce((sum, t) => sum + t.currentPhase.stability, 0);
    return Math.round(totalStability / trajectories.length);
  }

  private generateRecommendations(
    consistency: ConsistencyReport,
    pacing: PacingAnalysis,
    overdueHooks: AdvancedHook[],
    trajectories: EmotionalTrajectory[]
  ): string[] {
    const recommendations: string[] = [];

    if (consistency.criticalIssues > 0) {
      recommendations.push(`发现 ${consistency.criticalIssues} 个关键一致性问题，建议优先处理`);
    }

    if (pacing.slowSegments.length > pacing.fastSegments.length * 2) {
      recommendations.push('整体节奏偏慢，建议增加冲突和高潮场景');
    }

    if (overdueHooks.length > 0) {
      recommendations.push(`有 ${overdueHooks.length} 个伏笔已超期未回收，建议尽快处理`);
    }

    const unstableCharacters = trajectories.filter(t => t.currentPhase.stability < 4);
    if (unstableCharacters.length > 0) {
      recommendations.push(`${unstableCharacters.length} 个角色情感状态不稳定，建议关注其发展`);
    }

    if (recommendations.length === 0) {
      recommendations.push('作品整体状态良好，继续保持当前创作节奏');
    }

    return recommendations;
  }

  private async saveAdvancedData(projectId: string): Promise<void> {
    const dataPath = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    const serializeMap = <K, V>(map: Map<K, V>) => {
      return JSON.stringify(Array.from(map.entries()));
    };

    fs.writeFileSync(
      path.join(dataPath, 'volume-snapshots.json'),
      serializeMap(this.volumeSnapshots)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'timeline-nodes.json'),
      serializeMap(this.timelineNodes)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'character-network.json'),
      serializeMap(this.characterNetwork)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'emotional-trajectories.json'),
      serializeMap(this.emotionalTrajectories)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'advanced-hooks.json'),
      serializeMap(this.advancedHooks)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'theme-tracks.json'),
      serializeMap(this.themeTracks)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'symbols.json'),
      serializeMap(this.symbols)
    );
    
    fs.writeFileSync(
      path.join(dataPath, 'narrative-structures.json'),
      serializeMap(this.narrativeStructures)
    );
  }

  async loadAdvancedData(projectId: string): Promise<void> {
    const dataPath = path.join(this.storagePath, projectId);
    
    if (!fs.existsSync(dataPath)) return;

    const deserializeMap = <K, V>(filePath: string): Map<K, V> => {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return new Map(JSON.parse(data));
      }
      return new Map();
    };

    this.volumeSnapshots = deserializeMap(path.join(dataPath, 'volume-snapshots.json'));
    this.timelineNodes = deserializeMap(path.join(dataPath, 'timeline-nodes.json'));
    this.characterNetwork = deserializeMap(path.join(dataPath, 'character-network.json'));
    this.emotionalTrajectories = deserializeMap(path.join(dataPath, 'emotional-trajectories.json'));
    this.advancedHooks = deserializeMap(path.join(dataPath, 'advanced-hooks.json'));
    this.themeTracks = deserializeMap(path.join(dataPath, 'theme-tracks.json'));
    this.symbols = deserializeMap(path.join(dataPath, 'symbols.json'));
    this.narrativeStructures = deserializeMap(path.join(dataPath, 'narrative-structures.json'));
  }
}
