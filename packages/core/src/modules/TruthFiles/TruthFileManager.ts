/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性
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
  Chapter
} from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export class TruthFileManager {
  private storagePath: string;
  
  constructor(storagePath: string = './truth-files') {
    this.storagePath = storagePath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  /**
   * 初始化项目的真相文件
   */
  async initialize(projectId: string): Promise<TruthFiles> {
    const truthFiles: TruthFiles = {
      currentState: {
        protagonist: {
          id: '',
          name: '',
          location: '',
          status: ''
        },
        knownFacts: [],
        currentConflicts: [],
        relationshipSnapshot: {}
      },
      particleLedger: [],
      pendingHooks: [],
      chapterSummaries: [],
      subplotBoard: [],
      emotionalArcs: [],
      characterMatrix: []
    };
    
    await this.saveTruthFiles(projectId, truthFiles);
    return truthFiles;
  }

  /**
   * 获取真相文件
   */
  async getTruthFiles(projectId: string): Promise<TruthFiles> {
    const filePath = this.getFilePath(projectId);
    
    if (!fs.existsSync(filePath)) {
      return this.initialize(projectId);
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * 保存真相文件
   */
  async saveTruthFiles(projectId: string, truthFiles: TruthFiles): Promise<void> {
    const filePath = this.getFilePath(projectId);
    fs.writeFileSync(filePath, JSON.stringify(truthFiles, null, 2), 'utf-8');
  }

  /**
   * 更新章节摘要
   */
  async updateChapterSummary(projectId: string, chapter: Chapter): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    
    const summary: ChapterSummary = {
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      title: chapter.title,
      charactersPresent: chapter.characters || [],
      keyEvents: this.extractKeyEvents(chapter.content || ''),
      stateChanges: [],
      newHooks: chapter.hooks?.filter(h => h.setInChapter === chapter.number).map(h => h.description) || [],
      resolvedHooks: chapter.hooks?.filter(h => h.payoffChapter === chapter.number).map(h => h.description) || []
    };
    
    // 更新或添加章节摘要
    const existingIndex = truthFiles.chapterSummaries.findIndex(
      s => s.chapterId === chapter.id
    );
    
    if (existingIndex >= 0) {
      truthFiles.chapterSummaries[existingIndex] = summary;
    } else {
      truthFiles.chapterSummaries.push(summary);
    }
    
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 更新世界状态
   */
  async updateWorldState(projectId: string, state: Partial<WorldState>): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.currentState = { ...truthFiles.currentState, ...state };
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 添加资源
   */
  async addResource(projectId: string, resource: Resource): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.particleLedger.push(resource);
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 更新资源
   */
  async updateResource(
    projectId: string, 
    resourceId: string, 
    change: string,
    chapterNumber: number
  ): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    const resource = truthFiles.particleLedger.find(r => r.id === resourceId);
    
    if (resource) {
      resource.changeLog.push({ chapter: chapterNumber, change });
      resource.lastUpdatedChapter = chapterNumber;
    }
    
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 添加伏笔
   */
  async addHook(projectId: string, hook: Hook): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.pendingHooks.push(hook);
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 回收伏笔
   */
  async fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    const hook = truthFiles.pendingHooks.find(h => h.id === hookId);
    
    if (hook) {
      hook.status = 'paid_off';
      hook.payoffChapter = chapterNumber;
    }
    
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 添加角色互动
   */
  async addCharacterInteraction(
    projectId: string,
    characterId1: string,
    characterId2: string,
    chapterNumber: number,
    type: string,
    summary: string
  ): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    
    let interaction = truthFiles.characterMatrix.find(
      i => i.characterId1 === characterId1 && i.characterId2 === characterId2
    );
    
    if (!interaction) {
      interaction = {
        characterId1,
        characterId2,
        interactions: []
      };
      truthFiles.characterMatrix.push(interaction);
    }
    
    interaction.interactions.push({ chapter: chapterNumber, type, summary });
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 更新情感弧线
   */
  async updateEmotionalArc(
    projectId: string,
    characterId: string,
    characterName: string,
    chapterNumber: number,
    emotion: string,
    intensity: number
  ): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    
    let arc = truthFiles.emotionalArcs.find(a => a.characterId === characterId);
    
    if (!arc) {
      arc = {
        characterId,
        characterName,
        arcType: 'complex',
        points: []
      };
      truthFiles.emotionalArcs.push(arc);
    }
    
    arc.points.push({ chapter: chapterNumber, emotion, intensity });
    
    // 重新分析弧线类型
    arc.arcType = this.analyzeArcType(arc.points);
    
    await this.saveTruthFiles(projectId, truthFiles);
  }

  /**
   * 获取上下文摘要
   */
  async getContextSummary(projectId: string, chapterNumber: number): Promise<string> {
    const truthFiles = await this.getTruthFiles(projectId);
    
    const recentChapters = truthFiles.chapterSummaries
      .filter(s => s.chapterNumber < chapterNumber)
      .sort((a, b) => b.chapterNumber - a.chapterNumber)
      .slice(0, 3);
    
    const pendingHooks = truthFiles.pendingHooks.filter(h => h.status !== 'paid_off');
    const recentInteractions = truthFiles.characterMatrix
      .flatMap(i => i.interactions)
      .filter(inter => inter.chapter >= chapterNumber - 5)
      .slice(-5);
    
    let summary = '## 近期情节\n';
    for (const chapter of recentChapters) {
      summary += `- ${chapter.title}: ${chapter.keyEvents.join('; ')}\n`;
    }
    
    if (pendingHooks.length > 0) {
      summary += '\n## 待回收伏笔\n';
      for (const hook of pendingHooks.slice(0, 5)) {
        summary += `- ${hook.description} (设置于第${hook.setInChapter}章)\n`;
      }
    }
    
    return summary;
  }

  /**
   * 分析弧线类型
   */
  private analyzeArcType(points: { chapter: number; intensity: number }[]): 'rise' | 'fall' | 'rise_fall' | 'flat' | 'complex' {
    if (points.length < 3) return 'flat';
    
    const first = points[0].intensity;
    const last = points[points.length - 1].intensity;
    const middle = points.slice(1, -1);
    const middleAvg = middle.reduce((sum, p) => sum + p.intensity, 0) / middle.length;
    
    if (last > first && middleAvg > first * 1.2) return 'rise';
    if (last < first && middleAvg < first * 0.8) return 'fall';
    if (first < middleAvg && middleAvg > last) return 'rise_fall';
    if (Math.abs(last - first) < 0.2) return 'flat';
    
    return 'complex';
  }

  /**
   * 提取关键事件
   */
  private extractKeyEvents(content: string): string[] {
    const events: string[] = [];
    
    // 简单的事件提取逻辑
    const eventPatterns = [
      /（[^）]+）/,  // 括号内的事件
      /突然([^，,]+)/,  // "突然..."
      /最终([^，,]+)/,  // "最终..."
      /就在这时([^，,]+)/,  // "就在这时..."
    ];
    
    for (const pattern of eventPatterns) {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches) {
        events.push(...matches.slice(0, 3));
      }
    }
    
    return [...new Set(events)].slice(0, 5);
  }

  /**
   * 获取文件路径
   */
  private getFilePath(projectId: string): string {
    return path.join(this.storagePath, `${projectId}-truth-files.json`);
  }
}

export default TruthFileManager;
