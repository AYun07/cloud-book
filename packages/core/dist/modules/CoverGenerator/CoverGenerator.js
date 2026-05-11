"use strict";
/**
 * Cover Generator - 封面生成模块
 * 生成小说封面
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverGenerator = void 0;
class CoverGenerator {
    llmManager;
    constructor(llmManager) {
        this.llmManager = llmManager;
    }
    async generateDesign(project, config) {
        const prompt = this.buildDesignPrompt(project, config);
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.8
        });
        return this.parseDesignResponse(response, project.title || '未知书名');
    }
    async generateImagePrompt(project, config) {
        const design = await this.generateDesign(project, config);
        return this.buildImagePrompt(design, project.genre || 'fantasy');
    }
    buildDesignPrompt(project, config) {
        return `为一部小说设计封面方案。

书名：${project.title || '未知书名'}
副标题：${project.subtitle || '无'}
题材：${project.genre || '玄幻'}
简介：${project.corePremise || '暂无'}

主要角色：
${project.characters?.slice(0, 3).map(c => `- ${c.name}: ${c.personality || '未知'}`).join('\n') || '暂无'}

世界观：${project.worldSetting?.powerSystem || project.worldSetting?.name || '奇幻世界'}

封面风格：${config?.style || '根据题材自动选择'}

请设计：
1. 封面标题和副标题
2. 配色方案（3-5个颜色）
3. 需要的视觉元素（角色、背景、装饰等）
4. 布局建议
5. 整体风格描述

请用JSON格式输出完整设计。`;
    }
    parseDesignResponse(response, fallbackTitle) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    title: parsed.title || fallbackTitle,
                    subtitle: parsed.subtitle,
                    style: parsed.style || 'fantasy',
                    colorScheme: parsed.colorScheme || ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
                    elements: parsed.elements || [],
                    layout: parsed.layout || 'vertical',
                    description: parsed.description || ''
                };
            }
        }
        catch { }
        return {
            title: fallbackTitle,
            style: 'fantasy',
            colorScheme: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
            elements: [],
            layout: 'vertical',
            description: '默认玄幻风格封面'
        };
    }
    buildImagePrompt(design, genre) {
        const stylePrompts = {
            fantasy: 'epic fantasy illustration, dramatic lighting, magical atmosphere',
            xianxia: 'chinese xianxia art style, cultivation world, mystical mountains',
            wuxia: 'chinese wuxia martial arts, ink wash painting style',
            scifi: 'sci-fi illustration, futuristic, cyberpunk aesthetic',
            romance: 'romantic illustration, soft lighting, emotional atmosphere',
            mystery: 'dark mystery atmosphere, noir style, dramatic shadows',
            urban: 'modern urban fantasy, contemporary setting',
            horror: 'dark horror atmosphere, gothic style, eerie lighting'
        };
        const genreStyle = stylePrompts[genre] || stylePrompts.fantasy;
        const elementsPrompt = design.elements
            .map(e => e.description)
            .join(', ');
        const colorPrompt = design.colorScheme.length > 0
            ? `color palette: ${design.colorScheme.join(', ')}`
            : '';
        return `Book cover for "${design.title}"
${design.subtitle ? `Subtitle: "${design.subtitle}"` : ''}
${genreStyle}
${elementsPrompt}
${colorPrompt}
high quality, detailed, professional book cover design, no text`;
    }
    async generateStyleVariations(project) {
        const variations = [];
        const styles = ['dramatic', 'minimalist', 'vintage', 'modern', 'epic'];
        for (const style of styles) {
            const config = {
                style: style,
                mainColor: this.getRandomColor()
            };
            const design = await this.generateDesign(project, config);
            variations.push(design);
        }
        return variations;
    }
    getRandomColor() {
        const colors = [
            '#e94560', '#0f3460', '#16213e', '#1a1a2e',
            '#533483', '#e94560', '#00b894', '#6c5ce7',
            '#fdcb6e', '#e17055', '#00cec9', '#fab1a0'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
exports.CoverGenerator = CoverGenerator;
exports.default = CoverGenerator;
//# sourceMappingURL=CoverGenerator.js.map