/**
 * Cloud Book - 仿写/二创/同人创作引擎
 * 支持基于原作的智能仿写和创作
 */

import { 
  NovelProject, 
  Chapter, 
  StyleFingerprint,
  WritingMode,
  ParseResult,
  TruthFiles,
  Character,
  WorldSetting
} from '../../types';

export interface ImitationConfig {
  sourceParseResult: ParseResult;
  mode: WritingMode;
  // 仿写配置
  imitationLevel?: number;      // 1-100, 仿写程度
  preserveCoreElements?: string[]; // 保留的核心元素
  changeElements?: string[];      // 改变的元素
  // 二创配置
  derivativeType?: 'sequel' | 'prequel' | 'spin_off' | 'alternate_universe';
  // 同人配置
  fanficSettings?: {
    originalCharacters: string[];  // 保留的原作角色
    newCharacters: string[];        // 新增角色
    setting: 'canon' | 'alternate' | 'modern_au' | 'crossover';
  };
}

export interface GenerationContext {
  currentChapter: number;
  styleFingerprint: StyleFingerprint;
  truthFiles: TruthFiles;
  characters: Character[];
  worldSetting: WorldSetting;
  previousChapterSummary?: string;
}

export class ImitationEngine {
  private config: ImitationConfig;
  private llmProvider: any;

  constructor(config: ImitationConfig) {
    this.config = config;
  }

  /**
   * 设置 LLM 提供者
   */
  setLLMProvider(provider: any) {
    this.llmProvider = provider;
  }

  /**
   * 提取原作风格
   */
  extractSourceStyle(): StyleFingerprint {
    return this.config.sourceParseResult.styleFingerprint;
  }

