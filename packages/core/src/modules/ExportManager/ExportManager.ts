/**
 * 多格式导出管理器
 * 支持导出为txt、md、json、epub、pdf、docx、html等格式
 */

import { NovelProject, Chapter } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const archiver = require('archiver');

export interface ExportOptions {
  format: 'txt' | 'md' | 'json' | 'epub' | 'html' | 'pdf' | 'docx';
  includeMetadata?: boolean;
  includeChapterList?: boolean;
  includeToc?: boolean;
  encoding?: 'utf-8' | 'gbk' | 'gb2312';
  lineBreak?: 'crlf' | 'lf';
  template?: string;
  paperSize?: 'A4' | 'A5' | 'B5' | 'letter';
  fontSize?: number;
  fontFamily?: string;
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface ExportResult {
  success: boolean;
  content?: string;
  filename?: string;
  size?: number;
  error?: string;
  buffer?: Buffer;
}

export interface BatchExportOptions extends ExportOptions {
  splitByChapters?: boolean;
  chaptersPerFile?: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  options: Partial<ExportOptions>;
}

export type ExportFormat = 'txt' | 'md' | 'json' | 'epub' | 'html' | 'pdf' | 'docx';

export interface ExportConfig {
  includeMetadata?: boolean;
  includeChapterList?: boolean;
  includeToc?: boolean;
  encoding?: 'utf-8' | 'gbk' | 'gb2312';
  lineBreak?: 'crlf' | 'lf';
  template?: string;
  paperSize?: 'A4' | 'A5' | 'B5' | 'letter';
  fontSize?: number;
  fontFamily?: string;
  margins?: { top: number; right: number; bottom: number; left: number };
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

