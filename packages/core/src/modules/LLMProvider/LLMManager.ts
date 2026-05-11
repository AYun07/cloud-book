/**
 * Cloud Book - 多模型支持模块
 * 支持所有主流大模型和本地部署
 */

import { LLMConfig, ModelRoute } from '../../types';

export type ModelProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'deepseek' 
  | 'ollama' 
  | 'koboldcpp' 
  | 'lmstudio'
  | 'custom';

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface LLMProvider {
  name: string;
  provider: ModelProvider;
  generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  stream?(
    prompt: string, 
    options: GenerationOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

export class LLMManager {
  private providers: Map<string, LLMProvider> = new Map();
  private routes: ModelRoute[] = [];
  private defaultProvider?: string;
  
  constructor() {
    this.registerBuiltinProviders();
  }

  /**
   * 注册内置提供者
   */
  private registerBuiltinProviders() {
    // OpenAI
    this.registerProvider({
      name: 'openai',
      provider: 'openai',
      generate: async (prompt, options) => {
        const config = this.getConfig('openai');
        return this.callOpenAICompatibleAPI(config, prompt, options);
      },
      stream: async (prompt, options, onChunk) => {
        const config = this.getConfig('openai');
        await this.streamOpenAICompatibleAPI(config, prompt, options, onChunk);
      }
    });

    // Anthropic
    this.registerProvider({
      name: 'anthropic',
      provider: 'anthropic',
      generate: async (prompt, options) => {
        const config = this.getConfig('anthropic');
        return this.callAnthropicAPI(config, prompt, options);
      }
    });

    // DeepSeek
    this.registerProvider({
      name: 'deepseek',
      provider: 'deepseek',
      generate: async (prompt, options) => {
        const config = this.getConfig('deepseek');
        return this.callOpenAICompatibleAPI(config, prompt, options);
      }
    });

    // Ollama (本地)
    this.registerProvider({
      name: 'ollama',
      provider: 'ollama',
      generate: async (prompt, options) => {
        const config = this.getConfig('ollama');
        return this.callOllamaAPI(config, prompt, options);
      }
    });

    // KoboldCPP (本地)
    this.registerProvider({
      name: 'koboldcpp',
      provider: 'koboldcpp',
      generate: async (prompt, options) => {
        const config = this.getConfig('koboldcpp');
        return this.callKoboldAPI(config, prompt, options);
      }
    });
  }

  /**
   * 注册自定义提供者
   */
  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  /**
   * 添加模型配置
   */
  addModel(config: LLMConfig) {
    const provider = this.getProviderForConfig(config);
    if (provider) {
      this.providers.set(config.name, provider);
    }
    
    // 设置默认
    if (!this.defaultProvider) {
      this.defaultProvider = config.name;
    }
  }

  /**
   * 根据配置获取提供者
   */
  private getProviderForConfig(config: LLMConfig): LLMProvider | null {
    const baseProvider = config.provider === 'custom' 
      ? 'openai' // custom 默认使用 OpenAI 兼容格式
      : config.provider;
    
    const base = this.providers.get(baseProvider);
    if (!base) return null;

    // 返回一个包装后的提供者
    return {
      name: config.name,
      provider: config.provider,
      generate: async (prompt, options) => {
        return base.generate(prompt, options);
      }
    };
  }

  /**
   * 获取模型配置
   */
  private modelConfigs: Map<string, LLMConfig> = new Map();

  addConfig(config: LLMConfig) {
    this.modelConfigs.set(config.name, config);
    this.addModel(config);
  }

  getConfig(name: string): LLMConfig | undefined {
    return this.modelConfigs.get(name);
  }

  /**
   * 生成文本
   */
  async generate(
    prompt: string, 
    modelName?: string, 
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const name = modelName || this.defaultProvider;
    const provider = this.providers.get(name || '');
    
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }
    
    return provider.generate(prompt, options);
  }

  /**
   * 流式生成
   */
  async stream(
    prompt: string,
    modelName: string | undefined,
    options: GenerationOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const name = modelName || this.defaultProvider;
    const provider = this.providers.get(name || '');
    
    if (!provider?.stream) {
      throw new Error(`Streaming not supported for: ${name}`);
    }
    
    return provider.stream(prompt, options, onChunk);
  }

  /**
   * 设置模型路由
   */
  setRoutes(routes: ModelRoute[]) {
    this.routes = routes;
  }

  /**
   * 根据任务类型路由
   */
  route(task: ModelRoute['task']): LLMConfig | undefined {
    const route = this.routes.find(r => r.task === task);
    return route?.llmConfig;
  }

  /**
   * 设置默认模型
   */
  setDefault(modelName: string) {
    this.defaultProvider = modelName;
  }

  /**
   * 获取所有模型
   */
  listModels(): LLMConfig[] {
    return Array.from(this.modelConfigs.values());
  }

  /**
   * 调用 OpenAI 兼容 API
   */
  private async callOpenAICompatibleAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.openai.com/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty,
        presence_penalty: options?.presencePenalty,
        stop: options?.stop
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      model: config.model,
      finishReason: data.choices[0]?.finish_reason
    };
  }

  /**
   * 流式调用 OpenAI 兼容 API
   */
  private async streamOpenAICompatibleAPI(
    config: LLMConfig,
    prompt: string,
    options: GenerationOptions & { stream: true },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const endpoint = config.endpoint || 'https://api.openai.com/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropicAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'https://api.anthropic.com/v1';
    
    const response = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      text: data.content?.[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      model: config.model,
      finishReason: data.stop_reason
    };
  }

  /**
   * 调用 Ollama API
   */
  private async callOllamaAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'http://localhost:11434';
    
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000,
          top_p: options?.topP
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      text: data.response || '',
      model: config.model
    };
  }

  /**
   * 调用 KoboldAPI
   */
  private async callKoboldAPI(
    config: LLMConfig,
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const endpoint = config.endpoint || 'http://localhost:5000';
    
    const response = await fetch(`${endpoint}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        max_length: options?.maxTokens ?? 512,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP ?? 0.9,
        rep_pen: options?.frequencyPenalty ?? 1.1
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      text: data.results?.[0]?.text || '',
      model: config.model
    };
  }
}

export default LLMManager;
