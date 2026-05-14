/**
 * Cloud Book - 真正的 Agent 智能体系统 V2
 * 实现：工具调用、记忆管理、多 Agent 通信、自主决策
 */

import { Agent, AgentType, NovelProject, Chapter, TruthFiles } from '../../types';
import { Hook } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';

export interface AgentTask {
  id: string;
  type: AgentType;
  description: string;
  context: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  retryCount?: number;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
  reasoning?: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>, context: AgentContext) => Promise<ToolResult>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  project?: NovelProject;
  currentChapter?: number;
  memories: AgentMemory;
  otherAgents: Map<AgentType, AgentState>;
  truthFiles: TruthFiles;
  sessionId: string;
}

export interface AgentMemory {
  shortTerm: MemoryEntry[];
  longTerm: MemoryEntry[];
  working: WorkingMemory;
}

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'observation' | 'thought' | 'fact' | 'plan' | 'reflection';
  timestamp: number;
  importance: number;
  source: 'self' | 'tool' | 'other_agent';
  tags: string[];
}

export interface WorkingMemory {
  currentTask?: string;
  subGoals: string[];
  recentObservations: string[];
  decisions: Decision[];
}

export interface Decision {
  id: string;
  context: string;
  options: DecisionOption[];
  selectedOption?: number;
  reasoning: string;
  timestamp: number;
}

export interface DecisionOption {
  label: string;
  value: any;
  score?: number;
  pros?: string[];
  cons?: string[];
}

export interface AgentState {
  type: AgentType;
  status: 'idle' | 'thinking' | 'executing' | 'waiting';
  currentTask?: string;
  lastAction?: string;
  capabilities: string[];
  sharedMemories: MemoryEntry[];
}

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType | 'broadcast';
  type: 'request' | 'response' | 'notification' | 'query';
  content: any;
  timestamp: number;
  inReplyTo?: string;
}

export interface ThinkingStep {
  thought: string;
  reasoning: string;
  decision?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  params: Record<string, any>;
  result?: ToolResult;
}

export interface AgentReflection {
  id: string;
  timestamp: number;
  trigger: 'task_complete' | 'error' | 'milestone' | 'periodic';
  content: string;
  insights: string[];
  adjustments: string[];
}

export class AgentSystem {
  private agents: Map<AgentType, Agent> = new Map();
  private agentStates: Map<AgentType, AgentState> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private llmManager: LLMManager;
  private auditEngine: AIAuditEngine;
  private tools: Map<string, Tool> = new Map();
  private messageQueue: AgentMessage[] = [];
  private agentMemories: Map<AgentType, AgentMemory> = new Map();
  private reflections: Map<AgentType, AgentReflection[]> = new Map();
  private sessionId: string;

  constructor(llmManager: LLMManager, auditEngine: AIAuditEngine) {
    this.llmManager = llmManager;
    this.auditEngine = auditEngine;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.initializeAgents();
    this.registerTools();
  }

  private initializeAgents(): void {
    const agentConfigs: Array<{ type: AgentType; name: string; role: string; responsibilities: string[]; capabilities: string[] }> = [
      {
        type: 'architect',
        name: '架构师',
        role: '负责世界观构建、角色设定、情节规划',
        responsibilities: ['设计世界观和力量体系', '创建角色设定和大纲', '规划章节结构和节奏', '管理伏笔和主线', '定义故事主题和基调'],
        capabilities: ['world_building', 'character_design', 'plot_planning', 'outline_generation', 'plot_analysis']
      },
      {
        type: 'writer',
        name: '写作者',
        role: '负责具体章节的写作生成',
        responsibilities: ['根据大纲生成章节内容', '塑造角色对话和性格', '描写场景和氛围', '推进情节发展', '保持文风一致性'],
        capabilities: ['content_generation', 'dialogue_writing', 'scene_description', 'style_matching', 'pacing_control']
      },
      {
        type: 'auditor',
        name: '审计员',
        role: '负责质量检查和问题发现',
        responsibilities: ['33维度质量审计', '角色一致性检查', '世界观逻辑验证', '伏笔呼应检查', 'AI痕迹检测'],
        capabilities: ['quality_audit', 'consistency_check', 'logic_verification', 'ai_detection', 'issue_detection']
      },
      {
        type: 'reviser',
        name: '修订师',
        role: '负责根据审计结果修订内容',
        responsibilities: ['修复一致性问题', '优化叙事节奏', '增强情感表达', '完善细节描写', '提升整体质量'],
        capabilities: ['content_revision', 'style_enhancement', 'emotion_boost', 'consistency_fix', 'quality_improvement']
      },
      {
        type: 'styleEngineer',
        name: '风格工程师',
        role: '负责风格把控和人机交互优化',
        responsibilities: ['提取和模仿文风', '控制句式变化', '优化用词精准度', '增强表达多样性', '去AI味处理'],
        capabilities: ['style_extraction', 'style_transfer', 'humanization', 'expression_diversity', 'grammar_polish']
      },
      {
        type: 'radar',
        name: '雷达',
        role: '负责趋势分析和市场洞察',
        responsibilities: ['分析热门题材趋势', '监控读者反馈', '评估市场表现', '提供优化建议', '识别风险预警'],
        capabilities: ['trend_analysis', 'market_insight', 'performance_review', 'risk_alert', 'audience_analysis']
      }
    ];

    for (const config of agentConfigs) {
      const agent: Agent = {
        type: config.type,
        name: config.name,
        role: config.role,
        responsibilities: config.responsibilities,
        tools: []
      };
      this.agents.set(config.type, agent);

      this.agentStates.set(config.type, {
        type: config.type,
        status: 'idle',
        capabilities: config.capabilities,
        sharedMemories: []
      });

      this.agentMemories.set(config.type, {
        shortTerm: [],
        longTerm: [],
        working: {
          subGoals: [],
          recentObservations: [],
          decisions: []
        }
      });

      this.reflections.set(config.type, []);
    }
  }

