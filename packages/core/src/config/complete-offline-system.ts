/**
 * Cloud Book - 完全离线创作系统
 * 2026年5月14日
 * 无本地大模型情况下也能完整使用的离线创作系统
 */

import { BasicVectorizer } from './basic-vectorizer';
import { LLMConfig } from '../types';

export type SceneType = 
  | 'opening' 
  | 'turning' 
  | 'climax' 
  | 'resolution' 
  | 'exposition' 
  | 'development';

export type Tone = 
  | 'positive' 
  | 'negative' 
  | 'neutral' 
  | 'suspense' 
  | 'comic' 
  | 'tragic';

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  description: string;
  characters: string[];
  location?: string;
  time?: string;
  plotPoints: string[];
  emotionalBeat?: string;
}

export interface WritingPrompt {
  type: string;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    options?: string[];
    required?: boolean;
    placeholder?: string;
  }>;
  example?: Record<string, string>;
}

export interface PlotGeneratorConfig {
  genre: 'fantasy' | 'romance' | 'mystery' | 'scifi' | 'horror' | 'drama' | 'comedy';
  mood: 'light' | 'dark' | 'balanced';
  complexity: 'simple' | 'medium' | 'complex';
  mainCharacterCount: number;
  plotTwists: number;
}

export interface Suggestion {
  id: string;
  type: 'idea' | 'structure' | 'character' | 'dialogue' | 'world' | 'title';
  content: string;
  tags: string[];
  priority: number;
}

export interface StoryOutline {
  title: string;
  premise: string;
  theme: string;
  mainCharacters: string[];
  keyLocations: string[];
  acts: Array<{
    number: number;
    title: string;
    description: string;
    scenes: Scene[];
  }>;
  keyEvents: string[];
}

/**
 * 场景模板库
 */
const SCENE_TEMPLATES: Scene[] = [
  {
    id: 'opening-meeting',
    type: 'opening',
    title: '初次相遇',
    description: '主角与重要人物的第一次相遇',
    characters: ['主角', '重要配角'],
    location: '公共场所',
    plotPoints: ['主角正在日常活动', '意外事件发生', '主角与配角相遇', '留下伏笔'],
    emotionalBeat: '好奇/惊讶'
  },
  {
    id: 'turning-point',
    type: 'turning',
    title: '转折点',
    description: '剧情发生重大转变的节点',
    characters: ['主角', '对立角色'],
    plotPoints: ['主角面临重要选择', '意外真相揭露', '主角做出关键决定', '旧状态被打破'],
    emotionalBeat: '震惊/决心'
  },
  {
    id: 'climax',
    type: 'climax',
    title: '高潮时刻',
    description: '所有冲突汇聚的高潮场景',
    characters: ['主角', '主要反派', '核心盟友'],
    plotPoints: ['主角达到目标门槛', '与反派最终对峙', '长期冲突解决', '关键牺牲/胜利'],
    emotionalBeat: '紧张/激动'
  },
  {
    id: 'resolution',
    type: 'resolution',
    title: '结局收尾',
    description: '故事的结局与收尾',
    characters: ['主角'],
    plotPoints: ['直接后果处理', '角色关系梳理', '未来走向暗示', '主题升华'],
    emotionalBeat: '释然/希望'
  },
  {
    id: 'exposition',
    type: 'exposition',
    title: '信息展示',
    description: '向读者介绍世界背景和设定',
    characters: ['主角', '向导角色'],
    plotPoints: ['通过对话展示设定', '视觉化描述环境', '揭示世界规则', '建立世界观基调'],
    emotionalBeat: '探索/发现'
  },
  {
    id: 'character-development',
    type: 'development',
    title: '角色发展',
    description: '展示角色成长或变化的场景',
    characters: ['主角'],
    plotPoints: ['角色面临考验', '内心独白', '做出艰难选择', '展示新的自我'],
    emotionalBeat: '挣扎/成长'
  }
];

/**
 * 通用情节生成器
 */
export class OfflinePlotGenerator {
  private config: PlotGeneratorConfig;

  constructor(config: PlotGeneratorConfig) {
    this.config = config;
  }

