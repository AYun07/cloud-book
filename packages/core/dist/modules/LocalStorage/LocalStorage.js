"use strict";
/**
 * Cloud Book - 本地存储模块
 * 实现项目数据的本地持久化
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
exports.LocalStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
class LocalStorage {
    basePath;
    projectsPath;
    constructor(config) {
        this.basePath = config.basePath || './cloud-book-data';
        this.projectsPath = path.join(this.basePath, 'projects');
        this.ensureDirectory(this.projectsPath);
    }
    ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    getProjectPath(projectId) {
        return path.join(this.projectsPath, projectId);
    }
    // ==================== 项目管理 ====================
    async createProject(data) {
        const project = {
            id: generateId(),
            title: data.title || '未命名项目',
            genre: data.genre || 'fantasy',
            language: data.language || 'zh-CN',
            creationMode: data.creationMode || 'original',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: data.settings || {},
            chapters: [],
            cards: [],
            versions: []
        };
        const projectPath = this.getProjectPath(project.id);
        this.ensureDirectory(projectPath);
        await this.writeJSON(path.join(projectPath, 'project.json'), project);
        return project;
    }
    async getProject(projectId) {
        const filePath = path.join(this.getProjectPath(projectId), 'project.json');
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return this.readJSON(filePath);
    }
    async updateProject(projectId, data) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const updated = {
            ...project,
            ...data,
            updatedAt: new Date().toISOString()
        };
        const projectPath = this.getProjectPath(projectId);
        await this.writeJSON(path.join(projectPath, 'project.json'), updated);
        // 保存自动版本
        await this.saveAutoVersion(projectId, 'project', updated);
        return updated;
    }
    async deleteProject(projectId) {
        const projectPath = this.getProjectPath(projectId);
        if (!fs.existsSync(projectPath)) {
            return false;
        }
        fs.rmSync(projectPath, { recursive: true, force: true });
        return true;
    }
    async listProjects() {
        this.ensureDirectory(this.projectsPath);
        const dirs = fs.readdirSync(this.projectsPath);
        const projects = [];
        for (const dir of dirs) {
            const projectPath = path.join(this.projectsPath, dir);
            const projectFile = path.join(projectPath, 'project.json');
            if (fs.statSync(projectPath).isDirectory() && fs.existsSync(projectFile)) {
                try {
                    const project = await this.readJSON(projectFile);
                    projects.push(project);
                }
                catch (e) {
                    console.error(`Failed to read project ${dir}:`, e);
                }
            }
        }
        return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    // ==================== 章节管理 ====================
    async addChapter(projectId, chapter) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const newChapter = {
            id: generateId(),
            number: chapter.number || project.chapters.length + 1,
            title: chapter.title || `第${chapter.number || project.chapters.length + 1}章`,
            content: chapter.content || '',
            wordCount: this.countWords(chapter.content || ''),
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        project.chapters.push(newChapter);
        await this.updateProject(projectId, { chapters: project.chapters });
        return newChapter;
    }
    async updateChapter(projectId, chapterId, data) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) {
            return null;
        }
        const updatedChapter = {
            ...project.chapters[chapterIndex],
            ...data,
            wordCount: data.content ? this.countWords(data.content) : project.chapters[chapterIndex].wordCount,
            updatedAt: new Date().toISOString()
        };
        project.chapters[chapterIndex] = updatedChapter;
        await this.updateProject(projectId, { chapters: project.chapters });
        return updatedChapter;
    }
    async deleteChapter(projectId, chapterId) {
        const project = await this.getProject(projectId);
        if (!project) {
            return false;
        }
        const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) {
            return false;
        }
        project.chapters.splice(chapterIndex, 1);
        await this.updateProject(projectId, { chapters: project.chapters });
        return true;
    }
    // ==================== 卡片管理 ====================
    async addCard(projectId, card) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const newCard = {
            id: generateId(),
            type: card.type || 'world',
            title: card.title || '未命名卡片',
            content: card.content || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        project.cards.push(newCard);
        await this.updateProject(projectId, { cards: project.cards });
        return newCard;
    }
    async updateCard(projectId, cardId, data) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const cardIndex = project.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            return null;
        }
        const updatedCard = {
            ...project.cards[cardIndex],
            ...data,
            updatedAt: new Date().toISOString()
        };
        project.cards[cardIndex] = updatedCard;
        await this.updateProject(projectId, { cards: project.cards });
        return updatedCard;
    }
    async deleteCard(projectId, cardId) {
        const project = await this.getProject(projectId);
        if (!project) {
            return false;
        }
        const cardIndex = project.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            return false;
        }
        project.cards.splice(cardIndex, 1);
        await this.updateProject(projectId, { cards: project.cards });
        return true;
    }
    // ==================== 版本历史 ====================
    async saveAutoVersion(projectId, type, data) {
        const project = await this.getProject(projectId);
        if (!project)
            return;
        const version = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            description: `自动保存 - ${type}`,
            type: 'auto',
            data
        };
        project.versions.push(version);
        // 只保留最近50个版本
        if (project.versions.length > 50) {
            project.versions = project.versions.slice(-50);
        }
        await this.writeJSON(path.join(this.getProjectPath(projectId), 'project.json'), project);
    }
    async saveManualVersion(projectId, description, data) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const version = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            description,
            type: 'manual',
            data
        };
        project.versions.push(version);
        await this.updateProject(projectId, { versions: project.versions });
        return version;
    }
    async getVersions(projectId, limit) {
        const project = await this.getProject(projectId);
        if (!project) {
            return [];
        }
        const versions = [...project.versions].reverse();
        return limit ? versions.slice(0, limit) : versions;
    }
    async restoreVersion(projectId, versionId) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const version = project.versions.find(v => v.id === versionId);
        if (!version) {
            return null;
        }
        const restored = {
            ...version.data,
            id: project.id,
            updatedAt: new Date().toISOString()
        };
        return this.updateProject(projectId, restored);
    }
    // ==================== 导出功能 ====================
    async exportChapter(projectId, chapterId, format) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        const chapter = project.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            return null;
        }
        if (format === 'md') {
            return `# ${chapter.title}\n\n${chapter.content}`;
        }
        return chapter.content;
    }
    async exportProject(projectId, format) {
        const project = await this.getProject(projectId);
        if (!project) {
            return null;
        }
        switch (format) {
            case 'json':
                return JSON.stringify(project, null, 2);
            case 'md':
                let md = `# ${project.title}\n\n`;
                md += `## 设定\n\n`;
                if (project.settings.worldSettings) {
                    md += JSON.stringify(project.settings.worldSettings, null, 2) + '\n\n';
                }
                md += `## 角色\n\n`;
                if (project.settings.characterProfiles) {
                    md += JSON.stringify(project.settings.characterProfiles, null, 2) + '\n\n';
                }
                md += `## 正文\n\n`;
                for (const chapter of project.chapters) {
                    md += `### ${chapter.title}\n\n${chapter.content}\n\n---\n\n`;
                }
                return md;
            case 'txt':
            default:
                let txt = `${project.title}\n\n`;
                for (const chapter of project.chapters) {
                    txt += `${chapter.title}\n\n${chapter.content}\n\n\n`;
                }
                return txt;
        }
    }
    // ==================== 工具方法 ====================
    async readJSON(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    async writeJSON(filePath, data) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    countWords(text) {
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    async getStorageStats() {
        const projects = await this.listProjects();
        let totalChapters = 0;
        let totalSize = 0;
        for (const project of projects) {
            totalChapters += project.chapters.length;
            const projectPath = this.getProjectPath(project.id);
            totalSize += this.getDirectorySize(projectPath);
        }
        return {
            projectCount: projects.length,
            totalChapters,
            totalSize
        };
    }
    getDirectorySize(dirPath) {
        let size = 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                size += this.getDirectorySize(filePath);
            }
            else {
                size += stat.size;
            }
        }
        return size;
    }
    async clearAllData() {
        if (fs.existsSync(this.projectsPath)) {
            fs.rmSync(this.projectsPath, { recursive: true, force: true });
        }
        this.ensureDirectory(this.projectsPath);
    }
}
exports.LocalStorage = LocalStorage;
exports.default = LocalStorage;
//# sourceMappingURL=LocalStorage.js.map