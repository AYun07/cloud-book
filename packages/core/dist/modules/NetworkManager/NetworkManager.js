"use strict";
/**
 * 网络状态管理器
 * 监测网络状态，自动切换在线/离线模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkManager = void 0;
class NetworkManager {
    status;
    config;
    listeners = new Set();
    intervalId;
    lastLatency;
    constructor(config) {
        this.config = {
            checkInterval: config?.checkInterval || 30000,
            timeout: config?.timeout || 5000,
            fallbackUrls: config?.fallbackUrls || [
                'https://www.google.com',
                'https://www.baidu.com',
                'https://api.openai.com'
            ]
        };
        this.status = {
            isOnline: true,
            lastCheck: new Date(),
            mode: 'online',
            fallbackAvailable: true
        };
    }
    async initialize() {
        await this.checkConnection();
        this.startMonitoring();
    }
    async shutdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
    startMonitoring() {
        this.intervalId = setInterval(() => {
            this.checkConnection();
        }, this.config.checkInterval);
    }
    async checkConnection() {
        const previousStatus = { ...this.status };
        try {
            const results = await Promise.all(this.config.fallbackUrls.map(url => this.pingUrl(url)));
            const successfulPings = results.filter(r => r.success);
            if (successfulPings.length > 0) {
                this.status.isOnline = true;
                this.status.lastCheck = new Date();
                this.status.latency = Math.min(...successfulPings.map(r => r.latency));
                this.status.fallbackAvailable = true;
                this.lastLatency = this.status.latency;
            }
            else {
                this.status.isOnline = false;
                this.status.lastCheck = new Date();
                this.status.fallbackAvailable = false;
            }
        }
        catch (error) {
            this.status.isOnline = false;
            this.status.lastCheck = new Date();
            this.status.fallbackAvailable = false;
        }
        if (previousStatus.isOnline !== this.status.isOnline) {
            this.notifyListeners();
        }
        return this.status.isOnline;
    }
    async pingUrl(url) {
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
        }
        catch {
            return { success: false };
        }
    }
    getStatus() {
        return { ...this.status };
    }
    setMode(mode) {
        this.status.mode = mode;
        this.notifyListeners();
    }
    getMode() {
        return this.status.mode;
    }
    onStatusChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.status);
            }
            catch (error) {
                console.error('Network status listener error:', error);
            }
        }
    }
    async forceOffline() {
        this.status.isOnline = false;
        this.status.lastCheck = new Date();
        this.notifyListeners();
    }
    async forceOnline() {
        const wasOffline = !this.status.isOnline;
        await this.checkConnection();
        if (wasOffline && this.status.isOnline) {
            this.notifyListeners();
        }
    }
    getLatency() {
        return this.lastLatency;
    }
    isOnline() {
        return this.status.isOnline;
    }
    isOffline() {
        return !this.status.isOnline;
    }
}
exports.NetworkManager = NetworkManager;
exports.default = NetworkManager;
//# sourceMappingURL=NetworkManager.js.map