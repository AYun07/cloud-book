"use strict";
/**
 * 国际化管理器
 * 支持45种语言，提供完整的本地化功能
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
        'bg-BR': { code: 'bg-BR', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', region: 'BG' },
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
    translationsData = {
        'en-US': {
            app: { name: 'Cloud Book', tagline: 'AI-Powered Novel Writing Platform' },
            nav: { home: 'Home', projects: 'Projects', writing: 'Writing', library: 'Library', settings: 'Settings', tools: 'Tools', community: 'Community' },
            actions: { create: 'Create', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', export: 'Export', import: 'Import', search: 'Search', close: 'Close', generate: 'Generate', analyze: 'Analyze', optimize: 'Optimize' },
            project: { new: 'New Project', title: 'Title', genre: 'Genre', outline: 'Outline', chapters: 'Chapters', characters: 'Characters', worldSettings: 'World Settings', tags: 'Tags', description: 'Description' },
            writing: { newChapter: 'New Chapter', wordCount: 'Word Count', progress: 'Progress', aiAssist: 'AI Assist', autoSave: 'Auto Save', continueWriting: 'Continue Writing', outline: 'Outline Mode', brainstorm: 'Brainstorm' },
            errors: { required: 'This field is required', invalid: 'Invalid input', saveFailed: 'Save failed', loadFailed: 'Load failed', networkError: 'Network error' },
            time: { justNow: 'Just now', minutesAgo_0: '{count} minute ago', minutesAgo_1: '{count} minutes ago', hoursAgo_0: '{count} hour ago', hoursAgo_1: '{count} hours ago', daysAgo_0: '{count} day ago', daysAgo_1: '{count} days ago' },
        },
        'zh-CN': {
            app: { name: '云书', tagline: 'AI智能小说创作平台' },
            nav: { home: '首页', projects: '项目', writing: '写作', library: '素材库', settings: '设置', tools: '工具', community: '社区' },
            actions: { create: '创建', save: '保存', cancel: '取消', delete: '删除', edit: '编辑', export: '导出', import: '导入', search: '搜索', close: '关闭', generate: '生成', analyze: '分析', optimize: '优化' },
            project: { new: '新建项目', title: '标题', genre: '题材', outline: '大纲', chapters: '章节', characters: '角色', worldSettings: '世界观设定', tags: '标签', description: '简介' },
            writing: { newChapter: '新建章节', wordCount: '字数', progress: '进度', aiAssist: 'AI辅助', autoSave: '自动保存', continueWriting: '续写', outline: '大纲模式', brainstorm: '头脑风暴' },
            errors: { required: '此字段为必填项', invalid: '输入无效', saveFailed: '保存失败', loadFailed: '加载失败', networkError: '网络错误' },
            time: { justNow: '刚刚', minutesAgo_0: '{count}分钟前', minutesAgo_1: '{count}分钟前', hoursAgo_0: '{count}小时前', hoursAgo_1: '{count}小时前', daysAgo_0: '{count}天前', daysAgo_1: '{count}天前' },
        },
        'zh-TW': {
            app: { name: '雲書', tagline: 'AI智慧小說創作平臺' },
            nav: { home: '首頁', projects: '項目', writing: '寫作', library: '素材庫', settings: '設定', tools: '工具', community: '社區' },
            actions: { create: '創建', save: '保存', cancel: '取消', delete: '刪除', edit: '編輯', export: '導出', import: '導入', search: '搜索', close: '關閉', generate: '生成', analyze: '分析', optimize: '優化' },
            project: { new: '新建項目', title: '標題', genre: '題材', outline: '大綱', chapters: '章節', characters: '角色', worldSettings: '世界觀設定', tags: '標籤', description: '簡介' },
            writing: { newChapter: '新建章節', wordCount: '字數', progress: '進度', aiAssist: 'AI輔助', autoSave: '自動保存', continueWriting: '續寫', outline: '大綱模式', brainstorm: '頭腦風暴' },
            errors: { required: '此欄位為必填項', invalid: '輸入無效', saveFailed: '保存失敗', loadFailed: '載入失敗', networkError: '網路錯誤' },
            time: { justNow: '剛剛', minutesAgo_0: '{count}分鐘前', minutesAgo_1: '{count}分鐘前', hoursAgo_0: '{count}小時前', hoursAgo_1: '{count}小時前', daysAgo_0: '{count}天前', daysAgo_1: '{count}天前' },
        },
        'ja-JP': {
            app: { name: 'クラウドブック', tagline: 'AI小説作成プラットフォーム' },
            nav: { home: 'ホーム', projects: 'プロジェクト', writing: '執筆', library: '素材庫', settings: '設定', tools: 'ツール', community: 'コミュニティ' },
            actions: { create: '作成', save: '保存', cancel: 'キャンセル', delete: '削除', edit: '編集', export: 'エクスポート', import: 'インポート', search: '検索', close: '閉じる', generate: '生成', analyze: '分析', optimize: '最適化' },
            project: { new: '新規プロジェクト', title: 'タイトル', genre: 'ジャンル', outline: 'アウトライン', chapters: '章', characters: 'キャラクター', worldSettings: '世界観設定', tags: 'タグ', description: '概要' },
            writing: { newChapter: '新規章', wordCount: '文字数', progress: '進捗', aiAssist: 'AIアシスタント', autoSave: '自動保存', continueWriting: '続きを書く', outline: 'アウトラインモード', brainstorm: 'ブレインストーミング' },
            errors: { required: 'この項目は必須です', invalid: '入力が無効です', saveFailed: '保存に失敗しました', loadFailed: '読み込みに失敗しました', networkError: 'ネットワークエラー' },
            time: { justNow: 'たった今', minutesAgo_0: '{count}分前', minutesAgo_1: '{count}分前', hoursAgo_0: '{count}時間前', hoursAgo_1: '{count}時間前', daysAgo_0: '{count}日前', daysAgo_1: '{count}日前' },
        },
        'ko-KR': {
            app: { name: '클라우드북', tagline: 'AI 소설 창작 플랫폼' },
            nav: { home: '홈', projects: '프로젝트', writing: '글쓰기', library: '자료실', settings: '설정', tools: '도구', community: '커뮤니티' },
            actions: { create: '만들기', save: '저장', cancel: '취소', delete: '삭제', edit: '편집', export: '내보내기', import: '가져오기', search: '검색', close: '닫기', generate: '생성', analyze: '분석', optimize: '최적화' },
            project: { new: '새 프로젝트', title: '제목', genre: '장르', outline: '개요', chapters: '챕터', characters: '캐릭터', worldSettings: '세계관 설정', tags: '태그', description: '설명' },
            writing: { newChapter: '새 챕터', wordCount: '글자 수', progress: '진행률', aiAssist: 'AI 도우미', autoSave: '자동 저장', continueWriting: '이어쓰기', outline: '개요 모드', brainstorm: '브레인스토밍' },
            errors: { required: '필수 항목입니다', invalid: '입력 오류', saveFailed: '저장 실패', loadFailed: '불러오기 실패', networkError: '네트워크 오류' },
            time: { justNow: '방금', minutesAgo_0: '{count}분 전', minutesAgo_1: '{count}분 전', hoursAgo_0: '{count}시간 전', hoursAgo_1: '{count}시간 전', daysAgo_0: '{count}일 전', daysAgo_1: '{count}일 전' },
        },
        'es-ES': {
            app: { name: 'Cloud Book', tagline: 'Plataforma de Escritura de Novelas con IA' },
            nav: { home: 'Inicio', projects: 'Proyectos', writing: 'Escritura', library: 'Biblioteca', settings: 'Configuración', tools: 'Herramientas', community: 'Comunidad' },
            actions: { create: 'Crear', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', export: 'Exportar', import: 'Importar', search: 'Buscar', close: 'Cerrar', generate: 'Generar', analyze: 'Analizar', optimize: 'Optimizar' },
            project: { new: 'Nuevo Proyecto', title: 'Título', genre: 'Género', outline: 'Esquema', chapters: 'Capítulos', characters: 'Personajes', worldSettings: 'Configuración del Mundo', tags: 'Etiquetas', description: 'Descripción' },
            writing: { newChapter: 'Nuevo Capítulo', wordCount: 'Conteo de Palabras', progress: 'Progreso', aiAssist: 'Asistente IA', autoSave: 'Guardado Automático', continueWriting: 'Continuar Escritura', outline: 'Modo Esquema', brainstorm: 'Lluvia de Ideas' },
            errors: { required: 'Este campo es obligatorio', invalid: 'Entrada inválida', saveFailed: 'Error al guardar', loadFailed: 'Error al cargar', networkError: 'Error de red' },
            time: { justNow: 'Ahora mismo', minutesAgo_0: 'Hace {count} minuto', minutesAgo_1: 'Hace {count} minutos', hoursAgo_0: 'Hace {count} hora', hoursAgo_1: 'Hace {count} horas', daysAgo_0: 'Hace {count} día', daysAgo_1: 'Hace {count} días' },
        },
        'fr-FR': {
            app: { name: 'Cloud Book', tagline: 'Plateforme de Rédaction de Romans IA' },
            nav: { home: 'Accueil', projects: 'Projets', writing: 'Rédaction', library: 'Bibliothèque', settings: 'Paramètres', tools: 'Outils', community: 'Communauté' },
            actions: { create: 'Créer', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', export: 'Exporter', import: 'Importer', search: 'Rechercher', close: 'Fermer', generate: 'Générer', analyze: 'Analyser', optimize: 'Optimiser' },
            project: { new: 'Nouveau Projet', title: 'Titre', genre: 'Genre', outline: 'Plan', chapters: 'Chapitres', characters: 'Personnages', worldSettings: 'Paramètres du Monde', tags: 'Tags', description: 'Description' },
            writing: { newChapter: 'Nouveau Chapitre', wordCount: 'Nombre de Mots', progress: 'Progression', aiAssist: 'Assistant IA', autoSave: 'Sauvegarde Auto', continueWriting: 'Continuer', outline: 'Mode Plan', brainstorm: 'Brainstorming' },
            errors: { required: 'Ce champ est requis', invalid: 'Entrée invalide', saveFailed: 'Échec de sauvegarde', loadFailed: 'Échec de chargement', networkError: 'Erreur réseau' },
            time: { justNow: 'À l\'instant', minutesAgo_0: 'Il y a {count} minute', minutesAgo_1: 'Il y a {count} minutes', hoursAgo_0: 'Il y a {count} heure', hoursAgo_1: 'Il y a {count} heures', daysAgo_0: 'Il y a {count} jour', daysAgo_1: 'Il y a {count} jours' },
        },
        'de-DE': {
            app: { name: 'Cloud Book', tagline: 'KI-gestützte Roman-Schreibplattform' },
            nav: { home: 'Startseite', projects: 'Projekte', writing: 'Schreiben', library: 'Bibliothek', settings: 'Einstellungen', tools: 'Werkzeuge', community: 'Gemeinschaft' },
            actions: { create: 'Erstellen', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', export: 'Exportieren', import: 'Importieren', search: 'Suchen', close: 'Schließen', generate: 'Generieren', analyze: 'Analysieren', optimize: 'Optimieren' },
            project: { new: 'Neues Projekt', title: 'Titel', genre: 'Genre', outline: 'Gliederung', chapters: 'Kapitel', characters: 'Charaktere', worldSettings: 'Welt-Einstellungen', tags: 'Tags', description: 'Beschreibung' },
            writing: { newChapter: 'Neues Kapitel', wordCount: 'Wortanzahl', progress: 'Fortschritt', aiAssist: 'KI-Assistent', autoSave: 'Auto-Speichern', continueWriting: 'Fortsetzen', outline: 'Gliederungsmodus', brainstorm: 'Brainstorming' },
            errors: { required: 'Dieses Feld ist erforderlich', invalid: 'Ungültige Eingabe', saveFailed: 'Speichern fehlgeschlagen', loadFailed: 'Laden fehlgeschlagen', networkError: 'Netzwerkfehler' },
            time: { justNow: 'Gerade eben', minutesAgo_0: 'Vor {count} Minute', minutesAgo_1: 'Vor {count} Minuten', hoursAgo_0: 'Vor {count} Stunde', hoursAgo_1: 'Vor {count} Stunden', daysAgo_0: 'Vor {count} Tag', daysAgo_1: 'Vor {count} Tagen' },
        },
        'ru-RU': {
            app: { name: 'Cloud Book', tagline: 'Платформа для написания романов с ИИ' },
            nav: { home: 'Главная', projects: 'Проекты', writing: 'Написание', library: 'Библиотека', settings: 'Настройки', tools: 'Инструменты', community: 'Сообщество' },
            actions: { create: 'Создать', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Редактировать', export: 'Экспорт', import: 'Импорт', search: 'Поиск', close: 'Закрыть', generate: 'Создать', analyze: 'Анализ', optimize: 'Оптимизировать' },
            project: { new: 'Новый проект', title: 'Название', genre: 'Жанр', outline: 'План', chapters: 'Главы', characters: 'Персонажи', worldSettings: 'Настройки мира', tags: 'Теги', description: 'Описание' },
            writing: { newChapter: 'Новая глава', wordCount: 'Количество слов', progress: 'Прогресс', aiAssist: 'ИИ-помощник', autoSave: 'Автосохранение', continueWriting: 'Продолжить', outline: 'Режим плана', brainstorm: 'Мозговой штурм' },
            errors: { required: 'Это поле обязательно', invalid: 'Неверный ввод', saveFailed: 'Ошибка сохранения', loadFailed: 'Ошибка загрузки', networkError: 'Ошибка сети' },
            time: { justNow: 'Только что', minutesAgo_0: '{count} минуту назад', minutesAgo_1: '{count} минут назад', hoursAgo_0: '{count} час назад', hoursAgo_1: '{count} часов назад', daysAgo_0: '{count} день назад', daysAgo_1: '{count} дней назад' },
        },
        'pt-BR': {
            app: { name: 'Cloud Book', tagline: 'Plataforma de Escrita de Romances com IA' },
            nav: { home: 'Início', projects: 'Projetos', writing: 'Escrita', library: 'Biblioteca', settings: 'Configurações', tools: 'Ferramentas', community: 'Comunidade' },
            actions: { create: 'Criar', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', export: 'Exportar', import: 'Importar', search: 'Buscar', close: 'Fechar', generate: 'Gerar', analyze: 'Analisar', optimize: 'Otimizar' },
            project: { new: 'Novo Projeto', title: 'Título', genre: 'Gênero', outline: 'Esboço', chapters: 'Capítulos', characters: 'Personagens', worldSettings: 'Configurações do Mundo', tags: 'Tags', description: 'Descrição' },
            writing: { newChapter: 'Novo Capítulo', wordCount: 'Contagem de Palavras', progress: 'Progresso', aiAssist: 'Assistente IA', autoSave: 'Salvar Automaticamente', continueWriting: 'Continuar', outline: 'Modo Esboço', brainstorm: 'Tempestade de Ideias' },
            errors: { required: 'Este campo é obrigatório', invalid: 'Entrada inválida', saveFailed: 'Falha ao salvar', loadFailed: 'Falha ao carregar', networkError: 'Erro de rede' },
            time: { justNow: 'Agora mesmo', minutesAgo_0: 'Há {count} minuto', minutesAgo_1: 'Há {count} minutos', hoursAgo_0: 'Há {count} hora', hoursAgo_1: 'Há {count} horas', daysAgo_0: 'Há {count} dia', daysAgo_1: 'Há {count} dias' },
        },
        'ar-SA': {
            app: { name: 'كلاود بوك', tagline: 'منصة كتابة الروايات بالذكاء الاصطناعي' },
            nav: { home: 'الرئيسية', projects: 'المشاريع', writing: 'الكتابة', library: 'المكتبة', settings: 'الإعدادات', tools: 'الأدوات', community: 'المجتمع' },
            actions: { create: 'إنشاء', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', export: 'تصدير', import: 'استيراد', search: 'بحث', close: 'إغلاق', generate: 'إنشاء', analyze: 'تحليل', optimize: 'تحسين' },
            project: { new: 'مشروع جديد', title: 'العنوان', genre: 'النوع', outline: 'المخطط', chapters: 'الفصول', characters: 'الشخصيات', worldSettings: 'إعدادات العالم', tags: 'الوسوم', description: 'الوصف' },
            writing: { newChapter: 'فصل جديد', wordCount: 'عدد الكلمات', progress: 'التقدم', aiAssist: 'مساعد الذكاء الاصطناعي', autoSave: 'الحفظ التلقائي', continueWriting: 'متابعة الكتابة', outline: 'وضع المخطط', brainstorm: 'العصف الذهني' },
            errors: { required: 'هذا الحقل مطلوب', invalid: 'إدخال غير صالح', saveFailed: 'فشل الحفظ', loadFailed: 'فشل التحميل', networkError: 'خطأ في الشبكة' },
            time: { justNow: 'الآن', minutesAgo_0: 'منذ {count} دقيقة', minutesAgo_1: 'منذ {count} دقائق', hoursAgo_0: 'منذ {count} ساعة', hoursAgo_1: 'منذ {count} ساعات', daysAgo_0: 'منذ {count} يوم', daysAgo_1: 'منذ {count} أيام' },
        },
        'hi-IN': {
            app: { name: 'क्लाउड बुक', tagline: 'AI नवलेखन मंच' },
            nav: { home: 'होम', projects: 'प्रोजेक्ट्स', writing: 'लेखन', library: 'लाइब्रेरी', settings: 'सेटिंग्स', tools: 'टूल्स', community: 'समुदाय' },
            actions: { create: 'बनाएं', save: 'सेव करें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'संपादित करें', export: 'निर्यात', import: 'आयात', search: 'खोजें', close: 'बंद करें', generate: 'जनरेट', analyze: 'विश्लेषण', optimize: 'अनुकूलित' },
            project: { new: 'नया प्रोजेक्ट', title: 'शीर्षक', genre: 'शैली', outline: 'रूपरेखा', chapters: 'अध्याय', characters: 'पात्र', worldSettings: 'विश्व सेटिंग्स', tags: 'टैग', description: 'विवरण' },
            writing: { newChapter: 'नया अध्याय', wordCount: 'शब्द गणना', progress: 'प्रगति', aiAssist: 'AI सहायक', autoSave: 'ऑटो सेव', continueWriting: 'जारी रखें', outline: 'रूपरेखा मोड', brainstorm: 'ब्रेनस्टॉर्मिंग' },
            errors: { required: 'यह फ़ील्ड आवश्यक है', invalid: 'अमान्य इनपुट', saveFailed: 'सेव विफल', loadFailed: 'लोड विफल', networkError: 'नेटवर्क त्रुटि' },
            time: { justNow: 'अभी', minutesAgo_0: '{count} मिनट पहले', minutesAgo_1: '{count} मिनट पहले', hoursAgo_0: '{count} घंटे पहले', hoursAgo_1: '{count} घंटे पहले', daysAgo_0: '{count} दिन पहले', daysAgo_1: '{count} दिन पहले' },
        },
        'th-TH': {
            app: { name: 'คลาวด์บุ๊ก', tagline: 'แพลตฟอร์มเขียนนิยาย AI' },
            nav: { home: 'หน้าแรก', projects: 'โปรเจกต์', writing: 'การเขียน', library: 'ไลบรารี', settings: 'การตั้งค่า', tools: 'เครื่องมือ', community: 'ชุมชน' },
            actions: { create: 'สร้าง', save: 'บันทึก', cancel: 'ยกเลิก', delete: 'ลบ', edit: 'แก้ไข', export: 'ส่งออก', import: 'นำเข้า', search: 'ค้นหา', close: 'ปิด', generate: 'สร้าง', analyze: 'วิเคราะห์', optimize: 'ปรับปรุง' },
            project: { new: 'โปรเจกต์ใหม่', title: 'หัวข้อ', genre: 'แนว', outline: 'เค้าโครง', chapters: 'บท', characters: 'ตัวละคร', worldSettings: 'การตั้งค่าโลก', tags: 'แท็ก', description: 'คำอธิบาย' },
            writing: { newChapter: 'บทใหม่', wordCount: 'จำนวนคำ', progress: 'ความก้าวหน้า', aiAssist: 'ผู้ช่วย AI', autoSave: 'บันทึกอัตโนมัติ', continueWriting: 'เขียนต่อ', outline: 'โหมดเค้าโครง', brainstorm: 'การระดมสมอง' },
            errors: { required: 'ช่องนี้จำเป็น', invalid: 'ข้อมูลไม่ถูกต้อง', saveFailed: 'บันทึกล้มเหลว', loadFailed: 'โหลดล้มเหลว', networkError: 'ข้อผิดพลาดเครือข่าย' },
            time: { justNow: 'เพิ่งนี้', minutesAgo_0: '{count} นาทีที่แล้ว', minutesAgo_1: '{count} นาทีที่แล้ว', hoursAgo_0: '{count} ชั่วโมงที่แล้ว', hoursAgo_1: '{count} ชั่วโมงที่แล้ว', daysAgo_0: '{count} วันที่แล้ว', daysAgo_1: '{count} วันที่แล้ว' },
        },
        'vi-VN': {
            app: { name: 'Cloud Book', tagline: 'Nền tảng viết tiểu thuyết AI' },
            nav: { home: 'Trang chủ', projects: 'Dự án', writing: 'Viết', library: 'Thư viện', settings: 'Cài đặt', tools: 'Công cụ', community: 'Cộng đồng' },
            actions: { create: 'Tạo', save: 'Lưu', cancel: 'Hủy', delete: 'Xóa', edit: 'Sửa', export: 'Xuất', import: 'Nhập', search: 'Tìm kiếm', close: 'Đóng', generate: 'Tạo', analyze: 'Phân tích', optimize: 'Tối ưu' },
            project: { new: 'Dự án mới', title: 'Tiêu đề', genre: 'Thể loại', outline: 'Dàn ý', chapters: 'Chương', characters: 'Nhân vật', worldSettings: 'Cài đặt thế giới', tags: 'Tags', description: 'Mô tả' },
            writing: { newChapter: 'Chương mới', wordCount: 'Số từ', progress: 'Tiến độ', aiAssist: 'Trợ lý AI', autoSave: 'Tự động lưu', continueWriting: 'Tiếp tục', outline: 'Chế độ dàn ý', brainstorm: 'Động não' },
            errors: { required: 'Trường này bắt buộc', invalid: 'Đầu vào không hợp lệ', saveFailed: 'Lưu thất bại', loadFailed: 'Tải thất bại', networkError: 'Lỗi mạng' },
            time: { justNow: 'Vừa xong', minutesAgo_0: '{count} phút trước', minutesAgo_1: '{count} phút trước', hoursAgo_0: '{count} giờ trước', hoursAgo_1: '{count} giờ trước', daysAgo_0: '{count} ngày trước', daysAgo_1: '{count} ngày trước' },
        },
        'id-ID': {
            app: { name: 'Cloud Book', tagline: 'Platform Penulisan Novel AI' },
            nav: { home: 'Beranda', projects: 'Proyek', writing: 'Menulis', library: 'Perpustakaan', settings: 'Pengaturan', tools: 'Alat', community: 'Komunitas' },
            actions: { create: 'Buat', save: 'Simpan', cancel: 'Batal', delete: 'Hapus', edit: 'Edit', export: 'Ekspor', import: 'Impor', search: 'Cari', close: 'Tutup', generate: 'Hasilkan', analyze: 'Analisis', optimize: 'Optimasi' },
            project: { new: 'Proyek Baru', title: 'Judul', genre: 'Genre', outline: 'Garis Besar', chapters: 'Bab', characters: 'Karakter', worldSettings: 'Pengaturan Dunia', tags: 'Tag', description: 'Deskripsi' },
            writing: { newChapter: 'Bab Baru', wordCount: 'Jumlah Kata', progress: 'Kemajuan', aiAssist: 'Asisten AI', autoSave: 'Simpan Otomatis', continueWriting: 'Lanjutkan', outline: 'Mode Garis Besar', brainstorm: 'Brainstorming' },
            errors: { required: 'Kolom ini wajib diisi', invalid: 'Input tidak valid', saveFailed: 'Gagal menyimpan', loadFailed: 'Gagal memuat', networkError: 'Kesalahan jaringan' },
            time: { justNow: 'Baru saja', minutesAgo_0: '{count} menit yang lalu', minutesAgo_1: '{count} menit yang lalu', hoursAgo_0: '{count} jam yang lalu', hoursAgo_1: '{count} jam yang lalu', daysAgo_0: '{count} hari yang lalu', daysAgo_1: '{count} hari yang lalu' },
        },
        'tr-TR': {
            app: { name: 'Cloud Book', tagline: 'AI Destekli Roman Yazma Platformu' },
            nav: { home: 'Ana Sayfa', projects: 'Projeler', writing: 'Yazma', library: 'Kütüphane', settings: 'Ayarlar', tools: 'Araçlar', community: 'Topluluk' },
            actions: { create: 'Oluştur', save: 'Kaydet', cancel: 'İptal', delete: 'Sil', edit: 'Düzenle', export: 'Dışa Aktar', import: 'İçe Aktar', search: 'Ara', close: 'Kapat', generate: 'Oluştur', analyze: 'Analiz', optimize: 'Optimize' },
            project: { new: 'Yeni Proje', title: 'Başlık', genre: 'Tür', outline: 'Taslak', chapters: 'Bölümler', characters: 'Karakterler', worldSettings: 'Dünya Ayarları', tags: 'Etiketler', description: 'Açıklama' },
            writing: { newChapter: 'Yeni Bölüm', wordCount: 'Kelime Sayısı', progress: 'İlerleme', aiAssist: 'AI Asistanı', autoSave: 'Otomatik Kaydet', continueWriting: 'Devam Et', outline: 'Taslak Modu', brainstorm: 'Beyin Fırtınası' },
            errors: { required: 'Bu alan zorunludur', invalid: 'Geçersiz giriş', saveFailed: 'Kaydetme başarısız', loadFailed: 'Yükleme başarısız', networkError: 'Ağ hatası' },
            time: { justNow: 'Az önce', minutesAgo_0: '{count} dakika önce', minutesAgo_1: '{count} dakika önce', hoursAgo_0: '{count} saat önce', hoursAgo_1: '{count} saat önce', daysAgo_0: '{count} gün önce', daysAgo_1: '{count} gün önce' },
        },
    };
    constructor(initialLocale) {
        if (initialLocale) {
            this.currentLocale = initialLocale;
        }
        this.initializeTranslations();
        this.initializePluralRules();
    }
    initializeTranslations() {
        for (const [locale, translations] of Object.entries(this.translationsData)) {
            this.translations.set(locale, translations);
        }
    }
    initializePluralRules() {
        this.pluralRules.set('en-US', (n) => n === 1 ? 0 : 1);
        this.pluralRules.set('zh-CN', () => 0);
        this.pluralRules.set('zh-TW', () => 0);
        this.pluralRules.set('zh-HK', () => 0);
        this.pluralRules.set('zh-SG', () => 0);
        this.pluralRules.set('ja-JP', () => 0);
        this.pluralRules.set('ko-KR', () => 0);
        this.pluralRules.set('fr-FR', (n) => n > 1 ? 1 : 0);
        this.pluralRules.set('de-DE', (n) => n !== 1 ? 1 : 0);
        this.pluralRules.set('es-ES', (n) => n !== 1 ? 1 : 0);
        this.pluralRules.set('it-IT', (n) => n !== 1 ? 1 : 0);
        this.pluralRules.set('pt-BR', (n) => n > 1 ? 1 : 0);
        this.pluralRules.set('pt-PT', (n) => n !== 1 ? 1 : 0);
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
        this.pluralRules.set('hi-IN', (n) => n === 1 ? 0 : 1);
        this.pluralRules.set('th-TH', () => 0);
        this.pluralRules.set('vi-VN', (n) => n === 1 ? 0 : 1);
        this.pluralRules.set('id-ID', (n) => n === 1 ? 0 : 1);
        this.pluralRules.set('tr-TR', (n) => n !== 1 ? 1 : 0);
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
    getSupportedLanguagesCount() {
        return Object.keys(this.localeInfo).length;
    }
    getFullyTranslatedLanguages() {
        const fullyTranslated = [];
        for (const locale of Object.keys(this.translationsData)) {
            if (this.translationsData[locale]) {
                fullyTranslated.push(locale);
            }
        }
        return fullyTranslated;
    }
}
exports.I18nManager = I18nManager;
exports.default = I18nManager;
//# sourceMappingURL=I18nManager.js.map