/**
 * 知识图谱管理器
 * 角色、地点、物品、势力关系图谱
 */

import { KnowledgeGraph, GraphNode, GraphRelation, Character, Location, Item, Faction } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

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

export class KnowledgeGraphManager {
  private graphs: Map<string, KnowledgeGraph> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/knowledgegraph') {
    this.storagePath = storagePath;
  }

  async initialize(projectId: string): Promise<void> {
    this.graphs.set(projectId, {
      nodes: [],
      relations: []
    });
  }

  async addNode(projectId: string, node: Omit<GraphNode, 'id'>): Promise<GraphNode> {
    const graph = this.graphs.get(projectId) || { nodes: [], relations: [] };
    
    const newNode: GraphNode = {
      id: this.generateId(),
      ...node
    };

    graph.nodes.push(newNode);
    this.graphs.set(projectId, graph);
    await this.save(projectId);
    return newNode;
  }

  async addCharacterNode(projectId: string, character: Character): Promise<GraphNode> {
    return this.addNode(projectId, {
      type: 'character',
      name: character.name,
      properties: {
        id: character.id,
        aliases: character.aliases,
        gender: character.gender,
        age: character.age,
        personality: character.personality,
        background: character.background,
        goals: character.goals,
        abilities: character.abilities,
        speakingStyle: character.speakingStyle
      }
    });
  }

  async addLocationNode(projectId: string, location: Location): Promise<GraphNode> {
    return this.addNode(projectId, {
      type: 'location',
      name: location.name,
      properties: {
        id: location.id,
        description: location.description,
        parentId: location.parentId,
        connections: location.connections,
        mapCoordinates: location.mapCoordinates
      }
    });
  }

  async addItemNode(projectId: string, item: Item): Promise<GraphNode> {
    return this.addNode(projectId, {
      type: 'item',
      name: item.name,
      properties: {
        id: item.id,
        description: item.description,
        rarity: item.rarity,
        owner: item.owner
      }
    });
  }

  async addFactionNode(projectId: string, faction: Faction): Promise<GraphNode> {
    return this.addNode(projectId, {
      type: 'faction',
      name: faction.name,
      properties: {
        id: faction.id,
        type: faction.type,
        description: faction.description,
        members: faction.members,
        territory: faction.territory
      }
    });
  }

  async addRelation(
    projectId: string,
    source: string,
    target: string,
    type: string,
    properties?: Record<string, any>
  ): Promise<GraphRelation> {
    const graph = this.graphs.get(projectId) || { nodes: [], relations: [] };
    
    const relation: GraphRelation = {
      id: this.generateId(),
      source,
      target,
      type,
      properties
    };

    graph.relations.push(relation);
    this.graphs.set(projectId, graph);
    await this.save(projectId);
    return relation;
  }

  async updateNode(projectId: string, nodeId: string, updates: Partial<GraphNode>): Promise<GraphNode | null> {
    const graph = this.graphs.get(projectId);
    if (!graph) return null;

    const nodeIndex = graph.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return null;

    graph.nodes[nodeIndex] = { ...graph.nodes[nodeIndex], ...updates };
    this.graphs.set(projectId, graph);
    await this.save(projectId);
    return graph.nodes[nodeIndex];
  }

  async deleteNode(projectId: string, nodeId: string): Promise<boolean> {
    const graph = this.graphs.get(projectId);
    if (!graph) return false;

    const initialLength = graph.nodes.length;
    graph.nodes = graph.nodes.filter(n => n.id !== nodeId);
    graph.relations = graph.relations.filter(r => r.source !== nodeId && r.target !== nodeId);

    if (graph.nodes.length < initialLength) {
      this.graphs.set(projectId, graph);
      await this.save(projectId);
      return true;
    }
    return false;
  }

  async getNode(projectId: string, nodeId: string): Promise<GraphNode | undefined> {
    return this.graphs.get(projectId)?.nodes.find(n => n.id === nodeId);
  }

  async getNodesByType(projectId: string, type: GraphNode['type']): Promise<GraphNode[]> {
    return this.graphs.get(projectId)?.nodes.filter(n => n.type === type) || [];
  }

  async getRelations(projectId: string, nodeId: string): Promise<GraphRelation[]> {
    const graph = this.graphs.get(projectId);
    if (!graph) return [];

    return graph.relations.filter(r => r.source === nodeId || r.target === nodeId);
  }

  async getRelationTypes(projectId: string): Promise<string[]> {
    const graph = this.graphs.get(projectId);
    if (!graph) return [];

    const types = new Set<string>();
    for (const relation of graph.relations) {
      types.add(relation.type);
    }
    return Array.from(types);
  }

  async query(query: GraphQuery): Promise<GraphNode[]> {
    const projectIds = Array.from(this.graphs.keys());
    const results: GraphNode[] = [];

    for (const projectId of projectIds) {
      const graph = this.graphs.get(projectId);
      if (!graph) continue;

      let filteredNodes = graph.nodes;

      if (query.type) {
        filteredNodes = filteredNodes.filter(n => n.type === query.type);
      }

      if (query.fromNode && query.depth) {
        const connectedNodes = this.getConnectedNodes(graph, query.fromNode, query.depth);
        const nodeIds = new Set(connectedNodes.map(n => n.id));
        filteredNodes = filteredNodes.filter(n => nodeIds.has(n.id));
      }

      results.push(...filteredNodes);
    }

    return results;
  }

  async findPath(projectId: string, from: string, to: string): Promise<PathResult | null> {
    const graph = this.graphs.get(projectId);
    if (!graph) return null;

    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: from, path: [from] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === to) {
        const nodes = path.map(id => graph.nodes.find(n => n.id === id)!);
        const relations = [];
        
        for (let i = 0; i < path.length - 1; i++) {
          const rel = graph.relations.find(
            r => r.source === path[i] && r.target === path[i + 1]
          );
          if (rel) relations.push(rel);
        }
        
        return { nodes, relations, path };
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const outgoing = graph.relations.filter(r => r.source === nodeId);
      for (const rel of outgoing) {
        if (!visited.has(rel.target)) {
          queue.push({ nodeId: rel.target, path: [...path, rel.target] });
        }
      }
    }

    return null;
  }

  private getConnectedNodes(graph: KnowledgeGraph, fromNode: string, depth: number): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];
    const queue: { nodeId: string; currentDepth: number }[] = [{ nodeId: fromNode, currentDepth: 0 }];

    while (queue.length > 0) {
      const { nodeId, currentDepth } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = graph.nodes.find(n => n.id === nodeId);
      if (node && currentDepth > 0) {
        result.push(node);
      }

      if (currentDepth >= depth) continue;

      const connected = graph.relations.filter(
        r => r.source === nodeId || r.target === nodeId
      );

      for (const rel of connected) {
        const nextNode = rel.source === nodeId ? rel.target : rel.source;
        if (!visited.has(nextNode)) {
          queue.push({ nodeId: nextNode, currentDepth: currentDepth + 1 });
        }
      }
    }

    return result;
  }

  async getCharacterNetwork(projectId: string, characterId: string, depth: number = 2): Promise<{
    characters: GraphNode[];
    relations: GraphRelation[];
  }> {
    const graph = this.graphs.get(projectId);
    if (!graph) return { characters: [], relations: [] };

    const connectedNodes = this.getConnectedNodes(graph, characterId, depth);
    const characters = connectedNodes.filter(n => n.type === 'character');
    
    const nodeIds = new Set([characterId, ...characters.map(n => n.id)]);
    const relations = graph.relations.filter(
      r => nodeIds.has(r.source) && nodeIds.has(r.target)
    );

    return { characters, relations };
  }

  async getFactionHierarchy(projectId: string, factionId: string): Promise<{
    leader: GraphNode | null;
    members: GraphNode[];
    subFactions: GraphNode[];
    allies: GraphRelation[];
    enemies: GraphRelation[];
  }> {
    const graph = this.graphs.get(projectId);
    if (!graph) {
      return { leader: null, members: [], subFactions: [], allies: [], enemies: [] };
    }

    const faction = graph.nodes.find(n => n.id === factionId);
    
    const memberRelations = graph.relations.filter(r => 
      (r.source === factionId || r.target === factionId) && r.type === 'member_of'
    );
    
    const allies = graph.relations.filter(r =>
      (r.source === factionId || r.target === factionId) && r.type === 'ally'
    );
    
    const enemies = graph.relations.filter(r =>
      (r.source === factionId || r.target === factionId) && r.type === 'enemy'
    );

    const members = memberRelations
      .map(r => r.source === factionId ? r.target : r.source)
      .map(id => graph.nodes.find(n => n.id === id))
      .filter((n): n is GraphNode => n !== undefined && n.type === 'character');

    const subFactions = memberRelations
      .map(r => r.source === factionId ? r.target : r.source)
      .map(id => graph.nodes.find(n => n.id === id))
      .filter((n): n is GraphNode => n !== undefined && n.type === 'faction');

    return { 
      leader: faction || null, 
      members, 
      subFactions,
      allies,
      enemies
    };
  }

  async exportGraph(projectId: string): Promise<KnowledgeGraph> {
    return this.graphs.get(projectId) || { nodes: [], relations: [] };
  }

  async importGraph(projectId: string, graph: KnowledgeGraph): Promise<void> {
    this.graphs.set(projectId, graph);
    await this.save(projectId);
  }

  private async save(projectId: string): Promise<void> {
    const dir = path.join(this.storagePath, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const graph = this.graphs.get(projectId);
    if (graph) {
      fs.writeFileSync(
        path.join(dir, 'graph.json'),
        JSON.stringify(graph, null, 2),
        'utf-8'
      );
    }
  }

  async load(projectId: string): Promise<void> {
    const filePath = path.join(this.storagePath, projectId, 'graph.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.graphs.set(projectId, data);
    } else {
      await this.initialize(projectId);
    }
  }

  private generateId(): string {
    return `kg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default KnowledgeGraphManager;
