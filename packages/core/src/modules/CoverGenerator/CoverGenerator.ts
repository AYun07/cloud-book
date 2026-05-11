/**
 * Cover Generator - 封面生成模块
 * 生成小说封面
 */

import { CoverConfig, NovelProject } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';

export interface CoverDesign {
  title: string;
  subtitle?: string;
  style: string;
  colorScheme: string[];
  elements: CoverElement[];
  layout: 'vertical' | 'horizontal';
  description: string;
}

export interface CoverElement {
  type: 'character' | 'background' | 'symbol' | 'text' | 'decoration';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  description: string;
}

export class CoverGenerator {
  private llmManager: LLMManager;

  constructor(llmManager: LLMManager) {
    this.llmManager = llmManager;
  }

  async generateDesign(
    project: Partial<NovelProject>,
    config?: CoverConfig
  ): Promise<CoverDesign> {
    const prompt = this.buildDesignPrompt(project, config);
    const response = await this.llmManager.complete(prompt, {
      task: 'analysis',
      temperature: 0.8
    });

    return this.parseDesignResponse(response, project.title || '未知书名');
  }

  async generateImagePrompt(
    project: Partial<NovelProject>,
    config?: CoverConfig
  ): Promise<string> {
    const design = await this.generateDesign(project, config);
    
    return this.buildImagePrompt(design, project.genre || 'fantasy');
  }

  private buildDesignPrompt(
    project: Partial<NovelProject>,
    config?: CoverConfig
  ): string {
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

  private parseDesignResponse(response: string, fallbackTitle: string): CoverDesign {
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
    } catch {}

    return {
      title: fallbackTitle,
      style: 'fantasy',
      colorScheme: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
      elements: [],
      layout: 'vertical',
      description: '默认玄幻风格封面'
    };
  }

  private buildImagePrompt(design: CoverDesign, genre: string): string {
    const stylePrompts: Record<string, string> = {
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

  async generateStyleVariations(
    project: Partial<NovelProject>
  ): Promise<CoverDesign[]> {
    const variations: CoverDesign[] = [];
    const styles = ['dramatic', 'minimalist', 'vintage', 'modern', 'epic'];

    for (const style of styles) {
      const config: CoverConfig = {
        style: style as any,
        mainColor: this.getRandomColor()
      };

      const design = await this.generateDesign(project, config);
      variations.push(design);
    }

    return variations;
  }

  private getRandomColor(): string {
    const colors = [
      '#e94560', '#0f3460', '#16213e', '#1a1a2e',
      '#533483', '#e94560', '#00b894', '#6c5ce7',
      '#fdcb6e', '#e17055', '#00cec9', '#fab1a0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default CoverGenerator;
