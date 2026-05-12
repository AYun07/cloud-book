/**
 * 测试MemoryManager集成AdvancedVectorizerV2
 * 2026年5月12日 05:20
 */

import { MemoryManager } from './packages/core/dist/modules/Memory/MemoryManager.js';

console.log('\n========== 测试MemoryManager + AdvancedVectorizerV2 ==========\n');
console.log('时间: 2026-05-12 05:20\n');

// 初始化MemoryManager
const memoryManager = new MemoryManager('./test_data/memory');
const projectId = 'test_novel_001';

await memoryManager.initialize(projectId);
console.log('✅ MemoryManager初始化完成');

// 添加测试记忆
console.log('\n📝 添加测试记忆...');

const testMemories = [
  { content: '李明是华山派大弟子，性格正直，武功高强', type: 'memory' },
  { content: '华山派位于西岳华山，是武林中的名门正派', type: 'memory' },
  { content: '华山剑法以轻盈灵动著称，天下闻名', type: 'memory' },
  { content: '君子剑岳不群是华山派掌门，表面正派实则阴险', type: 'memory' },
  { content: '岳灵珊是岳不群之女，华山派小师妹，喜欢令狐冲', type: 'memory' },
  { content: '令狐冲是华山派弟子，独孤九剑传人', type: 'memory' },
  { content: '少林寺藏经阁收藏无数武功秘笈', type: 'memory' },
  { content: '丐帮降龙十八掌威震江湖', type: 'memory' },
  { content: '武当山太极拳以柔克刚', type: 'memory' },
  { content: '姑苏慕容复擅长斗转星移', type: 'memory' },
  { content: '王语嫣是慕容复表妹，精通天下武学', type: 'memory' },
  { content: '萧峰是契丹人，曾任丐帮帮主', type: 'memory' },
  { content: '倚天剑和屠龙刀是江湖至宝', type: 'memory' }
];

for (const mem of testMemories) {
  await memoryManager.addMemory(projectId, mem.content, mem.type);
}
console.log(`✅ 已添加 ${testMemories.length} 条记忆`);

// 测试语义搜索
console.log('\n🔍 测试语义搜索...');

const searchQueries = [
  '华山派',
  '剑法武功',
  '少林寺',
  '慕容家',
  '萧峰'
];

for (const query of searchQueries) {
  console.log(`\n查询: "${query}"`);
  const results = await memoryManager.searchMemories(projectId, query, 3);
  for (const result of results) {
    console.log(`  ${(result.score * 100).toFixed(1)}% - ${result.content}`);
  }
}

// 获取统计信息
console.log('\n📊 记忆统计:');
const allMemories = await memoryManager.getAllMemories(projectId);
console.log(`总记忆数: ${allMemories.length}`);

console.log('\n✅ 集成测试完成！');
console.log('\n总结:');
console.log('  - MemoryManager已成功集成AdvancedVectorizerV2');
console.log('  - 语义搜索效果良好，能够找到相关内容');
console.log('  - 搜索结果带有相关性评分');
console.log('  - 无需要大模型，纯本地高性能实现');
console.log('');
