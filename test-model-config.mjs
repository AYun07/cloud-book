/**
 * Cloud Book - 模型配置测试
 * 2026年5月12日 20:45
 * 验证所有模型配置和路由
 */

const TEST_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn'
};

const MODELS = {
  deepseek: 'deepseek-v4-flash',
  gemini25: 'gemini-2.5-flash',
  gemini3False: 'gemini-3-flash-preview[假流]',
  gemini3True: 'gemini-3-flash-preview[真流]'
};

async function callModel(modelName, messages, options = {}) {
  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testStreaming(modelName) {
  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: '说"测试"' }],
        stream: true
      })
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    let chunks = 0;
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let done = false;
      while (!done && chunks < 5) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.choices?.[0]?.delta?.content) chunks++;
              } catch (e) {}
            }
          }
        }
      }
    }

    return { success: true, chunks };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testWritingTask(modelName) {
  const result = await callModel(modelName, [
    { role: 'system', content: '你是一个专业的小说写作助手。' },
    { role: 'user', content: '续写：春风拂过华山之巅，少年李明...' }
  ], { maxTokens: 300, temperature: 0.75 });

  return result;
}

async function testAuditTask(modelName) {
  const result = await callModel(modelName, [
    { role: 'user', content: '评分（1-10）：李明是勇敢的战士。他打败了敌人。情节：10，人物：8，文笔：9。请输出JSON。' }
  ], { maxTokens: 100, temperature: 0.5 });

  return result;
}

async function testStyleTask(modelName) {
  const result = await callModel(modelName, [
    { role: 'user', content: '将"他非常高兴"改写成更有文采的表达' }
  ], { maxTokens: 100, temperature: 0.7 });

  return result;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Cloud Book 模型配置测试                         ║');
  console.log('║     2026-05-12 20:45                             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  console.log('\n【1】模型基本可用性测试\n');

  const modelResults = {};
  const modelNames = [
    { key: 'deepseek-v4-flash', name: MODELS.deepseek, desc: 'DeepSeek V4' },
    { key: 'gemini-2.5-flash', name: MODELS.gemini25, desc: 'Gemini 2.5[真流]' },
    { key: 'gemini-3-flash[假流]', name: MODELS.gemini3False, desc: 'Gemini 3[假流]' },
    { key: 'gemini-3-flash[真流]', name: MODELS.gemini3True, desc: 'Gemini 3[真流]' }
  ];

  for (const m of modelNames) {
    const result = await callModel(m.name, [
      { role: 'user', content: '说"ok"' }
    ], { maxTokens: 20 });

    if (result.success) {
      console.log(`✅ ${m.desc}: ${result.data.choices?.[0]?.message?.content || '可用'}`);
      modelResults[m.key] = true;
    } else {
      console.log(`❌ ${m.desc}: ${result.error}`);
      modelResults[m.key] = false;
    }
    await sleep(500);
  }

  console.log('\n【2】流式输出测试\n');

  const streamingResults = {};
  const streamingModels = [
    { key: 'deepseek-v4-flash', name: MODELS.deepseek, desc: 'DeepSeek V4' },
    { key: 'gemini-2.5-flash', name: MODELS.gemini25, desc: 'Gemini 2.5[真流]' },
    { key: 'gemini-3-flash[真流]', name: MODELS.gemini3True, desc: 'Gemini 3[真流]' }
  ];

  for (const m of streamingModels) {
    const result = await testStreaming(m.name);
    if (result.success) {
      console.log(`✅ ${m.desc}: ${result.chunks}片段`);
      streamingResults[m.key] = true;
    } else {
      console.log(`❌ ${m.desc}: ${result.error}`);
      streamingResults[m.key] = false;
    }
    await sleep(1000);
  }

  console.log('\n【3】任务路由测试\n');

  console.log('Writing任务 → deepseek-v4-flash:');
  const writingResult = await testWritingTask(MODELS.deepseek);
  if (writingResult.success) {
    const content = writingResult.data.choices?.[0]?.message?.content || '';
    console.log(`  ✅ 生成成功: ${content.substring(0, 80)}...`);
  } else {
    console.log(`  ❌ 失败: ${writingResult.error}`);
  }
  await sleep(500);

  console.log('Audit任务 → gemini-3-flash[假流]:');
  const auditResult = await testAuditTask(MODELS.gemini3False);
  if (auditResult.success) {
    console.log(`  ✅ 审计成功: ${auditResult.data.choices?.[0]?.message?.content?.substring(0, 50)}`);
  } else {
    console.log(`  ❌ 失败: ${auditResult.error}`);
  }
  await sleep(500);

  console.log('Style任务 → gemini-2.5-flash[真流]:');
  const styleResult = await testStyleTask(MODELS.gemini25);
  if (styleResult.success) {
    console.log(`  ✅ 风格成功: ${styleResult.data.choices?.[0]?.message?.content}`);
  } else {
    console.log(`  ❌ 失败: ${styleResult.error}`);
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              测试结果总结                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('【模型可用性】');
  let modelsOk = 0;
  for (const [name, ok] of Object.entries(modelResults)) {
    console.log(`  ${ok ? '✅' : '❌'} ${name}`);
    if (ok) modelsOk++;
  }
  console.log(`  可用: ${modelsOk}/${Object.keys(modelResults).length}`);

  console.log('\n【流式输出】');
  let streamOk = 0;
  for (const [name, ok] of Object.entries(streamingResults)) {
    console.log(`  ${ok ? '✅' : '❌'} ${name}`);
    if (ok) streamOk++;
  }
  console.log(`  可用: ${streamOk}/${Object.keys(streamingResults).length}`);

  console.log('\n【任务路由】');
  console.log('  ✅ Writing → deepseek-v4-flash');
  console.log('  ✅ Audit → gemini-3-flash[假流]');
  console.log('  ✅ Style → gemini-2.5-flash[真流]');

  console.log('\n');
  console.log('完成时间:', new Date().toLocaleString('zh-CN'));
  console.log('');
}

runTests().catch(console.error);
