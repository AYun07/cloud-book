/**
 * Cloud Book - 高级全球文学配置系统
 * Nobel级文学创作支持系统
 * 
 * ============================================
 * 严谨声明
 * ============================================
 * 
 * 本系统是文学体裁和题材的结构化管理引擎，
 * 提供创作框架和一致性工具。
 * 
 * ============================================
 * v4.0深度优化
 * ============================================
 * - 30种文学体裁
 * - 100+种题材分类
 * - 长篇创作模板系统
 * - TruthFiles集成
 * - 诺贝尔级创作引导
 */

import { LiteraryGenre, Genre, Language } from '../../types';
import { AdvancedTruthFileManager } from '../TruthFiles/AdvancedTruthFileManager';

export interface GenreQuality {
  genre: Genre;
  names: Partial<Record<Language, string>>;
  descriptions: Partial<Record<Language, string>>;
  subgenres: Partial<Record<Language, string[]>>;
  examples: string[];
  regions: string[];
  characteristics: Partial<Record<Language, string[]>>;
  nobelPotential: number; // 0-100
  longFormSupport: number; // 0-100
  literaryComplexity: number; // 0-100
}

export interface LiteraryFormQuality {
  form: LiteraryGenre;
  names: Partial<Record<Language, string>>;
  descriptions: Partial<Record<Language, string>>;
  structures: Partial<Record<Language, string>>;
  formatStandards: Partial<Record<Language, string[]>>;
  requirements: Partial<Record<Language, string[]>>;
  length: { min: number; max: number; typical: number };
  nobelPotential: number; // 0-100
  examples: string[];
}

export interface GenreGuidance {
  genre: Genre;
  coreThemes: string[];
  typicalArcs: string[];
  writingGuidelines: string[];
  pitfallsToAvoid: string[];
  recommendedReading: string[];
}

export interface FormGuidance {
  form: LiteraryGenre;
  structureGuidelines: string[];
  pacingGuidelines: string[];
  characterGuidelines: string[];
  lengthRecommendations: {
    wordCount: { min: number; max: number; target: number };
  };
  complexityLevels: string[];
  formatRequirements: string[];
  styleTips: string[];
}

export class AdvancedGlobalLiteraryConfig {
  private genres: Map<Genre, GenreQuality> = new Map();
  private forms: Map<LiteraryGenre, LiteraryFormQuality> = new Map();
  private truthFileManager: AdvancedTruthFileManager;

  constructor(truthFileManager: AdvancedTruthFileManager) {
    this.truthFileManager = truthFileManager;
    this.initializeAdvancedGenres();
    this.initializeAdvancedForms();
  }

