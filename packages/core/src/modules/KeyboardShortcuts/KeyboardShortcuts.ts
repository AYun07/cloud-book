/**
 * 键盘快捷键管理器
 * 提供专业的键盘优先编辑体验
 * 支持60+快捷键，覆盖文件、编辑、写作、AI、视图等操作
 */

interface Window {
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface KeyboardEvent extends Event {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

declare const window: Window;

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

export class KeyboardShortcuts {
  private shortcuts: Map<string, Shortcut> = new Map();
  private customHandlers: Map<string, () => void> = new Map();
  private enabled: boolean = true;
  private preventDefaultBehavior: boolean = true;
  private listenerBound: boolean = false;
  private globalShortcuts: Map<string, Shortcut> = new Map();

  private static readonly CATEGORY_NAMES: Record<string, string> = {
    'file': '文件',
    'edit': '编辑',
    'navigation': '导航',
    'writing': '写作',
    'ai': 'AI',
    'view': '视图',
    'custom': '自定义'
  };

  constructor(config?: Partial<ShortcutConfig>) {
    this.registerDefaultShortcuts();
    if (config?.shortcuts) {
      for (const shortcut of config.shortcuts) {
        this.registerShortcut(shortcut);
      }
    }
    if (config?.enabled !== undefined) {
      this.enabled = config.enabled;
    }
    if (config?.preventDefault !== undefined) {
      this.preventDefaultBehavior = config.preventDefault;
    }
  }

  private registerDefaultShortcuts(): void {
    const defaults: Shortcut[] = [
      // 文件操作
      { key: 'n', modifiers: ['ctrl'], description: '新建项目', category: 'file', action: 'newProject', group: '文件' },
      { key: 'o', modifiers: ['ctrl'], description: '打开项目', category: 'file', action: 'openProject', group: '文件' },
      { key: 's', modifiers: ['ctrl'], description: '保存', category: 'file', action: 'save', group: '文件' },
      { key: 's', modifiers: ['ctrl', 'shift'], description: '另存为', category: 'file', action: 'saveAs', group: '文件' },
      { key: 'w', modifiers: ['ctrl'], description: '关闭当前', category: 'file', action: 'close', group: '文件' },
      { key: 'e', modifiers: ['ctrl'], description: '导出项目', category: 'file', action: 'export', group: '文件' },
      { key: 'i', modifiers: ['ctrl'], description: '导入内容', category: 'file', action: 'import', group: '文件' },
      { key: 'p', modifiers: ['ctrl'], description: '打印', category: 'file', action: 'print', group: '文件' },
      { key: 'q', modifiers: ['ctrl'], description: '退出', category: 'file', action: 'quit', group: '文件' },

      // 编辑操作
      { key: 'z', modifiers: ['ctrl'], description: '撤销', category: 'edit', action: 'undo', group: '编辑' },
      { key: 'y', modifiers: ['ctrl'], description: '重做', category: 'edit', action: 'redo', group: '编辑' },
      { key: 'z', modifiers: ['ctrl', 'shift'], description: '重做', category: 'edit', action: 'redo', group: '编辑' },
      { key: 'a', modifiers: ['ctrl'], description: '全选', category: 'edit', action: 'selectAll', group: '编辑' },
      { key: 'd', modifiers: ['ctrl'], description: '复制当前行', category: 'edit', action: 'duplicateLine', group: '编辑' },
      { key: 'x', description: '剪切当前行', category: 'edit', action: 'cutLine', group: '编辑' },
      { key: 'c', modifiers: ['ctrl'], description: '复制', category: 'edit', action: 'copy', group: '编辑' },
      { key: 'v', modifiers: ['ctrl'], description: '粘贴', category: 'edit', action: 'paste', group: '编辑' },
      { key: 'Backspace', modifiers: ['ctrl'], description: '删除当前行', category: 'edit', action: 'deleteLine', group: '编辑' },
      { key: '/', modifiers: ['ctrl'], description: '注释', category: 'edit', action: 'toggleComment', group: '编辑' },
      { key: 'l', modifiers: ['ctrl'], description: '转换为小写', category: 'edit', action: 'toLowerCase', group: '编辑' },
      { key: 'u', modifiers: ['ctrl'], description: '转换为大写', category: 'edit', action: 'toUpperCase', group: '编辑' },
      { key: 'Delete', description: '删除选中', category: 'edit', action: 'deleteSelected', group: '编辑' },
      { key: 'Insert', description: '插入模式', category: 'edit', action: 'toggleInsertMode', group: '编辑' },
      { key: 'c', modifiers: ['ctrl', 'shift'], description: '复制格式化', category: 'edit', action: 'copyFormatted', group: '编辑' },

      // 导航操作
      { key: 'j', description: '下一章', category: 'navigation', action: 'nextChapter', group: '导航' },
      { key: 'k', description: '上一章', category: 'navigation', action: 'prevChapter', group: '导航' },
      { key: 'g', description: '第一章', category: 'navigation', action: 'firstChapter', group: '导航' },
      { key: 'G', modifiers: ['shift'], description: '最后一章', category: 'navigation', action: 'lastChapter', group: '导航' },
      { key: 'n', description: '下一条目', category: 'navigation', action: 'nextItem', group: '导航' },
      { key: 'p', description: '上一条目', category: 'navigation', action: 'prevItem', group: '导航' },
      { key: 'Tab', description: '下一个面板', category: 'navigation', action: 'nextPanel', group: '导航' },
      { key: 'Tab', modifiers: ['shift'], description: '上一个面板', category: 'navigation', action: 'prevPanel', group: '导航' },
      { key: 'f', modifiers: ['ctrl'], description: '搜索', category: 'navigation', action: 'search', group: '导航' },
      { key: 'h', modifiers: ['ctrl', 'alt'], description: '历史版本', category: 'navigation', action: 'showHistory', group: '导航' },
      { key: 'f', modifiers: ['ctrl', 'alt'], description: '全局搜索', category: 'navigation', action: 'globalSearch', group: '导航' },
      { key: 'Escape', description: '取消/关闭', category: 'navigation', action: 'cancel', group: '导航' },
      { key: ',', modifiers: ['ctrl'], description: '打开设置', category: 'navigation', action: 'openSettings', group: '导航' },

      // 写作辅助
      { key: 'Enter', modifiers: ['shift'], description: '强制换行', category: 'writing', action: 'hardBreak', group: '写作' },
      { key: 'w', description: '选中当前词', category: 'writing', action: 'selectWord', group: '写作' },
      { key: '(', modifiers: ['shift'], description: '包裹选中文字为括号', category: 'writing', action: 'wrapWithParens', group: '写作' },
      { key: '"', description: '包裹选中文字为引号', category: 'writing', action: 'wrapWithQuotes', group: '写作' },
      { key: "'", description: '包裹选中文字为单引号', category: 'writing', action: 'wrapWithSingleQuotes', group: '写作' },
      { key: '[', description: '包裹选中文字为方括号', category: 'writing', action: 'wrapWithBrackets', group: '写作' },
      { key: 'b', modifiers: ['ctrl'], description: '加粗', category: 'writing', action: 'bold', group: '写作' },
      { key: 'i', modifiers: ['ctrl'], description: '斜体', category: 'writing', action: 'italic', group: '写作' },
      { key: 'u', modifiers: ['ctrl'], description: '下划线', category: 'writing', action: 'underline', group: '写作' },
      { key: 'e', modifiers: ['ctrl'], description: '着重号', category: 'writing', action: 'emphasis', group: '写作' },
      { key: '`', modifiers: ['ctrl'], description: '代码格式', category: 'writing', action: 'code', group: '写作' },
      { key: 'Enter', modifiers: ['ctrl'], description: '智能换段', category: 'writing', action: 'smartParagraph', group: '写作' },
      { key: 'Tab', modifiers: ['shift'], description: '减少缩进', category: 'writing', action: 'decreaseIndent', group: '写作' },
      { key: 'Tab', description: '增加缩进', category: 'writing', action: 'increaseIndent', group: '写作' },

      // AI功能
      { key: ' ', modifiers: ['ctrl', 'alt'], description: 'AI补全', category: 'ai', action: 'aiComplete', group: 'AI' },
      { key: 'r', modifiers: ['ctrl', 'alt'], description: 'AI重写', category: 'ai', action: 'aiRewrite', group: 'AI' },
      { key: 't', modifiers: ['ctrl', 'alt'], description: 'AI润色', category: 'ai', action: 'aiPolish', group: 'AI' },
      { key: 'y', modifiers: ['ctrl', 'alt'], description: 'AI续写', category: 'ai', action: 'aiContinue', group: 'AI' },
      { key: 'i', modifiers: ['ctrl', 'alt'], description: 'AI检查', category: 'ai', action: 'aiCheck', group: 'AI' },
      { key: 'g', modifiers: ['ctrl', 'alt'], description: '生成大纲', category: 'ai', action: 'aiOutline', group: 'AI' },
      { key: 'o', modifiers: ['ctrl', 'alt'], description: 'AI大纲优化', category: 'ai', action: 'aiOptimizeOutline', group: 'AI' },
      { key: 's', modifiers: ['ctrl', 'alt'], description: 'AI灵感生成', category: 'ai', action: 'aiInspire', group: 'AI' },
      { key: 'a', modifiers: ['ctrl', 'alt'], description: 'AI审计', category: 'ai', action: 'aiAudit', group: 'AI' },
      { key: 'r', modifiers: ['ctrl', 'shift'], description: 'AI修订', category: 'ai', action: 'aiRevise', group: 'AI' },
      { key: 'e', modifiers: ['ctrl', 'shift'], description: 'AI风格转换', category: 'ai', action: 'aiStyleTransfer', group: 'AI' },
      { key: 'm', modifiers: ['ctrl', 'alt'], description: 'AI角色分析', category: 'ai', action: 'aiAnalyzeCharacter', group: 'AI' },
      { key: 'd', modifiers: ['ctrl', 'alt'], description: 'AI世界设定', category: 'ai', action: 'aiWorldBuilding', group: 'AI' },
      { key: 'b', modifiers: ['ctrl', 'alt'], description: 'AI仿写', category: 'ai', action: 'aiImitation', group: 'AI' },

      // 视图操作
      { key: '1', modifiers: ['ctrl'], description: '聚焦编辑区', category: 'view', action: 'focusEditor', group: '视图' },
      { key: '2', modifiers: ['ctrl'], description: '聚焦大纲', category: 'view', action: 'focusOutline', group: '视图' },
      { key: '3', modifiers: ['ctrl'], description: '聚焦角色', category: 'view', action: 'focusCharacters', group: '视图' },
      { key: '4', modifiers: ['ctrl'], description: '聚焦设定', category: 'view', action: 'focusWorld', group: '视图' },
      { key: '5', modifiers: ['ctrl'], description: '聚焦AI', category: 'view', action: 'focusAI', group: '视图' },
      { key: 'm', modifiers: ['ctrl'], description: '切换免打扰', category: 'view', action: 'toggleFocusMode', group: '视图' },
      { key: 'e', modifiers: ['ctrl', 'shift'], description: '切换大纲视图', category: 'view', action: 'toggleOutline', group: '视图' },
      { key: 'w', modifiers: ['ctrl', 'shift'], description: '切换沉浸模式', category: 'view', action: 'toggleImmersive', group: '视图' },
      { key: 'd', modifiers: ['ctrl', 'shift'], description: '切换暗黑主题', category: 'view', action: 'toggleDarkMode', group: '视图' },
      { key: 'l', modifiers: ['ctrl', 'shift'], description: '切换左侧栏', category: 'view', action: 'toggleSidebar', group: '视图' },
      { key: 'r', modifiers: ['ctrl', 'shift'], description: '切换右侧栏', category: 'view', action: 'toggleRightbar', group: '视图' },
      { key: '?', description: '显示快捷键帮助', category: 'navigation', action: 'showHelp', group: '导航' },
    ];

    for (const shortcut of defaults) {
      this.registerShortcut(shortcut);
    }
  }

  registerShortcut(shortcut: Shortcut): void {
    const key = this.generateKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);
  }

  register(shortcut: Shortcut): void {
    this.registerShortcut(shortcut);
  }

  unregisterShortcut(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): void {
    const shortcutKey = this.generateKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  registerGlobalShortcut(shortcut: Shortcut): void {
    const key = this.generateKey(shortcut.key, shortcut.modifiers);
    this.globalShortcuts.set(key, shortcut);
    this.setupGlobalListener();
  }

  registerHandler(action: string, handler: () => void): void {
    this.customHandlers.set(action, handler);
  }

  unregisterHandler(action: string): void {
    this.customHandlers.delete(action);
  }

  trigger(action: string): boolean {
    const handler = this.customHandlers.get(action);
    if (handler) {
      handler();
      return true;
    }
    return false;
  }

  getShortcut(action: string): Shortcut | undefined {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.action === action) {
        return shortcut;
      }
    }
    return undefined;
  }

