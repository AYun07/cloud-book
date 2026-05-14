"use strict";
/**
 * Cloud Book - 反AI检测与去AI味模块
 * 实现33+维度的AI痕迹检测和去AI味处理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiDetectionEngine = exports.DETECTION_DIMENSIONS = void 0;
exports.DETECTION_DIMENSIONS = [
    'vocabulary_uniformity',
    'sentence_length_variance',
    'paragraph_opening_pattern',
    'transition_word_frequency',
    'emotional_word_density',
    'personal_pronoun_usage',
    'contradiction_detection',
    'specificity_level',
    'idiom_usage',
    'punctuation_pattern',
    'narrative_perspective',
    'temporal_consistency',
    'detail_granularity',
    'rhetorical_devices',
    'character_voice_consistency',
    'world_knowledge_consistency',
    'plot_logic_consistency',
    'information_balance',
    'unnecessary_preambles',
    'formulaic_expressions',
    'superlative_usage',
    'hedging_frequency',
    'passive_voice_ratio',
    'complex_sentence_ratio',
    'list_structure_frequency',
    'topic_sentence_pattern',
    'definition_introduction',
    'summarization_frequency',
    'example_provision',
    'question_rhetorical',
    'emphasis_superfluous',
    'reference_clarity',
    'coherence_markers'
];
class AntiDetectionEngine {
    config;
    aiWordList = [
        '然而', '因此', '所以', '但是', '不过', '与此同时',
        '值得注意的是', '毋庸置疑', '毫无疑问', '显而易见',
        '综上所述', '总的来说', '从某种意义上说', '可以说',
        '众所周知', '不得不承认', '在此基础上', '进一步',
        '首先', '其次', '最后', '第一', '第二', '第三',
        '一方面', '另一方面', '综上所述', '总而言之',
        '值得强调的是', '毋庸置疑地', '显而易见地'
    ];
    formulaicExpressions = [
        '换句话说', '也就是说', '换言之', '即是说',
        '具体来说', '总的来说', '一般而言', '通常情况下',
        '在很大程度上', '在某种程度上', '在一定程度上'
    ];
    hedgeWords = [
        '可能', '也许', '或许', '大概', '似乎', '看起来',
        '似乎', '好像', '可以说', '某种意义上'
    ];
    passivePatterns = [
        '被', '受到', '得到', '被给', '被做'
    ];
    rhetoricalDevices = [
        '比喻', '拟人', '排比', '夸张', '对偶', '反问', '设问',
        '反复', '借代', '反语', '顶真', '回文'
    ];
    emotionalWords = [
        '激动', '感慨', '欣慰', '沉重', '复杂', '澎湃',
        '震撼', '沉痛', '愤慨', '感慨万千', '兴奋', '悲伤',
        '愤怒', '恐惧', '惊讶', '喜欢', '讨厌', '爱', '恨',
        '开心', '难过', '紧张', '害怕', '心疼', '心酸', '感动'
    ];
    personalPronouns = {
        firstPerson: ['我', '我们', '俺', '咱们', '俺们'],
        secondPerson: ['你', '您', '你们'],
        thirdPerson: ['他', '她', '它', '他们', '她们']
    };
    constructor(config = {}) {
        const defaultConfig = {
            enabled: true,
            intensity: 5,
            replaceAIWords: true,
            varySentenceStructure: true,
            addColloquialism: false,
            enhanceEmotion: true,
            addImperfection: true,
            mixStyles: false
        };
        this.config = { ...defaultConfig, ...config };
    }
    detectAI(text) {
        const indicators = [];
        const dimensionScores = {};
        dimensionScores['vocabulary_uniformity'] = this.analyzeVocabularyUniformity(text);
        dimensionScores['sentence_length_variance'] = this.analyzeSentenceLengthVariance(text);
        dimensionScores['paragraph_opening_pattern'] = this.analyzeParagraphOpeningPattern(text);
        dimensionScores['transition_word_frequency'] = this.analyzeTransitionWordFrequency(text);
        dimensionScores['emotional_word_density'] = this.analyzeEmotionalWordDensity(text);
        dimensionScores['personal_pronoun_usage'] = this.analyzePersonalPronounUsage(text);
        dimensionScores['contradiction_detection'] = this.analyzeContradictions(text);
        dimensionScores['specificity_level'] = this.analyzeSpecificityLevel(text);
        dimensionScores['idiom_usage'] = this.analyzeIdiomUsage(text);
        dimensionScores['punctuation_pattern'] = this.analyzePunctuationPattern(text);
        dimensionScores['narrative_perspective'] = this.analyzeNarrativePerspective(text);
        dimensionScores['temporal_consistency'] = this.analyzeTemporalConsistency(text);
        dimensionScores['detail_granularity'] = this.analyzeDetailGranularity(text);
        dimensionScores['rhetorical_devices'] = this.analyzeRhetoricalDevices(text);
        dimensionScores['character_voice_consistency'] = this.analyzeCharacterVoiceConsistency(text);
        dimensionScores['world_knowledge_consistency'] = this.analyzeWorldKnowledgeConsistency(text);
        dimensionScores['plot_logic_consistency'] = this.analyzePlotLogicConsistency(text);
        dimensionScores['information_balance'] = this.analyzeInformationBalance(text);
        dimensionScores['unnecessary_preambles'] = this.analyzeUnnecessaryPreambles(text);
        dimensionScores['formulaic_expressions'] = this.analyzeFormulaicExpressions(text);
        dimensionScores['superlative_usage'] = this.analyzeSuperlativeUsage(text);
        dimensionScores['hedging_frequency'] = this.analyzeHedgingFrequency(text);
        dimensionScores['passive_voice_ratio'] = this.analyzePassiveVoiceRatio(text);
        dimensionScores['complex_sentence_ratio'] = this.analyzeComplexSentenceRatio(text);
        dimensionScores['list_structure_frequency'] = this.analyzeListStructureFrequency(text);
        dimensionScores['topic_sentence_pattern'] = this.analyzeTopicSentencePattern(text);
        dimensionScores['definition_introduction'] = this.analyzeDefinitionIntroduction(text);
        dimensionScores['summarization_frequency'] = this.analyzeSummarizationFrequency(text);
        dimensionScores['example_provision'] = this.analyzeExampleProvision(text);
        dimensionScores['question_rhetorical'] = this.analyzeRhetoricalQuestions(text);
        dimensionScores['emphasis_superfluous'] = this.analyzeSuperfluousEmphasis(text);
        dimensionScores['reference_clarity'] = this.analyzeReferenceClarity(text);
        dimensionScores['coherence_markers'] = this.analyzeCoherenceMarkers(text);
        for (const [dimension, score] of Object.entries(dimensionScores)) {
            if (score > 0.7) {
                indicators.push({
                    type: dimension,
                    description: this.getDimensionDescription(dimension, score),
                    severity: score,
                    location: '全文',
                    dimension
                });
            }
        }
        const wordIndicators = this.detectAIWords(text);
        indicators.push(...wordIndicators);
        const sentenceIndicators = this.detectSentencePatterns(text);
        indicators.push(...sentenceIndicators);
        const structureIndicators = this.detectStructurePatterns(text);
        indicators.push(...structureIndicators);
        const emotionIndicators = this.detectEmotionPatterns(text);
        indicators.push(...emotionIndicators);
        const maxSeverity = Math.max(...indicators.map(i => i.severity), 0);
        const avgSeverity = indicators.length > 0
            ? indicators.reduce((sum, i) => sum + i.severity, 0) / indicators.length
            : 0;
        const overallScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0) / Object.keys(dimensionScores).length;
        const confidence = Math.min(1, (maxSeverity * 0.4 + avgSeverity * 0.3 + overallScore * 0.3) * 1.5);
        const suggestions = this.generateSuggestions(indicators, dimensionScores);
        return {
            isAI: confidence > 0.5,
            confidence,
            indicators,
            suggestions,
            dimensionScores
        };
    }
    analyzeVocabularyUniformity(text) {
        const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
        if (words.length < 50)
            return 0;
        const uniqueRatio = new Set(words).size / words.length;
        return Math.max(0, 1 - uniqueRatio * 2);
    }
    analyzeSentenceLengthVariance(text) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        if (sentences.length < 3)
            return 0;
        const lengths = sentences.map(s => s.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        if (variance < 50)
            return 0.8;
        if (variance < 100)
            return 0.5;
        if (variance < 200)
            return 0.2;
        return 0;
    }
    analyzeParagraphOpeningPattern(text) {
        const paragraphs = text.split(/\n\n+/);
        if (paragraphs.length < 3)
            return 0;
        const openings = paragraphs.slice(0, 10).map(p => {
            const line = p.trim().split('\n')[0];
            return line.substring(0, Math.min(15, line.length));
        });
        const uniqueOpenings = new Set(openings);
        if (uniqueOpenings.size < openings.length * 0.3)
            return 0.7;
        if (uniqueOpenings.size < openings.length * 0.5)
            return 0.4;
        return 0;
    }
    analyzeTransitionWordFrequency(text) {
        const transitionWords = ['首先', '其次', '然后', '接着', '因此', '所以', '然而', '但是', '总之', '最后'];
        let count = 0;
        for (const word of transitionWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const density = count / text.length * 1000;
        if (density > 5)
            return 0.8;
        if (density > 3)
            return 0.5;
        if (density > 1)
            return 0.2;
        return 0;
    }
    analyzeEmotionalWordDensity(text) {
        let count = 0;
        for (const word of this.emotionalWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const density = count / text.length * 10000;
        if (density < 2)
            return 0.8;
        if (density < 5)
            return 0.5;
        if (density < 10)
            return 0.2;
        return 0;
    }
    analyzePersonalPronounUsage(text) {
        const firstPersonCount = this.personalPronouns.firstPerson.reduce((sum, p) => {
            return sum + (text.match(new RegExp(p, 'g')) || []).length;
        }, 0);
        const totalChars = text.length;
        const ratio = firstPersonCount / (totalChars / 1000);
        if (ratio < 1)
            return 0.7;
        if (ratio < 3)
            return 0.4;
        return 0;
    }
    analyzeContradictions(text) {
        const contradictionPairs = [
            ['但是', '然而'],
            ['虽然', '但是'],
            ['不是', '而是']
        ];
        let contradictions = 0;
        for (const [a, b] of contradictionPairs) {
            const hasA = text.includes(a);
            const hasB = text.includes(b);
            if (hasA && hasB)
                contradictions++;
        }
        if (contradictions > 5)
            return 0.6;
        if (contradictions > 2)
            return 0.3;
        return 0;
    }
    analyzeSpecificityLevel(text) {
        const specificDetails = [
            /\d{4}年\d{1,2}月\d{1,2}日/,
            /\d+点\d+分/,
            /#[a-zA-Z0-9]+/,
            /[a-zA-Z]{2,}/,
            /\d+°[CN]/
        ];
        let count = 0;
        for (const pattern of specificDetails) {
            const matches = text.match(pattern);
            if (matches)
                count += matches.length;
        }
        if (count < 2)
            return 0.7;
        if (count < 5)
            return 0.4;
        return 0;
    }
    analyzeIdiomUsage(text) {
        const idioms = [
            '一箭双雕', '杯水车薪', '画蛇添足', '掩耳盗铃', '狐假虎威',
            '画龙点睛', '刻舟求剑', '叶公好龙', '此地无银三百两'
        ];
        let count = 0;
        for (const idiom of idioms) {
            if (text.includes(idiom))
                count++;
        }
        if (count === 0)
            return 0.6;
        if (count < 3)
            return 0.3;
        return 0;
    }
    analyzePunctuationPattern(text) {
        const quotes = (text.match(/[""]/g) || []).length;
        const parentheses = (text.match(/[（(][^)]+[）)]/g) || []).length;
        const totalPunctuation = (text.match(/[。！？，、；：""''（）]/g) || []).length;
        if (totalPunctuation === 0)
            return 0.5;
        const quoteRatio = quotes / totalPunctuation;
        const parenRatio = parentheses / totalPunctuation;
        if (quoteRatio < 0.02 && parenRatio < 0.01)
            return 0.6;
        return 0;
    }
    analyzeNarrativePerspective(text) {
        const firstPerson = this.personalPronouns.firstPerson.reduce((sum, p) => {
            return sum + (text.match(new RegExp(p, 'g')) || []).length;
        }, 0);
        const thirdPerson = this.personalPronouns.thirdPerson.reduce((sum, p) => {
            return sum + (text.match(new RegExp(p, 'g')) || []).length;
        }, 0);
        if (firstPerson > 0 && thirdPerson === 0)
            return 0.2;
        if (thirdPerson > firstPerson * 3)
            return 0.4;
        return 0;
    }
    analyzeTemporalConsistency(text) {
        const temporalMarkers = [
            '刚才', '刚刚', '忽然', '突然', '顿时', '霎时',
            '随后', '接着', '然后', '之后', '后来', '最后'
        ];
        let count = 0;
        for (const marker of temporalMarkers) {
            const regex = new RegExp(marker, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count > 20)
            return 0.5;
        if (count > 10)
            return 0.3;
        return 0;
    }
    analyzeDetailGranularity(text) {
        const sensoryWords = [
            '看', '听', '闻', '尝', '触摸', '感受',
            '看着', '听到', '闻见', '尝到', '摸着'
        ];
        let count = 0;
        for (const word of sensoryWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count < 5)
            return 0.7;
        if (count < 15)
            return 0.4;
        return 0;
    }
    analyzeRhetoricalDevices(text) {
        let count = 0;
        for (const device of this.rhetoricalDevices) {
            if (text.includes(device))
                count++;
        }
        const similes = (text.match(/像|似|如|仿佛/g) || []).length;
        const metaphors = (text.match(/是|成为|变成/g) || []).length;
        if (similes + metaphors < 3)
            return 0.6;
        if (count === 0)
            return 0.5;
        return 0;
    }
    analyzeCharacterVoiceConsistency(text) {
        const uniqueSpeechMarkers = new Set([
            ...text.match(/[""][^""]+[""]/g) || []
        ]);
        if (uniqueSpeechMarkers.size < 2)
            return 0.4;
        return 0;
    }
    analyzeWorldKnowledgeConsistency(text) {
        const knowledgeTerms = [
            '历史', '科学', '技术', '医学', '法律',
            '经济', '政治', '文化', '艺术', '宗教'
        ];
        let count = 0;
        for (const term of knowledgeTerms) {
            if (text.includes(term))
                count++;
        }
        if (count > 5)
            return 0.3;
        return 0.6;
    }
    analyzePlotLogicConsistency(text) {
        const logicWords = ['因为', '所以', '导致', '造成', '由于', '因此'];
        let count = 0;
        for (const word of logicWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count > 10)
            return 0.2;
        return 0.5;
    }
    analyzeInformationBalance(text) {
        const paragraphs = text.split(/\n\n+/);
        const lengths = paragraphs.map(p => p.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        let unbalanced = 0;
        for (const len of lengths) {
            if (Math.abs(len - avgLength) > avgLength * 0.8)
                unbalanced++;
        }
        if (unbalanced > paragraphs.length * 0.5)
            return 0.6;
        return 0;
    }
    analyzeUnnecessaryPreambles(text) {
        const preambles = [
            '值得注意的是', '毫无疑问', '必须指出',
            '应当指出', '可以认为', '一般来说'
        ];
        let count = 0;
        for (const preamble of preambles) {
            if (text.includes(preamble))
                count++;
        }
        if (count > 3)
            return 0.7;
        if (count > 1)
            return 0.4;
        return 0;
    }
    analyzeFormulaicExpressions(text) {
        let count = 0;
        for (const expr of this.formulaicExpressions) {
            const regex = new RegExp(expr, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count > 5)
            return 0.8;
        if (count > 2)
            return 0.5;
        return 0;
    }
    analyzeSuperlativeUsage(text) {
        const superlatives = ['最', '极其', '非常', '相当', '十分', '特别', '格外'];
        let count = 0;
        for (const s of superlatives) {
            const regex = new RegExp(s, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const ratio = count / text.length * 1000;
        if (ratio > 8)
            return 0.7;
        if (ratio > 4)
            return 0.4;
        return 0;
    }
    analyzeHedgingFrequency(text) {
        let count = 0;
        for (const word of this.hedgeWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const ratio = count / text.length * 1000;
        if (ratio > 5)
            return 0.6;
        if (ratio > 2)
            return 0.3;
        return 0;
    }
    analyzePassiveVoiceRatio(text) {
        let count = 0;
        for (const pattern of this.passivePatterns) {
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const sentences = text.split(/[。！？]/).length;
        const ratio = count / sentences;
        if (ratio > 0.3)
            return 0.6;
        if (ratio > 0.15)
            return 0.3;
        return 0;
    }
    analyzeComplexSentenceRatio(text) {
        const longSentences = text.split(/[。！？]/).filter(s => s.length > 80).length;
        const totalSentences = text.split(/[。！？]/).length;
        if (totalSentences === 0)
            return 0;
        const ratio = longSentences / totalSentences;
        if (ratio > 0.6)
            return 0.7;
        if (ratio > 0.4)
            return 0.4;
        return 0;
    }
    analyzeListStructureFrequency(text) {
        const listPatterns = [
            /第一[、，].*第二[、，].*第三/,
            /首先[、，].*其次[、，].*最后/,
            /一方面[、，].*另一方面/
        ];
        let count = 0;
        for (const pattern of listPatterns) {
            if (pattern.test(text))
                count++;
        }
        if (count > 2)
            return 0.6;
        if (count > 0)
            return 0.3;
        return 0;
    }
    analyzeTopicSentencePattern(text) {
        const paragraphs = text.split(/\n\n+/);
        const topicSentencePatterns = [
            /^(首先|第一|总之|概括地说)/
        ];
        let count = 0;
        for (const para of paragraphs) {
            const firstLine = para.trim().split('\n')[0];
            for (const pattern of topicSentencePatterns) {
                if (pattern.test(firstLine))
                    count++;
            }
        }
        if (count > paragraphs.length * 0.4)
            return 0.6;
        return 0;
    }
    analyzeDefinitionIntroduction(text) {
        const definitionPatterns = [
            '是指', '定义为', '也就是', '即',
            '换句话说', '也就是说'
        ];
        let count = 0;
        for (const pattern of definitionPatterns) {
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count > 5)
            return 0.6;
        return 0;
    }
    analyzeSummarizationFrequency(text) {
        const summaryPatterns = [
            '总之', '总而言之', '综上所述', '总的来说',
            '概括地说', '简而言之', '一言以蔽之'
        ];
        let count = 0;
        for (const pattern of summaryPatterns) {
            if (text.includes(pattern))
                count++;
        }
        if (count > 3)
            return 0.6;
        if (count > 1)
            return 0.3;
        return 0;
    }
    analyzeExampleProvision(text) {
        const examplePatterns = [
            '例如', '比如', '譬如', '以',
            '如', '举个例子', '打个比方'
        ];
        let count = 0;
        for (const pattern of examplePatterns) {
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        if (count > 5)
            return 0.3;
        return 0.5;
    }
    analyzeRhetoricalQuestions(text) {
        const questions = (text.match(/[？?]/g) || []).length;
        const totalSentences = text.split(/[。！？]/).length;
        if (totalSentences === 0)
            return 0;
        const ratio = questions / totalSentences;
        if (ratio > 0.3)
            return 0.5;
        return 0;
    }
    analyzeSuperfluousEmphasis(text) {
        const emphasisWords = [
            '重要', '关键', '核心', '本质',
            '主要', '基本', '根本', '至关重要'
        ];
        let count = 0;
        for (const word of emphasisWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const ratio = count / text.length * 1000;
        if (ratio > 5)
            return 0.6;
        return 0;
    }
    analyzeReferenceClarity(text) {
        const pronouns = ['这', '那', '它', '他们', '她们', '这些', '那些'];
        let pronounCount = 0;
        for (const p of pronouns) {
            const regex = new RegExp(p, 'g');
            const matches = text.match(regex);
            if (matches)
                pronounCount += matches.length;
        }
        const paragraphs = text.split(/\n\n+/).length;
        if (paragraphs === 0)
            return 0;
        const ratio = pronounCount / paragraphs;
        if (ratio > 10)
            return 0.5;
        return 0;
    }
    analyzeCoherenceMarkers(text) {
        const markers = [
            '然而', '但是', '因此', '所以', '不过',
            '与此同时', '于是', '接着', '随后', '于是乎'
        ];
        let count = 0;
        for (const marker of markers) {
            const regex = new RegExp(marker, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        const ratio = count / text.length * 1000;
        if (ratio > 6)
            return 0.5;
        if (ratio > 3)
            return 0.2;
        return 0;
    }
    getDimensionDescription(dimension, score) {
        const descriptions = {
            vocabulary_uniformity: '词汇变化较少，AI生成倾向高',
            sentence_length_variance: '句长过于均匀，变化不足',
            paragraph_opening_pattern: '段落开头模式重复',
            transition_word_frequency: '过渡词使用频率异常',
            emotional_word_density: '情感词汇密度偏低',
            personal_pronoun_usage: '第一人称使用不足',
            contradiction_detection: '逻辑矛盾词对过多',
            specificity_level: '具体细节不足',
            idiom_usage: '成语/俗语使用不足',
            punctuation_pattern: '标点符号使用模式单一',
            narrative_perspective: '叙事视角缺乏变化',
            temporal_consistency: '时间标记词过多',
            detail_granularity: '感官细节描写不足',
            rhetorical_devices: '修辞手法使用较少',
            character_voice_consistency: '角色语言模式单一',
            world_knowledge_consistency: '专业知识引用异常',
            plot_logic_consistency: '因果逻辑连接过多',
            information_balance: '段落长度过于均衡',
            unnecessary_preambles: '不必要的前置说明过多',
            formulaic_expressions: '套话表达重复出现',
            superlative_usage: '程度副词使用过度',
            hedging_frequency: '模糊词使用过多',
            passive_voice_ratio: '被动语态比例偏高',
            complex_sentence_ratio: '复杂句比例过高',
            list_structure_frequency: '列举结构频繁出现',
            topic_sentence_pattern: '主题句模式重复',
            definition_introduction: '定义性表达过多',
            summarization_frequency: '总结性语句过于频繁',
            example_provision: '举例说明较少',
            question_rhetorical: '反问句比例异常',
            emphasis_superfluous: '过度强调词过多',
            reference_clarity: '指代词使用过多',
            coherence_markers: '连贯词使用频率异常'
        };
        return descriptions[dimension] || `维度 ${dimension} 得分 ${score.toFixed(2)}`;
    }
    detectAIWords(text) {
        const indicators = [];
        for (const word of this.aiWordList) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches) {
                const frequency = matches.length / text.length * 1000;
                if (frequency > 2) {
                    indicators.push({
                        type: 'ai_word',
                        description: `过度使用"${word}"（每千字出现${frequency.toFixed(1)}次）`,
                        severity: Math.min(1, frequency / 10),
                        location: '多处',
                        dimension: 'formulaic_expressions'
                    });
                }
            }
        }
        return indicators;
    }
    detectSentencePatterns(text) {
        const indicators = [];
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        if (sentences.length < 3)
            return indicators;
        const lengths = sentences.map(s => s.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        if (variance < 100) {
            indicators.push({
                type: 'sentence_length',
                description: `句长过于均匀（方差${variance.toFixed(1)}），人类写作句长变化更大`,
                severity: 0.6,
                location: '全文',
                dimension: 'sentence_length_variance'
            });
        }
        const longSentences = sentences.filter(s => s.length > 100);
        if (longSentences.length > sentences.length * 0.5) {
            indicators.push({
                type: 'long_sentence_ratio',
                description: `长句比例过高（${(longSentences.length / sentences.length * 100).toFixed(1)}%）`,
                severity: 0.5,
                location: '全文',
                dimension: 'complex_sentence_ratio'
            });
        }
        return indicators;
    }
    detectStructurePatterns(text) {
        const indicators = [];
        const paragraphStarts = text.split('\n\n').map(p => {
            const lines = p.trim().split('\n');
            return lines[0] || '';
        });
        const startPatterns = paragraphStarts.map(s => {
            return s.substring(0, Math.min(20, s.length));
        });
        const uniqueStarts = new Set(startPatterns);
        if (uniqueStarts.size < startPatterns.length * 0.3) {
            indicators.push({
                type: 'paragraph_structure',
                description: '段落开头模式过于重复',
                severity: 0.7,
                location: '多处',
                dimension: 'paragraph_opening_pattern'
            });
        }
        return indicators;
    }
    detectEmotionPatterns(text) {
        const indicators = [];
        let emotionCount = 0;
        for (const word of this.emotionalWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches) {
                emotionCount += matches.length;
            }
        }
        const emotionDensity = emotionCount / text.length * 10000;
        if (emotionDensity < 5) {
            indicators.push({
                type: 'emotion_density',
                description: `情感词汇密度较低（每万字${emotionDensity.toFixed(1)}个）`,
                severity: 0.4,
                location: '全文',
                dimension: 'emotional_word_density'
            });
        }
        return indicators;
    }
    generateSuggestions(indicators, scores) {
        const suggestions = [];
        for (const indicator of indicators) {
            switch (indicator.dimension) {
                case 'vocabulary_uniformity':
                    suggestions.push('增加词汇多样性，使用更多同义词和表达方式');
                    break;
                case 'sentence_length_variance':
                    suggestions.push('增加句长变化，混合长短句');
                    break;
                case 'paragraph_opening_pattern':
                    suggestions.push('变化段落开头方式，避免重复');
                    break;
                case 'transition_word_frequency':
                    suggestions.push('减少过渡词使用，让叙述更自然流畅');
                    break;
                case 'emotional_word_density':
                    suggestions.push('增加情感描写和内心活动');
                    break;
                case 'personal_pronoun_usage':
                    suggestions.push('增加第一人称叙述，增强代入感');
                    break;
                case 'formulaic_expressions':
                    suggestions.push('避免套话表达，用更自然的方式表达');
                    break;
                case 'complex_sentence_ratio':
                    suggestions.push('适当拆分长句，增加短句节奏');
                    break;
                case 'superlative_usage':
                    suggestions.push('减少程度副词使用，让表达更克制');
                    break;
                case 'hedging_frequency':
                    suggestions.push('减少模糊词使用，表达更明确');
                    break;
                case 'ai_word':
                    suggestions.push(`将"${indicator.description.match(/"([^"]+)"/)?.[1]}"替换为更口语化的表达`);
                    break;
                case 'sentence_length':
                    suggestions.push('增加句长变化，混合长短句');
                    break;
                case 'emotion_density':
                    suggestions.push('增加情感描写和内心活动');
                    break;
            }
        }
        return [...new Set(suggestions)];
    }
    async humanize(text, llmProvider) {
        if (!this.config.enabled)
            return text;
        const intensity = this.config.intensity / 10;
        let result = text;
        if (this.config.replaceAIWords && intensity >= 0.3) {
            result = this.replaceAIWords(result, intensity);
        }
        if (this.config.varySentenceStructure && intensity >= 0.4) {
            result = this.varySentenceStructure(result, intensity);
        }
        if (this.config.addColloquialism && intensity >= 0.5) {
            result = this.addColloquialism(result, intensity);
        }
        if (this.config.enhanceEmotion && intensity >= 0.3) {
            result = await this.enhanceEmotion(result, llmProvider);
        }
        if (this.config.addImperfection && intensity >= 0.4) {
            result = this.addImperfection(result, intensity);
        }
        return result;
    }
    replaceAIWords(text, intensity) {
        const replacements = {
            '然而': ['可', '但', '只是', '不过'],
            '因此': ['于是', '就', '这么着'],
            '所以': ['就', '于是', '这不'],
            '但是': ['可', '只是', '然而'],
            '不过': ['只是', '然而', '可'],
            '与此同时': ['这当口', '这会儿', '这时候'],
            '综上所述': ['总的说来', '这么看'],
            '总的来说': ['总体来看', '总的来讲'],
            '首先': ['头一个', '一上来', '先说'],
            '其次': ['再一个', '还有'],
            '最后': ['末了', '到头来', '收尾时'],
            '一方面': ['一头', '一边'],
            '另一方面': ['另一头', '另一边', '再说'],
        };
        let result = text;
        for (const [aiWord, humanWords] of Object.entries(replacements)) {
            const regex = new RegExp(aiWord, 'g');
            result = result.replace(regex, () => {
                return humanWords[Math.floor(Math.random() * humanWords.length)];
            });
        }
        return result;
    }
    varySentenceStructure(text, intensity) {
        const sentences = text.split(/([。！？])/);
        const result = [];
        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            if (!sentence.trim()) {
                result.push(sentence, punctuation);
                continue;
            }
            if (sentence.length > 80 && Math.random() < intensity * 0.3) {
                const midpoint = Math.floor(sentence.length / 2);
                const splitPoint = sentence.indexOf('，', midpoint - 20);
                if (splitPoint > 0) {
                    const part1 = sentence.substring(0, splitPoint + 1);
                    const part2 = sentence.substring(splitPoint + 1);
                    result.push(part1, '，');
                    result.push(part2, punctuation);
                    continue;
                }
            }
            result.push(sentence, punctuation);
        }
        return result.join('');
    }
    addColloquialism(text, intensity) {
        const colloquialPatterns = [
            { from: '非常', to: ['老', '贼', '可', '真'] },
            { from: '觉得', to: ['寻思', '寻思着', '琢磨', '琢磨着'] },
            { from: '认为', to: ['觉着', '感觉', '以为'] },
            { from: '突然', to: ['猛地', '忽地', '一下', '冷不丁'] },
            { from: '然后', to: ['这当口', '完了', '紧跟着'] },
        ];
        let result = text;
        if (Math.random() < intensity * 0.3) {
            for (const pattern of colloquialPatterns) {
                const regex = new RegExp(pattern.from, 'g');
                result = result.replace(regex, () => {
                    return pattern.to[Math.floor(Math.random() * pattern.to.length)];
                });
            }
        }
        return result;
    }
    async enhanceEmotion(text, llmProvider) {
        if (llmProvider) {
            const prompt = `请为以下文本增强情感表达，保持原文风格的同时增加更多情感描写和内心活动：

${text}

要求：
1. 保持原文情节和人物
2. 增加自然的情感流露
3. 添加适当的内心独白
4. 不要过度煽情

请直接输出修改后的文本：`;
            try {
                const result = await llmProvider.generate(prompt, {
                    temperature: 0.7,
                    maxTokens: 2000
                });
                return result.text;
            }
            catch (error) {
                console.error('情感增强失败:', error);
            }
        }
        return text;
    }
    addImperfection(text, intensity) {
        let result = text;
        if (Math.random() < intensity * 0.2) {
            const sentences = result.split(/[。！？]/);
            if (sentences.length > 3) {
                const randomIndex = Math.floor(Math.random() * (sentences.length - 2)) + 1;
                sentences[randomIndex] += ' ' + sentences[randomIndex].trim();
                result = sentences.join('。');
            }
        }
        return result;
    }
    analyzeStyle(text) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        const lengths = sentences.map(s => s.length);
        return {
            averageSentenceLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
            sentenceLengthVariance: this.calculateVariance(lengths),
            vocabularyRichness: this.calculateVocabularyRichness(text),
            transitionWordFrequency: this.calculateTransitionWordFrequency(text),
            emotionalWordDensity: this.calculateEmotionalWordDensity(text),
            paragraphStructure: this.analyzeParagraphStructure(text),
            dialoguePattern: this.extractDialoguePatterns(text),
            repetitionRate: this.calculateRepetitionRate(text),
            readabilityScore: this.calculateReadabilityScore(text),
            coherenceScore: this.calculateCoherenceScore(text)
        };
    }
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
    calculateVocabularyRichness(text) {
        const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
        const uniqueWords = new Set(words);
        return uniqueWords.size / Math.max(words.length, 1);
    }
    calculateTransitionWordFrequency(text) {
        const transitionWords = ['然后', '接着', '于是', '之后', '后来', '随后'];
        let count = 0;
        for (const word of transitionWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        return count / text.length * 1000;
    }
    calculateEmotionalWordDensity(text) {
        let count = 0;
        for (const word of this.emotionalWords) {
            const regex = new RegExp(word, 'g');
            const matches = text.match(regex);
            if (matches)
                count += matches.length;
        }
        return count / text.length * 10000;
    }
    analyzeParagraphStructure(text) {
        const paragraphs = text.split(/\n\n+/);
        return paragraphs.length / Math.max(text.length / 1000, 1);
    }
    extractDialoguePatterns(text) {
        const dialogues = text.match(/"[^"]*"/g) || [];
        return dialogues.slice(0, 10);
    }
    calculateRepetitionRate(text) {
        const ngrams = new Map();
        const trigrams = text.match(/.{3}/g) || [];
        for (const trigram of trigrams) {
            ngrams.set(trigram, (ngrams.get(trigram) || 0) + 1);
        }
        const repeated = Array.from(ngrams.values()).filter(count => count > 1).length;
        return repeated / Math.max(ngrams.size, 1);
    }
    calculateReadabilityScore(text) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        if (avgLength < 30)
            return 0.8;
        if (avgLength < 50)
            return 0.6;
        if (avgLength < 80)
            return 0.4;
        return 0.2;
    }
    calculateCoherenceScore(text) {
        const coherenceMarkers = ['然后', '接着', '于是', '然而', '但是', '因此'];
        let markerCount = 0;
        for (const marker of coherenceMarkers) {
            const regex = new RegExp(marker, 'g');
            const matches = text.match(regex);
            if (matches)
                markerCount += matches.length;
        }
        const paragraphs = text.split(/\n\n+/).length;
        if (paragraphs === 0)
            return 0.5;
        const markerDensity = markerCount / paragraphs;
        if (markerDensity > 2 && markerDensity < 5)
            return 0.7;
        if (markerDensity >= 5)
            return 0.4;
        return 0.6;
    }
}
exports.AntiDetectionEngine = AntiDetectionEngine;
exports.default = AntiDetectionEngine;
//# sourceMappingURL=AntiDetectionEngine.js.map