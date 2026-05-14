/**
 * Cloud Book - 联网/离线双模式智能切换管理器
 * 2026年5月14日
 * 深度优化版：确保AI始终可用，离线模式功能完整
 */

import { ConnectionMode, NetworkStatus } from '../../types';
import { NetworkManager, NetworkConfig } from '../NetworkManager/NetworkManager';
import { LocalAPIServer, LocalAPIConfig, APIKeyConfig } from '../LocalAPI/LocalAPIServer';
import { OfflineModeManager } from '../../config/offline-mode';

export interface DualModeConfig {
  network: Partial<NetworkConfig>;
  localAPI: LocalAPIConfig;
  autoSwitch: boolean;
  switchDebounceMs: number;
  fallbackMode: 'online' | 'offline';
  enableLocalCache: boolean;
  enableOfflineFallback: boolean;
}

export interface ModeTransition {
  from: ConnectionMode;
  to: ConnectionMode;
  reason: 'network_lost' | 'network_recovered' | 'manual' | 'error' | 'api_failure';
  timestamp: Date;
  automatic: boolean;
}

export interface CapabilityStatus {
  feature: string;
  online: boolean;
  offline: boolean;
  currentMode: ConnectionMode;
}

export interface DualModeStatus {
  mode: ConnectionMode;
  isOnline: boolean;
  localServerRunning: boolean;
  lastCheck: Date;
  latency?: number;
  pendingRequests: number;
  capabilities: CapabilityStatus[];
  recentTransitions: ModeTransition[];
}

export type ModeChangeCallback = (transition: ModeTransition) => void;
export type CapabilityChangeCallback = (capabilities: CapabilityStatus[]) => void;

export class DualModeManager {
  private networkManager: NetworkManager;
  private localAPIServer: LocalAPIServer | null = null;
  private offlineManager: OfflineModeManager;
  private config: DualModeConfig;
  private mode: ConnectionMode = 'online';
  private transitionHistory: ModeTransition[] = [];
  private modeChangeListeners: Set<ModeChangeCallback> = new Set();
  private capabilityChangeListeners: Set<CapabilityChangeCallback> = new Set();
  private pendingRequests: number = 0;
  private initialized: boolean = false;
  private localServerPort: number = 8080;

  constructor(config: DualModeConfig) {
    this.config = {
      network: config.network || {},
      localAPI: config.localAPI,
      autoSwitch: config.autoSwitch ?? true,
      switchDebounceMs: config.switchDebounceMs ?? 3000,
      fallbackMode: config.fallbackMode ?? 'offline',
      enableLocalCache: config.enableLocalCache ?? true,
      enableOfflineFallback: config.enableOfflineFallback ?? true
    };

    this.networkManager = new NetworkManager({
      checkInterval: this.config.network.checkInterval || 15000,
      timeout: this.config.network.timeout || 5000,
      fallbackUrls: this.config.network.fallbackUrls || [
        'https://www.google.com',
        'https://api.openai.com',
        'https://api.anthropic.com'
      ],
      autoSwitch: false,
      switchDebounceMs: this.config.switchDebounceMs
    });

    this.offlineManager = new OfflineModeManager();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.networkManager.initialize();

    this.networkManager.onStatusChange(async (status: NetworkStatus) => {
      if (this.config.autoSwitch) {
        await this.handleNetworkStatusChange(status);
      }
    });

    if (this.config.enableLocalCache) {
      await this.startLocalServer();
    }

    this.initialized = true;
    console.log('[DualModeManager] Initialized successfully');
  }

  async shutdown(): Promise<void> {
    if (this.localAPIServer) {
      await this.localAPIServer.stop();
      this.localAPIServer = null;
    }
    await this.networkManager.shutdown();
    this.initialized = false;
  }

  private async startLocalServer(): Promise<void> {
    if (this.localAPIServer) {
      return;
    }

    try {
      this.localAPIServer = new LocalAPIServer({
        port: this.localServerPort,
        apiKeys: this.config.localAPI.apiKeys || [],
        rateLimit: this.config.localAPI.rateLimit || {
          enabled: true,
          maxRequests: 100,
          windowMs: 60000
        },
        cache: this.config.localAPI.cache || {
          enabled: true,
          maxSize: 1000,
          ttl: 3600
        }
      });

      await this.localAPIServer.start();
      console.log(`[DualModeManager] Local API server started on port ${this.localServerPort}`);
    } catch (error) {
      console.error('[DualModeManager] Failed to start local server:', error);
      throw error;
    }
  }

  private async handleNetworkStatusChange(status: NetworkStatus): Promise<void> {
    const previousMode = this.mode;

    if (!status.isOnline && this.mode === 'online') {
      await this.transitionTo('offline', 'network_lost', true);
    } else if (status.isOnline && this.mode === 'offline') {
      await this.transitionTo('online', 'network_recovered', true);
    } else if (status.isOnline && this.mode === 'offline' && status.latency && status.latency < 200) {
      await this.transitionTo('online', 'network_recovered', true);
    }
  }

