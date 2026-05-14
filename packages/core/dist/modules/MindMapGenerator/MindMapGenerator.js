"use strict";
/**
 * Mind Map Generator - 思维导图模块
 * 生成可视化的思维导图，支持内置 SVG 渲染
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindMapGenerator = void 0;
class MindMapGenerator {
    config;
    defaultColors = {
        root: '#6366f1',
        world: '#10b981',
        character: '#f59e0b',
        plot: '#ef4444',
        theme: '#8b5cf6',
        default: '#64748b',
        hover: '#3b82f6',
        selected: '#f97316',
        line: '#94a3b8',
        background: '#ffffff'
    };
    constructor(config) {
        this.config = {
            direction: 'LR',
            nodeSize: { width: 150, height: 40 },
            nodePadding: 12,
            levelGap: 80,
            siblingGap: 20,
            showIcons: true,
            colors: this.defaultColors,
            ...config
        };
    }
    async generateProjectMindMap(project) {
        const root = {
            id: 'root',
            text: project.title,
            children: []
        };
        const nodes = [root];
        const connections = [];
        const worldNode = this.createNode('world', '世界观', root.id);
        root.children.push(worldNode);
        nodes.push(worldNode);
        connections.push({ from: root.id, to: worldNode.id });
        if (project.worldSetting) {
            const worldChildren = this.generateWorldChildren(project.worldSetting, worldNode.id);
            nodes.push(...worldChildren);
            connections.push(...worldChildren.map(c => ({ from: worldNode.id, to: c.id })));
        }
        const characterNode = this.createNode('character', `角色 (${project.characters?.length || 0})`, root.id);
        root.children.push(characterNode);
        nodes.push(characterNode);
        connections.push({ from: root.id, to: characterNode.id });
        if (project.characters && project.characters.length > 0) {
            const characterChildren = this.generateCharacterChildren(project.characters, characterNode.id);
            nodes.push(...characterChildren);
            connections.push(...characterChildren.map(c => ({ from: characterNode.id, to: c.id })));
        }
        const plotNode = this.createNode('plot', '情节线', root.id);
        root.children.push(plotNode);
        nodes.push(plotNode);
        connections.push({ from: root.id, to: plotNode.id });
        if (project.chapters && project.chapters.length > 0) {
            const plotChildren = this.generatePlotChildren(project.chapters, plotNode.id);
            nodes.push(...plotChildren);
            connections.push(...plotChildren.map(c => ({ from: plotNode.id, to: c.id })));
        }
        const themeNode = this.createNode('theme', '主题', root.id);
        root.children.push(themeNode);
        nodes.push(themeNode);
        connections.push({ from: root.id, to: themeNode.id });
        return { root, nodes, connections };
    }
    async generateCharacterRelationshipMap(characters) {
        const root = {
            id: 'root',
            text: '角色关系图',
            children: []
        };
        const nodes = [root];
        const connections = [];
        for (const character of characters) {
            const charNode = this.createNode('character', character.name, root.id);
            root.children.push(charNode);
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
    async generateChapterOutlineMap(chapters) {
        const root = {
            id: 'root',
            text: '章节大纲',
            children: []
        };
        const nodes = [root];
        const connections = [];
        const actSize = Math.ceil(chapters.length / 3);
        const acts = [
            { name: '第一幕', chapters: chapters.slice(0, actSize) },
            { name: '第二幕', chapters: chapters.slice(actSize, actSize * 2) },
            { name: '第三幕', chapters: chapters.slice(actSize * 2) }
        ];
        for (const act of acts) {
            if (act.chapters.length === 0)
                continue;
            const actNode = this.createNode('act', act.name, root.id);
            root.children.push(actNode);
            nodes.push(actNode);
            connections.push({ from: root.id, to: actNode.id });
            for (const chapter of act.chapters) {
                const chapterNode = this.createNode('chapter', `第${chapter.number}章: ${chapter.title}`, actNode.id);
                actNode.children = actNode.children || [];
                actNode.children.push(chapterNode);
                nodes.push(chapterNode);
                connections.push({ from: actNode.id, to: chapterNode.id });
            }
        }
        return { root, nodes, connections };
    }
    async generateWorldSettingMap(worldSetting) {
        const root = {
            id: 'root',
            text: worldSetting?.name || '世界观',
            children: []
        };
        const nodes = [root];
        const connections = [];
        if (worldSetting?.powerSystem) {
            const powerNode = this.createNode('power', `力量体系: ${worldSetting.powerSystem}`, root.id);
            root.children.push(powerNode);
            nodes.push(powerNode);
            connections.push({ from: root.id, to: powerNode.id });
        }
        if (worldSetting?.locations && worldSetting.locations.length > 0) {
            const locationNode = this.createNode('locations', `地点 (${worldSetting.locations.length})`, root.id);
            root.children.push(locationNode);
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
            const factionNode = this.createNode('factions', `势力 (${worldSetting.factions.length})`, root.id);
            root.children.push(factionNode);
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
    calculateLayout(mindMapData) {
        const { nodeSize, nodePadding, levelGap, siblingGap } = this.config;
        const width = nodeSize.width;
        const height = nodeSize.height;
        const buildLayoutNode = (node, depth) => {
            const isCollapsed = node.collapsed === true;
            const visibleChildren = [];
            if (node.children && node.children.length > 0 && !isCollapsed) {
                for (const child of node.children) {
                    visibleChildren.push(buildLayoutNode(child, depth + 1));
                }
            }
            return {
                id: node.id,
                text: node.text,
                x: 0,
                y: 0,
                width: width,
                height: height,
                depth,
                children: visibleChildren,
                collapsed: isCollapsed,
                node
            };
        };
        const layoutRoot = buildLayoutNode(mindMapData.root, 0);
        this.calculateSubtreeHeights(layoutRoot);
        this.calculatePositions(layoutRoot, 0, 0, width, nodePadding, levelGap, siblingGap);
        return layoutRoot;
    }
    calculateSubtreeHeights(node) {
        if (node.children.length === 0) {
            return node.height;
        }
        let totalHeight = 0;
        for (let i = 0; i < node.children.length; i++) {
            const childHeight = this.calculateSubtreeHeights(node.children[i]);
            totalHeight += childHeight;
            if (i < node.children.length - 1) {
                totalHeight += this.config.siblingGap;
            }
        }
        return Math.max(node.height, totalHeight);
    }
    calculatePositions(node, x, y, width, padding, levelGap, siblingGap) {
        node.x = x;
        node.y = y;
        const isHorizontal = this.config.direction === 'LR' || this.config.direction === 'RL';
        if (node.children.length === 0) {
            return;
        }
        if (isHorizontal) {
            const childX = x + width + levelGap;
            let childY = y - this.calculateSubtreeHeight(node) / 2;
            for (const child of node.children) {
                const subtreeHeight = this.calculateSubtreeHeight(child);
                this.calculatePositions(child, childX, childY, width, padding, levelGap, siblingGap);
                childY += subtreeHeight + siblingGap;
            }
        }
        else {
            const childY = y + node.height + levelGap;
            let childX = x - this.calculateSubtreeWidth(node) / 2;
            for (const child of node.children) {
                const subtreeWidth = this.calculateSubtreeWidth(child);
                this.calculatePositions(child, childX, childY, width, padding, levelGap, siblingGap);
                childX += subtreeWidth + siblingGap;
            }
        }
    }
    calculateSubtreeHeight(node) {
        if (node.children.length === 0) {
            return node.height;
        }
        let totalHeight = 0;
        for (let i = 0; i < node.children.length; i++) {
            totalHeight += this.calculateSubtreeHeight(node.children[i]);
            if (i < node.children.length - 1) {
                totalHeight += this.config.siblingGap;
            }
        }
        return Math.max(node.height, totalHeight);
    }
    calculateSubtreeWidth(node) {
        if (node.children.length === 0) {
            return node.width;
        }
        let totalWidth = 0;
        for (let i = 0; i < node.children.length; i++) {
            totalWidth += this.calculateSubtreeWidth(node.children[i]);
            if (i < node.children.length - 1) {
                totalWidth += this.config.siblingGap;
            }
        }
        return Math.max(node.width, totalWidth);
    }
    getLayoutDimensions(layout) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        const traverse = (node) => {
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x + node.width);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y + node.height);
            for (const child of node.children) {
                traverse(child);
            }
        };
        traverse(layout);
        return {
            width: maxX - minX + 100,
            height: maxY - minY + 100
        };
    }
    renderToSVG(mindMapData, options = {}) {
        const layout = this.calculateLayout(mindMapData);
        const dimensions = this.getLayoutDimensions(layout);
        const { width = dimensions.width, height = dimensions.height, backgroundColor = '#ffffff', selectedNodeId } = options;
        const colors = { ...this.defaultColors, ...this.config.colors };
        const offsetX = 50;
        const offsetY = height / 2;
        const nodeColors = {
            root: colors.root || '#6366f1',
            world: colors.world || '#10b981',
            character: colors.character || '#f59e0b',
            plot: colors.plot || '#ef4444',
            theme: colors.theme || '#8b5cf6',
            default: colors.default || '#64748b'
        };
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        svg += `<style>
      .node-rect { cursor: pointer; transition: all 0.2s; }
      .node-rect:hover { filter: brightness(1.1); }
      .node-text { font-family: system-ui, sans-serif; font-size: 14px; fill: white; pointer-events: none; }
      .connection { stroke: ${colors.line || '#94a3b8'}; stroke-width: 2; fill: none; }
      .collapse-btn { cursor: pointer; }
      .collapse-btn:hover { fill: ${colors.hover || '#3b82f6'}; }
    </style>`;
        svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
        const renderConnections = (node) => {
            for (const child of node.children) {
                const isHorizontal = this.config.direction === 'LR' || this.config.direction === 'RL';
                let path;
                if (isHorizontal) {
                    const startX = node.x + node.width + offsetX;
                    const startY = node.y + node.height / 2 + offsetY;
                    const endX = child.x + offsetX;
                    const endY = child.y + child.height / 2 + offsetY;
                    const midX = (startX + endX) / 2;
                    path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                }
                else {
                    const startX = node.x + node.width / 2 + offsetX;
                    const startY = node.y + node.height + offsetY;
                    const endX = child.x + child.width / 2 + offsetX;
                    const endY = child.y + offsetY;
                    const midY = (startY + endY) / 2;
                    path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                }
                svg += `<path class="connection" d="${path}"/>`;
                renderConnections(child);
            }
        };
        renderConnections(layout);
        const renderNodes = (node) => {
            const nodeX = node.x + offsetX;
            const nodeY = node.y + offsetY;
            const typeKey = node.text.includes('世界观') ? 'world' :
                node.text.includes('角色') ? 'character' :
                    node.text.includes('情节') ? 'plot' :
                        node.text.includes('主题') ? 'theme' :
                            node.id === 'root' ? 'root' : 'default';
            const nodeColor = nodeColors[typeKey] || nodeColors.default;
            const isSelected = node.id === selectedNodeId;
            const strokeColor = isSelected ? (colors.selected || '#f97316') : 'transparent';
            const strokeWidth = isSelected ? 3 : 0;
            svg += `<g class="node" data-id="${node.id}" transform="translate(${nodeX}, ${nodeY})">`;
            svg += `<rect class="node-rect" width="${node.width}" height="${node.height}" rx="8" ry="8" fill="${nodeColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
            const textX = node.width / 2;
            const textY = node.height / 2;
            const fontSize = node.depth === 0 ? 16 : 13;
            const fontWeight = node.depth === 0 ? 'bold' : 'normal';
            svg += `<text class="node-text" x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="${fontWeight}">${this.escapeXml(node.text)}</text>`;
            if (node.node?.children && node.node.children.length > 0) {
                const btnSize = 16;
                const btnX = node.width - btnSize / 2;
                const btnY = node.height - btnSize / 2;
                const collapseChar = node.collapsed ? '+' : '−';
                svg += `<circle class="collapse-btn" cx="${btnX}" cy="${btnY}" r="${btnSize / 2}" fill="rgba(255,255,255,0.9)" stroke="${nodeColor}" stroke-width="2"/>`;
                svg += `<text x="${btnX}" y="${btnY}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="bold" fill="${nodeColor}">${collapseChar}</text>`;
            }
            svg += '</g>';
            for (const child of node.children) {
                renderNodes(child);
            }
        };
        renderNodes(layout);
        svg += '</svg>';
        return svg;
    }
    renderToCanvas(mindMapData, canvas, options = {}) {
        const el = canvas;
        const ctx = el.getContext('2d');
        if (!ctx)
            return;
        const layout = this.calculateLayout(mindMapData);
        const dimensions = this.getLayoutDimensions(layout);
        const { width = dimensions.width, height = dimensions.height, backgroundColor = '#ffffff' } = options;
        el.width = width;
        el.height = height;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        const colors = { ...this.defaultColors, ...this.config.colors };
        const offsetX = 50;
        const offsetY = height / 2;
        const nodeColors = {
            root: colors.root || '#6366f1',
            world: colors.world || '#10b981',
            character: colors.character || '#f59e0b',
            plot: colors.plot || '#ef4444',
            theme: colors.theme || '#8b5cf6',
            default: colors.default || '#64748b'
        };
        const drawConnections = (node) => {
            for (const child of node.children) {
                const isHorizontal = this.config.direction === 'LR' || this.config.direction === 'RL';
                ctx.strokeStyle = colors.line || '#94a3b8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (isHorizontal) {
                    const startX = node.x + node.width + offsetX;
                    const startY = node.y + node.height / 2 + offsetY;
                    const endX = child.x + offsetX;
                    const endY = child.y + child.height / 2 + offsetY;
                    const midX = (startX + endX) / 2;
                    ctx.moveTo(startX, startY);
                    ctx.bezierCurveTo(midX, startY, midX, endY, endX, endY);
                }
                else {
                    const startX = node.x + node.width / 2 + offsetX;
                    const startY = node.y + node.height + offsetY;
                    const endX = child.x + child.width / 2 + offsetX;
                    const endY = child.y + offsetY;
                    const midY = (startY + endY) / 2;
                    ctx.moveTo(startX, startY);
                    ctx.bezierCurveTo(startX, midY, endX, midY, endX, endY);
                }
                ctx.stroke();
                drawConnections(child);
            }
        };
        const drawNodes = (node) => {
            const nodeX = node.x + offsetX;
            const nodeY = node.y + offsetY;
            const typeKey = node.text.includes('世界观') ? 'world' :
                node.text.includes('角色') ? 'character' :
                    node.text.includes('情节') ? 'plot' :
                        node.text.includes('主题') ? 'theme' :
                            node.id === 'root' ? 'root' : 'default';
            const nodeColor = nodeColors[typeKey] || nodeColors.default;
            ctx.fillStyle = nodeColor;
            this.roundRect(ctx, nodeX, nodeY, node.width, node.height, 8);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = node.depth === 0 ? 'bold 16px system-ui' : '13px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.text, nodeX + node.width / 2, nodeY + node.height / 2, node.width - 20);
            if (node.node?.children && node.node.children.length > 0) {
                const btnSize = 16;
                const btnX = nodeX + node.width - btnSize / 2;
                const btnY = nodeY + node.height - btnSize / 2;
                ctx.beginPath();
                ctx.arc(btnX, btnY, btnSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.fill();
                ctx.strokeStyle = nodeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = nodeColor;
                ctx.font = 'bold 14px system-ui';
                ctx.fillText(node.collapsed ? '+' : '−', btnX, btnY);
            }
            for (const child of node.children) {
                drawNodes(child);
            }
        };
        drawConnections(layout);
        drawNodes(layout);
    }
    roundRect(ctx, x, y, w, h, r) {
        const c = ctx;
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }
    toggleNodeCollapse(mindMapData, nodeId) {
        const findAndToggle = (node) => {
            if (node.id === nodeId) {
                node.collapsed = !node.collapsed;
                return true;
            }
            if (node.children) {
                for (const child of node.children) {
                    if (findAndToggle(child))
                        return true;
                }
            }
            return false;
        };
        findAndToggle(mindMapData.root);
        return mindMapData;
    }
    expandAll(mindMapData) {
        const expand = (node) => {
            node.collapsed = false;
            if (node.children) {
                for (const child of node.children) {
                    expand(child);
                }
            }
        };
        expand(mindMapData.root);
        return mindMapData;
    }
    collapseAll(mindMapData) {
        const collapse = (node) => {
            if (node.children && node.children.length > 0) {
                node.collapsed = true;
                for (const child of node.children) {
                    collapse(child);
                }
            }
        };
        collapse(mindMapData.root);
        return mindMapData;
    }
    getVisibleNodes(mindMapData) {
        const visible = [];
        const traverse = (node) => {
            visible.push(node);
            if (node.children && !node.collapsed) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };
        traverse(mindMapData.root);
        return visible;
    }
    findNode(mindMapData, nodeId) {
        const find = (node) => {
            if (node.id === nodeId)
                return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = find(child);
                    if (found)
                        return found;
                }
            }
            return null;
        };
        return find(mindMapData.root);
    }
    highlightPath(mindMapData, nodeId) {
        const path = [];
        const findPath = (node, targetId) => {
            path.push(node.id);
            if (node.id === targetId)
                return true;
            if (node.children) {
                for (const child of node.children) {
                    if (findPath(child, targetId))
                        return true;
                }
            }
            path.pop();
            return false;
        };
        findPath(mindMapData.root, nodeId);
        return path;
    }
    generateMermaidDiagram(mindMapData) {
        let mermaid = 'mindmap\n';
        const traverse = (node, indent = 0) => {
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
    generateHTML(mindMapData) {
        const nodesJson = JSON.stringify(mindMapData.nodes);
        const svgContent = this.renderToSVG(mindMapData);
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>思维导图</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
    .mindmap-container { width: 100%; height: 100vh; overflow: auto; }
    svg { display: block; }
  </style>
</head>
<body>
  <div class="mindmap-container">
    ${svgContent}
  </div>
  <script>
    const nodes = ${nodesJson};
    let mindMapData = { root: nodes[0], nodes: nodes };

    document.querySelectorAll('.collapse-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = e.target.closest('.node').dataset.id;
        console.log('Toggle collapse:', nodeId);
      });
    });

    document.querySelectorAll('.node').forEach(node => {
      node.addEventListener('click', () => {
        console.log('Node clicked:', node.dataset.id);
      });
    });
  </script>
</body>
</html>`;
    }
    generateMarkdown(mindMapData) {
        let md = '';
        const traverse = (node, level = 0) => {
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
    createNode(type, text, parentId) {
        return {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text,
            children: []
        };
    }
    generateWorldChildren(worldSetting, parentId) {
        const nodes = [];
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
    generateCharacterChildren(characters, parentId) {
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
    generatePlotChildren(chapters, parentId) {
        const importantChapters = chapters.filter((c, i) => i === 0 || i === chapters.length - 1 ||
            (c.hooks && c.hooks.length > 0) ||
            c.summary?.includes('高潮') ||
            c.summary?.includes('转折')).slice(0, 15);
        return importantChapters.map(chapter => {
            const node = this.createNode('chapter', `${chapter.title}`, parentId);
            if (chapter.summary) {
                const summaryNode = this.createNode('summary', chapter.summary.slice(0, 50), node.id);
                node.children = node.children || [];
                node.children.push(summaryNode);
            }
            return node;
        });
    }
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
exports.MindMapGenerator = MindMapGenerator;
exports.default = MindMapGenerator;
//# sourceMappingURL=MindMapGenerator.js.map