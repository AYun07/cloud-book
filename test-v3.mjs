/**
 * Cloud Book - 完整功能测试
 * 使用环境变量配置API密钥
 */

const TEST_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  models: {
    deepseekV4Flash: 'deepseek-v4-flash',
    gemini25Flash: 'gemini-2.5-flash',
    gemini3FalseStream: 'gemini-3-flash-preview',
    gemini3TrueStream: 'gemini-3-flash-preview'
  }
};

async function callAPI(model, messages) {
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
      model,
      messages,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function runTests() {
  console.log('\n========== Cloud Book 功能测试 ==========\n');

  if (!TEST_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return;
  }

  try {
    const result = await callAPI(TEST_CONFIG.models.deepseekV4Flash, [
      { role: 'user', content: '说"测试成功"' }
    ]);
    console.log('✅ LLM 可用');
    console.log('响应:', result.choices?.[0]?.message?.content);
  } catch (error) {
    console.log('❌ LLM 不可用:', error.message);
  }
}

runTests().catch(console.error);
