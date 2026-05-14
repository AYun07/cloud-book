/**
 * Cover Generator - 封面生成模块
 * 支持 AI 封面设计（使用 DALL-E 真实图片生成）
 */
import { CoverConfig, CoverImageOptions, NovelProject } from '../../types';
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
export interface CoverImageResult {
    url?: string;
    base64?: string;
    revisedPrompt?: string;
    model: string;
    imageSize: string;
    generationId?: string;
}
export interface ImageGenerationProgress {
    status: 'submitted' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: CoverImageResult;
    error?: string;
}
export declare class CoverGenerator {
    private llmManager;
    private defaultApiKey?;
    private defaultEndpoint?;
    constructor(llmManager: LLMManager);
    setDefaultCredentials(apiKey: string, endpoint?: string): void;
    generateDesign(project: Partial<NovelProject>, config?: CoverConfig): Promise<CoverDesign>;
    generateImagePrompt(project: Partial<NovelProject>, config?: CoverConfig): Promise<string>;
    generateImage(project: Partial<NovelProject>, config?: CoverConfig): Promise<CoverImageResult>;
    generateImageFromPrompt(prompt: string, apiKey?: string, endpoint?: string, options?: CoverImageOptions): Promise<CoverImageResult>;
    generateImageBase64(project: Partial<NovelProject>, config?: CoverConfig): Promise<CoverImageResult>;
    generateVariations(project: Partial<NovelProject>, config?: CoverConfig, count?: number): Promise<CoverImageResult[]>;
    private callDalleAPI;
    private optimizePrompt;
    private buildDesignPrompt;
    private parseDesignResponse;
    private buildImagePrompt;
    generateStyleVariations(project: Partial<NovelProject>): Promise<CoverDesign[]>;
    private getRandomColor;
}
export default CoverGenerator;
//# sourceMappingURL=CoverGenerator.d.ts.map