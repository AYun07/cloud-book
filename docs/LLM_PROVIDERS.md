# Cloud Book 大模型接口支持文档

## 一、概述

Cloud Book 是一款全能AI小说创作引擎，支持国内外 **26+ 大模型提供商**，**280+ 大模型**，涵盖文本生成、嵌入向量、智能推理等多种能力。本文档详细介绍所有已支持的大模型接口、本地部署方案以及自定义模型配置方式。

---

## 二、支持的模型提供商（26+）

### 2.1 国际主流模型

| 提供商 | 模型数量 | 主要特点 | 官方地址 |
|--------|----------|----------|----------|
| **OpenAI** | 27 | GPT-4o、GPT-4、O1推理系列 | https://platform.openai.com |
| **Anthropic** | 9 | Claude 3.5/3/2系列 | https://www.anthropic.com |
| **Google** | 11 | Gemini 2.0/1.5/Pro | https://ai.google.dev |
| **DeepSeek** | 5 | DeepSeek-V3/Chat/Coder | https://platform.deepseek.com |
| **Mistral** | 14 | Mistral Large/Nemo/H砆欻欻欻 | https://mistral.ai |
| **Cohere** | 13 | Command R+/R系列 | https://cohere.com |
| **Groq** | 14 | LLaMA/Mixtral高速推理 | https://console.groq.com |
| **Together AI** | 19 | 开源模型聚合平台 | https://together.ai |
| **Perplexity** | 6 | Sonar在线搜索模型 | https://perplexity.ai |
| **Fireworks AI** | 9 | 高性能推理平台 | https://fireworks.ai |
| **Cloudflare Workers AI** | 12 | @CF边缘AI推理 | https://developers.cloudflare.com/workers-ai |
| **Replicate** | 6 | 云端模型推理 | https://replicate.com |
| **HuggingFace** | 12 | 开源模型Hub | https://huggingface.co |
| **AI21** | 6 | Jurassic系列 | https://ai21.com |
| **Voyage AI** | 7 | 专用嵌入模型 | https:// voyage.ai |
| **Nomic** | 2 | 开源嵌入模型 | https://nomic.ai |

### 2.2 国内大模型

| 提供商 | 模型数量 | 主要特点 | 官方地址 |
|--------|----------|----------|----------|
| **百度文心一言** | 10 | ERNIE 4.0/3.5/4 | https://console.bce.baidu.com |
| **阿里通义千问** | 16 | Qwen-Max/Plus/Turbo | https://dashscope.console.aliyun.com |
| **腾讯混元** | 7 | Hunyuan-千亿/Pro/Std | https://cloud.tencent.com |
| **字节豆包** | 8 | Doubao-Pro/Lite | https://console.volcengine.com |
| **华为云** | 4 | 盘古系列 | https://www.huaweicloud.com |
| **智谱GLM** | 13 | GLM-4/3系列 | https://open.bigmodel.cn |
| **MiniMax** | 7 | ABAB系列 | https://www.minimax.io |
| **Moonshot** | 3 | Kimi长上下文 | https://platform.moonshot.cn |

### 2.3 本地部署模型

| 提供商 | 模型数量 | 主要特点 | 配置难度 |
|--------|----------|----------|----------|
| **Ollama** | 23 | 支持所有Llama/开源模型 | ⭐ 简单 |
| **KoboldCPP** | 1 | 本地小说生成优化 | ⭐ 简单 |

### 2.4 企业级模型

| 提供商 | 模型数量 | 主要特点 | 官方地址 |
|--------|----------|----------|----------|
| **Azure OpenAI** | - | 企业级GPT部署 | https://azure.microsoft.com |
| **Custom** | 无限 | 支持所有OpenAI兼容接口 | ⭐⭐ 中等 |

---

## 三、详细模型列表

