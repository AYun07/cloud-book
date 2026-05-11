/**
 * Cloud Book - 本地存储模块
 * 实现项目数据的本地持久化
 */
export interface StorageConfig {
    basePath: string;
}
export interface ProjectData {
    id: string;
    title: string;
    genre: string;
    language: string;
    creationMode: string;
    createdAt: string;
    updatedAt: string;
    settings: {
        worldSettings?: any;
        characterProfiles?: any;
        plotOutline?: any;
        styleFingerprint?: any;
    };
    chapters: ChapterData[];
    cards: CardData[];
    versions: VersionData[];
}
export interface ChapterData {
    id: string;
    number: number;
    title: string;
    content: string;
    wordCount: number;
    status: 'draft' | 'revised' | 'final';
    createdAt: string;
    updatedAt: string;
    auditResult?: any;
}
export interface CardData {
    id: string;
    type: 'character' | 'location' | 'item' | 'event' | 'world';
    title: string;
    content: any;
    createdAt: string;
    updatedAt: string;
}
export interface VersionData {
    id: string;
    timestamp: string;
    description: string;
    type: 'auto' | 'manual';
    data: any;
}
export declare class LocalStorage {
    private basePath;
    private projectsPath;
    constructor(config: StorageConfig);
    private ensureDirectory;
    private getProjectPath;
    createProject(data: Partial<ProjectData>): Promise<ProjectData>;
    getProject(projectId: string): Promise<ProjectData | null>;
    updateProject(projectId: string, data: Partial<ProjectData>): Promise<ProjectData | null>;
    deleteProject(projectId: string): Promise<boolean>;
    listProjects(): Promise<ProjectData[]>;
    addChapter(projectId: string, chapter: Partial<ChapterData>): Promise<ChapterData | null>;
    updateChapter(projectId: string, chapterId: string, data: Partial<ChapterData>): Promise<ChapterData | null>;
    deleteChapter(projectId: string, chapterId: string): Promise<boolean>;
    addCard(projectId: string, card: Partial<CardData>): Promise<CardData | null>;
    updateCard(projectId: string, cardId: string, data: Partial<CardData>): Promise<CardData | null>;
    deleteCard(projectId: string, cardId: string): Promise<boolean>;
    saveAutoVersion(projectId: string, type: string, data: any): Promise<void>;
    saveManualVersion(projectId: string, description: string, data: any): Promise<VersionData | null>;
    getVersions(projectId: string, limit?: number): Promise<VersionData[]>;
    restoreVersion(projectId: string, versionId: string): Promise<ProjectData | null>;
    exportChapter(projectId: string, chapterId: string, format: 'txt' | 'md'): Promise<string | null>;
    exportProject(projectId: string, format: 'txt' | 'md' | 'json'): Promise<string | null>;
    private readJSON;
    private writeJSON;
    private countWords;
    getStorageStats(): Promise<{
        projectCount: number;
        totalChapters: number;
        totalSize: number;
    }>;
    private getDirectorySize;
    clearAllData(): Promise<void>;
}
export default LocalStorage;
//# sourceMappingURL=LocalStorage.d.ts.map