"use strict";
/**
 * 键盘快捷键管理器
 * 提供专业的键盘优先编辑体验
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardShortcuts = void 0;
class KeyboardShortcuts {
    shortcuts = new Map();
    customHandlers = new Map();
    enabled = true;
    preventDefault = true;
    constructor() {
        this.registerDefaultShortcuts();
        this.setupGlobalListener();
    }
    registerDefaultShortcuts() {
        const defaults = [
            // 导航
            { key: 'j', description: '下一章', category: 'navigation', action: 'nextChapter' },
            { key: 'k', description: '上一章', category: 'navigation', action: 'prevChapter' },
            { key: 'g', description: '第一章', category: 'navigation', action: 'firstChapter' },
            { key: 'G', modifiers: ['shift'], description: '最后一章', category: 'navigation', action: 'lastChapter' },
            { key: 'n', description: '下一条目', category: 'navigation', action: 'nextItem' },
            { key: 'p', description: '上一条目', category: 'navigation', action: 'prevItem' },
            { key: 'Tab', description: '下一个面板', category: 'navigation', action: 'nextPanel' },
            { key: 'Tab', modifiers: ['shift'], description: '上一个面板', category: 'navigation', action: 'prevPanel' },
            // 编辑
            { key: 's', modifiers: ['ctrl'], description: '保存', category: 'editing', action: 'save' },
            { key: 'z', modifiers: ['ctrl'], description: '撤销', category: 'editing', action: 'undo' },
            { key: 'y', modifiers: ['ctrl'], description: '重做', category: 'editing', action: 'redo' },
            { key: 'z', modifiers: ['ctrl', 'shift'], description: '重做', category: 'editing', action: 'redo' },
            { key: 'a', modifiers: ['ctrl'], description: '全选', category: 'editing', action: 'selectAll' },
            { key: 'd', modifiers: ['ctrl'], description: '复制当前行', category: 'editing', action: 'duplicateLine' },
            { key: 'x', description: '剪切当前行', category: 'editing', action: 'cutLine' },
            { key: 'c', modifiers: ['ctrl'], description: '复制', category: 'editing', action: 'copy' },
            { key: 'v', modifiers: ['ctrl'], description: '粘贴', category: 'editing', action: 'paste' },
            { key: 'Backspace', modifiers: ['ctrl'], description: '删除当前行', category: 'editing', action: 'deleteLine' },
            { key: '/', modifiers: ['ctrl'], description: '注释', category: 'editing', action: 'toggleComment' },
            { key: 'l', modifiers: ['ctrl'], description: '转换为小写', category: 'editing', action: 'toLowerCase' },
            { key: 'u', modifiers: ['ctrl'], description: '转换为大写', category: 'editing', action: 'toUpperCase' },
            // 写作辅助
            { key: 'Enter', modifiers: ['shift'], description: '强制换行', category: 'writing', action: 'hardBreak' },
            { key: 'w', description: '选中当前词', category: 'writing', action: 'selectWord' },
            { key: '(', modifiers: ['shift'], description: '包裹选中文字为括号', category: 'writing', action: 'wrapWithParens' },
            { key: '"', description: '包裹选中文字为引号', category: 'writing', action: 'wrapWithQuotes' },
            { key: "'", description: '包裹选中文字为单引号', category: 'writing', action: 'wrapWithSingleQuotes' },
            { key: 'b', modifiers: ['ctrl'], description: '加粗', category: 'writing', action: 'bold' },
            { key: 'i', modifiers: ['ctrl'], description: '斜体', category: 'writing', action: 'italic' },
            { key: 'u', modifiers: ['ctrl'], description: '下划线', category: 'writing', action: 'underline' },
            // AI功能
            { key: ' ', modifiers: ['ctrl', 'alt'], description: 'AI补全', category: 'ai', action: 'aiComplete' },
            { key: 'r', modifiers: ['ctrl', 'alt'], description: 'AI重写', category: 'ai', action: 'aiRewrite' },
            { key: 't', modifiers: ['ctrl', 'alt'], description: 'AI润色', category: 'ai', action: 'aiPolish' },
            { key: 'y', modifiers: ['ctrl', 'alt'], description: 'AI续写', category: 'ai', action: 'aiContinue' },
            { key: 'i', modifiers: ['ctrl', 'alt'], description: 'AI检查', category: 'ai', action: 'aiCheck' },
            { key: 'g', modifiers: ['ctrl', 'alt'], description: '生成大纲', category: 'ai', action: 'aiOutline' },
            // 视图
            { key: '1', modifiers: ['ctrl'], description: '聚焦编辑区', category: 'view', action: 'focusEditor' },
            { key: '2', modifiers: ['ctrl'], description: '聚焦大纲', category: 'view', action: 'focusOutline' },
            { key: '3', modifiers: ['ctrl'], description: '聚焦角色', category: 'view', action: 'focusCharacters' },
            { key: '4', modifiers: ['ctrl'], description: '聚焦设定', category: 'view', action: 'focusWorld' },
            { key: '5', modifiers: ['ctrl'], description: '聚焦AI', category: 'view', action: 'focusAI' },
            { key: 'e', modifiers: ['ctrl'], description: '切换大纲视图', category: 'view', action: 'toggleOutline' },
            { key: 'm', modifiers: ['ctrl'], description: '切换免打扰', category: 'view', action: 'toggleFocusMode' },
            { key: 'f', modifiers: ['ctrl'], description: '搜索', category: 'view', action: 'search' },
            { key: 'h', modifiers: ['ctrl', 'alt'], description: '历史版本', category: 'view', action: 'showHistory' },
            // 特殊
            { key: 'Escape', description: '取消/关闭', category: 'navigation', action: 'cancel' },
            { key: '?', description: '显示快捷键帮助', category: 'navigation', action: 'showHelp' },
            { key: ',', modifiers: ['ctrl'], description: '打开设置', category: 'navigation', action: 'openSettings' },
        ];
        for (const shortcut of defaults) {
            this.registerShortcut(shortcut);
        }
    }
    registerShortcut(shortcut) {
        const key = this.generateKey(shortcut.key, shortcut.modifiers);
        this.shortcuts.set(key, shortcut);
    }
    unregisterShortcut(key, modifiers) {
        const shortcutKey = this.generateKey(key, modifiers);
        this.shortcuts.delete(shortcutKey);
    }
    registerHandler(action, handler) {
        this.customHandlers.set(action, handler);
    }
    unregisterHandler(action) {
        this.customHandlers.delete(action);
    }
    trigger(action) {
        const handler = this.customHandlers.get(action);
        if (handler) {
            handler();
            return true;
        }
        return false;
    }
    getShortcut(action) {
        for (const shortcut of this.shortcuts.values()) {
            if (shortcut.action === action) {
                return shortcut;
            }
        }
        return undefined;
    }
    getShortcutsByCategory(category) {
        return Array.from(this.shortcuts.values()).filter(s => s.category === category);
    }
    getAllShortcuts() {
        const categories = ['navigation', 'editing', 'writing', 'ai', 'view', 'custom'];
        const categoryNames = {
            navigation: '导航',
            editing: '编辑',
            writing: '写作',
            ai: 'AI功能',
            view: '视图',
            custom: '自定义'
        };
        return categories.map(category => ({
            name: categoryNames[category],
            shortcuts: this.getShortcutsByCategory(category)
        }));
    }
    getKeyDisplay(key, modifiers) {
        const parts = [];
        if (modifiers) {
            const modifierNames = {
                ctrl: 'Ctrl',
                alt: 'Alt',
                shift: 'Shift',
                meta: '⌘'
            };
            for (const mod of modifiers) {
                parts.push(modifierNames[mod] || mod);
            }
        }
        parts.push(this.formatKey(key));
        return parts.join('+');
    }
    formatKey(key) {
        const keyMap = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'Enter': '↵',
            'Escape': 'Esc',
            'Tab': 'Tab',
            'Backspace': '⌫',
            'Delete': 'Del',
            'Home': 'Home',
            'End': 'End',
            'PageUp': 'PgUp',
            'PageDown': 'PgDn',
            ' ': 'Space'
        };
        if (keyMap[key]) {
            return keyMap[key];
        }
        if (key.length === 1) {
            return key.toUpperCase();
        }
        return key;
    }
    generateKey(key, modifiers) {
        const parts = [];
        if (modifiers) {
            parts.push(...modifiers.sort());
        }
        parts.push(key);
        return parts.join('+');
    }
    setupGlobalListener() {
        if (typeof window === 'undefined')
            return;
        const w = window;
        if (!w)
            return;
        w.addEventListener('keydown', (event) => {
            if (!this.enabled)
                return;
            const ke = event;
            const key = ke.key;
            const modifiers = [];
            if (ke.ctrlKey)
                modifiers.push('ctrl');
            if (ke.altKey)
                modifiers.push('alt');
            if (ke.shiftKey)
                modifiers.push('shift');
            if (ke.metaKey)
                modifiers.push('meta');
            const shortcutKey = this.generateKey(key, modifiers);
            const shortcut = this.shortcuts.get(shortcutKey);
            if (shortcut) {
                const handled = this.customHandlers.get(shortcut.action);
                if (handled) {
                    if (this.preventDefault) {
                        ke.preventDefault();
                    }
                    handled();
                }
            }
        });
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    isEnabled() {
        return this.enabled;
    }
    setPreventDefault(prevent) {
        this.preventDefault = prevent;
    }
    generateHelpText() {
        const groups = this.getAllShortcuts();
        let text = '【键盘快捷键】\n\n';
        for (const group of groups) {
            if (group.shortcuts.length === 0)
                continue;
            text += `【${group.name}】\n`;
            for (const shortcut of group.shortcuts) {
                const keyDisplay = this.getKeyDisplay(shortcut.key, shortcut.modifiers);
                text += `${keyDisplay}  ${shortcut.description}\n`;
            }
            text += '\n';
        }
        return text;
    }
    exportShortcuts() {
        return JSON.stringify(Array.from(this.shortcuts.values()), null, 2);
    }
    importShortcuts(json) {
        try {
            const shortcuts = JSON.parse(json);
            for (const shortcut of shortcuts) {
                this.registerShortcut(shortcut);
            }
        }
        catch (error) {
            console.error('Failed to import shortcuts:', error);
        }
    }
}
exports.KeyboardShortcuts = KeyboardShortcuts;
exports.default = KeyboardShortcuts;
//# sourceMappingURL=KeyboardShortcuts.js.map