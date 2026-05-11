/**
 * 知识图谱管理器
 * 角色、地点、物品、势力关系图谱
 */
import { KnowledgeGraph, GraphNode, GraphRelation, Character, Location, Item, Faction } from '../../types';
export interface GraphQuery {
    type?: 'character' | 'location' | 'item' | 'faction';
    relationType?: string;
    depth?: number;
    fromNode?: string;
}
export interface PathResult {
    nodes: GraphNode[];
    relations: GraphRelation[];
    path: string[];
}
export declare class KnowledgeGraphManager {
    private graphs;
    private storagePath;
    constructor(storagePath?: string);
    initialize(projectId: string): Promise<void>;
    addNode(projectId: string, node: Omit<GraphNode, 'id'>): Promise<GraphNode>;
    addCharacterNode(projectId: string, character: Character): Promise<GraphNode>;
    addLocationNode(projectId: string, location: Location): Promise<GraphNode>;
    addItemNode(projectId: string, item: Item): Promise<GraphNode>;
    addFactionNode(projectId: string, faction: Faction): Promise<GraphNode>;
    addRelation(projectId: string, source: string, target: string, type: string, properties?: Record<string, any>): Promise<GraphRelation>;
    updateNode(projectId: string, nodeId: string, updates: Partial<GraphNode>): Promise<GraphNode | null>;
    deleteNode(projectId: string, nodeId: string): Promise<boolean>;
    getNode(projectId: string, nodeId: string): Promise<GraphNode | undefined>;
    getNodesByType(projectId: string, type: GraphNode['type']): Promise<GraphNode[]>;
    getRelations(projectId: string, nodeId: string): Promise<GraphRelation[]>;
    getRelationTypes(projectId: string): Promise<string[]>;
    query(query: GraphQuery): Promise<GraphNode[]>;
    findPath(projectId: string, from: string, to: string): Promise<PathResult | null>;
    private getConnectedNodes;
    getCharacterNetwork(projectId: string, characterId: string, depth?: number): Promise<{
        characters: GraphNode[];
        relations: GraphRelation[];
    }>;
    getFactionHierarchy(projectId: string, factionId: string): Promise<{
        leader: GraphNode | null;
        members: GraphNode[];
        subFactions: GraphNode[];
        allies: GraphRelation[];
        enemies: GraphRelation[];
    }>;
    exportGraph(projectId: string): Promise<KnowledgeGraph>;
    importGraph(projectId: string, graph: KnowledgeGraph): Promise<void>;
    private save;
    load(projectId: string): Promise<void>;
    private generateId;
}
export default KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.d.ts.map