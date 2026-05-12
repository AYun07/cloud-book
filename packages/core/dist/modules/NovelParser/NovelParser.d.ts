/**
 * Cloud Book - 高性能小说解析器
 * 支持千万字级文学作品解析
 */
import { ParseResult } from '../../types';
export interface ParserConfig {
    enableStreaming?: boolean;
    enableSmartChaptering?: boolean;
    extractCharacters?: boolean;
    extractSetting?: boolean;
    chunkSize?: number;
    maxMemoryLimit?: number;
}
export interface ParserProgress {
    totalBytes: number;
    totalChapters: number;
    totalCharacters: number;
    status: 'parsing' | 'analyzing' | 'extracting' | 'complete';
    currentPhase: string;
    error?: string;
}
export declare class NovelParser {
    private config;
    private progress;
    private onProgress?;
    constructor(config?: ParserConfig);
    setProgressCallback(callback: (progress: ParserProgress) => void): void;
    countWords(text: string): number;
    parseString(content: string): Promise<ParseResult>;
    parseFile(filePath: string): Promise<ParseResult>;
    private splitChapters;
    private extractCharacters;
    private extractWorldSetting;
    private analyzeStyle;
    private extractTitle;
    private detectLanguage;
    private detectGenre;
    private updateProgress;
}
export default NovelParser;
//# sourceMappingURL=NovelParser.d.ts.map