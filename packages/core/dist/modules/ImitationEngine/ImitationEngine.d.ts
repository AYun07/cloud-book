/**
 * Cloud Book - 仿写/二创/同人创作引擎
 * 支持基于原作的智能仿写和创作
 */
import { Chapter, StyleFingerprint, WritingMode, ParseResult, TruthFiles, Character, WorldSetting } from '../../types';
export interface ImitationConfig {
    sourceParseResult: ParseResult;
    mode: WritingMode;
    imitationLevel?: number;
    preserveCoreElements?: string[];
    changeElements?: string[];
    derivativeType?: 'sequel' | 'prequel' | 'spin_off' | 'alternate_universe';
    fanficSettings?: {
        originalCharacters: string[];
        newCharacters: string[];
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
export declare class ImitationEngine {
    private config;
    private llmProvider;
    constructor(config: ImitationConfig);
    /**
     * 设置 LLM 提供者
     */
    setLLMProvider(provider: any): void;
    /**
     * 提取原作风格（真实分析算法）
     */
    extractSourceStyle(): StyleFingerprint;
    private reconstructFromParseResult;
    private performStyleAnalysis;
    private splitSentences;
    private countWords;
    private calculateLengthDistribution;
    private extractDialogueSegments;
    private calculateWordDensity;
    private extractEmotionalWords;
    private extractSignaturePhrases;
    private extractTabooWords;
    private analyzePunctuation;
    private detectNarrativeVoice;
    private detectTense;
    private calculateVariance;
    measureStyleSimilarity(style1: StyleFingerprint, style2: StyleFingerprint): number;
    private compareNumeric;
    private comparePunctuation;
    private compareEmotionalWords;
    /**
     * 生成仿写内容
     */
    generateImitation(context: GenerationContext, instructions?: string): Promise<string>;
    /**
     * 生成二创内容
     */
    generateDerivative(context: GenerationContext, derivativeType: ImitationConfig['derivativeType']): Promise<string>;
    /**
     * 生成同人内容
     */
    generateFanfic(context: GenerationContext, fanficConfig: ImitationConfig['fanficSettings']): Promise<string>;
    /**
     * 批量仿写章节
     */
    batchImitate(chapters: Chapter[], context: GenerationContext, parallelCount?: number): Promise<Chapter[]>;
    /**
     * 构建仿写提示词
     */
    private buildImitationPrompt;
    /**
     * 构建二创提示词
     */
    private buildDerivativePrompt;
    /**
     * 构建同人提示词
     */
    private buildFanficPrompt;
    /**
     * 描述风格
     */
    private describeStyle;
    /**
     * 计算平均句长
     */
    private calculateAverageSentenceLength;
    /**
     * 生成章节大纲
     */
    generateOutline(chapterNumber: number, worldSetting: WorldSetting, characters: Character[], previousOutline?: string): Promise<string>;
    /**
     * 风格迁移
     */
    transferStyle(content: string, targetStyle: StyleFingerprint, sourceStyle?: StyleFingerprint): Promise<string>;
}
export default ImitationEngine;
//# sourceMappingURL=ImitationEngine.d.ts.map