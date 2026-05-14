/**
 * Cloud Book - 云端+本地混合模式LLM管理器
 * 2026年5月14日
 * 深度优化版：支持云端和本地模型混合使用，解决高配置硬件问题
 */

import { LLMConfig, ModelRoute } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { CostTracker } from '../CostTracker/CostTracker';

export type ExecutionMode = 'cloud' | 'local' | 'hybrid';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskType = 'planning' | 'writing' | 'revision' | 'audit' | 'style' | 'analysis' | 'embedding';

export interface HybridConfig {
  defaultMode: ExecutionMode;
  cloudFirst: boolean;
  autoFallback: boolean;
  maxRetries: number;
  timeoutCloud: number;
  timeoutLocal: number;
  enableCostOptimization: boolean;
  maxCostPerSession?: number;
  localModelPriority?: string[];
  cloudModelPriority?: string[];
  fallbackChain: ExecutionMode[];
}

export interface ModelEndpoint {
  type: ExecutionMode;
  provider: string;
  model: string;
  baseURL?: string;
  apiKey?: string;
  isAvailable: boolean;
  latency?: number;
  costPerToken?: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsEmbedding: boolean;
  priority: number;
}

export interface TaskRequest {
  type: TaskType;
  prompt: string;
  priority: TaskPriority;
  options?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
  preferredMode?: ExecutionMode;
  maxCost?: number;
}

export interface TaskResult {
  success: boolean;
  text?: string;
  mode: ExecutionMode;
  model: string;
  latency: number;
  cost?: number;
  tokens?: number;
  error?: string;
  fallbackUsed: boolean;
}

export interface ResourceStats {
  mode: ExecutionMode;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  successRate: number;
}

export interface HybridStatus {
  mode: ExecutionMode;
  availableEndpoints: ModelEndpoint[];
  currentLoad: {
    cloud: number;
    local: number;
  };
  costs: {
    session: number;
    total: number;
    budget?: number;
  };
  stats: {
    cloud: ResourceStats;
    local: ResourceStats;
  };
}

export type HybridEventType = 
  | 'mode_switch'
  | 'endpoint_failure'
  | 'endpoint_recovery'
  | 'cost_threshold'
  | 'task_complete'
  | 'fallback_triggered';

export type HybridEventCallback = (event: {
  type: HybridEventType;
  timestamp: Date;
  data: any;
}) => void;

export class HybridLLMManager {
  private llmManager: LLMManager;
  private costTracker?: CostTracker;
  private config: HybridConfig;
  private currentMode: ExecutionMode = 'hybrid';
  private endpoints: Map<string, ModelEndpoint> = new Map();
  private listeners: Set<HybridEventCallback> = new Set();
  private stats: {
    cloud: ResourceStats;
    local: ResourceStats;
  };
  private sessionCost: number = 0;
  private requestQueue: TaskRequest[] = [];
  private processingQueue: boolean = false;

  constructor(config: Partial<HybridConfig> = {}) {
    this.llmManager = new LLMManager();
    this.config = this.getDefaultConfig(config);

    this.stats = {
      cloud: this.initResourceStats('cloud'),
      local: this.initResourceStats('local')
    };
  }

  private getDefaultConfig(partial?: Partial<HybridConfig>): HybridConfig {
    return {
      defaultMode: partial?.defaultMode || 'hybrid',
      cloudFirst: partial?.cloudFirst ?? true,
      autoFallback: partial?.autoFallback ?? true,
      maxRetries: partial?.maxRetries ?? 3,
      timeoutCloud: partial?.timeoutCloud || 60000,
      timeoutLocal: partial?.timeoutLocal || 120000,
      enableCostOptimization: partial?.enableCostOptimization ?? true,
      maxCostPerSession: partial?.maxCostPerSession,
      localModelPriority: partial?.localModelPriority || ['llama3', 'mistral', 'qwen', 'deepseek-coder'],
      cloudModelPriority: partial?.cloudModelPriority || ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      fallbackChain: partial?.fallbackChain || ['cloud', 'local']
    };
  }

  private initResourceStats(mode: ExecutionMode): ResourceStats {
    return {
      mode,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      successRate: 0
    };
  }

  setCostTracker(tracker: CostTracker): void {
    this.costTracker = tracker;
    this.llmManager.setCostTracker(tracker);
  }

  addConfig(config: LLMConfig): void {
    this.llmManager.addConfig(config);
    const endpoint: ModelEndpoint = {
      type: this.isLocalProvider(config.provider) ? 'local' : 'cloud',
      provider: config.provider,
      model: config.model,
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      isAvailable: true,
      maxTokens: config.maxTokens || 4096,
      supportsStreaming: true,
      supportsEmbedding: false,
      priority: 1
    };

    const key = `${endpoint.type}:${endpoint.provider}:${endpoint.model}`;
    this.endpoints.set(key, endpoint);
    this.emitEvent('mode_switch', { endpoint: key, added: true });
  }

