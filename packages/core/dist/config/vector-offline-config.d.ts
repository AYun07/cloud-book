/**
 * Cloud Book - 向量与离线配置
 * 2026年5月12日 04:55
 *
 * 向量方案：使用LLM模拟生成embedding
 * 离线模式：本地Ollama接口（可选）
 */
export interface VectorConfig {
    provider: 'llm-simulated' | 'openai' | 'siliconflow' | 'local';
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