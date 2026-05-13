/**
 * Cloud Book - 完整功能测试
 * 使用环境变量配置API密钥
 */

const TEST_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: 'deepseek-v4-flash'
};

async function testAPI() {
  console.log('\n========== 完整功能测试 ==========\n');

  if (!TEST_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return;
  }

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: TEST_CONFIG.model,
        messages: [{ role: 'user', content: '说"测试"' }],
        max_tokens: 50
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 测试成功');
      console.log('响应:', data.choices?.[0]?.message?.content);
    } else {
      console.log('❌ 测试失败:', response.status);
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

testAPI().catch(console.error);
