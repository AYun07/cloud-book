/**
 * 故事导演模块
 * 自动分析市场趋势，生成故事方向和章节规划
 */
import { AutoDirectorResult, StoryDirection, ChapterPlan, NovelProject } from '../../types';
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
export declare class AutoDirector {
    private llmManager;
    constructor(llmManager: LLMManager);
    analyzeTrends(): Promise<TrendAnalysis>;
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
    private parseTrendAnalysis;
    private parseDirections;
    private parseChapterPlan;
    private extractList;
    private extractSelectedIndex;
    private calculateScore;
    private parseSellingPoints;
    private parseFirstPromise;
    private parseSuggestions;
    private toChinese;
    private generateId;
}
export default AutoDirector;
//# sourceMappingURL=AutoDirector.d.ts.map