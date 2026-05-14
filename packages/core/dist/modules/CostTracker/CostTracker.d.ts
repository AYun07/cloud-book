/**
 * 费用追踪器
 * 追踪API调用成本，支持预算控制和成本预测
 *
 * 功能：
 * - 记录API调用成本
 * - 支持日/周/月/总预算控制
 * - 预算告警（达到80%阈值时触发）
 * - 基于事件机制支持实时推送
 * - 成本统计和预测
 */
export interface CostRecord {
    id: string;
    timestamp: Date;
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    operation: string;
    projectId?: string;
    chapterId?: string;
}
export interface CostBudget {
    daily?: number;
    weekly?: number;
    monthly?: number;
    total?: number;
}
export interface CostStats {
    totalCost: number;
    totalTokens: number;
    averageCostPer1kTokens: number;
    costByModel: Record<string, number>;
    costByDay: Record<string, number>;
    costByOperation: Record<string, number>;
}
export interface CostAlert {
    threshold: number;
    current: number;
    percentage: number;
    type: 'daily' | 'weekly' | 'monthly' | 'total';
}
type CostEventType = 'costRecorded' | 'alert' | 'budgetChanged';
type CostEventCallback = (data: CostRecord | CostAlert | CostBudget) => void;
export declare class CostTracker {
    private records;
    private budgets;
    private costPerToken;
    private listeners;
    constructor(budgets?: CostBudget);
    setBudgets(budgets: CostBudget): void;
    setBudget(budget: CostBudget): void;
    getBudget(): CostBudget | null;
    record(record: CostRecord): void;
    setModelCost(model: string, inputCost: number, outputCost: number): void;
    on(event: CostEventType, callback: CostEventCallback): void;
    off(event: CostEventType, callback: CostEventCallback): void;
    private emit;
    recordCost(model: string, provider: string, inputTokens: number, outputTokens: number, operation: string, projectId?: string, chapterId?: string): Promise<CostRecord>;
    getStats(startDate?: Date, endDate?: Date, projectId?: string): CostStats;
    checkAlerts(): CostAlert[];
    private getCostSince;
    private getTotalCost;
    getRecords(limit?: number, offset?: number, filters?: {
        projectId?: string;
        model?: string;
        operation?: string;
        startDate?: Date;
        endDate?: Date;
    }): {
        records: CostRecord[];
        total: number;
    };
    exportRecords(format?: 'json' | 'csv'): string;
    clearRecords(olderThan?: Date): void;
    private saveRecords;
    private loadRecords;
    private generateId;
    estimateCost(model: string, estimatedInputTokens: number, estimatedOutputTokens: number): number;
    predictMonthlyCost(): number;
}
export default CostTracker;
//# sourceMappingURL=CostTracker.d.ts.map