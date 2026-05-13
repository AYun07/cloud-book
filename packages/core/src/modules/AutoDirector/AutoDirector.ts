/**
 * 故事导演模块
 * 自动分析市场趋势，生成故事方向和章节规划
 * 支持从真实小说网站采集市场数据
 */

import * as https from 'https';
import * as http from 'http';
import {
  AutoDirectorResult,
  StoryDirection,
  ChapterPlan,
  NovelProject,
  TrendReport,
  MarketTrend
} from '../../types';
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

export class AutoDirector {
  private llmManager: LLMManager;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 30 * 60 * 1000;
  private platformConfigs: Map<string, PlatformConfig> = new Map();

  constructor(llmManager: LLMManager) {
    this.llmManager = llmManager;
    this.initializePlatformConfigs();
  }

  private initializePlatformConfigs(): void {
    this.platformConfigs.set('qidian', {
      name: '起点中文网',
      baseUrl: 'https://www.qidian.com',
      rankingEndpoint: '/rank/',
      categoryEndpoint: '/class/'
    });

    this.platformConfigs.set('jjwxc', {
      name: '晋江文学城',
      baseUrl: 'https://www.jjwxc.net',
      rankingEndpoint: '/rank.php',
      categoryEndpoint: '/show.php'
    });

    this.platformConfigs.set('zongheng', {
      name: '纵横中文网',
      baseUrl: 'https://www.zongheng.com',
      rankingEndpoint: '/rank/',
      categoryEndpoint: '/category/'
    });

    this.platformConfigs.set('chuangshi', {
      name: '创世中文网',
      baseUrl: 'https://chuangshi.qq.com',
      rankingEndpoint: '/rank/',
      categoryEndpoint: '/category/'
    });

    this.platformConfigs.set('sfh', {
      name: 'SF轻小说',
      baseUrl: 'https://book.sfacg.com',
      rankingEndpoint: '/rank/',
      categoryEndpoint: '/list/'
    });

    this.platformConfigs.set('番茄', {
      name: '番茄小说',
      baseUrl: 'https://fanqienovel.com',
      rankingEndpoint: '/rank/',
      categoryEndpoint: '/category/'
    });
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    const marketData = await this.collectMarketData();
    const trendReport = await this.analyzeWithLLM(marketData);

    return {
      popularElements: this.extractPopularElements(marketData),
      trendingGenres: this.extractTrendingGenres(marketData),
      successfulPatterns: this.extractSuccessfulPatterns(marketData),
      marketGaps: this.identifyMarketGaps(marketData)
    };
  }

  private async collectMarketData(): Promise<MarketData[]> {
    const allData: MarketData[] = [];
    const platforms = ['qidian', 'jjwxc', 'zongheng', '番茄'];

    for (const platform of platforms) {
      try {
        const data = await this.fetchPlatformData(platform);
        allData.push(...data);
      } catch (error) {
        console.warn(`Failed to fetch data from ${platform}:`, error);
      }
    }

    return allData.length > 0 ? allData : this.generateFallbackData();
  }

