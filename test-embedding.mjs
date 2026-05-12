/**
 * 测试 bge-m3 嵌入模型
 * 2026年5月12日 04:58
 */

const API_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  model: 'bge-m3[嵌入]'
};

async function testEmbedding() {
  console.log('\n========== 测试 bge-m3 嵌入模型 ==========\n');
  console.log('API:', API_CONFIG.baseURL);
  console.log('模型:', API_CONFIG.model);
  console.log('');

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        input: '测试文本：李明是一个勇敢的战士'
      })
    });

    console.log('HTTP状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('错误响应:', errorText.substring(0, 500));
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].embedding) {
      const embedding = data.data[0].embedding;
      console.log('✅ 嵌入成功!');
      console.log('向量维度:', embedding.length);
      console.log('前10个值:', embedding.slice(0, 10));
      return { success: true, dimensions: embedding.length };
    } else {
      console.log('响应结构:', JSON.stringify(data).substring(0, 500));
      return { success: false, error: 'No embedding in response' };
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

async function testBatchEmbedding() {
  console.log('\n========== 测试批量嵌入 ==========\n');

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        input: [
          '李明是华山派大弟子',
          '华山是五岳之一',
          '江湖规矩：侠之大者'
        ]
      })
    });

    if (!response.ok) {
      console.log('❌ 批量嵌入失败:', response.status);
      return { success: false };
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      console.log('✅ 批量嵌入成功!');
      console.log('嵌入数量:', data.data.length);
      for (let i = 0; i < data.data.length; i++) {
        console.log(`  文本${i+1}维度:`, data.data[i].embedding.length);
      }
      return { success: true, count: data.data.length };
    }

    return { success: false };
  } catch (error) {
    console.log('❌ 批量嵌入失败:', error.message);
    return { success: false };
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     BGE-M3 嵌入模型测试                  ║');
  console.log('║     2026-05-12 04:58                     ║');
  console.log('╚════════════════════════════════════════════╝');

  const result1 = await testEmbedding();
  
  if (result1.success) {
    await testBatchEmbedding();
  }

  console.log('\n');
  console.log('【测试结果】');
  if (result1.success) {
    console.log('  ✅ bge-m3 嵌入模型可用');
    console.log('  ✅ 向量维度:', result1.dimensions);
  } else {
    console.log('  ❌ bge-m3 嵌入模型不可用');
    console.log('  → 将使用基础向量方案（无需LLM）');
  }
  console.log('');
}

runTests().catch(console.error);
