/**
 * Cloud Book 完整示例
 * 
 * 演示完整的 AI 小说创作流程
 */

import { CloudBook } from '../packages/core/src/CloudBook';
import { LLMManager } from '../packages/core/src/modules/LLMProvider/LLMManager';
import { WritingPipeline, SevenStepResult, EnhancedTruthFiles } from '../packages/core/src/modules/WritingEngine/CompleteWritingPipeline';
import { AgentCoordinator } from '../packages/core/src/modules/AgentSystem/AgentSystem';
import { AIAuditEngine } from '../packages/core/src/modules/AIAudit/AIAuditEngine';
import { AntiDetectionEngine } from '../packages/core/src/modules/AntiDetection/AntiDetectionEngine';

async function main() {
  console.log('=== Cloud Book AI 小说创作平台 ===\n');

  // 1. 初始化 LLM Manager
  const llmManager = new LLMManager();

  // 2. 添加 LLM 配置（用户需要替换为真实的配置）
  console.log('1. 配置 LLM 模型...');
  
  // 示例配置（需要用户替换）
  llmManager.addConfig({
    name: 'deepseek',
    provider: 'deepseek',
    apiKey: 'your-api-key-here',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat'
  });

  llmManager.addConfig({
    name: 'openai',
    provider: 'openai',
    apiKey: 'your-openai-key-here',
    baseURL: 'https://api.openai.com',
    model: 'gpt-4o'
  });

  console.log('✓ LLM 配置完成\n');

  // 3. 创建项目
  console.log('2. 创建小说项目...');
  
  const cloudBook = new CloudBook({
    llmConfigs: []
  });

  const project = await cloudBook.createProject(
    '修仙之旅',
    'xianxia',
    'original'
  );

  console.log('✓ 项目创建成功:', project.title);
  console.log('  题材:', project.genre);
  console.log('  ID:', project.id);
  console.log('');

  // 4. 初始化真相文件
  console.log('3. 初始化真相文件...');
  
  const truthFiles: EnhancedTruthFiles = {
    worldState: {
      currentTime: '第一章开始',
      currentLocation: '青云山脚下',
      currentWeather: '晴朗',
      currentSeason: '初春',
      worldStatus: {
        '主角状态': '刚刚觉醒灵根'
      },
      lastUpdated: new Date()
    },
    resourceLedger: {
      items: {},
      abilities: {
        '基础吐纳术': true
      },
      resources: {},
      lastUpdated: new Date()
    },
    pendingHooks: [],
    subplots: [],
    emotionalArcs: [],
    characterMatrix: [],
    chapterSummaries: [],
    characterProfiles: [],
    worldSetting: {
      '世界观': '修仙世界，境界分炼气、筑基、金丹、元婴...',
      '势力': '青云门、天星宗、魔门...'
    },
    timeline: []
  };

  console.log('✓ 真相文件初始化完成\n');

  // 5. 使用七步创作法创作第一章
  console.log('4. 使用七步创作法创作第一章...\n');
  
  const auditEngine = new AIAuditEngine();
  const antiDetectionEngine = new AntiDetectionEngine();
  const writingPipeline = new WritingPipeline(llmManager, auditEngine, antiDetectionEngine);

  try {
    const sevenStepResult: SevenStepResult = await writingPipeline.runSevenStepCreation(
      project,
      1,
      truthFiles
    );

    console.log('✓ 七步创作法执行完成\n');
    console.log('=== 创作结果 ===\n');
    console.log('第1步 - Constitution:');
    console.log(sevenStepResult.constitution?.output?.substring(0, 500) || '(省略)\n');
    console.log('第2步 - Specify:');
    console.log(sevenStepResult.specify?.output?.substring(0, 500) || '(省略)\n');
    console.log('第3步 - Clarify:');
    console.log(sevenStepResult.clarify?.output?.substring(0, 500) || '(省略)\n');
    console.log('第4步 - Plan:');
    console.log(sevenStepResult.plan?.output?.substring(0, 500) || '(省略)\n');
    console.log('第5步 - Tasks:');
    console.log(sevenStepResult.tasks?.output?.substring(0, 500) || '(省略)\n');
    console.log('第6步 - Write:');
    console.log(sevenStepResult.write?.output?.substring(0, 1000) || '(省略)\n');
    console.log('第7步 - Analyze:');
    console.log(sevenStepResult.analyze?.output?.substring(0, 500) || '(省略)\n');

    if (sevenStepResult.chapter) {
      console.log('=== 完整章节 ===\n');
      console.log(`标题: ${sevenStepResult.chapter.title}`);
      console.log(`字数: ${sevenStepResult.chapter.wordCount}`);
      console.log(`内容预览:\n${sevenStepResult.chapter.content.substring(0, 1500)}...\n`);
    }
  } catch (error) {
    console.log('⚠️ 七步创作法演示: 需要配置真实的 API Key');
    console.log('继续演示其他功能...\n');
  }

  // 6. 演示 Agent 系统
  console.log('5. 初始化 Agent 系统...\n');
  
  const agentCoordinator = new AgentCoordinator(llmManager, auditEngine);
  const allAgents = agentCoordinator.getAllAgents();
  
  console.log('✓ Agent 系统初始化完成');
  console.log('可用 Agent:');
  allAgents.forEach(agent => {
    console.log(`  - ${agent.getAgentName()}: ${agent.getState().status}`);
  });
  console.log('');

  // 7. 演示其他写作模式
  console.log('6. 演示其他写作模式...\n');

  console.log('可用模式:');
  console.log('  - 续写 (Continue Writing)');
  console.log('  - 同人创作 (Fan Fiction)');
  console.log('  - 番外篇 (Side Story)');
  console.log('  - 多视角叙事 (Multi-POV)');
  console.log('  - 批量生成 (Batch Generation)');
  console.log('  - 流式生成 (Streaming Generation)');
  console.log('');

  // 8. 总结
  console.log('=== Cloud Book 功能总结 ===\n');
  console.log('✓ 七步创作法 (Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze)');
  console.log('✓ 6 类 Agent 系统 (Architect, Writer, Auditor, Reviser, StyleEngineer, Radar)');
  console.log('✓ 完整真相文件系统 (WorldState, ResourceLedger, Hooks, Subplots, EmotionalArcs, CharacterMatrix)');
  console.log('✓ 批量生成 (Sequential, Parallel, Adaptive)');
  console.log('✓ 流式生成');
  console.log('✓ 多视角叙事');
  console.log('✓ 同人创作');
  console.log('✓ 番外篇');
  console.log('✓ 33 维度质量审计');
  console.log('✓ 去 AI 味优化');
  console.log('✓ 250+ 模型支持');
  console.log('✓ 30+ 模型提供商');
  console.log('');

  console.log('🚀 Cloud Book 完整示例演示完成！');
  console.log('');
  console.log('注意: 实际使用需要配置真实的 API Key。');
}

main().catch(console.error);
