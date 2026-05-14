/**
 * Cloud Book - 多模型支持模块 V4
 * 支持所有主流大模型和本地部署
 * 新增：真实OpenAI Embedding API、缓存、流式处理、结构化日志
 */
import { LLMConfig, ModelRoute } from '../../types';
import { CostTracker } from '../CostTracker/CostTracker';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'gemini' | 'custom' | 'azure' | 'mistral' | 'cohere' | 'groq' | 'together' | 'fireworks' | 'perplexity' | 'cloudflare' | 'replicate' | 'huggingface' | 'voyage' | 'nomic' | 'baidu' | 'alibaba' | 'tencent' | 'bytedance' | 'huawei' | 'zhipu' | 'minimax' | 'doubao' | 'moonshot' | 'modal' | 'banana' | 'lambda' | 'modalabs' | 'falcon' | 'ai21' | 'stablelm' | 'mpt';
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
    /**
     * 调用 Mistral AI API
     */
    private callMistralAPI;
    /**
     * 流式调用 Mistral AI API
     */
    private streamMistralAPI;
    /**
     * 调用 Cohere API
     */
    private callCohereAPI;
    /**
     * 流式调用 Cohere API
     */
    private streamCohereAPI;
    /**
     * 调用 Cohere Embedding API
     */
    private callCohereEmbeddingAPI;
    /**
     * 调用 Groq API
     */
    private callGroqAPI;
    /**
     * 流式调用 Groq API
     */
    private streamGroqAPI;
    /**
     * 调用 Together AI API
     */
    private callTogetherAPI;
    /**
     * 流式调用 Together AI API
     */
    private streamTogetherAPI;
    /**
     * 调用 Perplexity API
     */
    private callPerplexityAPI;
    /**
     * 流式调用 Perplexity API
     */
    private streamPerplexityAPI;
    /**
     * 调用 Cloudflare Workers AI API
     */
    private callCloudflareAPI;
    /**
     * 流式调用 Cloudflare Workers AI API
     */
    private streamCloudflareAPI;
    /**
     * 调用 Azure OpenAI API
     */
    private callAzureAPI;
    /**
     * 流式调用 Azure OpenAI API
     */
    private streamAzureAPI;
    /**
     * 流式调用 Anthropic API
     */
    private streamAnthropicAPI;
    /**
     * 调用 Voyage AI Embedding API
     */
    private callVoyageEmbeddingAPI;
    /**
     * 调用 Nomic Embedding API
     */
    private callNomicEmbeddingAPI;
    /**
     * 调用百度文心一言 API
     */
    private callBaiduAPI;
    /**
     * 流式调用百度文心一言 API
     */
    private streamBaiduAPI;
    /**
     * 调用阿里通义千问 API
     */
    private callAlibabaAPI;
    /**
     * 流式调用阿里通义千问 API
     */
    private streamAlibabaAPI;
    /**
     * 调用腾讯混元 API
     */
    private callTencentAPI;
    /**
     * 流式调用腾讯混元 API
     */
    private streamTencentAPI;
    /**
     * 调用字节跳动豆包 API
     */
    private callByteDanceAPI;
    /**
     * 流式调用字节跳动豆包 API
     */
    private streamByteDanceAPI;
    /**
     * 调用华为盘古 API
     */
    private callHuaweiAPI;
    /**
     * 流式调用华为盘古 API
     */
    private streamHuaweiAPI;
    /**
     * 调用智谱清言 API
     */
    private callZhipuAPI;
    /**
     * 流式调用智谱清言 API
     */
    private streamZhipuAPI;
    /**
     * 调用 MiniMax API
     */
    private callMiniMaxAPI;
    /**
     * 流式调用 MiniMax API
     */
    private streamMiniMaxAPI;
    /**
     * 调用 AI21 API
     */
    private callAI21API;
    /**
     * 流式调用 AI21 API
     */
    private streamAI21API;
    /**
     * 调用 Fireworks API
     */
    private callFireworksAPI;
    /**
     * 流式调用 Fireworks API
     */
    private streamFireworksAPI;
    /**
     * 调用 Moonshot (月之暗面) API
     */
    private callMoonshotAPI;
    /**
     * 流式调用 Moonshot (月之暗面) API
     */
    private streamMoonshotAPI;
}
export {};
//# sourceMappingURL=LLMManager.d.ts.map