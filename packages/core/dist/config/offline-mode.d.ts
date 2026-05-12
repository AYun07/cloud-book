/**
 * Cloud Book - 离线模式完整方案
 * 2026年5月12日 04:58
 * 脱离大模型情况下所有功能可用
 */
import { BasicVectorizer } from './basic-vectorizer';
export interface OfflineCapabilities {
    feature: string;
    onlineMode: string;
    offlineMode: string;
    fullyFunctional: boolean;
}
export declare const OFFLINE_CAPABILITIES: OfflineCapabilities[];
/**
 * 离线规则审计器
 */
export declare class OfflineAuditor {
    private rules;
    constructor();
    private initRules;
    audit(content: string): {
        passed: boolean;
        issues: Array<{
            type: string;
            message: string;
            position?: number;
        }>;
        score: number;
    };
}
/**
 * 离线一致性检查器
 */
export declare class OfflineConsistencyChecker {
    private entities;
    addEntity(type: string, name: string, attributes: string[]): void;
    check(content: string): Array<{
        entity: string;
        found: boolean;
    }>;
}
/**
 * 离线模式管理器
 */
export declare class OfflineModeManager {
    private vectorizer;
    private auditor;
    private consistencyChecker;
    private isOffline;
    constructor();
    setOfflineMode(enabled: boolean): void;
    getOfflineStatus(): {
        isOffline: boolean;
        capabilities: OfflineCapabilities[];
    };
    getVectorizer(): BasicVectorizer;
    getAuditor(): OfflineAuditor;
    getConsistencyChecker(): OfflineConsistencyChecker;
    /**
     * 离线搜索
     */
    search(query: string, documents: string[], topK?: number): {
        index: number;
        score: number;
        text: string;
    }[];
    /**
     * 离线审计
     */
    audit(content: string): {
        passed: boolean;
        issues: Array<{
            type: string;
            message: string;
            position?: number;
        }>;
        score: number;
    };
}
export declare const offlineModeManager: OfflineModeManager;
export default OfflineModeManager;
//# sourceMappingURL=offline-mode.d.ts.map