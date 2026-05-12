/**
 * Cloud Book - 核心协调器
 * 单一职责：协调各子系统，不直接实现业务逻辑
 */
import { UnifiedStorage } from './utils/storage.js';
export interface CloudBookConfig {
    storage?: UnifiedStorage;
    enableEncryption?: boolean;
    encryptionKey?: string;
}
export interface Project {
    id: string;
    title: string;
    genre: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Chapter {
    id: string;
    projectId: string;
    title: string;
    content: string;
    status: 'draft' | 'writing' | 'completed' | 'published';
    createdAt: Date;
    updatedAt: Date;
}
export interface WritingResult {
    chapter: Chapter;
    success: boolean;
    metadata: {
        tokensUsed: number;
        cost: number;
        duration: number;
    };
}
export declare class CloudBookCore {
    private storage;
    private config;
    constructor(config?: CloudBookConfig);
    initialize(): Promise<void>;
    createProject(title: string, genre: string): Promise<Project>;
    getProject(projectId: string): Promise<Project | null>;
    listProjects(): Promise<Project[]>;
    updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
    deleteProject(projectId: string): Promise<void>;
    createChapter(projectId: string, title: string, content?: string): Promise<Chapter>;
    getChapter(projectId: string, chapterId: string): Promise<Chapter | null>;
    listChapters(projectId: string): Promise<Chapter[]>;
    updateChapter(projectId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter>;
    deleteChapter(projectId: string, chapterId: string): Promise<void>;
    exportProject(projectId: string, format: 'json' | 'markdown' | 'text'): Promise<string>;
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
    }>;
    destroy(): void;
}
export declare const cloudBook: CloudBookCore;
//# sourceMappingURL=CloudBookCore.d.ts.map