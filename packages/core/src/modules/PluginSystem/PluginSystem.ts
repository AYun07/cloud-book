/**
 * Plugin System - 插件系统
 * 支持扩展命令、钩子以及 Lua 风格扩展
 */

import { Plugin, PluginCommand, PluginHook } from '../../types';
import { LuaInterpreter, LuaPlugin, LuaExecutionResult, LuaValue } from './LuaInterpreter';

export interface PluginContext {
  projectId?: string;
  chapterId?: string;
  userId?: string;
  [key: string]: any;
}

export interface HookPayload {
  name?: string;
  context?: PluginContext;
  data?: any;
  commandName?: string;
  args?: any;
  result?: any;
  error?: string;
  [key: string]: any;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface LuaPluginInfo {
  id: string;
  name: string;
  enabled: boolean;
  registeredAt: Date;
}

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private commands: Map<string, PluginCommand> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private storagePath: string;
  private luaPlugins: Map<string, LuaPlugin> = new Map();
  private luaInterpreters: Map<string, LuaInterpreter> = new Map();
  private defaultLuaInterpreter: LuaInterpreter;
  private luaBridgeFunctions: Map<string, (...args: any[]) => any> = new Map();

  constructor(storagePath: string = './data/plugins') {
    this.storagePath = storagePath;
    this.defaultLuaInterpreter = new LuaInterpreter();
    this.setupLuaBridge();
  }

  private currentContext: PluginContext = {};
  
  private setupLuaBridge(): void {
    this.registerLuaBridgeFunction('log', (args: any[]) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      console.log('[Lua]', message);
      return message;
    });

    this.registerLuaBridgeFunction('getContext', () => {
      return this.currentContext;
    });

    this.registerLuaBridgeFunction('setContext', (args: any[]) => {
      const [key, value] = args;
      if (typeof key === 'string') {
        this.currentContext[key] = value;
        return { key, value, success: true };
      }
      return { success: false, error: 'Key must be a string' };
    });

    this.registerLuaBridgeFunction('executeCommand', async (args: any[]) => {
      const [commandName, params] = args;
      if (typeof commandName !== 'string') {
        return { success: false, error: 'Command name must be a string' };
      }
      try {
        const result = await this.executeCommand(commandName, params || {}, this.currentContext);
        return result;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    this.registerLuaBridgeFunction('triggerHook', async (args: any[]) => {
      const [hookName, data] = args;
      if (typeof hookName !== 'string') {
        return { success: false, error: 'Hook name must be a string' };
      }
      try {
        await this.triggerHook(hookName, { ...this.currentContext, data });
        return { success: true, hookName };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });
  }

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    this.validatePlugin(plugin);
    
    this.plugins.set(plugin.id, plugin);

    for (const command of plugin.commands || []) {
      if (this.commands.has(command.name)) {
        console.warn(`Command ${command.name} is already registered by another plugin`);
        continue;
      }
      this.commands.set(command.name, command);
    }

    for (const hook of plugin.hooks || []) {
      const existing = this.hooks.get(hook.name) || [];
      existing.push(hook);
      this.hooks.set(hook.name, existing);
    }
  }

  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    for (const command of plugin.commands || []) {
      this.commands.delete(command.name);
    }

    for (const hook of plugin.hooks || []) {
      const existing = this.hooks.get(hook.name) || [];
      const filtered = existing.filter(h => h !== hook);
      if (filtered.length > 0) {
        this.hooks.set(hook.name, filtered);
      } else {
        this.hooks.delete(hook.name);
      }
    }

    this.plugins.delete(pluginId);
  }

  async executeCommand(
    commandName: string, 
    args: any, 
    context: PluginContext
  ): Promise<CommandResult> {
    const command = this.commands.get(commandName);
    if (!command) {
      return { success: false, error: `Command ${commandName} not found` };
    }

    try {
      await this.triggerHook('beforeCommand', { commandName, args, ...context });
      
      const result = await command.execute({ ...args, context });
      
      await this.triggerHook('afterCommand', { commandName, result, ...context });
      
      return { success: true, data: result };
    } catch (error: any) {
      await this.triggerHook('onCommandError', { commandName, error: error.message, ...context });
      return { success: false, error: error.message };
    }
  }

  async triggerHook(hookName: string, payload: HookPayload): Promise<void> {
    const hookList = this.hooks.get(hookName);
    if (!hookList || hookList.length === 0) return;

    for (const hook of hookList) {
      try {
        await hook.callback(payload);
      } catch (error) {
        console.error(`Hook ${hookName} failed:`, error);
      }
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getCommand(commandName: string): PluginCommand | undefined {
    return this.commands.get(commandName);
  }

  getAllCommands(): PluginCommand[] {
    return Array.from(this.commands.values());
  }

  getAvailableHooks(): string[] {
    return Array.from(this.hooks.keys());
  }

  async listPlugins(): Promise<{ id: string; name: string; version: string }[]> {
    return Array.from(this.plugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      version: p.version
    }));
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.id) throw new Error('Plugin must have an id');
    if (!plugin.name) throw new Error('Plugin must have a name');
    if (!plugin.version) throw new Error('Plugin must have a version');
    if (!plugin.author) throw new Error('Plugin must have an author');
  }

