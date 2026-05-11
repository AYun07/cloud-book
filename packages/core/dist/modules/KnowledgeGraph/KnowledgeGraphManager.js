"use strict";
/**
 * 知识图谱管理器
 * 角色、地点、物品、势力关系图谱
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraphManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KnowledgeGraphManager {
    graphs = new Map();
    storagePath;
    constructor(storagePath = './data/knowledgegraph') {
        this.storagePath = storagePath;
    }
    async initialize(projectId) {
        this.graphs.set(projectId, {
            nodes: [],
            relations: []
        });
    }
    async addNode(projectId, node) {
        const graph = this.graphs.get(projectId) || { nodes: [], relations: [] };
        const newNode = {
            id: this.generateId(),
            ...node
        };
        graph.nodes.push(newNode);
        this.graphs.set(projectId, graph);
        await this.save(projectId);
        return newNode;
    }
    async addCharacterNode(projectId, character) {
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
    async addLocationNode(projectId, location) {
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
    async addItemNode(projectId, item) {
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
    async addFactionNode(projectId, faction) {
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
    async addRelation(projectId, source, target, type, properties) {
        const graph = this.graphs.get(projectId) || { nodes: [], relations: [] };
        const relation = {
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
    async updateNode(projectId, nodeId, updates) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return null;
        const nodeIndex = graph.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1)
            return null;
        graph.nodes[nodeIndex] = { ...graph.nodes[nodeIndex], ...updates };
        this.graphs.set(projectId, graph);
        await this.save(projectId);
        return graph.nodes[nodeIndex];
    }
    async deleteNode(projectId, nodeId) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return false;
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
    async getNode(projectId, nodeId) {
        return this.graphs.get(projectId)?.nodes.find(n => n.id === nodeId);
    }
    async getNodesByType(projectId, type) {
        return this.graphs.get(projectId)?.nodes.filter(n => n.type === type) || [];
    }
    async getRelations(projectId, nodeId) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return [];
        return graph.relations.filter(r => r.source === nodeId || r.target === nodeId);
    }
    async getRelationTypes(projectId) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return [];
        const types = new Set();
        for (const relation of graph.relations) {
            types.add(relation.type);
        }
        return Array.from(types);
    }
    async query(query) {
        const projectIds = Array.from(this.graphs.keys());
        const results = [];
        for (const projectId of projectIds) {
            const graph = this.graphs.get(projectId);
            if (!graph)
                continue;
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
    async findPath(projectId, from, to) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return null;
        const visited = new Set();
        const queue = [{ nodeId: from, path: [from] }];
        while (queue.length > 0) {
            const { nodeId, path } = queue.shift();
            if (nodeId === to) {
                const nodes = path.map(id => graph.nodes.find(n => n.id === id));
                const relations = [];
                for (let i = 0; i < path.length - 1; i++) {
                    const rel = graph.relations.find(r => r.source === path[i] && r.target === path[i + 1]);
                    if (rel)
                        relations.push(rel);
                }
                return { nodes, relations, path };
            }
            if (visited.has(nodeId))
                continue;
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
    getConnectedNodes(graph, fromNode, depth) {
        const visited = new Set();
        const result = [];
        const queue = [{ nodeId: fromNode, currentDepth: 0 }];
        while (queue.length > 0) {
            const { nodeId, currentDepth } = queue.shift();
            if (visited.has(nodeId))
                continue;
            visited.add(nodeId);
            const node = graph.nodes.find(n => n.id === nodeId);
            if (node && currentDepth > 0) {
                result.push(node);
            }
            if (currentDepth >= depth)
                continue;
            const connected = graph.relations.filter(r => r.source === nodeId || r.target === nodeId);
            for (const rel of connected) {
                const nextNode = rel.source === nodeId ? rel.target : rel.source;
                if (!visited.has(nextNode)) {
                    queue.push({ nodeId: nextNode, currentDepth: currentDepth + 1 });
                }
            }
        }
        return result;
    }
    async getCharacterNetwork(projectId, characterId, depth = 2) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return { characters: [], relations: [] };
        const connectedNodes = this.getConnectedNodes(graph, characterId, depth);
        const characters = connectedNodes.filter(n => n.type === 'character');
        const nodeIds = new Set([characterId, ...characters.map(n => n.id)]);
        const relations = graph.relations.filter(r => nodeIds.has(r.source) && nodeIds.has(r.target));
        return { characters, relations };
    }
    async getFactionHierarchy(projectId, factionId) {
        const graph = this.graphs.get(projectId);
        if (!graph) {
            return { leader: null, members: [], subFactions: [], allies: [], enemies: [] };
        }
        const faction = graph.nodes.find(n => n.id === factionId);
        const memberRelations = graph.relations.filter(r => (r.source === factionId || r.target === factionId) && r.type === 'member_of');
        const allies = graph.relations.filter(r => (r.source === factionId || r.target === factionId) && r.type === 'ally');
        const enemies = graph.relations.filter(r => (r.source === factionId || r.target === factionId) && r.type === 'enemy');
        const members = memberRelations
            .map(r => r.source === factionId ? r.target : r.source)
            .map(id => graph.nodes.find(n => n.id === id))
            .filter((n) => n !== undefined && n.type === 'character');
        const subFactions = memberRelations
            .map(r => r.source === factionId ? r.target : r.source)
            .map(id => graph.nodes.find(n => n.id === id))
            .filter((n) => n !== undefined && n.type === 'faction');
        return {
            leader: faction || null,
            members,
            subFactions,
            allies,
            enemies
        };
    }
    async exportGraph(projectId) {
        return this.graphs.get(projectId) || { nodes: [], relations: [] };
    }
    async importGraph(projectId, graph) {
        this.graphs.set(projectId, graph);
        await this.save(projectId);
    }
    async save(projectId) {
        const dir = path.join(this.storagePath, projectId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const graph = this.graphs.get(projectId);
        if (graph) {
            fs.writeFileSync(path.join(dir, 'graph.json'), JSON.stringify(graph, null, 2), 'utf-8');
        }
    }
    async load(projectId) {
        const filePath = path.join(this.storagePath, projectId, 'graph.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            this.graphs.set(projectId, data);
        }
        else {
            await this.initialize(projectId);
        }
    }
    /**
     * 从项目自动构建知识图谱
     */
    async buildFromProject(projectId, characters, locations, factions, chapters) {
        let nodeCount = 0;
        let relationCount = 0;
        for (const char of characters) {
            await this.addCharacterNode(projectId, char);
            nodeCount++;
        }
        for (const loc of locations) {
            await this.addLocationNode(projectId, loc);
            nodeCount++;
        }
        for (const faction of factions) {
            await this.addFactionNode(projectId, faction);
            nodeCount++;
        }
        for (const char1 of characters) {
            for (const char2 of characters) {
                if (char1.id !== char2.id && char1.relationships?.some(r => r.targetId === char2.id)) {
                    const rel = char1.relationships?.find(r => r.targetId === char2.id);
                    if (rel) {
                        await this.addRelation(projectId, char1.id, char2.id, this.mapRelationType(rel.type), { description: rel.description });
                        relationCount++;
                    }
                }
            }
        }
        return { nodes: nodeCount, relations: relationCount };
    }
    mapRelationType(type) {
        const typeMap = {
            'friend': 'friend',
            'enemy': 'enemy',
            'family': 'family',
            'romantic': 'romantic',
            'mentor': 'mentor',
            'rival': 'rival',
            'colleague': 'colleague'
        };
        return typeMap[type] || 'related';
    }
    /**
     * 生成可视化数据
     */
    async generateVisualizationData(projectId) {
        const graph = this.graphs.get(projectId);
        if (!graph) {
            return { nodes: [], edges: [] };
        }
        const typeColors = {
            character: '#4A90E2',
            location: '#50C878',
            item: '#FFD700',
            faction: '#E74C3C'
        };
        const typeSizes = {
            character: 30,
            location: 25,
            item: 15,
            faction: 35
        };
        const nodes = graph.nodes.map((node, index) => ({
            id: node.id,
            label: node.name,
            type: node.type,
            size: typeSizes[node.type] || 20,
            color: typeColors[node.type] || '#999',
            x: 100 + (index % 5) * 150,
            y: 100 + Math.floor(index / 5) * 150
        }));
        const edges = graph.relations.map(rel => ({
            source: rel.source,
            target: rel.target,
            label: rel.type,
            type: rel.type
        }));
        return { nodes, edges };
    }
    /**
     * 检测图谱一致性
     */
    async checkConsistency(projectId) {
        const graph = this.graphs.get(projectId);
        if (!graph) {
            return { orphanedNodes: [], duplicateRelations: [], circularDependencies: [] };
        }
        const connectedNodes = new Set();
        for (const rel of graph.relations) {
            connectedNodes.add(rel.source);
            connectedNodes.add(rel.target);
        }
        const orphanedNodes = graph.nodes.filter(n => !connectedNodes.has(n.id));
        const relationCounts = new Map();
        for (const rel of graph.relations) {
            const key = [rel.source, rel.target].sort().join('-');
            relationCounts.set(key, (relationCounts.get(key) || 0) + 1);
        }
        const duplicateRelations = [];
        for (const [key, count] of relationCounts) {
            if (count > 1) {
                const [source, target] = key.split('-');
                duplicateRelations.push({ source, target, count });
            }
        }
        const circularDependencies = [];
        for (const node of graph.nodes) {
            const cycle = this.detectCycle(graph, node.id);
            if (cycle.length > 0) {
                circularDependencies.push(cycle);
            }
        }
        return { orphanedNodes, duplicateRelations, circularDependencies };
    }
    detectCycle(graph, startNode) {
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const dfs = (nodeId) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const outgoing = graph.relations.filter(r => r.source === nodeId);
            for (const rel of outgoing) {
                if (!visited.has(rel.target)) {
                    const cycle = dfs(rel.target);
                    if (cycle)
                        return cycle;
                }
                else if (recursionStack.has(rel.target)) {
                    const cycleStart = path.indexOf(rel.target);
                    return [...path.slice(cycleStart), rel.target];
                }
            }
            path.pop();
            recursionStack.delete(nodeId);
            return null;
        };
        return dfs(startNode) || [];
    }
    /**
     * 导出图谱为不同格式
     */
    exportAs(projectId, format) {
        const graph = this.graphs.get(projectId);
        if (!graph)
            return '';
        switch (format) {
            case 'json':
                return JSON.stringify(graph, null, 2);
            case 'cypher':
                return this.exportAsCypher(graph);
            case 'graphml':
                return this.exportAsGraphML(graph);
            default:
                return JSON.stringify(graph);
        }
    }
    exportAsCypher(graph) {
        const statements = [];
        for (const node of graph.nodes) {
            const labels = `:${node.type}`;
            const props = JSON.stringify(node.properties || {}).replace(/"/g, "'");
            statements.push(`CREATE (n${labels} {id: '${node.id}', name: '${node.name}', ...${props}})`);
        }
        for (const rel of graph.relations) {
            statements.push(`MATCH (a {id: '${rel.source}'}), (b {id: '${rel.target}'}) ` +
                `CREATE (a)-[:${rel.type.toUpperCase()} ${JSON.stringify(rel.properties || {})}]->(b)`);
        }
        return statements.join('\n');
    }
    exportAsGraphML(graph) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
        xml += '  <graph id="G" edgedefault="directed">\n';
        for (const node of graph.nodes) {
            xml += `    <node id="${node.id}"><data key="name">${node.name}</data><data key="type">${node.type}</data></node>\n`;
        }
        for (const rel of graph.relations) {
            xml += `    <edge source="${rel.source}" target="${rel.target}" label="${rel.type}"/>\n`;
        }
        xml += '  </graph>\n</graphml>';
        return xml;
    }
    /**
     * 导入图谱
     */
    async importFrom(projectId, data, format) {
        let graph;
        switch (format) {
            case 'json':
                graph = JSON.parse(data);
                break;
            case 'cypher':
                graph = this.parseCypher(data);
                break;
            case 'graphml':
                graph = this.parseGraphML(data);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        await this.importGraph(projectId, graph);
    }
    parseCypher(cypher) {
        const graph = { nodes: [], relations: [] };
        const nodeMap = new Map();
        const createMatches = cypher.match(/CREATE\s*\([^)]+\)/g) || [];
        for (const match of createMatches) {
            const nodeMatch = match.match(/\((\w+)\s*(:\w+)?\s*\{([^}]*)\}\)/);
            if (nodeMatch) {
                const [, id, labels, propsStr] = nodeMatch;
                const type = labels?.replace(':', '') || 'unknown';
                const props = this.parseProperties(propsStr);
                const node = {
                    id,
                    type: type,
                    name: props.name || id,
                    properties: props
                };
                graph.nodes.push(node);
                nodeMap.set(id, node);
            }
        }
        const matchEdges = cypher.match(/MATCH\s*\([^)]+\),\s*\([^)]+\)\s*CREATE[^;]+/g) || [];
        for (const match of matchEdges) {
            const nodeMatches = match.match(/MATCH\s*\([^)]+\)/g);
            const createMatch = match.match(/CREATE\s*\([^)]+\)/);
            if (nodeMatches && createMatch) {
                const sourceMatch = nodeMatches[0].match(/id:\s*'([^']+)'/);
                const targetMatch = nodeMatches[1]?.match(/id:\s*'([^']+)'/);
                const relMatch = createMatch[0].match(/\[(\w+)/);
                if (sourceMatch && targetMatch && relMatch) {
                    graph.relations.push({
                        id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        source: sourceMatch[1],
                        target: targetMatch[1],
                        type: relMatch[1]
                    });
                }
            }
        }
        return graph;
    }
    parseProperties(propsStr) {
        const props = {};
        const matches = propsStr.matchAll(/(\w+):\s*'([^']*)'/g);
        for (const match of matches) {
            props[match[1]] = match[2];
        }
        return props;
    }
    parseGraphML(xml) {
        const graph = { nodes: [], relations: [] };
        const nodeMatches = xml.matchAll(/<node id="([^"]+)">.*?<data key="name">([^<]+)<\/data>.*?<data key="type">([^<]+)<\/data>.*?<\/node>/gs);
        for (const match of nodeMatches) {
            graph.nodes.push({
                id: match[1],
                type: match[3],
                name: match[2],
                properties: {}
            });
        }
        const edgeMatches = xml.matchAll(/<edge source="([^"]+)" target="([^"]+)" label="([^"]+)"/g);
        for (const match of edgeMatches) {
            graph.relations.push({
                id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                source: match[1],
                target: match[2],
                type: match[3]
            });
        }
        return graph;
    }
    generateId() {
        return `kg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.KnowledgeGraphManager = KnowledgeGraphManager;
exports.default = KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.js.map