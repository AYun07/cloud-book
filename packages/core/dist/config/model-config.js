"use strict";
/**
 * Cloud Book - 模型配置与路由系统
 * 2026年5月12日 20:40
 * 根据模型能力分配最佳任务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_CONFIG_INFO = exports.MODEL_CAPABILITIES = void 0;
exports.createModelConfigs = createModelConfigs;
exports.createModelRoutes = createModelRoutes;
exports.getDefaultLLMConfig = getDefaultLLMConfig;
const API_CONFIG = {
    baseURL: 'https://gemini.beijixingxing.com/v1',
    apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn'
};
exports.MODEL_CAPABILITIES = {
    'deepseek-v4-flash': {
        name: 'deepseek-v4-flash',
        streamingMode: 'true',
        bestFor: [
            '小说章节生成',
            '长文本创作',
            '复杂情节构思',
            '世界观构建',
            '角色对话'
        ],
        strengths: [
            '中文理解能力强',
            '生成速度快',
            '成本效益高',
            '支持流式输出'
        ],
        weaknesses: [
            '创意偶尔保守'
        ]
    },
    'gemini-3-flash-preview[假流]': {
        name: 'gemini-3-flash-preview[假流]',
        streamingMode: 'false',
        bestFor: [
            '精确内容审计',
            '深度风格分析',
            '复杂逻辑推理',
            '精确评分'
        ],
        strengths: [
            '输出稳定完整',
            '逻辑推理强',
            '分析深入',
            '适合批量任务'
        ],
        weaknesses: [
            '无流式输出'
        ]
    },
    'gemini-3-flash-preview[真流]': {
        name: 'gemini-3-flash-preview[真流]',
        streamingMode: 'true',
        bestFor: [
            '实时创意生成',
            '交互式头脑风暴',
            '动态内容优化',
            '实时润色'
        ],
        strengths: [
            '真流式输出',
            '创意能力强',
            '优化迭代快',
            '用户交互好'
        ],
        weaknesses: [
            '相对较新，可能不稳定'
        ]
    },
    'gemini-2.5-flash': {
        name: 'gemini-2.5-flash',
        streamingMode: 'true',
        bestFor: [
            '快速响应',
            '轻量级任务',
            '备选模型'
        ],
        strengths: [
            '响应速度快',
            '资源消耗低'
        ],
        weaknesses: [
            '功能相对基础'
        ]
    }
};
function createModelConfigs() {
    return [
        {
            provider: 'deepseek',
            name: 'deepseek-v4-flash',
            baseURL: API_CONFIG.baseURL,
            apiKey: API_CONFIG.apiKey,
            model: 'deepseek-v4-flash',
            temperature: 0.75,
            maxTokens: 4096
        },
        {
            provider: 'gemini',
            name: 'gemini-3-flash-preview[假流]',
            baseURL: API_CONFIG.baseURL,
            apiKey: API_CONFIG.apiKey,
            model: 'gemini-3-flash-preview',
            temperature: 0.6,
            maxTokens: 4096
        },
        {
            provider: 'gemini',
            name: 'gemini-3-flash-preview[真流]',
            baseURL: API_CONFIG.baseURL,
            apiKey: API_CONFIG.apiKey,
            model: 'gemini-3-flash-preview',
            temperature: 0.75,
            maxTokens: 4096
        },
        {
            provider: 'gemini',
            name: 'gemini-2.5-flash',
            baseURL: API_CONFIG.baseURL,
            apiKey: API_CONFIG.apiKey,
            model: 'gemini-2.5-flash',
            temperature: 0.7,
            maxTokens: 4096
        }
    ];
}
function createModelRoutes() {
    return [
        {
            task: 'writing',
            llmConfig: {
                provider: 'deepseek',
                name: 'deepseek-v4-flash',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'deepseek-v4-flash',
                temperature: 0.75,
                maxTokens: 4096
            }
        },
        {
            task: 'revision',
            llmConfig: {
                provider: 'gemini',
                name: 'gemini-3-flash-preview[真流]',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'gemini-3-flash-preview',
                temperature: 0.7,
                maxTokens: 2048
            }
        },
        {
            task: 'audit',
            llmConfig: {
                provider: 'gemini',
                name: 'gemini-3-flash-preview[假流]',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'gemini-3-flash-preview',
                temperature: 0.5,
                maxTokens: 2048
            }
        },
        {
            task: 'style',
            llmConfig: {
                provider: 'gemini',
                name: 'gemini-2.5-flash',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'gemini-2.5-flash',
                temperature: 0.65,
                maxTokens: 2048
            }
        },
        {
            task: 'analysis',
            llmConfig: {
                provider: 'deepseek',
                name: 'deepseek-v4-flash',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'deepseek-v4-flash',
                temperature: 0.6,
                maxTokens: 2048
            }
        },
        {
            task: 'planning',
            llmConfig: {
                provider: 'deepseek',
                name: 'deepseek-v4-flash',
                baseURL: API_CONFIG.baseURL,
                apiKey: API_CONFIG.apiKey,
                model: 'deepseek-v4-flash',
                temperature: 0.8,
                maxTokens: 2048
            }
        }
    ];
}
function getDefaultLLMConfig() {
    return {
        provider: 'deepseek',
        name: 'deepseek-v4-flash',
        baseURL: API_CONFIG.baseURL,
        apiKey: API_CONFIG.apiKey,
        model: 'deepseek-v4-flash',
        temperature: 0.75,
        maxTokens: 4096
    };
}
exports.API_CONFIG_INFO = {
    endpoint: API_CONFIG.baseURL,
    apiKey: API_CONFIG.apiKey.substring(0, 10) + '...',
    status: 'ready'
};
//# sourceMappingURL=model-config.js.map