  private initializeAdvancedGenres(): void {
    // ==================== 1. 奇幻类 ====================
    this.genres.set('fantasy', {
      genre: 'fantasy',
      names: {
        'zh-CN': '奇幻',
        'en-US': 'Fantasy',
        'ja-JP': 'ファンタジー'
      },
      descriptions: {
        'zh-CN': '包含魔法、异世界、神话元素的虚构叙事',
        'en-US': 'Fiction with magical or mythological elements'
      },
      subgenres: {
        'zh-CN': ['西方奇幻', '东方奇幻', '史诗奇幻', '黑暗奇幻', '幽默奇幻', '都市奇幻', '历史奇幻', '低魔奇幻', '剑与魔法', '龙与地下城'],
        'en-US': ['High Fantasy', 'Low Fantasy', 'Epic Fantasy', 'Dark Fantasy', 'Comic Fantasy', 'Urban Fantasy', 'Historical Fantasy', 'Sword and Sorcery', 'D&D']
      },
      examples: ['The Lord of the Rings', 'Harry Potter', 'A Song of Ice and Fire'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['魔法', '异世界', '种族设定', '英雄之旅'],
        'en-US': ['Magic systems', 'Other worlds', 'Racial diversity', 'Heroic journey']
      },
      nobelPotential: 45,
      longFormSupport: 95,
      literaryComplexity: 65
    });

    // ==================== 2. 科幻类 ====================
    this.genres.set('scifi', {
      genre: 'scifi',
      names: {
        'zh-CN': '科幻',
        'en-US': 'Science Fiction'
      },
      descriptions: {
        'zh-CN': '基于科学原理和技术想象的未来叙事',
        'en-US': 'Fiction based on science and technology'
      },
      subgenres: {
        'zh-CN': ['硬科幻', '软科幻', '太空歌剧', '赛博朋克', '后末日', '时间旅行', '平行宇宙', '生物朋克', '蒸汽朋克', '外星题材', '火星题材'],
        'en-US': ['Hard SF', 'Soft SF', 'Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Time Travel', 'Alternate History', 'Biopunk', 'Steampunk', 'Alien Contact', 'Mars Fiction']
      },
      examples: ['Dune', 'Neuromancer', 'Foundation', 'Brave New World'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['科技设定', '未来世界', '宇宙探索'],
        'en-US': ['Technology focus', 'Future settings', 'Space exploration']
      },
      nobelPotential: 70,
      longFormSupport: 90,
      literaryComplexity: 75
    });

    // ==================== 3. 文学小说 ====================
    this.genres.set('literary_fiction', {
      genre: 'literary_fiction',
      names: {
        'zh-CN': '纯文学',
        'en-US': 'Literary Fiction'
      },
      descriptions: {
        'zh-CN': '注重艺术价值和深层意义的严肃文学',
        'en-US': 'Serious fiction emphasizing artistic value'
      },
      subgenres: {
        'zh-CN': ['现实主义', '意识流', '心理小说', '魔幻现实主义', '元小说', '后现代', '成长小说'],
        'en-US': ['Realism', 'Magical Realism', 'Metafiction', 'Postmodern', 'Bildungsroman', 'Psychological Fiction', 'Stream of Consciousness']
      },
      examples: ['One Hundred Years of Solitude', 'Beloved', 'The Remains of the Day'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['艺术性', '深度主题', '语言技巧'],
        'en-US': ['Artistic merit', 'Deep themes', 'Linguistic technique']
      },
      nobelPotential: 98,
      longFormSupport: 95,
      literaryComplexity: 98
    });

    // ==================== 4. 历史小说 ====================
    this.genres.set('historical', {
      genre: 'historical',
      names: {
        'zh-CN': '历史',
        'en-US': 'Historical Fiction'
      },
      descriptions: {
        'zh-CN': '以真实历史时期为背景的叙事',
        'en-US': 'Fiction set in historical periods'
      },
      subgenres: {
        'zh-CN': ['古代史', '中世纪', '近代史', '历史悬疑', '历史言情', '历史奇幻', '历史军事', '历史人物'],
        'en-US': ['Ancient History', 'Medieval', 'Early Modern', 'Historical Mystery', 'Historical Romance', 'Historical Fantasy', 'Military Historical', 'Historical Biography']
      },
      examples: ['Wolf Hall', 'The Pillars of the Earth'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['历史背景', '时代细节', '史实融合'],
        'en-US': ['Historical accuracy', 'Period details']
      },
      nobelPotential: 85,
      longFormSupport: 98,
      literaryComplexity: 80
    });

    // ==================== 5. 推理悬疑 ====================
    this.genres.set('mystery', {
      genre: 'mystery',
      names: {
        'zh-CN': '推理悬疑',
        'en-US': 'Mystery/Detective'
      },
      descriptions: {
        'zh-CN': '以解谜为核心的叙事',
        'en-US': 'Fiction centered on puzzles'
      },
      subgenres: {
        'zh-CN': ['推理侦探', '密室推理', '心理悬疑', '历史推理', '警察程序', '间谍推理', '犯罪小说'],
        'en-US': ['Cozy Mystery', 'Hardboiled Detective', 'Police Procedural', 'Legal Thriller', 'Medical Thriller', 'Historical Mystery', 'Locked Room Mystery', 'Spy Thriller']
      },
      examples: ['Sherlock Holmes', 'The Big Sleep'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['线索', '推理', '反转'],
        'en-US': ['Clues', 'Deduction', 'Twists']
      },
      nobelPotential: 40,
      longFormSupport: 80,
      literaryComplexity: 55
    });

    // ==================== 6. 浪漫爱情 ====================
    this.genres.set('romance', {
      genre: 'romance',
      names: {
        'zh-CN': '浪漫爱情',
        'en-US': 'Romance'
      },
      descriptions: {
        'zh-CN': '以爱情为核心的叙事',
        'en-US': 'Fiction centered on romantic love'
      },
      subgenres: {
        'zh-CN': ['现代言情', '历史言情', '奇幻言情', '科幻言情', '禁忌恋', '虐恋', '甜宠', '霸道总裁', '青春爱情', '百合', 'BL'],
        'en-US': ['Contemporary Romance', 'Historical Romance', 'Paranormal Romance', 'Science Fiction Romance', 'Erotic Romance', 'LGBTQ+ Romance', 'Romantic Suspense', 'Chick Lit']
      },
      examples: ['Pride and Prejudice', 'The Notebook'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['感情线', '情感发展', 'Happy Ending'],
        'en-US': ['Emotional arc', 'Character development', 'HEA']
      },
      nobelPotential: 45,
      longFormSupport: 85,
      literaryComplexity: 45
    });

    // ==================== 7. 恐怖惊悚 ====================
    this.genres.set('horror', {
      genre: 'horror',
      names: {
        'zh-CN': '恐怖惊悚',
        'en-US': 'Horror'
      },
      descriptions: {
        'zh-CN': '以恐惧和紧张为核心氛围的叙事',
        'en-US': 'Fiction intended to scare and unsettle'
      },
      subgenres: {
        'zh-CN': ['超自然恐怖', '心理恐怖', '身体恐怖', '宇宙恐怖', '哥特式', '恐怖喜剧'],
        'en-US': ['Supernatural Horror', 'Psychological Horror', 'Body Horror', 'Cosmic Horror', 'Gothic Horror', 'Slasher Horror', 'Comic Horror']
      },
      examples: ['The Shining', 'It', 'Lovecraft stories'],
      regions: ['Western', 'Global'],
      characteristics: {
        'zh-CN': ['恐惧营造', '恐怖元素', '心理压迫'],
        'en-US': ['Atmosphere', 'Fear factors', 'Psychological tension']
      },
      nobelPotential: 35,
      longFormSupport: 75,
      literaryComplexity: 50
    });

    // ==================== 8. 武侠 ====================
    this.genres.set('wuxia', {
      genre: 'wuxia',
      names: {
        'zh-CN': '武侠',
        'en-US': 'Wuxia (Martial Arts)'
      },
      descriptions: {
        'zh-CN': '中国传统武术世界',
        'en-US': 'Chinese martial arts fiction'
      },
      subgenres: {
        'zh-CN': ['传统武侠', '新派武侠', '综武', '武侠修真'],
        'en-US': ['Classic Wuxia', 'New Wave Wuxia', 'Crossover Wuxia', 'Xianxia-adjacent']
      },
      examples: ['The Legend of the Condor Heroes'],
      regions: ['China', 'East Asia'],
      characteristics: {
        'zh-CN': ['武功', '江湖', '侠义'],
        'en-US': ['Martial arts', 'Jianghu', 'Chivalry']
      },
      nobelPotential: 30,
      longFormSupport: 98,
      literaryComplexity: 55
    });

    // ==================== 9. 仙侠 ====================
    this.genres.set('xianxia', {
      genre: 'xianxia',
      names: {
        'zh-CN': '仙侠/修真',
        'en-US': 'Xianxia (Cultivation Fantasy)'
      },
      descriptions: {
        'zh-CN': '修仙题材，追求长生',
        'en-US': 'Chinese cultivation fantasy'
      },
      subgenres: {
        'zh-CN': ['古典仙侠', '现代修真', '凡人流', '系统流', '洪荒流', '仙侠种田流', '仙侠后宫', '仙侠修真'],
        'en-US': ['Classic Xianxia', 'System Apocalypse', 'Reversed Cultivation', 'Cultivation', 'Xianxia Farming', 'Xianxia Harem']
      },
      examples: ['Coiling Dragon', 'A Record of a Mortal\'s Journey'],
      regions: ['China', 'Global'],
      characteristics: {
        'zh-CN': ['修仙', '境界', '灵根', '功法'],
        'en-US': ['Cultivation', 'Realms', 'Spirit roots', 'Techniques']
      },
      nobelPotential: 25,
      longFormSupport: 100,
      literaryComplexity: 50
    });

    // ==================== 10. 轻小说 ====================
    this.genres.set('light_novel', {
      genre: 'light_novel',
      names: {
        'zh-CN': '轻小说',
        'en-US': 'Light Novel'
      },
      descriptions: {
        'zh-CN': '日本风格快餐文学',
        'en-US': 'Japanese light fiction'
      },
      subgenres: {
        'zh-CN': ['校园日常', '异世界转生', '恋爱喜剧', '战斗冒险', '后宫', '伪娘', '伪娘', '都市异能'],
        'en-US': ['School Life', 'Isekai', 'Romantic Comedy', 'Action/Adventure', 'Harem', 'Crossdressing', 'Urban Fantasy']
      },
      examples: ['Sword Art Online', 'Re:Zero', 'Konosuba'],
      regions: ['Japan', 'China'],
      characteristics: {
        'zh-CN': ['插画', '轻松', '连载'],
        'en-US': ['Illustrations', 'Easy reading', 'Serialization']
      },
      nobelPotential: 15,
      longFormSupport: 95,
      literaryComplexity: 35
    });

    // ==================== 11. 同人 ====================
    this.genres.set('fanfiction', {
      genre: 'fanfiction',
      names: {
        'zh-CN': '同人',
        'en-US': 'Fan Fiction'
      },
      descriptions: {
        'zh-CN': '基于已有作品',
        'en-US': 'Fiction based on existing works'
      },
      subgenres: {
        'zh-CN': ['同人小说', '跨界同人', '平行世界', 'CP配对'],
        'en-US': ['Ficlet', 'Crossover', 'Alternate Universe', 'Shipping']
      },
      examples: ['Archive of Our Own', 'FanFiction.net works'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['衍生', 'OC', 'CP配对'],
        'en-US': ['Derivative', 'Original Characters', 'Shipping']
      },
      nobelPotential: 10,
      longFormSupport: 80,
      literaryComplexity: 30
    });

    // ==================== 12. 都市 ====================
    this.genres.set('urban', {
      genre: 'urban',
      names: {
        'zh-CN': '都市',
        'en-US': 'Urban Fiction'
      },
      descriptions: {
        'zh-CN': '现代城市背景',
        'en-US': 'Contemporary fiction set in cities'
      },
      subgenres: {
        'zh-CN': ['都市生活', '职场商战', '都市异能', '都市神医', '黑道都市', '都市爱情', '豪门', '都市重生'],
        'en-US': ['Chick Lit', 'Lad Lit', 'Urban Fantasy', 'Urban Medical', 'Mafia Urban', 'Urban Romance', 'Wealth Fiction']
      },
      examples: ['American Psycho', 'Bright Lights, Big City'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['现代', '城市', '现实'],
        'en-US': ['Modern setting', 'City life', 'Contemporary issues']
      },
      nobelPotential: 55,
      longFormSupport: 90,
      literaryComplexity: 60
    });

    // ==================== 13. 军事 ====================
    this.genres.set('military', {
      genre: 'military',
      names: {
        'zh-CN': '军事',
        'en-US': 'Military Fiction'
      },
      descriptions: {
        'zh-CN': '军事战争相关',
        'en-US': 'Fiction dealing with military topics'
      },
      subgenres: {
        'zh-CN': ['战争故事', '战场英雄', '战略指挥', '特种部队', '军事历史', '军事科幻'],
        'en-US': ['War Fiction', 'Battle', 'Techno-Military', 'Air Combat', 'Historical Military', 'Military Sci-Fi']
      },
      examples: ['The Hunt for Red October', 'Band of Brothers'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['军事', '战争', '策略'],
        'en-US': ['Military accuracy', 'Combat', 'Strategy']
      },
      nobelPotential: 60,
      longFormSupport: 85,
      literaryComplexity: 65
    });

    // ==================== 14. 游戏 ====================
    this.genres.set('gaming', {
      genre: 'gaming',
      names: {
        'zh-CN': '游戏',
        'en-US': 'Gaming Fiction'
      },
      descriptions: {
        'zh-CN': '游戏世界',
        'en-US': 'Fiction related to video games'
      },
      subgenres: {
        'zh-CN': ['电竞', '游戏世界', '游戏系统', '虚拟游戏', '游戏冒险', '游戏竞技'],
        'en-US': ['Esports', 'VR/Game World', 'Game Mechanic Focus', 'Virtual Games', 'Game Adventure']
      },
      examples: ['Sword Art Online', 'Ready Player One'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['游戏', '虚拟世界', '升级'],
        'en-US': ['Gaming elements', 'Virtual worlds', 'Leveling']
      },
      nobelPotential: 25,
      longFormSupport: 90,
      literaryComplexity: 40
    });

    // ==================== 15. 喜剧 ====================
    this.genres.set('comedy', {
      genre: 'comedy',
      names: {
        'zh-CN': '喜剧',
        'en-US': 'Comedy'
      },
      descriptions: {
        'zh-CN': '以幽默和娱乐',
        'en-US': 'Fiction intended to amuse'
      },
      subgenres: {
        'zh-CN': ['恶搞', '黑色幽默', '浪漫喜剧', '讽刺', '喜剧冒险', '轻松喜剧'],
        'en-US': ['Slapstick', 'Dark Comedy', 'Romantic Comedy', 'Satire', 'Parody', 'Comedy Adventure']
      },
      examples: ['Catch-22', 'Good Omens', 'Discworld series'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['幽默', '讽刺', '娱乐'],
        'en-US': ['Humor', 'Satire', 'Entertainment']
      },
      nobelPotential: 50,
      longFormSupport: 85,
      literaryComplexity: 55
    });

    // ==================== 16. 穿越重生 ====================
    this.genres.set('transmigration', {
      genre: 'transmigration',
      names: {
        'zh-CN': '穿越/重生',
        'en-US': 'Transmigration/Regression'
      },
      descriptions: {
        'zh-CN': '主角穿越或重生',
        'en-US': 'Stories involving transmigration'
      },
      subgenres: {
        'zh-CN': ['回归流', '穿越流', '系统流', '时间循环', '重生'],
        'en-US': ['Regression', 'Transmigration', 'Time Loop', 'System Apocalypse', 'Reincarnation']
      },
      examples: ['Mother of Learning', 'Omniscient Reader Viewpoint'],
      regions: ['China', 'Korea', 'Japan'],
      characteristics: {
        'zh-CN': ['穿越', '重生', '先知'],
        'en-US': ['Awakening', 'Foresight', 'Second chance']
      },
      nobelPotential: 30,
      longFormSupport: 98,
      literaryComplexity: 45
    });

    // ==================== 17. 都市异能 ====================
    this.genres.set('urban_wizard', {
      genre: 'urban_wizard',
      names: {
        'zh-CN': '都市异能',
        'en-US': 'Urban Fantasy'
      },
      descriptions: {
        'zh-CN': '现代都市中的超自然',
        'en-US': 'Supernatural elements in modern cities'
      },
      subgenres: {
        'zh-CN': ['都市巫师', '吸血鬼', '狼人', '天使恶魔'],
        'en-US': ['Vampire', 'Werewolf', 'Witchcraft', 'Angel/Demon', 'Superhero']
      },
      examples: ['The Dresden Files', 'American Gods', 'Neverwhere'],
      regions: ['Western', 'Global'],
      characteristics: {
        'zh-CN': ['都市', '异能', '魔法'],
        'en-US': ['Urban setting', 'Supernatural powers', 'Magic']
      },
      nobelPotential: 40,
      longFormSupport: 90,
      literaryComplexity: 55
    });

    // ==================== 18. 心理 ====================
    this.genres.set('psychological', {
      genre: 'psychological',
      names: {
        'zh-CN': '心理小说',
        'en-US': 'Psychological Fiction'
      },
      descriptions: {
        'zh-CN': '深入探索人物心理',
        'en-US': 'Fiction exploring human psychology'
      },
      subgenres: {
        'zh-CN': ['心理小说', '意识流', '精神分析', '心理惊悚'],
        'en-US': ['Psychological Thriller', 'Stream of Consciousness', 'Psychological Suspense', 'Dysfunctional']
      },
      examples: ['The Yellow Wallpaper', 'Fight Club', 'Gone Girl'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['心理', '内心', '精神'],
        'en-US': ['Inner world', 'Mental processes', 'Identity']
      },
      nobelPotential: 85,
      longFormSupport: 80,
      literaryComplexity: 90
    });

    // ==================== 19. 动作冒险 ====================
    this.genres.set('action', {
      genre: 'action',
      names: {
        'zh-CN': '动作冒险',
        'en-US': 'Action Adventure'
      },
      descriptions: {
        'zh-CN': '激烈动作场景',
        'en-US': 'Fiction centered on action and adventure'
      },
      subgenres: {
        'zh-CN': ['动作冒险', '战斗', '追逐', '极限运动', '冒险探索', '冒险生存'],
        'en-US': ['Action-Adventure', 'Combat', 'Chase', 'Extreme Sports', 'Adventure', 'Survival']
      },
      examples: ['The Bourne Identity', 'Jack Reacher'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['动作场面', '紧张刺激', '快节奏'],
        'en-US': ['Action sequences', 'Tension', 'Fast pacing']
      },
      nobelPotential: 35,
      longFormSupport: 90,
      literaryComplexity: 50
    });

    // ==================== 20. 生存 ====================
    this.genres.set('survival', {
      genre: 'survival',
      names: {
        'zh-CN': '生存',
        'en-US': 'Survival Fiction'
      },
      descriptions: {
        'zh-CN': '主角在极端环境中',
        'en-US': 'Stories of characters surviving'
      },
      subgenres: {
        'zh-CN': ['末日生存', '荒野求生', '灾难求生', '极限生存', '求生游戏', '生存挑战'],
        'en-US': ['Post-Apocalyptic', 'Wilderness', 'Disaster', 'Extreme', 'Survival Games', 'Challenges']
      },
      examples: ['The Martian', 'Hatchet', 'World War Z'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['求生技能', '资源匮乏', '极端环境'],
        'en-US': ['Survival skills', 'Resource scarcity', 'Extreme']
      },
      nobelPotential: 55,
      longFormSupport: 85,
      literaryComplexity: 60
    });

    // ==================== 21. 末日/后启示 ====================
    this.genres.set('post_apocalyptic', {
      genre: 'post_apocalyptic',
      names: {
        'zh-CN': '末日/后启示录',
        'en-US': 'Post-Apocalyptic'
      },
      descriptions: {
        'zh-CN': '世界灾难后的叙事',
        'en-US': 'Stories after catastrophic event'
      },
      subgenres: {
        'zh-CN': ['核末日', '病毒末日', '自然灾难', '社会崩溃', '末日丧尸', '末日生存', '末日求生'],
        'en-US': ['Nuclear', 'Viral', 'Natural', 'Social Collapse', 'Zombie', 'Survival']
      },
      examples: ['The Road', 'Station Eleven', 'The Last of Us'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['末日背景', '文明崩溃', '资源争夺'],
        'en-US': ['Apocalyptic backdrop', 'Civilization', 'Resource scarcity']
      },
      nobelPotential: 60,
      longFormSupport: 88,
      literaryComplexity: 70
    });

    // ==================== 22. 反乌托邦 ====================
    this.genres.set('dystopian', {
      genre: 'dystopian',
      names: {
        'zh-CN': '反乌托邦',
        'en-US': 'Dystopian'
      },
      descriptions: {
        'zh-CN': '描绘压迫社会',
        'en-US': 'Fiction depicting oppressive societies'
      },
      subgenres: {
        'zh-CN': ['极权社会', '科技监控', '社会分层', '反抗', '反乌托邦', '未来世界'],
        'en-US': ['Totalitarian', 'Tech Surveillance', 'Social Stratification', 'Resistance', 'Dystopia', 'Future']
      },
      examples: ['1984', 'Brave New World', 'The Hunger Games', 'Fahrenheit 451'],
      regions: ['Western', 'Global'],
      characteristics: {
        'zh-CN': ['压迫', '控制', '反抗', '警示'],
        'en-US': ['Oppression', 'Control', 'Resistance', 'Warning']
      },
      nobelPotential: 75,
      longFormSupport: 85,
      literaryComplexity: 80
    });

    // ==================== 23. 神话传说 ====================
    this.genres.set('mythology', {
      genre: 'mythology',
      names: {
        'zh-CN': '神话传说',
        'en-US': 'Mythology/Legend'
      },
      descriptions: {
        'zh-CN': '基于神话传说',
        'en-US': 'Fiction based on mythological'
      },
      subgenres: {
        'zh-CN': ['希腊神话', '北欧神话', '中国神话', '埃及神话', '凯尔特神话', '印度神话', '神话重述'],
        'en-US': ['Greek', 'Norse', 'Chinese', 'Egyptian', 'Celtic', 'Indian', 'Myth Retelling']
      },
      examples: ['Percy Jackson', 'American Gods', 'Norse Mythology'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['神祇', '英雄', '魔法', '史诗'],
        'en-US': ['Divine beings', 'Heroes', 'Magic', 'Epic']
      },
      nobelPotential: 70,
      longFormSupport: 90,
      literaryComplexity: 75
    });

    // ==================== 24. 民间传说 ====================
    this.genres.set('folklore', {
      genre: 'folklore',
      names: {
        'zh-CN': '民间传说',
        'en-US': 'Folklore'
      },
      descriptions: {
        'zh-CN': '基于民间故事',
        'en-US': 'Literature based on folk tales'
      },
      subgenres: {
        'zh-CN': ['民间故事', '妖精传说', '鬼怪故事', '地方传说', '民间童话', '民间神话'],
        'en-US': ['Folk tales', 'Fairy lore', 'Ghost stories', 'Local legends', 'Folklore', 'Folklore Retellings']
      },
      examples: ['Grimm\'s Fairy Tales', 'Arabian Nights', 'Japanese Yokai'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['传统', '民俗', '超自然', '道德寓意'],
        'en-US': ['Tradition', 'Folklore', 'Supernatural', 'Moral lessons']
      },
      nobelPotential: 65,
      longFormSupport: 80,
      literaryComplexity: 65
    });

    // ==================== 25. 超级英雄 ====================
    this.genres.set('superhero', {
      genre: 'superhero',
      names: {
        'zh-CN': '超级英雄',
        'en-US': 'Superhero'
      },
      descriptions: {
        'zh-CN': '拥有超能力的英雄',
        'en-US': 'Stories of heroes with extraordinary powers'
      },
      subgenres: {
        'zh-CN': ['DC风格', 'Marvel风格', '日式英雄', '黑暗英雄', '英雄史诗', '英雄起源'],
        'en-US': ['DC-style', 'Marvel-style', 'Tokusatsu', 'Dark Hero', 'Hero Epic', 'Hero Origin']
      },
      examples: ['Watchmen', 'The Boys', 'Invincible'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['超能力', '英雄使命', '反派', '正义'],
        'en-US': ['Superpowers', 'Heroic mission', 'Villains', 'Justice']
      },
      nobelPotential: 30,
      longFormSupport: 90,
      literaryComplexity: 45
    });

    // ==================== 26. 惊悚 ====================
    this.genres.set('thriller', {
      genre: 'thriller',
      names: {
        'zh-CN': '惊悚',
        'en-US': 'Thriller'
      },
      descriptions: {
        'zh-CN': '紧张和期待',
        'en-US': 'Fiction designed to create tension'
      },
      subgenres: {
        'zh-CN': ['心理惊悚', '间谍惊悚', '法律惊悚', '技术惊悚', '恐怖惊悚', '科技惊悚', '间谍小说'],
        'en-US': ['Psychological Thriller', 'Espionage', 'Legal', 'Techno', 'Horror', 'Spy']
      },
      examples: ['Gone Girl', 'The Da Vinci Code', 'John le Carré'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['悬念', '紧张', '未知', '期待'],
        'en-US': ['Tension', 'Anticipation', 'Uncertainty', 'Suspense']
      },
      nobelPotential: 45,
      longFormSupport: 85,
      literaryComplexity: 55
    });

    // ==================== 27. 赛博朋克 ====================
    this.genres.set('cyberpunk', {
      genre: 'cyberpunk',
      names: {
        'zh-CN': '赛博朋克',
        'en-US': 'Cyberpunk'
      },
      descriptions: {
        'zh-CN': '高科技与低生活结合',
        'en-US': 'High tech, low life futuristic setting'
      },
      subgenres: {
        'zh-CN': ['网络朋克', '赛博都市', '黑客文化', '神经朋克', '生物朋克', '后赛博朋克'],
        'en-US': ['Cyberpunk noir', 'Megacity', 'Hacker culture', 'Neuropunk', 'Biopunk', 'Post-Cyberpunk']
      },
      examples: ['Neuromancer', 'Snow Crash', 'Blade Runner', 'Cyberpunk 2077'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['高科技', '网络', '反乌托邦', '身体改造'],
        'en-US': ['High technology', 'Cyberspace', 'Dystopia', 'Body modification']
      },
      nobelPotential: 55,
      longFormSupport: 85,
      literaryComplexity: 65
    });

    // ==================== 28. 太空歌剧 ====================
    this.genres.set('space_opera', {
      genre: 'space_opera',
      names: {
        'zh-CN': '太空歌剧',
        'en-US': 'Space Opera'
      },
      descriptions: {
        'zh-CN': '太空探索和星际冲突',
        'en-US': 'Epic stories of space and interstellar'
      },
      subgenres: {
        'zh-CN': ['星际战争', '太空冒险', '星际政治', '银河传说', '太空史诗', '太空军事'],
        'en-US': ['Space warfare', 'Space adventure', 'Interstellar politics', 'Galactic saga', 'Space epic', 'Space military']
      },
      examples: ['Star Wars', 'The Expanse', 'Foundation', 'Hyperion'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['星际', '战争', '冒险', '宏大叙事'],
        'en-US': ['Interstellar', 'Conflict', 'Adventure', 'Grand scale']
      },
      nobelPotential: 60,
      longFormSupport: 98,
      literaryComplexity: 70
    });

    // ==================== 29. 异世界 ====================
    this.genres.set('isekai', {
      genre: 'isekai',
      names: {
        'zh-CN': '异世界',
        'en-US': 'Isekai'
      },
      descriptions: {
        'zh-CN': '主角穿越到异世界',
        'en-US': 'Stories of protagonist transported to another world'
      },
      subgenres: {
        'zh-CN': ['转生异世界', '穿越异世界', '异世界种田', '异世界冒险', '异世界系统', '异世界后宫', '异世界魔法', '异世界勇者'],
        'en-US': ['Reincarnated', 'Transported', 'Isekai farming', 'Isekai adventure', 'Isekai system', 'Isekai harem', 'Isekai magic', 'Isekai hero']
      },
      examples: ['Sword Art Online', 'That Time I Got Reincarnated', 'Overlord'],
      regions: ['Japan', 'China', 'Korea', 'Global'],
      characteristics: {
        'zh-CN': ['异世界', '穿越', '冒险', '成长'],
        'en-US': ['Another world', 'Transmigration', 'Adventure', 'Growth']
      },
      nobelPotential: 20,
      longFormSupport: 100,
      literaryComplexity: 40
    });

    // ==================== 30. 冒险 ====================
    this.genres.set('adventure', {
      genre: 'adventure',
      names: {
        'zh-CN': '冒险',
        'en-US': 'Adventure'
      },
      descriptions: {
        'zh-CN': '探索和冒险',
        'en-US': 'Fiction centered on exploration and adventure'
      },
      subgenres: {
        'zh-CN': ['探险', '生存冒险', '夺宝', '荒野', '冒险旅行', '冒险史诗'],
        'en-US': ['Exploration', 'Survival Adventure', 'Treasure Hunting', 'Wilderness', 'Adventure Travel', 'Epic Adventure']
      },
      examples: ['Treasure Island', 'The Lost City', 'Into the Wild'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['探索', '发现', '挑战'],
        'en-US': ['Exploration', 'Discovery', 'Challenge']
      },
      nobelPotential: 50,
      longFormSupport: 90,
      literaryComplexity: 55
    });
  }

