/**
 * Cloud Book - 多模型支持模块 V4
 * 支持所有主流大模型和本地部署
 * 新增：真实OpenAI Embedding API、缓存、流式处理、结构化日志
 */

import { LLMConfig, ModelRoute } from '../../types';
import { CostTracker } from '../CostTracker/CostTracker';

export type ModelProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'deepseek' 
  | 'ollama' 
  | 'koboldcpp' 
  | 'gemini'
  | 'custom'
  | 'azure'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'together'
  | 'fireworks'
  | 'perplexity'
  | 'cloudflare'
  | 'replicate'
  | 'huggingface'
  | 'voyage'
  | 'nomic'
  // 国内模型
  | 'baidu'
  | 'alibaba'
  | 'tencent'
  | 'bytedance'
  | 'huawei'
  | 'zhipu'
  | 'minimax'
  | 'doubao'
  | 'moonshot'
  // 更多国外模型
  | 'modal'
  | 'banana'
  | 'lambda'
  | 'modalabs'
  | 'falcon'
  | 'ai21'
  | 'stablelm'
  | 'mpt';

export type StreamingMode = 'true' | 'false' | 'auto';

export interface ModelInfo {
  name: string;
  provider: ModelProvider;
  streamingMode: StreamingMode;
  supportsEmbedding: boolean;
  maxTokens: number;
  description: string;
}

