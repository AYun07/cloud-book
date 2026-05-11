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
   * @DSL 上下文注入 - 完整实现
   */
  parseDSL(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    let result = text;

    result = this.parseSelfReference(result, project, truthFiles);
    result = this.parseCharacterReference(result, project);
    result = this.parseLocationReference(result, truthFiles);
    result = this.parseWorldReference(result, project);
    result = this.parseChapterReference(result, project);
    result = this.parseHookReference(result, truthFiles);
    result = this.parseRelationshipReference(result, truthFiles);
    result = this.parseTimelineReference(result, truthFiles);
    result = this.parseItemReference(result, truthFiles);
    result = this.parseFilterExpressions(result, project, truthFiles);
    result = this.parseConditionalExpressions(result, project, truthFiles);

    return result;
  }

  /**
   * @self - 当前章节引用
   */
  private parseSelfReference(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    const currentChapter = project.chapters?.[project.chapters.length - 1];

    return text.replace(/@self(?:\.(\w+))?/g, (match, property) => {
      if (!currentChapter) return '当前章节';

      switch (property) {
        case 'title': return currentChapter.title;
        case 'number': return String(currentChapter.number);
        case 'summary': return currentChapter.summary || '暂无摘要';
        case 'wordCount': return String(currentChapter.wordCount);
        case 'status': return currentChapter.status || '草稿';
        default: return `第${currentChapter.number}章 ${currentChapter.title}`;
      }
    });
  }

  /**
   * @character:xxx 或 @char:xxx - 角色引用
   */
  private parseCharacterReference(text: string, project: NovelProject): string {
    let result = text;

    result = result.replace(/@character:(\w+)/g, (match, name) => {
      const char = project.characters?.find(c =>
        c.name.includes(name) || c.aliases?.some(a => a.includes(name))
      );
      if (!char) return match;
      return this.formatCharacterBrief(char);
    });

    result = result.replace(/@char:(\w+)/g, (match, name) => {
      return result.replace(match, `@character:${name}`);
    });

    result = result.replace(/@allChars/g, () => {
      return project.characters?.map(c => c.name).join('、') || '';
    });

    result = result.replace(/@protagonist/g, () => {
      const main = project.characters?.find(c => c.id === 'main');
      return main?.name || project.characters?.[0]?.name || '主角';
    });

    return result;
  }

  /**
   * @location 或 @loc - 位置引用
   */
  private parseLocationReference(text: string, truthFiles: TruthFiles): string {
    const protagonist = truthFiles.currentState?.protagonist as any;

    return text.replace(/@(?:location|loc)(?:\.(\w+))?/g, (match, property) => {
      const location = protagonist?.location || '未知';

      if (property === 'name') return location;
      if (property === 'description') {
        return protagonist?.locationDescription || '暂无描述';
      }
      return location;
    });
  }

  /**
   * @world 或 @setting - 世界设定引用
   */
  private parseWorldReference(text: string, project: NovelProject): string {
    return text.replace(/@world(?:\.(\w+))?/g, (match, property) => {
      const world = project.worldSetting;

      if (!world) return '未设定世界观';

      switch (property) {
        case 'name': return world.name;
        case 'genre': return world.genre || '未指定';
        case 'power': return world.powerSystem || '无';
        case 'rules': return world.rules?.join('；') || '无特殊规则';
        default: return world.name;
      }
    });
  }

  /**
   * @chapter:N - 指定章节引用
   */
  private parseChapterReference(text: string, project: NovelProject): string {
    return text.replace(/@chapter:(\d+)(?:\.(\w+))?/g, (match, num, property) => {
      const chapter = project.chapters?.find(c => c.number === parseInt(num));

      if (!chapter) return `第${num}章`;

      switch (property) {
        case 'title': return chapter.title;
        case 'summary': return chapter.summary || '暂无摘要';
        case 'content': return (chapter.content || '').substring(0, 200) + '...';
        default: return `第${chapter.number}章 ${chapter.title}`;
      }
    });
  }

  /**
   * @hooks 或 @hook:N - 伏笔引用
   */
  private parseHookReference(text: string, truthFiles: TruthFiles): string {
    const pending = truthFiles.pendingHooks?.filter((h: any) => h.status !== 'paid_off') || [];

    return text.replace(/@hooks(?::(\d+))?/g, (match, count) => {
      const limit = count ? parseInt(count) : pending.length;
      return pending.slice(0, limit).map((h: any) => h.description).join('；') || '暂无伏笔';
    });
  }

  /**
   * @relation:xxx - 关系引用
   */
  private parseRelationshipReference(text: string, truthFiles: TruthFiles): string {
    const snapshot = truthFiles.currentState?.relationshipSnapshot || {};

    return text.replace(/@relation:(\w+)/g, (match, name) => {
      const relationship = Object.entries(snapshot).find(([key]) =>
        key.includes(name)
      );

      if (relationship) {
        return `${relationship[0]}: ${relationship[1]}`;
      }
      return match;
    });
  }

  /**
   * @timeline 或 @time - 时间线引用
   */
  private parseTimelineReference(text: string, truthFiles: TruthFiles): string {
    const protagonist = truthFiles.currentState?.protagonist as any;

    return text.replace(/@(?:timeline|time)(?:\.(\w+))?/g, (match, property) => {
      switch (property) {
        case 'day': return protagonist?.day || '第1天';
        case 'time': return protagonist?.timeOfDay || '未知时段';
        case 'season': return protagonist?.season || '未知季节';
        default: return protagonist?.day ? `第${protagonist.day}天` : '时间线';
      }
    });
  }

  /**
   * @item:N 或 @items - 物品引用
   */
  private parseItemReference(text: string, truthFiles: TruthFiles): string {
    const ledger = truthFiles.particleLedger || [];

    return text.replace(/@items(?::(\d+))?/g, (match, count) => {
      const limit = count ? parseInt(count) : ledger.length;
      return ledger.slice(0, limit).map((r: any) => r.name).join('、') || '暂无重要物品';
    });
  }

  /**
   * [filter:type] - 过滤表达式
   */
  private parseFilterExpressions(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    let result = text;

    result = result.replace(/\[filter:char(?:acter)?\s+(\w+)\]/g, (match, keyword) => {
      const chars = project.characters?.filter(c =>
        c.name.includes(keyword) || c.personality?.includes(keyword)
      );
      return chars?.map(c => c.name).join('、') || '';
    });

    result = result.replace(/\[filter:location\s+(\w+)\]/g, (match, keyword) => {
      const locations = project.worldSetting?.locations?.filter(l =>
        l.name.includes(keyword)
      );
      return locations?.map(l => l.name).join('、') || '';
    });

    result = result.replace(/\[filter:chapter\s+(\w+)\]/g, (match, status) => {
      const chapters = project.chapters?.filter(c => c.status === status);
      return chapters?.length ? `${chapters.length}章` : '0章';
    });

    return result;
  }

  /**
   * {if:condition}{then:text}{else:text} - 条件表达式
   */
  private parseConditionalExpressions(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    let result = text;

    result = result.replace(/\{if:(\w+)\}\{then:([^}]*)\}(?:\{else:([^}]*)\})?/g, (match, condition, thenText, elseText) => {
      let isTrue = false;

      switch (condition) {
        case 'hasProtagonist':
          isTrue = (project.characters?.length || 0) > 0;
          break;
        case 'hasWorld':
          isTrue = !!project.worldSetting?.name;
          break;
        case 'hasConflict':
          isTrue = (truthFiles.currentState?.currentConflicts?.length || 0) > 0;
          break;
        case 'hasPendingHooks':
          isTrue = (truthFiles.pendingHooks?.filter((h: any) => h.status !== 'paid_off').length || 0) > 0;
          break;
        case 'isFirstChapter':
          isTrue = (project.chapters?.length || 0) === 0;
          break;
      }

      return isTrue ? thenText : (elseText || '');
    });

    return result;
  }

  /**
   * 格式化角色简要信息
   */
  private formatCharacterBrief(char: Character): string {
    const parts: string[] = [char.name];

    if (char.personality) {
      parts.push(`性格:${char.personality}`);
    }
    if (char.goals?.length) {
      parts.push(`目标:${char.goals[0]}`);
    }

    return parts.join(' ');
  }

  /**
   * @type:xxx - 按类型获取
   */
  parseTypeReference(text: string, project: NovelProject, truthFiles: TruthFiles): string {
    let result = text;

    result = result.replace(/@type:(\w+)/g, (match, type) => {
      switch (type) {
        case '角色':
        case 'chars':
          return project.characters?.map(c => c.name).join('、') || '';
        case '地点':
        case 'locations':
          return project.worldSetting?.locations?.map(l => l.name).join('、') || '';
        case '势力':
        case 'factions':
          return project.worldSetting?.factions?.map(f => f.name).join('、') || '';
        case '物品':
        case 'items':
          return truthFiles.particleLedger?.map(r => (r as any).name).join('、') || '';
        case '章节':
        case 'chapters':
          return project.chapters?.map(c => c.title).join('、') || '';
        default:
          return match;
      }
    });

    result = result.replace(/@parent/g, '');
    result = result.replace(/@truth/g, () => JSON.stringify(truthFiles.currentState, null, 2));
    result = result.replace(/\[previous\]/g, '');

    return result;
  }

  /**
   * 获取DSL帮助信息
   */
  getDSLHelp(): string {
    return `
【Cloud Book DSL 语法参考】

【角色引用】
@character:名字 - 获取特定角色信息
@char:名字 - 角色引用简写
@protagonist - 获取主角名称
@allChars - 获取所有角色列表

【位置引用】
@location - 获取当前位置
@location.name - 获取位置名称
@location.description - 获取位置描述

【世界引用】
@world - 获取世界名称
@world.name - 获取世界观名称
@world.genre - 获取题材
@world.power - 获取力量体系
@world.rules - 获取世界规则

【章节引用】
@self - 当前章节
@self.title - 章节标题
@self.number - 章节号
@self.summary - 章节摘要
@chapter:N - 指定第N章

【伏笔引用】
@hooks - 所有待回收伏笔
@hooks:3 - 前3个伏笔

【关系引用】
@relation:角色 - 获取与某角色的关系

【时间线引用】
@timeline - 当前时间
@timeline.day - 当前天数
@timeline.season - 当前季节

【物品引用】
@items - 所有重要物品
@items:3 - 前3个物品

【过滤表达式】
[filter:character 关键词] - 过滤角色
[filter:location 关键词] - 过滤地点
[filter:chapter 状态] - 按状态统计章节

【条件表达式】
{if:条件}{then:文本1}{else:文本2}
条件: hasProtagonist, hasWorld, hasConflict, hasPendingHooks, isFirstChapter
`;
  }

  /**
   * 验证DSL语法
   */
  validateDSL(text: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const unmatchedBraces = (text.match(/\{/g) || []).length - (text.match(/\}/g) || []).length;
    if (unmatchedBraces > 0) {
      errors.push(`条件表达式大括号不匹配: 多${unmatchedBraces}个{`);
    }
    if (unmatchedBraces < 0) {
      errors.push(`条件表达式大括号不匹配: 多${-unmatchedBraces}个}`);
    }

    const unknownDirectives = text.match(/@[a-z]+:[^@\s]+/g) || [];
    const validPrefixes = ['character', 'char', 'chapter', 'relation', 'type', 'item', 'location', 'loc', 'world', 'hooks'];

    for (const directive of unknownDirectives) {
      const prefix = directive.split(':')[0].substring(1);
      if (!validPrefixes.includes(prefix)) {
        errors.push(`未知指令: ${directive}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
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
