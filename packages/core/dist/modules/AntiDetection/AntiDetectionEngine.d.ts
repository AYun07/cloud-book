/**
 * Cloud Book - 反AI检测与去AI味模块
 * 实现33+维度的AI痕迹检测和去AI味处理
 */
import { AntiDetectionConfig } from '../../types';
export interface DetectionResult {
    isAI: boolean;
    confidence: number;
    indicators: AIIndicator[];
    suggestions: string[];
    dimensionScores: Record<string, number>;
}
export interface AIIndicator {
    type: string;
    description: string;
    severity: number;
    location?: string;
    dimension: string;
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
    readabilityScore: number;
    coherenceScore: number;
}
export declare const DETECTION_DIMENSIONS: readonly ["vocabulary_uniformity", "sentence_length_variance", "paragraph_opening_pattern", "transition_word_frequency", "emotional_word_density", "personal_pronoun_usage", "contradiction_detection", "specificity_level", "idiom_usage", "punctuation_pattern", "narrative_perspective", "temporal_consistency", "detail_granularity", "rhetorical_devices", "character_voice_consistency", "world_knowledge_consistency", "plot_logic_consistency", "information_balance", "unnecessary_preambles", "formulaic_expressions", "superlative_usage", "hedging_frequency", "passive_voice_ratio", "complex_sentence_ratio", "list_structure_frequency", "topic_sentence_pattern", "definition_introduction", "summarization_frequency", "example_provision", "question_rhetorical", "emphasis_superfluous", "reference_clarity", "coherence_markers"];
export type DetectionDimension = typeof DETECTION_DIMENSIONS[number];
export declare class AntiDetectionEngine {
    private config;
    private aiWordList;
    private formulaicExpressions;
    private hedgeWords;
    private passivePatterns;
    private rhetoricalDevices;
    private emotionalWords;
    private personalPronouns;
    constructor(config?: Partial<AntiDetectionConfig>);
    detectAI(text: string): DetectionResult;
    private analyzeVocabularyUniformity;
    private analyzeSentenceLengthVariance;
    private analyzeParagraphOpeningPattern;
    private analyzeTransitionWordFrequency;
    private analyzeEmotionalWordDensity;
    private analyzePersonalPronounUsage;
    private analyzeContradictions;
    private analyzeSpecificityLevel;
    private analyzeIdiomUsage;
    private analyzePunctuationPattern;
    private analyzeNarrativePerspective;
    private analyzeTemporalConsistency;
    private analyzeDetailGranularity;
    private analyzeRhetoricalDevices;
    private analyzeCharacterVoiceConsistency;
    private analyzeWorldKnowledgeConsistency;
    private analyzePlotLogicConsistency;
    private analyzeInformationBalance;
    private analyzeUnnecessaryPreambles;
    private analyzeFormulaicExpressions;
    private analyzeSuperlativeUsage;
    private analyzeHedgingFrequency;
    private analyzePassiveVoiceRatio;
    private analyzeComplexSentenceRatio;
    private analyzeListStructureFrequency;
    private analyzeTopicSentencePattern;
    private analyzeDefinitionIntroduction;
    private analyzeSummarizationFrequency;
    private analyzeExampleProvision;
    private analyzeRhetoricalQuestions;
    private analyzeSuperfluousEmphasis;
    private analyzeReferenceClarity;
    private analyzeCoherenceMarkers;
    private getDimensionDescription;
    private detectAIWords;
    private detectSentencePatterns;
    private detectStructurePatterns;
    private detectEmotionPatterns;
    private generateSuggestions;
    humanize(text: string, llmProvider?: any): Promise<string>;
    private replaceAIWords;
    private varySentenceStructure;
    private addColloquialism;
    private enhanceEmotion;
    private addImperfection;
    analyzeStyle(text: string): StyleAnalysis;
    private calculateVariance;
    private calculateVocabularyRichness;
    private calculateTransitionWordFrequency;
    private calculateEmotionalWordDensity;
    private analyzeParagraphStructure;
    private extractDialoguePatterns;
    private calculateRepetitionRate;
    private calculateReadabilityScore;
    private calculateCoherenceScore;
}
export default AntiDetectionEngine;
//# sourceMappingURL=AntiDetectionEngine.d.ts.map