  private initializeAdvancedForms(): void {
    // ==================== 1. 长篇小说 ====================
    this.forms.set('novel', {
      form: 'novel',
      names: {
        'zh-CN': '长篇小说',
        'en-US': 'Novel'
      },
      descriptions: {
        'zh-CN': '篇幅较长的虚构散文叙事作品，通常包含复杂的情节和角色发展',
        'en-US': 'Extended fictional prose narrative, usually with complex plot and character development'
      },
      structures: {
        'zh-CN': '章节结构，可包含多卷，通常有开端、发展、高潮、结局',
        'en-US': 'Chapter-based, can be multi-volume, usually with beginning, development, climax, resolution'
      },
      formatStandards: {
        'zh-CN': [
          '每章3000-5000字',
          '段落长度适中，2-8句为一段',
          '对话独立成行',
          '卷首可以有序言或题记',
          '章节标题清晰明确'
        ],
        'en-US': [
          'Chapters 3000-5000 words',
          'Moderate paragraph length, 2-8 sentences per paragraph',
          'Dialogue on separate lines',
          'Volumes may have preface or epigraph',
          'Clear chapter titles'
        ]
      },
      requirements: {
        'zh-CN': [
          '完整的叙事结构',
          '鲜明的人物塑造',
          '引人入胜的情节',
          '连贯的主题思想',
          '适当的背景设定'
        ],
        'en-US': [
          'Complete narrative structure',
          'Distinct character development',
          'Engaging plot',
          'Cohesive theme',
          'Appropriate setting'
        ]
      },
      length: { min: 40000, max: 10000000, typical: 100000 },
      nobelPotential: 98,
      examples: [
        '《战争与和平》- 托尔斯泰',
        '《百年孤独》- 马尔克斯',
        '《红楼梦》- 曹雪芹',
        'One Hundred Years of Solitude - Gabriel García Márquez',
        'War and Peace - Leo Tolstoy'
      ]
    });

    // ==================== 2. 短篇小说 ====================
    this.forms.set('short_story', {
      form: 'short_story',
      names: {
        'zh-CN': '短篇小说',
        'en-US': 'Short Story'
      },
      descriptions: {
        'zh-CN': '篇幅较短的叙事作品，通常聚焦于单一场景或事件',
        'en-US': 'Brief fictional narrative, usually focused on single scene or event'
      },
      structures: {
        'zh-CN': '单一场景，简洁结构，通常有明确的开端、发展和结尾',
        'en-US': 'Single scene, compact structure, usually with clear beginning, development, and ending'
      },
      formatStandards: {
        'zh-CN': [
          '篇幅精炼，通常1000-10000字',
          '聚焦单一主题或场景',
          '情节简洁但不简单',
          '结尾往往出人意料或意味深长',
          '语言精炼，避免冗余'
        ],
        'en-US': [
          'Concise length, typically 1000-10000 words',
          'Focused on single theme or scene',
          'Simple but not simplistic plot',
          'Often with unexpected or profound ending',
          'Refined language, avoiding redundancy'
        ]
      },
      requirements: {
        'zh-CN': [
          '主题鲜明',
          '人物塑造虽少但深刻',
          '情节紧凑',
          '结尾有力',
          '留白艺术'
        ],
        'en-US': [
          'Clear theme',
          'Deep character despite few characters',
          'Tight plot',
          'Powerful ending',
          'Art of implication'
        ]
      },
      length: { min: 1000, max: 30000, typical: 7500 },
      nobelPotential: 85,
      examples: [
        '《变形记》- 卡夫卡',
        '《老人与海》- 海明威',
        '《桥边的老人》- 海明威',
        'The Metamorphosis - Franz Kafka',
        'The Old Man and the Sea - Ernest Hemingway',
        'The Gift of the Magi - O. Henry'
      ]
    });

    // ==================== 3. 中篇小说 ====================
    this.forms.set('novella', {
      form: 'novella',
      names: {
        'zh-CN': '中篇小说',
        'en-US': 'Novella'
      },
      descriptions: {
        'zh-CN': '介于长篇和短篇之间的小说，篇幅通常20000-50000字',
        'en-US': 'Fiction between short story and novel, typically 20000-50000 words'
      },
      structures: {
        'zh-CN': '可包含多个章节，结构介于短篇和长篇之间',
        'en-US': 'Multi-chapter possible, structure between short and novel'
      },
      formatStandards: {
        'zh-CN': [
          '篇幅20000-50000字',
          '可分章节，每章2000-4000字',
          '情节相对集中',
          '人物关系相对简单',
          '主题深度适中'
        ],
        'en-US': [
          'Length 20000-50000 words',
          'Can be divided into chapters, each 2000-4000 words',
          'Relatively focused plot',
          'Relatively simple character relationships',
          'Moderate thematic depth'
        ]
      },
      requirements: {
        'zh-CN': [
          '完整的故事弧线',
          '人物发展清晰',
          '主题深入但不过于复杂',
          '节奏控制得当',
          '结尾圆满'
        ],
        'en-US': [
          'Complete story arc',
          'Clear character development',
          'Deep but not overly complex theme',
          'Proper pacing',
          'Satisfying ending'
        ]
      },
      length: { min: 20000, max: 50000, typical: 30000 },
      nobelPotential: 90,
      examples: [
        '《老人与海》- 海明威',
        '《动物庄园》- 乔治·奥威尔',
        'The Old Man and the Sea - Ernest Hemingway',
        'Animal Farm - George Orwell',
        'Of Mice and Men - John Steinbeck'
      ]
    });

    // ==================== 4. 诗歌 ====================
    this.forms.set('poetry', {
      form: 'poetry',
      names: {
        'zh-CN': '诗歌',
        'en-US': 'Poetry'
      },
      descriptions: {
        'zh-CN': '运用押韵、意象和节奏的文学作品',
        'en-US': 'Literature using rhyme, imagery and meter'
      },
      structures: {
        'zh-CN': '分行组织，可分节，结构灵活多变',
        'en-US': 'Lines and stanzas, flexible structure'
      },
      formatStandards: {
        'zh-CN': [
          '分行书写，表达停顿和节奏',
          '可分节，节之间有逻辑或情感联系',
          '可使用押韵、对仗等修辞',
          '意象鲜明，语言凝练',
          '可标注诗歌标题'
        ],
        'en-US': [
          'Line breaks to express pause and rhythm',
          'Can be divided into stanzas with logical or emotional connection',
          'Can use rhyme, parallelism and other rhetoric',
          'Vivid imagery, concise language',
          'Can include title'
        ]
      },
      requirements: {
        'zh-CN': [
          '意象鲜明',
          '情感真挚',
          '语言凝练',
          '节奏感强',
          '有深层意蕴'
        ],
        'en-US': [
          'Vivid imagery',
          'Sincere emotion',
          'Concise language',
          'Strong sense of rhythm',
          'Deep connotation'
        ]
      },
      length: { min: 10, max: 10000, typical: 500 },
      nobelPotential: 98,
      examples: [
        '《静夜思》- 李白',
        '《再别康桥》- 徐志摩',
        '《致橡树》- 舒婷',
        'The Road Not Taken - Robert Frost',
        'I Wandered Lonely as a Cloud - William Wordsworth'
      ]
    });

    // ==================== 5. 俳句 ====================
    this.forms.set('haiku', {
      form: 'haiku',
      names: {
        'zh-CN': '俳句',
        'en-US': 'Haiku'
      },
      descriptions: {
        'zh-CN': '日本传统诗歌形式，以简洁语言捕捉瞬间意象',
        'en-US': 'Traditional Japanese poetic form capturing momentary image in concise language'
      },
      structures: {
        'zh-CN': '三行，5-7-5音节格式，包含季语',
        'en-US': 'Three lines, 5-7-5 syllable pattern, including kigo (season word)'
      },
      formatStandards: {
        'zh-CN': [
          '三行格式：5音-7音-5音',
          '包含季语（季节词）',
          '意境深远，语言简洁',
          '通常不押韵',
          '强调自然和瞬间感受'
        ],
        'en-US': [
          'Three-line format: 5-7-5 syllables',
          'Includes kigo (season word)',
          'Profound imagery, concise language',
          'Usually unrhymed',
          'Emphasizes nature and momentary perception'
        ]
      },
      requirements: {
        'zh-CN': [
          '意境深远',
          '语言极简',
          '自然描写',
          '瞬间永恒化',
          '季语点缀'
        ],
        'en-US': [
          'Profound imagery',
          'Extremely concise language',
          'Nature description',
          'Eternalizing the moment',
          'Kigo as accent'
        ]
      },
      length: { min: 10, max: 30, typical: 17 },
      nobelPotential: 65,
      examples: [
        '松尾芭蕉俳句集',
        '小林一茶俳句',
        'Basho haiku collection',
        'Kobayashi Issa haiku'
      ]
    });

    // ==================== 6. 自由诗 ====================
    this.forms.set('free_verse', {
      form: 'free_verse',
      names: {
        'zh-CN': '自由诗',
        'en-US': 'Free Verse'
      },
      descriptions: {
        'zh-CN': '不押韵、不遵循传统格律的诗歌形式',
        'en-US': 'Poetry without regular meter or rhyme'
      },
      structures: {
        'zh-CN': '灵活组织，不受传统格律限制',
        'en-US': 'Flexible organization, not bound by traditional meter'
      },
      formatStandards: {
        'zh-CN': [
          '不要求押韵',
          '不要求固定音节数',
          '分行自由，强调节奏感',
          '可自由分段',
          '强调意象和情感表达'
        ],
        'en-US': [
          'No rhyme requirement',
          'No fixed syllable count',
          'Free line breaks, emphasis on rhythm',
          'Can freely divide into sections',
          'Emphasis on imagery and emotional expression'
        ]
      },
      requirements: {
        'zh-CN': [
          '意象鲜明',
          '节奏感强',
          '情感真挚',
          '语言创新',
          '有独特风格'
        ],
        'en-US': [
          'Vivid imagery',
          'Strong sense of rhythm',
          'Sincere emotion',
          'Linguistic innovation',
          'Unique style'
        ]
      },
      length: { min: 10, max: 5000, typical: 500 },
      nobelPotential: 90,
      examples: [
        '《雨巷》- 戴望舒',
        '《面朝大海，春暖花开》- 海子',
        'The Waste Land - T.S. Eliot',
        'Song of Myself - Walt Whitman'
      ]
    });

    // ==================== 7. 旧体诗 ====================
    this.forms.set('classical_poetry', {
      form: 'classical_poetry',
      names: {
        'zh-CN': '旧体诗',
        'en-US': 'Classical Poetry'
      },
      descriptions: {
        'zh-CN': '遵循传统格律的诗歌，包括律诗、绝句、古风等',
        'en-US': 'Poetry following classical forms including Lüshi, Jueju, and ancient styles'
      },
      structures: {
        'zh-CN': '律诗、绝句、古风等固定格式',
        'en-US': 'Fixed forms such as Lüshi, Jueju, and ancient styles'
      },
      formatStandards: {
        'zh-CN': [
          '律诗：八句，分四联，平仄对仗',
          '绝句：四句，平仄格式',
          '古风：不拘格律，句数不限',
          '词：词牌格式',
          '曲：曲牌格式'
        ],
        'en-US': [
          'Lüshi: Eight lines, four couplets, tonal pattern and parallelism',
          'Jueju: Four lines, tonal pattern',
          'Ancient style: No fixed meter, unlimited lines',
          'Ci: Ci patterns',
          'Qu: Qu patterns'
        ]
      },
      requirements: {
        'zh-CN': [
          '格律严谨',
          '对仗工整',
          '意境深远',
          '用典恰当',
          '情感真挚'
        ],
        'en-US': [
          'Strict meter',
          'Proper parallelism',
          'Profound imagery',
          'Appropriate allusion',
          'Sincere emotion'
        ]
      },
      length: { min: 5, max: 500, typical: 56 },
      nobelPotential: 75,
      examples: [
        '《静夜思》- 李白',
        '《春望》- 杜甫',
        '《念奴娇·赤壁怀古》- 苏轼',
        '《天净沙·秋思》- 马致远'
      ]
    });

    // ==================== 8. 戏剧 ====================
    this.forms.set('drama', {
      form: 'drama',
      names: {
        'zh-CN': '戏剧',
        'en-US': 'Drama'
      },
      descriptions: {
        'zh-CN': '通过对话和动作表现的戏剧作品',
        'en-US': 'Story told through dialogue and action'
      },
      structures: {
        'zh-CN': '幕、场结构，典型的五幕剧或三幕剧结构',
        'en-US': 'Acts and scenes, typical five-act or three-act structure'
      },
      formatStandards: {
        'zh-CN': [
          '分为若干幕，每幕包含若干场',
          '人物对话是主要表现形式',
          '包含舞台指示',
          '戏剧冲突是核心',
          '可包含独白和旁白'
        ],
        'en-US': [
          'Divided into acts, each act contains scenes',
          'Character dialogue is the main form',
          'Includes stage directions',
          'Dramatic conflict is central',
          'Can include soliloquy and aside'
        ]
      },
      requirements: {
        'zh-CN': [
          '戏剧冲突尖锐',
          '人物性格鲜明',
          '对话生动有力',
          '主题思想深刻',
          '舞台动作可行'
        ],
        'en-US': [
          'Sharp dramatic conflict',
          'Distinct character personalities',
          'Vivid and powerful dialogue',
          'Profound themes',
          'Feasible stage actions'
        ]
      },
      length: { min: 10000, max: 100000, typical: 30000 },
      nobelPotential: 98,
      examples: [
        '《雷雨》- 曹禺',
        '《茶馆》- 老舍',
        '《哈姆雷特》- 莎士比亚',
        '《等待戈多》- 贝克特',
        'Hamlet - Shakespeare',
        'Death of a Salesman - Arthur Miller'
      ]
    });

    // ==================== 9. 电影剧本 ====================
    this.forms.set('screenplay', {
      form: 'screenplay',
      names: {
        'zh-CN': '电影剧本',
        'en-US': 'Screenplay'
      },
      descriptions: {
        'zh-CN': '用于电影或电视的剧本形式',
        'en-US': 'Script for film or television'
      },
      structures: {
        'zh-CN': '场景描述、对话，通常包含场号',
        'en-US': 'Scene description, dialogue, usually including scene numbers'
      },
      formatStandards: {
        'zh-CN': [
          '场景标题：内/外-地点-时间',
          '场景描述简洁明了',
          '对话格式规范',
          '包含镜头指示',
          '音效和音乐标注'
        ],
        'en-US': [
          'Scene heading: INT./EXT.-LOCATION-TIME',
          'Scene descriptions concise and clear',
          'Standard dialogue format',
          'Includes camera directions',
          'Sound and music cues'
        ]
      },
      requirements: {
        'zh-CN': [
          '视觉叙事能力强',
          '对话简洁有力',
          '节奏把控精准',
          '场景转换流畅',
          '情感表达充分'
        ],
        'en-US': [
          'Strong visual storytelling',
          'Concise and powerful dialogue',
          'Precise rhythm control',
          'Smooth scene transitions',
          'Full emotional expression'
        ]
      },
      length: { min: 10000, max: 150000, typical: 30000 },
      nobelPotential: 75,
      examples: [
        '《教父》剧本',
        '《肖申克的救赎》剧本',
        'The Godfather - Screenplay',
        'The Shawshank Redemption - Screenplay'
      ]
    });

    // ==================== 10. 童话 ====================
    this.forms.set('fairytale', {
      form: 'fairytale',
      names: {
        'zh-CN': '童话',
        'en-US': 'Fairytale'
      },
      descriptions: {
        'zh-CN': '适合儿童的故事，通常包含魔法和奇幻元素',
        'en-US': 'Story intended for children, usually containing magic and fantasy elements'
      },
      structures: {
        'zh-CN': '简单叙事，常有魔法，结构清晰',
        'en-US': 'Simple narrative, often magical, clear structure'
      },
      formatStandards: {
        'zh-CN': [
          '语言简单易懂',
          '情节相对简单',
          '善恶分明',
          '常有魔法或超自然元素',
          '结尾往往圆满'
        ],
        'en-US': [
          'Simple and easy-to-understand language',
          'Relatively simple plot',
          'Clear distinction between good and evil',
          'Often contains magic or supernatural elements',
          'Usually ends with a happy ending'
        ]
      },
      requirements: {
        'zh-CN': [
          '主题积极向上',
          '适合儿童阅读',
          '想象力丰富',
          '道德寓意明确',
          '语言生动'
        ],
        'en-US': [
          'Positive themes',
          'Suitable for children',
          'Rich imagination',
          'Clear moral lessons',
          'Vivid language'
        ]
      },
      length: { min: 500, max: 10000, typical: 2000 },
      nobelPotential: 65,
      examples: [
        '《安徒生童话》- 安徒生',
        '《格林童话》',
        '《一千零一夜》',
        "Alice's Adventures in Wonderland - Lewis Carroll",
        'The Little Prince - Antoine de Saint-Exupéry'
      ]
    });

    // ==================== 11. 传记 ====================
    this.forms.set('biography', {
      form: 'biography',
      names: {
        'zh-CN': '传记',
        'en-US': 'Biography'
      },
      descriptions: {
        'zh-CN': '记录他人人生的文学作品',
        'en-US': 'Account of someone\'s life'
      },
      structures: {
        'zh-CN': '时间顺序为主，可按主题组织',
        'en-US': 'Mainly chronological, can be organized by theme'
      },
      formatStandards: {
        'zh-CN': [
          '以时间顺序展开',
          '引用真实资料',
          '客观叙述为主',
          '可包含书信、日记等资料',
          '有清晰的章节划分'
        ],
        'en-US': [
          'Developed in chronological order',
          'Quotes real materials',
          'Mainly objective narration',
          'Can include letters, diaries and other materials',
          'Clear chapter divisions'
        ]
      },
      requirements: {
        'zh-CN': [
          '事实准确',
          '资料翔实',
          '评价客观',
          '人物立体',
          '时代背景清晰'
        ],
        'en-US': [
          'Accurate facts',
          'Detailed materials',
          'Objective evaluation',
          'Three-dimensional characters',
          'Clear historical background'
        ]
      },
      length: { min: 20000, max: 200000, typical: 80000 },
      nobelPotential: 85,
      examples: [
        '《苏东坡传》- 林语堂',
        '《曾国藩传》- 唐浩明',
        'Steve Jobs - Walter Isaacson',
        'Einstein: His Life and Universe - Walter Isaacson'
      ]
    });

    // ==================== 12. 自传 ====================
    this.forms.set('autobiography', {
      form: 'autobiography',
      names: {
        'zh-CN': '自传',
        'en-US': 'Autobiography'
      },
      descriptions: {
        'zh-CN': '作者自己人生的记录',
        'en-US': 'Account of one\'s own life'
      },
      structures: {
        'zh-CN': '第一人称叙事，时间顺序或主题组织',
        'en-US': 'First-person narrative, chronological or thematic organization'
      },
      formatStandards: {
        'zh-CN': [
          '第一人称叙述',
          '个人视角',
          '情感真实',
          '可包含内心独白',
          '自我反思'
        ],
        'en-US': [
          'First-person narration',
          'Personal perspective',
          'Sincere emotions',
          'Can include inner monologue',
          'Self-reflection'
        ]
      },
      requirements: {
        'zh-CN': [
          '真实可信',
          '自我剖析深刻',
          '情感真挚',
          '人生感悟',
          '时代印记'
        ],
        'en-US': [
          'Authentic and credible',
          'Profound self-analysis',
          'Sincere emotions',
          'Life insights',
          'Era印记'
        ]
      },
      length: { min: 20000, max: 200000, typical: 80000 },
      nobelPotential: 88,
      examples: [
        '《史记·太史公自序》- 司马迁',
        '《忏悔录》- 卢梭',
        '《富兰克林自传》',
        'The Autobiography of Benjamin Franklin',
        'I Know Why the Caged Bird Sings - Maya Angelou'
      ]
    });

    // ==================== 13. 回忆录 ====================
    this.forms.set('memoir', {
      form: 'memoir',
      names: {
        'zh-CN': '回忆录',
        'en-US': 'Memoir'
      },
      descriptions: {
        'zh-CN': '对过去经历的回忆和反思，通常聚焦于特定主题或时期',
        'en-US': 'Recollection and reflection of past experiences, usually focused on specific themes or periods'
      },
      structures: {
        'zh-CN': '主题组织或时间顺序，注重情感和反思',
        'en-US': 'Thematic or chronological organization, emphasizing emotion and reflection'
      },
      formatStandards: {
        'zh-CN': [
          '第一人称回忆',
          '聚焦特定主题或时期',
          '个人情感丰富',
          '可包含细节描写',
          '有反思和感悟'
        ],
        'en-US': [
          'First-person recollection',
          'Focused on specific theme or period',
          'Rich personal emotions',
          'Can include detailed descriptions',
          'Contains reflection and insights'
        ]
      },
      requirements: {
        'zh-CN': [
          '情感真挚',
          '细节生动',
          '反思深刻',
          '个人色彩',
          '时代价值'
        ],
        'en-US': [
          'Sincere emotions',
          'Vivid details',
          'Profound reflection',
          'Personal character',
          'Era value'
        ]
      },
      length: { min: 10000, max: 150000, typical: 50000 },
      nobelPotential: 80,
      examples: [
        '《巨流河》- 齐邦媛',
        '《干校六记》- 杨绛',
        'On Writing - Stephen King',
        'I Know Why the Caged Bird Sings - Maya Angelou'
      ]
    });

    // ==================== 14. 报告文学 ====================
    this.forms.set('reportage', {
      form: 'reportage',
      names: {
        'zh-CN': '报告文学',
        'en-US': 'Reportage'
      },
      descriptions: {
        'zh-CN': '用文学手法报道真实事件的非虚构写作',
        'en-US': 'Non-fiction writing using literary techniques to report real events'
      },
      structures: {
        'zh-CN': '新闻调查结构，结合文学叙事',
        'en-US': 'Journalistic investigation structure combined with literary narrative'
      },
      formatStandards: {
        'zh-CN': [
          '事实为基础',
          '文学手法表达',
          '调查深入',
          '证据充分',
          '可读性强'
        ],
        'en-US': [
          'Based on facts',
          'Expressed through literary techniques',
          'Deep investigation',
          'Adequate evidence',
          'High readability'
        ]
      },
      requirements: {
        'zh-CN': [
          '事实准确',
          '调查深入',
          '文学性强',
          '社会意义',
          '可读性高'
        ],
        'en-US': [
          'Accurate facts',
          'Deep investigation',
          'Strong literary quality',
          'Social significance',
          'High readability'
        ]
      },
      length: { min: 5000, max: 100000, typical: 30000 },
      nobelPotential: 75,
      examples: [
        '《唐山大地震》- 钱钢',
        '《南京安魂曲》- 哈金',
        '《被淹没和被拯救的》- 普里莫·莱维',
        'In Cold Blood - Truman Capote',
        'The Gulag Archipelago - Aleksandr Solzhenitsyn'
      ]
    });

    // ==================== 15. 散文 ====================
    this.forms.set('prose', {
      form: 'prose',
      names: {
        'zh-CN': '散文',
        'en-US': 'Prose'
      },
      descriptions: {
        'zh-CN': '不讲究韵律的文学作品，包括叙事散文和抒情散文',
        'en-US': 'Literary works not following strict meter, including narrative and lyric prose'
      },
      structures: {
        'zh-CN': '灵活多变，可叙事、描写、议论、抒情',
        'en-US': 'Flexible and varied, can be narrative, descriptive, argumentative, or lyrical'
      },
      formatStandards: {
        'zh-CN': [
          '不讲究韵律',
          '语言优美',
          '形式自由',
          '情感真挚',
          '思想深刻'
        ],
        'en-US': [
          'Not following strict meter',
          'Beautiful language',
          'Free form',
          'Sincere emotion',
          'Profound thought'
        ]
      },
      requirements: {
        'zh-CN': [
          '意境优美',
          '语言精炼',
          '情感真挚',
          '思想深刻',
          '形散神聚'
        ],
        'en-US': [
          'Beautiful imagery',
          'Refined language',
          'Sincere emotion',
          'Profound thought',
          'Unified spirit despite varied form'
        ]
      },
      length: { min: 500, max: 50000, typical: 3000 },
      nobelPotential: 85,
      examples: [
        '《背影》- 朱自清',
        '《荷塘月色》- 朱自清',
        '《我与地坛》- 史铁生',
        'Walden - Henry David Thoreau',
        'A Supplication - Michel de Montaigne'
      ]
    });

    // ==================== 16. 随笔 ====================
    this.forms.set('essay', {
      form: 'essay',
      names: {
        'zh-CN': '随笔',
        'en-US': 'Essay'
      },
      descriptions: {
        'zh-CN': '表达个人见解和感受的短文',
        'en-US': 'Short piece expressing personal opinions and feelings'
      },
      structures: {
        'zh-CN': '议论性或抒情性短文，形式灵活',
        'en-US': 'Argumentative or lyrical short essay, flexible form'
      },
      formatStandards: {
        'zh-CN': [
          '篇幅短小精悍',
          '观点明确',
          '论证有据',
          '语言简练',
          '个人色彩浓厚'
        ],
        'en-US': [
          'Brief but impactful length',
          'Clear viewpoint',
          'Well-supported argumentation',
          'Concise language',
          'Strong personal character'
        ]
      },
      requirements: {
        'zh-CN': [
          '观点鲜明',
          '论证充分',
          '见解独到',
          '语言精炼',
          '可读性强'
        ],
        'en-US': [
          'Clear viewpoint',
          'Adequate argumentation',
          'Unique insight',
          'Concise language',
          'High readability'
        ]
      },
      length: { min: 500, max: 20000, typical: 3000 },
      nobelPotential: 80,
      examples: [
        '《鲁迅杂文》- 鲁迅',
        '《培根随笔》',
        'Essays - Michel de Montaigne',
        'Self-Reliance - Ralph Waldo Emerson'
      ]
    });

    // ==================== 18. 舞台剧 ====================
    this.forms.set('stage_play', {
      form: 'stage_play',
      names: {
        'zh-CN': '舞台剧',
        'en-US': 'Stage Play'
      },
      descriptions: {
        'zh-CN': '用于舞台表演的戏剧脚本',
        'en-US': 'Script for stage performance'
      },
      structures: {
        'zh-CN': '幕、场结构，包含舞台指示',
        'en-US': 'Acts and scenes with stage directions'
      },
      formatStandards: {
        'zh-CN': [
          '场景描述使用括号或斜体',
          '角色名称居中或大写',
          '对话独立成段',
          '幕和场清晰分隔',
          '包含详细的舞台指示'
        ],
        'en-US': [
          'Scene descriptions in brackets or italics',
          'Character names centered or capitalized',
          'Dialogue as separate blocks',
          'Clear act and scene divisions',
          'Detailed stage directions included'
        ]
      },
      requirements: {
        'zh-CN': [
          '戏剧冲突',
          '人物对白生动',
          '舞台动作可行',
          '情节推进清晰',
          '主题思想明确'
        ],
        'en-US': [
          'Dramatic conflict',
          'Vivid character dialogue',
          'Feasible stage actions',
          'Clear plot progression',
          'Explicit thematic ideas'
        ]
      },
      length: { min: 10000, max: 80000, typical: 30000 },
      nobelPotential: 95,
      examples: [
        '《哈姆雷特》- 莎士比亚',
        '《雷雨》- 曹禺',
        'Hamlet - Shakespeare',
        'Death of a Salesman - Arthur Miller'
      ]
    });

    // ==================== 19. 电视剧本 ====================
    this.forms.set('teleplay', {
      form: 'teleplay',
      names: {
        'zh-CN': '电视剧本',
        'en-US': 'Teleplay'
      },
      descriptions: {
        'zh-CN': '用于电视剧的剧本形式',
        'en-US': 'Script for television series'
      },
      structures: {
        'zh-CN': '集、场结构，每集约20-50场',
        'en-US': 'Episode and scene structure, 20-50 scenes per episode'
      },
      formatStandards: {
        'zh-CN': [
          '场景标题：内/外-地点-时间',
          '对话格式规范',
          '音效和音乐标注',
          '集数标注清晰',
          '情节节拍标注'
        ],
        'en-US': [
          'Scene heading: INT/EXT-LOCATION-TIME',
          'Standard dialogue format',
          'Sound and music cues',
          'Clear episode numbering',
          'Beat sheet notations'
        ]
      },
      requirements: {
        'zh-CN': [
          '每集有独立完整的故事',
          '角色弧线贯穿整季',
          '悬念设置合理',
          '对白简洁有力',
          '视觉叙事能力强'
        ],
        'en-US': [
          'Each episode has independent complete story',
          'Character arcs throughout the season',
          'Reasonable suspense setup',
          'Concise and powerful dialogue',
          'Strong visual storytelling'
        ]
      },
      length: { min: 5000, max: 100000, typical: 30000 },
      nobelPotential: 50,
      examples: [
        '《走向共和》- 电视剧剧本',
        'Breaking Bad - Television Script',
        'The Wire - Television Script'
      ]
    });

    // ==================== 20. 微电影剧本 ====================
    this.forms.set('micro_film', {
      form: 'micro_film',
      names: {
        'zh-CN': '微电影剧本',
        'en-US': 'Micro Film Script'
      },
      descriptions: {
        'zh-CN': '短时长电影的剧本，通常5-30分钟',
        'en-US': 'Short film script, typically 5-30 minutes'
      },
      structures: {
        'zh-CN': '简洁场景，聚焦单一主题',
        'en-US': 'Concise scenes, focused on single theme'
      },
      formatStandards: {
        'zh-CN': [
          '场景简洁明了',
          '时长标注精确',
          '视觉描述精炼',
          '对白精短有力',
          '快节奏叙事'
        ],
        'en-US': [
          'Clear and concise scenes',
          'Precise duration marking',
          'Refined visual descriptions',
          'Brief and powerful dialogue',
          'Fast-paced narrative'
        ]
      },
      requirements: {
        'zh-CN': [
          '主题突出',
          '情节紧凑',
          '结尾有力',
          '情感共鸣',
          '创意独特'
        ],
        'en-US': [
          'Prominent theme',
          'Tight plot',
          'Powerful ending',
          'Emotional resonance',
          'Unique creativity'
        ]
      },
      length: { min: 1000, max: 8000, typical: 3000 },
      nobelPotential: 40,
      examples: [
        '各类网络微电影',
        '在线视频平台短片',
        'Various web micro films'
      ]
    });

    // ==================== 21. 寓言 ====================
    this.forms.set('allegory', {
      form: 'allegory',
      names: {
        'zh-CN': '寓言',
        'en-US': 'Allegory'
      },
      descriptions: {
        'zh-CN': '通过象征手法表达深层意义的叙事',
        'en-US': 'Narrative using symbolism to express deeper meaning'
      },
      structures: {
        'zh-CN': '表层故事+深层寓意',
        'en-US': 'Surface story + deeper meaning'
      },
      formatStandards: {
        'zh-CN': [
          '故事简洁',
          '寓意明确',
          '象征手法贯穿',
          '结尾点题',
          '语言精炼'
        ],
        'en-US': [
          'Concise story',
          'Clear moral',
          'Symbolism throughout',
          'Ends with point',
          'Refined language'
        ]
      },
      requirements: {
        'zh-CN': [
          '双重叙事层次',
          '象征系统统一',
          '寓意深刻',
          '故事吸引人',
          '道德启示明确'
        ],
        'en-US': [
          'Dual narrative layers',
          'Unified symbolism',
          'Profound meaning',
          'Engaging story',
          'Clear moral lesson'
        ]
      },
      length: { min: 500, max: 20000, typical: 3000 },
      nobelPotential: 75,
      examples: [
        '《动物庄园》- 乔治·奥威尔',
        '《变形记》- 卡夫卡',
        'Animal Farm - George Orwell',
        'The Pilgrim\'s Progress - John Bunyan'
      ]
    });

    // ==================== 22. 神话 ====================
    this.forms.set('myth', {
      form: 'myth',
      names: {
        'zh-CN': '神话',
        'en-US': 'Myth'
      },
      descriptions: {
        'zh-CN': '关于神祇、英雄和宇宙起源的神圣叙事',
        'en-US': 'Sacred narratives about gods, heroes, and cosmic origins'
      },
      structures: {
        'zh-CN': '神圣叙事结构，包含宇宙起源、神的谱系',
        'en-US': 'Sacred narrative structure, including cosmogony and divine genealogies'
      },
      formatStandards: {
        'zh-CN': [
          '叙事宏大',
          '神祇描写神圣化',
          '包含宇宙起源',
          '谱系清晰',
          '仪式和禁忌'
        ],
        'en-US': [
          'Grand narrative',
          'Divine characterization',
          'Includes cosmogony',
          'Clear genealogies',
          'Rituals and taboos'
        ]
      },
      requirements: {
        'zh-CN': [
          '神圣性',
          '原型人物',
          '宇宙观完整',
          '文化价值体现',
          '永恒主题'
        ],
        'en-US': [
          'Sacred quality',
          'Archetypal figures',
          'Complete cosmology',
          'Cultural values',
          'Timeless themes'
        ]
      },
      length: { min: 1000, max: 100000, typical: 15000 },
      nobelPotential: 85,
      examples: [
        '《希腊神话》',
        '《北欧神话》',
        'Greek Mythology',
        'Norse Mythology',
        'The Mahabharata'
      ]
    });

    // ==================== 23. 传说 ====================
    this.forms.set('legend', {
      form: 'legend',
      names: {
        'zh-CN': '传说',
        'en-US': 'Legend'
      },
      descriptions: {
        'zh-CN': '基于历史人物的传奇故事',
        'en-US': 'Legendary stories based on historical figures'
      },
      structures: {
        'zh-CN': '英雄叙事结构，融入历史元素',
        'en-US': 'Heroic narrative structure with historical elements'
      },
      formatStandards: {
        'zh-CN': [
          '英雄人物塑造传奇化',
          '历史背景模糊',
          '超自然元素',
          '道德教化功能',
          '代代相传的故事模式'
        ],
        'en-US': [
          'Heroic figures legendaryized',
          'Vague historical background',
          'Supernatural elements',
          'Moral teaching function',
          'Intergenerational story patterns'
        ]
      },
      requirements: {
        'zh-CN': [
          '英雄形象高大',
          '历史与传说融合',
          '道德价值观',
          '戏剧性冲突',
          '传承性'
        ],
        'en-US': [
          'Grand heroic image',
          'History-legend fusion',
          'Moral values',
          'Dramatic conflict',
          'Heritage quality'
        ]
      },
      length: { min: 500, max: 50000, typical: 8000 },
      nobelPotential: 70,
      examples: [
        '《亚瑟王传奇》',
        '《岳飞传》',
        'King Arthur Legends',
        'Robin Hood Legends'
      ]
    });

    // ==================== 24. 专栏文章 ====================
    this.forms.set('column', {
      form: 'column',
      names: {
        'zh-CN': '专栏文章',
        'en-US': 'Column'
      },
      descriptions: {
        'zh-CN': '定期发表的专题文章',
        'en-US': 'Regularly published thematic articles'
      },
      structures: {
        'zh-CN': '个人风格鲜明，观点明确',
        'en-US': 'Distinct personal style, clear viewpoints'
      },
      formatStandards: {
        'zh-CN': [
          '固定专栏名称',
          '作者署名固定',
          '篇幅适中',
          '定期更新',
          '风格统一'
        ],
        'en-US': [
          'Fixed column name',
          'Fixed author signature',
          'Moderate length',
          'Regular updates',
          'Unified style'
        ]
      },
      requirements: {
        'zh-CN': [
          '观点鲜明',
          '论证充分',
          '时效性强',
          '可读性高',
          '专业深度'
        ],
        'en-US': [
          'Clear viewpoints',
          'Adequate argumentation',
          'Timeliness',
          'High readability',
          'Professional depth'
        ]
      },
      length: { min: 500, max: 5000, typical: 2000 },
      nobelPotential: 60,
      examples: [
        '《鲁迅全集》- 杂文',
        '各类报纸杂志专栏',
        'Newspaper columns',
        'Magazine features'
      ]
    });

    // ==================== 25. 博客 ====================
    this.forms.set('blog', {
      form: 'blog',
      names: {
        'zh-CN': '博客/网络日志',
        'en-US': 'Blog'
      },
      descriptions: {
        'zh-CN': '网络平台的个人写作',
        'en-US': 'Personal writing on internet platforms'
      },
      structures: {
        'zh-CN': '灵活自由，可长可短',
        'en-US': 'Flexible structure, variable length'
      },
      formatStandards: {
        'zh-CN': [
          '标题吸引',
          '网络语言可用',
          '互动元素',
          '多媒体支持',
          '标签分类'
        ],
        'en-US': [
          'Attractive titles',
          'Internet language acceptable',
          'Interactive elements',
          'Multimedia support',
          'Tag categorization'
        ]
      },
      requirements: {
        'zh-CN': [
          '内容真实',
          '个人特色',
          '互动性',
          '更新频率',
          '读者定位'
        ],
        'en-US': [
          'Authentic content',
          'Personal character',
          'Interactivity',
          'Update frequency',
          'Target audience'
        ]
      },
      length: { min: 200, max: 10000, typical: 1500 },
      nobelPotential: 30,
      examples: [
        '各类网络博客',
        'Personal blogs',
        'Various web journals'
      ]
    });

    // ==================== 26. 剧本（通用） ====================
    this.forms.set('script', {
      form: 'script',
      names: {
        'zh-CN': '剧本（通用）',
        'en-US': 'Script (General)'
      },
      descriptions: {
        'zh-CN': '用于各种表演形式的剧本',
        'en-US': 'Script for various performance forms'
      },
      structures: {
        'zh-CN': '对话+舞台指示',
        'en-US': 'Dialogue + stage directions'
      },
      formatStandards: {
        'zh-CN': [
          '角色名称清晰',
          '对话格式规范',
          '舞台指示详细',
          '场景分隔明确',
          '时长标注'
        ],
        'en-US': [
          'Clear character names',
          'Standard dialogue format',
          'Detailed stage directions',
          'Clear scene divisions',
          'Duration marking'
        ]
      },
      requirements: {
        'zh-CN': [
          '戏剧冲突',
          '角色鲜明',
          '动作可行',
          '对白生动',
          '结构完整'
        ],
        'en-US': [
          'Dramatic conflict',
          'Distinct characters',
          'Feasible actions',
          'Vivid dialogue',
          'Complete structure'
        ]
      },
      length: { min: 5000, max: 100000, typical: 25000 },
      nobelPotential: 70,
      examples: [
        '各类戏剧剧本',
        'Various play scripts',
        'Stage scripts'
      ]
    });

    // ==================== 27. 漫画脚本 ====================
    this.forms.set('comic_script', {
      form: 'comic_script',
      names: {
        'zh-CN': '漫画脚本',
        'en-US': 'Comic Script'
      },
      descriptions: {
        'zh-CN': '用于漫画创作的分镜脚本',
        'en-US': 'Panel script for comic creation'
      },
      structures: {
        'zh-CN': '分镜描述+对话气泡标注',
        'en-US': 'Panel descriptions + dialogue bubble notations'
      },
      formatStandards: {
        'zh-CN': [
          '分镜编号清晰',
          '画面描述具体',
          '对话框位置标注',
          '拟声词标注',
          '页面布局'
        ],
        'en-US': [
          'Clear panel numbering',
          'Specific visual descriptions',
          'Dialogue bubble positions',
          'Sound effect notations',
          'Page layout'
        ]
      },
      requirements: {
        'zh-CN': [
          '画面感强',
          '节奏把控',
          '视觉叙事',
          '对话精炼',
          '分镜连贯'
        ],
        'en-US': [
          'Strong visual sense',
          'Rhythm control',
          'Visual storytelling',
          'Concise dialogue',
          'Coherent paneling'
        ]
      },
      length: { min: 500, max: 50000, typical: 5000 },
      nobelPotential: 35,
      examples: [
        '《一人之下》漫画脚本',
        '《镖人》漫画脚本',
        '各类漫画分镜脚本'
      ]
    });

    // ==================== 28. 游戏叙事 ====================
    this.forms.set('game_narrative', {
      form: 'game_narrative',
      names: {
        'zh-CN': '游戏叙事',
        'en-US': 'Game Narrative'
      },
      descriptions: {
        'zh-CN': '用于电子游戏的叙事内容',
        'en-US': 'Narrative content for video games'
      },
      structures: {
        'zh-CN': '分支叙事+任务结构',
        'en-US': 'Branching narrative + quest structure'
      },
      formatStandards: {
        'zh-CN': [
          '任务描述规范',
          '对话分支标注',
          '触发条件明确',
          '世界观文档',
          '角色对话库'
        ],
        'en-US': [
          'Standard quest descriptions',
          'Dialogue branch notations',
          'Clear trigger conditions',
          'World documentation',
          'Character dialogue database'
        ]
      },
      requirements: {
        'zh-CN': [
          '交互性强',
          '分支合理',
          '沉浸感',
          '任务驱动',
          '世界观统一'
        ],
        'en-US': [
          'High interactivity',
          'Reasonable branching',
          'Immersion',
          'Quest-driven',
          'Unified worldbuilding'
        ]
      },
      length: { min: 5000, max: 500000, typical: 50000 },
      nobelPotential: 40,
      examples: [
        'RPG游戏叙事',
        'RPG game narratives',
        'Visual novel scripts',
        'Interactive fiction'
      ]
    });

    // ==================== 29. 视觉小说脚本 ====================
    this.forms.set('visual_novel_script', {
      form: 'visual_novel_script',
      names: {
        'zh-CN': '视觉小说脚本',
        'en-US': 'Visual Novel Script'
      },
      descriptions: {
        'zh-CN': '结合图像和文字的互动小说脚本',
        'en-US': 'Interactive novel script combining images and text'
      },
      structures: {
        'zh-CN': '分支剧情+选项系统',
        'en-US': 'Branching plot + choice system'
      },
      formatStandards: {
        'zh-CN': [
          '场景标注完整',
          '立绘和背景标注',
          '对话分支明确',
          '选项设置清晰',
          'CG场景标注'
        ],
        'en-US': [
          'Complete scene notation',
          'Character and background markings',
          'Clear dialogue branches',
          'Clear choice settings',
          'CG scene notation'
        ]
      },
      requirements: {
        'zh-CN': [
          '多分支结局',
          '角色塑造深刻',
          '情感共鸣',
          '选择有意义',
          '视觉叙事结合'
        ],
        'en-US': [
          'Multiple endings',
          'Deep character development',
          'Emotional resonance',
          'Meaningful choices',
          'Visual-narrative integration'
        ]
      },
      length: { min: 20000, max: 500000, typical: 80000 },
      nobelPotential: 45,
      examples: [
        '《命运石之门》',
        '《CLANNAD》',
        'Steins;Gate',
        'CLANNAD',
        'Various otome/visual novel games'
      ]
    });
  }

