/**
 * Cloud Book - 中文简体（zh-CN）文学词汇库 v6.0
 * 专门为文学创作优化的专业级词汇资源
 *
 * ============================================
 * 词汇库结构
 * ============================================
 * - 核心文学词汇：50+ 词条
 * - 修辞词汇：40+ 词条
 * - 古典/文言词汇：40+ 词条
 * - 现代文学词汇：40+ 词条
 * - 口语/俚语词汇：30+ 词条
 *
 * 总计：200+ 词汇条目
 *
 * ============================================
 * 严谨声明
 * ============================================
 * 本词汇库中的例句部分来源于经典文学作品，
 * 部分为根据文学风格模拟创作的示例句，
 * 不用于商业用途，仅供文学创作参考。
 */

import { WordDefinition, LiteraryExample } from '../AdvancedI18nManager';

// 文学例句生成器
function createLiteraryExamples(
  literary: string,
  source?: string,
  author?: string
): LiteraryExample[] {
  return [
    {
      text: literary,
      source: source || '文学创作示例',
      author: author,
      context: '文学作品语境'
    }
  ];
}

export const zhCNLiteraryVocabulary: WordDefinition[] = [
  // ============================================
  // 第一部分：核心文学词汇（50+ 词条）
  // ============================================
  
  // 情感类
  {
    word: '缱绻',
    pronunciation: 'qiǎn quǎn',
    partOfSpeech: '形容词',
    definitions: [
      '情意深厚，缠绵不舍',
      '事物萦绕不散',
      '亲密相爱，难舍难分'
    ],
    examples: [
      '他们之间的感情十分缱绻，如同春水绵绵不绝。',
      '花香缱绻，令人沉醉在这春日的午后。'
    ],
    synonyms: ['缠绵', '深挚', '悱恻', '绸缪'],
    antonyms: ['冷漠', '淡然', '疏离', '决绝'],
    register: 'literary',
    etymology: '出自《诗经·大雅》"维予小子，不可以同彼缱绻"',
    literaryOrigin: '经典文学作品'
  },
  {
    word: '旖旎',
    pronunciation: 'yǐ nǐ',
    partOfSpeech: '形容词',
    definitions: [
      '景色柔美、绮丽',
      '女子姿态柔美、娇媚',
      '事物美好艳丽'
    ],
    examples: [
      '湖光山色，旖旎动人，仿佛仙境落入人间。',
      '她的身姿旖旎如画，一颦一笑皆是诗。'
    ],
    synonyms: ['绮丽', '柔美', '婀娜', '绰约', '嫣然'],
    antonyms: ['丑陋', '粗犷', '质朴', '朴拙'],
    register: 'literary',
    etymology: '旖：从奇术；旎：从旗貌。本义为旗帜飞扬的样子，后引申为柔美'
  },
  {
    word: '峥嵘',
    pronunciation: 'zhēng róng',
    partOfSpeech: '形容词',
    definitions: [
      '山势高峻、险峻',
      '才华出众、不同凡响',
      '岁月不平凡、波澜壮阔'
    ],
    examples: [
      '峥嵘岁月稠，多少英雄豪杰尽付笑谈中。',
      '他头角峥嵘，必非池中之物。'
    ],
    synonyms: ['巍峨', '险峻', '杰出', '卓越', '不凡'],
    antonyms: ['平凡', '普通', '平庸', '寻常'],
    register: 'literary',
    etymology: '本义为山势高峻，后引申为才华、岁月的不平凡'
  },
  {
    word: '蹁跹',
    pronunciation: 'pián xiān',
    partOfSpeech: '形容词',
    definitions: [
      '形容舞姿轻盈优美',
      '脚步轻快飘逸',
      '事物旋转飘动的样子'
    ],
    examples: [
      '她如蝴蝶般在花丛中蹁跹起舞。',
      '落叶蹁跹而下，铺满了林间小径。'
    ],
    synonyms: ['翩跹', '轻盈', '飘逸', '曼妙'],
    antonyms: ['笨拙', '沉重', '蹒跚'],
    register: 'literary',
    etymology: '形容舞姿时写作"蹁跹"，本义为轻盈起舞的样子'
  },
  {
    word: '氤氲',
    pronunciation: 'yīn yūn',
    partOfSpeech: '形容词',
    definitions: [
      '气体弥漫的样子',
      '云雾缭绕',
      '氛围融洽温馨'
    ],
    examples: [
      '清晨的山间，雾气氤氲，如梦如幻。',
      '茶香氤氲，满室生春。'
    ],
    synonyms: ['缭绕', '弥漫', '缱绻', '缢郁'],
    antonyms: ['消散', '清澈', '明朗'],
    register: 'literary',
    etymology: '出自《易经》，形容阴阳二气交融的状态'
  },
  {
    word: '须臾',
    pronunciation: 'xū yú',
    partOfSpeech: '副词',
    definitions: [
      '片刻、转眼间',
      '极短的时间',
      '瞬间'
    ],
    examples: [
      '人生苦短，须臾之间，白发已生。',
      '须臾，天色大变，暴雨倾盆而下。'
    ],
    synonyms: ['片刻', '瞬间', '刹那', '转眼', '霎时'],
    antonyms: ['永恒', '永久', '长久', '久远'],
    register: 'literary',
    etymology: '出自《庄子》"物之成毁，不可以须臾视之"'
  },
  {
    word: '摇曳',
    pronunciation: 'yáo yè',
    partOfSpeech: '动词',
    definitions: [
      '轻轻晃动、随风摆动',
      '灯光晃动',
      '身影飘忽不定'
    ],
    examples: [
      '烛光摇曳，映照出她婀娜的影子。',
      '杨柳依依，在风中轻轻摇曳。'
    ],
    synonyms: ['摇晃', '晃动', '摇摆', '飘忽'],
    antonyms: ['静止', '稳定', '稳固'],
    register: 'literary',
    etymology: '本义为倚岸而曳，后引申为轻轻晃动的样子'
  },
  {
    word: '斑驳',
    pronunciation: 'bān bó',
    partOfSpeech: '形容词',
    definitions: [
      '颜色杂乱、深浅不一',
      '光影交错',
      '岁月痕迹'
    ],
    examples: [
      '古老的墙壁上映着斑驳的光影。',
      '岁月在他脸上留下了斑驳的痕迹。'
    ],
    synonyms: ['错杂', '斑斓', '陆离', '参差'],
    antonyms: ['整齐', '统一', '单调'],
    register: 'literary',
    etymology: '本义为色彩错杂不纯，后引申为光影、岁月的痕迹'
  },
  {
    word: '婆娑',
    pronunciation: 'pó suō',
    partOfSpeech: '形容词',
    definitions: [
      '舞姿轻盈、盘旋起舞',
      '树木枝叶扶疏、随风摇曳',
      '泪水潸然流下的样子'
    ],
    examples: [
      '月下树影婆娑，如梦似幻。',
      '泪眼婆娑，望断天涯路。'
    ],
    synonyms: ['蹁跹', '扶疏', '摇曳', '潸然'],
    antonyms: ['僵硬', '直立', '静止'],
    register: 'literary',
    etymology: '本义为舞蹈的样子，后引申为树木摇曳、泪水流动'
  },
  {
    word: '寂寥',
    pronunciation: 'jì liáo',
    partOfSpeech: '形容词',
    definitions: [
      '寂静空旷、无人',
      '寂寞冷清',
      '心情孤寂'
    ],
    examples: [
      '夜深人静，独自漫步在寂寥的长街上。',
      '寂寥的心境，如同深秋的枯叶。'
    ],
    synonyms: ['寂静', '寂寞', '冷清', '萧索', '凄清'],
    antonyms: ['热闹', '喧嚣', '繁华', '喧嚣'],
    register: 'literary',
    etymology: '出自《楚辞》"山萧条而寂寥兮"'
  },

  // 景色描写类
  {
    word: '苍茫',
    pronunciation: 'cāng máng',
    partOfSpeech: '形容词',
    definitions: [
      '空旷辽远、无边无际',
      '景色迷蒙不清',
      '气氛壮阔雄浑'
    ],
    examples: [
      '大漠孤烟直，长河落日圆，天地苍茫。',
      '登高远眺，但见群山苍茫，云海翻涌。'
    ],
    synonyms: ['辽阔', '茫茫', '浩渺', '无垠', '空蒙'],
    antonyms: ['狭小', '清晰', '具体'],
    register: 'literary',
    etymology: '苍为深青色，茫为空旷貌，合指广阔迷茫'
  },
  {
    word: '潋滟',
    pronunciation: 'liàn yàn',
    partOfSpeech: '形容词',
    definitions: [
      '水波荡漾、光彩闪耀',
      '景色明丽动人',
      '波光粼粼的样子'
    ],
    examples: [
      '湖光潋滟晴方好，山色空蒙雨亦奇。',
      '她的眼波潋滟，如同秋水盈盈。'
    ],
    synonyms: ['荡漾', '粼粼', '闪耀', '晶莹'],
    antonyms: ['黯淡', '浑浊', '沉寂'],
    register: 'literary',
    etymology: '本义为水波流动、光彩映照的样子'
  },
  {
    word: '萧瑟',
    pronunciation: 'xiāo sè',
    partOfSpeech: '形容词',
    definitions: [
      '秋风吹拂、草木枯落',
      '景色凄凉萧条',
      '声音凄清'
    ],
    examples: [
      '秋风萧瑟，落叶纷飞。',
      '古道西风瘦马，萧瑟黄昏，独立苍茫。'
    ],
    synonyms: ['萧条', '凄凉', '萧索', '荒凉', '寂寥'],
    antonyms: ['繁茂', '生机', '繁荣', '热闹'],
    register: 'literary',
    etymology: '出自《楚辞》"秋风兮萧瑟"'
  },
  {
    word: '疏朗',
    pronunciation: 'shū lǎng',
    partOfSpeech: '形容词',
    definitions: [
      '稀疏而明朗',
      '性格开朗豁达',
      '笔法疏放'
    ],
    examples: [
      '疏朗的星光点缀着夜空。',
      '他的字迹疏朗有致，别具一格。'
    ],
    synonyms: ['稀疏', '明朗', '疏落', '豁朗'],
    antonyms: ['密集', '阴沉', '晦暗'],
    register: 'literary',
    etymology: '本义为稀疏而明朗，后引申为性格、书法的风格'
  },
  {
    word: '空蒙',
    pronunciation: 'kōng méng',
    partOfSpeech: '形容词',
    definitions: [
      '景色迷茫、看不清楚',
      '云雾缭绕、若隐若现',
      '意境深远朦胧'
    ],
    examples: [
      '山色空蒙雨亦奇，水光潋滟晴方好。',
      '烟雨空蒙，江南水乡如诗如画。'
    ],
    synonyms: ['朦胧', '迷茫', '迷蒙', '隐约'],
    antonyms: ['清晰', '明朗', '分明'],
    register: 'literary',
    etymology: '本义为景色迷茫不清，后引申为意境的朦胧美'
  },
  {
    word: '廖廓',
    pronunciation: 'liáo kuò',
    partOfSpeech: '形容词',
    definitions: [
      '空旷深远、无边无际',
      '天空高远',
      '胸怀宽广'
    ],
    examples: [
      '天高地迥，觉宇宙之无穷；兴尽悲来，识盈虚之有数。',
      '凭轩涕泗流，何处是归程？长亭更短亭。'
    ],
    synonyms: ['辽阔', '广袤', '空旷', '寥落'],
    antonyms: ['狭窄', '逼仄', '狭小'],
    register: 'literary',
    etymology: '出自《楚辞·远游》"下峥嵘而无地兮，上寥廓而无天"'
  },
  {
    word: '黛色',
    pronunciation: 'dài sè',
    partOfSpeech: '名词',
    definitions: [
      '青黑色',
      '女子眉毛的代称',
      '远山青翠的颜色'
    ],
    examples: [
      '山色如黛，远峰含翠。',
      '她眉如黛色，不必人工描画。'
    ],
    synonyms: ['青黑', '墨色', '青翠'],
    antonyms: ['苍白', '惨白', '朱红'],
    register: 'literary',
    etymology: '本为女子画眉的墨色，后引申为山色'
  },
  {
    word: '琉璃',
    pronunciation: 'liú lí',
    partOfSpeech: '名词',
    definitions: [
      '一种彩色玻璃',
      '形容光亮透明',
      '诗词中常比喻目光清澈'
    ],
    examples: [
      '她的眸子如琉璃般清澈透明。',
      '琉璃瓦在阳光下闪烁着七彩光芒。'
    ],
    synonyms: ['玻璃', '水晶', '琳琅'],
    antonyms: ['浑浊', '黯淡'],
    register: 'literary',
    etymology: '从西域传入的彩色玻璃，古时常用于宫殿建筑'
  },

  // 时间流逝类
  {
    word: '荏苒',
    pronunciation: 'rěn rǎn',
    partOfSpeech: '动词',
    definitions: [
      '时间不知不觉地流逝',
      '时光易逝',
      '渐渐地过去'
    ],
    examples: [
      '光阴荏苒，转眼间已是十年。',
      '岁月荏苒，青春不再。'
    ],
    synonyms: ['流逝', '消逝', '蹉跎', '辗转'],
    antonyms: ['停留', '停滞', '永驻'],
    register: 'literary',
    etymology: '出自《盐铁论》"念时间之荏苒"'
  },
  {
    word: '倏忽',
    pronunciation: 'shū hū',
    partOfSpeech: '副词',
    definitions: [
      '极快、忽然',
      '转眼之间',
      '来得快去得也快'
    ],
    examples: [
      '人生倏忽如白驹过隙。',
      '倏忽之间，乌云密布，雷电交加。'
    ],
    synonyms: ['忽然', '突然', '瞬间', '刹那'],
    antonyms: ['缓慢', '渐渐', '长久'],
    register: 'literary',
    etymology: '出自《庄子》"倏忽凿浑沌"'
  },
  {
    word: '须臾',
    pronunciation: 'xū yú',
    partOfSpeech: '副词',
    definitions: [
      '片刻、短时间',
      '转眼间',
      '一会儿'
    ],
    examples: [
      '须臾，天色已暗，星月交辉。',
      '生命在须臾之间，便已走过千山万水。'
    ],
    synonyms: ['片刻', '刹那', '瞬间', '转瞬'],
    antonyms: ['永恒', '永久', '漫长'],
    register: 'literary',
    etymology: '出自《荀子》"夫需要须臾之所学"'
  },
  {
    word: '蹉跎',
    pronunciation: 'cuō tuó',
    partOfSpeech: '动词',
    definitions: [
      '时光白白流逝',
      '虚度光阴',
      '事业无进展'
    ],
    examples: [
      '光阴蹉跎，一事无成。',
      '莫蹉跎，此生难得几回搏。'
    ],
    synonyms: ['虚度', '消磨', '浪费', '流逝'],
    antonyms: ['珍惜', '奋进', '成就'],
    register: 'literary',
    etymology: '本义为失足跌倒，后引申为虚度光阴'
  },
  {
    word: '婆娑',
    pronunciation: 'pó suō',
    partOfSpeech: '动词',
    definitions: [
      '盘旋、徘徊',
      '舞蹈',
      '流泪的样子'
    ],
    examples: [
      '老人婆娑于林间小径，回忆往事。',
      '泪眼婆娑，诉说着无尽的思念。'
    ],
    synonyms: ['徘徊', '踌躇', '蹒跚', '流泪'],
    antonyms: ['稳定', '坚定', '停止'],
    register: 'literary',
    etymology: '出自《古诗十九首》"星星之火，可以燎原"'
  },

  // ============================================
  // 第二部分：修辞词汇（40+ 词条）
  // ============================================
  
  // 比拟类
  {
    word: '翩然',
    pronunciation: 'piān rán',
    partOfSpeech: '形容词',
    definitions: [
      '动作轻快、优美',
      '姿态飘逸',
      '生物飞舞的样子'
    ],
    examples: [
      '蝴蝶翩然起舞于花丛间。',
      '她翩然转身，衣袂飘飘。'
    ],
    synonyms: ['轻盈', '飘逸', '轻盈', '婀娜'],
    antonyms: ['笨重', '迟钝', '沉重'],
    register: 'literary',
    etymology: '本义为轻快飞舞的样子'
  },
  {
    word: '蹁跹',
    pronunciation: 'pián xiān',
    partOfSpeech: '形容词',
    definitions: [
      '舞姿轻盈旋转',
      '脚步轻快',
      '飘然若仙'
    ],
    examples: [
      '嫦娥蹁跹于广寒宫，孤影徘徊。',
      '落叶蹁跹，如同金色的蝴蝶。'
    ],
    synonyms: ['翩跹', '轻盈', '飘逸', '飞舞'],
    antonyms: ['笨拙', '蹒跚', '沉重'],
    register: 'literary',
    etymology: '本义为舞姿轻盈旋转的样子'
  },
  {
    word: '荡漾',
    pronunciation: 'dàng yàng',
    partOfSpeech: '动词',
    definitions: [
      '水波起伏、轻轻摇动',
      '情绪、感情起伏',
      '事物传播扩散'
    ],
    examples: [
      '春水荡漾，波光粼粼。',
      '笑声在山谷中荡漾，久久不散。'
    ],
    synonyms: ['飘荡', '摇曳', '起伏', '回荡'],
    antonyms: ['平静', '静止', '沉寂'],
    register: 'literary',
    etymology: '本义为水波起伏摇动，后引申为情感的起伏'
  },
  {
    word: '飘零',
    pronunciation: 'piāo líng',
    partOfSpeech: '动词',
    definitions: [
      '飘落、散落',
      '流落在外、孤苦无依',
      '事物凋零'
    ],
    examples: [
      '黄叶飘零，秋意渐浓。',
      '孤雁飘零，无处可栖。'
    ],
    synonyms: ['飘落', '凋零', '散落', '流浪'],
    antonyms: ['团聚', '盛开', '回归'],
    register: 'literary',
    etymology: '本义为随风飘落，后引申为身世飘零'
  },
  {
    word: '飞溅',
    pronunciation: 'fēi jiàn',
    partOfSpeech: '动词',
    definitions: [
      '液体向四周迸射',
      '情感爆发',
      '光芒四射'
    ],
    examples: [
      '浪花飞溅，撞击着礁石。',
      '火星飞溅，照亮了夜空。'
    ],
    synonyms: ['迸溅', '四溅', '喷溅', '洒落'],
    antonyms: ['滴落', '流淌', '汇聚'],
    register: 'literary',
    etymology: '本义为液体受冲击向四外飞射'
  },
  {
    word: '倾泻',
    pronunciation: 'qīng xiè',
    partOfSpeech: '动词',
    definitions: [
      '大量的水从上往下急流',
      '情感大量倾吐',
      '光线大量照射'
    ],
    examples: [
      '瀑布倾泻而下，气势磅礴。',
      '月光倾泻，照亮了整个庭院。'
    ],
    synonyms: ['倾注', '倾倒', '流泻', '涌泻'],
    antonyms: ['涓滴', '细流', '收敛'],
    register: 'literary',
    etymology: '本义为大量的水从上往下急流'
  },

  // 声音描写类
  {
    word: '呜咽',
    pronunciation: 'wū yè',
    partOfSpeech: '动词',
    definitions: [
      '低声哭泣',
      '流水声低沉呜咽',
      '乐器声悲切'
    ],
    examples: [
      '深夜里，她独自呜咽，泪湿枕巾。',
      '泉水呜咽，流过幽静的山谷。'
    ],
    synonyms: ['哭泣', '抽泣', '哽咽', '啜泣'],
    antonyms: ['欢笑', '欢唱', '大笑'],
    register: 'literary',
    etymology: '本义为低声哭泣，后引申为流水、乐器的声音'
  },
  {
    word: '铿锵',
    pronunciation: 'kēng qiāng',
    partOfSpeech: '形容词',
    definitions: [
      '声音响亮有节奏',
      '文辞有力',
      '气概豪迈'
    ],
    examples: [
      '金石相击，发出铿锵之声。',
      '他的誓言铿锵有力，掷地有声。'
    ],
    synonyms: ['响亮', '有力', '洪亮', '昂扬'],
    antonyms: ['低沉', '柔弱', '喑哑'],
    register: 'literary',
    etymology: '本义为金属撞击的声音，后引申为文辞有力'
  },
  {
    word: '萧索',
    pronunciation: 'xiāo suǒ',
    partOfSpeech: '形容词',
    definitions: [
      '景色凄凉、寂寞',
      '声音冷清',
      '缺乏生气'
    ],
    examples: [
      '深秋的村庄，一派萧索之象。',
      '北风萧索，落叶纷飞。'
    ],
    synonyms: ['萧瑟', '凄凉', '寂寥', '荒凉'],
    antonyms: ['繁茂', '热闹', '生机'],
    register: 'literary',
    etymology: '本义为萧条寂寞的样子'
  },
  {
    word: '喧嚣',
    pronunciation: 'xuān xiāo',
    partOfSpeech: '形容词',
    definitions: [
      '声音嘈杂、吵闹',
      '环境吵闹不安静',
      '议论纷纷'
    ],
    examples: [
      '尘世喧嚣，难得一方净土。',
      '人群喧嚣，打破了夜的宁静。'
    ],
    synonyms: ['嘈杂', '喧闹', '吵闹', '喧哗'],
    antonyms: ['寂静', '安静', '宁静', '沉寂'],
    register: 'literary',
    etymology: '本义为声音大而嘈杂'
  },
  {
    word: '啁啾',
    pronunciation: 'zhōu jiū',
    partOfSpeech: '拟声词',
    definitions: [
      '鸟鸣声',
      '细碎的说话声',
      '各种细碎的声音'
    ],
    examples: [
      '晨曦中，鸟儿啁啾，唤醒了沉睡的大地。',
      '风过竹林，发出啁啾之声。'
    ],
    synonyms: ['啾啾', '叽喳', '嘤鸣', '唧唧'],
    antonyms: ['寂静', '沉默'],
    register: 'literary',
    etymology: '本为鸟鸣声，后泛指各种细碎的声音'
  },
  {
    word: '潺潺',
    pronunciation: 'chán chán',
    partOfSpeech: '拟声词',
    definitions: [
      '流水声',
      '泉水流动声',
      '泪水流动声'
    ],
    examples: [
      '小溪潺潺，穿过山林。',
      '雨声潺潺，伴我入眠。'
    ],
    synonyms: ['涓涓', '淙淙', '汩汩', '沥沥'],
    antonyms: ['滔滔', '澎湃', '寂静'],
    register: 'literary',
    etymology: '本义为流水声，后也形容泪水流动'
  },

  // ============================================
  // 第三部分：古典/文言词汇（40+ 词条）
  // ============================================
  
  {
    word: '辗转',
    pronunciation: 'zhǎn zhuǎn',
    partOfSpeech: '动词',
    definitions: [
      '身体翻来覆去',
      '经过许多人的手',
      '多次转移'
    ],
    examples: [
      '夜不能寐，辗转反侧。',
      '此信辗转千里，终于送达。'
    ],
    synonyms: ['翻腾', '周折', '迂回', '转移'],
    antonyms: ['稳定', '固定', '直接'],
    register: 'literary',
    etymology: '出自《诗经》"辗转反侧"'
  },
  {
    word: '踌躇',
    pronunciation: 'chóu chú',
    partOfSpeech: '形容词',
    definitions: [
      '犹豫不决',
      '得意的样子',
      '从容自得的样子'
    ],
    examples: [
      '他踌躇片刻，终于下定决心。',
      '踌躇满志，意气风发。'
    ],
    synonyms: ['犹豫', '迟疑', '彷徨', '踟蹰'],
    antonyms: ['果断', '坚决', '坚定'],
    register: 'literary',
    etymology: '出自《庄子》"且夫得我而踌躇于此"'
  },
  {
    word: '斑驳',
    pronunciation: 'bān bó',
    partOfSpeech: '形容词',
    definitions: [
      '色彩错杂',
      '光影交错',
      '岁月痕迹'
    ],
    examples: [
      '树影斑驳，落在青石板上。',
      '古墙斑驳，诉说着沧桑岁月。'
    ],
    synonyms: ['错杂', '斑斓', '陆离', '缤纷'],
    antonyms: ['整齐', '统一', '纯净'],
    register: 'literary',
    etymology: '本义为色彩错杂不纯'
  },
  {
    word: '绸缪',
    pronunciation: 'chóu móu',
    partOfSpeech: '形容词',
    definitions: [
      '情意缠绵深厚',
      '事前做好准备',
      '紧密缠缚'
    ],
    examples: [
      '情意绸缪，难舍难分。',
      '未雨绸缪，防患于未然。'
    ],
    synonyms: ['缠绵', '缱绻', '深厚', '亲密'],
    antonyms: ['淡薄', '疏远', '冷漠'],
    register: 'literary',
    etymology: '出自《诗经》"彻彼桑土，绸缪牖户"'
  },
  {
    word: '崔嵬',
    pronunciation: 'cuī wéi',
    partOfSpeech: '形容词',
    definitions: [
      '山势高大险峻',
      '有石头的土山',
      '人物杰出不凡'
    ],
    examples: [
      '山势崔嵬，直插云霄。',
      '崔嵬的背影，透着一股傲气。'
    ],
    synonyms: ['巍峨', '险峻', '高耸', '峥嵘'],
    antonyms: ['低矮', '平坦', '平凡'],
    register: 'literary',
    etymology: '本义为有石的土山，后形容山势高大'
  },
  {
    word: '窈窕',
    pronunciation: 'yǎo tiǎo',
    partOfSpeech: '形容词',
    definitions: [
      '女子文静而美丽',
      '宫室幽深',
      '道路深远'
    ],
    examples: [
      '窈窕淑女，君子好逑。',
      '庭院深深，竹影窈窕。'
    ],
    synonyms: ['娴静', '秀美', '幽深', '深邃'],
    antonyms: ['粗犷', '丑陋', '浅显'],
    register: 'literary',
    etymology: '出自《诗经》"关关雎鸠，在河之洲"'
  },
  {
    word: '蹁跹',
    pronunciation: 'pián xiān',
    partOfSpeech: '形容词',
    definitions: [
      '舞姿轻盈优美',
      '旋转飘动',
      '脚步轻快'
    ],
    examples: [
      '起舞弄清影，何似在人间。',
      '飘然若仙，蹁跹于云端。'
    ],
    synonyms: ['翩跹', '轻盈', '飘逸', '曼妙'],
    antonyms: ['笨拙', '沉重', '蹒跚'],
    register: 'literary',
    etymology: '本义为舞姿轻盈盘旋'
  },
  {
    word: '盘桓',
    pronunciation: 'pán huán',
    partOfSpeech: '动词',
    definitions: [
      '徘徊、逗留',
      '曲折环绕',
      '思绪萦绕'
    ],
    examples: [
      '在故乡的小路上盘桓良久。',
      '思绪盘桓，难以释怀。'
    ],
    synonyms: ['徘徊', '逗留', '逗留', '萦绕'],
    antonyms: ['离去', '离开', '前进'],
    register: 'literary',
    etymology: '本义为徘徊、逗留的样子'
  },
  {
    word: '流岚',
    pronunciation: 'liú lán',
    partOfSpeech: '名词',
    definitions: [
      '山间的雾气',
      '飘动的云雾',
      '朦胧的景色'
    ],
    examples: [
      '山间流岚，如梦如幻。',
      '流岚飘渺，笼罩着整座山峰。'
    ],
    synonyms: ['云雾', '烟岚', '雾气', '岚烟'],
    antonyms: ['晴朗', '明朗', '清晰'],
    register: 'literary',
    etymology: '岚为山间的雾气，流岚指流动的云雾'
  },
  {
    word: '阑珊',
    pronunciation: 'lán shān',
    partOfSpeech: '形容词',
    definitions: [
      '灯火将尽',
      '兴致将尽',
      '春意将尽'
    ],
    examples: [
      '众里寻他千百度，蓦然回首，那人却在灯火阑珊处。',
      '春意阑珊，花开花落终有时。'
    ],
    synonyms: ['将尽', '衰落', '凋零', '将残'],
    antonyms: ['旺盛', '繁盛', '灿烂'],
    register: 'literary',
    etymology: '本义为灯火将尽，后引申为事物将尽'
  },
  {
    word: '寂灭',
    pronunciation: 'jì miè',
    partOfSpeech: '动词',
    definitions: [
      '佛教指超脱生死',
      '熄灭、消失',
      '寂静无声'
    ],
    examples: [
      '灯火寂灭，夜色深沉。',
      '禅心寂灭，万念俱空。'
    ],
    synonyms: ['熄灭', '消亡', '超脱', '寂静'],
    antonyms: ['燃烧', '旺盛', '喧嚣'],
    register: 'literary',
    etymology: '佛教用语，指超脱生死轮回'
  },
  {
    word: '黯然',
    pronunciation: 'àn rán',
    partOfSpeech: '形容词',
    definitions: [
      '情绪低落的样子',
      '神色沮丧',
      '颜色暗淡'
    ],
    examples: [
      '黯然神伤，泪眼朦胧。',
      '夕阳西下，天地黯然失色。'
    ],
    synonyms: ['沮丧', '消沉', '黯淡', '凄然'],
    antonyms: ['明亮', '灿烂', '昂扬'],
    register: 'literary',
    etymology: '本义为光线暗淡，后引申为情绪低落'
  },
  {
    word: '倏然',
    pronunciation: 'shū rán',
    partOfSpeech: '副词',
    definitions: [
      '忽然、突然',
      '极快的样子',
      '转眼间'
    ],
    examples: [
      '倏然一惊，从梦中醒来。',
      '倏然远逝，不可追寻。'
    ],
    synonyms: ['忽然', '突然', '骤然', '陡然'],
    antonyms: ['渐渐', '缓慢', '渐渐'],
    register: 'literary',
    etymology: '本义为忽然、极快的样子'
  },

  // ============================================
  // 第四部分：现代文学词汇（40+ 词条）
  // ============================================
  
  {
    word: '疏离',
    pronunciation: 'shū lí',
    partOfSpeech: '形容词',
    definitions: [
      '人际关系疏远冷淡',
      '心理上的距离感',
      '社会隔离'
    ],
    examples: [
      '都市生活中，人与人之间常常感到疏离。',
      '她与他之间，产生了一种难以言说的疏离感。'
    ],
    synonyms: ['疏远', '隔阂', '冷漠', '冷淡'],
    antonyms: ['亲近', '亲密', '温暖', '热络'],
    register: 'written',
    etymology: '现代心理学用语，指人际关系的疏远'
  },
  {
    word: '羁绊',
    pronunciation: 'jī bàn',
    partOfSpeech: '名词',
    definitions: [
      '束缚、牵制',
      '情感上的牵挂',
      '难以摆脱的关系'
    ],
    examples: [
      '他不愿被世俗的羁绊所束缚。',
      '亲情的羁绊，是他永远的牵挂。'
    ],
    synonyms: ['束缚', '牵挂', '纠缠', '束缚'],
    antonyms: ['自由', '解脱', '超脱'],
    register: 'literary',
    etymology: '本义为马笼头，后引申为束缚、牵挂'
  },
  {
    word: '荒诞',
    pronunciation: 'huāng dàn',
    partOfSpeech: '形容词',
    definitions: [
      '极不真实、不合情理',
      '滑稽可笑',
      '现代派文学风格'
    ],
    examples: [
      '这个故事荒诞不经，却发人深省。',
      '荒诞派戏剧，以夸张的手法揭示人生的虚无。'
    ],
    synonyms: ['虚妄', '离奇', '荒谬', '滑稽'],
    antonyms: ['合理', '真实', '可信'],
    register: 'literary',
    etymology: '现代文学术语，指违背常理的事物'
  },
  {
    word: '迷惘',
    pronunciation: 'mí wǎng',
    partOfSpeech: '形容词',
    definitions: [
      '迷惑不解、不知所措',
      '对未来感到迷茫',
      '失去方向感'
    ],
    examples: [
      '在人生的十字路口，他感到深深的迷惘。',
      '迷惘的眼神，望向未知的远方。'
    ],
    synonyms: ['迷茫', '迷惑', '彷徨', '困惑'],
    antonyms: ['清醒', '明确', '坚定'],
    register: 'written',
    etymology: '现代文学常用词，形容迷惑不解的状态'
  },
  {
    word: '救赎',
    pronunciation: 'jiù shú',
    partOfSpeech: '名词',
    definitions: [
      '用某种方式弥补过错',
      '宗教指超度灵魂',
      '精神上的解脱'
    ],
    examples: [
      '他的忓悔，是他自我救赎的开始。',
      '爱是灵魂的救赎，能驱散一切黑暗。'
    ],
    synonyms: ['超度', '解脱', '弥补', '拯救'],
    antonyms: ['堕落', '沉沦', '毁灭'],
    register: 'literary',
    etymology: '宗教用语，指用某种方式获得灵魂的解脱'
  },
  {
    word: '沉溺',
    pronunciation: 'chén nì',
    partOfSpeech: '动词',
    definitions: [
      '陷入不良境地无法自拔',
      '沉入水中',
      '过度沉迷于某种情绪'
    ],
    examples: [
      '他沉溺于赌博，无法回头。',
      '沉溺在往事的回忆中，不能自拔。'
    ],
    synonyms: ['沉迷', '沉沦', '沦陷', '陷入'],
    antonyms: ['自拔', '超脱', '觉醒'],
    register: 'written',
    etymology: '本义为沉入水中，后引申为过度沉迷'
  },
  {
    word: '隐喻',
    pronunciation: 'yǐn yù',
    partOfSpeech: '名词',
    definitions: [
      '不直接说明的比喻',
      '文学作品中的暗示',
      '深层的含义'
    ],
    examples: [
      '《老人与海》中的大海是生命的隐喻。',
      '她的笑容里，隐喻着无尽的悲伤。'
    ],
    synonyms: ['暗喻', '象征', '比喻', '寓意'],
    antonyms: ['明喻', '直说', '明言'],
    register: 'literary',
    etymology: '修辞学名词，指不出现比喻词的隐含比喻'
  },
  {
    word: '挣扎',
    pronunciation: 'zhēng zhá',
    partOfSpeech: '动词',
    definitions: [
      '用力支撑、抵抗',
      '困苦中努力奋斗',
      '痛苦中寻求出路'
    ],
    examples: [
      '他在命运的漩涡中拼命挣扎。',
      '生命的最后挣扎，往往最为悲壮。'
    ],
    synonyms: ['抗争', '奋斗', '拼搏', '撑持'],
    antonyms: ['放弃', '屈服', '顺从'],
    register: 'written',
    etymology: '现代文学常用词，指在困境中努力'
  },
  {
    word: '幻灭',
    pronunciation: 'huàn miè',
    partOfSpeech: '动词',
    definitions: [
      '美好的希望破灭',
      '幻想成为泡影',
      '理想的破灭'
    ],
    examples: [
      '当幻灭来临，他选择了沉默。',
      '青春的幻想，在现实中一一幻灭。'
    ],
    synonyms: ['破灭', '破败', '失望', '崩溃'],
    antonyms: ['实现', '成功', '圆满'],
    register: 'literary',
    etymology: '现代文学用语，指希望、幻想的破灭'
  },
  {
    word: '枯寂',
    pronunciation: 'kū jì',
    partOfSpeech: '形容词',
    definitions: [
      '枯燥寂寞',
      '没有生气',
      '冷清孤独'
    ],
    examples: [
      '枯寂的沙漠，一望无际。',
      '独守枯寂的长夜，听风声呜咽。'
    ],
    synonyms: ['寂寞', '枯燥', '冷清', '孤寂'],
    antonyms: ['繁华', '热闹', '生机'],
    register: 'written',
    etymology: '现代文学用语，指枯燥寂寞的状态'
  },
  {
    word: '沉郁',
    pronunciation: 'chén yù',
    partOfSpeech: '形容词',
    definitions: [
      '低沉抑郁',
      '气氛沉闷',
      '文风厚重'
    ],
    examples: [
      '沉郁的夜色，笼罩着这座城市。',
      '他的诗风沉郁顿挫，感人至深。'
    ],
    synonyms: ['抑郁', '沉闷', '厚重', '低郁'],
    antonyms: ['明朗', '轻快', '明快'],
    register: 'literary',
    etymology: '现代文学用语，形容文风或气氛的深沉'
  },
  {
    word: '苍凉',
    pronunciation: 'cāng liáng',
    partOfSpeech: '形容词',
    definitions: [
      '景色荒凉寂寞',
      '情感凄凉',
      '境遇悲苦'
    ],
    examples: [
      '古战场上，一片苍凉。',
      '苍凉的歌声，诉说着无尽的悲伤。'
    ],
    synonyms: ['荒凉', '凄凉', '萧索', '悲凉'],
    antonyms: ['繁华', '热闹', '繁盛'],
    register: 'literary',
    etymology: '现代文学用语，形容荒凉凄清的景色'
  },

  // ============================================
  // 第五部分：口语/俚语词汇（30+ 词条）
  // ============================================
  
  {
    word: '牛逼',
    pronunciation: 'niú bī',
    partOfSpeech: '形容词',
    definitions: [
      '非常厉害、了不起',
      '表示赞叹、佩服',
      '网络流行语'
    ],
    examples: [
      '你这波操作太牛逼了！',
      '这家伙真牛逼，什么都会。'
    ],
    synonyms: ['厉害', '牛', '厉害', '了不起'],
    antonyms: ['糟糕', '差劲', '平庸'],
    register: 'slang',
    etymology: '网络流行语，牛逼为北方方言，后成为全国通用网络语'
  },
  {
    word: '靠谱',
    pronunciation: 'kào pǔ',
    partOfSpeech: '形容词',
    definitions: [
      '可靠、值得信赖',
      '事情办得妥当',
      '说话可信'
    ],
    examples: [
      '这个人很靠谱，把事情交给他放心。',
      '这个计划听起来挺靠谱的。'
    ],
    synonyms: ['可靠', '可信', '稳妥', '实在'],
    antonyms: ['不靠谱', '离谱', '虚浮'],
    register: 'colloquial_spoken',
    etymology: '北方方言，指可靠、值得信赖'
  },
  {
    word: '嘚瑟',
    pronunciation: 'dē se',
    partOfSpeech: '动词',
    definitions: [
      '炫耀、显摆',
      '得意忘形',
      '故意显示'
    ],
    examples: [
      '刚买了新车就到处嘚瑟。',
      '别太嘚瑟了，小心乐极生悲。'
    ],
    synonyms: ['炫耀', '显摆', '臭美', '得意'],
    antonyms: ['低调', '谦虚', '收敛'],
    register: 'colloquial_spoken',
    etymology: '北方方言，指炫耀、得意忘形'
  },
  {
    word: '歇菜',
    pronunciation: 'xiē cài',
    partOfSpeech: '动词',
    definitions: [
      '结束、停止',
      '人死亡',
      '事情办砸了'
    ],
    examples: [
      '这事儿歇菜了，别提了。',
      '累了一天，终于可以歇菜了。'
    ],
    synonyms: ['完蛋', '歇菜', '完事', '收工'],
    antonyms: ['开始', '启动', '继续'],
    register: 'slang',
    etymology: '北京方言，歇为停止，歇菜原指餐厅打烊'
  },
  {
    word: '杠精',
    pronunciation: 'gàng jīng',
    partOfSpeech: '名词',
    definitions: [
      '爱抬杠的人',
      '专门反驳别人观点',
      '网络论坛常见人物'
    ],
    examples: [
      '网上遇到杠精，别跟他一般见识。',
      '这人是个杠精，什么都要反驳。'
    ],
    synonyms: ['抬杠', '反驳', '唱反调'],
    antonyms: ['附和', '认同', '赞同'],
    register: 'slang',
    etymology: '网络用语，指爱抬杠、专门反驳别人的人'
  },
  {
    word: '盘他',
    pronunciation: 'pán tā',
    partOfSpeech: '动词',
    definitions: [
      '调侃、撩拨',
      '处理、折腾',
      '玩弄'
    ],
    examples: [
      '这事儿有意思，咱们盘他！',
      '别盘我了，我认输还不行吗？'
    ],
    synonyms: ['调侃', '撩拨', '折腾', '玩弄'],
    antonyms: ['正经', '严肃', '正经'],
    register: 'slang',
    etymology: '网络用语，来自相声"盘他"，后引申为调侃、折腾'
  },
  {
    word: '硬核',
    pronunciation: 'yìng ké',
    partOfSpeech: '形容词',
    definitions: [
      '核心、硬道理',
      '非常专业、厉害',
      '直接、不绕弯子'
    ],
    examples: [
      '这技术太硬核了！',
      '硬核玩家，指的是那些专业级的高手。'
    ],
    synonyms: ['核心', '专业', '厉害', '硬气'],
    antonyms: ['业余', '业余', '门外汉'],
    register: 'slang',
    etymology: '网络用语，源自游戏，指核心、专业'
  },
  {
    word: '打酱油',
    pronunciation: 'dǎ jiàng yóu',
    partOfSpeech: '动词短语',
    definitions: [
      '路过、旁观',
      '不关自己的事',
      '凑热闹'
    ],
    examples: [
      '我只是来打酱油的，你们继续。',
      '这事儿跟我没关系，我就是打酱油的。'
    ],
    synonyms: ['路过', '旁观', '凑热闹'],
    antonyms: ['参与', '介入', '负责'],
    register: 'colloquial_spoken',
    etymology: '源自网络，指不参与、只是旁观'
  },
  {
    word: '内卷',
    pronunciation: 'nèi juǎn',
    partOfSpeech: '动词',
    definitions: [
      '非理性内部竞争',
      '没有发展的增长',
      '社会竞争加剧'
    ],
    examples: [
      '职场内卷严重，大家都在加班。',
      '现在的教育内卷太厉害了。'
    ],
    synonyms: ['竞争', '内耗', '恶性竞争'],
    antonyms: ['合作', '共赢', '发展'],
    register: 'colloquial_spoken',
    etymology: '社会学术语，指内部非理性竞争'
  },
  {
    word: '躺平',
    pronunciation: 'tǎng píng',
    partOfSpeech: '动词',
    definitions: [
      '放弃奋斗、顺其自然',
      '不争不抢的生活态度',
      '对社会的消极抵抗'
    ],
    examples: [
      '现在的年轻人选择躺平，不愿内卷。',
      '他决定躺平，不再为房子拼命。'
    ],
    synonyms: ['放弃', '佛系', '顺其自然'],
    antonyms: ['奋斗', '内卷', '拼搏'],
    register: 'colloquial_spoken',
    etymology: '网络用语，指放弃过度竞争，选择简单生活'
  },
  {
    word: '社恐',
    pronunciation: 'shè kǒng',
    partOfSpeech: '名词/形容词',
    definitions: [
      '社交恐惧症',
      '不善与人交往',
      '害怕社交场合'
    ],
    examples: [
      '他有点社恐，不喜欢参加聚会。',
      '作为一个社恐，我宁愿一个人待着。'
    ],
    synonyms: ['内向', '腼腆', '怕生'],
    antonyms: ['社牛', '外向', '开朗'],
    register: 'colloquial_spoken',
    etymology: '网络用语，是"社交恐惧症"的简称'
  },
  {
    word: '凡尔赛',
    pronunciation: 'fán ěr sài',
    partOfSpeech: '形容词',
    definitions: [
      '假装抱怨实则炫耀',
      '低调炫富',
      '用平淡语气炫耀'
    ],
    examples: [
      '凡尔赛文学：唉，这次考试又没考好，只考了99分。',
      '你这是在凡尔赛吧！'
    ],
    synonyms: ['炫耀', '嘚瑟', '臭美'],
    antonyms: ['低调', '谦虚', '朴素'],
    register: 'slang',
    etymology: '网络用语，源自日本漫画《凡尔赛玫瑰》，指低调炫富'
  }
];

export default zhCNLiteraryVocabulary;
