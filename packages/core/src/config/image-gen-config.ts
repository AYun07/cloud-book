/**
 * Cloud Book - 图像生成配置
 * 2026年5月12日 04:55
 */

export interface ImageGenConfig {
  provider: 'siliconflow' | 'openai' | 'midjourney' | 'local';
  baseURL: string;
  apiKey: string;
  model: string;
  defaultSize?: string;
  defaultSteps?: number;
}

export const IMAGE_GEN_PROVIDERS: Record<string, ImageGenConfig> = {
  siliconflow: {
    provider: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: 'sk-gupfftfqutmuenznbuwwhypiilvgwiesezridcrvdsmiyfkl',
    model: 'Kwai-Kolors/Kolors',
    defaultSize: '1024x1024',
    defaultSteps: 20
  }
};

export const DEFAULT_IMAGE_CONFIG = IMAGE_GEN_PROVIDERS.siliconflow;

export async function generateImage(
  prompt: string,
  config: ImageGenConfig = DEFAULT_IMAGE_CONFIG,
  options?: {
    size?: string;
    steps?: number;
    negativePrompt?: string;
  }
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
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

    const data: any = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      return { success: true, imageUrl: data.data[0].url };
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
      return { success: true, imageUrl: `data:image/png;base64,${data.data[0].b64_json}` };
    }

    return { success: false, error: 'No image data in response' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function buildCoverPrompt(
  title: string,
  genre: string,
  style?: string
): string {
  return `Book cover for "${title}", genre: ${genre}. Style: ${style || 'anime illustration'}, high quality, detailed, professional`;
}

export default {
  IMAGE_GEN_PROVIDERS,
  DEFAULT_IMAGE_CONFIG,
  generateImage,
  buildCoverPrompt
};
