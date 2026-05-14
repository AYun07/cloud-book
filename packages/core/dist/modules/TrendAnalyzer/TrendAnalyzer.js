"use strict";
/**
 * 趋势分析器
 * 支持市场趋势分析和数据展示
 *
 * 注意：此模块目前不包含真实的网络爬虫功能，仅提供静态分析和样本数据展示
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendAnalyzer = void 0;
// 真实的样本数据，基于常见的网络文学市场情况
const SAMPLE_TREND_DATA = [
    {
        platform: '起点中文网',
        category: '玄幻',
        title: '玄幻小说范例作品1',
        author: '示例作者A',
        popularity: 0.85,
        trend: 'rising',
        wordCount: 1200000,
        updateFrequency: '日更',
        tags: ['玄幻', '修仙', '日更'],
        rating: 8.8,
        chapters: 850,
        subscribers: 25000,
        views: 2000000,
        engagement: 0.65,
        lastUpdated: new Date()
    },
    {
        platform: '起点中文网',
        category: '都市',
        title: '都市小说范例作品1',
        author: '示例作者B',
        popularity: 0.78,
        trend: 'stable',
        wordCount: 950000,
        updateFrequency: '日更',
        tags: ['都市', '生活', '日更'],
        rating: 8.5,
        chapters: 680,
        subscribers: 18000,
        views: 1500000,
        engagement: 0.58,
        lastUpdated: new Date()
    },
    {
        platform: '晋江文学城',
        category: '言情',
        title: '言情小说范例作品1',
        author: '示例作者C',
        popularity: 0.92,
        trend: 'rising',
        wordCount: 680000,
        updateFrequency: '日更',
        tags: ['言情', '现代', '热门'],
        rating: 9.2,
        chapters: 520,
        subscribers: 32000,
        views: 3500000,
        engagement: 0.75,
        lastUpdated: new Date()
    },
    {
        platform: '晋江文学城',
        category: '纯爱',
        title: '纯爱小说范例作品1',
        author: '示例作者D',
        popularity: 0.88,
        trend: 'stable',
        wordCount: 550000,
        updateFrequency: '两日更',
        tags: ['纯爱', '温馨', '晋江'],
        rating: 9.0,
        chapters: 420,
        subscribers: 28000,
        views: 2800000,
        engagement: 0.72,
        lastUpdated: new Date()
    },
    {
        platform: '纵横中文网',
        category: '仙侠',
        title: '仙侠小说范例作品1',
        author: '示例作者E',
        popularity: 0.72,
        trend: 'falling',
        wordCount: 1800000,
        updateFrequency: '日更',
        tags: ['仙侠', '修仙', '长篇'],
        rating: 8.2,
        chapters: 1200,
        subscribers: 15000,
        views: 1200000,
        engagement: 0.52,
        lastUpdated: new Date()
    },
    {
        platform: 'SF轻小说',
        category: '轻小说',
        title: '轻小说范例作品1',
        author: '示例作者F',
        popularity: 0.80,
        trend: 'rising',
        wordCount: 450000,
        updateFrequency: '周更',
        tags: ['轻小说', '二次元', 'SF'],
        rating: 8.6,
        chapters: 350,
        subscribers: 20000,
        views: 1800000,
        engagement: 0.60,
        lastUpdated: new Date()
    }
];
class TrendAnalyzer {
    config;
    cache = new Map();
    cacheDuration = 30 * 60 * 1000;
    constructor(config = {}) {
        this.config = {
            enabled: true,
            platforms: ['qidian', 'jjwxc', 'zongheng'],
            cacheResults: true,
            ...config
        };
    }
    async analyzeTrends() {
        const trends = [];
        const platformData = [];
        for (const platform of this.config.platforms || []) {
            const data = await this.fetchPlatformData(platform);
            trends.push(...data);
            platformData.push({
                platform,
                trends: data.map(d => ({
                    title: d.title,
                    popularity: d.popularity,
                    trend: d.trend
                }))
            });
        }
        const marketTrends = this.analyzeMarketTrends(trends);
        const topGenres = this.getTopGenres(trends);
        const risingTopics = this.getRisingTopics(trends);
        const audienceInsights = this.getAudienceInsights(trends);
        return {
            period: 'last_30_days',
            topGenres,
            risingTopics,
            audienceInsights,
            platformData,
            marketTrends,
            recommendations: this.generateRecommendations(trends, marketTrends),
            timestamp: new Date()
        };
    }
    async fetchPlatformData(platform) {
        const cacheKey = `trend_${platform}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        let data = [];
        switch (platform) {
            case 'qidian':
                data = this.getQidianSampleData();
                break;
            case 'jjwxc':
                data = this.getJjwxcSampleData();
                break;
            case 'zongheng':
                data = this.getZonghengSampleData();
                break;
            case 'sfh':
                data = this.getSfhSampleData();
                break;
            default:
                data = this.getGenericSampleData(platform);
        }
        if (this.config.cacheResults) {
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
        }
        return data;
    }
    getQidianSampleData() {
        return SAMPLE_TREND_DATA.filter(d => d.platform === '起点中文网');
    }
    getJjwxcSampleData() {
        return SAMPLE_TREND_DATA.filter(d => d.platform === '晋江文学城');
    }
    getZonghengSampleData() {
        return SAMPLE_TREND_DATA.filter(d => d.platform === '纵横中文网');
    }
    getSfhSampleData() {
        return SAMPLE_TREND_DATA.filter(d => d.platform === 'SF轻小说');
    }
    getGenericSampleData(platform) {
        return SAMPLE_TREND_DATA.slice(0, 2).map(d => ({ ...d, platform }));
    }
    analyzeMarketTrends(data) {
        const categoryStats = new Map();
        for (const item of data) {
            const existing = categoryStats.get(item.category) || { total: 0, rising: 0, count: 0 };
            existing.total += item.popularity;
            if (item.trend === 'rising')
                existing.rising++;
            existing.count++;
            categoryStats.set(item.category, existing);
        }
        const trends = [];
        for (const [category, stats] of categoryStats) {
            const avgPopularity = stats.total / stats.count;
            const risingRatio = stats.rising / stats.count;
            let demand;
            let saturation;
            let growth;
            let competition;
            if (avgPopularity > 0.8 && risingRatio > 0.5) {
                demand = 'high';
                saturation = 0.45;
                growth = 0.25;
                competition = 0.65;
            }
            else if (avgPopularity > 0.6 || risingRatio > 0.3) {
                demand = 'medium';
                saturation = 0.55;
                growth = 0.15;
                competition = 0.5;
            }
            else {
                demand = 'low';
                saturation = 0.7;
                growth = 0.05;
                competition = 0.35;
            }
            const risk = competition > 0.7 && saturation > 0.6 ? 'high' :
                competition > 0.5 || saturation > 0.5 ? 'medium' : 'low';
            const bestTime = growth > 0.2 ? '现在是进入的好时机' :
                saturation < 0.5 ? '市场尚未饱和，可以进入' : '建议等待市场变化';
            const recommendations = [];
            if (demand === 'high' && competition < 0.7) {
                recommendations.push(`${category}题材目前需求旺盛，适合切入`);
            }
            if (growth > 0.2) {
                recommendations.push(`该分类呈上升趋势，增长率为${(growth * 100).toFixed(1)}%`);
            }
            if (saturation < 0.5) {
                recommendations.push('市场尚未饱和，竞争压力相对较小');
            }
            if (saturation > 0.6) {
                recommendations.push('市场接近饱和，需要差异化竞争');
            }
            trends.push({
                category,
                demand,
                saturation,
                growth,
                competition,
                bestTimeToEnter: bestTime,
                risk,
                recommendations
            });
        }
        return trends.sort((a, b) => b.demand.localeCompare(a.demand));
    }
    getTopGenres(data) {
        const genreStats = new Map();
        for (const item of data) {
            const existing = genreStats.get(item.category) || { count: 0, totalPopularity: 0 };
            existing.count++;
            existing.totalPopularity += item.popularity;
            genreStats.set(item.category, existing);
        }
        return Array.from(genreStats.entries())
            .map(([genre, stats]) => ({
            genre,
            count: stats.count,
            avgPopularity: stats.totalPopularity / stats.count
        }))
            .sort((a, b) => b.avgPopularity - a.avgPopularity)
            .slice(0, 10);
    }
    getRisingTopics(data) {
        const risingItems = data.filter(d => d.trend === 'rising');
        const categoryGrowth = new Map();
        for (const item of risingItems) {
            const existing = categoryGrowth.get(item.category) || { count: 0, totalGrowth: 0 };
            existing.count++;
            existing.totalGrowth += item.popularity;
            categoryGrowth.set(item.category, existing);
        }
        return Array.from(categoryGrowth.entries())
            .map(([category, stats]) => ({
            topic: category,
            category,
            growthRate: stats.totalGrowth / stats.count
        }))
            .filter(t => t.growthRate > 0.5)
            .sort((a, b) => b.growthRate - a.growthRate)
            .slice(0, 5);
    }
    getAudienceInsights(data) {
        const insights = [];
        const avgWordCount = data.reduce((sum, d) => sum + (d.wordCount || 0), 0) / data.length;
        if (avgWordCount > 500000) {
            insights.push({
                insight: '读者偏好长篇作品，平均字数超过50万字',
                source: '样本数据分析'
            });
        }
        const risingCount = data.filter(d => d.trend === 'rising').length;
        if (risingCount > data.length * 0.3) {
            insights.push({
                insight: '上升作品数量较多，市场活跃度较高',
                source: '样本分析'
            });
        }
        const categories = new Set(data.map(d => d.category));
        if (categories.size > 2) {
            insights.push({
                insight: '涵盖多种题材，不同类型都有市场',
                source: '分类统计'
            });
        }
        const avgEngagement = data.reduce((sum, d) => sum + (d.engagement || 0), 0) / data.length;
        if (avgEngagement > 0.5) {
            insights.push({
                insight: '读者互动意愿较强',
                source: '样本数据'
            });
        }
        insights.push({
            insight: '注：以上分析基于样本数据，实际市场数据可能有所不同',
            source: '说明'
        });
        return insights;
    }
    generateRecommendations(trends, marketTrends) {
        const recommendations = [];
        const highDemand = marketTrends.filter(m => m.demand === 'high' && m.risk !== 'high');
        for (const trend of highDemand) {
            recommendations.push({
                type: 'opportunity',
                message: `${trend.category}市场需求旺盛且风险适中，是切入的好时机`
            });
        }
        const lowSaturation = marketTrends.filter(m => m.saturation < 0.5);
        for (const trend of lowSaturation) {
            recommendations.push({
                type: 'suggestion',
                message: `${trend.category}市场尚未饱和，可以考虑差异化竞争`
            });
        }
        const highRisk = marketTrends.filter(m => m.risk === 'high');
        for (const trend of highRisk) {
            recommendations.push({
                type: 'warning',
                message: `${trend.category}市场竞争激烈，建议谨慎进入或寻求差异化突破`
            });
        }
        const hotCategories = trends.filter(t => t.popularity > 0.7 && t.trend === 'rising');
        if (hotCategories.length > 0) {
            const categories = [...new Set(hotCategories.map(c => c.category))];
            recommendations.push({
                type: 'suggestion',
                message: `${categories.join('、')}题材热度较高，可以考虑相关创作`
            });
        }
        recommendations.push({
            type: 'suggestion',
            message: '建议结合自身创作风格和读者偏好选择题材'
        });
        return recommendations.slice(0, 10);
    }
    async getCompetitiveAnalysis(title) {
        const similar = this.findSimilarWorks(title);
        return similar.map(work => ({
            title: work.title,
            author: work.author || '未知作者',
            platform: work.platform,
            strength: this.analyzeStrength(work),
            weakness: this.analyzeWeakness(work),
            uniquePoints: this.analyzeUniquePoints(work),
            lessons: this.extractLessons(work)
        }));
    }
    findSimilarWorks(title) {
        const allData = [...SAMPLE_TREND_DATA];
        const keywords = title.match(/[\u4e00-\u9fa5]+/g) || [];
        return allData
            .filter(work => {
            for (const keyword of keywords) {
                if (work.title.includes(keyword) || work.category.includes(keyword)) {
                    return true;
                }
            }
            return false;
        })
            .slice(0, 5);
    }
    analyzeStrength(work) {
        const strengths = [];
        if (work.popularity > 0.7) {
            strengths.push('读者基础好，受欢迎程度高');
        }
        if (work.trend === 'rising') {
            strengths.push('呈上升趋势，正在积累人气');
        }
        if (work.updateFrequency === '日更') {
            strengths.push('更新频率稳定，保持读者粘性');
        }
        if (work.engagement && work.engagement > 0.5) {
            strengths.push('读者互动活跃，社区氛围好');
        }
        return strengths;
    }
    analyzeWeakness(work) {
        const weaknesses = [];
        if (work.wordCount && work.wordCount > 1000000) {
            weaknesses.push('篇幅较长，完结周期长');
        }
        if (work.updateFrequency === '周更' || work.updateFrequency === '不定时') {
            weaknesses.push('更新可能不稳定');
        }
        if (work.trend === 'falling') {
            weaknesses.push('热度下降，需要突破');
        }
        return weaknesses;
    }
    analyzeUniquePoints(work) {
        const points = [];
        if (work.tags.includes('穿越') || work.tags.includes('重生')) {
            points.push('主角设定有特点');
        }
        if (work.tags.includes('世界观宏大')) {
            points.push('世界观构建完整');
        }
        return points;
    }
    extractLessons(work) {
        const lessons = [];
        if (work.popularity > 0.6) {
            lessons.push('成功的作品通常在开局就能吸引读者');
        }
        if (work.updateFrequency === '日更') {
            lessons.push('稳定的更新频率对积累读者很重要');
        }
        if (work.engagement && work.engagement > 0.5) {
            lessons.push('与读者互动可以提高作品粘性');
        }
        return lessons;
    }
    clearCache() {
        this.cache.clear();
    }
    setCacheDuration(duration) {
        this.cacheDuration = duration;
    }
    async analyzeCompetitor(title) {
        return this.getCompetitiveAnalysis(title);
    }
    async generateInspiration(genre) {
        const inspirations = [
            `创作${genre}题材时，可以考虑从独特的世界观入手`,
            `在${genre}创作中，人物塑造是吸引读者的关键`,
            `尝试在${genre}作品中加入一些创新元素`,
            `关注${genre}题材的读者反馈，了解他们的需求`
        ];
        return inspirations;
    }
    async analyzeMarket(genre) {
        let filteredData = [...SAMPLE_TREND_DATA];
        if (genre) {
            filteredData = filteredData.filter(d => d.category === genre);
        }
        return this.analyzeMarketTrends(filteredData);
    }
    async generateCompetitorReport(title) {
        return this.getCompetitiveAnalysis(title);
    }
    async generateTrendInsights() {
        return this.getAudienceInsights(SAMPLE_TREND_DATA);
    }
}
exports.TrendAnalyzer = TrendAnalyzer;
//# sourceMappingURL=TrendAnalyzer.js.map