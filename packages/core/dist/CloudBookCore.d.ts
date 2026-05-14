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
    private truthFileManager;
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
    updateChapterSummary(projectId: string, chapter: Chapter): Promise<void>;
    updateWorldState(projectId: string, state: Partial<TruthFiles['currentState']>): Promise<void>;
    addResource(projectId: string, resource: any): Promise<void>;
    addHook(projectId: string, hook: any): Promise<void>;
    fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void>;
    addCharacterInteraction(projectId: string, characterId1: string, characterId2: string, chapterNumber: number, type: string, summary: string): Promise<void>;
    updateEmotionalArc(projectId: string, characterId: string, characterName: string, chapterNumber: number, emotion: string, intensity: number): Promise<void>;
    validateChapter(projectId: string, chapter: Chapter, characters: Character[]): Promise<any>;
    validateProject(projectId: string, chapters: Chapter[], characters: Character[], worldTimeline?: any[]): Promise<any>;
    getContextSummary(projectId: string, chapterNumber: number): Promise<string>;
    private countWords;
    close(): Promise<void>;
}
//# sourceMappingURL=CloudBookCore.d.ts.map