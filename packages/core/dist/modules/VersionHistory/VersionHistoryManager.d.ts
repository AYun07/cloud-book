/**
 * 版本历史管理器
 * 管理项目和章节的版本历史
 */
export interface Version {
    id: string;
    version: number;
    timestamp: Date;
    content: string;
    summary?: string;
    author?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    parentId?: string;
    branch?: string;
}
export interface Branch {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    headVersionId: string;
}
export interface Diff {
    type: 'add' | 'remove' | 'modify';
    lineNumber?: number;
    oldContent?: string;
    newContent?: string;
    context?: string;
}
export interface ChangeStats {
    additions: number;
    deletions: number;
    modifications: number;
}
export declare class VersionHistoryManager {
    private versions;
    private branches;
    private currentBranch;
    private storagePath;
    constructor(storagePath?: string);
    initialize(projectId: string): Promise<void>;
    createVersion(projectId: string, content: string, options?: {
        summary?: string;
        author?: string;
        tags?: string[];
        metadata?: Record<string, any>;
        branch?: string;
    }): Version;
    getVersion(projectId: string, versionId: string): Version | undefined;
    getVersionByNumber(projectId: string, versionNumber: number, branch?: string): Version | undefined;
    getVersionHistory(projectId: string, options?: {
        limit?: number;
        offset?: number;
        branch?: string;
        tags?: string[];
    }): Version[];
    getLatestVersion(projectId: string): Version | undefined;
    createBranch(projectId: string, name: string, description?: string, fromVersionId?: string): Branch;
    switchBranch(projectId: string, branchName: string): void;
    getBranches(projectId: string): Branch[];
    getCurrentBranch(projectId: string): string;
    deleteBranch(projectId: string, branchName: string): boolean;
    compareVersions(projectId: string, versionId1: string, versionId2: string): Diff[];
    private longestCommonSubsequence;
    getChangeStats(projectId: string, fromVersionId?: string, toVersionId?: string): ChangeStats;
    restoreVersion(projectId: string, versionId: string): Version;
    tagVersion(projectId: string, versionId: string, tag: string): void;
    removeTag(projectId: string, versionId: string, tag: string): void;
    getVersionsByTag(projectId: string, tag: string): Version[];
    private generateId;
    private save;
    load(projectId: string): Promise<void>;
}
export default VersionHistoryManager;
//# sourceMappingURL=VersionHistoryManager.d.ts.map