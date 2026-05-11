/**
 * Cloud Book - 小说解析器模块
 * 支持百万字级小说的智能拆解与分析
 */
import { ParseResult, ParsedChapter, ExtractedCharacter, ImportConfig } from '../../types';
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
    /**
     * 解析小说URL
     */
    parseFromURL(url: string): Promise<ParseResult>;
    private writeTempFile;
    private deleteTempFile;
    /**
     * 从字符串解析（不依赖文件）
     */
    parseFromString(content: string): Promise<ParseResult>;
    /**
     * 批量导入多个文件
     */
    parseMultiple(filePaths: string[]): Promise<ParseResult[]>;
    /**
     * 分析章节间的关联
     */
    analyzeChapterConnections(chapters: ParsedChapter[]): {
        previousChapter?: number;
        nextChapter?: number;
        sharedCharacters: string[];
        locationChanges: {
            from: string;
            to: string;
        }[];
    }[];
    /**
     * 生成结构化输出
     */
    generateStructuredOutput(result: ParseResult): {
        metadata: {
            title: string;
            author?: string;
            genre?: string;
            wordCount: number;
        };
        chapters: {
            number: number;
            title: string;
            wordCount: number;
            characters: string[];
        }[];
        characters: {
            name: string;
            appearances: number;
            description: string;
        }[];
        worldSettings: {
            locations: string[];
            factions: string[];
            items: string[];
        };
        style: {
            avgSentenceLength: number;
            dialogueRatio: number;
            descriptionDensity: number;
        };
    };
    private calculateAverageSentenceLength;
    /**
     * 提取章节时间线
     */
    extractTimeline(chapters: ParsedChapter[]): {
        chapter: number;
        timeIndicator: string;
        impliedTime: string;
    }[];
    /**
     * 分析人物关系网络
     */
    analyzeCharacterRelationships(characters: ExtractedCharacter[], chapters: ParsedChapter[]): {
        character1: string;
        character2: string;
        interactionCount: number;
        chapters: number[];
        relationshipType?: string;
    }[];
    private inferRelationshipType;
}
export default NovelParser;
//# sourceMappingURL=NovelParser.d.ts.map