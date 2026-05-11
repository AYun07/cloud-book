/**
 * 多格式导出管理器
 * 支持导出为txt、md、json、epub、pdf等格式
 */

import { NovelProject, Chapter } from '../../types';

export interface ExportOptions {
  format: 'txt' | 'md' | 'json' | 'epub' | 'html' | 'pdf';
  includeMetadata?: boolean;
  includeChapterList?: boolean;
  includeToc?: boolean;
  encoding?: 'utf-8' | 'gbk' | 'gb2312';
  lineBreak?: 'crlf' | 'lf';
}

export interface ExportResult {
  success: boolean;
  content?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export class ExportManager {
  private defaultOptions: ExportOptions = {
    format: 'md',
    includeMetadata: true,
    includeChapterList: true,
    includeToc: true,
    encoding: 'utf-8',
    lineBreak: 'lf'
  };

  async export(project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      let content: string;

      switch (opts.format) {
        case 'txt':
          content = this.toTxt(project, opts);
          break;
        case 'md':
          content = this.toMarkdown(project, opts);
          break;
        case 'json':
          content = this.toJson(project);
          break;
        case 'epub':
          content = this.toEpub(project, opts);
          break;
        case 'html':
          content = this.toHtml(project, opts);
          break;
        default:
          throw new Error(`Unsupported format: ${opts.format}`);
      }

      const filename = this.generateFilename(project.title, opts.format);

      return {
        success: true,
        content,
        filename,
        size: this.calculateSize(content)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async exportChapter(chapter: Chapter, project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      let content: string;

      switch (opts.format) {
        case 'txt':
          content = this.chapterToTxt(chapter, project, opts);
          break;
        case 'md':
          content = this.chapterToMarkdown(chapter, project, opts);
          break;
        case 'json':
          content = JSON.stringify({ chapter, project }, null, 2);
          break;
        default:
          throw new Error(`Unsupported format: ${opts.format}`);
      }

      const filename = `${project.title}_第${chapter.number}章.${opts.format}`;

      return {
        success: true,
        content,
        filename,
        size: this.calculateSize(content)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async exportBatch(
    chapters: Chapter[],
    project: NovelProject,
    options?: Partial<ExportOptions>
  ): Promise<{ results: ExportResult[]; totalSize: number }> {
    const results: ExportResult[] = [];
    let totalSize = 0;

    for (const chapter of chapters) {
      const result = await this.exportChapter(chapter, project, options);
      results.push(result);
      if (result.success && result.size) {
        totalSize += result.size;
      }
    }

    return { results, totalSize };
  }

  private toTxt(project: NovelProject, opts: ExportOptions): string {
    const lines: string[] = [];

    if (opts.includeMetadata) {
      lines.push(project.title);
      if (project.subtitle) lines.push(project.subtitle);
      lines.push('');
      if (project.corePremise) lines.push(project.corePremise);
      lines.push('');
      lines.push('='.repeat(50));
      lines.push('');
    }

    if (opts.includeToc) {
      lines.push('【目录】');
      lines.push('');
      for (const chapter of project.chapters || []) {
        lines.push(`${chapter.number}. ${chapter.title}`);
      }
      lines.push('');
      lines.push('='.repeat(50));
      lines.push('');
    }

    for (const chapter of project.chapters || []) {
      lines.push(`\n【${chapter.title}】\n`);
      lines.push(chapter.content || '');
      lines.push('\n');
    }

    let result = lines.join('\n');

    if (opts.lineBreak === 'crlf') {
      result = result.replace(/\n/g, '\r\n');
    }

    return result;
  }

  private toMarkdown(project: NovelProject, opts: ExportOptions): string {
    const lines: string[] = [];

    if (opts.includeMetadata) {
      lines.push(`# ${project.title}`);
      if (project.subtitle) lines.push(`## ${project.subtitle}`);
      lines.push('');
      lines.push(`**题材**: ${project.genre || '未知'}`);
      if (project.corePremise) {
        lines.push('');
        lines.push(`> ${project.corePremise}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    if (opts.includeToc) {
      lines.push('## 目录');
      lines.push('');
      for (const chapter of project.chapters || []) {
        lines.push(`- [${chapter.title}](#第${chapter.number}章)`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    for (const chapter of project.chapters || []) {
      lines.push(`## 第${chapter.number}章 ${chapter.title}`);
      lines.push('');
      lines.push(chapter.content || '');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  private toJson(project: NovelProject): string {
    return JSON.stringify({
      metadata: {
        title: project.title,
        subtitle: project.subtitle,
        genre: project.genre,
        corePremise: project.corePremise,
        targetWordCount: project.targetWordCount,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      worldSetting: project.worldSetting,
      characters: project.characters,
      chapters: project.chapters,
      truthFiles: project.truthFiles
    }, null, 2);
  }

  private toEpub(project: NovelProject, opts: ExportOptions): string {
    const chapters = project.chapters || [];

    let epub = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <title>${this.escapeXml(project.title)}</title>
    <author>未知</author>
    <language>zh-CN</language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml"/>
`;

    for (let i = 0; i < chapters.length; i++) {
      epub += `    <item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>\n`;
    }

    epub += `  </manifest>
  <spine>
    <itemref idref="nav"/>\n`;

    for (let i = 0; i < chapters.length; i++) {
      epub += `    <itemref idref="chapter${i + 1}"/>\n`;
    }

    epub += `  </spine>
</package>`;

    return epub;
  }

  private toHtml(project: NovelProject, opts: ExportOptions): string {
    const chapters = project.chapters || [];

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(project.title)}</title>
  <style>
    body { font-family: "Microsoft YaHei", serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; }
    h1 { text-align: center; margin-bottom: 10px; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-top: 40px; }
    .meta { text-align: center; color: #666; margin-bottom: 30px; }
    .chapter { margin: 30px 0; }
    .toc { background: #f5f5f5; padding: 20px; margin: 20px 0; }
    .toc ul { list-style: none; padding-left: 20px; }
    blockquote { border-left: 3px solid #ccc; padding-left: 15px; color: #666; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(project.title)}</h1>
  <div class="meta">
    <p>题材: ${this.escapeHtml(project.genre || '未知')}</p>
  </div>`;

    if (opts.includeToc) {
      html += `
  <div class="toc">
    <h2>目录</h2>
    <ul>`;
      for (const chapter of chapters) {
        html += `\n      <li><a href="#chapter${chapter.number}">第${chapter.number}章 ${this.escapeHtml(chapter.title)}</a></li>`;
      }
      html += `
    </ul>
  </div>`;
    }

    for (const chapter of chapters) {
      html += `
  <div class="chapter">
    <h2 id="chapter${chapter.number}">第${chapter.number}章 ${this.escapeHtml(chapter.title)}</h2>
    <div class="content">${this.escapeHtml(chapter.content || '').replace(/\n/g, '<br>')}</div>
  </div>`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  private chapterToTxt(chapter: Chapter, project: NovelProject, opts: ExportOptions): string {
    const lines: string[] = [];

    if (opts.includeMetadata) {
      lines.push(project.title);
      lines.push('');
    }

    lines.push(`【${chapter.title}】`);
    lines.push('');
    lines.push(chapter.content || '');

    let result = lines.join('\n');
    if (opts.lineBreak === 'crlf') {
      result = result.replace(/\n/g, '\r\n');
    }
    return result;
  }

  private chapterToMarkdown(chapter: Chapter, project: NovelProject, opts: ExportOptions): string {
    const lines: string[] = [];

    if (opts.includeMetadata) {
      lines.push(`# ${project.title}`);
      lines.push('');
    }

    lines.push(`## 第${chapter.number}章 ${chapter.title}`);
    lines.push('');
    lines.push(chapter.content || '');

    return lines.join('\n');
  }

  private generateFilename(title: string, format: string): string {
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    return `${safeTitle}_${timestamp}.${format}`;
  }

  private calculateSize(content: string): number {
    return content.length;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async saveToFile(result: ExportResult, filePath: string): Promise<void> {
    if (!result.success || !result.content) {
      throw new Error(result.error || 'Export failed');
    }

    const fs = require('fs');
    fs.writeFileSync(filePath, result.content, 'utf-8');
  }
}

export default ExportManager;
