/**
 * Web Scraper - 网页内容爬取和分析模块
 * 支持爬取小说网站、新闻网站等内容
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
    };
    links: string[];
    images: string[];
    scrapedAt: Date;
}
export interface ScraperConfig {
    userAgent?: string;
    timeout?: number;
    maxRetries?: number;
    followRedirects?: boolean;
    respectRobotsTxt?: boolean;
    delay?: number;
}
export declare class WebScraper {
    private config;
    private visitedUrls;
    constructor(config?: ScraperConfig);
    /**
     * 爬取单个URL
     */
    scrape(urlStr: string): Promise<ScrapedContent>;
    /**
     * 批量爬取
     */
    scrapeBatch(urls: string[]): Promise<ScrapedContent[]>;
    /**
     * 爬取小说章节内容
     */
    scrapeNovelChapter(urlStr: string): Promise<{
        title: string;
        content: string;
        chapterNumber?: number;
        nextChapterUrl?: string;
        prevChapterUrl?: string;
    }>;
    /**
     * 提取正文内容（去除广告、导航等）
     */
    extractMainContent(html: string): string;
    /**
     * 提取标题
     */
    extractTitle(html: string): string;
    /**
     * 提取链接
     */
    extractLinks(html: string, baseUrl: string): string[];
    /**
     * 提取图片
     */
    extractImages(html: string, baseUrl: string): string[];
    /**
     * 解析中文数字
     */
    private parseChineseNumber;
    /**
     * 解析URL
     */
    private resolveUrl;
    /**
     * 实际执行爬取
     */
    private doScrape;
    /**
     * 延迟
     */
    private delay;
    /**
     * 清除访问记录
     */
    clearVisited(): void;
}
export default WebScraper;
//# sourceMappingURL=WebScraper.d.ts.map