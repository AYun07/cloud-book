/**
 * Cloud Book - DSL 模板引擎
 * 提供 @变量 语法进行上下文替换和模板插值
 * 支持角色、位置、世界设定、章节、伏笔等引用
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
     * @DSL 上下文注入 - 完整实现
     */
    parseDSL(text: string, project: NovelProject, truthFiles: TruthFiles): string;
    /**
     * @self - 当前章节引用
     */
    private parseSelfReference;
    /**
     * @character:xxx 或 @char:xxx - 角色引用
     */
    private parseCharacterReference;
    /**
     * @location 或 @loc - 位置引用
     */
    private parseLocationReference;
    /**
     * @world 或 @setting - 世界设定引用
     */
    private parseWorldReference;
    /**
     * @chapter:N - 指定章节引用
     */
    private parseChapterReference;
    /**
     * @hooks 或 @hook:N - 伏笔引用
     */
    private parseHookReference;
    /**
     * @relation:xxx - 关系引用
     */
    private parseRelationshipReference;
    /**
     * @timeline 或 @time - 时间线引用
     */
    private parseTimelineReference;
    /**
     * @item:N 或 @items - 物品引用
     */
    private parseItemReference;
    /**
     * [filter:type] - 过滤表达式
     */
    private parseFilterExpressions;
    /**
     * {if:condition}{then:text}{else:text} - 条件表达式
     */
    private parseConditionalExpressions;
    /**
     * 格式化角色简要信息
     */
    private formatCharacterBrief;
    /**
     * @type:xxx - 按类型获取
     */
    parseTypeReference(text: string, project: NovelProject, truthFiles: TruthFiles): string;
    /**
     * 获取DSL帮助信息
     */
    getDSLHelp(): string;
    /**
     * 验证DSL语法
     */
    validateDSL(text: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * 清理缓存
     */
    clearCache(projectId?: string): void;
}
export default ContextManager;
//# sourceMappingURL=ContextManager.d.ts.map