  private registerTools(): void {
    this.tools.set('search_memory', {
      name: 'search_memory',
      description: '搜索 Agent 的记忆库，查找相关的观察、事实或计划',
      parameters: [
        { name: 'query', type: 'string', description: '搜索查询', required: true },
        { name: 'memoryType', type: 'string', description: '记忆类型: observation/fact/plan/reflection', required: false },
        { name: 'limit', type: 'number', description: '返回结果数量限制', required: false, default: 5 }
      ],
      execute: async (params, context) => {
        const results = this.searchAgentMemory(context.currentChapter || 0, params.query, params.memoryType, params.limit || 5);
        return { success: true, data: results };
      }
    });

    this.tools.set('store_memory', {
      name: 'store_memory',
      description: '存储重要信息到 Agent 记忆库',
      parameters: [
        { name: 'content', type: 'string', description: '要存储的内容', required: true },
        { name: 'type', type: 'string', description: '记忆类型: observation/fact/plan/reflection', required: true },
        { name: 'importance', type: 'number', description: '重要性评分 0-10', required: false, default: 5 },
        { name: 'tags', type: 'array', description: '标签数组', required: false, default: [] }
      ],
      execute: async (params, context) => {
        this.storeAgentMemory(context.currentChapter || 0, params.content, params.type, params.importance || 5, params.tags || []);
        return { success: true, data: { stored: true } };
      }
    });

    this.tools.set('call_agent', {
      name: 'call_agent',
      description: '调用其他 Agent 执行任务并获取结果',
      parameters: [
        { name: 'agentType', type: 'string', description: '目标 Agent 类型', required: true },
        { name: 'task', type: 'string', description: '任务描述', required: true },
        { name: 'context', type: 'object', description: '传递给目标 Agent 的上下文', required: false }
      ],
      execute: async (params, context) => {
        const result = await this.delegateToAgent(params.agentType as AgentType, params.task, params.context || {}, context);
        return result;
      }
    });

    this.tools.set('check_truth_files', {
      name: 'check_truth_files',
      description: '检查真相文件中的角色状态、伏笔、资源等信息',
      parameters: [
        { name: 'checkType', type: 'string', description: '检查类型: protagonist/hooks/resources/relationships', required: true }
      ],
      execute: async (params, context) => {
        const data = this.extractTruthInfo(context.truthFiles, params.checkType);
        return { success: true, data };
      }
    });

    this.tools.set('update_truth_files', {
      name: 'update_truth_files',
      description: '更新真相文件中的状态信息',
      parameters: [
        { name: 'updateType', type: 'string', description: '更新类型', required: true },
        { name: 'data', type: 'object', description: '要更新的数据', required: true }
      ],
      execute: async (params, context) => {
        this.updateTruthFiles(params.updateType, params.data, context);
        return { success: true, data: { updated: true } };
      }
    });

    this.tools.set('analyze_context', {
      name: 'analyze_context',
      description: '分析当前上下文并提供洞察',
      parameters: [
        { name: 'aspect', type: 'string', description: '分析方面: character/world/plot/style/emotion', required: true },
        { name: 'content', type: 'string', description: '要分析的内容', required: true }
      ],
      execute: async (params, context) => {
        const analysis = await this.analyzeContentAspect(params.aspect, params.content, context);
        return { success: true, data: analysis };
      }
    });

    this.tools.set('plan_next_steps', {
      name: 'plan_next_steps',
      description: '基于当前状态规划下一步行动',
      parameters: [
        { name: 'currentTask', type: 'string', description: '当前任务描述', required: true },
        { name: 'constraints', type: 'array', description: '约束条件', required: false }
      ],
      execute: async (params, context) => {
        const plan = await this.planNextActions(params.currentTask, params.constraints || [], context);
        return { success: true, data: plan };
      }
    });

    this.tools.set('broadcast_to_agents', {
      name: 'broadcast_to_agents',
      description: '向所有 Agent 广播消息',
      parameters: [
        { name: 'message', type: 'string', description: '广播内容', required: true },
        { name: 'excludeSelf', type: 'boolean', description: '是否排除自己', required: false, default: true }
      ],
      execute: async (params, context) => {
        this.broadcastMessage(context.currentChapter || 0, 'notification', params.message, params.excludeSelf !== false);
        return { success: true, data: { broadcasted: true } };
      }
    });

    this.tools.set('evaluate_options', {
      name: 'evaluate_options',
      description: '评估多个选项并给出推荐',
      parameters: [
        { name: 'options', type: 'array', description: '选项列表', required: true },
        { name: 'criteria', type: 'array', description: '评估标准', required: false }
      ],
      execute: async (params, context) => {
        const evaluation = await this.evaluateDecisionOptions(params.options, params.criteria || [], context);
        return { success: true, data: evaluation };
      }
    });
  }

  getAgent(type: AgentType): Agent | undefined {
    return this.agents.get(type);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentState(type: AgentType): AgentState | undefined {
    return this.agentStates.get(type);
  }

  getAgentMemory(type: AgentType): AgentMemory | undefined {
    return this.agentMemories.get(type);
  }

  private storeAgentMemory(
    agentType: AgentType | number,
    content: string,
    type: MemoryEntry['type'],
    importance: number,
    tags: string[]
  ): MemoryEntry {
    const agentTypeKey = typeof agentType === 'number' ? 'session' : agentType;
    const memory: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      content,
      type,
      timestamp: Date.now(),
      importance,
      source: 'self',
      tags
    };

    const memKey = typeof agentType === 'number' ? this.getCurrentAgentType() : agentType;
    if (memKey) {
      const agentMem = this.agentMemories.get(memKey);
      if (agentMem) {
        if (type === 'fact' || importance > 7) {
          agentMem.longTerm.push(memory);
        } else {
          agentMem.shortTerm.push(memory);
        }
        if (agentMem.shortTerm.length > 50) {
          const consolidated = this.consolidateShortTermMemory(agentMem.shortTerm);
          agentMem.longTerm.push(...consolidated);
          agentMem.shortTerm = [];
        }
      }
    }

    return memory;
  }

  private consolidateShortTermMemory(memories: MemoryEntry[]): MemoryEntry[] {
    const groups = new Map<string, MemoryEntry[]>();
    for (const mem of memories) {
      const key = mem.type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(mem);
    }

    const consolidated: MemoryEntry[] = [];
    for (const [type, group] of groups) {
      if (group.length > 1) {
        const summary: MemoryEntry = {
          id: `consolidated-${Date.now()}`,
          content: `[${type}] 汇总 ${group.length} 条记忆: ${group.slice(0, 3).map(m => m.content.slice(0, 50)).join('; ')}...`,
          type: 'observation',
          timestamp: Date.now(),
          importance: Math.max(...group.map(m => m.importance)),
          source: 'self',
          tags: ['consolidated', type]
        };
        consolidated.push(summary);
      } else if (group.length === 1 && group[0].importance >= 6) {
        consolidated.push(group[0]);
      }
    }
    return consolidated;
  }

