/**
 * Cloud Book - 多模型支持模块 V4
 * 支持所有主流大模型和本地部署
 * 新增：真实OpenAI Embedding API、缓存、流式处理、结构化日志
 */
import { LLMConfig, ModelRoute } from '../../types';
import { CostTracker } from '../CostTracker/CostTracker';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'gemini' | 'custom';
export type StreamingMode = 'true' | 'false' | 'auto';
export interface ModelInfo {
    name: string;
    provider: ModelProvider;
    streamingMode: StreamingMode;
    supportsEmbedding: boolean;
    maxTokens: number;
    description: string;
}
export declare const SUPPORTED_MODELS: ModelInfo[];
export interface LLMResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    finishReason?: string;
}
export interface GenerationOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    stream?: boolean;
    streamingMode?: StreamingMode;
}
export interface EmbeddingOptions {
    model?: string;
    dimensions?: number;
}
export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    usage?: {
        promptTokens: number;
        totalTokens: number;
    };
}
export interface LLMProvider {
    name: string;
    provider: ModelProvider;
    generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
    stream?(prompt: string, options: GenerationOptions & {
        stream: true;
    }, onChunk: (chunk: string) => void): Promise<void>;
    embed?(text: string, options?: EmbeddingOptions): Promise<EmbeddingResponse>;
}
interface LogEntry {
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    component: string;
    message: string;
    metadata?: Record<string, any>;
}
export declare class LLMManager {
    private providers;
    private routes;
    private defaultProvider?;
    private modelConfigs;
    private embeddingCache;
    private cacheTTL;
    private logs;
    private costTracker?;
    private costTrackingEnabled;
    constructor();
    setCostTracker(tracker: CostTracker): void;
    isCostTrackingEnabled(): boolean;
    private recordCost;
    private log;
    getLogs(): LogEntry[];
    clearLogs(): void;
    setCacheTTL(ttlMs: number): void;
    clearCache(): void;
    private getConfigForProvider;
    /**
     * 获取模型信息
     */
    getModelInfo(modelName: string): ModelInfo | undefined;
    /**
     * 获取所有支持的模型列表
     */
    listSupportedModels(): ModelInfo[];
    /**
     * 获取所有已配置的模型
     */
    listModels(): LLMConfig[];
    /**
     * 注册内置提供者
     */
    private registerBuiltinProviders;
    /**
     * 注册自定义提供者
     */
    registerProvider(provider: LLMProvider): void;
    /**
     * 添加模型配置
     */
    addModel(config: LLMConfig): void;
    /**
     * 根据模型配置调用API
     */
    private callModelAPI;
    /**
     * 流式调用模型API
     */
    private streamModelAPI;
    /**
     * 添加模型配置（addModel别名）
     */
    addConfig(config: LLMConfig): void;
    /**
     * 获取模型配置
     */
    getConfig(name: string): LLMConfig | undefined;
    /**
     * 生成文本
     */
    generate(prompt: string, modelName?: string, options?: GenerationOptions): Promise<LLMResponse>;
    /**
     * 补全文本
     */
    complete(prompt: string, options?: {
        task?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    /**
     * 流式生成
     */
    stream(prompt: string, modelName: string | undefined, options: GenerationOptions & {
        stream: true;
    }, onChunk: (chunk: string) => void): Promise<void>;
    /**
     * 流式生成（自动检测模型支持）
     */
    streamGenerate(prompt: string, modelName: string | undefined, options: GenerationOptions, onChunk: (chunk: string) => void): Promise<string>;
    /**
     * 生成Embeddings（支持真实API和回退模拟）
     */
    generateEmbedding(text: string, modelName?: string, options?: EmbeddingOptions): Promise<number[]>;
    /**
     * 批量生成Embeddings（并行优化）
     */
    generateEmbeddings(texts: string[], modelName?: string, options?: EmbeddingOptions): Promise<number[][]>;
    /**
     * 将文本转换为语义embedding向量（基于TF-IDF加权词向量 - 回退方案）
     */
    private textToEmbedding;
    /**
     * 计算词语重要性分数（结合词频、词长和停用词排除）
     */
    private calculateWordImportance;
    private tokenize;
    private calculateWordFrequency;
    private calculateIDF;
    private hashWord;
    /**
     * 计算余弦相似度
     */
    cosineSimilarity(a: number[], b: number[]): number;
    /**
     * 设置模型路由
     */
    setRoutes(routes: ModelRoute[]): void;
    /**
     * 根据任务类型路由
     */
    route(task: ModelRoute['task']): LLMConfig | undefined;
    /**
     * 设置默认模型
     */
    setDefault(modelName: string): void;
    /**
     * 调用 OpenAI Embedding API
     */
    private callOpenAIEmbeddingAPI;
    /**
     * 调用 OpenAI 兼容 API
     */
    private callOpenAICompatibleAPI;
    /**
     * 流式调用 OpenAI 兼容 API
     */
    private streamOpenAICompatibleAPI;
    /**
     * 调用 Gemini API
     */
    private callGeminiAPI;
    /**
     * 流式调用 Gemini API
     */
    private streamGeminiAPI;
    /**
     * 调用 Anthropic API
     */
    private callAnthropicAPI;
    /**
     * 调用 Ollama API
     */
    private callOllamaAPI;
    /**
     * 调用 KoboldCPP API
     */
    private callKoboldAPI;
}
export {};
//# sourceMappingURL=LLMManager.d.ts.map