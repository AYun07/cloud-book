/**
 * Cover Generator - 封面生成模块
 * 生成小说封面
 */
import { CoverConfig, NovelProject } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
export interface CoverDesign {
    title: string;
    subtitle?: string;
    style: string;
    colorScheme: string[];
    elements: CoverElement[];
    layout: 'vertical' | 'horizontal';
    description: string;
}
export interface CoverElement {
    type: 'character' | 'background' | 'symbol' | 'text' | 'decoration';
    position: {
        x: number;
        y: number;
    };
    size?: {
        width: number;
        height: number;
    };
    description: string;
}
export declare class CoverGenerator {
    private llmManager;
    constructor(llmManager: LLMManager);
    generateDesign(project: Partial<NovelProject>, config?: CoverConfig): Promise<CoverDesign>;
    generateImagePrompt(project: Partial<NovelProject>, config?: CoverConfig): Promise<string>;
    private buildDesignPrompt;
    private parseDesignResponse;
    private buildImagePrompt;
    generateStyleVariations(project: Partial<NovelProject>): Promise<CoverDesign[]>;
    private getRandomColor;
}
export default CoverGenerator;
//# sourceMappingURL=CoverGenerator.d.ts.map