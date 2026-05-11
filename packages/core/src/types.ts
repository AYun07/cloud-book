/**
 * Cloud Book - 核心类型定义
 */

// 文学作品体裁
export type LiteraryGenre = 
  | 'novel'      // 小说
  | 'prose'      // 散文
  | 'poetry'     // 诗歌
  | 'drama'      // 戏剧
  | 'screenplay' // 剧本
  | 'fairytale'  // 童话
  | 'fable'      // 寓言
  | 'biography'  // 传记
  | 'reportage'; // 报告文学

// 题材分类
export type Genre = 
  | 'fantasy'           // 玄幻
  | 'xianxia'          // 仙侠
  | 'wuxia'            // 武侠
  | 'western_fantasy'  // 西幻
  | 'scifi'            // 科幻
  | 'cyberpunk'        // 赛博朋克
  | 'mystery'          // 悬疑
  | 'detective'        // 侦探
  | 'romance'          // 言情
  | 'urban'            // 都市
  | 'historical'        // 历史
  | 'military'          // 军事
  | 'gaming'           // 游戏
  | 'light_novel'      // 轻小说
  | 'fanfiction'        // 同人
  | 'horror'           // 恐怖
  | 'thriller';         // 惊悚

// 创作模式
export type WritingMode = 
  | 'original'     // 原创
  | 'imitation'    // 仿写
  | 'derivative'   // 二创
  | 'fanfic';      // 同人

// 章节状态
export type ChapterStatus = 
  | 'outline'      // 大纲
  | 'drafting'    // 草稿
  | 'draft'        // 草稿完成
  | 'reviewing'    // 审核中
  | 'revising'     // 修订中
  | 'finalized'    // 定稿
  | 'published';   // 已发布

// 角色信息
export interface Character {
  id: string;
  name: string;
  aliases?: string[];           // 别名
  gender?: 'male' | 'female' | 'other';
  age?: string;
  appearance?: string;          // 外貌描述
  personality?: string;          // 性格
  background?: string;           // 背景故事
  goals?: string[];             // 目标
  abilities?: string[];          // 能力
  inventory?: Item[];           // 物品
  relationships?: Relationship[]; // 关系
  speakingStyle?: string;        // 说话风格
  psychologicalProfile?: string; // 心理画像
}

// 物品
export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  owner?: string;              // 持有者ID
}

// 关系
export interface Relationship {
  targetId: string;            // 目标角色ID
  type: string;                // 关系类型
  status: string;              // 关系状态
  description?: string;
}

// 世界设定
export interface WorldSetting {
  id: string;
  name: string;
  genre: Genre;
  powerSystem?: string;        // 力量体系
  locations?: Location[];       // 地点
  factions?: Faction[];         // 势力
  timeline?: TimelineEvent[];   // 时间线
  rules?: string[];            // 世界规则
  customSettings?: Record<string, any>; // 自定义设定
}

// 地点
export interface Location {
  id: string;
  name: string;
  description?: string;
  parentId?: string;           // 父级地点
  connections?: string[];       // 连接地点
}

// 势力
export interface Faction {
  id: string;
  name: string;
  type: string;                // 类型：门派/组织/家族等
  description?: string;
  members?: string[];           // 成员ID
}

// 时间线事件
export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  impact?: string;
}

// 章节
export interface Chapter {
  id: string;
  number: number;
  title: string;
  status: ChapterStatus;
  wordCount: number;
  outline?: string;             // 章节大纲
  content?: string;             // 正文内容
  summary?: string;             // 章节摘要
  characters?: string[];        // 参与角色ID
  location?: string;            // 场景地点
  timeline?: string;            // 时间点
  hooks?: Hook[];               // 伏笔
  emotionalArc?: string;        // 情感弧线
  qualityScore?: number;        // 质量评分
  auditResult?: AuditResult;   // 审计结果
  version?: number;              // 版本号
  createdAt?: Date;
  updatedAt?: Date;
}

// 伏笔
export interface Hook {
  id: string;
  description: string;
  setInChapter: number;        // 设置伏笔的章节
  payoffChapter?: number;        // 回收伏笔的章节
  status: 'pending' | 'foreshadowed' | 'paid_off' | 'expired';
  type: 'character' | 'plot' | 'world' | 'item';
}

