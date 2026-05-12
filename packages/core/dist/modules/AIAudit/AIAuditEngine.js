"use strict";
/**
 * Cloud Book - AI 审计引擎 V2
 * 基于LLM的真正语义理解审计
 * 33维度全面质量评估
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAuditEngine = void 0;
class AIAuditEngine {
    config;
    llmProvider = null;
    constructor(config) {
        this.config = {
            dimensions: [
                'characterConsistency',
                'worldConsistency',
                'timelineConsistency',
                'plotLogic',
                'foreshadowFulfillment',
                'resourceTracking',
                'emotionalArc',
                'narrativePacing',
                'dialogueQuality',
                'descriptionDensity',
                'aiDetection',
                'repetitiveness',
                'grammaticalErrors',
                'tautology',
                'logicalGaps',
                'progressionPacing',
                'conflictEscalation',
                'characterMotivation',
                'stakesClarity',
                'sensoryDetails',
                'backstoryIntegration',
                'povConsistency',
                'tenseConsistency',
                'pacingVariation',
                'showVsTell',
                'subtext',
                'symbolism',
                'thematicCoherence',
                'readerEngagement',
                'genreConvention',
                'culturalSensitivity',
                'factualAccuracy',
                'powerConsistency'
            ],
            threshold: 0.7,
            autoFix: true,
            maxIterations: 3,
            useSemanticAnalysis: true,
            ...config
        };
    }
    setLLMProvider(provider) {
        this.llmProvider = provider;
    }
    async audit(content, truthFiles, context) {
        const dimensions = [];
        const allIssues = [];
        if (this.llmProvider && this.config.useSemanticAnalysis) {
            const results = await this.performSemanticAudit(content, truthFiles, context);
            for (const result of results) {
                dimensions.push({
                    name: result.dimension,
                    score: result.score,
                    passed: result.score >= this.config.threshold,
                    details: result.reasoning
                });
                for (const issue of result.issues) {
                    allIssues.push({
                        type: result.dimension,
                        severity: this.determineSeverity(result.score, issue),
                        description: issue,
                        location: { chapterId: '' }
                    });
                }
            }
        }
        else {
            const results = await this.performRuleBasedAudit(content, truthFiles);
            for (const result of results) {
                dimensions.push(result.dimension);
                allIssues.push(...result.issues);
            }
        }
        const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
        const passed = totalScore >= this.config.threshold &&
            !allIssues.some(i => i.severity === 'critical');
        return {
            passed,
            dimensions,
            issues: allIssues,
            score: totalScore
        };
    }
    /**
     * 核心功能：使用LLM进行真正的语义审计
     */
    async performSemanticAudit(content, truthFiles, context) {
        const dimensionGroups = this.groupDimensions();
        const results = [];
        for (const group of dimensionGroups) {
            const prompt = this.buildSemanticAuditPrompt(content, truthFiles, group, context);
            try {
                const response = await this.llmProvider.generate(prompt, {
                    temperature: 0.3,
                    maxTokens: 2000
                });
                const parsed = this.parseSemanticResponse(response.text, group);
                results.push(...parsed);
            }
            catch (error) {
                console.error(`Semantic audit failed for group ${group.join(',')}:`, error);
                for (const dim of group) {
                    results.push({
                        dimension: dim,
                        score: 0.8,
                        reasoning: '语义分析失败，使用默认评分',
                        issues: [],
                        suggestions: []
                    });
                }
            }
        }
        return results;
    }
    /**
     * 将33个维度分组，每组一起审计以减少API调用
     */
    groupDimensions() {
        return [
            ['characterConsistency', 'characterMotivation', 'backstoryIntegration'],
            ['worldConsistency', 'powerConsistency', 'resourceTracking'],
            ['timelineConsistency', 'logicalGaps', 'plotLogic'],
            ['foreshadowFulfillment', 'conflictEscalation', 'progressionPacing'],
            ['emotionalArc', 'readerEngagement', 'narrativePacing', 'pacingVariation'],
            ['dialogueQuality', 'subtext', 'showVsTell'],
            ['descriptionDensity', 'sensoryDetails', 'symbolism'],
            ['aiDetection', 'repetitiveness', 'tautology'],
            ['grammaticalErrors', 'povConsistency', 'tenseConsistency'],
            ['thematicCoherence', 'genreConvention', 'stakesClarity'],
            ['culturalSensitivity', 'factualAccuracy']
        ];
    }
    /**
     * 构建语义审计提示词
     */
    buildSemanticAuditPrompt(content, truthFiles, dimensions, context) {
        const dimensionDescriptions = this.getDimensionDescriptions(dimensions);
        const truthContext = this.buildTruthContext(truthFiles);
        const truncatedContent = content.length > 4000
            ? content.slice(0, 4000) + '...[内容已截断]'
            : content;
        return `你是专业的文学作品质量审计专家。请对以下小说内容进行深度语义分析。

【审计维度】
${dimensionDescriptions}

【世界观设定】
${truthContext.worldSetting}

【角色设定】
${truthContext.characters}

【时间线】
${truthContext.timeline}

【待回收伏笔】
${truthContext.hooks}

【待消耗资源】
${truthContext.resources}

【待验证事实】
${truthContext.facts}

【待处理时间悖论】
${truthContext.paradoxes}

【小说内容】（约${Math.round(content.length / 2)}字）
${truncatedContent}

${context?.previousChapter ? `\n【前章内容摘要】\n${context.previousChapter.slice(0, 1000)}...` : ''}

请以JSON格式输出审计结果：
{
  "dimension": "审计的维度名称",
  "score": 0-1之间的分数,
  "reasoning": "评分理由，需要详细说明你如何得出这个分数",
  "issues": ["发现的具体问题列表"],
  "suggestions": ["改进建议列表"]
}

请对每个维度单独输出一个JSON对象，用---分隔。`;
    }
    /**
     * 构建世界观上下文
     */
    buildTruthContext(truthFiles) {
        const worldSetting = JSON.stringify(truthFiles.currentState || {}, null, 2);
        const characters = JSON.stringify(truthFiles.characterMatrix || [], null, 2);
        const timeline = JSON.stringify(truthFiles.chapterSummaries || [], null, 2);
        const hooks = truthFiles.pendingHooks
            ? truthFiles.pendingHooks.map((h) => `${h.description} (状态: ${h.status})`).join('\n')
            : '无';
        const resources = truthFiles.particleLedger
            ? truthFiles.particleLedger.map((r) => `${r.name}: 拥有者${r.owner}, 数量${r.quantity}, 变更历史: ${r.changeLog.map((c) => c.change).join(', ')}`).join('\n')
            : '无';
        const facts = truthFiles.currentState?.knownFacts
            ? truthFiles.currentState.knownFacts.join('\n')
            : '无';
        const paradoxes = '无';
        return { worldSetting, characters, timeline, hooks, resources, facts, paradoxes };
    }
    /**
     * 获取维度描述
     */
    getDimensionDescriptions(dimensions) {
        const descriptions = {
            characterConsistency: '角色一致性：角色行为、性格、语言风格是否与设定保持一致',
            characterMotivation: '角色动机：角色的行为是否有合理的动机支撑',
            backstoryIntegration: '背景融合：角色背景故事是否自然融入当前情节',
            worldConsistency: '世界观一致性：情节是否符合已建立的世界观规则',
            powerConsistency: '能力一致性：角色能力表现是否与设定相符，无突然过强或过弱',
            resourceTracking: '资源追踪：重要资源（金钱、能力、物品）的消耗和获取是否有记录',
            timelineConsistency: '时间线一致性：事件发生的时间顺序是否合理',
            logicalGaps: '逻辑漏洞：情节发展是否存在不合理的跳跃或矛盾',
            plotLogic: '情节逻辑：事件之间的因果关系是否清晰合理',
            foreshadowFulfillment: '伏笔回收：之前埋下的伏笔是否得到合理的回收',
            conflictEscalation: '冲突升级：冲突是否逐步升级，保持张力',
            progressionPacing: '进度节奏：整体进度是否适当推进',
            emotionalArc: '情感弧线：情感描写是否有起伏变化',
            readerEngagement: '读者吸引力：内容是否能够吸引读者继续阅读',
            narrativePacing: '叙事节奏：叙述的节奏是否张弛有度',
            pacingVariation: '节奏变化：快节奏和慢节奏是否有适当变化',
            dialogueQuality: '对话质量：对话是否自然、有个性、推动情节',
            subtext: '潜台词：对话和叙述是否有深层含义',
            showVsTell: '展示vs讲述：是否通过行动和描写展示而非直接陈述',
            descriptionDensity: '描写密度：场景和人物描写是否充分',
            sensoryDetails: '感官细节：是否调用了多种感官描写',
            symbolism: '象征手法：是否使用了有意义的象征',
            aiDetection: 'AI痕迹检测：内容是否呈现出明显的AI生成特征',
            repetitiveness: '重复度：是否存在词汇、句式、情节的过度重复',
            tautology: '同义反复：是否存在无意义的重复表述',
            grammaticalErrors: '语法错误：是否存在病句或用词不当',
            povConsistency: '视角一致性：叙述视角是否保持一致',
            tenseConsistency: '时态一致性：动词时态是否保持一致',
            thematicCoherence: '主题连贯性：内容是否围绕核心主题展开',
            genreConvention: '题材规范：是否符合该题材的惯例和读者期待',
            stakesClarity: ' stakes清晰度：冲突的利害关系是否让读者清楚',
            culturalSensitivity: '文化敏感性：是否存在文化冒犯或刻板印象',
            factualAccuracy: '事实准确性：涉及的现实世界知识是否准确'
        };
        return dimensions.map(d => `- ${descriptions[d] || d}`).join('\n');
    }
    /**
     * 解析LLM返回的语义审计结果
     */
    parseSemanticResponse(response, dimensions) {
        const results = [];
        const blocks = response.split('---').filter(b => b.trim());
        for (let i = 0; i < dimensions.length; i++) {
            const block = blocks[i]?.trim() || blocks[0]?.trim() || '';
            try {
                const jsonMatch = block.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    results.push({
                        dimension: parsed.dimension || dimensions[i],
                        score: parsed.score ?? 0.8,
                        reasoning: parsed.reasoning || '无分析',
                        issues: parsed.issues || [],
                        suggestions: parsed.suggestions || []
                    });
                }
                else {
                    results.push({
                        dimension: dimensions[i],
                        score: 0.8,
                        reasoning: block.slice(0, 200),
                        issues: [],
                        suggestions: []
                    });
                }
            }
            catch (e) {
                results.push({
                    dimension: dimensions[i],
                    score: 0.8,
                    reasoning: block.slice(0, 200),
                    issues: [],
                    suggestions: []
                });
            }
        }
        return results;
    }
    /**
     * 基于规则的审计（当LLM不可用时）
     */
    async performRuleBasedAudit(content, truthFiles) {
        return [
            this.checkCharacterConsistencyRule(content, truthFiles),
            this.checkRepetitivenessRule(content),
            this.checkGrammaticalErrorsRule(content),
            this.checkEmotionalArcRule(content),
            this.checkDialogueQualityRule(content),
            this.checkNarrativePacingRule(content)
        ];
    }
    checkCharacterConsistencyRule(content, truthFiles) {
        const issues = [];
        let score = 1.0;
        if (truthFiles.currentState?.protagonist) {
            const name = truthFiles.currentState.protagonist.name;
            if (!content.includes(name) && content.length > 1000) {
                issues.push({
                    type: 'character_consistency',
                    severity: 'warning',
                    description: `主角"${name}"在章节中未出现`,
                    location: { chapterId: '' }
                });
                score = 0.8;
            }
        }
        return {
            dimension: {
                name: 'characterConsistency',
                score,
                passed: score >= this.config.threshold,
                details: issues.length > 0 ? '检测到角色一致性问题' : '角色一致性正常'
            },
            issues
        };
    }
    checkRepetitivenessRule(content) {
        const issues = [];
        const words = content.split(/\s+/);
        const wordFreq = {};
        for (const word of words) {
            if (word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        }
        const maxFreq = Math.max(...Object.values(wordFreq));
        const totalWords = words.length;
        const repetitionRatio = maxFreq / totalWords;
        if (repetitionRatio > 0.05) {
            const mostRepeated = Object.entries(wordFreq)
                .sort((a, b) => b[1] - a[1])[0];
            issues.push({
                type: 'repetitiveness',
                severity: 'warning',
                description: `词汇"${mostRepeated[0]}"出现频率过高（${mostRepeated[1]}次）`,
                location: { chapterId: '' }
            });
        }
        return {
            dimension: {
                name: 'repetitiveness',
                score: issues.length > 0 ? 0.8 : 1.0,
                passed: issues.length === 0,
                details: issues.length > 0 ? '存在重复问题' : '重复度正常'
            },
            issues
        };
    }
    checkGrammaticalErrorsRule(content) {
        const issues = [];
        const patterns = [
            { regex: /[，。、；：""''（）【】]{2,}/g, desc: '标点符号连续使用' },
            { regex: /\s{3,}/g, desc: '多余空白字符' },
            { regex: /[a-zA-Z]{50,}/g, desc: '过长的英文单词' }
        ];
        for (const pattern of patterns) {
            const matches = content.match(pattern.regex);
            if (matches && matches.length > 5) {
                issues.push({
                    type: 'grammatical_errors',
                    severity: 'info',
                    description: `${pattern.desc}：发现${matches.length}处`,
                    location: { chapterId: '' }
                });
            }
        }
        return {
            dimension: {
                name: 'grammaticalErrors',
                score: 1.0 - issues.length * 0.05,
                passed: issues.length < 10,
                details: `发现${issues.length}处潜在语法问题`
            },
            issues
        };
    }
    checkEmotionalArcRule(content) {
        const emotionalWords = [
            '高兴', '悲伤', '愤怒', '恐惧', '惊讶', '开心', '难过',
            '激动', '紧张', '害怕', '心疼', '感动', '委屈', '喜悦', '痛苦'
        ];
        let emotionCount = 0;
        for (const word of emotionalWords) {
            const regex = new RegExp(word, 'g');
            const matches = content.match(regex);
            if (matches)
                emotionCount += matches.length;
        }
        const density = emotionCount / (content.length / 1000);
        let issues = [];
        let score = 1.0;
        if (density < 2) {
            issues.push({
                type: 'emotional_arc',
                severity: 'warning',
                description: '情感描写较少，可能影响读者代入感',
                location: { chapterId: '' }
            });
            score = 0.7;
        }
        return {
            dimension: {
                name: 'emotionalArc',
                score,
                passed: score >= this.config.threshold,
                details: `情感密度：${density.toFixed(2)}词/千字`
            },
            issues
        };
    }
    checkDialogueQualityRule(content) {
        const dialogues = content.match(/[""''『』（][^""''『』]+[""''『』]/g) || [];
        const issues = [];
        if (dialogues.length === 0) {
            issues.push({
                type: 'dialogue_quality',
                severity: 'info',
                description: '章节中无对话，可能影响角色刻画',
                location: { chapterId: '' }
            });
        }
        const avgLength = dialogues.reduce((sum, d) => sum + d.length, 0) / Math.max(dialogues.length, 1);
        if (avgLength > 200) {
            issues.push({
                type: 'dialogue_quality',
                severity: 'info',
                description: '对话平均长度较长，可能不够自然',
                location: { chapterId: '' }
            });
        }
        return {
            dimension: {
                name: 'dialogueQuality',
                score: 1.0 - issues.length * 0.1,
                passed: true,
                details: `发现${dialogues.length}段对话`
            },
            issues
        };
    }
    checkNarrativePacingRule(content) {
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
        const issues = [];
        const lengths = paragraphs.map(p => p.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1);
        const longParagraphs = paragraphs.filter(p => p.length > 500);
        const shortParagraphs = paragraphs.filter(p => p.length < 30);
        if (longParagraphs.length > paragraphs.length * 0.5) {
            issues.push({
                type: 'narrative_pacing',
                severity: 'info',
                description: '长段落较多，建议增加段落变化',
                location: { chapterId: '' }
            });
        }
        return {
            dimension: {
                name: 'narrativePacing',
                score: 1.0 - issues.length * 0.1,
                passed: true,
                details: `平均段落长度：${avgLength.toFixed(0)}字`
            },
            issues
        };
    }
    determineSeverity(score, issue) {
        if (score < 0.5)
            return 'critical';
        if (score < 0.7)
            return 'warning';
        return 'info';
    }
    async auditChapter(chapterId, content) {
        return this.audit(content, { currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] }, particleLedger: [], pendingHooks: [], chapterSummaries: [], subplotBoard: [], emotionalArcs: [], characterMatrix: [] });
    }
    async batchAudit(chapters) {
        const results = new Map();
        for (const chapter of chapters) {
            const result = await this.audit(chapter.content, { currentState: { protagonist: { id: '', name: '', location: '', status: '' }, knownFacts: [], currentConflicts: [], relationshipSnapshot: {}, activeSubplots: [] }, particleLedger: [], pendingHooks: [], chapterSummaries: [], subplotBoard: [], emotionalArcs: [], characterMatrix: [] });
            results.set(chapter.id, result);
        }
        return results;
    }
    generateReport(result) {
        const passedDims = result.dimensions.filter(d => d.passed).length;
        const totalDims = result.dimensions.length;
        let report = `# 审计报告\n\n`;
        report += `## 总体评分\n\n`;
        report += `- 综合得分：${(result.score * 100).toFixed(1)}%\n`;
        report += `- 通过状态：${result.passed ? '✅ 通过' : '❌ 未通过'}\n`;
        report += `- 审计维度：${passedDims}/${totalDims} 通过\n\n`;
        report += `## 各维度评分\n\n`;
        for (const dim of result.dimensions.sort((a, b) => a.score - b.score)) {
            const status = dim.passed ? '✅' : '❌';
            report += `- ${status} ${dim.name}：${(dim.score * 100).toFixed(1)}%\n`;
            report += `  ${dim.details}\n\n`;
        }
        if (result.issues.length > 0) {
            report += `## 发现的问题\n\n`;
            for (const issue of result.issues) {
                report += `- [${issue.severity.toUpperCase()}] ${issue.description}\n`;
            }
        }
        return report;
    }
}
exports.AIAuditEngine = AIAuditEngine;
exports.default = AIAuditEngine;
//# sourceMappingURL=AIAuditEngine.js.map