### 3.1 OpenAI 系列（27个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **gpt-4o** | 128K | ✅ | 最新旗舰模型，支持视觉 |
| **gpt-4o-2024-11-20** | 128K | ✅ | GPT-4o 最新版本 |
| **gpt-4o-2024-08-06** | 128K | ✅ | GPT-4o 稳定版本 |
| **gpt-4o-mini** | 128K | ✅ | 高性价比轻量版 |
| **gpt-4o-mini-2024-07-18** | 128K | ✅ | GPT-4o Mini 指定版本 |
| **gpt-4.1** | 1M | ✅ | 超大上下文版本 |
| **gpt-4.1-mini** | 1M | ✅ | GPT-4.1 平衡版 |
| **gpt-4.1-nano** | 1M | ✅ | GPT-4.1 轻量版 |
| **gpt-4-turbo** | 128K | ✅ | GPT-4 Turbo 快速强大 |
| **gpt-4-turbo-2024-04-09** | 128K | ✅ | Turbo 指定版本 |
| **gpt-4** | 8K | ✅ | GPT-4 原始版本 |
| **gpt-4-32k** | 32K | ✅ | GPT-4 32K上下文 |
| **gpt-3.5-turbo** | 16K | ✅ | GPT-3.5 Turbo 轻量快速 |
| **gpt-3.5-turbo-16k** | 16K | ✅ | GPT-3.5 Turbo 16K |
| **o1** | 200K | ✅ | O1 深度推理模型 |
| **o1-preview** | 128K | ✅ | O1 Preview 推理预览版 |
| **o1-mini** | 128K | ✅ | O1 Mini 轻量推理 |
| **chatgpt-4o-latest** | 128K | ✅ | ChatGPT最新版本 |
| **gpt-4-turbo-preview** | 128K | ✅ | Turbo预览版 |
| **gpt-4-0613** | 8K | ✅ | GPT-4 固定版本 |
| **gpt-4-32k-0613** | 32K | ✅ | GPT-4 32K固定版本 |
| **gpt-3.5-turbo-0613** | 16K | ✅ | GPT-3.5固定版本 |
| **gpt-3.5-turbo-16k-0613** | 16K | ✅ | GPT-3.5 16K固定版本 |
| **text-embedding-3-large** | - | ❌ | OpenAI 嵌入模型（大） |
| **text-embedding-3-small** | - | ❌ | OpenAI 嵌入模型（小） |
| **text-embedding-ada-002** | - | ❌ | OpenAI 嵌入模型（经典） |
| **o3** | 200K | ✅ | O3 深度推理升级版 |
| **o3-mini** | 200K | ✅ | O3 Mini 轻量推理 |

### 3.2 Anthropic Claude 系列（9个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **claude-sonnet-4-20250514** | 200K | ✅ | Claude Sonnet 4 最新版 |
| **claude-sonnet-4** | 200K | ✅ | Claude Sonnet 4 |
| **claude-3-5-sonnet-latest** | 200K | ✅ | Claude 3.5 Sonnet |
| **claude-3-5-sonnet-20241022** | 200K | ✅ | Claude 3.5 Sonnet 稳定版 |
| **claude-3-5-sonnet-20240620** | 200K | ✅ | Claude 3.5 Sonnet 早期版 |
| **claude-3-opus-latest** | 200K | ✅ | Claude 3 Opus 最强版 |
| **claude-3-opus-20240229** | 200K | ✅ | Claude 3 Opus |
| **claude-3-haiku-20240307** | 200K | ✅ | Claude 3 Haiku 轻量版 |
| **claude-3-sonnet-20240229** | 200K | ✅ | Claude 3 Sonnet |

### 3.3 Google Gemini 系列（11个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **gemini-2.0-flash-exp** | 1M | ✅ | Gemini 2.0  экспериментальная |
| **gemini-2.0-flash** | 1M | ✅ | Gemini 2.0 Flash |
| **gemini-1.5-flash-8b** | 1M | ✅ | Gemini 1.5 Flash 8B |
| **gemini-1.5-flash** | 1M | ✅ | Gemini 1.5 Flash |
| **gemini-1.5-flash-002** | 1M | ✅ | Gemini 1.5 Flash v2 |
| **gemini-1.5-flash-001** | 1M | ✅ | Gemini 1.5 Flash v1 |
| **gemini-1.5-pro** | 2M | ✅ | Gemini 1.5 Pro |
| **gemini-1.5-pro-002** | 2M | ✅ | Gemini 1.5 Pro v2 |
| **gemini-1.5-pro-001** | 2M | ✅ | Gemini 1.5 Pro v1 |
| **gemini-1.5-pro-exp** | 2M | ✅ | Gemini 1.5 Pro  экспериментальная |
| **gemini-exp-1206** | 1M | ✅ | Gemini 实验版本 |

