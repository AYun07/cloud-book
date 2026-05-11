/**
 * 费用追踪器
 * 追踪API调用成本，控制预算
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
export declare class CostTracker {
    private records;
    private budgets;
    private costPerToken;
    constructor(budgets?: CostBudget);
    setBudgets(budgets: CostBudget): void;
    setModelCost(model: string, inputCost: number, outputCost: number): void;
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