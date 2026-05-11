/**
 * Cloud Book - 小说解析器模块
 * 支持百万字级小说的智能拆解与分析
 */
import { ParseResult, ImportConfig } from '../../types';
export type { ParseResult };
export declare class NovelParser {
    private config;
    private chunkSize;
    private overlap;
    constructor(config: ImportConfig);
    parse(filePath: string): Promise<ParseResult>;
    private readFile;
    private extractBasicInfo;
    private splitChapters;
    private splitByMatches;
    private splitByLength;
    private parseChapter;
    private extractScenes;
    private extractCharacterNames;
    private extractCharacters;
    private extractWorldSettings;
    private analyzeStyle;
    private analyzeWritingPatterns;
    private calculateDistribution;
    private getDefaultStyleFingerprint;
    private countWords;
    private toChineseNumber;
}
export default NovelParser;
//# sourceMappingURL=NovelParser.d.ts.map