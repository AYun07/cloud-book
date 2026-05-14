/**
 * 网络状态管理器
 * 监测网络状态，支持在线/离线模式手动和自动切换
 */
import { NetworkStatus, ConnectionMode } from '../../types';
export interface NetworkConfig {
    checkInterval: number;
    timeout: number;
    fallbackUrls: string[];
    autoSwitch?: boolean;
    switchDebounceMs?: number;
}
export type ModeSwitchCallback = (newMode: ConnectionMode, reason: 'network_recovered' | 'network_lost' | 'manual') => void;
export declare class NetworkManager {
    private status;
    private config;
    private listeners;
    private modeSwitchListeners;
    private intervalId?;
    private lastLatency?;
    private switchDebounceTimer?;
    private wasOnline;
    constructor(config?: Partial<NetworkConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private startMonitoring;
    checkConnection(): Promise<boolean>;
    private handleNetworkStateChange;
    private performModeSwitch;
    private pingUrl;
    getStatus(): NetworkStatus;
    setMode(mode: ConnectionMode): void;
    getMode(): ConnectionMode;
    setAutoSwitch(enabled: boolean): void;
    isAutoSwitchEnabled(): boolean;
    onStatusChange(listener: (status: NetworkStatus) => void): () => void;
    onModeSwitch(listener: ModeSwitchCallback): () => void;
    private notifyListeners;
    switchToOnline(): Promise<void>;
    switchToOffline(): Promise<void>;
    switchToHybrid(): Promise<void>;
    forceOffline(): Promise<void>;
    forceOnline(): Promise<void>;
    getLatency(): number | undefined;
    isOnline(): boolean;
    isOffline(): boolean;
}
export default NetworkManager;
//# sourceMappingURL=NetworkManager.d.ts.map