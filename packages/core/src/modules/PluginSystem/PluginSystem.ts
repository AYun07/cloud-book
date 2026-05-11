/**
 * Plugin System - 插件系统
 * 支持扩展命令和钩子
 */

import { Plugin, PluginCommand, PluginHook } from '../../types';

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

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private commands: Map<string, PluginCommand> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/plugins') {
    this.storagePath = storagePath;
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