  private templates: Map<string, ExportTemplate> = new Map();
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), '.export-temp');
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    this.registerTemplate({
      id: 'default',
      name: '默认模板',
      description: '标准导出格式',
      options: {
        format: 'md',
        includeMetadata: true,
        includeToc: true
      }
    });

    this.registerTemplate({
      id: 'simple',
      name: '简洁模式',
      description: '仅包含正文，无元数据',
      options: {
        format: 'txt',
        includeMetadata: false,
        includeChapterList: false,
        includeToc: false
      }
    });

    this.registerTemplate({
      id: 'ebook',
      name: '电子书',
      description: '适合阅读的电子书格式',
      options: {
        format: 'epub',
        includeMetadata: true,
        includeToc: true
      }
    });

    this.registerTemplate({
      id: 'print',
      name: '打印版',
      description: '适合打印的格式',
      options: {
        format: 'pdf',
        includeMetadata: true,
        includeToc: true,
        paperSize: 'A5',
        fontSize: 12
      }
    });

    this.registerTemplate({
      id: 'document',
      name: 'Word文档',
      description: 'Word文档格式，支持编辑',
      options: {
        format: 'docx',
        includeMetadata: true,
        includeToc: true
      }
    });
  }

  registerTemplate(template: ExportTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  async export(project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      let result: ExportResult;

      switch (opts.format) {
        case 'txt':
        case 'md':
        case 'html':
          result = await this.exportText(project, opts);
          break;
        case 'json':
          result = await this.exportJson(project, opts);
          break;
        case 'epub':
          result = await this.exportEpub(project, opts);
          break;
        case 'pdf':
          result = await this.exportPdf(project, opts);
          break;
        case 'docx':
          result = await this.exportDocx(project, opts);
          break;
        default:
          throw new Error(`Unsupported format: ${opts.format}`);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async exportText(project: NovelProject, opts: ExportOptions): Promise<ExportResult> {
    let content: string;

    switch (opts.format) {
      case 'txt':
        content = this.toTxt(project, opts);
        break;
      case 'md':
        content = this.toMarkdown(project, opts);
        break;
      case 'html':
        content = this.toHtml(project, opts);
        break;
      default:
        throw new Error('Invalid text format');
    }

    const filename = this.generateFilename(project.title, opts.format);

    return {
      success: true,
      content,
      filename,
      size: Buffer.byteLength(content, 'utf-8')
    };
  }

  private async exportJson(project: NovelProject, opts: ExportOptions): Promise<ExportResult> {
    const content = this.toJson(project);
    const filename = this.generateFilename(project.title, 'json');

    return {
      success: true,
      content,
      filename,
      size: Buffer.byteLength(content, 'utf-8')
    };
  }

  private async exportEpub(project: NovelProject, opts: ExportOptions): Promise<ExportResult> {
    const buffer = await this.createEpubBuffer(project, opts);
    const filename = this.generateFilename(project.title, 'epub');

    return {
      success: true,
      filename,
      size: buffer.length,
      buffer
    };
  }

  private async exportPdf(project: NovelProject, opts: ExportOptions): Promise<ExportResult> {
    try {
      const buffer = await this.createPdfBuffer(project, opts);
      const filename = this.generateFilename(project.title, 'pdf');

      return {
        success: true,
        filename,
        size: buffer.length,
        buffer
      };
    } catch (error: any) {
      if (error.message.includes('Puppeteer') || error.message.includes('chromium')) {
        const htmlContent = this.toPdfHtml(project, opts);
        return {
          success: true,
          content: htmlContent,
          filename: this.generateFilename(project.title, 'html'),
          size: Buffer.byteLength(htmlContent, 'utf-8')
        };
      }
      throw error;
    }
  }

  private async exportDocx(project: NovelProject, opts: ExportOptions): Promise<ExportResult> {
    try {
      const buffer = await this.createDocxBuffer(project, opts);
      const filename = this.generateFilename(project.title, 'docx');

      return {
        success: true,
        filename,
        size: buffer.length,
        buffer
      };
    } catch (error: any) {
      const htmlContent = this.toDocx(project, opts);
      return {
        success: true,
        content: htmlContent,
        filename: this.generateFilename(project.title, 'xml'),
        size: Buffer.byteLength(htmlContent, 'utf-8')
      };
    }
  }

  private createEpubBuffer(project: NovelProject, opts: ExportOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(this.tempDir, `epub_${Date.now()}`);
      const outputPath = path.join(tempDir, 'output.epub');

      try {
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'OEBPS'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'OEBPS', 'Styles'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'OEBPS', 'Text'), { recursive: true });

        const uuid = this.generateUuid();
        const now = new Date().toISOString().split('.')[0] + 'Z';

        fs.writeFileSync(path.join(tempDir, 'mimetype'), 'application/epub+zip', 'utf-8');

        const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
        fs.writeFileSync(path.join(tempDir, 'META-INF', 'container.xml'), containerXml, 'utf-8');

        const chapters = project.chapters || [];
        const chapterFiles: string[] = [];

        for (let i = 0; i < chapters.length; i++) {
          const chapter = chapters[i];
          const chapterFile = `chapter${i + 1}.xhtml`;
          chapterFiles.push(chapterFile);

          const chapterContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${this.escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="Styles/style.css"/>
</head>
<body>
  <section class="chapter" epub:type="chapter" id="chapter${i + 1}">
    <h1>${this.escapeXml(chapter.title)}</h1>
    ${this.formatContentForEpub(chapter.content || '')}
  </section>
</body>
</html>`;
          fs.writeFileSync(path.join(tempDir, 'OEBPS', 'Text', chapterFile), chapterContent, 'utf-8');
        }

        const navContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>目录</title>
  <link rel="stylesheet" type="text/css" href="Styles/style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>目录</h1>
    <ol>
      ${chapters.map((ch, i) => `<li><a href="Text/${chapterFiles[i]}">${this.escapeXml(ch.title)}</a></li>`).join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
        fs.writeFileSync(path.join(tempDir, 'OEBPS', 'nav.xhtml'), navContent, 'utf-8');

        const styleContent = `body {
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: 1em;
  line-height: 1.6;
  margin: 1em;
  text-align: justify;
}
h1 {
  text-align: center;
  font-size: 1.5em;
  margin: 1em 0;
}
p {
  text-indent: 2em;
  margin: 0.5em 0;
}`;
        fs.writeFileSync(path.join(tempDir, 'OEBPS', 'Styles', 'style.css'), styleContent, 'utf-8');

        let manifestItems = `
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="Styles/style.css" media-type="text/css"/>`;

        for (let i = 0; i < chapterFiles.length; i++) {
          manifestItems += `\n    <item id="chapter${i + 1}" href="Text/${chapterFiles[i]}" media-type="application/xhtml+xml"/>`;
        }

        let spineItems = '';
        for (let i = 0; i < chapterFiles.length; i++) {
          spineItems += `\n    <itemref idref="chapter${i + 1}"/>`;
        }

        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${this.escapeXml(project.title)}</dc:title>
    <dc:creator>${this.escapeXml(project.author || '未知')}</dc:creator>
    <dc:language>zh-CN</dc:language>
    <dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
    <meta property="dcterms:modified">${now}</meta>
    ${project.genre ? `<dc:subject>${this.escapeXml(project.genre)}</dc:subject>` : ''}
    ${project.corePremise ? `<dc:description>${this.escapeXml(project.corePremise)}</dc:description>` : ''}
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
        fs.writeFileSync(path.join(tempDir, 'OEBPS', 'content.opf'), contentOpf, 'utf-8');

        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          const buffer = fs.readFileSync(outputPath);
          this.cleanupTempDir(tempDir);
          resolve(buffer);
        });

        archive.on('error', (err) => {
          this.cleanupTempDir(tempDir);
          reject(err);
        });

        archive.pipe(output);
        archive.file(path.join(tempDir, 'mimetype'), { name: 'mimetype' });
        archive.directory(path.join(tempDir, 'META-INF'), 'META-INF');
        archive.directory(path.join(tempDir, 'OEBPS'), 'OEBPS');
        archive.finalize();

      } catch (error) {
        this.cleanupTempDir(tempDir);
        reject(error);
      }
    });
  }

  private formatContentForEpub(content: string): string {
    const paragraphs = content.split(/\n\n+/);
    return paragraphs
      .map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        return `<p>${this.escapeXml(trimmed)}</p>`;
      })
      .filter(p => p)
      .join('\n    ');
  }

  private async createPdfBuffer(project: NovelProject, opts: ExportOptions): Promise<Buffer> {
    try {
      const puppeteer = require('puppeteer');
      const htmlContent = this.toPdfHtml(project, opts);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: opts.paperSize || 'A5',
        margin: opts.margins || { top: '20mm', right: '25mm', bottom: '20mm', left: '25mm' },
        printBackground: true
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Puppeteer not installed. Please install puppeteer to enable PDF export.');
      }
      throw error;
    }
  }

  private async createDocxBuffer(project: NovelProject, opts: ExportOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(this.tempDir, `docx_${Date.now()}`);
      const outputPath = path.join(tempDir, 'output.docx');

      try {
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'word'), { recursive: true });

        const uuid = this.generateUuid();
        const now = new Date().toISOString();

        const [year, month, day, hour, min, sec] = [
          now.slice(0, 4), now.slice(5, 7), now.slice(8, 10),
          now.slice(11, 13), now.slice(14, 16), now.slice(17, 19)
        ];

        fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`, 'utf-8');

        fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'word', '_rels'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'docProps'), { recursive: true });

        fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`, 'utf-8');

        fs.writeFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`, 'utf-8');

        const chapters = project.chapters || [];
        let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body>`;

        if (opts.includeMetadata) {
          documentXml += `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr>
        <w:t>${this.escapeXml(project.title)}</w:t>
      </w:r>
    </w:p>`;

          if (project.author) {
            documentXml += `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>作者: ${this.escapeXml(project.author)}</w:t></w:r>
    </w:p>`;
          }

          if (project.genre) {
            documentXml += `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>题材: ${this.escapeXml(project.genre)}</w:t></w:r>
    </w:p>`;
          }

          documentXml += `
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
        }

        if (opts.includeToc) {
          documentXml += `
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>目 录</w:t></w:r></w:p>`;
          for (const chapter of chapters) {
            documentXml += `
    <w:p><w:r><w:t>第${chapter.number}章 ${this.escapeXml(chapter.title)}</w:t></w:r></w:p>`;
          }
          documentXml += `
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
        }

        for (const chapter of chapters) {
          documentXml += `
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="480" w:after="240"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t>第${chapter.number}章 ${this.escapeXml(chapter.title)}</w:t>
      </w:r>
    </w:p>`;

          const paragraphs = (chapter.content || '').split(/\n\n+/);
          for (const para of paragraphs) {
            const trimmed = para.trim();
            if (trimmed) {
              documentXml += `
    <w:p>
      <w:pPr><w:ind w:firstLine="640"/></w:pPr>
      <w:r><w:t xml:space="preserve">${this.escapeXml(trimmed)}</w:t></w:r>
    </w:p>`;
            }
          }

          documentXml += `
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
        }

        documentXml += `
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800"/>
    </w:sectPr>
  </w:body>
</w:document>`;

        fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), documentXml, 'utf-8');

        fs.writeFileSync(path.join(tempDir, 'word', 'styles.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:eastAsia="宋体"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
</w:styles>`, 'utf-8');

        fs.writeFileSync(path.join(tempDir, 'word', 'settings.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
</w:settings>`, 'utf-8');

        fs.writeFileSync(path.join(tempDir, 'docProps', 'core.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${this.escapeXml(project.title)}</dc:title>
  <dc:creator>${this.escapeXml(project.author || '未知')}</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${year}-${month}-${day}T${hour}:${min}:${sec}Z</dcterms:created>
</cp:coreProperties>`, 'utf-8');

        fs.writeFileSync(path.join(tempDir, 'docProps', 'app.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Cloud Book</Application>
</Properties>`, 'utf-8');

        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          const buffer = fs.readFileSync(outputPath);
          this.cleanupTempDir(tempDir);
          resolve(buffer);
        });

        archive.on('error', (err) => {
          this.cleanupTempDir(tempDir);
          reject(err);
        });

        archive.pipe(output);
        archive.directory(tempDir, false);
        archive.finalize();

      } catch (error) {
        this.cleanupTempDir(tempDir);
        reject(error);
      }
    });
  }

  private cleanupTempDir(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {}
  }

  async exportProject(project: NovelProject, format: ExportFormat, config?: ExportConfig): Promise<string> {
    const options: Partial<ExportOptions> = { format, ...config };
    const result = await this.export(project, options);
    if (!result.success || (!result.content && !result.buffer)) {
      throw new Error(result.error || 'Export failed');
    }
    return result.content || result.buffer!.toString('base64');
  }

  async exportChapter(chapter: Chapter, format: ExportFormat): Promise<string> {
    const chapterProject = {
      id: 'chapter-export',
      title: chapter.title,
      genre: 'fantasy' as const,
      literaryGenre: 'novel' as const,
      writingMode: 'original' as const,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [chapter]
    };
    return this.exportProject(chapterProject as any, format);
  }

  getSupportedFormats(): ExportFormat[] {
    return ['txt', 'md', 'json', 'epub', 'html', 'pdf', 'docx'];
  }

  async exportBatch(
    projects: NovelProject[],
    options?: Partial<BatchExportOptions>
  ): Promise<{ results: ExportResult[]; totalSize: number }> {
    const results: ExportResult[] = [];
    let totalSize = 0;

    for (const project of projects) {
      const result = await this.export(project, options);
      results.push(result);
      if (result.success && result.size) {
        totalSize += result.size;
      }
    }

    return { results, totalSize };
  }

  async exportWithTemplate(
    project: NovelProject,
    templateId: string
  ): Promise<ExportResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      return { success: false, error: `Template not found: ${templateId}` };
    }

    return this.export(project, template.options);
  }

  private toTxt(project: NovelProject, opts: ExportOptions): string {
    const lines: string[] = [];

    if (opts.includeMetadata) {
      lines.push(project.title);
      if (project.subtitle) lines.push(project.subtitle);
      lines.push('');
      if (project.author) lines.push(`作者: ${project.author}`);
      if (project.genre) lines.push(`题材: ${project.genre}`);
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
      lines.push(`**作者**: ${project.author || '未知'}`);
      lines.push(`**题材**: ${project.genre || '未知'}`);
      if (project.targetWordCount) {
        lines.push(`**目标字数**: ${project.targetWordCount.toLocaleString()}`);
      }
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
        lines.push(`- [第${chapter.number}章 ${chapter.title}](#第${chapter.number}章)`);
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
        author: project.author,
        genre: project.genre,
        corePremise: project.corePremise,
        targetWordCount: project.targetWordCount,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        version: '1.0'
      },
      worldSetting: project.worldSetting,
      characters: project.characters,
      chapters: project.chapters,
      truthFiles: project.truthFiles
    }, null, 2);
  }

  private toHtml(project: NovelProject, opts: ExportOptions): string {
    const chapters = project.chapters || [];
    const css = this.generateHtmlStyles(opts);

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(project.title)}</title>
  <style>${css}</style>
