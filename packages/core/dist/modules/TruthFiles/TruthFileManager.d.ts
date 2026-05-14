/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性，包含完整的验证逻辑
 * 7个核心真相文件：世界状态、资源账本、伏笔钩子、章节摘要、支线进度、情感弧线、角色矩阵
 */
import { TruthFiles, Resource, Hook, ChapterSummary, Subplot, EmotionalArc, CharacterInteraction, Chapter, Character, TimelineEvent, EmotionPoint, Interaction, ProtagonistState, ParticleChange } from '../../types';
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
    /**
     * 1. 世界状态 (World State) - 深度优化
     * 管理当前世界的状态，包括主角状态、已知事实、冲突、关系和活跃支线
     */
    initialize(projectId: string): Promise<TruthFiles>;
    /**
     * 世界状态高级操作 - 添加已知事实
     */
    addKnownFact(projectId: string, fact: string, chapterNumber: number): Promise<void>;
    /**
     * 世界状态高级操作 - 添加冲突
     */
    addConflict(projectId: string, conflict: string, chapterNumber: number): Promise<void>;
    /**
     * 世界状态高级操作 - 更新关系快照
     */
    updateRelationship(projectId: string, characterName: string, status: string): Promise<void>;
    /**
     * 世界状态高级操作 - 批量更新主角状态
     */
    updateProtagonistState(projectId: string, updates: Partial<ProtagonistState>): Promise<void>;
    /**
     * 世界状态高级操作 - 获取时间线摘要
     */
    getWorldStateSummary(projectId: string, chapterNumber?: number): Promise<{
        protagonist: ProtagonistState;
        recentFacts: string[];
        recentConflicts: string[];
        keyRelationships: Record<string, string>;
        activeSubplots: string[];
    }>;
    /**
     * 2. 资源账本 (Resource Ledger/Particle Ledger) - 深度优化
     * 管理重要物品、能力、货币和状态的追踪
     */
    addResource(projectId: string, resource: Resource): Promise<void>;
    /**
     * 资源账本高级操作 - 批量添加资源
     */
    addResources(projectId: string, resources: Resource[]): Promise<void>;
    /**
     * 资源账本高级操作 - 更新资源并记录变更历史
     */
    updateResource(projectId: string, resourceId: string, change: string, chapterNumber: number): Promise<void>;
    /**
     * 资源账本高级操作 - 更新资源所有者
     */
    transferResource(projectId: string, resourceId: string, newOwner: string, chapterNumber: number): Promise<void>;
    /**
     * 资源账本高级操作 - 获取资源清单
     */
    getResourcesByOwner(projectId: string, owner: string): Promise<Resource[]>;
    /**
     * 资源账本高级操作 - 获取资源变更历史
     */
    getResourceChangeLog(projectId: string, resourceId: string): Promise<ParticleChange[]>;
    /**
     * 3. 伏笔钩子 (Pending Hooks) - 深度优化
     * 管理故事中的伏笔设置和回收
     */
    addHook(projectId: string, hook: Hook): Promise<void>;
    /**
     * 伏笔钩子高级操作 - 批量添加伏笔
     */
    addHooks(projectId: string, hooks: Hook[]): Promise<void>;
    /**
     * 伏笔钩子高级操作 - 回收伏笔
     */
    fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void>;
    /**
     * 伏笔钩子高级操作 - 获取待回收的伏笔
     */
    getPendingHooks(projectId: string, chapterNumber?: number): Promise<Hook[]>;
    /**
     * 伏笔钩子高级操作 - 获取过期未回收的伏笔
     */
    getExpiredHooks(projectId: string, currentChapter: number, maxGap?: number): Promise<Hook[]>;
    /**
     * 伏笔钩子高级操作 - 获取某章节的伏笔
     */
    getHooksByChapter(projectId: string, chapterNumber: number): Promise<{
        setInChapter: Hook[];
        paidOffInChapter: Hook[];
    }>;
    /**
     * 4. 章节摘要 (Chapter Summaries) - 深度优化
     * 管理每一章的关键信息摘要
     */
    updateChapterSummary(projectId: string, chapter: Chapter): Promise<void>;
    /**
     * 章节摘要高级操作 - 获取章节范围的摘要
     */
    getChapterSummariesRange(projectId: string, startChapter: number, endChapter: number): Promise<ChapterSummary[]>;
    /**
     * 章节摘要高级操作 - 获取最近N章摘要
     */
    getRecentChapterSummaries(projectId: string, count?: number): Promise<ChapterSummary[]>;
    /**
     * 章节摘要高级操作 - 搜索章节摘要
     */
    searchChapterSummaries(projectId: string, keyword: string): Promise<ChapterSummary[]>;
    /**
     * 5. 支线进度 (Subplot Board) - 深度优化
     * 管理支线故事的状态和进度
     */
    addSubplot(projectId: string, subplot: Subplot): Promise<void>;
    /**
     * 支线进度高级操作 - 更新支线状态
     */
    updateSubplotStatus(projectId: string, subplotId: string, status: Subplot['status'], chapterNumber: number): Promise<void>;
    /**
     * 支线进度高级操作 - 获取活跃支线
     */
    getActiveSubplots(projectId: string): Promise<Subplot[]>;
    /**
     * 支线进度高级操作 - 获取某章节涉及的支线
     */
    getSubplotsByChapter(projectId: string, chapterNumber: number): Promise<Subplot[]>;
    /**
     * 支线进度高级操作 - 获取支线进度报告
     */
    getSubplotProgressReport(projectId: string): Promise<{
        total: number;
        active: number;
        resolved: number;
        abandoned: number;
        subplots: Subplot[];
    }>;
    /**
     * 6. 情感弧线 (Emotional Arcs) - 深度优化
     * 管理角色的情感变化轨迹
     */
    updateEmotionalArc(projectId: string, characterId: string, characterName: string, chapterNumber: number, emotion: string, intensity: number): Promise<void>;
    /**
     * 情感弧线高级操作 - 批量添加情感点
     */
    addEmotionPoints(projectId: string, characterId: string, points: EmotionPoint[]): Promise<void>;
    /**
     * 情感弧线高级操作 - 获取角色情感弧线
     */
    getEmotionalArc(projectId: string, characterId: string): Promise<EmotionalArc | undefined>;
    /**
     * 情感弧线高级操作 - 获取章节情感快照
     */
    getChapterEmotions(projectId: string, chapterNumber: number): Promise<EmotionPoint[]>;
    /**
     * 情感弧线高级操作 - 分析情感趋势
     */
    analyzeEmotionalTrend(projectId: string, characterId: string, recentChapters?: number): Promise<{
        trend: 'rising' | 'falling' | 'stable' | 'volatile';
        averageIntensity: number;
        dominantEmotion: string;
        recentPoints: EmotionPoint[];
    }>;
    /**
     * 7. 角色矩阵 (Character Matrix) - 深度优化
     * 管理角色之间的互动历史
     */
    addCharacterInteraction(projectId: string, characterId1: string, characterId2: string, chapterNumber: number, type: string, summary: string): Promise<void>;
    /**
     * 角色矩阵高级操作 - 批量添加角色互动
     */
    addCharacterInteractions(projectId: string, interactions: Array<{
        characterId1: string;
        characterId2: string;
        chapterNumber: number;
        type: string;
        summary: string;
    }>): Promise<void>;
    /**
     * 角色矩阵高级操作 - 获取两个角色的互动历史
     */
    getCharacterInteractions(projectId: string, characterId1: string, characterId2: string): Promise<Interaction[]>;
    /**
     * 角色矩阵高级操作 - 获取角色的所有互动
     */
    getAllCharacterInteractions(projectId: string, characterId: string): Promise<CharacterInteraction[]>;
    /**
     * 角色矩阵高级操作 - 获取章节角色互动
     */
    getChapterInteractions(projectId: string, chapterNumber: number): Promise<Array<{
        characterId1: string;
        characterId2: string;
        interaction: Interaction;
    }>>;
    /**
     * 角色矩阵高级操作 - 分析角色关系网络
     */
    analyzeRelationshipNetwork(projectId: string): Promise<{
        characters: string[];
        relationships: Array<{
            character1: string;
            character2: string;
            interactionCount: number;
            lastInteractionChapter: number;
            dominantType: string;
        }>;
    }>;
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
    /**
     * 综合功能 - 生成7个真相文件的完整报告
     */
    generateTruthFilesReport(projectId: string): Promise<{
        worldState: {
            protagonist: any;
            knownFactsCount: number;
            conflictsCount: number;
            relationshipsCount: number;
            activeSubplotsCount: number;
        };
        resources: {
            totalCount: number;
            byType: Record<string, number>;
        };
        hooks: {
            total: number;
            pending: number;
            paidOff: number;
            expired: number;
        };
        chapters: {
            totalCount: number;
            latestChapter: number | null;
        };
        subplots: {
            total: number;
            active: number;
            resolved: number;
            abandoned: number;
        };
        emotionalArcs: {
            totalCharacters: number;
            byArcType: Record<string, number>;
        };
        characterMatrix: {
            totalRelationships: number;
            totalInteractions: number;
        };
    }>;
    private analyzeArcType;
    private extractKeyEvents;
    private getFilePath;
    private countWords;
}
export default TruthFileManager;
//# sourceMappingURL=TruthFileManager.d.ts.map