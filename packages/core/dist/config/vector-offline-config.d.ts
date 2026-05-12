/**
 * Cloud Book - 向量与离线配置
 * 2026年5月12日 05:13
 *
 * 向量方案：
 * - advanced-v2: 高性能无模型向量方案（推荐，匹敌大模型）
 * - basic: 基础无模型向量方案
 * - llm-simulated: LLM模拟
 * - openai/siliconflow: 在线API
 *
 * 离线模式：本地Ollama接口（可选）
 */
export interface VectorConfig {
    provider: 'advanced-v2' | 'basic' | 'llm-simulated' | 'openai' | 'siliconflow' | 'local';
    baseURL?: string;
    apiKey?: string;
    model?: string;
    dimensions: number;
}
export interface OfflineConfig {
    enabled: boolean;
    ollamaURL: string;
    defaultModel: string;
    models: {
        writing: string;
        embedding: string;
    };
}
export declare const VECTOR_CONFIG: VectorConfig;
export declare const OFFLINE_CONFIG: OfflineConfig;
export declare const ALL_PROVIDER_CONFIGS: {
    writing: {
        online: {
            name: string;
            provider: string;
            endpoint: string;
        }[];
        offline: {
            name: string;
            provider: string;
            endpoint: string;
        }[];
    };
    audit: {
        online: {
            name: string;
            provider: string;
            endpoint: string;
        }[];
        offline: {
            name: string;
            provider: string;
            endpoint: string;
        }[];
    };
    image: {
        online: {
            name: string;
            provider: string;
            endpoint: string;
        }[];
        offline: any[];
    };
};
export declare function getProviderConfig(type: 'writing' | 'audit' | 'image', mode: 'online' | 'offline'): any[] | {
    name: string;
    provider: string;
    endpoint: string;
}[] | {
    name: string;
    provider: string;
    endpoint: string;
}[] | {
    name: string;
    provider: string;
    endpoint: string;
}[] | {
    name: string;
    provider: string;
    endpoint: string;
}[] | {
    name: string;
    provider: string;
    endpoint: string;
}[];
declare const _default: {
    VECTOR_CONFIG: VectorConfig;
    OFFLINE_CONFIG: OfflineConfig;
    ALL_PROVIDER_CONFIGS: {
        writing: {
            online: {
                name: string;
                provider: string;
                endpoint: string;
            }[];
            offline: {
                name: string;
                provider: string;
                endpoint: string;
            }[];
        };
        audit: {
            online: {
                name: string;
                provider: string;
                endpoint: string;
            }[];
            offline: {
                name: string;
                provider: string;
                endpoint: string;
            }[];
        };
        image: {
            online: {
                name: string;
                provider: string;
                endpoint: string;
            }[];
            offline: any[];
        };
    };
    getProviderConfig: typeof getProviderConfig;
};
export default _default;
//# sourceMappingURL=vector-offline-config.d.ts.map