</head>
<body>
  <article class="novel">`;

    if (opts.includeMetadata) {
      html += `
    <header class="metadata">
      <h1>${this.escapeHtml(project.title)}</h1>
      ${project.subtitle ? `<h2>${this.escapeHtml(project.subtitle)}</h2>` : ''}
      <p class="author">作者: ${this.escapeHtml(project.author || '未知')}</p>
      <p class="genre">题材: ${this.escapeHtml(project.genre || '未知')}</p>
      ${project.corePremise ? `<blockquote class="premise">${this.escapeHtml(project.corePremise)}</blockquote>` : ''}
    </header>`;
    }

    if (opts.includeToc) {
      html += `
    <nav class="toc">
      <h2>目录</h2>
      <ol>`;
      for (const chapter of chapters) {
        html += `\n        <li><a href="#chapter${chapter.number}">第${chapter.number}章 ${this.escapeHtml(chapter.title)}</a></li>`;
      }
      html += `
      </ol>
    </nav>`;
    }

    for (const chapter of chapters) {
      html += `
    <section class="chapter" id="chapter${chapter.number}">
      <h2>第${chapter.number}章 ${this.escapeHtml(chapter.title)}</h2>
      <div class="content">${this.formatContent(chapter.content || '')}</div>
    </section>`;
    }

    html += `
  </article>
  <footer class="footer">
    <p>由 Cloud Book 生成 | ${new Date().toLocaleDateString('zh-CN')}</p>
  </footer>
