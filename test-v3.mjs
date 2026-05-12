/**
 * Cloud Book - 完整功能测试 V2
 * 2026年5月12日 20:30
 * 使用用户提供的所有模型进行测试
 */

const TEST_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  models: {
    deepseekV4Flash: 'deepseek-v4-flash',
    gemini25Flash: 'gemini-2.5-flash',
    gemini3FalseStream: 'gemini-3-flash-preview[假流]',
    gemini3TrueStream: 'gemini-3-flash-preview[真流]'
  }
};

async function callAPI(model, messages, options = {}) {
  const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: options.stream || false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API错误 ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testModel(modelName, description) {
  console.log(`\n========== 测试: ${modelName} (${description}) ==========\n`);

  try {
    const data = await callAPI(modelName, [
      { role: 'user', content: '说"测试成功"，不需要多余的话' }
    ], { maxTokens: 50 });

    console.log('✅ 模型可用');
    console.log('响应:', data.choices?.[0]?.message?.content || '无内容');
    return { success: true, model: data.model || modelName };
  } catch (error) {
    console.log('❌ 模型不可用:', error.message.substring(0, 100));
    return { success: false, error: error.message };
  }
}

async function testStreaming(modelName) {
  console.log(`\n========== 流式测试: ${modelName} ==========\n`);

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: '写一句关于春天的诗' }],
        stream: true
      })
    });

    if (!response.ok) {
      console.log('❌ 流式请求失败:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }

    console.log('✅ 流式连接成功，开始接收数据...');

    const reader = response.body?.getReader();
    let chunks = 0;
    let fullText = '';

    if (reader) {
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
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
                    chunks++;
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    }

    console.log('✅ 流式输出完成');
    console.log('片段数:', chunks, '| 字数:', fullText.length);
    console.log('内容:', fullText.substring(0, 100));

    return { success: chunks > 0, chunks, length: fullText.length };
  } catch (error) {
    console.log('❌ 流式测试失败:', error.message.substring(0, 100));
    return { success: false, error: error.message };
  }
}

async function testLLMGeneration() {
  console.log('\n========== 测试: LLM文本生成 ==========\n');

  try {
    const data = await callAPI(TEST_CONFIG.models.deepseekV4Flash, [
      { role: 'system', content: '你是一个专业的小说写作助手。' },
      { role: 'user', content: '请续写以下小说开头（200字）：李明站在华山之巅，望着云海翻涌...' }
    ], { maxTokens: 500 });

    console.log('✅ LLM生成成功');
    console.log('生成内容:', data.choices?.[0]?.message?.content?.substring(0, 150) + '...');
    return true;
  } catch (error) {
    console.log('❌ LLM生成失败:', error.message.substring(0, 100));
    return false;
  }
}

async function testContentAudit(content) {
  console.log('\n========== 测试: 内容质量审计 ==========\n');

  const prompt = `请审计以下小说内容，从情节、人物、文笔三个维度评分（1-10分）：

${content.substring(0, 300)}

请只输出JSON格式：{"情节":X,"人物":X,"文笔":X}`;

  try {
    const data = await callAPI(TEST_CONFIG.models.deepseekV4Flash, [
      { role: 'user', content: prompt }
    ], { maxTokens: 100 });

    const response = data.choices?.[0]?.message?.content || '';
    console.log('✅ 审计完成');
    console.log('结果:', response.substring(0, 100));
    return true;
  } catch (error) {
    console.log('❌ 审计失败:', error.message.substring(0, 100));
    return false;
  }
}

async function testRAGRetrieval() {
  console.log('\n========== 测试: RAG知识检索 ==========\n');

  const knowledge = [
    '李明是华山派大弟子，剑法精湛',
    '华山是五岳之一，风景秀丽',
    '江湖规矩：侠之大者，为国为民'
  ];

  const prompt = `知识库：
${knowledge.map((k, i) => `[${i+1}] ${k}`).join('\n')}

问题：主角李明是哪个门派的？

请基于知识库回答。`;

  try {
    const data = await callAPI(TEST_CONFIG.models.deepseekV4Flash, [
      { role: 'user', content: prompt }
    ], { maxTokens: 200 });

    console.log('✅ RAG检索成功');
    console.log('答案:', data.choices?.[0]?.message?.content?.substring(0, 100));
    return true;
  } catch (error) {
    console.log('❌ RAG检索失败:', error.message.substring(0, 100));
    return false;
  }
}

