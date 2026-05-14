"use strict";
/**
 * Cover Generator - 封面生成模块
 * 支持 AI 封面设计（使用 DALL-E 真实图片生成）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverGenerator = void 0;
class CoverGenerator {
    llmManager;
    defaultApiKey;
    defaultEndpoint;
    constructor(llmManager) {
        this.llmManager = llmManager;
    }
    setDefaultCredentials(apiKey, endpoint) {
        this.defaultApiKey = apiKey;
        this.defaultEndpoint = endpoint;
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
    async generateImage(project, config) {
        const apiKey = config?.openaiApiKey || this.defaultApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is required for image generation. Please set OPENAI_API_KEY environment variable or provide openaiApiKey in config.');
        }
        const imagePrompt = await this.generateImagePrompt(project, config);
        const options = config?.imageOptions || {};
        return this.callDalleAPI(imagePrompt, apiKey, config?.openaiEndpoint, options);
    }
    async generateImageFromPrompt(prompt, apiKey, endpoint, options) {
        const key = apiKey || this.defaultApiKey || process.env.OPENAI_API_KEY;
        if (!key) {
            throw new Error('OpenAI API key is required for image generation. Please set OPENAI_API_KEY environment variable.');
        }
        return this.callDalleAPI(prompt, key, endpoint, options);
    }
    async generateImageBase64(project, config) {
        const apiKey = config?.openaiApiKey || this.defaultApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is required for image generation. Please set OPENAI_API_KEY environment variable or provide openaiApiKey in config.');
        }
        const imagePrompt = await this.generateImagePrompt(project, config);
        const options = config?.imageOptions || {};
        return this.callDalleAPI(imagePrompt, apiKey, config?.openaiEndpoint, options, true);
    }
    async generateVariations(project, config, count = 4) {
        const apiKey = config?.openaiApiKey || this.defaultApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is required for image generation.');
        }
        const designs = await this.generateStyleVariations(project);
        const results = [];
        const batchSize = 2;
        for (let i = 0; i < Math.min(count, designs.length); i += batchSize) {
            const batch = designs.slice(i, i + batchSize);
            const batchPrompts = batch.map(design => this.buildImagePrompt(design, project.genre || 'fantasy'));
            const batchResults = await Promise.all(batchPrompts.map(prompt => this.callDalleAPI(prompt, apiKey, config?.openaiEndpoint, config?.imageOptions)));
            results.push(...batchResults);
        }
        return results;
    }
    async callDalleAPI(prompt, apiKey, endpoint, options, returnBase64 = false) {
        const baseUrl = endpoint || process.env.OPENAI_IMAGE_ENDPOINT || 'https://api.openai.com/v1';
        const model = options?.model || 'dall-e-3';
        const size = options?.size || '1024x1024';
        const quality = options?.quality || 'standard';
        const style = options?.style || 'vivid';
        const requestBody = {
            model,
            prompt: this.optimizePrompt(prompt, model),
            n: 1,
            size,
            style
        };
        if (quality === 'hd' && model === 'dall-e-3') {
            requestBody.quality = 'hd';
        }
        if (returnBase64) {
            requestBody.response_format = 'b64_json';
        }
        const response = await fetch(`${baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DALL-E API Error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        const imageData = data.data?.[0];
        if (!imageData) {
            throw new Error('No image data returned from DALL-E API');
        }
        return {
            url: imageData.url,
            base64: imageData.b64_json,
            revisedPrompt: imageData.revised_prompt,
            model: model,
            imageSize: size,
            generationId: data.created?.toString()
        };
    }
    optimizePrompt(prompt, model) {
        if (model === 'dall-e-3') {
            if (!prompt.toLowerCase().includes('book cover') &&
                !prompt.toLowerCase().includes('bookcover')) {
                prompt = `Professional book cover art: ${prompt}`;
            }
            if (!prompt.toLowerCase().includes('no text') &&
                !prompt.toLowerCase().includes('without text')) {
                prompt = `${prompt} (no text or letters on the image)`;
            }
        }
        return prompt.slice(0, model === 'dall-e-3' ? 4000 : 1000);
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
            xianxia: 'chinese xianxia art style, cultivation world, mystical mountains, ethereal glow',
            wuxia: 'chinese wuxia martial arts, ink wash painting style, flowing robes',
            scifi: 'sci-fi illustration, futuristic, cyberpunk aesthetic, neon lights',
            romance: 'romantic illustration, soft lighting, emotional atmosphere, warm tones',
            mystery: 'dark mystery atmosphere, noir style, dramatic shadows, suspenseful mood',
            urban: 'modern urban fantasy, contemporary setting, city skyline',
            horror: 'dark horror atmosphere, gothic style, eerie lighting, unsettling'
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
${design.description}
high quality, detailed, professional book cover design, no text or letters`;
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