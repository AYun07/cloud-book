/**
 * Web Scraper - 网页内容爬取和分析模块
 * 支持爬取小说网站、新闻网站等内容
 * 增强版：完善的错误处理和防御机制
 */

import * as https from 'https';
import * as http from 'http';
import * as url from 'url';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

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

export enum ScraperErrorType {
  TIMEOUT = 'TIMEOUT',
  HTTP_ERROR = 'HTTP_ERROR',
  REDIRECT_LIMIT = 'REDIRECT_LIMIT',
  ROBOTS_BLOCKED = 'ROBOTS_BLOCKED',
  DOMAIN_BLOCKED = 'DOMAIN_BLOCKED',
  INVALID_URL = 'INVALID_URL',
  CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE',
  INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
  PARSE_ERROR = 'PARSE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN'
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

export class WebScraper {
  private config: Required<ScraperConfig>;
  private visitedUrls: Set<string> = new Set();
  private cache: Map<string, { content: ScrapedContent; timestamp: number }> = new Map();
  private requestTimestamps: Map<string, number[]> = new Map();
  private robotsCache: Map<string, { rules: string[]; timestamp: number }> = new Map();
  private redirectCount: Map<string, number> = new Map();

  constructor(config?: ScraperConfig) {
    this.config = {
      userAgent: config?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CloudBookBot/1.0',
      timeout: config?.timeout || 30000,
      maxRetries: config?.maxRetries || 3,
      followRedirects: config?.followRedirects !== false,
      maxRedirects: config?.maxRedirects || 10,
      respectRobotsTxt: config?.respectRobotsTxt !== false,
      delay: config?.delay || 1000,
      maxContentLength: config?.maxContentLength || 10 * 1024 * 1024,
      allowedContentTypes: config?.allowedContentTypes || ['text/html', 'application/xhtml+xml'],
      blockedDomains: config?.blockedDomains || [],
      enableCache: config?.enableCache !== false,
      cacheTTL: config?.cacheTTL || 3600000
    };
  }

  /**
   * 爬取单个URL - 增强版，带完整错误处理
   */
  async scrape(urlStr: string): Promise<ScrapeResult> {
    try {
      // 1. 验证URL
      const validation = this.validateUrl(urlStr);
      if (!validation.valid) {
        return {
          success: false,
          error: this.createError(ScraperErrorType.INVALID_URL, urlStr, undefined, validation.reason)
        };
      }

      // 2. 检查域名黑名单
      if (this.isDomainBlocked(urlStr)) {
        return {
          success: false,
          error: this.createError(ScraperErrorType.DOMAIN_BLOCKED, urlStr)
        };
      }

      // 3. 检查重复访问
      if (this.visitedUrls.has(urlStr)) {
        return {
          success: false,
          error: this.createError(ScraperErrorType.PARSE_ERROR, urlStr, undefined, 'URL already scraped')
        };
      }

      // 4. 检查robots.txt
      if (this.config.respectRobotsTxt) {
        const robotsAllowed = await this.checkRobotsTxt(urlStr);
        if (!robotsAllowed) {
          return {
            success: false,
            error: this.createError(ScraperErrorType.ROBOTS_BLOCKED, urlStr)
          };
        }
      }

      // 5. 检查速率限制
      if (!this.checkRateLimit(urlStr)) {
        await this.delay(this.config.delay * 2);
      }

      // 6. 检查缓存
      const cached = this.getCached(urlStr);
      if (cached) {
        return { success: true, data: cached };
      }

      // 7. 执行爬取（带重试）
      this.visitedUrls.add(urlStr);
      let lastError: ScraperError | null = null;

      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const backoffDelay = this.config.delay * Math.pow(2, attempt);
            console.info(`Retrying ${urlStr} (attempt ${attempt + 1}) after ${backoffDelay}ms`);
            await this.delay(backoffDelay);
          }

          const content = await this.doScrape(urlStr);
          this.cacheContent(urlStr, content);
          return { success: true, data: content };
        } catch (error) {
          const scraperError = error as ScraperError;
          lastError = scraperError;
          console.warn(`Scrape attempt ${attempt + 1} for ${urlStr} failed: ${scraperError.type} - ${scraperError.message}`);

          // 如果是速率限制错误，等待更长时间
          if (scraperError.type === ScraperErrorType.RATE_LIMITED) {
            await this.delay(5000 * (attempt + 1));
          }
        }
      }

