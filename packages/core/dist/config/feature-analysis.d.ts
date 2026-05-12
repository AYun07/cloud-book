/**
 * Cloud Book - 功能LLM需求分析
 * 2026年5月12日 21:00
 * 明确哪些功能需要大模型，哪些不需要
 */
export interface FeatureAnalysis {
    name: string;
    requiresLLM: boolean;
    llmTask?: string;
    recommendedModel?: string;
    reason: string;
    fallbackMode?: string;
}
export declare const FEATURE_LLM_REQUIREMENTS: FeatureAnalysis[];
export declare function getLLMRequiredFeatures(): FeatureAnalysis[];
export declare function getNonLLMFeatures(): FeatureAnalysis[];
export declare function getFeaturesByTask(task: string): FeatureAnalysis[];
export declare const LLM_USAGE_SUMMARY: {
    totalFeatures: number;
    llmRequired: number;
    nonLLM: number;
    llmPercentage: number;
};
//# sourceMappingURL=feature-analysis.d.ts.map