  private searchAgentMemory(
    agentType: AgentType | number,
    query: string,
    memoryType?: string,
    limit: number = 5
  ): MemoryEntry[] {
    const memKey = typeof agentType === 'number' ? this.getCurrentAgentType() : agentType;
    if (!memKey) return [];

    const agentMem = this.agentMemories.get(memKey);
    if (!agentMem) return [];

    const allMemories = [...agentMem.shortTerm, ...agentMem.longTerm];
    const queryLower = query.toLowerCase();

    const scored = allMemories
      .filter(mem => {
        if (memoryType && mem.type !== memoryType) return false;
        return mem.content.toLowerCase().includes(queryLower) ||
               mem.tags.some(tag => tag.toLowerCase().includes(queryLower));
      })
      .map(mem => ({
        memory: mem,
        score: mem.importance + (mem.content.toLowerCase().includes(queryLower) ? 5 : 0)
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.memory);
  }

  private getCurrentAgentType(): AgentType | undefined {
    if (!this.currentAgent) {
      return undefined;
    }
    
    const agentTypeMap: Record<string, AgentType> = {
      'architect': 'architect',
      'writer': 'writer',
      'auditor': 'auditor',
      'revisionist': 'revisionist',
      'style_engineer': 'style_engineer',
      'radar': 'radar'
    };
    
    return agentTypeMap[this.currentAgent.type] || undefined;
  }

  private extractTruthInfo(truthFiles: TruthFiles, checkType: string): any {
    switch (checkType) {
      case 'protagonist':
        return truthFiles.currentState?.protagonist;
      case 'hooks':
        return truthFiles.pendingHooks;
      case 'resources':
        return truthFiles.particleLedger;
      case 'relationships':
        return truthFiles.characterMatrix;
      case 'summary':
        return truthFiles.chapterSummaries;
      default:
        return null;
    }
  }

  private updateTruthFiles(updateType: string, data: any, context: AgentContext): void {
    if (!context.truthFiles) return;

    switch (updateType) {
      case 'protagonist':
        if (context.truthFiles.currentState) {
          context.truthFiles.currentState.protagonist = { ...context.truthFiles.currentState.protagonist, ...data };
        }
        break;
      case 'add_hook':
        context.truthFiles.pendingHooks.push(data);
        break;
      case 'resolve_hook':
        const hookIndex = context.truthFiles.pendingHooks.findIndex((h: Hook) => h.id === data.id);
        if (hookIndex >= 0) {
          context.truthFiles.pendingHooks[hookIndex].status = 'paid_off';
        }
        break;
      case 'add_resource':
        context.truthFiles.particleLedger.push(data);
        break;
      case 'update_resource':
        const resourceIndex = context.truthFiles.particleLedger.findIndex((r: any) => r.id === data.id);
        if (resourceIndex >= 0) {
          context.truthFiles.particleLedger[resourceIndex] = { ...context.truthFiles.particleLedger[resourceIndex], ...data };
        }
        break;
      case 'add_summary':
        context.truthFiles.chapterSummaries.push(data);
        break;
    }
  }

  private async analyzeContentAspect(aspect: string, content: string, context: AgentContext): Promise<any> {
    const aspectPrompts: Record<string, string> = {
      character: '分析以下内容中角色的一致性、动机、性格特征：',
      world: '分析以下内容是否符合已建立的世界观设定：',
      plot: '分析以下内容的剧情逻辑、因果关系：',
      style: '分析以下内容的写作风格特点：',
      emotion: '分析以下内容的情感表达和氛围：'
    };

    const prompt = `${aspectPrompts[aspect] || '分析以下内容：'}

内容：${content.slice(0, 2000)}

请提供详细的分析结果，包括发现和洞察。`;

    const result = await this.llmManager.complete(prompt, { temperature: 0.5, maxTokens: 1000 });
    return { analysis: result, aspect };
  }

  private async planNextActions(currentTask: string, constraints: string[], context: AgentContext): Promise<any> {
    const memories = this.searchAgentMemory(context.currentChapter || 0, currentTask, undefined, 5);
    const memoryContext = memories.map(m => `- ${m.content}`).join('\n');

    const prompt = `当前任务：${currentTask}

约束条件：${constraints.length > 0 ? constraints.join(', ') : '无'}

相关记忆：
${memoryContext || '无相关记忆'}

当前项目信息：
- 章节：${context.currentChapter || '未指定'}
- 项目标题：${context.project?.title || '未指定'}

请基于以上信息，规划 3-5 个具体的下一步行动，每个行动包含：
1. 行动描述
2. 预期结果
3. 风险评估

以 JSON 格式输出。`;

    const result = await this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 1500 });
    
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return { steps: [{ action: currentTask, next: '继续执行当前任务' }] };
  }

  private async evaluateDecisionOptions(options: any[], criteria: string[], context: AgentContext): Promise<any> {
    const prompt = `请评估以下选项并给出推荐：

选项：
${options.map((opt: any, i: number) => `${i + 1}. ${typeof opt === 'string' ? opt : JSON.stringify(opt)}`).join('\n')}

评估标准：${criteria.length > 0 ? criteria.join(', ') : '效果、效率、风险'}

上下文：${context.project?.title || '无'}

请对每个选项进行评分（0-10），并说明推荐理由。以 JSON 格式输出：
{
  "recommended": 选项索引,
  "evaluations": [{ "option": 索引, "score": 分数, "reasoning": "理由" }]
}`;

    const result = await this.llmManager.complete(prompt, { temperature: 0.4, maxTokens: 1200 });

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return { recommended: 0, evaluations: options.map((_: any, i: number) => ({ option: i, score: 5 })) };
  }

  async think(
    agentType: AgentType,
    task: string,
    context: AgentContext,
    maxIterations: number = 3
  ): Promise<ThinkingStep[]> {
    const thinkingSteps: ThinkingStep[] = [];
    let currentContext = { ...context };
    let iteration = 0;

    while (iteration < maxIterations) {
      const step: ThinkingStep = { thought: '', reasoning: '' };

      const relevantMemories = this.searchAgentMemory(agentType, task, undefined, 3);
      const memoryContext = relevantMemories.map(m => `[${m.type}] ${m.content}`).join('\n');

      const prompt = `作为 ${this.agents.get(agentType)?.name} Agent，请分析以下任务：

任务：${task}

相关记忆：
${memoryContext || '无'}

请进行思考分析：
1. 这个任务的关键点是什么？
2. 需要考虑哪些因素？
3. 是否需要调用工具？如果需要，应该调用什么工具？
4. 预期的结果是什么？

请用 JSON 格式输出：
{
  "thought": "思考过程",
  "reasoning": "推理依据",
  "decision": "决策或行动建议",
  "toolCalls": [{"tool": "工具名", "params": {"参数"}}] // 如果需要工具调用
}`;

      const result = await this.llmManager.complete(prompt, { temperature: 0.5, maxTokens: 800 });

      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          step.thought = parsed.thought || '';
          step.reasoning = parsed.reasoning || '';
          step.decision = parsed.decision || '';

          if (parsed.toolCalls && Array.isArray(parsed.toolCalls)) {
            step.toolCalls = [];
            for (const call of parsed.toolCalls) {
              const toolResult = await this.executeTool(call.tool, call.params || {}, currentContext);
              step.toolCalls.push({ tool: call.tool, params: call.params || {}, result: toolResult });

              if (toolResult.success && toolResult.data) {
                this.storeAgentMemory(agentType, `${call.tool} 结果: ${JSON.stringify(toolResult.data).slice(0, 200)}`, 'observation', 6, [call.tool]);
              }
            }
          }

          this.storeAgentMemory(agentType, `${task}: ${step.decision}`, 'thought', 7, ['thinking', agentType]);
        }
      } catch (e) {
        step.thought = '思考过程解析失败';
        step.reasoning = result;
      }

