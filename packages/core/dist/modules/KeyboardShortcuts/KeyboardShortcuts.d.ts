/**
 * 键盘快捷键管理器
 * 提供专业的键盘优先编辑体验
 * 支持60+快捷键，覆盖文件、编辑、写作、AI、视图等操作
 */
export interface Shortcut {
    key: string;
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    description: string;
    category: 'file' | 'edit' | 'navigation' | 'writing' | 'ai' | 'view' | 'custom';
    action: string;
    group?: string;
}
export interface ShortcutGroup {
    name: string;
    shortcuts: Shortcut[];
}
export interface ShortcutConfig {
    shortcuts: Shortcut[];
    enabled: boolean;
    preventDefault: boolean;
}
export type ShortcutCategory = 'file' | 'edit' | 'navigation' | 'writing' | 'ai' | 'view' | 'custom';
export declare class KeyboardShortcuts {
    private shortcuts;
    private customHandlers;
    private enabled;
    private preventDefaultBehavior;
    private listenerBound;
    private globalShortcuts;
    private static readonly CATEGORY_NAMES;
    constructor(config?: Partial<ShortcutConfig>);
    private registerDefaultShortcuts;
    registerShortcut(shortcut: Shortcut): void;
    register(shortcut: Shortcut): void;
    unregisterShortcut(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): void;
    registerGlobalShortcut(shortcut: Shortcut): void;
    registerHandler(action: string, handler: () => void): void;
    unregisterHandler(action: string): void;
    trigger(action: string): boolean;
    getShortcut(action: string): Shortcut | undefined;
    getShortcutsByCategory(category: Shortcut['category']): Shortcut[];
    getByCategory(category: 'file' | 'edit' | 'navigation' | 'writing' | 'ai' | 'view' | 'custom'): Shortcut[];
    getAll(): Shortcut[];
    execute(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): boolean;
    getShortcutsByGroup(group: string): Shortcut[];
    getAllShortcuts(): ShortcutGroup[];
    getShortcutCount(): {
        total: number;
        byCategory: Record<string, number>;
    };
    getKeyDisplay(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): string;
    private formatKey;
    private generateKey;
    private setupGlobalListener;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    setPreventDefault(prevent: boolean): void;
    generateHelpText(): string;
    generateHelpMarkdown(): string;
    exportShortcuts(): string;
    importShortcuts(json: string): {
        imported: number;
        failed: number;
    };
    resetToDefaults(): void;
    searchShortcuts(query: string): Shortcut[];
}
export default KeyboardShortcuts;
//# sourceMappingURL=KeyboardShortcuts.d.ts.map