  getShortcutsByCategory(category: Shortcut['category']): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  getByCategory(category: 'file' | 'edit' | 'navigation' | 'writing' | 'ai' | 'view' | 'custom'): Shortcut[] {
    return this.getShortcutsByCategory(category);
  }

  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  execute(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): boolean {
    const shortcutKey = this.generateKey(key, modifiers);
    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      const handler = this.customHandlers.get(shortcut.action);
      if (handler) {
        handler();
        return true;
      }
    }
    return false;
  }

  getShortcutsByGroup(group: string): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.group === group);
  }

  getAllShortcuts(): ShortcutGroup[] {
    const groups = ['文件', '编辑', '导航', '写作', 'AI', '视图', '自定义'];

    const result: ShortcutGroup[] = [];

    for (const group of groups) {
      const shortcuts = this.getShortcutsByGroup(group);
      if (shortcuts.length > 0) {
        result.push({
          name: group,
          shortcuts
        });
      }
    }

    return result;
  }

  getShortcutCount(): { total: number; byCategory: Record<string, number> } {
    const shortcuts = Array.from(this.shortcuts.values());
    const byCategory: Record<string, number> = {};

    for (const shortcut of shortcuts) {
      const cat = KeyboardShortcuts.CATEGORY_NAMES[shortcut.category] || shortcut.category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    return { total: shortcuts.length, byCategory };
  }

  getKeyDisplay(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): string {
    const parts: string[] = [];

    if (modifiers) {
      const modifierNames: Record<string, string> = {
        ctrl: 'Ctrl',
        alt: 'Alt',
        shift: 'Shift',
        meta: '⌘'
      };

      for (const mod of modifiers.sort()) {
        parts.push(modifierNames[mod] || mod);
      }
    }

    parts.push(this.formatKey(key));

    return parts.join('+');
  }

  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
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

  private generateKey(key: string, modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]): string {
    const parts: string[] = [];

    if (modifiers) {
      parts.push(...modifiers.sort());
    }

    parts.push(key);
    return parts.join('+');
  }

  private setupGlobalListener(): void {
    if (this.listenerBound || typeof window === 'undefined') return;

    this.listenerBound = true;
    const w = window as any;
    if (!w) return;

    w.addEventListener('keydown', (event: Event) => {
      if (!this.enabled) return;

      const ke = event as KeyboardEvent;
      const key = ke.key;
      const modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[] = [];

      if (ke.ctrlKey) modifiers.push('ctrl');
      if (ke.altKey) modifiers.push('alt');
      if (ke.shiftKey) modifiers.push('shift');
      if (ke.metaKey) modifiers.push('meta');

      const shortcutKey = this.generateKey(key, modifiers);
      const shortcut = this.shortcuts.get(shortcutKey) || this.globalShortcuts.get(shortcutKey);

      if (shortcut) {
        const handler = this.customHandlers.get(shortcut.action);

        if (handler) {
          if (this.preventDefaultBehavior) {
            ke.preventDefault();
            ke.stopPropagation();
          }
          handler();
        }
      }
    });
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setPreventDefault(prevent: boolean): void {
    this.preventDefaultBehavior = prevent;
  }

  generateHelpText(): string {
    const groups = this.getAllShortcuts();
    let text = '【Cloud Book 键盘快捷键】\n\n';
    text += `总计: ${this.getShortcutCount().total} 个快捷键\n\n`;

    for (const group of groups) {
      text += `\n【${group.name}】\n`;

      for (const shortcut of group.shortcuts) {
        const keyDisplay = this.getKeyDisplay(shortcut.key, shortcut.modifiers);
        text += `${keyDisplay.padEnd(15)} ${shortcut.description}\n`;
      }
    }

    text += '\n提示: 按 ? 可随时显示此帮助\n';
    return text;
  }

  generateHelpMarkdown(): string {
    const groups = this.getAllShortcuts();
    let md = '# Cloud Book 键盘快捷键\n\n';
    md += `> 总计: ${this.getShortcutCount().total} 个快捷键\n\n`;

    for (const group of groups) {
      md += `\n## ${group.name}\n\n`;
      md += '| 快捷键 | 功能 |\n';
      md += '|--------|------|\n';

      for (const shortcut of group.shortcuts) {
        const keyDisplay = this.getKeyDisplay(shortcut.key, shortcut.modifiers);
        md += `| ${keyDisplay} | ${shortcut.description} |\n`;
      }
    }

    md += '\n> 提示: 按 `?` 可随时显示此帮助\n';
    return md;
  }

  exportShortcuts(): string {
    return JSON.stringify(Array.from(this.shortcuts.values()), null, 2);
  }

  importShortcuts(json: string): { imported: number; failed: number } {
    let imported = 0;
    let failed = 0;

    try {
      const shortcuts = JSON.parse(json) as Shortcut[];
      for (const shortcut of shortcuts) {
        if (shortcut.key && shortcut.action) {
          this.registerShortcut(shortcut);
          imported++;
        } else {
          failed++;
        }
      }
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
      failed++;
    }

    return { imported, failed };
  }

  resetToDefaults(): void {
    this.shortcuts.clear();
    this.registerDefaultShortcuts();
  }

  searchShortcuts(query: string): Shortcut[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.shortcuts.values()).filter(s =>
      s.description.toLowerCase().includes(lowerQuery) ||
      s.action.toLowerCase().includes(lowerQuery) ||
      s.key.toLowerCase().includes(lowerQuery)
    );
  }
}

export default KeyboardShortcuts;
