/**
 * Cloud Book - 模型配置与路由系统
 * 2026年5月12日 20:40
 * 根据模型能力分配最佳任务
 */
import { LLMConfig, ModelRoute } from '../types';
export interface ModelCapability {
    name: string;
    streamingMode: 'true' | 'false' | 'auto';
    bestFor: string[];
    strengths: string[];
    weaknesses: string[];
}
export declare const MODEL_CAPABILITIES: Record<string, ModelCapability>;
export declare function createModelConfigs(): LLMConfig[];
export declare function createModelRoutes(): ModelRoute[];
export declare function getDefaultLLMConfig(): LLMConfig;
export declare const API_CONFIG_INFO: {
    endpoint: string;
    apiKey: string;
    status: string;
};
//# sourceMappingURL=model-config.d.ts.map