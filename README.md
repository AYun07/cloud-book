# ☁️ Cloud Book

> **AI驱动的下一代小说创作平台**
> 
> 整合20个优秀开源项目优势的终极创作工具，支持百万字级小说解析、仿写、二创、同人，以及全平台覆盖。

## 🎯 项目定位

Cloud Book 是一款**完全去中心化**的 AI 小说创作平台：

- 🔒 **数据私有化**：所有数据存储在用户本地，平台零存储
- 💰 **成本用户承担**：用户自行配置 API，本地模型零成本
- 🌐 **全平台覆盖**：Web + 桌面 + CLI + 移动端 + IDE 插件
- 🤖 **全模型支持**：OpenAI + Claude + DeepSeek + 本地 Ollama

## ✨ 核心功能

### 📖 小说解析与拆解
- 支持导入 **百万字级** 原著小说
- 智能拆解：角色提取、世界观分析、风格指纹提取
- 一键分析：写作模式、叙事特征、情感曲线

### ✍️ 创作模式
| 模式 | 说明 |
|------|------|
| **原创** | 从零开始创作 |
| **仿写** | 基于原作风格，创作同级别作品 |
| **二创** | 续写、前传、外传、平行世界 |
| **同人** | 保留角色，改变设定 |

### 🔍 质量保证
- **33维度审计**：角色一致性、世界观一致性、时间线逻辑等
- **伏笔追踪**：自动管理伏笔设置与回收
- **资源追踪**：物品、能力、关系全程记录

### 🛡️ 反 AI 检测
- AI 痕迹检测：词汇、句式、结构多维度分析
- 去 AI 味处理：词汇替换、句式变化、口语化
- 风格迁移：自然人类化输出

### 🤖 多模型支持

#### 远程 API
| 厂商 | 支持模型 |
|------|----------|
| OpenAI | GPT-4o, GPT-4 Turbo, GPT-3.5 |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus |
| DeepSeek | DeepSeek V3, DeepSeek Coder |
| Google | Gemini 1.5 Pro, Gemini 2.0 |
| 阿里 | 通义千问, Qwen-Max |
| 月之暗面 | Kimi (Moonshot) |
| 自定义 | 任何 OpenAI 兼容接口 |

#### 本地模型
| 框架 | 支持模型 |
|------|----------|
| Ollama | Llama-3, Mistral, Qwen, Phi |
| KoboldCPP | 所有小说微调模型 |
| LM Studio | 所有 GGUF 模型 |
| llama.cpp | 所有 GGUF 模型 |

### 🌐 全平台覆盖

```
┌─────────────────────────────────────────────────────┐
│                   Cloud Book                        │
├─────────────────────────────────────────────────────┤
│  🌐 Web 应用      │  React + Vite                  │
│  🖥️ 桌面端       │  Tauri 2.0 (Windows/Mac/Linux) │
│  💻 CLI 工具     │  Rust + Node.js                │
│  📱 移动端       │  React Native                   │
│  🔌 IDE 插件     │  VSCode / Cursor / Claude Code  │
└─────────────────────────────────────────────────────┘
```

## 📚 支持的文学类型

### 体裁
- ✅ **小说**：长篇/中篇/短篇
- ✅ **散文**：叙事/写景/议论
- ⚠️ **诗歌**：现代诗/古体诗
- ⚠️ **剧本**：话剧/影视剧本

### 题材
| 分类 | 具体题材 |
|------|----------|
| 奇幻 | 玄幻、仙侠、西幻、魔幻 |
| 科幻 | 硬科幻、赛博朋克、太空歌剧 |
| 悬疑 | 推理、侦探、惊悚 |
| 言情 | 现代、古代、百合、耽美 |
| 都市 | 职场、校园、种田、商战 |
| 历史 | 穿越、历史架空、民国 |
| 同人 | 影视/动漫/游戏同人 |

## ⚠️ 免责声明

