/**
 * 题材配置管理器
 * 支持所有文学题材的专属配置和模板
 */

import { 
  Genre, 
  GenreConfig, 
  FactionTemplate, 
  CharacterAttribute,
  NovelProject 
} from '../../types';

export interface GenreTemplate {
  genre: Genre;
  literaryGenre?: string;
  name: string;
  description: string;
  subgenres: string[];
  factions: FactionTemplate[];
  characterAttributes: CharacterAttribute[];
  locationTypes: string[];
  narrativeFrameworks: string[];
  powerSystem?: string;
  requiredElements: string[];
  tabooElements: string[];
  typicalArcPatterns: string[];
  recommendedLength: { min: number; max: number };
}

export class GenreConfigManager {
  private templates: Map<Genre, GenreTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    this.templates.set('fantasy', {
      genre: 'fantasy',
      name: '奇幻',
      description: '包含魔法、异世界、种族设定的虚构世界故事',
      subgenres: ['西方奇幻', '东方奇幻', '史诗奇幻', '黑暗奇幻', '幽默奇幻'],
      factions: [
        { type: 'kingdom', name: '王国', description: '人类或类人种族的国家' },
        { type: 'guild', name: '公会', description: '冒险者或职业者组织' },
        { type: 'magic_school', name: '魔法学院', description: '传授魔法的机构' },
        { type: 'ancient_lord', name: '古族', description: '古老而强大的种族' }
      ],
      characterAttributes: [
        { name: '种族', type: 'string', required: true, options: ['人类', '精灵', '矮人', '兽人', '龙族', '其他'] },
        { name: '魔法天赋', type: 'number', required: true },
        { name: '血脉', type: 'string', options: ['平民', '贵族', '皇室', '古老血脉'] }
      ],
      locationTypes: ['王城', '要塞', '森林', '山脉', '海洋', '异界', '遗迹'],
      narrativeFrameworks: ['英雄之旅', '冰与火之歌式', '勇者冒险'],
      powerSystem: '魔法等级制度',
      requiredElements: ['世界观构建', '力量体系', '种族设定'],
      tabooElements: ['现实历史直接复制', '过于黑暗的描写'],
      typicalArcPatterns: ['成长型', '复仇型', '救世型', '探索型'],
      recommendedLength: { min: 500000, max: 3000000 }
    });

    this.templates.set('xianxia', {
      genre: 'xianxia',
      name: '修仙',
      description: '东方修仙题材，追求长生和超脱的修炼之路',
      subgenres: ['古典仙侠', '现代修真', '凡人流', '系统流', '洪荒流'],
      factions: [
        { type: 'sect', name: '门派', description: '修仙宗派，有传承体系' },
        { type: 'dynasty', name: '王朝', description: '世俗皇朝势力' },
        { type: 'demon_sect', name: '魔道', description: '邪恶的修仙势力' },
        { type: 'ancient_clan', name: '古族', description: '上古血脉家族' }
      ],
      characterAttributes: [
        { name: '灵根', type: 'string', required: true, options: ['天灵根', '真灵根', '杂灵根'] },
        { name: '境界', type: 'string', required: true },
        { name: '资质', type: 'number', required: true },
        { name: '根骨', type: 'number' }
      ],
      locationTypes: ['山门', '坊市', '秘境', '洞府', '世俗王朝', '上古遗迹'],
      narrativeFrameworks: ['凡人流', '天才流', '系统流', '传统仙侠'],
      powerSystem: '境界体系（炼气、筑基、金丹、元婴、化神等）',
      requiredElements: ['境界体系', '功法设定', '门派传承', '修仙资源'],
      tabooElements: ['境界崩坏', '力量体系混乱'],
      typicalArcPatterns: ['废柴逆袭', '天才崛起', '家族复兴', '问道长生'],
      recommendedLength: { min: 800000, max: 5000000 }
    });

    this.templates.set('wuxia', {
      genre: 'wuxia',
      name: '武侠',
      description: '中国古代武林世界的江湖故事',
      subgenres: ['传统武侠', '新派武侠', '综武', '武侠修真'],
      factions: [
        { type: 'sect', name: '门派', description: '武林门派' },
        { type: 'jianghu_forces', name: '江湖势力', description: '各类江湖组织' },
        { type: 'royal_court', name: '朝廷', description: '官方势力' },
        { type: 'demon_faction', name: '魔教', description: '邪道势力' }
      ],
      characterAttributes: [
        { name: '内功', type: 'string', required: true },
        { name: '外功', type: 'string', required: true },
        { name: '暗器', type: 'list' },
        { name: '江湖名号', type: 'string' }
      ],
      locationTypes: ['山寨', '客栈', '门派山门', '朝廷', '海外', '古迹'],
      narrativeFrameworks: ['成长流', '复仇流', '争霸流', '隐世流'],
      powerSystem: '内力+招式',
      requiredElements: ['武功体系', '江湖规矩', '门派传承'],
      tabooElements: ['过于神化', '无视武林规则'],
      typicalArcPatterns: ['少年崛起', '门派兴衰', '江湖恩怨', '华山论剑'],
      recommendedLength: { min: 300000, max: 2000000 }
    });

