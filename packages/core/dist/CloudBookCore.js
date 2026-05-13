"use strict";
/**
 * Cloud Book - 核心引擎
 * 基于统一存储的简化实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBookCore = void 0;
const storage_1 = require("./utils/storage");
const errors_1 = require("./utils/errors");
const LLMManager_1 = require("./modules/LLMProvider/LLMManager");
const MemoryManager_1 = require("./modules/Memory/MemoryManager");
class CloudBookCore {
    storage;
    llmManager;
    memoryManager;
    constructor(options = {}) {
        this.storage = options.storage || new storage_1.UnifiedStorage({
            basePath: options.dataPath || './data/cloudbook'
        });
        this.llmManager = options.llmManager || new LLMManager_1.LLMManager();
        this.memoryManager = new MemoryManager_1.MemoryManager();
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
            const projectsDir = this.storage.exists('projects') ? 'projects' : '';
            if (!projectsDir)
                return [];
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
                        catch { }
                    }
                }
                catch { }
            };
            await listDir('projects');
            const projects = [];
            for (const file of allFiles) {
                if (file.endsWith('meta.json') && file.includes('/projects/')) {
                    try {
                        const content = await this.storage.read(file);
                        projects.push(JSON.parse(content));
                    }
                    catch { }
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
                        catch { }
                    }
                }
                catch { }
            };
            await listDir(`projects/${projectId}`);
            for (const file of allFiles.reverse()) {
                try {
                    await this.storage.delete(file, false);
                }
                catch { }
            }
            try {
                await this.storage.delete(`projects/${projectId}`, false);
            }
            catch { }
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
                name: fullCharacter.name,
                role: fullCharacter.role
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
        const project = await this.getProject(projectId);
        if (!project) {
            throw new errors_1.CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
        }
        const characters = [];
        if (project.characters) {
            for (const char of project.characters) {
                const fullChar = await this.getCharacter(projectId, char.id);
                if (fullChar)
                    characters.push(fullChar);
            }
        }
        const chapters = [];
        if (project.chapters) {
            for (const ch of project.chapters) {
                const fullCh = await this.getChapter(projectId, ch.id);
                if (fullCh)
                    chapters.push(fullCh);
            }
        }
        return {
            currentState: {
                protagonist: {
                    id: characters[0]?.id || '',
                    name: characters[0]?.name || '',
                    location: '',
                    status: ''
                },
                knownFacts: [],
                currentConflicts: [],
                relationshipSnapshot: {},
                activeSubplots: []
            },
            particleLedger: [],
            pendingHooks: [],
            chapterSummaries: chapters.map(c => ({
                index: c.number,
                title: c.title,
                summary: c.summary || c.content?.slice(0, 200) || ''
            })),
            subplotBoard: [],
            emotionalArcs: [],
            characterMatrix: []
        };
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