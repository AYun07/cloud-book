/**
 * Cloud Book - 真正的 Agent 智能体系统 V2
 * 实现：工具调用、记忆管理、多 Agent 通信、自主决策
 */
import { Agent, AgentType, NovelProject, Chapter, TruthFiles } from '../../types';
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
export declare class AgentSystem {
    private agents;
    private agentStates;
    private tasks;
    private llmManager;
    private auditEngine;
    private tools;
    private messageQueue;
    private agentMemories;
    private reflections;
    private sessionId;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine);
    private initializeAgents;
    private registerTools;
    getAgent(type: AgentType): Agent | undefined;
    getAllAgents(): Agent[];
    getAgentState(type: AgentType): AgentState | undefined;
    getAgentMemory(type: AgentType): AgentMemory | undefined;
    private storeAgentMemory;
    private consolidateShortTermMemory;
    private searchAgentMemory;
    private getCurrentAgentType;
    private extractTruthInfo;
    private updateTruthFiles;
    private analyzeContentAspect;
    private planNextActions;
    private evaluateDecisionOptions;
    think(agentType: AgentType, task: string, context: AgentContext, maxIterations?: number): Promise<ThinkingStep[]>;
    private executeTool;
    delegateToAgent(targetType: AgentType, task: string, taskContext: Record<string, any>, senderContext: AgentContext): Promise<AgentResponse>;
    private broadcastMessage;
    getMessages(agentType?: AgentType): AgentMessage[];
    clearMessages(): void;
    reflect(agentType: AgentType, trigger: AgentReflection['trigger']): Promise<AgentReflection>;
    executeArchitectTaskWithAgent(project: Partial<NovelProject>, task: string, params?: Record<string, any>): Promise<AgentResponse>;
    executeWriterTaskWithAgent(project: NovelProject, chapterNumber: number, options?: any, context?: AgentContext): Promise<AgentResponse>;
    executeAuditorTaskWithAgent(content: string, truthFiles: TruthFiles, options?: {
        autoFix?: boolean;
    }, context?: AgentContext): Promise<AgentResponse>;
    executeReviserTaskWithAgent(content: string, issues: any[], truthFiles: TruthFiles, context?: AgentContext): Promise<AgentResponse>;
    executeStyleEngineerTaskWithAgent(content: string, task: 'extract_style' | 'apply_style' | 'humanize', styleSource?: string, context?: AgentContext): Promise<AgentResponse>;
    executeRadarTaskWithAgent(task: 'trend_analysis' | 'performance_review' | 'risk_alert', params?: Record<string, any>): Promise<AgentResponse>;
    executeArchitectTask(project: Partial<NovelProject>, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>): Promise<AgentResponse>;
    executeWriterTask(project: NovelProject, chapterNumber: number, options?: {
        outline?: string;
        guidance?: string;
    }): Promise<AgentResponse>;
    executeAuditorTask(content: string, truthFiles: TruthFiles, options?: {
        autoFix?: boolean;
    }): Promise<AgentResponse>;
    executeReviserTask(content: string, issues: any[], truthFiles: TruthFiles): Promise<AgentResponse>;
    executeStyleEngineerTask(content: string, task: 'extract_style' | 'apply_style' | 'humanize', styleSource?: string): Promise<AgentResponse>;
    executeRadarTask(task: 'trend_analysis' | 'performance_review' | 'risk_alert', params?: Record<string, any>): Promise<AgentResponse>;
    private createEmptyTruthFiles;
    private architectWorldBuilding;
    private architectCharacterDesign;
    private architectPlotPlanning;
    private architectOutlineGeneration;
    private buildWriterPrompt;
    private buildReviserPromptWithAgent;
    private extractStyle;
    private applyStyle;
    private humanizeContent;
    private analyzeTrends;
    private reviewPerformance;
    private checkRiskAlert;
    private generateFixes;
    private countWords;
    executeParallelTasks(tasks: AgentTask[]): Promise<AgentResponse[]>;
    private createTask;
    private updateTaskStatus;
    getTaskStatus(taskId: string): AgentTask | undefined;
    getAllTasks(): AgentTask[];
    executePipeline(project: NovelProject, chapterNumber: number): Promise<{
        chapter?: Chapter;
        issues?: any[];
    }>;
    executeChaptersBatch(project: NovelProject, startChapter: number, endChapter: number, parallelCount?: number): Promise<{
        chapters: Chapter[];
        allResults: AgentResponse[];
    }>;
    executeFullPipeline(project: NovelProject, chapterCount: number, onProgress?: (agent: string, status: string, progress: number) => void): Promise<{
        chapters: Chapter[];
        truthFiles: TruthFiles;
    }>;
    getAvailableTools(): string[];
    getAgentReflections(agentType: AgentType): AgentReflection[];
    resetSession(): void;
}
export default AgentSystem;
//# sourceMappingURL=AgentSystem.d.ts.map