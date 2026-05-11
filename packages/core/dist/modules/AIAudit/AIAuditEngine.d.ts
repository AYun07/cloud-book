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
    /**
     * 对话质量检查
     */
    private checkDialogueQuality;
    /**
     * 描写密度检查
     */
    private checkDescriptionDensity;
    /**
     * 语法错误检查
     */
    private checkGrammaticalErrors;
    /**
     * 重复冗余检查
     */
    private checkTautology;
    /**
     * 逻辑漏洞检查
     */
    private checkLogicalGaps;
    /**
     * 发展节奏检查
     */
    private checkProgressionPacing;
    /**
     * 冲突升级检查
     */
    private checkConflictEscalation;
    /**
     * 角色动机检查
     */
    private checkCharacterMotivation;
    /**
     * 利害清晰度检查
     */
    private checkStakesClarity;
    /**
     * 感官细节检查
     */
    private checkSensoryDetails;
    /**
     * 背景故事融合检查
     */
    private checkBackstoryIntegration;
    /**
     * 视角一致性检查
     */
    private checkPOVConsistency;
    /**
     * 时态一致性检查
     */
    private checkTenseConsistency;
    /**
     * 节奏变化检查
     */
    private checkPacingVariation;
    /**
     * 展示vs叙述检查
     */
    private checkShowVsTell;
    /**
     * 潜文本/潜台词检查
     */
    private checkSubtext;
    /**
     * 象征意象/象征手法检查
     */
    private checkSymbolism;
    /**
     * 主题一致性检查
     */
    private checkThematicCoherence;
    /**
     * 读者参与度检查
     */
    private checkReaderEngagement;
    /**
     * 类型惯例检查
     */
    private checkGenreConvention;
    /**
     * 文化敏感性检查
     */
    private checkCulturalSensitivity;
    /**
     * 事实准确性检查
     */
    private checkFactualAccuracy;
}
export default AIAuditEngine;
//# sourceMappingURL=AIAuditEngine.d.ts.map