```
Cloud Book 不存储、收集、传输用户的任何创作数据。
所有数据均存储在用户的本地设备或用户指定的云存储服务中。

Cloud Book 仅作为工具调用用户配置的第三方 API 服务。
所有 API 调用产生的费用由用户自行承担。

用户使用 Cloud Book 生成的所有内容，其著作权归用户所有。
Cloud Book 不对生成内容的真实性、准确性、合法性负责。
```

## 🏗️ 技术架构

```
cloud-book/
├── packages/
│   ├── core/              # 核心引擎
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── NovelParser/       # 小说解析
│   │       │   ├── ImitationEngine/    # 仿写引擎
│   │       │   ├── AIAudit/           # 审计引擎
│   │       │   ├── AntiDetection/     # 反检测
│   │       │   ├── WritingEngine/      # 写作管线
│   │       │   ├── ContextManager/    # 上下文管理
│   │       │   ├── TruthFiles/        # 真相文件
│   │       │   └── LLMProvider/       # 模型支持
│   │       └── CloudBook.ts           # 主入口
│   ├── web/               # Web 应用
│   ├── desktop/           # 桌面应用
│   ├── cli/               # CLI 工具
│   ├── mobile/            # 移动端
│   └── plugins/           # IDE 插件
└── docs/                  # 文档
```

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/cloud-book.git
cd cloud-book

# 安装依赖
pnpm install

# 构建核心包
cd packages/core
pnpm build
```

### 使用示例

```typescript
import { CloudBook } from '@cloud-book/core';

// 初始化
const cloudBook = new CloudBook({
  llmConfigs: [{
    provider: 'openai',
    name: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
  }],
  modelRoutes: [
    { task: 'writing', llmConfig: { name: 'gpt-4' } },
    { task: 'audit', llmConfig: { name: 'claude' } }
  ],
  auditConfig: {
    dimensions: [...],
    threshold: 0.7,
    autoFix: true
  },
  antiDetectionConfig: {
    enabled: true,
    intensity: 5
  }
});

// 导入小说
const parseResult = await cloudBook.importNovel('./path/to/novel.txt');

// 创建仿写项目
const project = await cloudBook.createImitationProject(
  parseResult,
  'imitation',
  70 // 70% 仿写程度
);

// 生成章节
const chapter = await cloudBook.generateChapter(project.id, 1, {
  targetWordCount: 2500,
  autoAudit: true,
  autoHumanize: true
});

// 检测 AI 痕迹
const detection = cloudBook.detectAI(chapter.content);
console.log(`AI 置信度: ${detection.confidence * 100}%`);

// 导出项目
await cloudBook.exportProject(project.id, 'md');
```

## 📋 功能清单

### P0 - 核心功能
- [x] 项目管理（创建/编辑/删除）
- [x] 章节写作（AI 续写/生成）
- [x] 大纲管理（章节结构规划）
- [x] 上下文注入（RAG 向量检索）
- [x] 角色管理（角色卡/关系图）
- [x] 多模型支持（OpenAI/Claude/DeepSeek）
- [x] 质量审计（角色一致性/伏笔追踪）
- [x] 版本管理（保存/回滚）

### P1 - 重要功能
- [x] CLI 工具（命令行支持）
- [x] 多级审计（33 维度检查）
- [x] 自动修订（审计不通过自动修复）
- [x] 写法引擎（风格分析/注入）
- [x] 百万字解析（小说拆解）
- [x] 仿写/二创/同人模式
- [x] 反 AI 检测与去 AI 味

### P2 - 增强功能
- [ ] 桌面端（Tauri）
- [ ] 移动端（React Native）
- [ ] IDE 插件（VSCode/Cursor）
- [ ] 知识图谱（Neo4j）
- [ ] 多人协作
- [ ] 社区功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Cloud Book** - 让 AI 成为你的创作伙伴，而不是主角。
