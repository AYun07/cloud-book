/**
 * Cloud Book - 测试配置
 * 所有API密钥必须通过环境变量配置
 */

const TEST_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: 'deepseek-v4-flash'
};

if (!TEST_CONFIG.apiKey) {
  console.warn('⚠️ 警告: 未设置 LLM_API_KEY 环境变量');
  console.warn('请运行: export LLM_API_KEY="your-api-key"');
}

module.exports = TEST_CONFIG;
