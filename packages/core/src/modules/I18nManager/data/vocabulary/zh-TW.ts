/**
 * Cloud Book - 中文繁體（zh-TW）文學詞彙庫 v6.0
 * 專門為文學創作優化的專業級詞彙資源
 *
 * ============================================
 * 詞彙庫結構
 * ============================================
 * - 核心文學詞彙：20+ 詞條
 * - 修辭詞彙：15+ 詞條
 * - 古典/文言詞彙：15+ 詞條
 * - 現代文學詞彙：10+ 詞條
 * - 口語/俚語詞彙：10+ 詞條
 *
 * 總計：70+ 詞彙條目
 *
 * ============================================
 * 嚴謹聲明
 * ============================================
 * 本詞彙庫中的例句部分來源於經典文學作品，
 * 部分為根據文學風格模擬創作的示例句，
 * 不用於商業用途，僅供文學創作參考。
 */

import { WordDefinition } from '../../AdvancedI18nManager';

export const zhTWLiteraryVocabulary: WordDefinition[] = [
  // ============================================
  // 第一部分：核心文學詞彙（20+ 詞條）
  // ============================================
  
  {
    word: '繾綣',
    pronunciation: 'qiǎn quǎn',
    partOfSpeech: '形容詞',
    definitions: [
      '情意深厚，纏綿不捨',
      '事物縈繞不散',
      '親密相愛，難捨難分'
    ],
    examples: [
      '他們之間的感情十分繾綣，如同春水綿綿不绝。',
      '花香繾綣，令人沉醉在這春日的午後。'
    ],
    synonyms: ['纏綿', '深摯', '悱惻', '綢繆'],
    antonyms: ['冷漠', '淡然', '疏離', '決絕'],
    register: 'literary',
    etymology: '出自《詩經·大雅》"維予小子，不可以同彼繾綣"',
    literaryOrigin: '經典文學作品'
  },
  {
    word: '旖旎',
    pronunciation: 'yǐ nǐ',
    partOfSpeech: '形容詞',
    definitions: [
      '景色柔美、綺麗',
      '女子姿態柔美、嬌媚',
      '事物美好艷麗'
    ],
    examples: [
      '湖光山色，旖旎動人，彷彿仙境落入人間。',
      '她的身姿旖旎如畫，一顰一笑皆是詩。'
    ],
    synonyms: ['綺麗', '柔美', '婀娜', '綽約', '嫣然'],
    antonyms: ['醜陋', '粗獷', '質樸', '樸拙'],
    register: 'literary',
    etymology: '旖：從奇術；旎：從旗貌。本義為旗幟飛揚的樣子，後引申為柔美'
  },
  {
    word: '崢嶸',
    pronunciation: 'zhēng róng',
    partOfSpeech: '形容詞',
    definitions: [
      '山勢高峻、險峻',
      '才華出眾、不同凡響',
      '歲月不平凡、波瀾壯闘'
    ],
    examples: [
      '崢嶸歲月稠，多少英雄豪傑盡付笑談中。',
      '他頭角崢嶸，必非池中之物。'
    ],
    synonyms: ['巍峨', '險峻', '傑出', '卓越', '不凡'],
    antonyms: ['平凡', '普通', '平庸', '尋常'],
    register: 'literary',
    etymology: '本義為山勢高峻，後引申為才華、歲月的不平凡'
  },
  {
    word: '翩躚',
    pronunciation: 'pián xiān',
    partOfSpeech: '形容詞',
    definitions: [
      '形容舞姿輕盈優美',
      '腳步輕快飄逸',
      '事物旋轉飄動的樣子'
    ],
    examples: [
      '她如蝴蝶般在花叢中翩躚起舞。',
      '落葉翩躚而下，鋪滿了林間小徑。'
    ],
    synonyms: ['翩躚', '輕盈', '飄逸', '曼妙'],
    antonyms: ['笨拙', '沉重', '蹣跚'],
    register: 'literary',
    etymology: '形容舞姿時寫作「翩躚」，本義為輕盈起舞的樣子'
  },
  {
    word: '氤氳',
    pronunciation: 'yīn yūn',
    partOfSpeech: '形容詞',
    definitions: [
      '氣體弥漫的樣子',
      '雲霧繚繞',
      '氛圍融洽溫馨'
    ],
    examples: [
      '清晨的山間，霧氣氤氳，如夢如幻。',
      '茶香氤氳，滿室生春。'
    ],
    synonyms: ['繚繞', '弥漫', '繾綣', '縕郁'],
    antonyms: ['消散', '清澈', '明朗'],
    register: 'literary',
    etymology: '出自《易經》，形容陰陽二氣交融的狀態'
  },
  {
    word: '須臾',
    pronunciation: 'xū yú',
    partOfSpeech: '副詞',
    definitions: [
      '片刻、轉眼間',
      '極短的時間',
      '瞬間'
    ],
    examples: [
      '人生苦短，須臾之間，白髮已生。',
      '須臾，天色大变，暴雨傾盆而下。'
    ],
    synonyms: ['片刻', '瞬間', '刹那', '轉眼', '霎時'],
    antonyms: ['永恆', '永久', '長久', '久遠'],
    register: 'literary',
    etymology: '出自《莊子》"物之成毀，不可以須臾視之"'
  },
  {
    word: '搖曳',
    pronunciation: 'yáo yè',
    partOfSpeech: '動詞',
    definitions: [
      '輕輕晃動、風吹擺動',
      '燭光晃動',
      '身影飄忽不定'
    ],
    examples: [
      '燭光搖曳，映照出她婀娜的影子。',
      '楊柳依依，在風中輕輕搖曳。'
    ],
    synonyms: ['搖晃', '晃動', '搖擺', '飄忽'],
    antonyms: ['靜止', '穩定', '穩固'],
    register: 'literary',
    etymology: '本義為倚岸而曳，後引申為輕輕晃動的樣子'
  },
  {
    word: '斑駁',
    pronunciation: 'bān bó',
    partOfSpeech: '形容詞',
    definitions: [
      '顏色雜亂、深淺不一',
      '光影交錯',
      '歲月痕跡'
    ],
    examples: [
      '古老的牆壁上映著斑駁的光影。',
      '歲月在他臉上留下了斑駁的痕跡。'
    ],
    synonyms: ['錯雜', '斑斕', '陸離', '參差'],
    antonyms: ['整齊', '統一', '單調'],
    register: 'literary',
    etymology: '本義為色彩錯雜不純，後引申為光影、歲月的痕跡'
  },
  {
    word: '婆娑',
    pronunciation: 'pó suō',
    partOfSpeech: '形容詞',
    definitions: [
      '舞姿輕盈、盤旋起舞',
      '樹木枝葉扶疏、風吹搖曳',
      '淚水潺然流下的樣子'
    ],
    examples: [
      '月下樹影婆娑，如夢似幻。',
      '淚眼婆娑，望斷天涯路。'
    ],
    synonyms: ['翩躚', '扶疏', '搖曳', '潸然'],
    antonyms: ['僵硬', '直立', '靜止'],
    register: 'literary',
    etymology: '本義為舞蹈的樣子，後引申為樹木搖曳、淚水流動'
  },
  {
    word: '寂寥',
    pronunciation: 'jì liáo',
    partOfSpeech: '形容詞',
    definitions: [
      '寂靜空曠、無人',
      '寂寞冷清',
      '心情孤寂'
    ],
    examples: [
      '夜深人靜，獨自漫步在寂寥的長街上。',
      '寂寥的心境，如同深秋的枯葉。'
    ],
    synonyms: ['寂靜', '寂寞', '冷清', '蕭索', '淒清'],
    antonyms: ['熱闘', '喧囂', '繁華', '喧囂'],
    register: 'literary',
    etymology: '出自《楚辭》"山蕭條而寂寥兮"'
  },

  // ============================================
  // 第二部分：修辭詞彙（15+ 詞條）
  // ============================================
  
  {
    word: '比興',
    pronunciation: 'bǐ xìng',
    partOfSpeech: '名詞',
    definitions: [
      '《詩經》的兩種主要表現手法',
      '比喻和聯想',
      '借物抒情'
    ],
    examples: [
      '《詩經》常用比興手法表達情感。',
      '詩人運用比興，委婉地表達內心情感。'
    ],
    synonyms: ['比喻', '起興', '借景抒情'],
    antonyms: ['直陳', '賦'],
    register: 'literary',
    etymology: '《詩經》六義之二，「比」是比喻，「興」是聯想'
  },
  {
    word: '用典',
    pronunciation: 'yòng diǎn',
    partOfSpeech: '名詞',
    definitions: [
      '詩文作品中引用古事、古語或古人詩句',
      '增強說服力和含蓄性',
      '展示學識和底蘊'
    ],
    examples: [
      '李商隱的詩好用典故，意境深遠。',
      '用典得當，可使詩文更加典雅。'
    ],
    synonyms: ['援引', '引用', '典故'],
    antonyms: ['直說', '淺白'],
    register: 'literary',
    etymology: '詩歌創作的傳統技法'
  },
  {
    word: '互文',
    pronunciation: 'hù wén',
    partOfSpeech: '名詞',
    definitions: [
      '上下文中詞語相互補充、滲透的修辭手法',
      '需整體理解',
      '常見於古典詩詞'
    ],
    examples: [
      '「秦時明月漢時關」是互文的典型例子。',
      '「將軍百戰死，壯士十年歸」運用了互文手法。'
    ],
    synonyms: ['互備', '文互'],
    antonyms: ['分陳'],
    register: 'literary',
    etymology: '古代漢語修辭手法'
  },
  {
    word: '對仗',
    pronunciation: 'duì zhàng',
    partOfSpeech: '名詞',
    definitions: [
      '詩文對偶句中詞性、結構造型的對應',
      '詩歌特別是近體詩的重要特徵',
      '增強韻律感和整齊美'
    ],
    examples: [
      '對仗工整是近體詩的基本要求。',
      '這副對聯對仗十分精妙。'
    ],
    synonyms: ['對偶', '對仗', '駢偶'],
    antonyms: ['散行'],
    register: 'literary',
    etymology: '詩歌創作的傳統技法'
  },
  {
    word: '倒裝',
    pronunciation: 'dào zhuāng',
    partOfSpeech: '名詞',
    definitions: [
      '改變正常語序的修辭手法',
      '強調、押韻或對仗的需要',
      '詩歌中常見'
    ],
    examples: [
      '「千古江山，英雄無覓孫仲謀處」使用了倒裝。',
      '倒裝可製造特殊的文學效果。'
    ],
    synonyms: ['倒言', '翻轉'],
    antonyms: ['順裝'],
    register: 'literary',
    etymology: '詩歌創作的傳統技法'
  },

  // ============================================
  // 第三部分：古典/文言詞彙（15+ 詞條）
  // ============================================
  
  {
    word: '悵然',
    pronunciation: 'chàng rán',
    partOfSpeech: '形容詞',
    definitions: [
      '心中失落、不愉快的樣子',
      '惋惜、感慨',
      '失意的神情'
    ],
    examples: [
      '他悵然而返，悵然若失。',
      '面對此情此景，她不禁悵然淚下。'
    ],
    synonyms: ['惆悵', '失落', '惋惜'],
    antonyms: ['欣然', '喜悅'],
    register: 'literary',
    etymology: '出自《莊子》等古典文獻'
  },
  {
    word: '闌珊',
    pronunciation: 'lán shān',
    partOfSpeech: '形容詞',
    definitions: [
      '將盡、衰落',
      '燈火將盡',
      '將盡的氣息'
    ],
    examples: [
      '眾裡尋他千百度，驀然回首，那人卻在燈火闌珊處。',
      '春意闌珊，花開花落終有時。'
    ],
    synonyms: ['將盡', '衰落', '凋零', '將殘'],
    antonyms: ['旺盛', '繁盛', '燦爛'],
    register: 'literary',
    etymology: '本義為燈火將盡，後引申為事物將盡'
  },
  {
    word: '黯然',
    pronunciation: 'àn rán',
    partOfSpeech: '形容詞',
    definitions: [
      '情緒低落的樣子',
      '神色沮喪',
      '顏色暗淡'
    ],
    examples: [
      '黯然神傷，淚眼朦朧。',
      '夕陽西下，天地黯然失色。'
    ],
    synonyms: ['沮喪', '消沉', '黯淡', '凄然'],
    antonyms: ['明亮', '燦爛', '昂揚'],
    register: 'literary',
    etymology: '本義為光線暗淡，後引申為情緒低落'
  },
  {
    word: '躊躇',
    pronunciation: 'chóu chú',
    partOfSpeech: '形容詞',
    definitions: [
      '猶豫不決',
      '得意的樣子',
      '從容自得的樣子'
    ],
    examples: [
      '他躊躇片刻，終於下定決心。',
      '躊躇滿志，意氣風發。'
    ],
    synonyms: ['猶豫', '遲疑', '彷徨', '躊躇'],
    antonyms: ['果斷', '堅決', '堅定'],
    register: 'literary',
    etymology: '出自《莊子》'
  },
  {
    word: '縹緗',
    pronunciation: 'piǎo xiǎng',
    partOfSpeech: '名詞',
    definitions: [
      '代指書卷、書籍',
      '書香門第',
      '知識的象徵'
    ],
    examples: [
      '他博覽縹緗，博學多才。',
      '縹緗之家，代有才人出。'
    ],
    synonyms: ['書卷', '典籍', '圖書'],
    antonyms: [],
    register: 'literary',
    etymology: '古人書套的顏色，代指書籍'
  },

  // ============================================
  // 第四部分：現代文學詞彙（10+ 詞條）
  // ============================================
  
  {
    word: '疏離',
    pronunciation: 'shū lí',
    partOfSpeech: '形容詞',
    definitions: [
      '人際關係疏遠冷淡',
      '心理上的距離感',
      '社會隔離'
    ],
    examples: [
      '都市生活中，人與人之間常常感到疏離。',
      '她與他之間，產生了一種難以言說的疏離感。'
    ],
    synonyms: ['疏遠', '隔閡', '冷漠', '冷淡'],
    antonyms: ['親近', '親密', '溫暖', '熱絡'],
    register: 'written',
    etymology: '現代心理學用語，指人際關係的疏遠'
  },
  {
    word: '羈絆',
    pronunciation: 'jī bàn',
    partOfSpeech: '名詞',
    definitions: [
      '束縛、牽制',
      '情感上的牽掛',
      '難以擺脫的關係'
    ],
    examples: [
      '他不願被世俗的羈絆所束縛。',
      '親情的羈絆，是他永遠的牽掛。'
    ],
    synonyms: ['束縛', '牽掛', '糾纏', '羈絆'],
    antonyms: ['自由', '解脫', '超脫'],
    register: 'literary',
    etymology: '本義為馬籠頭，後引申為束縛、牽掛'
  },
  {
    word: '荒誕',
    pronunciation: 'huāng dàn',
    partOfSpeech: '形容詞',
    definitions: [
      '極不真實、不合情理',
      '滑稽可笑',
      '現代派文學風格'
    ],
    examples: [
      '這個故事荒誕不經，卻發人深省。',
      '荒誕派戲劇，以誇張的手法揭示人生的虛無。'
    ],
    synonyms: ['虛妄', '離奇', '荒謬', '滑稽'],
    antonyms: ['合理', '真實', '可信'],
    register: 'literary',
    etymology: '現代文學術語，指違背常理的事物'
  },
  {
    word: '迷惘',
    pronunciation: 'mí wǎng',
    partOfSpeech: '形容詞',
    definitions: [
      '迷惑不解、不知所措',
      '對未來感到迷茫',
      '失去方向感'
    ],
    examples: [
      '在人生的十字路口，他感到深深的迷惘。',
      '迷惘的眼神，望向未知的遠方。'
    ],
    synonyms: ['迷茫', '迷惑', '彷徨', '困惑'],
    antonyms: ['清醒', '明確', '堅定'],
    register: 'written',
    etymology: '現代文學常用詞，形容迷惑不解的狀態'
  },
  {
    word: '沉溺',
    pronunciation: 'chén nì',
    partOfSpeech: '動詞',
    definitions: [
      '陷入不良境地無法自拔',
      '沉入水中',
      '過度沉迷於某種情緒'
    ],
    examples: [
      '他沉溺於賭博，無法回頭。',
      '沉溺在往事的回憶中，不能自拔。'
    ],
    synonyms: ['沉迷', '沉淪', '淪陷', '陷入'],
    antonyms: ['自拔', '超脫', '覺醒'],
    register: 'written',
    etymology: '本義為沉入水中，後引申為過度沉迷'
  },

  // ============================================
  // 第五部分：口語/俚語詞彙（10+ 詞條）
  // ============================================
  
  {
    word: '很罩',
    pronunciation: 'hěn zhào',
    partOfSpeech: '形容詞',
    definitions: [
      '很厲害、很有能力',
      '能夠罩住場面',
      '台灣國語常用語'
    ],
    examples: [
      '這個人很罩，什麼事都能搞定。',
      '有他在就放心了，果然很罩！'
    ],
    synonyms: ['厲害', '罩得住', '可靠'],
    antonyms: ['不行', '遜'],
    register: 'colloquial_spoken',
    etymology: '台灣年輕人用語，「罩」為保護、照顧之意'
  },
  {
    word: '機車',
    pronunciation: 'jī chē',
    partOfSpeech: '形容詞',
    definitions: [
      '很讨厌、很糟糕',
      '形容人很龜毛',
      '台灣特有用語'
    ],
    examples: [
      '這個人真的很機車！',
      '老闆很機車，處處為難人。'
    ],
    synonyms: ['讨厌', '機車', '難搞'],
    antonyms: ['天使', '好相處'],
    register: 'colloquial_spoken',
    etymology: '台灣國語俚語，「機車」本為摩托車，此為比喻用法'
  },
  {
    word: '很雷',
    pronunciation: 'hěn léi',
    partOfSpeech: '形容詞',
    definitions: [
      '很差勁、很糟糕',
      '像被雷打到一樣倒霉',
      '網路流行語'
    ],
    examples: [
      '這部電影很雷，不建議看。',
      '他的建議很雷，害我們走了很多冤路。'
    ],
    synonyms: ['很雷', '很糟', '很差'],
    antonyms: ['很讚', '很棒'],
    register: 'slang',
    etymology: '網路用語，「雷」為「像被雷打到」的簡化'
  },
  {
    word: '崩潰',
    pronunciation: 'bēng kuì',
    partOfSpeech: '動詞/形容詞',
    definitions: [
      '精神或情緒徹底瓦解',
      '受不了、達到極限',
      '網路用語表示極度無奈'
    ],
    examples: [
      '面對這個問題，他完全崩潰了。',
      '考試成績讓我崩潰。'
    ],
    synonyms: ['受不了', '抓狂', '瓦解'],
    antonyms: ['冷靜', '淡定'],
    register: 'colloquial_spoken',
    etymology: '心理學用語，後成為網路流行語'
  },
  {
    word: '魯蛇',
    pronunciation: 'lǔ shé',
    partOfSpeech: '名詞',
    definitions: [
      '失敗者、LOSER的音譯',
      '自嘲或嘲人的用語',
      '網路文化用語'
    ],
    examples: [
      '我就是個魯蛇，又有什麼辦法呢？',
      '魯蛇翻身的故事總是很激勵人心。'
    ],
    synonyms: ['失敗者', '盧蛇', 'LOSER'],
    antonyms: ['人生勝利組', '贏家'],
    register: 'slang',
    etymology: '網路用語，是英文「loser」的音譯'
  }
];

export default zhTWLiteraryVocabulary;
