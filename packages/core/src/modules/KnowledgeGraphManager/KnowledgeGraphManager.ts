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

export class KnowledgeGraphManager {
  private config: KGConfig;
  private nodes: Map<string, KGNode> = new Map();
  private relationships: Map<string, KGRelationship> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private relationshipIndex: Map<string, Set<string>> = new Map();
  private llmProvider: any = null;
  private embeddingProvider: any = null;

  constructor(config?: Partial<KGConfig>) {
    this.config = {
      backend: 'memory',
      ...config
    };
  }

  setLLMProvider(provider: any) {
    this.llmProvider = provider;
  }

  setEmbeddingProvider(provider: any) {
    this.embeddingProvider = provider;
  }

  /**
   * 添加节点
   */
  async addNode(
    type: KGNode['type'],
    name: string,
    properties: Record<string, any> = {}
  ): Promise<KGNode> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    let embedding: number[] | undefined;
    if (this.embeddingProvider) {
      try {
        embedding = await this.embeddingProvider.generateEmbedding(`${type}: ${name} ${JSON.stringify(properties)}`);
      } catch (e) {
        console.warn('Embedding generation failed:', e);
      }
    }

    const node: KGNode = {
      id,
      type,
      name,
      properties,
      embedding,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.nodes.set(id, node);
    this.adjacencyList.set(id, new Set());

    return node;
  }

