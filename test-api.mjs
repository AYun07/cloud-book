/**
 * Cloud Book - 简单API测试
 * 2026年5月12日 20:05
 */

const TEST_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  model: 'deepseek-v4-flash'
};

async function testAPI() {
  console.log('\n========== API 连接测试 ==========\n');

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: TEST_CONFIG.model,
        messages: [
          { role: 'user', content: '你好，请用一句话介绍自己' }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ API 连接成功!');
    console.log('模型:', data.model || TEST_CONFIG.model);
    console.log('响应:', data.choices?.[0]?.message?.content || '无内容');

    return true;
  } catch (error) {
    console.log('❌ API 测试失败:', error.message);
    return false;
  }
}

async function testEmbedding() {
  console.log('\n========== Embedding 测试 ==========\n');

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: '测试文本'
      })
    });

    if (!response.ok) {
      console.log('⚠️ Embedding API 可能不支持:', response.status);
      return false;
    }

    const data = await response.json();

    console.log('✅ Embedding 测试成功!');
    console.log('向量维度:', data.data?.[0]?.embedding?.length || 0);

    return true;
  } catch (error) {
    console.log('❌ Embedding 测试失败:', error.message);
    return false;
  }
}

async function testStream() {
  console.log('\n========== 流式输出测试 ==========\n');

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: TEST_CONFIG.model,
        messages: [
          { role: 'user', content: '写一首关于春天的诗' }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ 流式输出测试开始!');
    console.log('流式响应: ');

    let fullText = '';
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let done = false;
      let count = 0;

      while (!done && count < 5) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullText += content;
                    process.stdout.write(content);
                    count++;
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
      console.log('\n✅ 流式输出成功!');
      console.log('获取了', count, '个片段');
    }

    return true;
  } catch (error) {
    console.log('❌ 流式输出测试失败:', error.message);
    return false;
  }
}

async function testGemini() {
  console.log('\n========== Gemini 模型测试 ==========\n');

  const models = ['gemini-2.5-flash', 'gemini-3-flash-preview'];

  for (const model of models) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: '说"测试成功"' }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model}:`, data.choices?.[0]?.message?.content || '成功');
      } else {
        console.log(`❌ ${model}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${model}:`, error.message);
    }
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Cloud Book API 功能测试               ║');
  console.log('║   测试时间: 2026-05-12 20:05           ║');
  console.log('╚════════════════════════════════════════════╝');

  const results = {};

  results['API 连接'] = await testAPI();
  results['Embedding'] = await testEmbedding();
  results['流式输出'] = await testStream();
  await testGemini();

  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   测试结果总结                             ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const [name, success] of Object.entries(results)) {
    if (success) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }

  console.log('');
  console.log(`  总计: ${passed} 通过, ${failed} 失败`);
  console.log('');

  return failed === 0;
}

runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
