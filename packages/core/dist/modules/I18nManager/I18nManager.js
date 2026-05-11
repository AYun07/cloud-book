"use strict";
/**
 * 国际化管理器
 * 支持40+语言，提供完整的本地化功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nManager = void 0;
class I18nManager {
    currentLocale = 'zh-CN';
    translations = new Map();
    fallbackLocale = 'en-US';
    listeners = new Set();
    pluralRules = new Map();
    localeInfo = {
        'zh-CN': { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', region: 'CN' },
        'zh-TW': { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', region: 'TW' },
        'zh-HK': { code: 'zh-HK', name: 'Chinese (Hong Kong)', nativeName: '粵語', direction: 'ltr', region: 'HK' },
        'en-US': { code: 'en-US', name: 'English (US)', nativeName: 'English', direction: 'ltr', region: 'US' },
        'en-GB': { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', direction: 'ltr', region: 'GB' },
        'ja-JP': { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', direction: 'ltr', region: 'JP' },
        'ko-KR': { code: 'ko-KR', name: 'Korean', nativeName: '한국어', direction: 'ltr', region: 'KR' },
        'es-ES': { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', direction: 'ltr', region: 'ES' },
        'fr-FR': { code: 'fr-FR', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'FR' },
        'de-DE': { code: 'de-DE', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'DE' },
        'it-IT': { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'IT' },
        'pt-BR': { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', region: 'BR' },
        'pt-PT': { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', direction: 'ltr', region: 'PT' },
        'ru-RU': { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', direction: 'ltr', region: 'RU' },
        'ar-SA': { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', region: 'SA' },
        'hi-IN': { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'IN' },
        'th-TH': { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', region: 'TH' },
        'vi-VN': { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', region: 'VN' },
        'id-ID': { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'ID' },
        'ms-MY': { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', region: 'MY' },
        'tl-PH': { code: 'tl-PH', name: 'Filipino', nativeName: 'Filipino', direction: 'ltr', region: 'PH' },
        'uk-UA': { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', region: 'UA' },
        'pl-PL': { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', direction: 'ltr', region: 'PL' },
        'cs-CZ': { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', region: 'CZ' },
        'sk-SK': { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr', region: 'SK' },
        'hu-HU': { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', region: 'HU' },
        'ro-RO': { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', direction: 'ltr', region: 'RO' },
        'bg-BG': { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', region: 'BG' },
        'el-GR': { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', region: 'GR' },
        'tr-TR': { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', region: 'TR' },
        'he-IL': { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', region: 'IL' },
        'fa-IR': { code: 'fa-IR', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', region: 'IR' },
        'ur-PK': { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', region: 'PK' },
        'bn-BD': { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', region: 'BD' },
        'ta-IN': { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', region: 'IN' },
        'ml-IN': { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', region: 'IN' },
        'kn-IN': { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', region: 'IN' },
        'te-IN': { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', region: 'IN' },
        'mr-IN': { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', region: 'IN' },
        'ne-NP': { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', region: 'NP' },
        'si-LK': { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', region: 'LK' },
        'my-MM': { code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာဘာသာ', direction: 'ltr', region: 'MM' },
        'km-KH': { code: 'km-KH', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', direction: 'ltr', region: 'KH' },
        'lo-LA': { code: 'lo-LA', name: 'Lao', nativeName: 'ລາວ', direction: 'ltr', region: 'LA' },
        'zh-SG': { code: 'zh-SG', name: 'Chinese (Singapore)', nativeName: '简体中文(新加坡)', direction: 'ltr', region: 'SG' },
    };
    defaultTranslations = {
        app: {
            name: 'Cloud Book',
            tagline: 'AI-Powered Novel Writing Platform',
        },
        nav: {
            home: 'Home',
            projects: 'Projects',
            writing: 'Writing',
            library: 'Library',
            settings: 'Settings',
        },
        actions: {
            create: 'Create',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            export: 'Export',
            import: 'Import',
            search: 'Search',
            close: 'Close',
        },
        project: {
            new: 'New Project',
            title: 'Title',
            genre: 'Genre',
            outline: 'Outline',
            chapters: 'Chapters',
            characters: 'Characters',
            worldSettings: 'World Settings',
        },
        writing: {
            newChapter: 'New Chapter',
            wordCount: 'Word Count',
            progress: 'Progress',
            aiAssist: 'AI Assist',
            autoSave: 'Auto Save',
        },
        errors: {
            required: 'This field is required',
            invalid: 'Invalid input',
            saveFailed: 'Save failed',
            loadFailed: 'Load failed',
        },
    };
    constructor(initialLocale) {
        if (initialLocale) {
            this.currentLocale = initialLocale;
        }
        this.translations.set('en-US', this.defaultTranslations);
        this.initializePluralRules();
    }
    initializePluralRules() {
        this.pluralRules.set('en-US', (n) => n === 1 ? 0 : 1);
        this.pluralRules.set('zh-CN', () => 0);
        this.pluralRules.set('zh-TW', () => 0);
        this.pluralRules.set('ja-JP', () => 0);
        this.pluralRules.set('ko-KR', () => 0);
        this.pluralRules.set('fr-FR', (n) => n > 1 ? 1 : 0);
        this.pluralRules.set('de-DE', (n) => n !== 1 ? 1 : 0);
        this.pluralRules.set('es-ES', (n) => n !== 1 ? 1 : 0);
        this.pluralRules.set('ru-RU', (n) => {
            if (n % 10 === 1 && n % 100 !== 11)
                return 0;
            return 1;
        });
        this.pluralRules.set('ar-SA', (n) => n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : 4);
        this.pluralRules.set('pl-PL', (n) => {
            if (n === 1)
                return 0;
            return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 1 : 2;
        });
    }
    setLocale(locale) {
        if (this.localeInfo[locale]) {
            this.currentLocale = locale;
            this.notifyListeners();
            this.savePreference(locale);
        }
    }
    getLocale() {
        return this.currentLocale;
    }
    getLocaleInfo() {
        return this.localeInfo[this.currentLocale];
    }
    t(key, params) {
        let value = this.getNestedValue(this.currentLocale, key);
        if (value === undefined) {
            value = this.getNestedValue(this.fallbackLocale, key);
        }
        if (value === undefined) {
            return key;
        }
        if (typeof value !== 'string') {
            return key;
        }
        if (params) {
            value = this.interpolate(value, params);
        }
        return value;
    }
    tp(key, count, params) {
        const pluralRule = this.pluralRules.get(this.currentLocale) || this.pluralRules.get('en-US');
        const pluralIndex = pluralRule(count);
        let fullKey = `${key}_${pluralIndex}`;
        let value = this.t(fullKey, params);
        if (value === fullKey) {
            value = this.t(key, { ...params, count });
        }
        return value;
    }
    getNestedValue(locale, key) {
        const translations = this.translations.get(locale);
        if (!translations)
            return undefined;
        const keys = key.split('.');
        let value = translations;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    interpolate(text, params) {
        return text.replace(/\{(\w+)\}/g, (_, key) => {
            return params[key] !== undefined ? String(params[key]) : `{${key}}`;
        });
    }
    addTranslations(locale, translations) {
        const existing = this.translations.get(locale) || {};
        this.translations.set(locale, this.deepMerge(existing, translations));
        this.notifyListeners();
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                }
                else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
    getAvailableLocales() {
        return Object.values(this.localeInfo);
    }
    getLocaleByCode(code) {
        const locale = Object.values(this.localeInfo).find(l => l.code === code);
        return locale?.code;
    }
    detectSystemLocale() {
        const nav = typeof navigator !== 'undefined' ? navigator : null;
        if (nav && nav.language) {
            const code = this.getLocaleByCode(nav.language);
            if (code)
                return code;
            const prefix = nav.language.split('-')[0];
            const match = Object.values(this.localeInfo).find(l => l.code.startsWith(prefix));
            if (match)
                return match.code;
        }
        return 'zh-CN';
    }
    formatNumber(value, options) {
        return new Intl.NumberFormat(this.currentLocale, options).format(value);
    }
    formatDate(date, options) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(this.currentLocale, options).format(d);
    }
    formatRelativeTime(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60)
            return this.t('time.justNow');
        if (minutes < 60)
            return this.tp('time.minutesAgo', minutes, { count: minutes });
        if (hours < 24)
            return this.tp('time.hoursAgo', hours, { count: hours });
        if (days < 30)
            return this.tp('time.daysAgo', days, { count: days });
        return this.formatDate(d);
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        for (const listener of this.listeners) {
            listener();
        }
    }
    savePreference(locale) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('cloudbook_locale', locale);
            }
        }
        catch { }
    }
    loadPreference() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('cloudbook_locale');
                if (saved && this.localeInfo[saved]) {
                    this.currentLocale = saved;
                }
            }
        }
        catch { }
    }
    exportTranslations(locale) {
        const translations = this.translations.get(locale);
        return JSON.stringify(translations || {}, null, 2);
    }
}
exports.I18nManager = I18nManager;
exports.default = I18nManager;
//# sourceMappingURL=I18nManager.js.map