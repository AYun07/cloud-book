/**
 * Cloud Book - 上下文管理器
 * 管理创作过程中的上下文注入
 */
import { NovelProject, TruthFiles } from '../../types';
export interface ContextEntry {
    type: 'character' | 'world' | 'previous' | 'style' | 'truth';
    content: string;
    priority: number;
}
export declare class ContextManager {
    private contextCache;
    /**
     * 构建写作上下文
     */
    buildWritingContext(project: NovelProject, currentChapter: number, truthFiles: TruthFiles): string;
    /**
     * 构建元信息上下文
     */
    private buildMetaContext;
    /**
     * 构建世界设定上下文
     */
    private buildWorldContext;
    /**
     * 构建角色上下文
     */
    private buildCharacterContext;
    /**
     * 构建真相文件上下文
     */
    private buildTruthContext;
    /**
     * 构建前文上下文
     */
    private buildPreviousContext;
    /**
     * 构建风格上下文
     */
    private buildStyleContext;
    /**
     * @DSL 上下文注入
     */
    parseDSL(text: string, project: NovelProject, truthFiles: TruthFiles): string;
    /**
     * 清理缓存
     */
    clearCache(projectId?: string): void;
}
export default ContextManager;
//# sourceMappingURL=ContextManager.d.ts.map