export const SUPPORTED_MODELS: ModelInfo[] = [
  // ==================== OpenAI 系列 ====================
  {
    name: 'gpt-4o',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4o - 最新旗舰模型'
  },
  {
    name: 'gpt-4o-2024-11-20',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4o 最新版本'
  },
  {
    name: 'gpt-4o-2024-08-06',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4o 稳定版本'
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4o Mini - 高性价比'
  },
  {
    name: 'gpt-4o-mini-2024-07-18',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4o Mini 指定版本'
  },
  {
    name: 'gpt-4.1',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1047576,
    description: 'GPT-4.1 - 超大上下文'
  },
  {
    name: 'gpt-4.1-mini',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1047576,
    description: 'GPT-4.1 Mini - 平衡版'
  },
  {
    name: 'gpt-4.1-nano',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1047576,
    description: 'GPT-4.1 Nano - 轻量版'
  },
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4 Turbo - 快速强大'
  },
  {
    name: 'gpt-4-turbo-2024-04-09',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GPT-4 Turbo 指定版本'
  },
  {
    name: 'gpt-4',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'GPT-4 原始版本'
  },
  {
    name: 'gpt-4-32k',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'GPT-4 32K上下文'
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16385,
    description: 'GPT-3.5 Turbo - 轻量快速'
  },
  {
    name: 'gpt-3.5-turbo-16k',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16385,
    description: 'GPT-3.5 Turbo 16K'
  },
  {
    name: 'o1',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'O1 - 深度推理模型'
  },
  {
    name: 'o1-preview',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'O1 Preview - 推理预览版'
  },
  {
    name: 'o1-mini',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'O1 Mini - 轻量推理'
  },
  {
    name: 'o3-mini',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'O3 Mini - 最新推理模型'
  },
  {
    name: 'chatgpt-4o-latest',
    provider: 'openai',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'ChatGPT-4o 最新版'
  },
  // OpenAI Embedding
  {
    name: 'text-embedding-3-small',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'OpenAI Embedding Small'
  },
  {
    name: 'text-embedding-3-large',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'OpenAI Embedding Large'
  },
  {
    name: 'text-embedding-ada-002',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'OpenAI Ada Embedding'
  },
  // OpenAI Image
  {
    name: 'dall-e-3',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'DALL-E 3 - 图像生成'
  },
  {
    name: 'dall-e-2',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'DALL-E 2 - 图像生成'
  },
  // OpenAI Audio
  {
    name: 'whisper-1',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 262144,
    description: 'Whisper - 语音识别'
  },
  {
    name: 'tts-1',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'TTS-1 - 文本转语音'
  },
  {
    name: 'tts-1-hd',
    provider: 'openai',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'TTS-1 HD - 高清语音'
  },

  // ==================== Anthropic Claude 系列 ====================
  {
    name: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude Sonnet 4 - 平衡之选'
  },
  {
    name: 'claude-opus-4-20250514',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude Opus 4 - 最强模型'
  },
  {
    name: 'claude-haiku-4-20250514',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude Haiku 4 - 快速轻量'
  },
  {
    name: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3.5 Sonnet 最新'
  },
  {
    name: 'claude-3-5-sonnet-20240620',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3.5 Sonnet'
  },
  {
    name: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3.5 Haiku'
  },
  {
    name: 'claude-3-opus-20240229',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3 Opus'
  },
  {
    name: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3 Sonnet'
  },
  {
    name: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 200000,
    description: 'Claude 3 Haiku'
  },

  // ==================== Google Gemini 系列 ====================
  {
    name: 'gemini-2.5-flash-preview-05-20',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 2.5 Flash Preview'
  },
  {
    name: 'gemini-2.5-pro-preview-05-06',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 2.5 Pro Preview'
  },
  {
    name: 'gemini-2.0-flash',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 2.0 Flash'
  },
  {
    name: 'gemini-2.0-flash-lite',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 2.0 Flash Lite'
  },
  {
    name: 'gemini-2.0-pro-exp-02-05',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 2.0 Pro Experimental'
  },
  {
    name: 'gemini-1.5-pro',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 2097152,
    description: 'Gemini 1.5 Pro - 超长上下文'
  },
  {
    name: 'gemini-1.5-flash',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 1.5 Flash'
  },
  {
    name: 'gemini-1.5-flash-8b',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'Gemini 1.5 Flash 8B'
  },
  {
    name: 'gemini-1.0-pro',
    provider: 'gemini',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32760,
    description: 'Gemini 1.0 Pro'
  },
  // Gemini Embedding
  {
    name: 'text-embedding-004',
    provider: 'gemini',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: 'Gemini Text Embedding'
  },
  {
    name: 'embedding-001',
    provider: 'gemini',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: 'Gemini Embedding'
  },

  // ==================== DeepSeek 系列 ====================
  {
    name: 'deepseek-chat',
    provider: 'deepseek',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek Chat - 通用对话'
  },
  {
    name: 'deepseek-coder',
    provider: 'deepseek',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16384,
    description: 'DeepSeek Coder - 代码专家'
  },
  {
    name: 'deepseek-reasoner',
    provider: 'deepseek',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek Reasoner - 深度推理'
  },
  {
    name: 'deepseek-r1',
    provider: 'deepseek',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek R1 - 推理模型'
  },
  {
    name: 'deepseek-v3',
    provider: 'deepseek',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek V3 - 最新版本'
  },

  // ==================== Mistral AI 系列 ====================
  {
    name: 'mistral-large-2411',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Mistral Large 最新版'
  },
  {
    name: 'mistral-large-2407',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Mistral Large'
  },
  {
    name: 'mistral-small-2501',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32000,
    description: 'Mistral Small 最新版'
  },
  {
    name: 'mistral-small-2409',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32000,
    description: 'Mistral Small'
  },
  {
    name: 'codestral-2501',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: 'Codestral 最新版'
  },
  {
    name: 'codestral-2405',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32000,
    description: 'Codestral - 代码专家'
  },
  {
    name: 'ministral-8b-2410',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Ministral 8B - 边缘部署'
  },
  {
    name: 'ministral-3b-2410',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Ministral 3B - 超轻量'
  },
  {
    name: 'open-mistral-7b',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32000,
    description: 'Mistral 7B 开源版'
  },
  {
    name: 'open-mixtral-8x7b',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32000,
    description: 'Mixtral 8x7B 开源版'
  },
  {
    name: 'open-mixtral-8x22b',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 65536,
    description: 'Mixtral 8x22B 开源版'
  },
  {
    name: 'pixtral-12b-2409',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Pixtral 12B - 多模态'
  },
  {
    name: 'pixtral-large-2411',
    provider: 'mistral',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Pixtral Large - 多模态旗舰'
  },
  // Mistral Embedding
  {
    name: 'mistral-embed',
    provider: 'mistral',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'Mistral Embedding'
  },

  // ==================== Groq 系列 ====================
  {
    name: 'llama-3.3-70b-versatile',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Llama 3.3 70B Versatile'
  },
  {
    name: 'llama-3.3-70b-specdec',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.3 70B Speculative'
  },
  {
    name: 'llama-3.1-8b-instant',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 8B Instant'
  },
  {
    name: 'llama-3.1-70b-versatile',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 70B Versatile'
  },
  {
    name: 'llama-3.2-1b-preview',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.2 1B Preview'
  },
  {
    name: 'llama-3.2-3b-preview',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.2 3B Preview'
  },
  {
    name: 'llama-3.2-11b-vision-preview',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.2 11B Vision'
  },
  {
    name: 'llama-3.2-90b-vision-preview',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.2 90B Vision'
  },
  {
    name: 'mixtral-8x7b-32768',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 8x7B'
  },
  {
    name: 'gemma2-9b-it',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 9B'
  },
  {
    name: 'gemma-7b-it',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 7B'
  },
  {
    name: 'deepseek-r1-distill-llama-70b',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'DeepSeek R1 Distill Llama 70B'
  },
  {
    name: 'qwen-2.5-32b',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2.5 32B'
  },
  {
    name: 'qwen-qwq-32b-preview',
    provider: 'groq',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen QwQ 32B - 推理模型'
  },

  // ==================== Together AI 系列 ====================
  {
    name: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.3 70B Turbo'
  },
  {
    name: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.2 90B Vision'
  },
  {
    name: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.2 11B Vision'
  },
  {
    name: 'meta-llama/Llama-3.1-405B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 405B - 超大模型'
  },
  {
    name: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 70B Turbo'
  },
  {
    name: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 8B Turbo'
  },
  {
    name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 65536,
    description: 'Mixtral 8x22B'
  },
  {
    name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 8x7B'
  },
  {
    name: 'mistralai/Mistral-7B-Instruct-v0.3',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mistral 7B v0.3'
  },
  {
    name: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2.5 72B Turbo'
  },
  {
    name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2.5 7B Turbo'
  },
  {
    name: 'Qwen/Qwen2-72B-Instruct',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2 72B'
  },
  {
    name: 'deepseek-ai/DeepSeek-V3',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek V3'
  },
  {
    name: 'deepseek-ai/DeepSeek-R1',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek R1'
  },
  {
    name: 'google/gemma-2-27B-it',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 27B'
  },
  {
    name: 'google/gemma-2-9B-it',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 9B'
  },
  {
    name: 'databricks/dbrx-instruct',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'DBRX Instruct'
  },
  {
    name: 'zero-one-ai/Yi-34B-Chat',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Yi 34B Chat'
  },
  {
    name: 'allenai/OLMo-7B-Instruct',
    provider: 'together',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 2048,
    description: 'OLMo 7B Instruct'
  },

  // ==================== Perplexity 系列 ====================
  {
    name: 'sonar',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar - 实时搜索'
  },
  {
    name: 'sonar-pro',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar Pro - 深度搜索'
  },
  {
    name: 'sonar-reasoning',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar Reasoning - 推理搜索'
  },
  {
    name: 'sonar-reasoning-pro',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar Reasoning Pro'
  },
  {
    name: 'llama-3.1-sonar-small-128k-online',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar Small 128K Online'
  },
  {
    name: 'llama-3.1-sonar-large-128k-online',
    provider: 'perplexity',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 127072,
    description: 'Sonar Large 128K Online'
  },

  // ==================== Cohere 系列 ====================
  {
    name: 'command-r-plus-08-2024',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Command R+ 最新版'
  },
  {
    name: 'command-r-plus',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Command R+ - 旗舰模型'
  },
  {
    name: 'command-r-08-2024',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Command R 最新版'
  },
  {
    name: 'command-r',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Command R - RAG优化'
  },
  {
    name: 'command',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Command - 通用模型'
  },
  {
    name: 'command-light',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Command Light - 轻量版'
  },
  {
    name: 'command-nightly',
    provider: 'cohere',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Command Nightly - 实验版'
  },
  // Cohere Embedding
  {
    name: 'embed-english-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 4096,
    description: 'Cohere Embed English v3'
  },
  {
    name: 'embed-multilingual-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 4096,
    description: 'Cohere Embed Multilingual v3'
  },
  {
    name: 'embed-english-light-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 4096,
    description: 'Cohere Embed English Light'
  },
  {
    name: 'embed-multilingual-light-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 4096,
    description: 'Cohere Embed Multilingual Light'
  },
  // Cohere Rerank
  {
    name: 'rerank-english-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Cohere Rerank English'
  },
  {
    name: 'rerank-multilingual-v3.0',
    provider: 'cohere',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Cohere Rerank Multilingual'
  },

  // ==================== AI21 系列 ====================
  {
    name: 'jamba-1-5-large',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: 'Jamba 1.5 Large - Mamba架构'
  },
  {
    name: 'jamba-1-5-mini',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: 'Jamba 1.5 Mini - 轻量版'
  },
  {
    name: 'jamba-instruct',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: 'Jamba Instruct'
  },
  {
    name: 'j2-ultra',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Jurassic-2 Ultra'
  },
  {
    name: 'j2-mid',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Jurassic-2 Mid'
  },
  {
    name: 'j2-light',
    provider: 'ai21',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Jurassic-2 Light'
  },

  // ==================== Fireworks AI 系列 ====================
  {
    name: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.3 70B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 405B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 70B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 8B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/qwen2p5-72b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2.5 72B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/mixtral-8x22b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 65536,
    description: 'Mixtral 8x22B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 8x7B Fireworks'
  },
  {
    name: 'accounts/fireworks/models/deepseek-v3',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek V3 Fireworks'
  },
  {
    name: 'accounts/fireworks/models/deepseek-r1',
    provider: 'fireworks',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 64000,
    description: 'DeepSeek R1 Fireworks'
  },

  // ==================== Cloudflare Workers AI ====================
  {
    name: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.3 70B Fast'
  },
  {
    name: '@cf/meta/llama-3.1-70b-instruct',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.1 70B'
  },
  {
    name: '@cf/meta/llama-3.1-8b-instruct',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3.1 8B'
  },
  {
    name: '@cf/meta/llama-2-7b-chat-int8',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Llama 2 7B Chat'
  },
  {
    name: '@cf/mistral/mistral-7b-instruct-v0.1',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Mistral 7B Instruct'
  },
  {
    name: '@cf/mistral/mistral-7b-instruct-v0.2',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mistral 7B v0.2'
  },
  {
    name: '@cf/qwen/qwen1.5-14b-chat-awq',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Qwen 1.5 14B'
  },
  {
    name: '@cf/google/gemma-7b-it',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 7B IT'
  },
  {
    name: '@cf/deepseek-ai/deepseek-math-7b-instruct',
    provider: 'cloudflare',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'DeepSeek Math 7B'
  },
  // Cloudflare Embedding
  {
    name: '@cf/baai/bge-base-en-v1.5',
    provider: 'cloudflare',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 512,
    description: 'BGE Base Embedding'
  },
  {
    name: '@cf/baai/bge-large-en-v1.5',
    provider: 'cloudflare',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 512,
    description: 'BGE Large Embedding'
  },

  // ==================== Replicate 系列 ====================
  {
    name: 'meta/meta-llama-3.1-405b-instruct',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 405B Replicate'
  },
  {
    name: 'meta/meta-llama-3.1-70b-instruct',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 70B Replicate'
  },
  {
    name: 'meta/meta-llama-3-70b-instruct',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3 70B Replicate'
  },
  {
    name: 'meta/llama-2-70b-chat',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Llama 2 70B Chat'
  },
  {
    name: 'mistralai/mixtral-8x7b-instruct-v0.1',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 8x7B Replicate'
  },
  {
    name: 'mistralai/mistral-7b-instruct-v0.2',
    provider: 'replicate',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mistral 7B Replicate'
  },

  // ==================== Hugging Face 系列 ====================
  {
    name: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 70B HF'
  },
  {
    name: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Llama 3.1 8B HF'
  },
  {
    name: 'mistralai/Mistral-7B-Instruct-v0.3',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mistral 7B v0.3 HF'
  },
  {
    name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 8x7B HF'
  },
  {
    name: 'Qwen/Qwen2.5-72B-Instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2.5 72B HF'
  },
  {
    name: 'Qwen/Qwen2.5-7B-Instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2.5 7B HF'
  },
  {
    name: 'google/gemma-2-27b-it',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 27B HF'
  },
  {
    name: 'google/gemma-2-9b-it',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 9B HF'
  },
  {
    name: 'microsoft/Phi-3-mini-4k-instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Phi-3 Mini 4K'
  },
  {
    name: 'microsoft/Phi-3-medium-128k-instruct',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Phi-3 Medium 128K'
  },
  {
    name: 'tiiuae/falcon-180B-chat',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 2048,
    description: 'Falcon 180B Chat'
  },
  {
    name: 'bigscience/bloom',
    provider: 'huggingface',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 2048,
    description: 'BLOOM - 多语言模型'
  },

  // ==================== Voyage AI Embedding ====================
  {
    name: 'voyage-3-large',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 32000,
    description: 'Voyage 3 Large - 最强向量'
  },
  {
    name: 'voyage-3',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 32000,
    description: 'Voyage 3 - 平衡向量'
  },
  {
    name: 'voyage-3-lite',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 32000,
    description: 'Voyage 3 Lite - 轻量向量'
  },
  {
    name: 'voyage-large-2-instruct',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 16000,
    description: 'Voyage Large 2 Instruct'
  },
  {
    name: 'voyage-law-2',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 16000,
    description: 'Voyage Law 2 - 法律专用'
  },
  {
    name: 'voyage-code-2',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 16000,
    description: 'Voyage Code 2 - 代码专用'
  },
  {
    name: 'voyage-finance-2',
    provider: 'voyage',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 32000,
    description: 'Voyage Finance 2 - 金融专用'
  },

  // ==================== Nomic Embedding ====================
  {
    name: 'nomic-embed-text-v1.5',
    provider: 'nomic',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'Nomic Embed v1.5'
  },
  {
    name: 'nomic-embed-text-v1',
    provider: 'nomic',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'Nomic Embed v1'
  },

  // ==================== 百度文心一言 ====================
  {
    name: 'ernie-4.0-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 ERNIE 4.0 8K'
  },
  {
    name: 'ernie-4.0',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '文心一言 ERNIE 4.0'
  },
  {
    name: 'ernie-3.5-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 ERNIE 3.5 8K'
  },
  {
    name: 'ernie-3.5',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '文心一言 ERNIE 3.5'
  },
  {
    name: 'ernie-speed-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 Speed 8K'
  },
  {
    name: 'ernie-speed-128k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: '文心一言 Speed 128K'
  },
  {
    name: 'ernie-lite-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 Lite 8K'
  },
  {
    name: 'ernie-tiny-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 Tiny 8K'
  },
  {
    name: 'ernie-char-8k',
    provider: 'baidu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '文心一言 Char 8K - 角色对话'
  },
  // 百度 Embedding
  {
    name: 'embedding-v1',
    provider: 'baidu',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: '百度 Embedding V1'
  },

  // ==================== 阿里通义千问 ====================
  {
    name: 'qwen-max',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '通义千问 Max'
  },
  {
    name: 'qwen-max-longcontext',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 10000,
    description: '通义千问 Max 长文本'
  },
  {
    name: 'qwen-plus',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: '通义千问 Plus'
  },
  {
    name: 'qwen-turbo',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: '通义千问 Turbo'
  },
  {
    name: 'qwen-long',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 10000,
    description: '通义千问 Long - 超长文本'
  },
  {
    name: 'qwen2.5-72b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2.5 72B'
  },
  {
    name: 'qwen2.5-32b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2.5 32B'
  },
  {
    name: 'qwen2.5-14b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2.5 14B'
  },
  {
    name: 'qwen2.5-7b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2.5 7B'
  },
  {
    name: 'qwen2-57b-a14b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2 57B A14B'
  },
  {
    name: 'qwen2-72b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2 72B'
  },
  {
    name: 'qwen2-7b-instruct',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 131072,
    description: 'Qwen 2 7B'
  },
  {
    name: 'qwen-vl-max',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen VL Max - 多模态'
  },
  {
    name: 'qwen-vl-plus',
    provider: 'alibaba',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen VL Plus - 多模态'
  },
  // 通义千问 Embedding
  {
    name: 'text-embedding-v3',
    provider: 'alibaba',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: '通义 Embedding V3'
  },
  {
    name: 'text-embedding-v2',
    provider: 'alibaba',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: '通义 Embedding V2'
  },

  // ==================== 腾讯混元 ====================
  {
    name: 'hunyuan-large',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '混元 Large'
  },
  {
    name: 'hunyuan-standard',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '混元 Standard'
  },
  {
    name: 'hunyuan-standard-256k',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: '混元 Standard 256K'
  },
  {
    name: 'hunyuan-lite',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '混元 Lite'
  },
  {
    name: 'hunyuan-vision',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '混元 Vision - 多模态'
  },
  {
    name: 'hunyuan-code',
    provider: 'tencent',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '混元 Code - 代码专家'
  },
  // 腾讯 Embedding
  {
    name: 'hunyuan-embedding',
    provider: 'tencent',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: '混元 Embedding'
  },

  // ==================== 字节跳动豆包 ====================
  {
    name: 'doubao-pro-32k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '豆包 Pro 32K'
  },
  {
    name: 'doubao-pro-128k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: '豆包 Pro 128K'
  },
  {
    name: 'doubao-lite-32k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '豆包 Lite 32K'
  },
  {
    name: 'doubao-lite-128k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: '豆包 Lite 128K'
  },
  {
    name: 'doubao-1.5-pro-32k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '豆包 1.5 Pro 32K'
  },
  {
    name: 'doubao-1.5-pro-256k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 256000,
    description: '豆包 1.5 Pro 256K'
  },
  {
    name: 'doubao-1.5-lite-32k',
    provider: 'bytedance',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: '豆包 1.5 Lite 32K'
  },
  {
    name: 'doubao-embedding',
    provider: 'bytedance',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 4096,
    description: '豆包 Embedding'
  },

  // ==================== 华为盘古 ====================
  {
    name: 'pangu-natural-language-10b',
    provider: 'huawei',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '盘古自然语言 10B'
  },
  {
    name: 'pangu-multimodal-10b',
    provider: 'huawei',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '盘古多模态 10B'
  },
  {
    name: 'pangu-code-10b',
    provider: 'huawei',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: '盘古代码 10B'
  },
  {
    name: 'pangu-embedding',
    provider: 'huawei',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 2048,
    description: '盘古 Embedding'
  },

  // ==================== 智谱清言 ====================
  {
    name: 'glm-4-plus',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-4 Plus'
  },
  {
    name: 'glm-4-0520',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-4 0520'
  },
  {
    name: 'glm-4-air',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-4 Air'
  },
  {
    name: 'glm-4-airx',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'GLM-4 AirX'
  },
  {
    name: 'glm-4-flash',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-4 Flash - 免费'
  },
  {
    name: 'glm-4-long',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 1048576,
    description: 'GLM-4 Long - 超长上下文'
  },
  {
    name: 'glm-4v-plus',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'GLM-4V Plus - 多模态'
  },
  {
    name: 'glm-4v-flash',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'GLM-4V Flash - 多模态免费'
  },
  {
    name: 'glm-z1-air',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-Z1 Air - 推理模型'
  },
  {
    name: 'glm-z1-airx',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'GLM-Z1 AirX - 推理模型'
  },
  {
    name: 'glm-z1-flash',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'GLM-Z1 Flash - 推理免费'
  },
  {
    name: 'chatglm3-6b',
    provider: 'zhipu',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'ChatGLM3 6B'
  },
  // 智谱 Embedding
  {
    name: 'embedding-3',
    provider: 'zhipu',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: '智谱 Embedding 3'
  },

  // ==================== MiniMax ====================
  {
    name: 'abab6.5s-chat',
    provider: 'minimax',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 245760,
    description: 'ABAB 6.5S Chat'
  },
  {
    name: 'abab6.5g-chat',
    provider: 'minimax',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 245760,
    description: 'ABAB 6.5G Chat'
  },
  {
    name: 'abab6.5-chat',
    provider: 'minimax',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 245760,
    description: 'ABAB 6.5 Chat'
  },
  {
    name: 'abab5.5-chat',
    provider: 'minimax',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 6144,
    description: 'ABAB 5.5 Chat'
  },
  {
    name: 'abab5.5s-chat',
    provider: 'minimax',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 6144,
    description: 'ABAB 5.5S Chat'
  },
  {
    name: 'speech-01-turbo',
    provider: 'minimax',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'MiniMax 语音合成'
  },
  {
    name: 'video-01',
    provider: 'minimax',
    streamingMode: 'false',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'MiniMax 视频生成'
  },

  // ==================== Moonshot (月之暗面) ====================
  {
    name: 'moonshot-v1-8k',
    provider: 'moonshot',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Moonshot V1 8K'
  },
  {
    name: 'moonshot-v1-32k',
    provider: 'moonshot',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Moonshot V1 32K'
  },
  {
    name: 'moonshot-v1-128k',
    provider: 'moonshot',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Moonshot V1 128K'
  },

  // ==================== Ollama 本地部署 ====================
  {
    name: 'llama3.3',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Llama 3.3 本地'
  },
  {
    name: 'llama3.2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Llama 3.2 本地'
  },
  {
    name: 'llama3.1',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Llama 3.1 本地'
  },
  {
    name: 'llama3',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Llama 3 本地'
  },
  {
    name: 'llama2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Llama 2 本地'
  },
  {
    name: 'mistral',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mistral 本地'
  },
  {
    name: 'mixtral',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Mixtral 本地'
  },
  {
    name: 'qwen2.5',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Qwen 2.5 本地'
  },
  {
    name: 'qwen2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Qwen 2 本地'
  },
  {
    name: 'deepseek-v2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'DeepSeek V2 本地'
  },
  {
    name: 'deepseek-coder-v2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'DeepSeek Coder V2 本地'
  },
  {
    name: 'gemma2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 2 本地'
  },
  {
    name: 'gemma',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 8192,
    description: 'Gemma 本地'
  },
  {
    name: 'phi3',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Phi-3 本地'
  },
  {
    name: 'phi4',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16384,
    description: 'Phi-4 本地'
  },
  {
    name: 'codellama',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16384,
    description: 'Code Llama 本地'
  },
  {
    name: 'starcoder2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 16384,
    description: 'StarCoder 2 本地'
  },
  {
    name: 'dolphin-mixtral',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'Dolphin Mixtral 本地'
  },
  {
    name: 'nous-hermes2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'Nous Hermes 2 本地'
  },
  {
    name: 'wizardlm2',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 32768,
    description: 'WizardLM 2 本地'
  },
  {
    name: 'command-r',
    provider: 'ollama',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 128000,
    description: 'Command R 本地'
  },
  {
    name: 'nomic-embed-text',
    provider: 'ollama',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 8192,
    description: 'Nomic Embed 本地'
  },
  {
    name: 'mxbai-embed-large',
    provider: 'ollama',
    streamingMode: 'false',
    supportsEmbedding: true,
    maxTokens: 512,
    description: 'MxBai Embed 本地'
  },

  // ==================== KoboldCPP 本地部署 ====================
  {
    name: 'koboldcpp-default',
    provider: 'koboldcpp',
    streamingMode: 'true',
    supportsEmbedding: false,
    maxTokens: 4096,
    description: 'KoboldCPP 默认'
  }
];

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  streamingMode?: StreamingMode;
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  provider: ModelProvider;
  generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  stream?(
    prompt: string, 
    options: GenerationOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<void>;
  embed?(text: string, options?: EmbeddingOptions): Promise<EmbeddingResponse>;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  message: string;
  metadata?: Record<string, any>;
}