    this.templates.set('scifi', {
      genre: 'scifi',
      name: '科幻',
      description: '基于科学技术想象的未来世界故事',
      subgenres: ['硬科幻', '软科幻', '赛博朋克', '太空歌剧', '末日科幻'],
      factions: [
        { type: 'government', name: '政府组织', description: '星际政府或联邦' },
        { type: 'corporation', name: '公司企业', description: '星际大企业' },
        { type: 'rebel', name: '反抗组织', description: '反叛势力' },
        { type: 'alien_civilization', name: '外星文明', description: '外星种族' }
      ],
      characterAttributes: [
        { name: '基因改造', type: 'string', options: ['无', '轻度', '重度'] },
        { name: '机械改造', type: 'string', options: ['无', '局部', '全身'] },
        { name: '特殊能力', type: 'list' }
      ],
      locationTypes: ['星际飞船', '空间站', '行星表面', '虚拟空间', '外星世界'],
      narrativeFrameworks: ['探索发现', '星际战争', '赛博朋克', '末日求生'],
      powerSystem: '科技+可能的异能',
      requiredElements: ['科技设定', '世界观逻辑', '星际政治'],
      tabooElements: ['科技漏洞', '违背物理常识'],
      typicalArcPatterns: ['星际探索', '人类存亡', '文明冲突', '技术革命'],
      recommendedLength: { min: 300000, max: 2000000 }
    });

    this.templates.set('romance', {
      genre: 'romance',
      name: '言情',
      description: '以爱情为核心的情感故事',
      subgenres: ['现代言情', '古代言情', '青春校园', '都市虐恋', '甜宠文'],
      factions: [
        { type: 'family', name: '家族', description: '家族势力' },
        { type: 'workplace', name: '职场', description: '工作单位' },
        { type: 'social_circle', name: '社交圈', description: '上流社会' }
      ],
      characterAttributes: [
        { name: '性格', type: 'string', required: true },
        { name: '职业', type: 'string', required: true },
        { name: '家庭背景', type: 'string' }
      ],
      locationTypes: ['都市', '校园', '豪门', '古宅', '异世界'],
      narrativeFrameworks: ['青梅竹马', '欢喜冤家', '破镜重圆', '暗恋成真'],
      powerSystem: undefined,
      requiredElements: ['感情线发展', '角色心理描写', '冲突设置'],
      tabooElements: ['过于狗血', '三观不正'],
      typicalArcPatterns: ['相遇相知', '误会分离', '重逢和解', '修成正果'],
      recommendedLength: { min: 200000, max: 1000000 }
    });

    this.templates.set('mystery', {
      genre: 'mystery',
      name: '悬疑',
      description: '以谜题和推理为核心的惊悚故事',
      subgenres: ['推理探案', '惊悚悬疑', '烧脑悬疑', '灵异悬疑'],
      factions: [
        { type: 'police', name: '执法部门', description: '警察或侦探机构' },
        { type: 'criminal', name: '犯罪组织', description: '罪犯或犯罪团伙' },
        { type: 'secret_society', name: '秘密组织', description: '神秘组织' }
      ],
      characterAttributes: [
        { name: '推理能力', type: 'number', required: true },
        { name: '专业技能', type: 'list', options: ['法医', '心理学', '黑客', '格斗'] },
        { name: '弱点', type: 'string' }
      ],
      locationTypes: ['案发现场', '密室', '孤岛', '精神病院', '古老宅邸'],
      narrativeFrameworks: ['单元剧', '连续剧', '暴风雪山庄', '心理悬疑'],
      powerSystem: undefined,
      requiredElements: ['谜题设计', '线索布置', '逻辑推理'],
      tabooElements: ['无法解释的超自然', '凶手随机选择'],
      typicalArcPatterns: ['接案调查', '线索收集', '推理突破', '真相大白'],
      recommendedLength: { min: 300000, max: 1500000 }
    });

    this.templates.set('urban', {
      genre: 'urban',
      name: '都市',
      description: '发生在现代城市背景下的故事',
      subgenres: ['都市生活', '职场商战', '都市异能', '都市神医', '黑道都市'],
      factions: [
        { type: 'corporation', name: '公司企业', description: '商业势力' },
        { type: 'family_clan', name: '家族世家', description: '大家族' },
        { type: 'underworld', name: '地下势力', description: '灰色地带' },
        { type: 'government', name: '官方力量', description: '政府机构' }
      ],
      characterAttributes: [
        { name: '身份', type: 'string', required: true },
        { name: '隐藏身份', type: 'string' },
        { name: '特殊能力', type: 'list' }
      ],
      locationTypes: ['高档小区', '商业中心', '灰色地带', '上流社会', '都市丛林'],
      narrativeFrameworks: ['扮猪吃虎', '逆袭打脸', '家族恩怨', '都市传奇'],
      powerSystem: '都市异能/隐藏身份',
      requiredElements: ['都市背景真实感', '身份对比', '现实元素'],
      tabooElements: ['脱离现实', '过于YY'],
      typicalArcPatterns: ['隐藏身份', '逐渐暴露', '势力扩张', '登顶人生巅峰'],
      recommendedLength: { min: 300000, max: 3000000 }
    });

