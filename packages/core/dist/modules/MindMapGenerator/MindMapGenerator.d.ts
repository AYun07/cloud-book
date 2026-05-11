/**
 * Mind Map Generator - 思维导图模块
 * 生成可视化的思维导图
 */
import { MindMapNode, NovelProject, Character, Chapter } from '../../types';
export interface MindMapConfig {
    direction: 'LR' | 'RL' | 'TB' | 'BT';
    nodeSize?: {
        width: number;
        height: number;
    };
    colors?: Record<string, string>;
    showIcons?: boolean;
}
export interface MindMapData {
    root: MindMapNode;
    nodes: MindMapNode[];
    connections: {
        from: string;
        to: string;
    }[];
}
export declare class MindMapGenerator {
    private config;
    constructor(config?: MindMapConfig);
    generateProjectMindMap(project: NovelProject): Promise<MindMapData>;
    generateCharacterRelationshipMap(characters: Character[]): Promise<MindMapData>;
    generateChapterOutlineMap(chapters: Chapter[]): Promise<MindMapData>;
    generateWorldSettingMap(worldSetting: NovelProject['worldSetting']): Promise<MindMapData>;
    generateMermaidDiagram(mindMapData: MindMapData): string;
    generateHTML(mindMapData: MindMapData): string;
    generateMarkdown(mindMapData: MindMapData): string;
    private createNode;
    private generateWorldChildren;
    private generateCharacterChildren;
    private generatePlotChildren;
}
export default MindMapGenerator;
//# sourceMappingURL=MindMapGenerator.d.ts.map