      thinkingSteps.push(step);

      if (!step.decision?.toLowerCase().includes('继续') && !step.decision?.toLowerCase().includes('下一步')) {
        break;
      }

      iteration++;
    }

    return thinkingSteps;
  }

  private async executeTool(toolName: string, params: Record<string, any>, context: AgentContext): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool not found: ${toolName}` };
    }

    try {
      return await tool.execute(params, context);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async delegateToAgent(
    targetType: AgentType,
    task: string,
    taskContext: Record<string, any>,
    senderContext: AgentContext
  ): Promise<AgentResponse> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from: senderContext.currentChapter as unknown as AgentType || 'writer',
      to: targetType,
      type: 'request',
      content: { task, context: taskContext },
      timestamp: Date.now()
    };

    this.messageQueue.push(message);

    const targetState = this.agentStates.get(targetType);
    if (targetState) {
      targetState.status = 'waiting';
    }

    const context: AgentContext = {
      ...senderContext,
      currentChapter: senderContext.currentChapter || 0
    };

    let result: AgentResponse;

    switch (targetType) {
      case 'architect':
        result = await this.executeArchitectTaskWithAgent(taskContext.project || {}, task, taskContext.params);
        break;
      case 'writer':
        result = await this.executeWriterTaskWithAgent(taskContext.project, taskContext.chapterNumber, taskContext.options, context);
        break;
      case 'auditor':
        result = await this.executeAuditorTaskWithAgent(taskContext.content, taskContext.truthFiles, taskContext.options, context);
        break;
      case 'reviser':
        result = await this.executeReviserTaskWithAgent(taskContext.content, taskContext.issues, taskContext.truthFiles, context);
        break;
      case 'styleEngineer':
        result = await this.executeStyleEngineerTaskWithAgent(taskContext.content, taskContext.task, taskContext.styleSource, context);
        break;
      case 'radar':
        result = await this.executeRadarTaskWithAgent(taskContext.task, taskContext.params);
        break;
      default:
        result = { success: false, error: 'Unknown agent type', message: '未知 Agent 类型' };
    }

    const response: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from: targetType,
      to: message.from,
      type: 'response',
      content: result,
      timestamp: Date.now(),
      inReplyTo: message.id
    };

    this.messageQueue.push(response);

    if (targetState) {
      targetState.status = 'idle';
    }

    if (result.success) {
      this.storeAgentMemory(targetType, `完成任务: ${task}`, 'observation', 8, ['task_complete', targetType]);
    } else {
      this.storeAgentMemory(targetType, `任务失败: ${task} - ${result.error}`, 'observation', 9, ['task_failed', targetType]);
    }

    return result;
  }

  private broadcastMessage(agentType: AgentType | number, type: string, content: string, excludeSelf: boolean): void {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from: typeof agentType === 'number' ? 'writer' : agentType,
      to: 'broadcast',
      type: type as AgentMessage['type'],
      content,
      timestamp: Date.now()
    };

    this.messageQueue.push(message);

    for (const [type, state] of this.agentStates) {
      if (excludeSelf && type === agentType) continue;
      state.sharedMemories.push({
        id: message.id,
        content: `[广播] ${content}`,
        type: 'observation',
        timestamp: message.timestamp,
        importance: 5,
        source: 'other_agent',
        tags: ['broadcast']
      });
    }
  }

  getMessages(agentType?: AgentType): AgentMessage[] {
    if (agentType) {
      return this.messageQueue.filter(m => m.to === agentType || m.to === 'broadcast');
    }
    return [...this.messageQueue];
  }

  clearMessages(): void {
    this.messageQueue = [];
  }

  async reflect(agentType: AgentType, trigger: AgentReflection['trigger']): Promise<AgentReflection> {
    const memories = this.agentMemories.get(agentType);
    if (!memories) {
      return { id: '', timestamp: Date.now(), trigger, content: '', insights: [], adjustments: [] };
    }

    const recentMemories = [...memories.shortTerm, ...memories.longTerm]
      .filter(m => Date.now() - m.timestamp < 3600000)
      .slice(-10);

    const prompt = `作为 ${this.agents.get(agentType)?.name} Agent，请进行自我反思：

反思触发点：${trigger}

最近的记忆和观察：
${recentMemories.map(m => `- [${m.type}] ${m.content}`).join('\n')}

请进行深度反思：
1. 我从这个任务/情况中学到了什么？
2. 有什么需要调整的策略或方法？
3. 如何改进未来的表现？

