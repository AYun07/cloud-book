"use strict";
/**
 * Agent 智能体系统
 * 六类创作智能体：架构师、写作者、审计员、修订师、风格工程师、雷达
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
class AgentSystem {
    agents = new Map();
    tasks = new Map();
    llmManager;
    auditEngine;
    constructor(llmManager, auditEngine) {
        this.llmManager = llmManager;
        this.auditEngine = auditEngine;
        this.initializeAgents();
    }
    initializeAgents() {
        this.agents.set('architect', {
            type: 'architect',
            name: '架构师',
            role: '负责世界观构建、角色设定、情节规划',
            responsibilities: [
                '设计世界观和力量体系',
                '创建角色设定和大纲',
                '规划章节结构和节奏',
                '管理伏笔和主线',
                '定义故事主题和基调'
            ],
            tools: ['WorldInfoManager', 'KnowledgeGraphManager', 'CardManager']
        });
        this.agents.set('writer', {
            type: 'writer',
            name: '写作者',
            role: '负责具体章节的写作生成',
            responsibilities: [
                '根据大纲生成章节内容',
                '塑造角色对话和性格',
                '描写场景和氛围',
                '推进情节发展',
                '保持文风一致性'
            ],
            tools: ['LLMManager', 'MemoryManager', 'ContextManager']
        });
        this.agents.set('auditor', {
            type: 'auditor',
            name: '审计员',
            role: '负责质量检查和问题发现',
            responsibilities: [
                '33维度质量审计',
                '角色一致性检查',
                '世界观逻辑验证',
                '伏笔呼应检查',
                'AI痕迹检测'
            ],
            tools: ['AIAuditEngine', 'TruthFileManager', 'AntiDetectionEngine']
        });
        this.agents.set('reviser', {
            type: 'reviser',
            name: '修订师',
            role: '负责根据审计结果修订内容',
            responsibilities: [
                '修复一致性问题',
                '优化叙事节奏',
                '增强情感表达',
                '完善细节描写',
                '提升整体质量'
            ],
            tools: ['LLMManager', 'ContextManager', 'TruthFileManager']
        });
        this.agents.set('styleEngineer', {
            type: 'styleEngineer',
            name: '风格工程师',
            role: '负责风格把控和人机交互优化',
            responsibilities: [
                '提取和模仿文风',
                '控制句式变化',
                '优化用词精准度',
                '增强表达多样性',
                '去AI味处理'
            ],
            tools: ['LLMManager', 'AntiDetectionEngine', 'StyleFingerprintExtractor']
        });
        this.agents.set('radar', {
            type: 'radar',
            name: '雷达',
            role: '负责趋势分析和市场洞察',
            responsibilities: [
                '分析热门题材趋势',
                '监控读者反馈',
                '评估市场表现',
                '提供优化建议',
                '识别风险预警'
            ],
            tools: ['TrendAnalyzer', 'LLMManager']
        });
    }
    getAgent(type) {
        return this.agents.get(type);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    async executeArchitectTask(project, task, params) {
        const agent = this.agents.get('architect');
        try {
            let result;
            switch (task) {
                case 'world_building':
                    result = await this.architectWorldBuilding(project, params);
                    break;
                case 'character_design':
                    result = await this.architectCharacterDesign(project, params);
                    break;
                case 'plot_planning':
                    result = await this.architectPlotPlanning(project, params);
                    break;
                case 'outline_generation':
                    result = await this.architectOutlineGeneration(project, params);
                    break;
                default:
                    throw new Error(`Unknown task: ${task}`);
            }
            return { success: true, data: result, message: `${agent.name}完成任务` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}任务失败` };
        }
    }
    async executeWriterTask(project, chapterNumber, options) {
        const agent = this.agents.get('writer');
        try {
            const prompt = this.buildWriterPrompt(project, chapterNumber, options);
            const content = await this.llmManager.complete(prompt, { temperature: 0.75, maxTokens: 3000 });
            return { success: true, data: content, message: `${agent.name}生成第${chapterNumber}章` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}写作失败` };
        }
    }
    async executeAuditorTask(content, truthFiles, options) {
        const agent = this.agents.get('auditor');
        try {
            const result = await this.auditEngine.audit(content, truthFiles);
            if (options?.autoFix && !result.passed) {
                const fixes = await this.generateFixes(result);
                return { success: true, data: { auditResult: result, fixes }, message: `${agent.name}完成审计并生成修复建议` };
            }
            return { success: true, data: result, message: `${agent.name}完成审计` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}审计失败` };
        }
    }
    async executeReviserTask(content, issues, truthFiles) {
        const agent = this.agents.get('reviser');
        try {
            const prompt = this.buildReviserPrompt(content, issues, truthFiles);
            const revised = await this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 3000 });
            return { success: true, data: revised, message: `${agent.name}完成修订` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}修订失败` };
        }
    }
    async executeStyleEngineerTask(content, task, styleSource) {
        const agent = this.agents.get('styleEngineer');
        try {
            let result;
            switch (task) {
                case 'extract_style':
                    result = await this.extractStyle(content);
                    break;
                case 'apply_style':
                    result = await this.applyStyle(content, styleSource);
                    break;
                case 'humanize':
                    result = await this.humanizeContent(content);
                    break;
                default:
                    throw new Error(`Unknown task: ${task}`);
            }
            return { success: true, data: result, message: `${agent.name}完成风格任务` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}风格处理失败` };
        }
    }
    async executeRadarTask(task, params) {
        const agent = this.agents.get('radar');
        try {
            let result;
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
                default:
                    throw new Error(`Unknown task: ${task}`);
            }
            return { success: true, data: result, message: `${agent.name}完成分析` };
        }
        catch (error) {
            return { success: false, error: error.message, message: `${agent.name}分析失败` };
        }
    }
    async executePipeline(project, chapterNumber) {
        const outline = project.chapters?.[chapterNumber - 1]?.outline;
        const writerResult = await this.executeWriterTask(project, chapterNumber, { outline });
        if (!writerResult.success) {
            throw new Error(writerResult.error);
        }
        const auditorResult = await this.executeAuditorTask(writerResult.data, project.truthFiles || {}, { autoFix: true });
        if (auditorResult.success && auditorResult.data.issues?.length > 0) {
            const reviserResult = await this.executeReviserTask(writerResult.data, auditorResult.data.issues, project.truthFiles || {});
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
    async architectWorldBuilding(project, params) {
        const prompt = `为一部${project.genre || '玄幻'}题材小说构建完整的世界观。

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
    async architectCharacterDesign(project, params) {
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
    async architectPlotPlanning(project, params) {
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
    async architectOutlineGeneration(project, params) {
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
    buildWriterPrompt(project, chapterNumber, options) {
        const previousChapter = project.chapters?.[chapterNumber - 2];
        const outline = options?.outline || project.chapters?.[chapterNumber - 1]?.outline;
        const guidance = options?.guidance || '';
        return `作为小说写作者，请根据以下信息生成第${chapterNumber}章内容。

题材：${project.genre}
世界观：${project.worldSetting?.powerSystem || '无特殊力量体系'}
主角设定：${project.characters?.[0]?.name || '待设定'}

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
    buildReviserPrompt(content, issues, truthFiles) {
        return `请根据以下问题修订章节内容：

需要修复的问题：
${issues.map((i, idx) => `${idx + 1}. [${i.type}] ${i.description} - 建议：${i.suggestion}`).join('\n')}

当前章节：
${content}

请在保持原文优点的基础上，修复以上问题，输出修订后的完整章节。`;
    }
    async extractStyle(content) {
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
        }
        catch { }
        return { raw: result };
    }
    async applyStyle(content, styleSource) {
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
    async humanizeContent(content) {
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
    async analyzeTrends(params) {
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
    async reviewPerformance(params) {
        const chapters = params?.chapters || [];
        const prompt = `请分析以下章节的表现：

章节列表：
${chapters.map((c, i) => `${i + 1}. 第${c.number}章 "${c.title}" - 字数${c.wordCount}`).join('\n')}

请分析：
1. 节奏是否合理
2. 是否有重复内容
3. 角色出场是否均衡
4. 情节推进是否顺畅
5. 钩子设置是否有效

请提供改进建议。`;
        return this.llmManager.complete(prompt, { temperature: 0.6, maxTokens: 2000 });
    }
    async checkRiskAlert(params) {
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
    async generateFixes(auditResult) {
        if (!auditResult.issues)
            return [];
        return auditResult.issues.map((issue) => issue.suggestion || '');
    }
    countWords(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
}
exports.AgentSystem = AgentSystem;
exports.default = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map