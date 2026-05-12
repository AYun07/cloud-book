/**
 * Cloud Book - 测试配置文件
 * 使用用户提供的大模型API进行功能测试
 */

export const TEST_LLM_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  model: 'deepseek-v4-flash',
  provider: 'deepseek' as const
};

export const AVAILABLE_MODELS = [
  {
    name: 'deepseek-v4-flash',
    description: 'DeepSeek V4 Flash (推荐)',
    provider: 'deepseek'
  },
  {
    name: 'gemini-2.5-flash',
    description: 'Gemini 2.5 Flash (真流)',
    provider: 'google'
  },
  {
    name: 'gemini-3-flash-preview',
    description: 'Gemini 3 Flash Preview (真流)',
    provider: 'google'
  }
];

export const TEST_CONFIG = {
  llmConfigs: [
    {
      provider: 'deepseek' as const,
      apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
      baseURL: 'https://gemini.beijixingxing.com/v1',
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      maxTokens: 2000
    },
    {
      provider: 'google' as const,
      apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
      baseURL: 'https://gemini.beijixingxing.com/v1',
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2000
    }
  ],
  modelRoutes: [
    { task: 'writing', provider: 'deepseek', model: 'deepseek-v4-flash' },
    { task: 'audit', provider: 'deepseek', model: 'deepseek-v4-flash' },
    { task: 'embedding', provider: 'deepseek', model: 'deepseek-v4-flash' },
    { task: 'analysis', provider: 'google', model: 'gemini-2.5-flash' }
  ],
  auditConfig: {
    dimensions: [
      'characterConsistency',
      'worldConsistency',
      'timelineConsistency',
      'plotLogic',
      'aiDetection',
      'repetitiveness'
    ],
    threshold: 0.7,
    autoFix: true,
    maxIterations: 3
  },
  antiDetectionConfig: {
    enabled: true,
    intensity: 5,
    replaceAIWords: true,
    varySentenceStructure: true,
    addColloquialism: true,
    enhanceEmotion: true
  },
  storagePath: './test-data'
};
