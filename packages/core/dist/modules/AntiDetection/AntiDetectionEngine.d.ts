/**
 * Cloud Book - 反AI检测与去AI味模块
 * 帮助用户生成更自然的人类化文本
 */
import { AntiDetectionConfig } from '../../types';
export interface DetectionResult {
    isAI: boolean;
    confidence: number;
    indicators: AIIndicator[];
    suggestions: string[];
}
export interface AIIndicator {
    type: string;
    description: string;
    severity: number;
    location?: string;
}
export interface StyleAnalysis {
    averageSentenceLength: number;
    sentenceLengthVariance: number;
    vocabularyRichness: number;
    transitionWordFrequency: number;
    emotionalWordDensity: number;
    paragraphStructure: number;
    dialoguePattern: string[];
    repetitionRate: number;
}
export declare class AntiDetectionEngine {
    private config;
    private aiWordList;
    private pronounPatterns;
    constructor(config?: Partial<AntiDetectionConfig>);
    /**
     * 检测AI痕迹
     */
    detectAI(text: string): DetectionResult;
    /**
     * 检测AI常用词汇
     */
    private detectAIWords;
    /**
     * 检测句式模式
     */
    private detectSentencePatterns;
    /**
     * 检测结构模式
     */
    private detectStructurePatterns;
    /**
     * 检测情感模式
     */
    private detectEmotionPatterns;
    /**
     * 生成修改建议
     */
    private generateSuggestions;
    /**
     * 去AI味处理
     */
    humanize(text: string, llmProvider?: any): Promise<string>;
    /**
     * 替换AI词汇
     */
    private replaceAIWords;
    /**
     * 变化句式结构
     */
    private varySentenceStructure;
    /**
     * 添加口语化表达
     */
    private addColloquialism;
    /**
     * 增强情感
     */
    private enhanceEmotion;
    /**
     * 添加人为不完美
     */
    private addImperfection;
    /**
     * 分析文本风格
     */
    analyzeStyle(text: string): StyleAnalysis;
    private calculateVariance;
    private calculateVocabularyRichness;
    private calculateTransitionWordFrequency;
    private calculateEmotionalWordDensity;
    private analyzeParagraphStructure;
    private extractDialoguePatterns;
    private calculateRepetitionRate;
}
export default AntiDetectionEngine;
//# sourceMappingURL=AntiDetectionEngine.d.ts.map