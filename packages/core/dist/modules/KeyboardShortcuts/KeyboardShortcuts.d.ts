/**
 * 键盘快捷键管理器
 * 提供专业的键盘优先编辑体验
 */
export interface Shortcut {
    key: string;
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    description: string;
    category: 'navigation' | 'editing' | 'writing' | 'ai' | 'view' | 'custom';
    action: string;
}
export interface ShortcutGroup {
    name: string;
    shortcuts: Shortcut[];
}
export declare class KeyboardShortcuts {
    private shortcuts;
    private customHandlers;
    private enabled;
    private preventDefault;
    constructor();
    private registerDefaultShortcuts;
    registerShortcut(shortcut: Shortcut): void;
    unregisterShortcut(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): void;
    registerHandler(action: string, handler: () => void): void;
    unregisterHandler(action: string): void;
    trigger(action: string): boolean;
    getShortcut(action: string): Shortcut | undefined;
    getShortcutsByCategory(category: Shortcut['category']): Shortcut[];
    getAllShortcuts(): ShortcutGroup[];
    getKeyDisplay(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): string;
    private formatKey;
    private generateKey;
    private setupGlobalListener;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    setPreventDefault(prevent: boolean): void;
    generateHelpText(): string;
    exportShortcuts(): string;
    importShortcuts(json: string): void;
}
export default KeyboardShortcuts;
//# sourceMappingURL=KeyboardShortcuts.d.ts.map