/**
 * Cloud Book - 核心引擎
 * 基于统一存储的简化实现
 */
import { UnifiedStorage } from './utils/storage';
import { LLMManager } from './modules/LLMProvider/LLMManager';
import { NovelProject, Chapter, Character, TruthFiles } from './types';
export declare class CloudBookCore {
    private storage;
    private llmManager;
    private memoryManager;
    constructor(options?: {
        storage?: UnifiedStorage;
        llmManager?: LLMManager;
        dataPath?: string;
    });
    initialize(): Promise<void>;
    createProject(title: string, genre?: string): Promise<NovelProject>;
    getProject(projectId: string): Promise<NovelProject | null>;
    listProjects(): Promise<NovelProject[]>;
    updateProject(projectId: string, updates: Partial<NovelProject>): Promise<NovelProject>;
    deleteProject(projectId: string): Promise<void>;
    createChapter(projectId: string, title: string, content?: string): Promise<Chapter>;
    getChapter(projectId: string, chapterId: string): Promise<Chapter | null>;
    updateChapter(projectId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter>;
    deleteChapter(projectId: string, chapterId: string): Promise<void>;
    createCharacter(projectId: string, character: Omit<Character, 'id'>): Promise<Character>;
    getCharacter(projectId: string, characterId: string): Promise<Character | null>;
    updateCharacter(projectId: string, characterId: string, updates: Partial<Character>): Promise<Character>;
    deleteCharacter(projectId: string, characterId: string): Promise<void>;
    getTruthFiles(projectId: string): Promise<TruthFiles>;
    private countWords;
    close(): Promise<void>;
}
//# sourceMappingURL=CloudBookCore.d.ts.map