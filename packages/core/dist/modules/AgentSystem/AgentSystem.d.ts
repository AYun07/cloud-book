/**
 * Cloud Book - Agent系统
 * 6类AI智能体：架构师、写手、审计员、修订员、文风工程师、雷达
 */
import { NovelProject, TruthFiles, Chapter, AuditResult } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
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
export declare abstract class BaseAgent {
    protected llmManager: LLMManager;
    protected state: AgentState;
    protected messageInbox: AgentMessage[];
    protected messageOutbox: AgentMessage[];
    constructor(llmManager: LLMManager);
    getAgentName(): string;
    getState(): AgentState;
    sendMessage(toAgent: string, content: string, type?: AgentMessage['type'], metadata?: Record<string, any>): AgentMessage;
    receiveMessage(message: AgentMessage): void;
    addTask(task: Omit<AgentTask, 'id' | 'createdAt'>): string;
    abstract executeTask(task: AgentTask): Promise<any>;
}
export declare class ArchitectAgent extends BaseAgent {
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performArchitectureTask;
    analyzeMarket(project: NovelProject): Promise<any>;
    generateDirection(project: NovelProject): Promise<any>;
    planNovelStructure(project: NovelProject): Promise<any>;
}
export declare class WriterAgent extends BaseAgent {
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performWritingTask;
    writeChapter(data: {
        project: NovelProject;
        chapterNumber: number;
        truthFiles: TruthFiles;
    }): Promise<any>;
    continueStory(data: any): Promise<any>;
    writeScene(data: any): Promise<any>;
}
export declare class AuditorAgent extends BaseAgent {
    private auditEngine;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine);
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performAuditTask;
    auditChapter(data: {
        chapter: Chapter;
        truthFiles: TruthFiles;
    }): Promise<AuditResult>;
    auditConsistency(data: any): Promise<any>;
    generateQualityReport(data: any): Promise<any>;
}
export declare class ReviserAgent extends BaseAgent {
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performRevisionTask;
    reviseChapter(data: any): Promise<any>;
    fixIssues(data: any): Promise<any>;
    enhanceProse(data: any): Promise<any>;
}
export declare class StyleEngineerAgent extends BaseAgent {
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performStyleTask;
    analyzeStyle(data: any): Promise<any>;
    transferStyle(data: any): Promise<any>;
    optimizeProse(data: any): Promise<any>;
}
export declare class RadarAgent extends BaseAgent {
    getAgentName(): string;
    executeTask(task: AgentTask): Promise<any>;
    private performRadarTask;
    monitorTrends(data: any): Promise<any>;
    trackConsistency(data: any): Promise<any>;
    detectRisk(data: any): Promise<any>;
}
export declare class AgentCoordinator {
    private agents;
    private messageQueue;
    private llmManager;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine);
    getAgent(name: string): BaseAgent | undefined;
    getAllAgents(): BaseAgent[];
    orchestrateNovelCreation(project: NovelProject, truthFiles: TruthFiles): Promise<any>;
}
export declare class AgentSystem {
    private coordinator;
    private llmManager;
    private auditEngine;
    constructor(llmManager: LLMManager, auditEngine: AIAuditEngine);
    getCoordinator(): AgentCoordinator;
    getAllAgents(): BaseAgent[];
    getArchitectAgent(): ArchitectAgent;
    getWriterAgent(): WriterAgent;
    getAuditorAgent(): AuditorAgent;
    getReviserAgent(): ReviserAgent;
    getStyleEngineerAgent(): StyleEngineerAgent;
    getRadarAgent(): RadarAgent;
    executeArchitectTask(project: NovelProject, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>): Promise<any>;
    executeWriterTask(project: NovelProject, chapterNumber: number, options?: {
        outline?: string;
        guidance?: string;
    }): Promise<any>;
    executeAuditorTask(content: string, truthFiles: TruthFiles, options?: {
        autoFix?: boolean;
    }): Promise<any>;
    executePipeline(project: NovelProject, chapterNumber: number): Promise<any>;
}
export interface AgentResponse {
    success: boolean;
    data?: any;
    error?: string;
    agent: string;
    timestamp: Date;
}
//# sourceMappingURL=AgentSystem.d.ts.map