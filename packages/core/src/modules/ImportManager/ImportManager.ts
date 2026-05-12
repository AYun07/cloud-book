/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub、docx等格式的小说
 */

declare const FileReader: {
  new(): FileReader;
};

interface ProgressEvent {
  target: FileReader | null;
}

interface FileReader {
  result: string | ArrayBuffer | null;
  onload: ((this: FileReader, ev: Event) => void) | null;
  onerror: ((this: FileReader, ev: Event) => void) | null;
  readAsText(file: File): void;
  readAsArrayBuffer(file: File): void;
}

interface File {
  name: string;
  size: number;
  type: string;
}

interface Event {
  target: FileReader | null;
}

import { NovelProject, Chapter } from '../../types';

export interface ImportOptions {
  format: 'auto' | 'txt' | 'md' | 'json' | 'epub' | 'html' | 'docx';
  encoding?: 'utf-8' | 'gbk' | 'gb2312';
  chapterPattern?: RegExp;
  extractMetadata?: boolean;
  preserveFormatting?: boolean;
}

export interface ImportResult {
  success: boolean;
  project?: Partial<NovelProject>;
  chapters?: Chapter[];
  warnings?: string[];
  error?: string;
  metadata?: ImportMetadata;
}

export interface ImportMetadata {
  title?: string;
  author?: string;
  genre?: string;
  wordCount?: number;
  chapterCount?: number;
  importFormat?: string;
  importTime?: Date;
}

export interface ParseChapter {
  number: number;
  title: string;
  content: string;
  summary?: string;
  keywords?: string[];
}

export interface FormatDetector {
  format: ImportOptions['format'];
  confidence: number;
  evidence: string[];
}

export class ImportManager {
  private defaultOptions: ImportOptions = {
    format: 'auto',
    encoding: 'utf-8',
    extractMetadata: true,
    preserveFormatting: true
  };

  private chapterPatterns: RegExp[] = [
    /^第[一二三四五六七八九十百千\d]+章/m,
    /^Chapter\s+\d+/im,
    /^第\d+章/m,
    /^第[一二三四五六七八九十百千\d]+节/m,
    /^\d+\./m,
    /^第[一二三四五六七八九十百千\d]+卷/m,
    /^Volume\s+\d+/im,
  ];

  private formatHints: Map<string, ImportOptions['format']> = new Map([
    ['chapter', 'md'],
    ['novel', 'txt'],
    ['book', 'txt'],
    ['story', 'txt'],
    ['writing', 'md'],
    ['draft', 'md'],
    ['manuscript', 'txt'],
  ]);

  constructor() {
    this.initializeFormatHints();
  }

  private initializeFormatHints(): void {
    this.formatHints.set('晋江', 'txt');
    this.formatHints.set('起点', 'txt');
    this.formatHints.set('番茄', 'txt');
    this.formatHints.set('七猫', 'txt');
    this.formatHints.set('红袖', 'txt');
    this.formatHints.set('潇湘', 'txt');
  }

  async import(content: string, options?: Partial<ImportOptions>): Promise<ImportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      let format = opts.format;
      if (format === 'auto') {
        const detection = this.detectFormat(content, opts);
        format = detection.format;
      }

      let project: Partial<NovelProject> = {};
      let chapters: Chapter[] = [];
      const warnings: string[] = [];
      const metadata: ImportMetadata = {
        importFormat: format,
        importTime: new Date()
      };

      switch (format) {
        case 'txt':
          const txtResult = this.parseTxt(content, opts);
          project = txtResult.metadata;
          chapters = txtResult.chapters;
          break;

        case 'md':
          const mdResult = this.parseMarkdown(content, opts);
          project = mdResult.metadata;
          chapters = mdResult.chapters;
          break;

        case 'json':
          const jsonResult = this.parseJson(content);
          project = jsonResult.project;
          chapters = jsonResult.chapters;
          break;

        case 'html':
          const htmlResult = this.parseHtml(content);
          project = htmlResult.metadata;
          chapters = htmlResult.chapters;
          break;

        case 'epub':
          const epubResult = this.parseEpub(content);
          project = epubResult.metadata;
          chapters = epubResult.chapters;
          break;

        case 'docx':
          const docxResult = this.parseDocx(content);
          project = docxResult.metadata;
          chapters = docxResult.chapters;
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      if (chapters.length === 0) {
        warnings.push('未检测到章节，请检查文件格式');
      }

      metadata.chapterCount = chapters.length;
      metadata.wordCount = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);

