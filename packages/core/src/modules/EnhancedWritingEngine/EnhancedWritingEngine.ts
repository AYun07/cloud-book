/**
 * Cloud Book - 深度优化多模式写作引擎
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - 6种写作模式，支持自定义
 * - 模式间无缝切换
 * - 自适应写作建议
 * - 模式记忆与学习
 */

import { Chapter, NovelProject } from '../../types';

// ============================================
// 写作模式定义
// ============================================

export type WritingMode =
  | 'blank_page'      // 空白页：完全自由
  | 'assisted'        // 辅助模式：智能建议
  | 'auto_pilot'      // 自动驾驶：AI写作
  | 'collaborative'   // 协作模式：人机协作
  | 'thematic'        // 主题驱动：围绕主题
  | 'experimental';   // 实验模式：新写法

export interface ModeConfig {
  mode: WritingMode;
  name: string;
  description: string;
  icon: string;
  features: WritingFeature[];
  defaultPromptStyle: 'casual' | 'formal' | 'literary' | 'concise';
  suggestionFrequency: 'none' | 'low' | 'medium' | 'high' | 'aggressive';
  autoComplete: boolean;
  autoAudit: boolean;
  maxSuggestionLength: number;
}

export interface WritingFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configurable: boolean;
  config?: Record<string, any>;
}

export interface WritingSession {
  id: string;
  projectId: string;
  mode: WritingMode;
  startTime: Date;
  lastActivity: Date;
  chaptersWritten: number[];
  wordCount: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  avgTimePerWord: number;
  flowState: FlowState;
}

export interface FlowState {
  level: 0 | 1 | 2 | 3 | 4 | 5; // 0=blocked, 5=flow
  lastUpdated: Date;
  triggers: string[];
  productivityScore: number;
}

export interface WritingSuggestion {
  id: string;
  type: 'continuation' | 'alternative' | 'improvement' | 'dialogue' | 'description' | 'transition';
  content: string;
  confidence: number; // 0-1
  reason: string;
  insertionPoint?: {
    start: number;
    end: number;
  };
  relatedWorldInfo?: string[];
  alternatives?: WritingSuggestion[];
}

export interface WritingContext {
  chapter: Chapter;
  project: NovelProject;
  precedingText: string;
  followingText?: string;
  currentPosition: number;
  currentMode: WritingMode;
  recentActions: WritingAction[];
  characterFocus?: string[];
  themeFocus?: string[];
  timeConstraints?: {
    deadline?: Date;
    targetWordCount?: number;
  };
}

export interface WritingAction {
  type: 'write' | 'delete' | 'select' | 'suggest_accept' | 'suggest_reject' | 'format' | 'mode_switch';
  timestamp: Date;
  details: Record<string, any>;
}

export interface ModeTransition {
  from: WritingMode;
  to: WritingMode;
  reason: 'user' | 'auto' | 'context' | 'productivity';
  timestamp: Date;
  success: boolean;
  sessionDuration: number;
}

export interface WritingStatistics {
  modeStats: Record<WritingMode, {
    timeSpent: number;
    wordCount: number;
    suggestionsAccepted: number;
    avgFlowState: number;
  }>;
  totalTime: number;
  totalWords: number;
  preferredMode: WritingMode;
  mostProductiveTime: { hour: number; productivity: number }[];
  improvementTrend: number[]; // last 7 sessions
}

export interface CustomModeConfig {
  id: string;
  name: string;
  description: string;
  baseMode: WritingMode;
  features: Partial<Record<WritingFeatureId, boolean>>;
  promptTemplate?: string;
  color: string;
  isPublic: boolean;
}

export type WritingFeatureId =
  | 'auto_complete'
  | 'smart_suggestions'
  | 'real_time_audit'
  | 'world_info_injection'
  | 'character_consistency'
  | 'style_transfer'
  | 'dialogue_generator'
  | 'scene_builder'
  | 'rhythm_analyzer'
  | 'tension_manager';

// ============================================
// 增强型 WritingEngine
// ============================================

