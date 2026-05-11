"use strict";
/**
 * Trend Analyzer - 扫榜分析模块
 * 分析平台趋势和竞品
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendAnalyzer = void 0;
class TrendAnalyzer {
    llmManager;
    constructor(llmManager) {
        this.llmManager = llmManager;
    }
    async analyzeTrends(platform, genre, options) {
        const prompt = this.buildTrendPrompt(platform, genre, options);
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.7
        });
        return this.parseTrendReport(response, platform, genre);
    }
    async analyzeCompetitor(bookInfo) {
        const prompt = this.buildCompetitorPrompt(bookInfo);
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.6
        });
        return this.parseCompetitorAnalysis(response);
    }
    async analyzeBook(content, metadata) {
        const prompt = this.buildBookAnalysisPrompt(content, metadata);
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.6
        });
        return this.parseBookAnalysis(response);
    }
    async compareBooks(book1, book2) {
        const prompt = `对比分析以下两本书：

第一本：
${book1}

第二本：
${book2}

请分析：
1. 相似之处（题材、风格、元素）
2. 不同之处（创新点、特色）
3. 哪本书更值得学习借鉴

请详细阐述分析结果。`;
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.6
        });
        return this.parseComparison(response);
    }
    async generateInspiration(genre, inspirationType) {
        const typeStr = inspirationType === 'all' ? '情节、角色、世界观' : inspirationType || '情节';
        const prompt = `作为创意激发专家，为${genre}题材小说提供${typeStr}灵感。

请提供5-10个原创性的灵感点子，要求：
1. 新颖独特，不是常见套路
2. 有深度，可以展开
3. 符合市场趋势

每个灵感请包含：
- 核心概念
- 展开方向
- 可能的剧情走向

请用列表格式输出。`;
        const response = await this.llmManager.complete(prompt, {
            task: 'planning',
            temperature: 0.9
        });
        return this.parseInspirationList(response);
    }
    buildTrendPrompt(platform, genre, options) {
        return `分析${platform}平台上${genre}题材小说的当前趋势。

时间范围：${options?.timeRange || '最近一个月'}
样本数量：${options?.sampleSize || 50}本

请分析：
1. 热门元素：当前最受欢迎的设定、题材融合、风格特点
2. 成功模式：常见的成功叙事模式、节奏安排
3. 市场空白：尚未被充分开发的领域
4. 读者偏好：读者最喜欢的角色类型、情节走向
5. 风险提示：已经过气的元素、需要避免的套路

请提供详细的趋势报告和建议。`;
    }
    buildCompetitorPrompt(bookInfo) {
        return `分析以下竞品小说：

书名：${bookInfo.title || '未知'}
${bookInfo.url ? `链接：${bookInfo.url}` : ''}
题材：${bookInfo.genre || '待分析'}

请从以下维度分析：
1. 基础信息（字数、章节数、更新频率）
2. 成功要素（为什么受欢迎）
3. 结构特点（开篇、节奏、伏笔）
4. 角色设计（主角设定、配角出彩点）
5. 可学习之处
6. 不足之处

请提供详细分析。`;
    }
    buildBookAnalysisPrompt(content, metadata) {
        const sample = content.slice(0, 10000);
        return `分析以下小说内容：

基本信息：
- 题材：${metadata?.genre || '未知'}
- 字数：${metadata?.wordCount || '未知'}

正文样本：
${sample}

请分析：
1. 题材类型和标签
2. 世界观设定
3. 主角设定（性格、背景、目标）
4. 开篇钩子设计
5. 叙事风格
6. 情节节奏评估
7. 可学习之处

请提供详细分析报告。`;
    }
    parseTrendReport(response, platform, genre) {
        return {
            generatedAt: new Date(),
            platform,
            genre,
            hotElements: this.extractTrendElements(response, '热门元素'),
            successfulPatterns: this.extractPatterns(response),
            marketGaps: this.extractGaps(response),
            recommendations: this.extractRecommendations(response)
        };
    }
    parseCompetitorAnalysis(response) {
        return {
            title: this.extractField(response, '书名') || '未知',
            author: this.extractField(response, '作者') || '未知',
            genre: (this.extractField(response, '题材') || 'unknown'),
            wordCount: parseInt(this.extractField(response, '字数') || '0'),
            updateFrequency: this.extractField(response, '更新频率') || '未知',
            hotElements: this.extractList(response, '成功要素'),
            strengths: this.extractList(response, '可学习'),
            weaknesses: this.extractList(response, '不足'),
            readerReviews: this.extractReviews(response)
        };
    }
    parseBookAnalysis(response) {
        return {
            basicInfo: {
                title: this.extractField(response, '书名') || '未知',
                author: this.extractField(response, '作者') || '未知',
                genre: this.extractField(response, '题材') || '未知',
                wordCount: parseInt(this.extractField(response, '字数') || '0'),
                chapters: parseInt(this.extractField(response, '章节') || '0'),
                status: this.extractField(response, '状态') === '完本' ? 'completed' : 'ongoing'
            },
            structure: {
                openingHook: this.extractSection(response, '开篇'),
                mainConflict: this.extractSection(response, '主要冲突'),
                subplots: this.extractList(response, '支线'),
                pacingAssessment: this.extractSection(response, '节奏')
            },
            characterDesign: {
                protagonistType: this.extractSection(response, '主角类型'),
                supportingCast: this.extractList(response, '配角'),
                relationshipDynamics: this.extractSection(response, '关系')
            },
            marketPerformance: {
                ranking: parseInt(this.extractField(response, '排名') || '0'),
                subscriberCount: this.extractField(response, '收藏') || '未知',
                reviewCount: parseInt(this.extractField(response, '评论') || '0'),
                rating: parseFloat(this.extractField(response, '评分') || '0')
            }
        };
    }
    parseComparison(response) {
        return {
            similarities: this.extractList(response, '相似'),
            differences: this.extractList(response, '不同'),
            recommendation: this.extractSection(response, '建议') || this.extractSection(response, '推荐')
        };
    }
    parseInspirationList(response) {
        const inspirations = [];
        const lines = response.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cleaned = line.replace(/^\d+[.、:：]\s*/, '').trim();
            if (cleaned.length > 10) {
                inspirations.push(cleaned);
            }
        }
        return inspirations.slice(0, 10);
    }
    extractTrendElements(text, category) {
        const section = this.extractSection(text, category);
        const elements = [];
        const lines = section.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cleaned = line.replace(/^[-*]\s*/, '').trim();
            if (cleaned.length > 0) {
                elements.push({
                    name: cleaned,
                    popularity: 0.7,
                    trend: 'rising',
                    examples: []
                });
            }
        }
        return elements.slice(0, 10);
    }
    extractPatterns(text) {
        const patterns = [];
        const patternSection = this.extractSection(text, '成功模式');
        const lines = patternSection.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cleaned = line.replace(/^[-*]\s*/, '').trim();
            if (cleaned.length > 0) {
                patterns.push({
                    name: cleaned,
                    description: cleaned,
                    frequency: 0.5,
                    successRate: 0.7
                });
            }
        }
        return patterns.slice(0, 5);
    }
    extractGaps(text) {
        const gaps = [];
        const gapSection = this.extractSection(text, '市场空白');
        const lines = gapSection.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cleaned = line.replace(/^[-*]\s*/, '').trim();
            if (cleaned.length > 0) {
                gaps.push({
                    name: cleaned,
                    description: cleaned,
                    opportunity: 'medium'
                });
            }
        }
        return gaps.slice(0, 5);
    }
    extractRecommendations(text) {
        const recommendations = [];
        const recSection = this.extractSection(text, '建议');
        const lines = recSection.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const cleaned = line.replace(/^[-*]\s*/, '').trim();
            if (cleaned.length > 0) {
                recommendations.push({
                    type: 'plot',
                    suggestion: cleaned,
                    priority: 'medium',
                    reason: ''
                });
            }
        }
        return recommendations.slice(0, 5);
    }
    extractField(text, field) {
        const match = text.match(new RegExp(`${field}[：:]\\s*(.+?)(?:\\n|$)`, 'i'));
        return match ? match[1].trim() : '';
    }
    extractSection(text, section) {
        const match = text.match(new RegExp(`${section}[：:]([\\s\\S]*?)(?=\\n\\n|\\n[\\u4e00-\\u9fa5])`, 'i'));
        return match ? match[1].trim() : '';
    }
    extractList(text, category) {
        const section = this.extractSection(text, category);
        if (!section)
            return [];
        return section.split('\n')
            .map(l => l.replace(/^[-*]\s*/, '').trim())
            .filter(l => l.length > 0);
    }
    extractReviews(text) {
        const reviewSection = this.extractSection(text, '读者评论');
        return this.extractList(text, '评论').slice(0, 5);
    }
}
exports.TrendAnalyzer = TrendAnalyzer;
exports.default = TrendAnalyzer;
//# sourceMappingURL=TrendAnalyzer.js.map