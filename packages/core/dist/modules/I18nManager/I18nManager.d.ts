/**
 * 国际化管理器
 * 支持45种语言，提供完整的本地化功能
 */
export type Locale = 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'en-GB' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR' | 'pt-PT' | 'ru-RU' | 'ar-SA' | 'hi-IN' | 'th-TH' | 'vi-VN' | 'id-ID' | 'ms-MY' | 'tl-PH' | 'uk-UA' | 'pl-PL' | 'cs-CZ' | 'sk-SK' | 'hu-HU' | 'ro-RO' | 'bg-BR' | 'el-GR' | 'tr-TR' | 'he-IL' | 'fa-IR' | 'ur-PK' | 'bn-BD' | 'ta-IN' | 'ml-IN' | 'kn-IN' | 'te-IN' | 'mr-IN' | 'ne-NP' | 'si-LK' | 'my-MM' | 'km-KH' | 'lo-LA' | 'zh-SG';
export interface LocaleInfo {
    code: Locale;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    region?: string;
}
export interface TranslationMap {
    [key: string]: string | TranslationMap;
}
export declare class I18nManager {
    private currentLocale;
    private translations;
    private fallbackLocale;
    private listeners;
    private pluralRules;
    private localeInfo;
    private translationsData;
    constructor(initialLocale?: Locale);
    private initializeTranslations;
    private initializePluralRules;
    setLocale(locale: Locale): void;
    getLocale(): Locale;
    getLocaleInfo(): LocaleInfo;
    t(key: string, params?: Record<string, string | number>): string;
    tp(key: string, count: number, params?: Record<string, string | number>): string;
    private getNestedValue;
    private interpolate;
    addTranslations(locale: Locale, translations: TranslationMap): void;
    private deepMerge;
    getAvailableLocales(): LocaleInfo[];
    getLocaleByCode(code: string): Locale | undefined;
    detectSystemLocale(): Locale;
    formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
    formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
    formatRelativeTime(date: Date | string): string;
    subscribe(listener: () => void): () => void;
    private notifyListeners;
    private savePreference;
    loadPreference(): void;
    exportTranslations(locale: Locale): string;
    getSupportedLanguagesCount(): number;
    getFullyTranslatedLanguages(): Locale[];
}
export default I18nManager;
//# sourceMappingURL=I18nManager.d.ts.map