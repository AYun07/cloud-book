/**
 * Mind Map Generator - 思维导图模块
 * 生成可视化的思维导图，支持内置 SVG 渲染
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
    nodePadding?: number;
    levelGap?: number;
    siblingGap?: number;
}
export interface MindMapData {
    root: MindMapNode;
    nodes: MindMapNode[];
    connections: {
        from: string;
        to: string;
    }[];
}
export interface LayoutNode {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    children: LayoutNode[];
    collapsed?: boolean;
    node?: MindMapNode;
}
export interface RenderOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    selectedNodeId?: string;
    onNodeClick?: (nodeId: string) => void;
    onNodeDoubleClick?: (nodeId: string) => void;
}
export interface CanvasContext {
    width: number;
    height: number;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: 'start' | 'end' | 'left' | 'right' | 'center';
    textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    arc(x: number, y: number, r: number, startAngle: number, endAngle: number): void;
    stroke(): void;
    fill(): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    closePath(): void;
}
export interface CanvasElement {
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasContext | null;
}
export interface MindMapRenderer {
    renderToSVG(mindMapData: MindMapData, options?: RenderOptions): string;
    renderToCanvas(mindMapData: MindMapData, canvas: CanvasElement, options?: RenderOptions): void;
    calculateLayout(mindMapData: MindMapData): LayoutNode;
    getLayoutDimensions(layout: LayoutNode): {
        width: number;
        height: number;
    };
    toggleNodeCollapse(mindMapData: MindMapData, nodeId: string): MindMapData;
    expandAll(mindMapData: MindMapData): MindMapData;
    collapseAll(mindMapData: MindMapData): MindMapData;
    getVisibleNodes(mindMapData: MindMapData): MindMapNode[];
    findNode(mindMapData: MindMapData, nodeId: string): MindMapNode | null;
    highlightPath(mindMapData: MindMapData, nodeId: string): string[];
}
export declare class MindMapGenerator {
    private config;
    private defaultColors;
    constructor(config?: MindMapConfig);
    generateProjectMindMap(project: NovelProject): Promise<MindMapData>;
    generateCharacterRelationshipMap(characters: Character[]): Promise<MindMapData>;
    generateChapterOutlineMap(chapters: Chapter[]): Promise<MindMapData>;
    generateWorldSettingMap(worldSetting: NovelProject['worldSetting']): Promise<MindMapData>;
    calculateLayout(mindMapData: MindMapData): LayoutNode;
    private calculateSubtreeHeights;
    private calculatePositions;
    private calculateSubtreeHeight;
    private calculateSubtreeWidth;
    getLayoutDimensions(layout: LayoutNode): {
        width: number;
        height: number;
    };
    renderToSVG(mindMapData: MindMapData, options?: RenderOptions): string;
    renderToCanvas(mindMapData: MindMapData, canvas: CanvasElement, options?: RenderOptions): void;
    private roundRect;
    toggleNodeCollapse(mindMapData: MindMapData, nodeId: string): MindMapData;
    expandAll(mindMapData: MindMapData): MindMapData;
    collapseAll(mindMapData: MindMapData): MindMapData;
    getVisibleNodes(mindMapData: MindMapData): MindMapNode[];
    findNode(mindMapData: MindMapData, nodeId: string): MindMapNode | null;
    highlightPath(mindMapData: MindMapData, nodeId: string): string[];
    generateMermaidDiagram(mindMapData: MindMapData): string;
    generateHTML(mindMapData: MindMapData): string;
    generateMarkdown(mindMapData: MindMapData): string;
    private createNode;
    private generateWorldChildren;
    private generateCharacterChildren;
    private generatePlotChildren;
    private escapeXml;
}
export default MindMapGenerator;
//# sourceMappingURL=MindMapGenerator.d.ts.map