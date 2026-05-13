/**
 * Cloud Book - API 测试
 * 使用环境变量配置API密钥
 */

const API_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || ''
};

async function testAPI() {
  console.log('\n========== API 测试 ==========\n');

  if (!API_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: '说"ok"' }],
        max_tokens: 20
      })
    });

    if (response.ok) {
      console.log('✅ API 可用');
    } else {
      console.log('❌ API 失败:', response.status);
    }
  } catch (error) {
    console.log('❌ API 失败:', error.message);
  }
}

testAPI().catch(console.error);