### 3.4 DeepSeek 系列（5个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **deepseek-chat** | 64K | ✅ | DeepSeek 通用对话 |
| **deepseek-coder** | 64K | ✅ | DeepSeek 代码模型 |
| **deepseek-v3** | 64K | ✅ | DeepSeek V3 最新版 |
| **deepseek-chat-v2** | 64K | ✅ | DeepSeek V2 |
| **deepseek-chat-v1** | 64K | ✅ | DeepSeek V1 |

### 3.5 百度文心一言（10个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **ernie-4.0-8k-latest** | 8K | ✅ | ERNIE 4.0 最新版 |
| **ernie-4.0-8k** | 8K | ✅ | ERNIE 4.0 8K版 |
| **ernie-4.0-4k** | 4K | ✅ | ERNIE 4.0 4K版 |
| **ernie-3.5-8k** | 8K | ✅ | ERNIE 3.5 8K版 |
| **ernie-3.5-8k-v2** | 8K | ✅ | ERNIE 3.5 V2 |
| **ernie-3.5-4k** | 4K | ✅ | ERNIE 3.5 4K版 |
| **ernie-speed-8k** | 8K | ✅ | ERNIE Speed 8K |
| **ernie-speed-128k** | 128K | ✅ | ERNIE Speed 128K |
| **ernie-lite-8k** | 8K | ✅ | ERNIE Lite 轻量版 |
| **ernie-bot** | 8K | ✅ | ERNIE Bot 经典版 |

### 3.6 阿里通义千问（16个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **qwen-max** | 8K | ✅ | Qwen Max 最强版 |
| **qwen-max-longcontext** | 30K | ✅ | Qwen Max 长上下文 |
| **qwen-plus** | 131K | ✅ | Qwen Plus 大杯版 |
| **qwen-plus-nuxt** | 131K | ✅ | Qwen Plus 新版 |
| **qwen-turbo** | 131K | ✅ | Qwen Turbo 快速版 |
| **qwen-turbo-nuxt** | 131K | ✅ | Qwen Turbo 新版 |
| **qwen-72b-chat** | 32K | ✅ | Qwen 72B 对话版 |
| **qwen-14b-chat** | 8K | ✅ | Qwen 14B 对话版 |
| **qwen-7b-chat** | 8K | ✅ | Qwen 7B 对话版 |
| **qwen-moe** | 32K | ✅ | Qwen MoE 专家混合 |
| **qwen-coder-plus** | 128K | ✅ | Qwen Coder Plus |
| **qwen-coder-turbo** | 128K | ✅ | Qwen Coder Turbo |
| **qwen-vl-plus** | 128K | ✅ | Qwen VL 多模态 |
| **qwen-vl-max** | 128K | ✅ | Qwen VL Max |
| **qwen-audio** | 128K | ✅ | Qwen Audio 音频 |
| **qwen2-72b-instruct** | 32K | ✅ | Qwen2 72B |

### 3.7 腾讯混元（7个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **hunyuan** | 128K | ✅ | 混元通用版 |
| **hunyuan-pro** | 128K | ✅ | 混元 Pro 专业版 |
| **hunyuan-standard** | 128K | ✅ | 混元 Standard |
| **hunyuan-lite** | 128K | ✅ | 混元 Lite 轻量版 |
| **hunyuan-code** | 128K | ✅ | 混元 Code 代码版 |
| **hunyuan-functioncall** | 128K | ✅ | 混元函数调用版 |
| **hunyuan-air** | 128K | ✅ | 混元 Air 极速版 |

### 3.8 字节豆包（8个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **doubao-pro-32k** | 32K | ✅ | 豆包 Pro 32K |
| **doubao-pro-4k** | 4K | ✅ | 豆包 Pro 4K |
| **doubao-lite-32k** | 32K | ✅ | 豆包 Lite 32K |
| **doubao-lite-4k** | 4K | ✅ | 豆包 Lite 4K |
| **doubao-beta** | 32K | ✅ | 豆包 Beta 测试版 |
| **doubao-functioncall** | 32K | ✅ | 豆包函数调用版 |
| **doubao-endpoint** | 32K | ✅ | 豆包端点版 |
| **ENDPOINT** | - | ✅ | 火山引擎端点 |

