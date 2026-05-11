/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub等格式的小说
 */
interface File {
    name: string;
    size: number;
    type: string;
}
import { NovelProject, Chapter } from '../../types';
export interface ImportOptions {
    format: 'auto' | 'txt' | 'md' | 'json' | 'epub' | 'html';
    encoding?: 'utf-8' | 'gbk' | 'gb2312';
    chapterPattern?: RegExp;
    extractMetadata?: boolean;
}
export interface ImportResult {
    success: boolean;
    project?: Partial<NovelProject>;
    chapters?: Chapter[];
    warnings?: string[];
    error?: string;
}
export interface ParseChapter {
    number: number;
    title: string;
    content: string;
}
export declare class ImportManager {
    private defaultOptions;
    private chapterPatterns;
    import(content: string, options?: Partial<ImportOptions>): Promise<ImportResult>;
    importFromFile(file: File, options?: Partial<ImportOptions>): Promise<ImportResult>;
    private detectFormat;
    private parseTxt;
    private parseMarkdown;
    private parseJson;
    private parseHtml;
    private parseEpub;
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
}
export default ImportManager;
//# sourceMappingURL=ImportManager.d.ts.map