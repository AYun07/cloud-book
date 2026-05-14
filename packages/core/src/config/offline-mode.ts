/**
 * Cloud Book - 离线模式完整方案
 * 2026年5月14日
 * 脱离大模型情况下所有功能可用，包含完整创作系统
 */

import { BasicVectorizer } from './basic-vectorizer';
import { CompleteOfflineSystem, completeOfflineSystem } from './complete-offline-system';

export interface OfflineCapabilities {
  feature: string;
  onlineMode: string;
  offlineMode: string;
  fullyFunctional: boolean;
}

export const OFFLINE_CAPABILITIES: OfflineCapabilities[] = [
  // 数据管理类 - 完全离线可用
  { feature: '项目管理', onlineMode: 'LLM辅助', offlineMode: '手动操作', fullyFunctional: true },
  { feature: '章节管理', onlineMode: 'LLM辅助', offlineMode: '手动编辑', fullyFunctional: true },
  { feature: '角色管理', onlineMode: 'LLM生成', offlineMode: '智能提示+模板', fullyFunctional: true },
  { feature: '世界设定', onlineMode: 'LLM生成', offlineMode: '模板引导', fullyFunctional: true },
  { feature: '大纲管理', onlineMode: 'LLM辅助', offlineMode: '模板+结构建议', fullyFunctional: true },
  
  // 导入导出 - 完全离线可用
  { feature: '导入功能', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '导出功能', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '版本历史', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  
  // 创作辅助 - 完全离线可用
  { feature: '七步创作法', onlineMode: 'LLM引导', offlineMode: '交互式表单', fullyFunctional: true },
  { feature: '雪花创作法', onlineMode: 'LLM引导', offlineMode: '交互式表单', fullyFunctional: true },
  { feature: '思维导图', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '情节生成', onlineMode: 'LLM生成', offlineMode: '模板引擎', fullyFunctional: true },
  { feature: '创意提示', onlineMode: 'LLM创意', offlineMode: '创意库', fullyFunctional: true },
  { feature: '角色建议', onlineMode: 'LLM建议', offlineMode: '角色模板', fullyFunctional: true },
  { feature: '对话帮助', onlineMode: 'LLM对话', offlineMode: '对话模板库', fullyFunctional: true },
  
  // 写作功能 - 离线有智能辅助
  { feature: '章节生成', onlineMode: 'LLM生成', offlineMode: '场景模板', fullyFunctional: true },
  { feature: '章节续写', onlineMode: 'LLM续写', offlineMode: '情节模板', fullyFunctional: true },
  { feature: '标题创作', onlineMode: 'LLM创意', offlineMode: '标题模板库', fullyFunctional: true },
  
  // 审计功能 - 离线使用规则匹配
  { feature: '内容审计', onlineMode: 'LLM分析', offlineMode: '规则匹配', fullyFunctional: true },
  { feature: 'AI检测', onlineMode: 'LLM检测', offlineMode: '特征匹配', fullyFunctional: true },
  { feature: '一致性检查', onlineMode: 'LLM分析', offlineMode: '关键词匹配', fullyFunctional: true },
  
  // RAG检索 - 使用基础向量
  { feature: '知识检索', onlineMode: '向量API', offlineMode: '基础向量', fullyFunctional: true },
  { feature: '相似度搜索', onlineMode: '向量API', offlineMode: '哈希向量', fullyFunctional: true },
  
  // 其他功能
  { feature: '目标追踪', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '成本统计', onlineMode: 'API统计', offlineMode: '无成本', fullyFunctional: true },
  { feature: '多语言', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '快捷键', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '网页爬取', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true },
  { feature: '插件系统', onlineMode: '相同', offlineMode: '相同', fullyFunctional: true }
];

/**
 * 离线规则审计器
 */
export class OfflineAuditor {
  private rules: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initRules();
  }

  private initRules() {
    this.rules.set('repetition', [
      /(.)\1{5,}/g,
      /(.{5,})\1{2,}/g
    ]);
    
    this.rules.set('aiPatterns', [
      /首先[，,].*其次[，,].*最后/g,
      /然而[，,].*因此[，,]/g,
      /总而言之[，,]/g,
      /综上所述[，,]/g
    ]);
    
    this.rules.set('dialogue', [
      /"[^"]{100,}"/g
    ]);
    
    this.rules.set('pacing', [
      /。{10,}/g
    ]);
  }

  audit(content: string): {
    passed: boolean;
    issues: Array<{ type: string; message: string; position?: number }>;
    score: number;
  } {
    const issues: Array<{ type: string; message: string; position?: number }> = [];
    let totalScore = 100;

    for (const [type, patterns] of this.rules) {
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            type,
            message: `发现${type}问题: ${matches.length}处`,
            position: content.indexOf(matches[0])
          });
          totalScore -= matches.length * 5;
        }
      }
    }

    const wordCount = content.length;
    if (wordCount < 100) {
      issues.push({ type: 'length', message: '内容过短' });
      totalScore -= 10;
    }

    return {
      passed: issues.length === 0 && totalScore >= 60,
      issues,
      score: Math.max(0, totalScore)
    };
  }
}