  async saveState(): Promise<void> {
    try {
      const fs = require('fs');
      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
      }
      
      const state = {
        plugins: Array.from(this.plugins.entries())
      };
      
      fs.writeFileSync(
        `${this.storagePath}/plugins.json`,
        JSON.stringify(state, null, 2)
      );
    } catch (error) {
      console.error('Failed to save plugin state:', error);
    }
  }

  async loadState(): Promise<void> {
    try {
      const fs = require('fs');
      const filePath = `${this.storagePath}/plugins.json`;
      
      if (fs.existsSync(filePath)) {
        const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const [id, plugin] of state.plugins) {
          this.plugins.set(id, plugin as Plugin);
        }
      }
    } catch (error) {
      console.error('Failed to load plugin state:', error);
    }
  }

  public async loadLuaPlugin(pluginConfig: { id: string; name: string; script: string }): Promise<{ success: boolean; error?: string }> {
    if (this.luaPlugins.has(pluginConfig.id)) {
      return { success: false, error: `Lua plugin ${pluginConfig.id} is already loaded` };
    }

    try {
      const interpreter = new LuaInterpreter();
      this.setupLuaBridgeFunctions(interpreter);
      
      const result = interpreter.execute(pluginConfig.script);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const luaPlugin: LuaPlugin = {
        id: pluginConfig.id,
        name: pluginConfig.name,
        script: pluginConfig.script,
        enabled: true
      };

      this.luaPlugins.set(pluginConfig.id, luaPlugin);
      this.luaInterpreters.set(pluginConfig.id, interpreter);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private setupLuaBridgeFunctions(interpreter: LuaInterpreter): void {
    this.luaBridgeFunctions.forEach((fn, name) => {
      interpreter.setGlobal(name, {
        type: 'function',
        value: (args: LuaValue[]) => {
          const jsArgs = args.map(a => this.luaValueToJs(a));
          const result = fn(jsArgs);
          return this.jsToLuaValue(result);
        }
      });
    });
  }

  public executeLuaScript(script: string, pluginId?: string): LuaExecutionResult {
    const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
    if (!interpreter) {
      return { success: false, error: 'Lua interpreter not found' };
    }

    if (pluginId) {
      this.setupLuaBridgeFunctions(interpreter);
    }

    return interpreter.execute(script);
  }

  public executeLuaFunction(pluginId: string, functionName: string, ...args: any[]): LuaExecutionResult {
    const interpreter = this.luaInterpreters.get(pluginId);
    if (!interpreter) {
      return { success: false, error: `Lua plugin ${pluginId} not found` };
    }

    try {
      const globalFn = interpreter.getGlobal(functionName);
      if (!globalFn || globalFn.type !== 'function') {
        return { success: false, error: `Function ${functionName} not found` };
      }

      const luaArgs = args.map(a => this.jsToLuaValue(a));
      
      if (typeof globalFn.value === 'function') {
        const result = (globalFn.value as (args: LuaValue[]) => LuaValue)(luaArgs);
        return { success: true, returnValue: result };
      } else {
        const func = globalFn.value as { params: string[]; body: any[]; closure: Map<string, LuaValue> };
        const funcScope = new Map(func.closure);
        for (let i = 0; i < func.params.length; i++) {
          funcScope.set(func.params[i], luaArgs[i] || { type: 'nil', value: null });
        }
        let result: LuaValue = { type: 'nil', value: null };
        for (const stmt of func.body) {
          result = interpreter.executeStatement(stmt, funcScope);
        }
        return { success: true, returnValue: result };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public unloadLuaPlugin(pluginId: string): { success: boolean; error?: string } {
    if (!this.luaPlugins.has(pluginId)) {
      return { success: false, error: `Lua plugin ${pluginId} not found` };
    }

    this.luaPlugins.delete(pluginId);
    this.luaInterpreters.delete(pluginId);

    return { success: true };
  }

  public enableLuaPlugin(pluginId: string): { success: boolean; error?: string } {
    const plugin = this.luaPlugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Lua plugin ${pluginId} not found` };
    }

    plugin.enabled = true;
    return { success: true };
  }

  public disableLuaPlugin(pluginId: string): { success: boolean; error?: string } {
    const plugin = this.luaPlugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Lua plugin ${pluginId} not found` };
    }

    plugin.enabled = false;
    return { success: true };
  }

  public getLuaPlugins(): LuaPluginInfo[] {
    return Array.from(this.luaPlugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      enabled: p.enabled,
      registeredAt: new Date()
    }));
  }

  public getLuaPlugin(pluginId: string): LuaPlugin | undefined {
    return this.luaPlugins.get(pluginId);
  }

  public registerLuaBridgeFunction(name: string, fn: (...args: any[]) => any): void {
    this.luaBridgeFunctions.set(name, fn);
  }

  public setLuaGlobal(pluginId: string | null, name: string, value: any): void {
    const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
    if (interpreter) {
      interpreter.setGlobal(name, this.jsToLuaValue(value));
    }
  }

  public getLuaGlobal(pluginId: string | null, name: string): any {
    const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
    if (interpreter) {
      const value = interpreter.getGlobal(name);
      return value ? this.luaValueToJs(value) : undefined;
    }
    return undefined;
  }

  private jsToLuaValue(value: any): LuaValue {
    if (value === null || value === undefined) return { type: 'nil', value: null };
    if (typeof value === 'number') return { type: 'number', value };
    if (typeof value === 'string') return { type: 'string', value };
    if (typeof value === 'boolean') return { type: 'boolean', value };
    if (Array.isArray(value)) {
      return {
        type: 'table',
        value: {
          array: value.map(v => this.jsToLuaValue(v)),
          dict: new Map()
        }
      };
    }
    if (typeof value === 'object') {
      const dict = new Map<string, LuaValue>();
      for (const [k, v] of Object.entries(value)) {
        dict.set(k, this.jsToLuaValue(v));
      }
      return { type: 'table', value: { array: [], dict } };
    }
    return { type: 'userdata', value };
  }

  private luaValueToJs(value: LuaValue): any {
    switch (value.type) {
      case 'nil': return null;
      case 'number': return value.value;
      case 'string': return value.value;
      case 'boolean': return value.value;
      case 'table':
        const table = value.value as { array: LuaValue[]; dict: Map<string, LuaValue> };
        const hasNumericKeys = table.array.length > 0;
        const hasStringKeys = table.dict.size > 0;
        
        if (hasNumericKeys && !hasStringKeys) {
          return table.array.map(v => this.luaValueToJs(v));
        }
        
        const obj: Record<string, any> = {};
        for (let i = 0; i < table.array.length; i++) {
          obj[String(i + 1)] = this.luaValueToJs(table.array[i]);
        }
        table.dict.forEach((v, k) => {
          obj[k] = this.luaValueToJs(v);
        });
        return obj;
      default: return value.value;
    }
  }

  public hasLuaSupport(): boolean {
    return true;
  }

  public getLuaVersion(): string {
    return '5.3';
  }
}

export const AVAILABLE_HOOKS = [
  'beforeWrite',
  'afterWrite',
  'beforeAudit',
  'afterAudit',
  'beforeSave',
  'afterSave',
  'beforeExport',
  'afterExport',
  'onChapterComplete',
  'onChapterError',
  'beforeCommand',
  'afterCommand',
  'onCommandError',
  'onProjectCreate',
  'onProjectLoad',
  'onPluginLoad',
  'onPluginUnload'
] as const;

export const AVAILABLE_COMMANDS = [
  'analyze',
  'rewrite',
  'expand',
  'summarize',
  'translate',
  'export',
  'import',
  'search',
  'generate',
  'validate',
  'optimize',
  'exportJSON',
  'exportMarkdown',
  'exportEpub'
] as const;

export default PluginSystem;