// 审计结果
export interface AuditResult {
  passed: boolean;
  dimensions: AuditDimension[];
  issues: Issue[];
  score: number;
}

// 审计维度
export interface AuditDimension {
  name: string;
  score: number;
  passed: boolean;
  details?: string;
}

// 问题
export interface Issue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  location?: {
    chapterId: string;
    paragraphIndex?: number;
    characterId?: string;
  };
  suggestion?: string;
}

// 小说项目
export interface NovelProject {
  id: string;
  title: string;
  subtitle?: string;
  genre: Genre;
  literaryGenre: LiteraryGenre;
  writingMode: WritingMode;
  sourceNovel?: string;        // 原作ID（仿写/同人模式）
  
  // 核心设定
  corePremise?: string;         // 核心前提
  sellingPoints?: string[];      // 卖点
  targetAudience?: string;      // 目标读者
  
  // 结构
  volumeCount?: number;         // 卷数
  plannedChapters?: number;      // 计划章节数
  targetWordCount?: number;     // 目标字数
  
  // 内容
  worldSetting?: WorldSetting;
  characters?: Character[];
  chapters?: Chapter[];
  
  // 风格
  styleFingerprint?: StyleFingerprint;
  
  // 元数据
  status: 'planning' | 'writing' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// 风格指纹
export interface StyleFingerprint {
  sourceText?: string;          // 来源文本
  sentenceLengthDistribution: number[];  // 句长分布
  wordFrequency: Record<string, number>; // 词频
  punctuationPattern: string;   // 标点使用模式
  dialogueRatio: number;         // 对话比例
  descriptionDensity: number;   // 描写密度
  narrativeVoice: string;        // 叙事视角
  tense: 'past' | 'present';
  emotionalWords: string[];     // 情感词汇
  signaturePhrases: string[];    // 标志性短语
  tabooWords: string[];         // 禁忌词（避免过度使用）
}

// 写作任务
export interface WritingTask {
  id: string;
  novelId: string;
  type: 'outline' | 'chapter' | 'revision' | 'expansion';
  chapterId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

// LLM配置
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'custom';
  name: string;
  endpoint?: string;             // API地址
  apiKey?: string;               // API密钥
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// 模型路由规则
export interface ModelRoute {
  task: 'planning' | 'writing' | 'revision' | 'audit' | 'style' | 'analysis';
  llmConfig: LLMConfig;
}

// 真相文件（用于维持一致性）
export interface TruthFiles {
  currentState: WorldState;
  particleLedger: Resource[];
  pendingHooks: Hook[];
  chapterSummaries: ChapterSummary[];
  subplotBoard: Subplot[];
  emotionalArcs: EmotionalArc[];
  characterMatrix: CharacterInteraction[];
}

// 世界状态
export interface WorldState {
  protagonist: {
    id: string;
    name: string;
    location: string;
    status: string;
    level?: string;
  };
  knownFacts: string[];
  currentConflicts: string[];
  relationshipSnapshot: Record<string, string>;
}

// 资源账本
export interface Resource {
  id: string;
  name: string;
  type: 'item' | 'ability' | 'currency' | 'status';
  owner: string;
  quantity?: number;
  lastUpdatedChapter: number;
  changeLog: { chapter: number; change: string }[];
}

// 章节摘要
export interface ChapterSummary {
  chapterId: string;
  chapterNumber: number;
  title: string;
  charactersPresent: string[];
  keyEvents: string[];
  stateChanges: string[];
  newHooks: string[];
  resolvedHooks: string[];
}

// 支线
export interface Subplot {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'abandoned';
  chapters: number[];
  description: string;
}

// 情感弧线
export interface EmotionalArc {
  characterId: string;
  characterName: string;
  arcType: 'rise' | 'fall' | 'rise_fall' | 'flat' | 'complex';
  points: { chapter: number; emotion: string; intensity: number }[];
}

// 角色互动矩阵
export interface CharacterInteraction {
  characterId1: string;
  characterId2: string;
  interactions: { chapter: number; type: string; summary: string }[];
}

// 解析结果（用于导入小说）
export interface ParseResult {
  title: string;
  author?: string;
  genre?: Genre;
  estimatedWordCount: number;
  chapters: ParsedChapter[];
  characters: ExtractedCharacter[];
  worldSettings: ExtractedWorldSetting;
  writingPatterns: WritingPattern[];
  styleFingerprint: StyleFingerprint;
}

// 解析出的章节
export interface ParsedChapter {
  index: number;
  title: string;
  content: string;
  wordCount: number;
  characters: string[];
  scenes: Scene[];
}

// 场景
export interface Scene {
  location: string;
  time: string;
  characters: string[];
  summary: string;
}

// 提取的角色
export interface ExtractedCharacter {
  name: string;
  aliases: string[];
  description: string;
  appearances: number[];      // 出现的章节
  relationships: { name: string; type: string }[];
}

// 提取的世界设定
export interface ExtractedWorldSetting {
  powerSystem?: string;
  locations: string[];
  factions: string[];
  items: string[];
  timeline: { event: string; chapter?: number }[];
}

// 写作模式
export interface WritingPattern {
  type: 'opening' | 'dialogue' | 'description' | 'action' | 'transition';
  frequency: number;
  examples: string[];
}

// 导入配置
export interface ImportConfig {
  filePath: string;
  encoding?: string;
  splitPattern?: RegExp;         // 章节分割正则
  preserveFormatting?: boolean;  // 保留格式
  extractCharacters?: boolean;  // 提取角色
  extractWorldSettings?: boolean; // 提取世界观
  analyzeStyle?: boolean;       // 分析风格
  chunkSize?: number;           // 分块大小（用于长文本）
  overlap?: number;             // 重叠大小
}

// 导出配置
export interface ExportConfig {
  format: 'txt' | 'md' | 'epub' | 'pdf' | 'docx' | 'json';
  includeOutline?: boolean;
  includeCharacters?: boolean;
  includeWorldSettings?: boolean;
  platform?: 'qidian' | '番茄' | '飞卢' | 'custom';
  template?: string;
}

// 反AI检测配置
export interface AntiDetectionConfig {
  enabled: boolean;
  intensity: number;            // 1-10
  replaceAIWords: boolean;       // 替换AI词汇
  varySentenceStructure: boolean; // 变化句式
  addColloquialism: boolean;     // 添加口语化
  enhanceEmotion: boolean;       // 增强情感
  addImperfection: boolean;      // 添加人为不完美
  mixStyles: boolean;            // 混合风格
}

// 审计配置
export interface AuditConfig {
  dimensions: string[];           // 启用的审计维度
  threshold: number;             // 通过阈值
  autoFix: boolean;              // 自动修复
  maxIterations: number;        // 最大迭代次数
}

// 可配置的审计维度
export const AUDIT_DIMENSIONS = [
  'characterConsistency',        // 角色一致性
  'worldConsistency',            // 世界观一致性
  'timelineConsistency',         // 时间线一致性
  'plotLogic',                   // 情节逻辑
  'foreshadowFulfillment',      // 伏笔回收
  'resourceTracking',            // 资源追踪
  'emotionalArc',               // 情感弧线
  'narrativePacing',             // 叙事节奏
  'dialogueQuality',             // 对话质量
  'descriptionDensity',         // 描写密度
  'aiDetection',                // AI痕迹检测
  'repetitiveness',             // 重复性
  'grammaticalErrors',          // 语法错误
  'tautology',                  // 同义重复
  'logicalGaps',                // 逻辑漏洞
  'progressionPacing',          // 进度节奏
  'conflictEscalation',         // 冲突升级
  'characterMotivation',        // 角色动机
  'stakesClarity',              // 悬念清晰度
  'sensoryDetails',             // 感官细节
  'backstoryIntegration',       // 背景故事融合
  'povConsistency',             // 视角一致性
  'tenseConsistency',           // 时态一致性
  'pacingVariation',             // 节奏变化
  'showVsTell',                // 展示vs讲述
  'subtext',                    // 潜台词
  'symbolism',                  // 象征手法
  'thematicCoherence',         // 主题连贯性
  'readerEngagement',          // 读者参与度
  'genreConvention',           // 类型惯例
  'culturalSensitivity',        // 文化敏感性
  ' factualAccuracy',           // 事实准确性
  'powerConsistency',          // 能力一致性（修仙等）
] as const;

export type AuditDimensionType = typeof AUDIT_DIMENSIONS[number];
