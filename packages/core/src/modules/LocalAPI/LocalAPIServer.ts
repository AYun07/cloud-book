/**
 * 本地API代理服务
 * 支持离线状态下调用用户自备的云端API
 */

import { LLMConfig } from '../../types';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

export interface LocalAPIConfig {
  port: number;
  host?: string;
  ssl?: {
    enabled: boolean;
    keyPath?: string;
    certPath?: string;
  };
  apiKeys: APIKeyConfig[];
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  cache?: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
}

export interface APIKeyConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  models: string[];
  priority?: number;
}

export interface ProxyRequest {
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ProxyResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CacheEntry {
  request: string;
  response: ProxyResponse;
  timestamp: number;
}

export class LocalAPIServer {
  private config: LocalAPIConfig;
  private server?: http.Server | https.Server;
  private requestCounts: Map<string, number[]> = new Map();
  private cache: Map<string, CacheEntry> = new Map();

  constructor(config: LocalAPIConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: http.ServerOptions = {
        host: this.config.host || '0.0.0.0',
        port: this.config.port
      };

      if (this.config.ssl?.enabled) {
        this.server = https.createServer({
          key: fs.readFileSync(this.config.ssl.keyPath!),
          cert: fs.readFileSync(this.config.ssl.certPath!)
        }, this.handleRequest.bind(this));
      } else {
        this.server = http.createServer(this.handleRequest.bind(this));
      }

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(options.port, options.host, () => {
        console.log(`Local API Server running on ${this.config.host || '0.0.0.0'}:${this.config.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Local API Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const startTime = Date.now();

    try {
      const clientIp = req.socket.remoteAddress || 'unknown';
      
      if (this.config.rateLimit?.enabled) {
        if (!this.checkRateLimit(clientIp)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
          return;
        }
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const request: ProxyRequest = JSON.parse(body);
          const response = await this.handleProxyRequest(request);
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Response-Time': `${Date.now() - startTime}ms`
          });
          res.end(JSON.stringify(response));
        } catch (error: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } catch (error: any) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  private async handleProxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
    const cacheKey = this.getCacheKey(request);
    
    if (this.config.cache?.enabled && !request.stream) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const apiKeyConfig = this.findApiKeyConfig(request.provider, request.model);
    if (!apiKeyConfig) {
      throw new Error(`No API key configured for provider: ${request.provider}`);
    }

    const response = await this.callExternalAPI(apiKeyConfig, request);

    if (this.config.cache?.enabled && !request.stream) {
      this.setCachedResponse(cacheKey, response);
    }

    return response;
  }

  private findApiKeyConfig(provider: string, model: string): APIKeyConfig | undefined {
    return this.config.apiKeys.find(config => {
      if (config.provider !== provider) return false;
      return config.models.includes(model) || config.models.includes('*');
    });
  }

  private async callExternalAPI(config: APIKeyConfig, request: ProxyRequest): Promise<ProxyResponse> {
    const baseUrl = config.baseUrl || this.getDefaultBaseUrl(config.provider);
    
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: request.stream ?? false
      });

      const url = new URL(baseUrl);
      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 120000
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error('Invalid response from API'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  private getDefaultBaseUrl(provider: string): string {
    const baseUrls: Record<string, string> = {
      'openai': 'https://api.openai.com/v1',
      'anthropic': 'https://api.anthropic.com/v1',
      'deepseek': 'https://api.deepseek.com/v1',
      'azure': 'https://YOUR_RESOURCE.openai.azure.com',
      'google': 'https://generativelanguage.googleapis.com/v1',
      'mistral': 'https://api.mistral.ai/v1',
      'cohere': 'https://api.cohere.ai/v1',
      'together': 'https://api.together.xyz/v1',
      'groq': 'https://api.groq.com/openai/v1',
      'perplexity': 'https://api.perplexity.ai'
    };
    return baseUrls[provider] || '';
  }

  private checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit!.windowMs;
    
    const counts = this.requestCounts.get(clientIp) || [];
    const validCounts = counts.filter(t => t > windowStart);
    
    if (validCounts.length >= this.config.rateLimit!.maxRequests) {
      return false;
    }
    
    validCounts.push(now);
    this.requestCounts.set(clientIp, validCounts);
    return true;
  }

  private getCacheKey(request: ProxyRequest): string {
    const keyData = `${request.provider}:${request.model}:${JSON.stringify(request.messages)}`;
    return this.hashString(keyData);
  }

  private getCachedResponse(key: string): ProxyResponse | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    const ttl = this.config.cache!.ttl * 1000;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.response;
  }

  private setCachedResponse(key: string, response: ProxyResponse): void {
    if (this.cache.size >= this.config.cache!.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      request: key,
      response,
      timestamp: Date.now()
    });
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  getStatus(): { running: boolean; uptime: number; requests: number } {
    return {
      running: this.server !== undefined,
      uptime: 0,
      requests: Array.from(this.requestCounts.values()).reduce((sum, counts) => sum + counts.length, 0)
    };
  }
}

export class OfflineLLMManager {
  private localServer: LocalAPIServer | null = null;
  private configs: APIKeyConfig[] = [];
  private currentMode: 'online' | 'offline' = 'online';

  constructor(configs: APIKeyConfig[]) {
    this.configs = configs;
  }

  async initializeOfflineServer(port: number = 8080): Promise<void> {
    this.localServer = new LocalAPIServer({
      port,
      apiKeys: this.configs,
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000
      },
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 3600
      }
    });

    await this.localServer.start();
    this.currentMode = 'offline';
  }

  async shutdownOfflineServer(): Promise<void> {
    if (this.localServer) {
      await this.localServer.stop();
      this.localServer = null;
      this.currentMode = 'online';
    }
  }

  getMode(): 'online' | 'offline' {
    return this.currentMode;
  }

  addAPIKey(config: APIKeyConfig): void {
    this.configs.push(config);
  }

  removeAPIKey(provider: string): void {
    this.configs = this.configs.filter(c => c.provider !== provider);
  }

  async complete(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const model = options?.model || this.configs[0]?.models[0] || 'gpt-3.5-turbo';
    const provider = this.findProviderForModel(model);

    const request: ProxyRequest = {
      provider,
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 4096
    };

    if (this.currentMode === 'offline' && this.localServer) {
      return this.callLocalServer(request);
    }

    return this.callDirectAPI(request);
  }

  private findProviderForModel(model: string): string {
    for (const config of this.configs) {
      if (config.models.includes(model) || config.models.includes('*')) {
        return config.provider;
      }
    }
    return 'openai';
  }

  private async callLocalServer(request: ProxyRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(request);
      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.choices[0].message.content);
          } catch {
            reject(new Error('Invalid response'));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private async callDirectAPI(request: ProxyRequest): Promise<string> {
    const config = this.configs.find(c => c.provider === request.provider);
    if (!config) {
      throw new Error(`No configuration for provider: ${request.provider}`);
    }

    const server = new LocalAPIServer({
      port: 0,
      apiKeys: [config]
    });

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096
      });

      const baseUrl = config.baseUrl || this.getDefaultBaseUrl(config.provider);
      const url = new URL(baseUrl);
      
      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.choices[0].message.content);
          } catch {
            reject(new Error('Invalid response'));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private getDefaultBaseUrl(provider: string): string {
    const baseUrls: Record<string, string> = {
      'openai': 'https://api.openai.com/v1',
      'anthropic': 'https://api.anthropic.com/v1',
      'deepseek': 'https://api.deepseek.com/v1'
    };
    return baseUrls[provider] || '';
  }
}

export default LocalAPIServer;
