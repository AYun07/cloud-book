"use strict";
/**
 * Cloud Book - 仿写/二创/同人创作引擎
 * 支持基于原作的智能仿写和创作
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImitationEngine = void 0;
class ImitationEngine {
    config;
    llmProvider;
    constructor(config) {
        this.config = config;
    }
    /**
     * 设置 LLM 提供者
     */
    setLLMProvider(provider) {
        this.llmProvider = provider;
    }
    /**
     * 提取原作风格（真实分析算法）
     */
    extractSourceStyle() {
        const parseResult = this.config.sourceParseResult;
        const content = this.reconstructFromParseResult(parseResult);
        const analysis = this.performStyleAnalysis(content);
        return {
            averageSentenceLength: analysis.avgSentenceLength,
            sentenceLengthDistribution: analysis.sentenceLengthDistribution,
            dialogueRatio: analysis.dialogueRatio,
            descriptionDensity: analysis.descriptionDensity,
            emotionalWordFrequency: analysis.emotionalWords,
            emotionalWords: Object.keys(analysis.emotionalWords),
            signaturePhrases: analysis.signaturePhrases,
            tabooWords: analysis.tabooWords,
            punctuationPatterns: analysis.punctuationPatterns,
            punctuationPattern: JSON.stringify(analysis.punctuationPatterns),
            narrativeVoice: analysis.narrativeVoice,
            tense: analysis.tense,
            paragraphStructure: analysis.paragraphStructure,
            wordFrequency: {}
        };
    }
    reconstructFromParseResult(parseResult) {
        const parts = [];
        if (parseResult.characters.length > 0) {
            parts.push(`主要角色：${parseResult.characters.map(c => c.name).join('、')}`);
        }
        if (parseResult.worldSettings?.powerSystem) {
            parts.push(`力量体系：${parseResult.worldSettings.powerSystem}`);
        }
        if (parseResult.chapters.length > 0) {
            parts.push(`章节数：${parseResult.chapters.length}`);
        }
        return parts.join('\n');
    }
    performStyleAnalysis(content) {
        const sentences = this.splitSentences(content);
        const paragraphs = content.split(/\n\n+/);
        const sentenceLengths = sentences.map(s => this.countWords(s));
        const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentences.length;
        const sentenceLengthDistribution = this.calculateLengthDistribution(sentenceLengths);
        const dialogueSegments = this.extractDialogueSegments(content);
        const dialogueRatio = content.length > 0 ? dialogueSegments.length / content.length : 0.3;
        const descriptiveWords = ['突然', '轻轻', '慢慢', '静静', '深深', '微微', '缓缓', '悄然', '骤然', '霍然'];
        const descriptionDensity = this.calculateWordDensity(content, descriptiveWords);
        const emotionalWords = this.extractEmotionalWords(sentences);
        const signaturePhrases = this.extractSignaturePhrases(sentences);
        const tabooWords = this.extractTabooWords(sentences);
        const punctuationPatterns = this.analyzePunctuation(content);
        const narrativeVoice = this.detectNarrativeVoice(content);
        const tense = this.detectTense(sentences);
        const paragraphLengths = paragraphs.map(p => this.countWords(p));
        const avgParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphs.length;
        const paragraphVariance = this.calculateVariance(paragraphLengths);
        return {
            avgSentenceLength,
            sentenceLengthDistribution,
            dialogueRatio,
            descriptionDensity,
            emotionalWords,
            signaturePhrases,
            tabooWords,
            punctuationPatterns,
            narrativeVoice,
            tense,
            paragraphStructure: { avgLength: avgParagraphLength, variance: paragraphVariance }
        };
    }
    splitSentences(text) {
        return text.split(/[。！？\.!?]+/).filter(s => s.trim().length > 0);
    }
    countWords(text) {
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    calculateLengthDistribution(lengths) {
        const buckets = new Array(10).fill(0);
        for (const len of lengths) {
            const bucketIndex = Math.min(Math.floor(len / 10), 9);
            buckets[bucketIndex]++;
        }
        const total = lengths.length || 1;
        return buckets.map(c => c / total);
    }
    extractDialogueSegments(text) {
        const segments = [];
        const regex = /"([^"]+)"|"([^"]+)"|『([^』]+)』/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const dialogue = match[1] || match[2] || match[3];
            if (dialogue)
                segments.push(dialogue);
        }
        return segments;
    }
    calculateWordDensity(text, words) {
        let count = 0;
        for (const word of words) {
            const matches = text.match(new RegExp(word, 'g'));
            if (matches)
                count += matches.length;
        }
        return count / this.countWords(text);
    }
    extractEmotionalWords(sentences) {
        const emotionalLexicon = {
            'joy': ['高兴', '开心', '快乐', '幸福', '喜悦', '愉快', '欢乐', '欢快'],
            'sadness': ['悲伤', '难过', '伤心', '痛苦', '绝望', '哀伤', '凄凉'],
            'anger': ['愤怒', '生气', '恼火', '怨恨', '气愤', '恼怒'],
            'fear': ['害怕', '恐惧', '担忧', '紧张', '焦虑', '不安', '惶恐'],
            'surprise': ['惊讶', '吃惊', '意外', '震惊', '惊愕', '诧异'],
            'love': ['爱', '喜欢', '爱慕', '深情', '柔情', '温暖']
        };
        const wordFreq = {};
        const text = sentences.join('');
        for (const [emotion, words] of Object.entries(emotionalLexicon)) {
            for (const word of words) {
                const matches = text.match(new RegExp(word, 'g'));
                if (matches) {
                    wordFreq[word] = matches.length;
                }
            }
        }
        return wordFreq;
    }
    extractSignaturePhrases(sentences) {
        const phraseCounts = {};
        const minLength = 4;
        const maxLength = 8;
        for (const sentence of sentences) {
            for (let len = minLength; len <= maxLength; len++) {
                for (let i = 0; i <= sentence.length - len; i++) {
                    const phrase = sentence.slice(i, i + len);
                    if (!phrase.includes('\n') && !/^\d+$/.test(phrase)) {
                        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
                    }
                }
            }
        }
        return Object.entries(phraseCounts)
            .filter(([_, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([phrase]) => phrase);
    }
    extractTabooWords(sentences) {
        const commonPhrases = ['其实', '不过', '然后', '所以', '因为', '但是', '如果', '虽然', '就是', '还是', '可以', '没有', '什么', '这个', '那个'];
        const text = sentences.join('');
        return commonPhrases.filter(phrase => {
            const matches = text.match(new RegExp(phrase, 'g'));
            return matches && matches.length > 10;
        });
    }
    analyzePunctuation(text) {
        const punctuation = ['，', '。', '！', '？', '；', '：', '"', '"', '"', '"', '、', '……', '——'];
        const patterns = {};
        for (const p of punctuation) {
            const matches = text.match(new RegExp(p, 'g'));
            patterns[p] = matches ? matches.length : 0;
        }
        return patterns;
    }
    detectNarrativeVoice(text) {
        const firstPersonPatterns = [/\b我\b/, /\b我们\b/, /\b我的\b/, /\b我们\b/];
        const thirdPersonPatterns = [/\b他\b/, /\b她\b/, /\b它\b/, /\b他们\b/, /\b她们\b/, /\b他的\b/, /\b她的\b/];
        let firstPersonCount = 0;
        let thirdPersonCount = 0;
        for (const pattern of firstPersonPatterns) {
            const matches = text.match(new RegExp(pattern, 'g'));
            if (matches)
                firstPersonCount += matches.length;
        }
        for (const pattern of thirdPersonPatterns) {
            const matches = text.match(new RegExp(pattern, 'g'));
            if (matches)
                thirdPersonCount += matches.length;
        }
        if (firstPersonCount > thirdPersonCount * 2)
            return 'first_person';
        if (thirdPersonCount > firstPersonCount * 2)
            return 'third_person';
        return 'mixed';
    }
    detectTense(sentences) {
        const pastMarkers = ['了', '曾经', '以前', '过去', '刚才', '当时', '已', '已经', '曾', '未曾'];
        const presentMarkers = ['正在', '现在', '此刻', '此时', '目前', '当今', '当今'];
        let pastCount = 0;
        let presentCount = 0;
        for (const marker of pastMarkers) {
            for (const sentence of sentences) {
                const matches = sentence.match(new RegExp(marker, 'g'));
                if (matches)
                    pastCount += matches.length;
            }
        }
        for (const marker of presentMarkers) {
            for (const sentence of sentences) {
                const matches = sentence.match(new RegExp(marker, 'g'));
                if (matches)
                    presentCount += matches.length;
            }
        }
        if (pastCount > presentCount * 2)
            return 'past';
        if (presentCount > pastCount * 2)
            return 'present';
        return 'mixed';
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
    measureStyleSimilarity(style1, style2) {
        let totalScore = 0;
        let totalWeight = 0;
        const weights = {
            sentenceLength: 0.15,
            dialogueRatio: 0.1,
            descriptionDensity: 0.1,
            narrativeVoice: 0.2,
            tense: 0.15,
            paragraphStructure: 0.1,
            punctuation: 0.1,
            emotionalWords: 0.1
        };
        totalScore += this.compareNumeric(style1.averageSentenceLength, style2.averageSentenceLength, 50) * weights.sentenceLength;
        totalWeight += weights.sentenceLength;
        totalScore += this.compareNumeric(style1.dialogueRatio, style2.dialogueRatio, 1) * weights.dialogueRatio;
        totalWeight += weights.dialogueRatio;
        totalScore += this.compareNumeric(style1.descriptionDensity, style2.descriptionDensity, 1) * weights.descriptionDensity;
        totalWeight += weights.descriptionDensity;
        totalScore += (style1.narrativeVoice === style2.narrativeVoice ? 1 : 0) * weights.narrativeVoice;
        totalWeight += weights.narrativeVoice;
        totalScore += (style1.tense === style2.tense ? 1 : 0) * weights.tense;
        totalWeight += weights.tense;
        totalScore += this.compareNumeric(style1.paragraphStructure?.avgLength || 0, style2.paragraphStructure?.avgLength || 0, 100) * weights.paragraphStructure;
        totalWeight += weights.paragraphStructure;
        totalScore += this.comparePunctuation(style1.punctuationPatterns, style2.punctuationPatterns) * weights.punctuation;
        totalWeight += weights.punctuation;
        totalScore += this.compareEmotionalWords(style1.emotionalWordFrequency, style2.emotionalWordFrequency) * weights.emotionalWords;
        totalWeight += weights.emotionalWords;
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    compareNumeric(a, b, maxDiff) {
        const diff = Math.abs(a - b);
        return Math.max(0, 1 - diff / maxDiff);
    }
    comparePunctuation(p1, p2) {
        const allKeys = new Set([...Object.keys(p1), ...Object.keys(p2)]);
        let totalDiff = 0;
        let count = 0;
        for (const key of allKeys) {
            const v1 = p1[key] || 0;
            const v2 = p2[key] || 0;
            const max = Math.max(v1, v2, 1);
            totalDiff += 1 - Math.abs(v1 - v2) / max;
            count++;
        }
        return count > 0 ? totalDiff / count : 0;
    }
    compareEmotionalWords(w1, w2) {
        const allKeys = new Set([...Object.keys(w1), ...Object.keys(w2)]);
        let totalDiff = 0;
        let count = 0;
        for (const key of allKeys) {
            const v1 = w1[key] || 0;
            const v2 = w2[key] || 0;
            const max = Math.max(v1, v2, 1);
            totalDiff += 1 - Math.abs(v1 - v2) / max;
            count++;
        }
        return count > 0 ? totalDiff / count : 0;
    }
    /**
     * 生成仿写内容
     */
    async generateImitation(context, instructions) {
        const style = this.extractSourceStyle();
        // 构建提示词
        const prompt = this.buildImitationPrompt(context, style, instructions);
        // 调用 LLM
        const result = await this.llmProvider.generate(prompt, {
            temperature: 0.7,
            maxTokens: 2000
        });
        return result.text;
    }
    /**
     * 生成二创内容
     */
    async generateDerivative(context, derivativeType) {
        if (!derivativeType) {
            throw new Error('derivativeType is required for derivative generation');
        }
        const prompt = this.buildDerivativePrompt(context, derivativeType);
        const result = await this.llmProvider.generate(prompt, {
            temperature: 0.8,
            maxTokens: 2000
        });
        return result.text;
    }
    /**
     * 生成同人内容
     */
    async generateFanfic(context, fanficConfig) {
        const prompt = this.buildFanficPrompt(context, fanficConfig);
        const result = await this.llmProvider.generate(prompt, {
            temperature: 0.75,
            maxTokens: 2000
        });
        return result.text;
    }
    /**
     * 批量仿写章节
     */
    async batchImitate(chapters, context, parallelCount = 3) {
        const results = [];
        for (let i = 0; i < chapters.length; i += parallelCount) {
            const batch = chapters.slice(i, i + parallelCount);
            const batchResults = await Promise.all(batch.map(chapter => this.generateImitation({ ...context, currentChapter: chapter.number }, chapter.outline)));
            results.push(...batch.map((chapter, index) => ({
                ...chapter,
                content: batchResults[index],
                status: 'draft'
            })));
        }
        return results;
    }
    /**
     * 构建仿写提示词
     */
    buildImitationPrompt(context, style, instructions) {
        const styleDescription = this.describeStyle(style);
        const imitationLevel = this.config.imitationLevel || 70;
        return `你是一位顶级小说作家，擅长模仿特定写作风格。

## 写作风格要求
${styleDescription}

## 仿写程度
风格模仿程度: ${imitationLevel}%
- 100%: 尽可能接近原作风格
- 50%: 在原作基础上有所创新
- 0%: 完全原创

## 创作背景
当前章节: 第${context.currentChapter}章
世界观设定: ${JSON.stringify(context.worldSetting, null, 2)}
主要角色: ${context.characters.map(c => `${c.name}(${c.personality || '未设定'})`).join(', ')}

## 上文摘要
${context.previousChapterSummary || '（无）'}

## 写作指导
${instructions || '根据大纲续写，保持风格一致'}

## 输出要求
1. 严格遵循上述风格特征
2. 保持角色一致性
3. 字数控制在 2000-3000 字
4. 不要使用 AI 常见的刻板表达

请开始写作：`;
    }
    /**
     * 构建二创提示词
     */
    buildDerivativePrompt(context, derivativeType) {
        const typeDescriptions = {
            'sequel': '续写原作之后的故事，延续世界观和角色',
            'prequel': '创作原作之前的前传，揭示背景故事',
            'spin_off': '以配角的视角重新诠释故事',
            'alternate_universe': '在不同的世界线重新演绎故事'
        };
        return `你是一位顶级小说作家，擅长进行高质量的二次创作。

## 二创类型
${typeDescriptions[derivativeType] || '续写故事'}

## 原作概要
- 原著字数: ${this.config.sourceParseResult.estimatedWordCount}
- 主要角色: ${this.config.sourceParseResult.characters.map(c => c.name).join(', ')}
- 世界观: ${this.config.sourceParseResult.worldSettings.powerSystem || '标准设定'}

## 新作品设定
- 新作章节: 第${context.currentChapter}章
- 题材: ${context.worldSetting.genre}
- 目标字数: ${context.currentChapter * 2500}字

## 写作要求
1. 在尊重原作精神的基础上进行创新
2. 保持世界观自洽
3. 角色行为符合其性格设定
4. 融入新的情节元素

请开始创作：`;
    }
    /**
     * 构建同人提示词
     */
    buildFanficPrompt(context, fanficConfig) {
        const settingDescriptions = {
            'canon': '保持原作设定和世界观',
            'alternate': '在原作基础上进行大幅度改编',
            'modern_au': '将角色置于现代都市背景',
            'crossover': '融合多个作品的角色和设定'
        };
        return `你是一位同人小说作家，擅长创作高质量的同人作品。

## 同人设定
- 世界观类型: ${settingDescriptions[fanficConfig?.setting || 'canon']}
- 保留的原作角色: ${fanficConfig?.originalCharacters?.join(', ') || '无'}
- 新增角色: ${fanficConfig?.newCharacters?.join(', ') || '无'}

## 原作信息
- 原著字数: ${this.config.sourceParseResult.estimatedWordCount}
- 主要角色: ${this.config.sourceParseResult.characters.map(c => c.name).join(', ')}

## 新作品信息
- 章节: 第${context.currentChapter}章
- 题材: ${context.worldSetting.genre}

## 写作要求
1. 保持原作角色的核心性格特征
2. 尊重原作世界观的设定
3. 创新但不偏离原作精神
4. 注重角色之间的互动和情感

请开始创作：`;
    }
    /**
     * 描述风格
     */
    describeStyle(style) {
        return `
### 句式特征
- 平均句长: ${this.calculateAverageSentenceLength(style.sentenceLengthDistribution)} 字
- 对话比例: ${(style.dialogueRatio * 100).toFixed(1)}%
- 描写密度: ${(style.descriptionDensity * 100).toFixed(1)}%

### 叙事特征
- 叙事视角: ${style.narrativeVoice === 'first_person' ? '第一人称' : '第三人称'}
- 时态: ${style.tense === 'past' ? '过去时' : '现在时'}

### 情感表达
- 常用情感词: ${style.emotionalWords.slice(0, 10).join(', ') || '无特定'}
- 标志性短语: ${style.signaturePhrases.slice(0, 5).join(', ') || '无'}

### 需要避免的词汇
${style.tabooWords.length > 0 ? style.tabooWords.join(', ') : '无特定禁忌'}
    `.trim();
    }
    /**
     * 计算平均句长
     */
    calculateAverageSentenceLength(distribution) {
        let total = 0;
        for (let i = 0; i < distribution.length; i++) {
            total += distribution[i] * (i * 10 + 5); // 每段的中间值
        }
        return Math.round(total);
    }
    /**
     * 生成章节大纲
     */
    async generateOutline(chapterNumber, worldSetting, characters, previousOutline) {
        const prompt = `为第${chapterNumber}章创作大纲。

世界观: ${worldSetting.name}
题材: ${worldSetting.genre}
力量体系: ${worldSetting.powerSystem || '无'}

主要角色:
${characters.map(c => `- ${c.name}: ${c.personality || '未设定'}`).join('\n')}

上一章大纲:
${previousOutline || '（无）'}

请按以下格式输出章节大纲:
1. 本章核心事件
2. 涉及角色
3. 场景安排
4. 关键对话要点
5. 伏笔设置（如果有）
6. 本章结尾悬念`;
        const result = await this.llmProvider.generate(prompt, {
            temperature: 0.7,
            maxTokens: 1000
        });
        return result.text;
    }
    /**
     * 风格迁移
     */
    async transferStyle(content, targetStyle, sourceStyle) {
        const prompt = `你是一位风格转换专家。

## 目标风格
${this.describeStyle(targetStyle)}

## 待转换内容
${content}

## 转换要求
1. 将内容转换为目标风格
2. 保持原有情节和角色
3. 自然融入目标风格的特征
4. 避免生硬的风格切换

请进行风格转换：`;
        const result = await this.llmProvider.generate(prompt, {
            temperature: 0.7,
            maxTokens: 2000
        });
        return result.text;
    }
}
exports.ImitationEngine = ImitationEngine;
exports.default = ImitationEngine;
//# sourceMappingURL=ImitationEngine.js.map