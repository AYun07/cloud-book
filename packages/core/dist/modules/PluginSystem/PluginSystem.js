"use strict";
/**
 * Plugin System - 插件系统
 * 支持扩展命令和钩子
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_COMMANDS = exports.AVAILABLE_HOOKS = exports.PluginSystem = void 0;
class PluginSystem {
    plugins = new Map();
    commands = new Map();
    hooks = new Map();
    storagePath;
    constructor(storagePath = './data/plugins') {
        this.storagePath = storagePath;
    }
    async register(plugin) {
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
    async unregister(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin)
            return;
        for (const command of plugin.commands || []) {
            this.commands.delete(command.name);
        }
        for (const hook of plugin.hooks || []) {
            const existing = this.hooks.get(hook.name) || [];
            const filtered = existing.filter(h => h !== hook);
            if (filtered.length > 0) {
                this.hooks.set(hook.name, filtered);
            }
            else {
                this.hooks.delete(hook.name);
            }
        }
        this.plugins.delete(pluginId);
    }
    async executeCommand(commandName, args, context) {
        const command = this.commands.get(commandName);
        if (!command) {
            return { success: false, error: `Command ${commandName} not found` };
        }
        try {
            await this.triggerHook('beforeCommand', { commandName, args, ...context });
            const result = await command.execute({ ...args, context });
            await this.triggerHook('afterCommand', { commandName, result, ...context });
            return { success: true, data: result };
        }
        catch (error) {
            await this.triggerHook('onCommandError', { commandName, error: error.message, ...context });
            return { success: false, error: error.message };
        }
    }
    async triggerHook(hookName, payload) {
        const hookList = this.hooks.get(hookName);
        if (!hookList || hookList.length === 0)
            return;
        for (const hook of hookList) {
            try {
                await hook.callback(payload);
            }
            catch (error) {
                console.error(`Hook ${hookName} failed:`, error);
            }
        }
    }
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    getCommand(commandName) {
        return this.commands.get(commandName);
    }
    getAllCommands() {
        return Array.from(this.commands.values());
    }
    getAvailableHooks() {
        return Array.from(this.hooks.keys());
    }
    async listPlugins() {
        return Array.from(this.plugins.values()).map(p => ({
            id: p.id,
            name: p.name,
            version: p.version
        }));
    }
    validatePlugin(plugin) {
        if (!plugin.id)
            throw new Error('Plugin must have an id');
        if (!plugin.name)
            throw new Error('Plugin must have a name');
        if (!plugin.version)
            throw new Error('Plugin must have a version');
        if (!plugin.author)
            throw new Error('Plugin must have an author');
    }
    async saveState() {
        try {
            const fs = require('fs');
            if (!fs.existsSync(this.storagePath)) {
                fs.mkdirSync(this.storagePath, { recursive: true });
            }
            const state = {
                plugins: Array.from(this.plugins.entries())
            };
            fs.writeFileSync(`${this.storagePath}/plugins.json`, JSON.stringify(state, null, 2));
        }
        catch (error) {
            console.error('Failed to save plugin state:', error);
        }
    }
    async loadState() {
        try {
            const fs = require('fs');
            const filePath = `${this.storagePath}/plugins.json`;
            if (fs.existsSync(filePath)) {
                const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                for (const [id, plugin] of state.plugins) {
                    this.plugins.set(id, plugin);
                }
            }
        }
        catch (error) {
            console.error('Failed to load plugin state:', error);
        }
    }
}
exports.PluginSystem = PluginSystem;
exports.AVAILABLE_HOOKS = [
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
];
exports.AVAILABLE_COMMANDS = [
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
];
exports.default = PluginSystem;
//# sourceMappingURL=PluginSystem.js.map