"use strict";
/**
 * Cloud Book - 向量与离线配置
 * 2026年5月12日 05:13
 *
 * 向量方案：
 * - advanced-v2: 高性能无模型向量方案（推荐，匹敌大模型）
 * - basic: 基础无模型向量方案
 * - llm-simulated: LLM模拟
 * - openai/siliconflow: 在线API
 *
 * 离线模式：本地Ollama接口（可选）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROVIDER_CONFIGS = exports.OFFLINE_CONFIG = exports.VECTOR_CONFIG = void 0;
exports.getProviderConfig = getProviderConfig;
exports.VECTOR_CONFIG = {
    provider: 'advanced-v2',
    dimensions: 2048,
    model: 'AdvancedVectorizerV2'
};
exports.OFFLINE_CONFIG = {
    enabled: true,
    ollamaURL: 'http://localhost:11434',
    defaultModel: 'qwen2.5:7b',
    models: {
        writing: 'qwen2.5:7b',
        embedding: 'nomic-embed-text'
    }
};
exports.ALL_PROVIDER_CONFIGS = {
    writing: {
        online: [
            { name: 'deepseek-v4-flash', provider: 'deepseek', endpoint: 'https://gemini.beijixingxing.com/v1' },
            { name: 'gemini-2.5-flash[真流]', provider: 'gemini', endpoint: 'https://gemini.beijixingxing.com/v1' },
            { name: 'gemini-3-flash-preview[真流]', provider: 'gemini', endpoint: 'https://gemini.beijixingxing.com/v1' }
        ],
        offline: [
            { name: 'qwen2.5:7b', provider: 'ollama', endpoint: 'http://localhost:11434' },
            { name: 'llama3:8b', provider: 'ollama', endpoint: 'http://localhost:11434' },
            { name: 'yi:6b', provider: 'ollama', endpoint: 'http://localhost:11434' }
        ]
    },
    audit: {
        online: [
            { name: 'gemini-3-flash-preview[假流]', provider: 'gemini', endpoint: 'https://gemini.beijixingxing.com/v1' }
        ],
        offline: [
            { name: 'qwen2.5:7b', provider: 'ollama', endpoint: 'http://localhost:11434' }
        ]
    },
    image: {
        online: [
            { name: 'Kwai-Kolors/Kolors', provider: 'siliconflow', endpoint: 'https://api.siliconflow.cn/v1' }
        ],
        offline: []
    }
};
function getProviderConfig(type, mode) {
    return exports.ALL_PROVIDER_CONFIGS[type][mode];
}
exports.default = {
    VECTOR_CONFIG: exports.VECTOR_CONFIG,
    OFFLINE_CONFIG: exports.OFFLINE_CONFIG,
    ALL_PROVIDER_CONFIGS: exports.ALL_PROVIDER_CONFIGS,
    getProviderConfig
};
//# sourceMappingURL=vector-offline-config.js.map