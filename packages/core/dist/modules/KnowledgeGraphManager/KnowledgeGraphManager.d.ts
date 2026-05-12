/**
 * Cloud Book - 知识图谱管理器 V2
 * 支持多种图数据库后端
 * 真正的图遍历算法
 */
export interface KGNode {
    id: string;
    type: 'character' | 'location' | 'item' | 'event' | 'faction' | 'concept';
    name: string;
    properties: Record<string, any>;
    embedding?: number[];
    createdAt: Date;
    updatedAt: Date;
}
export interface KGRelationship {
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    properties: Record<string, any>;
    weight: number;
    bidirectional: boolean;
    createdAt: Date;
}
export interface KGQuery {
    startNode?: string;
    endNode?: string;
    relationshipTypes?: string[];
    nodeTypes?: string[];
    depth?: number;
    limit?: number;
}
export interface KGPath {
    nodes: KGNode[];
    relationships: KGRelationship[];
    totalWeight: number;
}
export interface KGStats {
    totalNodes: number;
    totalRelationships: number;
    nodeTypes: Record<string, number>;
    relationshipTypes: Record<string, number>;
    avgDegree: number;
}
export type GraphBackend = 'memory' | 'neo4j' | 'dgraph' | 'arango';
export interface KGConfig {
    backend: GraphBackend;
    endpoint?: string;
    apiKey?: string;
    database?: string;
}
export declare class KnowledgeGraphManager {
    private config;
    private nodes;
    private relationships;
    private adjacencyList;
    private relationshipIndex;
    private llmProvider;
    private embeddingProvider;
    constructor(config?: Partial<KGConfig>);
    setLLMProvider(provider: any): void;
    setEmbeddingProvider(provider: any): void;
    /**
     * 添加节点
     */
    addNode(type: KGNode['type'], name: string, properties?: Record<string, any>): Promise<KGNode>;
    /**
     * 添加关系
     */
    addRelationship(sourceId: string, targetId: string, type: string, properties?: Record<string, any>, weight?: number, bidirectional?: boolean): Promise<KGRelationship | null>;
    /**
     * 查找节点
     */
    findNode(id: string): KGNode | undefined;
    /**
     * 查找节点（通过属性）
     */
    findNodesByProperty(type: KGNode['type'], property: string, value: any): KGNode[];
    /**
     * 语义搜索节点
     */
    semanticSearch(query: string, type?: KGNode['type'], limit?: number): Promise<KGNode[]>;
    /**
     * 获取节点的所有关系
     */
    getNodeRelationships(nodeId: string): KGRelationship[];
    /**
     * 获取两个节点之间的关系
     */
    getRelationship(sourceId: string, targetId: string): KGRelationship | undefined;
    /**
     * 图遍历：BFS
     */
    traverseBFS(startNodeId: string, options?: {
        maxDepth?: number;
        relationshipTypes?: string[];
        direction?: 'outgoing' | 'incoming' | 'both';
    }): KGNode[];
    /**
     * 图遍历：DFS
     */
    traverseDFS(startNodeId: string, options?: {
        maxDepth?: number;
        relationshipTypes?: string[];
        direction?: 'outgoing' | 'incoming' | 'both';
    }): KGNode[];
    /**
     * 查找最短路径（Dijkstra算法）
     */
    findShortestPath(startNodeId: string, endNodeId: string, options?: {
        relationshipTypes?: string[];
        weightProperty?: string;
    }): Promise<KGPath | null>;
    /**
     * 查找所有路径（限制深度）
     */
    findAllPaths(startNodeId: string, endNodeId: string, maxDepth?: number): KGPath[];
    /**
     * 查找关键节点（PageRank）
     */
    calculatePageRank(damping?: number, iterations?: number): Map<string, number>;
    /**
     * 社区检测（简单版本）
     */
    detectCommunities(): Map<string, string[]>;
    /**
     * 获取统计信息
     */
    getStats(): KGStats;
    /**
     * 删除节点
     */
    deleteNode(id: string): void;
    /**
     * 删除关系
     */
    deleteRelationship(id: string): void;
    /**
     * 导出为JSON
     */
    exportToJSON(): string;
    /**
     * 从JSON导入
     */
    importFromJSON(json: string): void;
    private cosineSimilarity;
}
export default KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.d.ts.map