  generateOutline(premise: string): StoryOutline {
    const acts = this.generateActs();
    
    return {
      title: this.generateTitle(premise),
      premise,
      theme: this.generateTheme(),
      mainCharacters: this.generateCharacterArchetypes(),
      keyLocations: this.generateKeyLocations(),
      acts,
      keyEvents: this.generateKeyEvents(acts)
    };
  }

  private generateTitle(premise: string): string {
    const templates = [
      '《{place}的{character}》',
      '《{object}之谜》',
      '《{feeling}的{season}》',
      '《{action}之路》',
      '《{twist}的{time}》'
    ];

    const replacements = {
      place: ['城市', '村庄', '王国', '岛屿', '山谷', '深海', '太空站'],
      character: ['守护者', '叛逆者', '探索者', '旅人', '继承者'],
      object: ['面具', '卷轴', '钥匙', '宝石', '地图'],
      feeling: ['逝去', '遗忘', '永恒', '燃烧', '沉默'],
      season: ['春天', '冬天', '黄昏', '午夜', '黎明'],
      action: ['寻找', '守护', '背叛', '救赎', '觉醒'],
      twist: ['谎言', '真相', '回忆', '承诺', '诅咒'],
      time: ['时代', '季节', '时刻', '瞬间', '时刻']
    };

    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.fillTemplate(template, replacements);
  }

  private generateTheme(): string {
    const themes = [
      '成长与救赎',
      '爱与牺牲',
      '勇气与恐惧',
      '真相与谎言',
      '自由与责任',
      '命运与选择',
      '友谊与背叛',
      '过去与未来'
    ];

    return themes[Math.floor(Math.random() * themes.length)];
  }

  private generateCharacterArchetypes(): string[] {
    const archetypes = [
      '孤独的英雄',
      '智慧的导师',
      '忠诚的伙伴',
      '复杂的反派',
      '神秘的陌生人',
      '失去的爱人',
      '隐藏的真相'
    ];

    const count = this.config.mainCharacterCount;
    return archetypes.slice(0, count);
  }

  private generateKeyLocations(): string[] {
    const locations = [
      '古老的城堡',
      '繁华的都市',
      '被遗忘的废墟',
      '神秘的森林',
      '地下城市',
      '天空岛屿'
    ];

    return locations.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  private generateActs(): StoryOutline['acts'] {
    const actCount = this.config.complexity === 'simple' ? 2 : 
                     this.config.complexity === 'medium' ? 3 : 4;

    const acts: StoryOutline['acts'] = [];

    for (let i = 1; i <= actCount; i++) {
      const scenes = this.generateScenesForAct(i, actCount);
      acts.push({
        number: i,
        title: this.getActTitle(i),
        description: this.getActDescription(i, actCount),
        scenes
      });
    }

    return acts;
  }

  private getActTitle(actNumber: number): string {
    const titles = ['开端', '发展', '转折', '高潮'];
    return titles[actNumber - 1] || `第${actNumber}幕`;
  }

  private getActDescription(actNumber: number, totalActs: number): string {
    const descriptions = [
      '介绍主要角色、背景世界，建立故事基调',
      '情节发展，关系加深，冲突逐渐升级',
      '出现重大转折，主角陷入困境',
      '最终冲突解决，主题升华'
    ];

    return descriptions[actNumber - 1] || '情节发展';
  }

  private generateScenesForAct(actNumber: number, totalActs: number): Scene[] {
    const sceneCount = this.config.complexity === 'simple' ? 3 : 
                       this.config.complexity === 'medium' ? 4 : 5;

    const scenes: Scene[] = [];

    for (let i = 0; i < sceneCount; i++) {
      const template = SCENE_TEMPLATES[
        Math.floor(Math.random() * SCENE_TEMPLATES.length)
      ];

      scenes.push({
        ...template,
        id: `${actNumber}-${i + 1}`
      });
    }

    return scenes;
  }

  private generateKeyEvents(acts: StoryOutline['acts']): string[] {
    const events: string[] = [];
    
    acts.forEach(act => {
      act.scenes.forEach(scene => {
        if (scene.plotPoints.length > 0) {
          events.push(scene.plotPoints[0]);
        }
      });
    });

    return events.slice(0, 6);
  }

  private fillTemplate(template: string, replacements: Record<string, string[]>): string {
    return template.replace(/{(\w+)}/g, (_, key) => {
      const options = replacements[key];
      if (!options) return key;
      return options[Math.floor(Math.random() * options.length)];
    });
  }
}

/**
 * 写作提示系统
 */
export class WritingPromptLibrary {
  private prompts: Map<string, WritingPrompt> = new Map();

