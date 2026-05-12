/**
 * Cloud Book - 完整模块审查报告
 * 2026年5月12日 21:00
 */
interface ModuleStatus {
    name: string;
    path: string;
    files: string[];
    hasIndex: boolean;
    hasType: boolean;
    lineCount: number;
    requiresLLM: boolean;
    status: '完整' | '部分' | '空目录' | '重复';
    notes: string;
}
export declare function analyzeModules(): ModuleStatus[];
export declare const MODULE_REVIEW_RESULT: {
    summary: {
        totalModules: number;
        completeModules: number;
        partialModules: number;
        emptyModules: number;
        requiresLLM: number;
        offlineCapable: number;
    };
    completeModules: {
        name: string;
        lines: number;
        llmRequired: boolean;
        features: string[];
    }[];
    partialModules: {
        name: string;
        lines: number;
        status: string;
    }[];
    completedFeatures: string[];
    pendingFeatures: string[];
    offlineCapableFeatures: string[];
};
export default MODULE_REVIEW_RESULT;
//# sourceMappingURL=module-review.d.ts.map