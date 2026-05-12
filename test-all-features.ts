/**
 * Cloud Book - 功能测试脚本
 * 2026年5月12日 20:00
 */

import { LLMManager } from './packages/core/src/modules/LLMProvider/LLMManager';
import AIAuditEngine from './packages/core/src/modules/AIAudit/AIAuditEngine';
import CreativeHub from './packages/core/src/modules/CreativeHub/CreativeHub';
import WritingPipeline from './packages/core/src/modules/WritingEngine/WritingPipeline';
import NovelParser from './packages/core/src/modules/NovelParser/NovelParser';

const TEST_CONFIG = {
  baseURL: 'https://gemini.beijixingxing.com/v1',
  apiKey: 'sk-RNxvNNojSg03dxkNsXsky2JolITLq1Ob3ELC2Y49LNFQikkn',
  model: 'deepseek-v4-flash'
};

async function testLLMProvider() {
  console.log('\n========== LLM Provider 测试 ==========\n');

  const llm = new LLMManager();

  llm.addConfig({
    provider: 'deepseek',
    apiKey: TEST_CONFIG.apiKey,
    baseURL: TEST_CONFIG.baseURL,
    model: TEST_CONFIG.model
  });

  try {
    const response = await llm.generate('你好，请用一句话介绍自己', {
      temperature: 0.7,
      maxTokens: 500
    });
    console.log('✅ LLM Provider 测试成功!');
    console.log('模型:', response.model);
    console.log('响应:', response.text.substring(0, 200) + '...');
    return true;
  } catch (error: any) {
    console.log('❌ LLM Provider 测试失败:', error.message);
    return false;
  }
}

async function testAIAuditEngine(llmManager: LLMManager) {
  console.log('\n========== AI Audit Engine 测试 ==========\n');

  const auditEngine = new AIAuditEngine({
    useSemanticAnalysis: true,
    threshold: 0.6
  });

  auditEngine.setLLMProvider({
    generate: async (prompt: string) => {
      const response = await llmManager.generate(prompt, { maxTokens: 1000 });
      return { text: response.text, usage: response.usage };
    }
  });

  const testContent = `
    李明是一个勇敢的战士，他生活在一个神秘的魔法世界里。
    有一天，他遇到了一个强大的敌人，这让他感到非常紧张。
    李明拿起他的剑，决定与敌人战斗。
    经过激烈的战斗，李明成功地击败了敌人。
  `;

  try {
    const result = await auditEngine.audit(testContent, {
      worldState: { protagonist: '李明', location: '魔法世界' },
      particleLedger: [],
      pendingHooks: [],
      chapterSummaries: [],
      subplotBoard: [],
      emotionalArcs: [],
      characterMatrix: []
    });

    console.log('✅ AI Audit Engine 测试成功!');
    console.log('审计通过:', result.passed);
    console.log('综合分数:', result.overallScore);
    console.log('发现的问题数量:', result.issues.length);
    return true;
  } catch (error: any) {
    console.log('❌ AI Audit Engine 测试失败:', error.message);
    return false;
  }
}

async function testCreativeHub(llmManager: LLMManager) {
  console.log('\n========== CreativeHub RAG 测试 ==========\n');

  const creativeHub = new CreativeHub({
    embeddingConfig: {
      provider: 'local',
      endpoint: TEST_CONFIG.baseURL,
      apiKey: TEST_CONFIG.apiKey,
      model: 'deepseek-v4-flash'
    }
  });

  try {
    await creativeHub.addDocument('李明是一个勇敢的战士，擅长使用剑。', {
      type: 'character',
      name: '李明'
    });

    await creativeHub.addDocument('这是一个神秘的魔法世界，有各种各样的魔法生物。', {
      type: 'world',
      name: '魔法世界'
    });

    const results = await creativeHub.search('战士 李明', 5);

    console.log('✅ CreativeHub RAG 测试成功!');
    console.log('搜索结果数量:', results.length);
    if (results.length > 0) {
      console.log('最高匹配分数:', results[0].score.toFixed(4));
    }
    return true;
  } catch (error: any) {
    console.log('❌ CreativeHub RAG 测试失败:', error.message);
    return false;
  }
}

