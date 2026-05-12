/**
 * Cloud Book - 功能LLM需求分析
 * 2026年5月12日 21:00
 * 明确哪些功能需要大模型，哪些不需要
 */

export interface FeatureAnalysis {
  name: string;
  requiresLLM: boolean;
  llmTask?: string;
  recommendedModel?: string;
  reason: string;
  fallbackMode?: string;
}

export const FEATURE_LLM_REQUIREMENTS: FeatureAnalysis[] = [
  // ==================== 核心写作功能 ====================
  {
    name: '章节生成',
    requiresLLM: true,
    llmTask: 'writing',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要生成大量文本，需要中文理解和创意能力'
  },
  {
    name: '章节续写',
    requiresLLM: true,
    llmTask: 'writing',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要理解上下文并生成连贯内容'
  },
  {
    name: '批量生成章节',
    requiresLLM: true,
    llmTask: 'writing',
    recommendedModel: 'deepseek-v4-flash',
    reason: '并行生成多章节，需要稳定输出'
  },
  {
    name: '情节构思',
    requiresLLM: true,
    llmTask: 'planning',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要创意和逻辑推理能力'
  },

  // ==================== 审计功能 ====================
  {
    name: '内容质量审计',
    requiresLLM: true,
    llmTask: 'audit',
    recommendedModel: 'gemini-3-flash-preview[假流]',
    reason: '需要精确分析和评分，假流更稳定'
  },
  {
    name: 'AI检测',
    requiresLLM: true,
    llmTask: 'audit',
    recommendedModel: 'gemini-3-flash-preview[假流]',
    reason: '需要深度分析文本特征'
  },
  {
    name: '实时审计反馈',
    requiresLLM: true,
    llmTask: 'audit',
    recommendedModel: 'gemini-2.5-flash[真流]',
    reason: '需要实时流式反馈用户体验更好'
  },
  {
    name: '一致性检查',
    requiresLLM: true,
    llmTask: 'audit',
    recommendedModel: 'gemini-3-flash-preview[假流]',
    reason: '需要比对角色/世界观设定'
  },

  // ==================== 润色优化 ====================
  {
    name: '去AI味处理',
    requiresLLM: true,
    llmTask: 'revision',
    recommendedModel: 'gemini-3-flash-preview[真流]',
    reason: '需要创意性改写，流式输出便于预览'
  },
  {
    name: '文笔润色',
    requiresLLM: true,
    llmTask: 'revision',
    recommendedModel: 'gemini-3-flash-preview[真流]',
    reason: '需要逐步优化，流式展示效果'
  },
  {
    name: '风格调整',
    requiresLLM: true,
    llmTask: 'style',
    recommendedModel: 'gemini-2.5-flash[真流]',
    reason: '需要实时反馈调整'
  },

  // ==================== 分析功能 ====================
  {
    name: '小说解析',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要提取角色/情节/世界观'
  },
  {
    name: '趋势分析',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要分析市场数据'
  },
  {
    name: '竞争对手分析',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要深度推理分析'
  },

  // ==================== 不需要LLM的功能 ====================
  {
    name: '项目管理',
    requiresLLM: false,
    reason: '纯数据CRUD操作',
    fallbackMode: '本地存储'
  },
  {
    name: '章节排序',
    requiresLLM: false,
    reason: '纯数据操作',
    fallbackMode: '本地存储'
  },
  {
    name: '角色管理',
    requiresLLM: false,
    reason: '数据管理功能，可配合LLM但非必需',
    fallbackMode: '本地存储'
  },
  {
    name: '世界设定管理',
    requiresLLM: false,
    reason: '数据管理功能，可配合LLM但非必需',
    fallbackMode: '本地存储'
  },
  {
    name: '大纲管理',
    requiresLLM: false,
    reason: '数据管理功能，可配合LLM但非必需',
    fallbackMode: '本地存储'
  },
  {
    name: '导出功能',
    requiresLLM: false,
    reason: '纯格式转换，无AI需求',
    fallbackMode: '纯函数'
  },
  {
    name: '导入功能',
    requiresLLM: false,
    reason: '纯解析功能，无AI需求',
    fallbackMode: '纯函数'
  },
  {
    name: '版本历史',
    requiresLLM: false,
    reason: '纯数据管理功能',
    fallbackMode: 'Git式存储'
  },
  {
    name: '缓存管理',
    requiresLLM: false,
    reason: '纯性能优化功能',
    fallbackMode: '内存/磁盘'
  },
  {
    name: '写作目标追踪',
    requiresLLM: false,
    reason: '纯数据统计功能',
    fallbackMode: '本地存储'
  },
  {
    name: '成本追踪',
    requiresLLM: false,
    reason: '纯记录统计功能',
    fallbackMode: '本地存储'
  },
  {
    name: '多语言支持',
    requiresLLM: false,
    reason: '纯翻译资源文件',
    fallbackMode: 'i18n资源'
  },
  {
    name: '快捷键管理',
    requiresLLM: false,
    reason: '纯UI交互功能',
    fallbackMode: '本地配置'
  },
  {
    name: '网络状态管理',
    requiresLLM: false,
    reason: '纯系统检测功能',
    fallbackMode: '系统API'
  },
  {
    name: '插件系统',
    requiresLLM: false,
    reason: '扩展机制框架，插件可选择是否用LLM',
    fallbackMode: '纯框架'
  },
  {
    name: '网页爬取',
    requiresLLM: false,
    reason: '纯HTTP请求和HTML解析',
    fallbackMode: 'cheerio/puppeteer'
  },
  {
    name: '封面生成',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要AI图像生成能力，当前用文本描述替代'
  },
  {
    name: '思维导图生成',
    requiresLLM: false,
    reason: '纯数据可视化转换',
    fallbackMode: 'D3.js'
  },
  {
    name: '雪花创作法',
    requiresLLM: false,
    reason: '方法论框架，引导用户输入',
    fallbackMode: '交互式表单'
  },
  {
    name: '七步创作法',
    requiresLLM: false,
    reason: '方法论框架，引导用户输入',
    fallbackMode: '交互式表单'
  },
  {
    name: '守护服务',
    requiresLLM: false,
    reason: '定时任务调度功能',
    fallbackMode: '定时器'
  },
  {
    name: 'Agent系统',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: 'Agent需要LLM驱动'
  },
  {
    name: '上下文管理',
    requiresLLM: false,
    reason: '纯数据处理和语法解析',
    fallbackMode: 'DSL解析器'
  },
  {
    name: '知识图谱',
    requiresLLM: false,
    reason: '图数据结构，LLM仅用于提取关系',
    fallbackMode: '图数据库'
  },
  {
    name: 'RAG检索',
    requiresLLM: true,
    llmTask: 'analysis',
    recommendedModel: 'deepseek-v4-flash',
    reason: '需要embedding和相似度计算'
  },
  {
    name: '本地API服务',
    requiresLLM: false,
    reason: 'API网关功能',
    fallbackMode: 'Express/Fastify'
  }
];

export function getLLMRequiredFeatures(): FeatureAnalysis[] {
  return FEATURE_LLM_REQUIREMENTS.filter(f => f.requiresLLM);
}

export function getNonLLMFeatures(): FeatureAnalysis[] {
  return FEATURE_LLM_REQUIREMENTS.filter(f => !f.requiresLLM);
}

export function getFeaturesByTask(task: string): FeatureAnalysis[] {
  return FEATURE_LLM_REQUIREMENTS.filter(f => f.llmTask === task);
}

export const LLM_USAGE_SUMMARY = {
  totalFeatures: FEATURE_LLM_REQUIREMENTS.length,
  llmRequired: FEATURE_LLM_REQUIREMENTS.filter(f => f.requiresLLM).length,
  nonLLM: FEATURE_LLM_REQUIREMENTS.filter(f => !f.requiresLLM).length,
  llmPercentage: Math.round(
    (FEATURE_LLM_REQUIREMENTS.filter(f => f.requiresLLM).length / FEATURE_LLM_REQUIREMENTS.length) * 100
  )
};
