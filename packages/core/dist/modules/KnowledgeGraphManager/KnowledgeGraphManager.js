"use strict";
/**
 * Cloud Book - 知识图谱管理器 V3
 * 支持多种图数据库后端（Memory / Neo4j）
 * 真正的图遍历算法
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraphManager = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
class KnowledgeGraphManager {
    config;
    nodes = new Map();
    relationships = new Map();
    adjacencyList = new Map();
    relationshipIndex = new Map();
    llmProvider = null;
    embeddingProvider = null;
    neo4jDriver = null;
    isConnected = false;
    constructor(config) {
        this.config = {
            backend: 'memory',
            ...config
        };
    }
    setLLMProvider(provider) {
        this.llmProvider = provider;
    }
    setEmbeddingProvider(provider) {
        this.embeddingProvider = provider;
    }
    async connectNeo4j(config) {
        try {
            this.neo4jDriver = neo4j_driver_1.default.driver(config.uri, neo4j_driver_1.default.auth.basic(config.username, config.password), {
                maxConnectionPoolSize: 50,
                connectionAcquisitionTimeout: 30000
            });
            const session = this.neo4jDriver.session({
                database: config.database || 'neo4j'
            });
            await session.run('RETURN 1');
            await session.close();
            this.config.backend = 'neo4j';
            this.config.neo4j = config;
            this.isConnected = true;
            await this.initializeNeo4jSchema();
            return true;
        }
        catch (error) {
            console.error('Failed to connect to Neo4j:', error);
            this.neo4jDriver = null;
            this.isConnected = false;
            return false;
        }
    }
    async disconnectNeo4j() {
        if (this.neo4jDriver) {
            await this.neo4jDriver.close();
            this.neo4jDriver = null;
        }
        this.isConnected = false;
        this.config.backend = 'memory';
    }
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            backend: this.config.backend
        };
    }
    async initializeNeo4jSchema() {
        if (!this.isConnected || !this.neo4jDriver)
            return;
        const session = this.neo4jDriver.session();
        try {
            await session.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (n:KGNode) REQUIRE n.kg_id IS UNIQUE
      `);
            await session.run(`
        CREATE INDEX IF NOT EXISTS FOR (n:KGNode) ON (n.type)
      `);
            await session.run(`
        CREATE INDEX IF NOT EXISTS FOR (n:KGNode) ON (n.name)
      `);
        }
        catch (error) {
            console.warn('Schema initialization warning:', error);
        }
        finally {
            await session.close();
        }
    }
    async getSession() {
        if (!this.isConnected || !this.neo4jDriver)
            return null;
        return this.neo4jDriver.session({
            database: this.config.neo4j?.database || 'neo4j'
        });
    }
    mapNeo4jNode(node) {
        const props = node.properties;
        return {
            id: props.kg_id,
            type: props.type,
            name: props.name,
            properties: props.properties ? JSON.parse(props.properties) : {},
            embedding: props.embedding ? JSON.parse(props.embedding) : undefined,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt)
        };
    }
    mapNeo4jRelationship(rel, sourceId, targetId) {
        const props = rel.properties;
        return {
            id: props.kg_id,
            sourceId,
            targetId,
            type: props.type,
            properties: props.properties ? JSON.parse(props.properties) : {},
            weight: props.weight || 1,
            bidirectional: props.bidirectional || false,
            createdAt: new Date(props.createdAt)
        };
    }
    async addNode(type, name, properties = {}) {
        const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        let embedding;
        if (this.embeddingProvider) {
            try {
                embedding = await this.embeddingProvider.generateEmbedding(`${type}: ${name} ${JSON.stringify(properties)}`);
            }
            catch (e) {
                console.warn('Embedding generation failed:', e);
            }
        }
        const node = {
            id,
            type,
            name,
            properties,
            embedding,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.addNodeToNeo4j(node);
        }
        this.nodes.set(id, node);
        this.adjacencyList.set(id, new Set());
        return node;
    }
    async addNodeToNeo4j(node) {
        const session = await this.getSession();
        if (!session)
            throw new Error('Neo4j session not available');
        try {
            await session.run(`CREATE (n:KGNode {
          kg_id: $id,
          type: $type,
          name: $name,
          properties: $properties,
          embedding: $embedding,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })`, {
                id: node.id,
                type: node.type,
                name: node.name,
                properties: JSON.stringify(node.properties),
                embedding: node.embedding ? JSON.stringify(node.embedding) : null,
                createdAt: node.createdAt.toISOString(),
                updatedAt: node.updatedAt.toISOString()
            });
            return node;
        }
        finally {
            await session.close();
        }
    }
    async addRelationship(sourceId, targetId, type, properties = {}, weight = 1, bidirectional = false) {
        const source = this.findNode(sourceId);
        const target = this.findNode(targetId);
        if (!source || !target) {
            throw new Error('Source or target node not found');
        }
        const id = `rel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const relationship = {
            id,
            sourceId,
            targetId,
            type,
            properties,
            weight,
            bidirectional,
            createdAt: new Date()
        };
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.addRelationshipToNeo4j(relationship);
        }
        this.relationships.set(id, relationship);
        if (!this.adjacencyList.has(sourceId)) {
            this.adjacencyList.set(sourceId, new Set());
        }
        this.adjacencyList.get(sourceId).add(id);
        if (bidirectional) {
            if (!this.adjacencyList.has(targetId)) {
                this.adjacencyList.set(targetId, new Set());
            }
            this.adjacencyList.get(targetId).add(id);
        }
        if (!this.relationshipIndex.has(type)) {
            this.relationshipIndex.set(type, new Set());
        }
        this.relationshipIndex.get(type).add(id);
        return relationship;
    }
    async addRelationshipToNeo4j(rel) {
        const session = await this.getSession();
        if (!session)
            throw new Error('Neo4j session not available');
        try {
            await session.run(`MATCH (source:KGNode {kg_id: $sourceId})
         MATCH (target:KGNode {kg_id: $targetId})
         CREATE (source)-[r:KG_RELATIONSHIP {
           kg_id: $id,
           type: $type,
           properties: $properties,
           weight: $weight,
           bidirectional: $bidirectional,
           createdAt: datetime($createdAt)
         }]->(target)`, {
                id: rel.id,
                sourceId: rel.sourceId,
                targetId: rel.targetId,
                type: rel.type,
                properties: JSON.stringify(rel.properties),
                weight: rel.weight,
                bidirectional: rel.bidirectional,
                createdAt: rel.createdAt.toISOString()
            });
            if (rel.bidirectional) {
                await session.run(`MATCH (source:KGNode {kg_id: $sourceId})
           MATCH (target:KGNode {kg_id: $targetId})
           CREATE (target)-[r:KG_RELATIONSHIP {
             kg_id: $id_rev,
             type: $type,
             properties: $properties,
             weight: $weight,
             bidirectional: true,
             createdAt: datetime($createdAt)
           }]->(source)`, {
                    id_rev: `${rel.id}_rev`,
                    sourceId: rel.sourceId,
                    targetId: rel.targetId,
                    type: rel.type,
                    properties: JSON.stringify(rel.properties),
                    weight: rel.weight,
                    createdAt: rel.createdAt.toISOString()
                });
            }
            return rel;
        }
        finally {
            await session.close();
        }
    }
    async findNode(id) {
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.findNodeInNeo4j(id);
        }
        return this.nodes.get(id);
    }
    async findNodeInNeo4j(id) {
        const session = await this.getSession();
        if (!session)
            return undefined;
        try {
            const result = await session.run('MATCH (n:KGNode {kg_id: $id}) RETURN n', { id });
            const records = result.records;
            if (records.length > 0) {
                return this.mapNeo4jNode(records[0].get('n'));
            }
            return undefined;
        }
        finally {
            await session.close();
        }
    }
    async findNodesByProperty(type, property, value) {
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.findNodesByPropertyInNeo4j(type, property, value);
        }
        return Array.from(this.nodes.values()).filter(node => node.type === type && node.properties[property] === value);
    }
    async findNodesByPropertyInNeo4j(type, property, value) {
        const session = await this.getSession();
        if (!session)
            return [];
        try {
            const result = await session.run(`MATCH (n:KGNode)
         WHERE n.type = $type AND n.properties[$property] = $value
         RETURN n`, { type, property, value: String(value) });
            return result.records.map(record => this.mapNeo4jNode(record.get('n')));
        }
        finally {
            await session.close();
        }
    }
    async semanticSearch(query, type, limit = 10) {
        if (this.isConnected && this.config.backend === 'neo4j') {
            if (!this.embeddingProvider) {
                return await this.semanticSearchInNeo4j(query, type, limit);
            }
        }
        if (!this.embeddingProvider) {
            return Array.from(this.nodes.values())
                .filter(node => !type || node.type === type)
                .filter(node => node.name.includes(query) ||
                JSON.stringify(node.properties).includes(query))
                .slice(0, limit);
        }
        const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
        const candidates = Array.from(this.nodes.values())
            .filter(node => !type || node.type === type)
            .filter(node => node.embedding);
        const scored = candidates.map(node => ({
            node,
            score: this.cosineSimilarity(queryEmbedding, node.embedding)
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(s => s.node);
    }
    async semanticSearchInNeo4j(query, type, limit = 10) {
        const session = await this.getSession();
        if (!session)
            return [];
        try {
            let cypher = `
        MATCH (n:KGNode)
        WHERE n.name CONTAINS $query OR n.properties CONTAINS $query
      `;
            if (type) {
                cypher += ' AND n.type = $type';
            }
            cypher += ' RETURN n LIMIT toInteger($limit)';
            const result = await session.run(cypher, {
                query,
                type: type || null,
                limit
            });
            return result.records.map(record => this.mapNeo4jNode(record.get('n')));
        }
        finally {
            await session.close();
        }
    }
    async getNodeRelationships(nodeId) {
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.getNodeRelationshipsInNeo4j(nodeId);
        }
        const relIds = this.adjacencyList.get(nodeId);
        if (!relIds)
            return [];
        return Array.from(relIds)
            .map(id => this.relationships.get(id))
            .filter((rel) => rel !== undefined)
            .filter(rel => rel.sourceId === nodeId || rel.bidirectional);
    }
    async getNodeRelationshipsInNeo4j(nodeId) {
        const session = await this.getSession();
        if (!session)
            return [];
        try {
            const result = await session.run(`MATCH (n:KGNode {kg_id: $nodeId})-[r:KG_RELATIONSHIP]->(target:KGNode)
         RETURN r, target`, { nodeId });
            return result.records.map(record => {
                const rel = record.get('r');
                const target = record.get('target');
                return this.mapNeo4jRelationship(rel, nodeId, target.properties.kg_id);
            });
        }
        finally {
            await session.close();
        }
    }
    async getRelationship(sourceId, targetId) {
        if (this.isConnected && this.config.backend === 'neo4j') {
            return await this.getRelationshipInNeo4j(sourceId, targetId);
        }
        const relIds = this.adjacencyList.get(sourceId);
        if (!relIds)
            return undefined;
        for (const relId of relIds) {
            const rel = this.relationships.get(relId);
            if (rel && (rel.targetId === targetId || rel.bidirectional)) {
                return rel;
            }
        }
        return undefined;
    }
    async getRelationshipInNeo4j(sourceId, targetId) {
        const session = await this.getSession();
        if (!session)
            return undefined;
        try {
            const result = await session.run(`MATCH (source:KGNode {kg_id: $sourceId})-[r:KG_RELATIONSHIP]->(target:KGNode {kg_id: $targetId})
         RETURN r`, { sourceId, targetId });
            if (result.records.length > 0) {
                return this.mapNeo4jRelationship(result.records[0].get('r'), sourceId, targetId);
            }
            return undefined;
        }
        finally {
            await session.close();
        }
    }
    traverseBFS(startNodeId, options) {
        const visited = new Set();
        const queue = [{ id: startNodeId, depth: 0 }];
        const result = [];
        const maxDepth = options?.maxDepth ?? 10;
        const relTypes = options?.relationshipTypes;
        const direction = options?.direction ?? 'outgoing';
        while (queue.length > 0) {
            const { id, depth } = queue.shift();
            if (visited.has(id) || depth > maxDepth)
                continue;
            visited.add(id);
            const node = this.nodes.get(id);
            if (node)
                result.push(node);
            const rels = this.getNodeRelationshipsSync(id);
            for (const rel of rels) {
                if (relTypes && !relTypes.includes(rel.type))
                    continue;
                let nextId = null;
                if (direction === 'outgoing' && rel.sourceId === id) {
                    nextId = rel.targetId;
                }
                else if (direction === 'incoming' && rel.targetId === id) {
                    nextId = rel.sourceId;
                }
                else if (direction === 'both') {
                    nextId = rel.sourceId === id ? rel.targetId : rel.sourceId;
                }
                if (nextId && !visited.has(nextId)) {
                    queue.push({ id: nextId, depth: depth + 1 });
                }
            }
        }
        return result;
    }
    getNodeRelationshipsSync(nodeId) {
        const relIds = this.adjacencyList.get(nodeId);
        if (!relIds)
            return [];
        return Array.from(relIds)
            .map(id => this.relationships.get(id))
            .filter((rel) => rel !== undefined)
            .filter(rel => rel.sourceId === nodeId || rel.bidirectional);
    }
    traverseDFS(startNodeId, options) {
        const visited = new Set();
        const result = [];
        const maxDepth = options?.maxDepth ?? 10;
        const relTypes = options?.relationshipTypes;
        const direction = options?.direction ?? 'outgoing';
        const dfs = (nodeId, depth) => {
            if (visited.has(nodeId) || depth > maxDepth)
                return;
            visited.add(nodeId);
            const node = this.nodes.get(nodeId);
            if (node)
                result.push(node);
            const rels = this.getNodeRelationshipsSync(nodeId);
            for (const rel of rels) {
                if (relTypes && !relTypes.includes(rel.type))
                    continue;
                let nextId = null;
                if (direction === 'outgoing' && rel.sourceId === nodeId) {
                    nextId = rel.targetId;
                }
                else if (direction === 'incoming' && rel.targetId === nodeId) {
                    nextId = rel.sourceId;
                }
                else if (direction === 'both') {
                    nextId = rel.sourceId === nodeId ? rel.targetId : rel.sourceId;
                }
                if (nextId)
                    dfs(nextId, depth + 1);
            }
        };
        dfs(startNodeId, 0);
        return result;
    }
    async findShortestPath(startNodeId, endNodeId, options) {
        const relTypes = options?.relationshipTypes;
        const weightProp = options?.weightProperty ?? 'weight';
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        for (const node of this.nodes.keys()) {
            distances.set(node, node === startNodeId ? 0 : Infinity);
            previous.set(node, null);
            unvisited.add(node);
        }
        while (unvisited.size > 0) {
            let minDist = Infinity;
            let current = null;
            for (const nodeId of unvisited) {
                if (distances.get(nodeId) < minDist) {
                    minDist = distances.get(nodeId);
                    current = nodeId;
                }
            }
            if (current === null || minDist === Infinity)
                break;
            if (current === endNodeId)
                break;
            unvisited.delete(current);
            const rels = this.getNodeRelationshipsSync(current);
            for (const rel of rels) {
                if (relTypes && !relTypes.includes(rel.type))
                    continue;
                const nextId = rel.sourceId === current ? rel.targetId : rel.sourceId;
                if (!unvisited.has(nextId))
                    continue;
                const weight = rel.properties[weightProp] ?? rel.weight;
                const newDist = distances.get(current) + weight;
                if (newDist < distances.get(nextId)) {
                    distances.set(nextId, newDist);
                    previous.set(nextId, { nodeId: current, relId: rel.id });
                }
            }
        }
        if (distances.get(endNodeId) === Infinity)
            return null;
        const pathNodes = [];
        const pathRels = [];
        let current = endNodeId;
        while (current) {
            const node = this.nodes.get(current);
            if (node)
                pathNodes.unshift(node);
            const prev = previous.get(current);
            if (prev) {
                const rel = this.relationships.get(prev.relId);
                if (rel)
                    pathRels.unshift(rel);
                current = prev.nodeId;
            }
            else {
                current = null;
            }
        }
        return {
            nodes: pathNodes,
            relationships: pathRels,
            totalWeight: distances.get(endNodeId)
        };
    }
    findAllPaths(startNodeId, endNodeId, maxDepth = 5) {
        const paths = [];
        const dfs = (current, end, depth, visited, pathNodes, pathRels) => {
            if (depth > maxDepth)
                return;
            if (current === end) {
                paths.push({
                    nodes: [...pathNodes],
                    relationships: [...pathRels],
                    totalWeight: pathRels.reduce((sum, r) => sum + r.weight, 0)
                });
                return;
            }
            const rels = this.getNodeRelationshipsSync(current);
            for (const rel of rels) {
                const nextId = rel.sourceId === current ? rel.targetId : rel.sourceId;
                if (visited.has(nextId))
                    continue;
                visited.add(nextId);
                pathNodes.push(this.nodes.get(nextId));
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
    calculatePageRank(damping = 0.85, iterations = 100) {
        const ranks = new Map();
        const outLinks = new Map();
        for (const [nodeId] of this.nodes) {
            ranks.set(nodeId, 1);
            outLinks.set(nodeId, this.getNodeRelationshipsSync(nodeId).length || 1);
        }
        for (let i = 0; i < iterations; i++) {
            const newRanks = new Map();
            let maxDiff = 0;
            for (const [nodeId, rank] of ranks) {
                let sum = 0;
                const rels = this.getNodeRelationshipsSync(nodeId);
                for (const rel of rels) {
                    const sourceId = rel.sourceId === nodeId ? rel.targetId : rel.sourceId;
                    const sourceOutLinks = outLinks.get(sourceId) || 1;
                    sum += ranks.get(sourceId) / sourceOutLinks;
                }
                const newRank = (1 - damping) + damping * sum;
                newRanks.set(nodeId, newRank);
                maxDiff = Math.max(maxDiff, Math.abs(newRank - rank));
            }
            ranks.clear();
            for (const [nodeId, rank] of newRanks) {
                ranks.set(nodeId, rank);
            }
            if (maxDiff < 0.0001)
                break;
        }
        return ranks;
    }
    detectCommunities() {
        const communities = new Map();
        const assigned = new Set();
        for (const [nodeId] of this.nodes) {
            if (assigned.has(nodeId))
                continue;
            const community = this.traverseBFS(nodeId, { maxDepth: 2 });
            const communityId = `community_${communities.size}`;
            for (const node of community) {
                assigned.add(node.id);
                if (!communities.has(communityId)) {
                    communities.set(communityId, []);
                }
                communities.get(communityId).push(node.id);
            }
        }
        return communities;
    }
    getStats() {
        const nodeTypes = {};
        const relationshipTypes = {};
        let totalDegree = 0;
        for (const node of this.nodes.values()) {
            nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
            totalDegree += this.getNodeRelationshipsSync(node.id).length;
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
    deleteNode(id) {
        const rels = this.getNodeRelationshipsSync(id);
        for (const rel of rels) {
            this.deleteRelationship(rel.id);
        }
        this.nodes.delete(id);
        this.adjacencyList.delete(id);
    }
    deleteRelationship(id) {
        const rel = this.relationships.get(id);
        if (!rel)
            return;
        this.adjacencyList.get(rel.sourceId)?.delete(id);
        if (rel.bidirectional) {
            this.adjacencyList.get(rel.targetId)?.delete(id);
        }
        for (const [type, rels] of this.relationshipIndex) {
            rels.delete(id);
        }
        this.relationships.delete(id);
    }
    exportToJSON() {
        return JSON.stringify({
            nodes: Array.from(this.nodes.values()),
            relationships: Array.from(this.relationships.values()),
            config: this.config
        }, null, 2);
    }
    importFromJSON(json) {
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
                this.adjacencyList.get(rel.targetId).add(rel.id);
            }
            if (!this.relationshipIndex.has(rel.type)) {
                this.relationshipIndex.set(rel.type, new Set());
            }
            this.relationshipIndex.get(rel.type).add(rel.id);
        }
    }
    async syncToNeo4j() {
        if (!this.isConnected || !this.neo4jDriver) {
            throw new Error('Neo4j not connected');
        }
        const session = await this.getSession();
        if (!session)
            return;
        try {
            await session.run('MATCH (n) DETACH DELETE n');
            for (const node of this.nodes.values()) {
                await this.addNodeToNeo4j(node);
            }
            for (const rel of this.relationships.values()) {
                await this.addRelationshipToNeo4j(rel);
            }
        }
        finally {
            await session.close();
        }
    }
    async syncFromNeo4j() {
        if (!this.isConnected || !this.neo4jDriver) {
            throw new Error('Neo4j not connected');
        }
        const session = await this.getSession();
        if (!session)
            return;
        try {
            this.nodes.clear();
            this.relationships.clear();
            this.adjacencyList.clear();
            this.relationshipIndex.clear();
            const nodesResult = await session.run('MATCH (n:KGNode) RETURN n');
            for (const record of nodesResult.records) {
                const node = this.mapNeo4jNode(record.get('n'));
                this.nodes.set(node.id, node);
                this.adjacencyList.set(node.id, new Set());
            }
            const relsResult = await session.run('MATCH ()-[r:KG_RELATIONSHIP]->() RETURN r');
            for (const record of relsResult.records) {
                const rel = record.get('r');
                const sourceResult = await session.run('MATCH (n:KGNode) WHERE id(n) = $internalId RETURN n.kg_id as kg_id', { internalId: rel.start });
                const targetResult = await session.run('MATCH (n:KGNode) WHERE id(n) = $internalId RETURN n.kg_id as kg_id', { internalId: rel.end });
                if (sourceResult.records.length > 0 && targetResult.records.length > 0) {
                    const sourceId = sourceResult.records[0].get('kg_id');
                    const targetId = targetResult.records[0].get('kg_id');
                    const kgRel = this.mapNeo4jRelationship(rel, sourceId, targetId);
                    this.relationships.set(kgRel.id, kgRel);
                    this.adjacencyList.get(kgRel.sourceId)?.add(kgRel.id);
                    if (!this.relationshipIndex.has(kgRel.type)) {
                        this.relationshipIndex.set(kgRel.type, new Set());
                    }
                    this.relationshipIndex.get(kgRel.type).add(kgRel.id);
                }
            }
        }
        finally {
            await session.close();
        }
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
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
exports.KnowledgeGraphManager = KnowledgeGraphManager;
exports.default = KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.js.map