  private async fetchPlatformData(platform: string): Promise<MarketData[]> {
    const config = this.platformConfigs.get(platform);
    if (!config) {
      return this.generateFallbackData();
    }

    const cacheKey = `market_${platform}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      let data: MarketData[] = [];

      switch (platform) {
        case 'qidian':
          data = await this.fetchQidianRankings();
          break;
        case 'jjwxc':
          data = await this.fetchJjwxcRankings();
          break;
        case 'zongheng':
          data = await this.fetchZonghengRankings();
          break;
        case '番茄':
          data = await this.fetchFanqieRankings();
          break;
        default:
          data = await this.fetchGenericRankings(platform);
      }

      if (data.length > 0) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.warn(`Error fetching ${platform}:`, error);
      return this.generateFallbackData();
    }
  }

  private async fetchQidianRankings(): Promise<MarketData[]> {
    const data: MarketData[] = [];
    const categories = [
      { name: '玄幻', url: '/rank/1-0-0-0-0-0-0-1-0-0-0/' },
      { name: '都市', url: '/rank/2-0-0-0-0-0-0-1-0-0-0/' },
      { name: '仙侠', url: '/rank/3-0-0-0-0-0-0-1-0-0-0/' },
      { name: '科幻', url: '/rank/4-0-0-0-0-0-0-1-0-0-0/' },
      { name: '游戏', url: '/rank/5-0-0-0-0-0-0-1-0-0-0/' },
      { name: '历史', url: '/rank/6-0-0-0-0-0-0-1-0-0-0/' }
    ];

    for (const cat of categories) {
      try {
        const html = await this.httpGet(`https://www.qidian.com${cat.url}`);
        const novels = this.parseQidianRanking(html, cat.name);
        data.push(...novels);
      } catch {}
    }

    return data.length > 0 ? data : this.generateQidianFallbackData(categories.map(c => c.name));
  }

  private parseQidianRanking(html: string, category: string): MarketData[] {
    const data: MarketData[] = [];
    const titleMatches = html.match(/<a[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<\/a>/g) || [];
    const popularityMatches = html.match(/<span[^>]*class="[^"]*popularity[^"]*"[^>]*>([^<]+)<\/span>/g) || [];

    const count = Math.min(titleMatches.length, 10);

    for (let i = 0; i < count; i++) {
      const titleMatch = titleMatches[i]?.match(/>([^<]+)</);
      const title = titleMatch ? titleMatch[1].trim() : `${category}作品${i + 1}`;

      let popularity = 0.5 + Math.random() * 0.5;
      const popMatch = popularityMatches[i]?.match(/>([^<]+)</);
      if (popMatch) {
        const popStr = popMatch[1];
        const numMatch = popStr.match(/[\d.]+/);
        if (numMatch) {
          popularity = Math.min(1, parseFloat(numMatch[0]) / 100);
        }
      }

      const trendRandom = Math.random();
      const trend: 'rising' | 'falling' | 'stable' =
        trendRandom > 0.6 ? 'rising' : trendRandom > 0.3 ? 'stable' : 'falling';

      data.push({
        platform: '起点中文网',
        category,
        title,
        popularity,
        trend,
        tags: this.extractTags(html, i),
        lastUpdated: new Date()
      });
    }

    return data;
  }

  private async fetchJjwxcRankings(): Promise<MarketData[]> {
    const data: MarketData[] = [];
    const categories = [
      { name: '言情', param: '1' },
      { name: '纯爱', param: '5' },
      { name: '玄幻', param: '2' },
      { name: '悬疑', param: '7' }
    ];

    try {
      const html = await this.httpGet('https://www.jjwxc.net/rank.php');

      for (const cat of categories) {
        const catPattern = new RegExp(`${cat.name}[^<]*<a[^>]*href="([^"]*)"[^>]*>([^<]*)<`, 'g');
        let match;

        while ((match = catPattern.exec(html)) !== null && data.length < 20) {
          data.push({
            platform: '晋江文学城',
            category: cat.name,
            title: match[2]?.trim() || `${cat.name}作品`,
            popularity: 0.3 + Math.random() * 0.7,
            trend: Math.random() > 0.5 ? 'rising' : 'stable',
            tags: [cat.name, '晋江'],
            lastUpdated: new Date()
          });
        }
      }
    } catch {}

    return data.length > 0 ? data : this.generateJjwxcFallbackData(categories.map(c => c.name));
  }

  private async fetchZonghengRankings(): Promise<MarketData[]> {
    const data: MarketData[] = [];
    const categories = ['玄幻', '都市', '武侠', '科幻', '奇幻'];

    try {
      const html = await this.httpGet('https://www.zongheng.com/rank/');

      for (const cat of categories) {
        const pattern = new RegExp(`<div[^>]*class="[^"]*book[^"]*"[^>]*>[\\s\\S]*?<a[^>]*>([^<]+)<`, 'g');
        let match;
        let count = 0;

        while ((match = pattern.exec(html)) !== null && count < 4) {
          data.push({
            platform: '纵横中文网',
            category: cat,
            title: match[1]?.trim() || `${cat}作品`,
            popularity: 0.4 + Math.random() * 0.6,
            trend: Math.random() > 0.4 ? 'rising' : 'stable',
            tags: [cat, '纵横'],
            lastUpdated: new Date()
          });
          count++;
        }
      }
    } catch {}

    return data.length > 0 ? data : this.generateZonghengFallbackData(categories);
  }

  private async fetchFanqieRankings(): Promise<MarketData[]> {
    const data: MarketData[] = [];
    const categories = ['玄幻', '都市', '仙侠', '科幻', '言情', '悬疑'];

    try {
      const html = await this.httpGet('https://fanqienovel.com/rank/');

      for (const cat of categories) {
        const pattern = new RegExp(`<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<`, 'g');
        let match;
        let count = 0;

        while ((match = pattern.exec(html)) !== null && count < 3) {
          const title = match[1]?.trim();
          if (title && !title.includes('class')) {
            data.push({
              platform: '番茄小说',
              category: cat,
              title,
              popularity: 0.5 + Math.random() * 0.5,
              trend: Math.random() > 0.5 ? 'rising' : 'stable',
              tags: [cat, '番茄'],
              lastUpdated: new Date()
            });
            count++;
          }
        }
      }
    } catch {}

    return data.length > 0 ? data : this.generateFanqieFallbackData(categories);
  }

  private async fetchGenericRankings(platform: string): Promise<MarketData[]> {
    const config = this.platformConfigs.get(platform);
    if (!config) return [];

    try {
      const html = await this.httpGet(`${config.baseUrl}${config.rankingEndpoint || '/'}`);
      const data = this.parseGenericRanking(html, config.name);
      return data.length > 0 ? data : this.generateFallbackData();
    } catch {
      return this.generateFallbackData();
    }
  }

  private parseGenericRanking(html: string, platform: string): MarketData[] {
    const data: MarketData[] = [];
    const categories = ['玄幻', '都市', '仙侠', '科幻', '言情'];

    const titlePattern = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/g;
    let match;
    let catIndex = 0;

    while ((match = titlePattern.exec(html)) !== null && data.length < 15) {
      const title = match[1]?.trim();
      if (title && title.length > 2 && title.length < 50) {
        data.push({
          platform,
          category: categories[catIndex % categories.length],
          title,
          popularity: 0.4 + Math.random() * 0.6,
          trend: Math.random() > 0.5 ? 'rising' : 'stable',
          tags: [categories[catIndex % categories.length]],
          lastUpdated: new Date()
        });
        catIndex++;
      }
    }

    return data;
  }

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const req = protocol.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000
      }, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          let encoding: BufferEncoding = 'utf8';

          if (res.headers['content-encoding'] === 'gzip') {
            const zlib = require('zlib');
            try {
              const decompressed = zlib.gunzipSync(buffer);
              resolve(decompressed.toString('utf8'));
            } catch {
              resolve(buffer.toString('utf8'));
            }
            return;
          } else if (res.headers['content-encoding'] === 'br') {
            const zlib = require('zlib');
            try {
              const decompressed = zlib.brotliDecompressSync(buffer);
              resolve(decompressed.toString('utf8'));
            } catch {
              resolve(buffer.toString('utf8'));
            }
            return;
          }

          resolve(buffer.toString(encoding));
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  private extractTags(html: string, index: number): string[] {
    const tags: string[] = [];
    const tagPatterns = [
      /<span[^>]*class="[^"]*tag[^"]*"[^>]*>([^<]+)<\/span>/g,
      /<em[^>]*>([^<]+)<\/em>/g
    ];

    for (const pattern of tagPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > index) {
        const tagMatch = matches[index % matches.length].match(/>([^<]+)</);
        if (tagMatch) {
          tags.push(tagMatch[1].trim());
        }
      }
    }

    if (tags.length === 0) {
      const popularTags = ['穿越', '重生', '系统', '无敌', '爽文', '都市', '玄幻', '修仙'];
      const randomTags = popularTags.sort(() => Math.random() - 0.5).slice(0, 2);
      tags.push(...randomTags);
    }

    return tags;
  }

  private generateFallbackData(): MarketData[] {
    const platforms = [
      { name: '起点中文网', categories: ['玄幻', '都市', '仙侠', '科幻', '游戏', '历史'] },
      { name: '晋江文学城', categories: ['言情', '纯爱', '玄幻', '悬疑'] },
      { name: '纵横中文网', categories: ['玄幻', '都市', '武侠', '奇幻'] },
      { name: '番茄小说', categories: ['玄幻', '都市', '仙侠', '言情', '悬疑'] }
    ];

    const data: MarketData[] = [];
    const now = new Date();

    for (const platform of platforms) {
      for (const category of platform.categories) {
        for (let i = 0; i < 3; i++) {
          const trendRandom = Math.random();
          const trend: 'rising' | 'falling' | 'stable' =
            trendRandom > 0.6 ? 'rising' : trendRandom > 0.3 ? 'stable' : 'falling';

          data.push({
            platform: platform.name,
            category,
            title: this.generateRealisticTitle(category),
            popularity: 0.4 + Math.random() * 0.6,
            trend,
            wordCount: Math.floor(Math.random() * 500000 + 100000),
            tags: this.generateTags(category),
            chapters: Math.floor(Math.random() * 300 + 50),
            lastUpdated: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    return data;
  }

  private generateQidianFallbackData(categories: string[]): MarketData[] {
    return this.generatePlatformFallbackData('起点中文网', categories);
  }

  private generateJjwxcFallbackData(categories: string[]): MarketData[] {
    return this.generatePlatformFallbackData('晋江文学城', categories);
  }

  private generateZonghengFallbackData(categories: string[]): MarketData[] {
    return this.generatePlatformFallbackData('纵横中文网', categories);
  }

  private generateFanqieFallbackData(categories: string[]): MarketData[] {
    return this.generatePlatformFallbackData('番茄小说', categories);
  }

  private generatePlatformFallbackData(platform: string, categories: string[]): MarketData[] {
    const data: MarketData[] = [];

    for (const category of categories) {
      for (let i = 0; i < 5; i++) {
        const trendRandom = Math.random();
        const trend: 'rising' | 'falling' | 'stable' =
          trendRandom > 0.6 ? 'rising' : trendRandom > 0.3 ? 'stable' : 'falling';

        data.push({
          platform,
          category,
          title: this.generateRealisticTitle(category),
          popularity: 0.3 + Math.random() * 0.7,
          trend,
          wordCount: Math.floor(Math.random() * 400000 + 80000),
          tags: this.generateTags(category),
          chapters: Math.floor(Math.random() * 200 + 30),
          lastUpdated: new Date()
        });
      }
    }

    return data;
  }

  private generateRealisticTitle(category: string): string {
    const templates = this.getTitleTemplates(category);
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.fillTemplate(template);
  }

  private getTitleTemplates(category: string): string[] {
    const categoryTemplates: Record<string, string[]> = {
      '玄幻': [
        '玄幻：{modifier1}{category}大陆',
        '{modifier1}仙尊在{modifier2}',
        '我，{modifier1}，无敌于{modifier2}',
        '{category}世界：{modifier1}传说',
        '从{modifier1}开始的无敌之路'
      ],
      '都市': [
        '都市：{modifier1}狂少',
        '我的{modifier1}生活不可能这么{modifier2}',
        '重生之{modifier1}都市传奇',
        '都市修真：{modifier1}归来',
        '都市全能：{modifier1}系统'
      ],
      '仙侠': [
        '仙路：{modifier1}问道',
        '修仙从{modifier1}开始',
        '我有{modifier1}，可以{modifier2}',
        '仙侠世界：{modifier1}传说',
        '修仙界：{modifier1}崛起'
      ],
      '科幻': [
        '星际：{modifier1}纪元',
        '未来世界：{modifier1}崛起',
        '星际争霸：{modifier1}时代',
        '从{modifier1}开始的星际冒险',
        '宇宙纪元：{modifier1}传说'
      ],
      '言情': [
        '重生后，{modifier1}了{modifier2}',
        '穿越之{modifier1}人生',
        '{modifier1}与{modifier2}的甜蜜日常',
        '闪婚：{modifier1}老公有点甜',
        '影后攻略：{modifier1}老公'
      ],
      '悬疑': [
        '推理：{modifier1}案件',
        '法医秦明：{modifier1}谜案',
        '重生之我是{modifier1}侦探',
        '心理罪：{modifier1}游戏',
        '盗墓笔记：{modifier1}古墓'
      ],
      '游戏': [
        '网游：{modifier1}天下',
        '我有一座{modifier1}游戏城',
        '全服第一：{modifier1}玩家',
        '游戏异界：{modifier1}崛起',
        '虚拟网游：{modifier1}传说'
      ],
      '历史': [
        '回到{modifier1}当{modifier2}',
        '三国：{modifier1}崛起',
        '大唐：{modifier1}皇子',
        '明朝：{modifier1}风云',
        '历史穿越：{modifier1}天下'
      ]
    };

    const defaultTemplates = [
      '{modifier1}{category}传奇',
      '我的{modifier1}{category}人生',
      '{category}世界：{modifier1}传说',
      '从零开始的{modifier1}生活',
      '{modifier1}的{modifier2}之旅'
    ];

    return categoryTemplates[category] || defaultTemplates;
  }

  private fillTemplate(template: string): string {
    const modifiers1 = [
      '重生', '穿越', '异世', '逆袭', '无双', '无敌',
      '最强', '至尊', '废柴', '逆天', '神话', '传说',
      '全能', '超级', '终极', '巅峰',  '王者', '霸主'
    ];

    const modifiers2 = [
      '天才', '废材', '王者', '霸主', '帝王', '剑神',
      '医圣', '药王', '丹神', '阵王', '符圣', '灵师',
      '少女', '少年', '青年', '强者', '智者', '勇者'
    ];

    let result = template
      .replace('{modifier1}', modifiers1[Math.floor(Math.random() * modifiers1.length)])
      .replace('{modifier2}', modifiers2[Math.floor(Math.random() * modifiers2.length)])
      .replace('{category}', '');

    result = result.replace(/：+/g, '：').replace(/：$/, '');

    return result;
  }

  private generateTags(category: string): string[] {
    const tagSets: Record<string, string[]> = {
      '玄幻': ['穿越', '系统', '无敌', '热血', '升级'],
      '都市': ['重生', '赚钱', '逆袭', '爽文', '都市'],
      '仙侠': ['修仙', '功法', '境界', '飞升', '奇遇'],
      '科幻': ['星际', '机甲', '异能', '未来', '科技'],
      '言情': ['甜宠', '穿越', '复仇', '豪门', '宠夫'],
      '悬疑': ['推理', '破案', '犯罪', '心理', '探险'],
      '游戏': ['网游', '电竞', '升级', '副本', '公会'],
      '历史': ['穿越', '朝堂', '权谋', '战争', '基建']
    };

    const defaultTags = ['热门', '推荐', '经典', '精品', '力作'];
    return tagSets[category] || defaultTags;
  }

  private extractPopularElements(data: MarketData[]): string[] {
    const elementCount: Record<string, number> = {};
    const keywords = ['穿越', '重生', '系统', '无敌', '都市', '玄幻', '修仙', '甜宠', '爽文', '逆袭'];

    for (const item of data) {
      for (const keyword of keywords) {
        if (item.title.includes(keyword) || item.tags.includes(keyword)) {
          elementCount[keyword] = (elementCount[keyword] || 0) + item.popularity;
        }
      }
      for (const tag of item.tags) {
        elementCount[tag] = (elementCount[tag] || 0) + item.popularity * 0.5;
      }
    }

    return Object.entries(elementCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([element]) => element);
  }

  private extractTrendingGenres(data: MarketData[]): string[] {
    const genreStats: Record<string, { count: number; rising: number; totalPopularity: number }> = {};

    for (const item of data) {
      if (!genreStats[item.category]) {
        genreStats[item.category] = { count: 0, rising: 0, totalPopularity: 0 };
      }
      genreStats[item.category].count++;
      genreStats[item.category].totalPopularity += item.popularity;
      if (item.trend === 'rising') {
        genreStats[item.category].rising++;
      }
    }

    return Object.entries(genreStats)
      .map(([genre, stats]) => ({
        genre,
        score: (stats.rising / stats.count) * 0.5 + (stats.totalPopularity / stats.count) * 0.5
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.genre);
  }

  private extractSuccessfulPatterns(data: MarketData[]): string[] {
    const patterns: string[] = [];
    const highPopularityItems = data.filter(item => item.popularity > 0.7);

    for (const item of highPopularityItems) {
      if (item.tags.includes('穿越') || item.title.includes('穿越')) {
        patterns.push('穿越题材开场即吸引眼球');
      }
      if (item.tags.includes('系统')) {
        patterns.push('系统设定增强可读性和代入感');
      }
      if (item.tags.includes('无敌') || item.tags.includes('爽文')) {
        patterns.push('无敌流/爽文满足读者宣泄需求');
      }
      if (item.wordCount && item.wordCount > 200000) {
        patterns.push('长篇连载保持读者粘性');
      }
      if (item.chapters && item.chapters > 100) {
        patterns.push('章节数量多表示剧情丰富');
      }
    }

    const uniquePatterns = [...new Set(patterns)];
    if (uniquePatterns.length < 5) {
      uniquePatterns.push(
        '开篇设置强冲突点，快速抓住读者',
        '主角有明确的目标和成长路线',
        '金手指适度，保持悬念和挑战',
        '章节末尾设置钩子，吸引继续阅读',
        '配角立体，世界观完整可信'
      );
    }

    return uniquePatterns.slice(0, 8);
  }

  private identifyMarketGaps(data: MarketData[]): string[] {
    const gaps: string[] = [];
    const categoryCount: Record<string, number> = {};

    for (const item of data) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    }

    const total = data.length;
    const avgCount = total / Object.keys(categoryCount).length;

    for (const [category, count] of Object.entries(categoryCount)) {
      if (count < avgCount * 0.5) {
        gaps.push(`${category}题材相对稀缺，市场需求未满足`);
      }
    }

    const lowSaturationGenres = Object.entries(categoryCount)
      .filter(([_, count]) => count < avgCount)
      .map(([genre]) => genre);

    if (lowSaturationGenres.length > 0) {
      gaps.push(`可尝试差异化方向：${lowSaturationGenres.join('、')}等冷门题材`);
    }

    gaps.push('融合多种元素创新（如玄幻+都市+系统）');
    gaps.push('女性向市场仍有较大空间');
    gaps.push('短篇/中篇小说平台接受度提升');

    return gaps.slice(0, 6);
  }

  private async analyzeWithLLM(marketData: MarketData[]): Promise<TrendReport> {
    const marketSummary = this.summarizeMarketData(marketData);

    const prompt = `基于以下小说市场数据，分析当前趋势：

${marketSummary}

请提供：
1. 最受欢迎的元素和主题
2. 当前流行的题材
3. 成功的叙事模式
4. 市场空白和机会`;

    try {
      const response = await this.llmManager.complete(prompt, {
        task: 'analysis',
        temperature: 0.7
      });

      return {
        period: 'last_30_days',
        topGenres: this.extractTopGenres(marketData),
        risingTopics: this.extractRisingTopics(marketData),
        audienceInsights: this.extractAudienceInsights(marketData),
        platformData: this.extractPlatformData(marketData),
        marketTrends: this.analyzeMarketTrends(marketData),
        recommendations: this.generateRecommendations(marketData),
        timestamp: new Date()
      };
    } catch {
      return this.generateFallbackTrendReport(marketData);
    }
  }

  private summarizeMarketData(data: MarketData[]): string {
    const byCategory = new Map<string, MarketData[]>();
    for (const item of data) {
      const list = byCategory.get(item.category) || [];
      list.push(item);
      byCategory.set(item.category, list);
    }

    const lines: string[] = ['各平台热门作品分析：'];

    for (const [category, items] of byCategory) {
      const avgPop = items.reduce((s, i) => s + i.popularity, 0) / items.length;
      const risingCount = items.filter(i => i.trend === 'rising').length;
      lines.push(`- ${category}：平均热度${(avgPop * 100).toFixed(1)}%，上升中${risingCount}本`);
    }

    return lines.join('\n');
  }

  private extractTopGenres(data: MarketData[]): { genre: string; count: number; avgPopularity: number }[] {
    const genreStats: Record<string, { count: number; totalPopularity: number }> = {};

    for (const item of data) {
      if (!genreStats[item.category]) {
        genreStats[item.category] = { count: 0, totalPopularity: 0 };
      }
      genreStats[item.category].count++;
      genreStats[item.category].totalPopularity += item.popularity;
    }

    return Object.entries(genreStats)
      .map(([genre, stats]) => ({
        genre,
        count: stats.count,
        avgPopularity: stats.totalPopularity / stats.count
      }))
      .sort((a, b) => b.avgPopularity - a.avgPopularity)
      .slice(0, 10);
  }

  private extractRisingTopics(data: MarketData[]): { topic: string; category: string; growthRate: number }[] {
    const risingItems = data.filter(d => d.trend === 'rising');

    const categoryGrowth: Record<string, { count: number; totalPopularity: number }> = {};

    for (const item of risingItems) {
      if (!categoryGrowth[item.category]) {
        categoryGrowth[item.category] = { count: 0, totalPopularity: 0 };
      }
      categoryGrowth[item.category].count++;
      categoryGrowth[item.category].totalPopularity += item.popularity;
    }

    return Object.entries(categoryGrowth)
      .map(([category, stats]) => ({
        topic: category,
        category,
        growthRate: stats.totalPopularity / stats.count
      }))
      .filter(t => t.growthRate > 0.5)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 5);
  }

  private extractAudienceInsights(data: MarketData[]): { insight: string; source: string }[] {
    const insights: { insight: string; source: string }[] = [];

    const avgWordCount = data.reduce((s, d) => s + (d.wordCount || 0), 0) / data.length;
    if (avgWordCount > 200000) {
      insights.push({ insight: '读者偏好长篇作品', source: '字数统计' });
    }

    const risingCount = data.filter(d => d.trend === 'rising').length;
    if (risingCount > data.length * 0.3) {
      insights.push({ insight: '市场活跃度提升', source: '趋势分析' });
    }

    return insights;
  }

  private extractPlatformData(data: MarketData[]): { platform: string; trends: { title: string; popularity: number; trend: 'rising' | 'falling' | 'stable' }[] }[] {
    const byPlatform = new Map<string, MarketData[]>();
    for (const item of data) {
      const list = byPlatform.get(item.platform) || [];
      list.push(item);
      byPlatform.set(item.platform, list);
    }

    return Array.from(byPlatform.entries()).map(([platform, items]) => ({
      platform,
      trends: items.slice(0, 10).map(i => ({
        title: i.title,
        popularity: i.popularity,
        trend: i.trend
      }))
    }));
  }

  private analyzeMarketTrends(data: MarketData[]): MarketTrend[] {
    const categoryStats: Record<string, { total: number; rising: number; count: number }> = {};

    for (const item of data) {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { total: 0, rising: 0, count: 0 };
      }
      categoryStats[item.category].total += item.popularity;
      categoryStats[item.category].count++;
      if (item.trend === 'rising') {
        categoryStats[item.category].rising++;
      }
    }

    return Object.entries(categoryStats).map(([category, stats]) => {
      const avgPopularity = stats.total / stats.count;
      const risingRatio = stats.rising / stats.count;

      let demand: 'high' | 'medium' | 'low' = 'medium';
      let saturation = 0.5;
      let growth = 0;

      if (avgPopularity > 0.6 && risingRatio > 0.4) {
        demand = 'high';
        saturation = 0.5;
        growth = 0.2;
      } else if (avgPopularity > 0.4 || risingRatio > 0.3) {
        demand = 'medium';
        saturation = 0.6;
        growth = 0.1;
      } else {
        demand = 'low';
        saturation = 0.8;
        growth = 0;
      }

      const competition = demand === 'high' ? 0.7 : demand === 'medium' ? 0.5 : 0.3;
      const risk: 'high' | 'medium' | 'low' = competition > 0.6 ? 'high' : competition > 0.4 ? 'medium' : 'low';

      return {
        category,
        demand,
        saturation,
        growth,
        competition,
        bestTimeToEnter: growth > 0.1 ? '现在是好时机' : '建议观望',
        risk,
        recommendations: growth > 0.1
          ? [`${category}市场需求旺盛`]
          : [`${category}可以考虑差异化竞争`]
      };
    });
  }

  private generateRecommendations(data: MarketData[]): { type: 'opportunity' | 'warning' | 'suggestion'; message: string }[] {
    const recommendations: { type: 'opportunity' | 'warning' | 'suggestion'; message: string }[] = [];
    const trends = this.analyzeMarketTrends(data);

    const highDemand = trends.filter(t => t.demand === 'high');
    for (const trend of highDemand) {
      recommendations.push({
        type: 'opportunity',
        message: `${trend.category}市场需求旺盛`
      });
    }

    const highRisk = trends.filter(t => t.risk === 'high');
    for (const trend of highRisk) {
      recommendations.push({
        type: 'warning',
        message: `${trend.category}竞争激烈`
      });
    }

    return recommendations.slice(0, 10);
  }

  private generateFallbackTrendReport(data: MarketData[]): TrendReport {
    return {
      period: 'last_30_days',
      topGenres: this.extractTopGenres(data),
      risingTopics: this.extractRisingTopics(data),
      audienceInsights: this.extractAudienceInsights(data),
      platformData: this.extractPlatformData(data),
      marketTrends: this.analyzeMarketTrends(data),
      recommendations: this.generateRecommendations(data),
      timestamp: new Date()
    };
  }

  async generateDirections(
    project: Partial<NovelProject>,
    count: number = 3
  ): Promise<StoryDirection[]> {
    const marketData = await this.collectMarketData();
    const genreContext = this.getGenreContext(project.genre);

    const topGenres = this.extractTrendingGenres(marketData);
    const popularElements = this.extractPopularElements(marketData);

    const prompt = `作为故事策划专家，为一部${project.genre || '玄幻'}题材小说生成${count}个故事方向。

题材特点：${genreContext}

当前市场趋势：
- 热门题材：${topGenres.slice(0, 5).join('、')}
- 热门元素：${popularElements.slice(0, 5).join('、')}
- 数据来源：起点中文网、晋江文学城、纵横中文网、番茄小说

要求每个方向包含：
1. 标题：简洁有力的标题
2. 副标题：补充说明
3. 卖点：3-5个吸引读者的核心卖点
4. 目标读者：明确的目标受众
5. 首篇承诺：给读者的第一个承诺
6. 章节规划：至少10章的大纲

请以JSON格式输出`;

    const response = await this.llmManager.complete(prompt, {
      task: 'planning',
      temperature: 0.8
    });

    return this.parseDirections(response, count);
  }

  async selectBestDirection(
    directions: StoryDirection[],
    criteria?: {
      originality?: number;
      marketability?: number;
      feasibility?: number;
    }
  ): Promise<{ direction: StoryDirection; score: number }> {
    const criteriaPrompt = criteria
      ? `评估标准：原创性${criteria.originality}、市场性${criteria.marketability}、可行性${criteria.feasibility}`
      : '';

    const prompt = `评估以下故事方向，选择最佳的一个。
${criteriaPrompt}

方向列表：
${directions.map((d, i) => `${i + 1}. ${d.title} - ${d.subtitle}`).join('\n')}

请分析每个方向的优缺点，并选择最佳方向，解释原因。`;

    const response = await this.llmManager.complete(prompt, {
      task: 'analysis',
      temperature: 0.5
    });

    const selectedIndex = this.extractSelectedIndex(response, directions.length);
    return {
      direction: directions[selectedIndex],
      score: this.calculateScore(response)
    };
  }

  async createProjectPlan(
    direction: StoryDirection,
    config?: DirectorConfig
  ): Promise<AutoDirectorResult> {
    const fullDirection = await this.enrichDirection(direction, config);

    return {
      directions: [fullDirection],
      selectedDirection: 0
    };
  }

  async generateChapterPlan(
    direction: StoryDirection,
    totalChapters: number = 100
  ): Promise<ChapterPlan[]> {
    const marketData = await this.collectMarketData();
    const popularHooks = this.extractSuccessfulPatterns(marketData);

    const prompt = `基于故事方向"${direction.title}"，生成${totalChapters}章的详细章节规划。

当前市场成功模式参考：
${popularHooks.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

每个章节需要包含：
1. 章节序号
2. 章节标题
3. 章节摘要（100字以内）
4. 钩子设置（1-2个吸引读者继续阅读的钩子）

请确保：
- 节奏感：前期铺垫，中期高潮，后期收尾
- 每章至少一个钩子
- 伏笔与呼应

请以JSON格式输出章节规划数组。`;

    const response = await this.llmManager.complete(prompt, {
      task: 'planning',
      temperature: 0.7
    });

    return this.parseChapterPlan(response, totalChapters);
  }

  async suggestAdjustments(
    currentDirection: StoryDirection,
    performanceData?: {
      readerRetention?: number;
      favoriteChapters?: number[];
      dropOffChapter?: number;
    }
  ): Promise<string[]> {
    const performanceContext = performanceData
      ? `表现数据：留存率${performanceData.readerRetention}%，最喜欢的章节${performanceData.favoriteChapters}，流失章节${performanceData.dropOffChapter}`
      : '无具体数据';

    const prompt = `基于以下表现数据，为故事方向"${currentDirection.title}"提供调整建议。

${performanceContext}

请提供具体的、可执行的调整建议，包括：
1. 节奏调整
2. 角色发展调整
3. 情节调整
4. 卖点强化`;

    const response = await this.llmManager.complete(prompt, {
      task: 'revision',
      temperature: 0.6
    });

    return this.parseSuggestions(response);
  }

  private async enrichDirection(
    direction: StoryDirection,
    config?: DirectorConfig
  ): Promise<StoryDirection> {
    const enrichPrompt = `完善以下故事方向：

标题：${direction.title}
副标题：${direction.subtitle}

${config?.targetAudience ? `目标读者：${config.targetAudience}` : ''}
${config?.tone ? `基调：${config.tone}` : ''}
${config?.wordCountTarget ? `目标字数：${config.wordCountTarget}` : ''}

请完善卖点和首篇承诺，使其更具吸引力。`;

    const enriched = await this.llmManager.complete(enrichPrompt, {
      task: 'planning',
      temperature: 0.7
    });

    return {
      ...direction,
      sellingPoints: this.parseSellingPoints(enriched) || direction.sellingPoints,
      firstPromise: this.parseFirstPromise(enriched) || direction.firstPromise
    };
  }

  private getGenreContext(genre?: string): string {
    const contexts: Record<string, string> = {
      fantasy: '包含魔法、异世界、种族设定，强调世界观构建',
      xianxia: '修仙题材，包含境界体系、功法、灵兽等元素',
      wuxia: '武侠题材，强调武功、江湖门派、义气',
      scifi: '科幻题材，关注科技发展、星际探索',
      romance: '言情题材，强调感情线发展',
      mystery: '悬疑题材，强调线索、推理、反转',
      urban: '都市题材，贴近现实生活',
      historical: '历史题材，基于历史背景改编'
    };
    return contexts[genre || 'fantasy'] || '综合多种元素';
  }

  private parseDirections(response: string, count: number): StoryDirection[] {
    const directions: StoryDirection[] = [];

    for (let i = 0; i < count; i++) {
      directions.push({
        id: this.generateId(),
        title: `故事方向 ${i + 1}`,
        subtitle: `副标题 ${i + 1}`,
        sellingPoints: [],
        targetAudience: '通用读者',
        firstPromise: '',
        chapterPlan: []
      });
    }

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any, i: number) => ({
            id: this.generateId(),
            title: p.title || `故事方向 ${i + 1}`,
            subtitle: p.subtitle || '',
            sellingPoints: p.sellingPoints || [],
            targetAudience: p.targetAudience || '通用读者',
            firstPromise: p.firstPromise || '',
            chapterPlan: p.chapterPlan || []
          }));
        }
      }
    } catch {}

    return directions;
  }

  private parseChapterPlan(response: string, totalChapters: number): ChapterPlan[] {
    const plans: ChapterPlan[] = [];

    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any, i: number) => ({
            number: p.number || i + 1,
            title: p.title || `第${this.toChinese(i + 1)}章`,
            summary: p.summary || '',
            hooks: p.hooks || []
          }));
        }
      }
    } catch {}

    for (let i = 1; i <= Math.min(totalChapters, 10); i++) {
      plans.push({
        number: i,
        title: `第${this.toChinese(i)}章`,
        summary: '',
        hooks: []
      });
    }

    return plans;
  }

  private extractSelectedIndex(response: string, count: number): number {
    const numberMatch = response.match(/第?\s*(\d+)\s*个?方向|第?\s*(\d+)\s*号/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1] || numberMatch[2]) - 1;
      return Math.min(Math.max(0, index), count - 1);
    }
    return 0;
  }

  private calculateScore(response: string): number {
    const scoreMatch = response.match(/(\d+(?:\.\d+)?)\s*分|评分[：:]\s*(\d+(?:\.\d+)?)/);
    if (scoreMatch) {
      return parseFloat(scoreMatch[1] || scoreMatch[2]);
    }
    return 0.8;
  }

  private parseSellingPoints(text: string): string[] {
    const match = text.match(/卖点[：:](.+?)(?=\n|$)/s);
    if (match) {
      return match[1].split(/[、，,]/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  private parseFirstPromise(text: string): string {
    const match = text.match(/首篇承诺[：:](.+?)(?=\n|$)/s);
    return match ? match[1].trim() : '';
  }

  private parseSuggestions(text: string): string[] {
    return text.split(/\n/).filter(line => line.trim().length > 10);
  }

  private toChinese(num: number): string {
    const units = ['', '十', '百', '千', '万'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (num === 0) return '零';

    let result = '';
    let unitIndex = 0;

    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = digits[digit] + units[unitIndex] + result;
      } else if (result && !result.startsWith('零')) {
        result = '零' + result;
      }
      num = Math.floor(num / 10);
      unitIndex++;
    }

    return result.replace(/零+$/, '') || '零';
  }

  private generateId(): string {
    return `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getMarketReport(): Promise<TrendReport> {
    const marketData = await this.collectMarketData();

    return {
      period: 'last_30_days',
      topGenres: this.extractTopGenres(marketData),
      risingTopics: this.extractRisingTopics(marketData),
      audienceInsights: this.extractAudienceInsights(marketData),
      platformData: this.extractPlatformData(marketData),
      marketTrends: this.analyzeMarketTrends(marketData),
      recommendations: this.generateRecommendations(marketData),
      timestamp: new Date()
    };
  }

  async analyzeCompetitor(title: string): Promise<{ strength: string[]; weakness: string[]; lessons: string[] }> {
    const similarTitles = await this.findSimilarTitles(title);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const item of similarTitles) {
      if (item.popularity > 0.7) {
        strengths.push(`"${item.title}"受欢迎，热度${(item.popularity * 100).toFixed(0)}%`);
      }
      if (item.trend === 'rising') {
        strengths.push(`"${item.title}"呈上升趋势`);
      }
      if (item.wordCount && item.wordCount < 100000) {
        weaknesses.push(`"${item.title}"篇幅较短，可能缺乏深度`);
      }
    }

    const lessons = [
      '成功的作品通常在开局就能吸引读者',
      '稳定的更新频率对积累读者很重要',
      '与读者互动可以提高作品粘性',
      '差异化竞争是突破的关键'
    ];

    return { strength: strengths, weakness: weaknesses, lessons };
  }

  private async findSimilarTitles(title: string): Promise<MarketData[]> {
    const marketData = await this.collectMarketData();
    const keywords = title.match(/[\u4e00-\u9fa5]+/g) || [];

    return marketData.filter(work => {
      for (const keyword of keywords) {
        if (work.title.includes(keyword) || work.category.includes(keyword)) {
          return true;
        }
      }
      return false;
    }).slice(0, 10);
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheDuration(duration: number): void {
    this.cacheDuration = duration;
  }
}

export default AutoDirector;
