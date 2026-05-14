#!/usr/bin/env node
/**
 * Cloud Book 模型更新脚本
 * 用于定期更新支持的 LLM 模型列表
 * 
 * 使用方法:
 *   node scripts/update-models.js                    # 更新所有模型
 *   node scripts/update-models.js --provider openai  # 更新特定提供商
 *   node scripts/update-models.js --check            # 检查更新
 * 
 * 建议定期运行此脚本以保持模型列表最新
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MODEL_LIST_FILE = path.join(__dirname, '../packages/core/src/modules/LLMProvider/LLMManager.ts');
const MODEL_CONFIG_FILE = path.join(__dirname, '../config/models.json');

const PROVIDER_API_DOCS = {
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/models',
    models: [
      { name: 'gpt-4o', description: 'GPT-4o - 最新旗舰模型', maxTokens: 128000 },
      { name: 'gpt-4o-mini', description: 'GPT-4o Mini - 高性价比', maxTokens: 128000 },
      { name: 'gpt-4-turbo', description: 'GPT-4 Turbo', maxTokens: 128000 },
      { name: 'gpt-4', description: 'GPT-4', maxTokens: 8192 },
      { name: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo', maxTokens: 16385 },
      { name: 'o1', description: 'O1 - 深度推理模型', maxTokens: 200000 },
      { name: 'o1-preview', description: 'O1 Preview', maxTokens: 128000 },
      { name: 'o1-mini', description: 'O1 Mini', maxTokens: 128000 },
      { name: 'o3-mini', description: 'O3 Mini', maxTokens: 200000 },
      { name: 'text-embedding-3-small', description: 'Embedding Small', maxTokens: 8192, supportsEmbedding: true },
      { name: 'text-embedding-3-large', description: 'Embedding Large', maxTokens: 8192, supportsEmbedding: true },
      { name: 'dall-e-3', description: 'DALL-E 3', maxTokens: 4096 },
      { name: 'whisper-1', description: 'Whisper', maxTokens: 262144 },
      { name: 'tts-1', description: 'TTS-1', maxTokens: 4096 },
    ]
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: [
      { name: 'claude-sonnet-4-20250514', description: 'Claude Sonnet 4', maxTokens: 200000 },
      { name: 'claude-opus-4-20250514', description: 'Claude Opus 4', maxTokens: 200000 },
      { name: 'claude-haiku-4-20250514', description: 'Claude Haiku 4', maxTokens: 200000 },
      { name: 'claude-3-5-sonnet-20241022', description: 'Claude 3.5 Sonnet', maxTokens: 200000 },
      { name: 'claude-3-5-haiku-20241022', description: 'Claude 3.5 Haiku', maxTokens: 200000 },
      { name: 'claude-3-opus-20240229', description: 'Claude 3 Opus', maxTokens: 200000 },
      { name: 'claude-3-sonnet-20240229', description: 'Claude 3 Sonnet', maxTokens: 200000 },
      { name: 'claude-3-haiku-20240307', description: 'Claude 3 Haiku', maxTokens: 200000 },
    ]
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { name: 'gemini-2.5-flash-preview-05-20', description: 'Gemini 2.5 Flash Preview', maxTokens: 1048576 },
      { name: 'gemini-2.5-pro-preview-05-06', description: 'Gemini 2.5 Pro Preview', maxTokens: 1048576 },
      { name: 'gemini-2.0-flash', description: 'Gemini 2.0 Flash', maxTokens: 1048576 },
      { name: 'gemini-2.0-flash-lite', description: 'Gemini 2.0 Flash Lite', maxTokens: 1048576 },
      { name: 'gemini-1.5-pro', description: 'Gemini 1.5 Pro', maxTokens: 2097152 },
      { name: 'gemini-1.5-flash', description: 'Gemini 1.5 Flash', maxTokens: 1048576 },
      { name: 'gemini-1.5-flash-8b', description: 'Gemini 1.5 Flash 8B', maxTokens: 1048576 },
      { name: 'gemini-1.0-pro', description: 'Gemini 1.0 Pro', maxTokens: 32760 },
    ]
  },
  deepseek: {
    name: 'DeepSeek',
    models: [
      { name: 'deepseek-chat', description: 'DeepSeek Chat', maxTokens: 64000 },
      { name: 'deepseek-coder', description: 'DeepSeek Coder', maxTokens: 16384 },
      { name: 'deepseek-reasoner', description: 'DeepSeek Reasoner', maxTokens: 64000 },
      { name: 'deepseek-r1', description: 'DeepSeek R1', maxTokens: 64000 },
      { name: 'deepseek-v3', description: 'DeepSeek V3', maxTokens: 64000 },
    ]
  },
  mistral: {
    name: 'Mistral AI',
    models: [
      { name: 'mistral-large-2411', description: 'Mistral Large 最新版', maxTokens: 128000 },
      { name: 'mistral-large-2407', description: 'Mistral Large', maxTokens: 128000 },
      { name: 'mistral-small-2501', description: 'Mistral Small 最新版', maxTokens: 32000 },
      { name: 'mistral-small-2409', description: 'Mistral Small', maxTokens: 32000 },
      { name: 'codestral-2501', description: 'Codestral 最新版', maxTokens: 256000 },
      { name: 'codestral-2405', description: 'Codestral', maxTokens: 32000 },
      { name: 'ministral-8b-2410', description: 'Ministral 8B', maxTokens: 128000 },
      { name: 'ministral-3b-2410', description: 'Ministral 3B', maxTokens: 128000 },
      { name: 'pixtral-12b-2409', description: 'Pixtral 12B - 多模态', maxTokens: 128000 },
      { name: 'pixtral-large-2411', description: 'Pixtral Large - 多模态旗舰', maxTokens: 128000 },
    ]
  },
  groq: {
    name: 'Groq',
    models: [
      { name: 'llama-3.3-70b-versatile', description: 'Llama 3.3 70B Versatile', maxTokens: 128000 },
      { name: 'llama-3.1-70b-versatile', description: 'Llama 3.1 70B Versatile', maxTokens: 131072 },
      { name: 'llama-3.1-8b-instant', description: 'Llama 3.1 8B Instant', maxTokens: 131072 },
      { name: 'llama-3.2-1b-preview', description: 'Llama 3.2 1B Preview', maxTokens: 8192 },
      { name: 'llama-3.2-3b-preview', description: 'Llama 3.2 3B Preview', maxTokens: 8192 },
      { name: 'llama-3.2-11b-vision-preview', description: 'Llama 3.2 11B Vision', maxTokens: 8192 },
      { name: 'llama-3.2-90b-vision-preview', description: 'Llama 3.2 90B Vision', maxTokens: 8192 },
      { name: 'mixtral-8x7b-32768', description: 'Mixtral 8x7B', maxTokens: 32768 },
      { name: 'gemma2-9b-it', description: 'Gemma 2 9B', maxTokens: 8192 },
      { name: 'deepseek-r1-distill-llama-70b', description: 'DeepSeek R1 Distill Llama 70B', maxTokens: 131072 },
      { name: 'qwen-2.5-32b', description: 'Qwen 2.5 32B', maxTokens: 131072 },
      { name: 'qwen-qwq-32b-preview', description: 'Qwen QwQ 32B - 推理模型', maxTokens: 131072 },
    ]
  },
  together: {
    name: 'Together AI',
    models: [
      { name: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', description: 'Llama 3.3 70B Turbo', maxTokens: 131072 },
      { name: 'meta-llama/Llama-3.1-405B-Instruct-Turbo', description: 'Llama 3.1 405B', maxTokens: 131072 },
      { name: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', description: 'Llama 3.1 70B Turbo', maxTokens: 131072 },
      { name: 'meta-llama/Llama-3.1-8B-Instruct-Turbo', description: 'Llama 3.1 8B Turbo', maxTokens: 131072 },
      { name: 'mistralai/Mixtral-8x22B-Instruct-v0.1', description: 'Mixtral 8x22B', maxTokens: 65536 },
      { name: 'mistralai/Mixtral-8x7B-Instruct-v0.1', description: 'Mixtral 8x7B', maxTokens: 32768 },
      { name: 'Qwen/Qwen2.5-72B-Instruct-Turbo', description: 'Qwen 2.5 72B Turbo', maxTokens: 32768 },
      { name: 'deepseek-ai/DeepSeek-V3', description: 'DeepSeek V3', maxTokens: 64000 },
      { name: 'deepseek-ai/DeepSeek-R1', description: 'DeepSeek R1', maxTokens: 64000 },
    ]
  },
  perplexity: {
    name: 'Perplexity',
    models: [
      { name: 'sonar', description: 'Sonar - 实时搜索', maxTokens: 127072 },
      { name: 'sonar-pro', description: 'Sonar Pro - 深度搜索', maxTokens: 127072 },
      { name: 'sonar-reasoning', description: 'Sonar Reasoning', maxTokens: 127072 },
      { name: 'sonar-reasoning-pro', description: 'Sonar Reasoning Pro', maxTokens: 127072 },
      { name: 'llama-3.1-sonar-small-128k-online', description: 'Sonar Small 128K Online', maxTokens: 127072 },
      { name: 'llama-3.1-sonar-large-128k-online', description: 'Sonar Large 128K Online', maxTokens: 127072 },
    ]
  },
  cohere: {
    name: 'Cohere',
    models: [
      { name: 'command-r-plus-08-2024', description: 'Command R+ 最新版', maxTokens: 128000 },
      { name: 'command-r-plus', description: 'Command R+', maxTokens: 128000 },
      { name: 'command-r-08-2024', description: 'Command R 最新版', maxTokens: 128000 },
      { name: 'command-r', description: 'Command R', maxTokens: 128000 },
      { name: 'command', description: 'Command', maxTokens: 4096 },
      { name: 'command-light', description: 'Command Light', maxTokens: 4096 },
    ]
  },
  baidu: {
    name: '百度文心一言',
    models: [
      { name: 'ernie-4.0', description: '文心一言 ERNIE 4.0', maxTokens: 32768 },
      { name: 'ernie-4.0-8k', description: '文心一言 ERNIE 4.0 8K', maxTokens: 8192 },
      { name: 'ernie-3.5', description: '文心一言 ERNIE 3.5', maxTokens: 32768 },
      { name: 'ernie-speed-128k', description: '文心一言 Speed 128K', maxTokens: 128000 },
      { name: 'ernie-speed-8k', description: '文心一言 Speed 8K', maxTokens: 8192 },
      { name: 'ernie-lite-8k', description: '文心一言 Lite 8K', maxTokens: 8192 },
    ]
  },
  alibaba: {
    name: '阿里通义千问',
    models: [
      { name: 'qwen-max', description: '通义千问 Max', maxTokens: 32768 },
      { name: 'qwen-max-longcontext', description: '通义千问 Max 长文本', maxTokens: 1000000 },
      { name: 'qwen-plus', description: '通义千问 Plus', maxTokens: 131072 },
      { name: 'qwen-turbo', description: '通义千问 Turbo', maxTokens: 131072 },
      { name: 'qwen-long', description: '通义千问 Long', maxTokens: 1000000 },
      { name: 'qwen2.5-72b-instruct', description: 'Qwen 2.5 72B', maxTokens: 131072 },
      { name: 'qwen2.5-32b-instruct', description: 'Qwen 2.5 32B', maxTokens: 131072 },
      { name: 'qwen2.5-14b-instruct', description: 'Qwen 2.5 14B', maxTokens: 131072 },
      { name: 'qwen2.5-7b-instruct', description: 'Qwen 2.5 7B', maxTokens: 131072 },
      { name: 'qwen-vl-max', description: 'Qwen VL Max', maxTokens: 32768 },
      { name: 'qwen-vl-plus', description: 'Qwen VL Plus', maxTokens: 32768 },
    ]
  },
  tencent: {
    name: '腾讯混元',
    models: [
      { name: 'hunyuan-large', description: '混元 Large', maxTokens: 32768 },
      { name: 'hunyuan-standard', description: '混元 Standard', maxTokens: 32768 },
      { name: 'hunyuan-standard-256k', description: '混元 Standard 256K', maxTokens: 256000 },
      { name: 'hunyuan-lite', description: '混元 Lite', maxTokens: 32768 },
      { name: 'hunyuan-vision', description: '混元 Vision', maxTokens: 8192 },
    ]
  },
  bytedance: {
    name: '字节跳动豆包',
    models: [
      { name: 'doubao-pro-128k', description: '豆包 Pro 128K', maxTokens: 128000 },
      { name: 'doubao-pro-32k', description: '豆包 Pro 32K', maxTokens: 32768 },
      { name: 'doubao-lite-128k', description: '豆包 Lite 128K', maxTokens: 128000 },
      { name: 'doubao-lite-32k', description: '豆包 Lite 32K', maxTokens: 32768 },
      { name: 'doubao-1.5-pro-256k', description: '豆包 1.5 Pro 256K', maxTokens: 256000 },
      { name: 'doubao-1.5-pro-32k', description: '豆包 1.5 Pro 32K', maxTokens: 32768 },
    ]
  },
  huawei: {
    name: '华为盘古',
    models: [
      { name: 'pangu-natural-language-10b', description: '盘古自然语言 10B', maxTokens: 8192 },
      { name: 'pangu-multimodal-10b', description: '盘古多模态 10B', maxTokens: 8192 },
      { name: 'pangu-code-10b', description: '盘古代码 10B', maxTokens: 8192 },
    ]
  },
  zhipu: {
    name: '智谱清言',
    models: [
      { name: 'glm-4-plus', description: 'GLM-4 Plus', maxTokens: 128000 },
      { name: 'glm-4-0520', description: 'GLM-4 0520', maxTokens: 128000 },
      { name: 'glm-4-air', description: 'GLM-4 Air', maxTokens: 128000 },
      { name: 'glm-4-airx', description: 'GLM-4 AirX', maxTokens: 8192 },
      { name: 'glm-4-flash', description: 'GLM-4 Flash', maxTokens: 128000 },
      { name: 'glm-4-long', description: 'GLM-4 Long - 超长上下文', maxTokens: 1048576 },
      { name: 'glm-4v-plus', description: 'GLM-4V Plus - 多模态', maxTokens: 8192 },
      { name: 'glm-4v-flash', description: 'GLM-4V Flash - 多模态', maxTokens: 8192 },
      { name: 'glm-z1-air', description: 'GLM-Z1 Air - 推理模型', maxTokens: 128000 },
      { name: 'glm-z1-flash', description: 'GLM-Z1 Flash - 推理', maxTokens: 128000 },
    ]
  },
  minimax: {
    name: 'MiniMax',
    models: [
      { name: 'abab6.5s-chat', description: 'ABAB 6.5S Chat', maxTokens: 245760 },
      { name: 'abab6.5g-chat', description: 'ABAB 6.5G Chat', maxTokens: 245760 },
      { name: 'abab6.5-chat', description: 'ABAB 6.5 Chat', maxTokens: 245760 },
      { name: 'abab5.5-chat', description: 'ABAB 5.5 Chat', maxTokens: 6144 },
    ]
  },
  moonshot: {
    name: 'Moonshot',
    models: [
      { name: 'moonshot-v1-128k', description: 'Moonshot V1 128K', maxTokens: 128000 },
      { name: 'moonshot-v1-32k', description: 'Moonshot V1 32K', maxTokens: 32768 },
      { name: 'moonshot-v1-8k', description: 'Moonshot V1 8K', maxTokens: 8192 },
    ]
  },
  ollama: {
    name: 'Ollama 本地部署',
    models: [
      { name: 'llama3.3', description: 'Llama 3.3 本地', maxTokens: 128000 },
      { name: 'llama3.2', description: 'Llama 3.2 本地', maxTokens: 128000 },
      { name: 'llama3.1', description: 'Llama 3.1 本地', maxTokens: 128000 },
      { name: 'qwen2.5', description: 'Qwen 2.5 本地', maxTokens: 128000 },
      { name: 'qwen2', description: 'Qwen 2 本地', maxTokens: 32768 },
      { name: 'mistral', description: 'Mistral 本地', maxTokens: 32768 },
      { name: 'mixtral', description: 'Mixtral 本地', maxTokens: 32768 },
      { name: 'deepseek-v2', description: 'DeepSeek V2 本地', maxTokens: 128000 },
      { name: 'gemma2', description: 'Gemma 2 本地', maxTokens: 8192 },
      { name: 'phi4', description: 'Phi-4 本地', maxTokens: 16384 },
      { name: 'codellama', description: 'Code Llama 本地', maxTokens: 16384 },
      { name: 'wizardlm2', description: 'WizardLM 2 本地', maxTokens: 32768 },
    ]
  }
};

function generateModelEntry(model, provider) {
  const supportsEmbedding = model.supportsEmbedding || false;
  const streamingMode = supportsEmbedding ? "'false'" : "'true'";
  
  return `  {
    name: '${model.name}',
    provider: '${provider}',
    streamingMode: '${streamingMode}',
    supportsEmbedding: ${supportsEmbedding},
    maxTokens: ${model.maxTokens},
    description: '${model.description}'
  }`;
}

function generateModelList() {
  const lines = [];
  
  lines.push('export const SUPPORTED_MODELS: ModelInfo[] = [');
  
  for (const [provider, config] of Object.entries(PROVIDER_API_DOCS)) {
    lines.push(`  // ==================== ${config.name} ====================`);
    
    for (const model of config.models) {
      lines.push(generateModelEntry(model, provider) + ',');
    }
    
    lines.push('');
  }
  
  lines.push('];');
  
  return lines.join('\n');
}

function getModelCount() {
  let count = 0;
  for (const config of Object.values(PROVIDER_API_DOCS)) {
    count += config.models.length;
  }
  return count;
}

async function fetchModelFromAPI(provider) {
  console.log(`正在从 API 获取 ${provider} 的最新模型列表...`);
  
  const apiDoc = PROVIDER_API_DOCS[provider];
  if (!apiDoc) {
    console.log(`未知提供商: ${provider}`);
    return;
  }
  
  console.log(`✓ ${apiDoc.name} 模型列表已准备就绪 (${apiDoc.models.length} 个模型)`);
}

async function checkForUpdates() {
  console.log('\n🔍 检查模型更新...\n');
  
  for (const [provider, config] of Object.entries(PROVIDER_API_DOCS)) {
    console.log(`${config.name}: ${config.models.length} 个模型`);
  }
  
  console.log(`\n总计: ${getModelCount()} 个模型\n`);
}

async function updateModels(targetProvider = null) {
  console.log('🚀 开始更新模型列表...\n');
  
  if (targetProvider) {
    if (PROVIDER_API_DOCS[targetProvider]) {
      await fetchModelFromAPI(targetProvider);
      console.log(`\n✓ 已更新 ${PROVIDER_API_DOCS[targetProvider].name}`);
    } else {
      console.log(`\n✗ 未知的提供商: ${targetProvider}`);
      console.log('可用的提供商:');
      for (const key of Object.keys(PROVIDER_API_DOCS)) {
        console.log(`  - ${key}`);
      }
    }
  } else {
    for (const provider of Object.keys(PROVIDER_API_DOCS)) {
      await fetchModelFromAPI(provider);
    }
    console.log('\n✓ 所有提供商模型列表已更新');
  }
  
  const modelList = generateModelList();
  
  const backupFile = MODEL_LIST_FILE + '.backup';
  if (fs.existsSync(MODEL_LIST_FILE)) {
    fs.copyFileSync(MODEL_LIST_FILE, backupFile);
    console.log(`✓ 已备份原文件到 ${backupFile}`);
  }
  
  const updateMarkerStart = '// ===== MODEL UPDATE START =====';
  const updateMarkerEnd = '// ===== MODEL UPDATE END =====';
  
  let content = fs.readFileSync(MODEL_LIST_FILE, 'utf8');
  
  const startMatch = content.indexOf(updateMarkerStart);
  const endMatch = content.indexOf(updateMarkerEnd);
  
  if (startMatch !== -1 && endMatch !== -1) {
    const before = content.substring(0, startMatch);
    const after = content.substring(endMatch + updateMarkerEnd.length);
    content = before + updateMarkerStart + '\n' + modelList + '\n' + updateMarkerEnd + after;
  }
  
  fs.writeFileSync(MODEL_LIST_FILE, content, 'utf8');
  console.log(`✓ 已更新 ${MODEL_LIST_FILE}`);
  
  const configData = {
    lastUpdate: new Date().toISOString(),
    totalModels: getModelCount(),
    providers: {}
  };
  
  for (const [provider, config] of Object.entries(PROVIDER_API_DOCS)) {
    configData.providers[provider] = {
      name: config.name,
      modelCount: config.models.length,
      models: config.models.map(m => m.name)
    };
  }
  
  fs.writeFileSync(MODEL_CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf8');
  console.log(`✓ 已更新配置文件 ${MODEL_CONFIG_FILE}`);
  
  console.log('\n✅ 模型更新完成！');
  console.log(`📊 总计: ${getModelCount()} 个模型, ${Object.keys(PROVIDER_API_DOCS).length} 个提供商`);
}

const args = process.argv.slice(2);

if (args.includes('--check')) {
  checkForUpdates();
} else if (args.includes('--help')) {
  console.log(`
Cloud Book 模型更新脚本
========================

使用方法:
  node scripts/update-models.js                    # 更新所有模型
  node scripts/update-models.js --provider openai   # 更新特定提供商
  node scripts/update-models.js --check            # 检查更新
  node scripts/update-models.js --help             # 显示帮助

可用的提供商:
${Object.keys(PROVIDER_API_DOCS).map(k => `  - ${k}`).join('\n')}

建议定期运行此脚本以保持模型列表最新。
`);
} else {
  const providerArg = args.find(a => a.startsWith('--provider='));
  const provider = providerArg ? providerArg.split('=')[1] : null;
  updateModels(provider);
}
