/**
 * Cloud Book - Agent系统 V2
 * 双模式架构：在线模式 + 离线模式
 */
import { NovelProject, TruthFiles, Chapter, AuditResult } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
import { AIAuditEngine } from '../AIAudit/AIAuditEngine';
export type AgentMode = 'online' | 'offline';
export interface AgentConfig {
    mode: AgentMode;
    llmManager?: LLMManager;
    auditEngine?: AIAuditEngine;
    enableFallbacks?: boolean;
    maxTokenBudget?: number;
    tokenThreshold?: number;
    enableTokenSaving?: boolean;
}
export interface TokenUsage {
    agentName: string;
    taskType: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    timestamp: Date;
    cost: number;
}
export interface CostControlConfig {
    maxConcurrentTasks: number;
    maxDailyTokens: number;
    maxTokenPerTask: number;
    enableCaching: boolean;
    cacheExpiryMinutes: number;
}
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
    mode: AgentMode;
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
export interface AgentCapability {
    name: string;
    supported: boolean;
    requiresOnline: boolean;
    description: string;
}
export declare abstract class BaseAgent {
    protected llmManager?: LLMManager;
    protected auditEngine?: AIAuditEngine;
    protected state: AgentState;
    protected messageInbox: AgentMessage[];
    protected messageOutbox: AgentMessage[];
    protected mode: AgentMode;
    protected tokenUsages: TokenUsage[];
    protected maxTokenBudget: number;
    protected tokenThreshold: number;
    protected enableTokenSaving: boolean;
    protected responseCache: Map<string, {
        result: any;
        timestamp: Date;
    }>;
    protected static CACHE_EXPIRY_MS: number;
    protected static maxConcurrentTasks: number;
    protected static currentConcurrentTasks: number;
    constructor(config: AgentConfig);
    protected getTotalTokensUsed(): number;
    protected shouldLimitTokenUsage(): boolean;
    protected cacheKey(taskType: string, data: any): string;
    protected getCachedResult(taskType: string, data: any): any | null;
    protected setCachedResult(taskType: string, data: any, result: any): void;
    protected trackTokenUsage(taskType: string, inputTokens: number, outputTokens: number, cost?: number): void;
    protected truncateContent(content: string, maxLength?: number): string;
    protected optimizePrompt(prompt: string): string;
    protected acquireTaskSlot(): Promise<void>;
    protected releaseTaskSlot(): void;
    getAgentName(): string;
    getState(): AgentState;
    getMode(): AgentMode;
    setMode(mode: AgentMode): void;
    sendMessage(toAgent: string, content: string, type?: AgentMessage['type'], metadata?: Record<string, any>): AgentMessage;
    receiveMessage(message: AgentMessage): void;
    addTask(task: Omit<AgentTask, 'id' | 'createdAt'>): string;
    abstract getCapabilities(): AgentCapability[];
    abstract executeTask(task: AgentTask): Promise<any>;
    protected requireOnline(taskName: string): void;
}
export declare class OnlineArchitectAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performArchitectureTask;
    analyzeMarket(project: NovelProject): Promise<any>;
    generateDirection(project: NovelProject): Promise<any>;
    planNovelStructure(project: NovelProject): Promise<any>;
    worldBuilding(data: {
        project: NovelProject;
        depth?: string;
    }): Promise<any>;
    characterDesign(data: {
        project: NovelProject;
        count?: number;
    }): Promise<any>;
    plotPlanning(data: {
        project: NovelProject;
        chapters?: number;
    }): Promise<any>;
    outlineGeneration(data: {
        project: NovelProject;
    }): Promise<any>;
}
export declare class OnlineWriterAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performWritingTask;
    writeChapter(data: {
        project: NovelProject;
        chapterNumber: number;
        outline?: string;
        truthFiles?: TruthFiles;
    }): Promise<any>;
    continueStory(data: {
        project: NovelProject;
        lastContent: string;
        additionalChapters: number;
    }): Promise<any>;
    writeScene(data: {
        project: NovelProject;
        location: string;
        characters: string[];
        action: string;
    }): Promise<any>;
    writeFanfiction(data: {
        project: NovelProject;
        premise: string;
    }): Promise<any>;
    writeSideStory(data: {
        project: NovelProject;
        title: string;
        viewpoint: string;
    }): Promise<any>;
    writeMultiPOV(data: {
        project: NovelProject;
        chapterNumber: number;
        viewpoints: string[];
    }): Promise<any>;
}
export declare class OnlineAuditorAgent extends BaseAgent {
    constructor(config: AgentConfig);
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performAuditTask;
    auditChapter(data: {
        chapter: Chapter;
        truthFiles: TruthFiles;
    }): Promise<AuditResult>;
    private basicAudit;
    private checkPunctuation;
    auditConsistency(data: {
        content: string;
        truthFiles: TruthFiles;
    }): Promise<any>;
    generateQualityReport(data: {
        content: string;
        chapterNumber?: number;
    }): Promise<any>;
    plagiarismCheck(data: {
        content: string;
    }): Promise<any>;
    styleConsistency(data: {
        content: string;
        styleGuide?: string;
    }): Promise<any>;
    plotHoleDetection(data: {
        content: string;
        plotOutline?: string;
    }): Promise<any>;
}
export declare class OnlineReviserAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performRevisionTask;
    reviseChapter(data: {
        content: string;
        feedback?: string;
    }): Promise<any>;
    fixIssues(data: {
        content: string;
        issues: string[];
    }): Promise<any>;
    enhanceProse(data: {
        content: string;
    }): Promise<any>;
    rewrite(data: {
        content: string;
        style?: string;
    }): Promise<any>;
    simplify(data: {
        content: string;
    }): Promise<any>;
    expand(data: {
        content: string;
        targetLength?: number;
    }): Promise<any>;
}
export declare class OnlineStyleEngineerAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performStyleTask;
    analyzeStyle(data: {
        content: string;
    }): Promise<any>;
    transferStyle(data: {
        content: string;
        targetStyle: string;
    }): Promise<any>;
    optimizeProse(data: {
        content: string;
    }): Promise<any>;
    changeTone(data: {
        content: string;
        tone: string;
    }): Promise<any>;
    addMood(data: {
        content: string;
        mood: string;
    }): Promise<any>;
    formatDialogue(data: {
        content: string;
    }): Promise<any>;
}
export declare class OnlineRadarAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performRadarTask;
    trackTrends(data: {
        project: NovelProject;
    }): Promise<any>;
    detectRisk(data: {
        content: string;
    }): Promise<any>;
    trackConsistency(data: {
        content: string;
        previousContent?: string;
    }): Promise<any>;
    analyzeMarket(data: {
        genre: string;
    }): Promise<any>;
    suggestImprovement(data: {
        content: string;
        project?: NovelProject;
    }): Promise<any>;
}
export declare class OfflineArchitectAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performArchitectureTask;
    planNovelStructure(project: NovelProject): Promise<any>;
    private getStructureTemplates;
    private generateParts;
    private generateKeyEventsForPart;
    worldBuilding(data: {
        project: NovelProject;
        depth?: string;
    }): Promise<any>;
    private generateGeography;
    private generateSociety;
    private generateFactions;
    private generateHierarchy;
    private generateOrganizations;
    private generateCulture;
    private generateValues;
    private generatePowerSystem;
    private generateConflicts;
    private generateTimeline;
    characterDesign(data: {
        project: NovelProject;
        count?: number;
    }): Promise<any>;
    private getArchetypesForGenre;
    private generateCharacterName;
    private generateAppearance;
    private generatePersonality;
    private generateBackground;
    private generateGoals;
    private generateCharacterConflicts;
    private generateRelationships;
    private generateCharacterArc;
    private generateAbilities;
    plotPlanning(data: {
        project: NovelProject;
        chapters?: number;
    }): Promise<any>;
    private generateMainPlotline;
    private generateSubplots;
    private generateKeyPlotPoints;
    private generateForeshadowing;
    outlineGeneration(data: {
        project: NovelProject;
    }): Promise<any>;
    themeGeneration(data: {
        project: NovelProject;
    }): Promise<any>;
    generateDirection(data: {
        project: NovelProject;
    }): Promise<any>;
    private generateChapterTitle;
    private getEarlyTitle;
    private getMiddleTitle;
    private getLateTitle;
    private getFinalTitle;
    private generateChapterSummary;
    private generateChapterEvents;
    private getChapterFocus;
    private getChapterForeshadowing;
    private getChapterMood;
}
export declare class OfflineWriterAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performWritingTask;
    writeChapter(data: {
        project: NovelProject;
        chapterNumber: number;
        outline?: string;
        sceneType?: string;
    }): Promise<any>;
    private getChapterTemplate;
    private getSceneTypes;
    private getSceneDescription;
    private getCharacterIntroductionTemplate;
    private getDialogueTemplate;
    private generateChapterTitle;
    writeScene(data: {
        project: NovelProject;
        location: string;
        characters: string[];
        action: string;
        mood?: string;
    }): Promise<any>;
    generateDialogue(data: {
        characters: string[];
        topic: string;
        relationship?: string;
        mood?: string;
    }): Promise<any>;
    generateDescription(data: {
        target: string;
        type: string;
        details?: string;
    }): Promise<any>;
    writeSideStory(data: {
        project: NovelProject;
        character: string;
        theme?: string;
    }): Promise<any>;
    writeMultiPOV(data: {
        project: NovelProject;
        viewpoints: string[];
        event: string;
    }): Promise<any>;
    generateSuspense(data: {
        project: NovelProject;
        type: string;
        setup?: string;
    }): Promise<any>;
    writeActionScene(data: {
        project: NovelProject;
        combatants: string[];
        location: string;
        stakes?: string;
    }): Promise<any>;
    writeRomanticScene(data: {
        project: NovelProject;
        characters: string[];
        stage?: string;
    }): Promise<any>;
}
export declare class OfflineAuditorAgent extends BaseAgent {
    constructor(config: AgentConfig);
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performAuditTask;
    auditChapter(data: {
        chapter: Chapter;
        truthFiles: TruthFiles;
    }): Promise<AuditResult>;
    private enhancedAudit;
    private checkPunctuation;
    auditConsistency(data: {
        content: string;
        truthFiles: TruthFiles;
    }): Promise<any>;
    checkStructure(data: {
        content: string;
        outline?: string;
    }): Promise<any>;
    checkCharacters(data: {
        content: string;
        characters?: string[];
    }): Promise<any>;
    checkPlotLogic(data: {
        content: string;
    }): Promise<any>;
    checkPacing(data: {
        content: string;
    }): Promise<any>;
}
export declare class OfflineReviserAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performRevisionTask;
    formatText(data: {
        content: string;
    }): Promise<any>;
    suggestRevisions(data: {
        content: string;
    }): Promise<any>;
    suggestExpansions(data: {
        content: string;
        position?: string;
    }): Promise<any>;
    suggestImprovements(data: {
        content: string;
    }): Promise<any>;
    fixCommonIssues(data: {
        content: string;
    }): Promise<any>;
}
export declare class OfflineStyleEngineerAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performStyleTask;
    formatDialogue(data: {
        content: string;
    }): Promise<any>;
    formatParagraphs(data: {
        content: string;
        maxLength?: number;
    }): Promise<any>;
    applyStyleTemplate(data: {
        content: string;
        style: string;
    }): Promise<any>;
    private getStyleTips;
    suggestLiteraryDevices(data: {
        content: string;
        sceneType?: string;
    }): Promise<any>;
    suggestVocabulary(data: {
        content: string;
        type?: string;
    }): Promise<any>;
}
export declare class OfflineRadarAgent extends BaseAgent {
    getAgentName(): string;
    getCapabilities(): AgentCapability[];
    executeTask(task: AgentTask): Promise<any>;
    private performRadarTask;
    trackConsistency(data: {
        content: string;
        previousContent?: string;
    }): Promise<any>;
    private extractProtagonist;
    checkLength(data: {
        content: string;
        chapterNumber: number;
    }): Promise<any>;
    private getLengthSuggestion;
    trackProgress(data: {
        project: NovelProject;
        chapters: Chapter[];
    }): Promise<any>;
    private getMilestones;
    generateChecklist(data: {
        stage: string;
    }): Promise<any>;
    analyzeStructure(data: {
        content: string;
    }): Promise<any>;
}
export declare class AgentSystem {
    private coordinator;
    constructor(llmManager?: LLMManager, auditEngine?: AIAuditEngine);
    getAllAgents(): Record<string, BaseAgent>;
    executeArchitectTask(project: NovelProject, task: 'world_building' | 'character_design' | 'plot_planning' | 'outline_generation', params?: Record<string, any>): Promise<any>;
    executeWriterTask(project: NovelProject, chapterNumber: number, options?: {
        outline?: string;
        guidance?: string;
    }): Promise<any>;
    executeAuditorTask(content: string, truthFiles: TruthFiles, options?: {
        autoFix?: boolean;
    }): Promise<any>;
    executePipeline(project: NovelProject, chapterNumber: number): Promise<any>;
    setMode(mode: AgentMode): void;
    getMode(): AgentMode;
    getAgentCapabilities(agentType: string): AgentCapability[];
    getAllCapabilities(): Record<string, AgentCapability[]>;
}
export interface AgentCoordinatorConfig {
    mode: AgentMode;
    llmManager?: LLMManager;
    auditEngine?: AIAuditEngine;
    autoSwitchMode?: boolean;
    maxRetry?: number;
}
export interface PipelineStep {
    agentType: string;
    taskType: string;
    priority: AgentTask['priority'];
    dataProvider?: (results: Record<string, any>) => any;
    condition?: (results: Record<string, any>) => boolean;
    onSuccess?: (result: any, results: Record<string, any>) => void;
    onFailure?: (error: any, results: Record<string, any>) => void;
}
export interface PipelineResult {
    success: boolean;
    steps: Record<string, {
        success: boolean;
        result?: any;
        error?: any;
    }>;
    outputs: Record<string, any>;
    executionTime: number;
}
export declare class AgentCoordinator {
    private mode;
    private agents;
    private messageBus;
    private autoSwitchMode;
    private maxRetry;
    private taskHistory;
    constructor(config: AgentCoordinatorConfig);
    private initializeAgents;
    getAgent(agentType: string): BaseAgent | undefined;
    getAllAgents(): Record<string, BaseAgent>;
    getAgentNames(): string[];
    getMode(): AgentMode;
    setMode(mode: AgentMode): void;
    switchToOnline(): void;
    switchToOffline(): void;
    getAgentCapabilities(agentType: string): AgentCapability[];
    getAllCapabilities(): Record<string, AgentCapability[]>;
    sendMessage(fromAgent: string, toAgent: string, content: string, type?: AgentMessage['type'], metadata?: Record<string, any>): void;
    broadcastMessage(fromAgent: string, content: string, metadata?: Record<string, any>): void;
    getMessages(): AgentMessage[];
    getMessagesForAgent(agentType: string): AgentMessage[];
    executeTask(agentType: string, task: Omit<AgentTask, 'id' | 'createdAt'>, retryCount?: number): Promise<{
        taskId: string;
        result: any;
    }>;
    executePipeline(project: NovelProject, chapterNumber: number, truthFiles?: TruthFiles): Promise<PipelineResult>;
    executeCustomPipeline(steps: PipelineStep[]): Promise<PipelineResult>;
    getAgentStatus(agentType: string): AgentState | undefined;
    getAllAgentStatuses(): Record<string, AgentState>;
    getTaskHistory(): AgentTask[];
    clearTaskHistory(): void;
    canExecuteTask(agentType: string, taskType: string): {
        supported: boolean;
        requiresOnline: boolean;
    };
    validatePipeline(steps: PipelineStep[]): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=AgentSystem.d.ts.map