### 3.9 华为云盘古（4个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **pangu-4** | 128K | ✅ | 盘古大模型 4 |
| **pangu-api** | 128K | ✅ | 盘古 API 版本 |
| **pangu-alpha** | 128K | ✅ | 盘古 Alpha 版 |
| **ext_pangu** | 128K | ✅ | 盘古扩展版本 |

### 3.10 智谱GLM（13个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **glm-4** | 128K | ✅ | GLM-4 最新版 |
| **glm-4v** | 128K | ✅ | GLM-4V 多模态 |
| **glm-4-plus** | 128K | ✅ | GLM-4 Plus |
| **glm-4-flash** | 128K | ✅ | GLM-4 Flash 快速版 |
| **glm-4-air** | 128K | ✅ | GLM-4 Air 轻量版 |
| **glm-4-airx** | 128K | ✅ | GLM-4 AirX |
| **glm-3-turbo** | 128K | ✅ | GLM-3 Turbo |
| **glm-zero** | 128K | ✅ | GLM Zero 零样本 |
| **glm-4-alltools** | 128K | ✅ | GLM-4 全工具版 |
| **characterglm-6b** | 8K | ✅ | CharacterGLM 角色扮演 |
| **codegeex-4** | 128K | ✅ | CodeGeeX-4 代码 |
| **cogview-3** | - | ✅ | CogView-3 图像生成 |
| **embedding-2** | - | ❌ | GLM 嵌入模型 |

### 3.11 MiniMax（7个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **abab6-chat** | 245K | ✅ | ABAB6 聊天版 |
| **abab5.5-chat** | 245K | ✅ | ABAB5.5 聊天版 |
| **abab5-chat** | 245K | ✅ | ABAB5 聊天版 |
| **abab6.5s-chat** | 245K | ✅ | ABAB6.5S 快速版 |
| **MiniMax-Text-01** | 1000K | ✅ | MiniMax 超长文本 |
| **MiniMax-Embedding-01** | - | ❌ | MiniMax 嵌入模型 |
| **speech-02-hd** | - | ✅ | MiniMax 语音 HD |

### 3.12 Moonshot Kimi（3个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **moonshot-v1-8k** | 8K | ✅ | Moonshot 8K |
| **moonshot-v1-32k** | 32K | ✅ | Moonshot 32K |
| **moonshot-v1-128k** | 128K | ✅ | Moonshot 128K 超长上下文 |

### 3.13 Mistral AI（14个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **mistral-large** | 128K | ✅ | Mistral Large 最新版 |
| **mistral-large-2407** | 128K | ✅ | Mistral Large 2407 |
| **mistral-large-2405** | 128K | ✅ | Mistral Large 2405 |
| **mistral-nemo** | 128K | ✅ | Mistral Nemo |
| **mistral-small** | 128K | ✅ | Mistral Small |
| **mistral-tiny** | 128K | ✅ | Mistral Tiny |
| **codestral** | 128K | ✅ | Codestral 代码模型 |
| **mistral-7b-instruct** | 8K | ✅ | Mistral 7B 指导版 |
| **mixtral-8x22b-instruct** | 64K | ✅ | Mixtral 8x22B |
| **mixtral-8x7b-instruct** | 32K | ✅ | Mixtral 8x7B |
| **open-mistral-7b** | 8K | ✅ | Open Mistral 7B |
| **open-mixtral-8x7b** | 32K | ✅ | Open Mixtral 8x7B |
| **open-mixtral-8x22b** | 64K | ✅ | Open Mixtral 8x22B |
| **open-codestral-mamba** | 256K | ✅ | Open Codestral Mamba |

### 3.14 Groq 系列（14个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **llama-3.3-70b-versatile** | 128K | ✅ | LLaMA 3.3 70B |
| **llama-3.2-90b-vision-preview** | 128K | ✅ | LLaMA 3.2 90B 视觉 |
| **llama-3.2-11b-vision-preview** | 128K | ✅ | LLaMA 3.2 11B 视觉 |
| **llama-3.1-70b-versatile** | 128K | ✅ | LLaMA 3.1 70B |
| **llama-3.1-8b-instant** | 128K | ✅ | LLaMA 3.1 8B 快速 |
| **llama-3-70b-versatile** | 8K | ✅ | LLaMA 3 70B |
| **llama-3-8b-instant** | 8K | ✅ | LLaMA 3 8B |
| **mixtral-8x7b-32768** | 32K | ✅ | Mixtral 8x7B 32K |
| **gemma2-9b-it** | 8K | ✅ | Gemma 2 9B 指导 |
| **gemma2-7b-it** | 8K | ✅ | Gemma 2 7B 指导 |
| **llama-guard-3-8b** | 8K | ✅ | LLaMA Guard 3 安全 |
| **llama-3.2-1b-preview** | 128K | ✅ | LLaMA 3.2 1B 预览 |
| **llama-3.2-3b-preview** | 128K | ✅ | LLaMA 3.2 3B 预览 |
| **distil-whisper-large-v3-en** | - | ✅ | Distil-Whisper 语音 |

