/**
 * 故事导演模块
 * 自动分析市场趋势，生成故事方向和章节规划
 * 支持从真实小说网站采集市场数据
 */
import { AutoDirectorResult, StoryDirection, ChapterPlan, NovelProject, TrendReport } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
export interface TrendAnalysis {
    popularElements: string[];
    trendingGenres: string[];
    successfulPatterns: string[];
    marketGaps: string[];
}
export interface DirectorConfig {
    targetAudience?: string;
    tone?: string;
    wordCountTarget?: number;
    chapterCount?: number;
}
export interface MarketData {
    platform: string;
    category: string;
    title: string;
    author?: string;
    popularity: number;
    trend: 'rising' | 'falling' | 'stable';
    wordCount?: number;
    tags: string[];
    rating?: number;
    chapters?: number;
    lastUpdated: Date;
}
export interface PlatformConfig {
    name: string;
    baseUrl: string;
    rankingEndpoint?: string;
    categoryEndpoint?: string;
    headers?: Record<string, string>;
}
export declare class AutoDirector {
    private llmManager;
    private cache;
    private cacheDuration;
    private platformConfigs;
    constructor(llmManager: LLMManager);
    private initializePlatformConfigs;
    analyzeTrends(): Promise<TrendAnalysis>;
    private collectMarketData;
    private fetchPlatformData;
    private fetchQidianRankings;
    private parseQidianRanking;
    private fetchJjwxcRankings;
    private fetchZonghengRankings;
    private fetchFanqieRankings;
    private fetchGenericRankings;
    private parseGenericRanking;
    private httpGet;
    private extractTags;
    private generateFallbackData;
    private generateQidianFallbackData;
    private generateJjwxcFallbackData;
    private generateZonghengFallbackData;
    private generateFanqieFallbackData;
    private generatePlatformFallbackData;
    private generateRealisticTitle;
    private getTitleTemplates;
    private fillTemplate;
    private generateTags;
    private extractPopularElements;
    private extractTrendingGenres;
    private extractSuccessfulPatterns;
    private identifyMarketGaps;
    private analyzeWithLLM;
    private summarizeMarketData;
    private extractTopGenres;
    private extractRisingTopics;
    private extractAudienceInsights;
    private extractPlatformData;
    private analyzeMarketTrends;
    private generateRecommendations;
    private generateFallbackTrendReport;
    generateDirections(project: Partial<NovelProject>, count?: number): Promise<StoryDirection[]>;
    selectBestDirection(directions: StoryDirection[], criteria?: {
        originality?: number;
        marketability?: number;
        feasibility?: number;
    }): Promise<{
        direction: StoryDirection;
        score: number;
    }>;
    createProjectPlan(direction: StoryDirection, config?: DirectorConfig): Promise<AutoDirectorResult>;
    generateChapterPlan(direction: StoryDirection, totalChapters?: number): Promise<ChapterPlan[]>;
    suggestAdjustments(currentDirection: StoryDirection, performanceData?: {
        readerRetention?: number;
        favoriteChapters?: number[];
        dropOffChapter?: number;
    }): Promise<string[]>;
    private enrichDirection;
    private getGenreContext;
    private parseDirections;
    private parseChapterPlan;
    private extractSelectedIndex;
    private calculateScore;
    private parseSellingPoints;
    private parseFirstPromise;
    private parseSuggestions;
    private toChinese;
    private generateId;
    getMarketReport(): Promise<TrendReport>;
    analyzeCompetitor(title: string): Promise<{
        strength: string[];
        weakness: string[];
        lessons: string[];
    }>;
    private findSimilarTitles;
    clearCache(): void;
    setCacheDuration(duration: number): void;
}
export default AutoDirector;
//# sourceMappingURL=AutoDirector.d.ts.map