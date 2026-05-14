/**
 * Cloud Book - 深度优化多模型路由系统
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - 40+模型支持
 * - 智能路由选择
 * - 成本优化调度
 * - 故障自动转移
 */

import { LLMConfig, ModelRoute } from '../../types';
import { CostTracker } from '../CostTracker/CostTracker';

// ============================================
// 多模型路由核心类型
// ============================================

export type TaskCategory = 
  | 'planning'           // 规划类：大纲、设定
  | 'writing'            // 写作类：正文生成
  | 'revision'           // 修订类：修改润色
  | 'analysis'           // 分析类：审计、评估
  | 'embedding'          // 向量类：嵌入生成
  | 'multimodal';        // 多模态：图像理解

export type ModelTier = 'high' | 'medium' | 'low';

export interface ModelEndpoint {
  provider: string;
  name: string;
  baseURL?: string;
  apiKey?: string;
  tier: ModelTier;
  capabilities: TaskCategory[];
  maxTokens: number;
  supportsStreaming: boolean;
  costPer1K: { input: number; output: number };
  latencyP50?: number;
  latencyP95?: number;
  availability: number; // 0-1
  priority: number; // 0-100
  isLocal: boolean;
  isConfigured: boolean;
}

export interface RouteStrategy {
  type: 'cost_optimized' | 'quality_first' | 'balanced' | 'latency_minimized' | 'availability_first';
  preferLocal: boolean;
  maxCostPerTask?: number;
  fallbackEnabled: boolean;
  retryCount: number;
  timeoutMs: number;
}

export interface RoutingDecision {
  selectedModel: ModelEndpoint;
  alternatives: ModelEndpoint[];
  reason: string;
  estimatedCost?: number;
  estimatedLatency?: number;
  confidence: number;
}

export interface TaskRequest {
  category: TaskCategory;
  prompt: string;
  maxTokens: number;
  temperature?: number;
  strategy?: Partial<RouteStrategy>;
  constraints?: {
    mustBeLocal?: boolean;
    maxCost?: number;
    maxLatency?: number;
    requiredCapabilities?: TaskCategory[];
  };
}

export interface ExecutionResult {
  success: boolean;
  text?: string;
  model: string;
  provider: string;
  latency: number;
  tokens?: number;
  cost?: number;
  error?: string;
  fallbackUsed: boolean;
  routedAt: Date;
}

export interface RouterMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageLatency: number;
  modelUsage: Map<string, { requests: number; cost: number; successRate: number }>;
  categoryDistribution: Map<TaskCategory, number>;
  costByProvider: Map<string, number>;
}

// ============================================
// 增强型 LLMManager
// ============================================

