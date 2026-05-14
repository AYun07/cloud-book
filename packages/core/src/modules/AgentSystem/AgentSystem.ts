/**
 * Cloud Book - Agent系统
 * 6类AI智能体：架构师、写手、审计员、修订员、文风工程师、雷达
 */

import { NovelProject, TruthFiles, Chapter, AuditResult } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';

// ==================== Agent 基础定义 ====================

export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  timestamp: Date;
  content: string;
  type: 'request' | 'response' | 'notification';
  metadata?: Record<string, any>;
}

export interface AgentState {
  agentName: string;
  status: 'idle' | 'working' | 'paused' | 'error';
  currentTask?: string;
  lastActivity: Date;
  queue: AgentTask[];
}

export interface AgentTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  data: any;
  result?: any;
}

export abstract class BaseAgent {
  protected llmManager: LLMManager;
  protected state: AgentState;
  protected messageInbox: AgentMessage[] = [];
  protected messageOutbox: AgentMessage[] = [];

  constructor(llmManager: LLMManager) {
    this.llmManager = llmManager;
    this.state = {
      agentName: this.getAgentName(),
      status: 'idle',
      lastActivity: new Date(),
      queue: []
    };
  }

  getAgentName(): string {
    return this.constructor.name;
  }

  getState(): AgentState {
    return this.state;
  }

  sendMessage(toAgent: string, content: string, type: AgentMessage['type'] = 'request', metadata?: Record<string, any>): AgentMessage {
    const message: AgentMessage = {
      id: Date.now().toString(),
      fromAgent: this.getAgentName(),
      toAgent,
      content,
      type,
      timestamp: new Date(),
      metadata: metadata || {}
    };
    this.messageOutbox.push(message);
    return message;
  }

  receiveMessage(message: AgentMessage): void {
    this.messageInbox.push(message);
  }

  addTask(task: Omit<AgentTask, 'id' | 'createdAt'>): string {
    const newTask: AgentTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.state.queue.push(newTask);
    return newTask.id;
  }

  abstract executeTask(task: AgentTask): Promise<any>;
}

// ==================== 6类 Agent ====================

