/**
 * Cloud Book - AI 审计引擎
 * 多维度内容质量检查
 */
import { AuditConfig, AuditResult, TruthFiles } from '../../types';
export interface AIAuditEngineConfig extends AuditConfig {
    dimensions: string[];
    threshold: number;
    autoFix: boolean;
    maxIterations: number;
}
export declare class AIAuditEngine {
    private config;
    private llmProvider;
    constructor(config?: Partial<AIAuditEngineConfig>);
    /**
     * 设置 LLM 提供者
     */
    setLLMProvider(provider: any): void;
    /**
     * 审计内容
     */
    audit(content: string, truthFiles: TruthFiles): Promise<AuditResult>;
    /**
     * 检查单个维度
     */
    private checkDimension;
    /**
     * 角色一致性检查
     */
    private checkCharacterConsistency;
    /**
     * 世界观一致性检查
     */
    private checkWorldConsistency;
    /**
     * 时间线一致性检查
     */
    private checkTimelineConsistency;
    /**
     * 情节逻辑检查
     */
    private checkPlotLogic;
    /**
     * 伏笔回收检查
     */
    private checkForeshadowFulfillment;
    /**
     * 资源追踪检查
     */
    private checkResourceTracking;
    /**
     * 情感弧线检查
     */
    private checkEmotionalArc;
    /**
     * 叙事节奏检查
     */
    private checkNarrativePacing;
    /**
     * AI 痕迹检测
     */
    private checkAIDetection;
    /**
     * 重复性检查
     */
    private checkRepetitiveness;
    /**
     * 能力一致性检查（修仙等）
     */
    private checkPowerConsistency;
    /**
     * 统计词频
     */
    private countOccurrences;
    /**
     * 获取角色别名
     */
    private getAliases;
}
export default AIAuditEngine;
//# sourceMappingURL=AIAuditEngine.d.ts.map