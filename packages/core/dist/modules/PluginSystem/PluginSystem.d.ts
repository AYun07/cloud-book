/**
 * Plugin System - 插件系统
 * 支持扩展命令、钩子以及 Lua 风格扩展
 */
import { Plugin, PluginCommand } from '../../types';
import { LuaPlugin, LuaExecutionResult } from './LuaInterpreter';
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
export declare class PluginSystem {
    private plugins;
    private commands;
    private hooks;
    private storagePath;
    private luaPlugins;
    private luaInterpreters;
    private defaultLuaInterpreter;
    private luaBridgeFunctions;
    constructor(storagePath?: string);
    private currentContext;
    private setupLuaBridge;
    register(plugin: Plugin): Promise<void>;
    unregister(pluginId: string): Promise<void>;
    executeCommand(commandName: string, args: any, context: PluginContext): Promise<CommandResult>;
    triggerHook(hookName: string, payload: HookPayload): Promise<void>;
    getPlugin(pluginId: string): Plugin | undefined;
    getAllPlugins(): Plugin[];
    getCommand(commandName: string): PluginCommand | undefined;
    getAllCommands(): PluginCommand[];
    getAvailableHooks(): string[];
    listPlugins(): Promise<{
        id: string;
        name: string;
        version: string;
    }[]>;
    private validatePlugin;
    saveState(): Promise<void>;
    loadState(): Promise<void>;
    loadLuaPlugin(pluginConfig: {
        id: string;
        name: string;
        script: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    private setupLuaBridgeFunctions;
    executeLuaScript(script: string, pluginId?: string): LuaExecutionResult;
    executeLuaFunction(pluginId: string, functionName: string, ...args: any[]): LuaExecutionResult;
    unloadLuaPlugin(pluginId: string): {
        success: boolean;
        error?: string;
    };
    enableLuaPlugin(pluginId: string): {
        success: boolean;
        error?: string;
    };
    disableLuaPlugin(pluginId: string): {
        success: boolean;
        error?: string;
    };
    getLuaPlugins(): LuaPluginInfo[];
    getLuaPlugin(pluginId: string): LuaPlugin | undefined;
    registerLuaBridgeFunction(name: string, fn: (...args: any[]) => any): void;
    setLuaGlobal(pluginId: string | null, name: string, value: any): void;
    getLuaGlobal(pluginId: string | null, name: string): any;
    private jsToLuaValue;
    private luaValueToJs;
    hasLuaSupport(): boolean;
    getLuaVersion(): string;
}
export declare const AVAILABLE_HOOKS: readonly ["beforeWrite", "afterWrite", "beforeAudit", "afterAudit", "beforeSave", "afterSave", "beforeExport", "afterExport", "onChapterComplete", "onChapterError", "beforeCommand", "afterCommand", "onCommandError", "onProjectCreate", "onProjectLoad", "onPluginLoad", "onPluginUnload"];
export declare const AVAILABLE_COMMANDS: readonly ["analyze", "rewrite", "expand", "summarize", "translate", "export", "import", "search", "generate", "validate", "optimize", "exportJSON", "exportMarkdown", "exportEpub"];
export default PluginSystem;
//# sourceMappingURL=PluginSystem.d.ts.map