export class ArchitectAgent extends BaseAgent {
  getAgentName(): string {
    return 'Architect';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performArchitectureTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performArchitectureTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'analyze_market':
        return this.analyzeMarket(task.data);
      case 'generate_direction':
        return this.generateDirection(task.data);
      case 'plan_novel_structure':
        return this.planNovelStructure(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async analyzeMarket(project: NovelProject): Promise<any> {
    const prompt = `
## 市场分析

项目：${project.title}
题材：${project.genre}
目标读者：${project.targetAudience || '未设定'}

请分析当前市场趋势：
1. 该题材的当前热度
2. 目标读者的阅读偏好
3. 同类作品的成功要素
4. 差异化建议

请以结构化输出。
`;
    
    const model = this.llmManager.route('analysis');
    const response = await this.llmManager.generate(prompt, model?.name || '');
    
    return {
      analysis: response.text };
  }

  async generateDirection(project: NovelProject): Promise<any> {
    const prompt = `
## 创作方向生成

项目：${project.title}
核心设定：
${JSON.stringify(project.worldSetting, null, 2)}

请为 ${project.genre} 题材小说的创作方向。
`;
    
    const model = this.llmManager.route('writing');
    const response = await this.llmManager.generate(prompt, model?.name || '');
    
    return { direction: response.text };
  }

  async planNovelStructure(project: NovelProject): Promise<any> {
    const prompt = `
## 小说结构规划

项目：${project.title}
题材：${project.genre}

请规划小说整体结构：
1. 开篇设定
2. 分卷计划
3. 核心事件大纲
`;
    
    const model = this.llmManager.route('writing');
    const response = await this.llmManager.generate(prompt, model?.name || '');
    
    return { structure: response.text };
  }
}

export class WriterAgent extends BaseAgent {
  getAgentName(): string {
    return 'Writer';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performWritingTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performWritingTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'write_chapter':
        return this.writeChapter(task.data);
      case 'continue_story':
        return this.continueStory(task.data);
      case 'write_scene':
        return this.writeScene(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async writeChapter(data: { project: NovelProject; chapterNumber: number; truthFiles: TruthFiles }): Promise<any> {
    const prompt = `
## 第 ${data.chapterNumber} 章创作

项目：${data.project.title}
题材：${data.project.genre}

请创作本章内容。
`;
    
    const model = this.llmManager.route('writing');
    const response = await this.llmManager.generate(prompt, model?.name || '');
    
    return { content: response.text };
  }

  async continueStory(data: any): Promise<any> {
    return { content: '继续内容' };
  }

  async writeScene(data: any): Promise<any> {
    return { content: '场景内容' };
  }
}

export class AuditorAgent extends BaseAgent {
  private auditEngine: AIAuditEngine;

  constructor(llmManager: LLMManager, auditEngine: AIAuditEngine) {
    super(llmManager);
    this.auditEngine = auditEngine;
  }

  getAgentName(): string {
    return 'Auditor';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performAuditTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performAuditTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'audit_chapter':
        return this.auditChapter(task.data);
      case 'audit_consistency':
        return this.auditConsistency(task.data);
      case 'quality_report':
        return this.generateQualityReport(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async auditChapter(data: { chapter: Chapter; truthFiles: TruthFiles }): Promise<AuditResult> {
    return await this.auditEngine.audit(data.chapter.content, data.truthFiles);
  }

  async auditConsistency(data: any): Promise<any> {
    return { consistent: true, issues: [] };
  }

  async generateQualityReport(data: any): Promise<any> {
    return { report: '质量报告' };
  }
}

export class ReviserAgent extends BaseAgent {
  getAgentName(): string {
    return 'Reviser';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performRevisionTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performRevisionTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'revise_chapter':
        return this.reviseChapter(task.data);
      case 'fix_issues':
        return this.fixIssues(task.data);
      case 'enhance_prose':
        return this.enhanceProse(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async reviseChapter(data: any): Promise<any> {
    return { revisedContent: '修订后的内容' };
  }

  async fixIssues(data: any): Promise<any> {
    return { fixedContent: '修复后的内容' };
  }

  async enhanceProse(data: any): Promise<any> {
    return { enhancedContent: '优化后的内容' };
  }
}

export class StyleEngineerAgent extends BaseAgent {
  getAgentName(): string {
    return 'StyleEngineer';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performStyleTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performStyleTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'analyze_style':
        return this.analyzeStyle(task.data);
      case 'transfer_style':
        return this.transferStyle(task.data);
      case 'optimize_prose':
        return this.optimizeProse(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async analyzeStyle(data: any): Promise<any> {
    return { style: '风格分析' };
  }

  async transferStyle(data: any): Promise<any> {
    return { transferredContent: '风格迁移后的内容' };
  }

  async optimizeProse(data: any): Promise<any> {
    return { optimizedContent: '优化后的内容' };
  }
}

export class RadarAgent extends BaseAgent {
  getAgentName(): string {
    return 'Radar';
  }

  async executeTask(task: AgentTask): Promise<any> {
    this.state.status = 'working';
    this.state.currentTask = task.type;

    try {
      const result = await this.performRadarTask(task);
      this.state.status = 'idle';
      this.state.lastActivity = new Date();
      return result;
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async performRadarTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'monitor_trends':
        return this.monitorTrends(task.data);
      case 'track_consistency':
        return this.trackConsistency(task.data);
      case 'risk_detection':
        return this.detectRisk(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async monitorTrends(data: any): Promise<any> {
    return { trends: '趋势数据' };
  }

  async trackConsistency(data: any): Promise<any> {
    return { consistencyStatus: '一致状态' };
  }

  async detectRisk(data: any): Promise<any> {
    return { risks: '风险列表' };
  }
}

// ==================== Agent 协调器 ====================

export class AgentCoordinator {
  private agents: Map<string, BaseAgent>;
  private messageQueue: AgentMessage[] = [];
  private llmManager: LLMManager;

  constructor(llmManager: LLMManager, auditEngine: AIAuditEngine) {
    this.llmManager = llmManager;
    this.agents = new Map();

    this.agents.set('Architect', new ArchitectAgent(llmManager));
    this.agents.set('Writer', new WriterAgent(llmManager));
    this.agents.set('Auditor', new AuditorAgent(llmManager, auditEngine));
    this.agents.set('Reviser', new ReviserAgent(llmManager));
    this.agents.set('StyleEngineer', new StyleEngineerAgent(llmManager));
    this.agents.set('Radar', new RadarAgent(llmManager));
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  async orchestrateNovelCreation(
    project: NovelProject,
    truthFiles: TruthFiles
  ): Promise<any> {
    const architect = this.agents.get('Architect');
    const writer = this.agents.get('Writer');
    const auditor = this.agents.get('Auditor');
    const reviser = this.agents.get('Reviser');

    const structure = await architect?.executeTask({
      id: '1',
      type: 'plan_novel_structure',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: project
    });

    const chapter = await writer?.executeTask({
      id: '2',
      type: 'write_chapter',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: { project, chapterNumber: 1, truthFiles }
    });

    const audit = await auditor?.executeTask({
      id: '3',
      type: 'audit_chapter',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: chapter
    });

    const revised = await reviser?.executeTask({
      id: '4',
      type: 'revise_chapter',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: audit
    });

    return {
      structure,
      chapter,
      audit,
      revised
    };
  }
}

export class AgentSystem {
  private coordinator: AgentCoordinator;
  private llmManager: LLMManager;
  private auditEngine: AIAuditEngine;

  constructor(llmManager: LLMManager, auditEngine: AIAuditEngine) {
    this.llmManager = llmManager;
    this.auditEngine = auditEngine;
    this.coordinator = new AgentCoordinator(llmManager, auditEngine);
  }

  getCoordinator(): AgentCoordinator {
    return this.coordinator;
  }

  getAllAgents(): BaseAgent[] {
    return this.coordinator.getAllAgents();
  }

  getArchitectAgent(): ArchitectAgent {
    return this.coordinator.getAgent('Architect') as ArchitectAgent;
  }

  getWriterAgent(): WriterAgent {
    return this.coordinator.getAgent('Writer') as WriterAgent;
  }

  getAuditorAgent(): AuditorAgent {
    return this.coordinator.getAgent('Auditor') as AuditorAgent;
  }

  getReviserAgent(): ReviserAgent {
    return this.coordinator.getAgent('Reviser') as ReviserAgent;
  }

  getStyleEngineerAgent(): StyleEngineerAgent {
    return this.coordinator.getAgent('StyleEngineer') as StyleEngineerAgent;
  }

  getRadarAgent(): RadarAgent {
    return this.coordinator.getAgent('Radar') as RadarAgent;
  }

  async executeArchitectTask(
    project: NovelProject,
    task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation',
    params?: Record<string, any>
  ): Promise<any> {
    const architect = this.getArchitectAgent();
    return architect.executeTask({
      id: Date.now().toString(),
      type: task,
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: { project, ...params }
    });
  }

  async executeWriterTask(
    project: NovelProject,
    chapterNumber: number,
    options?: { outline?: string; guidance?: string }
  ): Promise<any> {
    const writer = this.getWriterAgent();
    return writer.executeTask({
      id: Date.now().toString(),
      type: 'write_chapter',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: { project, chapterNumber, ...options }
    });
  }

  async executeAuditorTask(
    content: string,
    truthFiles: TruthFiles,
    options?: { autoFix?: boolean }
  ): Promise<any> {
    const auditor = this.getAuditorAgent();
    return auditor.executeTask({
      id: Date.now().toString(),
      type: 'audit_chapter',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(),
      data: { content, truthFiles, ...options }
    });
  }

  async executePipeline(
    project: NovelProject,
    chapterNumber: number
  ): Promise<any> {
    return this.coordinator.orchestrateNovelCreation(project, {} as TruthFiles);
  }
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  agent: string;
  timestamp: Date;
}
