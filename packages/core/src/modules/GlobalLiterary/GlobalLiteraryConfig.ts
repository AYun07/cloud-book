/**
 * 全球文学题材和体裁配置
 * 支持世界各国文学类型
 */

import { LiteraryGenre, Genre, Language } from '../../types';

export interface GlobalGenreConfig {
  genre: Genre;
  names: Partial<Record<Language, string>>;
  description: Partial<Record<Language, string>>;
  subgenres: Partial<Record<Language, string[]>>;
  examples: string[];
  regions: string[];
  characteristics: Partial<Record<Language, string[]>>;
}

export interface LiteraryFormConfig {
  form: LiteraryGenre;
  names: Partial<Record<Language, string>>;
  description: Partial<Record<Language, string>>;
  structure: Partial<Record<Language, string>>;
  length: { min: number; max: number; typical: number };
}

export class GlobalLiteraryConfig {
  private genres: Map<Genre, GlobalGenreConfig> = new Map();
  private forms: Map<LiteraryGenre, LiteraryFormConfig> = new Map();

  constructor() {
    this.initializeGlobalGenres();
    this.initializeLiteraryForms();
  }

  private initializeGlobalGenres(): void {
    // 奇幻类
    this.genres.set('fantasy', {
      genre: 'fantasy',
      names: {
        'zh-CN': '奇幻',
        'en-US': 'Fantasy',
        'ja-JP': 'ファンタジー',
        'ko-KR': '판타지',
        'es-ES': 'Fantasía',
        'fr-FR': 'Fantasy',
        'de-DE': 'Fantasy',
        'ru-RU': 'Фэнтези'
      },
      description: {
        'zh-CN': '包含超自然元素的虚构世界故事',
        'en-US': 'Fiction that incorporates supernatural elements',
        'ja-JP': '超自然的要素を含むフィクション',
        'ko-KR': '초자연적 요소를 포함한 픽션'
      },
      subgenres: {
        'zh-CN': ['西方奇幻', '东方奇幻', '史诗奇幻', '黑暗奇幻', '浪漫奇幻'],
        'en-US': ['High Fantasy', 'Low Fantasy', 'Epic Fantasy', 'Dark Fantasy', 'Romantic Fantasy', 'Urban Fantasy'],
        'ja-JP': ['ハイファンタジー', 'ダークファンタジー', ' эпик'],
        'ko-KR': ['하이 판타지', '다크 판타지', '어반 판타지']
      },
      examples: ['The Lord of the Rings', 'Harry Potter', 'A Song of Ice and Fire'],
      regions: ['Western', 'Global'],
      characteristics: {
        'zh-CN': ['魔法', '异世界', '种族设定', '英雄之旅'],
        'en-US': ['Magic systems', 'Other worlds', 'Racial diversity', 'Hero\'s journey']
      }
    });

    // 科幻类
    this.genres.set('scifi', {
      genre: 'scifi',
      names: {
        'zh-CN': '科幻',
        'en-US': 'Science Fiction',
        'ja-JP': 'SF',
        'ko-KR': 'SF',
        'es-ES': 'Ciencia Ficción',
        'fr-FR': 'Science-Fiction',
        'de-DE': 'Science-Fiction',
        'ru-RU': 'Научная фантастика'
      },
      description: {
        'zh-CN': '基于科学原理的虚构世界故事',
        'en-US': 'Fiction based on scientific principles and extrapolation'
      },
      subgenres: {
        'zh-CN': ['硬科幻', '软科幻', '太空歌剧', '赛博朋克', '后末日'],
        'en-US': ['Hard SF', 'Soft SF', 'Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Dystopian', 'Steampunk', 'Biopunk']
      },
      examples: ['Dune', 'Neuromancer', 'Foundation'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['科技设定', '未来世界', '宇宙探索'],
        'en-US': ['Technology focus', 'Future settings', 'Space exploration']
      }
    });

    // 推理悬疑类
    this.genres.set('mystery', {
      genre: 'mystery',
      names: {
        'zh-CN': '推理/悬疑',
        'en-US': 'Mystery/Detective',
        'ja-JP': 'ミステリー/推理',
        'ko-KR': '미스터리/추리',
        'es-ES': 'Misterio',
        'fr-FR': 'Mystère',
        'de-DE': 'Krimi/Mystery'
      },
      description: {
        'zh-CN': '以谜题和解谜为核心的文学类型',
        'en-US': 'Fiction centered on puzzles and their solutions'
      },
      subgenres: {
        'zh-CN': ['推理侦探', '密室推理', '心理悬疑', '历史推理', '警察程序'],
        'en-US': ['Cozy Mystery', 'Hardboiled Detective', 'Police Procedural', 'Legal Thriller', 'Medical Thriller', 'Historical Mystery', 'Locked Room Mystery']
      },
      examples: ['Sherlock Holmes', 'Agatha Christie novels', 'True Detective'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['线索', '推理', '反转', '真相揭露'],
        'en-US': ['Clues', 'Deduction', 'Twists', 'Revelation']
      }
    });

    // 浪漫爱情类
    this.genres.set('romance', {
      genre: 'romance',
      names: {
        'zh-CN': '言情/浪漫',
        'en-US': 'Romance',
        'ja-JP': '恋愛小説',
        'ko-KR': '로맨스',
        'es-ES': 'Romance'
      },
      description: {
        'zh-CN': '以爱情为核心的文学类型',
        'en-US': 'Fiction centered on romantic love'
      },
      subgenres: {
        'zh-CN': ['现代言情', '历史言情', '奇幻言情', '科幻言情', '禁忌恋'],
        'en-US': ['Contemporary Romance', 'Historical Romance', 'Paranormal Romance', 'Science Fiction Romance', 'Erotic Romance', 'LGBTQ+ Romance', 'Romantic Suspense']
      },
      examples: ['Pride and Prejudice', 'The Notebook', 'Outlander'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['感情线', '情感发展', '幸福结局'],
        'en-US': ['Emotional arc', 'Character development', 'HEA (Happily Ever After)']
      }
    });

    // 恐怖类
    this.genres.set('horror', {
      genre: 'horror',
      names: {
        'zh-CN': '恐怖/惊悚',
        'en-US': 'Horror',
        'ja-JP': 'ホラー',
        'ko-KR': '호러',
        'es-ES': 'Terror'
      },
      description: {
        'zh-CN': '以恐惧为核心体验的文学类型',
        'en-US': 'Fiction intended to scare, frighten, or unsettle readers'
      },
      subgenres: {
        'zh-CN': ['超自然恐怖', '心理恐怖', '身体恐怖', '宇宙恐怖', '哥特式'],
        'en-US': ['Supernatural Horror', 'Psychological Horror', 'Body Horror', 'Cosmic Horror', 'Gothic Horror', 'Slasher Horror', 'Comic Horror']
      },
      examples: ['The Shining', 'It', 'Lovecraft stories'],
      regions: ['Western', 'Global'],
      characteristics: {
        'zh-CN': ['恐惧营造', '恐怖元素', '心理压迫'],
        'en-US': ['Atmosphere', 'Fear factors', 'Psychological tension']
      }
    });

    // 惊悚类
    this.genres.set('thriller', {
      genre: 'thriller',
      names: {
        'zh-CN': '惊悚',
        'en-US': 'Thriller',
        'ja-JP': 'サスペンス',
        'ko-KR': '스릴러'
      },
      description: {
        'zh-CN': '以紧张刺激为核心的故事',
        'en-US': 'Fast-paced fiction with high tension and suspense'
      },
      subgenres: {
        'zh-CN': ['悬疑惊悚', '动作惊悚', '间谍惊悚', '法律惊悚'],
        'en-US': ['Psychological Thriller', 'Action Thriller', 'Espionage Thriller', 'Legal Thriller', 'Medical Thriller', 'Techno-thriller']
      },
      examples: ['Gone Girl', 'The Da Vinci Code', 'John le Carré novels'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['高节奏', '悬念', '肾上腺素'],
        'en-US': ['High pacing', 'Suspense', 'Adrenaline']
      }
    });

    // 历史类
    this.genres.set('historical', {
      genre: 'historical',
      names: {
        'zh-CN': '历史',
        'en-US': 'Historical Fiction',
        'ja-JP': '歴史小説',
        'ko-KR': '역사소설',
        'es-ES': 'Novela Histórica'
      },
      description: {
        'zh-CN': '以历史时期为背景的故事',
        'en-US': 'Fiction set in the past'
      },
      subgenres: {
        'zh-CN': ['古代中国', '中世纪欧洲', '文艺复兴', '明清小说', '三国', '民国'],
        'en-US': ['Ancient History', 'Medieval', 'Renaissance', 'Tudor/Stuart England', 'American Civil War', 'World War Fiction', 'Post-War']
      },
      examples: ['Wolf Hall', 'The Pillars of the Earth', 'Shogun'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['历史背景', '时代细节', '史实融合'],
        'en-US': ['Historical accuracy', 'Period details', 'Factual integration']
      }
    });

    // 文学小说
    this.genres.set('literary_fiction', {
      genre: 'literary_fiction',
      names: {
        'zh-CN': '纯文学',
        'en-US': 'Literary Fiction',
        'ja-JP': '純文学',
        'ko-KR': '순수문학',
        'fr-FR': 'Littérature'
      },
      description: {
        'zh-CN': '注重艺术性和深度的文学作品',
        'en-US': 'Fiction emphasizing artistic merit and depth'
      },
      subgenres: {
        'zh-CN': ['现实主义', '心理小说', '实验文学', '元小说'],
        'en-US': ['Realism', 'Magical Realism', 'Metafiction', 'Postmodern', 'Bildungsroman']
      },
      examples: ['One Hundred Years of Solitude', 'Beloved', 'The Remains of the Day'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['艺术性', '深度主题', '语言技巧'],
        'en-US': ['Artistic merit', 'Deep themes', 'Linguistic technique']
      }
    });

    // 武侠
    this.genres.set('wuxia', {
      genre: 'wuxia',
      names: {
        'zh-CN': '武侠',
        'en-US': 'Wuxia (Martial Arts)',
        'ja-JP': '武俠'
      },
      description: {
        'zh-CN': '中国武侠世界的故事',
        'en-US': 'Chinese martial arts fiction'
      },
      subgenres: {
        'zh-CN': ['传统武侠', '新派武侠', '综武', '武侠修真'],
        'en-US': ['Classic Wuxia', 'New Wave Wuxia', 'Xianxia-adjacent']
      },
      examples: ['The Legend of the Condor Heroes', 'The Smiling, Proud Wanderer'],
      regions: ['China', 'East Asia', 'Global Chinese diaspora'],
      characteristics: {
        'zh-CN': ['武功', '江湖', '侠义'],
        'en-US': ['Martial arts', 'Jianghu (rogue world)', 'Chivalry']
      }
    });

    // 仙侠
    this.genres.set('xianxia', {
      genre: 'xianxia',
      names: {
        'zh-CN': '仙侠/修真',
        'en-US': 'Xianxia (Cultivation)',
        'ja-JP': '仙侠'
      },
      description: {
        'zh-CN': '修仙题材，追求长生和超脱',
        'en-US': 'Chinese cultivation fantasy'
      },
      subgenres: {
        'zh-CN': ['古典仙侠', '现代修真', '凡人流', '系统流', '洪荒流'],
        'en-US': ['Classic Xianxia', 'System Apocalypse', 'Reversed Cultivation']
      },
      examples: ['Coiling Dragon', 'I Shall Seal the Heavens', 'A Record of a Mortal\'s Journey to Immortality'],
      regions: ['China', 'Global Chinese diaspora', 'Southeast Asia'],
      characteristics: {
        'zh-CN': ['修仙', '境界', '灵根', '功法'],
        'en-US': ['Cultivation', 'Realms', 'Spirit roots', 'Techniques']
      }
    });

    // 轻小说
    this.genres.set('light_novel', {
      genre: 'light_novel',
      names: {
        'zh-CN': '轻小说',
        'en-US': 'Light Novel',
        'ja-JP': 'ライトノベル',
        'ko-KR': '라이트노벨'
      },
      description: {
        'zh-CN': '日本风格的快餐文学',
        'en-US': 'Japanese-style快餐文学 with manga/anime aesthetic'
      },
      subgenres: {
        'zh-CN': ['校园日常', '异世界转生', '恋爱喜剧', '战斗冒险'],
        'en-US': ['School Life', 'Isekai', 'Romantic Comedy', 'Action/Adventure']
      },
      examples: ['Sword Art Online', 'Re:Zero', 'KonoSuba'],
      regions: ['Japan', 'China', 'Korea', 'Global'],
      characteristics: {
        'zh-CN': ['插画', '轻松', '连载'],
        'en-US': ['Illustrations', 'Easy reading', 'Serialization']
      }
    });

    // 同人
    this.genres.set('fanfiction', {
      genre: 'fanfiction',
      names: {
        'zh-CN': '同人',
        'en-US': 'Fan Fiction',
        'ja-JP': '二次創作'
      },
      description: {
        'zh-CN': '基于已有作品创作的文学作品',
        'en-US': 'Fiction based on existing works'
      },
      subgenres: {
        'zh-CN': ['同人小说', '跨界同人', '平行世界', 'BL', 'GL'],
        'en-US': ['Ficlet', 'Crossover', 'AU (Alternate Universe)', 'Shipping', 'Mary Sue']
      },
      examples: ['Archive of Our Own', 'FanFiction.net works'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['衍生', 'OC', 'CP配对'],
        'en-US': ['Derivative', 'Original Characters', 'Shipping']
      }
    });

    // 都市
    this.genres.set('urban', {
      genre: 'urban',
      names: {
        'zh-CN': '都市',
        'en-US': 'Urban Fiction',
        'ja-JP': '現代小説'
      },
      description: {
        'zh-CN': '现代城市背景的故事',
        'en-US': 'Contemporary fiction set in cities'
      },
      subgenres: {
        'zh-CN': ['都市生活', '职场商战', '都市异能', '都市神医'],
        'en-US': ['Chick Lit', 'Lad Lit', 'Urban Fantasy', 'Crime Fiction']
      },
      examples: ['American Psycho', 'Bright Lights, Big City'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['现代', '城市', '现实'],
        'en-US': ['Modern setting', 'City life', 'Contemporary issues']
      }
    });

    // 军事
    this.genres.set('military', {
      genre: 'military',
      names: {
        'zh-CN': '军事',
        'en-US': 'Military Fiction',
        'ja-JP': 'ミリタリー小説',
        'ru-RU': 'Военная проза'
      },
      description: {
        'zh-CN': '军事战争相关的故事',
        'en-US': 'Fiction dealing with military topics'
      },
      subgenres: {
        'zh-CN': ['战争故事', '战场英雄', '战略指挥', '特种部队'],
        'en-US': ['War Fiction', 'Battlelog', 'Techno-military', 'Air Combat']
      },
      examples: ['The Hunt for Red October', 'Band of Brothers'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['军事', '战争', '策略'],
        'en-US': ['Military accuracy', 'Combat', 'Strategy']
      }
    });

    // 游戏
    this.genres.set('gaming', {
      genre: 'gaming',
      names: {
        'zh-CN': '游戏',
        'en-US': 'Gaming Fiction',
        'ja-JP': 'ゲーム小説'
      },
      description: {
        'zh-CN': '以游戏为主题或背景的故事',
        'en-US': 'Fiction related to video games'
      },
      subgenres: {
        'zh-CN': ['电竞', '游戏世界沉浸', '游戏系统'],
        'en-US': ['Esports', 'VR/Game World', 'Game Mechanic Focus']
      },
      examples: ['Sword Art Online', 'Ready Player One', '.LBSS'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['游戏', '虚拟世界', '升级'],
        'en-US': ['Gaming elements', 'Virtual worlds', 'Leveling']
      }
    });

    // 喜剧
    this.genres.set('comedy', {
      genre: 'comedy',
      names: {
        'zh-CN': '喜剧',
        'en-US': 'Comedy',
        'ja-JP': 'コメディ',
        'fr-FR': 'Comédie'
      },
      description: {
        'zh-CN': '以幽默为核心的文学类型',
        'en-US': 'Fiction intended to amuse'
      },
      subgenres: {
        'zh-CN': ['恶搞', '黑色幽默', '浪漫喜剧', '讽刺'],
        'en-US': ['Slapstick', 'Dark Comedy', 'Romantic Comedy', 'Satire', 'Parody']
      },
      examples: ['Catch-22', 'Good Omens', 'Discworld series'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['幽默', '讽刺', '娱乐'],
        'en-US': ['Humor', 'Satire', 'Entertainment']
      }
    });

    // 穿越重生
    this.genres.set('transmigration', {
      genre: 'transmigration',
      names: {
        'zh-CN': '穿越/重生',
        'en-US': 'Transmigration/Regression',
        'ja-JP': '転生もの'
      },
      description: {
        'zh-CN': '主角穿越或重生的故事',
        'en-US': 'Stories involving transmigration or regression'
      },
      subgenres: {
        'zh-CN': ['回归流', '穿越流', '系统流', '时间循环'],
        'en-US': ['Regression', 'Transmigration', 'Time Loop', 'System Apocalypse']
      },
      examples: ['Mother of Learning', 'Omniscient Reader\'s Viewpoint'],
      regions: ['China', 'Korea', 'Japan', 'Global'],
      characteristics: {
        'zh-CN': ['穿越', '重生', '先知'],
        'en-US': ['Awakening', 'Foresight', 'Second chance']
      }
    });

    // 都市异能
    this.genres.set('urban_wizard', {
      genre: 'urban_wizard',
      names: {
        'zh-CN': '都市异能',
        'en-US': 'Urban Fantasy',
        'ja-JP': 'アーバンファンタジー'
      },
      description: {
        'zh-CN': '现代都市中的超自然故事',
        'en-US': 'Supernatural elements in modern urban settings'
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
      }
    });

    // 心理
    this.genres.set('psychological', {
      genre: 'psychological',
      names: {
        'zh-CN': '心理',
        'en-US': 'Psychological Fiction',
        'ja-JP': '心理小説'
      },
      description: {
        'zh-CN': '深入探索人物心理的文学',
        'en-US': 'Fiction exploring human psychology deeply'
      },
      subgenres: {
        'zh-CN': ['心理小说', '意识流', '精神分析'],
        'en-US': ['Psychological Thriller', 'Stream of Consciousness', 'Dysfunctional Family']
      },
      examples: ['The Yellow Wallpaper', 'Fight Club', 'Gone Girl'],
      regions: ['Global'],
      characteristics: {
        'zh-CN': ['心理', '内心', '精神'],
        'en-US': ['Inner world', 'Mental processes', 'Identity']
      }
    });
  }