async function testEmbedding() {
  console.log('\n========== 测试: Embedding生成 ==========\n');

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

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Embedding API可用');
      console.log('向量维度:', data.data?.[0]?.embedding?.length || 0);
      return { success: true, dimensions: data.data?.[0]?.embedding?.length || 0 };
    } else {
      console.log('⚠️ Embedding API返回:', response.status);
      console.log('将使用LLM模拟Embedding...');
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('⚠️ Embedding API不可用:', error.message.substring(0, 50));
    console.log('将使用LLM模拟Embedding');
    return { success: false, fallback: true };
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Cloud Book V3 完整功能测试                    ║');
  console.log('║     测试时间: 2026-05-12 20:30                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const results = {};

  console.log('\n【1】模型可用性测试\n');
  const modelTests = [
    { name: TEST_CONFIG.models.deepseekV4Flash, desc: 'DeepSeek V4 Flash (推荐)' },
    { name: TEST_CONFIG.models.gemini25Flash, desc: 'Gemini 2.5 Flash (真流)' },
    { name: TEST_CONFIG.models.gemini3FalseStream, desc: 'Gemini 3 Flash Preview (假流)' },
    { name: TEST_CONFIG.models.gemini3TrueStream, desc: 'Gemini 3 Flash Preview (真流)' }
  ];

  for (const m of modelTests) {
    results[m.name] = await testModel(m.name, m.desc);
    await sleep(1000);
  }

  console.log('\n【2】流式输出测试\n');
  const streamingTests = [
    { name: TEST_CONFIG.models.deepseekV4Flash, desc: 'DeepSeek V4 Flash' },
    { name: TEST_CONFIG.models.gemini25Flash, desc: 'Gemini 2.5 Flash' },
    { name: TEST_CONFIG.models.gemini3TrueStream, desc: 'Gemini 3 (真流)' }
  ];

  for (const m of streamingTests) {
    results[`stream_${m.name}`] = await testStreaming(m.name);
    await sleep(2000);
  }

  console.log('\n【3】核心功能测试\n');

  results['LLM生成'] = await testLLMGeneration();
  await sleep(1000);

  const testContent = '李明站在华山之巅，望着云海翻涌。二十年前，他只是一个普通少年，如今已是名震江湖的大侠。山风猎猎，吹动他青衫作响。';
  results['内容审计'] = await testContentAudit(testContent);
  await sleep(1000);

  results['RAG检索'] = await testRAGRetrieval();
  await sleep(1000);

  results['Embedding'] = await testEmbedding();

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              测试结果总结                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('【模型可用性】');
  let modelsWorking = 0;
  for (const m of modelTests) {
    const result = results[m.name];
    if (result?.success) {
      console.log(`  ✅ ${m.name}`);
      modelsWorking++;
    } else {
      console.log(`  ❌ ${m.name}`);
    }
  }
  console.log(`  模型可用: ${modelsWorking}/${modelTests.length}`);

  console.log('\n【流式输出】');
  let streamsWorking = 0;
  for (const m of streamingTests) {
    const result = results[`stream_${m.name}`];
    if (result?.success) {
      console.log(`  ✅ ${m.name} (${result.chunks}片段)`);
      streamsWorking++;
    } else {
      console.log(`  ❌ ${m.name}`);
    }
  }
  console.log(`  流式可用: ${streamsWorking}/${streamingTests.length}`);

  console.log('\n【核心功能】');
  const coreTests = ['LLM生成', '内容审计', 'RAG检索'];
  for (const test of coreTests) {
    if (results[test]) {
      console.log(`  ✅ ${test}`);
    } else {
      console.log(`  ❌ ${test}`);
    }
  }

  console.log('\n【Embedding】');
  if (results['Embedding']?.success) {
    console.log(`  ✅ API可用 (${results['Embedding'].dimensions}维)`);
  } else if (results['Embedding']?.fallback) {
    console.log(`  ⚠️  API不可用 (使用LLM模拟)`);
  } else {
    console.log(`  ❌ API不可用`);
  }

  console.log('');

  const totalSuccess = modelsWorking + streamsWorking;
  if (totalSuccess >= 4) {
    console.log('  🎉 测试通过！Cloud Book V3 已就绪');
  } else {
    console.log(`  ⚠️  部分测试失败 (${totalSuccess}项通过)`);
  }

  console.log('');

  return results;
}

runAllTests()
  .then(results => {
    console.log('\n测试完成时间:', new Date().toLocaleString('zh-CN'));
  })
  .catch(error => {
    console.error('测试失败:', error);
  });