    this.templates.set('horror', {
      genre: 'horror',
      name: '悬疑/恐怖',
      description: '以恐怖、惊悚为核心的氛围故事',
      subgenres: ['灵异恐怖', '心理恐怖', '血腥恐怖', '末日恐怖'],
      factions: [
        { type: 'supernatural', name: '超自然存在', description: '鬼魂、怪物等' },
        { type: 'occult', name: '神秘组织', description: '驱魔人、猎人等' },
        { type: 'government', name: '官方机构', description: '处理超自然事件的部门' }
      ],
      characterAttributes: [
        { name: '灵异感知', type: 'number', required: true },
        { name: '特殊体质', type: 'string' },
        { name: '恐惧来源', type: 'string' }
      ],
      locationTypes: ['古宅', '废弃建筑', '荒野', '梦境', '灵异空间'],
      narrativeFrameworks: ['逃生', '调查', '对抗', '超自然冒险'],
      powerSystem: '超自然力量',
      requiredElements: ['恐怖氛围营造', '恐惧来源设定', '生存压力'],
      tabooElements: ['恐怖突然消失', '无意义的血腥'],
      typicalArcPatterns: ['遭遇恐怖', '探索真相', '对抗/逃生', '揭露秘密'],
      recommendedLength: { min: 200000, max: 1500000 }
    });
  }

  getTemplate(genre: Genre): GenreTemplate | undefined {
    return this.templates.get(genre);
  }

  getAllTemplates(): GenreTemplate[] {
    return Array.from(this.templates.values());
  }

  getSubgenres(genre: Genre): string[] {
    return this.templates.get(genre)?.subgenres || [];
  }

  getFactions(genre: Genre): FactionTemplate[] {
    return this.templates.get(genre)?.factions || [];
  }

  getCharacterAttributes(genre: Genre): CharacterAttribute[] {
    return this.templates.get(genre)?.characterAttributes || [];
  }

  getLocationTypes(genre: Genre): string[] {
    return this.templates.get(genre)?.locationTypes || [];
  }

  getRecommendedLength(genre: Genre): { min: number; max: number } | undefined {
    return this.templates.get(genre)?.recommendedLength;
  }

  async createProjectConfig(
    genre: Genre,
    options?: { subgenre?: string; customFactions?: FactionTemplate[] }
  ): Promise<GenreConfig> {
    const template = this.templates.get(genre);
    if (!template) {
      throw new Error(`Unknown genre: ${genre}`);
    }

    return {
      genre,
      literaryGenre: 'novel',
      subgenres: options?.subgenre ? [options.subgenre] : template.subgenres,
      factions: options?.customFactions || template.factions,
      characterAttributes: template.characterAttributes,
      locationTypes: template.locationTypes,
      narrativeFrameworks: template.narrativeFrameworks,
      requiredElements: template.requiredElements,
      tabooElements: template.tabooElements,
      typicalArcPatterns: template.typicalArcPatterns,
      recommendedLength: template.recommendedLength
    };
  }

  validateCharacter(genre: Genre, character: Record<string, any>): { valid: boolean; errors: string[] } {
    const template = this.templates.get(genre);
    if (!template) {
      return { valid: false, errors: [`Unknown genre: ${genre}`] };
    }

    const errors: string[] = [];

    for (const attr of template.characterAttributes) {
      if (attr.required && !character[attr.name]) {
        errors.push(`Missing required attribute: ${attr.name}`);
      }

      if (attr.options && character[attr.name]) {
        if (!attr.options.includes(character[attr.name])) {
          errors.push(`Invalid value for ${attr.name}: ${character[attr.name]}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getWritingGuidance(genre: Genre): string {
    const template = this.templates.get(genre);
    if (!template) return '';

    return `
题材：${template.name}
类型：${template.description}

【必备元素】
${template.requiredElements.join('、')}

【禁忌元素】
${template.tabooElements.join('、')}

【典型情节模式】
${template.typicalArcPatterns.join('、')}

【推荐字数】
${(template.recommendedLength.min / 10000).toFixed(0)}-${(template.recommendedLength.max / 10000).toFixed(0)}万字

${template.powerSystem ? `【力量体系】\n${template.powerSystem}` : ''}
    `.trim();
  }

  addCustomTemplate(template: GenreTemplate): void {
    this.templates.set(template.genre, template);
  }

  updateTemplate(genre: Genre, updates: Partial<GenreTemplate>): void {
    const existing = this.templates.get(genre);
    if (existing) {
      this.templates.set(genre, { ...existing, ...updates });
    }
  }

  deleteTemplate(genre: Genre): boolean {
    return this.templates.delete(genre);
  }
}

export default GenreConfigManager;
