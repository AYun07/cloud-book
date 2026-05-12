/**
 * Cloud Book - 多模型支持模块 V3
 * 支持所有主流大模型和本地部署
 * 新增：Gemini系列模型、Embedding功能
 */
import { LLMConfig, ModelRoute } from '../../types';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'lmstudio' | 'gemini' | 'custom';
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
export declare class LLMManager {
    private providers;
    private routes;
    private defaultProvider?;
    private modelConfigs;
    constructor();
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
     * 生成Embeddings（使用LLM模拟）
     */
    generateEmbedding(text: string, modelName?: string, options?: EmbeddingOptions): Promise<number[]>;
    /**
     * 批量生成Embeddings
     */
    generateEmbeddings(texts: string[], modelName?: string, options?: EmbeddingOptions): Promise<number[][]>;
    /**
     * 将文本转换为模拟embedding向量
     */
    private textToEmbedding;
    /**
     * 简单哈希函数
     */
    private simpleHash;
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
     * 调用 KoboldAPI
     */
    private callKoboldAPI;
}
export default LLMManager;
//# sourceMappingURL=LLMManager.d.ts.map