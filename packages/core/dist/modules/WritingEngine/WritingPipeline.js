"use strict";
/**
 * Cloud Book - 写作管线
 * 整合写作、审计、修订的完整流程
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritingPipeline = void 0;
const ContextManager_1 = require("../ContextManager/ContextManager");
class WritingPipeline {
    llmManager;
    auditEngine;
    antiDetectionEngine;
    contextManager;
    constructor(llmManager, auditEngine, antiDetectionEngine) {
        this.llmManager = llmManager;
        this.auditEngine = auditEngine;
        this.antiDetectionEngine = antiDetectionEngine;
        this.contextManager = new ContextManager_1.ContextManager();
    }
    /**
     * 执行完整写作流程
     */
    async generateChapter(project, chapterNumber, truthFiles, options) {
        // 1. 构建上下文
        const context = this.contextManager.buildWritingContext(project, chapterNumber, truthFiles);
        // 2. 生成正文
        const draftContent = await this.generateDraft(project, chapterNumber, context, options);
        // 3. 审计
        let auditResult;
        if (options?.autoAudit !== false) {
            auditResult = await this.auditEngine.audit(draftContent, truthFiles);
        }
        // 4. 修订（如果审计不通过）
        let finalContent = draftContent;
        if (auditResult && !auditResult.passed) {
            finalContent = await this.reviseBasedOnAudit(draftContent, auditResult, truthFiles, context);
        }
        // 5. 去AI味（如果启用）
        let humanized;
        if (options?.autoHumanize) {
            humanized = await this.antiDetectionEngine.humanize(finalContent, this.llmManager);
            finalContent = humanized;
        }
        // 6. 创建章节对象
        const chapter = {
            id: this.generateId(),
            number: chapterNumber,
            title: `第${this.toChineseNumber(chapterNumber)}章`,
            status: auditResult?.passed ? 'draft' : 'reviewing',
            wordCount: this.countWords(finalContent),
            content: finalContent,
            auditResult,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return { chapter, auditResult, humanized };
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
}
exports.WritingPipeline = WritingPipeline;
exports.default = WritingPipeline;
//# sourceMappingURL=WritingPipeline.js.map