</body>
</html>`;

    return html;
  }

  private toPdfHtml(project: NovelProject, opts: ExportOptions): string {
    const chapters = project.chapters || [];
    const fontSize = opts.fontSize || 12;
    const fontFamily = opts.fontFamily || '"Noto Serif SC", "Source Han Serif SC", serif';
    const paper = opts.paperSize || 'A5';
    const margins = opts.margins || { top: 20, right: 25, bottom: 20, left: 25 };

    const paperSizes: Record<string, { width: string; height: string }> = {
      A4: { width: '210mm', height: '297mm' },
      A5: { width: '148mm', height: '210mm' },
      B5: { width: '176mm', height: '250mm' },
      letter: { width: '8.5in', height: '11in' }
    };

    const size = paperSizes[paper];

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(project.title)}</title>
  <style>
    @page {
      size: ${size.width} ${size.height};
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize}pt;
      line-height: 1.8;
      text-align: justify;
      color: #333;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .cover {
      text-align: center;
      page-break-after: always;
      padding-top: 30%;
    }
    .cover h1 { font-size: 24pt; margin-bottom: 1em; }
    .cover .author { font-size: 14pt; color: #666; }
    .toc { page-break-after: always; }
    .toc h2 { text-align: center; margin-bottom: 2em; }
    .toc ol { list-style: none; padding: 0; }
    .toc li { margin: 0.5em 0; }
    .chapter { text-indent: 2em; margin: 1em 0; orphans: 3; widows: 3; }
    .chapter h2 {
      text-align: center;
      text-indent: 0;
      font-size: 14pt;
      margin: 2em 0 1em 0;
      page-break-after: avoid;
    }
    .chapter p { margin: 0.5em 0; }
    .dialogue { text-indent: 0; margin-left: 2em; }
    .footer { text-align: center; font-size: 9pt; color: #999; margin-top: 2em; }
  </style>
</head>
<body>`;

    if (opts.includeMetadata) {
      html += `
  <div class="cover">
    <h1>${this.escapeHtml(project.title)}</h1>
    ${project.subtitle ? `<h2>${this.escapeHtml(project.subtitle)}</h2>` : ''}
    <p class="author">${this.escapeHtml(project.author || '未知')}</p>
    <p class="genre">${this.escapeHtml(project.genre || '未知')}</p>
  </div>`;
    }

    if (opts.includeToc) {
      html += `
  <nav class="toc">
    <h2>目 录</h2>
    <ol>`;
      for (const chapter of chapters) {
        html += `\n      <li>第${chapter.number}章 ${this.escapeHtml(chapter.title)}</li>`;
      }
      html += `
    </ol>
  </nav>`;
    }

    for (const chapter of chapters) {
      html += `
  <section class="chapter">
    <h2>第${chapter.number}章 ${this.escapeHtml(chapter.title)}</h2>
    ${this.formatPdfContent(chapter.content || '')}
  </section>`;
    }

    html += `
  <div class="footer">- ${new Date().toLocaleDateString('zh-CN')} -</div>
</body>
</html>`;

    return html;
  }

  private toDocx(project: NovelProject, opts: ExportOptions): string {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Use export() method to generate real DOCX file -->';
  }

  private generateFilename(title: string, format: string): string {
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    return `${safeTitle}_${timestamp}.${format}`;
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

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateHtmlStyles(opts: ExportOptions): string {
    return `
    body { font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
    .novel { max-width: 100%; }
    .metadata { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .metadata h1 { font-size: 2em; margin: 0 0 10px 0; }
    .metadata h2 { font-size: 1.2em; color: #666; font-weight: normal; margin: 5px 0; }
    .metadata .author, .metadata .genre { color: #666; margin: 5px 0; }
    .metadata .premise { font-style: italic; color: #555; border-left: 3px solid #ddd; padding-left: 15px; margin-top: 20px; }
    .toc { background: #f9f9f9; padding: 25px; margin: 20px 0; border-radius: 8px; }
    .toc h2 { margin-top: 0; }
    .toc ol { list-style: none; padding: 0; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: #333; text-decoration: none; }
    .toc a:hover { color: #0066cc; }
    .chapter { margin: 30px 0; }
    .chapter h2 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 40px; color: #333; }
    .chapter .content { text-align: justify; }
    .chapter .content p { margin: 1em 0; text-indent: 2em; }
    .footer { text-align: center; color: #999; font-size: 0.9em; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    blockquote { border-left: 3px solid #ccc; padding-left: 15px; color: #666; margin: 20px 0; }`;
  }

  private formatContent(content: string): string {
    return content
      .split('\n\n')
      .map(p => `<p>${this.escapeHtml(p.trim())}</p>`)
      .join('\n');
  }

  private formatPdfContent(content: string): string {
    return content
      .split('\n\n')
      .map(p => `<p>${this.escapeHtml(p.trim())}</p>`)
      .join('\n');
  }

  async saveToFile(result: ExportResult, filePath: string): Promise<void> {
    if (!result.success) {
      throw new Error(result.error || 'Export failed');
    }

    if (result.buffer) {
      fs.writeFileSync(filePath, result.buffer);
    } else if (result.content) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
    } else {
      throw new Error('No content to save');
    }
  }
}

export default ExportManager;
