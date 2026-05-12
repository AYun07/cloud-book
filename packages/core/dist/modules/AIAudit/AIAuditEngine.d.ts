/**
 * Cloud Book - AI 审计引擎 V2
 * 基于LLM的真正语义理解审计
 * 33维度全面质量评估
 */
import { AuditConfig, AuditResult, TruthFiles } from '../../types';
export interface LLMProvider {
    generate(prompt: string, options?: any): Promise<{
        text: string;
        usage?: any;
    }>;
    complete(prompt: string, options?: any): Promise<string>;
}
export interface AIAuditEngineConfig extends AuditConfig {
    dimensions: string[];
    threshold: number;
    autoFix: boolean;
    maxIterations: number;
    useSemanticAnalysis: boolean;
    modelName?: string;
}
export declare class AIAuditEngine {
    private config;
    private llmProvider;
    constructor(config?: Partial<AIAuditEngineConfig>);
    setLLMProvider(provider: LLMProvider): void;
    audit(content: string, truthFiles: TruthFiles, context?: {
        previousChapter?: string;
        chapterNumber?: number;
        genre?: string;
    }): Promise<AuditResult>;
    /**
     * 核心功能：使用LLM进行真正的语义审计
     */
    private performSemanticAudit;
    /**
     * 将33个维度分组，每组一起审计以减少API调用
     */
    private groupDimensions;
    /**
     * 构建语义审计提示词
     */
    private buildSemanticAuditPrompt;
    /**
     * 构建世界观上下文
     */
    private buildTruthContext;
    /**
     * 获取维度描述
     */
    private getDimensionDescriptions;
    /**
     * 解析LLM返回的语义审计结果
     */
    private parseSemanticResponse;
    /**
     * 基于规则的审计（当LLM不可用时）
     */
    private performRuleBasedAudit;
    private checkCharacterConsistencyRule;
    private checkRepetitivenessRule;
    private checkGrammaticalErrorsRule;
    private checkEmotionalArcRule;
    private checkDialogueQualityRule;
    private checkNarrativePacingRule;
    private determineSeverity;
    auditChapter(chapterId: string, content: string): Promise<AuditResult>;
    batchAudit(chapters: Array<{
        id: string;
        content: string;
    }>): Promise<Map<string, AuditResult>>;
    generateReport(result: AuditResult): string;
}
export default AIAuditEngine;
//# sourceMappingURL=AIAuditEngine.d.ts.map