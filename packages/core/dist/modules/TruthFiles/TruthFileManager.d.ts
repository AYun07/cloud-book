/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性，包含完整的验证逻辑
 */
import { TruthFiles, WorldState, Resource, Hook, Chapter, Character, TimelineEvent } from '../../types';
export interface ValidationIssue {
    type: 'error' | 'warning';
    category: 'content' | 'hook' | 'character' | 'timeline' | 'consistency';
    message: string;
    location?: string;
    suggestion?: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    summary: {
        totalIssues: number;
        errors: number;
        warnings: number;
    };
}
export declare class TruthFileManager {
    private storagePath;
    constructor(storagePath?: string);
    initialize(projectId: string): Promise<TruthFiles>;
    getTruthFiles(projectId: string): Promise<TruthFiles>;
    saveTruthFiles(projectId: string, truthFiles: TruthFiles): Promise<void>;
    validateChapter(projectId: string, chapter: Chapter, characters: Character[]): Promise<ValidationResult>;
    private validateChapterContent;
    private validateChapterCharacters;
    private validateChapterHooks;
    private hooksAreRelated;
    private validateChapterTimeline;
    private validateChapterParticleConsistency;
    private extractItemMentions;
    validateProject(projectId: string, chapters: Chapter[], characters: Character[], worldTimeline?: TimelineEvent[]): Promise<ValidationResult>;
    private validateProjectHooks;
    private validateProjectTimeline;
    private validateProjectCharacterConsistency;
    private extractCharacterMentions;
    private validateProjectResourceFlow;
    private validateChapterOrder;
    private buildValidationResult;
    updateChapterSummary(projectId: string, chapter: Chapter): Promise<void>;
    updateWorldState(projectId: string, state: Partial<WorldState>): Promise<void>;
    addResource(projectId: string, resource: Resource): Promise<void>;
    updateResource(projectId: string, resourceId: string, change: string, chapterNumber: number): Promise<void>;
    addHook(projectId: string, hook: Hook): Promise<void>;
    fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void>;
    addCharacterInteraction(projectId: string, characterId1: string, characterId2: string, chapterNumber: number, type: string, summary: string): Promise<void>;
    updateEmotionalArc(projectId: string, characterId: string, characterName: string, chapterNumber: number, emotion: string, intensity: number): Promise<void>;
    getContextSummary(projectId: string, chapterNumber: number): Promise<string>;
    private analyzeArcType;
    private extractKeyEvents;
    private getFilePath;
    private countWords;
}
export default TruthFileManager;
//# sourceMappingURL=TruthFileManager.d.ts.map