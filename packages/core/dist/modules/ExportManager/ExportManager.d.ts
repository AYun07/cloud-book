/**
 * 多格式导出管理器
 * 支持导出为txt、md、json、epub、pdf、docx、html等格式
 */
import { NovelProject, Chapter } from '../../types';
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
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
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
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
export declare class ExportManager {
    private defaultOptions;
    private templates;
    private tempDir;
    constructor();
    private registerDefaultTemplates;
    registerTemplate(template: ExportTemplate): void;
    getTemplates(): ExportTemplate[];
    export(project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult>;
    private exportText;
    private exportJson;
    private exportEpub;
    private exportPdf;
    private exportDocx;
    private createEpubBuffer;
    private formatContentForEpub;
    private createPdfBuffer;
    private createDocxBuffer;
    private cleanupTempDir;
    exportProject(project: NovelProject, format: ExportFormat, config?: ExportConfig): Promise<string>;
    exportChapter(chapter: Chapter, format: ExportFormat): Promise<string>;
    getSupportedFormats(): ExportFormat[];
    exportBatch(projects: NovelProject[], options?: Partial<BatchExportOptions>): Promise<{
        results: ExportResult[];
        totalSize: number;
    }>;
    exportWithTemplate(project: NovelProject, templateId: string): Promise<ExportResult>;
    private toTxt;
    private toMarkdown;
    private toJson;
    private toHtml;
    private toPdfHtml;
    private toDocx;
    private generateFilename;
    private escapeHtml;
    private escapeXml;
    private generateUuid;
    private generateHtmlStyles;
    private formatContent;
    private formatPdfContent;
    saveToFile(result: ExportResult, filePath: string): Promise<void>;
}
export default ExportManager;
//# sourceMappingURL=ExportManager.d.ts.map