export class LLMManager {
  private providers: Map<string, LLMProvider> = new Map();
  private routes: ModelRoute[] = [];
  private defaultProvider?: string;
  private modelConfigs: Map<string, LLMConfig> = new Map();
  private embeddingCache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private cacheTTL: number = 3600000;
  private logs: LogEntry[] = [];
  private costTracker?: CostTracker;
  private costTrackingEnabled: boolean = false;
  
  constructor() {
    this.registerBuiltinProviders();
  }

  setCostTracker(tracker: CostTracker): void {
    this.costTracker = tracker;
    this.costTrackingEnabled = true;
  }

  isCostTrackingEnabled(): boolean {
    return this.costTrackingEnabled;
  }

  private recordCost(model: string, provider: string, inputTokens: number, outputTokens: number, operation: string): void {
    if (this.costTracker && this.costTrackingEnabled) {
      this.costTracker.recordCost(model, provider, inputTokens, outputTokens, operation).catch(err => {
        this.log('error', 'LLMManager', 'Failed to record cost', { error: err.message });
      });
    }
  }

  private log(level: LogEntry['level'], component: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      metadata
    };
    this.logs.push(entry);
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    if (level === 'error' || level === 'warn') {
      console[level](`[${component}] ${message}`, metadata || '');
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setCacheTTL(ttlMs: number) {
    this.cacheTTL = ttlMs;
  }

  clearCache() {
    this.embeddingCache.clear();
    this.log('info', 'LLMManager', 'Embedding cache cleared');
  }

  private getConfigForProvider(providerType: ModelProvider): LLMConfig | undefined {
    for (const [_, config] of this.modelConfigs) {
      if (config.provider === providerType) {
        return config;
      }
    }
    return undefined;
  }

  /**
   * 获取模型信息
   */
  getModelInfo(modelName: string): ModelInfo | undefined {
    return SUPPORTED_MODELS.find(m => m.name === modelName);
  }

  /**
   * 获取所有支持的模型列表
   */
  listSupportedModels(): ModelInfo[] {
    return [...SUPPORTED_MODELS];
  }

  /**
   * 获取所有已配置的模型
   */
  listModels(): LLMConfig[] {
    return Array.from(this.modelConfigs.values());
  }

  /**
   * 注册内置提供者
   */
  private registerBuiltinProviders() {
    // OpenAI
    this.registerProvider({
      name: 'openai',
      provider: 'openai',
      generate: async (prompt, options) => {
        const config = this.getConfig('openai');
        if (!config) throw new Error('OpenAI config not found');
        return this.callOpenAICompatibleAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('openai');
        if (!config) throw new Error('OpenAI config not found');
        await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
      },
      embed: async (text, options) => {
        const config = this.getConfig('openai');
        if (!config) throw new Error('OpenAI config not found');
        return this.callOpenAIEmbeddingAPI(config, text, options);
      }
    });

    // Anthropic
    this.registerProvider({
      name: 'anthropic',
      provider: 'anthropic',
      generate: async (prompt, options) => {
        const config = this.getConfig('anthropic');
        if (!config) throw new Error('Anthropic config not found');
        return this.callAnthropicAPI(config, prompt, options);
      }
    });

    // DeepSeek
    this.registerProvider({
      name: 'deepseek',
      provider: 'deepseek',
      generate: async (prompt, options) => {
        const config = this.getConfig('deepseek');
        if (!config) throw new Error('DeepSeek config not found');
        return this.callOpenAICompatibleAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('deepseek');
        if (!config) throw new Error('DeepSeek config not found');
        await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
      },
      embed: async (text, options) => {
        const config = this.getConfig('deepseek');
        if (!config) throw new Error('DeepSeek config not found');
        return this.callOpenAIEmbeddingAPI(config, text, options);
      }
    });

    // Gemini (通用处理)
    this.registerProvider({
      name: 'gemini',
      provider: 'gemini',
      generate: async (prompt, options) => {
        const config = this.getConfig('gemini');
        if (!config) throw new Error('Gemini config not found');
        const modelInfo = this.getModelInfo(config.model);
        const isStreaming = modelInfo?.streamingMode === 'true' && options?.stream !== false;
        return this.callGeminiAPI(config, prompt, options, isStreaming);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('gemini');
        if (!config) throw new Error('Gemini config not found');
        await this.streamGeminiAPI(config, prompt, options, onChunk);
      }
    });

    // Ollama (本地)
    this.registerProvider({
      name: 'ollama',
      provider: 'ollama',
      generate: async (prompt, options) => {
        const config = this.getConfig('ollama');
        if (!config) throw new Error('Ollama config not found');
        return this.callOllamaAPI(config, prompt, options);
      }
    });

    // KoboldCPP (本地)
    this.registerProvider({
      name: 'koboldcpp',
      provider: 'koboldcpp',
      generate: async (prompt, options) => {
        const config = this.getConfig('koboldcpp');
        if (!config) throw new Error('KoboldCPP config not found');
        return this.callKoboldAPI(config, prompt, options);
      }
    });

    // Custom Provider (支持所有OpenAI兼容API)
    this.registerProvider({
      name: 'custom',
      provider: 'custom',
      generate: async (prompt, options) => {
        const config = this.getConfig('custom');
        if (!config) throw new Error('Custom config not found');
        return this.callOpenAICompatibleAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('custom');
        if (!config) throw new Error('Custom config not found');
        await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
      },
      embed: async (text, options) => {
        const config = this.getConfig('custom');
        if (!config) throw new Error('Custom config not found');
        return this.callOpenAIEmbeddingAPI(config, text, options);
      }
    });

    // Mistral AI
    this.registerProvider({
      name: 'mistral',
      provider: 'mistral',
      generate: async (prompt, options) => {
        const config = this.getConfig('mistral');
        if (!config) throw new Error('Mistral config not found');
        return this.callMistralAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('mistral');
        if (!config) throw new Error('Mistral config not found');
        await this.streamMistralAPI(config, prompt, options, onChunk);
      }
    });

    // Cohere
    this.registerProvider({
      name: 'cohere',
      provider: 'cohere',
      generate: async (prompt, options) => {
        const config = this.getConfig('cohere');
        if (!config) throw new Error('Cohere config not found');
        return this.callCohereAPI(config, prompt, options);
      },
      embed: async (text, options) => {
        const config = this.getConfig('cohere');
        if (!config) throw new Error('Cohere config not found');
        return this.callCohereEmbeddingAPI(config, text, options);
      }
    });

    // Groq
    this.registerProvider({
      name: 'groq',
      provider: 'groq',
      generate: async (prompt, options) => {
        const config = this.getConfig('groq');
        if (!config) throw new Error('Groq config not found');
        return this.callGroqAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('groq');
        if (!config) throw new Error('Groq config not found');
        await this.streamGroqAPI(config, prompt, options, onChunk);
      }
    });

    // Together AI
    this.registerProvider({
      name: 'together',
      provider: 'together',
      generate: async (prompt, options) => {
        const config = this.getConfig('together');
        if (!config) throw new Error('Together config not found');
        return this.callTogetherAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('together');
        if (!config) throw new Error('Together config not found');
        await this.streamTogetherAPI(config, prompt, options, onChunk);
      }
    });

    // Perplexity
    this.registerProvider({
      name: 'perplexity',
      provider: 'perplexity',
      generate: async (prompt, options) => {
        const config = this.getConfig('perplexity');
        if (!config) throw new Error('Perplexity config not found');
        return this.callPerplexityAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('perplexity');
        if (!config) throw new Error('Perplexity config not found');
        await this.streamPerplexityAPI(config, prompt, options, onChunk);
      }
    });

    // Cloudflare Workers AI
    this.registerProvider({
      name: 'cloudflare',
      provider: 'cloudflare',
      generate: async (prompt, options) => {
        const config = this.getConfig('cloudflare');
        if (!config) throw new Error('Cloudflare config not found');
        return this.callCloudflareAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('cloudflare');
        if (!config) throw new Error('Cloudflare config not found');
        await this.streamCloudflareAPI(config, prompt, options, onChunk);
      }
    });

    // Azure OpenAI
    this.registerProvider({
      name: 'azure',
      provider: 'azure',
      generate: async (prompt, options) => {
        const config = this.getConfig('azure');
        if (!config) throw new Error('Azure config not found');
        return this.callAzureAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('azure');
        if (!config) throw new Error('Azure config not found');
        await this.streamAzureAPI(config, prompt, options, onChunk);
      }
    });

    // Voyage AI
    this.registerProvider({
      name: 'voyage',
      provider: 'voyage',
      generate: async (prompt, options) => {
        throw new Error('Voyage AI does not support text generation, only embeddings');
      },
      stream: async (prompt, options, onChunk) => {
        throw new Error('Voyage AI does not support streaming');
      },
      embed: async (text, options) => {
        const config = this.getConfig('voyage');
        if (!config) throw new Error('Voyage config not found');
        return this.callVoyageEmbeddingAPI(config, text, options);
      }
    });

    // Nomic
    this.registerProvider({
      name: 'nomic',
      provider: 'nomic',
      generate: async (prompt, options) => {
        throw new Error('Nomic does not support text generation, only embeddings');
      },
      stream: async (prompt, options, onChunk) => {
        throw new Error('Nomic does not support streaming');
      },
      embed: async (text, options) => {
        const config = this.getConfig('nomic');
        if (!config) throw new Error('Nomic config not found');
        return this.callNomicEmbeddingAPI(config, text, options);
      }
    });

    // 国内模型 - 百度文心一言
    this.registerProvider({
      name: 'baidu',
      provider: 'baidu',
      generate: async (prompt, options) => {
        const config = this.getConfig('baidu');
        if (!config) throw new Error('Baidu config not found');
        return this.callBaiduAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('baidu');
        if (!config) throw new Error('Baidu config not found');
        await this.streamBaiduAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - 阿里通义千问
    this.registerProvider({
      name: 'alibaba',
      provider: 'alibaba',
      generate: async (prompt, options) => {
        const config = this.getConfig('alibaba');
        if (!config) throw new Error('Alibaba config not found');
        return this.callAlibabaAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('alibaba');
        if (!config) throw new Error('Alibaba config not found');
        await this.streamAlibabaAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - 腾讯混元
    this.registerProvider({
      name: 'tencent',
      provider: 'tencent',
      generate: async (prompt, options) => {
        const config = this.getConfig('tencent');
        if (!config) throw new Error('Tencent config not found');
        return this.callTencentAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('tencent');
        if (!config) throw new Error('Tencent config not found');
        await this.streamTencentAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - 字节豆包
    this.registerProvider({
      name: 'bytedance',
      provider: 'bytedance',
      generate: async (prompt, options) => {
        const config = this.getConfig('bytedance');
        if (!config) throw new Error('ByteDance config not found');
        return this.callByteDanceAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('bytedance');
        if (!config) throw new Error('ByteDance config not found');
        await this.streamByteDanceAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - 华为盘古
    this.registerProvider({
      name: 'huawei',
      provider: 'huawei',
      generate: async (prompt, options) => {
        const config = this.getConfig('huawei');
        if (!config) throw new Error('Huawei config not found');
        return this.callHuaweiAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('huawei');
        if (!config) throw new Error('Huawei config not found');
        await this.streamHuaweiAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - 智谱清言
    this.registerProvider({
      name: 'zhipu',
      provider: 'zhipu',
      generate: async (prompt, options) => {
        const config = this.getConfig('zhipu');
        if (!config) throw new Error('Zhipu config not found');
        return this.callZhipuAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('zhipu');
        if (!config) throw new Error('Zhipu config not found');
        await this.streamZhipuAPI(config, prompt, options, onChunk);
      }
    });

    // 国内模型 - MiniMax
    this.registerProvider({
      name: 'minimax',
      provider: 'minimax',
      generate: async (prompt, options) => {
        const config = this.getConfig('minimax');
        if (!config) throw new Error('MiniMax config not found');
        return this.callMiniMaxAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('minimax');
        if (!config) throw new Error('MiniMax config not found');
        await this.streamMiniMaxAPI(config, prompt, options, onChunk);
      }
    });

    // AI21
    this.registerProvider({
      name: 'ai21',
      provider: 'ai21',
      generate: async (prompt, options) => {
        const config = this.getConfig('ai21');
        if (!config) throw new Error('AI21 config not found');
        return this.callAI21API(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('ai21');
        if (!config) throw new Error('AI21 config not found');
        await this.streamAI21API(config, prompt, options, onChunk);
      }
    });

    // Fireworks
    this.registerProvider({
      name: 'fireworks',
      provider: 'fireworks',
      generate: async (prompt, options) => {
        const config = this.getConfig('fireworks');
        if (!config) throw new Error('Fireworks config not found');
        return this.callFireworksAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('fireworks');
        if (!config) throw new Error('Fireworks config not found');
        await this.streamFireworksAPI(config, prompt, options, onChunk);
      }
    });

    // Moonshot (月之暗面)
    this.registerProvider({
      name: 'moonshot',
      provider: 'moonshot',
      generate: async (prompt, options) => {
        const config = this.getConfig('moonshot');
        if (!config) throw new Error('Moonshot config not found');
        return this.callMoonshotAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('moonshot');
        if (!config) throw new Error('Moonshot config not found');
        await this.streamMoonshotAPI(config, prompt, options, onChunk);
      }
    });
  }

  /**
   * 注册自定义提供者
   */
  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  /**
   * 添加模型配置
   */
  addModel(config: LLMConfig) {
    this.modelConfigs.set(config.name, config);
    
    const wrappedProvider: LLMProvider = {
      name: config.name,
      provider: config.provider as ModelProvider,
      generate: async (prompt, options) => {
        return this.callModelAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        await this.streamModelAPI(config, prompt, options, onChunk);
      },
      embed: async (text, options) => {
        if (['openai', 'deepseek', 'custom'].includes(config.provider)) {
          return this.callOpenAIEmbeddingAPI(config, text, options);
        }
        throw new Error(`Embedding not supported for ${config.provider}`);
      }
    };
    this.providers.set(config.name, wrappedProvider);
    
    if (!this.defaultProvider) {
      this.defaultProvider = config.name;
    }
  }

  /**
   * 根据模型配置调用API
   */
  private async callModelAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const providerType = config.provider as ModelProvider;
    
    switch (providerType) {
      case 'openai':
      case 'openai':
      case 'deepseek':
      case 'custom':
      case 'mistral':
      case 'together':
      case 'groq':
      case 'perplexity':
      case 'fireworks':
      case 'ai21':
      case 'replicate':
      case 'huggingface':
        return this.callOpenAICompatibleAPI(config, prompt, options);
      case 'anthropic':
        return this.callAnthropicAPI(config, prompt, options);
      case 'gemini': {
        const modelInfo = this.getModelInfo(config.model);
        const isStreaming = modelInfo?.streamingMode === 'true' && options?.stream !== false;
        return this.callGeminiAPI(config, prompt, options, isStreaming);
      }
      case 'ollama':
        return this.callOllamaAPI(config, prompt, options);
      case 'koboldcpp':
        return this.callKoboldAPI(config, prompt, options);
      case 'cohere':
        return this.callCohereAPI(config, prompt, options);
      case 'cloudflare':
        return this.callCloudflareAPI(config, prompt, options);
      case 'azure':
        return this.callAzureAPI(config, prompt, options);
      case 'baidu':
        return this.callBaiduAPI(config, prompt, options);
      case 'alibaba':
        return this.callAlibabaAPI(config, prompt, options);
      case 'tencent':
        return this.callTencentAPI(config, prompt, options);
      case 'bytedance':
        return this.callByteDanceAPI(config, prompt, options);
      case 'huawei':
        return this.callHuaweiAPI(config, prompt, options);
      case 'zhipu':
        return this.callZhipuAPI(config, prompt, options);
      case 'minimax':
        return this.callMiniMaxAPI(config, prompt, options);
      case 'moonshot':
        return this.callMoonshotAPI(config, prompt, options);
      default:
        return this.callOpenAICompatibleAPI(config, prompt, options);
    }
  }

  /**
   * 流式调用模型API
   */
  private async streamModelAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const providerType = config.provider as ModelProvider;
    
    switch (providerType) {
      case 'openai':
      case 'deepseek':
      case 'custom':
      case 'mistral':
      case 'together':
      case 'groq':
      case 'perplexity':
      case 'fireworks':
      case 'ai21':
      case 'replicate':
      case 'huggingface':
        await this.streamOpenAICompatibleAPI(config, prompt, { ...options, stream: true }, onChunk);
        break;
      case 'gemini':
        await this.streamGeminiAPI(config, prompt, options, onChunk);
        break;
      case 'anthropic':
        await this.streamAnthropicAPI(config, prompt, options, onChunk);
        break;
      case 'cohere':
        await this.streamCohereAPI(config, prompt, options, onChunk);
        break;
      case 'cloudflare':
        await this.streamCloudflareAPI(config, prompt, options, onChunk);
        break;
      case 'azure':
        await this.streamAzureAPI(config, prompt, options, onChunk);
        break;
      case 'baidu':
        await this.streamBaiduAPI(config, prompt, options, onChunk);
        break;
      case 'alibaba':
        await this.streamAlibabaAPI(config, prompt, options, onChunk);
        break;
      case 'tencent':
        await this.streamTencentAPI(config, prompt, options, onChunk);
        break;
      case 'bytedance':
        await this.streamByteDanceAPI(config, prompt, options, onChunk);
        break;
      case 'huawei':
        await this.streamHuaweiAPI(config, prompt, options, onChunk);
        break;
      case 'zhipu':
        await this.streamZhipuAPI(config, prompt, options, onChunk);
        break;
      case 'minimax':
        await this.streamMiniMaxAPI(config, prompt, options, onChunk);
        break;
      case 'moonshot':
        await this.streamMoonshotAPI(config, prompt, options, onChunk);
        break;
      default:
        const result = await this.callModelAPI(config, prompt, options);
        onChunk(result.text);
    }
  }

  /**
   * 添加模型配置（addModel别名）
   */
  addConfig(config: LLMConfig) {
    this.addModel(config);
  }

  /**
   * 获取模型配置
   */
  getConfig(name: string): LLMConfig | undefined {
    return this.modelConfigs.get(name);
  }

  /**
   * 生成文本
   */
  async generate(
    prompt: string, 
    modelName?: string, 
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const name = modelName || this.defaultProvider;
    const provider = this.providers.get(name || '');
    
    if (!provider) {
      this.log('error', 'LLMManager', `Provider not found: ${name}`);
      throw new Error(`Provider not found: ${name}`);
    }
    
    this.log('debug', 'LLMManager', 'Generating text', { model: name, promptLength: prompt.length });
    const response = await provider.generate(prompt, options);
    
    if (response.usage) {
      const config = this.modelConfigs.get(name || '') || this.getConfigForProvider(provider.provider);
      this.recordCost(
        response.model || config?.model || name || 'unknown',
        provider.provider,
        response.usage.promptTokens,
        response.usage.completionTokens,
        'generate'
      );
    }
    
    return response;
  }

  /**
   * 补全文本
   */
  async complete(
    prompt: string, 
    options?: { task?: string; temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const result = await this.generate(prompt, this.defaultProvider, {
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2000
    });
    return result.text;
  }

  /**
   * 流式生成
   */
  async stream(
    prompt: string,
    modelName: string | undefined,
    options: GenerationOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const name = modelName || this.defaultProvider;
    const provider = this.providers.get(name || '');
    
    if (!provider?.stream) {
      this.log('error', 'LLMManager', `Streaming not supported for: ${name}`);
      throw new Error(`Streaming not supported for: ${name}`);
    }
    
    this.log('debug', 'LLMManager', 'Streaming generation', { model: name });
    return provider.stream(prompt, options, onChunk);
  }

  /**
   * 流式生成（自动检测模型支持）
   */
  async streamGenerate(
    prompt: string,
    modelName: string | undefined,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const name = modelName || this.defaultProvider;
    const config = this.modelConfigs.get(name || '');
    const modelInfo = config ? this.getModelInfo(config.model) : undefined;
    
    if (modelInfo?.streamingMode === 'true' && this.providers.get(name || '')?.stream) {
      await this.stream(prompt, modelName, { ...options, stream: true }, onChunk);
      return '';
    } else {
      const result = await this.generate(prompt, modelName, options);
      onChunk(result.text);
      return result.text;
    }
  }

  /**
   * 生成Embeddings（支持真实API和回退模拟）
   */
  async generateEmbedding(
    text: string, 
    modelName?: string,
    options?: EmbeddingOptions
  ): Promise<number[]> {
    const cacheKey = `${text}:${modelName || 'default'}:${options?.dimensions || 1536}`;
    const cached = this.embeddingCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.log('debug', 'LLMManager', 'Embedding cache hit');
      return cached.embedding;
    }

    const name = modelName || this.defaultProvider;
    const provider = this.providers.get(name || '');
    
    if (provider?.embed) {
      try {
        this.log('debug', 'LLMManager', 'Calling real embedding API');
        const response = await provider.embed(text, options);
        
        this.embeddingCache.set(cacheKey, {
          embedding: response.embedding,
          timestamp: Date.now()
        });
        
        if (response.usage) {
          const config = this.modelConfigs.get(name || '') || this.getConfigForProvider('openai');
          this.recordCost(
            response.model || config?.model || name || 'text-embedding-3-small',
            provider.provider,
            response.usage.promptTokens,
            0,
            'embedding'
          );
        }
        
        return response.embedding;
      } catch (error) {
        this.log('warn', 'LLMManager', 'Embedding API failed, falling back', { error });
      }
    }
    
    this.log('debug', 'LLMManager', 'Using TF-IDF fallback for embeddings');
    const embedding = this.textToEmbedding(text, options?.dimensions || 1536);
    
    this.embeddingCache.set(cacheKey, {
      embedding,
      timestamp: Date.now()
    });
    
    return embedding;
  }

  /**
   * 批量生成Embeddings（并行优化）
   */
  async generateEmbeddings(
    texts: string[],
    modelName?: string,
    options?: EmbeddingOptions
  ): Promise<number[][]> {
    const concurrency = 3;
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += concurrency) {
      const batch = texts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text, modelName, options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * 将文本转换为语义embedding向量（基于TF-IDF加权词向量 - 回退方案）
   */
  private textToEmbedding(text: string, dimensions: number = 1536): number[] {
    const words = this.tokenize(text);
    const wordFreq = this.calculateWordFrequency(words);
    const wordScores = this.calculateWordImportance(words, wordFreq);
    
    const embedding = new Array(dimensions).fill(0);
    let index = 0;
    
    for (const [word, freq] of Object.entries(wordFreq)) {
      const wordHash = this.hashWord(word);
      const score = wordScores[word] || freq;
      
      const startIdx = Math.abs(wordHash) % dimensions;
      const spreadFactor = Math.min(5, Math.ceil(dimensions / (Object.keys(wordFreq).length * 10)));
      
      for (let offset = 0; offset < spreadFactor; offset++) {
        const pos = (startIdx + offset) % dimensions;
        const sign = ((wordHash >> offset) & 1) ? 1 : -1;
        const weight = score * (1 / (1 + offset));
        
        embedding[pos] += sign * weight * 0.3;
      }
      
      index++;
      if (index >= 50) break;
    }
    
    for (let i = 0; i < dimensions; i++) {
      const charCode = text.charCodeAt(i % text.length);
      const ngram = this.hashWord(text.slice(Math.max(0, i - 2), i + 3));
      embedding[i] += ((charCode % 100) / 100 - 0.5) * 0.1;
      embedding[i] += (ngram % 100) / 500;
    }
    
    let magnitude = 0;
    for (let i = 0; i < dimensions; i++) {
      magnitude += embedding[i] * embedding[i];
    }
    magnitude = Math.sqrt(magnitude) || 1;
    
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
    
    return embedding;
  }
  
  /**
   * 计算词语重要性分数（结合词频、词长和停用词排除）
   */
  private calculateWordImportance(words: string[], wordFreq: Record<string, number>): Record<string, number> {
    const stopWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
    ]);
    
    const scores: Record<string, number> = {};
    const totalWords = words.length || 1;
    
    for (const [word, freq] of Object.entries(wordFreq)) {
      let score = freq;
      
      // 排除停用词
      if (stopWords.has(word.toLowerCase())) {
        score *= 0.1;
      }
      
      // 词长奖励
      if (word.length >= 2) {
        score *= Math.min(2, 1 + word.length * 0.1);
      }
      
      scores[word] = score;
    }
    
    return scores;
  }
  
  private tokenize(text: string): string[] {
    const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
    const english = text.toLowerCase().match(/[a-z]{2,}/g) || [];
    
    const tokens: string[] = [];
    for (const chars of chinese) {
      for (let i = 0; i < chars.length; i++) {
        tokens.push(chars[i]);
        if (i < chars.length - 1) {
          tokens.push(chars.slice(i, i + 2));
        }
      }
    }
    
    return [...tokens, ...english];
  }
  
  private calculateWordFrequency(words: string[]): Record<string, number> {
    const freq: Record<string, number> = {};
    const total = words.length || 1;
    
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
    
    for (const key in freq) {
      freq[key] = freq[key] / total;
    }
    
    return freq;
  }
  
  private calculateIDF(documents: string[], vocabulary: string[]): Record<string, number> {
    const idf: Record<string, number> = {};
    const n = documents.length || 1;
    
    for (const word of vocabulary) {
      let docFreq = 0;
      for (const doc of documents) {
        if (doc.includes(word)) docFreq++;
      }
      idf[word] = Math.log((n + 1) / (docFreq + 1)) + 1;
    }
    
    return idf;
  }
  
  private hashWord(word: string): number {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash) ^ word.charCodeAt(i);
      hash = hash >>> 0;
    }
    return hash;
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 设置模型路由
   */
  setRoutes(routes: ModelRoute[]) {
    this.routes = routes;
  }

  /**
   * 根据任务类型路由
   */
  route(task: ModelRoute['task']): LLMConfig | undefined {
    const route = this.routes.find(r => r.task === task);
    return route?.llmConfig;
  }

  /**
   * 设置默认模型
   */
  setDefault(modelName: string) {
    this.defaultProvider = modelName;
  }

  /**
   * 调用 OpenAI Embedding API
   */
  private async callOpenAIEmbeddingAPI(
    config: LLMConfig,
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
    const model = options?.model || config.model;
    
    this.log('debug', 'LLMManager', 'Calling OpenAI Embedding API', { endpoint, model });
    
    const response = await fetch(`${endpoint}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: text,
        dimensions: options?.dimensions
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Embedding API failed', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Embedding API Error: ${response.status}`);
    }

    const data = await response.json() as {
      data?: Array<{ embedding: number[] }>;
      model?: string;
      usage?: {
        prompt_tokens?: number;
        total_tokens?: number;
      };
    };
    
    const embedding = data.data?.[0]?.embedding || this.textToEmbedding(text);
    
    return {
      embedding,
      model: data.model || model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 调用 OpenAI 兼容 API
   */
  private async callOpenAICompatibleAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty,
        presence_penalty: options?.presencePenalty,
        stop: options?.stop,
        stream: options?.stream ?? false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'OpenAI API failed', {
        status: response.status,
        error: errorText
      });
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
      model?: string;
    };
    
    return {
      text: data.choices?.[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined,
      model: data.model || config.model,
      finishReason: data.choices?.[0]?.finish_reason
    };
  }

  /**
   * 流式调用 OpenAI 兼容 API
   */
  private async streamOpenAICompatibleAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions & { stream?: boolean },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || config.baseURL || 'https://api.openai.com/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'OpenAI stream failed', { status: response.status });
      throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
          }
        }
      }
    }
  }

  /**
   * 调用 Gemini API
   */
  private async callGeminiAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions,
    stream: boolean = false
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
    
    if (stream) {
      let fullText = '';
      await this.streamGeminiAPI(config, prompt, options, (chunk) => {
        fullText += chunk;
      });
      return {
        text: fullText,
        model: config.model
      };
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: false
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Gemini API failed', { status: response.status });
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    
    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || config.model
    };
  }

  /**
   * 流式调用 Gemini API
   */
  private async streamGeminiAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Gemini stream failed', { status: response.status });
      throw new Error(`Gemini Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
          }
        }
      }
    }
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropicAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || config.baseURL || 'https://api.anthropic.com/v1';
    
    const response = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Anthropic API failed', { status: response.status });
      throw new Error(`Anthropic API Error: ${response.status}`);
    }

    const data = await response.json() as {
      content?: Array<{ type: string; text: string }>;
      model?: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
      };
    };
    
    return {
      text: data.content?.find(c => c.type === 'text')?.text || '',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
      } : undefined
    };
  }

  /**
   * 调用 Ollama API
   */
  private async callOllamaAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'http://localhost:11434/api';
    
    const response = await fetch(`${endpoint}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Ollama API failed', { status: response.status });
      throw new Error(`Ollama API Error: ${response.status}`);
    }

    const data = await response.json() as {
      response?: string;
      model?: string;
    };
    
    return {
      text: data.response || '',
      model: data.model || config.model
    };
  }

  /**
   * 调用 KoboldCPP API
   */
  private async callKoboldAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'http://localhost:5001/api';
    
    const response = await fetch(`${endpoint}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        temperature: options?.temperature ?? 0.7,
        max_length: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Kobold API failed', { status: response.status });
      throw new Error(`Kobold API Error: ${response.status}`);
    }

    const data = await response.json() as {
      results?: Array<{ text: string }>;
    };
    
    return {
      text: data.results?.[0]?.text || '',
      model: config.model
    };
  }

  /**
   * 调用 Mistral AI API
   */
  private async callMistralAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.mistral.ai/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Mistral API failed', { status: response.status, error: errorText });
      throw new Error(`Mistral API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined,
      model: data.model || config.model
    };
  }

  /**
   * 流式调用 Mistral AI API
   */
  private async streamMistralAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.mistral.ai/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Mistral stream failed', { status: response.status });
      throw new Error(`Mistral Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Cohere API
   */
  private async callCohereAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.cohere.ai/v1';

    const response = await fetch(`${endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        message: prompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Cohere API failed', { status: response.status, error: errorText });
      throw new Error(`Cohere API Error: ${response.status}`);
    }

    const data = await response.json() as {
      text?: string;
      generation_id?: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.text || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Cohere API
   */
  private async streamCohereAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.cohere.ai/v1';

    const response = await fetch(`${endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        message: prompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Cohere stream failed', { status: response.status });
      throw new Error(`Cohere Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.text;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Cohere Embedding API
   */
  private async callCohereEmbeddingAPI(
    config: LLMConfig,
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const endpoint = config.endpoint || 'https://api.cohere.ai/v1';

    const response = await fetch(`${endpoint}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || config.model,
        texts: [text]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Cohere Embedding failed', { status: response.status, error: errorText });
      throw new Error(`Cohere Embedding Error: ${response.status}`);
    }

    const data = await response.json() as {
      embeddings?: number[][];
      model?: string;
      usage?: { prompt_tokens?: number; total_tokens?: number };
    };

    return {
      embedding: data.embeddings?.[0] || this.textToEmbedding(text),
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 调用 Groq API
   */
  private async callGroqAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.groq.com/openai/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Groq API failed', { status: response.status, error: errorText });
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Groq API
   */
  private async streamGroqAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.groq.com/openai/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Groq stream failed', { status: response.status });
      throw new Error(`Groq Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Together AI API
   */
  private async callTogetherAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.together.xyz/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Together AI failed', { status: response.status, error: errorText });
      throw new Error(`Together AI Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Together AI API
   */
  private async streamTogetherAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.together.xyz/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Together stream failed', { status: response.status });
      throw new Error(`Together Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Perplexity API
   */
  private async callPerplexityAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.perplexity.ai';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Perplexity API failed', { status: response.status, error: errorText });
      throw new Error(`Perplexity API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Perplexity API
   */
  private async streamPerplexityAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.perplexity.ai';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Perplexity stream failed', { status: response.status });
      throw new Error(`Perplexity Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Cloudflare Workers AI API
   */
  private async callCloudflareAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    const endpoint = config.endpoint || `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai`;

    const response = await fetch(`${endpoint}/v1/run/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Cloudflare API failed', { status: response.status, error: errorText });
      throw new Error(`Cloudflare API Error: ${response.status}`);
    }

    const data = await response.json() as {
      result?: { response?: string };
    };

    return {
      text: data.result?.response || '',
      model: config.model
    };
  }

  /**
   * 流式调用 Cloudflare Workers AI API
   */
  private async streamCloudflareAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    const endpoint = config.endpoint || `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai`;

    const response = await fetch(`${endpoint}/v1/run/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Cloudflare stream failed', { status: response.status });
      throw new Error(`Cloudflare Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.response;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Azure OpenAI API
   */
  private async callAzureAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const deployment = config.deployment || config.model;
    const endpoint = config.endpoint || config.baseURL || process.env.AZURE_OPENAI_ENDPOINT;

    if (!endpoint) {
      throw new Error('Azure OpenAI endpoint not configured');
    }

    const apiVersion = config.apiVersion || '2024-02-01';
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Azure API failed', { status: response.status, error: errorText });
      throw new Error(`Azure API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Azure OpenAI API
   */
  private async streamAzureAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const deployment = config.deployment || config.model;
    const endpoint = config.endpoint || config.baseURL || process.env.AZURE_OPENAI_ENDPOINT;

    if (!endpoint) {
      throw new Error('Azure OpenAI endpoint not configured');
    }

    const apiVersion = config.apiVersion || '2024-02-01';
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Azure stream failed', { status: response.status });
      throw new Error(`Azure Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 流式调用 Anthropic API
   */
  private async streamAnthropicAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || config.baseURL || 'https://api.anthropic.com/v1';

    const response = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Anthropic stream failed', { status: response.status });
      throw new Error(`Anthropic Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text;
              if (content) onChunk(content);
            }
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Voyage AI Embedding API
   */
  private async callVoyageEmbeddingAPI(
    config: LLMConfig,
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const endpoint = config.endpoint || 'https://api.voyageai.com/v1';

    const response = await fetch(`${endpoint}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || config.model,
        input: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Voyage Embedding failed', { status: response.status, error: errorText });
      throw new Error(`Voyage Embedding Error: ${response.status}`);
    }

    const data = await response.json() as {
      data?: Array<{ embedding: number[] }>;
      model?: string;
      usage?: { prompt_tokens?: number; total_tokens?: number };
    };

    return {
      embedding: data.data?.[0]?.embedding || this.textToEmbedding(text),
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 调用 Nomic Embedding API
   */
  private async callNomicEmbeddingAPI(
    config: LLMConfig,
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    const endpoint = config.endpoint || 'https://api-atlas.nomic.ai/v1';

    const response = await fetch(`${endpoint}/embedding/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || config.model,
        texts: [text]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Nomic Embedding failed', { status: response.status, error: errorText });
      throw new Error(`Nomic Embedding Error: ${response.status}`);
    }

    const data = await response.json() as {
      embeddings?: number[][];
      model?: string;
    };

    return {
      embedding: data.embeddings?.[0] || this.textToEmbedding(text),
      model: data.model || config.model
    };
  }

  /**
   * 调用百度文心一言 API
   */
  private async callBaiduAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';

    const response = await fetch(`${endpoint}/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Baidu API failed', { status: response.status, error: errorText });
      throw new Error(`Baidu API Error: ${response.status}`);
    }

    const data = await response.json() as {
      result?: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.result || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用百度文心一言 API
   */
  private async streamBaiduAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';

    const response = await fetch(`${endpoint}/${config.model}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Baidu stream failed', { status: response.status });
      throw new Error(`Baidu Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            const content = parsed.result;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用阿里通义千问 API
   */
  private async callAlibabaAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://dashscope.aliyuncs.com/api/text/completion';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: {
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Alibaba API failed', { status: response.status, error: errorText });
      throw new Error(`Alibaba API Error: ${response.status}`);
    }

    const data = await response.json() as {
      output?: { text?: string };
      usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.output?.text || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用阿里通义千问 API
   */
  private async streamAlibabaAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://dashscope.aliyuncs.com/api/text/completion';

    const response = await fetch(`${endpoint}?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: {
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000
        }
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Alibaba stream failed', { status: response.status });
      throw new Error(`Alibaba Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            const content = parsed.output?.text;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用腾讯混元 API
   */
  private async callTencentAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://hunyuan.tencentcloudapi.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Tencent API failed', { status: response.status, error: errorText });
      throw new Error(`Tencent API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用腾讯混元 API
   */
  private async streamTencentAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://hunyuan.tencentcloudapi.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Tencent stream failed', { status: response.status });
      throw new Error(`Tencent Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用字节跳动豆包 API
   */
  private async callByteDanceAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.doubao.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'ByteDance API failed', { status: response.status, error: errorText });
      throw new Error(`ByteDance API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用字节跳动豆包 API
   */
  private async streamByteDanceAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.doubao.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'ByteDance stream failed', { status: response.status });
      throw new Error(`ByteDance Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用华为盘古 API
   */
  private async callHuaweiAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.pangu.huaweicloud.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Huawei API failed', { status: response.status, error: errorText });
      throw new Error(`Huawei API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用华为盘古 API
   */
  private async streamHuaweiAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.pangu.huaweicloud.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Huawei stream failed', { status: response.status });
      throw new Error(`Huawei Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用智谱清言 API
   */
  private async callZhipuAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Zhipu API failed', { status: response.status, error: errorText });
      throw new Error(`Zhipu API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用智谱清言 API
   */
  private async streamZhipuAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Zhipu stream failed', { status: response.status });
      throw new Error(`Zhipu Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 MiniMax API
   */
  private async callMiniMaxAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.minimax.chat/v1/text/completion';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'MiniMax API failed', { status: response.status, error: errorText });
      throw new Error(`MiniMax API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 MiniMax API
   */
  private async streamMiniMaxAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.minimax.chat/v1/text/completion';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'MiniMax stream failed', { status: response.status });
      throw new Error(`MiniMax Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 AI21 API
   */
  private async callAI21API(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.ai21.com/studio/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'AI21 API failed', { status: response.status, error: errorText });
      throw new Error(`AI21 API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 AI21 API
   */
  private async streamAI21API(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.ai21.com/studio/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'AI21 stream failed', { status: response.status });
      throw new Error(`AI21 Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Fireworks API
   */
  private async callFireworksAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.fireworks.ai/inference/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Fireworks API failed', { status: response.status, error: errorText });
      throw new Error(`Fireworks API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Fireworks API
   */
  private async streamFireworksAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.fireworks.ai/inference/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Fireworks stream failed', { status: response.status });
      throw new Error(`Fireworks Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }

  /**
   * 调用 Moonshot (月之暗面) API
   */
  private async callMoonshotAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.moonshot.cn/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log('error', 'LLMManager', 'Moonshot API failed', { status: response.status, error: errorText });
      throw new Error(`Moonshot API Error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 流式调用 Moonshot (月之暗面) API
   */
  private async streamMoonshotAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.moonshot.cn/v1';

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      this.log('error', 'LLMManager', 'Moonshot stream failed', { status: response.status });
      throw new Error(`Moonshot Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
  }
}
