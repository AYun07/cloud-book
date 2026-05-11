/**
 * Mind Map Generator - 思维导图模块
 * 生成可视化的思维导图
 */

import { MindMapNode, NovelProject, Character, Chapter } from '../../types';

export interface MindMapConfig {
  direction: 'LR' | 'RL' | 'TB' | 'BT';
  nodeSize?: { width: number; height: number };
  colors?: Record<string, string>;
  showIcons?: boolean;
}

export interface MindMapData {
  root: MindMapNode;
  nodes: MindMapNode[];
  connections: { from: string; to: string }[];
}

export class MindMapGenerator {
  private config: MindMapConfig;

  constructor(config?: MindMapConfig) {
    this.config = {
      direction: 'LR',
      nodeSize: { width: 150, height: 40 },
      showIcons: true,
      ...config
    };
  }

  async generateProjectMindMap(project: NovelProject): Promise<MindMapData> {
    const root: MindMapNode = {
      id: 'root',
      text: project.title,
      children: []
    };

    const nodes: MindMapNode[] = [root];
    const connections: { from: string; to: string }[] = [];

    const worldNode = this.createNode('world', '世界观', root.id);
    root.children!.push(worldNode);
    nodes.push(worldNode);
    connections.push({ from: root.id, to: worldNode.id });

    if (project.worldSetting) {
      const worldChildren = this.generateWorldChildren(project.worldSetting, worldNode.id);
      nodes.push(...worldChildren);
      connections.push(...worldChildren.map(c => ({ from: worldNode.id, to: c.id })));
    }

    const characterNode = this.createNode('characters', `角色 (${project.characters?.length || 0})`, root.id);
    root.children!.push(characterNode);
    nodes.push(characterNode);
    connections.push({ from: root.id, to: characterNode.id });

    if (project.characters && project.characters.length > 0) {
      const characterChildren = this.generateCharacterChildren(project.characters, characterNode.id);
      nodes.push(...characterChildren);
      connections.push(...characterChildren.map(c => ({ from: characterNode.id, to: c.id })));
    }

    const plotNode = this.createNode('plot', '情节线', root.id);
    root.children!.push(plotNode);
    nodes.push(plotNode);
    connections.push({ from: root.id, to: plotNode.id });

    if (project.chapters && project.chapters.length > 0) {
      const plotChildren = this.generatePlotChildren(project.chapters, plotNode.id);
      nodes.push(...plotChildren);
      connections.push(...plotChildren.map(c => ({ from: plotNode.id, to: c.id })));
    }

    const themeNode = this.createNode('theme', '主题', root.id);
    root.children!.push(themeNode);
    nodes.push(themeNode);
    connections.push({ from: root.id, to: themeNode.id });

    return { root, nodes, connections };
  }

  async generateCharacterRelationshipMap(
    characters: Character[]
  ): Promise<MindMapData> {
    const root: MindMapNode = {
      id: 'root',
      text: '角色关系图',
      children: []
    };

    const nodes: MindMapNode[] = [root];
    const connections: { from: string; to: string }[] = [];

    for (const character of characters) {
      const charNode = this.createNode('character', character.name, root.id);
      root.children!.push(charNode);
      nodes.push(charNode);
      connections.push({ from: root.id, to: charNode.id });

      if (character.relationships && character.relationships.length > 0) {
        for (const rel of character.relationships) {
          const relChar = characters.find(c => c.id === rel.targetId);
          if (relChar) {
            const relNode = this.createNode('relationship', `${rel.type}: ${relChar.name}`, charNode.id);
            charNode.children = charNode.children || [];
            charNode.children.push(relNode);
            nodes.push(relNode);
            connections.push({ from: charNode.id, to: relNode.id });
          }
        }
      }
    }

    return { root, nodes, connections };
  }

  async generateChapterOutlineMap(
    chapters: Chapter[]
  ): Promise<MindMapData> {
    const root: MindMapNode = {
      id: 'root',
      text: '章节大纲',
      children: []
    };

    const nodes: MindMapNode[] = [root];
    const connections: { from: string; to: string }[] = [];

    const actSize = Math.ceil(chapters.length / 3);
    const acts = [
      { name: '第一幕', chapters: chapters.slice(0, actSize) },
      { name: '第二幕', chapters: chapters.slice(actSize, actSize * 2) },
      { name: '第三幕', chapters: chapters.slice(actSize * 2) }
    ];

    for (const act of acts) {
      if (act.chapters.length === 0) continue;

      const actNode = this.createNode('act', act.name, root.id);
      root.children!.push(actNode);
      nodes.push(actNode);
      connections.push({ from: root.id, to: actNode.id });

      for (const chapter of act.chapters) {
        const chapterNode = this.createNode(
          'chapter',
          `第${chapter.number}章: ${chapter.title}`,
          actNode.id
        );
        actNode.children = actNode.children || [];
        actNode.children.push(chapterNode);
        nodes.push(chapterNode);
        connections.push({ from: actNode.id, to: chapterNode.id });
      }
    }

    return { root, nodes, connections };
  }