### 3.15 Together AI（19个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **deepseek-ai/DeepSeek-V3** | 64K | ✅ | DeepSeek V3 |
| **deepseek-ai/DeepSeek-Coder-V2** | 64K | ✅ | DeepSeek Coder V2 |
| **meta-llama/Llama-3.3-70B-Instruct** | 128K | ✅ | LLaMA 3.3 70B |
| **meta-llama/Llama-3.2-90B-Vision** | 128K | ✅ | LLaMA 3.2 90B 视觉 |
| **meta-llama/Llama-3.2-11B-Vision** | 128K | ✅ | LLaMA 3.2 11B 视觉 |
| **meta-llama/Llama-3.1-405B-Instruct** | 128K | ✅ | LLaMA 3.1 405B |
| **meta-llama/Llama-3.1-70B-Instruct** | 128K | ✅ | LLaMA 3.1 70B |
| **meta-llama/Llama-3.1-8B-Instruct** | 128K | ✅ | LLaMA 3.1 8B |
| **mistralai/Mistral-Large-Instruct** | 128K | ✅ | Mistral Large |
| **mistralai/Mixtral-8x22B-Instruct** | 64K | ✅ | Mixtral 8x22B |
| **mistralai/Mixtral-8x7B-Instruct** | 32K | ✅ | Mixtral 8x7B |
| **Qwen/Qwen2-72B-Instruct** | 128K | ✅ | Qwen2 72B |
| **Qwen/Qwen2.5-72B-Instruct** | 32K | ✅ | Qwen2.5 72B |
| **Qwen/Qwen2.5-32B-Instruct** | 32K | ✅ | Qwen2.5 32B |
| **NousResearch/Nous-Hermes-2-Mixtral** | 32K | ✅ | Nous Hermes 2 |
| **cognitivecomputations/dolphin-mixtral** | 32K | ✅ | Dolphin Mixtral |
| **WizardLM/WizardLM-2-8x22B** | 64K | ✅ | WizardLM 2 |
| **allenai/OLMo-7B-Instruct** | 4K | ✅ | OLMo 7B |
| **Austism/chronos-grad-13b** | 8K | ✅ | Chronos Grad |

### 3.16 Cohere 系列（13个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **command-r-plus** | 128K | ✅ | Command R+ 最强版 |
| **command-r-plus-08-2024** | 128K | ✅ | Command R+ 08-2024 |
| **command-r7b-12-2024** | 128K | ✅ | Command R 7B |
| **command-r** | 128K | ✅ | Command R 基础版 |
| **command** | 4K | ✅ | Command 经典版 |
| **command-light** | 4K | ✅ | Command Light |
| **c4ai-command-r-plus** | 128K | ✅ | C4AI Command R+ |
| **c4ai-command-r-plus-08-2024** | 128K | ✅ | C4AI Command R+ 08-2024 |
| **c4ai-command-r-01-2025** | 128K | ✅ | C4AI Command R 01-2025 |
| **embed-english-v3.0** | - | ❌ | Cohere 英文嵌入 |
| **embed-english-light-v3.0** | - | ❌ | Cohere 英文轻量嵌入 |
| **embed-multilingual-v3.0** | - | ❌ | Cohere 多语言嵌入 |
| **embed-multilingual-light-v3.0** | - | ❌ | Cohere 多语言轻量嵌入 |

