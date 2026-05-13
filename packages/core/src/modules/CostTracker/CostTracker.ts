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

declare const localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

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

export class CostTracker {
  private records: CostRecord[] = [];
  private budgets: CostBudget = {};
  private costPerToken: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'deepseek-chat': { input: 0.0001, output: 0.0001 },
    'deepseek-coder': { input: 0.0001, output: 0.0001 },
  };
  private listeners: Map<CostEventType, Set<CostEventCallback>> = new Map();

  constructor(budgets?: CostBudget) {
    this.budgets = budgets || {};
    this.loadRecords();
  }

  setBudgets(budgets: CostBudget): void {
    this.budgets = budgets;
  }

  setBudget(budget: CostBudget): void {
    this.budgets = budget;
    this.emit('budgetChanged', budget);
  }

  getBudget(): CostBudget | null {
    return Object.keys(this.budgets).length > 0 ? this.budgets : null;
  }

  record(record: CostRecord): void {
    this.records.push(record);
    this.saveRecords();
  }

  setModelCost(model: string, inputCost: number, outputCost: number): void {
    this.costPerToken[model] = { input: inputCost, output: outputCost };
  }

  on(event: CostEventType, callback: CostEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: CostEventType, callback: CostEventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: CostEventType, data: CostRecord | CostAlert | CostBudget): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data);
        } catch (e) {
          console.error(`Error in cost event listener for ${event}:`, e);
        }
      }
    }
  }

  async recordCost(
    model: string,
    provider: string,
    inputTokens: number,
    outputTokens: number,
    operation: string,
    projectId?: string,
    chapterId?: string
  ): Promise<CostRecord> {
    const modelCosts = this.costPerToken[model] || { input: 0.001, output: 0.002 };
    const inputCost = (inputTokens / 1000) * modelCosts.input;
    const outputCost = (outputTokens / 1000) * modelCosts.output;
    const totalCost = inputCost + outputCost;

    const record: CostRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      model,
      provider,
      inputTokens,
      outputTokens,
      cost: totalCost,
      operation,
      projectId,
      chapterId
    };

    this.records.push(record);
    this.saveRecords();
    this.emit('costRecorded', record);

    const alerts = this.checkAlerts();
    if (alerts.length > 0) {
      console.warn('Cost alert:', alerts);
      this.emit('alert', alerts[0]);
    }

    return record;
  }

  getStats(
    startDate?: Date,
    endDate?: Date,
    projectId?: string
  ): CostStats {
    let filtered = this.records;

    if (startDate) {
      filtered = filtered.filter(r => r.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.timestamp <= endDate);
    }
    if (projectId) {
      filtered = filtered.filter(r => r.projectId === projectId);
    }

    const totalCost = filtered.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = filtered.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
    const averageCostPer1kTokens = totalTokens > 0 ? (totalCost / totalTokens) * 1000 : 0;

    const costByModel: Record<string, number> = {};
    const costByDay: Record<string, number> = {};
    const costByOperation: Record<string, number> = {};

    for (const record of filtered) {
      costByModel[record.model] = (costByModel[record.model] || 0) + record.cost;

      const dayKey = record.timestamp.toISOString().split('T')[0];
      costByDay[dayKey] = (costByDay[dayKey] || 0) + record.cost;

      costByOperation[record.operation] = (costByOperation[record.operation] || 0) + record.cost;
    }

    return {
      totalCost,
      totalTokens,
      averageCostPer1kTokens,
      costByModel,
      costByDay,
      costByOperation
    };
  }

  checkAlerts(): CostAlert[] {
    const alerts: CostAlert[] = [];
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCost = this.getCostSince(todayStart);
    const weekCost = this.getCostSince(weekStart);
    const monthCost = this.getCostSince(monthStart);
    const totalCost = this.getTotalCost();

    if (this.budgets.daily && todayCost > 0) {
      const percentage = (todayCost / this.budgets.daily) * 100;
      if (percentage >= 80) {
        alerts.push({
          threshold: this.budgets.daily,
          current: todayCost,
          percentage,
          type: 'daily'
        });
      }
    }

    if (this.budgets.weekly && weekCost > 0) {
      const percentage = (weekCost / this.budgets.weekly) * 100;
      if (percentage >= 80) {
        alerts.push({
          threshold: this.budgets.weekly,
          current: weekCost,
          percentage,
          type: 'weekly'
        });
      }
    }

    if (this.budgets.monthly && monthCost > 0) {
      const percentage = (monthCost / this.budgets.monthly) * 100;
      if (percentage >= 80) {
        alerts.push({
          threshold: this.budgets.monthly,
          current: monthCost,
          percentage,
          type: 'monthly'
        });
      }
    }

    if (this.budgets.total && totalCost > 0) {
      const percentage = (totalCost / this.budgets.total) * 100;
      if (percentage >= 80) {
        alerts.push({
          threshold: this.budgets.total,
          current: totalCost,
          percentage,
          type: 'total'
        });
      }
    }

    return alerts;
  }

  private getCostSince(date: Date): number {
    return this.records
      .filter(r => r.timestamp >= date)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  private getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }

  getRecords(
    limit?: number,
    offset?: number,
    filters?: {
      projectId?: string;
      model?: string;
      operation?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): { records: CostRecord[]; total: number } {
    let filtered = [...this.records];

    if (filters) {
      if (filters.projectId) {
        filtered = filtered.filter(r => r.projectId === filters.projectId);
      }
      if (filters.model) {
        filtered = filtered.filter(r => r.model === filters.model);
      }
      if (filters.operation) {
        filtered = filtered.filter(r => r.operation === filters.operation);
      }
      if (filters.startDate) {
        filtered = filtered.filter(r => r.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(r => r.timestamp <= filters.endDate!);
      }
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;
    const start = offset || 0;
    const end = limit ? start + limit : total;

    return {
      records: filtered.slice(start, end),
      total
    };
  }

  exportRecords(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        budgets: this.budgets,
        records: this.records
      }, null, 2);
    }

    const headers = ['id', 'timestamp', 'model', 'provider', 'inputTokens', 'outputTokens', 'cost', 'operation', 'projectId', 'chapterId'];
    const rows = this.records.map(r => [
      r.id,
      r.timestamp.toISOString(),
      r.model,
      r.provider,
      r.inputTokens.toString(),
      r.outputTokens.toString(),
      r.cost.toFixed(6),
      r.operation,
      r.projectId || '',
      r.chapterId || ''
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  clearRecords(olderThan?: Date): void {
    if (olderThan) {
      this.records = this.records.filter(r => r.timestamp >= olderThan);
    } else {
      this.records = [];
    }
    this.saveRecords();
  }

  private saveRecords(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cloudbook_cost_records', JSON.stringify(this.records));
      }
    } catch {}
  }

  private loadRecords(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('cloudbook_cost_records');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.records = parsed.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp)
          }));
        }
      }
    } catch {
      this.records = [];
    }
  }

  private generateId(): string {
    return `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  estimateCost(
    model: string,
    estimatedInputTokens: number,
    estimatedOutputTokens: number
  ): number {
    const modelCosts = this.costPerToken[model] || { input: 0.001, output: 0.002 };
    const inputCost = (estimatedInputTokens / 1000) * modelCosts.input;
    const outputCost = (estimatedOutputTokens / 1000) * modelCosts.output;
    return inputCost + outputCost;
  }

  predictMonthlyCost(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthCost = this.getCostSince(monthStart);

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const dailyAvg = daysPassed > 0 ? monthCost / daysPassed : 0;

    return dailyAvg * daysInMonth;
  }
}

export default CostTracker;
