"use strict";
/**
 * Cloud Book - 多模型支持模块 V4
 * 支持所有主流大模型和本地部署
 * 新增：真实OpenAI Embedding API、缓存、流式处理、结构化日志
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMManager = exports.SUPPORTED_MODELS = void 0;
exports.SUPPORTED_MODELS = [
    {
        name: 'deepseek-v4-flash',
        provider: 'deepseek',
        streamingMode: 'true',
        supportsEmbedding: true,
        maxTokens: 8192,
        description: 'DeepSeek V4 Flash - 主写作模型(中文强)'
    },
    {
        name: 'text-embedding-3-small',
        provider: 'openai',
        streamingMode: 'false',
        supportsEmbedding: true,
        maxTokens: 8192,
        description: 'OpenAI Embedding - 语义向量模型'
    },
    {
        name: 'text-embedding-3-large',
        provider: 'openai',
        streamingMode: 'false',
        supportsEmbedding: true,
        maxTokens: 8192,
        description: 'OpenAI Embedding Large - 高质量语义向量'
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
    embeddingCache = new Map();
    cacheTTL = 3600000; // 1 hour
    logs = [];
    constructor() {
        this.registerBuiltinProviders();
    }
    log(level, component, message, metadata) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            metadata
        };
        this.logs.push(entry);
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
        if (level === 'error' || level === 'warn') {
            console[level](`[${component}] ${message}`, metadata || '');
        }
    }
    getLogs() {
        return [...this.logs];
    }
    clearLogs() {
        this.logs = [];
    }
    setCacheTTL(ttlMs) {
        this.cacheTTL = ttlMs;
    }
    clearCache() {
        this.embeddingCache.clear();
        this.log('info', 'LLMManager', 'Embedding cache cleared');
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
            },
            embed: async (text, options) => {
                const config = this.getConfig('openai');
                if (!config)
                    throw new Error('OpenAI config not found');
                return this.callOpenAIEmbeddingAPI(config, text, options);
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
            },
            embed: async (text, options) => {
                const config = this.getConfig('deepseek');
                if (!config)
                    throw new Error('DeepSeek config not found');
                return this.callOpenAIEmbeddingAPI(config, text, options);
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
            },
            embed: async (text, options) => {
                const config = this.getConfig('custom');
                if (!config)
                    throw new Error('Custom config not found');
                return this.callOpenAIEmbeddingAPI(config, text, options);
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
        const wrappedProvider = {
            name: config.name,
            provider: config.provider,
            generate: async (prompt, options) => {
                return this.callModelAPI(config, prompt, options);
            },
            stream: async (prompt, options, onChunk) => {
                await this.streamModelAPI(config, prompt, options, onChunk);
            },
            embed: async (text, options) => {
                if (['openai', 'deepseek', 'custom'].includes(config.provider)) {
                    return this.callOpenAIEmbeddingAPI(config, text, options);
                }
                throw new Error(`Embedding not supported for ${config.provider}`);
            }
        };
        this.providers.set(config.name, wrappedProvider);
        if (!this.defaultProvider) {
            this.defaultProvider = config.name;
        }
    }
    /**
     * 根据模型配置调用API
     */
    async callModelAPI(config, prompt, options) {
        const providerType = config.provider;
        switch (providerType) {
            case 'openai':
            case 'deepseek':
            case 'custom':
                return this.callOpenAICompatibleAPI(config, prompt, options);
            case 'anthropic':
                return this.callAnthropicAPI(config, prompt, options);
            case 'gemini': {
                const modelInfo = this.getModelInfo(config.model);
                const isStreaming = modelInfo?.streamingMode === 'true' && options?.stream !== false;
                return this.callGeminiAPI(config, prompt, options, isStreaming);
            }
            case 'ollama':
                return this.callOllamaAPI(config, prompt, options);
            case 'koboldcpp':
                return this.callKoboldAPI(config, prompt, options);
            default:
                return this.callOpenAICompatibleAPI(config, prompt, options);
        }
    }
    /**
     * 流式调用模型API
     */
    async streamModelAPI(config, prompt, options, onChunk) {
        const providerType = config.provider;
        switch (providerType) {
            case 'openai':
            case 'deepseek':
            case 'custom':
                await this.streamOpenAICompatibleAPI(config, prompt, { ...options, stream: true }, onChunk);
                break;
            case 'gemini':
                await this.streamGeminiAPI(config, prompt, options, onChunk);
                break;
            default:
                const result = await this.callModelAPI(config, prompt, options);
                onChunk(result.text);
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
            this.log('error', 'LLMManager', `Provider not found: ${name}`);
            throw new Error(`Provider not found: ${name}`);
        }
        this.log('debug', 'LLMManager', 'Generating text', { model: name, promptLength: prompt.length });
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
            this.log('error', 'LLMManager', `Streaming not supported for: ${name}`);
            throw new Error(`Streaming not supported for: ${name}`);
        }
        this.log('debug', 'LLMManager', 'Streaming generation', { model: name });
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
     * 生成Embeddings（支持真实API和回退模拟）
     */
    async generateEmbedding(text, modelName, options) {
        const cacheKey = `${text}:${modelName || 'default'}:${options?.dimensions || 1536}`;
        const cached = this.embeddingCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            this.log('debug', 'LLMManager', 'Embedding cache hit');
            return cached.embedding;
        }
        const name = modelName || this.defaultProvider;
        const provider = this.providers.get(name || '');
        if (provider?.embed) {
            try {
                this.log('debug', 'LLMManager', 'Calling real embedding API');
                const response = await provider.embed(text, options);
                this.embeddingCache.set(cacheKey, {
                    embedding: response.embedding,
                    timestamp: Date.now()
                });
                return response.embedding;
            }
            catch (error) {
                this.log('warn', 'LLMManager', 'Embedding API failed, falling back', { error });
            }
        }
        this.log('debug', 'LLMManager', 'Using TF-IDF fallback for embeddings');
        const embedding = this.textToEmbedding(text, options?.dimensions || 1536);
        this.embeddingCache.set(cacheKey, {
            embedding,
            timestamp: Date.now()
        });
        return embedding;
    }
    /**
     * 批量生成Embeddings（并行优化）
     */
    async generateEmbeddings(texts, modelName, options) {
        const concurrency = 3;
        const results = [];
        for (let i = 0; i < texts.length; i += concurrency) {
            const batch = texts.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(text => this.generateEmbedding(text, modelName, options)));
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * 将文本转换为语义embedding向量（基于TF-IDF加权词向量 - 回退方案）
     */
    textToEmbedding(text, dimensions = 1536) {
        const words = this.tokenize(text);
        const wordFreq = this.calculateWordFrequency(words);
        const idf = this.calculateIDF([text], words);
        const embedding = new Array(dimensions).fill(0);
        let index = 0;
        for (const [word, freq] of Object.entries(wordFreq)) {
            const wordHash = this.hashWord(word);
            const tfidf = freq * idf[word] || freq;
            const startIdx = Math.abs(wordHash) % dimensions;
            const spreadFactor = Math.min(5, Math.ceil(dimensions / (Object.keys(wordFreq).length * 10)));
            for (let offset = 0; offset < spreadFactor; offset++) {
                const pos = (startIdx + offset) % dimensions;
                const sign = ((wordHash >> offset) & 1) ? 1 : -1;
                const weight = tfidf * (1 / (1 + offset));
                embedding[pos] += sign * weight * 0.3;
            }
            index++;
            if (index >= 50)
                break;
        }
        for (let i = 0; i < dimensions; i++) {
            const charCode = text.charCodeAt(i % text.length);
            const ngram = this.hashWord(text.slice(Math.max(0, i - 2), i + 3));
            embedding[i] += ((charCode % 100) / 100 - 0.5) * 0.1;
            embedding[i] += (ngram % 100) / 500;
        }
        let magnitude = 0;
        for (let i = 0; i < dimensions; i++) {
            magnitude += embedding[i] * embedding[i];
        }
        magnitude = Math.sqrt(magnitude) || 1;
        for (let i = 0; i < dimensions; i++) {
            embedding[i] = embedding[i] / magnitude;
        }
        return embedding;
    }
    tokenize(text) {
        const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
        const english = text.toLowerCase().match(/[a-z]{2,}/g) || [];
        const tokens = [];
        for (const chars of chinese) {
            for (let i = 0; i < chars.length; i++) {
                tokens.push(chars[i]);
                if (i < chars.length - 1) {
                    tokens.push(chars.slice(i, i + 2));
                }
            }
        }
        return [...tokens, ...english];
    }
    calculateWordFrequency(words) {
        const freq = {};
        const total = words.length || 1;
        for (const word of words) {
            freq[word] = (freq[word] || 0) + 1;
        }
        for (const key in freq) {
            freq[key] = freq[key] / total;
        }
        return freq;
    }
    calculateIDF(documents, vocabulary) {
        const idf = {};
        const n = documents.length || 1;
        for (const word of vocabulary) {
            let docFreq = 0;
            for (const doc of documents) {
                if (doc.includes(word))
                    docFreq++;
            }
            idf[word] = Math.log((n + 1) / (docFreq + 1)) + 1;
        }
        return idf;
    }
    hashWord(word) {
        let hash = 5381;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) + hash) ^ word.charCodeAt(i);
            hash = hash >>> 0;
        }
        return hash;
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
     * 调用 OpenAI Embedding API
     */
    async callOpenAIEmbeddingAPI(config, text, options) {
        const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
        const model = options?.model || config.model;
        this.log('debug', 'LLMManager', 'Calling OpenAI Embedding API', { endpoint, model });
        const response = await fetch(`${endpoint}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                input: text,
                dimensions: options?.dimensions
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.log('error', 'LLMManager', 'Embedding API failed', {
                status: response.status,
                error: errorText
            });
            throw new Error(`Embedding API Error: ${response.status}`);
        }
        const data = await response.json();
        const embedding = data.data?.[0]?.embedding || this.textToEmbedding(text);
        return {
            embedding,
            model: data.model || model,
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens || 0,
                totalTokens: data.usage.total_tokens || 0
            } : undefined
        };
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
            this.log('error', 'LLMManager', 'OpenAI API failed', {
                status: response.status,
                error: errorText
            });
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
            this.log('error', 'LLMManager', 'OpenAI stream failed', { status: response.status });
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
            this.log('error', 'LLMManager', 'Gemini API failed', { status: response.status });
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
            this.log('error', 'LLMManager', 'Gemini stream failed', { status: response.status });
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
        const endpoint = config.endpoint || config.baseURL || 'https://api.anthropic.com/v1';
        const response = await fetch(`${endpoint}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options?.maxTokens ?? 2000,
                temperature: options?.temperature ?? 0.7
            })
        });
        if (!response.ok) {
            this.log('error', 'LLMManager', 'Anthropic API failed', { status: response.status });
            throw new Error(`Anthropic API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.content?.find(c => c.type === 'text')?.text || '',
            model: data.model || config.model,
            usage: data.usage ? {
                promptTokens: data.usage.input_tokens || 0,
                completionTokens: data.usage.output_tokens || 0,
                totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
            } : undefined
        };
    }
    /**
     * 调用 Ollama API
     */
    async callOllamaAPI(config, prompt, options) {
        const endpoint = config.endpoint || 'http://localhost:11434/api';
        const response = await fetch(`${endpoint}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.maxTokens ?? 2000
                }
            })
        });
        if (!response.ok) {
            this.log('error', 'LLMManager', 'Ollama API failed', { status: response.status });
            throw new Error(`Ollama API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.response || '',
            model: data.model || config.model
        };
    }
    /**
     * 调用 KoboldCPP API
     */
    async callKoboldAPI(config, prompt, options) {
        const endpoint = config.endpoint || 'http://localhost:5001/api';
        const response = await fetch(`${endpoint}/v1/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                temperature: options?.temperature ?? 0.7,
                max_length: options?.maxTokens ?? 2000
            })
        });
        if (!response.ok) {
            this.log('error', 'LLMManager', 'Kobold API failed', { status: response.status });
            throw new Error(`Kobold API Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            text: data.results?.[0]?.text || '',
            model: config.model
        };
    }
}
exports.LLMManager = LLMManager;
//# sourceMappingURL=LLMManager.js.map