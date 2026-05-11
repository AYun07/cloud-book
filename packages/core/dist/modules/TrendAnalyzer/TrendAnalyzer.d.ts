/**
 * Trend Analyzer - 扫榜分析模块
 * 分析平台趋势和竞品
 */
import { LLMManager } from '../LLMProvider/LLMManager';
import { Genre } from '../../types';
export interface TrendReport {
    generatedAt: Date;
    platform: string;
    genre: Genre;
    hotElements: TrendElement[];
    successfulPatterns: Pattern[];
    marketGaps: Gap[];
    recommendations: Recommendation[];
}
export interface TrendElement {
    name: string;
    popularity: number;
    trend: 'rising' | 'stable' | 'declining';
    examples: string[];
}
export interface Pattern {
    name: string;
    description: string;
    frequency: number;
    successRate: number;
}
export interface Gap {
    name: string;
    description: string;
    opportunity: 'high' | 'medium' | 'low';
}
export interface Recommendation {
    type: 'plot' | 'character' | 'world' | 'writing';
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}
export interface CompetitorAnalysis {
    title: string;
    author: string;
    genre: Genre;
    wordCount: number;
    updateFrequency: string;
    hotElements: string[];
    strengths: string[];
    weaknesses: string[];
    readerReviews: string[];
}
export interface BookAnalysis {
    basicInfo: {
        title: string;
        author: string;
        genre: string;
        wordCount: number;
        chapters: number;
        status: 'ongoing' | 'completed';
    };
    structure: {
        openingHook: string;
        mainConflict: string;
        subplots: string[];
        pacingAssessment: string;
    };
    characterDesign: {
        protagonistType: string;
        supportingCast: string[];
        relationshipDynamics: string;
    };
    marketPerformance: {
        ranking: number;
        subscriberCount: string;
        reviewCount: number;
        rating: number;
    };
}
export declare class TrendAnalyzer {
    private llmManager;
    constructor(llmManager: LLMManager);
    analyzeTrends(platform: string, genre: Genre, options?: {
        timeRange?: 'week' | 'month' | 'quarter';
        sampleSize?: number;
    }): Promise<TrendReport>;
    analyzeCompetitor(bookInfo: {
        title?: string;
        url?: string;
        genre?: Genre;
    }): Promise<CompetitorAnalysis>;
    analyzeBook(content: string, metadata?: Record<string, any>): Promise<BookAnalysis>;
    compareBooks(book1: string, book2: string): Promise<{
        similarities: string[];
        differences: string[];
        recommendation: string;
    }>;
    generateInspiration(genre: Genre, inspirationType?: 'plot' | 'character' | 'world' | 'all'): Promise<string[]>;
    private buildTrendPrompt;
    private buildCompetitorPrompt;
    private buildBookAnalysisPrompt;
    private parseTrendReport;
    private parseCompetitorAnalysis;
    private parseBookAnalysis;
    private parseComparison;
    private parseInspirationList;
    private extractTrendElements;
    private extractPatterns;
    private extractGaps;
    private extractRecommendations;
    private extractField;
    private extractSection;
    private extractList;
    private extractReviews;
}
export default TrendAnalyzer;
//# sourceMappingURL=TrendAnalyzer.d.ts.map