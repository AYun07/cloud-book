"use strict";
/**
 * 故事导演模块
 * 自动分析市场趋势，生成故事方向和章节规划
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDirector = void 0;
class AutoDirector {
    llmManager;
    constructor(llmManager) {
        this.llmManager = llmManager;
    }
    async analyzeTrends() {
        const prompt = `分析当前网络小说市场趋势，包括：
1. 最受欢迎的元素和主题
2. 当前流行的题材
3. 成功的叙事模式
4. 市场空白和机会

请提供详细的趋势分析报告。`;
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.7
        });
        return this.parseTrendAnalysis(response);
    }
    async generateDirections(project, count = 3) {
        const genreContext = this.getGenreContext(project.genre);
        const prompt = `作为故事策划专家，为一部${project.genre || '玄幻'}题材小说生成${count}个故事方向。

题材特点：${genreContext}

要求每个方向包含：
1. 标题：简洁有力的标题
2. 副标题：补充说明
3. 卖点：3-5个吸引读者的核心卖点
4. 目标读者：明确的目标受众
5. 首篇承诺：给读者的第一个承诺
6. 章节规划：至少10章的大纲

请以JSON格式输出`;
        const response = await this.llmManager.complete(prompt, {
            task: 'planning',
            temperature: 0.8
        });
        return this.parseDirections(response, count);
    }
    async selectBestDirection(directions, criteria) {
        const criteriaPrompt = criteria
            ? `评估标准：原创性${criteria.originality}、市场性${criteria.marketability}、可行性${criteria.feasibility}`
            : '';
        const prompt = `评估以下故事方向，选择最佳的一个。
${criteriaPrompt}

方向列表：
${directions.map((d, i) => `${i + 1}. ${d.title} - ${d.subtitle}`).join('\n')}

请分析每个方向的优缺点，并选择最佳方向，解释原因。`;
        const response = await this.llmManager.complete(prompt, {
            task: 'analysis',
            temperature: 0.5
        });
        const selectedIndex = this.extractSelectedIndex(response, directions.length);
        return {
            direction: directions[selectedIndex],
            score: this.calculateScore(response)
        };
    }
    async createProjectPlan(direction, config) {
        const fullDirection = await this.enrichDirection(direction, config);
        return {
            directions: [fullDirection],
            selectedDirection: 0
        };
    }
    async generateChapterPlan(direction, totalChapters = 100) {
        const prompt = `基于故事方向"${direction.title}"，生成${totalChapters}章的详细章节规划。

每个章节需要包含：
1. 章节序号
2. 章节标题
3. 章节摘要（100字以内）
4. 钩子设置（1-2个吸引读者继续阅读的钩子）

请确保：
- 节奏感：前期铺垫，中期高潮，后期收尾
- 每章至少一个钩子
- 伏笔与呼应

请以JSON格式输出章节规划数组。`;
        const response = await this.llmManager.complete(prompt, {
            task: 'planning',
            temperature: 0.7
        });
        return this.parseChapterPlan(response, totalChapters);
    }
    async suggestAdjustments(currentDirection, performanceData) {
        const performanceContext = performanceData
            ? `表现数据：留存率${performanceData.readerRetention}%，最喜欢的章节${performanceData.favoriteChapters}，流失章节${performanceData.dropOffChapter}`
            : '无具体数据';
        const prompt = `基于以下表现数据，为故事方向"${currentDirection.title}"提供调整建议。

${performanceContext}

请提供具体的、可执行的调整建议，包括：
1. 节奏调整
2. 角色发展调整
3. 情节调整
4. 卖点强化`;
        const response = await this.llmManager.complete(prompt, {
            task: 'revision',
            temperature: 0.6
        });
        return this.parseSuggestions(response);
    }
    async enrichDirection(direction, config) {
        const enrichPrompt = `完善以下故事方向：

标题：${direction.title}
副标题：${direction.subtitle}

${config?.targetAudience ? `目标读者：${config.targetAudience}` : ''}
${config?.tone ? `基调：${config.tone}` : ''}
${config?.wordCountTarget ? `目标字数：${config.wordCountTarget}` : ''}

请完善卖点和首篇承诺，使其更具吸引力。`;
        const enriched = await this.llmManager.complete(enrichPrompt, {
            task: 'planning',
            temperature: 0.7
        });
        return {
            ...direction,
            sellingPoints: this.parseSellingPoints(enriched) || direction.sellingPoints,
            firstPromise: this.parseFirstPromise(enriched) || direction.firstPromise
        };
    }
    getGenreContext(genre) {
        const contexts = {
            fantasy: '包含魔法、异世界、种族设定，强调世界观构建',
            xianxia: '修仙题材，包含境界体系、功法、灵兽等元素',
            wuxia: '武侠题材，强调武功、江湖门派、义气',
            scifi: '科幻题材，关注科技发展、星际探索',
            romance: '言情题材，强调感情线发展',
            mystery: '悬疑题材，强调线索、推理、反转',
            urban: '都市题材，贴近现实生活',
            historical: '历史题材，基于历史背景改编'
        };
        return contexts[genre || 'fantasy'] || '综合多种元素';
    }
    parseTrendAnalysis(response) {
        return {
            popularElements: this.extractList(response, '流行元素'),
            trendingGenres: this.extractList(response, '流行题材'),
            successfulPatterns: this.extractList(response, '成功模式'),
            marketGaps: this.extractList(response, '市场空白')
        };
    }
    parseDirections(response, count) {
        const directions = [];
        for (let i = 0; i < count; i++) {
            directions.push({
                id: this.generateId(),
                title: `故事方向 ${i + 1}`,
                subtitle: `副标题 ${i + 1}`,
                sellingPoints: [],
                targetAudience: '通用读者',
                firstPromise: '',
                chapterPlan: []
            });
        }
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    return parsed.map((p, i) => ({
                        id: this.generateId(),
                        title: p.title || `故事方向 ${i + 1}`,
                        subtitle: p.subtitle || '',
                        sellingPoints: p.sellingPoints || [],
                        targetAudience: p.targetAudience || '通用读者',
                        firstPromise: p.firstPromise || '',
                        chapterPlan: p.chapterPlan || []
                    }));
                }
            }
        }
        catch { }
        return directions;
    }
    parseChapterPlan(response, totalChapters) {
        const plans = [];
        try {
            const jsonMatch = response.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    return parsed.map((p, i) => ({
                        number: p.number || i + 1,
                        title: p.title || `第${this.toChinese(i + 1)}章`,
                        summary: p.summary || '',
                        hooks: p.hooks || []
                    }));
                }
            }
        }
        catch { }
        for (let i = 1; i <= Math.min(totalChapters, 10); i++) {
            plans.push({
                number: i,
                title: `第${this.toChinese(i)}章`,
                summary: '',
                hooks: []
            });
        }
        return plans;
    }
    extractList(text, category) {
        const regex = new RegExp(`${category}[：:](.+?)(?=\\n\\n|\\n$|$)`, 's');
        const match = text.match(regex);
        if (match) {
            return match[1].split(/[、，,]/).map(s => s.trim()).filter(Boolean);
        }
        return [];
    }
    extractSelectedIndex(response, count) {
        const numberMatch = response.match(/第?\s*(\d+)\s*个?方向|第?\s*(\d+)\s*号/);
        if (numberMatch) {
            const index = parseInt(numberMatch[1] || numberMatch[2]) - 1;
            return Math.min(Math.max(0, index), count - 1);
        }
        return 0;
    }
    calculateScore(response) {
        const scoreMatch = response.match(/(\d+(?:\.\d+)?)\s*分|评分[：:]\s*(\d+(?:\.\d+)?)/);
        if (scoreMatch) {
            return parseFloat(scoreMatch[1] || scoreMatch[2]);
        }
        return 0.8;
    }
    parseSellingPoints(text) {
        const match = text.match(/卖点[：:](.+?)(?=\n|$)/s);
        if (match) {
            return match[1].split(/[、，,]/).map(s => s.trim()).filter(Boolean);
        }
        return [];
    }
    parseFirstPromise(text) {
        const match = text.match(/首篇承诺[：:](.+?)(?=\n|$)/s);
        return match ? match[1].trim() : '';
    }
    parseSuggestions(text) {
        return text.split(/\n/).filter(line => line.trim().length > 10);
    }
    toChinese(num) {
        const units = ['', '十', '百', '千', '万'];
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (num === 0)
            return '零';
        let result = '';
        let unitIndex = 0;
        while (num > 0) {
            const digit = num % 10;
            if (digit !== 0) {
                result = digits[digit] + units[unitIndex] + result;
            }
            else if (result && !result.startsWith('零')) {
                result = '零' + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }
        return result.replace(/零+$/, '') || '零';
    }
    generateId() {
        return `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.AutoDirector = AutoDirector;
exports.default = AutoDirector;
//# sourceMappingURL=AutoDirector.js.map