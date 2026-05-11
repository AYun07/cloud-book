# Cloud Book - AI小说创作平台

> 整合20个顶级开源小说创作项目所有优势功能的全能AI写作引擎

[English](./README_EN.md) | 简体中文

## 核心特性

### 🤖 全模型支持
- **OpenAI 系列**: GPT-4, GPT-3.5-turbo, 及兼容API的所有模型
- **Claude 系列**: Claude 3 Opus, Sonnet, Haiku
- **DeepSeek 系列**: DeepSeek Chat, DeepSeek Coder
- **本地部署**: Ollama, KoboldCPP, LM Studio
- **智能路由**: 根据任务类型自动选择最优模型

### 📖 20个项目完整功能整合

#### KoboldAI-Client 功能
- **World Info 管理**: 层级化的世界设定信息，支持条件逻辑
- **Memory 管理**: 记忆、作者笔记、系统提示分类管理
- **多模式写作**: novel/adventure/chatbot 三种模式

#### AI-Novel-Writing-Assistant 功能
- **Auto Director**: 自动分析市场趋势，生成故事方向和章节规划
- **Creative Hub**: RAG检索增强，支持多工具协作的创意中心
- **多模型路由**: 根据任务智能选择最合适的模型

#### NovelForge 功能
- **Card 系统**: Pydantic Schema验证的卡片管理
- **Knowledge Graph**: 角色、地点、物品、势力关系图谱
- **@DSL 上下文注入**: 灵活的上下文引用语法
- **Neo4j 集成**: 强大的图数据库支持

#### InkOS 功能
- **5类Agent系统**:
  - 架构师 (Architect): 世界观构建、角色设定
  - 写作者 (Writer): 具体章节写作生成
  - 审计员 (Auditor): 33维度质量检查
  - 修订师 (Reviser): 问题修复和质量优化
  - 风格工程师 (StyleEngineer): 文风把控和人机交互
  - 雷达 (Radar): 趋势分析和市场洞察
- **7真相文件**: 长篇一致性保障
- **守护进程**: 后台自动任务调度

#### novel-writer 功能
- **七步方法论**:
  1. Constitution - 宪章制定
  2. Specify - 规格说明
  3. Clarify - 细节澄清
  4. Plan - 规划制定
  5. Tasks - 任务分解
  6. Write - 写作执行
  7. Analyze - 分析复盘
- **插件系统**: 支持扩展命令和钩子
- **斜杠命令**: 快捷操作支持

#### NovelWriter 功能
- **8大类型配置**: 玄幻、修仙、武侠、科幻、言情、悬疑、都市、恐怖
- **派系系统**: 完整的势力关系管理
- **角色弧线**: 正向/负向/扁平/圆形 四种弧线
- **质量指标**: 连贯性、节奏感、角色发展等多维度评估

#### 其他整合功能
- **扫榜分析**: 市场趋势和竞品分析
- **思维导图**: 可视化项目结构
- **封面生成**: AI驱动的封面设计
- **目标追踪**: 写作进度管理

### ✨ 核心能力

#### 百万字小说处理
- **智能解析**: 自动拆解分析长篇原作
- **风格指纹**: 精准提取原文写作风格
- **分块处理**: 智能分章节处理大文本

#### 一键仿写/二创/同人
- **仿写模式**: 保持风格的高仿创作
- **二创模式**: 基于原作的创新改编
- **同人模式**: 保留角色设定的新故事

#### 反AI检测
- **33+维度检测**: 全面识别AI写作特征
- **人机交互**: 多策略去AI味处理
- **实时监控**: 写作过程中的AI指标监控

#### 33维度质量审计
- 角色一致性 | 世界观一致性 | 时间线一致性
- 情节逻辑 | 伏笔呼应 | 资源追踪
- 情感弧线 | 叙事节奏 | 对话质量
- 描写密度 | AI检测 | 重复性检查
- 语法错误 | 同义反复 | 逻辑漏洞
- 进度节奏 | 冲突升级 | 角色动机
- 悬念清晰度 | 感官细节 | 背景整合
- 视角一致 | 时态一致 | 节奏变化
- 展示vs讲述 | 潜台词 | 象征主义
- 主题连贯 | 读者参与 | 类型惯例
- 文化敏感 | 事实准确 | 力量一致

### 🛡️ 零存储架构
- **不存储任何数据**: 所有数据由用户自行管理
- **用户承担成本**: API费用由用户直接支付
- **隐私优先**: 不收集任何用户信息

## 技术架构

