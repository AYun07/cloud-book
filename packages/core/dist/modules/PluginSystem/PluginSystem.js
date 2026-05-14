"use strict";
/**
 * Plugin System - 插件系统
 * 支持扩展命令、钩子以及 Lua 风格扩展
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_COMMANDS = exports.AVAILABLE_HOOKS = exports.PluginSystem = void 0;
const LuaInterpreter_1 = require("./LuaInterpreter");
class PluginSystem {
    plugins = new Map();
    commands = new Map();
    hooks = new Map();
    storagePath;
    luaPlugins = new Map();
    luaInterpreters = new Map();
    defaultLuaInterpreter;
    luaBridgeFunctions = new Map();
    constructor(storagePath = './data/plugins') {
        this.storagePath = storagePath;
        this.defaultLuaInterpreter = new LuaInterpreter_1.LuaInterpreter();
        this.setupLuaBridge();
    }
    currentContext = {};
    setupLuaBridge() {
        this.registerLuaBridgeFunction('log', (args) => {
            const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            console.log('[Lua]', message);
            return message;
        });
        this.registerLuaBridgeFunction('getContext', () => {
            return this.currentContext;
        });
        this.registerLuaBridgeFunction('setContext', (args) => {
            const [key, value] = args;
            if (typeof key === 'string') {
                this.currentContext[key] = value;
                return { key, value, success: true };
            }
            return { success: false, error: 'Key must be a string' };
        });
        this.registerLuaBridgeFunction('executeCommand', async (args) => {
            const [commandName, params] = args;
            if (typeof commandName !== 'string') {
                return { success: false, error: 'Command name must be a string' };
            }
            try {
                const result = await this.executeCommand(commandName, params || {}, this.currentContext);
                return result;
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        this.registerLuaBridgeFunction('triggerHook', async (args) => {
            const [hookName, data] = args;
            if (typeof hookName !== 'string') {
                return { success: false, error: 'Hook name must be a string' };
            }
            try {
                await this.triggerHook(hookName, { ...this.currentContext, data });
                return { success: true, hookName };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
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
    async loadLuaPlugin(pluginConfig) {
        if (this.luaPlugins.has(pluginConfig.id)) {
            return { success: false, error: `Lua plugin ${pluginConfig.id} is already loaded` };
        }
        try {
            const interpreter = new LuaInterpreter_1.LuaInterpreter();
            this.setupLuaBridgeFunctions(interpreter);
            const result = interpreter.execute(pluginConfig.script);
            if (!result.success) {
                return { success: false, error: result.error };
            }
            const luaPlugin = {
                id: pluginConfig.id,
                name: pluginConfig.name,
                script: pluginConfig.script,
                enabled: true
            };
            this.luaPlugins.set(pluginConfig.id, luaPlugin);
            this.luaInterpreters.set(pluginConfig.id, interpreter);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    setupLuaBridgeFunctions(interpreter) {
        this.luaBridgeFunctions.forEach((fn, name) => {
            interpreter.setGlobal(name, {
                type: 'function',
                value: (args) => {
                    const jsArgs = args.map(a => this.luaValueToJs(a));
                    const result = fn(jsArgs);
                    return this.jsToLuaValue(result);
                }
            });
        });
    }
    executeLuaScript(script, pluginId) {
        const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
        if (!interpreter) {
            return { success: false, error: 'Lua interpreter not found' };
        }
        if (pluginId) {
            this.setupLuaBridgeFunctions(interpreter);
        }
        return interpreter.execute(script);
    }
    executeLuaFunction(pluginId, functionName, ...args) {
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
                const result = globalFn.value(luaArgs);
                return { success: true, returnValue: result };
            }
            else {
                const func = globalFn.value;
                const funcScope = new Map(func.closure);
                for (let i = 0; i < func.params.length; i++) {
                    funcScope.set(func.params[i], luaArgs[i] || { type: 'nil', value: null });
                }
                let result = { type: 'nil', value: null };
                for (const stmt of func.body) {
                    result = interpreter.executeStatement(stmt, funcScope);
                }
                return { success: true, returnValue: result };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    unloadLuaPlugin(pluginId) {
        if (!this.luaPlugins.has(pluginId)) {
            return { success: false, error: `Lua plugin ${pluginId} not found` };
        }
        this.luaPlugins.delete(pluginId);
        this.luaInterpreters.delete(pluginId);
        return { success: true };
    }
    enableLuaPlugin(pluginId) {
        const plugin = this.luaPlugins.get(pluginId);
        if (!plugin) {
            return { success: false, error: `Lua plugin ${pluginId} not found` };
        }
        plugin.enabled = true;
        return { success: true };
    }
    disableLuaPlugin(pluginId) {
        const plugin = this.luaPlugins.get(pluginId);
        if (!plugin) {
            return { success: false, error: `Lua plugin ${pluginId} not found` };
        }
        plugin.enabled = false;
        return { success: true };
    }
    getLuaPlugins() {
        return Array.from(this.luaPlugins.values()).map(p => ({
            id: p.id,
            name: p.name,
            enabled: p.enabled,
            registeredAt: new Date()
        }));
    }
    getLuaPlugin(pluginId) {
        return this.luaPlugins.get(pluginId);
    }
    registerLuaBridgeFunction(name, fn) {
        this.luaBridgeFunctions.set(name, fn);
    }
    setLuaGlobal(pluginId, name, value) {
        const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
        if (interpreter) {
            interpreter.setGlobal(name, this.jsToLuaValue(value));
        }
    }
    getLuaGlobal(pluginId, name) {
        const interpreter = pluginId ? this.luaInterpreters.get(pluginId) : this.defaultLuaInterpreter;
        if (interpreter) {
            const value = interpreter.getGlobal(name);
            return value ? this.luaValueToJs(value) : undefined;
        }
        return undefined;
    }
    jsToLuaValue(value) {
        if (value === null || value === undefined)
            return { type: 'nil', value: null };
        if (typeof value === 'number')
            return { type: 'number', value };
        if (typeof value === 'string')
            return { type: 'string', value };
        if (typeof value === 'boolean')
            return { type: 'boolean', value };
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
            const dict = new Map();
            for (const [k, v] of Object.entries(value)) {
                dict.set(k, this.jsToLuaValue(v));
            }
            return { type: 'table', value: { array: [], dict } };
        }
        return { type: 'userdata', value };
    }
    luaValueToJs(value) {
        switch (value.type) {
            case 'nil': return null;
            case 'number': return value.value;
            case 'string': return value.value;
            case 'boolean': return value.value;
            case 'table':
                const table = value.value;
                const hasNumericKeys = table.array.length > 0;
                const hasStringKeys = table.dict.size > 0;
                if (hasNumericKeys && !hasStringKeys) {
                    return table.array.map(v => this.luaValueToJs(v));
                }
                const obj = {};
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
    hasLuaSupport() {
        return true;
    }
    getLuaVersion() {
        return '5.3';
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