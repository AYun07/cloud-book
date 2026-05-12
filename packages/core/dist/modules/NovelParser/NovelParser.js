"use strict";
/**
 * Cloud Book - 高性能小说解析器
 * 支持千万字级文学作品解析
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelParser = void 0;
class NovelParser {
    config;
    progress;
    onProgress;
    constructor(config) {
        this.config = {
            enableStreaming: config?.enableStreaming !== false,
            enableSmartChaptering: config?.enableSmartChaptering !== false,
            extractCharacters: config?.extractCharacters !== false,
            extractSetting: config?.extractSetting !== false,
            chunkSize: config?.chunkSize || 1024 * 1024,
            maxMemoryLimit: config?.maxMemoryLimit || 100 * 1024 * 1024,
            ...config
        };
        this.progress = {
            totalBytes: 0,
            totalChapters: 0,
            totalCharacters: 0,
            status: 'parsing',
            currentPhase: '初始化'
        };
    }
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    async parseString(content) {
        if (!content) {
            throw new Error('Content cannot be empty');
        }
        this.updateProgress('parsing', '读取内容中...');
        const chapters = this.splitChapters(content);
        this.updateProgress('analyzing', '分析章节结构...');
        const characters = this.extractCharacters(content);
        const worldSettings = this.extractWorldSetting(content);
        this.updateProgress('complete', '解析完成');
        return {
            title: this.extractTitle(content),
            chapters,
            characters,
            worldSettings,
            writingPatterns: [],
            styleFingerprint: this.analyzeStyle(content),
            estimatedWordCount: content.length
        };
    }
    async parseFile(filePath) {
        this.updateProgress('parsing', '读取文件中...');
        const fs = require('fs');
        const content = fs.readFileSync(filePath, 'utf-8');
        this.progress.totalBytes = Buffer.byteLength(content, 'utf-8');
        this.updateProgress('parsing', '正在解析...');
        return this.parseString(content);
    }
    splitChapters(content) {
        const chapters = [];
        const chapterPatterns = [
            /^第[零一二三四五六七八九十百千万\d]+章/mg,
            /^第[零一二三四五六七八九十百千万\d]+节/mg,
            /^VOLUME\s+\d+/img,
            /^第[零一二三四五六七八九十百千万\d]+回/mg,
            /^Chapter\s+\d+/img,
            /^\d+\./mg,
            /^第[零一二三四五六七八九十百千万\d]+卷/mg
        ];
        const allMatches = [];
        for (const pattern of chapterPatterns) {
            let match;
            const regex = new RegExp(pattern);
            while ((match = regex.exec(content)) !== null) {
                if (match.index !== undefined) {
                    allMatches.push({ index: match.index, match: match[0] });
                }
            }
        }
        allMatches.sort((a, b) => a.index - b.index);
        if (allMatches.length > 0) {
            let previousIndex = 0;
            for (let i = 0; i < allMatches.length; i++) {
                const current = allMatches[i];
                if (i > 0 && current.index - previousIndex < 50) {
                    continue;
                }
                const nextIndex = i < allMatches.length - 1
                    ? allMatches[i + 1].index
                    : content.length;
                const chapterContent = content.slice(previousIndex, nextIndex).trim();
                if (chapterContent.length > 10) {
                    chapters.push({
                        index: chapters.length,
                        title: current.match.trim(),
                        content: chapterContent,
                        wordCount: chapterContent.length,
                        characters: [],
                        scenes: []
                    });
                }
                previousIndex = current.index;
            }
        }
        if (chapters.length === 0) {
            chapters.push({
                index: 0,
                title: '第1章',
                content: content.trim(),
                wordCount: content.length,
                characters: [],
                scenes: []
            });
        }
        return chapters;
    }
    extractCharacters(content) {
        const characters = [];
        const patterns = [
            /([\u4e00-\u9fa5]{2,4})的/g,
            /名为([\u4e00-\u9fa5]{2,4})/g,
            /([\u4e00-\u9fa5]{2,4})说道/g,
            /([\u4e00-\u9fa5]{2,4})想/g,
            /([\u4e00-\u9fa5]{2,4})看着/g,
            /([\u4e00-\u9fa5]{2,4})笑/g,
            /([\u4e00-\u9fa5]{2,4})皱眉/g,
            /([\u4e00-\u9fa5]{2,4})沉吟/g
        ];
        const names = new Set();
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    names.add(match[1]);
                }
            }
        }
        const commonWords = ['他', '她', '它', '他们', '她们', '它们', '自己', '大家', '众人', '有人', '某人', '什么', '如何', '为何', '因为', '所以', '但是', '然而', '虽然', '如果', '可以', '应该', '可能', '已经', '正在', '将要', '曾经', '从来', '总是', '偶尔', '经常', '有时候', '每次', '每天', '每年', '现在', '过去', '将来', '今天', '明天', '昨天', '这里', '那里', '哪里', '这么', '那么', '多么', '非常', '十分', '特别', '尤其', '更加', '稍微', '几乎', '完全', '根本', '简直', '似乎', '好像', '仿佛', '犹如', '如同', '比如', '例如', '据说', '听说', '看来', '总之', '其实', '果然', '竟然', '居然', '偏偏', '反而', '反倒', '索性', '干脆', '简直', '实在', '确实', '的确', '真的', '一定', '必定', '必然', '必须', '应该', '应当', '需要', '想要', '希望', '愿意', '能够', '可以', '会', '要', '得', '能', '可', '敢', '肯'];
        for (const name of names) {
            if (!commonWords.includes(name) && name.length >= 2) {
                characters.push({
                    name,
                    aliases: [],
                    description: '',
                    appearances: [],
                    relationships: []
                });
            }
        }
        return characters;
    }
    extractWorldSetting(content) {
        const locations = [];
        const factions = [];
        const items = [];
        const timeline = [];
        const locationPatterns = [
            /在([\u4e00-\u9fa5]{2,8})里/g,
            /来到([\u4e00-\u9fa5]{2,8})/g,
            /前往([\u4e00-\u9fa5]{2,8})/g,
            /进入([\u4e00-\u9fa5]{2,8})/g
        ];
        for (const pattern of locationPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && !locations.includes(match[1])) {
                    locations.push(match[1]);
                }
            }
        }
        const factionPatterns = [
            /([\u4e00-\u9fa5]{2,8})宗/g,
            /([\u4e00-\u9fa5]{2,8})派/g,
            /([\u4e00-\u9fa5]{2,8})教/g,
            /([\u4e00-\u9fa5]{2,8})门/g,
            /([\u4e00-\u9fa5]{2,8})帮/g
        ];
        for (const pattern of factionPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && !factions.includes(match[1])) {
                    factions.push(match[1]);
                }
            }
        }
        return {
            powerSystem: '',
            locations,
            factions,
            items,
            timeline
        };
    }
    analyzeStyle(content) {
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const totalLength = sentences.reduce((sum, s) => sum + s.length, 0);
        const avgLength = sentences.length > 0 ? totalLength / sentences.length : 0;
        const words = content.split(/\s+/);
        const uniqueWords = new Set(words).size;
        const richness = words.length > 0 ? uniqueWords / words.length : 0;
        const dialoguePattern = /[""''『』（][^""''『』]+[""''『』]/g;
        const dialogues = content.match(dialoguePattern) || [];
        const dialogueRatio = sentences.length > 0 ? dialogues.length / sentences.length : 0;
        return {
            sentenceLengthDistribution: [],
            wordFrequency: {},
            punctuationPattern: '',
            descriptionDensity: 0,
            dialogueRatio,
            narrativeVoice: 'third_person',
            tense: 'past',
            emotionalWords: [],
            signaturePhrases: [],
            tabooWords: []
        };
    }
    extractTitle(content) {
        const firstLines = content.split('\n').slice(0, 5);
        for (const line of firstLines) {
            const trimmed = line.trim();
            if (trimmed.length > 2 && trimmed.length < 50 && !trimmed.includes('第')) {
                return trimmed;
            }
        }
        return '未知标题';
    }
    detectLanguage(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishChars = (content.match(/[a-zA-Z]/g) || []).length;
        if (chineseChars > englishChars * 2)
            return 'zh';
        if (englishChars > chineseChars * 2)
            return 'en';
        return 'mixed';
    }
    detectGenre(content) {
        const fantasyKeywords = ['修炼', '功法', '境界', '宗门', '修真', '魔法', '斗气', '武魂'];
        const romanceKeywords = ['爱情', '喜欢', '爱', '恋人', '甜蜜', '心动'];
        const mysteryKeywords = ['神秘', '谜团', '真相', '破案', '凶手', '悬疑'];
        const scifiKeywords = ['星际', '飞船', 'AI', '未来', '科技', '机器人'];
        let scores = { fantasy: 0, romance: 0, mystery: 0, scifi: 0 };
        for (const keyword of fantasyKeywords) {
            if (content.includes(keyword))
                scores.fantasy++;
        }
        for (const keyword of romanceKeywords) {
            if (content.includes(keyword))
                scores.romance++;
        }
        for (const keyword of mysteryKeywords) {
            if (content.includes(keyword))
                scores.mystery++;
        }
        for (const keyword of scifiKeywords) {
            if (content.includes(keyword))
                scores.scifi++;
        }
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0)
            return 'general';
        return Object.keys(scores).find(k => scores[k] === maxScore) || 'general';
    }
    updateProgress(status, phase) {
        this.progress.status = status;
        this.progress.currentPhase = phase;
        if (this.onProgress) {
            this.onProgress({ ...this.progress });
        }
    }
}
exports.NovelParser = NovelParser;
exports.default = NovelParser;
//# sourceMappingURL=NovelParser.js.map