/**
 * Web Scraper - 网页内容爬取和分析模块
 * 支持爬取小说网站、新闻网站等内容
 */

import * as https from 'https';
import * as http from 'http';
import * as url from 'url';

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

export class WebScraper {
  private config: Required<ScraperConfig>;
  private visitedUrls: Set<string> = new Set();

  constructor(config?: ScraperConfig) {
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
  async scrape(urlStr: string): Promise<ScrapedContent> {
    if (this.visitedUrls.has(urlStr)) {
      throw new Error('URL already scraped');
    }

    this.visitedUrls.add(urlStr);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await this.delay(this.config.delay * attempt);
        }
        const content = await this.doScrape(urlStr);
        return content;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Scrape attempt ${attempt + 1} failed:`, (error as Error).message);
      }
    }

    throw new Error(`Failed to scrape ${urlStr} after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * 批量爬取
   */
  async scrapeBatch(urls: string[]): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];
    for (const urlStr of urls) {
      try {
        const content = await this.scrape(urlStr);
        results.push(content);
        await this.delay(this.config.delay);
      } catch (error) {
        console.error(`Failed to scrape ${urlStr}:`, (error as Error).message);
      }
    }
    return results;
  }

  /**
   * 爬取小说章节内容
   */
  async scrapeNovelChapter(urlStr: string): Promise<{
    title: string;
    content: string;
    chapterNumber?: number;
    nextChapterUrl?: string;
    prevChapterUrl?: string;
  }> {
    const scraped = await this.scrape(urlStr);
    
    // 尝试提取章节号
    const chapterMatch = scraped.title.match(/第[零一二三四五六七八九十百千万\d]+章/);
    let chapterNumber: number | undefined;
    if (chapterMatch) {
      const numStr = chapterMatch[0].replace(/[第章]/g, '');
      chapterNumber = this.parseChineseNumber(numStr);
    }

    // 查找下一章/上一章链接
    let nextChapterUrl: string | undefined;
    let prevChapterUrl: string | undefined;
    for (const link of scraped.links) {
      if (/下一章|next/i.test(link)) {
        nextChapterUrl = this.resolveUrl(urlStr, link);
      } else if (/上一章|prev/i.test(link)) {
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
  extractMainContent(html: string): string {
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
  extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return 'Untitled';
  }

  /**
   * 提取链接
   */
  extractLinks(html: string, baseUrl: string): string[] {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const links: string[] = [];
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
  extractImages(html: string, baseUrl: string): string[] {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
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
  private parseChineseNumber(str: string): number | undefined {
    const chineseNums: Record<string, number> = {
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
        } else {
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
  private resolveUrl(base: string, relative: string): string | null {
    try {
      const resolved = new url.URL(relative, base);
      return resolved.href;
    } catch {
      return null;
    }
  }

  /**
   * 实际执行爬取
   */
  private async doScrape(urlStr: string): Promise<ScrapedContent> {
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
          } catch (error) {
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
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清除访问记录
   */
  clearVisited(): void {
    this.visitedUrls.clear();
  }
}

export default WebScraper;