### 3.17 HuggingFace 系列（12个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **meta-llama/Meta-Llama-3.1-405B-Instruct** | 128K | ✅ | LLaMA 3.1 405B |
| **meta-llama/Meta-Llama-3.1-70B-Instruct** | 128K | ✅ | LLaMA 3.1 70B |
| **meta-llama/Meta-Llama-3.1-8B-Instruct** | 128K | ✅ | LLaMA 3.1 8B |
| **meta-llama/Meta-Llama-3-70B-Instruct** | 8K | ✅ | LLaMA 3 70B |
| **meta-llama/Meta-Llama-3-8B-Instruct** | 8K | ✅ | LLaMA 3 8B |
| **mistralai/Mistral-7B-Instruct-v0.3** | 32K | ✅ | Mistral 7B v0.3 |
| **mistralai/Mixtral-8x22B-Instruct-v0.1** | 64K | ✅ | Mixtral 8x22B |
| **Qwen/Qwen2-72B-Instruct** | 128K | ✅ | Qwen2 72B |
| **Qwen/Qwen2-57B-A14B-Instruct** | 128K | ✅ | Qwen2 57B A14B |
| **Qwen/Qwen2-7B-Instruct** | 128K | ✅ | Qwen2 7B |
| **Qwen/Qwen2.5-72B-Instruct** | 32K | ✅ | Qwen2.5 72B |
| **Qwen/Qwen2.5-7B-Instruct** | 32K | ✅ | Qwen2.5 7B |

### 3.18 Voyage AI 嵌入系列（7个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **voyage-3** | - | ❌ | Voyage 3 最新版 |
| **voyage-3-lite** | - | ❌ | Voyage 3 Lite |
| **voyage-code-2** | - | ❌ | Voyage Code 2 |
| **voyage-lite-2** | - | ❌ | Voyage Lite 2 |
| **voyage-2** | - | ❌ | Voyage 2 |
| **voyage-multimodal-3** | - | ❌ | Voyage 多模态 3 |
| **voyage-finance-2** | - | ❌ | Voyage Finance 2 |

### 3.19 Cloudflare Workers AI（11个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **@cf/meta/llama-3.3-70b-instruct-fewshot** | 128K | ✅ | LLaMA 3.3 70B |
| **@cf/meta/llama-3.1-8b-instruct-fewshot** | 128K | ✅ | LLaMA 3.1 8B |
| **@cf/deepseek-ai/deepseek-v3-671b** | 128K | ✅ | DeepSeek V3 671B |
| **@cf/qwen/qwen2.5-72b-instruct** | 32K | ✅ | Qwen2.5 72B |
| **@cf/qwen/qwen2.5-32b-instruct** | 32K | ✅ | Qwen2.5 32B |
| **@cf/qwen/qwen2.5-7b-instruct** | 32K | ✅ | Qwen2.5 7B |
| **@cf/mistral/mistral-7b-instruct** | 32K | ✅ | Mistral 7B |
| **@cf/thebloke/mistral-7b-instruct-lora** | 8K | ✅ | Mistral 7B LoRA |
| **@cf/thebloke/openhermes-7b-v3** | 8K | ✅ | OpenHermes 7B |
| **@cf/google/gemma-2-7b-it** | 8K | ✅ | Gemma 2 7B |
| **@cf/meta-llama/Llama-3.2-11B-Vision** | 128K | ✅ | LLaMA 3.2 11B 视觉 |

### 3.20 本地部署 Ollama（23个模型）

| 模型名称 | 上下文 | 流式支持 | 说明 |
|----------|--------|----------|------|
| **llama3.3** | 128K | ✅ | LLaMA 3.3 最新版 |
| **llama3.2** | 128K | ✅ | LLaMA 3.2 |
| **llama3.2-vision** | 128K | ✅ | LLaMA 3.2 视觉版 |
| **llama3.1** | 128K | ✅ | LLaMA 3.1 |
| **llama3** | 8K | ✅ | LLaMA 3 |
| **llama2** | 4K | ✅ | LLaMA 2 经典版 |
| **llama2-uncensored** | 4K | ✅ | LLaMA 2 无审查版 |
| **codellama** | 16K | ✅ | Code LLaMA 代码 |
| **codellama:34b** | 16K | ✅ | Code LLaMA 34B |
| **mistral** | 8K | ✅ | Mistral 7B |
| **mixtral** | 32K | ✅ | Mixtral 8x7B |
| **phi4** | 128K | ✅ | Phi-4 最新版 |
| **phi3** | 128K | ✅ | Phi-3 |
| **qwen2.5** | 128K | ✅ | Qwen 2.5 |
| **qwen2.5-coder** | 128K | ✅ | Qwen 2.5 Coder |
| **qwen2.5-math** | 128K | ✅ | Qwen 2.5 Math |
| **nomic-embed-text** | - | ❌ | Nomic 嵌入模型 |
| **mxbai-embed-large** | - | ❌ | MXBai 嵌入大模型 |
| **snowflake-arctic-embed** | - | ❌ | Snowflake 北极嵌入 |
| **gemma2** | 8K | ✅ | Gemma 2 |
| **command-r** | 128K | ✅ | Command R |
| **command-r-plus** | 128K | ✅ | Command R+ |
| **deepseek-coder-v2** | 64K | ✅ | DeepSeek Coder V2 |

