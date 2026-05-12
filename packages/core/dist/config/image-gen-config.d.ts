/**
 * Cloud Book - 图像生成配置
 * 2026年5月12日 04:55
 */
export interface ImageGenConfig {
    provider: 'siliconflow' | 'openai' | 'midjourney' | 'local';
    baseURL: string;
    apiKey: string;
    model: string;
    defaultSize?: string;
    defaultSteps?: number;
}
export declare const IMAGE_GEN_PROVIDERS: Record<string, ImageGenConfig>;
export declare const DEFAULT_IMAGE_CONFIG: ImageGenConfig;
export declare function generateImage(prompt: string, config?: ImageGenConfig, options?: {
    size?: string;
    steps?: number;
    negativePrompt?: string;
}): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
}>;
export declare function buildCoverPrompt(title: string, genre: string, style?: string): string;
declare const _default: {
    IMAGE_GEN_PROVIDERS: Record<string, ImageGenConfig>;
    DEFAULT_IMAGE_CONFIG: ImageGenConfig;
    generateImage: typeof generateImage;
    buildCoverPrompt: typeof buildCoverPrompt;
};
export default _default;
//# sourceMappingURL=image-gen-config.d.ts.map