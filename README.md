# ☁️ Cloud Book

> AI驱动的下一代小说创作平台 - 面向全球的多语言智能写作系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ 核心特性

### 🎯 创作模式
- **原创写作**: 从零开始创作独特的小说作品
- **智能仿写**: 模仿特定作品的风格进行创作
- **二次创作**: 基于原作进行续写、前传、外传等
- **同人创作**: 保留原作角色，创作新故事

### 🌍 全球支持
- **40+ 语言支持**: 中文、英语、日语、韩语、西班牙语、法语、德语等
- **语法检查**: 实时语法纠错
- **拼写检查**: 支持多语言拼写检查
- **本地化界面**: 多语言用户界面

### 🤖 AI 智能
- **多模型支持**: OpenAI GPT-4、Claude 3、DeepSeek、本地 Ollama
- **6大AI智能体**: 架构师、写作者、审计员、修订师、风格工程师、雷达
- **七步创作法**: Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
- **33维度质量审计**: 全面检测内容质量

### 🛡️ 隐私安全
- **零数据存储**: Cloud Book 不保存任何数据
- **离线运行**: 支持完全离线使用
- **本地API调用**: 使用您自己的 API Key
- **隐私优先**: 所有数据仅保存在本地

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm install cloud-book

# 或使用 npm
npm install cloud-book

# 或使用 yarn
yarn add cloud-book
```

## 🚀 快速开始

### 1. 创建项目

```typescript
import { CloudBook, Genre } from 'cloud-book';

const cloudBook = new CloudBook({
  llmConfigs: [{
    name: 'openai-gpt4',
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  }],
  modelRoutes: [],
  auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
  antiDetectionConfig: { enabled: true, intensity: 5 },
  storagePath: './projects'
});

const project = await cloudBook.createProject(
  '我的修仙小说',
  'xianxia',
  'original'
);
```

### 2. 生成章节

```typescript
const chapter = await cloudBook.generateChapter(
  project.id,
  1,
  {
    targetWordCount: 2500,
    autoAudit: true,
    autoHumanize: true,
    chapterGuidance: '主角正在山谷中发现神秘古洞'
  }
);

console.log(`生成完成！字数: ${chapter.wordCount}`);
```

### 3. 审计质量

```typescript
const auditResult = await cloudBook.auditChapter(project.id, chapter.id);

if (!auditResult.passed) {
  console.log('发现问题:', auditResult.issues);
}
```

### 4. 去AI味处理

```typescript
const humanizedText = await cloudBook.humanize(aiGeneratedText);
```

## 📁 项目结构

```
cloud-book/
├── packages/
│   ├── core/              # 核心引擎
│   │   └── src/
│   │       ├── modules/   # 功能模块
│   │       │   ├── AIAudit/           # AI审计引擎
│   │       │   ├── AntiDetection/     # 反AI检测
│   │       │   ├── AgentSystem/        # 智能体系统
│   │       │   ├── AutoDirector/       # 自动策划
│   │       │   ├── CacheManager/       # 缓存管理
│   │       │   ├── Card/               # 卡片管理
│   │       │   ├── ContextManager/     # 上下文管理
│   │       │   ├── CoverGenerator/     # 封面生成
│   │       │   ├── CreativeHub/        # 创意中心
│   │       │   ├── DaemonService/      # 守护服务
│   │       │   ├── GenreConfig/        # 题材配置
│   │       │   ├── GlobalLiterary/     # 全球文学
│   │       │   ├── I18n/              # 国际化
│   │       │   ├── ImitationEngine/    # 仿写引擎
│   │       │   ├── KnowledgeGraph/      # 知识图谱
│   │       │   ├── LLMProvider/        # 大模型支持
│   │       │   ├── LocalAPI/           # 离线API
│   │       │   ├── Memory/             # 记忆管理
│   │       │   ├── MindMapGenerator/   # 思维导图
│   │       │   ├── NetworkManager/     # 网络管理
│   │       │   ├── NovelParser/        # 小说解析
│   │       │   ├── PluginSystem/       # 插件系统
│   │       │   ├── SevenStepMethodology/  # 七步法
│   │       │   ├── TrendAnalyzer/      # 趋势分析
│   │       │   ├── TruthFiles/         # 真相文件
│   │       │   ├── VersionHistory/     # 版本历史
│   │       │   ├── WorldInfo/         # 世界信息
│   │       │   └── WritingEngine/      # 写作引擎
│   │       ├── CloudBook.ts           # 主入口
│   │       └── types.ts               # 类型定义
│   │
│   ├── cli/               # 命令行工具
│   │   └── src/
│   │       └── index.ts
│   │
│   └── web/              # 网页界面
│       └── src/
│           ├── components/
│           └── pages/
│
├── examples/              # 使用示例
└── README.md
```

## 🛠️ 命令行工具

```bash
# 初始化项目
cloud-book init

# 生成章节
cloud-book write 1 --project <id>

# 导入小说分析
cloud-book import novel.txt

# 审计章节
cloud-book audit chapter.txt

# 去AI味处理
cloud-book humanize chapter.txt

# 添加模型
cloud-book model add
```

## 🌍 支持的模型

| 提供商 | 模型 | 类型 |
|--------|------|------|
| OpenAI | GPT-4, GPT-3.5 | 云端 |
| Anthropic | Claude 3 | 云端 |
| DeepSeek | DeepSeek Chat | 云端 |
| Ollama | Llama2, Mistral | 本地 |
| KoboldCPP | Various | 本地 |
| LM Studio | Various | 本地 |

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

## 🔧 配置选项

```typescript
interface CloudBookConfig {
  llmConfigs: LLMConfig[];           // 模型配置
  modelRoutes: ModelRoute[];          // 任务路由
  auditConfig: AuditConfig;           // 审计配置
  antiDetectionConfig: AntiDetectionConfig;  // 去AI味配置
  storagePath?: string;              // 存储路径
  i18nConfig?: I18nConfig;           // 国际化配置
  connectionMode?: 'online' | 'offline' | 'hybrid';  // 连接模式
  localAPIConfig?: LocalAPIConfig;    // 离线API配置
}
```

## 📊 33维度质量审计

1. **一致性检查**
   - 角色一致性
   - 世界观一致性
   - 时间线一致性
   - 能力体系一致性

2. **逻辑检查**
   - 情节逻辑
   - 因果关系
   - 伏笔回收

3. **质量检查**
   - 叙事节奏
   - 情感弧线
   - 资源追踪
   - AI痕迹检测
   - 重复性检查

## 🔒 隐私与安全

- **零数据存储**: Cloud Book 服务器不存储任何用户数据
- **本地处理**: 所有计算在本地完成
- **API Key 安全**: 使用您自己的 API Key，不会泄露
- **离线支持**: 完全离线可用

## 📚 文档

- [完整文档](./docs/)
- [API 参考](./docs/api.md)
- [示例代码](./examples/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  <strong>☁️ Cloud Book - 让创作更简单</strong>
</p>
