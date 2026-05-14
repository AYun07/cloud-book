"use strict";
/**
 * Cloud Book - 核心引擎
 * 基于统一存储的简化实现
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
exports.CloudBookCore = void 0;
const path = __importStar(require("path"));
const storage_1 = require("./utils/storage");
const errors_1 = require("./utils/errors");
const LLMManager_1 = require("./modules/LLMProvider/LLMManager");
const MemoryManager_1 = require("./modules/Memory/MemoryManager");
const TruthFileManager_1 = require("./modules/TruthFiles/TruthFileManager");
class CloudBookCore {
    storage;
    llmManager;
    memoryManager;
    truthFileManager;
    constructor(options = {}) {
        this.storage = options.storage || new storage_1.UnifiedStorage({
            basePath: options.dataPath || './data/cloudbook'
        });
        this.llmManager = options.llmManager || new LLMManager_1.LLMManager();
        this.memoryManager = new MemoryManager_1.MemoryManager();
        this.truthFileManager = new TruthFileManager_1.TruthFileManager(path.join(options.dataPath || './data/cloudbook', 'truth-files'));
    }
    async initialize() {
        await this.memoryManager.initialize('default');
        console.log('CloudBook 初始化完成');
    }
    async createProject(title, genre = 'fantasy') {
        try {
            const project = {
                id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                genre: genre,
                literaryGenre: 'novel',
                writingMode: 'original',
                status: 'planning',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.storage.write(`projects/${project.id}/meta.json`, JSON.stringify(project));
            await this.storage.write(`projects/${project.id}/chapters/index.json`, JSON.stringify([]));
            await this.storage.write(`projects/${project.id}/characters/index.json`, JSON.stringify([]));
            return project;
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.createProject');
        }
    }
    async getProject(projectId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/meta.json`);
            return JSON.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    async listProjects() {
        try {
            const allFiles = [];
            const listDir = async (dirPath) => {
                try {
                    const files = await this.storage.list(dirPath);
                    for (const file of files) {
                        if (file === '.gitkeep')
                            continue;
                        const fullPath = dirPath ? `${dirPath}/${file}` : file;
                        try {
                            const isDir = await this.storage.exists(fullPath);
                            if (isDir) {
                                await listDir(fullPath);
                            }
                            else {
                                allFiles.push(fullPath);
                            }
                        }
                        catch (error) {
                            console.warn(`CloudBook.listProjects: Error checking path ${fullPath}:`, error);
                        }
                    }
                }
                catch (error) {
                    console.warn(`CloudBook.listProjects: Error listing directory ${dirPath}:`, error);
                }
            };
            try {
                await listDir('projects');
            }
            catch (error) {
                console.warn('CloudBook.listProjects: Error listing projects directory:', error);
            }
            const projects = [];
            for (const file of allFiles) {
                if (file.endsWith('meta.json') && file.includes('/projects/')) {
                    try {
                        const content = await this.storage.read(file);
                        projects.push(JSON.parse(content));
                    }
                    catch (error) {
                        console.warn(`CloudBook.listProjects: Error reading project file ${file}:`, error);
                    }
                }
            }
            return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.listProjects');
        }
    }
    async updateProject(projectId, updates) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
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
            throw (0, errors_1.handleError)(error, 'CloudBook.updateProject');
        }
    }
    async deleteProject(projectId) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            const allFiles = [];
            const listDir = async (dirPath) => {
                try {
                    const files = await this.storage.list(dirPath);
                    for (const file of files) {
                        if (file === '.gitkeep')
                            continue;
                        const fullPath = dirPath ? `${dirPath}/${file}` : file;
                        try {
                            const isDir = await this.storage.exists(fullPath);
                            if (isDir) {
                                await listDir(fullPath);
                            }
                            else {
                                allFiles.push(fullPath);
                            }
                        }
                        catch (error) {
                            console.warn(`CloudBook.deleteProject: Error checking path ${fullPath}:`, error);
                        }
                    }
                }
                catch (error) {
                    console.warn(`CloudBook.deleteProject: Error listing directory ${dirPath}:`, error);
                }
            };
            await listDir(`projects/${projectId}`);
            for (const file of allFiles.reverse()) {
                try {
                    await this.storage.delete(file, false);
                }
                catch (error) {
                    console.warn(`CloudBook.deleteProject: Error deleting file ${file}:`, error);
                }
            }
            try {
                await this.storage.delete(`projects/${projectId}`, false);
            }
            catch (error) {
                console.warn(`CloudBook.deleteProject: Error deleting project directory:`, error);
            }
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.deleteProject');
        }
    }
    async createChapter(projectId, title, content = '') {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            const chapters = project.chapters || [];
            const chapterNumber = chapters.length + 1;
            const chapter = {
                id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                number: chapterNumber,
                title,
                status: 'outline',
                wordCount: this.countWords(content),
                content: content
            };
            chapters.push(chapter);
            project.chapters = chapters;
            project.updatedAt = new Date();
            await this.storage.write(`projects/${projectId}/chapters/ch_${chapter.id}.json`, JSON.stringify(chapter));
            await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
            return chapter;
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.createChapter');
        }
    }
    async getChapter(projectId, chapterId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/chapters/ch_${chapterId}.json`);
            return JSON.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    async updateChapter(projectId, chapterId, updates) {
        try {
            const chapter = await this.getChapter(projectId, chapterId);
            if (!chapter) {
                throw new errors_1.CloudBookError('Chapter not found', 'NOT_FOUND', { projectId, chapterId }, 404);
            }
            const updatedChapter = {
                ...chapter,
                ...updates,
                id: chapter.id,
                number: chapter.number
            };
            if (updates.content !== undefined) {
                updatedChapter.wordCount = this.countWords(updates.content);
            }
            await this.storage.write(`projects/${projectId}/chapters/ch_${chapterId}.json`, JSON.stringify(updatedChapter));
            const project = await this.getProject(projectId);
            if (project && project.chapters) {
                const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
                if (chapterIndex !== -1) {
                    project.chapters[chapterIndex] = {
                        id: chapter.id,
                        number: updatedChapter.number,
                        title: updatedChapter.title,
                        status: updatedChapter.status,
                        wordCount: updatedChapter.wordCount
                    };
                    project.updatedAt = new Date();
                    await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
                }
            }
            return updatedChapter;
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.updateChapter');
        }
    }
    async deleteChapter(projectId, chapterId) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            await this.storage.delete(`projects/${projectId}/chapters/ch_${chapterId}.json`, false);
            if (project.chapters) {
                project.chapters = project.chapters.filter(c => c.id !== chapterId);
                project.chapters.forEach((c, i) => {
                    c.number = i + 1;
                });
                project.updatedAt = new Date();
                await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
            }
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.deleteChapter');
        }
    }
    async createCharacter(projectId, character) {
        try {
            const project = await this.getProject(projectId);
            if (!project) {
                throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
            }
            const fullCharacter = {
                ...character,
                id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            await this.storage.write(`projects/${projectId}/characters/char_${fullCharacter.id}.json`, JSON.stringify(fullCharacter));
            const characters = project.characters || [];
            characters.push({
                id: fullCharacter.id,
                name: fullCharacter.name
            });
            project.characters = characters;
            project.updatedAt = new Date();
            await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
            return fullCharacter;
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.createCharacter');
        }
    }
    async getCharacter(projectId, characterId) {
        try {
            const content = await this.storage.read(`projects/${projectId}/characters/char_${characterId}.json`);
            return JSON.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    async updateCharacter(projectId, characterId, updates) {
        try {
            const character = await this.getCharacter(projectId, characterId);
            if (!character) {
                throw new errors_1.CloudBookError('Character not found', 'NOT_FOUND', { projectId, characterId }, 404);
            }
            const updatedCharacter = {
                ...character,
                ...updates,
                id: character.id
            };
            await this.storage.write(`projects/${projectId}/characters/char_${characterId}.json`, JSON.stringify(updatedCharacter));
            return updatedCharacter;
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.updateCharacter');
        }
    }
    async deleteCharacter(projectId, characterId) {
        try {
            await this.storage.delete(`projects/${projectId}/characters/char_${characterId}.json`, false);
            const project = await this.getProject(projectId);
            if (project && project.characters) {
                project.characters = project.characters.filter(c => c.id !== characterId);
                project.updatedAt = new Date();
                await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
            }
        }
        catch (error) {
            throw (0, errors_1.handleError)(error, 'CloudBook.deleteCharacter');
        }
    }
    async getTruthFiles(projectId) {
        try {
            return await this.truthFileManager.getTruthFiles(projectId);
        }
        catch (error) {
            // 如果文件不存在，初始化
            return await this.truthFileManager.initialize(projectId);
        }
    }
    async updateChapterSummary(projectId, chapter) {
        await this.truthFileManager.updateChapterSummary(projectId, chapter);
    }
    async updateWorldState(projectId, state) {
        await this.truthFileManager.updateWorldState(projectId, state);
    }
    async addResource(projectId, resource) {
        await this.truthFileManager.addResource(projectId, resource);
    }
    async addHook(projectId, hook) {
        await this.truthFileManager.addHook(projectId, hook);
    }
    async fulfillHook(projectId, hookId, chapterNumber) {
        await this.truthFileManager.fulfillHook(projectId, hookId, chapterNumber);
    }
    async addCharacterInteraction(projectId, characterId1, characterId2, chapterNumber, type, summary) {
        await this.truthFileManager.addCharacterInteraction(projectId, characterId1, characterId2, chapterNumber, type, summary);
    }
    async updateEmotionalArc(projectId, characterId, characterName, chapterNumber, emotion, intensity) {
        await this.truthFileManager.updateEmotionalArc(projectId, characterId, characterName, chapterNumber, emotion, intensity);
    }
    async validateChapter(projectId, chapter, characters) {
        return await this.truthFileManager.validateChapter(projectId, chapter, characters);
    }
    async validateProject(projectId, chapters, characters, worldTimeline) {
        return await this.truthFileManager.validateProject(projectId, chapters, characters, worldTimeline);
    }
    async getContextSummary(projectId, chapterNumber) {
        return await this.truthFileManager.getContextSummary(projectId, chapterNumber);
    }
    countWords(text) {
        const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const english = (text.match(/[a-zA-Z]+/g) || []).length;
        return chinese + english;
    }
    async close() {
        await this.storage.close();
    }
}
exports.CloudBookCore = CloudBookCore;
//# sourceMappingURL=CloudBookCore.js.map