  removeConfig(provider: string, model: string): void {
    const key = `cloud:${provider}:${model}`;
    if (this.endpoints.has(key)) {
      this.endpoints.delete(key);
      this.emitEvent('mode_switch', { endpoint: key, removed: true });
    }

    const localKey = `local:${provider}:${model}`;
    if (this.endpoints.has(localKey)) {
      this.endpoints.delete(localKey);
      this.emitEvent('mode_switch', { endpoint: localKey, removed: true });
    }
  }

  private isLocalProvider(provider: string): boolean {
    const localProviders = ['ollama', 'koboldcpp', 'lmstudio', 'localai', 'textgen', 'oobabooga'];
    return localProviders.includes(provider.toLowerCase());
  }

  setMode(mode: ExecutionMode): void {
    this.currentMode = mode;
    this.emitEvent('mode_switch', { previousMode: this.currentMode, newMode: mode });
  }

  getMode(): ExecutionMode {
    return this.currentMode;
  }

  private selectEndpoint(task: TaskRequest): ModelEndpoint | null {
    const availableEndpoints = Array.from(this.endpoints.values())
      .filter(e => e.isAvailable);

    if (availableEndpoints.length === 0) {
      return null;
    }

    if (task.preferredMode) {
      const preferred = availableEndpoints.find(e => e.type === task.preferredMode);
      if (preferred) {
        return preferred;
      }
    }

    if (this.currentMode === 'cloud') {
      const cloudEndpoints = availableEndpoints.filter(e => e.type === 'cloud');
      if (cloudEndpoints.length > 0) {
        return this.selectBestEndpoint(cloudEndpoints, task);
      }
    } else if (this.currentMode === 'local') {
      const localEndpoints = availableEndpoints.filter(e => e.type === 'local');
      if (localEndpoints.length > 0) {
        return this.selectBestEndpoint(localEndpoints, task);
      }
    }

    return this.selectBestEndpoint(availableEndpoints, task);
  }

  private selectBestEndpoint(endpoints: ModelEndpoint[], task: TaskRequest): ModelEndpoint {
    let selected = endpoints[0];

    const priorityScore = (e: ModelEndpoint): number => {
      let score = e.priority * 10;

      if (task.type === 'embedding' && e.supportsEmbedding) {
        score += 100;
      }
      if (task.options?.stream && e.supportsStreaming) {
        score += 50;
      }
      if (task.options?.maxTokens && e.maxTokens >= task.options.maxTokens) {
        score += 30;
      }
      if (e.costPerToken !== undefined && this.config.enableCostOptimization) {
        score -= e.costPerToken * 1000;
      }
      if (e.latency !== undefined) {
        score -= e.latency / 10;
      }

      return score;
    };

    for (const endpoint of endpoints) {
      if (priorityScore(endpoint) > priorityScore(selected)) {
        selected = endpoint;
      }
    }

    return selected;
  }

  async execute(task: TaskRequest): Promise<TaskResult> {
    const startTime = Date.now();

    if (this.config.maxCostPerSession && this.sessionCost >= this.config.maxCostPerSession) {
      this.emitEvent('cost_threshold', { currentCost: this.sessionCost, limit: this.config.maxCostPerSession });

      if (this.config.autoFallback) {
        const localEndpoint = this.selectLocalEndpoint();
        if (localEndpoint) {
          return this.executeOnEndpoint(localEndpoint, task, startTime, true);
        }
      }
    }

    const endpoint = this.selectEndpoint(task);
    if (!endpoint) {
      return {
        success: false,
        mode: 'cloud',
        model: '',
        latency: Date.now() - startTime,
        error: 'No available endpoints',
        fallbackUsed: false
      };
    }

    return this.executeOnEndpoint(endpoint, task, startTime, false);
  }

  private selectLocalEndpoint(): ModelEndpoint | null {
    const localEndpoints = Array.from(this.endpoints.values())
      .filter(e => e.type === 'local' && e.isAvailable);

    if (localEndpoints.length === 0) {
      return null;
    }

    return localEndpoints.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }

