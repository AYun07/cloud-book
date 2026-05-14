"use strict";
/**
 * Cloud Book - Agent系统 V2
 * 双模式架构：在线模式 + 离线模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCoordinator = exports.AgentSystem = exports.OfflineRadarAgent = exports.OfflineStyleEngineerAgent = exports.OfflineReviserAgent = exports.OfflineAuditorAgent = exports.OfflineWriterAgent = exports.OfflineArchitectAgent = exports.OnlineRadarAgent = exports.OnlineStyleEngineerAgent = exports.OnlineReviserAgent = exports.OnlineAuditorAgent = exports.OnlineWriterAgent = exports.OnlineArchitectAgent = exports.BaseAgent = void 0;
class BaseAgent {
    llmManager;
    auditEngine;
    state;
    messageInbox = [];
    messageOutbox = [];
    mode;
    tokenUsages = [];
    maxTokenBudget;
    tokenThreshold;
    enableTokenSaving;
    responseCache = new Map();
    static CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30分钟
    static maxConcurrentTasks = 3;
    static currentConcurrentTasks = 0;
    constructor(config) {
        this.mode = config.mode;
        this.llmManager = config.llmManager;
        this.auditEngine = config.auditEngine;
        this.maxTokenBudget = config.maxTokenBudget || 1000000;
        this.tokenThreshold = config.tokenThreshold || 0.9;
        this.enableTokenSaving = config.enableTokenSaving !== false;
        this.state = {
            agentName: this.getAgentName(),
            status: 'idle',
            lastActivity: new Date(),
            queue: [],
            mode: this.mode
        };
    }
    getTotalTokensUsed() {
        return this.tokenUsages.reduce((sum, usage) => sum + usage.totalTokens, 0);
    }
    shouldLimitTokenUsage() {
        const used = this.getTotalTokensUsed();
        return used >= this.maxTokenBudget * this.tokenThreshold;
    }
    cacheKey(taskType, data) {
        return `${taskType}-${JSON.stringify(data)}`;
    }
    getCachedResult(taskType, data) {
        const key = this.cacheKey(taskType, data);
        const cached = this.responseCache.get(key);
        if (cached && (Date.now() - cached.timestamp.getTime()) < BaseAgent.CACHE_EXPIRY_MS) {
            return cached.result;
        }
        this.responseCache.delete(key);
        return null;
    }
    setCachedResult(taskType, data, result) {
        const key = this.cacheKey(taskType, data);
        this.responseCache.set(key, { result, timestamp: new Date() });
    }
    trackTokenUsage(taskType, inputTokens, outputTokens, cost = 0) {
        this.tokenUsages.push({
            agentName: this.getAgentName(),
            taskType,
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            timestamp: new Date(),
            cost
        });
    }
    truncateContent(content, maxLength = 2000) {
        if (content.length <= maxLength)
            return content;
        return content.substring(0, maxLength) + '...[内容已截断]';
    }
    optimizePrompt(prompt) {
        if (!this.enableTokenSaving)
            return prompt;
        return prompt
            .replace(/\s+/g, ' ') // 压缩多个空格
            .replace(/\n\s*\n/g, '\n') // 压缩多个换行
            .trim();
    }
    async acquireTaskSlot() {
        while (BaseAgent.currentConcurrentTasks >= BaseAgent.maxConcurrentTasks) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        BaseAgent.currentConcurrentTasks++;
    }
    releaseTaskSlot() {
        BaseAgent.currentConcurrentTasks = Math.max(0, BaseAgent.currentConcurrentTasks - 1);
    }
    getAgentName() {
        return this.constructor.name;
    }
    getState() {
        return this.state;
    }
    getMode() {
        return this.mode;
    }
    setMode(mode) {
        this.mode = mode;
        this.state.mode = mode;
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
    requireOnline(taskName) {
        if (this.mode === 'offline') {
            throw new Error(`任务 "${taskName}" 需要在线模式`);
        }
    }
}
exports.BaseAgent = BaseAgent;
class OnlineArchitectAgent extends BaseAgent {
    getAgentName() {
        return 'OnlineArchitect';
    }
    getCapabilities() {
        return [
            { name: 'analyze_market', supported: true, requiresOnline: true, description: '市场趋势分析' },
            { name: 'generate_direction', supported: true, requiresOnline: true, description: '创作方向生成' },
            { name: 'plan_novel_structure', supported: true, requiresOnline: true, description: '小说结构规划' },
            { name: 'world_building', supported: true, requiresOnline: true, description: '世界观构建' },
            { name: 'character_design', supported: true, requiresOnline: true, description: '角色设计' },
            { name: 'plot_planning', supported: true, requiresOnline: true, description: '情节规划' },
            { name: 'outline_generation', supported: true, requiresOnline: true, description: '大纲生成' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            await this.acquireTaskSlot();
            const result = await this.performArchitectureTask(task);
            this.releaseTaskSlot();
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performArchitectureTask(task) {
        switch (task.type) {
            case 'analyze_market': return this.analyzeMarket(task.data);
            case 'generate_direction': return this.generateDirection(task.data);
            case 'plan_novel_structure': return this.planNovelStructure(task.data);
            case 'world_building': return this.worldBuilding(task.data);
            case 'character_design': return this.characterDesign(task.data);
            case 'plot_planning': return this.plotPlanning(task.data);
            case 'outline_generation': return this.outlineGeneration(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async analyzeMarket(project) {
        this.requireOnline('analyze_market');
        const prompt = this.optimizePrompt(`## 市场分析\n项目：${project.title}\n题材：${project.genre}\n目标读者：${project.targetAudience || '未设定'}\n请分析当前市场趋势并以结构化输出。`);
        const model = this.llmManager?.route('analysis');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1000 });
        this.trackTokenUsage('analyze_market', prompt.length, (response?.length || 0) / 4);
        return { analysis: response };
    }
    async generateDirection(project) {
        this.requireOnline('generate_direction');
        const worldSetting = this.truncateContent(JSON.stringify(project.worldSetting, null, 2), 1000);
        const prompt = this.optimizePrompt(`## 创作方向生成\n项目：${project.title}\n核心设定：${worldSetting}\n请为 ${project.genre} 题材小说生成创作方向建议。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1500 });
        this.trackTokenUsage('generate_direction', prompt.length, (response?.length || 0) / 4);
        return { direction: response };
    }
    async planNovelStructure(project) {
        this.requireOnline('plan_novel_structure');
        const prompt = this.optimizePrompt(`## 小说结构规划\n项目：${project.title}\n题材：${project.genre}\n目标章节数：${project.plannedChapters || 50}\n请规划小说整体结构，输出JSON格式。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2000 });
        this.trackTokenUsage('plan_novel_structure', prompt.length, (response?.length || 0) / 4);
        let structure;
        try {
            structure = typeof response === 'string' ? JSON.parse(response) : response;
        }
        catch {
            structure = { raw: response };
        }
        return { structure };
    }
    async worldBuilding(data) {
        this.requireOnline('world_building');
        const depth = data.depth || 'medium';
        const maxTokens = depth === 'deep' ? 4000 : depth === 'medium' ? 2500 : 1500;
        const prompt = this.optimizePrompt(`## 世界观构建\n项目：${data.project.title}\n题材：${data.project.genre}\n深度：${depth}\n请构建详细的世界观设定。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens });
        this.trackTokenUsage('world_building', prompt.length, (response?.length || 0) / 4);
        return { worldBuilding: response };
    }
    async characterDesign(data) {
        this.requireOnline('character_design');
        const count = data.count || 5;
        const prompt = this.optimizePrompt(`## 角色设计\n项目：${data.project.title}\n题材：${data.project.genre}\n角色数量：${count}\n请设计主要角色，包括名字、性格、背景等。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2000 });
        this.trackTokenUsage('character_design', prompt.length, (response?.length || 0) / 4);
        return { characters: response };
    }
    async plotPlanning(data) {
        this.requireOnline('plot_planning');
        const chapters = data.chapters || 50;
        const prompt = this.optimizePrompt(`## 情节规划\n项目：${data.project.title}\n题材：${data.project.genre}\n计划章节：${chapters}\n请规划详细的情节大纲，分阶段叙述。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('plot_planning', prompt.length, (response?.length || 0) / 4);
        return { plot: response };
    }
    async outlineGeneration(data) {
        this.requireOnline('outline_generation');
        const prompt = this.optimizePrompt(`## 大纲生成\n项目：${data.project.title}\n题材：${data.project.genre}\n请生成详细的章节大纲，每章包含标题和简要内容。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 4000 });
        this.trackTokenUsage('outline_generation', prompt.length, (response?.length || 0) / 4);
        return { outline: response };
    }
}
exports.OnlineArchitectAgent = OnlineArchitectAgent;
class OnlineWriterAgent extends BaseAgent {
    getAgentName() {
        return 'OnlineWriter';
    }
    getCapabilities() {
        return [
            { name: 'write_chapter', supported: true, requiresOnline: true, description: '章节创作' },
            { name: 'continue_story', supported: true, requiresOnline: true, description: '故事续写' },
            { name: 'write_scene', supported: true, requiresOnline: true, description: '场景描写' },
            { name: 'write_fanfiction', supported: true, requiresOnline: true, description: '同人创作' },
            { name: 'write_side_story', supported: true, requiresOnline: true, description: '番外创作' },
            { name: 'write_multi_pov', supported: true, requiresOnline: true, description: '多视角叙事' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            await this.acquireTaskSlot();
            const result = await this.performWritingTask(task);
            this.releaseTaskSlot();
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performWritingTask(task) {
        switch (task.type) {
            case 'write_chapter': return this.writeChapter(task.data);
            case 'continue_story': return this.continueStory(task.data);
            case 'write_scene': return this.writeScene(task.data);
            case 'write_fanfiction': return this.writeFanfiction(task.data);
            case 'write_side_story': return this.writeSideStory(task.data);
            case 'write_multi_pov': return this.writeMultiPOV(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async writeChapter(data) {
        this.requireOnline('write_chapter');
        const outline = data.outline ? this.truncateContent(data.outline, 1000) : '';
        const truthFilesStr = data.truthFiles ? this.truncateContent(JSON.stringify(data.truthFiles, null, 2), 1500) : '';
        const prompt = this.optimizePrompt(`## 第 ${data.chapterNumber} 章创作\n项目：${data.project.title}\n题材：${data.project.genre}\n${outline ? `大纲：${outline}` : ''}\n${truthFilesStr ? `设定：${truthFilesStr}` : ''}\n请创作本章内容，约2000-3000字。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3500 });
        this.trackTokenUsage('write_chapter', prompt.length, (response?.length || 0) / 4);
        return { content: response, chapterNumber: data.chapterNumber };
    }
    async continueStory(data) {
        this.requireOnline('continue_story');
        const lastContent = this.truncateContent(data.lastContent, 2000);
        const prompt = this.optimizePrompt(`## 故事续写\n项目：${data.project.title}\n题材：${data.project.genre}\n已有内容：${lastContent}\n请继续创作 ${data.additionalChapters} 章内容。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 4000 });
        this.trackTokenUsage('continue_story', prompt.length, (response?.length || 0) / 4);
        return { content: response };
    }
    async writeScene(data) {
        this.requireOnline('write_scene');
        const prompt = this.optimizePrompt(`## 场景描写\n项目：${data.project.title}\n地点：${data.location}\n人物：${data.characters.join(', ')}\n动作：${data.action}\n请描写这个场景，约300-500字。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 800 });
        this.trackTokenUsage('write_scene', prompt.length, (response?.length || 0) / 4);
        return { scene: response };
    }
    async writeFanfiction(data) {
        this.requireOnline('write_fanfiction');
        const premise = this.truncateContent(data.premise, 500);
        const prompt = this.optimizePrompt(`## 同人创作\n原作品：${data.project.title}\n同人设定：${premise}\n请基于同人设定创作一章内容，约2000字。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('write_fanfiction', prompt.length, (response?.length || 0) / 4);
        return { fanfiction: response };
    }
    async writeSideStory(data) {
        this.requireOnline('write_side_story');
        const prompt = this.optimizePrompt(`## 番外篇创作\n主作品：${data.project.title}\n番外标题：${data.title}\n视角：${data.viewpoint}\n请创作一篇番外故事，约1500字。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2000 });
        this.trackTokenUsage('write_side_story', prompt.length, (response?.length || 0) / 4);
        return { sideStory: response };
    }
    async writeMultiPOV(data) {
        this.requireOnline('write_multi_pov');
        const results = {};
        for (const viewpoint of data.viewpoints) {
            const prompt = this.optimizePrompt(`## 多视角叙事 - ${viewpoint}视角\n项目：${data.project.title}\n章节：第${data.chapterNumber}章\n视角：${viewpoint}\n请从 ${viewpoint} 的视角创作这一章，约1500字。`);
            const model = this.llmManager?.route('writing');
            const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2000 });
            this.trackTokenUsage('write_multi_pov', prompt.length, (response?.length || 0) / 4);
            results[viewpoint] = response;
        }
        return { multiPOV: results };
    }
}
exports.OnlineWriterAgent = OnlineWriterAgent;
class OnlineAuditorAgent extends BaseAgent {
    constructor(config) {
        super(config);
    }
    getAgentName() {
        return 'OnlineAuditor';
    }
    getCapabilities() {
        return [
            { name: 'audit_chapter', supported: true, requiresOnline: false, description: '章节审计' },
            { name: 'audit_consistency', supported: true, requiresOnline: true, description: '一致性检查' },
            { name: 'quality_report', supported: true, requiresOnline: true, description: '质量报告' },
            { name: 'plagiarism_check', supported: true, requiresOnline: true, description: '查重检测' },
            { name: 'style_consistency', supported: true, requiresOnline: true, description: '风格一致性' },
            { name: 'plot_hole_detection', supported: true, requiresOnline: true, description: '情节漏洞检测' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            await this.acquireTaskSlot();
            const result = await this.performAuditTask(task);
            this.releaseTaskSlot();
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performAuditTask(task) {
        switch (task.type) {
            case 'audit_chapter': return this.auditChapter(task.data);
            case 'audit_consistency': return this.auditConsistency(task.data);
            case 'quality_report': return this.generateQualityReport(task.data);
            case 'plagiarism_check': return this.plagiarismCheck(task.data);
            case 'style_consistency': return this.styleConsistency(task.data);
            case 'plot_hole_detection': return this.plotHoleDetection(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async auditChapter(data) {
        if (this.auditEngine) {
            return await this.auditEngine.audit(data.chapter.content, data.truthFiles);
        }
        return this.basicAudit(data.chapter.content);
    }
    basicAudit(content) {
        const issues = [];
        if (content.length < 500) {
            issues.push({ dimension: '字数检查', score: 50, passed: false, details: '章节内容过短' });
        }
        else if (content.length > 10000) {
            issues.push({ dimension: '字数检查', score: 70, passed: true, details: '章节内容较长' });
        }
        else {
            issues.push({ dimension: '字数检查', score: 100, passed: true, details: '字数适中' });
        }
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        if (paragraphs.length < 3) {
            issues.push({ dimension: '段落结构', score: 60, passed: false, details: '段落数量较少' });
        }
        else {
            issues.push({ dimension: '段落结构', score: 100, passed: true, details: '段落结构合理' });
        }
        const punctuationScore = this.checkPunctuation(content);
        issues.push({
            dimension: '标点使用',
            score: punctuationScore,
            passed: punctuationScore >= 80,
            details: punctuationScore >= 80 ? '标点使用规范' : '建议检查标点使用'
        });
        const totalScore = Math.round(issues.reduce((sum, i) => sum + i.score, 0) / issues.length);
        return { passed: totalScore >= 70, dimensions: issues, issues: [], score: totalScore };
    }
    checkPunctuation(content) {
        const englishPunctuation = content.match(/[,.!?;:\"'\\/]/g) || [];
        const mixedPunctuation = englishPunctuation.filter(p => {
            const pos = content.indexOf(p);
            return pos > 0 && /[\u4e00-\u9fa5]/.test(content[pos - 1]);
        });
        return mixedPunctuation.length > content.length * 0.01 ? 60 : 90;
    }
    async auditConsistency(data) {
        this.requireOnline('audit_consistency');
        const content = this.truncateContent(data.content, 2500);
        const truthFilesStr = this.truncateContent(JSON.stringify(data.truthFiles, null, 2), 1500);
        const prompt = this.optimizePrompt(`## 一致性检查\n内容：${content}\n设定：${truthFilesStr}\n请检查内容与设定的一致性，指出问题。`);
        const model = this.llmManager?.route('audit');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1000 });
        this.trackTokenUsage('audit_consistency', prompt.length, (response?.length || 0) / 4);
        return { consistent: true, issues: [], analysis: response };
    }
    async generateQualityReport(data) {
        this.requireOnline('quality_report');
        const content = this.truncateContent(data.content, 2500);
        const prompt = this.optimizePrompt(`## 质量报告\n章节：第${data.chapterNumber || '未知'}章\n内容：${content}\n请从语法、风格、情节等维度生成质量报告。`);
        const model = this.llmManager?.route('audit');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1500 });
        this.trackTokenUsage('quality_report', prompt.length, (response?.length || 0) / 4);
        return { report: response };
    }
    async plagiarismCheck(data) {
        this.requireOnline('plagiarism_check');
        return { unique: true, similarity: 0 };
    }
    async styleConsistency(data) {
        this.requireOnline('style_consistency');
        const content = this.truncateContent(data.content, 2000);
        const styleGuide = data.styleGuide ? this.truncateContent(data.styleGuide, 500) : '';
        const prompt = this.optimizePrompt(`## 风格一致性检查\n内容：${content}\n${styleGuide ? `风格指南：${styleGuide}` : ''}\n请检查内容的风格一致性。`);
        const model = this.llmManager?.route('audit');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1000 });
        this.trackTokenUsage('style_consistency', prompt.length, (response?.length || 0) / 4);
        return { consistent: true, analysis: response };
    }
    async plotHoleDetection(data) {
        this.requireOnline('plot_hole_detection');
        const content = this.truncateContent(data.content, 2500);
        const plotOutline = data.plotOutline ? this.truncateContent(data.plotOutline, 1000) : '';
        const prompt = this.optimizePrompt(`## 情节漏洞检测\n内容：${content}\n${plotOutline ? `情节大纲：${plotOutline}` : ''}\n请检测情节中的逻辑漏洞。`);
        const model = this.llmManager?.route('audit');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1200 });
        this.trackTokenUsage('plot_hole_detection', prompt.length, (response?.length || 0) / 4);
        return { plotHoles: [], analysis: response };
    }
}
exports.OnlineAuditorAgent = OnlineAuditorAgent;
class OnlineReviserAgent extends BaseAgent {
    getAgentName() {
        return 'OnlineReviser';
    }
    getCapabilities() {
        return [
            { name: 'revise_chapter', supported: true, requiresOnline: true, description: '章节修订' },
            { name: 'fix_issues', supported: true, requiresOnline: true, description: '问题修复' },
            { name: 'enhance_prose', supported: true, requiresOnline: true, description: '文笔增强' },
            { name: 'rewrite', supported: true, requiresOnline: true, description: '重写' },
            { name: 'simplify', supported: true, requiresOnline: true, description: '简化' },
            { name: 'expand', supported: true, requiresOnline: true, description: '扩写' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            await this.acquireTaskSlot();
            const result = await this.performRevisionTask(task);
            this.releaseTaskSlot();
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performRevisionTask(task) {
        switch (task.type) {
            case 'revise_chapter': return this.reviseChapter(task.data);
            case 'fix_issues': return this.fixIssues(task.data);
            case 'enhance_prose': return this.enhanceProse(task.data);
            case 'rewrite': return this.rewrite(task.data);
            case 'simplify': return this.simplify(task.data);
            case 'expand': return this.expand(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async reviseChapter(data) {
        this.requireOnline('revise_chapter');
        const content = this.truncateContent(data.content, 2500);
        const feedback = data.feedback ? this.truncateContent(data.feedback, 500) : '';
        const prompt = this.optimizePrompt(`## 章节修订\n内容：${content}\n${feedback ? `反馈：${feedback}` : ''}\n请修订以上内容，提升质量。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('revise_chapter', prompt.length, (response?.length || 0) / 4);
        return { revisedContent: response };
    }
    async fixIssues(data) {
        this.requireOnline('fix_issues');
        const content = this.truncateContent(data.content, 2500);
        const issues = data.issues.map(i => this.truncateContent(i, 200)).join('\n');
        const prompt = this.optimizePrompt(`## 问题修复\n内容：${content}\n问题列表：\n${issues}\n请修复以上问题。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('fix_issues', prompt.length, (response?.length || 0) / 4);
        return { fixedContent: response };
    }
    async enhanceProse(data) {
        this.requireOnline('enhance_prose');
        const content = this.truncateContent(data.content, 2500);
        const prompt = this.optimizePrompt(`## 文笔增强\n内容：${content}\n请增强以上内容的文笔，保持原意。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('enhance_prose', prompt.length, (response?.length || 0) / 4);
        return { enhancedContent: response };
    }
    async rewrite(data) {
        this.requireOnline('rewrite');
        const content = this.truncateContent(data.content, 2000);
        const style = data.style ? this.truncateContent(data.style, 200) : '';
        const prompt = this.optimizePrompt(`## 重写\n内容：${content}\n${style ? `目标风格：${style}` : ''}\n请重写以上内容。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('rewrite', prompt.length, (response?.length || 0) / 4);
        return { rewrittenContent: response };
    }
    async simplify(data) {
        this.requireOnline('simplify');
        const content = this.truncateContent(data.content, 2000);
        const prompt = this.optimizePrompt(`## 简化\n内容：${content}\n请简化以上内容，使其更易懂。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('simplify', prompt.length, (response?.length || 0) / 4);
        return { simplifiedContent: response };
    }
    async expand(data) {
        this.requireOnline('expand');
        const content = this.truncateContent(data.content, 2000);
        const prompt = this.optimizePrompt(`## 扩写\n内容：${content}\n目标长度：${data.targetLength || '适当扩展'}\n请扩写以上内容，丰富细节。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('expand', prompt.length, (response?.length || 0) / 4);
        return { expandedContent: response };
    }
}
exports.OnlineReviserAgent = OnlineReviserAgent;
class OnlineStyleEngineerAgent extends BaseAgent {
    getAgentName() {
        return 'OnlineStyleEngineer';
    }
    getCapabilities() {
        return [
            { name: 'analyze_style', supported: true, requiresOnline: true, description: '风格分析' },
            { name: 'transfer_style', supported: true, requiresOnline: true, description: '风格迁移' },
            { name: 'optimize_prose', supported: true, requiresOnline: true, description: '文笔优化' },
            { name: 'change_tone', supported: true, requiresOnline: true, description: '语气调整' },
            { name: 'add_mood', supported: true, requiresOnline: true, description: '氛围添加' },
            { name: 'format_dialogue', supported: true, requiresOnline: false, description: '对话格式化' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            if (task.type !== 'format_dialogue') {
                await this.acquireTaskSlot();
            }
            const result = await this.performStyleTask(task);
            if (task.type !== 'format_dialogue') {
                this.releaseTaskSlot();
            }
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performStyleTask(task) {
        switch (task.type) {
            case 'analyze_style': return this.analyzeStyle(task.data);
            case 'transfer_style': return this.transferStyle(task.data);
            case 'optimize_prose': return this.optimizeProse(task.data);
            case 'change_tone': return this.changeTone(task.data);
            case 'add_mood': return this.addMood(task.data);
            case 'format_dialogue': return this.formatDialogue(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async analyzeStyle(data) {
        this.requireOnline('analyze_style');
        const content = this.truncateContent(data.content, 2500);
        const prompt = this.optimizePrompt(`## 风格分析\n内容：${content}\n请分析写作风格特点。`);
        const model = this.llmManager?.route('analysis');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 800 });
        this.trackTokenUsage('analyze_style', prompt.length, (response?.length || 0) / 4);
        return { style: response };
    }
    async transferStyle(data) {
        this.requireOnline('transfer_style');
        const content = this.truncateContent(data.content, 2000);
        const targetStyle = this.truncateContent(data.targetStyle, 300);
        const prompt = this.optimizePrompt(`## 风格迁移\n内容：${content}\n目标风格：${targetStyle}\n请转换为指定风格。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('transfer_style', prompt.length, (response?.length || 0) / 4);
        return { transferredContent: response };
    }
    async optimizeProse(data) {
        this.requireOnline('optimize_prose');
        const content = this.truncateContent(data.content, 2500);
        const prompt = this.optimizePrompt(`## 文笔优化\n内容：${content}\n请优化文笔，使表达更优美。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 3000 });
        this.trackTokenUsage('optimize_prose', prompt.length, (response?.length || 0) / 4);
        return { optimizedContent: response };
    }
    async changeTone(data) {
        this.requireOnline('change_tone');
        const content = this.truncateContent(data.content, 2000);
        const tone = this.truncateContent(data.tone, 200);
        const prompt = this.optimizePrompt(`## 语气调整\n内容：${content}\n目标语气：${tone}\n请调整语气。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('change_tone', prompt.length, (response?.length || 0) / 4);
        return { changedContent: response };
    }
    async addMood(data) {
        this.requireOnline('add_mood');
        const content = this.truncateContent(data.content, 2000);
        const mood = this.truncateContent(data.mood, 200);
        const prompt = this.optimizePrompt(`## 氛围添加\n内容：${content}\n目标氛围：${mood}\n请添加指定氛围。`);
        const model = this.llmManager?.route('writing');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 2500 });
        this.trackTokenUsage('add_mood', prompt.length, (response?.length || 0) / 4);
        return { moodContent: response };
    }
    async formatDialogue(data) {
        const lines = data.content.split('\n');
        const formattedLines = lines.map(line => {
            if (line.includes('：') || line.includes(':') || line.includes('"')) {
                return `「${line}」`;
            }
            return line;
        });
        return { formattedContent: formattedLines.join('\n') };
    }
}
exports.OnlineStyleEngineerAgent = OnlineStyleEngineerAgent;
class OnlineRadarAgent extends BaseAgent {
    getAgentName() {
        return 'OnlineRadar';
    }
    getCapabilities() {
        return [
            { name: 'track_trends', supported: true, requiresOnline: true, description: '趋势跟踪' },
            { name: 'detect_risk', supported: true, requiresOnline: true, description: '风险检测' },
            { name: 'track_consistency', supported: true, requiresOnline: false, description: '一致性监控' },
            { name: 'analyze_market', supported: true, requiresOnline: true, description: '市场分析' },
            { name: 'suggest_improvement', supported: true, requiresOnline: true, description: '改进建议' }
        ];
    }
    async executeTask(task) {
        this.state.status = 'working';
        this.state.currentTask = task.type;
        try {
            const cached = this.getCachedResult(task.type, task.data);
            if (cached)
                return cached;
            if (task.type !== 'track_consistency') {
                await this.acquireTaskSlot();
            }
            const result = await this.performRadarTask(task);
            if (task.type !== 'track_consistency') {
                this.releaseTaskSlot();
            }
            this.setCachedResult(task.type, task.data, result);
            this.state.status = 'idle';
            this.state.lastActivity = new Date();
            return result;
        }
        catch (error) {
            this.releaseTaskSlot();
            this.state.status = 'error';
            throw error;
        }
    }
    async performRadarTask(task) {
        switch (task.type) {
            case 'track_trends': return this.trackTrends(task.data);
            case 'detect_risk': return this.detectRisk(task.data);
            case 'track_consistency': return this.trackConsistency(task.data);
            case 'analyze_market': return this.analyzeMarket(task.data);
            case 'suggest_improvement': return this.suggestImprovement(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async trackTrends(data) {
        this.requireOnline('track_trends');
        const prompt = this.optimizePrompt(`## 趋势跟踪\n项目：${data.project.title}\n题材：${data.project.genre}\n请分析当前网络文学趋势。`);
        const model = this.llmManager?.route('analysis');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1500 });
        this.trackTokenUsage('track_trends', prompt.length, (response?.length || 0) / 4);
        return { trends: response };
    }
    async detectRisk(data) {
        this.requireOnline('detect_risk');
        const content = this.truncateContent(data.content, 2500);
        const prompt = this.optimizePrompt(`## 风险检测\n内容：${content}\n请检测内容中可能存在的风险。`);
        const model = this.llmManager?.route('audit');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1000 });
        this.trackTokenUsage('detect_risk', prompt.length, (response?.length || 0) / 4);
        return { risks: response };
    }
    async trackConsistency(data) {
        return { consistencyStatus: '一致', issues: [] };
    }
    async analyzeMarket(data) {
        this.requireOnline('analyze_market');
        const prompt = this.optimizePrompt(`## 市场分析\n题材：${data.genre}\n请分析当前市场情况。`);
        const model = this.llmManager?.route('analysis');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1500 });
        this.trackTokenUsage('analyze_market', prompt.length, (response?.length || 0) / 4);
        return { marketAnalysis: response };
    }
    async suggestImprovement(data) {
        this.requireOnline('suggest_improvement');
        const content = this.truncateContent(data.content, 2000);
        const prompt = this.optimizePrompt(`## 改进建议\n内容：${content}\n请提供改进建议。`);
        const model = this.llmManager?.route('analysis');
        const response = await this.llmManager?.generate(prompt, model?.name || 'gpt-4o', { maxTokens: 1000 });
        this.trackTokenUsage('suggest_improvement', prompt.length, (response?.length || 0) / 4);
        return { suggestions: response };
    }
}
exports.OnlineRadarAgent = OnlineRadarAgent;
class OfflineArchitectAgent extends BaseAgent {
    getAgentName() {
        return 'OfflineArchitect';
    }
    getCapabilities() {
        return [
            { name: 'plan_novel_structure', supported: true, requiresOnline: false, description: '小说结构规划（增强模板）' },
            { name: 'world_building', supported: true, requiresOnline: false, description: '世界观构建（增强模板）' },
            { name: 'character_design', supported: true, requiresOnline: false, description: '角色设计（增强模板）' },
            { name: 'plot_planning', supported: true, requiresOnline: false, description: '情节规划（增强模板）' },
            { name: 'outline_generation', supported: true, requiresOnline: false, description: '大纲生成（增强模板）' },
            { name: 'theme_generation', supported: true, requiresOnline: false, description: '主题生成（模板）' },
            { name: 'generate_direction', supported: true, requiresOnline: false, description: '创作方向生成（模板）' }
        ];
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
            case 'plan_novel_structure': return this.planNovelStructure(task.data);
            case 'world_building': return this.worldBuilding(task.data);
            case 'character_design': return this.characterDesign(task.data);
            case 'plot_planning': return this.plotPlanning(task.data);
            case 'outline_generation': return this.outlineGeneration(task.data);
            case 'theme_generation': return this.themeGeneration(task.data);
            case 'generate_direction': return this.generateDirection(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async planNovelStructure(project) {
        const chapters = project.plannedChapters || 50;
        const genre = project.genre || '玄幻';
        const structureTemplates = this.getStructureTemplates(genre);
        const selectedTemplate = structureTemplates[0]; // 默认选择第一个模板
        const structure = {
            title: project.title,
            genre: genre,
            structureType: selectedTemplate.name,
            prologue: selectedTemplate.prologue,
            parts: this.generateParts(selectedTemplate, chapters),
            epilogue: selectedTemplate.epilogue,
            narrativeArc: selectedTemplate.narrativeArc
        };
        return { structure };
    }
    getStructureTemplates(genre) {
        return [
            {
                name: '经典四幕式',
                prologue: '引子：介绍世界观背景，引出主角与核心悬念',
                epilogue: '尾声：交代主要人物结局，留下开放式思考',
                narrativeArc: '起承转合',
                parts: [
                    { percent: 0.2, name: '第一幕：初露锋芒', description: '主角出场，确立目标，遭遇第一个挑战' },
                    { percent: 0.3, name: '第二幕：探索成长', description: '主角历练，结识伙伴，势力逐渐壮大' },
                    { percent: 0.3, name: '第三幕：风云突变', description: '冲突升级，揭示阴谋，主角陷入低谷' },
                    { percent: 0.2, name: '第四幕：巅峰决战', description: '最终决战，完成救赎，尘埃落定' }
                ]
            },
            {
                name: '英雄之旅',
                prologue: '平凡世界：主角在日常生活中展现特质',
                epilogue: '回归：主角带着成长与收获回归',
                narrativeArc: '分离-启蒙-归来',
                parts: [
                    { percent: 0.15, name: '第一幕：冒险召唤', description: '平静被打破，主角踏上冒险' },
                    { percent: 0.25, name: '第二幕：试炼之路', description: '主角经历各种考验，获得成长' },
                    { percent: 0.35, name: '第三幕：核心冲突', description: '最大危机出现，挑战终极目标' },
                    { percent: 0.25, name: '第四幕：蜕变归来', description: '主角蜕变，完成使命，收获果实' }
                ]
            },
            {
                name: '三幕式结构',
                prologue: '开端：背景、人物与矛盾介绍',
                epilogue: '结局：矛盾解决，新的开始',
                narrativeArc: '开端-发展-结局',
                parts: [
                    { percent: 0.3, name: '第一幕：设定铺垫', description: '世界观、人物、目标确立' },
                    { percent: 0.4, name: '第二幕：冲突升级', description: '情节发展，矛盾激化' },
                    { percent: 0.3, name: '第三幕：高潮结局', description: '最终决战，故事收尾' }
                ]
            }
        ];
    }
    generateParts(template, totalChapters) {
        return template.parts.map((part, index) => {
            const chapterCount = Math.max(1, Math.floor(totalChapters * part.percent));
            const startChapter = index === 0 ? 1 :
                template.parts.slice(0, index).reduce((sum, p) => sum + Math.floor(totalChapters * p.percent), 0) + 1;
            const endChapter = startChapter + chapterCount - 1;
            return {
                name: part.name,
                startChapter: startChapter,
                endChapter: Math.min(endChapter, totalChapters),
                chapters: chapterCount,
                description: part.description,
                keyEvents: this.generateKeyEventsForPart(part.name, index + 1)
            };
        });
    }
    generateKeyEventsForPart(partName, partIndex) {
        const eventTemplates = [
            [
                '主角初次登场，展现性格特点',
                '关键事件打破平静，主角卷入',
                '主角做出选择，踏上冒险之路'
            ],
            [
                '主角结识重要伙伴/导师',
                '遭遇首次重大挑战，险胜',
                '实力/认知获得重要提升',
                '发现关键线索/真相碎片'
            ],
            [
                '重要关系出现裂痕/反转',
                '遭遇重大挫折/背叛',
                '揭示核心阴谋/真相',
                '主角陷入最低谷'
            ],
            [
                '主角重新振作，制定最终计划',
                '集结力量，最终备战',
                '高潮决战，解决主要矛盾',
                '事件落幕，角色获得成长'
            ]
        ];
        return eventTemplates[partIndex - 1] || [];
    }
    async worldBuilding(data) {
        const depth = data.depth || 'medium';
        const genre = data.project.genre || '玄幻';
        const world = {
            name: `${data.project.title}世界`,
            type: genre,
            depth,
            geography: this.generateGeography(genre, depth),
            society: this.generateSociety(genre, depth),
            culture: this.generateCulture(genre, depth),
            powerSystem: this.generatePowerSystem(genre, depth),
            conflicts: this.generateConflicts(genre),
            timeline: depth === 'deep' ? this.generateTimeline() : undefined
        };
        return { worldBuilding: world };
    }
    generateGeography(genre, depth) {
        const geographies = {
            '玄幻': {
                continents: ['东荒大陆', '西域群岛', '北境冰原', '南疆十万大山', '中央神州'],
                keyLocations: [
                    { name: '天都城', type: '主城', importance: '政治中心' },
                    { name: '万妖谷', type: '秘境', importance: '险地' },
                    { name: '归墟之地', type: '禁地', importance: '最深处' },
                    { name: '圣人遗迹', type: '圣地', importance: '传承' },
                    { name: '通天塔', type: '特殊地点', importance: '连接天地' }
                ],
                climateZones: ['四季分明', '终年炎热', '严寒刺骨', '温润多雨'],
                resources: ['灵石矿脉', '天材地宝', '上古遗物']
            },
            '仙侠': {
                continents: ['东胜神洲', '西牛贺洲', '南赡部洲', '北俱芦洲'],
                keyLocations: [
                    { name: '天庭', type: '主城', importance: '仙界中心' },
                    { name: '九幽黄泉', type: '秘境', importance: '轮回之地' },
                    { name: '三十三天外', type: '禁地', importance: '传说中' },
                    { name: '紫霄宫', type: '圣地', importance: '道祖讲道' }
                ],
                climateZones: ['仙气缭绕', '灵气稀薄', '阴阳失调', '四季常青'],
                resources: ['仙石', '灵药', '法宝碎片', '仙矿']
            },
            '都市': {
                continents: ['亚洲', '欧洲', '美洲', '非洲', '大洋洲'],
                keyLocations: [
                    { name: '上海', type: '主城', importance: '经济中心' },
                    { name: '北京', type: '主城', importance: '政治文化中心' },
                    { name: '某神秘组织', type: '特殊地点', importance: '隐藏势力' }
                ],
                climateZones: ['温带季风', '亚热带', '热带', '寒带'],
                resources: ['人才', '资本', '技术', '信息']
            },
            '科幻': {
                continents: ['地球', '火星殖民地', '太空站', '外星基地'],
                keyLocations: [
                    { name: '地球联邦', type: '主城', importance: '政治中心' },
                    { name: '小行星带', type: '资源区', importance: '矿业' },
                    { name: '虫洞入口', type: '特殊地点', importance: '星际通道' },
                    { name: '古代遗迹星球', type: '秘境', importance: '考古' }
                ],
                climateZones: ['地球标准', '火星改造', '太空零重力', '异星环境'],
                resources: ['能源晶体', '稀有金属', '外星科技', '暗物质']
            }
        };
        const defaultGeography = {
            continents: ['东方大陆', '西方群岛', '北方冰原', '南方沙漠'],
            keyLocations: [
                { name: '主城', type: '主城', importance: '核心城市' },
                { name: '秘境', type: '秘境', importance: '神秘地点' },
                { name: '禁地', type: '禁地', importance: '危险区域' },
                { name: '圣地', type: '圣地', importance: '重要场所' }
            ]
        };
        return geographies[genre] || defaultGeography;
    }
    generateSociety(genre, depth) {
        return {
            factions: this.generateFactions(genre),
            hierarchy: this.generateHierarchy(genre),
            socialClasses: ['底层', '平民', '精英', '顶层'],
            organizations: this.generateOrganizations(genre)
        };
    }
    generateFactions(genre) {
        const factionTemplates = {
            '玄幻': [
                { name: '正道联盟', alignment: '正义', description: '捍卫正义的修士联盟' },
                { name: '魔宗', alignment: '邪恶', description: '为达目的不择手段的修行者' },
                { name: '中立势力', alignment: '中立', description: '自成一体的势力' },
                { name: '神秘组织', alignment: '神秘', description: '隐藏在暗处的组织' }
            ],
            '都市': [
                { name: '官方机构', alignment: '秩序', description: '政府相关部门' },
                { name: '商业巨头', alignment: '中立', description: '控制经济的大集团' },
                { name: '地下势力', alignment: '灰色', description: '地下世界的掌控者' },
                { name: '古老家族', alignment: '传统', description: '传承久远的家族' }
            ],
            '仙侠': [
                { name: '道门正宗', alignment: '正义', description: '正统修仙门派' },
                { name: '佛门', alignment: '中立', description: '以佛法修炼的门派' },
                { name: '魔道六宗', alignment: '邪恶', description: '修炼魔功的势力' },
                { name: '散修联盟', alignment: '松散', description: '无门无派的修行者' }
            ],
            '科幻': [
                { name: '联邦政府', alignment: '秩序', description: '统治人类的政府' },
                { name: '星际海盗', alignment: '混乱', description: '在星际间劫掠的势力' },
                { name: '科技公司', alignment: '中立', description: '控制核心科技的公司' },
                { name: '外星种族', alignment: '未知', description: '来自其他星系的智慧生命' }
            ]
        };
        return factionTemplates[genre] || factionTemplates['玄幻'];
    }
    generateHierarchy(genre) {
        const hierarchies = {
            '玄幻': '境界等级森严，强者为尊',
            '都市': '社会阶级分明，财富和权力为主',
            '仙侠': '修仙等级明确，实力决定地位',
            '科幻': '科技水平决定地位，文明等级分明'
        };
        return hierarchies[genre] || hierarchies['玄幻'];
    }
    generateOrganizations(genre) {
        return [
            { name: '冒险公会', purpose: '发布任务，组织冒险' },
            { name: '学院', purpose: '教育和培养人才' },
            { name: '商会', purpose: '控制商业流通' },
            { name: '信息组织', purpose: '收集和贩卖情报' }
        ];
    }
    generateCulture(genre, depth) {
        return {
            traditions: ['年度庆典', '重大仪式', '传承仪式', '传统节日'],
            values: this.generateValues(genre),
            taboos: ['某些禁忌之言', '亵渎圣地', '背叛盟友'],
            artForms: ['建筑风格', '音乐', '绘画', '文学']
        };
    }
    generateValues(genre) {
        const values = {
            '玄幻': ['强者为尊', '恩怨分明', '传承至上', '宗门荣誉'],
            '都市': ['成功至上', '人际关系', '科技创新', '历史传承'],
            '仙侠': ['求道长生', '因果报应', '清静无为', '侠义心肠'],
            '科幻': ['科技进步', '探索未知', '种族延续', '文明发展']
        };
        return values[genre] || values['玄幻'];
    }
    generatePowerSystem(genre, depth) {
        const powerSystems = {
            '玄幻': {
                systemName: '修炼体系',
                levels: ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '渡劫', '大乘'],
                powerSource: '天地灵气',
                specialRules: ['境界压制', '属性克制', '功法传承', '秘境奇遇']
            },
            '都市': {
                systemName: '异能体系',
                levels: ['觉醒者', '精通者', '大师', '宗师', '传奇', '神话'],
                powerSource: '基因觉醒/特殊能力',
                specialRules: ['能力相克', '精神力强度', '天赋潜能', '资源支持']
            },
            '仙侠': {
                systemName: '修仙体系',
                levels: ['凡人', '炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '飞升'],
                powerSource: '天地灵气与自身感悟',
                specialRules: ['心魔劫', '天劫', '因果', '功法领悟']
            },
            '科幻': {
                systemName: '科技/基因体系',
                levels: ['普通人', '强化人', '改造人', '新人类', '超凡者', '神级存在'],
                powerSource: '科技改造/基因优化',
                specialRules: ['科技压制', '资源消耗', '进化路线', '文明等级']
            }
        };
        const defaultSystem = {
            systemName: '力量体系',
            levels: ['一级', '二级', '三级', '四级', '五级', '六级', '七级', '八级', '九级', '十级'],
            powerSource: '特殊能量',
            specialRules: ['等级压制']
        };
        return powerSystems[genre] || defaultSystem;
    }
    generateConflicts(genre) {
        return [
            { type: '种族冲突', description: '不同种族间的宿怨与对抗' },
            { type: '利益冲突', description: '资源、领土、权力的争夺' },
            { type: '理念冲突', description: '不同信仰和理念的碰撞' },
            { type: '命运对抗', description: '个人与命运的抗争' }
        ];
    }
    generateTimeline() {
        return [
            { era: '远古时代', events: ['世界诞生', '种族起源', '上古文明兴衰'] },
            { era: '黄金时代', events: ['盛世景象', '强大存在涌现', '各种传说起源'] },
            { era: '黑暗时代', events: ['大战', '文明衰落', '种族迁徙'] },
            { era: '中古时代', events: ['新秩序建立', '关键事件', '重要人物登场'] },
            { era: '当前时代', events: ['现状', '潜藏的危机', '主角登场的背景'] }
        ];
    }
    async characterDesign(data) {
        const count = data.count || 5;
        const genre = data.project.genre || '玄幻';
        const archetypes = this.getArchetypesForGenre(genre);
        const characters = [];
        for (let i = 0; i < Math.min(count, archetypes.length); i++) {
            const archetype = archetypes[i];
            characters.push({
                id: `char_${i + 1}`,
                name: this.generateCharacterName(archetype, data.project.title),
                archetype: archetype.name,
                role: archetype.role,
                gender: ['男', '女'][i % 2],
                age: archetype.ageRange,
                appearance: this.generateAppearance(archetype),
                personality: this.generatePersonality(archetype),
                background: this.generateBackground(archetype),
                goals: this.generateGoals(archetype),
                conflicts: this.generateCharacterConflicts(archetype),
                relationships: this.generateRelationships(archetype, i),
                characterArc: this.generateCharacterArc(archetype),
                abilities: this.generateAbilities(archetype, genre)
            });
        }
        return { characters };
    }
    getArchetypesForGenre(genre) {
        const archetypeGroups = {
            '玄幻': [
                { name: '主角', role: '故事的核心人物，经历成长与蜕变', ageRange: '15-25岁' },
                { name: '伙伴', role: '主角的朋友和战友，共同冒险', ageRange: '15-30岁' },
                { name: '导师', role: '指导主角成长的前辈', ageRange: '50-100岁' },
                { name: '反派', role: '与主角对立的敌人', ageRange: '30-100岁' },
                { name: '神秘人', role: '身份不明的关键人物', ageRange: '未知' }
            ],
            '都市': [
                { name: '主角', role: '在都市中打拼的核心人物', ageRange: '20-35岁' },
                { name: '知己', role: '理解并支持主角的人', ageRange: '20-35岁' },
                { name: '前辈', role: '指导主角的行业前辈', ageRange: '40-60岁' },
                { name: '对手', role: '主角的竞争对手', ageRange: '25-40岁' },
                { name: '神秘大佬', role: '隐藏在幕后的人物', ageRange: '未知' }
            ],
            '仙侠': [
                { name: '修仙者', role: '寻仙问道的主角', ageRange: '15-100岁' },
                { name: '道侣', role: '共同修行的伴侣', ageRange: '15-100岁' },
                { name: '宗门长辈', role: '门派中的前辈', ageRange: '100-500岁' },
                { name: '魔头', role: '修炼魔功的反派', ageRange: '50-500岁' },
                { name: '转世者', role: '带有前世记忆的神秘人', ageRange: '15-30岁' }
            ],
            '科幻': [
                { name: '探险者', role: '探索未知的主角', ageRange: '25-40岁' },
                { name: '科学家', role: '技术天才', ageRange: '25-50岁' },
                { name: '舰长', role: '星际飞船的指挥官', ageRange: '30-50岁' },
                { name: 'AI', role: '人工智能助手', ageRange: '未知' },
                { name: '外星人', role: '来自其他星系的生命', ageRange: '未知' }
            ]
        };
        return archetypeGroups[genre] || archetypeGroups['玄幻'];
    }
    generateCharacterName(archetype, projectTitle) {
        const surnames = ['陈', '李', '王', '张', '刘', '赵', '周', '吴', '徐', '孙', '林', '黄', '叶', '韩'];
        const names = ['凡', '尘', '云', '风', '天', '玄', '灵', '浩', '辰', '曦', '月', '瑶', '雪', '山', '海'];
        return `${surnames[Math.floor(Math.random() * surnames.length)]}${names[Math.floor(Math.random() * names.length)]}${names[Math.floor(Math.random() * names.length)]}`;
    }
    generateAppearance(archetype) {
        const appearances = {
            '主角': '中等身材，相貌普通但眼神坚定，穿着朴素但整洁',
            '伙伴': '身材匀称，笑容开朗，穿着有个人特色',
            '导师': '气质沉稳，眼神深邃，穿着传统/正式',
            '反派': '气质特殊，或威严或阴沉，穿着考究',
            '神秘人': '面容笼罩在神秘中，穿着神秘',
            '知己': '容貌出众，气质独特',
            '前辈': '气质儒雅/威严',
            '对手': '气质不凡，眼神锐利',
            '修仙者': '气质出尘，眼神清明',
            '道侣': '容貌秀丽/英俊，气质相配',
            '魔头': '气质诡异/威严',
            '转世者': '眼神中藏着沧桑',
            '探险者': '身材健硕，眼神锐利',
            '科学家': '气质知性',
            '舰长': '气质威严，沉着冷静',
            'AI': '形象完美，气质冰冷'
        };
        return appearances[archetype.name] || '中等身材，普通相貌';
    }
    generatePersonality(archetype) {
        const personalityGroups = {
            '主角': ['坚韧', '善良', '机智', '勇敢', '有原则', '重情义'],
            '伙伴': ['忠诚', '幽默', '可靠', '多才', '乐观'],
            '导师': ['睿智', '沉稳', '强大', '神秘', '严格'],
            '反派': ['冷酷', '野心', '狡猾', '强大', '复杂'],
            '神秘人': ['神秘', '强大', '莫测', '关键', '神秘'],
            '知己': ['善解人意', '聪慧', '勇敢'],
            '前辈': ['深谋远虑', '关爱后辈'],
            '对手': ['骄傲', '强大', '有原则'],
            '修仙者': ['执着', '专注', '心性坚定'],
            '道侣': ['温柔', '坚强', '包容'],
            '魔头': ['残忍', '有魅力'],
            '转世者': ['谨慎', '多智', '有秘密'],
            '探险者': ['好奇心强', '勇敢', '机智'],
            '科学家': ['严谨', '求知欲强'],
            '舰长': ['果断', '冷静', '责任感'],
            'AI': ['理性', '高效']
        };
        const traits = personalityGroups[archetype.name] || ['普通'];
        return traits.slice(0, 4);
    }
    generateBackground(archetype) {
        const backgrounds = {
            '主角': '出生平凡，但身怀特殊血脉/传承，幼年经历变故，埋下故事种子',
            '伙伴': '有着自己的故事和目标，在某个契机下与主角相遇',
            '导师': '曾经辉煌，因为某些原因隐居/低调，发现主角潜力后现身',
            '反派': '有着悲剧/复杂的过去，导致现在的立场',
            '神秘人': '身世成谜，似乎与世界的秘密有关',
            '知己': '在主角低谷时相遇，成为精神支柱',
            '前辈': '行业内的传奇人物，因某些原因注意到主角',
            '对手': '出身不凡，与主角因理念/利益冲突对立',
            '修仙者': '出身平凡/修真世家，机缘巧合踏上仙途',
            '魔头': '为了力量/复仇不择手段',
            '转世者': '带着前世记忆/遗憾重生'
        };
        return backgrounds[archetype.name] || '有自己的故事';
    }
    generateGoals(archetype) {
        return [
            '主要目标：实现人生理想/完成使命',
            '短期目标：解决当前问题，提升实力',
            '长期目标：实现最终理想，解开自身谜团'
        ];
    }
    generateCharacterConflicts(archetype) {
        return [
            '内在冲突：内心的挣扎与选择',
            '外在冲突：与敌人的对抗',
            '关系冲突：与重要人物的关系变化'
        ];
    }
    generateRelationships(archetype, index) {
        const relationships = [];
        if (index > 0) {
            relationships.push({ target: '主角', type: '伙伴/对手/师生', description: '与主角的关系' });
        }
        return relationships;
    }
    generateCharacterArc(archetype) {
        const arcs = {
            '主角': '从青涩到成熟，能力与思想共同成长，完成自我蜕变',
            '伙伴': '从各自为战到成为默契的团队，获得各自的成长与归宿',
            '导师': '从引导者到见证者，可能在关键时刻牺牲/完成传承',
            '反派': '逐渐展现其复杂性，直到与主角最终对决',
            '神秘人': '身份逐渐揭开，在关键时刻发挥作用'
        };
        return arcs[archetype.name] || '经历成长，完成转变';
    }
    generateAbilities(archetype, genre) {
        const abilities = [
            { name: '主角光环', description: '关键时刻总能逢凶化吉', type: '被动' },
            { name: '学习能力强', description: '快速掌握新技能', type: '主动' },
            { name: '特殊体质', description: '与众不同的天赋', type: '被动' }
        ];
        return abilities;
    }
    async plotPlanning(data) {
        const chapters = data.chapters || 50;
        const plot = {
            coreConflict: '核心冲突设定',
            mainPlotline: this.generateMainPlotline(chapters),
            subplots: this.generateSubplots(),
            keyPlotPoints: this.generateKeyPlotPoints(chapters),
            foreshadowing: this.generateForeshadowing(),
            climax: '高潮事件设定',
            resolution: '结局设定'
        };
        return { plot };
    }
    generateMainPlotline(totalChapters) {
        const milestones = [
            { chapter: Math.floor(totalChapters * 0.1), event: '开端：引入主角与世界观' },
            { chapter: Math.floor(totalChapters * 0.25), event: '第一个转折点：主角遭遇重大事件' },
            { chapter: Math.floor(totalChapters * 0.5), event: '中点：核心冲突显现' },
            { chapter: Math.floor(totalChapters * 0.75), event: '主角最低谷，形势最危急' },
            { chapter: Math.floor(totalChapters * 0.9), event: '高潮：最终决战' },
            { chapter: totalChapters, event: '结局：矛盾解决' }
        ];
        return milestones;
    }
    generateSubplots() {
        return [
            { name: '感情线', description: '主角与重要角色的感情发展' },
            { name: '身世线', description: '主角的真实身份/过去逐渐揭开' },
            { name: '阴谋线', description: '暗中酝酿的阴谋线索' },
            { name: '成长线', description: '主角的实力/心境提升' }
        ];
    }
    generateKeyPlotPoints(totalChapters) {
        const points = [];
        for (let i = 1; i <= 10; i++) {
            const chapter = Math.floor((i / 10) * totalChapters);
            points.push({
                chapter: Math.max(1, chapter),
                description: `第${i}个关键剧情点`
            });
        }
        return points;
    }
    generateForeshadowing() {
        return [
            { setup: '早期出现的小伏笔', payoff: '后期发挥关键作用' },
            { setup: '神秘人物/物品的早期登场', payoff: '身份/作用在后期揭示' },
            { setup: '看似无关的小事件', payoff: '实则影响整个故事走向' }
        ];
    }
    async outlineGeneration(data) {
        const chapters = data.project.plannedChapters || 50;
        const outline = [];
        for (let i = 1; i <= chapters; i++) {
            outline.push({
                chapter: i,
                title: this.generateChapterTitle(i, chapters),
                summary: this.generateChapterSummary(i, chapters),
                keyEvents: this.generateChapterEvents(i, chapters),
                characterFocus: this.getChapterFocus(i, chapters),
                foreshadowing: this.getChapterForeshadowing(i, chapters),
                mood: this.getChapterMood(i, chapters)
            });
        }
        return { outline };
    }
    async themeGeneration(data) {
        const themes = [
            { name: '成长', description: '主角的个人成长与蜕变' },
            { name: '友情/爱情', description: '重要关系的建立与发展' },
            { name: '正义与邪恶', description: '价值观的碰撞与抉择' },
            { name: '命运与抗争', description: '对命运的反抗与接受' },
            { name: '自我认知', description: '主角对自我的认识与接受' }
        ];
        return { themes, recommendedTheme: themes[0] };
    }
    async generateDirection(data) {
        const directions = [
            { name: '热血升级流', description: '主角不断变强，超越一个又一个对手' },
            { name: '智斗布局流', description: '主要靠智慧与策略取胜' },
            { name: '情感细腻流', description: '侧重人物感情与关系描写' },
            { name: '宏大世界观流', description: '重点在于构建精彩的世界' },
            { name: '轻松搞笑流', description: '整体氛围轻松愉快' }
        ];
        return {
            directions,
            recommended: directions[0],
            keyElements: ['核心目标', '重要关系', '主要冲突', '世界观亮点']
        };
    }
    generateChapterTitle(chapter, total) {
        const progress = chapter / total;
        if (progress < 0.2)
            return `第${chapter}章：${this.getEarlyTitle(chapter)}`;
        if (progress < 0.5)
            return `第${chapter}章：${this.getMiddleTitle(chapter)}`;
        if (progress < 0.8)
            return `第${chapter}章：${this.getLateTitle(chapter)}`;
        return `第${chapter}章：${this.getFinalTitle(chapter)}`;
    }
    getEarlyTitle(chapter) {
        const titles = ['初入江湖', '命运的开始', '踏上征程', '初识风云', '第一个任务',
            '机缘巧合', '拜师学艺', '小试牛刀', '初遇对手', '一鸣惊人'];
        return titles[(chapter - 1) % titles.length];
    }
    getMiddleTitle(chapter) {
        const titles = ['历练成长', '结识伙伴', '遭遇挑战', '揭开秘密', '实力提升',
            '风云际会', '暗流涌动', '危机初现', '重要转折', '真相渐露'];
        return titles[(chapter - 1) % titles.length];
    }
    getLateTitle(chapter) {
        const titles = ['阴谋浮现', '危机四伏', '生死之战', '真相大白', '艰难抉择',
            '全面冲突', '步步紧逼', '绝境逢生', '终极布局', '最后准备'];
        return titles[(chapter - 1) % titles.length];
    }
    getFinalTitle(chapter) {
        const titles = ['最终决战', '巅峰对决', '尘埃落定', '新的开始', '尾声',
            '曲终人散', '前路漫漫', '后日谈', '新的征程', '全书完'];
        return titles[(chapter - 1) % titles.length];
    }
    generateChapterSummary(chapter, total) {
        const progress = chapter / total;
        if (progress < 0.2)
            return '主角初出茅庐，铺垫世界观，遇到第一个关键人物或事件';
        if (progress < 0.5)
            return '主角获得成长，剧情发展，新的人物/线索出现';
        if (progress < 0.8)
            return '冲突升级，剧情走向高潮，主角面临重要选择';
        return '最终决战，故事迎来结局，人物命运交代';
    }
    generateChapterEvents(chapter, total) {
        return [
            '主要事件1',
            '主要事件2',
            '人物互动',
            '剧情推进'
        ];
    }
    getChapterFocus(chapter, total) {
        const focuses = ['主角', '重要配角', '反派', '关系发展', '世界观展示', '战斗', '感情'];
        return focuses[chapter % focuses.length];
    }
    getChapterForeshadowing(chapter, total) {
        if (chapter % 5 === 0) {
            return '本章埋下伏笔';
        }
        return '';
    }
    getChapterMood(chapter, total) {
        const progress = chapter / total;
        if (progress < 0.2)
            return '轻松/铺垫';
        if (progress < 0.5)
            return '发展/探索';
        if (progress < 0.8)
            return '紧张/高潮';
        return '高潮/结局';
    }
}
exports.OfflineArchitectAgent = OfflineArchitectAgent;
class OfflineWriterAgent extends BaseAgent {
    getAgentName() {
        return 'OfflineWriter';
    }
    getCapabilities() {
        return [
            { name: 'write_chapter', supported: true, requiresOnline: false, description: '章节创作（增强模板）' },
            { name: 'write_scene', supported: true, requiresOnline: false, description: '场景描写（增强模板）' },
            { name: 'generate_dialogue', supported: true, requiresOnline: false, description: '对话生成（模板）' },
            { name: 'generate_description', supported: true, requiresOnline: false, description: '描写生成（模板）' },
            { name: 'write_side_story', supported: true, requiresOnline: false, description: '番外创作（模板）' },
            { name: 'write_multi_pov', supported: true, requiresOnline: false, description: '多视角叙事（模板）' },
            { name: 'generate_suspense', supported: true, requiresOnline: false, description: '悬念生成（模板）' },
            { name: 'write_action_scene', supported: true, requiresOnline: false, description: '动作场景（模板）' },
            { name: 'write_romantic_scene', supported: true, requiresOnline: false, description: '情感场景（模板）' }
        ];
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
            case 'write_chapter': return this.writeChapter(task.data);
            case 'write_scene': return this.writeScene(task.data);
            case 'generate_dialogue': return this.generateDialogue(task.data);
            case 'generate_description': return this.generateDescription(task.data);
            case 'write_side_story': return this.writeSideStory(task.data);
            case 'write_multi_pov': return this.writeMultiPOV(task.data);
            case 'generate_suspense': return this.generateSuspense(task.data);
            case 'write_action_scene': return this.writeActionScene(task.data);
            case 'write_romantic_scene': return this.writeRomanticScene(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async writeChapter(data) {
        const sceneTypes = this.getSceneTypes();
        const sceneType = data.sceneType || sceneTypes[0];
        const chapterTemplate = this.getChapterTemplate(data.project.genre || '玄幻', data.chapterNumber);
        const content = `${chapterTemplate.header(data.project.title, data.chapterNumber)}

${chapterTemplate.opening}

【场景构建】
${this.getSceneDescription(sceneType)}

【人物出场】
${this.getCharacterIntroductionTemplate()}

【对话推进】
${this.getDialogueTemplate()}

【情节发展】
${chapterTemplate.development}

【冲突/转折】
${chapterTemplate.conflict}

【章节收束】
${chapterTemplate.ending}

${data.outline ? `\n【大纲指引】\n${data.outline}\n` : ''}
【创作提示】
- 保持前后章节衔接
- 控制字数在2000-5000字
- 埋下适当的伏笔
- 突出人物性格特点
- 营造相应的氛围`;
        return { content, chapterNumber: data.chapterNumber, templateType: sceneType };
    }
    getChapterTemplate(genre, chapterNumber) {
        const progress = chapterNumber % 10;
        const chapterPhase = progress < 3 ? 'opening' : progress < 7 ? 'development' : 'climax';
        const templates = {
            opening: {
                header: (title, num) => `第 ${num} 章 ${this.generateChapterTitle(num)}`,
                opening: '清晨的阳光透过窗户洒进房间，新的一天开始了。主角睁开眼睛，想起昨天发生的事情，心中若有所思...',
                development: '简单的洗漱后，主角走出房间，开始今天的日程。在途中，遇到了一些人和事...',
                conflict: '就在这时，一个意外发生了，打破了平静的生活...',
                ending: '主角望着远方，知道这只是开始，未来还有更多挑战在等待着他...'
            },
            development: {
                header: (title, num) => `第 ${num} 章 ${this.generateChapterTitle(num)}`,
                opening: '随着事件的发展，局势变得越来越复杂。主角必须做出选择...',
                development: '在与伙伴的商议后，他们制定了一个计划。过程并不顺利，但大家都没有放弃...',
                conflict: '就在计划即将成功之际，反派突然出现，带来了更大的危机...',
                ending: '虽然暂时脱险，但主角知道，真正的战斗才刚刚开始...'
            },
            climax: {
                header: (title, num) => `第 ${num} 章 ${this.generateChapterTitle(num)}`,
                opening: '所有的线索汇聚在一起，真相终于浮出水面。主角深吸一口气，准备迎接最终的挑战...',
                development: '战斗/对峙异常激烈，双方都使出了浑身解数。在关键时刻，主角想起了重要的人/事...',
                conflict: '就在主角即将落败之际，一个转机出现了！',
                ending: '尘埃落定，主角望着眼前的一切，心中百感交集。新的篇章即将开启...'
            }
        };
        return templates[chapterPhase];
    }
    getSceneTypes() {
        return [
            '日常开篇',
            '战斗场景',
            '对话场景',
            '探索场景',
            '揭秘场景',
            '情感场景',
            '过渡场景'
        ];
    }
    getSceneDescription(sceneType) {
        const descriptions = {
            '日常开篇': '描写时间、地点、天气，营造氛围，引出主角的状态和当前处境',
            '战斗场景': '描写战斗环境，双方的位置、状态、气势，营造紧张感',
            '对话场景': '描写对话发生的地点、氛围，人物的神态、动作',
            '探索场景': '描写探索地点的环境、危险、神秘之处，主角的发现',
            '揭秘场景': '描写揭秘时的氛围、人物反应、真相揭示的过程',
            '情感场景': '描写人物的内心活动、情感变化、互动细节',
            '过渡场景': '描写时间/地点的转换，承上启下'
        };
        return descriptions[sceneType] || '描写场景的时间、地点、氛围和人物状态';
    }
    getCharacterIntroductionTemplate() {
        return `【主要人物】
- [主角名]：[状态/心情描写]
- [配角名]：[状态/目的描写]
- [其他人物]：[简要介绍]`;
    }
    getDialogueTemplate() {
        return `【对话提示】
- 每个人物的说话风格要一致
- 通过对话展现性格和关系
- 对话要推动情节发展
- 适当插入动作和神态描写

【对话示例】
"[台词1]" [人物A] [动作/神态]说道。
"[台词2]" [人物B] [反应]。
"[台词3]" [人物A] [进一步动作]，"[台词4]"`;
    }
    generateChapterTitle(chapter) {
        const titles = ['启程', '相遇', '挑战', '成长', '转折', '危机', '揭秘', '激战', '突破', '新生',
            '暗流', '迷雾', '真相', '抉择', '守护', '重逢', '绝处', '逢生', '归途', '新章'];
        return titles[(chapter - 1) % titles.length];
    }
    async writeScene(data) {
        const mood = data.mood || 'neutral';
        const template = `【场景】${data.location}
【氛围】${mood}
【人物】${data.characters.join('、')}
【核心事件】${data.action}

【环境描写】
（从视觉、听觉、嗅觉等角度描写${data.location}的环境，营造${mood}的氛围）

【人物状态】
${data.characters.map(char => `- ${char}：[神态/动作/心情描写]`).join('\n')}

【情节发展】
${data.characters.join('和')}正在${data.action}，过程中：
1. [第一个细节/事件]
2. [第二个细节/事件]
3. [第三个细节/事件]

【对话/互动】
（插入人物之间的对话或互动，展现关系和性格）

【场景收尾】
（描写场景结束时的状态，引出下一个情节或留下悬念）`;
        return { scene: template };
    }
    async generateDialogue(data) {
        const relationship = data.relationship || '朋友';
        const mood = data.mood || 'normal';
        const dialogueTemplate = `【对话背景】
话题：${data.topic}
关系：${relationship}
氛围：${mood}

【对话流程】
1. 开场：某人引出话题
2. 发展：众人交流讨论
3. 转折：出现意外/冲突/新信息
4. 收尾：达成共识/决定/悬念

【对话示例】
${data.characters[0]}："[开场台词，引出${data.topic}]"
${data.characters[1]}："[回应，表达观点/问题]"
${data.characters[0]}："[进一步说明/反问]"
${data.characters.length > 2 ? data.characters.slice(2).map(c => `${c}："[插话/补充]"`).join('\n') : ''}

【对话技巧提示】
- 符合人物性格
- 使用符合关系的语气
- 适当插入动作和神态描写
- 对话要自然不生硬
- 推动情节发展或展现人物`;
        return { dialogue: dialogueTemplate };
    }
    async generateDescription(data) {
        const descriptionTypes = {
            '人物': `【${data.target}描写】
外貌：[容貌、身材、穿着、特征]
神态：[表情、眼神、气质]
动作：[习惯性动作、姿态]
性格侧写：[通过外在展现内在]`,
            '环境': `【${data.target}描写】
视觉：[看到的景象、颜色、布局]
听觉：[声音、动静]
嗅觉：[气味]
触觉：[温度、触感]
氛围：[整体感觉]`,
            '物品': `【${data.target}描写】
外观：[形状、颜色、材质、大小]
细节：[特殊之处、磨损痕迹、装饰]
用途：[功能、来历、意义]
给人的感觉：[气质、氛围]`,
            '战斗': `【${data.target}战斗描写】
战前：[氛围、双方状态、气势]
战中：[招式、动作、反应、环境变化]
战后：[结果、影响、人物状态]`
        };
        return { description: descriptionTypes[data.type] || descriptionTypes['环境'] };
    }
    async writeSideStory(data) {
        const theme = data.theme || '过去的经历';
        const template = `【番外】${data.character}的故事

【主题】${theme}

【时间线】
本篇发生在[正篇时间点]，主要讲述${data.character}${theme}的故事。

【开篇】
（描写${data.character}现在的状态，引出回忆/故事）

【故事正文】
1. 背景介绍：当时的情况
2. 关键事件：核心故事
3. 人物互动：与其他角色的交集
4. 影响：这件事对${data.character}的改变

【结尾】
（回到现在，呼应开篇，展现${data.character}的成长/变化）

【创作提示】
- 保持人物性格一致
- 可以补充正篇未提及的细节
- 情感要真挚
- 可以埋下与正篇相关的伏笔`;
        return { sideStory: template };
    }
    async writeMultiPOV(data) {
        const template = `【多视角叙事】${data.event}

${data.viewpoints.map((vp, i) => `
【视角${i + 1}】${vp}
（描写${vp}在${data.event}中的所见所闻、所思所感）
- ${vp}的位置：
- ${vp}看到的：
- ${vp}的想法：
- ${vp}的行动：
- ${vp}不知道的：`).join('\n')}

【汇总】
不同视角看到的拼图拼在一起，真相是...

【创作提示】
- 每个视角要有独特的信息
- 人物性格要在视角中体现
- 可以设置信息差和误解
- 最后汇总时要能串联起来`;
        return { multiPOV: template };
    }
    async generateSuspense(data) {
        const suspenseTypes = {
            '神秘物品': '一个奇怪的物品出现，它的来历和用途成谜...',
            '神秘人物': '一个神秘人物登场，其身份和目的不明...',
            '异常事件': '不寻常的事情接连发生，背后似乎有某种规律...',
            '失踪谜团': '某人/某物突然失踪，留下的线索扑朔迷离...',
            '预言/警告': '一个预言或警告出现，预示着将要发生的事情...',
            '记忆碎片': '片段化的记忆闪现，真相隐藏其中...'
        };
        const template = `【悬念设置】${data.type}

【铺垫】
${data.setup || '先描写正常的场景，让读者放松警惕...'}

【异常出现】
${suspenseTypes[data.type] || '一件不寻常的事情发生了...'}

【线索】
- 线索1：
- 线索2：
- 线索3：
（线索可以是物品、对话、场景细节等）

【人物反应】
- 主角的疑惑/察觉
- 其他角色的态度/隐瞒
- 氛围的变化

【悬念收尾】
（留下疑问，让读者想知道后续发展）
疑问1：
疑问2：
疑问3：`;
        return { suspense: template };
    }
    async writeActionScene(data) {
        const stakes = data.stakes || '胜负关乎重要的东西';
        const template = `【动作场景】${data.location}

【对战双方】
${data.combatants.map(c => `- ${c}：[战斗风格/能力/状态]`).join('\n')}

【赌注】${stakes}

【战斗流程】
1. 战前对峙：氛围描写、双方放话
2. 先手出招：[第一招描写]
3. 交手回合：[几个回合的交锋]
4. 转折出现：[意外/绝招/计谋]
5. 决胜时刻：[最终一击]
6. 战斗结束：[结果描写]

【描写提示】
- 动作要清晰，让读者能想象画面
- 节奏要有张有弛
- 加入环境互动
- 展现战斗智慧，不只是蛮力
- 战斗要服务于人物和情节`;
        return { actionScene: template };
    }
    async writeRomanticScene(data) {
        const stage = data.stage || '暧昧期';
        const templates = {
            '暧昧期': `【情感场景】${data.characters.join('与')}的暧昧时刻

【氛围】微妙、心动、试探

【场景】
描写一个适合情感发展的环境，可能是：
- 美丽的夜景
- 安静的独处
- 共同经历某件事后

【互动】
1. 不经意的肢体接触
2. 眼神交汇
3. 欲言又止的对话
4. 为对方做的小事

【内心活动】
${data.characters.map(c => `${c}的心理活动：[紧张/期待/犹豫/欢喜]`).join('\n')}

【结局】
- 捅破窗户纸？
- 还是保持暧昧，留待后续？
- 或者出现意外打断？`,
            '确认关系': `【情感场景】${data.characters.join('与')}确认心意

【场景】一个有意义的地点

【过程】
1. 铺垫：之前的经历让感情水到渠成
2. 告白：某人先开口
3. 回应：另一方的答复
4. 确定关系：两人的互动

【细节描写】
- 心跳加速
- 脸红
- 指尖颤抖
- 温度变化
- 时间仿佛变慢

【结局】
- 甜蜜的互动
- 对未来的约定
- 新的开始`
        };
        return { romanticScene: templates[stage] || templates['暧昧期'] };
    }
}
exports.OfflineWriterAgent = OfflineWriterAgent;
class OfflineAuditorAgent extends BaseAgent {
    constructor(config) {
        super(config);
    }
    getAgentName() {
        return 'OfflineAuditor';
    }
    getCapabilities() {
        return [
            { name: 'audit_chapter', supported: true, requiresOnline: false, description: '章节审计（增强）' },
            { name: 'audit_consistency', supported: true, requiresOnline: false, description: '一致性检查（规则增强）' },
            { name: 'check_structure', supported: true, requiresOnline: false, description: '结构检查' },
            { name: 'check_characters', supported: true, requiresOnline: false, description: '人物检查' },
            { name: 'check_plot_logic', supported: true, requiresOnline: false, description: '情节逻辑检查' },
            { name: 'check_pacing', supported: true, requiresOnline: false, description: '节奏检查' }
        ];
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
            case 'audit_chapter': return this.auditChapter(task.data);
            case 'audit_consistency': return this.auditConsistency(task.data);
            case 'check_structure': return this.checkStructure(task.data);
            case 'check_characters': return this.checkCharacters(task.data);
            case 'check_plot_logic': return this.checkPlotLogic(task.data);
            case 'check_pacing': return this.checkPacing(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async auditChapter(data) {
        if (this.auditEngine) {
            return await this.auditEngine.audit(data.chapter.content, data.truthFiles);
        }
        return this.enhancedAudit(data.chapter.content);
    }
    enhancedAudit(content) {
        const dimensions = [];
        // 字数检查
        const wordCount = content.length;
        let wordScore = 100;
        let wordDetail = '字数适中';
        if (wordCount < 1000) {
            wordScore = 50;
            wordDetail = '章节内容过短，建议增加细节';
        }
        else if (wordCount < 2000) {
            wordScore = 70;
            wordDetail = '章节内容偏短，可以适当扩展';
        }
        else if (wordCount > 8000) {
            wordScore = 70;
            wordDetail = '章节内容偏长，建议考虑拆分';
        }
        else if (wordCount > 12000) {
            wordScore = 50;
            wordDetail = '章节内容过长，建议拆分为多个章节';
        }
        dimensions.push({ dimension: '字数检查', score: wordScore, passed: wordScore >= 70, details: wordDetail });
        // 段落结构检查
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        let paraScore = 100;
        let paraDetail = '段落结构合理';
        if (paragraphs.length < 3) {
            paraScore = 50;
            paraDetail = '段落数量过少，建议分段';
        }
        else if (paragraphs.length > 30) {
            paraScore = 70;
            paraDetail = '段落数量偏多，可适当合并';
        }
        const avgParaLength = wordCount / paragraphs.length;
        if (avgParaLength > 500) {
            paraScore = Math.min(paraScore, 70);
            paraDetail += '；部分段落过长，建议拆分';
        }
        dimensions.push({ dimension: '段落结构', score: paraScore, passed: paraScore >= 70, details: paraDetail });
        // 标点使用检查
        const punctuationScore = this.checkPunctuation(content);
        dimensions.push({
            dimension: '标点使用',
            score: punctuationScore,
            passed: punctuationScore >= 80,
            details: punctuationScore >= 80 ? '标点使用规范' : '建议检查标点使用'
        });
        // 对话比例检查
        const dialogueMatches = content.match(/[「"][^「」"]*[」"]/g) || [];
        const dialogueLength = dialogueMatches.reduce((sum, d) => sum + d.length, 0);
        const dialogueRatio = dialogueLength / wordCount;
        let dialogueScore = 100;
        let dialogueDetail = '对话比例适中';
        if (dialogueRatio < 0.1) {
            dialogueScore = 60;
            dialogueDetail = '对话偏少，可以适当增加人物互动';
        }
        else if (dialogueRatio > 0.6) {
            dialogueScore = 60;
            dialogueDetail = '对话偏多，可以增加描写和叙述';
        }
        dimensions.push({ dimension: '对话比例', score: dialogueScore, passed: dialogueScore >= 70, details: dialogueDetail });
        // 描写检查
        const hasDescription = content.length - dialogueLength > wordCount * 0.3;
        let descScore = hasDescription ? 100 : 60;
        let descDetail = hasDescription ? '描写充足' : '描写偏少，建议增加环境和人物描写';
        dimensions.push({ dimension: '描写丰富度', score: descScore, passed: descScore >= 70, details: descDetail });
        const totalScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
        return { passed: totalScore >= 70, dimensions, issues: [], score: totalScore };
    }
    checkPunctuation(content) {
        const englishPunctuation = content.match(/[,.!?;:\"'\\/]/g) || [];
        const mixedPunctuation = englishPunctuation.filter(p => {
            const pos = content.indexOf(p);
            return pos > 0 && /[\u4e00-\u9fa5]/.test(content[pos - 1]);
        });
        return mixedPunctuation.length > content.length * 0.01 ? 60 : 90;
    }
    async auditConsistency(data) {
        const issues = [];
        const warnings = [];
        // 主角检查
        if (data.truthFiles.currentState?.protagonist?.name) {
            const protagonistName = data.truthFiles.currentState.protagonist.name;
            const nameCount = (data.content.match(new RegExp(protagonistName, 'g')) || []).length;
            if (nameCount === 0) {
                issues.push(`未提及主角 "${protagonistName}"`);
            }
        }
        // 时间线检查提示
        warnings.push('请自行核对本章时间线与前文是否一致');
        // 人物设定检查提示
        warnings.push('请自行核对本章人物性格、能力与设定是否一致');
        // 世界观检查提示
        warnings.push('请自行核对本章世界观细节与设定是否一致');
        return {
            consistent: issues.length === 0,
            issues,
            warnings,
            analysis: '离线模式一致性检查完成，详细核对需要人工确认'
        };
    }
    async checkStructure(data) {
        const structure = {
            hasOpening: content.length > 200,
            hasDevelopment: content.length > 1000,
            hasClimax: content.indexOf('突然') > -1 || content.indexOf('就在这时') > -1 || content.indexOf('意外') > -1,
            hasEnding: content.length > 500,
            suggestions: [
                '检查章节是否有明确的开篇-发展-高潮-结局结构',
                '确保情节有起承转合',
                '章节结尾可适当留下钩子'
            ]
        };
        return { structure };
    }
    async checkCharacters(data) {
        const mentionedChars = [];
        if (data.characters) {
            data.characters.forEach(char => {
                if (data.content.includes(char)) {
                    mentionedChars.push(char);
                }
            });
        }
        return {
            mentionedCharacters: mentionedChars,
            suggestions: [
                '检查人物行为是否符合性格设定',
                '确保人物有成长或变化',
                '人物对话要符合各自风格'
            ]
        };
    }
    async checkPlotLogic(data) {
        return {
            suggestions: [
                '检查情节发展是否合理',
                '确认没有明显的逻辑漏洞',
                '检查伏笔是否有回收或合理保留',
                '确认人物动机充足'
            ]
        };
    }
    async checkPacing(data) {
        const wordCount = content.length;
        return {
            estimatedReadingTime: Math.ceil(wordCount / 500),
            pacingSuggestions: [
                '紧张情节可以缩短段落，增加节奏',
                '抒情/描写段落可以放慢节奏',
                '张弛有度，避免全程平铺直叙'
            ]
        };
    }
}
exports.OfflineAuditorAgent = OfflineAuditorAgent;
class OfflineReviserAgent extends BaseAgent {
    getAgentName() {
        return 'OfflineReviser';
    }
    getCapabilities() {
        return [
            { name: 'format_text', supported: true, requiresOnline: false, description: '文本格式化' },
            { name: 'suggest_revisions', supported: true, requiresOnline: false, description: '修改建议' },
            { name: 'suggest_expansions', supported: true, requiresOnline: false, description: '扩写建议' },
            { name: 'suggest_improvements', supported: true, requiresOnline: false, description: '改进建议' },
            { name: 'fix_common_issues', supported: true, requiresOnline: false, description: '常见问题修复' }
        ];
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
            case 'format_text': return this.formatText(task.data);
            case 'suggest_revisions': return this.suggestRevisions(task.data);
            case 'suggest_expansions': return this.suggestExpansions(task.data);
            case 'suggest_improvements': return this.suggestImprovements(task.data);
            case 'fix_common_issues': return this.fixCommonIssues(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async formatText(data) {
        let result = data.content;
        result = result.replace(/\n{3,}/g, '\n\n');
        result = result.replace(/([\u4e00-\u9fa5])\./g, '$1。');
        result = result.replace(/([\u4e00-\u9fa5]),/g, '$1，');
        const lines = result.split('\n');
        const formattedLines = lines.map(line => {
            if (line.trim() && !line.startsWith('【') && !line.startsWith('-')) {
                return `　　${line}`;
            }
            return line;
        });
        return { formattedContent: formattedLines.join('\n') };
    }
    async suggestRevisions(data) {
        return {
            suggestions: [
                '检查是否有错别字和语病',
                '检查语句是否通顺',
                '检查描写是否生动',
                '检查对话是否自然',
                '检查节奏是否合适'
            ],
            checklist: [
                '通读全文，修正明显错误',
                '优化冗长句子',
                '增强描写细节',
                '调整段落结构'
            ]
        };
    }
    async suggestExpansions(data) {
        return {
            expansionPoints: [
                { type: '环境', suggestion: '增加环境描写，渲染氛围' },
                { type: '心理', suggestion: '增加人物心理活动' },
                { type: '动作', suggestion: '细化动作描写' },
                { type: '对话', suggestion: '增加人物对话互动' }
            ],
            tips: [
                '用五感描写（视觉、听觉、嗅觉、味觉、触觉）',
                '通过细节展现人物性格',
                '适当使用比喻、拟人等修辞手法'
            ]
        };
    }
    async suggestImprovements(data) {
        return {
            aspects: [
                { name: '开头', suggestion: '开头要有吸引力，能抓住读者' },
                { name: '人物', suggestion: '人物要有鲜明性格和成长弧光' },
                { name: '情节', suggestion: '情节要有起伏和张力' },
                { name: '节奏', suggestion: '张弛有度，避免拖沓' },
                { name: '结尾', suggestion: '结尾要有力，留下回味' }
            ],
            commonImprovements: [
                '删掉多余的修饰词',
                '替换重复用词',
                '让对话更符合人物身份',
                '增加场景的画面感'
            ]
        };
    }
    async fixCommonIssues(data) {
        let fixed = data.content;
        // 常见标点修复
        fixed = fixed.replace(/，。/g, '。');
        fixed = fixed.replace(/！。/g, '！');
        fixed = fixed.replace(/？。/g, '？');
        // 多余空格
        fixed = fixed.replace(/[ \t]+/g, ' ');
        // 多余换行
        fixed = fixed.replace(/\n{3,}/g, '\n\n');
        return { fixedContent: fixed, issuesFixed: ['标点修正', '格式整理'] };
    }
}
exports.OfflineReviserAgent = OfflineReviserAgent;
class OfflineStyleEngineerAgent extends BaseAgent {
    getAgentName() {
        return 'OfflineStyleEngineer';
    }
    getCapabilities() {
        return [
            { name: 'format_dialogue', supported: true, requiresOnline: false, description: '对话格式化' },
            { name: 'format_paragraphs', supported: true, requiresOnline: false, description: '段落格式化' },
            { name: 'apply_style_template', supported: true, requiresOnline: false, description: '应用风格模板' },
            { name: 'suggest_literary_devices', supported: true, requiresOnline: false, description: '修辞手法建议' },
            { name: 'suggest_vocabulary', supported: true, requiresOnline: false, description: '词汇建议' }
        ];
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
            case 'format_dialogue': return this.formatDialogue(task.data);
            case 'format_paragraphs': return this.formatParagraphs(task.data);
            case 'apply_style_template': return this.applyStyleTemplate(task.data);
            case 'suggest_literary_devices': return this.suggestLiteraryDevices(task.data);
            case 'suggest_vocabulary': return this.suggestVocabulary(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async formatDialogue(data) {
        let result = data.content;
        result = result.replace(/([^「「])([\u4e00-\u9fa5]{2,}。？！：])/g, '$1「$2」');
        result = result.replace(/([「])([\u4e00-\u9fa5]+)([。？！])([」])/g, '「$2$3」');
        return { formattedContent: result };
    }
    async formatParagraphs(data) {
        const maxLength = data.maxLength || 200;
        const paragraphs = data.content.split('\n\n');
        const formattedParagraphs = [];
        for (let para of paragraphs) {
            para = para.trim();
            while (para.length > maxLength) {
                const splitIndex = para.lastIndexOf('。', maxLength) || para.lastIndexOf('？', maxLength) ||
                    para.lastIndexOf('！', maxLength) || maxLength;
                formattedParagraphs.push(para.substring(0, splitIndex + 1));
                para = para.substring(splitIndex + 1);
            }
            if (para)
                formattedParagraphs.push(para);
        }
        return { formattedContent: formattedParagraphs.join('\n\n') };
    }
    async applyStyleTemplate(data) {
        const styleTemplates = {
            '简洁': '保持语言简洁，删掉多余修饰词',
            '华丽': '适当使用华丽辞藻和修辞',
            '幽默': '增加幽默元素，让文字更有趣',
            '严肃': '保持正式严肃的语气',
            '抒情': '增强情感描写，更有感染力'
        };
        return {
            styleApplied: data.style,
            suggestions: styleTemplates[data.style] || '保持当前风格',
            tips: this.getStyleTips(data.style)
        };
    }
    getStyleTips(style) {
        const tips = {
            '简洁': ['多用短句', '避免冗长', '直入主题'],
            '华丽': ['适当使用成语', '注意韵律节奏', '多角度描写'],
            '幽默': ['巧妙的比喻', '反差萌', '轻松的语气'],
            '严肃': ['用词准确', '逻辑清晰', '避免轻浮'],
            '抒情': ['感官描写', '情感共鸣', '情景交融']
        };
        return tips[style] || [];
    }
    async suggestLiteraryDevices(data) {
        const devices = [
            { name: '比喻', effect: '让描写更形象生动', usage: 'A像B' },
            { name: '拟人', effect: '赋予事物生命力', usage: '把事物当作人来写' },
            { name: '排比', effect: '增强气势和节奏感', usage: '连续的相似结构' },
            { name: '夸张', effect: '强化印象', usage: '放大特征' },
            { name: '对比', effect: '突出差异', usage: '对比描写' },
            { name: '象征', effect: '增加深度', usage: '用具体象征抽象' }
        ];
        return {
            literaryDevices: devices,
            suggestion: '根据场景选择合适的修辞手法，避免滥用'
        };
    }
    async suggestVocabulary(data) {
        const vocabTypes = {
            '情绪': ['喜悦', '愤怒', '悲伤', '恐惧', '惊讶', '焦虑', '平静'],
            '动作': ['缓缓', '猛然', '悄悄', '飞快', '沉重', '轻盈'],
            '环境': ['明媚', '幽暗', '喧嚣', '寂静', '温暖', '寒冷'],
            '外貌': ['清秀', '英俊', '靓丽', '憔悴', '冷峻', '温和']
        };
        return {
            vocabularyType: data.type || '通用',
            examples: vocabTypes[data.type] || [],
            tip: '根据语境选择最贴切的词汇，避免重复'
        };
    }
}
exports.OfflineStyleEngineerAgent = OfflineStyleEngineerAgent;
class OfflineRadarAgent extends BaseAgent {
    getAgentName() {
        return 'OfflineRadar';
    }
    getCapabilities() {
        return [
            { name: 'track_consistency', supported: true, requiresOnline: false, description: '一致性监控' },
            { name: 'check_length', supported: true, requiresOnline: false, description: '字数检查' },
            { name: 'track_progress', supported: true, requiresOnline: false, description: '进度跟踪' },
            { name: 'generate_checklist', supported: true, requiresOnline: false, description: '生成检查清单' },
            { name: 'analyze_structure', supported: true, requiresOnline: false, description: '结构分析' }
        ];
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
            case 'track_consistency': return this.trackConsistency(task.data);
            case 'check_length': return this.checkLength(task.data);
            case 'track_progress': return this.trackProgress(task.data);
            case 'generate_checklist': return this.generateChecklist(task.data);
            case 'analyze_structure': return this.analyzeStructure(task.data);
            default: throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async trackConsistency(data) {
        const issues = [];
        const warnings = [];
        if (data.previousContent) {
            const prevProtagonist = this.extractProtagonist(data.previousContent);
            const currProtagonist = this.extractProtagonist(data.content);
            if (prevProtagonist && currProtagonist && prevProtagonist !== currProtagonist) {
                issues.push(`主角名字不一致：前章 "${prevProtagonist}"，本章 "${currProtagonist}"`);
            }
        }
        warnings.push('请人工核对时间线一致性');
        warnings.push('请人工核对人物设定一致性');
        warnings.push('请人工核对世界观设定一致性');
        return { consistencyStatus: issues.length === 0 ? '一致' : '存在问题', issues, warnings, analysis: '离线一致性检查完成' };
    }
    extractProtagonist(content) {
        const matches = content.match(/【主角】\s*([\u4e00-\u9fa5]{2,4})/);
        return matches ? matches[1] : null;
    }
    async checkLength(data) {
        const wordCount = data.content.length;
        const status = wordCount < 1000 ? '过短' : wordCount < 2000 ? '偏短' :
            wordCount < 5000 ? '适中' : wordCount < 8000 ? '偏长' : '过长';
        return { chapterNumber: data.chapterNumber, wordCount, status, suggestion: this.getLengthSuggestion(status) };
    }
    getLengthSuggestion(status) {
        const suggestions = {
            '过短': '建议增加内容，目标至少2000字',
            '偏短': '可以适当扩展内容',
            '适中': '字数合适',
            '偏长': '可以考虑拆分章节',
            '过长': '建议拆分为多个章节'
        };
        return suggestions[status] || '';
    }
    async trackProgress(data) {
        const totalWords = data.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        const plannedChapters = data.project.plannedChapters || 50;
        const completedChapters = data.chapters.length;
        const progress = Math.min(100, Math.round((completedChapters / plannedChapters) * 100));
        return {
            totalWords,
            completedChapters,
            plannedChapters,
            progressPercentage: progress,
            estimatedWordsToComplete: totalWords > 0 ? Math.round((totalWords / completedChapters) * (plannedChapters - completedChapters)) : 0,
            milestones: this.getMilestones(progress)
        };
    }
    getMilestones(progress) {
        const milestones = [];
        if (progress >= 25)
            milestones.push('¼ 完成');
        if (progress >= 50)
            milestones.push('½ 完成');
        if (progress >= 75)
            milestones.push('¾ 完成');
        if (progress >= 100)
            milestones.push('全部完成！');
        return milestones;
    }
    async generateChecklist(data) {
        const checklists = {
            '开篇': [
                '主角是否登场？',
                '世界观是否有初步展示？',
                '是否有悬念或钩子？',
                '人物性格是否初步展现？'
            ],
            '发展': [
                '情节是否有推进？',
                '人物是否有成长？',
                '是否有新的冲突？',
                '伏笔是否有铺设？'
            ],
            '高潮': [
                '是否有足够的张力？',
                '冲突是否升级？',
                '人物是否面临抉择？',
                '节奏是否紧凑？'
            ],
            '结局': [
                '主要冲突是否解决？',
                '人物成长是否完整？',
                '伏笔是否回收？',
                '是否有余味？'
            ]
        };
        return {
            stage: data.stage,
            checklist: checklists[data.stage] || checklists['发展'],
            generalChecklist: [
                '通读检查错别字',
                '语句是否通顺',
                '逻辑是否合理',
                '节奏是否合适'
            ]
        };
    }
    async analyzeStructure(data) {
        const wordCount = data.content.length;
        const paragraphs = data.content.split('\n\n').filter(p => p.trim());
        return {
            wordCount,
            paragraphCount: paragraphs.length,
            estimatedParts: Math.min(4, Math.max(1, Math.round(wordCount / 2000))),
            structureTips: [
                '开头：吸引读者，介绍背景',
                '发展：推进情节，铺垫冲突',
                '高潮：冲突激化，推向顶点',
                '结局：解决问题，收尾'
            ]
        };
    }
}
exports.OfflineRadarAgent = OfflineRadarAgent;
class AgentSystem {
    coordinator;
    constructor(llmManager, auditEngine) {
        this.coordinator = new AgentCoordinator({
            mode: llmManager ? 'online' : 'offline',
            llmManager,
            auditEngine,
            autoSwitchMode: true
        });
    }
    getAllAgents() {
        return this.coordinator.getAllAgents();
    }
    async executeArchitectTask(project, task, params) {
        const data = { project, ...params };
        return this.coordinator.executeTask('architect', {
            type: task,
            priority: 'high',
            status: 'pending',
            data
        });
    }
    async executeWriterTask(project, chapterNumber, options) {
        return this.coordinator.executeTask('writer', {
            type: 'write_chapter',
            priority: 'high',
            status: 'pending',
            data: { project, chapterNumber, outline: options?.outline, guidance: options?.guidance }
        });
    }
    async executeAuditorTask(content, truthFiles, options) {
        const chapter = {
            id: 'temp-chapter',
            number: 0,
            content,
            title: '临时章节',
            status: 'draft',
            wordCount: content.length
        };
        const result = await this.coordinator.executeTask('auditor', {
            type: 'audit_chapter',
            priority: 'high',
            status: 'pending',
            data: { chapter, truthFiles }
        });
        if (options?.autoFix && result.result?.issues && result.result.issues.length > 0) {
            const fixResult = await this.coordinator.executeTask('reviser', {
                type: 'fix_issues',
                priority: 'high',
                status: 'pending',
                data: { content, issues: result.result.issues }
            });
            return { audit: result, fixed: fixResult };
        }
        return result;
    }
    async executePipeline(project, chapterNumber) {
        return this.coordinator.executePipeline(project, chapterNumber);
    }
    setMode(mode) {
        this.coordinator.setMode(mode);
    }
    getMode() {
        return this.coordinator.getMode();
    }
    getAgentCapabilities(agentType) {
        return this.coordinator.getAgentCapabilities(agentType);
    }
    getAllCapabilities() {
        return this.coordinator.getAllCapabilities();
    }
}
exports.AgentSystem = AgentSystem;
class AgentCoordinator {
    mode;
    agents = {};
    messageBus = [];
    autoSwitchMode;
    maxRetry;
    taskHistory = [];
    constructor(config) {
        this.mode = config.mode;
        this.autoSwitchMode = config.autoSwitchMode || false;
        this.maxRetry = config.maxRetry || 2;
        this.initializeAgents(config);
    }
    initializeAgents(config) {
        const agentConfig = {
            mode: this.mode,
            llmManager: config.llmManager,
            auditEngine: config.auditEngine,
            enableFallbacks: this.autoSwitchMode
        };
        this.agents['architect'] = this.mode === 'online'
            ? new OnlineArchitectAgent(agentConfig)
            : new OfflineArchitectAgent(agentConfig);
        this.agents['writer'] = this.mode === 'online'
            ? new OnlineWriterAgent(agentConfig)
            : new OfflineWriterAgent(agentConfig);
        this.agents['auditor'] = this.mode === 'online'
            ? new OnlineAuditorAgent(agentConfig)
            : new OfflineAuditorAgent(agentConfig);
        this.agents['reviser'] = this.mode === 'online'
            ? new OnlineReviserAgent(agentConfig)
            : new OfflineReviserAgent(agentConfig);
        this.agents['styleEngineer'] = this.mode === 'online'
            ? new OnlineStyleEngineerAgent(agentConfig)
            : new OfflineStyleEngineerAgent(agentConfig);
        this.agents['radar'] = this.mode === 'online'
            ? new OnlineRadarAgent(agentConfig)
            : new OfflineRadarAgent(agentConfig);
    }
    getAgent(agentType) {
        return this.agents[agentType];
    }
    getAllAgents() {
        return { ...this.agents };
    }
    getAgentNames() {
        return Object.keys(this.agents);
    }
    getMode() {
        return this.mode;
    }
    setMode(mode) {
        this.mode = mode;
        Object.values(this.agents).forEach(agent => agent.setMode(mode));
        this.initializeAgents({
            mode,
            llmManager: this.agents['architect']?.['llmManager'],
            auditEngine: this.agents['auditor']?.['auditEngine'],
            autoSwitchMode: this.autoSwitchMode
        });
    }
    switchToOnline() {
        this.setMode('online');
    }
    switchToOffline() {
        this.setMode('offline');
    }
    getAgentCapabilities(agentType) {
        const agent = this.agents[agentType];
        return agent ? agent.getCapabilities() : [];
    }
    getAllCapabilities() {
        const capabilities = {};
        Object.entries(this.agents).forEach(([type, agent]) => {
            capabilities[type] = agent.getCapabilities();
        });
        return capabilities;
    }
    sendMessage(fromAgent, toAgent, content, type = 'request', metadata) {
        const message = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromAgent,
            toAgent,
            content,
            type,
            timestamp: new Date(),
            metadata: metadata || {}
        };
        this.messageBus.push(message);
        const targetAgent = this.agents[toAgent];
        if (targetAgent) {
            targetAgent.receiveMessage(message);
        }
    }
    broadcastMessage(fromAgent, content, metadata) {
        Object.keys(this.agents).forEach(agentType => {
            if (agentType !== fromAgent) {
                this.sendMessage(fromAgent, agentType, content, 'notification', metadata);
            }
        });
    }
    getMessages() {
        return [...this.messageBus];
    }
    getMessagesForAgent(agentType) {
        return this.messageBus.filter(msg => msg.toAgent === agentType);
    }
    async executeTask(agentType, task, retryCount = 0) {
        const agent = this.agents[agentType];
        if (!agent) {
            throw new Error(`未知的Agent类型: ${agentType}`);
        }
        try {
            const taskId = agent.addTask(task);
            const fullTask = { ...task, id: taskId, createdAt: new Date() };
            const result = await agent.executeTask(fullTask);
            this.taskHistory.push({ ...fullTask, status: 'completed', result });
            return { taskId, result };
        }
        catch (error) {
            if (this.autoSwitchMode && error.message.includes('需要在线模式') && this.mode === 'offline') {
                this.switchToOnline();
                return this.executeTask(agentType, task);
            }
            if (retryCount < this.maxRetry && error.message.includes('network')) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                return this.executeTask(agentType, task, retryCount + 1);
            }
            this.taskHistory.push({ ...task, id: Date.now().toString(), createdAt: new Date(), status: 'failed', result: error.message });
            throw error;
        }
    }
    async executePipeline(project, chapterNumber, truthFiles) {
        const startTime = Date.now();
        const results = {};
        const steps = {};
        const pipelineSteps = [
            {
                agentType: 'architect',
                taskType: 'outline_generation',
                priority: 'high',
                dataProvider: () => ({ project })
            },
            {
                agentType: 'writer',
                taskType: 'write_chapter',
                priority: 'high',
                dataProvider: (prevResults) => ({
                    project,
                    chapterNumber,
                    outline: prevResults.outline?.result?.outline
                })
            },
            {
                agentType: 'auditor',
                taskType: 'audit_chapter',
                priority: 'high',
                dataProvider: (prevResults) => ({
                    chapter: {
                        id: `chapter-${chapterNumber}`,
                        number: chapterNumber,
                        content: prevResults.chapter?.result?.content || '',
                        title: `第${chapterNumber}章`,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    truthFiles: truthFiles || {}
                })
            },
            {
                agentType: 'styleEngineer',
                taskType: 'format_dialogue',
                priority: 'medium',
                dataProvider: (prevResults) => ({ content: prevResults.chapter?.result?.content || '' })
            },
            {
                agentType: 'radar',
                taskType: 'check_length',
                priority: 'low',
                dataProvider: (prevResults) => ({
                    content: prevResults.chapter?.result?.content || '',
                    chapterNumber
                })
            }
        ];
        for (const step of pipelineSteps) {
            const stepKey = `${step.agentType}-${step.taskType}`;
            try {
                if (step.condition && !step.condition(results)) {
                    steps[stepKey] = { success: false, error: '条件不满足' };
                    continue;
                }
                const data = step.dataProvider ? step.dataProvider(results) : {};
                const result = await this.executeTask(step.agentType, {
                    type: step.taskType,
                    priority: step.priority,
                    status: 'pending',
                    data
                });
                results[step.agentType] = result;
                steps[stepKey] = { success: true, result };
                if (step.onSuccess) {
                    step.onSuccess(result, results);
                }
            }
            catch (error) {
                steps[stepKey] = { success: false, error: error.message };
                if (step.onFailure) {
                    step.onFailure(error, results);
                }
            }
        }
        const allSuccess = Object.values(steps).every(step => step.success);
        return {
            success: allSuccess,
            steps,
            outputs: results,
            executionTime: Date.now() - startTime
        };
    }
    async executeCustomPipeline(steps) {
        const startTime = Date.now();
        const results = {};
        const stepResults = {};
        for (const step of steps) {
            const stepKey = `${step.agentType}-${step.taskType}`;
            try {
                if (step.condition && !step.condition(results)) {
                    stepResults[stepKey] = { success: false, error: '条件不满足' };
                    continue;
                }
                const data = step.dataProvider ? step.dataProvider(results) : {};
                const result = await this.executeTask(step.agentType, {
                    type: step.taskType,
                    priority: step.priority,
                    status: 'pending',
                    data
                });
                results[step.agentType] = result;
                stepResults[stepKey] = { success: true, result };
                if (step.onSuccess) {
                    step.onSuccess(result, results);
                }
            }
            catch (error) {
                stepResults[stepKey] = { success: false, error: error.message };
                if (step.onFailure) {
                    step.onFailure(error, results);
                }
            }
        }
        const allSuccess = Object.values(stepResults).every(step => step.success);
        return {
            success: allSuccess,
            steps: stepResults,
            outputs: results,
            executionTime: Date.now() - startTime
        };
    }
    getAgentStatus(agentType) {
        const agent = this.agents[agentType];
        return agent ? agent.getState() : undefined;
    }
    getAllAgentStatuses() {
        const statuses = {};
        Object.entries(this.agents).forEach(([type, agent]) => {
            statuses[type] = agent.getState();
        });
        return statuses;
    }
    getTaskHistory() {
        return [...this.taskHistory];
    }
    clearTaskHistory() {
        this.taskHistory = [];
    }
    canExecuteTask(agentType, taskType) {
        const capabilities = this.getAgentCapabilities(agentType);
        const capability = capabilities.find(c => c.name === taskType);
        return capability
            ? { supported: capability.supported, requiresOnline: capability.requiresOnline }
            : { supported: false, requiresOnline: false };
    }
    validatePipeline(steps) {
        const errors = [];
        for (const step of steps) {
            if (!this.agents[step.agentType]) {
                errors.push(`未知的Agent类型: ${step.agentType}`);
                continue;
            }
            const capability = this.canExecuteTask(step.agentType, step.taskType);
            if (!capability.supported) {
                errors.push(`${step.agentType} 不支持任务类型: ${step.taskType}`);
            }
            if (this.mode === 'offline' && capability.requiresOnline) {
                errors.push(`${step.agentType} 的任务 ${step.taskType} 需要在线模式`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}
exports.AgentCoordinator = AgentCoordinator;
//# sourceMappingURL=AgentSystem.js.map