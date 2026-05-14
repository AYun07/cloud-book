"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostTracker = void 0;
class CostTracker {
    records = [];
    budgets = {};
    costPerToken = {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 },
        'deepseek-chat': { input: 0.0001, output: 0.0001 },
        'deepseek-coder': { input: 0.0001, output: 0.0001 },
    };
    listeners = new Map();
    constructor(budgets) {
        this.budgets = budgets || {};
        this.loadRecords();
    }
    setBudgets(budgets) {
        this.budgets = budgets;
    }
    setBudget(budget) {
        this.budgets = budget;
        this.emit('budgetChanged', budget);
    }
    getBudget() {
        return Object.keys(this.budgets).length > 0 ? this.budgets : null;
    }
    record(record) {
        this.records.push(record);
        this.saveRecords();
    }
    setModelCost(model, inputCost, outputCost) {
        this.costPerToken[model] = { input: inputCost, output: outputCost };
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    off(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }
    emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            for (const listener of eventListeners) {
                try {
                    listener(data);
                }
                catch (e) {
                    console.error(`Error in cost event listener for ${event}:`, e);
                }
            }
        }
    }
    async recordCost(model, provider, inputTokens, outputTokens, operation, projectId, chapterId) {
        const modelCosts = this.costPerToken[model] || { input: 0.001, output: 0.002 };
        const inputCost = (inputTokens / 1000) * modelCosts.input;
        const outputCost = (outputTokens / 1000) * modelCosts.output;
        const totalCost = inputCost + outputCost;
        const record = {
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
    getStats(startDate, endDate, projectId) {
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
        const costByModel = {};
        const costByDay = {};
        const costByOperation = {};
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
    checkAlerts() {
        const alerts = [];
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
    getCostSince(date) {
        return this.records
            .filter(r => r.timestamp >= date)
            .reduce((sum, r) => sum + r.cost, 0);
    }
    getTotalCost() {
        return this.records.reduce((sum, r) => sum + r.cost, 0);
    }
    getRecords(limit, offset, filters) {
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
                filtered = filtered.filter(r => r.timestamp >= filters.startDate);
            }
            if (filters.endDate) {
                filtered = filtered.filter(r => r.timestamp <= filters.endDate);
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
    exportRecords(format = 'json') {
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
    clearRecords(olderThan) {
        if (olderThan) {
            this.records = this.records.filter(r => r.timestamp >= olderThan);
        }
        else {
            this.records = [];
        }
        this.saveRecords();
    }
    saveRecords() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('cloudbook_cost_records', JSON.stringify(this.records));
            }
        }
        catch { }
    }
    loadRecords() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('cloudbook_cost_records');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.records = parsed.map((r) => ({
                        ...r,
                        timestamp: new Date(r.timestamp)
                    }));
                }
            }
        }
        catch {
            this.records = [];
        }
    }
    generateId() {
        return `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    estimateCost(model, estimatedInputTokens, estimatedOutputTokens) {
        const modelCosts = this.costPerToken[model] || { input: 0.001, output: 0.002 };
        const inputCost = (estimatedInputTokens / 1000) * modelCosts.input;
        const outputCost = (estimatedOutputTokens / 1000) * modelCosts.output;
        return inputCost + outputCost;
    }
    predictMonthlyCost() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthCost = this.getCostSince(monthStart);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();
        const dailyAvg = daysPassed > 0 ? monthCost / daysPassed : 0;
        return dailyAvg * daysInMonth;
    }
}
exports.CostTracker = CostTracker;
exports.default = CostTracker;
//# sourceMappingURL=CostTracker.js.map