"use strict";
/**
 * 多格式导入管理器
 * 支持导入txt、md、json、epub、docx、Scrivener、Plottr、yWriter、Obsidian等格式
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ImportManager {
    defaultOptions = {
        format: 'auto',
        encoding: 'utf-8',
        extractMetadata: true,
        preserveFormatting: true
    };
    chapterPatterns = [
        /^第[一二三四五六七八九十百千\d]+章/m,
        /^Chapter\s+\d+/im,
        /^第\d+章/m,
        /^第[一二三四五六七八九十百千\d]+节/m,
        /^\d+\./m,
        /^第[一二三四五六七八九十百千\d]+卷/m,
        /^Volume\s+\d+/im,
    ];
    formatHints = new Map([
        ['chapter', 'md'],
        ['novel', 'txt'],
        ['book', 'txt'],
        ['story', 'txt'],
        ['writing', 'md'],
        ['draft', 'md'],
        ['manuscript', 'txt'],
    ]);
    constructor() {
        this.initializeFormatHints();
    }
    initializeFormatHints() {
        this.formatHints.set('晋江', 'txt');
        this.formatHints.set('起点', 'txt');
        this.formatHints.set('番茄', 'txt');
        this.formatHints.set('七猫', 'txt');
        this.formatHints.set('红袖', 'txt');
        this.formatHints.set('潇湘', 'txt');
    }
    async import(content, options) {
        const opts = { ...this.defaultOptions, ...options };
        try {
            let format = opts.format;
            if (format === 'auto') {
                const detection = this.detectFormatContent(content, opts);
                format = detection.format;
            }
            let project = {};
            let chapters = [];
            const warnings = [];
            const metadata = {
                importFormat: format,
                importTime: new Date()
            };
            switch (format) {
                case 'txt':
                    const txtResult = this.parseTxt(content, opts);
                    project = txtResult.project;
                    chapters = txtResult.chapters;
                    break;
                case 'md':
                    const mdResult = this.parseMarkdown(content, opts);
                    project = mdResult.project;
                    chapters = mdResult.chapters;
                    break;
                case 'json':
                    const jsonResult = this.parseJson(content);
                    project = jsonResult.project;
                    chapters = jsonResult.chapters;
                    break;
                case 'html':
                    const htmlResult = this.parseHtml(content);
                    project = htmlResult.project;
                    chapters = htmlResult.chapters;
                    break;
                case 'epub':
                    const epubResult = await this.parseEpub(content);
                    project = epubResult.project;
                    chapters = epubResult.chapters;
                    break;
                case 'docx':
                    const docxResult = await this.parseDocx(content);
                    project = docxResult.project;
                    chapters = docxResult.chapters;
                    break;
                case 'scrivener':
                    const scrivenerResult = this.parseScrivener(content);
                    project = scrivenerResult.project;
                    chapters = scrivenerResult.chapters;
                    break;
                case 'plottr':
                    const plottrResult = this.parsePlottr(content);
                    project = plottrResult.project;
                    chapters = plottrResult.chapters;
                    break;
                case 'ywriter':
                    const yWriterResult = this.parseYWriter(content);
                    project = yWriterResult.project;
                    chapters = yWriterResult.chapters;
                    break;
                case 'obsidian':
                    const obsidianResult = this.parseObsidian(content);
                    project = obsidianResult.project;
                    chapters = obsidianResult.chapters;
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            if (chapters.length === 0) {
                warnings.push('未检测到章节，请检查文件格式');
            }
            metadata.chapterCount = chapters.length;
            metadata.wordCount = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
            return {
                success: true,
                project,
                chapters,
                warnings: warnings.length > 0 ? warnings : undefined,
                metadata
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
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'docx' || ext === 'doc' || ext === 'scrivener' || ext === 'plottr' || ext === 'ywriter7' || ext === 'yaml') {
                reader.readAsArrayBuffer(file);
            }
            else {
                reader.readAsText(file);
            }
        });
    }
    async importFromFilePath(filePath, format) {
        try {
            const ext = path.extname(filePath).toLowerCase().slice(1);
            const detectedFormat = format || this.detectFormatFromExtension(ext);
            let content;
            if (['docx', 'scrivener', 'ywriter7'].includes(ext)) {
                content = fs.readFileSync(filePath);
            }
            else {
                content = fs.readFileSync(filePath, 'utf-8');
            }
            if (typeof content === 'string') {
                return this.import(content, { format: detectedFormat });
            }
            else {
                const buffer = content;
                if (ext === 'scrivener') {
                    return this.importScrivenerZip(buffer);
                }
                else if (ext === 'ywriter7') {
                    return this.importYWriterProject(buffer);
                }
                else {
                    return this.import(buffer.toString('utf-8'), { format: detectedFormat });
                }
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    detectFormatFromExtension(ext) {
        const formatMap = {
            'txt': 'txt',
            'md': 'md',
            'markdown': 'md',
            'json': 'json',
            'html': 'html',
            'htm': 'html',
            'epub': 'epub',
            'docx': 'docx',
            'doc': 'docx',
            'scrivener': 'scrivener',
            'scriv': 'scrivener',
            'plottr': 'plottr',
            'ywriter7': 'ywriter',
            'yaml': 'obsidian',
            'yml': 'obsidian'
        };
        return formatMap[ext] || 'auto';
    }
    async importScrivenerZip(buffer) {
        const tempDir = path.join(process.cwd(), '.import-temp', `scrivener_${Date.now()}`);
        const zipPath = path.join(tempDir, 'input.zip');
        try {
            fs.mkdirSync(tempDir, { recursive: true });
            fs.writeFileSync(zipPath, buffer);
            const { execSync } = require('child_process');
            try {
                execSync(`cd "${tempDir}" && unzip -o "${zipPath}"`, { stdio: 'pipe' });
            }
            catch { }
            const files = this.getAllFiles(tempDir);
            let content = '';
            let metadata = {};
            for (const file of files) {
                const relativePath = path.relative(tempDir, file);
                const basename = path.basename(file).toLowerCase();
                if (basename === 'metadata.xml') {
                    const xmlContent = fs.readFileSync(file, 'utf-8');
                    metadata = this.parseScrivenerMetadata(xmlContent);
                }
                else if (basename.endsWith('.rtf') || basename.endsWith('.txt')) {
                    content += fs.readFileSync(file, 'utf-8') + '\n\n';
                }
            }
            const result = this.parseScrivener(content);
            if (metadata.title)
                result.project.title = metadata.title;
            if (metadata.author)
                result.project.author = metadata.author;
            return {
                success: true,
                project: result.project,
                chapters: result.chapters,
                metadata: { importFormat: 'scrivener', importTime: new Date() }
            };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
        finally {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            catch { }
        }
    }
    async importYWriterProject(buffer) {
        try {
            const content = buffer.toString('utf-8');
            return this.parseYWriter(content);
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    getAllFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    parseScrivenerMetadata(xml) {
        const metadata = {};
        const titleMatch = xml.match(/<Title>([^<]*)<\/Title>/i);
        if (titleMatch)
            metadata.title = titleMatch[1];
        const authorMatch = xml.match(/<Author>([^<]*)<\/Author>/i);
        if (authorMatch)
            metadata.author = authorMatch[1];
        const synopsisMatch = xml.match(/<Description>([^<]*)<\/Description>/i);
        if (synopsisMatch)
            metadata.synopsis = synopsisMatch[1];
        return metadata;
    }
    detectFormatContent(content, options) {
        const detectors = [];
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            try {
                JSON.parse(content.trim());
                detectors.push({
                    format: 'json',
                    confidence: 95,
                    evidence: ['Valid JSON syntax detected']
                });
            }
            catch { }
        }
        if (content.includes('<package') && content.includes('xmlns="http://www.idpf.org/2007/opf"')) {
            detectors.push({
                format: 'epub',
                confidence: 90,
                evidence: ['EPUB package structure detected']
            });
        }
        if (content.includes('w:wordDocument') && content.includes('xmlns:w=')) {
            detectors.push({
                format: 'docx',
                confidence: 90,
                evidence: ['DOCX XML structure detected']
            });
        }
        if (content.includes('<!DOCTYPE') || (content.includes('<html') && content.includes('<body'))) {
            detectors.push({
                format: 'html',
                confidence: 85,
                evidence: ['HTML structure detected']
            });
        }
        if (content.includes('<YWriterProject>')) {
            detectors.push({
                format: 'ywriter',
                confidence: 95,
                evidence: ['YWriter XML format detected']
            });
        }
        if (content.includes('"book":') && content.includes('"chapters":')) {
            detectors.push({
                format: 'plottr',
                confidence: 85,
                evidence: ['Plottr JSON format detected']
            });
        }
        const markdownIndicators = [
            /^# .+$/m,
            /^\*\*.*\*\*$/m,
            /^## .+$/m,
            /^\[.+\]\(.+\)$/m,
            /^---$/m
        ];
        const mdScore = markdownIndicators.filter(p => p.test(content)).length;
        if (mdScore >= 2) {
            detectors.push({
                format: 'md',
                confidence: 70 + mdScore * 10,
                evidence: [`${mdScore} Markdown indicators found`]
            });
        }
        detectors.push({
            format: 'txt',
            confidence: 50,
            evidence: ['Default fallback format']
        });
        detectors.sort((a, b) => b.confidence - a.confidence);
        return detectors[0];
    }
    parseTxt(content, options) {
        const project = {};
        const chapters = [];
        const lines = content.split(/\r?\n/);
        let currentChapter = null;
        let currentContent = [];
        const chapterPattern = options.chapterPattern || this.createChapterPattern(lines);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (i === 0 && options.extractMetadata && !chapterPattern.test(line)) {
                project.title = line;
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
                this.parseMetadataLine(line, project);
            }
        }
        if (currentChapter) {
            currentChapter.content = currentContent.join('\n').trim();
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }
        if (chapters.length === 0 && content.trim()) {
            chapters.push(this.createChapter({
                number: 1,
                title: project.title || '第一章',
                content: content.trim()
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parseMarkdown(content, options) {
        const project = {};
        const chapters = [];
        const lines = content.split(/\r?\n/);
        let currentChapter = null;
        let currentContent = [];
        let inMetadata = true;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (inMetadata) {
                if (line.startsWith('# ')) {
                    project.title = line.substring(2).trim();
                }
                else if (line.startsWith('## ')) {
                    if (!project.subtitle) {
                        project.subtitle = line.substring(3).trim();
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
                            project.author = value;
                        if (key === '题材')
                            project.genre = value;
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
                title: project.title || '第一章',
                content: currentContent.join('\n').trim()
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parseJson(content) {
        const data = JSON.parse(content);
        if (data.metadata || data.project) {
            const project = data.metadata || data.project;
            const chapters = Array.isArray(data.chapters) ? data.chapters : (data.project?.chapters || []);
            return { project, chapters, success: true };
        }
        if (Array.isArray(data)) {
            return {
                project: {},
                chapters: data.map((c, i) => this.normalizeChapter(c, i + 1)),
                success: true
            };
        }
        return {
            project: data,
            chapters: Array.isArray(data.chapters) ? data.chapters : [],
            success: true
        };
    }
    parseHtml(content) {
        const project = {};
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch)
            project.title = titleMatch[1];
        const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match)
            project.title = h1Match[1];
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
                    title: project.title || '内容',
                    content: textContent
                }, 1));
            }
        }
        return { project, chapters, success: true };
    }
    async parseEpub(content) {
        const project = {};
        const chapters = [];
        const titleMatch = content.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
        if (titleMatch)
            project.title = titleMatch[1];
        const authorMatch = content.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
        if (authorMatch)
            project.author = authorMatch[1];
        const descMatch = content.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i);
        if (descMatch)
            project.corePremise = descMatch[1];
        const subjectMatch = content.match(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/gi);
        if (subjectMatch) {
            const subjects = subjectMatch.map(s => s.replace(/<[^>]+>/g, ''));
            project.tags = subjects;
        }
        const chapterMatches = content.match(/<item[^>]+href="([^"]+\.xhtml)"[^>]*>/gi);
        if (chapterMatches) {
            chapterMatches.forEach((match, index) => {
                const hrefMatch = match.match(/href="([^"]+\.xhtml)"/);
                if (hrefMatch && !hrefMatch[1].includes('nav') && !hrefMatch[1].includes('style')) {
                    chapters.push(this.createChapter({
                        number: index + 1,
                        title: `第${index + 1}章`,
                        content: ''
                    }, index + 1));
                }
            });
        }
        return { project, chapters, success: true };
    }
    async parseDocx(content) {
        const project = {};
        const chapters = [];
        const titleMatch = content.match(/<w:t>([^<]+)<\/w:t>/g);
        if (titleMatch && titleMatch.length > 0) {
            const firstText = titleMatch[0].replace(/<[^>]+>/g, '');
            if (firstText.length < 50) {
                project.title = firstText;
            }
        }
        const boldTexts = content.match(/<w:rPr>[\s\S]*?<w:b[\s\S]*?\/><\/w:rPr>[\s\S]*?<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (boldTexts && boldTexts.length > 0) {
            const firstBold = boldTexts[0].match(/<w:t[^>]*>([^<]+)<\/w:t>/);
            if (firstBold && firstBold[1].length < 100) {
                if (!project.title)
                    project.title = firstBold[1];
            }
        }
        const allText = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const paragraphs = allText.split(/\.\s{2,}/);
        if (paragraphs.length > 0) {
            const chapterPattern = /^第[一二三四五六七八九十百千\d]+章/m;
            let currentChapter = null;
            let currentContent = [];
            for (const para of paragraphs) {
                if (chapterPattern.test(para)) {
                    if (currentChapter) {
                        currentChapter.content = currentContent.join('\n\n');
                        chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                    }
                    const titleMatch = para.match(/(第[一二三四五六七八九十百千\d]+章)[^\n]*/);
                    currentChapter = {
                        number: chapters.length + 1,
                        title: titleMatch ? titleMatch[0].substring(0, 50) : `第${chapters.length + 1}章`,
                        content: ''
                    };
                    currentContent = [];
                }
                else if (currentChapter) {
                    currentContent.push(para);
                }
            }
            if (currentChapter) {
                currentChapter.content = currentContent.join('\n\n');
                chapters.push(this.createChapter(currentChapter, chapters.length + 1));
            }
        }
        if (chapters.length === 0) {
            chapters.push(this.createChapter({
                number: 1,
                title: project.title || '内容',
                content: allText.substring(0, 50000)
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parseScrivener(content) {
        const project = {};
        const chapters = [];
        const lines = content.split(/\n/);
        let currentChapter = null;
        let currentContent = [];
        let chapterCount = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (/^第[一二三四五六七八九十百千\d]+章/.test(trimmed) || /^Chapter\s+\d+/.test(trimmed)) {
                if (currentChapter) {
                    currentChapter.content = currentContent.join('\n').trim();
                    chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                }
                chapterCount++;
                currentChapter = {
                    number: chapterCount,
                    title: this.extractChapterTitle(trimmed),
                    content: ''
                };
                currentContent = [];
            }
            else if (currentChapter) {
                currentContent.push(line);
            }
            else if (trimmed && !project.title) {
                const titleMatch = trimmed.match(/^(.{5,50})/);
                if (titleMatch)
                    project.title = titleMatch[1];
            }
        }
        if (currentChapter) {
            currentChapter.content = currentContent.join('\n').trim();
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }
        if (chapters.length === 0 && content.trim()) {
            chapters.push(this.createChapter({
                number: 1,
                title: project.title || '内容',
                content: content.trim()
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parsePlottr(content) {
        const project = {};
        const chapters = [];
        try {
            const data = JSON.parse(content);
            if (data.book) {
                project.title = data.book.title;
                project.author = data.book.author;
                project.corePremise = data.book.description;
            }
            if (Array.isArray(data.chapters)) {
                let chapterNum = 0;
                for (const ch of data.chapters) {
                    chapterNum++;
                    if (ch.scenes && Array.isArray(ch.scenes)) {
                        const chapterContent = [];
                        for (const scene of ch.scenes) {
                            if (scene.content) {
                                chapterContent.push(scene.content);
                            }
                        }
                        chapters.push(this.createChapter({
                            number: chapterNum,
                            title: ch.title || `第${chapterNum}章`,
                            content: chapterContent.join('\n\n'),
                            summary: ch.notes
                        }, chapterNum));
                    }
                    else {
                        chapters.push(this.createChapter({
                            number: chapterNum,
                            title: ch.title || `第${chapterNum}章`,
                            content: ch.notes || '',
                            summary: ch.notes
                        }, chapterNum));
                    }
                }
            }
            if (data.characters && Array.isArray(data.characters)) {
                project.characters = data.characters.map((c) => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    goals: c.goals,
                    conflicts: c.conflicts
                }));
            }
        }
        catch {
            chapters.push(this.createChapter({
                number: 1,
                title: '内容',
                content: content
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parseYWriter(content) {
        const project = {};
        const chapters = [];
        const titleMatch = content.match(/<ProjectTitle>([^<]*)<\/ProjectTitle>/i);
        if (titleMatch)
            project.title = titleMatch[1];
        const authorMatch = content.match(/<AuthorName>([^<]*)<\/AuthorName>/i);
        if (authorMatch)
            project.author = authorMatch[1];
        const sceneMatches = content.match(/<Scene>[\s\S]*?<\/Scene>/gi) || [];
        const scenes = sceneMatches.map(scene => {
            const idMatch = scene.match(/<ID>(\d+)<\/ID>/);
            const titleMatch = scene.match(/<Title>([^<]*)<\/Title>/);
            const descMatch = scene.match(/<Desc>([^<]*)<\/Desc>/);
            const contentMatch = scene.match(/<Content>([\s\S]*?)<\/Content>/);
            return {
                id: parseInt(idMatch?.[1] || '0'),
                title: titleMatch?.[1] || '场景',
                desc: descMatch?.[1] || '',
                content: contentMatch?.[1] || ''
            };
        });
        let chapterNum = 0;
        const chapterMap = new Map();
        for (const scene of scenes) {
            chapterNum++;
            if (!chapterMap.has(scene.id)) {
                chapterMap.set(scene.id, this.createChapter({
                    number: chapterNum,
                    title: scene.title,
                    content: scene.content,
                    summary: scene.desc
                }, chapterNum));
            }
            else {
                const existing = chapterMap.get(scene.id);
                existing.content += '\n\n' + scene.content;
            }
        }
        const characterMatches = content.match(/<Character>[\s\S]*?<\/Character>/gi) || [];
        const characters = characterMatches.map(char => {
            const idMatch = char.match(/<ID>(\d+)<\/ID>/);
            const nameMatch = char.match(/<Name>([^<]*)<\/Name>/);
            const bioMatch = char.match(/<Bio>([^<]*)<\/Bio>/);
            return {
                id: idMatch?.[1] || '',
                name: nameMatch?.[1] || '未知',
                description: bioMatch?.[1] || ''
            };
        });
        chapters.push(...chapterMap.values());
        project.characters = characters;
        if (chapters.length === 0) {
            chapters.push(this.createChapter({
                number: 1,
                title: project.title || '内容',
                content: content
            }, 1));
        }
        return { success: true, project, chapters };
    }
    parseObsidian(content) {
        const project = {};
        const chapters = [];
        const lines = content.split(/\n/);
        let currentChapter = null;
        let currentContent = [];
        let inFrontmatter = false;
        let frontmatter = [];
        let chapterCount = 0;
        for (const line of lines) {
            if (line === '---') {
                if (!inFrontmatter) {
                    inFrontmatter = true;
                }
                else {
                    inFrontmatter = false;
                    this.parseObsidianFrontmatter(frontmatter.join('\n'), project);
                    frontmatter = [];
                }
                continue;
            }
            if (inFrontmatter) {
                frontmatter.push(line);
                continue;
            }
            if (!inFrontmatter && (line.startsWith('# ') || /^## .+章/.test(line))) {
                if (currentChapter) {
                    currentChapter.content = currentContent.join('\n').trim();
                    chapters.push(this.createChapter(currentChapter, chapters.length + 1));
                }
                chapterCount++;
                currentChapter = {
                    number: chapterCount,
                    title: line.replace(/^#+\s*/, ''),
                    content: ''
                };
                currentContent = [];
            }
            else if (currentChapter) {
                currentContent.push(line);
            }
            else if (frontmatter.length === 0 && line.trim() && !project.title) {
                project.title = line.substring(0, 50);
            }
        }
        if (currentChapter) {
            currentChapter.content = currentContent.join('\n').trim();
            chapters.push(this.createChapter(currentChapter, chapters.length + 1));
        }
        if (chapters.length === 0 && content.trim()) {
            chapters.push(this.createChapter({
                number: 1,
                title: project.title || '内容',
                content: content.trim()
            }, 1));
        }
        return { project, chapters, success: true };
    }
    parseObsidianFrontmatter(frontmatter, project) {
        const lines = frontmatter.split('\n');
        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                if (key === 'title')
                    project.title = value;
                else if (key === 'author')
                    project.author = value;
                else if (key === 'genre')
                    project.genre = value;
                else if (key === 'tags')
                    project.tags = value.split(',').map((s) => s.trim());
            }
        }
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
            summary: parse.summary,
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
            summary: data.summary,
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
            { format: 'epub', extensions: ['.epub'], description: 'EPUB电子书格式' },
            { format: 'docx', extensions: ['.docx', '.doc'], description: 'Word文档格式' },
            { format: 'scrivener', extensions: ['.scrivener'], description: 'Scrivener项目格式' },
            { format: 'plottr', extensions: ['.plottr'], description: 'Plottr大纲软件格式' },
            { format: 'ywriter', extensions: ['.ywriter7'], description: 'yWriter项目格式' },
            { format: 'obsidian', extensions: ['.md', '.yaml'], description: 'Obsidian笔记格式' }
        ];
    }
    async importProject(filePath, format) {
        const result = await this.importFromFilePath(filePath, format);
        if (!result.success) {
            throw new Error(result.error || 'Import failed');
        }
        return {
            id: `imported_${Date.now()}`,
            title: result.project?.title || '导入项目',
            genre: result.project?.genre || 'novel',
            literaryGenre: 'novel',
            status: 'imported',
            createdAt: new Date(),
            updatedAt: new Date(),
            chapters: result.chapters || [],
            characters: result.project?.characters || []
        };
    }
    async importChapter(filePath, format) {
        const result = await this.importFromFilePath(filePath, format);
        if (!result.success) {
            throw new Error(result.error || 'Import failed');
        }
        if (result.chapters && result.chapters.length > 0) {
            return result.chapters[0];
        }
        const fs = require('fs');
        const content = fs.readFileSync(filePath, 'utf-8');
        return {
            id: `imported_chapter_${Date.now()}`,
            number: 1,
            title: result.project?.title || '导入章节',
            status: 'draft',
            content: content,
            wordCount: content.length,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    detectFormat(filePath) {
        const ext = path.extname(filePath).toLowerCase().slice(1);
        return this.detectFormatFromExtension(ext);
    }
}
exports.ImportManager = ImportManager;
exports.default = ImportManager;
//# sourceMappingURL=ImportManager.js.map