  /**
   * 生成仿写内容
   */
  async generateImitation(
    context: GenerationContext,
    instructions?: string
  ): Promise<string> {
    const style = this.extractSourceStyle();
    
    // 构建提示词
    const prompt = this.buildImitationPrompt(context, style, instructions);
    
    // 调用 LLM
    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    });
    
    return result.text;
  }

  /**
   * 生成二创内容
   */
  async generateDerivative(
    context: GenerationContext,
    derivativeType: ImitationConfig['derivativeType']
  ): Promise<string> {
    const prompt = this.buildDerivativePrompt(context, derivativeType);
    
    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.8,
      maxTokens: 2000
    });
    
    return result.text;
  }

  /**
   * 生成同人内容
   */
  async generateFanfic(
    context: GenerationContext,
    fanficConfig: ImitationConfig['fanficSettings']
  ): Promise<string> {
    const prompt = this.buildFanficPrompt(context, fanficConfig);
    
    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.75,
      maxTokens: 2000
    });
    
    return result.text;
  }

  /**
   * 批量仿写章节
   */
  async batchImitate(
    chapters: Chapter[],
    context: GenerationContext,
    parallelCount: number = 3
  ): Promise<Chapter[]> {
    const results: Chapter[] = [];
    
    for (let i = 0; i < chapters.length; i += parallelCount) {
      const batch = chapters.slice(i, i + parallelCount);
      const batchResults = await Promise.all(
        batch.map(chapter => this.generateImitation(
          { ...context, currentChapter: chapter.number },
          chapter.outline
        ))
      );
      
      results.push(...batch.map((chapter, index) => ({
        ...chapter,
        content: batchResults[index],
        status: 'draft' as const
      })));
    }
    
    return results;
  }

  /**
   * 构建仿写提示词
   */
  private buildImitationPrompt(
    context: GenerationContext,
    style: StyleFingerprint,
    instructions?: string
  ): string {
    const styleDescription = this.describeStyle(style);
    const imitationLevel = this.config.imitationLevel || 70;
    
    return `你是一位顶级小说作家，擅长模仿特定写作风格。

## 写作风格要求
${styleDescription}

## 仿写程度
风格模仿程度: ${imitationLevel}%
- 100%: 尽可能接近原作风格
- 50%: 在原作基础上有所创新
- 0%: 完全原创

## 创作背景
当前章节: 第${context.currentChapter}章
世界观设定: ${JSON.stringify(context.worldSetting, null, 2)}
主要角色: ${context.characters.map(c => `${c.name}(${c.personality || '未设定'})`).join(', ')}

## 上文摘要
${context.previousChapterSummary || '（无）'}

## 写作指导
${instructions || '根据大纲续写，保持风格一致'}

## 输出要求
1. 严格遵循上述风格特征
2. 保持角色一致性
3. 字数控制在 2000-3000 字
4. 不要使用 AI 常见的刻板表达

请开始写作：`;
  }

  /**
   * 构建二创提示词
   */
  private buildDerivativePrompt(
    context: GenerationContext,
    derivativeType: string
  ): string {
    const typeDescriptions: Record<string, string> = {
      'sequel': '续写原作之后的故事，延续世界观和角色',
      'prequel': '创作原作之前的前传，揭示背景故事',
      'spin_off': '以配角的视角重新诠释故事',
      'alternate_universe': '在不同的世界线重新演绎故事'
    };
    
    return `你是一位顶级小说作家，擅长进行高质量的二次创作。

## 二创类型
${typeDescriptions[derivativeType] || '续写故事'}

## 原作概要
- 原著字数: ${this.config.sourceParseResult.estimatedWordCount}
- 主要角色: ${this.config.sourceParseResult.characters.map(c => c.name).join(', ')}
- 世界观: ${this.config.sourceParseResult.worldSettings.powerSystem || '标准设定'}

## 新作品设定
- 新作章节: 第${context.currentChapter}章
- 题材: ${context.worldSetting.genre}
- 目标字数: ${context.currentChapter * 2500}字

## 写作要求
1. 在尊重原作精神的基础上进行创新
2. 保持世界观自洽
3. 角色行为符合其性格设定
4. 融入新的情节元素

请开始创作：`;
  }

  /**
   * 构建同人提示词
   */
  private buildFanficPrompt(
    context: GenerationContext,
    fanficConfig: ImitationConfig['fanficSettings']
  ): string {
    const settingDescriptions: Record<string, string> = {
      'canon': '保持原作设定和世界观',
      'alternate': '在原作基础上进行大幅度改编',
      'modern_au': '将角色置于现代都市背景',
      'crossover': '融合多个作品的角色和设定'
    };
    
    return `你是一位同人小说作家，擅长创作高质量的同人作品。

## 同人设定
- 世界观类型: ${settingDescriptions[fanficConfig?.setting || 'canon']}
- 保留的原作角色: ${fanficConfig?.originalCharacters?.join(', ') || '无'}
- 新增角色: ${fanficConfig?.newCharacters?.join(', ') || '无'}

## 原作信息
- 原著字数: ${this.config.sourceParseResult.estimatedWordCount}
- 主要角色: ${this.config.sourceParseResult.characters.map(c => c.name).join(', ')}

## 新作品信息
- 章节: 第${context.currentChapter}章
- 题材: ${context.worldSetting.genre}

## 写作要求
1. 保持原作角色的核心性格特征
2. 尊重原作世界观的设定
3. 创新但不偏离原作精神
4. 注重角色之间的互动和情感

请开始创作：`;
  }

  /**
   * 描述风格
   */
  private describeStyle(style: StyleFingerprint): string {
    return `
### 句式特征
- 平均句长: ${this.calculateAverageSentenceLength(style.sentenceLengthDistribution)} 字
- 对话比例: ${(style.dialogueRatio * 100).toFixed(1)}%
- 描写密度: ${(style.descriptionDensity * 100).toFixed(1)}%

### 叙事特征
- 叙事视角: ${style.narrativeVoice === 'first_person' ? '第一人称' : '第三人称'}
- 时态: ${style.tense === 'past' ? '过去时' : '现在时'}

### 情感表达
- 常用情感词: ${style.emotionalWords.slice(0, 10).join(', ') || '无特定'}
- 标志性短语: ${style.signaturePhrases.slice(0, 5).join(', ') || '无'}

### 需要避免的词汇
${style.tabooWords.length > 0 ? style.tabooWords.join(', ') : '无特定禁忌'}
    `.trim();
  }

  /**
   * 计算平均句长
   */
  private calculateAverageSentenceLength(distribution: number[]): number {
    let total = 0;
    for (let i = 0; i < distribution.length; i++) {
      total += distribution[i] * (i * 10 + 5); // 每段的中间值
    }
    return Math.round(total);
  }

  /**
   * 生成章节大纲
   */
  async generateOutline(
    chapterNumber: number,
    worldSetting: WorldSetting,
    characters: Character[],
    previousOutline?: string
  ): Promise<string> {
    const prompt = `为第${chapterNumber}章创作大纲。

世界观: ${worldSetting.name}
题材: ${worldSetting.genre}
力量体系: ${worldSetting.powerSystem || '无'}

主要角色:
${characters.map(c => `- ${c.name}: ${c.personality || '未设定'}`).join('\n')}

上一章大纲:
${previousOutline || '（无）'}

请按以下格式输出章节大纲:
1. 本章核心事件
2. 涉及角色
3. 场景安排
4. 关键对话要点
5. 伏笔设置（如果有）
6. 本章结尾悬念`;
    
    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1000
    });
    
    return result.text;
  }

  /**
   * 风格迁移
   */
  async transferStyle(
    content: string,
    targetStyle: StyleFingerprint,
    sourceStyle?: StyleFingerprint
  ): Promise<string> {
    const prompt = `你是一位风格转换专家。

## 目标风格
${this.describeStyle(targetStyle)}

## 待转换内容
${content}

## 转换要求
1. 将内容转换为目标风格
2. 保持原有情节和角色
3. 自然融入目标风格的特征
4. 避免生硬的风格切换

请进行风格转换：`;
    
    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    });
    
    return result.text;
  }
}

export default ImitationEngine;