  constructor() {
    this.initPrompts();
  }

  private initPrompts() {
    this.prompts.set('character-intro', {
      type: 'character',
      title: '角色介绍',
      description: '创建一个令人难忘的角色介绍',
      fields: [
        { name: 'name', label: '角色名称', type: 'text', required: true },
        { name: 'role', label: '角色定位', type: 'select', options: ['主角', '配角', '反派', '引导者'], required: true },
        { name: 'background', label: '背景故事', type: 'textarea', required: true, placeholder: '请描述角色的过去经历...' },
        { name: 'goal', label: '核心目标', type: 'text', required: true, placeholder: '角色想要什么？' },
        { name: 'flaw', label: '弱点/缺陷', type: 'text', required: true, placeholder: '角色的缺点是什么？' },
        { name: 'catchphrase', label: '标志性台词', type: 'text', placeholder: '一句经典的话...' }
      ]
    });

    this.prompts.set('scene-setting', {
      type: 'scene',
      title: '场景构建',
      description: '构建一个生动的故事场景',
      fields: [
        { name: 'location', label: '地点', type: 'text', required: true },
        { name: 'time', label: '时间', type: 'text', required: true },
        { name: 'weather', label: '天气/氛围', type: 'text', required: true },
        { name: 'purpose', label: '场景目的', type: 'select', options: ['介绍', '冲突', '转折', '高潮', '收尾'], required: true },
        { name: 'details', label: '重要细节', type: 'textarea', placeholder: '气味、声音、视觉细节...' }
      ]
    });

    this.prompts.set('three-act', {
      type: 'structure',
      title: '三幕式结构',
      description: '使用经典三幕式结构规划你的故事',
      fields: [
        { name: 'act1', label: '第一幕：开端', type: 'textarea', required: true, placeholder: '介绍主角和世界，建立目标...' },
        { name: 'plotPoint1', label: '第一个情节点', type: 'text', required: true, placeholder: '迫使主角行动的事件' },
        { name: 'act2', label: '第二幕：发展', type: 'textarea', required: true, placeholder: '主角面对挑战，关系变化...' },
        { name: 'midpoint', label: '中点转折', type: 'text', required: true, placeholder: '中间的重大变化' },
        { name: 'plotPoint2', label: '第二个情节点', type: 'text', required: true, placeholder: '将主角推向高潮的事件' },
        { name: 'act3', label: '第三幕：高潮', type: 'textarea', required: true, placeholder: '最终对决，问题解决...' }
      ]
    });

    this.prompts.set('dialogue', {
      type: 'dialogue',
      title: '对话写作',
      description: '创建有张力和深度的对话',
      fields: [
        { name: 'characters', label: '对话角色', type: 'text', required: true, placeholder: '谁在说话？' },
        { name: 'situation', label: '情境', type: 'text', required: true, placeholder: '他们在什么情况下对话？' },
        { name: 'hiddenGoal', label: '角色潜台词', type: 'textarea', required: true, placeholder: '每个角色真正想要什么？' },
        { name: 'powerDynamic', label: '力量对比', type: 'select', options: ['平等', '一方主导', '弱势一方'], required: true },
        { name: 'history', label: '角色关系历史', type: 'textarea', placeholder: '他们过去有什么交集？' }
      ]
    });

    this.prompts.set('worldbuilding', {
      type: 'world',
      title: '世界观构建',
      description: '系统性地构建你的故事世界',
      fields: [
        { name: 'rules', label: '世界规则', type: 'textarea', required: true, placeholder: '物理/魔法/社会规则是什么？' },
        { name: 'history', label: '历史背景', type: 'textarea', required: true, placeholder: '世界的过去发生了什么？' },
        { name: 'culture', label: '文化与社会', type: 'textarea', required: true, placeholder: '人们的价值观、习俗...' },
        { name: 'conflict', label: '核心冲突', type: 'text', required: true, placeholder: '世界的主要矛盾是什么？' },
        { name: 'uniqueFeature', label: '独特设定', type: 'text', placeholder: '这个世界最特别的是什么？' }
      ]
    });

    this.prompts.set('title', {
      type: 'title',
      title: '标题创作',
      description: '创作吸引读者的标题',
      fields: [
        { name: 'keywords', label: '核心关键词', type: 'text', required: true, placeholder: '用逗号分隔...' },
        { name: 'mood', label: '情感基调', type: 'select', options: ['悬疑', '浪漫', '恐怖', '励志', '史诗'], required: true },
        { name: 'complexity', label: '复杂度', type: 'select', options: ['简洁', '诗意', '隐喻'], required: true },
        { name: 'genre', label: '类型', type: 'select', options: ['奇幻', '科幻', '现实', '爱情', '悬疑'], required: true }
      ]
    });
  }