以 JSON 格式输出：
{
  "insights": ["洞察1", "洞察2"],
  "adjustments": ["调整1", "调整2"]
}`;

    const result = await this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 1000 });

    let insights: string[] = [];
    let adjustments: string[] = [];

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || [];
        adjustments = parsed.adjustments || [];
      }
    } catch {
      insights = [result.slice(0, 200)];
    }

    const reflection: AgentReflection = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      trigger,
      content: result,
      insights,
      adjustments
    };

    const existing = this.reflections.get(agentType) || [];
    existing.push(reflection);
    this.reflections.set(agentType, existing.slice(-20));

    for (const insight of insights) {
      this.storeAgentMemory(agentType, insight, 'reflection', 8, ['reflection', 'learning']);
    }

    return reflection;
  }

  async executeArchitectTaskWithAgent(
    project: Partial<NovelProject>,
    task: string,
    params?: Record<string, any>
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'architect';
    this.agentStates.get(agentType)!.status = 'executing';

    try {
      const context: AgentContext = {
        project: project as NovelProject,
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles: params?.truthFiles || this.createEmptyTruthFiles(),
        sessionId: this.sessionId
      };

      const thinkingSteps = await this.think(agentType, task, context, 2);

      let result: any;
      const primaryDecision = thinkingSteps[thinkingSteps.length - 1]?.decision || task;

      if (primaryDecision.includes('世界观') || task.includes('world')) {
        result = await this.architectWorldBuilding(project, params);
      } else if (primaryDecision.includes('角色') || task.includes('character')) {
        result = await this.architectCharacterDesign(project, params);
      } else if (primaryDecision.includes('情节') || task.includes('plot')) {
        result = await this.architectPlotPlanning(project, params);
      } else {
        result = await this.architectOutlineGeneration(project, params);
      }

      this.storeAgentMemory(agentType, `架构任务完成: ${primaryDecision}`, 'fact', 9, ['architect', 'complete']);

      this.agentStates.get(agentType)!.status = 'idle';
      return {
        success: true,
        data: result,
        message: '架构师完成任务',
        reasoning: thinkingSteps.map(s => s.reasoning).join('; ')
      };
    } catch (error: any) {
      this.agentStates.get(agentType)!.status = 'idle';
      return { success: false, error: error.message, message: '架构师任务失败' };
    }
  }

  async executeWriterTaskWithAgent(
    project: NovelProject,
    chapterNumber: number,
    options?: any,
    context?: AgentContext
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'writer';
    const state = this.agentStates.get(agentType)!;
    state.status = 'executing';
    state.currentTask = `写作第${chapterNumber}章`;

    try {
      const agentContext: AgentContext = context || {
        project,
        currentChapter: chapterNumber,
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles: project.truthFiles || this.createEmptyTruthFiles(),
        sessionId: this.sessionId
      };

      const relevantFacts = this.searchAgentMemory(agentType, 'character world plot', 'fact', 5);
      const recentWork = this.searchAgentMemory(agentType, 'chapter writing content', 'observation', 3);

      const thinkingSteps = await this.think(
        agentType,
        `为小说项目 ${project.title} 写作第 ${chapterNumber} 章`,
        agentContext
      );

      const prompt = this.buildWriterPrompt(project, chapterNumber, options, {
        relevantFacts,
        recentWork,
        thinking: thinkingSteps[thinkingSteps.length - 1]?.decision
      });

      const content = await this.llmManager.complete(prompt, { temperature: 0.75, maxTokens: 3000 });

      this.storeAgentMemory(agentType, `完成第${chapterNumber}章初稿，字数约${this.countWords(content)}`, 'observation', 9, ['chapter', 'draft']);

      this.updateTruthFiles('add_summary', {
        chapterId: `chapter-${chapterNumber}`,
        chapterNumber,
        title: `第${chapterNumber}章`,
        charactersPresent: [],
        keyEvents: [],
        stateChanges: [],
        newHooks: [],
        resolvedHooks: []
      }, agentContext);

      state.status = 'idle';
      state.currentTask = undefined;

      return {
        success: true,
        data: content,
        message: `写作者生成第${chapterNumber}章`,
        reasoning: thinkingSteps.map(s => s.reasoning).join('; ')
      };
    } catch (error: any) {
      state.status = 'idle';
      return { success: false, error: error.message, message: '写作者写作失败' };
    }
  }

  async executeAuditorTaskWithAgent(
    content: string,
    truthFiles: TruthFiles,
    options?: { autoFix?: boolean },
    context?: AgentContext
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'auditor';
    this.agentStates.get(agentType)!.status = 'executing';

    try {
      const agentContext: AgentContext = context || {
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles,
        sessionId: this.sessionId
      };

      const result = await this.auditEngine.audit(content, truthFiles);

      if (result.issues.length > 0) {
        for (const issue of result.issues) {
          this.storeAgentMemory(agentType, `发现质量问题: ${issue.type} - ${issue.description}`, 'observation', issue.severity === 'critical' ? 9 : 6, ['audit', 'issue']);
        }
      }

      this.storeAgentMemory(agentType, `审计完成: ${result.passed ? '通过' : '发现问题'}`, 'fact', 8, ['audit']);

      if (options?.autoFix && !result.passed) {
        const fixes = await this.generateFixes(result);

        this.storeAgentMemory(agentType, `生成 ${fixes.length} 个修复建议`, 'plan', 7, ['fix']);

        return {
          success: true,
          data: { auditResult: result, fixes },
          message: '审计员完成审计并生成修复建议',
          reasoning: `发现 ${result.issues.length} 个问题，${result.passed ? '通过' : '需要修复'}`
        };
      }

      this.agentStates.get(agentType)!.status = 'idle';
      return { success: true, data: result, message: '审计员完成审计' };
    } catch (error: any) {
      this.agentStates.get(agentType)!.status = 'idle';
      return { success: false, error: error.message, message: '审计员审计失败' };
    }
  }

  async executeReviserTaskWithAgent(
    content: string,
    issues: any[],
    truthFiles: TruthFiles,
    context?: AgentContext
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'reviser';
    this.agentStates.get(agentType)!.status = 'executing';

    try {
      const agentContext: AgentContext = context || {
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles,
        sessionId: this.sessionId
      };

      const prompt = this.buildReviserPromptWithAgent(content, issues, truthFiles, agentContext);
      const revised = await this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 3000 });

      this.storeAgentMemory(agentType, `修订完成，修复 ${issues.length} 个问题`, 'observation', 8, ['revision']);

      this.agentStates.get(agentType)!.status = 'idle';
      return { success: true, data: revised, message: '修订师完成修订' };
    } catch (error: any) {
      this.agentStates.get(agentType)!.status = 'idle';
      return { success: false, error: error.message, message: '修订师修订失败' };
    }
  }

  async executeStyleEngineerTaskWithAgent(
    content: string,
    task: 'extract_style' | 'apply_style' | 'humanize',
    styleSource?: string,
    context?: AgentContext
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'styleEngineer';
    this.agentStates.get(agentType)!.status = 'executing';

    try {
      const agentContext: AgentContext = context || {
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles: this.createEmptyTruthFiles(),
        sessionId: this.sessionId
      };

      let result: any;

      switch (task) {
        case 'extract_style':
          result = await this.extractStyle(content);
          this.storeAgentMemory(agentType, `提取风格特征`, 'fact', 7, ['style']);
          break;
        case 'apply_style':
          result = await this.applyStyle(content, styleSource!);
          this.storeAgentMemory(agentType, `应用风格转换`, 'observation', 7, ['style']);
          break;
        case 'humanize':
          result = await this.humanizeContent(content);
          this.storeAgentMemory(agentType, `去AI味处理`, 'observation', 8, ['humanize']);
          break;
      }

      this.agentStates.get(agentType)!.status = 'idle';
      return { success: true, data: result, message: '风格工程师完成风格任务' };
    } catch (error: any) {
      this.agentStates.get(agentType)!.status = 'idle';
      return { success: false, error: error.message, message: '风格工程师风格处理失败' };
    }
  }

  async executeRadarTaskWithAgent(
    task: 'trend_analysis' | 'performance_review' | 'risk_alert',
    params?: Record<string, any>
  ): Promise<AgentResponse> {
    const agentType: AgentType = 'radar';
    this.agentStates.get(agentType)!.status = 'executing';

    try {
      const agentContext: AgentContext = {
        memories: this.agentMemories.get(agentType)!,
        otherAgents: this.agentStates,
        truthFiles: this.createEmptyTruthFiles(),
        sessionId: this.sessionId
      };

      const thinking = await this.think(agentType, `${task} - ${JSON.stringify(params)}`, agentContext, 2);

      let result: any;

      switch (task) {
        case 'trend_analysis':
          result = await this.analyzeTrends(params);
          break;
        case 'performance_review':
          result = await this.reviewPerformance(params);
          break;
        case 'risk_alert':
          result = await this.checkRiskAlert(params);
          break;
      }

      this.storeAgentMemory(agentType, `雷达任务完成: ${task}`, 'observation', 7, ['radar']);

      this.agentStates.get(agentType)!.status = 'idle';
      return {
        success: true,
        data: result,
        message: '雷达完成分析',
        reasoning: thinking.map(t => t.reasoning).join('; ')
      };
    } catch (error: any) {
      this.agentStates.get(agentType)!.status = 'idle';
      return { success: false, error: error.message, message: '雷达分析失败' };
    }
  }

  async executeArchitectTask(
    project: Partial<NovelProject>,
    task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation',
    params?: Record<string, any>
  ): Promise<AgentResponse> {
    return this.executeArchitectTaskWithAgent(project, task, params);
  }

  async executeWriterTask(
    project: NovelProject,
    chapterNumber: number,
    options?: { outline?: string; guidance?: string }
  ): Promise<AgentResponse> {
    return this.executeWriterTaskWithAgent(project, chapterNumber, options);
  }

  async executeAuditorTask(
    content: string,
    truthFiles: TruthFiles,
    options?: { autoFix?: boolean }
  ): Promise<AgentResponse> {
    return this.executeAuditorTaskWithAgent(content, truthFiles, options);
  }

  async executeReviserTask(
    content: string,
    issues: any[],
    truthFiles: TruthFiles
  ): Promise<AgentResponse> {
    return this.executeReviserTaskWithAgent(content, issues, truthFiles);
  }

  async executeStyleEngineerTask(
    content: string,
    task: 'extract_style' | 'apply_style' | 'humanize',
    styleSource?: string
  ): Promise<AgentResponse> {
    return this.executeStyleEngineerTaskWithAgent(content, task, styleSource);
  }

  async executeRadarTask(
    task: 'trend_analysis' | 'performance_review' | 'risk_alert',
    params?: Record<string, any>
  ): Promise<AgentResponse> {
    return this.executeRadarTaskWithAgent(task, params);
  }

  private createEmptyTruthFiles(): TruthFiles {
    return {
      currentState: {
        protagonist: { id: 'main', name: '主角', location: '起点', status: '初始' },
        knownFacts: [],
        currentConflicts: [],
        relationshipSnapshot: {},
        activeSubplots: []
      },
      particleLedger: [],
      pendingHooks: [],
      chapterSummaries: [],
      subplotBoard: [],
      emotionalArcs: [],
      characterMatrix: []
    };
  }

  private async architectWorldBuilding(project: Partial<NovelProject>, params?: Record<string, any>): Promise<any> {
    const relevantMemories = this.searchAgentMemory('architect', 'world setting power system', 'fact', 3);
    const contextNote = relevantMemories.length > 0 ? `相关已建立设定：\n${relevantMemories.map(m => m.content).join('\n')}\n` : '';

    const prompt = `为一部${project.genre || '玄幻'}题材小说构建完整的世界观。

