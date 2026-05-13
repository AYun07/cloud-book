# ☁️ Cloud Book

> AI驱动的下一代小说创作平台 - 面向全球的多语言智能写作系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ⚠️ 重要说明

本项目目前处于开发阶段，不建议直接用于生产环境。

## ✨ 核心特性

### 🎯 创作模式
- **原创写作**: 从零开始创作独特的小说作品
- **智能仿写**: 模仿特定作品的风格进行创作（开发中）
- **二次创作**: 基于原作进行续写、前传、外传等（开发中）

### 🌍 多语言支持
- **多语言检测**: 基于Unicode范围检测中、英、日、韩、泰、越、阿拉伯、希伯来、印地、俄、希腊等语言
- **语法检查**: 基于规则的正则表达式检测（重复词、冗余表达、常见错用词汇）
- **拼写检查**: 常见英文拼写错误检测
- **本地化界面**: 基础国际化支持

### 🤖 AI 功能
- **多模型支持**: 支持OpenAI、Claude、DeepSeek、Gemini等API（需要配置API密钥）
- **智能体系统**: 6大AI智能体架构（架构师、写作者、审计员、修订师、风格工程师、雷达）
- **七步创作法**: Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
- **33维度质量审计**: 基于规则的内容质量检测（语法、拼写、冗余、节奏、展示-讲述等）

### 🛡️ 隐私安全
- **本地存储**: 所有数据保存在本地
- **API密钥本地**: 使用您自己的API密钥，不会发送到非您配置的服务器
- **离线模式**: 支持本地API调用

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/AYun07/cloud-book.git
cd cloud-book

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

## 🚀 快速开始

### 1. 配置环境变量

```bash
export LLM_API_KEY="your-api-key"
export LLM_API_BASE_URL="https://your-api-endpoint.com/v1"
```

### 2. 创建项目

```typescript
import { CloudBook } from '@cloud-book/core';

const cloudBook = new CloudBook({
  llmConfigs: [{
    name: 'deepseek',
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_API_BASE_URL
  }],
  storagePath: './projects'
});

const project = await cloudBook.createProject(
  '我的修仙小说',
  'xianxia',
  'original'
);
```

### 3. 生成章节

```typescript
const chapter = await cloudBook.generateChapter(
  project.id,
  1,
  {
    targetWordCount: 2500,
    autoAudit: true
  }
);

console.log(`生成完成！字数: ${chapter.wordCount}`);
```

### 4. 审计质量

```typescript
const auditResult = await cloudBook.auditChapter(project.id, chapter.id);

if (!auditResult.passed) {
  console.log('发现问题:', auditResult.issues);
}
```

## 📁 项目结构

```
cloud-book/
├── packages/
│   ├── core/              # 核心引擎
│   │   └── src/
│   │       ├── modules/   # 功能模块
│   │       ├── CloudBook.ts           # 主入口
│   │       ├── CloudBookCore.ts       # 核心实现
│   │       └── types.ts               # 类型定义
│   │
│   ├── cli/               # 命令行工具（开发中）
│   │
│   └── web/              # 网页界面（开发中）
│
├── examples/              # 使用示例
└── README.md
```

## 🛠️ 命令行工具

```bash
# 初始化项目
pnpm run dev

# 运行测试
pnpm test
```

## 🌍 支持的模型

| 提供商 | 模型 | 状态 |
|--------|------|------|
| DeepSeek | DeepSeek V4 | ✅ 已配置 |
| Gemini | Gemini 2.5/3.0 | ✅ 已配置 |
| OpenAI | GPT-4, GPT-3.5 | ⚙️ 待配置 |
| Anthropic | Claude 3 | ⚙️ 待配置 |

## 🎨 支持的题材

| 题材 | 说明 |
|------|------|
| xianxia | 仙侠修真 |
| fantasy | 玄幻奇幻 |
| urban | 都市异能 |
| scifi | 科幻未来 |
| romance | 浪漫言情 |
| mystery | 悬疑推理 |
| horror | 恐怖惊悚 |
| historical | 历史穿越 |
| game | 游戏电竞 |
| other | 其他 |

## 📊 33维度质量审计

审计引擎对内容进行多维度质量检测：

1. **基础检测**: 语法、拼写、标点、句子结构、段落结构
2. **一致性**: 连贯性、设定一致性、角色声音、对话、时间线
3. **质量**: 节奏、描写、情感冲击、冲突、张力
4. **技巧**: 展示-讲述、主题深度、象征意义、修辞

## 🔧 配置选项

```typescript
interface CloudBookConfig {
  llmConfigs: LLMConfig[];           // 模型配置
  modelRoutes: ModelRoute[];          // 任务路由
  auditConfig: AuditConfig;           // 审计配置
  antiDetectionConfig: AntiDetectionConfig;  // 去AI味配置
  storagePath?: string;              // 存储路径
  i18nConfig?: I18nConfig;           // 国际化配置
}
```

## 🔒 隐私与安全

- **本地处理**: 所有数据保存在本地
- **API密钥安全**: 使用环境变量配置，不会硬编码
- **路径安全**: 文件存储有路径遍历防护

## 📚 文档

- 示例代码: [examples/](file:///workspace/cloud-book/examples/)
- API类型定义: [packages/core/src/types.ts](file:///workspace/cloud-book/packages/core/src/types.ts)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  <strong>☁️ Cloud Book - 让创作更简单</strong>
</p>
