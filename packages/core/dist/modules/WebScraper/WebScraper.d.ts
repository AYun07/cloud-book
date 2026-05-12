/**
 * Web Scraper - 网页内容爬取和分析模块
 * 支持爬取小说网站、新闻网站等内容
 * 增强版：完善的错误处理和防御机制
 */
export interface ScrapedContent {
    url: string;
    title: string;
    content: string;
    metadata: {
        author?: string;
        publishDate?: Date;
        tags?: string[];
        wordCount?: number;
        source?: string;
        charset?: string;
        contentType?: string;
    };
    links: string[];
    images: string[];
    scrapedAt: Date;
    statusCode?: number;
}
export interface ScraperConfig {
    userAgent?: string;
    timeout?: number;
    maxRetries?: number;
    followRedirects?: boolean;
    maxRedirects?: number;
    respectRobotsTxt?: boolean;
    delay?: number;
    maxContentLength?: number;
    allowedContentTypes?: string[];
    blockedDomains?: string[];
    enableCache?: boolean;
    cacheTTL?: number;
}
export declare enum ScraperErrorType {
    TIMEOUT = "TIMEOUT",
    HTTP_ERROR = "HTTP_ERROR",
    REDIRECT_LIMIT = "REDIRECT_LIMIT",
    ROBOTS_BLOCKED = "ROBOTS_BLOCKED",
    DOMAIN_BLOCKED = "DOMAIN_BLOCKED",
    INVALID_URL = "INVALID_URL",
    CONTENT_TOO_LARGE = "CONTENT_TOO_LARGE",
    INVALID_CONTENT_TYPE = "INVALID_CONTENT_TYPE",
    PARSE_ERROR = "PARSE_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    UNKNOWN = "UNKNOWN"
}
export interface ScraperError extends Error {
    type: ScraperErrorType;
    url: string;
    attempt?: number;
    statusCode?: number;
    details?: string;
}
export interface ScrapeResult {
    success: boolean;
    data?: ScrapedContent;
    error?: ScraperError;
}
export declare class WebScraper {
    private config;
    private visitedUrls;
    private cache;
    private requestTimestamps;
    private robotsCache;
    private redirectCount;
    constructor(config?: ScraperConfig);
    /**
     * 爬取单个URL - 增强版，带完整错误处理
     */
    scrape(urlStr: string): Promise<ScrapeResult>;
    /**
     * 批量爬取 - 增强版
     */
    scrapeBatch(urls: string[]): Promise<ScrapeResult[]>;
    /**
     * 爬取小说章节内容 - 增强版
     */
    scrapeNovelChapter(urlStr: string): Promise<{
        success: boolean;
        data?: {
            title: string;
            content: string;
            chapterNumber?: number;
            nextChapterUrl?: string;
            prevChapterUrl?: string;
            allChapters?: string[];
        };
        error?: ScraperError;
    }>;
    /**
     * 爬取整本书（自动遍历章节）
     */
    scrapeNovelBook(startUrl: string, maxChapters?: number): Promise<{
        success: boolean;
        chapters?: Array<{
            title: string;
            content: string;
            chapterNumber: number;
            url: string;
        }>;
        error?: ScraperError;
    }>;
    /**
     * 验证URL
     */
    private validateUrl;
    /**
     * 检查域名是否被阻止
     */
    private isDomainBlocked;
    /**
     * 检查robots.txt
     */
    private checkRobotsTxt;
    /**
     * 获取robots.txt内容
     */
    private fetchRobotsTxt;
    /**
     * 解析robots.txt
     */
    private parseRobotsTxt;
    /**
     * 检查URL是否被robots.txt允许
     */
    private isUrlAllowedByRobots;
    /**
     * 检查速率限制
     */
    private checkRateLimit;
    /**
     * 获取缓存
     */
    private getCached;
    /**
     * 缓存内容
     */
    private cacheContent;
    /**
     * URL哈希
     */
    private hashUrl;
    /**
     * 创建信号量
     */
    private createSemaphore;
    /**
     * 实际执行爬取 - 增强版
     */
    private doScrape;
    /**
     * 提取正文内容（增强版）
     */
    extractMainContent(html: string): string;
    /**
     * 提取标题
     */
    extractTitle(html: string): string;
    /**
     * 提取元数据
     */
    private extractMetadata;
    /**
     * 提取链接（增强版）
     */
    extractLinks(html: string, baseUrl: string): string[];
    /**
     * 提取图片
     */
    extractImages(html: string, baseUrl: string): string[];
    /**
     * 判断是否是章节链接
     */
    private isChapterLink;
    /**
     * 解析数字（支持中文和阿拉伯数字）
     */
    private parseNumber;
    /**
     * 解析URL
     */
    private resolveUrl;
    /**
     * 延迟
     */
    private delay;
    /**
     * 创建错误对象
     */
    private createError;
    /**
     * 清除访问记录
     */
    clearVisited(): void;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        visitedCount: number;
        cacheCount: number;
        robotsCacheCount: number;
    };
}
export default WebScraper;
//# sourceMappingURL=WebScraper.d.ts.map