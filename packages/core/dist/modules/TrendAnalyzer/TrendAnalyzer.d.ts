/**
 * 趋势分析器
 * 支持市场趋势分析和数据展示
 *
 * 注意：此模块目前不包含真实的网络爬虫功能，仅提供静态分析和样本数据展示
 */
import { TrendAnalysisConfig, TrendReport } from '../../types';
export interface TrendData {
    platform: string;
    category: string;
    title: string;
    author?: string;
    popularity: number;
    trend: 'rising' | 'falling' | 'stable';
    wordCount?: number;
    updateFrequency?: string;
    tags: string[];
    rating?: number;
    chapters?: number;
    subscribers?: number;
    views?: number;
    engagement?: number;
    lastUpdated: Date;
}
export interface MarketTrend {
    category: string;
    demand: 'high' | 'medium' | 'low';
    saturation: number;
    growth: number;
    competition: number;
    bestTimeToEnter: string;
    risk: 'high' | 'medium' | 'low';
    recommendations: string[];
}
export interface CompetitiveAnalysis {
    title: string;
    author: string;
    platform: string;
    strength: string[];
    weakness: string[];
    uniquePoints: string[];
    lessons: string[];
}
export declare class TrendAnalyzer {
    private config;
    private cache;
    private cacheDuration;
    constructor(config?: Partial<TrendAnalysisConfig>);
    analyzeTrends(): Promise<TrendReport>;
    private fetchPlatformData;
    private getQidianSampleData;
    private getJjwxcSampleData;
    private getZonghengSampleData;
    private getSfhSampleData;
    private getGenericSampleData;
    private analyzeMarketTrends;
    private getTopGenres;
    private getRisingTopics;
    private getAudienceInsights;
    private generateRecommendations;
    getCompetitiveAnalysis(title: string): Promise<CompetitiveAnalysis[]>;
    private findSimilarWorks;
    private analyzeStrength;
    private analyzeWeakness;
    private analyzeUniquePoints;
    private extractLessons;
    clearCache(): void;
    setCacheDuration(duration: number): void;
    analyzeCompetitor(title: string): Promise<CompetitiveAnalysis[]>;
    generateInspiration(genre: string): Promise<string[]>;
    analyzeMarket(genre?: string): Promise<MarketTrend[]>;
    generateCompetitorReport(title: string): Promise<CompetitiveAnalysis[]>;
    generateTrendInsights(): Promise<{
        insight: string;
        source: string;
    }[]>;
}
//# sourceMappingURL=TrendAnalyzer.d.ts.map