/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性，包含完整的验证逻辑
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
  Character,
  TimelineEvent
} from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'content' | 'hook' | 'character' | 'timeline' | 'consistency';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
  };
}

export class TruthFileManager {
  private storagePath: string;

  constructor(storagePath: string = './truth-files') {
    this.storagePath = storagePath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

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
        relationshipSnapshot: {},
        activeSubplots: []
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

  async getTruthFiles(projectId: string): Promise<TruthFiles> {
    const filePath = this.getFilePath(projectId);

    if (!fs.existsSync(filePath)) {
      return this.initialize(projectId);
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async saveTruthFiles(projectId: string, truthFiles: TruthFiles): Promise<void> {
    const filePath = this.getFilePath(projectId);
    fs.writeFileSync(filePath, JSON.stringify(truthFiles, null, 2), 'utf-8');
  }

  async validateChapter(
    projectId: string,
    chapter: Chapter,
    characters: Character[]
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const truthFiles = await this.getTruthFiles(projectId);

    issues.push(...this.validateChapterContent(chapter));

    issues.push(...this.validateChapterCharacters(chapter, characters, truthFiles.chapterSummaries));

    issues.push(...this.validateChapterHooks(chapter, truthFiles.pendingHooks));

    issues.push(...this.validateChapterTimeline(chapter, truthFiles));

    issues.push(...this.validateChapterParticleConsistency(chapter, truthFiles.particleLedger));

    return this.buildValidationResult(issues);
  }

  private validateChapterContent(chapter: Chapter): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!chapter.content || chapter.content.trim().length === 0) {
      issues.push({
        type: 'error',
        category: 'content',
        message: `第${chapter.number}章内容为空`,
        location: `chapter-${chapter.number}`,
        suggestion: '请添加章节内容'
      });
      return issues;
    }

    const minWordCount = 500;
    const wordCount = this.countWords(chapter.content);
    if (wordCount < minWordCount) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: `第${chapter.number}章内容过少 (${wordCount}字)，可能需要扩充`,
        location: `chapter-${chapter.number}`,
        suggestion: `建议至少${minWordCount}字`
      });
    }

    const sentences = chapter.content.match(/[。！？.!?]+/g) || [];
    if (sentences.length > 0) {
      const avgSentenceLength = wordCount / sentences.length;
      if (avgSentenceLength > 100) {
        issues.push({
          type: 'warning',
          category: 'content',
          message: `第${chapter.number}章平均句子长度过长 (${avgSentenceLength.toFixed(0)}字/句)，可能影响可读性`,
          location: `chapter-${chapter.number}`,
          suggestion: '考虑拆分长句以提升阅读体验'
        });
      }
    }

    if (!chapter.title || chapter.title.trim().length === 0) {
      issues.push({
        type: 'error',
        category: 'content',
        message: `第${chapter.number}章缺少标题`,
        location: `chapter-${chapter.number}`,
        suggestion: '请添加章节标题'
      });
    }

    if (chapter.title && chapter.title.length > 50) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: `第${chapter.number}章标题过长 (${chapter.title.length}字符)`,
        location: `chapter-${chapter.number}`,
        suggestion: '建议标题控制在50字符以内'
      });
    }

    return issues;
  }

  private validateChapterCharacters(
    chapter: Chapter,
    characters: Character[],
    existingSummaries: ChapterSummary[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!chapter.characters || chapter.characters.length === 0) {
      issues.push({
        type: 'warning',
        category: 'character',
        message: `第${chapter.number}章未指定出场角色`,
        location: `chapter-${chapter.number}`,
        suggestion: '建议在章节中标注出场角色'
      });
    }

    const characterNames = new Set(characters.map(c => c.name.toLowerCase()));
    const characterAliases = new Map<string, string>();
    characters.forEach(c => {
      if (c.aliases) {
        c.aliases.forEach(alias => characterAliases.set(alias.toLowerCase(), c.name));
      }
    });

    if (chapter.characters) {
      for (const charId of chapter.characters) {
        const character = characters.find(c => c.id === charId);
        if (!character) {
          issues.push({
            type: 'error',
            category: 'character',
            message: `第${chapter.number}章引用的角色ID "${charId}" 在角色档案中不存在`,
            location: `chapter-${chapter.number}`,
            suggestion: '请在角色档案中创建该角色或更正角色ID'
          });
        }
      }
    }

    const previousChapters = existingSummaries
      .filter(s => s.chapterNumber < chapter.number)
      .sort((a, b) => b.chapterNumber - a.chapterNumber)
      .slice(0, 2);

    const previousCharacters = new Set<string>();
    previousChapters.forEach(s => {
      s.charactersPresent.forEach(c => previousCharacters.add(c));
    });

    if (chapter.characters) {
      for (const charId of chapter.characters) {
        if (previousCharacters.size > 0 && !previousCharacters.has(charId)) {
          const character = characters.find(c => c.id === charId);
          if (character) {
            issues.push({
              type: 'warning',
              category: 'character',
              message: `角色 "${character.name}" 首次出现在第${chapter.number}章，之前章节未提及`,
              location: `chapter-${chapter.number}`,
              suggestion: '考虑在之前章节中做适当铺垫或引入'
            });
          }
        }
      }
    }

    return issues;
  }

  private validateChapterHooks(
    chapter: Chapter,
    allPendingHooks: Hook[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!chapter.hooks || chapter.hooks.length === 0) {
      return issues;
    }

    const chapterHooks = chapter.hooks.filter(h => h.setInChapter === chapter.number);
    const payoffHooks = chapter.hooks.filter(h => h.payoffChapter === chapter.number);

    for (const hook of chapterHooks) {
      if (!hook.description || hook.description.trim().length === 0) {
        issues.push({
          type: 'error',
          category: 'hook',
          message: `第${chapter.number}章设置的伏笔缺少描述`,
          location: `chapter-${chapter.number}-hook-${hook.id}`,
          suggestion: '请为伏笔添加描述'
        });
        continue;
      }

      if (hook.description.length > 200) {
        issues.push({
          type: 'warning',
          category: 'hook',
          message: `第${chapter.number}章伏笔描述过长 (${hook.description.length}字符)`,
          location: `chapter-${chapter.number}-hook-${hook.id}`,
          suggestion: '建议伏笔描述简洁有力'
        });
      }

      const existingHook = allPendingHooks.find(h => h.id === hook.id);
      if (existingHook && existingHook.setInChapter > chapter.number) {
        issues.push({
          type: 'error',
          category: 'hook',
          message: `伏笔 "${hook.description}" 的设置章节 (${hook.setInChapter}) 晚于当前章节 (${chapter.number})`,
          location: `chapter-${chapter.number}-hook-${hook.id}`,
          suggestion: '伏笔设置章节不应晚于当前章节'
        });
      }

      const laterHook = allPendingHooks.find(
        h => h.id !== hook.id &&
          this.hooksAreRelated(hook.description, h.description) &&
          h.setInChapter < chapter.number
      );
      if (laterHook) {
        issues.push({
          type: 'warning',
          category: 'hook',
          message: `第${chapter.number}章的伏笔可能与第${laterHook.setInChapter}章的伏笔重复或冲突`,
          location: `chapter-${chapter.number}-hook-${hook.id}`,
          suggestion: '检查伏笔是否重复设置'
        });
      }
    }

    for (const hook of payoffHooks) {
      const correspondingSetHook = allPendingHooks.find(
        h => h.id === hook.id && h.setInChapter < chapter.number
      );

      if (!correspondingSetHook) {
        const allChapters = chapter.hooks || [];
        const setChapter = allChapters.find(h => h.id === hook.id && h.setInChapter);
        if (!setChapter) {
          issues.push({
            type: 'error',
            category: 'hook',
            message: `第${chapter.number}章回收的伏笔 "${hook.description}" 没有在之前章节设置过`,
            location: `chapter-${chapter.number}-hook-${hook.id}`,
            suggestion: `伏笔回收前必须先设置伏笔`
          });
        }
      }

      if (correspondingSetHook) {
        const chaptersBetween = chapter.number - correspondingSetHook.setInChapter;
        if (chaptersBetween > 30) {
          issues.push({
            type: 'warning',
            category: 'hook',
            message: `伏笔 "${hook.description}" 设置于第${correspondingSetHook.setInChapter}章，回收于第${chapter.number}章，间隔过长 (${chaptersBetween}章)`,
            location: `chapter-${chapter.number}-hook-${hook.id}`,
            suggestion: '考虑缩短伏笔设置与回收的间隔'
          });
        }

        if (chaptersBetween < 2) {
          issues.push({
            type: 'warning',
            category: 'hook',
            message: `伏笔 "${hook.description}" 设置与回收间隔太短 (${chaptersBetween}章)，可能缺乏铺垫`,
            location: `chapter-${chapter.number}-hook-${hook.id}`,
            suggestion: '建议增加伏笔与回收之间的章节数'
          });
        }
      }
    }

    return issues;
  }

  private hooksAreRelated(desc1: string, desc2: string): boolean {
    const words1 = new Set(desc1.toLowerCase().match(/[\u4e00-\u9fa5]+/g) || []);
    const words2 = new Set(desc2.toLowerCase().match(/[\u4e00-\u9fa5]+/g) || []);

    if (words1.size === 0 || words2.size === 0) return false;

    let commonWords = 0;
    for (const word of words1) {
      if (words2.has(word) && word.length >= 2) {
        commonWords++;
      }
    }

    const similarity = commonWords / Math.max(words1.size, words2.size);
    return similarity > 0.5;
  }

  private validateChapterTimeline(
    chapter: Chapter,
    truthFiles: TruthFiles
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (chapter.timeline) {
      const timelinePattern = /(\d{4})[年|\-|\/](\d{1,2})[月|\-|\/]?(\d{0,2})?/g;
      const matches = [...chapter.timeline.matchAll(timelinePattern)];

      if (matches.length > 1) {
        const sortedDates = matches.map(m => ({
          year: parseInt(m[1]),
          month: parseInt(m[2]) || 1,
          day: parseInt(m[3]) || 1,
          full: m[0]
        })).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          if (a.month !== b.month) return a.month - b.month;
          return a.day - b.day;
        });

        for (let i = 1; i < sortedDates.length; i++) {
          const prev = sortedDates[i - 1];
          const curr = sortedDates[i];

          if (curr.year < prev.year ||
              (curr.year === prev.year && curr.month < prev.month) ||
              (curr.year === prev.year && curr.month === prev.month && curr.day < prev.day)) {
            issues.push({
              type: 'error',
              category: 'timeline',
              message: `第${chapter.number}章时间线存在逆序: "${prev.full}" 之后出现 "${curr.full}"`,
              location: `chapter-${chapter.number}`,
              suggestion: '请按时间顺序排列事件'
            });
          }
        }
      }
    }

    const previousChapters = truthFiles.chapterSummaries
      .filter(s => s.chapterNumber < chapter.number)
      .sort((a, b) => b.chapterNumber - a.chapterNumber)
      .slice(0, 3);

    const knownFacts = truthFiles.currentState.knownFacts;
    for (const summary of previousChapters) {
      for (const fact of summary.keyEvents) {
        if (fact.includes('死亡') && chapter.content && chapter.content.includes('还在活动')) {
          issues.push({
            type: 'warning',
            category: 'timeline',
            message: `第${chapter.number}章可能存在时间线矛盾: 之前章节提到角色死亡，但当前章节似乎暗示其存活`,
            location: `chapter-${chapter.number}`,
            suggestion: '检查角色状态的一致性'
          });
        }
      }
    }

    if (chapter.number > 1) {
      const lastChapter = previousChapters[0];
      if (lastChapter && lastChapter.keyEvents.length > 0) {
        const lastEvent = lastChapter.keyEvents[lastChapter.keyEvents.length - 1];

        if (chapter.content && chapter.content.trim().startsWith('与此同时')) {
          // 平行叙事，合理
        } else if (chapter.content && chapter.content.trim().startsWith('回到')) {
          // 闪回，合理
        } else if (chapter.location && lastChapter.title) {
          // 检查地点一致性
        }
      }
    }

    return issues;
  }

  private validateChapterParticleConsistency(
    chapter: Chapter,
    particles: Resource[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!chapter.content || chapter.content.trim().length === 0) {
      return issues;
    }

    const mentionedItems = this.extractItemMentions(chapter.content);

    for (const itemName of mentionedItems) {
      const item = particles.find(p =>
        p.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (item && chapter.number < item.lastUpdatedChapter) {
        issues.push({
          type: 'warning',
          category: 'consistency',
          message: `第${chapter.number}章提到 "${itemName}"，但该物品最后更新于第${item.lastUpdatedChapter}章`,
          location: `chapter-${chapter.number}`,
          suggestion: '物品在出现前应已存在于档案中'
        });
      }
    }

    return issues;
  }

  private extractItemMentions(content: string): string[] {
    const items: string[] = [];
    const itemPatterns = [
      /拿着(.{2,10})/g,
      /手持(.{2,10})/g,
      /带着(.{2,10})/g,
      /拥有(.{2,10})/g,
      /使用(.{2,10})/g,
      /给了(.{2,10})/g,
      /(.{2,10})在手中/g,
      /(.{2,10})出现在/g
    ];

    for (const pattern of itemPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length >= 2 && match[1].length <= 10) {
          items.push(match[1]);
        }
      }
    }

    return [...new Set(items)];
  }

  async validateProject(
    projectId: string,
    chapters: Chapter[],
    characters: Character[],
    worldTimeline?: TimelineEvent[]
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const truthFiles = await this.getTruthFiles(projectId);

    issues.push(...this.validateProjectHooks(chapters, truthFiles));

    issues.push(...this.validateProjectTimeline(chapters, worldTimeline));

    issues.push(...this.validateProjectCharacterConsistency(chapters, characters));

    issues.push(...this.validateProjectResourceFlow(chapters, truthFiles.particleLedger));

    issues.push(...this.validateChapterOrder(chapters));

    return this.buildValidationResult(issues);
  }

  private validateProjectHooks(
    chapters: Chapter[],
    truthFiles: TruthFiles
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const allHooks = chapters.flatMap(ch => ch.hooks || []);
    const setHookIds = new Set(allHooks.filter(h => h.setInChapter).map(h => h.id));
    const payoffHookIds = new Set(allHooks.filter(h => h.payoffChapter).map(h => h.id));

    for (const hookId of payoffHookIds) {
      if (!setHookIds.has(hookId)) {
        const hook = allHooks.find(h => h.id === hookId);
        issues.push({
          type: 'error',
          category: 'hook',
          message: `伏笔 "${hook?.description || hookId}" 回收但未设置`,
          location: `hook-${hookId}`,
          suggestion: '确保每个回收的伏笔都有对应的设置'
        });
      }
    }

    for (const hook of truthFiles.pendingHooks) {
      if (hook.status === 'pending') {
        const maxChapter = Math.max(...chapters.map(ch => ch.number), 0);
        if (hook.setInChapter < maxChapter - 20) {
          issues.push({
            type: 'warning',
            category: 'hook',
            message: `伏笔 "${hook.description}" 设置于第${hook.setInChapter}章，超过20章仍未回收`,
            location: `hook-${hook.id}`,
            suggestion: '考虑回收旧伏笔或确认是否需要继续保留'
          });
        }
      }
    }

    const hookDescriptions = allHooks.map(h => h.description);
    for (let i = 0; i < hookDescriptions.length; i++) {
      for (let j = i + 1; j < hookDescriptions.length; j++) {
        if (this.hooksAreRelated(hookDescriptions[i], hookDescriptions[j])) {
          const hookI = allHooks[i];
          const hookJ = allHooks[j];
          if (hookI.setInChapter !== hookJ.setInChapter) {
            issues.push({
              type: 'warning',
              category: 'hook',
              message: `第${hookI.setInChapter}章和第${hookJ.setInChapter}章的伏笔可能重复`,
              location: `hook-${hookI.id}`,
              suggestion: '检查是否有重复设置的伏笔'
            });
          }
        }
      }
    }

    return issues;
  }

  private validateProjectTimeline(
    chapters: Chapter[],
    worldTimeline?: TimelineEvent[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!worldTimeline || worldTimeline.length === 0) {
      return issues;
    }

    const sortedEvents = [...worldTimeline].sort((a, b) => {
      const chapterA = a.chapter || 0;
      const chapterB = b.chapter || 0;
      return chapterA - chapterB;
    });

    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = sortedEvents[i - 1];
      const curr = sortedEvents[i];

      if (prev.chapter && curr.chapter && prev.chapter > curr.chapter) {
        issues.push({
          type: 'error',
          category: 'timeline',
          message: `世界观时间线事件顺序矛盾: "${prev.description}" (第${prev.chapter}章) 应在 "${curr.description}" (第${curr.chapter}章) 之前`,
          location: `timeline-${prev.id}`,
          suggestion: '按时间顺序排列世界观事件'
        });
      }
    }

    for (const event of worldTimeline) {
      if (event.chapter) {
        const chapter = chapters.find(ch => ch.number === event.chapter);
        if (!chapter) {
          issues.push({
            type: 'warning',
            category: 'timeline',
            message: `时间线事件 "${event.description}" 引用第${event.chapter}章，但该章节不存在`,
            location: `timeline-${event.id}`,
            suggestion: '确认章节编号是否正确'
          });
        }
      }
    }

    return issues;
  }

  private validateProjectCharacterConsistency(
    chapters: Chapter[],
    characters: Character[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const characterIds = new Set(characters.map(c => c.id));

    for (const chapter of chapters) {
      if (chapter.characters) {
        for (const charId of chapter.characters) {
          if (!characterIds.has(charId)) {
            issues.push({
              type: 'error',
              category: 'character',
              message: `第${chapter.number}章引用了不存在的角色ID: ${charId}`,
              location: `chapter-${chapter.number}`,
              suggestion: '创建该角色或在章节中移除该引用'
            });
          }
        }
      }
    }

    const firstAppearance: Record<string, number> = {};
    for (const chapter of chapters) {
      if (chapter.characters) {
        for (const charId of chapter.characters) {
          if (!firstAppearance[charId]) {
            firstAppearance[charId] = chapter.number;
          }
        }
      }
    }

    const sortedFirstAppearances = Object.entries(firstAppearance)
      .sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < sortedFirstAppearances.length; i++) {
      const [charId1, chapter1] = sortedFirstAppearances[i];
      const char1 = characters.find(c => c.id === charId1);

      if (char1?.background) {
        const mentionedChars = this.extractCharacterMentions(char1.background);
        for (const mentioned of mentionedChars) {
          const mentionedChar = characters.find(c =>
            c.name.includes(mentioned) || mentioned.includes(c.name)
          );

          if (mentionedChar && mentionedChar.id !== charId1) {
            const mentionedChapter = firstAppearance[mentionedChar.id];
            if (mentionedChapter > chapter1) {
              issues.push({
                type: 'warning',
                category: 'character',
                message: `角色 "${char1.name}" 的背景中提到 "${mentioned}"，但 "${mentionedChar.name}" 首次出现在第${mentionedChapter}章，晚于 "${char1.name}" (第${chapter1}章)`,
                location: `character-${charId1}`,
                suggestion: '被提及的角色应在当前角色首次出场前被引入，或调整提及方式'
              });
            }
          }
        }
      }
    }

    return issues;
  }

  private extractCharacterMentions(text: string): string[] {
    const mentions: string[] = [];
    const patterns = [
      /(?:父亲|母亲|父亲是|母亲是|他的|她的|他的父亲|她的母亲|兄弟|姐妹|朋友|敌人|师父|徒弟)[^，。,\n]{0,20}?([^\s，。,\n]{2,8})/g,
      /(?:认识|遇到|见过|记得|记得[^。]{0,20}?)([^\s，。,\n]{2,8})/g
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length >= 2) {
          mentions.push(match[1]);
        }
      }
    }

    return [...new Set(mentions)];
  }

  private validateProjectResourceFlow(
    chapters: Chapter[],
    particles: Resource[]
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const particle of particles) {
      const sortedChanges = [...particle.changeLog].sort((a, b) => a.chapter - b.chapter);

      for (let i = 1; i < sortedChanges.length; i++) {
        const prev = sortedChanges[i - 1];
        const curr = sortedChanges[i];

        if (curr.chapter < prev.chapter) {
          issues.push({
            type: 'error',
            category: 'consistency',
            message: `物品 "${particle.name}" 的变更记录顺序错误: 第${prev.chapter}章之后出现第${curr.chapter}章的变更`,
            location: `particle-${particle.id}`,
            suggestion: '按章节顺序记录变更'
          });
        }
      }

      const maxChapter = Math.max(...chapters.map(ch => ch.number), 0);
      if (particle.lastUpdatedChapter > maxChapter) {
        issues.push({
          type: 'error',
          category: 'consistency',
          message: `物品 "${particle.name}" 最后更新于第${particle.lastUpdatedChapter}章，但最大章节号为${maxChapter}`,
          location: `particle-${particle.id}`,
          suggestion: '更新物品的最后更新章节号'
        });
      }
    }

    return issues;
  }

  private validateChapterOrder(chapters: Chapter[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const sortedChapters = [...chapters].sort((a, b) => a.number - b.number);

    for (let i = 1; i < sortedChapters.length; i++) {
      const prev = sortedChapters[i - 1];
      const curr = sortedChapters[i];

      if (curr.number !== prev.number + 1) {
        issues.push({
          type: 'error',
          category: 'consistency',
          message: `章节顺序不连续: 第${prev.number}章之后应为第${prev.number + 1}章，实际为第${curr.number}章`,
          location: `chapter-${curr.number}`,
          suggestion: '重新编排章节序号'
        });
      }
    }

    const chapterIds = new Set<string>();
    for (const chapter of chapters) {
      if (chapterIds.has(chapter.id)) {
        issues.push({
          type: 'error',
          category: 'consistency',
          message: `章节ID "${chapter.id}" 重复出现`,
          location: `chapter-${chapter.number}`,
          suggestion: '确保每个章节有唯一的ID'
        });
      }
      chapterIds.add(chapter.id);
    }

    return issues;
  }

  private buildValidationResult(issues: ValidationIssue[]): ValidationResult {
    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      summary: {
        totalIssues: issues.length,
        errors: issues.filter(i => i.type === 'error').length,
        warnings: issues.filter(i => i.type === 'warning').length
      }
    };
  }

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

  async updateWorldState(projectId: string, state: Partial<WorldState>): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.currentState = { ...truthFiles.currentState, ...state };
    await this.saveTruthFiles(projectId, truthFiles);
  }

  async addResource(projectId: string, resource: Resource): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.particleLedger.push(resource);
    await this.saveTruthFiles(projectId, truthFiles);
  }

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

  async addHook(projectId: string, hook: Hook): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    truthFiles.pendingHooks.push(hook);
    await this.saveTruthFiles(projectId, truthFiles);
  }

  async fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void> {
    const truthFiles = await this.getTruthFiles(projectId);
    const hook = truthFiles.pendingHooks.find(h => h.id === hookId);

    if (hook) {
      hook.status = 'paid_off';
      hook.payoffChapter = chapterNumber;
    }

    await this.saveTruthFiles(projectId, truthFiles);
  }

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
    arc.arcType = this.analyzeArcType(arc.points);

    await this.saveTruthFiles(projectId, truthFiles);
  }

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

  private analyzeArcType(points: { chapter: number; intensity: number }[]): 'rise' | 'fall' | 'rise_fall' | 'flat' | 'complex' {
    if (points.length < 3) return 'flat';

    const sorted = [...points].sort((a, b) => a.chapter - b.chapter);
    const first = sorted[0].intensity;
    const last = sorted[sorted.length - 1].intensity;
    const middle = sorted.slice(1, -1);
    const middleAvg = middle.reduce((sum, p) => sum + p.intensity, 0) / middle.length;

    if (last > first && middleAvg > first * 1.2) return 'rise';
    if (last < first && middleAvg < first * 0.8) return 'fall';
    if (first < middleAvg && middleAvg > last) return 'rise_fall';
    if (Math.abs(last - first) < 0.2) return 'flat';

    return 'complex';
  }

  private extractKeyEvents(content: string): string[] {
    const events: string[] = [];

    const eventPatterns = [
      /（[^）]+）/,
      /突然([^，,]+)/,
      /最终([^，,]+)/,
      /就在这时([^，,]+)/,
      /然而([^，,]+)/,
      /没想到([^，,]+)/,
      /就在此时([^，,]+)/
    ];

    for (const pattern of eventPatterns) {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches) {
        events.push(...matches.slice(0, 3));
      }
    }

    return [...new Set(events)].slice(0, 5);
  }

  private getFilePath(projectId: string): string {
    return path.join(this.storagePath, `${projectId}-truth-files.json`);
  }

  private countWords(text: string): number {
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (text.match(/[a-zA-Z]+/g) || []).length;
    return chinese + english;
  }
}

export default TruthFileManager;
