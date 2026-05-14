import React, { useState, useEffect, useCallback } from 'react';
import { useCloudBook } from '../context/CloudBookContext';

interface GraphNode {
  id: string;
  type: 'character' | 'location' | 'item' | 'event' | 'faction' | 'concept';
  name: string;
  x: number;
  y: number;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
}

const typeColors: Record<string, string> = {
  character: '#3B82F6',
  location: '#10B981',
  item: '#F59E0B',
  event: '#EF4444',
  faction: '#8B5CF6',
  concept: '#EC4899'
};

const typeLabels: Record<string, string> = {
  character: '角色',
  location: '地点',
  item: '物品',
  event: '事件',
  faction: '势力',
  concept: '概念'
};

export default function GraphPage() {
  const { cloudBook } = useCloudBook();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'force' | 'hierarchy' | 'circular'>('force');
  const [isLoading, setIsLoading] = useState(false);

  const loadGraphData = useCallback(async () => {
    if (!cloudBook) return;
    
    setIsLoading(true);
    try {
      const stats = await cloudBook.knowledgeGraphManager.getStats();
      console.log('Graph stats:', stats);
      
      const mockNodes: GraphNode[] = [
        { id: 'char_1', type: 'character', name: '林青云', x: 400, y: 200 },
        { id: 'char_2', type: 'character', name: '苏雪', x: 200, y: 300 },
        { id: 'char_3', type: 'character', name: '墨渊', x: 600, y: 300 },
        { id: 'faction_1', type: 'faction', name: '青云宗', x: 400, y: 80 },
        { id: 'faction_2', type: 'faction', name: '幽冥谷', x: 400, y: 450 },
        { id: 'loc_1', type: 'location', name: '青云山', x: 150, y: 150 },
        { id: 'loc_2', type: 'location', name: '迷雾森林', x: 650, y: 150 },
        { id: 'item_1', type: 'item', name: '青云剑', x: 250, y: 100 },
        { id: 'item_2', type: 'item', name: '幽冥珠', x: 550, y: 400 },
        { id: 'concept_1', type: 'concept', name: '剑道', x: 100, y: 400 },
        { id: 'concept_2', type: 'concept', name: '魔道', x: 700, y: 200 }
      ];

      const mockLinks: GraphLink[] = [
        { id: 'rel_1', source: 'char_1', target: 'faction_1', type: 'member_of', weight: 5 },
        { id: 'rel_2', source: 'char_1', target: 'char_2', type: 'friend', weight: 4 },
        { id: 'rel_3', source: 'char_1', target: 'char_3', type: 'rival', weight: 3 },
        { id: 'rel_4', source: 'char_1', target: 'item_1', type: 'wields', weight: 5 },
        { id: 'rel_5', source: 'char_1', target: 'loc_1', type: 'from', weight: 4 },
        { id: 'rel_6', source: 'char_2', target: 'faction_1', type: 'member_of', weight: 4 },
        { id: 'rel_7', source: 'char_3', target: 'faction_2', type: 'leader', weight: 5 },
        { id: 'rel_8', source: 'char_3', target: 'item_2', type: 'possesses', weight: 4 },
        { id: 'rel_9', source: 'char_3', target: 'loc_2', type: 'resides', weight: 4 },
        { id: 'rel_10', source: 'faction_1', target: 'faction_2', type: 'enemy', weight: 3 },
        { id: 'rel_11', source: 'char_1', target: 'concept_1', type: 'practices', weight: 5 },
        { id: 'rel_12', source: 'char_3', target: 'concept_2', type: 'practices', weight: 5 },
        { id: 'rel_13', source: 'faction_1', target: 'loc_1', type: 'located_at', weight: 5 },
        { id: 'rel_14', source: 'faction_2', target: 'loc_2', type: 'located_at', weight: 5 }
      ];

      setNodes(mockNodes);
      setLinks(mockLinks);
    } catch (error) {
      console.error('Failed to load graph data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cloudBook]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadGraphData();
      return;
    }
    
    const filtered = nodes.filter(node => 
      node.name.includes(searchQuery) || node.type.includes(searchQuery.toLowerCase())
    );
    setNodes(filtered);
  };

  const handleAddNode = async () => {
    if (!cloudBook) return;
    
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'character' as const,
      name: '新角色',
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200
    };
    
    try {
      await cloudBook.knowledgeGraphManager.addNode('character', '新角色', { description: '新添加的角色' });
      setNodes(prev => [...prev, newNode]);
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const renderForceLayout = () => {
    return (
      <svg width="100%" height="500" className="bg-gray-50 rounded-lg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
          </marker>
        </defs>
        
        {links.map(link => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return null;
          
          return (
            <g key={link.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#9CA3AF"
                strokeWidth={Math.max(1, link.weight / 2)}
                markerEnd="url(#arrowhead)"
                className="transition-all duration-200 hover:stroke-blue-400"
              />
              <text
                x={(source.x + target.x) / 2}
                y={(source.y + target.y) / 2 - 5}
                fontSize="10"
                fill="#6B7280"
                textAnchor="middle"
              >
                {link.type.replace('_', ' ')}
              </text>
            </g>
          );
        })}
        
        {nodes.map(node => (
          <g
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={selectedNode === node.id ? 28 : 22}
              fill={typeColors[node.type]}
              stroke={selectedNode === node.id ? '#1F2937' : '#FFFFFF'}
              strokeWidth={selectedNode === node.id ? 3 : 2}
              className="transition-all duration-200 hover:opacity-80"
            />
            <text
              x={node.x}
              y={node.y - 35}
              fontSize="11"
              fill="#1F2937"
              textAnchor="middle"
              fontWeight="600"
            >
              {node.name}
            </text>
            <text
              x={node.x}
              y={node.y + 38}
              fontSize="9"
              fill="#6B7280"
              textAnchor="middle"
            >
              {typeLabels[node.type]}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderCircularLayout = () => {
    const centerX = 400;
    const centerY = 250;
    const radius = 180;
    
    const positionedNodes = nodes.map((node, index) => ({
      ...node,
      x: centerX + radius * Math.cos((index / nodes.length) * 2 * Math.PI),
      y: centerY + radius * Math.sin((index / nodes.length) * 2 * Math.PI)
    }));

    return (
      <svg width="100%" height="500" className="bg-gray-50 rounded-lg">
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#E5E7EB" strokeDasharray="5,5" />
        {links.map(link => {
          const source = positionedNodes.find(n => n.id === link.source);
          const target = positionedNodes.find(n => n.id === link.target);
          if (!source || !target) return null;
          
          return (
            <line
              key={link.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#9CA3AF"
              strokeWidth={Math.max(1, link.weight / 3)}
              className="transition-all duration-200"
            />
          );
        })}
        
        {positionedNodes.map(node => (
          <g
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={selectedNode === node.id ? 28 : 22}
              fill={typeColors[node.type]}
              stroke={selectedNode === node.id ? '#1F2937' : '#FFFFFF'}
              strokeWidth={selectedNode === node.id ? 3 : 2}
              className="transition-all duration-200"
            />
            <text
              x={node.x}
              y={node.y + 38}
              fontSize="10"
              fill="#1F2937"
              textAnchor="middle"
              fontWeight="500"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识图谱</h1>
          <p className="text-gray-500 mt-1">可视化展示小说世界中的人物、地点、物品和关系</p>
        </div>
        <button
          onClick={handleAddNode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加节点
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            搜索
          </button>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['force', 'hierarchy', 'circular'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode === 'force' ? '力导向' : mode === 'hierarchy' ? '层级' : '环形'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(typeLabels).map(([type, label]) => (
          <span key={type} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: typeColors[type] }}
            />
            {label}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === 'circular' ? renderCircularLayout() : renderForceLayout()}
        </div>
      )}

      {selectedNode && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">节点详情</h3>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">名称：</span>{node.name}</p>
                <p><span className="text-gray-500">类型：</span>{typeLabels[node.type]}</p>
                <p><span className="text-gray-500">ID：</span>{node.id}</p>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-600 text-2xl font-bold">{nodes.length}</p>
          <p className="text-blue-600 text-sm">节点总数</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-600 text-2xl font-bold">{links.length}</p>
          <p className="text-green-600 text-sm">关系数量</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-purple-600 text-2xl font-bold">{Object.keys(typeColors).length}</p>
          <p className="text-purple-600 text-sm">节点类型</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-orange-600 text-2xl font-bold">
            {nodes.length > 0 ? Math.round(links.length / nodes.length * 10) / 10 : 0}
          </p>
          <p className="text-orange-600 text-sm">平均度数</p>
        </div>
      </div>
    </div>
  );
}