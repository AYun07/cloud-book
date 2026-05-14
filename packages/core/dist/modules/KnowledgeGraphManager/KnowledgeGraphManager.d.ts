/**
 * Cloud Book - 知识图谱管理器 V3
 * 支持多种图数据库后端（Memory / Neo4j）
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
export interface Neo4jConfig {
    uri: string;
    username: string;
    password: string;
    database?: string;
}
export interface KGConfig {
    backend: GraphBackend;
    neo4j?: Neo4jConfig;
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
    private neo4jDriver;
    private isConnected;
    constructor(config?: Partial<KGConfig>);
    setLLMProvider(provider: any): void;
    setEmbeddingProvider(provider: any): void;
    connectNeo4j(config: Neo4jConfig): Promise<boolean>;
    disconnectNeo4j(): Promise<void>;
    getConnectionStatus(): {
        connected: boolean;
        backend: GraphBackend;
    };
    private initializeNeo4jSchema;
    private getSession;
    private mapNeo4jNode;
    private mapNeo4jRelationship;
    addNode(type: KGNode['type'], name: string, properties?: Record<string, any>): Promise<KGNode>;
    private addNodeToNeo4j;
    addRelationship(sourceId: string, targetId: string, type: string, properties?: Record<string, any>, weight?: number, bidirectional?: boolean): Promise<KGRelationship | null>;
    private addRelationshipToNeo4j;
    findNode(id: string): Promise<KGNode | undefined>;
    private findNodeInNeo4j;
    findNodesByProperty(type: KGNode['type'], property: string, value: any): Promise<KGNode[]>;
    private findNodesByPropertyInNeo4j;
    semanticSearch(query: string, type?: KGNode['type'], limit?: number): Promise<KGNode[]>;
    private semanticSearchInNeo4j;
    getNodeRelationships(nodeId: string): Promise<KGRelationship[]>;
    private getNodeRelationshipsInNeo4j;
    getRelationship(sourceId: string, targetId: string): Promise<KGRelationship | undefined>;
    private getRelationshipInNeo4j;
    traverseBFS(startNodeId: string, options?: {
        maxDepth?: number;
        relationshipTypes?: string[];
        direction?: 'outgoing' | 'incoming' | 'both';
    }): KGNode[];
    private getNodeRelationshipsSync;
    traverseDFS(startNodeId: string, options?: {
        maxDepth?: number;
        relationshipTypes?: string[];
        direction?: 'outgoing' | 'incoming' | 'both';
    }): KGNode[];
    findShortestPath(startNodeId: string, endNodeId: string, options?: {
        relationshipTypes?: string[];
        weightProperty?: string;
    }): Promise<KGPath | null>;
    findAllPaths(startNodeId: string, endNodeId: string, maxDepth?: number): KGPath[];
    calculatePageRank(damping?: number, iterations?: number): Map<string, number>;
    detectCommunities(): Map<string, string[]>;
    getStats(): KGStats;
    deleteNode(id: string): void;
    deleteRelationship(id: string): void;
    exportToJSON(): string;
    importFromJSON(json: string): void;
    syncToNeo4j(): Promise<void>;
    syncFromNeo4j(): Promise<void>;
    private cosineSimilarity;
}
export default KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.d.ts.map