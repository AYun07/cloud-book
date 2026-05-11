"use strict";
/**
 * 七步创作法
 * Constitution → Specify → Clarify → Plan → Tasks → Write → Analyze
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SevenStepMethodology = void 0;
class SevenStepMethodology {
    llmManager;
    progress = new Map();
    constructor(llmManager) {
        this.llmManager = llmManager;
    }
    async initializeProject(projectId) {
        const steps = [
            { step: 'constitution', name: '宪章制定', description: '确定写作原则和指导方针', status: 'pending' },
            { step: 'specify', name: '规格说明', description: '明确故事规格和目标', status: 'pending' },
            { step: 'clarify', name: '细节澄清', description: '澄清世界观和角色细节', status: 'pending' },
            { step: 'plan', name: '规划制定', description: '制定章节规划和里程碑', status: 'pending' },
            { step: 'tasks', name: '任务分解', description: '将规划分解为具体任务', status: 'pending' },
            { step: 'write', name: '写作执行', description: '执行写作任务', status: 'pending' },
            { step: 'analyze', name: '分析复盘', description: '分析写作结果并优化', status: 'pending' }
        ];
        this.progress.set(projectId, {
            projectId,
            currentStep: 'constitution',
            completedSteps: [],
            results: new Map()
        });
        return steps;
    }
    async executeStep(projectId, step, params) {
        const progress = this.progress.get(projectId);
        if (!progress) {
            throw new Error('Project not initialized');
        }
        let result;
        switch (step) {
            case 'constitution':
                result = await this.executeConstitution(projectId, params);
                break;
            case 'specify':
                result = await this.executeSpecify(projectId, params);
                break;
            case 'clarify':
                result = await this.executeClarify(projectId, params);
                break;
            case 'plan':
                result = await this.executePlan(projectId, params);
                break;
            case 'tasks':
                result = await this.executeTasks(projectId, params);
                break;
            case 'write':
                result = await this.executeWrite(projectId, params);
                break;
            case 'analyze':
                result = await this.executeAnalyze(projectId, params);
                break;
            default:
                throw new Error(`Unknown step: ${step}`);
        }
        if (result.success) {
            progress.completedSteps.push(step);
            progress.currentStep = this.getNextStep(step);
        }
        progress.results.set(step, result);
        return result;
    }
    getNextStep(current) {
        const order = ['constitution', 'specify', 'clarify', 'plan', 'tasks', 'write', 'analyze'];
        const currentIndex = order.indexOf(current);
        return order[Math.min(currentIndex + 1, order.length - 1)];
    }
    async executeConstitution(projectId, params) {
        try {
            const genre = params?.genre || 'fantasy';
            const constitutionPrompt = `为一部${genre}题材小说制定写作宪章。

宪章需要包含：
1. 核心原则（3-5条）：故事的核心价值观和追求
2. 写作指南（5-8条）：具体的写作风格要求
3. 类型规则（3-5条）：该类型必须遵循的规则

请详细阐述每一条原则和规则的理由。`;
            const response = await this.llmManager.complete(constitutionPrompt, {
                temperature: 0.7,
                maxTokens: 2000
            });
            const constitution = this.parseConstitution(response, params);
            return {
                step: 'constitution',
                success: true,
                data: constitution,
                message: '宪章制定完成'
            };
        }
        catch (error) {
            return { step: 'constitution', success: false, message: error.message };
        }
    }
    async executeSpecify(projectId, params) {
        try {
            const constitution = params?.constitution || '';
            const specPrompt = `基于以下宪章，明确小说的规格说明：

宪章：${constitution}

规格说明需要包含：
1. 标题：小说名称
2. 前提：核心故事概念（一句话）
3. 题材：具体类型（玄幻/都市/科幻等）
4. 目标读者：主要受众群体
5. 目标字数：预计总字数
6. 主题：探讨的核心主题
7. 基调：整体情感氛围
8. 结构：叙事结构选择
9. 要求：特殊需求或限制`;
            const response = await this.llmManager.complete(specPrompt, {
                temperature: 0.7,
                maxTokens: 2000
            });
            const spec = this.parseSpec(response, params);
            return {
                step: 'specify',
                success: true,
                data: spec,
                message: '规格说明完成'
            };
        }
        catch (error) {
            return { step: 'specify', success: false, message: error.message };
        }
    }
    async executeClarify(projectId, params) {
        try {
            const spec = params?.spec || '';
            const clarifyPrompt = `基于以下规格说明，澄清世界观和角色细节：

规格：${spec}

需要澄清的内容：
1. 世界观细节：
   - 世界背景和历史
   - 地理环境
   - 社会结构
   - 力量/能力体系

2. 角色细节：
   - 主角详细设定
   - 主要配角设定
   - 反派/对手设定
   - 重要NPC设定

3. 关系网络：
   - 角色之间的关系
   - 势力/组织设定
   - 关键物品/地点

请详细描述每个方面。`;
            const response = await this.llmManager.complete(clarifyPrompt, {
                temperature: 0.7,
                maxTokens: 2000
            });
            const clarifications = {
                worldDetails: this.extractSection(response, '世界观'),
                characterDetails: this.extractSection(response, '角色'),
                relationshipNetwork: this.extractSection(response, '关系')
            };
            return {
                step: 'clarify',
                success: true,
                data: clarifications,
                message: '细节澄清完成'
            };
        }
        catch (error) {
            return { step: 'clarify', success: false, message: error.message };
        }
    }
    async executePlan(projectId, params) {
        try {
            const clarifications = params?.clarifications || '';
            const targetChapters = params?.targetChapters || 50;
            const planPrompt = `基于以下细节澄清，制定详细的章节规划：

细节：${clarifications}

需要生成：
1. 章节大纲（${targetChapters}章）
   - 每章标题
   - 每章摘要
   - 每章关键事件
   - 每章结尾钩子

2. 里程碑设置：
   - 第一幕结束（第X章）
   - 中点转折（第X章）
   - 第二幕结束（第X章）
   - 高潮（第X章）
   - 结局（第X章）

3. 伏笔规划：
   - 埋下的伏笔列表
   - 伏笔回收章节

请确保节奏感和情节连贯性。`;
            const response = await this.llmManager.complete(planPrompt, {
                temperature: 0.75,
                maxTokens: 3000
            });
            const plan = this.parsePlan(response, targetChapters);
            return {
                step: 'plan',
                success: true,
                data: plan,
                message: '章节规划完成'
            };
        }
        catch (error) {
            return { step: 'plan', success: false, message: error.message };
        }
    }
    async executeTasks(projectId, params) {
        try {
            const plan = params?.plan || '';
            const tasksPrompt = `基于以下章节规划，将写作工作分解为具体任务：

规划：${plan}

任务分解要求：
1. 将每个章节分解为具体写作任务
2. 每个任务包含：
   - 任务描述
   - 关联章节
   - 预计时间
   - 优先级
3. 标记依赖关系
4. 确定并行任务

请列出所有写作任务。`;
            const response = await this.llmManager.complete(tasksPrompt, {
                temperature: 0.6,
                maxTokens: 2000
            });
            const tasks = this.parseTasks(response);
            return {
                step: 'tasks',
                success: true,
                data: tasks,
                message: '任务分解完成'
            };
        }
        catch (error) {
            return { step: 'tasks', success: false, message: error.message };
        }
    }
    async executeWrite(projectId, params) {
        try {
            const task = params?.task;
            const context = params?.context;
            if (!task) {
                return { step: 'write', success: false, message: 'No task provided' };
            }
            const writePrompt = `基于以下上下文，执行写作任务：

任务：${task.description}
章节：${task.chapterId}

上下文：
- 章节大纲：${context?.outline || ''}
- 上一章摘要：${context?.previousSummary || ''}
- 角色设定：${context?.characterSummary || ''}
- 世界观：${context?.worldSummary || ''}

写作要求：
1. 严格遵循章节大纲
2. 保持风格一致性
3. 控制字数在2000-3000字
4. 结尾设置钩子

请开始写作：`;
            const content = await this.llmManager.complete(writePrompt, {
                temperature: 0.75,
                maxTokens: 3000
            });
            return {
                step: 'write',
                success: true,
                data: { content, taskId: task.id },
                message: '章节写作完成'
            };
        }
        catch (error) {
            return { step: 'write', success: false, message: error.message };
        }
    }
    async executeAnalyze(projectId, params) {
        try {
            const chapters = params?.chapters || [];
            const analyzePrompt = `分析以下章节的表现，提供优化建议：

章节列表：
${chapters.map((c, i) => `${i + 1}. 第${c.number}章 "${c.title}"`).join('\n')}

分析维度：
1. 整体节奏评估
2. 角色发展评估
3. 情节推进评估
4. 世界观一致性
5. 伏笔管理
6. 读者反馈预测

请提供详细的分析报告和改进建议。`;
            const response = await this.llmManager.complete(analyzePrompt, {
                temperature: 0.6,
                maxTokens: 2000
            });
            const analysis = {
                report: response,
                summary: this.extractSummary(response)
            };
            return {
                step: 'analyze',
                success: true,
                data: analysis,
                message: '分析复盘完成'
            };
        }
        catch (error) {
            return { step: 'analyze', success: false, message: error.message };
        }
    }
    getProgress(projectId) {
        return this.progress.get(projectId);
    }
    getNextAction(projectId) {
        const progress = this.progress.get(projectId);
        if (!progress)
            return null;
        return progress.currentStep;
    }
    parseConstitution(response, params) {
        return {
            id: this.generateId(),
            title: params?.title || '写作宪章',
            corePrinciples: this.extractList(response, '核心原则'),
            writingGuidelines: this.extractList(response, '写作指南'),
            genreSpecificRules: this.extractList(response, '类型规则')
        };
    }
    parseSpec(response, params) {
        return {
            id: this.generateId(),
            title: this.extractField(response, '标题') || params?.title || '待定',
            premise: this.extractField(response, '前提') || '',
            genre: params?.genre || 'fantasy',
            targetAudience: this.extractField(response, '目标读者') || '通用',
            wordCountTarget: parseInt(this.extractField(response, '目标字数') || '100000'),
            themes: this.extractList(response, '主题'),
            tone: this.extractField(response, '基调') || '中性',
            structure: this.extractField(response, '结构') || '三幕式',
            requirements: this.extractList(response, '要求')
        };
    }
    parsePlan(response, targetChapters) {
        const chapters = [];
        const planMatch = response.match(/章节大纲[\s\S]*?(?=里程碑|伏笔|$)/i);
        if (planMatch) {
            const lines = planMatch[0].split('\n').filter(l => l.trim());
            for (let i = 0; i < Math.min(lines.length, targetChapters); i++) {
                chapters.push({
                    number: i + 1,
                    title: this.extractChapterTitle(lines[i]) || `第${i + 1}章`,
                    summary: this.extractChapterSummary(lines[i]),
                    wordCountTarget: 2500,
                    keyPoints: [],
                    hooks: []
                });
            }
        }
        return {
            id: this.generateId(),
            chapters,
            estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            milestones: this.extractMilestones(response)
        };
    }
    parseTasks(response) {
        const tasks = [];
        const lines = response.split('\n').filter(l => l.trim());
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^\d+[.、]/) || line.match(/^[-*]/)) {
                tasks.push({
                    id: this.generateId(),
                    description: line.replace(/^\d+[.、]\s*/, '').replace(/^[-*]\s*/, ''),
                    status: 'pending'
                });
            }
        }
        return tasks;
    }
    extractSection(text, section) {
        const match = text.match(new RegExp(`${section}[：:]([\\s\\S]*?)(?=\\n\\n|\\n[\\u4e00-\\u9fa5])`, 'i'));
        return match ? match[1].trim() : '';
    }
    extractList(text, category) {
        const section = this.extractSection(text, category);
        if (!section)
            return [];
        return section.split(/[、，,；;]/).map(s => s.trim()).filter(Boolean);
    }
    extractField(text, field) {
        const match = text.match(new RegExp(`${field}[：:]\\s*(.+?)(?:\\n|$)`, 'i'));
        return match ? match[1].trim() : '';
    }
    extractChapterTitle(line) {
        const match = line.match(/第[一二三四五六七八九十百千\\d]+章[^""]*["""](.+?)["""]/);
        return match ? match[1] : '';
    }
    extractChapterSummary(line) {
        const match = line.match(/[:：]\s*(.+?)$/);
        return match ? match[1].trim() : '';
    }
    extractMilestones(text) {
        const milestones = [];
        const milestonesSection = this.extractSection(text, '里程碑');
        const patterns = [
            { name: '第一幕结束', pattern: /第一幕.*?第?([\\d]+)章/i },
            { name: '中点转折', pattern: /中点.*?第?([\\d]+)章/i },
            { name: '第二幕结束', pattern: /第二幕.*?第?([\\d]+)章/i },
            { name: '高潮', pattern: /高潮.*?第?([\\d]+)章/i },
            { name: '结局', pattern: /结局.*?第?([\\d]+)章/i }
        ];
        for (const p of patterns) {
            const match = milestonesSection.match(p.pattern);
            if (match) {
                milestones.push({
                    id: this.generateId(),
                    description: p.name,
                    targetChapter: parseInt(match[1]),
                    completed: false
                });
            }
        }
        return milestones;
    }
    extractSummary(text) {
        const summaryMatch = text.match(/总结[：:]([\\s\\S]*?)$/i);
        return summaryMatch ? summaryMatch[1].trim() : text.slice(0, 200);
    }
    generateId() {
        return `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.SevenStepMethodology = SevenStepMethodology;
exports.default = SevenStepMethodology;
//# sourceMappingURL=SevenStepMethodology.js.map