${contextNote}
要求包含：
1. 世界背景和历史
2. 力量/修炼体系
3. 主要地理区域
4. 重要势力/组织
5. 社会规则和文化
6. 世界观逻辑自洽性

请详细描述每个方面。`;

    return this.llmManager.complete(prompt, { temperature: 0.7, maxTokens: 2000 });
  }

  private async architectCharacterDesign(project: Partial<NovelProject>, params?: Record<string, any>): Promise<any> {
    const worldContext = params?.worldSetting || '';

    const prompt = `基于以下世界观，为小说设计主要角色：

世界观：${worldContext}

要求为以下角色类型提供详细设定：
1. 主角：详细的背景、性格、目标、能力
2. 主要配角：至少3个有深度的配角
3. 反派/对手：与主角对立的力量
4. 辅助角色：提供信息和帮助的角色

每个角色需要包含：外貌、性格、背景、动机、关系网。`;

    return this.llmManager.complete(prompt, { temperature: 0.7, maxTokens: 2000 });
  }

  private async architectPlotPlanning(project: Partial<NovelProject>, params?: Record<string, any>): Promise<any> {
    const characterContext = params?.characters || '';

    const prompt = `基于以下角色设定，规划小说的主要情节线：

角色：${characterContext}

要求：
1. 主线情节：从开头到高潮到结尾
2. 支线情节：至少2条与主线交织的支线
3. 关键情节点：至少10个推动故事发展的关键事件
4. 伏笔埋设：至少5个需要回收的伏笔
5. 高潮设计：全剧最高潮的场景

请详细描述每个情节点。`;

    return this.llmManager.complete(prompt, { temperature: 0.75, maxTokens: 3000 });
  }

  private async architectOutlineGeneration(project: Partial<NovelProject>, params?: Record<string, any>): Promise<any> {
    const plotContext = params?.plot || '';

    const prompt = `基于以下情节规划，生成${params?.chapterCount || 50}章的详细大纲：

情节：${plotContext}

每章大纲需要包含：
1. 章节标题
2. 章节摘要（150字以内）
3. 主要事件
4. 章节结尾的钩子
5. 与前后章节的关联