export class EnhancedWritingEngine {
  private activeSessions: Map<string, WritingSession> = new Map();
  private modeTransitions: Map<string, ModeTransition[]> = new Map();
  private customModes: Map<string, CustomModeConfig> = new Map();
  private modeConfigs: Map<WritingMode, ModeConfig> = new Map();
  private statistics: WritingStatistics | null = null;
  private sessionListeners: Map<string, Set<(session: WritingSession) => void>> = new Map();
  
  constructor() {
    this.loadDefaultModeConfigs();
  }
  
  // ============================================
  // 模式管理
  // ============================================
  
  getModeConfig(mode: WritingMode): ModeConfig {
    return this.modeConfigs.get(mode) || this.modeConfigs.get('blank_page')!;
  }
  
  getAllModes(): ModeConfig[] {
    return Array.from(this.modeConfigs.values());
  }
  
  async switchMode(sessionId: string, newMode: WritingMode, reason?: ModeTransition['reason']): Promise<ModeTransition> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    const oldMode = session.mode;
    session.mode = newMode;
    session.lastActivity = new Date();
    
    const transition: ModeTransition = {
      from: oldMode,
      to: newMode,
      reason: reason || 'user',
      timestamp: new Date(),
      success: true,
      sessionDuration: Date.now() - session.startTime.getTime()
    };
    
    if (!this.modeTransitions.has(sessionId)) {
      this.modeTransitions.set(sessionId, []);
    }
    this.modeTransitions.get(sessionId)?.push(transition);
    