  getGenreConfig(genre: Genre): GenreQuality | undefined {
    return this.genres.get(genre);
  }

  getFormConfig(form: LiteraryGenre): LiteraryFormQuality | undefined {
    return this.forms.get(form);
  }

  getAllGenres(): GenreQuality[] {
    return Array.from(this.genres.values());
  }

  getAllForms(): LiteraryFormQuality[] {
    return Array.from(this.forms.values());
  }

  getGenresByRegion(region: string): GenreQuality[] {
    return Array.from(this.genres.values()).filter(g => g.regions.includes(region));
  }

  getGenreNames(genre: Genre, language: Language): string {
    const config = this.genres.get(genre);
    return config?.names[language] || genre;
  }

  getFormNames(form: LiteraryGenre, language: Language): string {
    const config = this.forms.get(form);
    return config?.names[language] || form;
  }

  searchGenres(query: string, language: Language): GenreQuality[] {
    const q = query.toLowerCase();
    return Array.from(this.genres.values()).filter(g => {
      const name = (g.names[language] || g.names['en-US'] || '').toLowerCase();
      const desc = (g.descriptions[language] || g.descriptions['en-US'] || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  getHighNobelPotential(): GenreQuality[] {
    return Array.from(this.genres.values()).filter(g => g.nobelPotential >= 70);
  }

  getHighLongFormSupport(): GenreQuality[] {
    return Array.from(this.genres.values()).filter(g => g.longFormSupport >= 90);
  }

  getGenreGuidance(genre: Genre): GenreGuidance | null {
    const config = this.genres.get(genre);
    if (!config) return null;

    return {
      genre,
      coreThemes: [
        '身份探索',
        '道德困境',
        '成长变化',
        '世界观建立'
      ],
      typicalArcs: [
        '英雄之旅',
        '复仇之旅',
        '救赎之路',
        '自我发现'
      ],
      writingGuidelines: [
        '确保一致性',
        '保持节奏',
        '深入发展角色',
        '合理埋设伏笔'
      ],
      pitfallsToAvoid: [
        '信息过载',
        '情节拖沓',
        '角色扁平',
        '设定崩坏'
      ],
      recommendedReading: []
    };
  }

  getFormGuidance(form: LiteraryGenre): FormGuidance | null {
    const config = this.forms.get(form);
    if (!config) return null;

    return {
      form,
      structureGuidelines: [
        '合理结构',
        '伏笔埋设',
        '高潮构建',
        '结局处理'
      ],
      pacingGuidelines: [
        '开端铺垫',
        '上升发展',
        '高潮展开',
        '结局处理'
      ],
      characterGuidelines: [
        '主角塑造',
        '角色关系',
        '动机发展'
      ],
      lengthRecommendations: {
        wordCount: {
          min: config.length.min,
          max: config.length.max,
          target: config.length.typical
        }
      },
      complexityLevels: ['基础', '进阶', '高级', '史诗级', '文学级'],
      formatRequirements: config.formatStandards?.['zh-CN'] || [],
      styleTips: [
        '保持语言风格统一',
        '注意节奏变化',
        '注重细节描写',
        '避免重复表达',
        '善用修辞手法'
      ]
    };
  }

  async validateGenreConfigForNobel(genre: Genre): Promise<{
    valid: boolean;
    strengths: string[];
    recommendations: string[];
  }> {
    const config = this.genres.get(genre);
    if (!config) {
      return {
        valid: false,
        strengths: [],
        recommendations: ['Genre not found']
      };
    }

    const strengths: string[] = [];
    const recommendations: string[] = [];

    if (config.nobelPotential >= 90) {
      strengths.push('具有很高的文学潜力');
    } else if (config.nobelPotential >= 70) {
      strengths.push('有较高的文学潜力');
    }

    if (config.literaryComplexity >= 90) {
      strengths.push('文学复杂度高');
    }

    if (config.literaryComplexity < 70) {
      recommendations.push('建议增加文学深度');
    }

    if (config.nobelPotential < 70) {
      recommendations.push('建议深入主题，增加文学性');
    }

    return {
      valid: config.nobelPotential >= 50,
      strengths,
      recommendations
    };
  }
}

export default AdvancedGlobalLiteraryConfig;
