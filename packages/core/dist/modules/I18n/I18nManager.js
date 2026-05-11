"use strict";
/**
 * 多语言支持系统 (i18n)
 * 支持全球语言、语法、拼写检查
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocaleFormatter = exports.SpellChecker = exports.GrammarChecker = exports.I18nManager = void 0;
class I18nManager {
    currentLocale = 'zh-CN';
    resources = {};
    grammarChecker;
    spellChecker;
    constructor(config) {
        if (config) {
            this.currentLocale = config.primary;
        }
        this.initializeResources();
    }
    initializeResources() {
        this.resources = {
            'app.name': {
                'zh-CN': '云书',
                'zh-TW': '雲書',
                'en-US': 'Cloud Book',
                'ja-JP': 'クラウドブック',
                'ko-KR': '클라우드 북',
                'es-ES': 'Libro en la Nube',
                'fr-FR': 'Livre Cloud',
                'de-DE': 'Cloud Buch',
                'ru-RU': 'Облачная Книга'
            },
            'app.tagline': {
                'zh-CN': '全能AI小说创作引擎',
                'zh-TW': '全能AI小說創作引擎',
                'en-US': 'Ultimate AI Novel Writing Engine',
                'ja-JP': '究極のAI小説執筆エンジン',
                'ko-KR': '최고의 AI 소설 작성 엔진',
                'es-ES': 'Motor de Escritura de Novelas con IA Definitivo',
                'fr-FR': 'Moteur de Rédaction de Romans IA Ultime',
                'de-DE': 'Ultimative KI-Roman-Schreibmaschine',
                'ru-RU': 'Универсальный ИИ-движок для написания романов'
            },
            'genre.novel': {
                'zh-CN': '长篇小说',
                'en-US': 'Novel',
                'ja-JP': '小説',
                'ko-KR': '소설',
                'es-ES': 'Novela',
                'fr-FR': 'Roman',
                'de-DE': 'Roman',
                'ru-RU': 'Роман'
            },
            'genre.poetry': {
                'zh-CN': '诗歌',
                'en-US': 'Poetry',
                'ja-JP': '詩',
                'ko-KR': '시',
                'es-ES': 'Poesía',
                'fr-FR': 'Poésie',
                'de-DE': 'Lyrik',
                'ru-RU': 'Поэзия'
            },
            'genre.short_story': {
                'zh-CN': '短篇小说',
                'en-US': 'Short Story',
                'ja-JP': '短編小説',
                'ko-KR': '단편소설',
                'es-ES': 'Cuento',
                'fr-FR': 'Nouvelle',
                'de-DE': 'Kurzgeschichte',
                'ru-RU': 'Рассказ'
            },
            'genre.drama': {
                'zh-CN': '戏剧',
                'en-US': 'Drama',
                'ja-JP': 'ドラマ',
                'ko-KR': '드라마',
                'es-ES': 'Drama',
                'fr-FR': 'Drame',
                'de-DE': 'Drama',
                'ru-RU': 'Драма'
            },
            'genre.fantasy': {
                'zh-CN': '奇幻',
                'en-US': 'Fantasy',
                'ja-JP': 'ファンタジー',
                'ko-KR': '판타지',
                'es-ES': 'Fantasía',
                'fr-FR': 'Fantasy',
                'de-DE': 'Fantasy',
                'ru-RU': 'Фэнтези'
            },
            'genre.scifi': {
                'zh-CN': '科幻',
                'en-US': 'Science Fiction',
                'ja-JP': 'SF',
                'ko-KR': 'SF',
                'es-ES': 'Ciencia Ficción',
                'fr-FR': 'Science-Fiction',
                'de-DE': 'Science-Fiction',
                'ru-RU': 'Научная фантастика'
            },
            'genre.romance': {
                'zh-CN': '言情/爱情',
                'en-US': 'Romance',
                'ja-JP': '恋愛小説',
                'ko-KR': '로맨스',
                'es-ES': 'Romance',
                'fr-FR': 'Romance',
                'de-DE': 'Liebesroman',
                'ru-RU': 'Романтика'
            },
            'genre.mystery': {
                'zh-CN': '悬疑/推理',
                'en-US': 'Mystery',
                'ja-JP': 'ミステリー',
                'ko-KR': '미스터리',
                'es-ES': 'Misterio',
                'fr-FR': 'Mystère',
                'de-DE': 'Krimi',
                'ru-RU': 'Детектив'
            },
            'genre.horror': {
                'zh-CN': '恐怖/惊悚',
                'en-US': 'Horror',
                'ja-JP': 'ホラー',
                'ko-KR': '호러',
                'es-ES': 'Terror',
                'fr-FR': 'Horreur',
                'de-DE': 'Horror',
                'ru-RU': 'Ужасы'
            },
            'genre.thriller': {
                'zh-CN': '惊悚',
                'en-US': 'Thriller',
                'ja-JP': 'サスペンス',
                'ko-KR': '스릴러',
                'es-ES': 'Suspenso',
                'fr-FR': 'Thriller',
                'de-DE': 'Thriller',
                'ru-RU': 'Триллер'
            },
            'genre.historical': {
                'zh-CN': '历史',
                'en-US': 'Historical',
                'ja-JP': '歴史小説',
                'ko-KR': '역사소설',
                'es-ES': 'Histórico',
                'fr-FR': 'Historique',
                'de-DE': 'Historisch',
                'ru-RU': 'Исторический'
            },
            'genre.literary': {
                'zh-CN': '纯文学',
                'en-US': 'Literary Fiction',
                'ja-JP': '純文学',
                'ko-KR': '순문학',
                'es-ES': 'Literatura',
                'fr-FR': 'Littérature',
                'de-DE': 'Belletristik',
                'ru-RU': 'Художественная литература'
            },
            'common.save': {
                'zh-CN': '保存',
                'en-US': 'Save',
                'ja-JP': '保存',
                'ko-KR': '저장',
                'es-ES': 'Guardar',
                'fr-FR': 'Enregistrer',
                'de-DE': 'Speichern',
                'ru-RU': 'Сохранить'
            },
            'common.export': {
                'zh-CN': '导出',
                'en-US': 'Export',
                'ja-JP': 'エクスポート',
                'ko-KR': '내보내기',
                'es-ES': 'Exportar',
                'fr-FR': 'Exporter',
                'de-DE': 'Exportieren',
                'ru-RU': 'Экспорт'
            },
            'writing.generate': {
                'zh-CN': '生成',
                'en-US': 'Generate',
                'ja-JP': '生成',
                'ko-KR': '생성',
                'es-ES': 'Generar',
                'fr-FR': 'Générer',
                'de-DE': 'Generieren',
                'ru-RU': 'Генерировать'
            },
            'writing.audit': {
                'zh-CN': '审计',
                'en-US': 'Audit',
                'ja-JP': '監査',
                'ko-KR': '감사',
                'es-ES': 'Auditar',
                'fr-FR': 'Auditer',
                'de-DE': 'Prüfen',
                'ru-RU': 'Проверить'
            }
        };
    }
    setLocale(locale) {
        this.currentLocale = locale;
    }
    getLocale() {
        return this.currentLocale;
    }
    t(key, params) {
        const translations = this.resources[key];
        if (!translations)
            return key;
        let text = translations[this.currentLocale] || translations['en-US'] || key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(`{${k}}`, v);
            }
        }
        return text;
    }
    getSupportedLanguages() {
        return [
            { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
            { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
            { code: 'en-US', name: 'English (US)', nativeName: 'English' },
            { code: 'en-GB', name: 'English (UK)', nativeName: 'English' },
            { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
            { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
            { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
            { code: 'fr-FR', name: 'French', nativeName: 'Français' },
            { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
            { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português' },
            { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
            { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
            { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands' },
            { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
            { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
            { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
            { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
            { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
            { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
            { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית' },
            { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska' }
        ];
    }
    detectLanguage(text) {
        const patterns = {
            'zh-CN': /[\u4e00-\u9fa5]/,
            'zh-TW': /[\u4e00-\u9fff]/,
            'ja-JP': /[\u3040-\u309f\u30a0-\u30ff]/,
            'ko-KR': /[\uac00-\ud7af]/,
            'ar-SA': /[\u0600-\u06ff]/,
            'th-TH': /[\u0e00-\u0e7f]/,
            'hi-IN': /[\u0900-\u097f]/,
            'ru-RU': /[\u0400-\u04ff]/
        };
        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return { language: lang, confidence: 0.95 };
            }
        }
        return { language: 'en-US', confidence: 0.8 };
    }
    addResource(key, translations) {
        this.resources[key] = translations;
    }
}
exports.I18nManager = I18nManager;
class GrammarChecker {
    language;
    llmProvider;
    constructor(language, llmProvider) {
        this.language = language;
        this.llmProvider = llmProvider;
    }
    async checkGrammar(text) {
        if (this.llmProvider) {
            return this.checkWithAI(text);
        }
        return this.basicCheck(text);
    }
    async checkWithAI(text) {
        const prompt = `Check the following text for grammar, spelling, and punctuation errors in ${this.language}.

Text: ${text}

Return a JSON object with:
{
  "errors": [{ "startIndex": 0, "endIndex": 10, "errorText": "...", "errorType": "grammar|spelling|punctuation|style", "message": "..." }],
  "suggestions": [{ "original": "...", "suggestion": "...", "reason": "..." }]
}`;
        try {
            const response = await this.llmProvider.complete(prompt, { task: 'analysis', temperature: 0.1 });
            const parsed = JSON.parse(response);
            return {
                text,
                errors: parsed.errors || [],
                suggestions: parsed.suggestions || []
            };
        }
        catch {
            return this.basicCheck(text);
        }
    }
    basicCheck(text) {
        const errors = [];
        const suggestions = [];
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.length > 0 && !/[.!?。！？]$/.test(line)) {
                suggestions.push({
                    original: line,
                    suggestion: line + '。',
                    reason: 'Sentence should end with punctuation'
                });
            }
        }
        return { text, errors, suggestions };
    }
    async correctText(text) {
        const check = await this.checkGrammar(text);
        let corrected = text;
        for (const suggestion of check.suggestions.reverse()) {
            corrected = corrected.replace(suggestion.original, suggestion.suggestion);
        }
        return corrected;
    }
}
exports.GrammarChecker = GrammarChecker;
class SpellChecker {
    language;
    customDictionary = new Set();
    constructor(language) {
        this.language = language;
    }
    addToDictionary(word) {
        this.customDictionary.add(word.toLowerCase());
    }
    async checkSpelling(text) {
        const words = text.match(/\b\w+\b/g) || [];
        const results = [];
        for (const word of words) {
            const lower = word.toLowerCase();
            const isCorrect = this.isCommonWord(lower) || this.customDictionary.has(lower);
            results.push({
                word,
                isCorrect,
                suggestions: isCorrect ? [] : this.getSuggestions(lower)
            });
        }
        return results;
    }
    isCommonWord(word) {
        const commonWords = {
            'en-US': ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'],
            'zh-CN': [],
            'zh-TW': [],
            'zh-HK': [],
            'ja-JP': ['の', 'は', 'が', 'を', 'に', 'と', 'で', 'て', 'した', 'する', 'し', 'れ', 'さ', 'ある', 'いる', 'も', 'する', 'あ', 'っ'],
            'ko-KR': [],
            'es-ES': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'ha', 'me', 'lo', 'le', 'ya', 'o', 'este', 'si', 'mi', 'por'],
            'fr-FR': ['le', 'la', 'de', 'et', 'un', 'une', 'est', 'que', 'dans', 'ce', 'il', 'ne', 'sur', 'se', 'pas', 'plus', 'son', 'avec'],
            'de-DE': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht'],
            'pt-BR': ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'uma', 'para', 'é', 'com', 'não', 'os', 'as', 'no', 'na'],
            'ru-RU': ['и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'это', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'да', 'ты'],
            'it-IT': ['il', 'di', 'e', 'che', 'la', 'un', 'una', 'è', 'per', 'non', 'sono', 'si', 'lo', 'gli', 'dei', 'da', 'con'],
            'nl-NL': ['de', 'en', 'van', 'een', 'het', 'in', 'is', 'op', 'te', 'dat', 'zijn', 'voor', 'niet', 'aan', 'er', 'maar'],
            'pl-PL': ['i', 'w', 'nie', 'na', 'do', 'się', 'to', 'z', 'o', 'jak', 'za', 'od', 'po', 'tak', 'ale', 'czy', 'może'],
            'tr-TR': ['ve', 'bir', 'bu', 'da', 'de', 'için', 'ile', 'ne', 'ya', 'gibi', 'en', 'daha', 'ama', 'çok', 'var', 'ol'],
            'ar-SA': [],
            'hi-IN': [],
            'th-TH': [],
            'vi-VN': [],
            'id-ID': [],
            'ms-MY': [],
            'he-IL': [],
            'sv-SE': ['och', 'i', 'att', 'det', 'är', 'en', 'som', 'på', 'med', 'för', 'har', 'till', 'den', 'var', 'inte', 'om'],
            'no-NO': [],
            'da-DK': [],
            'fi-FI': [],
            'cs-CZ': [],
            'hu-HU': [],
            'ro-RO': [],
            'el-GR': [],
            'en-GB': [],
            'en-AU': [],
            'en-CA': [],
            'es-MX': [],
            'es-AR': [],
            'fr-CA': [],
            'fr-BE': [],
            'de-AT': [],
            'de-CH': [],
            'pt-PT': [],
            'uk-UA': [],
            'nl-BE': [],
            'ar-EG': [],
            'ar-MA': [],
            'bn-IN': [],
            'custom': []
        };
        return (commonWords[this.language] || []).includes(word);
    }
    getSuggestions(word) {
        return [];
    }
}
exports.SpellChecker = SpellChecker;
class LocaleFormatter {
    locale;
    constructor(locale) {
        this.locale = locale;
    }
    formatNumber(num, options) {
        return new Intl.NumberFormat(this.locale, options).format(num);
    }
    formatDate(date, options) {
        return new Intl.DateTimeFormat(this.locale, options).format(date);
    }
    formatCurrency(amount, currency) {
        return new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency
        }).format(amount);
    }
    formatList(items, style) {
        return new Intl.ListFormat(this.locale, { style: style || 'long' }).format(items);
    }
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
        if (days > 0)
            return rtf.format(-days, 'day');
        if (hours > 0)
            return rtf.format(-hours, 'hour');
        if (minutes > 0)
            return rtf.format(-minutes, 'minute');
        return rtf.format(-seconds, 'second');
    }
}
exports.LocaleFormatter = LocaleFormatter;
exports.default = I18nManager;
//# sourceMappingURL=I18nManager.js.map