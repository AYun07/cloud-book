/**
 * 网络状态管理器
 * 监测网络状态，自动切换在线/离线模式
 */
import { NetworkStatus, ConnectionMode } from '../../types';
export interface NetworkConfig {
    checkInterval: number;
    timeout: number;
    fallbackUrls: string[];
}
export declare class NetworkManager {
    private status;
    private config;
    private listeners;
    private intervalId?;
    private lastLatency?;
    constructor(config?: Partial<NetworkConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private startMonitoring;
    checkConnection(): Promise<boolean>;
    private pingUrl;
    getStatus(): NetworkStatus;
    setMode(mode: ConnectionMode): void;
    getMode(): ConnectionMode;
    onStatusChange(listener: (status: NetworkStatus) => void): () => void;
    private notifyListeners;
    forceOffline(): Promise<void>;
    forceOnline(): Promise<void>;
    getLatency(): number | undefined;
    isOnline(): boolean;
    isOffline(): boolean;
}
export default NetworkManager;
//# sourceMappingURL=NetworkManager.d.ts.map