```
cloud-book/
├── packages/
│   ├── core/                    # 核心引擎
│   │   └── src/
│   │       ├── CloudBook.ts     # 主入口
│   │       ├── types.ts         # 类型定义
│   │       └── modules/
│   │           ├── AIAudit/          # 审计引擎
│   │           ├── AntiDetection/     # 反AI检测
│   │           ├── AutoDirector/      # 自动导演
│   │           ├── Card/              # 卡片管理
│   │           ├── ContextManager/     # 上下文管理
│   │           ├── CoverGenerator/     # 封面生成
│   │           ├── CreativeHub/       # 创意中心
│   │           ├── DaemonService/     # 守护进程
│   │           ├── GenreConfig/       # 类型配置
│   │           ├── ImitationEngine/   # 仿写引擎
│   │           ├── KnowledgeGraph/    # 知识图谱
│   │           ├── LLMProvider/        # LLM管理
│   │           ├── Memory/            # 记忆管理
│   │           ├── MindMapGenerator/  # 思维导图
│   │           ├── NovelParser/       # 小说解析
│   │           ├── PluginSystem/      # 插件系统
│   │           ├── SevenStepMethodology/  # 七步方法论
│   │           ├── TruthFiles/        # 真相文件
│   │           ├── TrendAnalyzer/     # 趋势分析
│   │           ├── WorldInfo/         # 世界信息
│   │           └── WritingEngine/     # 写作引擎
│   ├── web/                     # Web界面
│   ├── desktop/                 # 桌面应用
│   ├── cli/                     # 命令行工具
│   └── mobile/                  # 移动应用
└── docs/                       # 文档
```

## 快速开始

```typescript
import { CloudBook } from '@cloud-book/core';

const cloudBook = new CloudBook({
  llmConfigs: [
    {
      provider: 'openai',
      name: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4'
    },
    {
      provider: 'anthropic',
      name: 'claude-3',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229'
    }
  ],
  modelRoutes: [
    { task: 'planning', llmConfig: { name: 'claude-3' } },
    { task: 'writing', llmConfig: { name: 'gpt-4' } },
    { task: 'audit', llmConfig: { name: 'claude-3' } }
  ],
  auditConfig: {
    enabled: true,
    dimensions: ['characterConsistency', 'plotLogic', 'aiDetection']
  },
  antiDetectionConfig: {
    enabled: true,
    intensity: 0.7,
    replaceAIWords: true,
    varySentenceStructure: true
  }
});

// 创建项目
const project = await cloudBook.createProject('我的小说', 'fantasy');

// 生成章节
const chapter = await cloudBook.generateChapter(project.id, 1, {
  autoAudit: true,
  autoHumanize: true
});

// 批量生成
const chapters = await cloudBook.batchGenerateChapters(project.id, 2, 10, {
  parallelCount: 3,
  autoAudit: true
});
```

## 集成功能示例

### 使用 World Info 管理世界设定

```typescript
await cloudBook.addWorldInfo(project.id, {
  name: '元素魔法',
  keywords: ['魔法', '元素', '施法'],
  content: '本世界的魔法基于金木水火土五行元素...',
  depth: 1
});

const context = await cloudBook.buildWorldInfoContext(project.id, '主角使用魔法攻击');
```

### 使用 Agent 系统

```typescript
// 获取所有Agent
const agents = cloudBook.getAgents();

// 执行架构师任务
const worldBuilding = await cloudBook.executeArchitectTask(
  project,
  'world_building'
);

// 执行完整管线
const result = await cloudBook.executePipeline(project, chapterNumber);
```

### 使用七步方法论

```typescript
// 执行宪法步骤
await cloudBook.executeMethodologyStep(project.id, 'constitution', {
  genre: 'fantasy'
});

// 执行规格步骤
await cloudBook.executeMethodologyStep(project.id, 'specify', {
  title: '我的小说',
  genre: 'fantasy'
});

// 获取当前进度
const progress = cloudBook.getMethodologyProgress(project.id);
```

### 使用扫榜分析

```typescript
// 分析市场趋势
const trends = await cloudBook.analyzeMarketTrends('起点中文网', 'fantasy');

// 获取创作灵感
const inspirations = await cloudBook.generateInspiration('fantasy', 'plot');
```

## 安装

```bash
npm install @cloud-book/core
```

## 环境变量

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# DeepSeek
DEEPSEEK_API_KEY=sk-...

# 本地模型
OLLAMA_BASE_URL=http://localhost:11434
KOBOLDCPP_BASE_URL=http://localhost:5000
```

## 平台支持

- ✅ Web 应用
- ✅ 桌面应用 (Electron)
- ✅ 命令行工具
- ✅ 移动应用 (React Native)
- ✅ IDE 插件 (VSCode, JetBrains)

## 参与贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