请确保节奏感：前期铺垫、中期发展、后期高潮。`;

    return this.llmManager.complete(prompt, { temperature: 0.7, maxTokens: 3000 });
  }

  private buildWriterPrompt(
    project: NovelProject,
    chapterNumber: number,
    options?: any,
    agentContext?: { relevantFacts: MemoryEntry[]; recentWork: MemoryEntry[]; thinking?: string }
  ): string {
    const previousChapter = project.chapters?.[chapterNumber - 2];
    const outline = options?.outline || project.chapters?.[chapterNumber - 1]?.outline;
    const guidance = options?.guidance || '';

    const factsContext = agentContext?.relevantFacts?.length
      ? `\n【重要事实】（必须保持一致）：\n${agentContext.relevantFacts.map(f => `- ${f.content}`).join('\n')}\n`
      : '';

    const recentContext = agentContext?.recentWork?.length
      ? `\n【最近的写作】（可参考风格）：\n${agentContext.recentWork.map(w => `- ${w.content}`).join('\n')}\n`
      : '';

    const thinkingContext = agentContext?.thinking
      ? `\n【写作思路】：${agentContext.thinking}\n`
      : '';

    return `作为小说写作者，请根据以下信息生成第${chapterNumber}章内容。

题材：${project.genre}
世界观：${project.worldSetting?.powerSystem || '无特殊力量体系'}
主角设定：${project.characters?.[0]?.name || '待设定'}
${factsContext}
${recentContext}
${thinkingContext}
上一章摘要：${previousChapter?.summary || '无'}

本章大纲：${outline || '待补充'}

写作指导：${guidance}

写作要求：
1. 严格遵循章节大纲
2. 保持角色性格一致性
3. 推进情节发展
4. 控制章节字数在2000-3000字
5. 结尾留下吸引读者的钩子
6. 避免AI写作痕迹

请开始写作：`;
  }

  private buildReviserPromptWithAgent(content: string, issues: any[], truthFiles: TruthFiles, context: AgentContext): string {
    const criticalIssues = issues.filter((i: any) => i.severity === 'critical');
    const warnings = issues.filter((i: any) => i.severity === 'warning');

    return `请根据以下问题修订章节内容，注意保持与已建立世界观和角色设定的一致性。

【必须修复的问题】（严重）：
${criticalIssues.map((i: any, idx: number) => `${idx + 1}. [${i.type}] ${i.description} - 建议：${i.suggestion || '请自行修复'}`).join('\n')}

【建议优化的问题】：
${warnings.map((i: any, idx: number) => `${idx + 1}. [${i.type}] ${i.description}`).join('\n')}

【已建立的角色设定参考】：
${truthFiles.currentState?.protagonist ? `- 主角：${truthFiles.currentState.protagonist.name}，当前状态：${truthFiles.currentState.protagonist.status}` : ''}

【待回收的伏笔】：
${truthFiles.pendingHooks?.length ? truthFiles.pendingHooks.map((h: any) => `- ${h.description}`).join('\n') : '无'}

当前章节：
${content}

请在保持原文优点的基础上，修复以上问题，输出修订后的完整章节。`;
  }

  private async extractStyle(content: string): Promise<any> {
    const prompt = `分析以下文本的写作风格特征：

${content.slice(0, 5000)}

请提取以下风格特征：
1. 句子长度分布
2. 常用词汇和短语
3. 标点符号使用习惯
4. 对话占比
5. 描写密度
6. 叙事视角
7. 时态
8. 情感词汇使用
9. 标志性表达

请用JSON格式输出。`;

    const result = await this.llmManager.complete(prompt, { temperature: 0.3, maxTokens: 2000 });

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return { raw: result };
  }

  private async applyStyle(content: string, styleSource: string): Promise<string> {
    const stylePrompt = `请将以下内容的风格调整为与参考文本相似：

原文：
${content}

参考风格：
${styleSource}

调整要求：
1. 保持原意不变
2. 调整句式结构
3. 变化用词
4. 保持适当的描写密度

请输出调整后的完整内容：`;

    return this.llmManager.complete(stylePrompt, { temperature: 0.6, maxTokens: 3000 });
  }

  private async humanizeContent(content: string): Promise<string> {
    const humanizePrompt = `请对以下内容进行"去AI味"处理，使其更有人情味：

原文：
${content}

处理方法：
1. 变化句子长度
2. 加入口语化表达
3. 增加情感色彩
4. 减少完美措辞
5. 加入轻微不规则性

请输出处理后的完整内容：`;

    return this.llmManager.complete(humanizePrompt, { temperature: 0.8, maxTokens: 3000 });
  }

  private async analyzeTrends(params?: Record<string, any>): Promise<any> {
    const prompt = `分析当前网络小说市场趋势，包括：

1. 热门题材和元素
2. 读者偏好变化
3. 成功案例分析
4. 市场机会

目标题材：${params?.genre || '玄幻'}
平台：${params?.platform || '通用'}

请提供详细的趋势报告和建议。`;

    return this.llmManager.complete(prompt, { temperature: 0.7, maxTokens: 2000 });
  }

  private async reviewPerformance(params?: Record<string, any>): Promise<any> {
    const chapters = params?.chapters || [];

    const prompt = `请分析以下章节的表现：

章节列表：
${chapters.map((c: any, i: number) => `${i + 1}. 第${c.number}章 "${c.title}" - 字数${c.wordCount}`).join('\n')}

请分析：
1. 节奏是否合理
2. 是否有重复内容
3. 角色出场是否均衡
4. 情节推进是否顺畅
5. 钩子设置是否有效

请提供改进建议。`;

    return this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 2000 });
  }

  private async checkRiskAlert(params?: Record<string, any>): Promise<any> {
    const prompt = `请检查以下内容的潜在风险：

项目：${params?.title || '待分析'}
题材：${params?.genre || '玄幻'}
已有章节数：${params?.chapterCount || 0}

风险类型：
1. 敏感内容风险
2. 抄袭风险
3. 逻辑漏洞
4. 角色塑造问题
5. 市场风险