      return {
        success: true,
        project,
        chapters,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async importFromFile(file: File, options?: Partial<ImportOptions>): Promise<ImportResult> {
    return new Promise((resolve) => {
      if (typeof FileReader === 'undefined') {
        resolve({ success: false, error: 'FileReader not available' });
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = this.import(content, options);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx' || ext === 'doc') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  detectFormat(content: string, options?: Partial<ImportOptions>): FormatDetector {
    const detectors: FormatDetector[] = [];

    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content.trim());
        detectors.push({
          format: 'json',
          confidence: 95,
          evidence: ['Valid JSON syntax detected']
        });
      } catch {}
    }

    if (content.includes('<package') && content.includes('xmlns="http://www.idpf.org/2007/opf"')) {
      detectors.push({
        format: 'epub',
        confidence: 90,
        evidence: ['EPUB package structure detected']
      });
    }

    if (content.includes('w:wordDocument') && content.includes('xmlns:w=')) {
      detectors.push({
        format: 'docx',
        confidence: 90,
        evidence: ['DOCX XML structure detected']
      });
    }

    if (content.includes('<!DOCTYPE') || (content.includes('<html') && content.includes('<body'))) {
      detectors.push({
        format: 'html',
        confidence: 85,
        evidence: ['HTML structure detected']
      });
    }

    const markdownIndicators = [
      /^# .+$/m,
      /^\*\*.*\*\*$/m,
      /^## .+$/m,
      /^\[.+\]\(.+\)$/m,
      /^---$/m
    ];
    const mdScore = markdownIndicators.filter(p => p.test(content)).length;
    if (mdScore >= 2) {
      detectors.push({
        format: 'md',
        confidence: 70 + mdScore * 10,
        evidence: [`${mdScore} Markdown indicators found`]
      });
    }

    detectors.push({
      format: 'txt',
      confidence: 50,
      evidence: ['Default fallback format']
    });

    detectors.sort((a, b) => b.confidence - a.confidence);
    return detectors[0];
  }

  private parseTxt(content: string, options: ImportOptions): { metadata: Partial<NovelProject>; chapters: Chapter[] } {
    const metadata: Partial<NovelProject> = {};
    const chapters: Chapter[] = [];

    const lines = content.split(/\r?\n/);
    let currentChapter: ParseChapter | null = null;
    let currentContent: string[] = [];

    const chapterPattern = options.chapterPattern || this.createChapterPattern(lines);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (i === 0 && options.extractMetadata && !chapterPattern.test(line)) {
        metadata.title = line;
        continue;
      }

      if (chapterPattern.test(line)) {
        if (currentChapter) {
          chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }

        currentChapter = {
          number: chapters.length + 1,
          title: this.extractChapterTitle(line),
          content: ''
        };
        currentContent = [];
      } else if (currentChapter) {
        currentContent.push(lines[i]);
      } else if (options.extractMetadata) {
        this.parseMetadataLine(line, metadata);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join('\n').trim();
      chapters.push(this.createChapter(currentChapter, chapters.length + 1));
    }

    if (chapters.length === 0 && content.trim()) {
      chapters.push(this.createChapter({
        number: 1,
        title: metadata.title || '第一章',
        content: content.trim()
      }, 1));
    }

    return { metadata, chapters };
  }

  private parseMarkdown(content: string, options: ImportOptions): { metadata: Partial<NovelProject>; chapters: Chapter[] } {
    const metadata: Partial<NovelProject> = {};
    const chapters: Chapter[] = [];

    const lines = content.split(/\r?\n/);
    let currentChapter: ParseChapter | null = null;
    let currentContent: string[] = [];
    let inMetadata = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inMetadata) {
        if (line.startsWith('# ')) {
          metadata.title = line.substring(2).trim();
        } else if (line.startsWith('## ')) {
          if (!metadata.subtitle) {
            metadata.subtitle = line.substring(3).trim();
          } else {
            inMetadata = false;
          }
        } else if (line.startsWith('**')) {
          const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
          if (match) {
            const [, key, value] = match;
            if (key === '作者') (metadata as any).author = value;
            if (key === '题材') metadata.genre = value as any;
          }
        } else if (line.startsWith('---')) {
          inMetadata = false;
        } else if (line.trim() === '') {
          continue;
        } else if (!line.startsWith('#') && !line.startsWith('*')) {
          inMetadata = false;
        }

        if (!inMetadata && !currentChapter) {
          currentContent.push(line);
          continue;
        }
      }

      if (line.startsWith('## ') && /第[一二三四五六七八九十百千\d]+章/.test(line)) {
        if (currentChapter) {
          chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }

        currentChapter = {
          number: chapters.length + 1,
          title: this.extractChapterTitle(line.replace('## ', '')),
          content: ''
        };
        currentContent = [];
      } else if (currentChapter) {
        if (line.startsWith('#') && !line.startsWith('##')) {
          chapters.push(this.createChapter(currentChapter, chapters.length + 1));
          currentChapter = null;
        } else {
          currentContent.push(line);
        }
      } else {
        currentContent.push(line);
      }
    }