  private async transitionTo(
    newMode: ConnectionMode,
    reason: ModeTransition['reason'],
    automatic: boolean
  ): Promise<void> {
    const previousMode = this.mode;

    if (previousMode === newMode) {
      return;
    }

    this.mode = newMode;

    const transition: ModeTransition = {
      from: previousMode,
      to: newMode,
      reason,
      timestamp: new Date(),
      automatic
    };

    this.transitionHistory.push(transition);
    if (this.transitionHistory.length > 20) {
      this.transitionHistory.shift();
    }

    for (const listener of this.modeChangeListeners) {
      try {
        listener(transition);
      } catch (error) {
        console.error('[DualModeManager] Mode change listener error:', error);
      }
    }

    const capabilities = this.getCapabilities();
    for (const listener of this.capabilityChangeListeners) {
      try {
        listener(capabilities);
      } catch (error) {
        console.error('[DualModeManager] Capability change listener error:', error);
      }
    }

    console.log(`[DualModeManager] Mode transitioned from ${previousMode} to ${newMode} (${reason})`);
  }

  async setMode(mode: ConnectionMode): Promise<void> {
    if (this.mode === mode) {
      return;
    }

    await this.transitionTo(mode, 'manual', false);
  }

  async forceOnline(): Promise<void> {
    await this.networkManager.forceOnline();
    if (this.networkManager.isOnline()) {
      await this.transitionTo('online', 'network_recovered', false);
    }
  }

  async forceOffline(): Promise<void> {
    await this.transitionTo('offline', 'network_lost', false);
  }

  async checkConnection(): Promise<boolean> {
    return await this.networkManager.checkConnection();
  }

  getStatus(): DualModeStatus {
    return {
      mode: this.mode,
      isOnline: this.networkManager.isOnline(),
      localServerRunning: this.localAPIServer !== null,
      lastCheck: new Date(),
      latency: this.networkManager.getLatency(),
      pendingRequests: this.pendingRequests,
      capabilities: this.getCapabilities(),
      recentTransitions: this.transitionHistory.slice(-10)
    };
  }

  getMode(): ConnectionMode {
    return this.mode;
  }

  isOnline(): boolean {
    return this.mode === 'online' && this.networkManager.isOnline();
  }

  isOffline(): boolean {
    return this.mode === 'offline' || !this.networkManager.isOnline();
  }

  getNetworkStatus(): NetworkStatus {
    return this.networkManager.getStatus();
  }

  isLocalServerRunning(): boolean {
    return this.localAPIServer !== null;
  }

  async restartLocalServer(port?: number): Promise<void> {
    if (this.localAPIServer) {
      await this.localAPIServer.stop();
      this.localAPIServer = null;
    }

    if (port) {
      this.localServerPort = port;
    }

    await this.startLocalServer();
  }

  addAPIKey(config: APIKeyConfig): void {
    this.config.localAPI.apiKeys.push(config);
  }

  removeAPIKey(provider: string): void {
    this.config.localAPI.apiKeys = this.config.localAPI.apiKeys.filter(
      c => c.provider !== provider
    );
  }

  getCapabilities(): CapabilityStatus[] {
    const baseCapabilities: CapabilityStatus[] = [
      {
        feature: '项目管理',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '章节管理',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '角色管理',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '世界设定',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '大纲管理',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '导入导出',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '版本历史',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '七步创作法',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '雪花创作法',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '思维导图',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: 'RAG检索',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '内容审计',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: 'AI检测',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '一致性检查',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '目标追踪',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '多语言支持',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '快捷键',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '插件系统',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: 'LLM写作',
        online: true,
        offline: this.hasLocalAPIConfigured(),
        currentMode: this.mode
      },
      {
        feature: '智能补全',
        online: true,
        offline: this.hasLocalAPIConfigured(),
        currentMode: this.mode
      },
      {
        feature: '风格分析',
        online: true,
        offline: true,
        currentMode: this.mode
      },
      {
        feature: '趋势分析',
        online: true,
        offline: false,
        currentMode: this.mode
      },
      {
        feature: '网页爬取',
        online: true,
        offline: false,
        currentMode: this.mode
      }
    ];

    return baseCapabilities;
  }

  private hasLocalAPIConfigured(): boolean {
    return this.config.localAPI.apiKeys.length > 0;
  }

  getOfflineManager(): OfflineModeManager {
    return this.offlineManager;
  }

  setAutoSwitch(enabled: boolean): void {
    this.config.autoSwitch = enabled;
  }

  isAutoSwitchEnabled(): boolean {
    return this.config.autoSwitch;
  }

  onModeChange(callback: ModeChangeCallback): () => void {
    this.modeChangeListeners.add(callback);
    return () => this.modeChangeListeners.delete(callback);
  }

  onCapabilityChange(callback: CapabilityChangeCallback): () => void {
    this.capabilityChangeListeners.add(callback);
    return () => this.capabilityChangeListeners.delete(callback);
  }

  getTransitionHistory(): ModeTransition[] {
    return [...this.transitionHistory];
  }

  async executeWithOnlineFallback<T>(
    onlineAction: () => Promise<T>,
    offlineAction: () => Promise<T>
  ): Promise<T> {
    this.pendingRequests++;

    try {
      if (this.mode === 'online' && this.networkManager.isOnline()) {
        try {
          return await onlineAction();
        } catch (error) {
          console.error('[DualModeManager] Online action failed, falling back to offline:', error);

          if (this.config.enableOfflineFallback) {
            await this.transitionTo('offline', 'api_failure', true);
            return await offlineAction();
          }

          throw error;
        }
      } else {
        return await offlineAction();
      }
    } finally {
      this.pendingRequests--;
    }
  }
}

export default DualModeManager;
