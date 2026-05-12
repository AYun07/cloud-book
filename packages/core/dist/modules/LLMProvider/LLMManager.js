"use strict";
/**
 * Cloud Book - 多模型支持模块 V3
 * 支持所有主流大模型和本地部署
 * 新增：Gemini系列模型、Embedding功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMManager = exports.SUPPORTED_MODELS = void 0;
exports.SUPPORTED_MODELS = [
    {
        name: 'deepseek-v4-flash',
        provider: 'deepseek',
        streamingMode: 'true',
        supportsEmbedding: false,
        maxTokens: 8192,
        description: 'DeepSeek V4 Flash - 主写作模型(中文强)'
    },
    {
        name: 'gemini-2.5-flash[真流]',
        provider: 'gemini',
        streamingMode: 'true',
        supportsEmbedding: false,
        maxTokens: 8192,
        description: 'Gemini 2.5 Flash - 实时审计(真流)'
    },
    {
        name: 'gemini-3-flash-preview[假流]',
        provider: 'gemini',
        streamingMode: 'false',
        supportsEmbedding: false,
        maxTokens: 8192,
        description: 'Gemini 3 Flash - 精确审计(假流)'
    },
    {
        name: 'gemini-3-flash-preview[真流]',
        provider: 'gemini',
        streamingMode: 'true',
        supportsEmbedding: false,
        maxTokens: 8192,
        description: 'Gemini 3 Flash - 实时润色(真流)'
    }
];
class LLMManager {
    providers = new Map();
    routes = [];
    defaultProvider;
    modelConfigs = new Map();
    constructor() {
        this.registerBuiltinProviders();
    }
    /**
     * 获取模型信息
     */
    getModelInfo(modelName) {
        return exports.SUPPORTED_MODELS.find(m => m.name === modelName);
    }
    /**
     * 获取所有支持的模型列表
     */
    listSupportedModels() {
        return [...exports.SUPPORTED_MODELS];
    }
    /**
     * 获取所有已配置的模型
     */
    listModels() {
        return Array.from(this.modelConfigs.values());
    }
    /**
     * 注册内置提供者
     */
    registerBuiltinProviders() {
        // OpenAI
        this.registerProvider({
            name: 'openai',
            provider: 'openai',
            generate: async (prompt, options) => {
                const config = this.getConfig('openai');
                if (!config)
                    throw new Error('OpenAI config not found');
                return this.callOpenAICompatibleAPI(config, prompt, options);
            },
            stream: async (prompt, options, onChunk) => {
                const config = this.getConfig('openai');
                if (!config)
                    throw new Error('OpenAI config not found');
                await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
            }
        });
        // Anthropic
        this.registerProvider({
            name: 'anthropic',
            provider: 'anthropic',
            generate: async (prompt, options) => {
                const config = this.getConfig('anthropic');
                if (!config)
                    throw new Error('Anthropic config not found');
                return this.callAnthropicAPI(config, prompt, options);
            }
        });
        // DeepSeek
        this.registerProvider({
            name: 'deepseek',
            provider: 'deepseek',
            generate: async (prompt, options) => {
                const config = this.getConfig('deepseek');
                if (!config)
                    throw new Error('DeepSeek config not found');
                return this.callOpenAICompatibleAPI(config, prompt, options);
            },
            stream: async (prompt, options, onChunk) => {
                const config = this.getConfig('deepseek');
                if (!config)
                    throw new Error('DeepSeek config not found');
                await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
            }
        });
        // Gemini (通用处理)
        this.registerProvider({
            name: 'gemini',
            provider: 'gemini',
            generate: async (prompt, options) => {
                const config = this.getConfig('gemini');
                if (!config)
                    throw new Error('Gemini config not found');
                const modelInfo = this.getModelInfo(config.model);
                const isStreaming = modelInfo?.streamingMode === 'true' && options?.stream !== false;
                return this.callGeminiAPI(config, prompt, options, isStreaming);
            },
            stream: async (prompt, options, onChunk) => {
                const config = this.getConfig('gemini');
                if (!config)
                    throw new Error('Gemini config not found');
                await this.streamGeminiAPI(config, prompt, options, onChunk);
            }
        });
        // Ollama (本地)
        this.registerProvider({
            name: 'ollama',
            provider: 'ollama',
            generate: async (prompt, options) => {
                const config = this.getConfig('ollama');
                if (!config)
                    throw new Error('Ollama config not found');
                return this.callOllamaAPI(config, prompt, options);
            }
        });
        // KoboldCPP (本地)
        this.registerProvider({
            name: 'koboldcpp',
            provider: 'koboldcpp',
            generate: async (prompt, options) => {
                const config = this.getConfig('koboldcpp');
                if (!config)
                    throw new Error('KoboldCPP config not found');
                return this.callKoboldAPI(config, prompt, options);
            }
        });
        // Custom Provider (支持所有OpenAI兼容API)
        this.registerProvider({
            name: 'custom',
            provider: 'custom',
            generate: async (prompt, options) => {
                const config = this.getConfig('custom');
                if (!config)
                    throw new Error('Custom config not found');
                return this.callOpenAICompatibleAPI(config, prompt, options);
            },
            stream: async (prompt, options, onChunk) => {
                const config = this.getConfig('custom');
                if (!config)
                    throw new Error('Custom config not found');
                await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
            }
        });
    }
    /**
     * 注册自定义提供者
     */
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    /**
     * 添加模型配置
     */
    addModel(config) {
        this.modelConfigs.set(config.name, config);
        const baseProvider = this.providers.get(config.provider) || this.providers.get('custom');
        if (baseProvider) {
            const wrappedProvider = {
                name: config.name,
                provider: config.provider,
                generate: async (prompt, options) => {
                    return baseProvider.generate(prompt, options);
                },
                stream: baseProvider.stream ? async (prompt, options, onChunk) => {
                    await baseProvider.stream(prompt, options, onChunk);
                } : undefined
            };
            this.providers.set(config.name, wrappedProvider);
        }
        if (!this.defaultProvider) {
            this.defaultProvider = config.name;
        }
    }
    /**
     * 添加模型配置（addModel别名）
     */
    addConfig(config) {
        this.addModel(config);
    }
    /**
     * 获取模型配置
     */
    getConfig(name) {
        return this.modelConfigs.get(name);
    }
    /**
     * 生成文本
     */
    async generate(prompt, modelName, options) {
        const name = modelName || this.defaultProvider;
        const provider = this.providers.get(name || '');
        if (!provider) {
            throw new Error(`Provider not found: ${name}`);
        }
        return provider.generate(prompt, options);
    }
    /**
     * 补全文本
     */
    async complete(prompt, options) {
        const result = await this.generate(prompt, this.defaultProvider, {
            temperature: options?.temperature ?? 0.7,
            maxTokens: options?.maxTokens ?? 2000
        });
        return result.text;
    }
    /**
     * 流式生成
     */
    async stream(prompt, modelName, options, onChunk) {
        const name = modelName || this.defaultProvider;
        const provider = this.providers.get(name || '');
        if (!provider?.stream) {
            throw new Error(`Streaming not supported for: ${name}`);
        }
        return provider.stream(prompt, options, onChunk);
    }
    /**
     * 流式生成（自动检测模型支持）
     */
    async streamGenerate(prompt, modelName, options, onChunk) {
        const name = modelName || this.defaultProvider;
        const config = this.modelConfigs.get(name || '');
        const modelInfo = config ? this.getModelInfo(config.model) : undefined;
        if (modelInfo?.streamingMode === 'true' && this.providers.get(name || '')?.stream) {
            await this.stream(prompt, modelName, { ...options, stream: true }, onChunk);
            return '';
        }
        else {
            const result = await this.generate(prompt, modelName, options);
            onChunk(result.text);
            return result.text;
        }
    }
    /**
     * 生成Embeddings（使用LLM模拟）
     */
    async generateEmbedding(text, modelName, options) {
        const name = modelName || this.defaultProvider;
        const response = await this.generate(`请将以下文本转换为一个简短的语义描述（30个字以内）：\n\n${text}`, name, { maxTokens: 100 });
        const embedding = this.textToEmbedding(response.text, options?.dimensions || 1536);
        return embedding;
    }
    /**
     * 批量生成Embeddings
     */
    async generateEmbeddings(texts, modelName, options) {
        const embeddings = [];
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text, modelName, options);
            embeddings.push(embedding);
        }
        return embeddings;
    }
    /**
     * 将文本转换为模拟embedding向量
     */
    textToEmbedding(text, dimensions = 1536) {
        const embedding = new Array(dimensions).fill(0);
        const hash = this.simpleHash(text);
        for (let i = 0; i < dimensions; i++) {
            const seed = hash + i * 31;
            embedding[i] = (Math.sin(seed) * 0.5 + 0.5);
        }
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / magnitude);
    }
    /**
     * 简单哈希函数
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    /**
     * 计算余弦相似度
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same dimensions');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * 设置模型路由
     */
    setRoutes(routes) {
        this.routes = routes;
    }
    /**
     * 根据任务类型路由
     */
    route(task) {
        const route = this.routes.find(r => r.task === task);
        return route?.llmConfig;
    }
    /**
     * 设置默认模型
     */
    setDefault(modelName) {
        this.defaultProvider = modelName;
    }
    /**
     * 调用 OpenAI 兼容 API
     */
    async callOpenAICompatibleAPI(config, prompt, options) {
        const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 2000,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
                stop: options?.stop,
                stream: options?.stream ?? false
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        return {
            text: data.choices?.[0]?.message?.content || '',
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens || 0,
                completionTokens: data.usage.completion_tokens || 0,
                totalTokens: data.usage.total_tokens || 0
            } : undefined,
            model: data.model || config.model,
            finishReason: data.choices?.[0]?.finish_reason
        };
    }
    /**
     * 流式调用 OpenAI 兼容 API
     */
    async streamOpenAICompatibleAPI(config, prompt, options, onChunk) {
        const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 2000,
                stream: true
            })
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
            throw new Error('Response body is null');
        }
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]')
                        return;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                        }
                    }
                    catch (e) {
                    }
                }
            }
        }
    }
    /**
     * 调用 Gemini API
     */
    async callGeminiAPI(config, prompt, options, stream = false) {
        const endpoint = config.endpoint || config.baseURL || 'https://gemini.beijixingxing.com/v1';
        if (stream) {
            let fullText = '';
            await this.streamGeminiAPI(config, prompt, options, (chunk) => {
                fullText += chunk;
            });
            return {
                text: fullText,
                model: config.model
            };
        }
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 2000,
                stream: false
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.choices?.[0]?.message?.content || '',
            model: data.model || config.model
        };
    }
    /**
     * 流式调用 Gemini API
     */
    async streamGeminiAPI(config, prompt, options, onChunk) {
        const endpoint = config.endpoint || config.baseURL || 'https://gemini.beijixingxing.com/v1';
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 2000,
                stream: true
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini Stream Error: ${response.status}`);
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
            throw new Error('Response body is null');
        }
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]')
                        return;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                        }
                    }
                    catch (e) {
                    }
                }
            }
        }
    }
    /**
     * 调用 Anthropic API
     */
    async callAnthropicAPI(config, prompt, options) {
        const endpoint = config.endpoint || 'https://api.anthropic.com/v1';
        const response = await fetch(`${endpoint}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey || '',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: config.model,
                max_tokens: options?.maxTokens ?? 1024,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            throw new Error(`Anthropic API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.content?.[0]?.text || '',
            usage: {
                promptTokens: data.usage?.input_tokens || 0,
                completionTokens: data.usage?.output_tokens || 0,
                totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
            },
            model: config.model,
            finishReason: data.stop_reason
        };
    }
    /**
     * 调用 Ollama API
     */
    async callOllamaAPI(config, prompt, options) {
        const endpoint = config.endpoint || 'http://localhost:11434';
        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                prompt,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.maxTokens ?? 2000,
                    top_p: options?.topP
                }
            })
        });
        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.response || '',
            model: config.model
        };
    }
    /**
     * 调用 KoboldAPI
     */
    async callKoboldAPI(config, prompt, options) {
        const endpoint = config.endpoint || 'http://localhost:5000';
        const response = await fetch(`${endpoint}/api/v1/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                max_length: options?.maxTokens ?? 512,
                temperature: options?.temperature ?? 0.7,
                top_p: options?.topP ?? 0.9,
                rep_pen: options?.frequencyPenalty ?? 1.1
            })
        });
        if (!response.ok) {
            throw new Error(`KoboldAPI Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.results?.[0]?.text || '',
            model: config.model
        };
    }
}
exports.LLMManager = LLMManager;
exports.default = LLMManager;
//# sourceMappingURL=LLMManager.js.map