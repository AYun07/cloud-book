/**
 * 多语言支持系统 (i18n)
 * 支持全球语言、语法、拼写检查
 */
export type Language = 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'en-GB' | 'en-AU' | 'en-CA' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'es-MX' | 'es-AR' | 'fr-FR' | 'fr-CA' | 'fr-BE' | 'de-DE' | 'de-AT' | 'de-CH' | 'pt-BR' | 'pt-PT' | 'ru-RU' | 'uk-UA' | 'it-IT' | 'nl-NL' | 'nl-BE' | 'pl-PL' | 'tr-TR' | 'ar-SA' | 'ar-EG' | 'ar-MA' | 'hi-IN' | 'bn-IN' | 'th-TH' | 'vi-VN' | 'id-ID' | 'ms-MY' | 'he-IL' | 'sv-SE' | 'no-NO' | 'da-DK' | 'fi-FI' | 'cs-CZ' | 'hu-HU' | 'ro-RO' | 'el-GR' | 'custom';
export interface LanguageConfig {
    primary: Language;
    secondary?: Language;
    fallback: Language;
    autoDetect: boolean;
}
export interface I18nResources {
    [key: string]: {
        [lang in Language]?: string;
    };
}
export interface TranslationResult {
    text: string;
    sourceLang: Language;
    targetLang: Language;
    confidence: number;
}
export interface GrammarCheck {
    text: string;
    errors: GrammarError[];
    suggestions: GrammarSuggestion[];
}
export interface GrammarError {
    startIndex: number;
    endIndex: number;
    errorText: string;
    errorType: 'spelling' | 'grammar' | 'punctuation' | 'style';
    message: string;
}
export interface GrammarSuggestion {
    original: string;
    suggestion: string;
    reason?: string;
}
export interface WritingStyle {
    locale: Language;
    formality: 'formal' | 'informal' | 'neutral';
    tone: 'serious' | 'casual' | 'professional' | 'academic' | 'literary';
    voice: 'first' | 'second' | 'third';
    dialect?: string;
}
export interface LocalizedContent {
    locale: Language;
    title: string;
    description: string;
    metadata: Record<string, string>;
}
export declare class I18nManager {
    private currentLocale;
    private resources;
    private grammarChecker?;
    private spellChecker?;
    constructor(config?: LanguageConfig);
    private initializeResources;
    setLocale(locale: Language): void;
    getLocale(): Language;
    t(key: string, params?: Record<string, string>): string;
    getSupportedLanguages(): {
        code: Language;
        name: string;
        nativeName: string;
    }[];
    detectLanguage(text: string): {
        language: Language;
        confidence: number;
    };
    addResource(key: string, translations: Record<Language, string>): void;
}
export declare class GrammarChecker {
    private language;
    private llmProvider?;
    constructor(language: Language, llmProvider?: any);
    checkGrammar(text: string): Promise<GrammarCheck>;
    private checkWithAI;
    private basicCheck;
    correctText(text: string): Promise<string>;
}
export declare class SpellChecker {
    private language;
    private customDictionary;
    constructor(language: Language);
    addToDictionary(word: string): void;
    checkSpelling(text: string): Promise<{
        word: string;
        isCorrect: boolean;
        suggestions: string[];
    }[]>;
    private isCommonWord;
    private getSuggestions;
}
export declare class LocaleFormatter {
    private locale;
    constructor(locale: Language);
    formatNumber(num: number, options?: Intl.NumberFormatOptions): string;
    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string;
    formatCurrency(amount: number, currency: string): string;
    formatList(items: string[], style?: 'long' | 'short' | 'narrow'): string;
    formatRelativeTime(date: Date): string;
}
export default I18nManager;
//# sourceMappingURL=I18nManager.d.ts.map