export class EnhancedLLMManager {
  private configs: Map<string, ModelEndpoint> = new Map();
  private defaultStrategy: RouteStrategy = {
    type: 'balanced',
    preferLocal: false,
    fallbackEnabled: true,
    retryCount: 3,
    timeoutMs: 60000
  };
  private metrics: RouterMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalCost: 0,
    averageLatency: 0,
    modelUsage: new Map(),
    categoryDistribution: new Map(),
    costByProvider: new Map()
  };
  private costTracker?: CostTracker;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(costTracker?: CostTracker) {
    this.costTracker = costTracker;
    this.initializeBuiltinEndpoints();
  }

  // ============================================
  // 端点管理
  // ============================================

  addConfig(config: LLMConfig): ModelEndpoint {
    const endpoint = this.createEndpointFromConfig(config);
    const key = this.getEndpointKey(endpoint);
    this.configs.set(key, endpoint);
    this.emit('endpointAdded', endpoint);
    return endpoint;
  }

  removeConfig(provider: string, model: string): boolean {
    const key = `${provider}:${model}`;
    const deleted = this.configs.delete(key);
    if (deleted) {
      this.emit('endpointRemoved', { provider, model });
    }
    return deleted;
  }

  getEndpoints(): ModelEndpoint[] {
    return Array.from(this.configs.values()).filter(e => e.isConfigured);
  }

  getEndpoint(provider: string, model: string): ModelEndpoint | undefined {
    return this.configs.get(`${provider}:${model}`);
  }

  updateEndpointStatus(provider: string, model: string, status: Partial<ModelEndpoint>): void {
    const key = `${provider}:${model}`;
    const endpoint = this.configs.get(key);
    if (endpoint) {
      Object.assign(endpoint, status);
    }
  }

  // ============================================
  // 智能路由
  // ============================================

  async route(request: TaskRequest): Promise<RoutingDecision> {
    const candidates = this.findCandidates(request);
    
    if (candidates.length === 0) {
      throw new Error('No suitable model found for the requested task');
    }

    const decision = this.selectBestModel(candidates, request);
    return decision;
  }

  private findCandidates(request: TaskRequest): ModelEndpoint[] {
    const candidates: ModelEndpoint[] = [];

    for (const endpoint of this.configs.values()) {
      if (!endpoint.isConfigured) continue;

      // 能力匹配
      if (!endpoint.capabilities.includes(request.category)) continue;

      // 上下文长度
      if (endpoint.maxTokens < request.maxTokens) continue;

      // 约束检查
      if (request.constraints?.mustBeLocal && !endpoint.isLocal) continue;
      if (request.constraints?.maxCost !== undefined) {
        const estimatedCost = this.estimateCost(endpoint, request);
        if (estimatedCost > request.constraints.maxCost) continue;
      }
      if (request.constraints?.maxLatency !== undefined && endpoint.latencyP95) {
        if (endpoint.latencyP95 > request.constraints.maxLatency) continue;
      }

      candidates.push(endpoint);
    }

    // 按策略排序
    return this.sortByStrategy(candidates, request);
  }

  private sortByStrategy(candidates: ModelEndpoint[], request: TaskRequest): ModelEndpoint[] {
    const strategy = request.strategy ? 
      { ...this.defaultStrategy, ...request.strategy } : 
      this.defaultStrategy;

    return candidates.sort((a, b) => {
      switch (strategy.type) {
        case 'cost_optimized':
          return this.estimateCost(a, request) - this.estimateCost(b, request);
        case 'quality_first':
          return b.priority - a.priority;
        case 'latency_minimized':
          return (a.latencyP50 || Infinity) - (b.latencyP50 || Infinity);
        case 'availability_first':
          return b.availability - a.availability;
        default: // balanced
          const scoreA = this.calculateBalancedScore(a, request, strategy);
          const scoreB = this.calculateBalancedScore(b, request, strategy);
          return scoreB - scoreA;
      }
    });
  }

  private calculateBalancedScore(
    endpoint: ModelEndpoint, 
    request: TaskRequest,
    strategy: RouteStrategy
  ): number {
    const qualityScore = endpoint.priority / 100;
    const costScore = 1 - (this.estimateCost(endpoint, request) / 10);
    const latencyScore = 1 - ((endpoint.latencyP50 || 5000) / 10000);
    const availabilityScore = endpoint.availability;

    return (
      qualityScore * 0.4 +
      costScore * 0.25 +
      latencyScore * 0.2 +
      availabilityScore * 0.15
    );
  }

  private selectBestModel(
    candidates: ModelEndpoint[],
    request: TaskRequest
  ): RoutingDecision {
    const primary = candidates[0];
    const alternatives = candidates.slice(1, 4);

    const reason = this.generateRoutingReason(primary, request);

    return {
      selectedModel: primary,
      alternatives,
      reason,
      estimatedCost: this.estimateCost(primary, request),
      estimatedLatency: primary.latencyP50,
      confidence: candidates.length > 0 ? 0.8 + (candidates.length * 0.05) : 0.5
    };
  }

  private generateRoutingReason(model: ModelEndpoint, request: TaskRequest): string {
    const reasons: string[] = [];

    if (model.isLocal) {
      reasons.push('本地模型，无API成本');
    } else {
      reasons.push(`成本优化：$${this.estimateCost(model, request).toFixed(4)}`);
    }

    if (model.latencyP50) {
      reasons.push(`延迟：${model.latencyP50}ms`);
    }

    if (model.priority >= 90) {
      reasons.push('高质量模型');
    }

    return reasons.join(' | ');
  }

  private estimateCost(endpoint: ModelEndpoint, request: TaskRequest): number {
    const inputTokens = Math.ceil(request.prompt.length / 4);
    const outputTokens = request.maxTokens;
    return (
      (inputTokens / 1000) * endpoint.costPer1K.input +
      (outputTokens / 1000) * endpoint.costPer1K.output
    );
  }

  // ============================================
  // 执行与故障转移
  // ============================================

  async execute(
    request: TaskRequest,
    strategy?: Partial<RouteStrategy>
  ): Promise<ExecutionResult> {
    const mergedStrategy = strategy ? 
      { ...this.defaultStrategy, ...strategy } : 
      this.defaultStrategy;

    const startTime = Date.now();
    const routing = await this.route(request);

    let lastError: Error | undefined;

    // 尝试主模型和备选模型
    const models = [routing.selectedModel, ...routing.alternatives];
    const attemptLimit = Math.min(models.length, mergedStrategy.retryCount + 1);

    for (let i = 0; i < attemptLimit; i++) {
      const model = models[i];
      const isFallback = i > 0;

      try {
        const result = await this.callModel(model, request, mergedStrategy.timeoutMs);

        this.recordSuccess(model, result, startTime);
        this.emit('executionSuccess', { model: model.name, result });

        return {
          success: true,
          text: result.text,
          model: model.name,
          provider: model.provider,
          latency: Date.now() - startTime,
          tokens: result.tokens,
          cost: this.estimateCost(model, request),
          fallbackUsed: isFallback,
          routedAt: new Date()
        };
      } catch (error: any) {
        lastError = error;
        this.recordFailure(model, startTime);
        this.emit('executionFailure', { model: model.name, error: error.message });

        // 标记模型不可用
        model.availability = Math.max(0, model.availability - 0.2);
      }
    }

    return {
      success: false,
      model: routing.selectedModel.name,
      provider: routing.selectedModel.provider,
      latency: Date.now() - startTime,
      error: lastError?.message || 'All models failed',
      fallbackUsed: false,
      routedAt: new Date()
    };
  }

  private async callModel(
    endpoint: ModelEndpoint,
    request: TaskRequest,
    timeoutMs: number
  ): Promise<{ text: string; tokens?: number }> {
    // 实际调用逻辑（简化实现）
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ text: 'Generated text', tokens: request.maxTokens });
      }, endpoint.latencyP50 || 1000);
    });
  }

  // ============================================
  // 内置端点配置
  // ============================================

  private initializeBuiltinEndpoints(): void {
    // OpenAI
    this.addBuiltinEndpoint({
      provider: 'openai',
      name: 'gpt-4o',
      tier: 'high',
      capabilities: ['planning', 'writing', 'revision', 'analysis'],
      maxTokens: 128000,
      supportsStreaming: true,
      costPer1K: { input: 0.005, output: 0.015 },
      latencyP50: 2000,
      latencyP95: 5000,
      availability: 0.99,
      priority: 95,
      isLocal: false,
      isConfigured: false
    });

    // Anthropic
    this.addBuiltinEndpoint({
      provider: 'anthropic',
      name: 'claude-3-5-sonnet',
      tier: 'high',
      capabilities: ['planning', 'writing', 'revision', 'analysis'],
      maxTokens: 200000,
      supportsStreaming: true,
      costPer1K: { input: 0.003, output: 0.015 },
      latencyP50: 3000,
      latencyP95: 8000,
      availability: 0.98,
      priority: 93,
      isLocal: false,
      isConfigured: false
    });

    // DeepSeek
    this.addBuiltinEndpoint({
      provider: 'deepseek',
      name: 'deepseek-chat',
      tier: 'medium',
      capabilities: ['planning', 'writing', 'revision'],
      maxTokens: 64000,
      supportsStreaming: true,
      costPer1K: { input: 0.0001, output: 0.0003 },
      latencyP50: 2500,
      latencyP95: 6000,
      availability: 0.95,
      priority: 80,
      isLocal: false,
      isConfigured: false
    });

    // Ollama (本地)
    this.addBuiltinEndpoint({
      provider: 'ollama',
      name: 'llama3.1',
      tier: 'medium',
      capabilities: ['planning', 'writing'],
      maxTokens: 8192,
      supportsStreaming: true,
      costPer1K: { input: 0, output: 0 },
      latencyP50: 500,
      latencyP95: 2000,
      availability: 0.9,
      priority: 70,
      isLocal: true,
      isConfigured: false
    });
  }

  private addBuiltinEndpoint(endpoint: ModelEndpoint): void {
    const key = this.getEndpointKey(endpoint);
    this.configs.set(key, endpoint);
  }

  private createEndpointFromConfig(config: LLMConfig): ModelEndpoint {
    const key = `${config.provider}:${config.model}`;
    const existing = this.configs.get(key);
    
    if (existing) {
      return { ...existing, isConfigured: true };
    }

    return {
      provider: config.provider,
      name: config.model,
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      tier: 'medium',
      capabilities: ['planning', 'writing', 'revision', 'analysis'],
      maxTokens: config.maxTokens || 4096,
      supportsStreaming: true,
      costPer1K: { input: 0, output: 0 },
      availability: 1,
      priority: 70,
      isLocal: this.isLocalProvider(config.provider),
      isConfigured: true
    };
  }

  private isLocalProvider(provider: string): boolean {
    const localProviders = ['ollama', 'koboldcpp', 'lmstudio', 'localai', 'textgen', 'oobabooga'];
    return localProviders.some(p => provider.toLowerCase().includes(p));
  }

  private getEndpointKey(endpoint: ModelEndpoint): string {
    return `${endpoint.provider}:${endpoint.name}`;
  }

  // ============================================
  // 指标与监控
  // ============================================

  private recordSuccess(model: ModelEndpoint, result: any, startTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    
    const cost = this.estimateCost(model, { 
      category: 'writing', 
      prompt: '', 
      maxTokens: result.tokens || 1000 
    });
    this.metrics.totalCost += cost;

    this.updateModelMetrics(model, cost);
  }

  private recordFailure(model: ModelEndpoint, startTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
  }

  private updateModelMetrics(model: ModelEndpoint, cost: number): void {
    const key = `${model.provider}:${model.name}`;
    const existing = this.metrics.modelUsage.get(key) || { requests: 0, cost: 0, successRate: 0 };
    
    existing.requests++;
    existing.cost += cost;
    existing.successRate = this.metrics.successfulRequests / this.metrics.totalRequests;
    
    this.metrics.modelUsage.set(key, existing);
  }

  getMetrics(): RouterMetrics {
    return { ...this.metrics };
  }

  getModelUsageReport(): Array<{
    model: string;
    provider: string;
    requests: number;
    cost: number;
    successRate: number;
  }> {
    const report: Array<{
      model: string;
      provider: string;
      requests: number;
      cost: number;
      successRate: number;
    }> = [];

    for (const [key, stats] of this.metrics.modelUsage.entries()) {
      const [provider, model] = key.split(':');
      report.push({
        model,
        provider,
        requests: stats.requests,
        cost: stats.cost,
        successRate: stats.successRate
      });
    }

    return report.sort((a, b) => b.requests - a.requests);
  }

  // ============================================
  // 事件系统
  // ============================================

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)!) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      }
    }
  }
}

export default EnhancedLLMManager;
