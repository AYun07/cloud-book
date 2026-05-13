/**
 * Cloud Book - 写作管线
 * 整合写作、审计、修订的完整流程
 */

import { 
  NovelProject, 
  Chapter, 
  AuditResult, 
  WritingOptions,
  TruthFiles,
  LLMConfig
} from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
import { AntiDetectionEngine } from '../AntiDetection/AntiDetectionEngine';
import { ContextManager } from '../ContextManager/ContextManager';

export interface PipelineStep {
  name: string;
  execute: (input: any) => Promise<any>;
  onError?: (error: Error) => Promise<any>;
}

export class WritingPipeline {
  private llmManager: LLMManager;
  private auditEngine: AIAuditEngine;
  private antiDetectionEngine: AntiDetectionEngine;
  private contextManager: ContextManager;

  constructor(
    llmManager: LLMManager,
    auditEngine: AIAuditEngine,
    antiDetectionEngine: AntiDetectionEngine
  ) {
    this.llmManager = llmManager;
    this.auditEngine = auditEngine;
    this.antiDetectionEngine = antiDetectionEngine;
    this.contextManager = new ContextManager();
  }

  /**
   * 执行完整写作流程
   */
  async generateChapter(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: TruthFiles,
    options?: WritingOptions
  ): Promise<{
    chapter: Chapter;
    auditResult?: AuditResult;
    humanized?: string;
  }> {
    // 1. 构建上下文
    const context = this.contextManager.buildWritingContext(
      project,
      chapterNumber,
      truthFiles
    );

    // 2. 生成正文
    const draftContent = await this.generateDraft(
      project,
      chapterNumber,
      context,
      options
    );

    // 3. 审计
    let auditResult: AuditResult | undefined;
    if (options?.autoAudit !== false) {
      auditResult = await this.auditEngine.audit(draftContent, truthFiles);
    }

    // 4. 修订（如果审计不通过）
    let finalContent = draftContent;
    if (auditResult && !auditResult.passed) {
      finalContent = await this.reviseBasedOnAudit(
        draftContent,
        auditResult,
        truthFiles,
        context
      );
    }

    // 5. 去AI味（如果启用）
    let humanized: string | undefined;
    if (options?.autoHumanize) {
      humanized = await this.antiDetectionEngine.humanize(finalContent, this.llmManager);
      finalContent = humanized;
    }

    // 6. 创建章节对象
    const chapter: Chapter = {
      id: this.generateId(),
      number: chapterNumber,
      title: `第${this.toChineseNumber(chapterNumber)}章`,
      status: auditResult?.passed ? 'draft' : 'reviewing',
      wordCount: this.countWords(finalContent),
      content: finalContent,
      auditResult,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return { chapter, auditResult, humanized };
  }

  /**
   * 生成草稿
   */
  private async generateDraft(
    project: NovelProject,
    chapterNumber: number,
    context: string,
    options?: WritingOptions
  ): Promise<string> {
    // 确定使用的模型
    const modelConfig = this.llmManager.route('writing') || 
                        this.llmManager.listModels()[0];

    // 构建提示词
    const prompt = this.buildWritingPrompt(
      project,
      chapterNumber,
      context,
      options
    );

    // 生成
    const result = await this.llmManager.generate(
      prompt,
      modelConfig?.name,
      {
        temperature: 0.7,
        maxTokens: options?.targetWordCount || 3000
      }
    );

    return result.text;
  }

  /**
   * 构建写作提示词
   */
  private buildWritingPrompt(
    project: NovelProject,
    chapterNumber: number,
    context: string,
    options?: WritingOptions
  ): string {
    let prompt = `你是一位顶级小说作家，擅长创作高质量的网文作品。

## 作品信息
${context}

## 写作指导
当前章节: 第${chapterNumber}章
目标字数: ${options?.targetWordCount || 2500}字

${options?.chapterGuidance ? `章节指导: ${options.chapterGuidance}` : ''}

## 写作要求
1. 保持世界观和角色一致性
2. 注重情节张力和节奏
3. 描写细腻，情感真实
4. 对话自然，符合角色性格
5. 避免AI常见的刻板表达
6. 字数控制在${options?.targetWordCount || 2500}字左右

## 风格提醒
- 句式要有变化，混合长短句
- 减少过度使用的连接词（如"然而"、"因此"）
- 增加情感描写和内心活动
- 保持对话口语化

请开始创作第${chapterNumber}章：

`;

    return prompt;
  }

  /**
   * 根据审计结果修订
   */
  async reviseChapter(
    content: string,
    auditResult: AuditResult,
    truthFiles: TruthFiles
  ): Promise<string> {
    const prompt = `你是一位资深编辑，擅长修订AI生成的小说内容。

## 原稿
${content}

## 审计结果
${JSON.stringify(auditResult, null, 2)}

## 修订要求
1. 修复审计发现的所有问题
2. 保持原文的优点和风格
3. 不要过度修改，造成新的问题
4. 重点修复严重(critical)问题

## 当前世界状态
角色: ${truthFiles.currentState?.protagonist.name || '未知'}
位置: ${truthFiles.currentState?.protagonist.location || '未知'}
状态: ${truthFiles.currentState?.protagonist.status || '正常'}

请直接输出修订后的内容，不要添加额外说明：`;

    const modelConfig = this.llmManager.route('revision') || 
                        this.llmManager.listModels()[0];

    const result = await this.llmManager.generate(
      prompt,
      modelConfig?.name,
      { temperature: 0.5, maxTokens: 3000 }
    );

    return result.text;
  }

  /**
   * 基于审计修订
   */
  private async reviseBasedOnAudit(
    content: string,
    auditResult: AuditResult,
    truthFiles: TruthFiles,
    context: string
  ): Promise<string> {
    let revised = content;
    const criticalIssues = auditResult.issues.filter(i => i.severity === 'critical');
    
    // 最多迭代3次
    for (let i = 0; i < 3 && criticalIssues.length > 0; i++) {
      revised = await this.reviseChapter(revised, auditResult, truthFiles);
      
      // 重新审计
      const newResult = await this.auditEngine.audit(revised, truthFiles);
      auditResult = newResult;
      
      if (newResult.passed) {
        break;
      }
    }
    
    return revised;
  }

  /**
   * 流式生成
   */
  async streamGenerate(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: TruthFiles,
    options: WritingOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const context = this.contextManager.buildWritingContext(
      project,
      chapterNumber,
      truthFiles
    );

    const prompt = this.buildWritingPrompt(
      project,
      chapterNumber,
      context,
      options
    );

    const modelConfig = this.llmManager.route('writing') || 
                        this.llmManager.listModels()[0];

    let fullContent = '';

    await this.llmManager.stream(
      prompt,
      modelConfig?.name,
      { temperature: 0.7, maxTokens: 3000, stream: true },
      (chunk) => {
        fullContent += chunk;
        onChunk(chunk);
      }
    );

    return fullContent;
  }

  /**
   * 生成大纲
   */
  async generateOutline(
    project: NovelProject,
    chapterNumber: number,
    truthFiles: TruthFiles
  ): Promise<string> {
    const context = this.contextManager.buildWritingContext(
      project,
      chapterNumber,
      truthFiles
    );

    const prompt = `你是一位资深小说策划，擅长设计精彩的章节大纲。

## 作品信息
${context}

## 大纲要求
请为第${chapterNumber}章设计详细大纲，包括：
1. 本章核心事件（1-2句话）
2. 涉及的主要角色
3. 场景安排（时间、地点）
4. 关键情节点
5. 重要对话要点
6. 伏笔设置（如有）
7. 章节结尾悬念

请用简洁的语言描述，字数控制在300字左右。

请开始设计大纲：`;

    const modelConfig = this.llmManager.route('planning') || 
                        this.llmManager.listModels()[0];

    const result = await this.llmManager.generate(
      prompt,
      modelConfig?.name,
      { temperature: 0.7, maxTokens: 1000 }
    );

    return result.text;
  }

  /**
   * 生成摘要
   */
  async generateSummary(
    content: string,
    truthFiles: TruthFiles
  ): Promise<string> {
    const prompt = `请为以下小说章节生成简明摘要：

${content}

要求：
1. 50-100字
2. 包含主要事件
3. 包含关键人物
4. 包含重要转折

请直接输出摘要：`;

    const modelConfig = this.llmManager.route('analysis') || 
                        this.llmManager.listModels()[0];

    const result = await this.llmManager.generate(
      prompt,
      modelConfig?.name,
      { temperature: 0.3, maxTokens: 200 }
    );

    return result.text;
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 数字转中文
   */
  private toChineseNumber(num: number): string {
    const units = ['', '十', '百', '千', '万'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
    if (num === 0) return '零';
    
    let result = '';
    let unitIndex = 0;
    
    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = digits[digit] + units[unitIndex] + result;
      } else if (result && !result.startsWith('零')) {
        result = '零' + result;
      }
      num = Math.floor(num / 10);
      unitIndex++;
    }
    
    return result.replace(/零+$/, '');
  }

  /**
   * 统计字数
   */
  private countWords(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 批量生成章节
   */
  async generateChaptersBatch(
    project: NovelProject,
    startChapter: number,
    endChapter: number,
    truthFiles: TruthFiles,
    options?: WritingOptions,
    onProgress?: (current: number, total: number, chapter?: Chapter) => void
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    const total = endChapter - startChapter + 1;
    const parallelCount = options?.parallelCount || 2;
    
    for (let i = startChapter; i <= endChapter; i += parallelCount) {
      const batch: Promise<{ chapter: Chapter; chapterNumber: number }>[] = [];
      
      for (let j = i; j < Math.min(i + parallelCount, endChapter + 1); j++) {
        batch.push(
          this.generateChapter(project, j, truthFiles, options)
            .then(result => ({ chapter: result.chapter, chapterNumber: j }))
        );
      }
      
      const results = await Promise.all(batch);
      
      for (const result of results.sort((a, b) => a.chapterNumber - b.chapterNumber)) {
        chapters.push(result.chapter);
        onProgress?.(chapters.length, total, result.chapter);
      }
    }
    
    return chapters;
  }

  /**
   * 续写现有小说
   */
  async continueWriting(
    project: NovelProject,
    lastChapterNumber: number,
    newChaptersCount: number,
    truthFiles: TruthFiles,
    options?: WritingOptions
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    
    for (let i = 1; i <= newChaptersCount; i++) {
      const chapterNumber = lastChapterNumber + i;
      
      const result = await this.generateChapter(project, chapterNumber, truthFiles, {
        ...options,
        chapterGuidance: options?.chapterGuidance || `这是第${chapterNumber}章的续写`
      });
      
      chapters.push(result.chapter);
    }
    
    return chapters;
  }

  /**
   * 同人创作
   */
  async writeFanfiction(
    sourceNovel: NovelProject,
    targetChapterNumber: number,
    premise: string,
    truthFiles: TruthFiles,
    options?: WritingOptions
  ): Promise<{ chapter: Chapter; deviationNote?: string }> {
    const deviationNote = `同人设定: ${premise}`;
    
    const result = await this.generateChapter(sourceNovel, targetChapterNumber, truthFiles, {
      ...options,
      chapterGuidance: `同人创作方向: ${premise}`
    });
    
    return { chapter: result.chapter, deviationNote };
  }

  /**
   * 番外篇创作
   */
  async writeSideStory(
    project: NovelProject,
    sideStoryTitle: string,
    viewpointCharacter: string,
    timelinePosition: string,
    truthFiles: TruthFiles,
    options?: WritingOptions
  ): Promise<{ chapter: Chapter; sideStoryNote?: string }> {
    const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
    
    const sideStoryPrompt = `## 番外篇: ${sideStoryTitle}
视角角色: ${viewpointCharacter}
时间线位置: ${timelinePosition}

${context}

请从${viewpointCharacter}的视角创作一个番外篇，讲述${timelinePosition}发生的事情。
目标字数: ${options?.targetWordCount || 2000}字`;

    const modelConfig = this.llmManager.route('writing') || 
                        this.llmManager.listModels()[0];

    const result = await this.llmManager.generate(
      sideStoryPrompt,
      modelConfig?.name,
      { temperature: 0.7, maxTokens: options?.targetWordCount || 2000 }
    );

    const chapter: Chapter = {
      id: this.generateId(),
      number: 0,
      title: sideStoryTitle,
      status: 'draft',
      wordCount: this.countWords(result.text),
      content: result.text,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return { chapter, sideStoryNote: `番外篇-视角:${viewpointCharacter}-时间:${timelinePosition}` };
  }

  /**
   * 多视角叙事
   */
  async writeMultiPOV(
    project: NovelProject,
    chapterNumber: number,
    viewpoints: string[],
    truthFiles: TruthFiles,
    options?: WritingOptions
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    const wordsPerViewpoint = (options?.targetWordCount || 2000) / viewpoints.length;
    
    for (const viewpoint of viewpoints) {
      const context = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
      
      const povPrompt = `## 多视角叙事 - 第${chapterNumber}章
当前视角: ${viewpoint}

${context}

请从${viewpoint}的视角创作第${chapterNumber}章。
要求:
1. 只描写该视角能感知到的事物
2. 保持与其他视角的一致性
3. 字数控制在${wordsPerViewpoint}字左右`;

      const modelConfig = this.llmManager.route('writing') || 
                          this.llmManager.listModels()[0];

      const result = await this.llmManager.generate(
        povPrompt,
        modelConfig?.name,
        { temperature: 0.7, maxTokens: wordsPerViewpoint }
      );

      chapters.push({
        id: this.generateId(),
        number: chapterNumber,
        title: `第${this.toChineseNumber(chapterNumber)}章 - ${viewpoint}视角`,
        status: 'draft',
        wordCount: this.countWords(result.text),
        content: result.text,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return chapters;
  }

  /**
   * 自动化完整创作流程
   */
  async autoGenerateNovel(
    project: NovelProject,
    chapterCount: number,
    onPhase?: (phase: string, progress: number) => void
  ): Promise<{ chapters: Chapter[]; truthFiles: TruthFiles }> {
    onPhase?.('初始化真相文件', 0);
    
    let truthFiles = await this.getOrCreateTruthFiles(project);
    
    onPhase?.('生成章节大纲', 10);
    await this.generateBatchOutlines(project, chapterCount, truthFiles);
    
    onPhase?.('开始写作', 20);
    
    const chapters = await this.generateChaptersBatch(
      project,
      1,
      chapterCount,
      truthFiles,
      { autoAudit: true, autoHumanize: true },
      (current, total) => {
        const progress = 20 + (current / total) * 70;
        onPhase?.(`写作进度: ${current}/${total}`, progress);
      }
    );
    
    onPhase?.('更新真相文件', 95);
    for (const chapter of chapters) {
      await this.updateTruthFilesAfterChapter(chapter, truthFiles);
    }
    
    onPhase?.('完成', 100);
    
    return { chapters, truthFiles };
  }

  private async getOrCreateTruthFiles(project: NovelProject): Promise<TruthFiles> {
    return project.truthFiles || {
      currentState: {
        protagonist: {
          id: project.characters?.[0]?.id || 'main',
          name: project.characters?.[0]?.name || '主角',
          location: project.worldSetting?.locations?.[0]?.name || '未知地点',
          status: '正常'
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
  }

  private async generateBatchOutlines(
    project: NovelProject,
    chapterCount: number,
    truthFiles: TruthFiles
  ): Promise<string[]> {
    const outlines: string[] = [];
    
    for (let i = 1; i <= chapterCount; i++) {
      const outline = await this.generateOutline(project, i, truthFiles);
      outlines.push(outline);
    }
    
    return outlines;
  }

  private async updateTruthFilesAfterChapter(chapter: Chapter, truthFiles: TruthFiles): Promise<void> {
    truthFiles.chapterSummaries.push({
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      title: chapter.title,
      charactersPresent: chapter.characters || [],
      keyEvents: [],
      stateChanges: [],
      newHooks: [],
      resolvedHooks: []
    });
  }

  /**
   * 冒险模式 - 类似AI Dungeon的互动冒险
   */
  async adventureMode(
    project: NovelProject,
    storyPrompt: string,
    userAction: string,
    truthFiles: TruthFiles
  ): Promise<{ narrative: string; newWorldInfo: string[] }> {
    const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
    
    const prompt = `## 冒险模式
当前世界设定:
${context}

故事背景:
${storyPrompt}

玩家行动:
${userAction}

请以第三人称叙述这段冒险经历，描写玩家的行动结果、世界的反应、遇到的NPC等。
保持故事的连贯性和沉浸感。
字数控制在800-1500字。`;

    const modelConfig = this.llmManager.route('writing') || this.llmManager.listModels()[0];
    const result = await this.llmManager.generate(prompt, modelConfig?.name, {
      temperature: 0.8,
      maxTokens: 2000
    });

    const newWorldInfo = this.extractNewWorldInfo(result.text);
    return { narrative: result.text, newWorldInfo };
  }

  /**
   * 聊天机器人模式 - 与角色互动对话
   */
  async chatbotMode(
    project: NovelProject,
    characterId: string,
    userMessage: string,
    truthFiles: TruthFiles
  ): Promise<{ characterName: string; response: string; emotion: string }> {
    const character = project.characters?.find(c => c.id === characterId);
    if (!character) {
      return { characterName: '系统', response: '角色不存在', emotion: 'neutral' };
    }

    const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
    
    const prompt = `## 聊天机器人模式
当前场景:
${context}

角色信息:
- 姓名: ${character.name}
- 性格: ${character.personality || '暂无设定'}
- 说话风格: ${(character as any).speakingStyle || '正常'}
- 背景: ${character.background || '暂无背景'}

对话历史:
用户: ${userMessage}

请以${character.name}的身份回复用户的对话。
回复应该:
1. 符合角色性格
2. 保持说话风格一致
3. 体现角色的情感变化
4. 推动对话发展

直接输出角色回复，不需要任何格式标记。`;

    const modelConfig = this.llmManager.route('writing') || this.llmManager.listModels()[0];
    const result = await this.llmManager.generate(prompt, modelConfig?.name, {
      temperature: 0.9,
      maxTokens: 500
    });

    const emotion = this.detectEmotion(result.text);
    return { 
      characterName: character.name, 
      response: result.text,
      emotion
    };
  }

  /**
   * 从叙事中提取新的世界信息
   */
  private extractNewWorldInfo(narrative: string): string[] {
    const worldInfo: string[] = [];
    const locationPattern = /在([^，,。]+)[发生|来到|走进]/g;
    const npcPattern = /遇到了([^，,。]+)/g;
    const itemPattern = /获得了([^，,。]+)/g;

    let match;
    while ((match = locationPattern.exec(narrative)) !== null) {
      worldInfo.push(`新地点: ${match[1]}`);
    }
    while ((match = npcPattern.exec(narrative)) !== null) {
      worldInfo.push(`遇到NPC: ${match[1]}`);
    }
    while ((match = itemPattern.exec(narrative)) !== null) {
      worldInfo.push(`获得物品: ${match[1]}`);
    }

    return worldInfo;
  }

  /**
   * 检测对话情感
   */
  private detectEmotion(text: string): string {
    const positive = ['高兴', '开心', '微笑', '兴奋', '满意', '愉快', '欣喜', '惊喜'];
    const negative = ['愤怒', '生气', '伤心', '难过', '失望', '沮丧', '痛苦', '悲伤'];
    const neutral = ['平静', '淡然', '冷静', '正常', '一般'];

    for (const word of positive) {
      if (text.includes(word)) return 'positive';
    }
    for (const word of negative) {
      if (text.includes(word)) return 'negative';
    }
    return 'neutral';
  }

  /**
   * 多模式写作入口
   */
  async writeWithMode(
    project: NovelProject,
    mode: 'novel' | 'adventure' | 'chatbot',
    options: {
      chapterNumber?: number;
      userAction?: string;
      characterId?: string;
      storyPrompt?: string;
    },
    truthFiles: TruthFiles
  ): Promise<any> {
    switch (mode) {
      case 'novel':
        return this.generateChapter(project, options.chapterNumber || 1, truthFiles);
      
      case 'adventure':
        if (!options.storyPrompt || !options.userAction) {
          throw new Error('Adventure mode requires storyPrompt and userAction');
        }
        return this.adventureMode(project, options.storyPrompt, options.userAction, truthFiles);
      
      case 'chatbot':
        if (!options.characterId) {
          throw new Error('Chatbot mode requires characterId');
        }
        if (!options.userAction) {
          throw new Error('Chatbot mode requires userAction (message)');
        }
        return this.chatbotMode(project, options.characterId, options.userAction, truthFiles);
      
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }
}

export default WritingPipeline;