  private async executeOnEndpoint(
    endpoint: ModelEndpoint,
    task: TaskRequest,
    startTime: number,
    fallbackUsed: boolean
  ): Promise<TaskResult> {
    const timeout = endpoint.type === 'cloud' ? this.config.timeoutCloud : this.config.timeoutLocal;

    try {
      const result = await Promise.race([
        this.callEndpoint(endpoint, task),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      const latency = Date.now() - startTime;
      this.updateStats(endpoint.type, true, latency, result.tokens || 0, result.cost);

      if (result.cost && this.costTracker) {
        this.sessionCost += result.cost;
      }

      return {
        success: true,
        text: result.text,
        mode: endpoint.type,
        model: endpoint.model,
        latency,
        cost: result.cost,
        tokens: result.tokens,
        fallbackUsed
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.updateStats(endpoint.type, false, latency, 0, 0);

      endpoint.isAvailable = false;
      this.emitEvent('endpoint_failure', { endpoint: `${endpoint.type}:${endpoint.model}`, error: error.message });

      if (this.config.autoFallback && this.config.fallbackChain.length > 0) {
        const fallbackMode = this.config.fallbackChain.find(m => m !== endpoint.type);
        if (fallbackMode) {
          const fallbackEndpoint = fallbackMode === 'local'
            ? this.selectLocalEndpoint()
            : this.selectCloudEndpoint();

          if (fallbackEndpoint) {
            this.emitEvent('fallback_triggered', {
              from: endpoint.type,
              to: fallbackEndpoint.type
            });
            return this.executeOnEndpoint(fallbackEndpoint, task, startTime, true);
          }
        }
      }

      return {
        success: false,
        mode: endpoint.type,
        model: endpoint.model,
        latency,
        error: error.message,
        fallbackUsed
      };
    }
  }

  private selectCloudEndpoint(): ModelEndpoint | null {
    const cloudEndpoints = Array.from(this.endpoints.values())
      .filter(e => e.type === 'cloud' && e.isAvailable);

    if (cloudEndpoints.length === 0) {
      return null;
    }

    return cloudEndpoints.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }

  private async callEndpoint(
    endpoint: ModelEndpoint,
    task: TaskRequest
  ): Promise<{ text: string; tokens?: number; cost?: number }> {
    const config: LLMConfig = {
      provider: endpoint.provider as any,
      name: endpoint.model,
      model: endpoint.model,
      baseURL: endpoint.baseURL,
      apiKey: endpoint.apiKey
    };

    this.llmManager.addConfig(config);

    const response = await this.llmManager.generate(task.prompt, {
      model: endpoint.model,
      maxTokens: task.options?.maxTokens || 2048,
      temperature: task.options?.temperature || 0.7,
      stream: task.options?.stream || false
    });

    const tokens = (response.usage?.promptTokens || 0) + (response.usage?.completionTokens || 0);
    let cost: number | undefined;

    if (endpoint.costPerToken !== undefined) {
      cost = tokens * endpoint.costPerToken;
    }

    return {
      text: response.text,
      tokens,
      cost
    };
  }

  private updateStats(mode: ExecutionMode, success: boolean, latency: number, tokens: number, cost: number): void {
    const stats = mode === 'cloud' ? this.stats.cloud : this.stats.local;

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    stats.totalTokens += tokens;
    stats.totalCost += cost;
    stats.averageLatency = (stats.averageLatency * (stats.totalRequests - 1) + latency) / stats.totalRequests;
    stats.successRate = stats.successfulRequests / stats.totalRequests;
  }

  getStatus(): HybridStatus {
    return {
      mode: this.currentMode,
      availableEndpoints: Array.from(this.endpoints.values()),
      currentLoad: {
        cloud: this.stats.cloud.totalRequests,
        local: this.stats.local.totalRequests
      },
      costs: {
        session: this.sessionCost,
        total: this.stats.cloud.totalCost + this.stats.local.totalCost,
        budget: this.config.maxCostPerSession
      },
      stats: this.stats
    };
  }

  resetSessionCost(): void {
    this.sessionCost = 0;
  }

  getSessionCost(): number {
    return this.sessionCost;
  }

  async checkEndpointHealth(endpoint: ModelEndpoint): Promise<boolean> {
    try {
      const testConfig: LLMConfig = {
        provider: endpoint.provider as any,
        name: endpoint.model,
        model: endpoint.model,
        baseURL: endpoint.baseURL,
        apiKey: endpoint.apiKey
      };

      this.llmManager.addConfig(testConfig);
      await this.llmManager.generate('test', { model: endpoint.model, maxTokens: 1 });

      endpoint.isAvailable = true;
      this.emitEvent('endpoint_recovery', { endpoint: `${endpoint.type}:${endpoint.model}` });
      return true;
    } catch {
      endpoint.isAvailable = false;
      return false;
    }
  }

  onEvent(callback: HybridEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emitEvent(type: HybridEventType, data: any): void {
    const event = {
      type,
      timestamp: new Date(),
      data
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[HybridLLMManager] Event listener error:', error);
      }
    }
  }

  getEndpoints(): ModelEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  setEndpointAvailability(key: string, available: boolean): void {
    const endpoint = this.endpoints.get(key);
    if (endpoint) {
      endpoint.isAvailable = available;
    }
  }

  getStats(): { cloud: ResourceStats; local: ResourceStats } {
    return this.stats;
  }
}

export default HybridLLMManager;
