"use strict";
/**
 * 本地API代理服务
 * 支持离线状态下调用用户自备的云端API
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineLLMManager = exports.LocalAPIServer = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
class LocalAPIServer {
    config;
    server;
    requestCounts = new Map();
    cache = new Map();
    constructor(config) {
        this.config = config;
    }
    async start() {
        return new Promise((resolve, reject) => {
            const host = this.config.host || '0.0.0.0';
            const port = this.config.port;
            if (this.config.ssl?.enabled) {
                this.server = https.createServer({
                    key: fs.readFileSync(this.config.ssl.keyPath),
                    cert: fs.readFileSync(this.config.ssl.certPath)
                }, this.handleRequest.bind(this));
            }
            else {
                this.server = http.createServer(this.handleRequest.bind(this));
            }
            this.server.on('error', (err) => {
                reject(err);
            });
            this.server.listen(port, host, () => {
                console.log(`Local API Server running on ${host}:${port}`);
                resolve();
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Local API Server stopped');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    async handleRequest(req, res) {
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
                    const request = JSON.parse(body);
                    const response = await this.handleProxyRequest(request);
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'X-Response-Time': `${Date.now() - startTime}ms`
                    });
                    res.end(JSON.stringify(response));
                }
                catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        }
        catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    async handleProxyRequest(request) {
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
    findApiKeyConfig(provider, model) {
        return this.config.apiKeys.find(config => {
            if (config.provider !== provider)
                return false;
            return config.models.includes(model) || config.models.includes('*');
        });
    }
    async callExternalAPI(config, request) {
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
            const options = {
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
                        }
                        else {
                            resolve(parsed);
                        }
                    }
                    catch {
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
    getDefaultBaseUrl(provider) {
        const baseUrls = {
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
    checkRateLimit(clientIp) {
        const now = Date.now();
        const windowStart = now - this.config.rateLimit.windowMs;
        const counts = this.requestCounts.get(clientIp) || [];
        const validCounts = counts.filter(t => t > windowStart);
        if (validCounts.length >= this.config.rateLimit.maxRequests) {
            return false;
        }
        validCounts.push(now);
        this.requestCounts.set(clientIp, validCounts);
        return true;
    }
    getCacheKey(request) {
        const keyData = `${request.provider}:${request.model}:${JSON.stringify(request.messages)}`;
        return this.hashString(keyData);
    }
    getCachedResponse(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return undefined;
        const ttl = this.config.cache.ttl * 1000;
        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.response;
    }
    setCachedResponse(key, response) {
        if (this.cache.size >= this.config.cache.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, {
            request: key,
            response,
            timestamp: Date.now()
        });
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    getStatus() {
        return {
            running: this.server !== undefined,
            uptime: 0,
            requests: Array.from(this.requestCounts.values()).reduce((sum, counts) => sum + counts.length, 0)
        };
    }
}
exports.LocalAPIServer = LocalAPIServer;
class OfflineLLMManager {
    localServer = null;
    configs = [];
    currentMode = 'online';
    constructor(configs) {
        this.configs = configs;
    }
    async initializeOfflineServer(port = 8080) {
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
    async shutdownOfflineServer() {
        if (this.localServer) {
            await this.localServer.stop();
            this.localServer = null;
            this.currentMode = 'online';
        }
    }
    getMode() {
        return this.currentMode;
    }
    addAPIKey(config) {
        this.configs.push(config);
    }
    removeAPIKey(provider) {
        this.configs = this.configs.filter(c => c.provider !== provider);
    }
    async complete(prompt, options) {
        const model = options?.model || this.configs[0]?.models[0] || 'gpt-3.5-turbo';
        const provider = this.findProviderForModel(model);
        const request = {
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
    findProviderForModel(model) {
        for (const config of this.configs) {
            if (config.models.includes(model) || config.models.includes('*')) {
                return config.provider;
            }
        }
        return 'openai';
    }
    async callLocalServer(request) {
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
                    }
                    catch {
                        reject(new Error('Invalid response'));
                    }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
    async callDirectAPI(request) {
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
            const options = {
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
                    }
                    catch {
                        reject(new Error('Invalid response'));
                    }
                });
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
    getDefaultBaseUrl(provider) {
        const baseUrls = {
            'openai': 'https://api.openai.com/v1',
            'anthropic': 'https://api.anthropic.com/v1',
            'deepseek': 'https://api.deepseek.com/v1'
        };
        return baseUrls[provider] || '';
    }
}
exports.OfflineLLMManager = OfflineLLMManager;
exports.default = LocalAPIServer;
//# sourceMappingURL=LocalAPIServer.js.map