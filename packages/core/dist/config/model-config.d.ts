/**
 * Cloud Book - 完整模型配置
 * 2026年5月12日 21:00
 * 四个模型正确配置
 */
import { LLMConfig, ModelRoute } from '../types';
export declare const MODEL_NAMES: {
    readonly DEEPSEEK_V4_FLASH: "deepseek-v4-flash";
    readonly GEMINI_25_TRUE: "gemini-2.5-flash[真流]";
    readonly GEMINI_3_FALSE: "gemini-3-flash-preview[假流]";
    readonly GEMINI_3_TRUE: "gemini-3-flash-preview[真流]";
};
export type ModelName = typeof MODEL_NAMES[keyof typeof MODEL_NAMES];
export declare const MODEL_CAPABILITIES: Record<ModelName, {
    streamingMode: 'true' | 'false';
    bestFor: string[];
    strengths: string[];
    weaknesses: string[];
}>;
export declare function createModelConfigs(): LLMConfig[];
export declare function createModelRoutes(): ModelRoute[];
export declare const API_CONFIG_INFO: {
    endpoint: any;
    apiKey: any;
    status: "ready";
};
export declare function getDefaultLLMConfig(): LLMConfig;
export type ModelCapability = {
    streamingMode: 'true' | 'false';
    bestFor: string[];
    strengths: string[];
    weaknesses: string[];
};
//# sourceMappingURL=model-config.d.ts.map