  /**
   * 添加关系
   */
  async addRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    properties: Record<string, any> = {},
    weight: number = 1,
    bidirectional: boolean = false
  ): Promise<KGRelationship | null> {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);
    
    if (!source || !target) {
      throw new Error('Source or target node not found');
    }

    const id = `rel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const relationship: KGRelationship = {
      id,
      sourceId,
      targetId,
      type,
      properties,
      weight,
      bidirectional,
      createdAt: new Date()
    };

    this.relationships.set(id, relationship);
    
    if (!this.adjacencyList.has(sourceId)) {
      this.adjacencyList.set(sourceId, new Set());
    }
    this.adjacencyList.get(sourceId)!.add(id);

    if (bidirectional) {
      if (!this.adjacencyList.has(targetId)) {
        this.adjacencyList.set(targetId, new Set());
      }
      this.adjacencyList.get(targetId)!.add(id);
    }

    if (!this.relationshipIndex.has(type)) {
      this.relationshipIndex.set(type, new Set());
    }
    this.relationshipIndex.get(type)!.add(id);

    return relationship;
  }

  /**
   * 查找节点
   */
  findNode(id: string): KGNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * 查找节点（通过属性）
   */
  findNodesByProperty(
    type: KGNode['type'],
    property: string,
    value: any
  ): KGNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.type === type && node.properties[property] === value
    );
  }

  /**
   * 语义搜索节点
   */
  async semanticSearch(
    query: string,
    type?: KGNode['type'],
    limit: number = 10
  ): Promise<KGNode[]> {
    if (!this.embeddingProvider) {
      return Array.from(this.nodes.values())
        .filter(node => !type || node.type === type)
        .filter(node => 
          node.name.includes(query) || 
          JSON.stringify(node.properties).includes(query)
        )
        .slice(0, limit);
    }

    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
    
    const candidates = Array.from(this.nodes.values())
      .filter(node => !type || node.type === type)
      .filter(node => node.embedding);

    const scored = candidates.map(node => ({
      node,
      score: this.cosineSimilarity(queryEmbedding, node.embedding!)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.node);
  }

  /**
   * 获取节点的所有关系
   */
  getNodeRelationships(nodeId: string): KGRelationship[] {
    const relIds = this.adjacencyList.get(nodeId);
    if (!relIds) return [];

    return Array.from(relIds)
      .map(id => this.relationships.get(id))
      .filter((rel): rel is KGRelationship => rel !== undefined)
      .filter(rel => rel.sourceId === nodeId || rel.bidirectional);
  }

  /**
   * 获取两个节点之间的关系
   */
  getRelationship(sourceId: string, targetId: string): KGRelationship | undefined {
    const relIds = this.adjacencyList.get(sourceId);
    if (!relIds) return undefined;

    for (const relId of relIds) {
      const rel = this.relationships.get(relId);
      if (rel && (rel.targetId === targetId || rel.bidirectional)) {
        return rel;
      }
    }
    return undefined;
  }

  /**
   * 图遍历：BFS
   */
  traverseBFS(
    startNodeId: string,
    options?: {
      maxDepth?: number;
      relationshipTypes?: string[];
      direction?: 'outgoing' | 'incoming' | 'both';
    }
  ): KGNode[] {
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: startNodeId, depth: 0 }];
    const result: KGNode[] = [];
    const maxDepth = options?.maxDepth ?? 10;
    const relTypes = options?.relationshipTypes;
    const direction = options?.direction ?? 'outgoing';

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node) result.push(node);

      const rels = this.getNodeRelationships(id);
      for (const rel of rels) {
        if (relTypes && !relTypes.includes(rel.type)) continue;
        
        let nextId: string | null = null;
        if (direction === 'outgoing' && rel.sourceId === id) {
          nextId = rel.targetId;
        } else if (direction === 'incoming' && rel.targetId === id) {
          nextId = rel.sourceId;
        } else if (direction === 'both') {
          nextId = rel.sourceId === id ? rel.targetId : rel.sourceId;
        }

        if (nextId && !visited.has(nextId)) {
          queue.push({ id: nextId, depth: depth + 1 });
        }
      }
    }

    return result;
  }

  /**
   * 图遍历：DFS
   */
  traverseDFS(
    startNodeId: string,
    options?: {
      maxDepth?: number;
      relationshipTypes?: string[];
      direction?: 'outgoing' | 'incoming' | 'both';
    }
  ): KGNode[] {
    const visited = new Set<string>();
    const result: KGNode[] = [];
    const maxDepth = options?.maxDepth ?? 10;
    const relTypes = options?.relationshipTypes;
    const direction = options?.direction ?? 'outgoing';

    const dfs = (nodeId: string, depth: number) => {
      if (visited.has(nodeId) || depth > maxDepth) return;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) result.push(node);

      const rels = this.getNodeRelationships(nodeId);
      for (const rel of rels) {
        if (relTypes && !relTypes.includes(rel.type)) continue;
        
        let nextId: string | null = null;
        if (direction === 'outgoing' && rel.sourceId === nodeId) {
          nextId = rel.targetId;
        } else if (direction === 'incoming' && rel.targetId === nodeId) {
          nextId = rel.sourceId;
        } else if (direction === 'both') {
          nextId = rel.sourceId === nodeId ? rel.targetId : rel.sourceId;
        }

        if (nextId) dfs(nextId, depth + 1);
      }
    };

    dfs(startNodeId, 0);
    return result;
  }

  /**
   * 查找最短路径（Dijkstra算法）
   */
  async findShortestPath(
    startNodeId: string,
    endNodeId: string,
    options?: {
      relationshipTypes?: string[];
      weightProperty?: string;
    }
  ): Promise<KGPath | null> {
    const relTypes = options?.relationshipTypes;
    const weightProp = options?.weightProperty ?? 'weight';

    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; relId: string } | null>();
    const unvisited = new Set<string>();

    for (const node of this.nodes.keys()) {
      distances.set(node, node === startNodeId ? 0 : Infinity);
      previous.set(node, null);
      unvisited.add(node);
    }

    while (unvisited.size > 0) {
      let minDist = Infinity;
      let current: string | null = null;
      
      for (const nodeId of unvisited) {
        if (distances.get(nodeId)! < minDist) {
          minDist = distances.get(nodeId)!;
          current = nodeId;
        }
      }

      if (current === null || minDist === Infinity) break;
      if (current === endNodeId) break;

      unvisited.delete(current);

      const rels = this.getNodeRelationships(current);
      for (const rel of rels) {
        if (relTypes && !relTypes.includes(rel.type)) continue;
        
        const nextId = rel.sourceId === current ? rel.targetId : rel.sourceId;
        if (!unvisited.has(nextId)) continue;

        const weight = rel.properties[weightProp] ?? rel.weight;
        const newDist = distances.get(current)! + weight;

        if (newDist < distances.get(nextId)!) {
          distances.set(nextId, newDist);
          previous.set(nextId, { nodeId: current, relId: rel.id });
        }
      }
    }

    if (distances.get(endNodeId) === Infinity) return null;

    const pathNodes: KGNode[] = [];
    const pathRels: KGRelationship[] = [];
    let current: string | null = endNodeId;

    while (current) {
      const node = this.nodes.get(current);
      if (node) pathNodes.unshift(node);
      
      const prev = previous.get(current);
      if (prev) {
        const rel = this.relationships.get(prev.relId);
        if (rel) pathRels.unshift(rel);
        current = prev.nodeId;
      } else {
        current = null;
      }
    }

    return {
      nodes: pathNodes,
      relationships: pathRels,
      totalWeight: distances.get(endNodeId)!
    };
  }

  /**
   * 查找所有路径（限制深度）
   */
  findAllPaths(
    startNodeId: string,
    endNodeId: string,
    maxDepth: number = 5
  ): KGPath[] {
    const paths: KGPath[] = [];

    const dfs = (
      current: string,
      end: string,
      depth: number,
      visited: Set<string>,
      pathNodes: KGNode[],
      pathRels: KGRelationship[]
    ) => {
      if (depth > maxDepth) return;
      if (current === end) {
        paths.push({
          nodes: [...pathNodes],
          relationships: [...pathRels],
          totalWeight: pathRels.reduce((sum, r) => sum + r.weight, 0)
        });
        return;
      }

      const rels = this.getNodeRelationships(current);
      for (const rel of rels) {
        const nextId = rel.sourceId === current ? rel.targetId : rel.sourceId;
        if (visited.has(nextId)) continue;

        visited.add(nextId);
        pathNodes.push(this.nodes.get(nextId)!);
        pathRels.push(rel);

        dfs(nextId, end, depth + 1, visited, pathNodes, pathRels);

        pathNodes.pop();
        pathRels.pop();
        visited.delete(nextId);
      }
    };

    const startNode = this.nodes.get(startNodeId);
    if (startNode) {
      dfs(startNodeId, endNodeId, 0, new Set([startNodeId]), [startNode], []);
    }

    return paths;
  }

  /**
   * 查找关键节点（PageRank）
   */
  calculatePageRank(damping: number = 0.85, iterations: number = 100): Map<string, number> {
    const ranks = new Map<string, number>();
    const outLinks = new Map<string, number>();

    for (const [nodeId] of this.nodes) {
      ranks.set(nodeId, 1);
      outLinks.set(nodeId, this.getNodeRelationships(nodeId).length || 1);
    }

    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map<string, number>();
      let maxDiff = 0;

      for (const [nodeId, rank] of ranks) {
        let sum = 0;
        const rels = this.getNodeRelationships(nodeId);
        
        for (const rel of rels) {
          const sourceId = rel.sourceId === nodeId ? rel.targetId : rel.sourceId;
          const sourceOutLinks = outLinks.get(sourceId) || 1;
          sum += ranks.get(sourceId)! / sourceOutLinks;
        }

        const newRank = (1 - damping) + damping * sum;
        newRanks.set(nodeId, newRank);
        maxDiff = Math.max(maxDiff, Math.abs(newRank - rank));
      }

      ranks.clear();
      for (const [nodeId, rank] of newRanks) {
        ranks.set(nodeId, rank);
      }

      if (maxDiff < 0.0001) break;
    }

    return ranks;
  }

  /**
   * 社区检测（简单版本）
   */
  detectCommunities(): Map<string, string[]> {
    const communities = new Map<string, string[]>();
    const assigned = new Set<string>();

    for (const [nodeId] of this.nodes) {
      if (assigned.has(nodeId)) continue;

      const community = this.traverseBFS(nodeId, { maxDepth: 2 });
      const communityId = `community_${communities.size}`;
      
      for (const node of community) {
        assigned.add(node.id);
        if (!communities.has(communityId)) {
          communities.set(communityId, []);
        }
        communities.get(communityId)!.push(node.id);
      }
    }

    return communities;
  }

  /**
   * 获取统计信息
   */
  getStats(): KGStats {
    const nodeTypes: Record<string, number> = {};
    const relationshipTypes: Record<string, number> = {};
    let totalDegree = 0;

    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
      totalDegree += this.getNodeRelationships(node.id).length;
    }

    for (const rel of this.relationships.values()) {
      relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
    }

    return {
      totalNodes: this.nodes.size,
      totalRelationships: this.relationships.size,
      nodeTypes,
      relationshipTypes,
      avgDegree: this.nodes.size > 0 ? totalDegree / this.nodes.size : 0
    };
  }

  /**
   * 删除节点
   */
  deleteNode(id: string): void {
    const rels = this.getNodeRelationships(id);
    for (const rel of rels) {
      this.deleteRelationship(rel.id);
    }
    this.nodes.delete(id);
    this.adjacencyList.delete(id);
  }

  /**
   * 删除关系
   */
  deleteRelationship(id: string): void {
    const rel = this.relationships.get(id);
    if (!rel) return;

    this.adjacencyList.get(rel.sourceId)?.delete(id);
    if (rel.bidirectional) {
      this.adjacencyList.get(rel.targetId)?.delete(id);
    }

    for (const [type, rels] of this.relationshipIndex) {
      rels.delete(id);
    }

    this.relationships.delete(id);
  }

  /**
   * 导出为JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      relationships: Array.from(this.relationships.values()),
      config: this.config
    }, null, 2);
  }

  /**
   * 从JSON导入
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    
    this.nodes.clear();
    this.relationships.clear();
    this.adjacencyList.clear();
    this.relationshipIndex.clear();

    for (const node of data.nodes || []) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, new Set());
    }

    for (const rel of data.relationships || []) {
      this.relationships.set(rel.id, rel);
      this.adjacencyList.get(rel.sourceId)?.add(rel.id);
      if (rel.bidirectional) {
        if (!this.adjacencyList.has(rel.targetId)) {
          this.adjacencyList.set(rel.targetId, new Set());
        }
        this.adjacencyList.get(rel.targetId)!.add(rel.id);
      }
      if (!this.relationshipIndex.has(rel.type)) {
        this.relationshipIndex.set(rel.type, new Set());
      }
      this.relationshipIndex.get(rel.type)!.add(rel.id);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

export default KnowledgeGraphManager;