  getPrompt(key: string): WritingPrompt | undefined {
    return this.prompts.get(key);
  }

  getAllPrompts(): WritingPrompt[] {
    return Array.from(this.prompts.values());
  }

  getSuggestionsForContext(context: string): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (context.length < 100) {
      suggestions.push({
        id: 'opening-suggestion',
        type: 'idea',
        content: '试试用一个引人入胜的问题或意外事件作为开篇',
        tags: ['结构', '开篇'],
        priority: 3
      });
    }

    if (!context.includes('“') && !context.includes('"')) {
      suggestions.push({
        id: 'dialogue-suggestion',
        type: 'dialogue',
        content: '考虑加入对话来展示角色性格和推动情节',
        tags: ['对话', '角色'],
        priority: 2
      });
    }

    if (context.split('。').length < 5) {
      suggestions.push({
        id: 'pacing-suggestion',
        type: 'structure',
        content: '尝试添加更多的句子长度变化来调整节奏',
        tags: ['节奏', '写作技巧'],
        priority: 2
      });
    }

    return suggestions;
  }
}

/**
 * 离线智能建议系统
 */
export class OfflineSuggestionEngine {
  private templateLibrary: WritingPromptLibrary;

  constructor() {
    this.templateLibrary = new WritingPromptLibrary();
  }

  getIdeaGenerator(genre?: string): Array<{
    category: string;
    ideas: string[];
  }> {
    const commonIdeas = [
      '一个普通的日常任务中隐藏着巨大的秘密',
      '主角必须隐瞒一个重要的真相',
      '过去的错误在未来带来了后果',
      '一个看似简单的选择改变了一切',
      '陌生人的出现打乱了平静的生活'
    ];

    const genreIdeas: Record<string, string[]> = {
      fantasy: [
        '传说中的神器突然出现',
        '魔法与现代社会的碰撞',
        '被遗忘的种族或魔法回归',
        '预言中的灾难即将发生',
        '主角继承了意想不到的遗产'
      ],
      romance: [
        '两个本不该相遇的人相遇了',
        '伪装身份引发的误会与爱情',
        '从仇敌到爱人的转变',
        '重逢后发现过去的误解',
        '一段关系面临巨大考验'
      ],
      mystery: [
        '看似自杀的死亡充满疑点',
        '过去的罪行正在被揭露',
        '每个嫌疑人都有秘密',
        '主角发现自己是被陷害的',
        '证据指向了最不可能的人'
      ],
      scifi: [
        '科技带来了意想不到的后果',
        '与外星生命的接触',
        '时间旅行改变了现实',
        '未来的警告传来',
        '人工智能有了意识'
      ],
      horror: [
        '看似安全的地方暗藏恐怖',
        '诅咒正在蔓延',
        '过去的亡灵归来',
        '主角发现自己的真实身份',
        '每一个夜晚都比前一个更糟'
      ]
    };

    const selectedGenre = genre || 'fantasy';

    return [
      {
        category: '通用创意',
        ideas: commonIdeas
      },
      {
        category: `${selectedGenre}创意`,
        ideas: genreIdeas[selectedGenre] || []
      }
    ];
  }

