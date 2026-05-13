/**
 * Cloud Book - 完整模型配置
 * 2026年5月12日 21:00
 * 四个模型正确配置
 */

import { LLMConfig, ModelRoute } from '../types';

const API_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || ''
};

export const MODEL_NAMES = {
  DEEPSEEK_V4_FLASH: 'deepseek-v4-flash',
  GEMINI_25_TRUE: 'gemini-2.5-flash[真流]',
  GEMINI_3_FALSE: 'gemini-3-flash-preview[假流]',
  GEMINI_3_TRUE: 'gemini-3-flash-preview[真流]'
} as const;

export type ModelName = typeof MODEL_NAMES[keyof typeof MODEL_NAMES];

export const MODEL_CAPABILITIES: Record<ModelName, {
  streamingMode: 'true' | 'false';
  bestFor: string[];
  strengths: string[];
  weaknesses: string[];
}> = {
  [MODEL_NAMES.DEEPSEEK_V4_FLASH]: {
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
      '支持真流式输出'
    ],
    weaknesses: [
      '创意偶尔保守'
    ]
  },
  [MODEL_NAMES.GEMINI_25_TRUE]: {
    streamingMode: 'true',
    bestFor: [
      '实时内容审计',
      '快速质量检测',
      '交互式写作辅助',
      '实时反馈'
    ],
    strengths: [
      '真流式输出',
      '响应速度快',
      '多语言支持好',
      '实时交互体验'
    ],
    weaknesses: [
      '长文本可能截断'
    ]
  },
  [MODEL_NAMES.GEMINI_3_FALSE]: {
    streamingMode: 'false',
    bestFor: [
      '精确内容审计',
      '深度风格分析',
      '复杂逻辑推理',
      '精确评分',
      '批量处理'
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
  [MODEL_NAMES.GEMINI_3_TRUE]: {
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
  }
};

export function createModelConfigs(): LLMConfig[] {
  return [
    {
      provider: 'deepseek',
      name: MODEL_NAMES.DEEPSEEK_V4_FLASH,
      baseURL: API_CONFIG.baseURL,
      apiKey: API_CONFIG.apiKey,
      model: 'deepseek-v4-flash',
      temperature: 0.75,
      maxTokens: 4096
    },
    {
      provider: 'gemini',
      name: MODEL_NAMES.GEMINI_25_TRUE,
      baseURL: API_CONFIG.baseURL,
      apiKey: API_CONFIG.apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 4096
    },
    {
      provider: 'gemini',
      name: MODEL_NAMES.GEMINI_3_FALSE,
      baseURL: API_CONFIG.baseURL,
      apiKey: API_CONFIG.apiKey,
      model: 'gemini-3-flash-preview',
      temperature: 0.6,
      maxTokens: 4096
    },
    {
      provider: 'gemini',
      name: MODEL_NAMES.GEMINI_3_TRUE,
      baseURL: API_CONFIG.baseURL,
      apiKey: API_CONFIG.apiKey,
      model: 'gemini-3-flash-preview',
      temperature: 0.75,
      maxTokens: 4096
    }
  ];
}

export function createModelRoutes(): ModelRoute[] {
  return [
    {
      task: 'writing',
      llmConfig: {
        provider: 'deepseek',
        name: MODEL_NAMES.DEEPSEEK_V4_FLASH,
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
        name: MODEL_NAMES.GEMINI_3_TRUE,
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
        name: MODEL_NAMES.GEMINI_3_FALSE,
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
        name: MODEL_NAMES.GEMINI_25_TRUE,
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
        name: MODEL_NAMES.DEEPSEEK_V4_FLASH,
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
        name: MODEL_NAMES.DEEPSEEK_V4_FLASH,
        baseURL: API_CONFIG.baseURL,
        apiKey: API_CONFIG.apiKey,
        model: 'deepseek-v4-flash',
        temperature: 0.8,
        maxTokens: 2048
      }
    }
  ];
}

export const API_CONFIG_INFO = {
  endpoint: API_CONFIG.baseURL,
  apiKey: API_CONFIG.apiKey,
  status: 'ready' as const
};

export function getDefaultLLMConfig(): LLMConfig {
  return createModelConfigs()[0];
}

export type ModelCapability = {
  streamingMode: 'true' | 'false';
  bestFor: string[];
  strengths: string[];
  weaknesses: string[];
};
