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
export declare class ExportManager {
    private defaultOptions;
    export(project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult>;
    exportChapter(chapter: Chapter, project: NovelProject, options?: Partial<ExportOptions>): Promise<ExportResult>;
    exportBatch(chapters: Chapter[], project: NovelProject, options?: Partial<ExportOptions>): Promise<{
        results: ExportResult[];
        totalSize: number;
    }>;
    private toTxt;
    private toMarkdown;
    private toJson;
    private toEpub;
    private toHtml;
    private chapterToTxt;
    private chapterToMarkdown;
    private generateFilename;
    private calculateSize;
    private escapeHtml;
    private escapeXml;
    saveToFile(result: ExportResult, filePath: string): Promise<void>;
}
export default ExportManager;
//# sourceMappingURL=ExportManager.d.ts.map