/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub、docx、Scrivener、Plottr、yWriter、Obsidian等格式
 */
interface File {
    name: string;
    size: number;
    type: string;
}
import { NovelProject, Chapter } from '../../types';
export type ImportFormat = 'auto' | 'txt' | 'md' | 'json' | 'epub' | 'html' | 'docx' | 'scrivener' | 'plottr' | 'ywriter' | 'obsidian';
export interface ImportOptions {
    format: ImportFormat;
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
    format: ImportFormat;
    confidence: number;
    evidence: string[];
}
export interface ScrivenerProject {
    metadata?: {
        title?: string;
        author?: string;
        synopsis?: string;
        labelType?: string;
    };
    folders: ScrivenerFolder[];
}
export interface ScrivenerFolder {
    typeId: number;
    title: string;
    text?: string;
    children?: ScrivenerFolder[];
}
export interface PlottrProject {
    book?: {
        title?: string;
        author?: string;
        description?: string;
    };
    chapters: PlottrChapter[];
    characters: PlottrCharacter[];
    notes: PlottrNote[];
}
export interface PlottrChapter {
    id: string;
    title: string;
    notes?: string;
    scenes: PlottrScene[];
}
export interface PlottrScene {
    id: string;
    title: string;
    notes?: string;
    content?: string;
    viewpoint?: string;
}
export interface PlottrCharacter {
    id: string;
    name: string;
    description?: string;
    goals?: string;
    conflicts?: string;
}
export interface PlottrNote {
    id: string;
    title: string;
    content: string;
}
export interface YWriterProject {
    projectTitle?: string;
    authorName?: string;
    scenes: YWriterScene[];
    characters: YWriterCharacter[];
    locations: YWriterLocation[];
    items: YWriterItem[];
    tags: YWriterTag[];
}
export interface YWriterScene {
    id: number;
    title?: string;
    desc?: string;
    content?: string;
    chapterId?: number;
}
export interface YWriterCharacter {
    id: number;
    name: string;
    bio?: string;
    goals?: string;
    fullName?: string;
}
export interface YWriterLocation {
    id: number;
    name: string;
    description?: string;
}
export interface YWriterItem {
    id: number;
    name: string;
    description?: string;
}
export interface YWriterTag {
    id: number;
    name: string;
    category?: string;
}
export declare class ImportManager {
    private defaultOptions;
    private chapterPatterns;
    private formatHints;
    constructor();
    private initializeFormatHints;
    import(content: string, options?: Partial<ImportOptions>): Promise<ImportResult>;
    importFromFile(file: File, options?: Partial<ImportOptions>): Promise<ImportResult>;
    importFromFilePath(filePath: string, format?: ImportFormat): Promise<ImportResult>;
    private detectFormatFromExtension;
    private importScrivenerZip;
    private importYWriterProject;
    private getAllFiles;
    private parseScrivenerMetadata;
    detectFormatContent(content: string, options?: Partial<ImportOptions>): FormatDetector;
    private parseTxt;
    private parseMarkdown;
    private parseJson;
    private parseHtml;
    private parseEpub;
    private parseDocx;
    private parseScrivener;
    private parsePlottr;
    private parseYWriter;
    private parseObsidian;
    private parseObsidianFrontmatter;
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