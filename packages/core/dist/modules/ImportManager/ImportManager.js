"use strict";
/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub等格式的小说
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportManager = void 0;
class ImportManager {
    defaultOptions = {
        format: 'auto',
        encoding: 'utf-8',
        extractMetadata: true
    };
    chapterPatterns = [
        /^第[一二三四五六七八九十百千\d]+章/m,
        /^Chapter\s+\d+/im,
        /^第\d+章/m,
        /^第[一二三四五六七八九十百千\d]+节/m,
        /^\d+\./m,
    ];
    async import(content, options) {
        const opts = { ...this.defaultOptions, ...options };
        try {
            let format = opts.format;
            if (format === 'auto') {
                format = this.detectFormat(content, opts);
            }
            let project = {};
            let chapters = [];
            const warnings = [];
            switch (format) {
                case 'txt':
                    const txtResult = this.parseTxt(content, opts);
                    project = txtResult.metadata;
                    chapters = txtResult.chapters;
                    break;
                case 'md':
                    const mdResult = this.parseMarkdown(content, opts);
                    project = mdResult.metadata;
                    chapters = mdResult.chapters;
                    break;
                case 'json':
                    const jsonResult = this.parseJson(content);
                    project = jsonResult.project;
                    chapters = jsonResult.chapters;
                    break;
                case 'html':
                    const htmlResult = this.parseHtml(content);
                    project = htmlResult.metadata;
                    chapters = htmlResult.chapters;
                    break;
                case 'epub':
                    const epubResult = this.parseEpub(content);
                    project = epubResult.metadata;
                    chapters = epubResult.chapters;
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            if (chapters.length === 0) {
                warnings.push('未检测到章节，请检查文件格式');
            }
            return {
                success: true,
                project,
                chapters,
                warnings: warnings.length > 0 ? warnings : undefined
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async importFromFile(file, options) {
        return new Promise((resolve) => {
            if (typeof FileReader === 'undefined') {
                resolve({ success: false, error: 'FileReader not available' });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                const result = this.import(content, options);
                resolve(result);
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Failed to read file'
                });
            };
            reader.readAsText(file);
        });
    }
    detectFormat(content, options) {
        const trimmed = content.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                JSON.parse(trimmed);
                return 'json';
            }
            catch { }
        }
        if (trimmed.startsWith('<?xml') || trimmed.includes('<package')) {
            return 'epub';
        }
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
            return 'html';
        }
        if (trimmed.startsWith('#') || trimmed.startsWith('##')) {
            return 'md';
        }
        return 'txt';
    }
    parseTxt(content, options) {
        const metadata = {};
        const chapters = [];
        const lines = content.split(/\r?\n/);
        let currentChapter = null;
        let currentContent = [];
        const chapterPattern = options.chapterPattern || this.createChapterPattern(lines);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (i === 0 && options.extractMetadata && !chapterPattern.test(line)) {
                metadata.title = line;
                continue;
            }
            if (chapterPattern.test(line)) {
                if (currentChapter) {
                    chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                }
                currentChapter = {
                    number: chapters.length + 1,
                    title: this.extractChapterTitle(line),
                    content: ''
                };
                currentContent = [];
            }
            else if (currentChapter) {
                currentContent.push(lines[i]);
            }
            else if (options.extractMetadata) {
                this.parseMetadataLine(line, metadata);
            }
        }
        if (currentChapter) {
            currentChapter.content = currentContent.join('\n').trim();
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }
        if (chapters.length === 0 && content.trim()) {
            chapters.push(this.createChapter({
                number: 1,
                title: metadata.title || '第一章',
                content: content.trim()
            }, 1));
        }
        return { metadata, chapters };
    }
    parseMarkdown(content, options) {
        const metadata = {};
        const chapters = [];
        const lines = content.split(/\r?\n/);
        let currentChapter = null;
        let currentContent = [];
        let inMetadata = true;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (inMetadata) {
                if (line.startsWith('# ')) {
                    metadata.title = line.substring(2).trim();
                }
                else if (line.startsWith('## ')) {
                    if (!metadata.subtitle) {
                        metadata.subtitle = line.substring(3).trim();
                    }
                    else {
                        inMetadata = false;
                    }
                }
                else if (line.startsWith('**')) {
                    const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
                    if (match) {
                        const [, key, value] = match;
                        if (key === '作者')
                            metadata.author = value;
                        if (key === '题材')
                            metadata.genre = value;
                    }
                }
                else if (line.startsWith('---')) {
                    inMetadata = false;
                }
                else if (line.trim() === '') {
                    continue;
                }
                else if (!line.startsWith('#') && !line.startsWith('*')) {
                    inMetadata = false;
                }
                if (!inMetadata && !currentChapter) {
                    currentContent.push(line);
                    continue;
                }
            }
            if (line.startsWith('## ') && /第[一二三四五六七八九十百千\d]+章/.test(line)) {
                if (currentChapter) {
                    chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                }
                currentChapter = {
                    number: chapters.length + 1,
                    title: this.extractChapterTitle(line.replace('## ', '')),
                    content: ''
                };
                currentContent = [];
            }
            else if (currentChapter) {
                if (line.startsWith('#') && !line.startsWith('##')) {
                    chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                    currentChapter = null;
                }
                else {
                    currentContent.push(line);
                }
            }
            else {
                currentContent.push(line);
            }
        }
        if (currentChapter) {
            currentChapter.content = currentContent.join('\n').trim();
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }
        if (chapters.length === 0 && currentContent.length > 0) {
            chapters.push(this.createChapter({
                number: 1,
                title: metadata.title || '第一章',
                content: currentContent.join('\n').trim()
            }, 1));
        }
        return { metadata, chapters };
    }
    parseJson(content) {
        const data = JSON.parse(content);
        if (data.metadata || data.project) {
            const project = data.metadata || data.project;
            const chapters = Array.isArray(data.chapters) ? data.chapters : (data.project?.chapters || []);
            return { project, chapters };
        }
        if (Array.isArray(data)) {
            return {
                project: {},
                chapters: data.map((c, i) => this.normalizeChapter(c, i + 1))
            };
        }
        return {
            project: data,
            chapters: Array.isArray(data.chapters) ? data.chapters : []
        };
    }
    parseHtml(content) {
        const metadata = {};
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch)
            metadata.title = titleMatch[1];
        const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match)
            metadata.title = h1Match[1];
        const chapters = [];
        const chapterRegex = /<h[23][^>]*id=["']?chapter(\d+)["']?[^>]*>([^<]+)<\/h[23]>/gi;
        let match;
        while ((match = chapterRegex.exec(content)) !== null) {
            const chapterNum = parseInt(match[1]);
            const chapterTitle = match[2].trim();
            const nextChapterMatch = content.substring(match.index + match[0].length).match(/<h[23][^>]*>/i);
            const endIndex = nextChapterMatch?.index || content.length;
            const chapterContent = content
                .substring(match.index + match[0].length, match.index + match[0].length + endIndex)
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            chapters.push(this.createChapter({
                number: chapterNum,
                title: chapterTitle,
                content: chapterContent
            }, chapters.length + 1));
        }
        if (chapters.length === 0) {
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
                const textContent = bodyMatch[1]
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                chapters.push(this.createChapter({
                    number: 1,
                    title: metadata.title || '内容',
                    content: textContent
                }, 1));
            }
        }
        return { metadata, chapters };
    }
    parseEpub(content) {
        const metadata = {};
        const titleMatch = content.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
        if (titleMatch)
            metadata.title = titleMatch[1];
        const authorMatch = content.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
        if (authorMatch)
            metadata.author = authorMatch[1];
        return { metadata, chapters: [] };
    }
    createChapterPattern(lines) {
        for (const pattern of this.chapterPatterns) {
            for (const line of lines.slice(0, 50)) {
                if (pattern.test(line)) {
                    return pattern;
                }
            }
        }
        return /^第\d+章/m;
    }
    extractChapterTitle(line) {
        return line
            .replace(/^第[一二三四五六七八九十百千\d]+章\s*/i, '')
            .replace(/^Chapter\s+\d+\s*/i, '')
            .replace(/^\d+\.\s*/, '')
            .trim() || line;
    }
    parseMetadataLine(line, metadata) {
        if (line.includes('作者')) {
            const match = line.match(/作者[：:]\s*(.+)/);
            if (match)
                metadata.author = match[1].trim();
        }
        if (line.includes('题材')) {
            const match = line.match(/题材[：:]\s*(.+)/);
            if (match)
                metadata.genre = match[1].trim();
        }
    }
    createChapter(parse, index) {
        return {
            id: `imported_${Date.now()}_${index}`,
            number: parse.number || index,
            title: parse.title,
            status: 'imported',
            wordCount: this.countWords(parse.content),
            content: parse.content,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    normalizeChapter(data, index) {
        return {
            id: data.id || `imported_${Date.now()}_${index}`,
            number: data.number || index,
            title: data.title || `第${index}章`,
            status: 'imported',
            wordCount: data.wordCount || this.countWords(data.content || ''),
            content: data.content || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    countWords(text) {
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    getSupportedFormats() {
        return [
            { format: 'txt', extensions: ['.txt'], description: '纯文本文件' },
            { format: 'md', extensions: ['.md', '.markdown'], description: 'Markdown格式' },
            { format: 'json', extensions: ['.json'], description: 'JSON格式（Cloud Book项目文件）' },
            { format: 'html', extensions: ['.html', '.htm'], description: 'HTML网页格式' },
            { format: 'epub', extensions: ['.epub'], description: 'EPUB电子书格式' }
        ];
    }
}
exports.ImportManager = ImportManager;
exports.default = ImportManager;
//# sourceMappingURL=ImportManager.js.map