/**
 * Cloud Book - 使用示例
 * 展示如何使用 Cloud Book 核心引擎
 */

import { 
  CloudBook, 
  LLMConfig, 
  ModelRoute, 
  Genre,
  WritingOptions 
} from '@cloud-book/core';

/**
 * 示例1: 基础使用 - 创建原创小说项目
 */
async function example1_createOriginalProject() {
  const config = {
    llmConfigs: [
      {
        name: 'openai-gpt4',
        provider: 'openai' as const,
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || 'your-api-key'
      },
      {
        name: 'anthropic-claude',
        provider: 'anthropic' as const,
        model: 'claude-3-sonnet-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key'
      }
    ],
    modelRoutes: [
      { task: 'writing', llmConfig: { name: 'openai-gpt4', provider: 'openai', model: 'gpt-4', apiKey: '' } },
      { task: 'revision', llmConfig: { name: 'anthropic-claude', provider: 'anthropic', model: 'claude-3-sonnet-20240229', apiKey: '' } },
      { task: 'planning', llmConfig: { name: 'openai-gpt4', provider: 'openai', model: 'gpt-4', apiKey: '' } }
    ],
    auditConfig: {
      dimensions: [],
      threshold: 0.7,
      autoFix: true,
      maxIterations: 3
    },
    antiDetectionConfig: {
      enabled: true,
      intensity: 5,
      replaceAIWords: true,
      varySentenceStructure: true,
      addColloquialism: true,
      enhanceEmotion: true,
      addImperfection: true
    },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const project = await cloudBook.createProject(
    '修仙者的崛起',
    'xianxia' as Genre,
    'original'
  );

  console.log('项目创建成功:', project.id);
  return project;
}

/**
 * 示例2: 生成章节
 */
async function example2_generateChapter(projectId: string) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const options: WritingOptions = {
    targetWordCount: 2500,
    autoAudit: true,
    autoHumanize: true,
    chapterGuidance: '主角正在山谷中发现了一个神秘的古洞'
  };

  const chapter = await cloudBook.generateChapter(projectId, 1, options);
  
  console.log('章节生成成功!');
  console.log('标题:', chapter.title);
  console.log('字数:', chapter.wordCount);
  console.log('状态:', chapter.status);
  
  return chapter;
}

/**
 * 示例3: 导入并分析现有小说
 */
async function example3_importNovel(filePath: string) {
  const config = {
    llmConfigs: [],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const parseResult = await cloudBook.importNovel(filePath);

  console.log('小说分析完成!');
  console.log('标题:', parseResult.title);
  console.log('作者:', parseResult.author);
  console.log('预估字数:', parseResult.estimatedWordCount);
  console.log('章节数:', parseResult.chapters.length);
  console.log('提取角色数:', parseResult.characters.length);

  return parseResult;
}

/**
 * 示例4: 基于原作创建仿写项目
 */
async function example4_createImitationProject(parseResult: any) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const project = await cloudBook.createImitationProject(
    parseResult,
    'imitation' as any,
    70
  );

  console.log('仿写项目创建成功!');
  console.log('风格指纹已提取:', project.styleFingerprint?.dialogueRatio);
  
  return project;
}

/**
 * 示例5: 批量生成章节
 */
async function example5_batchGenerate(projectId: string) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const chapters = await cloudBook.batchGenerateChapters(
    projectId,
    1,
    10,
    {
      targetWordCount: 2500,
      autoAudit: true,
      parallelCount: 3
    }
  );

  console.log(`批量生成完成! 共生成 ${chapters.length} 章`);
  
  return chapters;
}

/**
 * 示例6: 审计章节质量
 */
async function example6_auditChapter(projectId: string, chapterId: string) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const auditResult = await cloudBook.auditChapter(projectId, chapterId);

  console.log('审计结果:', auditResult.passed ? '通过' : '未通过');
  console.log('质量分数:', auditResult.score);
  console.log('发现问题:', auditResult.issues.length);
  
  return auditResult;
}