---

## 四、API配置方式

### 4.1 OpenAI 配置

```typescript
import { CloudBook } from '@cloud-book/core';

const cloudBook = new CloudBook({
  llmProviders: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      // 可选配置
      baseURL: 'https://api.openai.com/v1', // 默认值
      organization: 'org-xxx', // 组织ID（可选）
      defaultModel: 'gpt-4o',
      timeout: 60000,
      maxRetries: 3
    }
  }
});
```

### 4.2 Anthropic Claude 配置

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      // 可选配置
      baseURL: 'https://api.anthropic.com', // 默认值
      defaultModel: 'claude-sonnet-4',
      timeout: 60000,
      maxRetries: 3
    }
  }
});
```

### 4.3 国内模型配置

#### 百度文心一言

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    baidu: {
      apiKey: process.env.BAIDU_API_KEY,
      secretKey: process.env.BAIDU_SECRET_KEY,
      defaultModel: 'ernie-4.0-8k-latest'
    }
  }
});
```

#### 阿里通义千问

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    alibaba: {
      apiKey: process.env.ALI_API_KEY, // DashScope API Key
      defaultModel: 'qwen-max',
      // 可选配置
      baseURL: 'https://dashscope.aliyuncs.com/api/v1'
    }
  }
});
```

#### 腾讯混元

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    tencent: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
      defaultModel: 'hunyuan'
    }
  }
});
```

#### 字节豆包

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    bytedance: {
      apiKey: process.env.BYTEDANCE_API_KEY,
      defaultModel: 'doubao-pro-32k'
    }
  }
});
```

#### 华为云盘古

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    huawei: {
      apiKey: process.env.HUAWEI_API_KEY,
      defaultModel: 'pangu-4'
    }
  }
});
```

#### 智谱GLM

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY,
      defaultModel: 'glm-4'
    }
  }
});
```

#### MiniMax

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY,
      groupId: process.env.MINIMAX_GROUP_ID,
      defaultModel: 'abab6-chat'
    }
  }
});
```

#### Moonshot Kimi

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    moonshot: {
      apiKey: process.env.MOONSHOT_API_KEY,
      defaultModel: 'moonshot-v1-128k'
    }
  }
});
```

### 4.4 本地部署配置

#### Ollama 本地配置

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    ollama: {
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama 不需要真实API Key
      defaultModel: 'llama3.3',
      // 可选配置
      timeout: 120000 // 本地模型可能需要更长超时
    }
  }
});
```

#### KoboldCPP 本地配置

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    koboldcpp: {
      baseURL: 'http://localhost:5000/v1',
      apiKey: 'kobold', // KoboldCPP 不需要真实API Key
      defaultModel: 'local-model'
    }
  }
});
```

### 4.5 Azure OpenAI 配置

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    azure: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_KEY,
      apiVersion: '2024-02-01',
      deployment: 'gpt-4o', // 你的部署名称
      defaultModel: 'gpt-4o'
    }
  }
});
```

### 4.6 自定义 OpenAI 兼容接口

```typescript
const cloudBook = new CloudBook({
  llmProviders: {
    custom: {
      baseURL: 'https://your-custom-api.com/v1',
      apiKey: process.env.CUSTOM_API_KEY,
      defaultModel: 'your-model-name',
      // 支持任何兼容 OpenAI API 格式的服务
    }
  }
});
```

---

## 五、环境变量配置

推荐使用环境变量配置敏感信息：