  private initializeLiteraryForms(): void {
    // 长篇小说
    this.forms.set('novel', {
      form: 'novel',
      names: {
        'zh-CN': '长篇小说',
        'en-US': 'Novel',
        'ja-JP': '長編小説',
        'fr-FR': 'Roman',
        'de-DE': 'Roman',
        'ru-RU': 'Роман'
      },
      description: {
        'zh-CN': '篇幅较长的虚构散文作品',
        'en-US': 'Extended fictional prose narrative'
      },
      structure: {
        'zh-CN': '章节结构，可包含多卷',
        'en-US': 'Chapter-based, can be multi-volume'
      },
      length: { min: 40000, max: 500000, typical: 80000 }
    });

    // 短篇小说
    this.forms.set('short_story', {
      form: 'short_story',
      names: {
        'zh-CN': '短篇小说',
        'en-US': 'Short Story',
        'ja-JP': '短編小説',
        'fr-FR': 'Nouvelle'
      },
      description: {
        'zh-CN': '篇幅较短的叙事作品',
        'en-US': 'Brief fictional narrative'
      },
      structure: {
        'zh-CN': '单一场景，简洁结构',
        'en-US': 'Single scene, compact structure'
      },
      length: { min: 1000, max: 30000, typical: 7500 }
    });

    // 中篇小说
    this.forms.set('novella', {
      form: 'novella',
      names: {
        'zh-CN': '中篇小说',
        'en-US': 'Novella',
        'ja-JP': '中編小説'
      },
      description: {
        'zh-CN': '介于长篇和短篇之间的作品',
        'en-US': 'Fiction between short story and novel'
      },
      structure: {
        'zh-CN': '可包含多个章节',
        'en-US': 'Multi-chapter possible'
      },
      length: { min: 20000, max: 50000, typical: 30000 }
    });

    // 诗歌
    this.forms.set('poetry', {
      form: 'poetry',
      names: {
        'zh-CN': '诗歌',
        'en-US': 'Poetry',
        'ja-JP': '詩',
        'fr-FR': 'Poésie'
      },
      description: {
        'zh-CN': '运用押韵、意象等手法的文学作品',
        'en-US': 'Literary work using rhyme, imagery, meter'
      },
      structure: {
        'zh-CN': '分行组织，可分节',
        'en-US': 'Lines and stanzas'
      },
      length: { min: 10, max: 10000, typical: 500 }
    });

    // 俳句
    this.forms.set('haiku', {
      form: 'haiku',
      names: {
        'zh-CN': '俳句',
        'en-US': 'Haiku',
        'ja-JP': '俳句'
      },
      description: {
        'zh-CN': '日本传统诗歌形式',
        'en-US': 'Traditional Japanese poetic form'
      },
      structure: {
        'zh-CN': '三行，5-7-5音节',
        'en-US': 'Three lines, 5-7-5 syllable pattern'
      },
      length: { min: 10, max: 30, typical: 17 }
    });

    // 自由诗
    this.forms.set('free_verse', {
      form: 'free_verse',
      names: {
        'zh-CN': '自由诗',
        'en-US': 'Free Verse'
      },
      description: {
        'zh-CN': '不押韵、不遵循传统格律的诗歌',
        'en-US': 'Poetry without regular meter or rhyme'
      },
      structure: {
        'zh-CN': '灵活组织',
        'en-US': 'Flexible organization'
      },
      length: { min: 10, max: 5000, typical: 500 }
    });

    // 旧体诗
    this.forms.set('classical_poetry', {
      form: 'classical_poetry',
      names: {
        'zh-CN': '旧体诗/古典诗歌',
        'en-US': 'Classical Poetry'
      },
      description: {
        'zh-CN': '遵循传统格律的诗歌',
        'en-US': 'Poetry following classical forms'
      },
      structure: {
        'zh-CN': '律诗、绝句、古风等',
        'en-US': 'Various classical forms'
      },
      length: { min: 5, max: 500, typical: 56 }
    });

    // 戏剧
    this.forms.set('drama', {
      form: 'drama',
      names: {
        'zh-CN': '戏剧',
        'en-US': 'Drama',
        'ja-JP': 'Drama',
        'fr-FR': 'Drame'
      },
      description: {
        'zh-CN': '通过对话和动作表演的故事',
        'en-US': 'Story told through dialogue and action'
      },
      structure: {
        'zh-CN': '幕、场结构',
        'en-US': 'Acts and scenes'
      },
      length: { min: 10000, max: 100000, typical: 30000 }
    });

    // 剧本
    this.forms.set('screenplay', {
      form: 'screenplay',
      names: {
        'zh-CN': '剧本/电影剧本',
        'en-US': 'Screenplay'
      },
      description: {
        'zh-CN': '用于电影或电视的剧本',
        'en-US': 'Script for film or television'
      },
      structure: {
        'zh-CN': '场景描述、对话',
        'en-US': 'Scene description, dialogue'
      },
      length: { min: 10000, max: 150000, typical: 30000 }
    });

    // 电视剧本
    this.forms.set('teleplay', {
      form: 'teleplay',
      names: {
        'zh-CN': '电视剧本',
        'en-US': 'Teleplay'
      },
      description: {
        'zh-CN': '用于电视剧的剧本',
        'en-US': 'Script for TV series'
      },
      structure: {
        'zh-CN': '集、场结构',
        'en-US': 'Episodes and scenes'
      },
      length: { min: 3000, max: 10000, typical: 5000 }
    });

    // 微电影剧本
    this.forms.set('micro_film', {
      form: 'micro_film',
      names: {
        'zh-CN': '微电影剧本',
        'en-US': 'Short Film Script'
      },
      description: {
        'zh-CN': '短视频或微电影剧本',
        'en-US': 'Script for short videos'
      },
      structure: {
        'zh-CN': '简短结构',
        'en-US': 'Compact structure'
      },
      length: { min: 500, max: 5000, typical: 2000 }
    });

    // 童话
    this.forms.set('fairytale', {
      form: 'fairytale',
      names: {
        'zh-CN': '童话',
        'en-US': 'Fairytale',
        'de-DE': 'Märchen',
        'fr-FR': 'Conte de fées'
      },
      description: {
        'zh-CN': '适合儿童的故事',
        'en-US': 'Story intended for children'
      },
      structure: {
        'zh-CN': '简单叙事，常有魔法元素',
        'en-US': 'Simple narrative, often magical'
      },
      length: { min: 500, max: 10000, typical: 2000 }
    });

    // 寓言
    this.forms.set('fable', {
      form: 'fable',
      names: {
        'zh-CN': '寓言',
        'en-US': 'Fable',
        'fr-FR': 'Fable'
      },
      description: {
        'zh-CN': '有道德寓意的小故事',
        'en-US': 'Brief story with moral'
      },
      structure: {
        'zh-CN': '简洁叙事+寓意',
        'en-US': 'Brief narrative + moral'
      },
      length: { min: 100, max: 2000, typical: 500 }
    });

    // 神话
    this.forms.set('myth', {
      form: 'myth',
      names: {
        'zh-CN': '神话',
        'en-US': 'Myth/Mythology'
      },
      description: {
        'zh-CN': '关于神祇和英雄的传说',
        'en-US': 'Stories of gods and heroes'
      },
      structure: {
        'zh-CN': '叙事性传说',
        'en-US': 'Narrative legends'
      },
      length: { min: 500, max: 50000, typical: 5000 }
    });

    // 传说
    this.forms.set('legend', {
      form: 'legend',
      names: {
        'zh-CN': '传说',
        'en-US': 'Legend'
      },
      description: {
        'zh-CN': '代代相传的故事',
        'en-US': 'Story passed down through generations'
      },
      structure: {
        'zh-CN': '传奇叙事',
        'en-US': 'Heroic narrative'
      },
      length: { min: 500, max: 30000, typical: 5000 }
    });

    // 寓言/ allegory
    this.forms.set('allegory', {
      form: 'allegory',
      names: {
        'zh-CN': '寓言/ allegory',
        'en-US': 'Allegory'
      },
      description: {
        'zh-CN': '通过象征手法表达深层意义的文学作品',
        'en-US': 'Story with symbolic meaning'
      },
      structure: {
        'zh-CN': '象征性叙事',
        'en-US': 'Symbolic narrative'
      },
      length: { min: 1000, max: 100000, typical: 20000 }
    });

    // 传记
    this.forms.set('biography', {
      form: 'biography',
      names: {
        'zh-CN': '传记',
        'en-US': 'Biography'
      },
      description: {
        'zh-CN': '记录他人人生的文学作品',
        'en-US': 'Account of someone\'s life'
      },
      structure: {
        'zh-CN': '时间顺序',
        'en-US': 'Chronological'
      },
      length: { min: 20000, max: 200000, typical: 80000 }
    });

    // 自传
    this.forms.set('autobiography', {
      form: 'autobiography',
      names: {
        'zh-CN': '自传',
        'en-US': 'Autobiography'
      },
      description: {
        'zh-CN': '作者自己的人生记录',
        'en-US': 'Account of one\'s own life'
      },
      structure: {
        'zh-CN': '第一人称叙事',
        'en-US': 'First-person narrative'
      },
      length: { min: 20000, max: 200000, typical: 80000 }
    });

    // 回忆录
    this.forms.set('memoir', {
      form: 'memoir',
      names: {
        'zh-CN': '回忆录',
        'en-US': 'Memoir'
      },
      description: {
        'zh-CN': '特定主题的回忆性散文',
        'en-US': 'Reflective prose about specific themes'
      },
      structure: {
        'zh-CN': '主题性回忆',
        'en-US': 'Thematic recollection'
      },
      length: { min: 10000, max: 150000, typical: 50000 }
    });

    // 报告文学
    this.forms.set('reportage', {
      form: 'reportage',
      names: {
        'zh-CN': '报告文学',
        'en-US': 'Literary Journalism'
      },
      description: {
        'zh-CN': '真实事件的文学性报道',
        'en-US': 'Literary treatment of real events'
      },
      structure: {
        'zh-CN': '新闻+文学',
        'en-US': 'News + literature'
      },
      length: { min: 5000, max: 100000, typical: 30000 }
    });

    // 散文
    this.forms.set('prose', {
      form: 'prose',
      names: {
        'zh-CN': '散文',
        'en-US': 'Essay/Prose'
      },
      description: {
        'zh-CN': '非诗歌形式的文学作品',
        'en-US': 'Non-poetic literary form'
      },
      structure: {
        'zh-CN': '自由形式',
        'en-US': 'Free form'
      },
      length: { min: 500, max: 50000, typical: 3000 }
    });

    // 随笔
    this.forms.set('essay', {
      form: 'essay',
      names: {
        'zh-CN': '随笔',
        'en-US': 'Essay'
      },
      description: {
        'zh-CN': '表达个人观点的短文',
        'en-US': 'Short piece expressing personal views'
      },
      structure: {
        'zh-CN': '论点+论证',
        'en-US': 'Thesis + argument'
      },
      length: { min: 500, max: 20000, typical: 3000 }
    });

    // 专栏
    this.forms.set('column', {
      form: 'column',
      names: {
        'zh-CN': '专栏',
        'en-US': 'Column'
      },
      description: {
        'zh-CN': '报刊杂志的定期专栏文章',
        'en-US': 'Regular periodical article'
      },
      structure: {
        'zh-CN': '固定栏目',
        'en-US': 'Fixed format'
      },
      length: { min: 500, max: 5000, typical: 2000 }
    });

    // 博客
    this.forms.set('blog', {
      form: 'blog',
      names: {
        'zh-CN': '博客/网文',
        'en-US': 'Blog Post/Web Fiction'
      },
      description: {
        'zh-CN': '网络平台的文章或小说',
        'en-US': 'Online platform writing'
      },
      structure: {
        'zh-CN': '灵活多样',
        'en-US': 'Flexible'
      },
      length: { min: 100, max: 10000, typical: 3000 }
    });

    // 舞台剧
    this.forms.set('stage_play', {
      form: 'stage_play',
      names: {
        'zh-CN': '舞台剧剧本',
        'en-US': 'Stage Play'
      },
      description: {
        'zh-CN': '用于舞台表演的剧本',
        'en-US': 'Script for stage performance'
      },
      structure: {
        'zh-CN': '幕场+舞台指示',
        'en-US': 'Acts + stage directions'
      },
      length: { min: 10000, max: 80000, typical: 30000 }
    });

    // 漫画脚本
    this.forms.set('comic_script', {
      form: 'comic_script',
      names: {
        'zh-CN': '漫画脚本',
        'en-US': 'Comic/Manga Script'
      },
      description: {
        'zh-CN': '漫画或连环画的文字脚本',
        'en-US': 'Text script for comics'
      },
      structure: {
        'zh-CN': '分镜+台词',
        'en-US': 'Panels + dialogue'
      },
      length: { min: 500, max: 100000, typical: 5000 }
    });

    // 游戏叙事
    this.forms.set('game_narrative', {
      form: 'game_narrative',
      names: {
        'zh-CN': '游戏叙事',
        'en-US': 'Game Narrative'
      },
      description: {
        'zh-CN': '电子游戏的叙事内容',
        'en-US': 'Narrative content for video games'
      },
      structure: {
        'zh-CN': '分支+互动',
        'en-US': 'Branching + interactive'
      },
      length: { min: 5000, max: 500000, typical: 50000 }
    });

    // 视觉小说脚本
    this.forms.set('visual_novel_script', {
      form: 'visual_novel_script',
      names: {
        'zh-CN': '视觉小说脚本',
        'en-US': 'Visual Novel Script'
      },
      description: {
        'zh-CN': '视觉小说的文字内容',
        'en-US': 'Text content for visual novels'
      },
      structure: {
        'zh-CN': '选项+分支',
        'en-US': 'Choices + branching'
      },
      length: { min: 10000, max: 500000, typical: 100000 }
    });
  }

  getGenreConfig(genre: Genre): GlobalGenreConfig | undefined {
    return this.genres.get(genre);
  }

  getFormConfig(form: LiteraryGenre): LiteraryFormConfig | undefined {
    return this.forms.get(form);
  }

  getAllGenres(): GlobalGenreConfig[] {
    return Array.from(this.genres.values());
  }

  getAllForms(): LiteraryFormConfig[] {
    return Array.from(this.forms.values());
  }

  getGenresByRegion(region: string): GlobalGenreConfig[] {
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

  searchGenres(query: string, language: Language): GlobalGenreConfig[] {
    const q = query.toLowerCase();
    return Array.from(this.genres.values()).filter(g => {
      const name = (g.names[language] || g.names['en-US'] || '').toLowerCase();
      const desc = (g.description[language] || g.description['en-US'] || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }
}

export default GlobalLiteraryConfig;
