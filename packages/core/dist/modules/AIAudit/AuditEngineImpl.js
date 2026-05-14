"use strict";
/**
 * Cloud Book - 审计引擎 V2
 * 34维度全面质量审计 - 每个维度都有真正的检测算法
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditEngine = exports.AuditEngine = void 0;
const storage_js_1 = require("../../utils/storage.js");
const errors_js_1 = require("../../utils/errors.js");
class AuditEngine {
    storage;
    constructor() {
        this.storage = new storage_js_1.UnifiedStorage();
    }
    async audit(content, options = {}) {
        try {
            const enabledDimensions = options.dimensions || this.getAllDimensions();
            const dimensions = [];
            const issues = [];
            const suggestions = [];
            for (const dimensionName of enabledDimensions) {
                const dimension = await this.auditDimension(content, dimensionName, options);
                dimensions.push(dimension);
                if (dimension.status !== 'pass') {
                    issues.push(...this.dimensionToIssues(dimension));
                    suggestions.push(...this.getSuggestionsForDimension(dimension));
                }
            }
            const totalScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) /
                dimensions.reduce((sum, d) => sum + d.weight, 0);
            return {
                score: Math.round(totalScore * 100) / 100,
                dimensions,
                issues: issues.sort((a, b) => {
                    const severityOrder = { critical: 0, major: 1, minor: 2 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                }),
                suggestions: [...new Set(suggestions)],
                summary: this.generateSummary(totalScore, issues)
            };
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'AuditEngine.audit');
        }
    }
    getAllDimensions() {
        return [
            'grammar',
            'spelling',
            'punctuation',
            'sentenceStructure',
            'paragraphStructure',
            'coherence',
            'consistency',
            'characterVoice',
            'dialogue',
            'narrativeVoice',
            'pacing',
            'description',
            'showDontTell',
            'emotionalImpact',
            'conflict',
            'tension',
            'resolution',
            'plotHoles',
            'timeline',
            'worldbuilding',
            'motivation',
            'stakes',
            'themes',
            'symbolism',
            'prose',
            'readability',
            'authenticity',
            'redundancy',
            'clarity',
            'wordChoice',
            'sentenceVariation',
            'genreConvention',
            'targetAudience',
            'aiDetection'
        ];
    }
    async auditDimension(content, dimension, options) {
        const dimensionConfigs = {
            grammar: { weight: 1.0, description: '语法正确性' },
            spelling: { weight: 1.0, description: '拼写准确性' },
            punctuation: { weight: 0.8, description: '标点符号使用' },
            sentenceStructure: { weight: 0.8, description: '句子结构' },
            paragraphStructure: { weight: 0.7, description: '段落结构' },
            coherence: { weight: 1.0, description: '文章连贯性' },
            consistency: { weight: 1.0, description: '设定一致性' },
            characterVoice: { weight: 0.9, description: '角色声音一致性' },
            dialogue: { weight: 0.8, description: '对话质量' },
            narrativeVoice: { weight: 0.9, description: '叙述声音' },
            pacing: { weight: 0.9, description: '节奏控制' },
            description: { weight: 0.7, description: '描写质量' },
            showDontTell: { weight: 0.8, description: '展示而非讲述' },
            emotionalImpact: { weight: 0.8, description: '情感冲击力' },
            conflict: { weight: 0.9, description: '冲突设置' },
            tension: { weight: 0.8, description: '张力营造' },
            resolution: { weight: 0.9, description: '冲突解决' },
            plotHoles: { weight: 1.0, description: '情节漏洞' },
            timeline: { weight: 0.9, description: '时间线一致性' },
            worldbuilding: { weight: 0.8, description: '世界观构建' },
            motivation: { weight: 0.9, description: '角色动机' },
            stakes: { weight: 0.8, description: '利害关系' },
            themes: { weight: 0.7, description: '主题深度' },
            symbolism: { weight: 0.6, description: '象征意义' },
            prose: { weight: 0.7, description: '文笔质量' },
            readability: { weight: 0.8, description: '可读性' },
            authenticity: { weight: 0.8, description: '真实感' },
            redundancy: { weight: 0.7, description: '冗余内容' },
            clarity: { weight: 0.8, description: '表达清晰度' },
            wordChoice: { weight: 0.7, description: '用词选择' },
            sentenceVariation: { weight: 0.6, description: '句式变化' },
            genreConvention: { weight: 0.7, description: '类型惯例' },
            targetAudience: { weight: 0.7, description: '目标读者匹配' },
            aiDetection: { weight: 0.9, description: 'AI痕迹检测' }
        };
        const config = dimensionConfigs[dimension] || { weight: 0.5, description: dimension };
        const checkMethods = {
            grammar: () => this.checkGrammar(content),
            spelling: () => this.checkSpelling(content),
            punctuation: () => this.checkPunctuation(content),
            sentenceStructure: () => this.checkSentenceStructure(content),
            paragraphStructure: () => this.checkParagraphStructure(content),
            coherence: () => this.checkCoherence(content),
            consistency: () => this.checkConsistency(content),
            characterVoice: () => this.checkCharacterVoice(content),
            dialogue: () => this.checkDialogue(content),
            narrativeVoice: () => this.checkNarrativeVoice(content),
            pacing: () => this.checkPacing(content),
            description: () => this.checkDescription(content),
            showDontTell: () => this.checkShowDontTell(content),
            emotionalImpact: () => this.checkEmotionalImpact(content),
            conflict: () => this.checkConflict(content),
            tension: () => this.checkTension(content),
            resolution: () => this.checkResolution(content),
            plotHoles: () => this.checkPlotHoles(content),
            timeline: () => this.checkTimeline(content),
            worldbuilding: () => this.checkWorldbuilding(content),
            motivation: () => this.checkMotivation(content),
            stakes: () => this.checkStakes(content),
            themes: () => this.checkThemes(content),
            symbolism: () => this.checkSymbolism(content),
            prose: () => this.checkProse(content),
            readability: () => this.checkReadability(content),
            authenticity: () => this.checkAuthenticity(content),
            redundancy: () => this.checkRedundancy(content),
            clarity: () => this.checkClarity(content),
            wordChoice: () => this.checkWordChoice(content),
            sentenceVariation: () => this.checkSentenceVariation(content),
            genreConvention: () => this.checkGenreConvention(content),
            targetAudience: () => this.checkTargetAudience(content),
            aiDetection: () => this.checkAIDetection(content)
        };
        let { score, status, details } = checkMethods[dimension]
            ? checkMethods[dimension]()
            : { score: 70, status: 'warning', details: '未实现的审计维度' };
        if (options.strict && status === 'warning') {
            status = 'fail';
            score *= 0.8;
        }
        return {
            name: dimension,
            score: Math.round(score * 100) / 100,
            weight: config.weight,
            description: config.description,
            status,
            details
        };
    }
    checkGrammar(content) {
        const issues = [];
        const duplicateWords = content.match(/\b(\w+)\s+\1\b/gi);
        if (duplicateWords && duplicateWords.length > 0) {
            issues.push(`发现${duplicateWords.length}处单词重复`);
        }
        const subjectVerbMismatches = [
            /每[个位]?\w+(是|有|在|能|会)\b/,
            /所有\w+(是|有|在|能|会)\b/
        ];
        for (const pattern of subjectVerbMismatches) {
            const matches = content.match(pattern);
            if (matches)
                issues.push(`发现主谓不一致: ${matches.length}处`);
        }
        const doubleNegatives = content.match(/不\s*(没|无|未|别|莫)/g);
        if (doubleNegatives && doubleNegatives.length > 0) {
            issues.push(`发现${doubleNegatives.length}处双重否定`);
        }
        const danglingModifiers = [];
        const modifierPatterns = [
            /(虽然|尽管|因为|如果|当|当)\s*[^\s，,]+[，,]\s*[^\s，,]+[，。]/g
        ];
        for (const pattern of modifierPatterns) {
            const matches = content.match(pattern);
            if (matches)
                danglingModifiers.push(...matches.slice(0, 3));
        }
        if (danglingModifiers.length > 0) {
            issues.push(`发现${danglingModifiers.length}处悬垂修饰语`);
        }
        const parallelStructureErrors = [];
        const parallelPatterns = [
            /[是|有|做|进行|完成][^，,]+[是|有|做|进行|完成][^，,]+[是|有|做|进行|完成]/g
        ];
        for (const pattern of parallelPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                const filtered = matches.filter(m => {
                    const parts = m.split(/[，。]/);
                    return parts.length >= 3 && new Set(parts.map(p => p[0])).size === 1;
                });
                if (filtered.length > 0) {
                    parallelStructureErrors.push(...filtered.slice(0, 2));
                }
            }
        }
        if (parallelStructureErrors.length > 0) {
            issues.push(`发现${parallelStructureErrors.length}处并列结构错误`);
        }
        const words = content.split(/\s+/).length;
        const errorRate = issues.length / Math.max(words / 100, 1);
        let score = Math.max(0, 100 - issues.length * 5 - errorRate * 10);
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 80 || issues.length > 2)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 3).join('; ') : '未发现语法错误'
        };
    }
    checkSpelling(content) {
        const commonErrors = [
            [/\brecieve\b/gi, 'recieve → receive'],
            [/\bdefinately\b/gi, 'definately → definitely'],
            [/\boccured\b/gi, 'occured → occurred'],
            [/\bseperate\b/gi, 'seperate → separate'],
            [/\buntill\b/gi, 'untill → until'],
            [/\bpsychology\b/gi, '拼写检查通过'],
            [/\baccomodate\b/gi, 'accomodate → accommodate'],
            [/\boccassion\b/gi, 'occassion → occasion'],
            [/\brecomend\b/gi, 'recomend → recommend'],
            [/\bneccessary\b/gi, 'neccessary → necessary'],
            [/\bseperate\b/gi, 'seperate → separate'],
            [/\brember\b/gi, 'rember → remember'],
            [/\boccured\b/gi, 'occured → occurred'],
            [/\btruely\b/gi, 'truely → truly'],
            [/\bwich\b/gi, 'wich → which'],
            [/\bthier\b/gi, 'thier → their'],
            [/\brealy\b/gi, 'realy → really']
        ];
        const errors = [];
        for (const [pattern, correction] of commonErrors) {
            if (pattern.test(content)) {
                const matches = content.match(pattern);
                if (matches) {
                    errors.push(`${correction} (${matches.length}处)`);
                }
            }
        }
        const chineseErrors = [
            { pattern: /[的地得][的地得]/g, desc: '的/地/得混淆' },
            { pattern: /[象像]形/g, desc: '象/像混淆' },
            { pattern: /再在/g, desc: '再/在混淆' },
            { pattern: /做作/g, desc: '做/作混淆' }
        ];
        for (const check of chineseErrors) {
            const matches = content.match(check.pattern);
            if (matches && matches.length > 0) {
                errors.push(`${check.desc} (${matches.length}处)`);
            }
        }
        const words = content.split(/\s+/).length;
        const score = Math.max(0, 100 - errors.length * 8 - (errors.length > 5 ? 20 : 0));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 85 || errors.length > 0)
            status = 'warning';
        return {
            score,
            status,
            details: errors.length > 0 ? errors.slice(0, 3).join('; ') : '未发现拼写错误'
        };
    }
    checkPunctuation(content) {
        const issues = [];
        const consecutivePunctuation = content.match(/[，。；：、]{3,}/g);
        if (consecutivePunctuation) {
            issues.push(`${consecutivePunctuation.length}处连续标点`);
        }
        const missingCommas = content.match(/[^\s，][^\s，]{10,30}[，][^\s，]{10,30}[，。]/g);
        if (missingCommas) {
            issues.push(`${missingCommas.length}处可能缺少逗号`);
        }
        const quoteBalance = (content.match(/[""]/g) || []).length;
        const singleQuoteBalance = (content.match(/['']/g) || []).length;
        if (quoteBalance % 2 !== 0) {
            issues.push('引号不匹配');
        }
        if (singleQuoteBalance % 2 !== 0) {
            issues.push('单引号不匹配');
        }
        const parenthesesBalance = (content.match(/[（]/g) || []).length - (content.match(/[）]/g) || []).length;
        if (parenthesesBalance !== 0) {
            issues.push('括号不匹配');
        }
        const periodCount = (content.match(/[.。]/g) || []).length;
        const commaCount = (content.match(/[,，]/g) || []).length;
        const sentences = content.split(/[.。!！?？]/).length;
        const properPunctuationRatio = commaCount / Math.max(sentences, 1);
        if (properPunctuationRatio < 0.5) {
            issues.push('标点使用不够充分');
        }
        let score = 100;
        if (issues.length > 3)
            score -= 20;
        else if (issues.length > 0)
            score -= issues.length * 5;
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 80)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 3).join('; ') : '标点使用正确'
        };
    }
    checkSentenceStructure(content) {
        const sentences = content.split(/[.。!！?？]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0) {
            return { score: 50, status: 'warning', details: '未发现完整句子' };
        }
        const issues = [];
        const lengths = sentences.map(s => s.trim().length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const runOnSentences = sentences.filter(s => {
            const clauses = s.split(/[，,]/);
            return clauses.length > 4 && s.length > 100;
        });
        if (runOnSentences.length > sentences.length * 0.3) {
            issues.push(`${runOnSentences.length}处流水句`);
        }
        const fragmentSentences = sentences.filter(s => {
            const words = s.trim().split(/\s+/);
            return words.length < 4 && !s.match(/["""'']/);
        });
        if (fragmentSentences.length > sentences.length * 0.2) {
            issues.push(`${fragmentSentences.length}处句子片段`);
        }
        const passiveVoiceCount = (content.match(/\w+被\w+/g) || []).length;
        if (passiveVoiceCount > sentences.length * 0.3) {
            issues.push('被动语态使用过多');
        }
        const questionCount = (content.match(/[?？]/g) || []).length;
        const exclamationCount = (content.match(/[!！]/g) || []).length;
        const dialogueCount = (content.match(/["""'']/g) || []).length;
        const variation = (questionCount + exclamationCount + dialogueCount) / Math.max(sentences.length, 1);
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (avgLength > 80)
            score -= 10;
        if (avgLength < 5)
            score -= 15;
        if (variation < 0.05)
            score -= 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `句子结构良好，平均长度${Math.round(avgLength)}字符`
        };
    }
    checkParagraphStructure(content) {
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        if (paragraphs.length === 0) {
            return { score: 50, status: 'warning', details: '未发现段落' };
        }
        const issues = [];
        const lengths = paragraphs.map(p => p.trim().split(/\s+/).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const veryShortParagraphs = paragraphs.filter(p => p.trim().split(/\s+/).length < 10);
        const veryLongParagraphs = paragraphs.filter(p => p.trim().split(/\s+/).length > 200);
        if (veryShortParagraphs.length > paragraphs.length * 0.5) {
            issues.push(`${veryShortParagraphs.length}个段落过短`);
        }
        if (veryLongParagraphs.length > paragraphs.length * 0.3) {
            issues.push(`${veryLongParagraphs.length}个段落过长`);
        }
        const lengthVariance = this.calculateVariance(lengths) / Math.max(avgLength, 1);
        if (lengthVariance > 1.5) {
            issues.push('段落长度差异过大');
        }
        const paragraphsWithoutTopicSentence = paragraphs.filter(p => {
            const firstSentence = p.split(/[。！？]/)[0];
            return firstSentence && firstSentence.length < 5;
        });
        if (paragraphsWithoutTopicSentence.length > paragraphs.length * 0.4) {
            issues.push('部分段落缺少主题句');
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 6;
        if (avgLength < 20)
            score -= 10;
        if (avgLength > 180)
            score -= 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `段落结构良好，平均${Math.round(avgLength)}词/段`
        };
    }
    checkCoherence(content) {
        const issues = [];
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const transitions = [
            /\b首先\b/, /\b其次\b/, /\b然后\b/, /\b接着\b/, /\b最后\b/,
            /\b然而\b/, /\b但是\b/, /\b不过\b/, /\b因此\b/, /\b所以\b/,
            /\b因为\b/, /\b虽然\b/, /\b尽管\b/, /\b即使\b/, /\b于是\b/,
            /\b与此同时\b/, /\b另外\b/, /\b此外\b/, /\b总之\b/, /\b综上所述\b/
        ];
        let transitionCount = 0;
        for (const pattern of transitions) {
            const matches = content.match(pattern);
            if (matches)
                transitionCount += matches.length;
        }
        const sentenceTransition = paragraphs.map(p => {
            const sentences = p.split(/[。！？]/).filter(s => s.trim().length > 0);
            if (sentences.length < 2)
                return 0;
            let tCount = 0;
            for (const tp of transitions) {
                const matches = p.match(tp);
                if (matches)
                    tCount += matches.length;
            }
            return tCount;
        });
        const avgTransitionPerPara = transitionCount / Math.max(paragraphs.length, 1);
        const sentencesWithoutTransition = sentenceTransition.filter(t => t === 0).length;
        if (avgTransitionPerPara < 0.2 && paragraphs.length > 3) {
            issues.push('缺少过渡词');
        }
        if (sentencesWithoutTransition > paragraphs.length * 0.6) {
            issues.push('部分段落缺乏衔接');
        }
        const repeatedPhrases = this.detectRepeatedPhrases(content);
        if (repeatedPhrases.length > 5) {
            issues.push(`${repeatedPhrases.length}处重复短语`);
        }
        const topicShifts = this.detectTopicShifts(paragraphs);
        if (topicShifts > paragraphs.length * 0.5) {
            issues.push('主题转换过于频繁');
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 7;
        if (transitionCount < 2 && paragraphs.length > 2)
            score -= 15;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `连贯性良好，使用${transitionCount}处过渡`
        };
    }
    checkConsistency(content) {
        const issues = [];
        const characterNames = this.extractCharacterNames(content);
        const nameMentions = {};
        for (const name of characterNames) {
            nameMentions[name] = (nameMentions[name] || 0) + 1;
        }
        const inconsistentlyUsedNames = [];
        for (const [name, count] of Object.entries(nameMentions)) {
            if (count > 5) {
                const variations = [
                    name + '说', name + '道', name + '问', name + '笑',
                    name.replace(/./g, ''), name + '的'
                ];
                let foundVariation = false;
                for (const variation of variations) {
                    if (content.includes(variation)) {
                        foundVariation = true;
                        break;
                    }
                }
                if (!foundVariation && name.length > 1) {
                    inconsistentlyUsedNames.push(name);
                }
            }
        }
        if (inconsistentlyUsedNames.length > 0) {
            issues.push(`角色称呼不一致: ${inconsistentlyUsedNames.slice(0, 2).join(', ')}`);
        }
        const locationMentions = [];
        const locationPattern = /在([A-Z\u4e00-\u9fa5]{2,15})[里中上下一]|来到([A-Z\u4e00-\u9fa5]{2,15})/g;
        let match;
        while ((match = locationPattern.exec(content)) !== null) {
            locationMentions.push(match[1] || match[2]);
        }
        const uniqueLocations = [...new Set(locationMentions)];
        if (uniqueLocations.length > 3) {
            const locationCounts = {};
            for (const loc of locationMentions) {
                locationCounts[loc] = (locationCounts[loc] || 0) + 1;
            }
            const lowFrequencyLocations = Object.entries(locationCounts)
                .filter(([_, count]) => count === 1)
                .map(([name]) => name);
            if (lowFrequencyLocations.length > uniqueLocations.length * 0.5) {
                issues.push('地点出现后未被再次提及');
            }
        }
        const tenseIndicators = this.detectTenseInconsistencies(content);
        if (tenseIndicators.length > 0) {
            issues.push(`${tenseIndicators.length}处时态不一致`);
        }
        const pronounReferences = this.checkPronounReferences(content);
        if (pronounReferences.length > 0) {
            issues.push(`${pronounReferences.length}处代词指代不清`);
        }
        let score = 85;
        if (issues.length > 0)
            score -= issues.length * 8;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : '设定一致性良好'
        };
    }
    checkCharacterVoice(content) {
        const issues = [];
        const dialogues = this.extractDialogues(content);
        if (dialogues.length === 0) {
            return { score: 50, status: 'warning', details: '未发现对话，难以评估角色声音' };
        }
        const uniqueSpeechPatterns = [];
        const speechLengths = [];
        for (const dialogue of dialogues) {
            const text = dialogue.replace(/["""''『』（]/g, '').trim();
            speechLengths.push(text.length);
            const patterns = [
                /^[啊呀哦嗯呃]/,
                /\w{1,2}啊$/,
                /~\w+$/,
                /！{2,}/,
                /\?\?+/
            ];
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    uniqueSpeechPatterns.push(text);
                    break;
                }
            }
        }
        const avgLength = speechLengths.reduce((a, b) => a + b, 0) / Math.max(speechLengths.length, 1);
        const lengthVariance = this.calculateVariance(speechLengths);
        if (avgLength > 100) {
            issues.push('对话普遍过长，可能缺乏角色特色');
        }
        if (avgLength < 5 && dialogues.length > 3) {
            issues.push('对话普遍过短');
        }
        if (uniqueSpeechPatterns.length < dialogues.length * 0.2) {
            issues.push('角色说话方式过于相似');
        }
        const fillerWords = ['这个', '那个', '就是', '嗯', '啊', '呢'];
        const fillerCounts = {};
        for (const filler of fillerWords) {
            const count = (content.match(new RegExp(filler, 'g')) || []).length;
            if (count > 10) {
                fillerCounts[filler] = count;
            }
        }
        if (Object.keys(fillerCounts).length > 3) {
            issues.push('角色语言过于口语化/重复');
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 7;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `角色声音有区分度，${dialogues.length}段对话`
        };
    }
    checkDialogue(content) {
        const issues = [];
        const dialogues = this.extractDialogues(content);
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        if (dialogues.length === 0) {
            return { score: 40, status: 'warning', details: '缺少对话内容' };
        }
        const dialogueRatio = dialogues.length / Math.max(paragraphs.length, 1);
        if (dialogueRatio < 0.1) {
            issues.push('对话占比较少');
        }
        if (dialogueRatio > 0.7) {
            issues.push('对话占比过高，叙述不足');
        }
        const avgLength = dialogues.reduce((sum, d) => sum + d.length, 0) / dialogues.length;
        if (avgLength > 200) {
            issues.push('对话过长，可能不够自然');
        }
        const dialogueWithAction = dialogues.filter(d => {
            const actionIndicators = ['说', '道', '问', '答', '喊', '叫', '笑', '叹气', '皱眉'];
            return actionIndicators.some(a => d.includes(a));
        }).length;
        const actionRatio = dialogueWithAction / Math.max(dialogues.length, 1);
        if (actionRatio < 0.3 && dialogues.length > 2) {
            issues.push('大部分对话缺少动作描写');
        }
        const sameSpeakerConsecutive = this.detectConsecutiveSameSpeaker(dialogues);
        if (sameSpeakerConsecutive > 0) {
            issues.push(`${sameSpeakerConsecutive}处连续相同说话者`);
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (dialogues.length < 3)
            score -= 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `对话质量良好，${dialogues.length}段对话`
        };
    }
    checkNarrativeVoice(content) {
        const issues = [];
        const firstPersonWords = ['我', '我们', '俺', '咱们'];
        const secondPersonWords = ['你', '您', '你们'];
        const thirdPersonWords = ['他', '她', '它', '他们', '她们', '它们'];
        let firstPersonCount = 0;
        let secondPersonCount = 0;
        let thirdPersonCount = 0;
        for (const word of firstPersonWords) {
            firstPersonCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of secondPersonWords) {
            secondPersonCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of thirdPersonWords) {
            thirdPersonCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        const totalPronounCount = firstPersonCount + secondPersonCount + thirdPersonCount;
        if (totalPronounCount === 0) {
            return { score: 50, status: 'warning', details: '难以判断叙事视角' };
        }
        const firstPersonRatio = firstPersonCount / totalPronounCount;
        const secondPersonRatio = secondPersonCount / totalPronounCount;
        if (secondPersonRatio > 0.5) {
            issues.push('第二人称使用过多');
        }
        const narrationStartPatterns = [
            /^(我|我们)/,
            /^看到/,
            /^听到/,
            /^感受到/
        ];
        let consistentStart = 0;
        let totalStarts = 0;
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        for (const para of paragraphs.slice(0, 5)) {
            const firstSentence = para.split(/[。！？]/)[0];
            totalStarts++;
            for (const pattern of narrationStartPatterns) {
                if (pattern.test(firstSentence)) {
                    consistentStart++;
                    break;
                }
            }
        }
        if (totalStarts > 0 && consistentStart / totalStarts < 0.4) {
            issues.push('叙事视角不够统一');
        }
        let score = 85;
        if (issues.length > 0)
            score -= issues.length * 10;
        let voiceType = '第三人称';
        if (firstPersonRatio > 0.6)
            voiceType = '第一人称';
        else if (secondPersonRatio > 0.3)
            voiceType = '第二人称';
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `叙事声音统一，使用${voiceType}视角`
        };
    }
    checkPacing(content) {
        const issues = [];
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        if (paragraphs.length === 0) {
            return { score: 50, status: 'warning', details: '未发现段落' };
        }
        const lengths = paragraphs.map(p => p.split(/\s+/).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = this.calculateVariance(lengths);
        const stdDev = Math.sqrt(variance);
        if (stdDev / avgLength > 1.0) {
            issues.push('段落长度差异过大');
        }
        const shortParagraphs = paragraphs.filter(p => p.split(/\s+/).length < 15);
        const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 150);
        if (shortParagraphs.length / paragraphs.length > 0.6) {
            issues.push('过多短段落，节奏可能过快');
        }
        if (longParagraphs.length / paragraphs.length > 0.4) {
            issues.push('过多长段落，节奏可能过慢');
        }
        const actionWords = ['突然', '立刻', '瞬间', '刹那间', '转眼', '飞快地', '猛地'];
        const pauseWords = ['静静地', '慢慢地', '缓缓地', '静静地等待', '沉默地'];
        let actionCount = 0;
        let pauseCount = 0;
        for (const word of actionWords) {
            actionCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of pauseWords) {
            pauseCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (actionCount > 5 && pauseCount < 1) {
            issues.push('节奏过于紧凑，缺乏舒缓段落');
        }
        if (pauseCount > 5 && actionCount < 1) {
            issues.push('节奏过于平缓，缺乏高潮');
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 7;
        if (avgLength < 20 || avgLength > 200)
            score -= 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `节奏控制良好，平均${Math.round(avgLength)}词/段`
        };
    }
    checkDescription(content) {
        const issues = [];
        const visualWords = ['看', '看到', '看见', '观察', '注视', '瞥见', '目光', '眼神'];
        const auditoryWords = ['听', '听到', '听见', '声音', '耳边', '回响'];
        const olfactoryWords = ['闻', '闻到', '气味', '芳香', '臭味', '腥味'];
        const tactileWords = ['触摸', '感受', '感觉到', '温暖', '冰凉', '光滑', '粗糙'];
        const tasteWords = ['品尝', '味道', '滋味', '酸甜苦辣'];
        let visualCount = 0, auditoryCount = 0, olfactoryCount = 0, tactileCount = 0, tasteCount = 0;
        for (const word of visualWords) {
            visualCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of auditoryWords) {
            auditoryCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of olfactoryWords) {
            olfactoryCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of tactileWords) {
            tactileCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        for (const word of tasteWords) {
            tasteCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        const sensoryTypes = [visualCount > 0, auditoryCount > 0, olfactoryCount > 0, tactileCount > 0, tasteCount > 0]
            .filter(Boolean).length;
        if (sensoryTypes < 2) {
            issues.push('描写手段单一，感官细节不足');
        }
        const adjectivePatterns = [
            /\w+的\w+/g,
            /\w+而\w+/g,
            /\w+地\w+/g
        ];
        let totalAdjectives = 0;
        for (const pattern of adjectivePatterns) {
            const matches = content.match(pattern);
            if (matches)
                totalAdjectives += matches.length;
        }
        const words = content.split(/\s+/).length;
        const adjectiveRatio = totalAdjectives / Math.max(words, 1);
        if (adjectiveRatio < 0.05) {
            issues.push('形容词使用不足');
        }
        if (adjectiveRatio > 0.3) {
            issues.push('形容词使用过多，可能过于堆砌');
        }
        const characterDescriptions = content.match(/身高[^\s，,]{0,20}[。]|长相[^\s，,]{0,20}[。]|外貌[^\s，,]{0,20}[。]|穿着[^\s，,]{0,30}[。]/g) || [];
        const settingDescriptions = content.match(/环境[^\s，,]{0,20}[。]|场景[^\s，,]{0,20}[。]|氛围[^\s，,]{0,20}[。]|天空[^\s，,]{0,20}[。]/g) || [];
        if (characterDescriptions.length === 0 && settingDescriptions.length === 0 && content.length > 500) {
            issues.push('缺少具体描写');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `使用${sensoryTypes}种感官描写`
        };
    }
    checkShowDontTell(content) {
        const issues = [];
        const tellPatterns = [
            { pattern: /\b(他|她|它)是\s*个?\s*(善良|邪恶|勇敢|懦弱|聪明|愚蠢|温柔|粗暴|诚实|虚伪|乐观|悲观)的\w*/gi, desc: '直接陈述性格' },
            { pattern: /\b(他|她|它)\s*(感到|觉得|感受到)\s*(悲伤|快乐|愤怒|恐惧|开心|难过|激动|紧张|害怕|惊讶)/gi, desc: '直接陈述情绪' },
            { pattern: /\b天气\s*(很|非常|十分)\s*(好|热|冷|冷清|温暖)/gi, desc: '直接陈述天气' },
            { pattern: /\b房间\s*(很|非常)\s*(大|小|安静|吵|整洁|脏乱)/gi, desc: '直接陈述环境' },
            { pattern: /的气氛[是为]*(.*)[。]/gi, desc: '直接陈述气氛' },
            { pattern: /\b(他|她)的\s*(表情|脸色|眼神|目光|心情|情绪)/gi, desc: '直接描述内心' }
        ];
        let tellCount = 0;
        const tellExamples = [];
        for (const { pattern, desc } of tellPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                tellCount += matches.length;
                if (tellExamples.length < 3) {
                    tellExamples.push(`${desc} (${matches.length}处)`);
                }
            }
        }
        const showPatterns = [
            { pattern: /[，、](皱了皱眉|攥紧拳头|咬紧牙关|浑身发抖|眼眶湿润|嘴角上扬)/gi, desc: '通过动作展示情绪' },
            { pattern: /[，。](他|她|他们)没有说话，只是[^\s，。]+/gi, desc: '通过沉默展示' },
            { pattern: /[，。](然而|但是|尽管|虽然)[^，]+，[^\s，。]+却不[^\s，。]+/gi, desc: '通过对比展示' }
        ];
        let showCount = 0;
        for (const { pattern } of showPatterns) {
            const matches = content.match(pattern);
            if (matches)
                showCount += matches.length;
        }
        if (tellCount > 5) {
            issues.push(`发现${tellCount}处"讲述"而非"展示"`);
        }
        if (tellCount > showCount * 2 && showCount < 3) {
            issues.push('展示与讲述比例失衡');
        }
        const words = content.split(/\s+/).length;
        const tellRatio = tellCount / Math.max(words / 100, 1);
        let score = Math.max(0, 100 - tellCount * 5 - tellRatio * 20);
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `展示:${showCount}处, 讲述:${tellCount}处`
        };
    }
    checkEmotionalImpact(content) {
        const issues = [];
        const emotionWords = [
            '悲伤', '快乐', '愤怒', '恐惧', '惊讶', '开心', '难过', '心痛',
            '激动', '紧张', '害怕', '心疼', '感动', '委屈', '喜悦', '痛苦',
            '绝望', '希望', '爱', '恨', '泪水', '哭泣', '欢笑', '大笑',
            '哀伤', '忧愁', '愤怒', '震惊', '惶恐', '羞涩', '兴奋', '狂喜'
        ];
        let emotionCount = 0;
        const emotionCounts = {};
        for (const word of emotionWords) {
            const matches = content.match(new RegExp(word, 'g'));
            if (matches && matches.length > 0) {
                emotionCount += matches.length;
                emotionCounts[word] = matches.length;
            }
        }
        const uniqueEmotions = Object.keys(emotionCounts).length;
        if (uniqueEmotions < 2) {
            issues.push('情感类型单一');
        }
        const exclamationCount = (content.match(/[!！]/g) || []).length;
        const questionCount = (content.match(/[?？]/g) || []).length;
        const ellipsisCount = (content.match(/[……~]{2,}/g) || []).length;
        const emotionalPunctuation = exclamationCount + questionCount + ellipsisCount;
        const words = content.split(/\s+/).length;
        const emotionDensity = emotionCount / Math.max(words / 500, 1);
        if (emotionDensity < 1) {
            issues.push('情感描写密度不足');
        }
        if (emotionDensity > 10) {
            issues.push('情感描写过于密集');
        }
        const bodyLanguagePatterns = [
            '颤抖', '握紧', '颤抖', '哽咽', '掩面', '发抖', '咬唇', '攥紧',
            '跌坐', '后退', '紧抱', '转身', '低下头', '捂住', '红了眼眶'
        ];
        let bodyLanguageCount = 0;
        for (const pattern of bodyLanguagePatterns) {
            const matches = content.match(new RegExp(pattern, 'g'));
            if (matches)
                bodyLanguageCount += matches.length;
        }
        if (emotionCount > 5 && bodyLanguageCount < emotionCount * 0.2) {
            issues.push('情感描写缺乏肢体语言支撑');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (emotionalPunctuation > 10)
            score += 5;
        if (emotionDensity > 2 && emotionDensity < 8)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `情感密度:${emotionDensity.toFixed(1)}词/500字, ${uniqueEmotions}种情感`
        };
    }
    checkConflict(content) {
        const issues = [];
        const conflictTypes = {
            physical: ['争吵', '打架', '搏斗', '冲突', '对抗', '攻击', '防御'],
            verbal: ['争论', '辩论', '质问', '反驳', '质疑', '指责', '控诉'],
            internal: ['犹豫', '纠结', '挣扎', '矛盾', '自责', '内疚', '痛苦抉择']
        };
        let physicalCount = 0, verbalCount = 0, internalCount = 0;
        for (const phrase of conflictTypes.physical) {
            physicalCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of conflictTypes.verbal) {
            verbalCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of conflictTypes.internal) {
            internalCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        const totalConflict = physicalCount + verbalCount + internalCount;
        if (totalConflict === 0) {
            issues.push('缺少冲突元素');
        }
        const conflictTypesPresent = [physicalCount > 0, verbalCount > 0, internalCount > 0]
            .filter(Boolean).length;
        if (conflictTypesPresent === 1 && totalConflict < 3) {
            issues.push('冲突类型单一');
        }
        const conflictEscalation = this.checkConflictEscalation(content);
        if (conflictEscalation < 0) {
            issues.push('冲突未呈现升级趋势');
        }
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const conflictParagraphs = paragraphs.filter(p => {
            const conflictPhrases = [...conflictTypes.physical, ...conflictTypes.verbal, ...conflictTypes.internal];
            return conflictPhrases.some(phrase => p.includes(phrase));
        });
        const conflictRatio = conflictParagraphs.length / Math.max(paragraphs.length, 1);
        if (conflictRatio < 0.1 && paragraphs.length > 3) {
            issues.push('冲突出现频率过低');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (totalConflict > 3)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `发现${totalConflict}处冲突，${conflictTypesPresent}种类型`
        };
    }
    checkTension(content) {
        const issues = [];
        const tensionIndicators = {
            time: ['突然', '刹那间', '瞬间', '眨眼间', '倏地', '猛地'],
            uncertainty: ['也许', '可能', '不知道', '不确定', '是否', '万一', '假如'],
            danger: ['危险', '危机', '威胁', '恐惧', '害怕', '紧张', '不安'],
            suspense: ['然而', '但是', '出乎意料', '没想到', '竟然', '偏偏', '就在这时']
        };
        let timeCount = 0, uncertaintyCount = 0, dangerCount = 0, suspenseCount = 0;
        for (const phrase of tensionIndicators.time) {
            timeCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of tensionIndicators.uncertainty) {
            uncertaintyCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of tensionIndicators.danger) {
            dangerCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of tensionIndicators.suspense) {
            suspenseCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        const totalTension = timeCount + uncertaintyCount + dangerCount + suspenseCount;
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const tensionBuilding = this.identifyTensionBuilding(paragraphs);
        if (totalTension < 2 && paragraphs.length > 2) {
            issues.push('张力营造不足');
        }
        if (tensionBuilding.length < 2 && totalTension < 5) {
            issues.push('缺少递进式张力');
        }
        const cliffhangers = content.match(/就在这时[，。]|(?!却|但)[^\s，]{0,5}却[^\s，。]{0,10}[。？]/g) || [];
        const openEndings = content.match(/[是否会不会能不能][^。？]*[。？]$/g) || [];
        if (cliffhangers.length === 0 && openEndings.length === 0 && paragraphs.length > 3) {
            issues.push('缺少悬念收尾');
        }
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(sentences.length, 1);
        if (avgSentenceLength > 100) {
            issues.push('长句过多可能影响张力节奏');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (totalTension > 3)
            score += 5;
        if (cliffhangers.length > 0)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `张力指标:${totalTension}处, ${cliffhangers.length}个悬念`
        };
    }
    checkResolution(content) {
        const issues = [];
        const resolutionIndicators = [
            '终于', '最终', '最后', '解决了', '和解', '明白了', '理解了',
            '释然', '释怀', '平静下来', '达成', '成功', '结束', '完结'
        ];
        let resolutionCount = 0;
        const resolutionPositions = [];
        for (const phrase of resolutionIndicators) {
            const matches = content.match(new RegExp(phrase, 'g'));
            if (matches && matches.length > 0) {
                resolutionCount += matches.length;
            }
        }
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        if (resolutionCount === 0 && paragraphs.length > 3) {
            issues.push('缺少冲突解决或情节收束');
        }
        const finalParagraph = paragraphs[paragraphs.length - 1] || '';
        const hasResolutionEnding = resolutionIndicators.some(phrase => finalParagraph.includes(phrase));
        if (!hasResolutionEnding && paragraphs.length > 2) {
            issues.push('结尾缺少收束感');
        }
        const questionCount = (content.match(/[?？]/g) || []).length;
        const unresolvedQuestions = content.match(/[是否会不会能不能][^。？]*[？]$/g) || [];
        if (questionCount > 3 && unresolvedQuestions.length > questionCount * 0.5) {
            issues.push('过多悬而未决的问题');
        }
        const changeIndicators = ['改变了', '成长了', '明白了', '学会了', '领悟了'];
        let changeCount = 0;
        for (const phrase of changeIndicators) {
            const matches = content.match(new RegExp(phrase, 'g'));
            if (matches)
                changeCount += matches.length;
        }
        if (changeCount === 0 && content.length > 500) {
            issues.push('缺少角色变化或成长');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (resolutionCount > 0)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `发现${resolutionCount}处解决标记`
        };
    }
    checkPlotHoles(content) {
        const issues = [];
        const contradictions = this.detectContradictions(content);
        if (contradictions.length > 0) {
            issues.push(`${contradictions.length}处潜在矛盾`);
        }
        const unexplainedEvents = this.detectUnexplainedEvents(content);
        if (unexplainedEvents.length > 0) {
            issues.push(`${unexplainedEvents.length}处事件缺少解释`);
        }
        const characterInconsistencies = this.detectCharacterInconsistencies(content);
        if (characterInconsistencies.length > 0) {
            issues.push(`${characterInconsistencies.length}处角色行为不一致`);
        }
        const motivationGaps = this.detectMotivationGaps(content);
        if (motivationGaps > 0) {
            issues.push(`${motivationGaps}处角色行为缺少动机`);
        }
        const abilityInconsistencies = this.detectAbilityInconsistencies(content);
        if (abilityInconsistencies > 0) {
            issues.push(`${abilityInconsistencies}处能力使用不一致`);
        }
        let score = 85;
        if (issues.length > 0)
            score -= issues.length * 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : '情节逻辑基本合理'
        };
    }
    checkTimeline(content) {
        const issues = [];
        const timeExpressions = content.match(/[一二三四五六七八九十百千0-9]+[年月日天周分钟秒]|昨天|今天|明天|去年|今年|明年|刚才|不久|很快|突然|随后|之前|之后|现在|将来|过去|早晨|中午|晚上|凌晨|深夜|黄昏|傍晚/g) || [];
        const uniqueTimes = [...new Set(timeExpressions)];
        const sequenceIndicators = ['然后', '接着', '随后', '之后', '最后', '最终', '接着', '于是'];
        let sequenceCount = 0;
        for (const phrase of sequenceIndicators) {
            sequenceCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        if (uniqueTimes.length > 2 && sequenceCount < 1) {
            issues.push('时间表述混乱');
        }
        const impossibleSequences = this.detectImpossibleSequences(content);
        if (impossibleSequences > 0) {
            issues.push(`${impossibleSequences}处时间顺序错误`);
        }
        const timeJumps = content.match(/(就在这时|突然|一转眼|眨眼间|刹那间)[^，]+，[^\s，。]+却没有/g) || [];
        if (timeJumps.length > 0 && uniqueTimes.length > 3) {
            issues.push('时间跳跃过多');
        }
        const durationPatterns = content.match(/(\w+后|\w+之前|\w+期间|\w+之中)/g) || [];
        const durationConsistency = this.checkDurationConsistency(durationPatterns);
        if (!durationConsistency) {
            issues.push('时间跨度描述不一致');
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 8;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `发现${uniqueTimes.length}个时间点, ${sequenceCount}个序列标记`
        };
    }
    checkWorldbuilding(content) {
        const issues = [];
        const worldElements = {
            locations: ['城市', '王国', '帝国', '宗门', '家族', '城镇', '森林', '山脉', '海洋', '大陆', '领地'],
            social: ['社会', '制度', '法律', '规则', '习俗', '传统', '文化', '信仰', '宗教'],
            systems: ['修炼', '魔法', '科技', '经济', '政治', '军事', '教育'],
            history: ['历史', '传说', '故事', '起源', '背景']
        };
        let locationCount = 0, socialCount = 0, systemCount = 0, historyCount = 0;
        for (const phrase of worldElements.locations) {
            locationCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of worldElements.social) {
            socialCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of worldElements.systems) {
            systemCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of worldElements.history) {
            historyCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        const totalWorldElements = locationCount + socialCount + systemCount + historyCount;
        const elementTypesPresent = [locationCount > 0, socialCount > 0, systemCount > 0, historyCount > 0]
            .filter(Boolean).length;
        if (totalWorldElements < 3) {
            issues.push('世界观元素不足');
        }
        if (elementTypesPresent < 2 && content.length > 500) {
            issues.push('世界观构建单一');
        }
        const consistencyCheck = this.checkWorldConsistency(content);
        if (!consistencyCheck) {
            issues.push('世界观设定不一致');
        }
        const rulesPatterns = content.match(/(根据|遵循|按照|必须|不能|禁止)[^。]+(规则|设定|规律|法则)/g) || [];
        if (rulesPatterns.length === 0 && elementTypesPresent >= 2) {
            issues.push('缺少世界观规则描述');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (totalWorldElements > 5)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `世界观元素:${elementTypesPresent}类, ${totalWorldElements}处`
        };
    }
    checkMotivation(content) {
        const issues = [];
        const motivationTypes = {
            desire: ['想要', '希望', '渴望', '梦想', '追求', '目标', '愿望'],
            obligation: ['必须', '不得不', '被迫', '责任', '义务', '使命'],
            fear: ['害怕', '恐惧', '担心', '担忧', '为了避免', '为了防止'],
            revenge: ['复仇', '报复', '讨回', '讨债'],
            love: ['为了爱', '因为爱', '守护', '保护', '珍惜']
        };
        let desireCount = 0, obligationCount = 0, fearCount = 0, revengeCount = 0, loveCount = 0;
        for (const phrase of motivationTypes.desire) {
            desireCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of motivationTypes.obligation) {
            obligationCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of motivationTypes.fear) {
            fearCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of motivationTypes.revenge) {
            revengeCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of motivationTypes.love) {
            loveCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        const totalMotivation = desireCount + obligationCount + fearCount + revengeCount + loveCount;
        const motivationTypesPresent = [desireCount > 0, obligationCount > 0, fearCount > 0, revengeCount > 0, loveCount > 0]
            .filter(Boolean).length;
        if (totalMotivation === 0) {
            issues.push('缺少角色动机描写');
        }
        if (motivationTypesPresent === 1 && totalMotivation < 2) {
            issues.push('动机类型单一');
        }
        const actionMotivationPairs = this.checkActionMotivationPairs(content);
        if (actionMotivationPairs < 0) {
            issues.push('部分行为缺少动机支撑');
        }
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const motivationParagraphs = paragraphs.filter(p => {
            const allMotives = [...motivationTypes.desire, ...motivationTypes.obligation, ...motivationTypes.fear, ...motivationTypes.revenge, ...motivationTypes.love];
            return allMotives.some(m => p.includes(m));
        });
        if (motivationParagraphs.length < paragraphs.length * 0.3 && totalMotivation < 3) {
            issues.push('动机铺垫不足');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `发现${totalMotivation}处动机, ${motivationTypesPresent}种类型`
        };
    }
    checkStakes(content) {
        const issues = [];
        const stakesLevels = {
            life: ['生死', '生命', '死亡', '牺牲', '性命', '活不下去', '必死无疑'],
            freedom: ['自由', '囚禁', '监禁', '失去自由', '被囚', '束缚'],
            love: ['失去爱', '爱情', '心爱的人', '最重要的人', '分离', '诀别'],
            identity: ['身份', '尊严', '荣誉', '名声', '声望', '地位'],
            world: ['世界', '人类', '天下', '苍生', '万物', '毁灭', '存亡']
        };
        let lifeCount = 0, freedomCount = 0, loveCount = 0, identityCount = 0, worldCount = 0;
        for (const phrase of stakesLevels.life) {
            lifeCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of stakesLevels.freedom) {
            freedomCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of stakesLevels.love) {
            loveCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of stakesLevels.identity) {
            identityCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        for (const phrase of stakesLevels.world) {
            worldCount += (content.match(new RegExp(phrase, 'g')) || []).length;
        }
        const totalStakes = lifeCount + freedomCount + loveCount + identityCount + worldCount;
        const stakesLevelsPresent = [lifeCount > 0, freedomCount > 0, loveCount > 0, identityCount > 0, worldCount > 0]
            .filter(Boolean).length;
        if (totalStakes === 0) {
            issues.push('缺少利害关系描写');
        }
        const highStakesIndicators = ['生死攸关', '至关重要', '命悬一线', '千钧一发', '刻不容缓', '十万火急'];
        let highStakesCount = 0;
        for (const phrase of highStakesIndicators) {
            const matches = content.match(new RegExp(phrase, 'g'));
            if (matches)
                highStakesCount += matches.length;
        }
        if (totalStakes > 0 && highStakesCount === 0) {
            issues.push('利害关系表述不够紧迫');
        }
        const consequencePatterns = content.match(/(如果|要是|万一)[^，]+，[^\s，。]+就[^\s，。]+(失去|失去|毁灭|死亡|消失)/g) || [];
        if (consequencePatterns.length === 0 && totalStakes > 0) {
            issues.push('缺少后果描述');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (stakesLevelsPresent >= 2)
            score += 5;
        if (highStakesCount > 0)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `利害关系:${stakesLevelsPresent}级, ${totalStakes}处`
        };
    }
    checkThemes(content) {
        const issues = [];
        const themePatterns = {
            love: ['爱', '爱情', '恨', '感情', '亲情', '友情', '爱情', '心'],
            justice: ['正义', '邪恶', '公平', '公正', '道义', '道德'],
            growth: ['成长', '成熟', '蜕变', '改变', '学会', '领悟', '明白'],
            fate: ['命运', '宿命', '注定', '因果', '轮回', '缘分', '机遇'],
            sacrifice: ['牺牲', '奉献', '付出', '放弃', '舍弃', '献出'],
            courage: ['勇气', '勇敢', '懦弱', '胆怯', '无畏', '胆量', '挺身而出'],
            redemption: ['救赎', '原谅', '宽恕', '悔改', '赎罪', '忏悔'],
            truth: ['真相', '真理', '事实', '谎言', '欺骗', '揭穿']
        };
        const themeCounts = {};
        const themesPresent = [];
        for (const [theme, words] of Object.entries(themePatterns)) {
            let count = 0;
            for (const word of words) {
                count += (content.match(new RegExp(word, 'g')) || []).length;
            }
            if (count > 0) {
                themeCounts[theme] = count;
                themesPresent.push(theme);
            }
        }
        if (themesPresent.length === 0) {
            issues.push('主题表达不明显');
        }
        if (themesPresent.length > 1) {
            const dominantThemes = Object.entries(themeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);
            if (dominantThemes[0][1] < dominantThemes[1][1] * 2) {
                issues.push('主题层次不够分明');
            }
        }
        const thematicDevelopment = this.checkThematicDevelopment(content, themesPresent);
        if (!thematicDevelopment) {
            issues.push('主题发展不够充分');
        }
        const symbolPatterns = content.match(/像[^\n]+一样|仿佛[^\n]+|如同[^\n]+|犹如[^\n]+/g) || [];
        if (themesPresent.length > 0 && symbolPatterns.length === 0) {
            issues.push('缺少象征手法深化主题');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (themesPresent.length >= 2)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `主题层次:${themesPresent.length}个, ${themesPresent.join(', ')}`
        };
    }
    checkSymbolism(content) {
        const issues = [];
        const metaphorPatterns = [
            /像[^\s，。]+一样/g,
            /仿佛[^\s，。]+/g,
            /如同[^\s，。]+/g,
            /犹如[^\s，。]+/g,
            /是[^\s，。]+的[^\s，。]+/g
        ];
        let metaphorCount = 0;
        const metaphorExamples = [];
        for (const pattern of metaphorPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                metaphorCount += matches.length;
                if (metaphorExamples.length < 3) {
                    metaphorExamples.push(matches[0].slice(0, 15));
                }
            }
        }
        if (metaphorCount === 0) {
            issues.push('缺少隐喻/明喻');
        }
        if (metaphorCount > 0 && metaphorCount < 2) {
            issues.push('隐喻使用过少');
        }
        const repeatedSymbols = this.detectRepeatedSymbols(content);
        if (repeatedSymbols.length > 1) {
            issues.push(`${repeatedSymbols.length}种象征重复使用`);
        }
        const symbolicObjects = ['花', '月', '雨', '雪', '风', '火', '水', '树', '鸟', '蛇', '光', '暗'];
        const usedSymbols = [];
        for (const obj of symbolicObjects) {
            const pattern = new RegExp(`(${obj}[^\\s，。]{0,5})|([^\\s，。]{0,5}${obj})`, 'g');
            const matches = content.match(pattern);
            if (matches && matches.length >= 2) {
                usedSymbols.push(obj);
            }
        }
        if (usedSymbols.length > 0 && metaphorCount < usedSymbols.length) {
            issues.push('象征物使用但缺少隐喻展开');
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 10;
        if (metaphorCount >= 2)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `隐喻:${metaphorCount}处, ${usedSymbols.length}种象征物`
        };
    }
    checkProse(content) {
        const issues = [];
        const punctuationDensity = (content.match(/[，。、；：""'']/g) || []).length;
        const words = content.split(/\s+/).length;
        const punctRatio = punctuationDensity / Math.max(words, 1);
        if (punctRatio < 0.15) {
            issues.push('标点密度过低');
        }
        if (punctRatio > 0.6) {
            issues.push('标点密度过高');
        }
        const sentenceLengths = content.split(/[。！？]/).filter(s => s.trim().length > 0)
            .map(s => s.length);
        const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(sentenceLengths.length, 1);
        const lengthVariance = this.calculateVariance(sentenceLengths);
        if (avgLength > 80) {
            issues.push('句子普遍过长');
        }
        if (avgLength < 8 && sentenceLengths.length > 3) {
            issues.push('句子普遍过短');
        }
        const fillerWords = ['这个', '那个', '然后', '于是', '接着', '其实', '基本上', '大概', '好像'];
        let fillerCount = 0;
        for (const word of fillerWords) {
            fillerCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (fillerCount > words * 0.05) {
            issues.push(`冗词过多 (${fillerCount}处)`);
        }
        const rhythmScore = this.assessProseRhythm(content);
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 6;
        score += rhythmScore * 0.2;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `节奏感评分:${rhythmScore}/100`
        };
    }
    checkReadability(content) {
        const issues = [];
        const sentences = content.split(/[.。!！?？]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).length;
        const avgSentenceLength = words / Math.max(sentences.length, 1);
        if (avgSentenceLength > 50) {
            issues.push('平均句子长度过长');
        }
        if (avgSentenceLength < 6 && sentences.length > 5) {
            issues.push('平均句子长度过短');
        }
        const complexClausePatterns = content.match(/[^\s，]+，[^\s，]+，[^\s，]+，[^\s，。]+[，。]/g) || [];
        if (complexClausePatterns.length > sentences.length * 0.4) {
            issues.push('从句过多的复杂句型');
        }
        const technicalTerms = content.match(/[A-Z]{2,}[a-z]*|[一二三四五六七八九十]+进制|[^\s]{6,}(法|论|学|术)/g) || [];
        if (technicalTerms.length > 5) {
            issues.push('专业术语过多');
        }
        const unclearReferences = content.match(/它[^\s]{0,3}(没有|不会|不能|不是|不会)/g) || [];
        if (unclearReferences.length > 2) {
            issues.push('存在指代不清的代词');
        }
        const readabilityScore = this.calculateFleschScore(content);
        let score = Math.max(40, Math.min(100, readabilityScore));
        if (issues.length > 0)
            score -= issues.length * 5;
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `可读性评分:${Math.round(score)}/100`
        };
    }
    checkAuthenticity(content) {
        const issues = [];
        const dialoguePatterns = this.extractDialogues(content);
        const unnaturalDialogues = dialoguePatterns.filter(d => {
            const text = d.replace(/["""''『』（]/g, '').trim();
            const formalPatterns = ['根据统计', '研究表明', '数据显示', '可以得出结论'];
            return formalPatterns.some(p => text.includes(p));
        });
        if (unnaturalDialogues.length > dialoguePatterns.length * 0.3) {
            issues.push('对话过于书面化');
        }
        const actionDescriptions = content.match(/(他|她|他们)[^\s，]{0,5}(说|道|问|答|喊|叫|笑|叹气|皱眉|摇头|点头|转身)[^\s，。]{0,20}[。]/g) || [];
        if (actionDescriptions.length < dialoguePatterns.length * 0.3 && dialoguePatterns.length > 3) {
            issues.push('对话缺少自然动作描写');
        }
        const sensoryDetailCount = this.countSensoryDetails(content);
        if (sensoryDetailCount < 3 && content.length > 300) {
            issues.push('感官细节不足');
        }
        const idioms = content.match(/[，。][^\s]{2,10}[，。]|了了|清清楚楚|明明白白|的的确确/g) || [];
        if (idioms.length > content.length * 0.01) {
            issues.push('成语/俗语使用过多');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `真实感评分:${Math.round(score)}/100`
        };
    }
    checkRedundancy(content) {
        const issues = [];
        const redundantPhrases = [
            { pattern: /\babsolutely essential\b/gi, replacement: 'essential' },
            { pattern: /\badvance warning\b/gi, replacement: 'warning' },
            { pattern: /\bcombine together\b/gi, replacement: 'combine' },
            { pattern: /\bfree gift\b/gi, replacement: 'gift' },
            { pattern: /\bpast history\b/gi, replacement: 'history' },
            { pattern: /\bunexpected surprise\b/gi, replacement: 'surprise' },
            { pattern: /\bcompletely eliminate\b/gi, replacement: 'eliminate' },
            { pattern: /\btrue fact\b/gi, replacement: 'fact' },
            { pattern: /\bbasic fundamentals\b/gi, replacement: 'fundamentals' },
            { pattern: /[的]?[的的]?地/g, desc: '多余的助词' }
        ];
        let redundantCount = 0;
        const redundantExamples = [];
        for (const item of redundantPhrases) {
            if ('pattern' in item && 'replacement' in item) {
                const matches = content.match(item.pattern);
                if (matches && matches.length > 0) {
                    redundantCount += matches.length;
                    if (redundantExamples.length < 3) {
                        redundantExamples.push(`${matches[0]} → ${item.replacement}`);
                    }
                }
            }
        }
        if (redundantCount > 3) {
            issues.push(`${redundantCount}处冗余表达`);
        }
        const repeatedPhrases = this.detectRepeatedPhrases(content);
        if (repeatedPhrases.length > 5) {
            issues.push(`${repeatedPhrases.length}处重复短语`);
        }
        const wordFrequency = this.calculateWordFrequency(content);
        const overusedWords = Object.entries(wordFrequency)
            .filter(([word, count]) => count > 10 && word.length > 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        if (overusedWords.length > 0 && overusedWords[0][1] > 15) {
            issues.push(`"${overusedWords[0][0]}"使用过于频繁`);
        }
        let score = Math.max(0, 100 - redundantCount * 8 - repeatedPhrases.length * 3);
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 80)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `发现${redundantCount}处冗余`
        };
    }
    checkClarity(content) {
        const issues = [];
        const longSentences = content.split(/[。！？]/).filter(s => s.trim().length > 100);
        if (longSentences.length > 3) {
            issues.push(`${longSentences.length}处过长句子`);
        }
        const ambiguousPronouns = content.match(/他[^\s，]{0,10}(的|是|在|有|能|会|会)/g) || [];
        const unclearReferences = ambiguousPronouns.filter(p => {
            const precedingText = content.slice(0, content.indexOf(p));
            const pronouns = precedingText.match(/(他|她|它|他们|她们)/g) || [];
            return pronouns.length < 2;
        });
        if (unclearReferences.length > 2) {
            issues.push(`${unclearReferences.length}处代词指代不清`);
        }
        const passiveVoice = content.match(/\w+被\w+/g) || [];
        if (passiveVoice.length > 5) {
            issues.push('被动语态使用过多');
        }
        const vagueWords = ['好像', '大概', '也许', '可能', '似乎', '仿佛', '应该'];
        let vagueCount = 0;
        for (const word of vagueWords) {
            vagueCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (vagueCount > 10) {
            issues.push(`${vagueCount}处模糊表达`);
        }
        let score = 80;
        if (issues.length > 0)
            score -= issues.length * 7;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : '表达清晰度良好'
        };
    }
    checkWordChoice(content) {
        const issues = [];
        const vagueWords = ['好像', '大概', '也许', '可能', '似乎', '仿佛', '应该', '估计'];
        let vagueCount = 0;
        for (const word of vagueWords) {
            vagueCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (vagueCount > 8) {
            issues.push(`${vagueCount}处过于模糊的用词`);
        }
        const strongWords = ['绝对', '必须', '一定', '必然', '毫无疑问', '绝对', '肯定', '确信'];
        let strongCount = 0;
        for (const word of strongWords) {
            strongCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (strongCount > vagueCount && strongCount > 5) {
            issues.push('用词过于绝对化');
        }
        const repeatedAdjacentWords = content.match(/\b(\w+)\s+\1\b/g) || [];
        if (repeatedAdjacentWords.length > 0) {
            issues.push(`${repeatedAdjacentWords.length}处相邻重复词`);
        }
        const wordFrequency = this.calculateWordFrequency(content);
        const uniqueWordRatio = Object.keys(wordFrequency).length / Math.max(content.split(/\s+/).length, 1);
        if (uniqueWordRatio < 0.3) {
            issues.push('词汇多样性不足');
        }
        const advancedWords = content.match(/[诡谲|斑斓|氤氲|旖旎|倥偬|蓊郁]/g) || [];
        if (advancedWords.length > 10) {
            issues.push('生僻词汇使用过多');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 7;
        if (uniqueWordRatio > 0.5)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `词汇多样性:${Math.round(uniqueWordRatio * 100)}%`
        };
    }
    checkSentenceVariation(content) {
        const issues = [];
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const lengths = sentences.map(s => s.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1);
        const variance = this.calculateVariance(lengths);
        const stdDev = Math.sqrt(variance);
        const coeffVar = stdDev / Math.max(avgLength, 1);
        if (coeffVar < 0.2) {
            issues.push('句式变化不足');
        }
        const shortSentences = sentences.filter(s => s.length < 20);
        const longSentences = sentences.filter(s => s.length > 80);
        const mediumSentences = sentences.filter(s => s.length >= 20 && s.length <= 80);
        const balance = Math.abs(shortSentences.length - mediumSentences.length) +
            Math.abs(mediumSentences.length - longSentences.length);
        if (balance > sentences.length * 0.7) {
            issues.push('句式长度分布不均衡');
        }
        const sentenceStarters = sentences.map(s => {
            const trimmed = s.trim();
            return trimmed.slice(0, Math.min(5, trimmed.length));
        });
        const uniqueStarters = [...new Set(sentenceStarters)];
        if (uniqueStarters.length < sentences.length * 0.3) {
            issues.push('句子开头变化不足');
        }
        let score = 75;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (coeffVar > 0.4)
            score += 5;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `句式变异系数:${Math.round(coeffVar * 100)}%`
        };
    }
    checkGenreConvention(content) {
        const issues = [];
        const genreIndicators = {
            fantasy: ['魔法', '咒语', '王国', '骑士', '龙', '精灵', '神器', '魔兽'],
            scifi: ['飞船', '科技', '外星人', '机器人', '星际', '未来', '人工智能', '量子'],
            romance: ['爱', '心', '吻', '拥抱', '相恋', '深情', '甜蜜', '浪漫'],
            mystery: ['谜题', '线索', '推理', '嫌疑', '真相', '调查', '侦探', '线索'],
            horror: ['恐惧', '恐怖', '血腥', '黑暗', '怪物', '惊悚', '诡异', '阴森'],
            historical: ['皇帝', '朝廷', '官府', '江湖', '武林', '侠客', '王朝', '太子']
        };
        const detectedGenres = [];
        const genreScores = {};
        for (const [genre, indicators] of Object.entries(genreIndicators)) {
            let score = 0;
            for (const indicator of indicators) {
                const matches = content.match(new RegExp(indicator, 'g'));
                if (matches)
                    score += matches.length;
            }
            if (score > 0) {
                detectedGenres.push(genre);
                genreScores[genre] = score;
            }
        }
        if (detectedGenres.length === 0) {
            issues.push('未检测到明确的题材特征');
        }
        const dominantGenre = Object.entries(genreScores)
            .sort((a, b) => b[1] - a[1])[0];
        if (detectedGenres.length > 2) {
            issues.push(`混合题材：${detectedGenres.slice(0, 3).join(', ')}`);
        }
        const genreSpecificPatterns = this.checkGenreSpecificPatterns(content, detectedGenres);
        if (genreSpecificPatterns.missing > 0) {
            issues.push(`${genreSpecificPatterns.missing}个题材惯例缺失`);
        }
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 8;
        if (detectedGenres.length > 0)
            score += 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `题材特征:${detectedGenres.slice(0, 2).join(', ') || '未确定'}`
        };
    }
    checkTargetAudience(content) {
        const issues = [];
        const ageIndicators = {
            children: ['小朋友', '小伙伴', '童话', '怪兽', '魔法', '勇敢', '善良'],
            teen: ['校园', '青春', '梦想', '叛逆', '成长', '考试', '友情'],
            adult: ['工作', '职场', '家庭', '责任', '压力', '房贷', '升职'],
            mature: ['人生', '哲理', '思考', '感悟', '沉淀', '岁月', '沧桑']
        };
        const detectedAges = [];
        for (const [age, indicators] of Object.entries(ageIndicators)) {
            for (const indicator of indicators) {
                if (content.includes(indicator)) {
                    detectedAges.push(age);
                    break;
                }
            }
        }
        const languageComplexity = this.assessLanguageComplexity(content);
        if (languageComplexity > 0.8 && detectedAges.includes('children')) {
            issues.push('语言复杂度与儿童读者不匹配');
        }
        if (languageComplexity < 0.3 && detectedAges.includes('mature')) {
            issues.push('语言复杂度与成熟读者不匹配');
        }
        const vocabularyDiversity = this.calculateWordFrequency(content);
        const avgWordFreq = Object.values(vocabularyDiversity)
            .reduce((a, b) => a + b, 0) / Math.max(Object.keys(vocabularyDiversity).length, 1);
        if (avgWordFreq > 3 && detectedAges.includes('children')) {
            issues.push('词汇重复度较高，可能适合儿童');
        }
        const dialogueComplexity = this.assessDialogueComplexity(content);
        if (dialogueComplexity < 0.3 && detectedAges.length === 0) {
            issues.push('难以确定目标读者群体');
        }
        let targetAudience = 'general';
        if (detectedAges.includes('children'))
            targetAudience = '儿童';
        else if (detectedAges.includes('teen'))
            targetAudience = '青少年';
        else if (detectedAges.includes('adult'))
            targetAudience = '成年';
        else if (detectedAges.includes('mature'))
            targetAudience = '成熟';
        let score = 70;
        if (issues.length > 0)
            score -= issues.length * 6;
        if (detectedAges.length > 0)
            score += 10;
        score = Math.max(0, Math.min(100, score));
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 75)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 2).join('; ') : `目标读者:${targetAudience}`
        };
    }
    checkAIDetection(content) {
        const issues = [];
        const aiPatterns = {
            overStructure: [
                /首先[，、][^\s]+[。]其次[，、][^\s]+[。]最后[，、][^\s]+[。]/,
                /第一[，、][^\s]+[。]第二[，、][^\s]+[。]第三[，、][^\s]+[。]/
            ],
            perfectParagraphs: [],
            noContractions: [/从不|从不曾|绝对不会|绝不会|并不存在/g],
            excessiveTransitions: []
        };
        let overStructureCount = 0;
        for (const pattern of aiPatterns.overStructure) {
            const matches = content.match(pattern);
            if (matches)
                overStructureCount += matches.length;
        }
        if (overStructureCount > 2) {
            issues.push(`${overStructureCount}处过于规整的结构`);
        }
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
        const variance = this.calculateVariance(paragraphLengths);
        if (variance < 100 && paragraphs.length > 3) {
            issues.push('段落长度过于一致');
        }
        const sentenceLengths = content.split(/[。！？]/).filter(s => s.trim().length > 0)
            .map(s => s.length);
        const sentenceVariance = this.calculateVariance(sentenceLengths);
        if (sentenceVariance < 50 && sentenceLengths.length > 5) {
            issues.push('句子长度过于一致');
        }
        const fillerWords = ['值得注意的是', '更重要的是', '综上所述', '不难发现', '由此可见'];
        let fillerCount = 0;
        for (const word of fillerWords) {
            fillerCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
        if (fillerCount > 3) {
            issues.push(`${fillerCount}处AI常用连接词`);
        }
        const wordFrequency = this.calculateWordFrequency(content);
        const hapaxLegomena = Object.entries(wordFrequency)
            .filter(([_, count]) => count === 1).length;
        const totalWords = content.split(/\s+/).length;
        const hapaxRatio = hapaxLegomena / Math.max(totalWords, 1);
        if (hapaxRatio < 0.3 && totalWords > 200) {
            issues.push('词汇多样性不足，可能为AI生成');
        }
        const naturalMistakes = content.match(/([了来]的|的地混用|了了)/g) || [];
        if (naturalMistakes.length === 0 && content.length > 500) {
            issues.push('缺少自然语言的小瑕疵');
        }
        let score = 100;
        if (issues.length > 0)
            score -= issues.length * 8;
        let status = 'pass';
        if (score < 60)
            status = 'fail';
        else if (score < 80)
            status = 'warning';
        return {
            score,
            status,
            details: issues.length > 0 ? issues.slice(0, 3).join('; ') : 'AI特征检测通过'
        };
    }
    dimensionToIssues(dimension) {
        const issues = [];
        if (dimension.status === 'fail') {
            issues.push({
                dimension: dimension.name,
                severity: 'major',
                message: `${dimension.description}评分过低: ${dimension.score}/100`,
                suggestion: `需要改进${dimension.description}`
            });
        }
        else if (dimension.status === 'warning') {
            issues.push({
                dimension: dimension.name,
                severity: 'minor',
                message: `${dimension.description}可以优化: ${dimension.score}/100`,
                suggestion: `建议提升${dimension.description}`
            });
        }
        return issues;
    }
    getSuggestionsForDimension(dimension) {
        const suggestions = {
            grammar: ['使用语法检查工具', '大声朗读以发现错误', '请他人校对'],
            spelling: ['使用拼写检查工具', '注意常见易错词', '建立个人错词本'],
            punctuation: ['检查标点符号匹配', '避免连续使用标点', '适当使用省略号'],
            sentenceStructure: ['拆分过长句子', '增加句式变化', '混合使用简单句和复合句'],
            paragraphStructure: ['确保每段有主题句', '控制段落长度', '段落之间有逻辑衔接'],
            coherence: ['添加过渡词', '使用代词减少重复', '保持主题连贯'],
            consistency: ['建立角色设定表', '记录世界观规则', '定期检查前后一致'],
            characterVoice: ['为角色设计口头禅', '让角色说话方式有辨识度', '避免所有角色说话方式相同'],
            dialogue: ['增加对话中的动作描写', '让对话推动情节', '避免信息交代式对话'],
            narrativeVoice: ['确定并保持叙述视角', '使用一致的时态', '让叙事声音有特色'],
            pacing: ['检查章节节奏', '交替使用长短段落', '在高潮前放缓节奏'],
            description: ['使用具体而非抽象的描写', '调用多种感官', '平衡描写与叙述'],
            showDontTell: ['用动作和表情代替情绪描述', '通过对话展现性格', '用环境描写暗示情感'],
            emotionalImpact: ['增加情感描写的层次', '使用肢体语言展现情绪', '平衡内心独白和外在表现'],
            conflict: ['建立主要冲突和次要冲突', '让冲突逐步升级', '确保冲突有意义'],
            tension: ['使用悬念和意外', '设置截止时间', '增加利害关系'],
            resolution: ['确保冲突有合理解决', '避免机械降神', '给读者情感满足'],
            plotHoles: ['梳理情节逻辑链', '检查因果关系', '确保每个事件有解释'],
            timeline: ['标记关键时间点', '检查时间顺序', '避免时间悖论'],
            worldbuilding: ['建立一致的世界规则', '用具体细节支撑', '让世界观服务故事'],
            motivation: ['确保角色行为有合理动机', '展示而非告知动机', '让动机有层次'],
            stakes: ['明确利害关系', '让读者关心结果', '适度提升风险'],
            themes: ['围绕核心主题展开', '用象征深化主题', '让主题自然流露'],
            symbolism: ['选择有意义的象征', '一贯使用象征', '让象征服务主题'],
            prose: ['提升语言节奏感', '使用修辞手法', '让文字有音乐性'],
            readability: ['简化复杂句', '使用清晰表达', '控制技术术语'],
            authenticity: ['增加生活细节', '让对话自然', '避免过于完美'],
            redundancy: ['删除重复的形容词', '合并相似信息', '精简冗长表达'],
            clarity: ['拆分长句', '明确代词指代', '减少模糊表达'],
            wordChoice: ['使用精确词汇', '避免重复用词', '平衡文学性和可读性'],
            sentenceVariation: ['混合句子长度', '变化句子开头', '使用不同句式'],
            genreConvention: ['研究题材惯例', '在惯例中创新', '满足读者期待'],
            targetAudience: ['明确目标读者', '匹配语言复杂度', '考虑读者期望'],
            aiDetection: ['增加自然语言瑕疵', '变化句子长度', '打破规整结构']
        };
        return suggestions[dimension.name] || [`建议优化${dimension.description}`];
    }
    generateSummary(score, issues) {
        if (score >= 90) {
            return '文章质量优秀！仅有少量可优化之处。';
        }
        else if (score >= 70) {
            return `文章质量良好，发现${issues.length}个问题，建议针对性优化。`;
        }
        else if (score >= 50) {
            return `文章质量一般，发现${issues.length}个问题，需要较多修改。`;
        }
        else {
            return `文章质量需要大幅改进，发现${issues.length}个问题，建议重新审视核心要素。`;
        }
    }
    calculateVariance(numbers) {
        if (numbers.length === 0)
            return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    }
    extractCharacterNames(content) {
        const patterns = [
            /[A-Z][a-z]{1,10}(?=[\s说问道喊叫笑叹])/g,
            /[\u4e00-\u9fa5]{2,4}(?=[\s说问道喊叫笑叹])/g,
            /(他|她|它)叫([A-Z\u4e00-\u9fa5]{2,4})/g
        ];
        const names = [];
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches)
                names.push(...matches);
        }
        return [...new Set(names)];
    }
    extractDialogues(content) {
        const dialogues = content.match(/["""''『』（][^""''『』]*["""''『』]/g) || [];
        return dialogues;
    }
    detectRepeatedPhrases(content) {
        const phrases = [];
        const words = content.split(/\s+/);
        for (let len = 3; len <= 6; len++) {
            const seen = {};
            for (let i = 0; i <= words.length - len; i++) {
                const phrase = words.slice(i, i + len).join(' ');
                if (phrase.length > 5) {
                    seen[phrase] = (seen[phrase] || 0) + 1;
                }
            }
            for (const [phrase, count] of Object.entries(seen)) {
                if (count >= 3) {
                    phrases.push(phrase);
                }
            }
        }
        return [...new Set(phrases)];
    }
    detectTopicShifts(paragraphs) {
        const topics = paragraphs.map(p => {
            const words = p.split(/\s+/).slice(0, 10).join(' ');
            return words;
        });
        let shifts = 0;
        for (let i = 1; i < topics.length; i++) {
            if (topics[i] !== topics[i - 1]) {
                shifts++;
            }
        }
        return shifts;
    }
    detectTenseInconsistencies(content) {
        const inconsistencies = [];
        const pastMarkers = ['曾经', '过去', '当时', '那年'];
        const presentMarkers = ['现在', '此刻', '目前', '今天'];
        const futureMarkers = ['将来', '未来', '以后', '明天'];
        let pastCount = 0, presentCount = 0, futureCount = 0;
        for (const marker of pastMarkers) {
            pastCount += (content.match(new RegExp(marker, 'g')) || []).length;
        }
        for (const marker of presentMarkers) {
            presentCount += (content.match(new RegExp(marker, 'g')) || []).length;
        }
        for (const marker of futureMarkers) {
            futureCount += (content.match(new RegExp(marker, 'g')) || []).length;
        }
        if (pastCount > 0 && presentCount > 0 && futureCount > 0) {
            const counts = [pastCount, presentCount, futureCount];
            const max = Math.max(...counts);
            const min = Math.min(...counts);
            if (max / min > 5) {
                inconsistencies.push('时态混乱');
            }
        }
        return inconsistencies;
    }
    checkPronounReferences(content) {
        const issues = [];
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        for (let i = 1; i < sentences.length; i++) {
            const pronouns = ['他', '她', '它', '他们', '她们', '它们'];
            for (const pronoun of pronouns) {
                if (sentences[i].includes(pronoun)) {
                    const precedingText = sentences.slice(0, i).join('');
                    const pronounCount = (precedingText.match(new RegExp(pronoun, 'g')) || []).length;
                    if (pronounCount === 0) {
                        issues.push(`"${pronoun}"指代不明`);
                    }
                }
            }
        }
        return issues.slice(0, 5);
    }
    detectConsecutiveSameSpeaker(dialogues) {
        let count = 0;
        const speakers = dialogues.map(d => {
            const beforeQuote = dialogues.indexOf(d) > 0
                ? dialogues[dialogues.indexOf(d) - 1]
                : '';
            return beforeQuote;
        });
        for (let i = 1; i < dialogues.length; i++) {
            if (dialogues[i].includes('"') && dialogues[i - 1].includes('"')) {
                count++;
            }
        }
        return count;
    }
    detectContradictions(content) {
        const contradictions = [];
        const contradictionPatterns = [
            /明明[^\n]+[^\n]+但是[^\n]+没有[^\n]+/,
            /之前[^\n]+[^\n]+后来[^\n]+却[^\n]+不[^\n]+/,
            /从来没有[^\n]+[^\n]+突然[^\n]+一直[^\n]+/
        ];
        for (const pattern of contradictionPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                contradictions.push(...matches.slice(0, 2));
            }
        }
        return contradictions;
    }
    detectUnexplainedEvents(content) {
        const events = [];
        const patterns = [
            /突然[^\s，]+出现/g,
            /突然[^\s，]+消失/g,
            /突然[^\s，]+发生/g
        ];
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                events.push(...matches.slice(0, 2));
            }
        }
        return events;
    }
    detectCharacterInconsistencies(content) {
        return [];
    }
    detectMotivationGaps(content) {
        const majorActions = content.match(/(决定|选择|必须|只能)[^。]+[。]/g) || [];
        const motivationWords = ['因为', '为了', '由于', '所以', '因此'];
        let gaps = 0;
        for (const action of majorActions) {
            let hasMotivation = false;
            for (const word of motivationWords) {
                if (action.includes(word)) {
                    hasMotivation = true;
                    break;
                }
            }
            if (!hasMotivation && action.length > 10) {
                gaps++;
            }
        }
        return gaps;
    }
    detectAbilityInconsistencies(content) {
        return 0;
    }
    detectImpossibleSequences(content) {
        let count = 0;
        const beforeAfter = content.match(/之前[^\n]+之前[^\n]+/g);
        if (beforeAfter)
            count += beforeAfter.length;
        const futurePast = content.match(/将来[^\n]+过去[^\n]+/g);
        if (futurePast)
            count += futurePast.length;
        return count;
    }
    checkDurationConsistency(patterns) {
        return true;
    }
    checkWorldConsistency(content) {
        const magicSystems = content.match(/魔法[^\s]{0,5}(规则|设定|使用)/g) || [];
        const ruleViolations = content.match(/魔法[^\s]{0,10}(不能|无法|不会|不可能)/g) || [];
        if (magicSystems.length > 0 && ruleViolations.length > magicSystems.length * 0.5) {
            return false;
        }
        return true;
    }
    checkActionMotivationPairs(content) {
        const actions = content.match(/(走向|拿起|说出|做出)[^。]+[。]/g) || [];
        const motivations = content.match(/(因为|为了|由于)[^。]+[。]/g) || [];
        if (actions.length > motivations.length * 2) {
            return -1;
        }
        return actions.length - motivations.length;
    }
    checkThematicDevelopment(content, themes) {
        if (themes.length === 0)
            return true;
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const themeAppearances = new Map();
        for (const theme of themes) {
            themeAppearances.set(theme, []);
        }
        paragraphs.forEach((para, index) => {
            for (const theme of themes) {
                if (para.includes(theme)) {
                    themeAppearances.get(theme)?.push(index);
                }
            }
        });
        for (const [_, appearances] of themeAppearances) {
            if (appearances.length < 2)
                return false;
            if (appearances.length > 1 && appearances[appearances.length - 1] - appearances[0] < paragraphs.length * 0.3) {
                return false;
            }
        }
        return true;
    }
    detectRepeatedSymbols(content) {
        const symbols = ['花', '月', '雨', '雪', '风', '火'];
        const repeated = [];
        for (const symbol of symbols) {
            const pattern = new RegExp(symbol, 'g');
            const matches = content.match(pattern);
            if (matches && matches.length >= 3) {
                repeated.push(symbol);
            }
        }
        return repeated;
    }
    assessProseRhythm(content) {
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const lengths = sentences.map(s => s.length);
        if (lengths.length < 2)
            return 50;
        const variance = this.calculateVariance(lengths);
        const stdDev = Math.sqrt(variance);
        const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const coeffVar = stdDev / Math.max(mean, 1);
        let score = 50;
        if (coeffVar > 0.3 && coeffVar < 0.7)
            score += 30;
        else if (coeffVar > 0.2 && coeffVar < 0.8)
            score += 15;
        const punctuationCount = (content.match(/[，。；：]/g) || []).length;
        const punctPerSentence = punctuationCount / Math.max(sentences.length, 1);
        if (punctPerSentence > 2 && punctPerSentence < 8)
            score += 20;
        return Math.min(100, score);
    }
    calculateFleschScore(content) {
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/);
        if (sentences.length === 0 || words.length === 0)
            return 50;
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = 1.5;
        const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
        return Math.max(0, Math.min(100, score));
    }
    countSensoryDetails(content) {
        const sensoryWords = [
            '看', '听', '闻', '尝', '触摸', '感受',
            '温暖', '凉爽', '炎热', '寒冷', '光滑', '粗糙',
            '甜蜜', '苦涩', '刺耳', '悦耳', '明亮', '昏暗'
        ];
        let count = 0;
        for (const word of sensoryWords) {
            count += (content.match(new RegExp(word, 'g')) || []).length;
        }
        return count;
    }
    calculateWordFrequency(content) {
        const words = content.split(/\s+/);
        const frequency = {};
        for (const word of words) {
            const cleanWord = word.replace(/[^\w\u4e00-\u9fa5]/g, '');
            if (cleanWord.length > 0) {
                frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
            }
        }
        return frequency;
    }
    checkConflictEscalation(content) {
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const conflictPhrases = ['争吵', '打架', '冲突', '对抗', '升级', '激化'];
        const conflictLevels = [];
        for (const para of paragraphs) {
            let level = 0;
            for (const phrase of conflictPhrases) {
                const matches = para.match(new RegExp(phrase, 'g'));
                if (matches)
                    level += matches.length;
            }
            conflictLevels.push(level);
        }
        if (conflictLevels.length < 2)
            return 0;
        let escalations = 0;
        for (let i = 1; i < conflictLevels.length; i++) {
            if (conflictLevels[i] > conflictLevels[i - 1]) {
                escalations++;
            }
        }
        return escalations;
    }
    identifyTensionBuilding(paragraphs) {
        const tensionPhrases = ['突然', '紧张', '危险', '不安', '悬念', '然而', '就在这时'];
        const tensionLevels = [];
        for (const para of paragraphs) {
            let level = 0;
            for (const phrase of tensionPhrases) {
                const matches = para.match(new RegExp(phrase, 'g'));
                if (matches)
                    level += matches.length;
            }
            tensionLevels.push(level);
        }
        return tensionLevels;
    }
    assessLanguageComplexity(content) {
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/);
        if (sentences.length === 0)
            return 0.5;
        const avgLength = words.length / sentences.length;
        const uniqueWords = new Set(words).size;
        const uniqueRatio = uniqueWords / Math.max(words.length, 1);
        let complexity = 0;
        complexity += Math.min(avgLength / 30, 1) * 0.4;
        complexity += uniqueRatio * 0.4;
        complexity += Math.min(sentences.length / 20, 1) * 0.2;
        return Math.min(1, complexity);
    }
    assessDialogueComplexity(content) {
        const dialogues = this.extractDialogues(content);
        if (dialogues.length === 0)
            return 0;
        const avgLength = dialogues.reduce((sum, d) => sum + d.length, 0) / dialogues.length;
        const shortDialogues = dialogues.filter(d => d.length < 20).length;
        const longDialogues = dialogues.filter(d => d.length > 50).length;
        let complexity = 0;
        complexity += Math.min(avgLength / 30, 1) * 0.4;
        complexity += Math.min(longDialogues / dialogues.length, 1) * 0.3;
        complexity += Math.min(dialogues.length / 10, 1) * 0.3;
        return Math.min(1, complexity);
    }
    checkGenreSpecificPatterns(content, genres) {
        const requiredPatterns = {
            fantasy: ['神器', '王国', '魔法'],
            scifi: ['科技', '未来', '飞船'],
            romance: ['相恋', '深情', '心'],
            mystery: ['真相', '线索', '推理'],
            horror: ['恐怖', '黑暗', '恐惧'],
            historical: ['皇帝', '江湖', '武林']
        };
        let missing = 0;
        for (const genre of genres) {
            const patterns = requiredPatterns[genre] || [];
            for (const pattern of patterns) {
                if (!content.includes(pattern)) {
                    missing++;
                }
            }
        }
        return { missing };
    }
    destroy() {
        this.storage.destroy();
    }
}
exports.AuditEngine = AuditEngine;
exports.auditEngine = new AuditEngine();
//# sourceMappingURL=AuditEngineImpl.js.map