```bash
# OpenAI
export OPENAI_API_KEY=sk-xxxx

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-xxxx

# 国内模型
export BAIDU_API_KEY=xxxx
export BAIDU_SECRET_KEY=xxxx
export ALI_API_KEY=sk-xxxx
export ZHIPU_API_KEY=xxxx
export MINIMAX_API_KEY=xxxx
export MOONSHOT_API_KEY=sk-xxxx
export TENCENT_SECRET_ID=xxxx
export TENCENT_SECRET_KEY=xxxx
export BYTEDANCE_API_KEY=xxxx
export HUAWEI_API_KEY=xxxx

# 本地部署
export OLLAMA_BASE_URL=http://localhost:11434/v1
export KOBOLDCPP_BASE_URL=http://localhost:5000/v1

# Azure
export AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com
export AZURE_OPENAI_KEY=xxxx
```

---

## 六、模型选择建议

### 6.1 按用途选择

| 用途 | 推荐模型 | 理由 |
|------|----------|------|
| 通用写作 | GPT-4o、Claude 3.5 Sonnet、Qwen Max | 平衡性能和成本 |
| 长篇小说 | Kimi 128K、GLM-4、MiniMax | 超长上下文支持 |
| 快速草稿 | GPT-4o-mini、Qwen Turbo | 速度快、成本低 |
| 中文创作 | 通义千问、文心一言、智谱GLM | 中文优化 |
| 代码相关 | DeepSeek Coder、CodeLLaMA | 代码能力最强 |
| 本地部署 | Ollama LLaMA/Mistral | 隐私保护、离线可用 |
| 嵌入向量化 | Voyage-3、Nomic、OpenAI Embed | 专业嵌入模型 |

### 6.2 按成本选择

| 预算 | 推荐方案 |
|------|----------|
| 免费/低成本 | Ollama 本地部署 + Nomic 嵌入 |
| 低预算 | GPT-4o-mini、Groq LLaMA |
| 中等预算 | GPT-4o、Claude 3.5 Sonnet |
| 高端需求 | GPT-4.1、Claude 3 Opus、Qwen Max |

---

## 七、高级功能

### 7.1 模型路由

Cloud Book 支持根据任务类型自动选择最佳模型：

```typescript
const cloudBook = new CloudBook({
  modelRoutes: {
    planning: { provider: 'openai', model: 'gpt-4o' },
    writing: { provider: 'anthropic', model: 'claude-3-5-sonnet-latest' },
    audit: { provider: 'openai', model: 'gpt-4o' },
    style: { provider: 'alibaba', model: 'qwen-max' }
  }
});
```

### 7.2 模型自动降级

当首选模型不可用时，自动切换到备用模型：

```typescript
const cloudBook = new CloudBook({
  modelFallbacks: {
    'gpt-4o': ['claude-3-5-sonnet-latest', 'gemini-1.5-pro'],
    'claude-3-5-sonnet-latest': ['gpt-4o', 'gemini-1.5-pro']
  }
});
```

### 7.3 成本追踪

Cloud Book 内置成本追踪功能：

```typescript
const costTracker = cloudBook.getCostTracker();
console.log(costTracker.getTotalCost());
console.log(costTracker.getCostByProvider());
console.log(costTracker.getCostByModel());
```

---

## 八、故障排除

### 8.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| API Key 无效 | 环境变量未设置 | 检查并设置正确的 API Key |
| 请求超时 | 网络问题或模型繁忙 | 增加 timeout 或重试 |
| 配额超限 | API 配额用尽 | 升级计划或等待配额重置 |
| 本地模型连接失败 | Ollama 未启动 | 运行 `ollama serve` 启动服务 |
| 模型不支持流式 | 该模型不支持流式输出 | 使用非流式模式 |

### 8.2 调试模式

```typescript
const cloudBook = new CloudBook({
  llmProviders: { /* ... */ },
  debug: true, // 启用调试模式
  logLevel: 'verbose'
});
```

---

## 九、总结

Cloud Book 提供业界最全面的 AI 大模型支持：

- **26+  国际国内模型提供商**
- **280+  预配置模型**
- **2  本地部署方案**（Ollama、KoboldCPP）
- **无限  自定义 OpenAI 兼容接口**
- **1  企业级 Azure 部署方案**

无论您是个人创作者还是企业团队，Cloud Book 都能提供最适合您需求的 AI 写作解决方案。

---

*文档版本：1.0.0*
*最后更新：2026-05-14*
