"use strict";
/**
 * Cloud Book - Agent系统
 * 6类AI智能体：架构师、写手、审计员、修订员、文风工程师、雷达
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = exports.AgentCoordinator = exports.RadarAgent = exports.StyleEngineerAgent = exports.ReviserAgent = exports.AuditorAgent = exports.WriterAgent = exports.ArchitectAgent = exports.BaseAgent = void 0;
class BaseAgent {
    llmManager;
    state;
    messageInbox = [];
    messageOutbox = [];
    constructor(llmManager) {
        this.llmManager = llmManager;
        this.state = {
            agentName: this.getAgentName(),
            status: 'idle',
            lastActivity: new Date(),
            queue: []
        };
    }
    getAgentName() {
        return this.constructor.name;
    }
    getState() {
        return this.state;
    }
    sendMessage(toAgent, content, type = 'request', metadata) {
        const message = {
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
    receiveMessage(message) {
        this.messageInbox.push(message);
    }
    addTask(task) {
        const newTask = {
            ...task,
            id: Date.now().toString(),
            createdAt: new Date()
        };
        this.state.queue.push(newTask);
        return newTask.id;
    }
}
exports.BaseAgent = BaseAgent;
// ==================== 6类 Agent ====================
class ArchitectAgent extends BaseAgent {
    getAgentName() {
        return 'Architect';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performArchitectureTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performArchitectureTask(task) {
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
    async analyzeMarket(project) {
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
            analysis: response.text
        };
    }
    async generateDirection(project) {
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
    async planNovelStructure(project) {
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
exports.ArchitectAgent = ArchitectAgent;
class WriterAgent extends BaseAgent {
    getAgentName() {
        return 'Writer';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performWritingTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performWritingTask(task) {
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
    async writeChapter(data) {
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
    async continueStory(data) {
        return { content: '继续内容' };
    }
    async writeScene(data) {
        return { content: '场景内容' };
    }
}
exports.WriterAgent = WriterAgent;
class AuditorAgent extends BaseAgent {
    auditEngine;
    constructor(llmManager, auditEngine) {
        super(llmManager);
        this.auditEngine = auditEngine;
    }
    getAgentName() {
        return 'Auditor';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performAuditTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performAuditTask(task) {
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
    async auditChapter(data) {
        return await this.auditEngine.audit(data.chapter.content, data.truthFiles);
    }
    async auditConsistency(data) {
        return { consistent: true, issues: [] };
    }
    async generateQualityReport(data) {
        return { report: '质量报告' };
    }
}
exports.AuditorAgent = AuditorAgent;
class ReviserAgent extends BaseAgent {
    getAgentName() {
        return 'Reviser';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performRevisionTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performRevisionTask(task) {
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
    async reviseChapter(data) {
        return { revisedContent: '修订后的内容' };
    }
    async fixIssues(data) {
        return { fixedContent: '修复后的内容' };
    }
    async enhanceProse(data) {
        return { enhancedContent: '优化后的内容' };
    }
}
exports.ReviserAgent = ReviserAgent;
class StyleEngineerAgent extends BaseAgent {
    getAgentName() {
        return 'StyleEngineer';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performStyleTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performStyleTask(task) {
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
    async analyzeStyle(data) {
        return { style: '风格分析' };
    }
    async transferStyle(data) {
        return { transferredContent: '风格迁移后的内容' };
    }
    async optimizeProse(data) {
        return { optimizedContent: '优化后的内容' };
    }
}
exports.StyleEngineerAgent = StyleEngineerAgent;
class RadarAgent extends BaseAgent {
    getAgentName() {
        return 'Radar';
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const result = await this.performRadarTask(task);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.state.status = 'error';
            throw error;
        }
    }
    async performRadarTask(task) {
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
    async monitorTrends(data) {
        return { trends: '趋势数据' };
    }
    async trackConsistency(data) {
        return { consistencyStatus: '一致状态' };
    }
    async detectRisk(data) {
        return { risks: '风险列表' };
    }
}
exports.RadarAgent = RadarAgent;
// ==================== Agent 协调器 ====================
class AgentCoordinator {
    agents;
    messageQueue = [];
    llmManager;
    constructor(llmManager, auditEngine) {
        this.llmManager = llmManager;
        this.agents = new Map();
        this.agents.set('Architect', new ArchitectAgent(llmManager));
        this.agents.set('Writer', new WriterAgent(llmManager));
        this.agents.set('Auditor', new AuditorAgent(llmManager, auditEngine));
        this.agents.set('Reviser', new ReviserAgent(llmManager));
        this.agents.set('StyleEngineer', new StyleEngineerAgent(llmManager));
        this.agents.set('Radar', new RadarAgent(llmManager));
    }
    getAgent(name) {
        return this.agents.get(name);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    async orchestrateNovelCreation(project, truthFiles) {
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
exports.AgentCoordinator = AgentCoordinator;
class AgentSystem {
    coordinator;
    llmManager;
    auditEngine;
    constructor(llmManager, auditEngine) {
        this.llmManager = llmManager;
        this.auditEngine = auditEngine;
        this.coordinator = new AgentCoordinator(llmManager, auditEngine);
    }
    getCoordinator() {
        return this.coordinator;
    }
    getAllAgents() {
        return this.coordinator.getAllAgents();
    }
    getArchitectAgent() {
        return this.coordinator.getAgent('Architect');
    }
    getWriterAgent() {
        return this.coordinator.getAgent('Writer');
    }
    getAuditorAgent() {
        return this.coordinator.getAgent('Auditor');
    }
    getReviserAgent() {
        return this.coordinator.getAgent('Reviser');
    }
    getStyleEngineerAgent() {
        return this.coordinator.getAgent('StyleEngineer');
    }
    getRadarAgent() {
        return this.coordinator.getAgent('Radar');
    }
    async executeArchitectTask(project, task, params) {
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
    async executeWriterTask(project, chapterNumber, options) {
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
    async executeAuditorTask(content, truthFiles, options) {
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
    async executePipeline(project, chapterNumber) {
        return this.coordinator.orchestrateNovelCreation(project, {});
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map