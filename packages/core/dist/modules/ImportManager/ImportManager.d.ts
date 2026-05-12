/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub、docx等格式的小说
 */
interface File {
    name: string;
    size: number;
    type: string;
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
export type ImportFormat = 'auto' | 'txt' | 'md' | 'json' | 'epub' | 'html' | 'docx';
export declare class ImportManager {
    private defaultOptions;
    private chapterPatterns;
    private formatHints;
    constructor();
    private initializeFormatHints;
    import(content: string, options?: Partial<ImportOptions>): Promise<ImportResult>;
    importFromFile(file: File, options?: Partial<ImportOptions>): Promise<ImportResult>;
    detectFormatContent(content: string, options?: Partial<ImportOptions>): FormatDetector;
    private parseTxt;
    private parseMarkdown;
    private parseJson;
    private parseHtml;
    private parseEpub;
    private parseDocx;
    private createChapterPattern;
    private extractChapterTitle;
    private parseMetadataLine;
    private createChapter;
    private normalizeChapter;
    private countWords;
    getSupportedFormats(): {
        format: string;
        extensions: string[];
        description: string;
    }[];
    importProject(filePath: string, format?: ImportFormat): Promise<NovelProject>;
    importChapter(filePath: string, format?: ImportFormat): Promise<Chapter>;
    detectFormat(filePath: string): ImportFormat;
}
export default ImportManager;
//# sourceMappingURL=ImportManager.d.ts.map