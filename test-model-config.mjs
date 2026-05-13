/**
 * Cloud Book - 模型配置测试
 * 使用环境变量配置API密钥
 */

const TEST_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || ''
};

const MODELS = {
  deepseek: 'deepseek-v4-flash',
  gemini25: 'gemini-2.5-flash',
  gemini3False: 'gemini-3-flash-preview',
  gemini3True: 'gemini-3-flash-preview'
};

async function callModel(modelName, messages) {
  if (!TEST_CONFIG.apiKey) {
    throw new Error('未设置 API 密钥');
  }

  const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      max_tokens: 50
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function runTests() {
  console.log('\n========== 模型配置测试 ==========\n');

  if (!TEST_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return;
  }

  for (const [name, model] of Object.entries(MODELS)) {
    try {
      const result = await callModel(model, [
        { role: 'user', content: '说"ok"' }
      ]);
      console.log(`✅ ${name}: 可用`);
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
}

runTests().catch(console.error);