/**
 * 示例7: 去AI味处理
 */
async function example7_humanize(text: string) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 7 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const humanized = await cloudBook.humanize(text);

  console.log('去AI味处理完成!');
  console.log('原始长度:', text.length);
  console.log('处理后长度:', humanized.length);
  
  return humanized;
}

/**
 * 示例8: 多语言支持
 */
async function example8_multilanguage() {
  const config = {
    llmConfigs: [],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects',
    i18nConfig: {
      primaryLanguage: 'zh-CN',
      fallbackLanguage: 'en-US',
      autoDetect: true
    }
  };

  const cloudBook = new CloudBook(config);

  cloudBook.setLanguage('ja-JP');
  
  const supportedLanguages = cloudBook.getSupportedLanguages();
  console.log('支持的语言:', supportedLanguages.length);

  const detected = cloudBook.detectLanguage('Hello, this is a test');
  console.log('检测结果:', detected);

  const grammarCheck = await cloudBook.checkGrammar('This are a test');
  console.log('语法检查:', grammarCheck);
  
  return { supportedLanguages, detected, grammarCheck };
}

/**
 * 示例9: 使用七步创作法
 */
async function example9_sevenStepMethodology(projectId: string) {
  const config = {
    llmConfigs: [{
      name: 'default',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    }],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  const constitutionResult = await cloudBook.executeMethodologyStep(
    projectId,
    'constitution' as any,
    { genre: 'fantasy' }
  );
  console.log('宪章制定:', constitutionResult.message);

  const specifyResult = await cloudBook.executeMethodologyStep(
    projectId,
    'specify' as any,
    { title: '我的奇幻小说' }
  );
  console.log('规格说明:', specifyResult.message);

  const planResult = await cloudBook.executeMethodologyStep(
    projectId,
    'plan' as any,
    { targetChapters: 50 }
  );
  console.log('规划制定:', planResult.message);

  return { constitutionResult, specifyResult, planResult };
}

/**
 * 示例10: 离线模式配置
 */
async function example10_offlineMode() {
  const config = {
    llmConfigs: [],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects',
    connectionMode: 'offline' as const,
    localAPIConfig: {
      port: 8080,
      apiKeys: [
        { provider: 'openai', key: process.env.OPENAI_API_KEY || '' },
        { provider: 'deepseek', key: process.env.DEEPSEEK_API_KEY || '' }
      ]
    }
  };

  const cloudBook = new CloudBook(config);

  const networkStatus = await cloudBook.getNetworkStatus();
  console.log('网络状态:', networkStatus);

  const isOnline = await cloudBook.checkConnection();
  console.log('在线:', isOnline);
  
  return { networkStatus, isOnline };
}

/**
 * 示例11: 版本历史管理
 */
async function example11_versionHistory(projectId: string) {
  const config = {
    llmConfigs: [],
    modelRoutes: [],
    auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
    antiDetectionConfig: { enabled: true, intensity: 5 },
    storagePath: './cloud-book-projects'
  };

  const cloudBook = new CloudBook(config);

  await cloudBook.createVersion(
    projectId,
    '第一章的初始版本内容...',
    '初始版本'
  );

  const history = await cloudBook.getVersionHistory(projectId, 10);
  console.log('版本历史:', history.length, '个版本');

  const branch = await cloudBook.createBranch(
    projectId,
    '实验性修改分支',
    '测试新的情节走向'
  );
  console.log('分支创建:', branch.id);

  const cacheStats = await cloudBook.getCacheStats();
  console.log('缓存统计:', cacheStats);

  return { history, branch, cacheStats };
}

/**
 * 运行示例
 */
async function main() {
  console.log('=== Cloud Book 使用示例 ===\n');

  try {
    const project = await example1_createOriginalProject();
    console.log('\n--- 示例1完成 ---\n');

    await example2_generateChapter(project.id);
    console.log('\n--- 示例2完成 ---\n');

  } catch (error) {
    console.error('示例执行出错:', error);
  }
}

main();