  getCharacterSuggestions(): Suggestion[] {
    return [
      {
        id: 'char-1',
        type: 'character',
        content: '给角色一个与外表相反的内心特质',
        tags: ['人物塑造'],
        priority: 4
      },
      {
        id: 'char-2',
        type: 'character',
        content: '让角色的目标与内心渴望产生冲突',
        tags: ['人物塑造', '动机'],
        priority: 5
      },
      {
        id: 'char-3',
        type: 'character',
        content: '创造一个与主角理念相同但方法相悖的对手',
        tags: ['反派', '主题'],
        priority: 3
      }
    ];
  }

  getDialogueHelpers(): Array<{
    purpose: string;
    examples: string[];
  }> {
    return [
      {
        purpose: '展示紧张关系',
        examples: [
          '简短的问答，每一句都蕴含潜台词',
          '一方追问，一方回避',
          '使用双关语和反问'
        ]
      },
      {
        purpose: '推进情节',
        examples: [
          '揭露一个秘密',
          '下达最后通牒',
          '透露重要信息'
        ]
      },
      {
        purpose: '展现性格',
        examples: [
          '通过说话方式展现教育背景',
          '用词选择反映价值观',
          '打断、抢话、沉默都有意义'
        ]
      }
    ];
  }
}

/**
 * 完全离线创作系统
 */
export class CompleteOfflineSystem {
  private vectorizer: BasicVectorizer;
  private promptLibrary: WritingPromptLibrary;
  private suggestionEngine: OfflineSuggestionEngine;
  private savedPlots: Map<string, StoryOutline> = new Map();

  constructor() {
    this.vectorizer = new BasicVectorizer();
    this.promptLibrary = new WritingPromptLibrary();
    this.suggestionEngine = new OfflineSuggestionEngine();
  }

  /**
   * 获取写作提示
   */
  getWritingPrompt(type: string): WritingPrompt | undefined {
    return this.promptLibrary.getPrompt(type);
  }

  /**
   * 获取所有写作提示
   */
  getAllPrompts(): WritingPrompt[] {
    return this.promptLibrary.getAllPrompts();
  }

  /**
   * 生成故事大纲
   */
  generateOutline(premise: string, config: Partial<PlotGeneratorConfig> = {}): StoryOutline {
    const defaultConfig: PlotGeneratorConfig = {
      genre: 'fantasy',
      mood: 'balanced',
      complexity: 'medium',
      mainCharacterCount: 3,
      plotTwists: 1,
      ...config
    };

    const generator = new OfflinePlotGenerator(defaultConfig);
    const outline = generator.generateOutline(premise);

    this.savedPlots.set(Date.now().toString(), outline);
    return outline;
  }

  /**
   * 获取创意建议
   */
  getIdeas(genre?: string) {
    return this.suggestionEngine.getIdeaGenerator(genre);
  }

  /**
   * 获取上下文相关建议
   */
  getContextualSuggestions(context: string): Suggestion[] {
    return this.promptLibrary.getSuggestionsForContext(context);
  }

  /**
   * 获取角色建议
   */
  getCharacterSuggestions(): Suggestion[] {
    return this.suggestionEngine.getCharacterSuggestions();
  }

  /**
   * 获取对话帮助
   */
  getDialogueHelpers() {
    return this.suggestionEngine.getDialogueHelpers();
  }

  /**
   * 离线搜索
   */
  search(query: string, documents: string[], topK = 5) {
    return this.vectorizer.search(query, documents, topK);
  }

  /**
   * 获取系统状态
   */
  getStatus(): {
    availableFeatures: string[];
    promptCount: number;
    savedPlots: number;
    requiresLLM: boolean;
  } {
    return {
      availableFeatures: [
        '项目管理',
        '章节管理',
        '角色管理',
        '世界设定',
        '大纲管理',
        '思维导图',
        '七步创作法',
        '雪花创作法',
        '情节生成',
        '创意提示',
        '角色建议',
        '对话帮助',
        '基础向量搜索',
        '导入导出',
        '版本历史'
      ],
      promptCount: this.promptLibrary.getAllPrompts().length,
      savedPlots: this.savedPlots.size,
      requiresLLM: false
    };
  }
}

export const completeOfflineSystem = new CompleteOfflineSystem();

export default CompleteOfflineSystem;
