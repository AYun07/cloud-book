# Cloud Book 文档

欢迎使用 Cloud Book - AI 驱动的下一代小说创作平台。

## 快速开始

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 使用 CLI

```bash
# 初始化新项目
node packages/cli/index.js init

# 生成章节
node packages/cli/index.js write <chapter>

# 审计章节
node packages/cli/index.js audit <file>

# 去 AI 味处理
node packages/cli/index.js humanize <file>
```

### 使用 Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 目录结构

```
cloud-book/
├── packages/
│   ├── core/          # 核心引擎
│   ├── web/           # Web 前端 (React)
│   ├── cli/           # 命令行工具
│   └── mobile/        # 移动应用 (React Native)
├── chat-logs/         # 聊天记录
├── docs/              # 文档 (本目录)
├── docker/            # Docker 配置
└── docker-compose.yml # Docker Compose 配置
```

## 核心模块

- [写作引擎](./writing-engine.md) - 小说创作核心引擎
- [AI 审计](./ai-audit.md) - 内容质量审计
- [去 AI 味](./anti-detection.md) - AI 痕迹优化
- [知识图谱](./knowledge-graph.md) - 角色关系管理
- [导入导出](./import-export.md) - 多种格式支持
- [多语言](./i18n.md) - 国际化支持

## 技术栈

- **后端/核心**: Node.js + TypeScript
- **Web 前端**: React 18 + TypeScript + Ant Design
- **移动应用**: React Native
- **LLM 集成**: OpenAI, Anthropic, DeepSeek, Ollama 等
- **部署**: Docker + Docker Compose

## 许可证

MIT License
