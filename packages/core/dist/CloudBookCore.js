"use strict";
/**
 * Cloud Book - 核心协调器
 * 单一职责：协调各子系统，不直接实现业务逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudBook = exports.CloudBookCore = void 0;
const errors_js_1 = require("./utils/errors.js");
const storage_js_1 = require("./utils/storage.js");
class CloudBookCore {
    storage;
    config;
    constructor(config = {}) {
        this.config = config;
        this.storage = config.storage || new storage_js_1.UnifiedStorage({
            encryptionKey: config.encryptionKey,
            enableBackup: true,
            maxBackups: 5
        });
    }
    async initialize() {
        await this.storage.write('meta/version.json', JSON.stringify({ version: '1.0.0' }));
    }
    async createProject(title, genre) {
        try {
            const project = {
                id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                genre,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.storage.batchWrite([
                { path: `projects/${project.id}/meta.json`, content: JSON.stringify(project) },
                { path: `projects/${project.id}/chapters/index.json`, content: JSON.stringify([]) },
                { path: `projects/${project.id}/characters/index.json`, content: JSON.stringify([]) },
                { path: `projects/${project.id}/world/index.json`, content: JSON.stringify({ characters: [], locations: [], factions: [], timeline: [] }) }
            ]);
            return project;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.createProject');
        }
    }
    async getProject(projectId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/meta.json`);
            return JSON.parse(content);
        }
        catch (error) {
            if (error instanceof errors_js_1.CloudBookError && error.code === 'STORAGE_ERROR') {
                return null;
            }
            throw (0, errors_js_1.handleError)(error, 'CloudBook.getProject');
        }
    }
    async listProjects() {
        try {
            const files = await this.storage.list('projects', { recursive: true });
            const projects = [];
            for (const file of files) {
                if (file.endsWith('/meta.json')) {
                    const content = await this.storage.read(file);
                    projects.push(JSON.parse(content));
                }
            }
            return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.listProjects');
        }
    }
    async updateProject(projectId, updates) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_js_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            const updatedProject = {
                ...project,
                ...updates,
                id: project.id,
                createdAt: project.createdAt,
                updatedAt: new Date()
            };
            await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(updatedProject));
            return updatedProject;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.updateProject');
        }
    }
    async deleteProject(projectId) {
        try {
            const files = await this.storage.list(`projects/${projectId}`, { recursive: true });
            for (const file of files) {
                await this.storage.delete(file, { createBackup: false });
            }
            await this.storage.delete(`projects/${projectId}`, { createBackup: false });
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.deleteProject');
        }
    }
    async createChapter(projectId, title, content = '') {
        try {
            const chapter = {
                id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                projectId,
                title,
                content,
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
            const chapters = JSON.parse(indexContent);
            chapters.push(chapter);
            await this.storage.batchWrite([
                { path: `projects/${projectId}/chapters/${chapter.id}.json`, content: JSON.stringify(chapter) },
                { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(chapters) }
            ]);
            return chapter;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.createChapter');
        }
    }
    async getChapter(projectId, chapterId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/chapters/${chapterId}.json`);
            return JSON.parse(content);
        }
        catch (error) {
            if (error instanceof errors_js_1.CloudBookError && error.code === 'STORAGE_ERROR') {
                return null;
            }
            throw (0, errors_js_1.handleError)(error, 'CloudBook.getChapter');
        }
    }
    async listChapters(projectId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/chapters/index.json`);
            return JSON.parse(content);
        }
        catch (error) {
            if (error instanceof errors_js_1.CloudBookError && error.code === 'STORAGE_ERROR') {
                return [];
            }
            throw (0, errors_js_1.handleError)(error, 'CloudBook.listChapters');
        }
    }
    async updateChapter(projectId, chapterId, updates) {
        try {
            const chapter = await this.getChapter(projectId, chapterId);
            if (!chapter) {
                throw new errors_js_1.CloudBookError('Chapter not found', 'NOT_FOUND', { chapterId }, 404);
            }
            const updatedChapter = {
                ...chapter,
                ...updates,
                id: chapter.id,
                projectId: chapter.projectId,
                createdAt: chapter.createdAt,
                updatedAt: new Date()
            };
            const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
            const chapters = JSON.parse(indexContent);
            const index = chapters.findIndex(c => c.id === chapterId);
            if (index >= 0) {
                chapters[index] = updatedChapter;
            }
            await this.storage.batchWrite([
                { path: `projects/${projectId}/chapters/${chapterId}.json`, content: JSON.stringify(updatedChapter) },
                { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(chapters) }
            ]);
            return updatedChapter;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.updateChapter');
        }
    }
    async deleteChapter(projectId, chapterId) {
        try {
            const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
            const chapters = JSON.parse(indexContent);
            const filtered = chapters.filter(c => c.id !== chapterId);
            await this.storage.batchWrite([
                { path: `projects/${projectId}/chapters/${chapterId}.json`, content: '' },
                { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(filtered) }
            ]);
            await this.storage.delete(`projects/${projectId}/chapters/${chapterId}.json`);
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.deleteChapter');
        }
    }
    async exportProject(projectId, format) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_js_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            const chapters = await this.listChapters(projectId);
            switch (format) {
                case 'json':
                    return JSON.stringify({ project, chapters }, null, 2);
                case 'markdown':
                    let md = `# ${project.title}\n\n`;
                    md += `**类型**: ${project.genre}\n\n`;
                    md += `---\n\n`;
                    for (const chapter of chapters) {
                        md += `## ${chapter.title}\n\n`;
                        md += `${chapter.content}\n\n`;
                        md += `---\n\n`;
                    }
                    return md;
                case 'text':
                    let txt = `${project.title}\n`;
                    txt += `${'='.repeat(project.title.length)}\n\n`;
                    for (const chapter of chapters) {
                        txt += `${chapter.title}\n`;
                        txt += `${'-'.repeat(chapter.title.length)}\n\n`;
                        txt += `${chapter.content}\n\n`;
                    }
                    return txt;
                default:
                    throw new errors_js_1.CloudBookError(`Unsupported format: ${format}`, 'VALIDATION_ERROR');
            }
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, 'CloudBook.exportProject');
        }
    }
    async getStorageStats() {
        const stats = this.storage.getStats();
        return {
            totalFiles: stats.totalFiles,
            totalSize: stats.totalSize
        };
    }
    destroy() {
        this.storage.destroy();
    }
}
exports.CloudBookCore = CloudBookCore;
exports.cloudBook = new CloudBookCore();
//# sourceMappingURL=CloudBookCore.js.map