async function testWritingPipeline(llmManager: LLMManager) {
  console.log('\n========== Writing Pipeline 测试 ==========\n');

  const auditEngine = new AIAuditEngine({ threshold: 0.6 });
  const { AntiDetectionEngine } = await import('./packages/core/src/modules/AntiDetection/AntiDetectionEngine');
  const antiDetection = new AntiDetectionEngine();

  auditEngine.setLLMProvider({
    generate: async (prompt: string) => {
      const response = await llmManager.generate(prompt, { maxTokens: 1500 });
      return { text: response.text, usage: response.usage };
    }
  });

  const pipeline = new WritingPipeline(
    llmManager,
    auditEngine,
    antiDetection
  );

  const testProject = {
    id: 'test-project',
    title: '测试小说',
    genre: 'fantasy' as const,
    targetWordCount: 50000,
    chapters: [],
    characters: [{
      id: 'char-1',
      name: '李明',
      role: 'protagonist' as const,
      age: 25,
      gender: 'male' as const,
      personality: '勇敢、坚毅',
      background: '一个普通村庄的少年',
      appearance: '身材高大，眼神锐利',
      speechStyle: '简洁有力',
      relationships: []
    }],
    worldSettings: [{
      id: 'world-1',
      name: '魔法世界',
      description: '一个充满魔法的神秘世界',
      type: 'fantasy' as const
    }],
    outline: '这是一个关于成长和冒险的故事。',
    targetAudience: '15-35岁',
    sellingPoints: ['热血', '冒险', '成长'],
    style: '网络小说风格',
    perspective: 'third',
    tone: 'serious'
  };

  try {
    const result = await pipeline.generateChapter(
      testProject as any,
      1,
      {
        worldState: { protagonist: '李明', location: '魔法世界' },
        particleLedger: [],
        pendingHooks: [],
        chapterSummaries: [],
        subplotBoard: [],
        emotionalArcs: [],
        characterMatrix: []
      },
      { autoAudit: true, autoHumanize: true }
    );

    console.log('✅ Writing Pipeline 测试成功!');
    console.log('生成字数:', result.chapter.wordCount);
    console.log('章节标题:', result.chapter.title);
    console.log('审计通过:', result.auditResult?.passed || false);
    console.log('内容预览:', result.chapter.content.substring(0, 150) + '...');
    return true;
  } catch (error: any) {
    console.log('❌ Writing Pipeline 测试失败:', error.message);
    return false;
  }
}

async function testNovelParser() {
  console.log('\n========== Novel Parser 测试 ==========\n');

  const parser = new NovelParser();

  const testContent = `
    第一章 初入江湖

    李明站在城门前，望着高耸的城墙，心中充满了期待。

    "这就是江湖吗？"他喃喃自语。

    城门口人来人往，各种商贩的吆喝声不绝于耳。李明紧了紧腰间的剑，迈步走进了城门。

    第二章 拜师学艺

    一个月后，李明来到了一座高山脚下。
  `;

  try {
    const result = await parser.parse(testContent);

    console.log('✅ Novel Parser 测试成功!');
    console.log('检测语言:', result.language);
    console.log('检测题材:', result.genre);
    console.log('章节数量:', result.chapters.length);
    console.log('角色数量:', result.characters.length);
    return true;
  } catch (error: any) {
    console.log('❌ Novel Parser 测试失败:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Cloud Book 功能测试                      ║');
  console.log('║   测试时间: 2026-05-12 20:00               ║');
  console.log('╚════════════════════════════════════════════╝');

  const results: Record<string, boolean> = {};

  // 测试1: LLM Provider
  results['LLM Provider'] = await testLLMProvider();

  // 创建LLM Manager实例供其他测试使用
  const llmManager = new LLMManager();
  llmManager.addConfig({
    provider: 'deepseek',
    apiKey: TEST_CONFIG.apiKey,
    baseURL: TEST_CONFIG.baseURL,
    model: TEST_CONFIG.model
  });

  // 测试2: AI Audit Engine
  results['AI Audit Engine'] = await testAIAuditEngine(llmManager);

  // 测试3: CreativeHub RAG
  results['CreativeHub RAG'] = await testCreativeHub(llmManager);

  // 测试4: Writing Pipeline
  results['Writing Pipeline'] = await testWritingPipeline(llmManager);

  // 测试5: Novel Parser
  results['Novel Parser'] = await testNovelParser();

  // 输出总结
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

  if (failed === 0) {
    console.log('  🎉 所有测试通过!');
  } else {
    console.log('  ⚠️  部分测试失败，请检查配置和网络连接');
  }

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
