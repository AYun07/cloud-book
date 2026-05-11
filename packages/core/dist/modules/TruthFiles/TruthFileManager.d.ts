/**
 * Cloud Book - 真相文件管理器
 * 维护长篇创作的一致性
 */
import { TruthFiles, WorldState, Resource, Hook, Chapter } from '../../types';
export declare class TruthFileManager {
    private storagePath;
    constructor(storagePath?: string);
    /**
     * 初始化项目的真相文件
     */
    initialize(projectId: string): Promise<TruthFiles>;
    /**
     * 获取真相文件
     */
    getTruthFiles(projectId: string): Promise<TruthFiles>;
    /**
     * 保存真相文件
     */
    saveTruthFiles(projectId: string, truthFiles: TruthFiles): Promise<void>;
    /**
     * 更新章节摘要
     */
    updateChapterSummary(projectId: string, chapter: Chapter): Promise<void>;
    /**
     * 更新世界状态
     */
    updateWorldState(projectId: string, state: Partial<WorldState>): Promise<void>;
    /**
     * 添加资源
     */
    addResource(projectId: string, resource: Resource): Promise<void>;
    /**
     * 更新资源
     */
    updateResource(projectId: string, resourceId: string, change: string, chapterNumber: number): Promise<void>;
    /**
     * 添加伏笔
     */
    addHook(projectId: string, hook: Hook): Promise<void>;
    /**
     * 回收伏笔
     */
    fulfillHook(projectId: string, hookId: string, chapterNumber: number): Promise<void>;
    /**
     * 添加角色互动
     */
    addCharacterInteraction(projectId: string, characterId1: string, characterId2: string, chapterNumber: number, type: string, summary: string): Promise<void>;
    /**
     * 更新情感弧线
     */
    updateEmotionalArc(projectId: string, characterId: string, characterName: string, chapterNumber: number, emotion: string, intensity: number): Promise<void>;
    /**
     * 获取上下文摘要
     */
    getContextSummary(projectId: string, chapterNumber: number): Promise<string>;
    /**
     * 分析弧线类型
     */
    private analyzeArcType;
    /**
     * 提取关键事件
     */
    private extractKeyEvents;
    /**
     * 获取文件路径
     */
    private getFilePath;
}
export default TruthFileManager;
//# sourceMappingURL=TruthFileManager.d.ts.map