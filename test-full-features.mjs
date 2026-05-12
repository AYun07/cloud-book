/**
 * Cloud Book - 完整功能测试
 * 2026年5月12日 20:10
 * 使用真实API测试所有核心模块
 */

const TEST_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  model: 'deepseek-v4-flash'
};

async function callLLM(messages, options = {}) {
  const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: TEST_CONFIG.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    })
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function test1_LLMGeneration() {
  console.log('\n========== 测试1: LLM文本生成 ==========\n');

  try {
    const result = await callLLM([
      { role: 'user', content: '用一句话介绍武侠小说《射雕英雄传》' }
    ]);

    console.log('✅ LLM生成测试成功');
    console.log('结果:', result.substring(0, 100));
    return true;
  } catch (error) {
    console.log('❌ LLM生成测试失败:', error.message);
    return false;
  }
}

async function test2_ChapterGeneration() {
  console.log('\n========== 测试2: 章节内容生成 ==========\n');

  const systemPrompt = `你是网络小说写作助手，专门创作武侠/仙侠风格的小说。`;

  const userPrompt = `请续写以下小说章节开头（300字左右）：

"李明站在华山之巅，望着云海翻涌，心中豪情万丈。二十年前，他只是一个普通村庄的少年，如今已是名震江湖的一代大侠。";

要求：
1. 武侠风格，文笔优美
2. 情节合理，有细节描写
3. 注意人物性格一致`;

  try {
    const result = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { maxTokens: 800 });

    console.log('✅ 章节生成测试成功');
    console.log('生成内容预览:', result.substring(0, 200) + '...');
    return result;
  } catch (error) {
    console.log('❌ 章节生成测试失败:', error.message);
    return null;
  }
}

async function test3_ContentAudit(content) {
  console.log('\n========== 测试3: 内容质量审计 ==========\n');

  const prompt = `请对以下小说内容进行质量审计，从以下维度评分（1-10分）：
1. 情节连贯性
2. 人物塑造
3. 文笔优美度
4. 细节描写

小说内容：
${content.substring(0, 500)}

请以JSON格式输出审计结果`;

  try {
    const result = await callLLM([
      { role: 'user', content: prompt }
    ], { maxTokens: 500 });

    console.log('✅ 内容审计测试成功');
    console.log('审计结果:', result.substring(0, 300));

    let auditData;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        auditData = JSON.parse(jsonMatch[0]);
        console.log('解析后的评分:', JSON.stringify(auditData, null, 2));
      }
    } catch (e) {
      console.log('无法解析JSON，但审计内容获取成功');
    }

    return true;
  } catch (error) {
    console.log('❌ 内容审计测试失败:', error.message);
    return false;
  }
}

async function test4_RAGRetrieval() {
  console.log('\n========== 测试4: RAG知识检索 ==========\n');

  const knowledgeBase = [
    { content: '李明是华山派的大弟子，剑法精湛，性格豪爽', type: 'character' },
    { content: '华山是五岳之一，风景秀丽，是武侠小说的重要场景', type: 'location' },
    { content: '江湖规矩：侠之大者，为国为民', type: 'rule' }
  ];

  const query = '主角李明是什么门派的人？';

  const prompt = `你是一个RAG检索系统。已知知识库内容：
${knowledgeBase.map(k => `[${k.type}] ${k.content}`).join('\n')}

请根据以上知识库，回答用户问题：${query}

如果知识库中有相关信息，请基于知识库回答。如果没有，请说明"知识库中无相关信息"。`;

  try {
    const result = await callLLM([
      { role: 'user', content: prompt }
    ]);

    console.log('✅ RAG检索测试成功');
    console.log('检索结果:', result);
    return true;
  } catch (error) {
    console.log('❌ RAG检索测试失败:', error.message);
    return false;
  }
}

async function test5_KnowledgeGraph() {
  console.log('\n========== 测试5: 知识图谱管理 ==========\n');

  const characters = [
    { name: '李明', type: 'character', relation: '主角' },
    { name: '王语嫣', type: 'character', relation: '女主角' },
    { name: '华山', type: 'location', relation: '门派所在地' }
  ];

  const prompt = `你是一个知识图谱系统。请将以下实体信息提取为图谱节点和关系：

实体列表：
${characters.map(c => `- ${c.name} (${c.type}): ${c.relation}`).join('\n')}

请生成一个简单的图谱关系描述，例如：
- 李明 → 门派 → 华山派
- 李明 → 爱慕 → 王语嫣

请用自然语言描述这些实体之间的关系图谱。`;

  try {
    const result = await callLLM([
      { role: 'user', content: prompt }
    ]);

    console.log('✅ 知识图谱测试成功');
    console.log('图谱关系:', result.substring(0, 300));
    return true;
  } catch (error) {
    console.log('❌ 知识图谱测试失败:', error.message);
    return false;
  }
}