请提供风险评估报告。`;

    return this.llmManager.complete(prompt, { temperature: 0.5, maxTokens: 2000 });
  }

  private async generateFixes(auditResult: any): Promise<string[]> {
    if (!auditResult.issues) return [];
    return auditResult.issues.map((issue: any) => issue.suggestion || '');
  }

  private countWords(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  async executeParallelTasks(tasks: AgentTask[]): Promise<AgentResponse[]> {
    const results: AgentResponse[] = [];

    const promises = tasks.map(async (task) => {
      const taskId = this.createTask(task);
      try {
        let result: any;

        switch (task.type) {
          case 'architect':
            result = await this.executeArchitectTask(task.context.project, task.context.task as any);
            break;
          case 'writer':
            result = await this.executeWriterTask(task.context.project, task.context.chapterNumber);
            break;
          case 'auditor':
            result = await this.executeAuditorTask(task.context.content, task.context.truthFiles);
            break;
          case 'reviser':
            result = await this.executeReviserTask(task.context.content, task.context.issues, task.context.truthFiles);
            break;
          case 'styleEngineer':
            result = await this.executeStyleEngineerTask(task.context.content, task.context.task as any);
            break;
          case 'radar':
            result = await this.executeRadarTask(task.context.task as any);
            break;
        }

        this.updateTaskStatus(taskId, 'completed', result);
        return result;
      } catch (error: any) {
        this.updateTaskStatus(taskId, 'failed', undefined, error.message);
        return { success: false, error: error.message, message: `任务 ${taskId} 失败` };
      }
    });

    return Promise.all(promises);
  }

  private createTask(task: AgentTask): string {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.tasks.set(id, { ...task, id, status: 'pending', createdAt: new Date() });
    return id;
  }

  private updateTaskStatus(taskId: string, status: AgentTask['status'], result?: any, error?: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.result = result;
      task.error = error;
      if (status === 'completed' || status === 'failed') {
        task.completedAt = new Date();
      }
    }
  }

  getTaskStatus(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  async executePipeline(
    project: NovelProject,
    chapterNumber: number
  ): Promise<{ chapter?: Chapter; issues?: any[] }> {
    const outline = project.chapters?.[chapterNumber - 1]?.outline;

    const writerResult = await this.executeWriterTask(project, chapterNumber, { outline });
    if (!writerResult.success) {
      throw new Error(writerResult.error);
    }

    const auditorResult = await this.executeAuditorTask(
      writerResult.data,
      project.truthFiles || {} as TruthFiles,
      { autoFix: true }
    );

    if (auditorResult.success && auditorResult.data.issues?.length > 0) {
      const reviserResult = await this.executeReviserTask(
        writerResult.data,
        auditorResult.data.issues,
        project.truthFiles || {} as TruthFiles
      );

      if (reviserResult.success) {
        return {
          chapter: {
            id: '',
            number: chapterNumber,
            title: `第${chapterNumber}章`,
            status: 'draft',
            wordCount: this.countWords(reviserResult.data),
            content: reviserResult.data
          },
          issues: auditorResult.data.auditResult?.issues
        };
      }
    }

    return {
      chapter: {
        id: '',
        number: chapterNumber,
        title: `第${chapterNumber}章`,
        status: 'draft',
        wordCount: this.countWords(writerResult.data),
        content: writerResult.data
      }
    };
  }

  async executeChaptersBatch(
    project: NovelProject,
    startChapter: number,
    endChapter: number,
    parallelCount: number = 3
  ): Promise<{ chapters: Chapter[]; allResults: AgentResponse[] }> {
    const chapters: Chapter[] = [];
    const allResults: AgentResponse[] = [];

    for (let i = startChapter; i <= endChapter; i += parallelCount) {
      const batchTasks: AgentTask[] = [];

      for (let j = i; j < Math.min(i + parallelCount, endChapter + 1); j++) {
        batchTasks.push({
          id: '',
          type: 'writer',
          description: `生成第${j}章`,
          context: { project, chapterNumber: j },
          status: 'pending',
          createdAt: new Date()
        });
      }

      const batchResults = await this.executeParallelTasks(batchTasks);
      allResults.push(...batchResults);

      for (const result of batchResults) {
        if (result.success && result.data) {
          chapters.push({
            id: `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            number: chapters.length + startChapter,
            title: `第${chapters.length + startChapter}章`,
            status: 'draft',
            wordCount: this.countWords(result.data),
            content: result.data
          });
        }
      }
    }

    return { chapters, allResults };
  }

  async executeFullPipeline(
    project: NovelProject,
    chapterCount: number,
    onProgress?: (agent: string, status: string, progress: number) => void
  ): Promise<{ chapters: Chapter[]; truthFiles: TruthFiles }> {
    const truthFiles: TruthFiles = {
      currentState: {
        protagonist: {
          id: project.characters?.[0]?.id || 'main',
          name: project.characters?.[0]?.name || '主角',
          location: '起点',
          status: '初始'
        },
        knownFacts: [],
        currentConflicts: [],
        relationshipSnapshot: {},
        activeSubplots: []
      },
      particleLedger: [],
      pendingHooks: [],
      chapterSummaries: [],
      subplotBoard: [],
      emotionalArcs: [],
      characterMatrix: []
    };

    onProgress?.('架构师', '初始化', 0);

    const architectResult = await this.executeArchitectTask(project, 'outline_generation', {
      chapterCount
    });

    if (!architectResult.success) {
      throw new Error('架构师规划失败');
    }

    onProgress?.('架构师', '完成', 100);
    onProgress?.('写作者', '开始写作', 0);

    const { chapters: generatedChapters } = await this.executeChaptersBatch(
      project,
      1,
      chapterCount,
      2
    );

    onProgress?.('写作者', '完成', 100);
    onProgress?.('审计员', '开始审计', 0);

    for (let i = 0; i < generatedChapters.length; i++) {
      const chapter = generatedChapters[i];

      const auditResult = await this.executeAuditorTask(
        chapter.content || '',
        truthFiles,
        { autoFix: true }
      );

      if (auditResult.success && auditResult.data?.fixes?.length > 0) {
        const reviserResult = await this.executeReviserTask(
          chapter.content || '',
          auditResult.data.issues,
          truthFiles
        );

        if (reviserResult.success) {
          chapter.content = reviserResult.data;
          chapter.status = 'draft';
        }
      }

      onProgress?.('审计员', `审计第${i + 1}章`, ((i + 1) / chapterCount) * 100);

      truthFiles.chapterSummaries.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        title: chapter.title,
        charactersPresent: [],
        keyEvents: [],
        stateChanges: [],
        newHooks: [],
        resolvedHooks: []
      });
    }

    onProgress?.('审计员', '完成', 100);

    await this.reflect('architect', 'milestone');
    await this.reflect('writer', 'milestone');
    await this.reflect('auditor', 'milestone');

    return { chapters: generatedChapters, truthFiles };
  }

  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  getAgentReflections(agentType: AgentType): AgentReflection[] {
    return this.reflections.get(agentType) || [];
  }

  resetSession(): void {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.messageQueue = [];

    for (const [type, memory] of this.agentMemories) {
      memory.shortTerm = [];
      memory.working = {
        subGoals: [],
        recentObservations: [],
        decisions: []
      };
    }
  }
}

export default AgentSystem;
