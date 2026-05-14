# Cloud Book 模型更新指南

## 概述

Cloud Book 支持 **250+ 大模型**，来自 **30+ 个提供商**。由于 AI 模型更新迭代很快，我们提供了多种方式来保持模型列表的最新状态。

## 更新方式

### 1. 自动更新 (推荐)

GitHub Actions 每周一凌晨 3:00 (UTC) 自动检查并更新模型列表：

```yaml
# .github/workflows/update-models.yml
schedule:
  - cron: '0 3 * * 1'  # 每周一凌晨 3:00 UTC
```

自动更新会：
- 检查所有提供商的最新模型
- 自动创建 Pull Request
- 更新 `config/models.json` 配置文件

### 2. 手动更新

运行模型更新脚本：

```bash
# 更新所有模型
node scripts/update-models.js

# 更新特定提供商
node scripts/update-models.js --provider=openai
node scripts/update-models.js --provider=alibaba

# 检查当前模型状态
node scripts/update-models.js --check
```

### 3. 本地开发更新

```bash
# 克隆仓库
git clone https://github.com/your-repo/cloud-book.git
cd cloud-book

# 安装依赖
npm install

# 更新模型
node scripts/update-models.js

# 提交更改
git add -A
git commit -m "chore: 更新 LLM 模型列表"
git push
```

## 支持的提供商

### 国外提供商

| 提供商 | 模型数量 | 主要模型 |
|--------|---------|---------|
| OpenAI | 25+ | GPT-4o, O1, DALL-E, Whisper |
| Anthropic | 10+ | Claude 4, Claude 3.5 |
| Google | 12+ | Gemini 2.5, Gemini 1.5 |
| Mistral | 15+ | Large, Small, Codestral |
| Groq | 14+ | Llama 3.3, Mixtral |
| Together AI | 18+ | Llama 3.1, DeepSeek |
| Perplexity | 6+ | Sonar, Sonar Reasoning |
| Cohere | 12+ | Command R+, Embed |
| AI21 | 6+ | Jamba, Jurassic-2 |
| Fireworks | 9+ | Llama 3, Mixtral |
| Cloudflare | 12+ | Llama, Mistral |
| Replicate | 6+ | Llama 3.1, Mixtral |
| Hugging Face | 12+ | Llama, Mistral, Qwen |
| Voyage | 7+ | Embedding 系列 |
| Nomic | 2+ | Embedding |

### 国内提供商

| 提供商 | 模型数量 | 主要模型 |
|--------|---------|---------|
| 百度文心 | 9+ | ERNIE 4.0, ERNIE 3.5 |
| 阿里通义 | 15+ | Qwen Max, Qwen 2.5 |
| 腾讯混元 | 7+ | Large, Standard, Vision |
| 字节豆包 | 8+ | Pro, Lite |
| 华为盘古 | 4+ | 自然语言, 多模态 |
| 智谱清言 | 14+ | GLM-4, GLM-Z1 |
| MiniMax | 7+ | ABAB 6.5 |
| Moonshot | 3+ | V1 8K/32K/128K |

### 本地部署

| 提供商 | 模型数量 | 主要模型 |
|--------|---------|---------|
| Ollama | 20+ | Llama 3.3, Qwen 2.5, Mistral |
| KoboldCPP | 1+ | 本地文本生成 |

## 模型配置

模型配置存储在 `config/models.json`：

```json
{
  "lastUpdate": "2026-05-14T00:00:00.000Z",
  "totalModels": 250,
  "totalProviders": 28,
  "version": "1.0.0",
  "updateFrequency": "weekly"
}
```

## 添加新提供商

1. 在 `scripts/update-models.js` 中添加提供商配置：

```javascript
const PROVIDER_API_DOCS = {
  new_provider: {
    name: 'New Provider',
    models: [
      { name: 'model-1', description: 'Model 1', maxTokens: 8192 },
      // ...
    ]
  }
};
```

2. 在 `LLMManager.ts` 中添加 API 调用方法

3. 运行更新脚本生成模型列表

## 最佳实践

1. **定期检查更新**：GitHub Actions 会自动运行，但你也可以手动触发
2. **测试新模型**：添加新模型后，测试其 API 调用是否正常
3. **关注官方公告**：各提供商会发布新模型公告
4. **版本控制**：所有模型更新都通过 Git 管理，便于追踪

## 故障排除

### 更新脚本失败

```bash
# 检查 Node.js 版本
node --version  # 需要 >= 18

# 重新安装依赖
npm install

# 手动运行
node scripts/update-models.js --check
```

### GitHub Actions 失败

- 检查 `GITHUB_TOKEN` 权限
- 确认仓库设置中允许创建 PR
- 查看 Actions 日志排查错误

## 贡献指南

欢迎提交新的模型支持！请确保：

1. 模型已在提供商官网公开可用
2. 添加了完整的模型配置
3. 测试了 API 调用
4. 更新了相关文档

## 联系方式

- GitHub Issues: https://github.com/your-repo/cloud-book/issues
- 邮箱: support@cloudbook.example.com