      return {
        success: false,
        error: this.createError(
          lastError?.type || ScraperErrorType.UNKNOWN,
          urlStr,
          undefined,
          lastError?.message || `Failed after ${this.config.maxRetries} attempts`
        )
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          ScraperErrorType.UNKNOWN,
          urlStr,
          undefined,
          (error as Error).message
        )
      };
    }
  }

  /**
   * 批量爬取 - 增强版
   */
  async scrapeBatch(urls: string[]): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    const semaphore = this.createSemaphore(3);

    for (const urlStr of urls) {
      await semaphore.acquire();
      try {
        const result = await this.scrape(urlStr);
        results.push(result);
        await this.delay(this.config.delay);
      } finally {
        semaphore.release();
      }
    }

    return results;
  }

  /**
   * 爬取小说章节内容 - 增强版
   */
  async scrapeNovelChapter(urlStr: string): Promise<{
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
  }> {
    const result = await this.scrape(urlStr);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const scraped = result.data;
    
    // 尝试提取章节号（支持多种格式）
    let chapterNumber: number | undefined;
    const chapterPatterns = [
      /第([零一二三四五六七八九十百千万\d]+)章/i,
      /Chapter\s*(\d+)/i,
      /章节\s*(\d+)/i,
      /(\d+)\s*章/i
    ];
    
    for (const pattern of chapterPatterns) {
      const match = scraped.title.match(pattern);
      if (match) {
        chapterNumber = this.parseNumber(match[1]);
        if (chapterNumber) break;
      }
    }

    // 查找下一章/上一章链接（增强版）
    let nextChapterUrl: string | undefined;
    let prevChapterUrl: string | undefined;
    const allChapters: string[] = [];

    for (const link of scraped.links) {
      const linkLower = link.toLowerCase();
      const resolvedLink = this.resolveUrl(urlStr, link);
      
      if (resolvedLink) {
        // 收集所有章节链接
        if (this.isChapterLink(link)) {
          allChapters.push(resolvedLink);
        }
        
        // 识别下一章
        if (/下一章|next.*chapter|next.*page|››|»|下一页/i.test(linkLower)) {
          nextChapterUrl = resolvedLink;
        }
        // 识别上一章
        else if (/上一章|prev.*chapter|prev.*page|‹‹|«|上一页/i.test(linkLower)) {
          prevChapterUrl = resolvedLink;
        }
      }
    }

    return {
      success: true,
      data: {
        title: scraped.title,
        content: scraped.content,
        chapterNumber,
        nextChapterUrl,
        prevChapterUrl,
        allChapters: allChapters.length > 0 ? allChapters : undefined
      }
    };
  }

  /**
   * 爬取整本书（自动遍历章节）
   */
  async scrapeNovelBook(startUrl: string, maxChapters: number = 100): Promise<{
    success: boolean;
    chapters?: Array<{
      title: string;
      content: string;
      chapterNumber: number;
      url: string;
    }>;
    error?: ScraperError;
  }> {
    const chapters: Array<{
      title: string;
      content: string;
      chapterNumber: number;
      url: string;
    }> = [];
    
    let currentUrl = startUrl;
    let chapterCount = 0;
    let lastChapterNumber = 0;

    while (currentUrl && chapterCount < maxChapters) {
      const result = await this.scrapeNovelChapter(currentUrl);
      
      if (!result.success) {
        console.warn(`Failed to scrape chapter at ${currentUrl}:`, result.error?.message);
        break;
      }

      if (result.data) {
        const chapterNum = result.data.chapterNumber || ++lastChapterNumber;
        lastChapterNumber = chapterNum;
        
        chapters.push({
          title: result.data.title,
          content: result.data.content,
          chapterNumber: chapterNum,
          url: currentUrl
        });
        
        chapterCount++;
        
        // 使用下一章链接，或者从章节列表中选择下一个
        if (result.data.nextChapterUrl) {
          currentUrl = result.data.nextChapterUrl;
        } else if (result.data.allChapters && result.data.allChapters.length > chapterCount) {
          currentUrl = result.data.allChapters[chapterCount];
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      success: chapters.length > 0,
      chapters: chapters.length > 0 ? chapters : undefined,
      error: chapters.length === 0 ? this.createError(ScraperErrorType.PARSE_ERROR, startUrl, undefined, 'No chapters found') : undefined
    };
  }

  /**
   * 验证URL
   */
  private validateUrl(urlStr: string): { valid: boolean; reason?: string } {
    try {
      const parsed = new url.URL(urlStr);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'Only HTTP/HTTPS protocols are supported' };
      }
      if (!parsed.hostname) {
        return { valid: false, reason: 'Invalid hostname' };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  /**
   * 检查域名是否被阻止
   */
  private isDomainBlocked(urlStr: string): boolean {
    try {
      const parsed = new url.URL(urlStr);
      return this.config.blockedDomains.some(
        domain => parsed.hostname.includes(domain)
      );
    } catch {
      return true;
    }
  }

  /**
   * 检查robots.txt
   */
  private async checkRobotsTxt(urlStr: string): Promise<boolean> {
    try {
      const parsed = new url.URL(urlStr);
      const robotsUrl = `${parsed.protocol}//${parsed.hostname}/robots.txt`;
      
      // 检查缓存
      const cached = this.robotsCache.get(robotsUrl);
      if (cached && Date.now() - cached.timestamp < 3600000) {
        return this.isUrlAllowedByRobots(cached.rules, urlStr);
      }

      // 抓取robots.txt
      const result = await this.fetchRobotsTxt(robotsUrl);
      if (result) {
        const rules = this.parseRobotsTxt(result);
        this.robotsCache.set(robotsUrl, { rules, timestamp: Date.now() });
        return this.isUrlAllowedByRobots(rules, urlStr);
      }

      return true;
    } catch {
      return true;
    }
  }

  /**
   * 获取robots.txt内容
   */
  private async fetchRobotsTxt(urlStr: string): Promise<string | null> {
    return new Promise((resolve) => {
      const parsed = new url.URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsed.hostname,
        path: '/robots.txt',
        method: 'GET',
        timeout: 5000
      };

      const req = client.request(options, (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve(data); });
      });

      req.on('error', () => { resolve(null); });
      req.setTimeout(5000, () => { resolve(null); });
      req.end();
    });
  }

  /**
   * 解析robots.txt
   */
  private parseRobotsTxt(content: string): string[] {
    const rules: string[] = [];
    const lines = content.split('\n');
    
    let allowAll = false;
    let currentAgent = '*';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.toLowerCase().startsWith('user-agent:')) {
        currentAgent = trimmed.split(':')[1].trim();
      } else if (currentAgent === '*' || currentAgent === 'CloudBookBot') {
        if (trimmed.toLowerCase().startsWith('disallow:')) {
          const path = trimmed.split(':')[1].trim();
          if (path) rules.push(path);
        } else if (trimmed.toLowerCase().startsWith('allow:')) {
          const path = trimmed.split(':')[1].trim();
          if (!path || path === '/') allowAll = true;
        }
      }
    }

    return allowAll ? [] : rules;
  }

  /**
   * 检查URL是否被robots.txt允许
   */
  private isUrlAllowedByRobots(rules: string[], urlStr: string): boolean {
    try {
      const parsed = new url.URL(urlStr);
      const path = parsed.pathname;

      for (const rule of rules) {
        if (path.startsWith(rule.replace('*', '')) || 
            path.match(new RegExp(rule.replace('*', '.*')))) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * 检查速率限制
   */
  private checkRateLimit(urlStr: string): boolean {
    const parsed = new url.URL(urlStr);
    const host = parsed.hostname;
    
    const timestamps = this.requestTimestamps.get(host) || [];
    const now = Date.now();
    
    // 保留最近1分钟内的请求
    const recentTimestamps = timestamps.filter(t => now - t < 60000);
    
    if (recentTimestamps.length >= 10) {
      return false;
    }
    
    recentTimestamps.push(now);
    this.requestTimestamps.set(host, recentTimestamps);
    return true;
  }

  /**
   * 获取缓存
   */
  private getCached(urlStr: string): ScrapedContent | undefined {
    if (!this.config.enableCache) return undefined;
    
    const cached = this.cache.get(this.hashUrl(urlStr));
    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
      return cached.content;
    }
    return undefined;
  }

  /**
   * 缓存内容
   */
  private cacheContent(urlStr: string, content: ScrapedContent): void {
    if (this.config.enableCache) {
      this.cache.set(this.hashUrl(urlStr), {
        content,
        timestamp: Date.now()
      });
    }
  }

  /**
   * URL哈希
   */
  private hashUrl(urlStr: string): string {
    return crypto.createHash('md5').update(urlStr).digest('hex');
  }

  /**
   * 创建信号量
   */
  private createSemaphore(limit: number) {
    let count = 0;
    const waiting: Array<() => void> = [];

    return {
      acquire: () => new Promise<void>((resolve) => {
        if (count < limit) {
          count++;
          resolve();
        } else {
          waiting.push(resolve);
        }
      }),
      release: () => {
        count--;
        if (waiting.length > 0) {
          const next = waiting.shift();
          if (next) next();
        }
      }
    };
  }

  /**
   * 实际执行爬取 - 增强版
   */
  private async doScrape(urlStr: string): Promise<ScrapedContent> {
    return new Promise((resolve, reject) => {
      const parsed = new url.URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const options: http.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        },
        timeout: this.config.timeout
      };

      let redirectCount = this.redirectCount.get(urlStr) || 0;

      const req = client.request(options, (res) => {
        // 处理重定向
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          redirectCount++;
          this.redirectCount.set(urlStr, redirectCount);

          if (redirectCount > this.config.maxRedirects) {
            reject(this.createError(ScraperErrorType.REDIRECT_LIMIT, urlStr, res.statusCode));
            return;
          }

          if (this.config.followRedirects) {
            const newUrl = this.resolveUrl(urlStr, res.headers.location);
            if (newUrl) {
              this.doScrape(newUrl).then(resolve).catch(reject);
            } else {
              reject(this.createError(ScraperErrorType.INVALID_URL, urlStr));
            }
            return;
          }
        }

        // 处理HTTP错误
        if (res.statusCode && res.statusCode >= 400) {
          const errorType = res.statusCode === 429 ? ScraperErrorType.RATE_LIMITED : ScraperErrorType.HTTP_ERROR;
          reject(this.createError(errorType, urlStr, res.statusCode));
          return;
        }

        // 检查内容类型
        const contentType = res.headers['content-type'] || '';
        if (!this.config.allowedContentTypes.some(allowed => 
          contentType.toLowerCase().includes(allowed.toLowerCase())
        )) {
          reject(this.createError(ScraperErrorType.INVALID_CONTENT_TYPE, urlStr, undefined, `Content-Type: ${contentType}`));
          return;
        }

        // 获取字符编码
        const charsetMatch = contentType.match(/charset=([^;]+)/);
        const charset = charsetMatch ? charsetMatch[1].toUpperCase() : 'UTF-8';

        // 处理压缩
        let decompressStream: NodeJS.ReadableStream = res;
        const contentEncoding = res.headers['content-encoding'];
        if (contentEncoding === 'gzip') {
          decompressStream = res.pipe(zlib.createGunzip());
        } else if (contentEncoding === 'deflate') {
          decompressStream = res.pipe(zlib.createInflate());
        }

        let data = '';
        let contentLength = 0;

        decompressStream.on('data', (chunk) => {
          contentLength += chunk.length;
          if (contentLength > this.config.maxContentLength) {
            reject(this.createError(ScraperErrorType.CONTENT_TOO_LARGE, urlStr));
            return;
          }
          data += chunk.toString(charset === 'UTF-8' ? 'utf8' : 'binary');
        });

        decompressStream.on('end', () => {
          try {
            const title = this.extractTitle(data);
            const content = this.extractMainContent(data);
            const links = this.extractLinks(data, urlStr);
            const images = this.extractImages(data, urlStr);
            const metadata = this.extractMetadata(data);

            resolve({
              url: urlStr,
              title,
              content,
              metadata: {
                ...metadata,
                wordCount: content.length,
                source: parsed.hostname,
                charset,
                contentType
              },
              links,
              images,
              scrapedAt: new Date(),
              statusCode: res.statusCode
            });
          } catch (error) {
            reject(this.createError(ScraperErrorType.PARSE_ERROR, urlStr, undefined, (error as Error).message));
          }
        });

        decompressStream.on('error', (error) => {
          reject(this.createError(ScraperErrorType.NETWORK_ERROR, urlStr, undefined, error.message));
        });
      });

      req.on('error', (error) => {
        const errorType = (error as any).code === 'ETIMEDOUT' ? 
          ScraperErrorType.TIMEOUT : ScraperErrorType.NETWORK_ERROR;
        reject(this.createError(errorType, urlStr, undefined, error.message));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(this.createError(ScraperErrorType.TIMEOUT, urlStr));
      });

      req.end();
    });
  }

  /**
   * 提取正文内容（增强版）
   */
  extractMainContent(html: string): string {
    let content = html;

    // 移除脚本和样式
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    content = content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // 移除广告和导航常见标签
    content = content.replace(/<div[^>]*class=["']?.*(ad|advertisement|nav|header|footer|sidebar).*["']?[\s\S]*?<\/div>/gi, '');
    content = content.replace(/<div[^>]*id=["']?.*(ad|advert|nav|header|footer).*["']?[\s\S]*?<\/div>/gi, '');

    // 移除HTML标签，保留换行
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<p[^>]*>/gi, '\n\n');
    content = content.replace(/<\/p>/gi, '');
    content = content.replace(/<[^>]+>/g, ' ');

    // 处理中文标点周围的空格
    content = content.replace(/\s*([，。！？、；：])\s*/g, '$1');
    content = content.replace(/\s*([（\(])\s*/g, '$1');
    content = content.replace(/\s*([）\)])\s*/g, '$1');

    // 压缩空白
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/[ \t]+/g, ' ');
    content = content.trim();

    // 尝试找到最长的连续文本块（增强版）
    const paragraphs = content.split(/\n\n+/);
    if (paragraphs.length > 1) {
      // 过滤太短的段落
      const validParagraphs = paragraphs.filter(p => p.length > 30);
      
      if (validParagraphs.length > 0) {
        // 找到最长的段落作为主要内容
        const longest = validParagraphs.reduce((a, b) => a.length > b.length ? a : b);
        
        // 如果最长段落超过总长度的50%，可能是主要内容
        if (longest.length > content.length * 0.5) {
          // 尝试找到相关的上下文段落
          const index = paragraphs.indexOf(longest);
          const context: string[] = [];
          
          for (let i = Math.max(0, index - 2); i <= Math.min(paragraphs.length - 1, index + 2); i++) {
            if (paragraphs[i].length > 50) {
              context.push(paragraphs[i]);
            }
          }
          
          return context.join('\n\n');
        }
      }
    }

    return content;
  }

  /**
   * 提取标题
   */
  extractTitle(html: string): string {
    // 尝试从meta标签获取标题
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogTitle) return ogTitle[1].trim();

    const twitterTitle = html.match(/<meta[^>]*property=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (twitterTitle) return twitterTitle[1].trim();

    const metaTitle = html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (metaTitle) return metaTitle[1].trim();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      // 移除常见的网站后缀
      return title.replace(/[_-]\s*(小说|阅读|全文|最新|无弹窗)/gi, '').trim();
    }

    return 'Untitled';
  }

  /**
   * 提取元数据
   */
  private extractMetadata(html: string): Partial<ScrapedContent['metadata']> {
    const metadata: Partial<ScrapedContent['metadata']> = {};

    // 提取作者
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (authorMatch) metadata.author = authorMatch[1].trim();

    // 提取发布日期
    const dateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (dateMatch) {
      try {
        metadata.publishDate = new Date(dateMatch[1]);
      } catch {}
    }

    // 提取标签
    const tagsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
    }

    return metadata;
  }

  /**
   * 提取链接（增强版）
   */
  extractLinks(html: string, baseUrl: string): string[] {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const links: string[] = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2];
      const resolved = this.resolveUrl(baseUrl, href);
      
      if (resolved && !links.includes(resolved)) {
        // 过滤常见的非内容链接
        const hrefLower = href.toLowerCase();
        if (!hrefLower.includes('javascript:') && 
            !hrefLower.includes('mailto:') &&
            !hrefLower.includes('tel:') &&
            !hrefLower.startsWith('#')) {
          links.push(resolved);
        }
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
        // 过滤小图标
        if (!resolved.toLowerCase().includes('favicon') &&
            !resolved.toLowerCase().includes('logo') &&
            !resolved.toLowerCase().includes('icon')) {
          images.push(resolved);
        }
      }
    }
    
    return images;
  }

  /**
   * 判断是否是章节链接
   */
  private isChapterLink(linkText: string): boolean {
    const patterns = [
      /第[零一二三四五六七八九十百千万\d]+章/i,
      /Chapter\s*\d+/i,
      /章节\s*\d+/i,
      /^\s*\d+\s*$/
    ];
    return patterns.some(p => p.test(linkText));
  }

  /**
   * 解析数字（支持中文和阿拉伯数字）
   */
  private parseNumber(str: string): number | undefined {
    const chineseNums: Record<string, number> = {
      '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
      '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
      '十': 10, '百': 100, '千': 1000, '万': 10000,
      '两': 2
    };

    // 纯数字
    if (/^\d+$/.test(str)) {
      const num = parseInt(str, 10);
      return isNaN(num) ? undefined : num;
    }

    // 中文数字
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
      } else if (!isNaN(parseInt(char))) {
        temp = parseInt(char);
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
      // 移除片段
      resolved.hash = '';
      return resolved.href;
    } catch {
      return null;
    }
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建错误对象
   */
  private createError(type: ScraperErrorType, url: string, statusCode?: number, details?: string): ScraperError {
    const messages: Record<ScraperErrorType, string> = {
      [ScraperErrorType.TIMEOUT]: 'Request timed out',
      [ScraperErrorType.HTTP_ERROR]: 'HTTP error',
      [ScraperErrorType.REDIRECT_LIMIT]: 'Too many redirects',
      [ScraperErrorType.ROBOTS_BLOCKED]: 'Blocked by robots.txt',
      [ScraperErrorType.DOMAIN_BLOCKED]: 'Domain is blocked',
      [ScraperErrorType.INVALID_URL]: 'Invalid URL',
      [ScraperErrorType.CONTENT_TOO_LARGE]: 'Content exceeds maximum allowed size',
      [ScraperErrorType.INVALID_CONTENT_TYPE]: 'Invalid content type',
      [ScraperErrorType.PARSE_ERROR]: 'Failed to parse content',
      [ScraperErrorType.NETWORK_ERROR]: 'Network error',
      [ScraperErrorType.RATE_LIMITED]: 'Rate limited',
      [ScraperErrorType.UNKNOWN]: 'Unknown error'
    };

    const error = new Error(details || messages[type]) as ScraperError;
    error.type = type;
    error.url = url;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }

  /**
   * 清除访问记录
   */
  clearVisited(): void {
    this.visitedUrls.clear();
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.robotsCache.clear();
    this.requestTimestamps.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    visitedCount: number;
    cacheCount: number;
    robotsCacheCount: number;
  } {
    return {
      visitedCount: this.visitedUrls.size,
      cacheCount: this.cache.size,
      robotsCacheCount: this.robotsCache.size
    };
  }
}

export default WebScraper;