  async generateWorldSettingMap(
    worldSetting: NovelProject['worldSetting']
  ): Promise<MindMapData> {
    const root: MindMapNode = {
      id: 'root',
      text: worldSetting?.name || '世界观',
      children: []
    };

    const nodes: MindMapNode[] = [root];
    const connections: { from: string; to: string }[] = [];

    if (worldSetting?.powerSystem) {
      const powerNode = this.createNode('power', `力量体系: ${worldSetting.powerSystem}`, root.id);
      root.children!.push(powerNode);
      nodes.push(powerNode);
      connections.push({ from: root.id, to: powerNode.id });
    }

    if (worldSetting?.locations && worldSetting.locations.length > 0) {
      const locationNode = this.createNode(
        'locations',
        `地点 (${worldSetting.locations.length})`,
        root.id
      );
      root.children!.push(locationNode);
      nodes.push(locationNode);
      connections.push({ from: root.id, to: locationNode.id });

      for (const location of worldSetting.locations.slice(0, 10)) {
        const locChild = this.createNode('location', location.name, locationNode.id);
        locationNode.children = locationNode.children || [];
        locationNode.children.push(locChild);
        nodes.push(locChild);
        connections.push({ from: locationNode.id, to: locChild.id });
      }
    }

    if (worldSetting?.factions && worldSetting.factions.length > 0) {
      const factionNode = this.createNode(
        'factions',
        `势力 (${worldSetting.factions.length})`,
        root.id
      );
      root.children!.push(factionNode);
      nodes.push(factionNode);
      connections.push({ from: root.id, to: factionNode.id });

      for (const faction of worldSetting.factions.slice(0, 10)) {
        const facChild = this.createNode('faction', faction.name, factionNode.id);
        factionNode.children = factionNode.children || [];
        factionNode.children.push(facChild);
        nodes.push(facChild);
        connections.push({ from: factionNode.id, to: facChild.id });
      }
    }

    return { root, nodes, connections };
  }

  generateMermaidDiagram(mindMapData: MindMapData): string {
    let mermaid = 'mindmap\n';

    const traverse = (node: MindMapNode, indent: number = 0): void => {
      const spaces = '  '.repeat(indent);
      mermaid += `${spaces}  ${node.text}\n`;
      
      if (node.children) {
        for (const child of node.children) {
          traverse(child, indent + 1);
        }
      }
    };

    traverse(mindMapData.root);
    return mermaid;
  }

  generateHTML(mindMapData: MindMapData): string {
    const nodesJson = JSON.stringify(mindMapData.nodes);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>思维导图</title>
  <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@0.14"></script>
</head>
<body>
  <script type="text/template">
${this.generateMarkdown(mindMapData)}
  </script>
</body>
</html>`;
  }

  generateMarkdown(mindMapData: MindMapData): string {
    let md = '';

    const traverse = (node: MindMapNode, level: number = 0): void => {
      const prefix = '#'.repeat(Math.min(level + 1, 6));
      md += `${prefix} ${node.text}\n\n`;
      
      if (node.children) {
        for (const child of node.children) {
          traverse(child, level + 1);
        }
      }
    };

    traverse(mindMapData.root);
    return md;
  }

  private createNode(type: string, text: string, parentId: string): MindMapNode {
    return {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      children: []
    };
  }

  private generateWorldChildren(
    worldSetting: NonNullable<NovelProject['worldSetting']>,
    parentId: string
  ): MindMapNode[] {
    const nodes: MindMapNode[] = [];

    if (worldSetting.powerSystem) {
      nodes.push(this.createNode('power', worldSetting.powerSystem, parentId));
    }

    if (worldSetting.rules && worldSetting.rules.length > 0) {
      const rulesNode = this.createNode('rules', '规则', parentId);
      for (const rule of worldSetting.rules.slice(0, 5)) {
        const ruleChild = this.createNode('rule', rule, rulesNode.id);
        rulesNode.children = rulesNode.children || [];
        rulesNode.children.push(ruleChild);
        nodes.push(ruleChild);
      }
      nodes.push(rulesNode);
    }

    return nodes;
  }

  private generateCharacterChildren(
    characters: Character[],
    parentId: string
  ): MindMapNode[] {
    return characters.slice(0, 10).map(char => {
      const node = this.createNode('character', char.name, parentId);
      
      if (char.personality) {
        const personalityNode = this.createNode('personality', char.personality, node.id);
        node.children = node.children || [];
        node.children.push(personalityNode);
      }

      if (char.goals && char.goals.length > 0) {
        const goalNode = this.createNode('goals', '目标', node.id);
        for (const goal of char.goals.slice(0, 3)) {
          const goalChild = this.createNode('goal', goal, goalNode.id);
          goalNode.children = goalNode.children || [];
          goalNode.children.push(goalChild);
        }
        node.children = node.children || [];
        node.children.push(goalNode);
      }

      return node;
    });
  }

  private generatePlotChildren(
    chapters: Chapter[],
    parentId: string
  ): MindMapNode[] {
    const importantChapters = chapters.filter((c, i) => 
      i === 0 || i === chapters.length - 1 || 
      (c.hooks && c.hooks.length > 0) ||
      c.summary?.includes('高潮') ||
      c.summary?.includes('转折')
    ).slice(0, 15);

    return importantChapters.map(chapter => {
      const node = this.createNode(
        'chapter',
        `${chapter.title}`,
        parentId
      );
      
      if (chapter.summary) {
        const summaryNode = this.createNode('summary', chapter.summary.slice(0, 50), node.id);
        node.children = node.children || [];
        node.children.push(summaryNode);
      }

      return node;
    });
  }
}

export default MindMapGenerator;