    if (currentChapter) {
      currentChapter.content = currentContent.join('\n').trim();
      chapters.push(this.createChapter(currentChapter, chapters.length + 1));
    }

    if (chapters.length === 0 && currentContent.length > 0) {
      chapters.push(this.createChapter({
        number: 1,
        title: metadata.title || '第一章',
        content: currentContent.join('\n').trim()
      }, 1));
    }

    return { metadata, chapters };
  }

  private parseJson(content: string): { project: Partial<NovelProject>; chapters: Chapter[] } {
    const data = JSON.parse(content);

    if (data.metadata || data.project) {
      const project = data.metadata || data.project;
      const chapters = Array.isArray(data.chapters) ? data.chapters : (data.project?.chapters || []);
      return { project, chapters };
    }

    if (Array.isArray(data)) {
      return {
        project: {},
        chapters: data.map((c: any, i: number) => this.normalizeChapter(c, i + 1))
      };
    }

    return {
      project: data,
      chapters: Array.isArray(data.chapters) ? data.chapters : []
    };
  }

  private parseHtml(content: string): { metadata: Partial<NovelProject>; chapters: Chapter[] } {
    const metadata: Partial<NovelProject> = {};

    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) metadata.title = titleMatch[1];

    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) metadata.title = h1Match[1];

    const chapters: Chapter[] = [];
    const chapterRegex = /<h[23][^>]*id=["']?chapter(\d+)["']?[^>]*>([^<]+)<\/h[23]>/gi;
    let match;

    while ((match = chapterRegex.exec(content)) !== null) {
      const chapterNum = parseInt(match[1]);
      const chapterTitle = match[2].trim();

      const nextChapterMatch = content.substring(match.index + match[0].length).match(/<h[23][^>]*>/i);
      const endIndex = nextChapterMatch?.index || content.length;

      const chapterContent = content
        .substring(match.index + match[0].length, match.index + match[0].length + endIndex)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      chapters.push(this.createChapter({
        number: chapterNum,
        title: chapterTitle,
        content: chapterContent
      }, chapters.length + 1));
    }

    if (chapters.length === 0) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        const textContent = bodyMatch[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        chapters.push(this.createChapter({
          number: 1,
          title: metadata.title || '内容',
          content: textContent
        }, 1));
      }
    }

    return { metadata, chapters };
  }

  private parseEpub(content: string): { metadata: Partial<NovelProject>; chapters: Chapter[] } {
    const metadata: Partial<NovelProject> = {};
    const chapters: Chapter[] = [];

    const titleMatch = content.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch) metadata.title = titleMatch[1];

    const authorMatch = content.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (authorMatch) (metadata as any).author = authorMatch[1];

    const descMatch = content.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i);
    if (descMatch) metadata.corePremise = descMatch[1];

    const subjectMatch = content.match(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/gi);
    if (subjectMatch) {
      const subjects = subjectMatch.map(s => s.replace(/<[^>]+>/g, ''));
      (metadata as any).tags = subjects;
    }

    const chapterMatches = content.match(/<item[^>]+href="([^"]+\.xhtml)"[^>]*>/gi);
    if (chapterMatches) {
      chapterMatches.forEach((match, index) => {
        const hrefMatch = match.match(/href="([^"]+\.xhtml)"/);
        if (hrefMatch && !hrefMatch[1].includes('nav') && !hrefMatch[1].includes('style')) {
          chapters.push(this.createChapter({
            number: index + 1,
            title: `第${index + 1}章`,
            content: ''
          }, index + 1));
        }
      });
    }

    return { metadata, chapters };
  }

  private parseDocx(content: string): { metadata: Partial<NovelProject>; chapters: Chapter[] } {
    const metadata: Partial<NovelProject> = {};
    const chapters: Chapter[] = [];

    const titleMatch = content.match(/<w:t>([^<]+)<\/w:t>/g);
    if (titleMatch && titleMatch.length > 0) {
      const firstText = titleMatch[0].replace(/<[^>]+>/g, '');
      if (firstText.length < 50) {
        metadata.title = firstText;
      }
    }

    const boldTexts = content.match(/<w:rPr>[\s\S]*?<w:b[\s\S]*?\/><\/w:rPr>[\s\S]*?<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (boldTexts && boldTexts.length > 0) {
      const firstBold = boldTexts[0].match(/<w:t[^>]*>([^<]+)<\/w:t>/);
      if (firstBold && firstBold[1].length < 100) {
        if (!metadata.title) metadata.title = firstBold[1];
      }
    }

    const allText = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const paragraphs = allText.split(/\.\s{2,}/);
    if (paragraphs.length > 0) {
      const chapterPattern = /^第[一二三四五六七八九十百千\d]+章/m;
      let currentChapter: ParseChapter | null = null;
      let currentContent: string[] = [];

      for (const para of paragraphs) {
        if (chapterPattern.test(para)) {
          if (currentChapter) {
            currentChapter.content = currentContent.join('\n\n');
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
          }

          const titleMatch = para.match(/(第[一二三四五六七八九十百千\d]+章)[^\n]*/);
          currentChapter = {
            number: chapters.length + 1,
            title: titleMatch ? titleMatch[0].substring(0, 50) : `第${chapters.length + 1}章`,
            content: ''
          };
          currentContent = [];
        } else if (currentChapter) {
          currentContent.push(para);
        }
      }

      if (currentChapter) {
        currentChapter.content = currentContent.join('\n\n');
        chapters.push(this.createChapter(currentChapter, chapters.length + 1));
      }
    }

    if (chapters.length === 0) {
      chapters.push(this.createChapter({
        number: 1,
        title: metadata.title || '内容',
        content: allText.substring(0, 50000)
      }, 1));
    }

    return { metadata, chapters };
  }

  private createChapterPattern(lines: string[]): RegExp {
    for (const pattern of this.chapterPatterns) {
      for (const line of lines.slice(0, 50)) {
        if (pattern.test(line)) {
          return pattern;
        }
      }
    }

    return /^第\d+章/m;
  }

  private extractChapterTitle(line: string): string {
    return line
      .replace(/^第[一二三四五六七八九十百千\d]+章\s*/i, '')
      .replace(/^Chapter\s+\d+\s*/i, '')
      .replace(/^\d+\.\s*/, '')
      .trim() || line;
  }

  private parseMetadataLine(line: string, metadata: Partial<NovelProject>): void {
    if (line.includes('作者')) {
      const match = line.match(/作者[：:]\s*(.+)/);
      if (match) (metadata as any).author = match[1].trim();
    }
    if (line.includes('题材')) {
      const match = line.match(/题材[：:]\s*(.+)/);
      if (match) metadata.genre = match[1].trim() as any;
    }
  }

  private createChapter(parse: ParseChapter, index: number): Chapter {
    return {
      id: `imported_${Date.now()}_${index}`,
      number: parse.number || index,
      title: parse.title,
      status: 'imported' as any,
      wordCount: this.countWords(parse.content),
      content: parse.content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private normalizeChapter(data: any, index: number): Chapter {
    return {
      id: data.id || `imported_${Date.now()}_${index}`,
      number: data.number || index,
      title: data.title || `第${index}章`,
      status: 'imported' as any,
      wordCount: data.wordCount || this.countWords(data.content || ''),
      content: data.content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private countWords(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  getSupportedFormats(): { format: string; extensions: string[]; description: string }[] {
    return [
      { format: 'txt', extensions: ['.txt'], description: '纯文本文件' },
      { format: 'md', extensions: ['.md', '.markdown'], description: 'Markdown格式' },
      { format: 'json', extensions: ['.json'], description: 'JSON格式（Cloud Book项目文件）' },
      { format: 'html', extensions: ['.html', '.htm'], description: 'HTML网页格式' },
      { format: 'epub', extensions: ['.epub'], description: 'EPUB电子书格式' },
      { format: 'docx', extensions: ['.docx', '.doc'], description: 'Word文档格式' }
    ];
  }
}

export default ImportManager;
