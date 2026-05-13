/**
 * Cloud Book - 完整功能测试
 * 使用环境变量配置API密钥
 */

const TEST_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: 'deepseek-v4-flash'
};

async function testLLMProvider() {
  console.log('\n========== LLM Provider 测试 ==========\n');

  if (!TEST_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return false;
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
        messages: [{ role: 'user', content: '说"测试成功"' }],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      console.log('❌ LLM Provider 测试失败:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('✅ LLM Provider 测试成功!');
    console.log('模型:', data.model || TEST_CONFIG.model);
    console.log('响应:', data.choices?.[0]?.message?.content);
    return true;
  } catch (error: any) {
    console.log('❌ LLM Provider 测试失败:', error.message);
    return false;
  }
}

testLLMProvider()
  .then(success => {
    console.log('\n测试完成');
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);