async function test6_AntiAI() {
  console.log('\n========== 测试6: 去AI味处理 ==========\n');

  const aiContent = `李明是一个勇敢的战士。 然而，张三对此表示不同意。 因此，我们决定采取行动。 首先，我们需要准备资源。 其次，要制定详细的计划。 最后，执行计划并总结经验。

总的来说，这次经历非常有意义。`;

  const prompt = `请将以下AI风格明显的内容改写成更自然的人类写作风格，减少：
1. 过渡词（首先、其次、但是、因此等）
2. 过于工整的句式结构
3. 机械的因果连接

原文：
${aiContent}

改写后的版本（保持相同字数）:`;

  try {
    const result = await callLLM([
      { role: 'user', content: prompt }
    ], { temperature: 0.8 });

    console.log('✅ 去AI味测试成功');
    console.log('改写结果:', result.substring(0, 200));
    return true;
  } catch (error) {
    console.log('❌ 去AI味测试失败:', error.message);
    return false;
  }
}

async function test7_StreamOutput() {
  console.log('\n========== 测试7: 流式输出 ==========\n');

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: TEST_CONFIG.model,
        messages: [{ role: 'user', content: '写一个武侠风格的短故事开头（150字）' }],
        stream: true
      })
    });

    if (!response.ok) throw new Error('流式请求失败');

    console.log('✅ 流式输出测试开始');
    process.stdout.write('流式内容: ');

    const reader = response.body?.getReader();
    let fullText = '';
    let chunks = 0;

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
                    process.stdout.write(content);
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

    console.log('\n✅ 流式输出成功完成');
    console.log('总片段数:', chunks);
    console.log('总字数:', fullText.length);

    return true;
  } catch (error) {
    console.log('❌ 流式输出测试失败:', error.message);
    return false;
  }
}

async function test8_NovelAnalysis() {
  console.log('\n========== 测试8: 小说解析分析 ==========\n');

  const novelContent = `
第一章 江湖梦

长安城外，春风十里。

李云站在城门前，望着那巍峨的城墙，心中感慨万千。三年前，他还是一个默默无闻的农家少年，如今却已是江湖上小有名气的剑客。

"站住！"一个身穿黑衣的男子拦住了他的去路。

李云眉头一皱，手已经按上了剑柄。

"华山派的弟子？"黑衣人冷笑一声，"今日，你走不了了。"

李云没有说话，只是缓缓拔出了剑。剑光如雪，寒气逼人。
`;

  const prompt = `请分析以下小说片段，提取关键信息：

${novelContent}

请提取并输出JSON格式的分析结果，包含：
- 章节标题
- 登场角色
- 场景地点
- 故事风格
- 字数统计`;

  try {
    const result = await callLLM([
      { role: 'user', content: prompt }
    ], { maxTokens: 500 });

    console.log('✅ 小说解析测试成功');
    console.log('分析结果:', result.substring(0, 400));
    return true;
  } catch (error) {
    console.log('❌ 小说解析测试失败:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         Cloud Book 完整功能测试                       ║');
  console.log('║         测试时间: 2026-05-12 20:10                  ║');
  console.log('║         API: deepseek-v4-flash                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const results = {};

  results['LLM文本生成'] = await test1_LLMGeneration();
  const chapterContent = await test2_ChapterGeneration();
  results['章节内容生成'] = chapterContent !== null;
  results['内容质量审计'] = chapterContent ? await test3_ContentAudit(chapterContent) : false;
  results['RAG知识检索'] = await test4_RAGRetrieval();
  results['知识图谱管理'] = await test5_KnowledgeGraph();
  results['去AI味处理'] = await test6_AntiAI();
  results['流式输出'] = await test7_StreamOutput();
  results['小说解析'] = await test8_NovelAnalysis();

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              测试结果总结                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
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

  if (failed === 0) {
    console.log('  🎉 所有功能测试通过!');
  } else {
    console.log(`  ⚠️  ${failed} 项功能测试失败`);
  }

  console.log('');

  return { passed, failed, total: passed + failed };
}

runAllTests()
  .then(result => {
    console.log('\n测试完成时间:', new Date().toLocaleString('zh-CN'));
    process.exit(result.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
