/**
 * Cloud Book - 上下文管理器
 * 管理创作过程中的上下文注入
 */

import { NovelProject, Chapter, Character, WorldSetting, StyleFingerprint, TruthFiles } from '../../types';

export interface ContextEntry {
  type: 'character' | 'world' | 'previous' | 'style' | 'truth';
  content: string;
  priority: number;
}

export class ContextManager {
  private contextCache: Map<string, ContextEntry[]> = new Map();

  /**
   * 构建写作上下文
   */
  buildWritingContext(
    project: NovelProject,
    currentChapter: number,
    truthFiles: TruthFiles
  ): string {
    const contextParts: string[] = [];

    // 1. 项目元信息
    contextParts.push(this.buildMetaContext(project));

    // 2. 世界设定
    if (project.worldSetting) {
      contextParts.push(this.buildWorldContext(project.worldSetting));
    }

    // 3. 角色信息
    if (project.characters && project.characters.length > 0) {
      contextParts.push(this.buildCharacterContext(project.characters));
    }

    // 4. 真相文件
    contextParts.push(this.buildTruthContext(truthFiles));

    // 5. 前文摘要
    contextParts.push(this.buildPreviousContext(project, currentChapter));

    // 6. 风格要求
    if (project.styleFingerprint) {
      contextParts.push(this.buildStyleContext(project.styleFingerprint));
    }

    return contextParts.join('\n\n');
  }

  /**
   * 构建元信息上下文
   */
  private buildMetaContext(project: NovelProject): string {
    return `## 作品信息
- 标题: ${project.title}
- 题材: ${project.genre}
- 类型: ${project.literaryGenre}
- 卖点: ${project.sellingPoints?.join('、') || '待定'}
- 目标读者: ${project.targetAudience || '待定'}`;
  }

  /**
   * 构建世界设定上下文
   */
  private buildWorldContext(world: WorldSetting): string {
    let context = `## 世界设定: ${world.name}`;

    if (world.powerSystem) {
      context += `\n### 力量体系
${world.powerSystem}`;
    }

    if (world.locations && world.locations.length > 0) {
      context += `\n### 主要地点
${world.locations.map(l => `- ${l.name}${l.description ? `: ${l.description}` : ''}`).join('\n')}`;
    }

    if (world.factions && world.factions.length > 0) {
      context += `\n### 势力
${world.factions.map(f => `- ${f.name}: ${f.description || ''}`).join('\n')}`;
    }

    if (world.rules && world.rules.length > 0) {
      context += `\n### 世界规则
${world.rules.map(r => `- ${r}`).join('\n')}`;
    }

    return context;
  }

  /**
   * 构建角色上下文
   */
  private buildCharacterContext(characters: Character[]): string {
    const activeCharacters = characters.slice(0, 10); // 限制数量

    return `## 主要角色
${activeCharacters.map(char => {
      let info = `### ${char.name}`;
      if (char.aliases && char.aliases.length > 0) {
        info += ` (${char.aliases.join(', ')})`;
      }
      if (char.personality) {
        info += `\n性格: ${char.personality}`;
      }
      if (char.background) {
        info += `\n背景: ${char.background}`;
      }
      if (char.goals && char.goals.length > 0) {
        info += `\n目标: ${char.goals.join('; ')}`;
      }
      if (char.speakingStyle) {
        info += `\n说话风格: ${char.speakingStyle}`;
      }
      return info;
    }).join('\n\n')}`;
  }

  /**
   * 构建真相文件上下文
   */
  private buildTruthContext(truthFiles: TruthFiles): string {
    let context = '## 当前状态';

    if (truthFiles.currentState) {
      const state = truthFiles.currentState;
      context += `\n### 主角状态
- 位置: ${state.protagonist.location || '未知'}`;
      if (state.protagonist.level) {
        context += `\n- 等级: ${state.protagonist.level}`;
      }
      context += `\n- 状态: ${state.protagonist.status || '正常'}`;

      if (state.currentConflicts.length > 0) {
        context += `\n### 当前冲突
${state.currentConflicts.map((c: string) => `- ${c}`).join('\n')}`;
      }

      if (state.relationshipSnapshot) {
        context += `\n### 关系快照
