/**
 * Cloud Book - 嵌入测试
 * 使用环境变量配置API密钥
 */

const API_CONFIG = {
  baseURL: process.env.LLM_API_BASE_URL || 'https://gemini.beijixingxing.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: 'bge-m3'
};

async function testEmbedding() {
  console.log('\n========== 测试 Embedding API ==========\n');

  if (!API_CONFIG.apiKey) {
    console.log('❌ 未设置 API 密钥');
    console.log('请设置环境变量: export LLM_API_KEY="your-api-key"');
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        input: '测试文本'
      })
    });

    if (!response.ok) {
      console.log('❌ Embedding API 失败:', response.status);
      return;
    }

    const data = await response.json();
    console.log('✅ Embedding API 可用');
    console.log('向量维度:', data.data?.[0]?.embedding?.length || 0);
  } catch (error) {
    console.log('❌ Embedding API 失败:', error.message);
  }
}

testEmbedding().catch(console.error);
