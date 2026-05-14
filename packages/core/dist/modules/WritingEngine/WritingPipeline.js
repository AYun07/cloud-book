"use strict";
/**
 * Cloud Book - 写作管线
 * 整合写作、审计、修订的完整流程
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritingPipeline = void 0;
const ContextManager_1 = require("../ContextManager/ContextManager");
const DEFAULT_SYNC_OPTIONS = {
    enableSequentialSync: true,
    waitForAuditResult: true,
    enableConsistencyCheck: true,
    maxWaitTimeMs: 30000
};
class WritingPipeline {
    llmManager;
    auditEngine;
    antiDetectionEngine;
    contextManager;
    chapterStates = new Map();
    chapterLocks = new Map();
    syncOptions;
    constructor(llmManager, auditEngine, antiDetectionEngine, syncOptions) {
        this.llmManager = llmManager;
        this.auditEngine = auditEngine;
        this.antiDetectionEngine = antiDetectionEngine;
        this.contextManager = new ContextManager_1.ContextManager();
        this.syncOptions = { ...DEFAULT_SYNC_OPTIONS, ...syncOptions };
    }
    /**
     * 获取章节上下文状态
     */
    getChapterContextState(chapterNumber) {
        return this.chapterStates.get(chapterNumber);
    }
    /**
     * 获取所有章节状态
     */
    getAllChapterStates() {
        return new Map(this.chapterStates);
    }
    /**
     * 清除章节状态（用于新项目）
     */
    clearChapterStates() {
        this.chapterStates.clear();
        this.chapterLocks.clear();
    }
    /**
     * 等待前面的章节完成
     */
    async waitForPreviousChapters(currentChapter, requiredStatus = ['completed']) {
        const previousChapters = [];
        for (let i = 1; i < currentChapter; i++) {
            const state = this.chapterStates.get(i);
            if (!state || requiredStatus.includes(state.status)) {
                previousChapters.push(i);
            }
        }
        const waitPromises = [];
        for (const prevChapter of previousChapters) {
            const lock = this.chapterLocks.get(prevChapter);
            if (lock) {
                waitPromises.push(lock.then(() => {
                    const state = this.chapterStates.get(prevChapter);
                    if (state && !requiredStatus.includes(state.status)) {
                        throw new Error(`章节${prevChapter}未达到所需状态，当前状态: ${state.status}`);
                    }
                }).catch(err => {
                    throw new Error(`等待章节${prevChapter}完成失败: ${err.message}`);
                }));
            }
        }
        if (waitPromises.length > 0) {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`等待前面章节完成超时，最大等待时间: ${this.syncOptions.maxWaitTimeMs}ms`));
                }, this.syncOptions.maxWaitTimeMs);
            });
            await Promise.race([
                Promise.all(waitPromises).then(() => { }),
                timeoutPromise
            ]);
        }
    }
    /**
     * 获取前面章节的审计结果
     */
    getPreviousAuditResults(currentChapter) {
        const results = [];
        for (let i = 1; i < currentChapter; i++) {
            const state = this.chapterStates.get(i);
            if (state?.auditResult) {
                results.push(state.auditResult);
            }
        }
        return results;
    }
    /**
     * 获取前面章节的摘要
     */
    getPreviousChapterSummaries(currentChapter) {
        const summaries = [];
        for (let i = 1; i < currentChapter; i++) {
            const state = this.chapterStates.get(i);
            if (state?.summary) {
                summaries.push(state.summary);
            }
        }
        return summaries;
    }
    /**
     * 上下文一致性检查
     */
    async checkContextConsistency(project, currentChapter, truthFiles) {
        const warnings = [];
        const previousSummaries = this.getPreviousChapterSummaries(currentChapter);
        if (previousSummaries.length === 0) {
            return { consistent: true, warnings };
        }
        const currentState = truthFiles.currentState;
        const protagonist = currentState.protagonist;
        for (const summary of previousSummaries.slice(-3)) {
            const charactersInChapter = summary.charactersPresent || [];
            for (const charName of charactersInChapter) {
                const char = project.characters?.find(c => c.name === charName || c.aliases?.includes(charName));
                if (char) {
                    const stateChanges = summary.stateChanges || [];
                    const hasLocationChange = stateChanges.some((s) => s.toLowerCase().includes('location') || s.toLowerCase().includes('地点'));
                    if (!hasLocationChange) {
                        const relationshipEntry = Object.entries(currentState.relationshipSnapshot || {})
                            .find(([name]) => name === charName);
                        if (!relationshipEntry) {
                            warnings.push(`角色"${charName}"在前面章节出现过但未在关系快照中找到`);
                        }
                    }
                }
            }
            const newHooks = summary.newHooks || [];
            for (const hook of newHooks) {
                const pendingHook = truthFiles.pendingHooks?.find((h) => h.description === hook || h.id === hook);
                if (!pendingHook) {
                    warnings.push(`伏笔"${hook}"在真相文件中未找到`);
                }
            }
        }
        const particleLedger = truthFiles.particleLedger || [];
        for (const particle of particleLedger) {
            if (particle.lastUpdatedChapter >= currentChapter) {
                warnings.push(`物品"${particle.name}"的最后更新章节(${particle.lastUpdatedChapter})不应该 >= 当前章节(${currentChapter})`);
            }
        }
        return { consistent: warnings.length === 0, warnings };
    }
    /**
     * 更新章节上下文状态
     */
    updateChapterState(chapterNumber, update) {
        const current = this.chapterStates.get(chapterNumber) || {
            chapterNumber,
            status: 'pending'
        };
        this.chapterStates.set(chapterNumber, { ...current, ...update });
    }
    /**
     * 注册章节锁
     */
    registerChapterLock(chapterNumber) {
        if (!this.chapterLocks.has(chapterNumber)) {
            let resolveLock;
            let rejectLock;
            const lockPromise = new Promise((resolve, reject) => {
                resolveLock = resolve;
                rejectLock = reject;
            });
            lockPromise._resolve = resolveLock;
            lockPromise._reject = rejectLock;
            this.chapterLocks.set(chapterNumber, lockPromise);
        }
    }
    /**
     * 释放章节锁
     */
    releaseChapterLock(chapterNumber, error) {
        const lock = this.chapterLocks.get(chapterNumber);
        if (lock) {
            if (error) {
                lock._reject?.(error);
            }
            else {
                lock._resolve?.();
            }
            this.chapterLocks.delete(chapterNumber);
        }
    }
    /**
     * 构建增强的上下文（包含前面章节的审计结果）
     */
    buildEnhancedContext(project, chapterNumber, truthFiles) {
        const baseContext = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
        const previousAuditResults = this.getPreviousAuditResults(chapterNumber);
        if (previousAuditResults.length === 0) {
            return baseContext;
        }
        const auditContextParts = [];
        const recentAudits = previousAuditResults.slice(-3);
        const commonIssues = new Map();
        for (const audit of recentAudits) {
            for (const issue of audit.issues) {
                const count = commonIssues.get(issue.type) || 0;
                commonIssues.set(issue.type, count + 1);
            }
        }
        const recurringIssues = Array.from(commonIssues.entries())
            .filter(([_, count]) => count >= 2)
            .map(([type]) => type);
        if (recurringIssues.length > 0) {
            auditContextParts.push(`## 前面章节发现的常见问题（需避免）`);
            auditContextParts.push(`- ${recurringIssues.join('\n- ')}`);
        }
        let passedCount = 0;
        let avgScore = 0;
        for (const audit of recentAudits) {
            if (audit.passed)
                passedCount++;
            avgScore += audit.score;
        }
        avgScore = recentAudits.length > 0 ? avgScore / recentAudits.length : 0;
        auditContextParts.push(`## 前面章节质量概况`);
        auditContextParts.push(`- 通过率: ${passedCount}/${recentAudits.length}`);
        auditContextParts.push(`- 平均分: ${avgScore.toFixed(1)}/100`);
        const lastAudit = previousAuditResults[previousAuditResults.length - 1];
        if (lastAudit && lastAudit.dimensions) {
            const lowScoringDims = lastAudit.dimensions
                .filter(d => d.score < 70)
                .map(d => `${d.name}(${d.score})`);
            if (lowScoringDims.length > 0) {
                auditContextParts.push(`- 前面章节得分较低维度: ${lowScoringDims.join(', ')}`);
            }
        }
        return baseContext + '\n\n' + auditContextParts.join('\n');
    }
    /**
     * 执行完整写作流程
     */
    async generateChapter(project, chapterNumber, truthFiles, options) {
        this.registerChapterLock(chapterNumber);
        try {
            if (this.syncOptions.enableSequentialSync) {
                await this.waitForPreviousChapters(chapterNumber, ['completed']);
            }
            this.updateChapterState(chapterNumber, { status: 'writing' });
            if (this.syncOptions.enableConsistencyCheck) {
                const consistency = await this.checkContextConsistency(project, chapterNumber, truthFiles);
                if (!consistency.consistent) {
                    console.warn(`章节${chapterNumber}上下文一致性检查发现问题:`, consistency.warnings);
                }
            }
            const context = this.buildEnhancedContext(project, chapterNumber, truthFiles);
            const draftContent = await this.generateDraft(project, chapterNumber, context, options);
            this.updateChapterState(chapterNumber, { status: 'auditing' });
            let auditResult;
            if (options?.autoAudit !== false) {
                auditResult = await this.auditEngine.audit(draftContent, truthFiles);
                const previousAudits = this.getPreviousAuditResults(chapterNumber);
                if (previousAudits.length > 0 && auditResult) {
                    const consistencyIssues = this.checkAuditConsistency(previousAudits, auditResult);
                    if (consistencyIssues.length > 0) {
                        console.warn(`章节${chapterNumber}与前面章节审计一致性检查:`, consistencyIssues);
                    }
                }
            }
            let finalContent = draftContent;
            if (auditResult && !auditResult.passed) {
                finalContent = await this.reviseBasedOnAudit(draftContent, auditResult, truthFiles, context);
            }
            let humanized;
            if (options?.autoHumanize) {
                humanized = await this.antiDetectionEngine.humanize(finalContent, this.llmManager);
                finalContent = humanized;
            }
            const summary = await this.generateChapterSummary(finalContent, chapterNumber, project, auditResult);
            const chapter = {
                id: this.generateId(),
                number: chapterNumber,
                title: `第${this.toChineseNumber(chapterNumber)}章`,
                status: auditResult?.passed ? 'draft' : 'reviewing',
                wordCount: this.countWords(finalContent),
                content: finalContent,
                auditResult,
                summary: summary?.keyEvents?.join('; ') || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.updateChapterState(chapterNumber, {
                status: 'completed',
                auditResult,
                summary,
                completedAt: new Date()
            });
            return { chapter, auditResult, humanized };
        }
        catch (error) {
            this.updateChapterState(chapterNumber, {
                status: 'failed',
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
        finally {
            this.releaseChapterLock(chapterNumber, undefined);
        }
    }
    /**
     * 检查审计结果一致性
     */
    checkAuditConsistency(previousAudits, currentAudit) {
        const issues = [];
        const prevAvgScores = previousAudits.map(a => a.score);
        const prevAvg = prevAvgScores.reduce((a, b) => a + b, 0) / prevAvgScores.length;
        if (Math.abs(currentAudit.score - prevAvg) > 30) {
            issues.push(`当前审计分数(${currentAudit.score})与历史平均(${prevAvg.toFixed(1)})差距过大`);
        }
        const prevFailedDimensions = new Set();
        for (const audit of previousAudits) {
            for (const dim of audit.dimensions) {
                if (!dim.passed) {
                    prevFailedDimensions.add(dim.name);
                }
            }
        }
        for (const dim of currentAudit.dimensions) {
            if (!dim.passed && prevFailedDimensions.has(dim.name)) {
                issues.push(`维度"${dim.name}"在多个章节中持续失败`);
            }
        }
        return issues;
    }
    /**
     * 生成章节摘要
     */
    async generateChapterSummary(content, chapterNumber, project, auditResult) {
        const keyEvents = this.extractKeyEvents(content);
        const charactersPresent = this.extractCharacters(content, project);
        return {
            chapterId: this.generateId(),
            chapterNumber,
            title: `第${this.toChineseNumber(chapterNumber)}章`,
            charactersPresent,
            keyEvents,
            stateChanges: [],
            newHooks: this.extractNewHooks(content),
            resolvedHooks: []
        };
    }
    extractKeyEvents(content) {
        const events = [];
        const eventPatterns = [
            /(?:发生|遇到|发现|获得|失去|决定|发生|完成)([^，。,]+)/g,
            /(?:主角|他|她)([^，。,]+(?:了|完成|发生|遇到|发现)[^，。,]+)/g
        ];
        for (const pattern of eventPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null && events.length < 5) {
                if (match[1].length > 5 && match[1].length < 50) {
                    events.push(match[1].trim());
                }
            }
        }
        return events.slice(0, 5);
    }
    extractCharacters(content, project) {
        const present = [];
        const charNames = project.characters?.map(c => c.name) || [];
        for (const name of charNames) {
            if (content.includes(name)) {
                present.push(name);
            }
        }
        return present;
    }
    extractNewHooks(content) {
        const hooks = [];
        const hookPatterns = [
            /(?:突然|出人意料|没想到|令人震惊)([^，。,]+)/g,
            /(?:埋下|设置|暗示)([^，。,]+伏笔?)/g,
            /(?:悬念|疑问)([^，。,]+)/g
        ];
        for (const pattern of hookPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null && hooks.length < 3) {
                hooks.push(match[1].trim());
            }
        }
        return hooks;
    }
    /**
     * 生成草稿
     */
    async generateDraft(project, chapterNumber, context, options) {
        // 确定使用的模型
        const modelConfig = this.llmManager.route('writing') ||
            this.llmManager.listModels()[0];
        // 构建提示词
        const prompt = this.buildWritingPrompt(project, chapterNumber, context, options);
        // 生成
        const result = await this.llmManager.generate(prompt, modelConfig?.name, {
            temperature: 0.7,
            maxTokens: options?.targetWordCount || 3000
        });
        return result.text;
    }
    /**
     * 构建写作提示词
     */
    buildWritingPrompt(project, chapterNumber, context, options) {
        let prompt = `你是一位顶级小说作家，擅长创作高质量的网文作品。

## 作品信息
${context}

## 写作指导
当前章节: 第${chapterNumber}章
目标字数: ${options?.targetWordCount || 2500}字

${options?.chapterGuidance ? `章节指导: ${options.chapterGuidance}` : ''}

## 写作要求
1. 保持世界观和角色一致性
2. 注重情节张力和节奏
3. 描写细腻，情感真实
4. 对话自然，符合角色性格
5. 避免AI常见的刻板表达
6. 字数控制在${options?.targetWordCount || 2500}字左右

## 风格提醒
- 句式要有变化，混合长短句
- 减少过度使用的连接词（如"然而"、"因此"）
- 增加情感描写和内心活动
- 保持对话口语化

请开始创作第${chapterNumber}章：

`;
        return prompt;
    }
    /**
     * 根据审计结果修订
     */
    async reviseChapter(content, auditResult, truthFiles) {
        const prompt = `你是一位资深编辑，擅长修订AI生成的小说内容。

## 原稿
${content}

## 审计结果
${JSON.stringify(auditResult, null, 2)}

## 修订要求
1. 修复审计发现的所有问题
2. 保持原文的优点和风格
3. 不要过度修改，造成新的问题
4. 重点修复严重(critical)问题

## 当前世界状态
角色: ${truthFiles.currentState?.protagonist.name || '未知'}
位置: ${truthFiles.currentState?.protagonist.location || '未知'}
状态: ${truthFiles.currentState?.protagonist.status || '正常'}

请直接输出修订后的内容，不要添加额外说明：`;
        const modelConfig = this.llmManager.route('revision') ||
            this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(prompt, modelConfig?.name, { temperature: 0.5, maxTokens: 3000 });
        return result.text;
    }
    /**
     * 基于审计修订
     */
    async reviseBasedOnAudit(content, auditResult, truthFiles, context) {
        let revised = content;
        const criticalIssues = auditResult.issues.filter(i => i.severity === 'critical');
        // 最多迭代3次
        for (let i = 0; i < 3 && criticalIssues.length > 0; i++) {
            revised = await this.reviseChapter(revised, auditResult, truthFiles);
            // 重新审计
            const newResult = await this.auditEngine.audit(revised, truthFiles);
            auditResult = newResult;
            if (newResult.passed) {
                break;
            }
        }
        return revised;
    }
    /**
     * 流式生成
     */
    async streamGenerate(project, chapterNumber, truthFiles, options, onChunk) {
        const context = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
        const prompt = this.buildWritingPrompt(project, chapterNumber, context, options);
        const modelConfig = this.llmManager.route('writing') ||
            this.llmManager.listModels()[0];
        let fullContent = '';
        await this.llmManager.stream(prompt, modelConfig?.name, { temperature: 0.7, maxTokens: 3000, stream: true }, (chunk) => {
            fullContent += chunk;
            onChunk(chunk);
        });
        return fullContent;
    }
    /**
     * 生成大纲
     */
    async generateOutline(project, chapterNumber, truthFiles) {
        const context = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
        const prompt = `你是一位资深小说策划，擅长设计精彩的章节大纲。

## 作品信息
${context}

## 大纲要求
请为第${chapterNumber}章设计详细大纲，包括：
1. 本章核心事件（1-2句话）
2. 涉及的主要角色
3. 场景安排（时间、地点）
4. 关键情节点
5. 重要对话要点
6. 伏笔设置（如有）
7. 章节结尾悬念

请用简洁的语言描述，字数控制在300字左右。

请开始设计大纲：`;
        const modelConfig = this.llmManager.route('planning') ||
            this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(prompt, modelConfig?.name, { temperature: 0.7, maxTokens: 1000 });
        return result.text;
    }
    /**
     * 生成摘要
     */
    async generateSummary(content, truthFiles) {
        const prompt = `请为以下小说章节生成简明摘要：

${content}

要求：
1. 50-100字
2. 包含主要事件
3. 包含关键人物
4. 包含重要转折

请直接输出摘要：`;
        const modelConfig = this.llmManager.route('analysis') ||
            this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(prompt, modelConfig?.name, { temperature: 0.3, maxTokens: 200 });
        return result.text;
    }
    /**
     * 生成ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 数字转中文
     */
    toChineseNumber(num) {
        const units = ['', '十', '百', '千', '万'];
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (num === 0)
            return '零';
        let result = '';
        let unitIndex = 0;
        while (num > 0) {
            const digit = num % 10;
            if (digit !== 0) {
                result = digits[digit] + units[unitIndex] + result;
            }
            else if (result && !result.startsWith('零')) {
                result = '零' + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }
        return result.replace(/零+$/, '');
    }
    /**
     * 统计字数
     */
    countWords(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    /**
     * 批量生成章节
     * 支持跨章节上下文同步
     */
    async generateChaptersBatch(project, startChapter, endChapter, truthFiles, options, onProgress) {
        const chapters = [];
        const total = endChapter - startChapter + 1;
        const parallelCount = options?.parallelCount || 2;
        const enableSync = this.syncOptions.enableSequentialSync;
        this.clearChapterStates();
        if (enableSync) {
            await this.executeSequentialBatch(project, startChapter, endChapter, truthFiles, options, chapters, total, onProgress);
        }
        else {
            await this.executeParallelBatch(project, startChapter, endChapter, truthFiles, options, chapters, total, parallelCount, onProgress);
        }
        return chapters;
    }
    /**
     * 顺序执行批次（确保跨章节上下文同步）
     */
    async executeSequentialBatch(project, startChapter, endChapter, truthFiles, options, chapters, total, onProgress) {
        for (let i = startChapter; i <= endChapter; i++) {
            try {
                const result = await this.generateChapter(project, i, truthFiles, options);
                chapters.push(result.chapter);
                onProgress?.(chapters.length, total, result.chapter);
                if (result.chapter.auditResult) {
                    truthFiles.chapterSummaries.push({
                        chapterId: result.chapter.id,
                        chapterNumber: result.chapter.number,
                        title: result.chapter.title,
                        charactersPresent: result.chapter.characters || [],
                        keyEvents: [],
                        stateChanges: [],
                        newHooks: [],
                        resolvedHooks: []
                    });
                }
            }
            catch (error) {
                console.error(`章节${i}生成失败:`, error);
                throw error;
            }
        }
    }
    /**
     * 并行执行批次（保持有限并行）
     */
    async executeParallelBatch(project, startChapter, endChapter, truthFiles, options, chapters, total, parallelCount, onProgress) {
        for (let i = startChapter; i <= endChapter; i += parallelCount) {
            const batch = [];
            for (let j = i; j < Math.min(i + parallelCount, endChapter + 1); j++) {
                batch.push(this.generateChapter(project, j, truthFiles, options)
                    .then(result => ({ chapter: result.chapter, chapterNumber: j })));
            }
            const results = await Promise.all(batch);
            for (const result of results.sort((a, b) => a.chapterNumber - b.chapterNumber)) {
                chapters.push(result.chapter);
                onProgress?.(chapters.length, total, result.chapter);
            }
        }
    }
    /**
     * 续写现有小说
     */
    async continueWriting(project, lastChapterNumber, newChaptersCount, truthFiles, options) {
        const chapters = [];
        for (let i = 1; i <= newChaptersCount; i++) {
            const chapterNumber = lastChapterNumber + i;
            const result = await this.generateChapter(project, chapterNumber, truthFiles, {
                ...options,
                chapterGuidance: options?.chapterGuidance || `这是第${chapterNumber}章的续写`
            });
            chapters.push(result.chapter);
        }
        return chapters;
    }
    /**
     * 同人创作
     */
    async writeFanfiction(sourceNovel, targetChapterNumber, premise, truthFiles, options) {
        const deviationNote = `同人设定: ${premise}`;
        const result = await this.generateChapter(sourceNovel, targetChapterNumber, truthFiles, {
            ...options,
            chapterGuidance: `同人创作方向: ${premise}`
        });
        return { chapter: result.chapter, deviationNote };
    }
    /**
     * 番外篇创作
     */
    async writeSideStory(project, sideStoryTitle, viewpointCharacter, timelinePosition, truthFiles, options) {
        const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
        const sideStoryPrompt = `## 番外篇: ${sideStoryTitle}
视角角色: ${viewpointCharacter}
时间线位置: ${timelinePosition}

${context}

请从${viewpointCharacter}的视角创作一个番外篇，讲述${timelinePosition}发生的事情。
目标字数: ${options?.targetWordCount || 2000}字`;
        const modelConfig = this.llmManager.route('writing') ||
            this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(sideStoryPrompt, modelConfig?.name, { temperature: 0.7, maxTokens: options?.targetWordCount || 2000 });
        const chapter = {
            id: this.generateId(),
            number: 0,
            title: sideStoryTitle,
            status: 'draft',
            wordCount: this.countWords(result.text),
            content: result.text,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return { chapter, sideStoryNote: `番外篇-视角:${viewpointCharacter}-时间:${timelinePosition}` };
    }
    /**
     * 多视角叙事
     */
    async writeMultiPOV(project, chapterNumber, viewpoints, truthFiles, options) {
        const chapters = [];
        const wordsPerViewpoint = (options?.targetWordCount || 2000) / viewpoints.length;
        for (const viewpoint of viewpoints) {
            const context = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
            const povPrompt = `## 多视角叙事 - 第${chapterNumber}章
当前视角: ${viewpoint}

${context}

请从${viewpoint}的视角创作第${chapterNumber}章。
要求:
1. 只描写该视角能感知到的事物
2. 保持与其他视角的一致性
3. 字数控制在${wordsPerViewpoint}字左右`;
            const modelConfig = this.llmManager.route('writing') ||
                this.llmManager.listModels()[0];
            const result = await this.llmManager.generate(povPrompt, modelConfig?.name, { temperature: 0.7, maxTokens: wordsPerViewpoint });
            chapters.push({
                id: this.generateId(),
                number: chapterNumber,
                title: `第${this.toChineseNumber(chapterNumber)}章 - ${viewpoint}视角`,
                status: 'draft',
                wordCount: this.countWords(result.text),
                content: result.text,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        return chapters;
    }
    /**
     * 自动化完整创作流程
     */
    async autoGenerateNovel(project, chapterCount, onPhase) {
        onPhase?.('初始化真相文件', 0);
        let truthFiles = await this.getOrCreateTruthFiles(project);
        onPhase?.('生成章节大纲', 10);
        await this.generateBatchOutlines(project, chapterCount, truthFiles);
        onPhase?.('开始写作', 20);
        const chapters = await this.generateChaptersBatch(project, 1, chapterCount, truthFiles, { autoAudit: true, autoHumanize: true }, (current, total) => {
            const progress = 20 + (current / total) * 70;
            onPhase?.(`写作进度: ${current}/${total}`, progress);
        });
        onPhase?.('更新真相文件', 95);
        for (const chapter of chapters) {
            await this.updateTruthFilesAfterChapter(chapter, truthFiles);
        }
        onPhase?.('完成', 100);
        return { chapters, truthFiles };
    }
    async getOrCreateTruthFiles(project) {
        return project.truthFiles || {
            currentState: {
                protagonist: {
                    id: project.characters?.[0]?.id || 'main',
                    name: project.characters?.[0]?.name || '主角',
                    location: project.worldSetting?.locations?.[0]?.name || '未知地点',
                    status: '正常'
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
    }
    async generateBatchOutlines(project, chapterCount, truthFiles) {
        const outlines = [];
        for (let i = 1; i <= chapterCount; i++) {
            const outline = await this.generateOutline(project, i, truthFiles);
            outlines.push(outline);
        }
        return outlines;
    }
    async updateTruthFilesAfterChapter(chapter, truthFiles) {
        truthFiles.chapterSummaries.push({
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            title: chapter.title,
            charactersPresent: chapter.characters || [],
            keyEvents: [],
            stateChanges: [],
            newHooks: [],
            resolvedHooks: []
        });
    }
    /**
     * 冒险模式 - 类似AI Dungeon的互动冒险
     */
    async adventureMode(project, storyPrompt, userAction, truthFiles) {
        const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
        const prompt = `## 冒险模式
当前世界设定:
${context}

故事背景:
${storyPrompt}

玩家行动:
${userAction}

请以第三人称叙述这段冒险经历，描写玩家的行动结果、世界的反应、遇到的NPC等。
保持故事的连贯性和沉浸感。
字数控制在800-1500字。`;
        const modelConfig = this.llmManager.route('writing') || this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(prompt, modelConfig?.name, {
            temperature: 0.8,
            maxTokens: 2000
        });
        const newWorldInfo = this.extractNewWorldInfo(result.text);
        return { narrative: result.text, newWorldInfo };
    }
    /**
     * 聊天机器人模式 - 与角色互动对话
     */
    async chatbotMode(project, characterId, userMessage, truthFiles) {
        const character = project.characters?.find(c => c.id === characterId);
        if (!character) {
            return { characterName: '系统', response: '角色不存在', emotion: 'neutral' };
        }
        const context = this.contextManager.buildWritingContext(project, 0, truthFiles);
        const prompt = `## 聊天机器人模式
当前场景:
${context}

角色信息:
- 姓名: ${character.name}
- 性格: ${character.personality || '暂无设定'}
- 说话风格: ${character.speakingStyle || '正常'}
- 背景: ${character.background || '暂无背景'}

对话历史:
用户: ${userMessage}

请以${character.name}的身份回复用户的对话。
回复应该:
1. 符合角色性格
2. 保持说话风格一致
3. 体现角色的情感变化
4. 推动对话发展

直接输出角色回复，不需要任何格式标记。`;
        const modelConfig = this.llmManager.route('writing') || this.llmManager.listModels()[0];
        const result = await this.llmManager.generate(prompt, modelConfig?.name, {
            temperature: 0.9,
            maxTokens: 500
        });
        const emotion = this.detectEmotion(result.text);
        return {
            characterName: character.name,
            response: result.text,
            emotion
        };
    }
    /**
     * 从叙事中提取新的世界信息
     */
    extractNewWorldInfo(narrative) {
        const worldInfo = [];
        const locationPattern = /在([^，,。]+)[发生|来到|走进]/g;
        const npcPattern = /遇到了([^，,。]+)/g;
        const itemPattern = /获得了([^，,。]+)/g;
        let match;
        while ((match = locationPattern.exec(narrative)) !== null) {
            worldInfo.push(`新地点: ${match[1]}`);
        }
        while ((match = npcPattern.exec(narrative)) !== null) {
            worldInfo.push(`遇到NPC: ${match[1]}`);
        }
        while ((match = itemPattern.exec(narrative)) !== null) {
            worldInfo.push(`获得物品: ${match[1]}`);
        }
        return worldInfo;
    }
    /**
     * 检测对话情感
     */
    detectEmotion(text) {
        const positive = ['高兴', '开心', '微笑', '兴奋', '满意', '愉快', '欣喜', '惊喜'];
        const negative = ['愤怒', '生气', '伤心', '难过', '失望', '沮丧', '痛苦', '悲伤'];
        const neutral = ['平静', '淡然', '冷静', '正常', '一般'];
        for (const word of positive) {
            if (text.includes(word))
                return 'positive';
        }
        for (const word of negative) {
            if (text.includes(word))
                return 'negative';
        }
        return 'neutral';
    }
    /**
     * 多模式写作入口
     */
    async writeWithMode(project, mode, options, truthFiles) {
        switch (mode) {
            case 'novel':
                return this.generateChapter(project, options.chapterNumber || 1, truthFiles);
            case 'adventure':
                if (!options.storyPrompt || !options.userAction) {
                    throw new Error('Adventure mode requires storyPrompt and userAction');
                }
                return this.adventureMode(project, options.storyPrompt, options.userAction, truthFiles);
            case 'chatbot':
                if (!options.characterId) {
                    throw new Error('Chatbot mode requires characterId');
                }
                if (!options.userAction) {
                    throw new Error('Chatbot mode requires userAction (message)');
                }
                return this.chatbotMode(project, options.characterId, options.userAction, truthFiles);
            default:
                throw new Error(`Unknown mode: ${mode}`);
        }
    }
}
exports.WritingPipeline = WritingPipeline;
exports.default = WritingPipeline;
//# sourceMappingURL=WritingPipeline.js.map