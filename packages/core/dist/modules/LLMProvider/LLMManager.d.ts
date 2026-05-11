/**
 * Cloud Book - 多模型支持模块
 * 支持所有主流大模型和本地部署
 */
import { LLMConfig, ModelRoute } from '../../types';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'lmstudio' | 'custom';
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
}
export interface LLMProvider {
    name: string;
    provider: ModelProvider;
    generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
    stream?(prompt: string, options: GenerationOptions & {
        stream: true;
    }, onChunk: (chunk: string) => void): Promise<void>;
}
export declare class LLMManager {
    private providers;
    private routes;
    private defaultProvider?;
    constructor();
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
     * 根据配置获取提供者
     */
    private getProviderForConfig;
    /**
     * 获取模型配置
     */
    private modelConfigs;
    addConfig(config: LLMConfig): void;
    getConfig(name: string): LLMConfig | undefined;
    /**
     * 生成文本
     */
    generate(prompt: string, modelName?: string, options?: GenerationOptions): Promise<LLMResponse>;
    /**
     * 补全文本（generate的别名，保持兼容性）
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
     * 获取所有模型
     */
    listModels(): LLMConfig[];
    /**
     * 调用 OpenAI 兼容 API
     */
    private callOpenAICompatibleAPI;
    /**
     * 流式调用 OpenAI 兼容 API
     */
    private streamOpenAICompatibleAPI;
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