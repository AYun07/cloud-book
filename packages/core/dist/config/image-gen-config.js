"use strict";
/**
 * Cloud Book - 图像生成配置
 * 所有API密钥必须通过环境变量配置
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IMAGE_CONFIG = exports.IMAGE_GEN_PROVIDERS = void 0;
exports.generateImage = generateImage;
exports.buildCoverPrompt = buildCoverPrompt;
exports.IMAGE_GEN_PROVIDERS = {
    siliconflow: {
        provider: 'siliconflow',
        baseURL: process.env.IMAGE_API_BASE_URL || 'https://api.siliconflow.cn/v1',
        apiKey: process.env.IMAGE_API_KEY || '',
        model: 'Kwai-Kolors/Kolors',
        defaultSize: '1024x1024',
        defaultSteps: 20
    }
};
exports.DEFAULT_IMAGE_CONFIG = exports.IMAGE_GEN_PROVIDERS.siliconflow;
async function generateImage(prompt, config = exports.DEFAULT_IMAGE_CONFIG, options) {
    if (!config.apiKey) {
        return { success: false, error: '未设置 IMAGE_API_KEY 环境变量' };
    }
    try {
        const response = await fetch(`${config.baseURL}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                prompt: prompt,
                negative_prompt: options?.negativePrompt || 'low quality, blurry, distorted',
                image_size: options?.size || config.defaultSize || '1024x1024',
                steps: options?.steps || config.defaultSteps || 20
            })
        });
        if (!response.ok) {
            const error = await response.text();
            return { success: false, error: `HTTP ${response.status}: ${error}` };
        }
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
            return { success: true, imageUrl: data.data[0].url };
        }
        else if (data.data && data.data[0] && data.data[0].b64_json) {
            return { success: true, imageUrl: `data:image/png;base64,${data.data[0].b64_json}` };
        }
        return { success: false, error: 'No image data in response' };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
function buildCoverPrompt(title, genre, style) {
    return `Book cover for "${title}", genre: ${genre}. Style: ${style || 'anime illustration'}, high quality, detailed, professional`;
}
exports.default = {
    IMAGE_GEN_PROVIDERS: exports.IMAGE_GEN_PROVIDERS,
    DEFAULT_IMAGE_CONFIG: exports.DEFAULT_IMAGE_CONFIG,
    generateImage,
    buildCoverPrompt
};
//# sourceMappingURL=image-gen-config.js.map