${Object.entries(state.relationshipSnapshot).map(([name, status]: [string, string]) => `- ${name}: ${status}`).join('\n')}`;
      }
    }

    if (truthFiles.pendingHooks && truthFiles.pendingHooks.length > 0) {
      const pending = truthFiles.pendingHooks.filter((h: any) => h.status !== 'paid_off');
      if (pending.length > 0) {
        context += `\n### 待回收伏笔
${pending.slice(0, 5).map((h: any) => `- ${h.description}`).join('\n')}`;
      }
    }

    if (truthFiles.particleLedger && truthFiles.particleLedger.length > 0) {
      context += `\n### 重要物品
${truthFiles.particleLedger.slice(0, 5).map((r: any) => `- ${r.name}: ${r.type}`).join('\n')}`;
    }

    return context;
  }

  /**
   * 构建前文上下文
   */
  private buildPreviousContext(project: NovelProject, currentChapter: number): string {
    const previousChapters = project.chapters?.filter(
      c => c.number < currentChapter && c.summary
    ).slice(-3) || [];

    if (previousChapters.length === 0) {
      return '## 前文摘要\n（暂无前文，请根据设定自由创作）';
    }

    return `## 前文摘要
${previousChapters.map(ch => `### ${ch.title}
${ch.summary || '（无摘要）'}`).join('\n\n')}`;
  }

  /**
   * 构建风格上下文
   */
  private buildStyleContext(style: StyleFingerprint): string {
    let context = '## 风格要求';

    context += `\n- 叙事视角: ${style.narrativeVoice === 'first_person' ? '第一人称' : '第三人称'}`;
    context += `\n- 时态: ${style.tense === 'past' ? '过去时' : '现在时'}`;
    context += `\n- 对话比例: ${(style.dialogueRatio * 100).toFixed(0)}%`;
    context += `\n- 描写密度: ${(style.descriptionDensity * 100).toFixed(0)}%`;

    if (style.emotionalWords && style.emotionalWords.length > 0) {
      context += `\n- 常用情感词: ${style.emotionalWords.slice(0, 10).join(', ')}`;
    }

    if (style.signaturePhrases && style.signaturePhrases.length > 0) {
      context += `\n- 标志性表达: ${style.signaturePhrases.slice(0, 5).join(', ')}`;
    }

    if (style.tabooWords && style.tabooWords.length > 0) {
      context += `\n- 避免使用: ${style.tabooWords.join(', ')}`;
    }

    return context;
  }

  /**
   * @DSL 上下文注入
   */
  parseDSL(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    let result = text;

    // @self - 当前章节
    result = result.replace(/@self/g, '当前章节');

    // @parent - 父级元素（暂无实现）
    result = result.replace(/@parent/g, '');

    // @type:xxx - 按类型获取
    result = result.replace(/@type:(\w+)/g, (match, type) => {
      if (type === '角色') {
        return project.characters?.map(c => c.name).join(', ') || '';
      }
      return match;
    });

    // @character:xxx - 获取特定角色
    result = result.replace(/@character:(\w+)/g, (match, name) => {
      const char = project.characters?.find(c => c.name.includes(name));
      return char ? `${char.name}的信息` : match;
    });

    // @location - 获取当前位置
    result = result.replace(/@location/g, truthFiles.currentState?.protagonist.location || '未知');

    // @hooks - 获取待回收伏笔
    result = result.replace(/@hooks/g, () => {
      const hooks = truthFiles.pendingHooks?.filter((h: any) => h.status !== 'paid_off') || [];
      return hooks.map((h: any) => h.description).join('; ') || '暂无伏笔';
    });

    // @truth - 获取真相文件摘要
    result = result.replace(/@truth/g, () => {
      return JSON.stringify(truthFiles.currentState, null, 2);
    });

    // [previous] - 获取前一个元素
    result = result.replace(/\[previous\]/g, '');

    // [filter:xxx] - 条件过滤（简化实现）
    result = result.replace(/\[filter:(\w+)\]/g, '');

    return result;
  }

  /**
   * 清理缓存
   */
  clearCache(projectId?: string): void {
    if (projectId) {
      this.contextCache.delete(projectId);
    } else {
      this.contextCache.clear();
    }
  }
}

export default ContextManager;
