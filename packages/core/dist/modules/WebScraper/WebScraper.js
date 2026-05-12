"use strict";
/**
 * Web Scraper - 网页内容爬取和分析模块
 * 支持爬取小说网站、新闻网站等内容
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScraper = void 0;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const url = __importStar(require("url"));
class WebScraper {
    config;
    visitedUrls = new Set();
    constructor(config) {
        this.config = {
            userAgent: config?.userAgent || 'Mozilla/5.0 (compatible; CloudBookBot/1.0; +https://cloudbook.ai)',
            timeout: config?.timeout || 30000,
            maxRetries: config?.maxRetries || 3,
            followRedirects: config?.followRedirects !== false,
            respectRobotsTxt: config?.respectRobotsTxt !== false,
            delay: config?.delay || 1000
        };
    }
    /**
     * 爬取单个URL
     */
    async scrape(urlStr) {
        if (this.visitedUrls.has(urlStr)) {
            throw new Error('URL already scraped');
        }
        this.visitedUrls.add(urlStr);
        let lastError = null;
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    await this.delay(this.config.delay * attempt);
                }
                const content = await this.doScrape(urlStr);
                return content;
            }
            catch (error) {
                lastError = error;
                console.warn(`Scrape attempt ${attempt + 1} failed:`, error.message);
            }
        }
        throw new Error(`Failed to scrape ${urlStr} after ${this.config.maxRetries} attempts: ${lastError?.message}`);
    }
    /**
     * 批量爬取
     */
    async scrapeBatch(urls) {
        const results = [];
        for (const urlStr of urls) {
            try {
                const content = await this.scrape(urlStr);
                results.push(content);
                await this.delay(this.config.delay);
            }
            catch (error) {
                console.error(`Failed to scrape ${urlStr}:`, error.message);
            }
        }
        return results;
    }
    /**
     * 爬取小说章节内容
     */
    async scrapeNovelChapter(urlStr) {
        const scraped = await this.scrape(urlStr);
        // 尝试提取章节号
        const chapterMatch = scraped.title.match(/第[零一二三四五六七八九十百千万\d]+章/);
        let chapterNumber;
        if (chapterMatch) {
            const numStr = chapterMatch[0].replace(/[第章]/g, '');
            chapterNumber = this.parseChineseNumber(numStr);
        }
        // 查找下一章/上一章链接
        let nextChapterUrl;
        let prevChapterUrl;
        for (const link of scraped.links) {
            if (/下一章|next/i.test(link)) {
                nextChapterUrl = this.resolveUrl(urlStr, link);
            }
            else if (/上一章|prev/i.test(link)) {
                prevChapterUrl = this.resolveUrl(urlStr, link);
            }
        }
        return {
            title: scraped.title,
            content: scraped.content,
            chapterNumber,
            nextChapterUrl,
            prevChapterUrl
        };
    }
    /**
     * 提取正文内容（去除广告、导航等）
     */
    extractMainContent(html) {
        let content = html;
        // 移除 script 和 style 标签
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        // 移除 HTML 标签
        content = content.replace(/<[^>]+>/g, ' ');
        // 压缩空白
        content = content.replace(/\s+/g, ' ').trim();
        // 尝试找到最长的连续文本块
        const paragraphs = content.split(/\n\s*\n/);
        const mainParagraphs = paragraphs
            .filter(p => p.length > 100)
            .sort((a, b) => b.length - a.length)
            .slice(0, 10);
        return mainParagraphs.join('\n\n') || content;
    }
    /**
     * 提取标题
     */
    extractTitle(html) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
        return 'Untitled';
    }
    /**
     * 提取链接
     */
    extractLinks(html, baseUrl) {
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
        const links = [];
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1];
            const resolved = this.resolveUrl(baseUrl, href);
            if (resolved && !links.includes(resolved)) {
                links.push(resolved);
            }
        }
        return links;
    }
    /**
     * 提取图片
     */
    extractImages(html, baseUrl) {
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const images = [];
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            const src = match[1];
            const resolved = this.resolveUrl(baseUrl, src);
            if (resolved && !images.includes(resolved)) {
                images.push(resolved);
            }
        }
        return images;
    }
    /**
     * 解析中文数字
     */
    parseChineseNumber(str) {
        const chineseNums = {
            '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
            '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
            '十': 10, '百': 100, '千': 1000, '万': 10000
        };
        if (/^\d+$/.test(str)) {
            return parseInt(str, 10);
        }
        let result = 0;
        let temp = 0;
        for (const char of str) {
            if (chineseNums[char] !== undefined) {
                if (char === '十' || char === '百' || char === '千' || char === '万') {
                    temp = (temp || 1) * chineseNums[char];
                    result += temp;
                    temp = 0;
                }
                else {
                    temp = chineseNums[char];
                }
            }
        }
        result += temp;
        return result || undefined;
    }
    /**
     * 解析URL
     */
    resolveUrl(base, relative) {
        try {
            const resolved = new url.URL(relative, base);
            return resolved.href;
        }
        catch {
            return null;
        }
    }
    /**
     * 实际执行爬取
     */
    async doScrape(urlStr) {
        return new Promise((resolve, reject) => {
            const parsed = new url.URL(urlStr);
            const client = parsed.protocol === 'https:' ? https : http;
            const options = {
                hostname: parsed.hostname,
                port: parsed.port,
                path: parsed.pathname + parsed.search,
                method: 'GET',
                headers: {
                    'User-Agent': this.config.userAgent
                }
            };
            const timeoutId = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, this.config.timeout);
            const req = client.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    if (this.config.followRedirects) {
                        clearTimeout(timeoutId);
                        this.doScrape(res.headers.location).then(resolve).catch(reject);
                        return;
                    }
                }
                if (res.statusCode !== 200) {
                    clearTimeout(timeoutId);
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    clearTimeout(timeoutId);
                    try {
                        const title = this.extractTitle(data);
                        const content = this.extractMainContent(data);
                        const links = this.extractLinks(data, urlStr);
                        const images = this.extractImages(data, urlStr);
                        resolve({
                            url: urlStr,
                            title,
                            content,
                            metadata: {
                                wordCount: content.length,
                                source: parsed.hostname
                            },
                            links,
                            images,
                            scrapedAt: new Date()
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
            req.end();
        });
    }
    /**
     * 延迟
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 清除访问记录
     */
    clearVisited() {
        this.visitedUrls.clear();
    }
}
exports.WebScraper = WebScraper;
exports.default = WebScraper;
//# sourceMappingURL=WebScraper.js.map