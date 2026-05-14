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
  length: { min: number; max: number; typical: number };
  nobelPotential: number; // 0-100
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
        'zh-CN': '篇幅较长的虚构散文',
        'en-US': 'Extended fictional prose narrative'
      },
      structures: {
        'zh-CN': '章节结构，可包含多卷',
        'en-US': 'Chapter-based, can be multi-volume'
      },
      length: { min: 40000, max: 10000000, typical: 100000 },
      nobelPotential: 98
    });

    // ==================== 2. 短篇小说 ====================
    this.forms.set('short_story', {
      form: 'short_story',
      names: {
        'zh-CN': '短篇小说',
        'en-US': 'Short Story'
      },
      descriptions: {
        'zh-CN': '篇幅较短的叙事',
        'en-US': 'Brief fictional narrative'
      },
      structures: {
        'zh-CN': '单一场景，简洁结构',
        'en-US': 'Single scene, compact structure'
      },
      length: { min: 1000, max: 30000, typical: 7500 },
      nobelPotential: 85
    });

    // ==================== 3. 中篇小说 ====================
    this.forms.set('novella', {
      form: 'novella',
      names: {
        'zh-CN': '中篇小说',
        'en-US': 'Novella'
      },
      descriptions: {
        'zh-CN': '介于长篇和短篇之间',
        'en-US': 'Fiction between short and novel'
      },
      structures: {
        'zh-CN': '可包含多个章节',
        'en-US': 'Multi-chapter possible'
      },
      length: { min: 20000, max: 50000, typical: 30000 },
      nobelPotential: 90
    });

    // ==================== 4. 诗歌 ====================
    this.forms.set('poetry', {
      form: 'poetry',
      names: {
        'zh-CN': '诗歌',
        'en-US': 'Poetry'
      },
      descriptions: {
        'zh-CN': '运用押韵、意象和语言',
        'en-US': 'Literature using rhyme, imagery and meter'
      },
      structures: {
        'zh-CN': '分行组织，可分节',
        'en-US': 'Lines and stanzas'
      },
      length: { min: 10, max: 10000, typical: 500 },
      nobelPotential: 98
    });

    // ==================== 5. 俳句 ====================
    this.forms.set('haiku', {
      form: 'haiku',
      names: {
        'zh-CN': '俳句',
        'en-US': 'Haiku'
      },
      descriptions: {
        'zh-CN': '日本传统诗歌形式',
        'en-US': 'Traditional Japanese poetic form'
      },
      structures: {
        'zh-CN': '三行，5-7-5音节',
        'en-US': 'Three lines, 5-7-5 syllable pattern'
      },
      length: { min: 10, max: 30, typical: 17 },
      nobelPotential: 65
    });

    // ==================== 6. 自由诗 ====================
    this.forms.set('free_verse', {
      form: 'free_verse',
      names: {
        'zh-CN': '自由诗',
        'en-US': 'Free Verse'
      },
      descriptions: {
        'zh-CN': '不押韵、不遵循传统格律',
        'en-US': 'Poetry without regular meter or rhyme'
      },
      structures: {
        'zh-CN': '灵活组织',
        'en-US': 'Flexible organization'
      },
      length: { min: 10, max: 5000, typical: 500 },
      nobelPotential: 90
    });

    // ==================== 7. 旧体诗 ====================
    this.forms.set('classical_poetry', {
      form: 'classical_poetry',
      names: {
        'zh-CN': '旧体诗',
        'en-US': 'Classical Poetry'
      },
      descriptions: {
        'zh-CN': '遵循传统格律',
        'en-US': 'Poetry following classical forms'
      },
      structures: {
        'zh-CN': '律诗、绝句、古风',
        'en-US': 'Various classical forms'
      },
      length: { min: 5, max: 500, typical: 56 },
      nobelPotential: 75
    });

    // ==================== 8. 戏剧 ====================
    this.forms.set('drama', {
      form: 'drama',
      names: {
        'zh-CN': '戏剧',
        'en-US': 'Drama'
      },
      descriptions: {
        'zh-CN': '通过对话和动作',
        'en-US': 'Story told through dialogue and action'
      },
      structures: {
        'zh-CN': '幕、场结构',
        'en-US': 'Acts and scenes'
      },
      length: { min: 10000, max: 100000, typical: 30000 },
      nobelPotential: 98
    });

    // ==================== 9. 剧本 ====================
    this.forms.set('screenplay', {
      form: 'screenplay',
      names: {
        'zh-CN': '电影剧本',
        'en-US': 'Screenplay'
      },
      descriptions: {
        'zh-CN': '用于电影或电视',
        'en-US': 'Script for film or television'
      },
      structures: {
        'zh-CN': '场景描述、对话',
        'en-US': 'Scene description, dialogue'
      },
      length: { min: 10000, max: 150000, typical: 30000 },
      nobelPotential: 75
    });

    // ==================== 10. 童话 ====================
    this.forms.set('fairytale', {
      form: 'fairytale',
      names: {
        'zh-CN': '童话',
        'en-US': 'Fairytale'
      },
      descriptions: {
        'zh-CN': '适合儿童的故事',
        'en-US': 'Story intended for children'
      },
      structures: {
        'zh-CN': '简单叙事，常有魔法',
        'en-US': 'Simple narrative, often magical'
      },
      length: { min: 500, max: 10000, typical: 2000 },
      nobelPotential: 65
    });

    // ==================== 11. 寓言 ====================
    this.forms.set('fable', {
      form: 'fable',
      names: {
        'zh-CN': '寓言',
        'en-US': 'Fable'
      },
      descriptions: {
        'zh-CN': '有道德寓意',
        'en-US': 'Brief story with moral'
      },
      structures: {
        'zh-CN': '简洁叙事+寓意',
        'en-US': 'Brief narrative + moral'
      },
      length: { min: 100, max: 2000, typical: 500 },
      nobelPotential: 60
    });

    // ==================== 12. 传记 ====================
    this.forms.set('biography', {
      form: 'biography',
      names: {
        'zh-CN': '传记',
        'en-US': 'Biography'
      },
      descriptions: {
        'zh-CN': '记录他人人生',
        'en-US': 'Account of someone\'s life'
      },
      structures: {
        'zh-CN': '时间顺序',
        'en-US': 'Chronological'
      },
      length: { min: 20000, max: 200000, typical: 80000 },
      nobelPotential: 85
    });

    // ==================== 13. 自传 ====================
    this.forms.set('autobiography', {
      form: 'autobiography',
      names: {
        'zh-CN': '自传',
        'en-US': 'Autobiography'
      },
      descriptions: {
        'zh-CN': '作者自己人生',
        'en-US': 'Account of one\'s own life'
      },
      structures: {
        'zh-CN': '第一人称叙事',
        'en-US': 'First-person narrative'
      },
      length: { min: 20000, max: 200000, typical: 80000 },
      nobelPotential: 88
    });

    // ==================== 14. 回忆录 ====================
    this.forms.set('memoir', {
      form: 'memoir',
      names: {
        'zh-CN': '回忆录',
        'en-US': 'Memoir'
      },
      descriptions: {
        'zh-CN': '特定主题',
        'en-US': 'Reflective prose about specific'
      },
      structures: {
        'zh-CN': '主题性回忆',
        'en-US': 'Thematic recollection'
      },
      length: { min: 10000, max: 150000, typical: 50000 },
      nobelPotential: 85
    });

    // ==================== 15. 报告文学 ====================
    this.forms.set('reportage', {
      form: 'reportage',
      names: {
        'zh-CN': '报告文学',
        'en-US': 'Literary Journalism'
      },
      descriptions: {
        'zh-CN': '真实事件',
        'en-US': 'Literary treatment of real events'
      },
      structures: {
        'zh-CN': '新闻+文学',
        'en-US': 'News + literature'
      },
      length: { min: 5000, max: 100000, typical: 30000 },
      nobelPotential: 80
    });

    // ==================== 16. 散文 ====================
    this.forms.set('prose', {
      form: 'prose',
      names: {
        'zh-CN': '散文',
        'en-US': 'Essay/Prose'
      },
      descriptions: {
        'zh-CN': '非诗歌形式',
        'en-US': 'Non-poetic literary form'
      },
      structures: {
        'zh-CN': '自由形式',
        'en-US': 'Free form'
      },
      length: { min: 500, max: 50000, typical: 3000 },
      nobelPotential: 90
    });

    // ==================== 17. 随笔 ====================
    this.forms.set('essay', {
      form: 'essay',
      names: {
        'zh-CN': '随笔',
        'en-US': 'Essay'
      },
      descriptions: {
        'zh-CN': '表达个人观点',
        'en-US': 'Short piece expressing personal views'
      },
      structures: {
        'zh-CN': '论点+论证',
        'en-US': 'Thesis + argument'
      },
      length: { min: 500, max: 20000, typical: 3000 },
      nobelPotential: 85
    });

    // ==================== 18. 舞台剧 ====================
    this.forms.set('stage_play', {
      form: 'stage_play',
      names: {
        'zh-CN': '舞台剧',
        'en-US': 'Stage Play'
      },
      descriptions: {
        'zh-CN': '用于舞台表演',
        'en-US': 'Script for stage'
      },
      structures: {
        'zh-CN': '幕场+舞台指示',
        'en-US': 'Acts + stage directions'
      },
      length: { min: 10000, max: 80000, typical: 30000 },
      nobelPotential: 95
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
      complexityLevels: ['基础', '进阶', '高级', '史诗级', '文学级']
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