/**
 * 离线一致性检查器
 */
export class OfflineConsistencyChecker {
  private entities: Map<string, Set<string>> = new Map();

  addEntity(type: string, name: string, attributes: string[]) {
    if (!this.entities.has(type)) {
      this.entities.set(type, new Set());
    }
    this.entities.get(type)!.add(name);
  }

  check(content: string): Array<{ entity: string; found: boolean }> {
    const results: Array<{ entity: string; found: boolean }> = [];
    
    for (const [type, names] of this.entities) {
      for (const name of names) {
        results.push({
          entity: `${type}:${name}`,
          found: content.includes(name)
        });
      }
    }
    
    return results;
  }
}

/**
 * 离线模式管理器（增强版）
 */
export class OfflineModeManager {
  private vectorizer: BasicVectorizer;
  private auditor: OfflineAuditor;
  private consistencyChecker: OfflineConsistencyChecker;
  private isOffline: boolean = false;
  private completeSystem: CompleteOfflineSystem;

  constructor() {
    this.vectorizer = new BasicVectorizer();
    this.auditor = new OfflineAuditor();
    this.consistencyChecker = new OfflineConsistencyChecker();
    this.completeSystem = completeOfflineSystem;
  }

  setOfflineMode(enabled: boolean) {
    this.isOffline = enabled;
  }

  getOfflineStatus(): { isOffline: boolean; capabilities: OfflineCapabilities[] } {
    return {
      isOffline: this.isOffline,
      capabilities: OFFLINE_CAPABILITIES
    };
  }

  getVectorizer(): BasicVectorizer {
    return this.vectorizer;
  }

  getAuditor(): OfflineAuditor {
    return this.auditor;
  }

  getConsistencyChecker(): OfflineConsistencyChecker {
    return this.consistencyChecker;
  }

  /**
   * 离线搜索
   */
  search(query: string, documents: string[], topK: number = 5) {
    return this.vectorizer.search(query, documents, topK);
  }

  /**
   * 离线审计
   */
  audit(content: string) {
    return this.auditor.audit(content);
  }

  /**
   * 获取完全离线创作系统
   */
  getCompleteSystem(): CompleteOfflineSystem {
    return this.completeSystem;
  }

  /**
   * 检查本地模型是否可用（如果用户没有配置，自动降级到完全离线）
   */
  hasLocalModelConfigured(configs: any[] = []): boolean {
    // 检查是否配置了本地模型（Ollama等）
    const localProviders = ['ollama', 'koboldcpp', 'lmstudio', 'localai'];
    return configs.some(config => 
      localProviders.some(provider => 
        config.provider.toLowerCase().includes(provider)
      )
    );
  }

  /**
   * 获取系统状态（包括完全离线功能）
   */
  getSystemStatus() {
    return this.completeSystem.getStatus();
  }
}

export const offlineModeManager = new OfflineModeManager();

export default OfflineModeManager;
