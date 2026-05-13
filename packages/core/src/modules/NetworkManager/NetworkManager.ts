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

export class NetworkManager {
  private status: NetworkStatus;
  private config: NetworkConfig;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private modeSwitchListeners: Set<ModeSwitchCallback> = new Set();
  private intervalId?: NodeJS.Timeout;
  private lastLatency?: number;
  private switchDebounceTimer?: NodeJS.Timeout;
  private wasOnline: boolean = true;

  constructor(config?: Partial<NetworkConfig>) {
    this.config = {
      checkInterval: config?.checkInterval || 30000,
      timeout: config?.timeout || 5000,
      fallbackUrls: config?.fallbackUrls || [
        'https://www.google.com',
        'https://www.baidu.com',
        'https://api.openai.com'
      ],
      autoSwitch: config?.autoSwitch ?? true,
      switchDebounceMs: config?.switchDebounceMs ?? 2000
    };

    this.status = {
      isOnline: true,
      lastCheck: new Date(),
      mode: 'online',
      fallbackAvailable: true
    };
    this.wasOnline = true;
  }

  async initialize(): Promise<void> {
    await this.checkConnection();
    this.startMonitoring();
  }

  async shutdown(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.switchDebounceTimer) {
      clearTimeout(this.switchDebounceTimer);
      this.switchDebounceTimer = undefined;
    }
  }

  private startMonitoring(): void {
    this.intervalId = setInterval(() => {
      this.checkConnection();
    }, this.config.checkInterval);
  }

  async checkConnection(): Promise<boolean> {
    const previousStatus = { ...this.status };

    try {
      const results = await Promise.all(
        this.config.fallbackUrls.map(url => this.pingUrl(url))
      );

      const successfulPings = results.filter(r => r.success);
      
      if (successfulPings.length > 0) {
        this.status.isOnline = true;
        this.status.lastCheck = new Date();
        this.status.latency = Math.min(...successfulPings.map(r => r.latency!));
        this.status.fallbackAvailable = true;
        this.lastLatency = this.status.latency;
      } else {
        this.status.isOnline = false;
        this.status.lastCheck = new Date();
        this.status.fallbackAvailable = false;
      }
    } catch (error) {
      this.status.isOnline = false;
      this.status.lastCheck = new Date();
      this.status.fallbackAvailable = false;
    }

    if (previousStatus.isOnline !== this.status.isOnline) {
      this.handleNetworkStateChange(previousStatus.isOnline, this.status.isOnline);
    }

    return this.status.isOnline;
  }

  private handleNetworkStateChange(wasOnline: boolean, isNowOnline: boolean): void {
    if (!this.config.autoSwitch || this.status.mode !== 'hybrid') {
      this.notifyListeners();
      return;
    }

    if (this.switchDebounceTimer) {
      clearTimeout(this.switchDebounceTimer);
    }

    this.switchDebounceTimer = setTimeout(() => {
      if (isNowOnline && !wasOnline) {
        this.performModeSwitch('offline', 'online', 'network_recovered');
      } else if (!isNowOnline && wasOnline) {
        this.performModeSwitch('online', 'offline', 'network_lost');
      }
      this.notifyListeners();
    }, this.config.switchDebounceMs);
  }

  private performModeSwitch(
    fromMode: ConnectionMode,
    toMode: ConnectionMode,
    reason: 'network_recovered' | 'network_lost' | 'manual'
  ): void {
    this.status.mode = toMode;
    
    for (const listener of this.modeSwitchListeners) {
      try {
        listener(toMode, reason);
      } catch (error) {
        console.error('Mode switch listener error:', error);
      }
    }
  }

  private async pingUrl(url: string): Promise<{ success: boolean; latency?: number }> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch {
      return { success: false };
    }
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  setMode(mode: ConnectionMode): void {
    const previousMode = this.status.mode;
    if (previousMode !== mode) {
      this.performModeSwitch(previousMode, mode, 'manual');
    }
  }

  getMode(): ConnectionMode {
    return this.status.mode;
  }

  setAutoSwitch(enabled: boolean): void {
    this.config.autoSwitch = enabled;
  }

  isAutoSwitchEnabled(): boolean {
    return this.config.autoSwitch ?? true;
  }

  onStatusChange(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onModeSwitch(listener: ModeSwitchCallback): () => void {
    this.modeSwitchListeners.add(listener);
    return () => this.modeSwitchListeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Network status listener error:', error);
      }
    }
  }

  async switchToOnline(): Promise<void> {
    if (this.status.mode === 'offline' || this.status.mode === 'hybrid') {
      await this.checkConnection();
      if (this.status.isOnline) {
        this.setMode('online');
      }
    }
  }

  async switchToOffline(): Promise<void> {
    if (this.status.mode === 'online' || this.status.mode === 'hybrid') {
      this.setMode('offline');
    }
  }

  async switchToHybrid(): Promise<void> {
    this.setMode('hybrid');
    await this.checkConnection();
  }

  async forceOffline(): Promise<void> {
    this.status.isOnline = false;
    this.status.lastCheck = new Date();
    this.notifyListeners();
  }

  async forceOnline(): Promise<void> {
    const wasOffline = !this.status.isOnline;
    await this.checkConnection();
    
    if (wasOffline && this.status.isOnline) {
      this.notifyListeners();
    }
  }

  getLatency(): number | undefined {
    return this.lastLatency;
  }

  isOnline(): boolean {
    return this.status.isOnline;
  }

  isOffline(): boolean {
    return !this.status.isOnline;
  }
}

export default NetworkManager;