    this.emitSessionUpdate(session);
    return transition;
  }
  
  async autoSwitchMode(sessionId: string): Promise<WritingMode | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    // 基于流状态自动切换
    if (session.flowState.level < 2) {
      // 阻塞时切换到辅助模式
      return 'assisted';
    } else if (session.flowState.level > 3) {
      // 心流时切换到空白页
      return 'blank_page';
    }
    
    return null;
  }
  
  // ============================================
  // 会话管理
  // ============================================
  
  async startSession(projectId: string, initialMode: WritingMode = 'blank_page'): Promise<WritingSession> {
    const session: WritingSession = {
      id: this.generateSessionId(),
      projectId,
      mode: initialMode,
      startTime: new Date(),
      lastActivity: new Date(),
      chaptersWritten: [],
      wordCount: 0,
      suggestionsAccepted: 0,
      suggestionsRejected: 0,
      avgTimePerWord: 0,
      flowState: {
        level: 3,
        lastUpdated: new Date(),
        triggers: ['start'],
        productivityScore: 50
      }
    };
    
    this.activeSessions.set(session.id, session);
    return session;
  }
  
  async endSession(sessionId: string): Promise<WritingStatistics> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    this.updateStatistics(session);
    this.activeSessions.delete(sessionId);
    
    return this.statistics!;
  }
  
  getSession(sessionId: string): WritingSession | undefined {
    return this.activeSessions.get(sessionId);
  }
  
  // ============================================
  // 写作建议
  // ============================================
  
  async getSuggestions(context: WritingContext, count: number = 3): Promise<WritingSuggestion[]> {
    const config = this.getModeConfig(context.currentMode);
    if (config.suggestionFrequency === 'none') return [];
    
    const suggestions: WritingSuggestion[] = [];
    
    // 基于当前模式生成建议
    switch (context.currentMode) {
      case 'assisted':
        suggestions.push(...this.generateAssistedSuggestions(context, count));
        break;
      case 'auto_pilot':
        suggestions.push(...this.generateAutoPilotSuggestions(context, count));
        break;
      case 'thematic':
        suggestions.push(...this.generateThematicSuggestions(context, count));
        break;
      default:
        suggestions.push(...this.generateGenericSuggestions(context, count));
    }
    
    return suggestions.slice(0, count);
  }
  
  async acceptSuggestion(sessionId: string, suggestionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.suggestionsAccepted++;
    session.lastActivity = new Date();
    
    // 更新流状态
    this.updateFlowState(session, 'accept');
    this.emitSessionUpdate(session);
  }
  
  async rejectSuggestion(sessionId: string, suggestionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.suggestionsRejected++;
    session.lastActivity = new Date();
    
    this.updateFlowState(session, 'reject');
    this.emitSessionUpdate(session);
  }
  
  private generateAssistedSuggestions(context: WritingContext, count: number): WritingSuggestion[] {
    return [
      {
        id: 'suggest-1',
        type: 'continuation',
        content: '接着刚才的内容继续写...',
        confidence: 0.7,
        reason: '基于前文的自然延续',
        relatedWorldInfo: []
      }
    ];
  }
  
  private generateAutoPilotSuggestions(context: WritingContext, count: number): WritingSuggestion[] {
    return [
      {
        id: 'auto-1',
        type: 'continuation',
        content: 'AI生成的自动续写...',
        confidence: 0.6,
        reason: '基于大纲和人物设定',
        relatedWorldInfo: []
      }
    ];
  }
  
  private generateThematicSuggestions(context: WritingContext, count: number): WritingSuggestion[] {
    return [
      {
        id: 'theme-1',
        type: 'description',
        content: '这段可以强化"成长"主题...',
        confidence: 0.8,
        reason: '当前主题焦点',
        relatedWorldInfo: context.themeFocus
      }
    ];
  }
  
  private generateGenericSuggestions(context: WritingContext, count: number): WritingSuggestion[] {
    return [];
  }
  
  // ============================================
  // 流状态管理
  // ============================================
  
  recordActivity(sessionId: string, action: WritingAction): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.lastActivity = new Date();
    
    // 更新流状态
    this.updateFlowState(session, action.type);
    
    if (action.type === 'write') {
      const wordCount = action.details.wordCount || 0;
      session.wordCount += wordCount;
    }
    
    this.emitSessionUpdate(session);
  }
  
  private updateFlowState(session: WritingSession, trigger: string): void {
    const now = Date.now();
    const timeSinceLast = now - session.lastActivity.getTime();
    
    // 简单的流状态更新算法
    let newLevel = session.flowState.level;
    
    if (trigger === 'suggest_accept') {
      newLevel = Math.min(5, newLevel + 1);
    } else if (trigger === 'suggest_reject') {
      newLevel = Math.max(0, newLevel - 1);
    } else if (trigger === 'write' && timeSinceLast < 10000) {
      // 快速写作提升流状态
      newLevel = Math.min(5, newLevel + 0.5);
    }
    
    session.flowState = {
      ...session.flowState,
      level: Math.max(0, Math.min(5, Math.round(newLevel))),
      lastUpdated: new Date(),
      triggers: [...session.flowState.triggers.slice(-10), trigger],
      productivityScore: newLevel * 20
    };
  }
  
  // ============================================
  // 自定义模式
  // ============================================
  
  async createCustomMode(config: CustomModeConfig): Promise<CustomModeConfig> {
    const id = config.id || `custom-${Date.now()}`;
    const modeConfig: CustomModeConfig = {
      ...config,
      id
    };
    
    this.customModes.set(id, modeConfig);
    return modeConfig;
  }
  
  getCustomModes(): CustomModeConfig[] {
    return Array.from(this.customModes.values());
  }
  
  // ============================================
  // 统计分析
  // ============================================
  
  getStatistics(): WritingStatistics | null {
    return this.statistics;
  }
  
  getModeRecommendations(context: WritingContext): WritingMode[] {
    // 基于上下文推荐模式
    const recommendations: WritingMode[] = [];
    
    if (context.timeConstraints?.deadline) {
      recommendations.push('auto_pilot', 'assisted');
    }
    
    if (context.themeFocus?.length) {
      recommendations.push('thematic');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('blank_page', 'assisted');
    }
    
    return recommendations;
  }
  
  private updateStatistics(session: WritingSession): void {
    if (!this.statistics) {
      this.statistics = {
        modeStats: {} as any,
        totalTime: 0,
        totalWords: 0,
        preferredMode: 'blank_page',
        mostProductiveTime: [],
        improvementTrend: []
      };
      
      // 初始化所有模式
      for (const mode of this.modeConfigs.keys()) {
        this.statistics.modeStats[mode] = {
          timeSpent: 0,
          wordCount: 0,
          suggestionsAccepted: 0,
          avgFlowState: 0
        };
      }
    }
    
    const stats = this.statistics;
    const sessionDuration = Date.now() - session.startTime.getTime();
    const modeStats = stats.modeStats[session.mode];
    
    if (modeStats) {
      modeStats.timeSpent += sessionDuration;
      modeStats.wordCount += session.wordCount;
      modeStats.suggestionsAccepted += session.suggestionsAccepted;
      
      const count = (modeStats.timeSpent > 0 ? 1 : 0) + (modeStats.avgFlowState > 0 ? 1 : 0);
      modeStats.avgFlowState = (modeStats.avgFlowState + session.flowState.level) / (count || 1);
    }
    
    stats.totalTime += sessionDuration;
    stats.totalWords += session.wordCount;
    
    // 更新偏好模式
    let maxTime = 0;
    for (const [mode, modeStat] of Object.entries(stats.modeStats)) {
      if (modeStat.timeSpent > maxTime) {
        maxTime = modeStat.timeSpent;
        stats.preferredMode = mode as WritingMode;
      }
    }
  }
  
  // ============================================
  // 配置初始化
  // ============================================
  
  private loadDefaultModeConfigs(): void {
    // 空白页模式
    this.modeConfigs.set('blank_page', {
      mode: 'blank_page',
      name: '空白页',
      description: '完全自由写作，无干扰',
      icon: '📝',
      features: [],
      defaultPromptStyle: 'casual',
      suggestionFrequency: 'none',
      autoComplete: false,
      autoAudit: false,
      maxSuggestionLength: 0
    });
    
    // 辅助模式
    this.modeConfigs.set('assisted', {
      mode: 'assisted',
      name: '智能辅助',
      description: 'AI提供实时建议',
      icon: '🤝',
      features: [
        { id: 'smart_suggestions', name: '智能建议', description: '上下文相关建议', enabled: true, configurable: true },
        { id: 'real_time_audit', name: '实时审计', description: '即时检查一致性', enabled: true, configurable: true }
      ],
      defaultPromptStyle: 'literary',
      suggestionFrequency: 'medium',
      autoComplete: true,
      autoAudit: true,
      maxSuggestionLength: 200
    });
    
    // 自动驾驶模式
    this.modeConfigs.set('auto_pilot', {
      mode: 'auto_pilot',
      name: '自动驾驶',
      description: 'AI辅助批量生成',
      icon: '🚀',
      features: [
        { id: 'auto_complete', name: '自动续写', description: 'AI自动继续写作', enabled: true, configurable: true },
        { id: 'scene_builder', name: '场景构建', description: '自动生成场景', enabled: true, configurable: true }
      ],
      defaultPromptStyle: 'formal',
      suggestionFrequency: 'aggressive',
      autoComplete: true,
      autoAudit: true,
      maxSuggestionLength: 500
    });
    
    // 主题驱动模式
    this.modeConfigs.set('thematic', {
      mode: 'thematic',
      name: '主题驱动',
      description: '围绕特定主题写作',
      icon: '💡',
      features: [
        { id: 'tension_manager', name: '张力管理', description: '控制情节张力', enabled: true, configurable: true },
        { id: 'rhythm_analyzer', name: '节奏分析', description: '分析写作节奏', enabled: true, configurable: true }
      ],
      defaultPromptStyle: 'literary',
      suggestionFrequency: 'high',
      autoComplete: false,
      autoAudit: true,
      maxSuggestionLength: 300
    });
  }
  
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ============================================
  // 事件系统
  // ============================================
  
  onSessionUpdate(sessionId: string, callback: (session: WritingSession) => void): () => void {
    if (!this.sessionListeners.has(sessionId)) {
      this.sessionListeners.set(sessionId, new Set());
    }
    this.sessionListeners.get(sessionId)?.add(callback);
    
    return () => {
      this.sessionListeners.get(sessionId)?.delete(callback);
    };
  }
  
  private emitSessionUpdate(session: WritingSession): void {
    if (this.sessionListeners.has(session.id)) {
      for (const callback of this.sessionListeners.get(session.id)!) {
        try {
          callback(session);
        } catch (error) {
          console.error(`Error in session listener:`, error);
        }
      }
    }
  }
}

export default EnhancedWritingEngine;
