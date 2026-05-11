/**
 * Plugin System - 插件系统
 * 支持扩展命令和钩子
 */
import { Plugin, PluginCommand } from '../../types';
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
export declare class PluginSystem {
    private plugins;
    private commands;
    private hooks;
    private storagePath;
    constructor(storagePath?: string);
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
}
export declare const AVAILABLE_HOOKS: readonly ["beforeWrite", "afterWrite", "beforeAudit", "afterAudit", "beforeSave", "afterSave", "beforeExport", "afterExport", "onChapterComplete", "onChapterError", "beforeCommand", "afterCommand", "onCommandError", "onProjectCreate", "onProjectLoad", "onPluginLoad", "onPluginUnload"];
export declare const AVAILABLE_COMMANDS: readonly ["analyze", "rewrite", "expand", "summarize", "translate", "export", "import", "search", "generate", "validate", "optimize", "exportJSON", "exportMarkdown", "exportEpub"];
export default PluginSystem;
//# sourceMappingURL=PluginSystem.d.ts.map