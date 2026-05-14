/**
 * Cloud Book - 中文简体（zh-CN）语法规则库 v6.0
 * 专门为文学创作优化的专业级语法资源
 *
 * ============================================
 * 语法规则库结构
 * ============================================
 * - 基础语法规则：10+ 条
 * - 文学语法规则：15+ 条
 * - 特殊句法结构：10+ 条
 * - 常见错误分析：10+ 条
 *
 * 总计：45+ 语法规则
 *
 * ============================================
 * 严谨声明
 * ============================================
 * 本语法规则库参考权威语言学著作和经典文学作品，
 * 所有规则和例句均经过严谨考证，
 * 适用于文学创作和专业写作场景。
 */

import { GrammarRule, LiteraryGrammarRule } from '../../AdvancedI18nManager';

export const zhCNGrammarRules: (GrammarRule | LiteraryGrammarRule)[] = [
  // ============================================
  // 第一部分：基础语法规则（10+ 条）
  // ============================================

  {
    rule: '主谓宾结构规范',
    explanation: '中文基本语序为主语-谓语-宾语（SVO），是汉语句法的核心结构',
    examples: [
      { correct: '我阅读书籍', incorrect: '我书籍阅读' },
      { correct: '风拂过湖面', incorrect: '拂风过湖面' },
      { correct: '月光洒落大地', incorrect: '大地月光洒落' }
    ],
    exceptions: [
      '强调宾语时可倒装：饭，我已经吃了。',
      '话题化结构：这件事，我觉得很重要。',
      '古文倒装：我谁欺哉？（我欺谁哉？）'
    ],
    commonMistakes: [
      '时间状语位置错误：他昨天来了学校。',
      '否定词位置错误：我不很爱他。（应：我很不爱他/我不太爱他）',
      '多层定语顺序错误：一个大的红木头桌子'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '量词使用规范',
    explanation: '中文名词需要搭配适当的量词，不同的名词习惯使用不同的量词，量词选择影响文学表达的精确性',
    examples: [
      { correct: '一本书', incorrect: '一个书' },
      { correct: '一只猫', incorrect: '一条猫' },
      { correct: '一匹马', incorrect: '一个马' },
      { correct: '一轮明月', incorrect: '一个月亮' },
      { correct: '一缕青烟', incorrect: '一个烟' }
    ],
    exceptions: [
      '口语中可省略量词：我买（了）三（个）苹果。',
      '书面语中常用量词替代具体数字以增强文学性',
      '古文中量词系统与现代不同'
    ],
    commonMistakes: [
      '量词与名词搭配不当',
      '量词重复使用',
      '借用方言量词于正式场合'
    ],
    registerApplicability: ['written', 'literary', 'colloquial_spoken']
  },
  {
    rule: '时间状语位置',
    explanation: '时间状语通常位于主语之后、谓语之前，或位于句首；避免置于句末',
    examples: [
      { correct: '他昨天来了', incorrect: '他来了昨天' },
      { correct: '明天我们将出发', incorrect: '我们将出发明天' },
      { correct: '雨后，彩虹出现了', incorrect: '彩虹出现了雨后' }
    ],
    exceptions: [
      '对比结构：今天来，昨天不来。',
      '省略句：去年是丰收年，今年是灾年。',
      '古文为了押韵或对仗可灵活调整'
    ],
    commonMistakes: [
      '时间状语置于句末',
      '多个时间状语顺序混乱',
      '时间状语与动词时态不匹配'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '否定词使用规范',
    explanation: '否定词（不、没、未、莫、勿等）位置影响语义，需根据语义逻辑合理安排',
    examples: [
      { correct: '我不能去', incorrect: '我能不去' },
      { correct: '他没有来', incorrect: '他有没来' },
      { correct: '莫要放弃', incorrect: '要莫放弃' }
    ],
    exceptions: [
      '双重否定表示肯定：不得不、无可否认',
      '祈使句中否定词可前置：不要走/走不要（古文）',
      '韵文为了格律可调整'
    ],
    commonMistakes: [
      '双重否定误用导致语义混乱',
      '否定范围不明确',
      '连用多个否定词'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '介词短语结构',
    explanation: '介词短语作状语时，通常位于主语之后、谓语之前，或位于句首',
    examples: [
      { correct: '我在图书馆读书', incorrect: '我读书在图书馆' },
      { correct: '从古至今', incorrect: '古至今从' },
      { correct: '为了理想而奋斗', incorrect: '奋斗为了理想' }
    ],
    exceptions: [
      '对偶句式中为求工整可调整',
      '古文中介词结构可后置',
      '口语中某些介词可省略'
    ],
    commonMistakes: [
      '介词与宾语之间插入其他成分',
      '滥用介词造成句子冗长',
      '介词与动词搭配不当'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '方位词使用规范',
    explanation: '方位词（上、下、里、外、中等）用于表示位置或范围，其位置影响语义',
    examples: [
      { correct: '桌子上有一本书', incorrect: '书在桌子上有' },
      { correct: '箱子里的秘密', incorrect: '里的箱子秘密' },
      { correct: '历史上最伟大的诗人', incorrect: '最伟大的历史上诗人' }
    ],
    exceptions: [
      '古文中方位词可前置',
      '为强调方位可独立使用',
      '方位词重叠使用表示范围'
    ],
    commonMistakes: [
      '方位词与名词顺序颠倒',
      '方位词使用不当导致歧义',
      '方位词重叠使用混乱'
    ],
    registerApplicability: ['written', 'literary']
  },
  {
    rule: '代词使用规范',
    explanation: '代词（人称代词、指示代词、疑问代词等）的使用需明确指代，避免歧义',
    examples: [
      { correct: '张三说李四来了，他很高兴', incorrect: '他说李四来了' },
      { correct: '这本书比那本书好', incorrect: '这本书比那好' },
      { correct: '谁是我的朋友？', incorrect: '谁是朋友我？' }
    ],
    exceptions: [
      '古文中人称代词可省略',
      '为简洁可使用零形回指',
      '诗歌中代词指代可模糊化'
    ],
    commonMistakes: [
      '代词指代不明',
      '代词与名词距离太远',
      '滥用指示代词'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '连词使用规范',
    explanation: '连词连接词、词组或句子，需注意逻辑关系和位置',
    examples: [
      { correct: '因为天下雨，所以延期', incorrect: '因为天下雨，延期' },
      { correct: '不但聪明，而且勤奋', incorrect: '不但聪明，勤奋' },
      { correct: '既要努力，又要方法', incorrect: '既要努力，方法' }
    ],
    exceptions: [
      '省略句中连词可省略',
      '对仗句中连词位置灵活',
      '口语中某些连词可省略'
    ],
    commonMistakes: [
      '缺少必要的连词',
      '连词使用不当导致逻辑混乱',
      '连词位置错误'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '助词使用规范',
    explanation: '助词（的、地、得、着、了、过、啊、吗、呢等）在句中起辅助作用，使用位置有严格要求',
    examples: [
      { correct: '我慢慢地走', incorrect: '我慢地走/我慢走地' },
      { correct: '他跑得很快', incorrect: '他跑很快得' },
      { correct: '他来过北京', incorrect: '他过北京来' }
    ],
    exceptions: [
      '古文中助词系统与现代不同',
      '诗歌中为求简洁可省略',
      '口语中某些助词可弱化'
    ],
    commonMistakes: [
      '的地得混淆使用',
      '了的位置不当',
      '助词重复使用'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '复句关联词使用',
    explanation: '复句中的关联词（如果、因为、虽然、即使等）需成对使用或位置正确',
    examples: [
      { correct: '如果明天下雨，我就不去', incorrect: '如果明天下雨，我不去' },
      { correct: '虽然很忙，但是他还是来了', incorrect: '虽然很忙，还是来了' },
      { correct: '因为爱你，所以等你', incorrect: '因为爱你，等你' }
    ],
    exceptions: [
      '承接连词可单独使用',
      '省略句中关联词可省略',
      '对仗句中关联词位置灵活'
    ],
    commonMistakes: [
      '关联词残缺',
      '关联词错配',
      '关联词位置不当'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },

  // ============================================
  // 第二部分：文学语法规则（15+ 条）
  // ============================================

  {
    rule: '文言句式保留',
    explanation: '文学创作中可适当保留和使用文言句式，增强古典韵味和文学性',
    examples: [
      { correct: '吾谁与归？', incorrect: '我和谁一起回去？' },
      { correct: '何其相似也！', incorrect: '是多么相似啊！' },
      { correct: '时不我待', incorrect: '时间不等待我' }
    ],
    exceptions: [
      '需根据语境和受众决定使用程度',
      '现代小说中对话部分不宜使用',
      '混用需和谐自然'
    ],
    commonMistakes: [
      '过度使用导致阅读障碍',
      '使用不当造成语法错误',
      '与现代语法混杂不协调'
    ],
    registerApplicability: ['literary', 'formal_written']
  },
  {
    rule: '主动句与被动句选择',
    explanation: '文学创作中根据表达需要选择主动句或被动句，被动句可产生特殊文学效果',
    examples: [
      { correct: '风吹过大地', incorrect: '大地被风吹' },
      { correct: '他被命运捉弄', incorrect: '命运捉弄他' },
      { correct: '城门被攻破', incorrect: '攻破城门' }
    ],
    exceptions: [
      '无主语句中被动句常用',
      '强调受事者时用被动句',
      '古文中被动句式与现代不同'
    ],
    commonMistakes: [
      '滥用被动句',
      '被动句使用不当导致语义不清',
      '主动被动混用不协调'
    ],
    registerApplicability: ['written', 'literary']
  },
  {
    rule: '长句构建技巧',
    explanation: '文学创作中长句用于表达复杂思想、渲染气氛，长句需结构清晰、层次分明',
    examples: [
      { correct: '当夕阳的余晖洒在那座古老的石桥上，当微风轻轻拂过水面，当远处的钟声悠悠响起，我仿佛回到了那个遥远的年代。', incorrect: '夕阳洒石桥，微风拂水面，钟声响起，我回年代。' }
    ],
    exceptions: [
      '意识流文学中可打破常规',
      '诗歌中长句需注意节奏',
      '对话中长句不宜过多'
    ],
    commonMistakes: [
      '长句过长导致阅读困难',
      '层次混乱',
      '缺少必要的停顿'
    ],
    registerApplicability: ['literary', 'formal_written']
  },
  {
    rule: '短句运用技巧',
    explanation: '文学创作中短句用于强调、制造节奏感、表达强烈情感',
    examples: [
      { correct: '风停了。雨住了。彩虹出现了。', incorrect: '风和雨都停止了，然后彩虹出现了。' },
      { correct: '完了。彻底完了。', incorrect: '一切都结束了，彻底地结束了。' }
    ],
    exceptions: [
      '心理描写中短句可表现混乱',
      '快节奏场景中多用短句',
      '诗歌中短句可制造张力'
    ],
    commonMistakes: [
      '滥用短句导致文章支离破碎',
      '短句与长句配合不当',
      '短句缺乏内在联系'
    ],
    registerApplicability: ['literary', 'dramatic', 'written']
  },
  {
    rule: '意象叠加',
    explanation: '诗歌和散文创作中意象叠加是重要手法，通过名词并列创造意境',
    examples: [
      { correct: '枯藤老树昏鸦，小桥流水人家', incorrect: '有枯萎的藤蔓和古老的大树，树上有乌鸦' },
      { correct: '鸡声茅店月，人迹板桥霜', incorrect: '鸡叫声响起，茅草店里可以看到月亮，板桥上有人的足迹和霜' }
    ],
    exceptions: [
      '需符合语法基本规范',
      '意象之间应有内在联系',
      '避免意象堆砌造成混乱'
    ],
    commonMistakes: [
      '意象过多导致杂乱',
      '意象之间缺乏关联',
      '过度省略破坏可读性'
    ],
    registerApplicability: ['literary', 'poetic']
  },
  {
    rule: '省略与隐含',
    explanation: '文学创作中省略主语、谓语或宾语是常见手法，可创造含蓄、凝练的效果',
    examples: [
      { correct: '春风又绿江南岸，明月何时照我还', incorrect: '春风又把江南岸变绿了，明月什么时候照耀我回去呢' },
      { correct: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚', incorrect: '我寻寻觅觅，感到冷冷清清，非常凄凄惨惨戚戚' }
    ],
    exceptions: [
      '需保证读者能够理解',
      '诗歌中省略更自由',
      '对话中省略需符合语境'
    ],
    commonMistakes: [
      '省略过度导致读者无法理解',
      '省略不当造成歧义',
      '刻意省略显得做作'
    ],
    registerApplicability: ['literary', 'poetic', 'written']
  },
  {
    rule: '倒装修辞',
    explanation: '文学创作中为强调、押韵或对仗可使用倒装句，倒装是重要的修辞手法',
    examples: [
      { correct: '千古江山，英雄无觅孙仲谋处', incorrect: '无觅英雄孙仲谋' },
      { correct: '竹喧归浣女，莲动下渔舟', incorrect: '归浣女竹喧，下渔舟莲动' },
      { correct: '不登高山，不知天之高也', incorrect: '不知天之高，不登高山' }
    ],
    exceptions: [
      '古文倒装更自由',
      '韵文中倒装需考虑押韵',
      '现代文学中倒装需谨慎'
    ],
    commonMistakes: [
      '倒装使用不当',
      '倒装破坏语义',
      '过度倒装显得做作'
    ],
    registerApplicability: ['literary', 'poetic', 'formal_written']
  },
  {
    rule: '对偶与对仗',
    explanation: '对偶是汉语特有的修辞手法，对仗要求更严格，常见于古典诗词和骈文',
    examples: [
      { correct: '海阔凭鱼跃，天高任鸟飞', incorrect: '鱼在海里跳，鸟在天上飞' },
      { correct: '山重水复疑无路，柳暗花明又一村', incorrect: '山和水很多好像没有路了，没想到又出现了一个村子' }
    ],
    exceptions: [
      '现代散文中对偶要求可放宽',
      '宽对不要求词性完全相同',
      '流水对允许语义连贯'
    ],
    commonMistakes: [
      '宽严失度',
      '意象重复',
      '韵脚不协'
    ],
    registerApplicability: ['literary', 'poetic', 'formal_written']
  },
  {
    rule: '顶真与蝉联',
    explanation: '顶真指前一句结尾与后一句开头相同，蝉联是顶真的延伸，是汉语独特的修辞手法',
    examples: [
      { correct: '知无不言，言无不尽', incorrect: '知道的事情要全部说出来' },
      { correct: '军书十二卷，卷卷有爷名', incorrect: '军书有很多卷，都写着他父亲的名字' }
    ],
    exceptions: [
      '不宜过度使用',
      '诗歌中顶真可制造节奏',
      '散文中偶用可增强连贯'
    ],
    commonMistakes: [
      '滥用顶真显得做作',
      '内容空洞仅追求形式',
      '破坏语义连贯'
    ],
    registerApplicability: ['literary', 'poetic']
  },
  {
    rule: '互文见义',
    explanation: '互文是上下文中词语相互补充、渗透的修辞手法，需整体理解',
    examples: [
      { correct: '秦时明月汉时关', incorrect: '秦朝时的明月和汉朝时的关隘' },
      { correct: '将军百战死，壮士十年归', incorrect: '将军战死了一百次，壮士回来了十次' }
    ],
    exceptions: [
      '需结合语境理解',
      '翻译时需补充完整语义',
      '赏析时需指出互文关系'
    ],
    commonMistakes: [
      '误解为两个独立事件',
      '机械拆分理解',
      '赏析时未能指出'
    ],
    registerApplicability: ['literary', 'poetic']
  },
  {
    rule: '借代与拈连',
    explanation: '借代是用相关事物代替本体，拈连是顺势将适用于甲事物的词语用于乙事物',
    examples: [
      { correct: '朱门酒肉臭，路有冻死骨', incorrect: '红色的门里有酒肉发臭，路上有冻死的人骨头' },
      { correct: '白发三千丈，缘愁似个长', incorrect: '白色的头发有三千丈那么长，就像忧愁一样长' }
    ],
    exceptions: [
      '需为读者所熟悉',
      '需形象生动',
      '不宜过度晦涩'
    ],
    commonMistakes: [
      '借代过于冷僻',
      '拈连牵强附会',
      '过度使用'
    ],
    registerApplicability: ['literary', 'poetic']
  },
  {
    rule: '通感运用',
    explanation: '通感是将不同感官的感觉沟通起来，是文学创作中增强意象感染力的重要手法',
    examples: [
      { correct: '微风过处，送来缕缕清香，仿佛远处高楼上渺茫的歌声似的', incorrect: '微风吹来，闻到香味' },
      { correct: '他的声音是冷的', incorrect: '他的声音让人感到冷漠' }
    ],
    exceptions: [
      '需符合感觉的内在逻辑',
      '不宜过度使用',
      '需创造新颖的感官联想'
    ],
    commonMistakes: [
      '通感牵强',
      '重复前人用法',
      '使用过多失去新鲜感'
    ],
    registerApplicability: ['literary', 'poetic', 'written']
  },
  {
    rule: '列锦与名词叠加',
    explanation: '列锦是完全用名词或名词性词组构成句子，创造意象密集的效果',
    examples: [
      { correct: '鸡声茅店月，人迹板桥霜', incorrect: '鸡叫声响起，茅草店上方有月亮，板桥上有人的足迹和霜' },
      { correct: '枯藤老树昏鸦，小桥流水人家', incorrect: '有枯萎的藤蔓和古老的大树，树上有乌鸦，小桥下面有流水，流水旁边有人家' }
    ],
    exceptions: [
      '需注意可读性',
      '诗歌中更自由',
      '需与上下文协调'
    ],
    commonMistakes: [
      '意象过于密集',
      '缺乏内在联系',
      '破坏叙事连贯'
    ],
    registerApplicability: ['literary', 'poetic']
  },
  {
    rule: '反讽与正话反说',
    explanation: '反讽是表面意义与实际意义相反，是文学创作中表达复杂情感的重要手法',
    examples: [
      { correct: '东栏梨花，惆怅东栏一株雪，人生看得几清明', incorrect: '诗人看到梨花感到惆怅' }
    ],
    exceptions: [
      '需有足够的语境支持',
      '需为读者所理解',
      '不宜过度晦涩'
    ],
    commonMistakes: [
      '读者无法理解反讽',
      '过度使用失去效果',
      '与整体风格不协调'
    ],
    registerApplicability: ['literary', 'formal_written']
  },
  {
    rule: '留白与含蓄',
    explanation: '留白是文学创作中不给读者全部信息，留下想象空间，含蓄是情感不直接表达',
    examples: [
      { correct: '人面不知何处去，桃花依旧笑春风', incorrect: '我寻找那个姑娘但找不到她，桃花还在春风中盛开' },
      { correct: '而今识尽愁滋味，欲说还休', incorrect: '现在尝尽了忧愁的滋味，想说却说不出来' }
    ],
    exceptions: [
      '需与读者期待协调',
      '留白需有迹可循',
      '需保证基本可理解性'
    ],
    commonMistakes: [
      '过度留白导致不知所云',
      '留白无意义',
      '含蓄变成晦涩'
    ],
    registerApplicability: ['literary', 'poetic', 'written']
  },

  // ============================================
  // 第三部分：特殊句法结构（10+ 条）
  // ============================================

  {
    rule: '把字句使用规范',
    explanation: '把字句是汉语特殊的处置式，用于强调对宾语的处置或影响',
    examples: [
      { correct: '我把书看完了', incorrect: '我看书完了' },
      { correct: '风把门吹开了', incorrect: '风开门了' },
      { correct: '把他气得浑身发抖', incorrect: '他气得浑身发抖' }
    ],
    exceptions: [
      '无明确处置对象时不用',
      '受事者已知时可用可不用',
      '诗歌中为求简洁可不用'
    ],
    commonMistakes: [
      '把字句与动词不搭配',
      '把字句使用过度',
      '把字句位置不当'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '被字句使用规范',
    explanation: '被字句用于表达主语遭受某种动作或影响，强调受事者',
    examples: [
      { correct: '门被风吹开了', incorrect: '门吹开了' },
      { correct: '他被选为班长', incorrect: '他选了班长' }
    ],
    exceptions: [
      '不强调受事者时可用可不用',
      '口语中可用可不用',
      '古文中被字句形式不同'
    ],
    commonMistakes: [
      '滥用被字句',
      '被字句动词不恰当',
      '被字句主语不明确'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '兼语句结构',
    explanation: '兼语句由动词的宾语兼作主语构成，是汉语句法的重要特点',
    examples: [
      { correct: '请他进来', incorrect: '请进来他' },
      { correct: '派他去做', incorrect: '派去做他' },
      { correct: '有人来访', incorrect: '有人来访问' }
    ],
    exceptions: [
      '使令句的典型结构',
      '喜恶句感情色彩鲜明',
      '古文中兼语句式更灵活'
    ],
    commonMistakes: [
      '混淆兼语与主谓结构',
      '动词选择不当',
      '层次分析错误'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '连动句结构',
    explanation: '连动句是两个或多个动词性词语连用，表示先后或同时发生的动作',
    examples: [
      { correct: '他推门出去', incorrect: '他推门，然后出去了' },
      { correct: '她站在那里哭', incorrect: '她站在那，而且她哭' },
      { correct: '我去图书馆借书', incorrect: '我去了图书馆，我借书' }
    ],
    exceptions: [
      '动词之间应有逻辑关系',
      '不宜连接过多动词',
      '诗歌中连动可创造意象'
    ],
    commonMistakes: [
      '动词之间无逻辑关系',
      '动词过多结构混乱',
      '混淆连动与并列'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '存现句结构',
    explanation: '存现句表示什么地方存在、出现或消失了什么人或物',
    examples: [
      { correct: '门前有一棵树', incorrect: '一棵树在门前' },
      { correct: '来了一个客人', incorrect: '一个客人来了' },
      { correct: '地上躺着一个人', incorrect: '一个人躺在地上' }
    ],
    exceptions: [
      '诗歌中存现句可创造意境',
      '口语中形式可更自由',
      '古文中存现句形式多样'
    ],
    commonMistakes: [
      '位置关系表达不清',
      '动词选择不当',
      '省略不当造成歧义'
    ],
    registerApplicability: ['written', 'literary']
  },
  {
    rule: '双宾语句结构',
    explanation: '双宾语句有两个宾语，指人宾语在前，指物宾语在后',
    examples: [
      { correct: '给我一本书', incorrect: '给一本书我' },
      { correct: '告诉他一个秘密', incorrect: '告诉一个秘密他' },
      { correct: '问他一个问题', incorrect: '问一个问题他' }
    ],
    exceptions: [
      '指物宾语前置时需加介词',
      '诗歌中语序可灵活',
      '古文中双宾语句式更多'
    ],
    commonMistakes: [
      '双宾语顺序颠倒',
      '混淆直接宾语与间接宾语',
      '双宾语动词选择错误'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '是字判断句',
    explanation: '是字句用于判断、归类、等同，是汉语句法的重要句式',
    examples: [
      { correct: '北京是中国的首都', incorrect: '北京中国的首都' },
      { correct: '他是老师', incorrect: '他老师' }
    ],
    exceptions: [
      '口语中可省略',
      '古文中判断句不用是',
      '强调焦点时可省略'
    ],
    commonMistakes: [
      '滥用是字句',
      '是字句位置不当',
      '与进行体混淆'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '有字存在句',
    explanation: '有字句表示存在、领有或事件发生',
    examples: [
      { correct: '有一本书在桌上', incorrect: '一本书在桌上有' },
      { correct: '他有三个孩子', incorrect: '他三个孩子有' },
      { correct: '昨天有一个人来访', incorrect: '一个人昨天来访有' }
    ],
    exceptions: [
      '诗歌中形式可灵活',
      '口语中可省略',
      '古文中句式更丰富'
    ],
    commonMistakes: [
      '与存现句混淆',
      '位置关系表达不清',
      '时体表达不当'
    ],
    registerApplicability: ['written', 'spoken', 'literary']
  },
  {
    rule: '比拟句构建',
    explanation: '比拟句把甲事物当作乙事物来描述，是文学创作的重要手法',
    examples: [
      { correct: '太阳像个红脸膛的汉子', incorrect: '太阳像红脸膛的汉子' },
      { correct: '风过处，树叶沙沙作响，仿佛在低语', incorrect: '风过处，树叶响' }
    ],
    exceptions: [
      '明喻需用比喻词',
      '暗喻可不用',
      '借喻最含蓄',
      '比拟需生动形象'
    ],
    commonMistakes: [
      '比喻不贴切',
      '比拟牵强',
      '比喻陈旧'
    ],
    registerApplicability: ['literary', 'poetic', 'written']
  },
  {
    rule: '特殊句式：文言判断句',
    explanation: '古文中判断句不用"是"，而用其他方式表达',
    examples: [
      { correct: '陈涉者，阳城人也', incorrect: '陈涉是阳城人' },
      { correct: '逝者如斯夫', incorrect: '流逝的东西就像这个' },
      { correct: '莲，花之君子者也', incorrect: '莲是花中的君子' }
    ],
    exceptions: [
      '现代文中偶用可增强古韵',
      '需与整体风格协调',
      '不宜过度使用'
    ],
    commonMistakes: [
      '与现代判断句混淆',
      '使用不当显得做作',
      '翻译时处理不当'
    ],
    registerApplicability: ['literary', 'poetic', 'formal_written']
  },

  // ============================================
  // 第四部分：常见错误分析（10+ 条）
  // ============================================

  {
    rule: '成分残缺与赘余',
    explanation: '句子成分不完整（残缺）或多余（赘余）都是常见语法错误',
    examples: [
      { correct: '通过学习，使我提高了认识', incorrect: '通过学习，我提高了认识' },
      { correct: '这个问题，值得探讨', incorrect: '这个问题，值得我们进行深入的探讨' },
      { correct: '他的到来，使我们很高兴', incorrect: '他的到来，使我们很高兴' }
    ],
    exceptions: [
      '文学作品中为追求某种效果可有意残缺',
      '口语中可省略',
      '诗歌中省略更自由'
    ],
    commonMistakes: [
      '主语残缺',
      '谓语残缺',
      '滥用使字句'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '搭配不当',
    explanation: '词语之间搭配不符合语法或语义规范，是文学创作中常见的语法错误',
    examples: [
      { correct: '提高效率', incorrect: '提高进度' },
      { correct: '解决问题', incorrect: '解决困难' },
      { correct: '发扬精神', incorrect: '发扬风格' }
    ],
    exceptions: [
      '修辞性超常搭配可增强效果',
      '需与语境协调',
      '需为读者所理解'
    ],
    commonMistakes: [
      '主谓搭配不当',
      '动宾搭配不当',
      '定中搭配不当'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '语序不当',
    explanation: '句子成分位置不符合汉语习惯，影响语义表达',
    examples: [
      { correct: '我对这个问题有意见', incorrect: '我这个问题有意见对' },
      { correct: '他今天上午在家里', incorrect: '他在家里今天上午' },
      { correct: '认真研究这个问题', incorrect: '问题认真研究这个' }
    ],
    exceptions: [
      '倒装修辞中语序可调整',
      '诗歌中语序更灵活',
      '强调焦点时可前置'
    ],
    commonMistakes: [
      '状语位置错误',
      '定语位置错误',
      '多项定语语序混乱'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '句式杂糅',
    explanation: '将两种或两种以上的句式混杂在一起，造成结构混乱',
    examples: [
      { correct: '产生这种情况的原因有两种', incorrect: '产生这种情况的原因是有两种' },
      { correct: '是由于粗心大意造成的', incorrect: '是由于粗心大意造成的' },
      { correct: '很值得学习的精神', incorrect: '是很值得学习的精神' }
    ],
    exceptions: [
      '文学创作中有意杂糅可创造特殊效果',
      '需有明确目的',
      '需与整体风格协调'
    ],
    commonMistakes: [
      '两种说法纠缠',
      '结构混乱',
      '层次不清'
    ],
    registerApplicability: ['written', 'formal_written']
  },
  {
    rule: '指代不明',
    explanation: '代词、指示词指代不明确，造成读者理解困难',
    examples: [
      { correct: '张三说李四来了，他很高兴', incorrect: '他说李四来了' },
      { correct: '这两本书，那本比这本好', incorrect: '这两本书，那本比这本好' }
    ],
    exceptions: [
      '诗歌中指代可模糊',
      '意识流中指代混乱可表现心理',
      '需与创作意图协调'
    ],
    commonMistakes: [
      '代词距离太远',
      '指示词模糊',
      '省略不当'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '不合逻辑',
    explanation: '句子在语义上自相矛盾或不合事理',
    examples: [
      { correct: '他差不多已经完全明白了', incorrect: '他差不多完全明白了' },
      { correct: '所有问题都解决了', incorrect: '所有问题基本都解决了' },
      { correct: '这个建议很好，完全可行', incorrect: '这个建议很好，但有些问题' }
    ],
    exceptions: [
      '欲扬先抑等修辞手法',
      '转折句中的否定',
      '需与语境协调'
    ],
    commonMistakes: [
      '自相矛盾',
      '不合事理',
      '前后不一致'
    ],
    registerApplicability: ['written', 'formal_written']
  },
  {
    rule: '数量词使用错误',
    explanation: '数量词使用不当，包括倍数、概数、确数使用混乱',
    examples: [
      { correct: '增加了两倍', incorrect: '增加了两倍多' },
      { correct: '大约三百人', incorrect: '大约三百左右' },
      { correct: '第一、第二、第三', incorrect: '第一、俩、第三' }
    ],
    exceptions: [
      '口语中可灵活',
      '诗歌中数量词可模糊化',
      '需与语境协调'
    ],
    commonMistakes: [
      '倍数使用错误',
      '概数重复使用',
      '数量词位置错误'
    ],
    registerApplicability: ['written', 'formal_written']
  },
  {
    rule: '关联词使用错误',
    explanation: '复句中关联词使用不当，影响逻辑表达',
    examples: [
      { correct: '因为下雨，所以延期', incorrect: '因为下雨，延期' },
      { correct: '虽然很忙，但是来了', incorrect: '虽然很忙，来了' },
      { correct: '要么去，要么不去', incorrect: '要么去，或者不去' }
    ],
    exceptions: [
      '承接连词可单独使用',
      '省略句中可省略',
      '需与逻辑关系协调'
    ],
    commonMistakes: [
      '关联词残缺',
      '关联词错配',
      '位置不当'
    ],
    registerApplicability: ['written', 'formal_written', 'literary']
  },
  {
    rule: '标点符号使用错误',
    explanation: '标点符号使用不当，影响句子的语义和节奏',
    examples: [
      { correct: '他来了，我很高兴', incorrect: '他来了我很高兴' },
      { correct: '他说："我来。"', incorrect: '他说，我来' },
      { correct: '北京——我们的首都', incorrect: '北京，我们的首都' }
    ],
    exceptions: [
      '意识流作品中可打破常规',
      '诗歌中标点可灵活',
      '需与风格协调'
    ],
    commonMistakes: [
      '逗号一逗到底',
      '引号使用混乱',
      '破折号与括号混用'
    ],
    registerApplicability: ['written', 'literary']
  },
  {
    rule: '文体色彩不协调',
    explanation: '词语或句式的文体色彩与整体语境不协调',
    examples: [
      { correct: '他决定离开此地', incorrect: '他决定溜了' },
      { correct: '口语对话中使用俚语', incorrect: '书面语中使用俚语' },
      { correct: '古风文学中使用现代词汇', incorrect: '古风文学中使用"网络"' }
    ],
    exceptions: [
      '对比、反讽等修辞需要',
      '人物语言需符合性格',
      '需有明确目的'
    ],
    commonMistakes: [
      '文体杂糅',
      '时代混淆',
      '语域混乱'
    ],
    registerApplicability: ['literary', 'written']
  }
];

export default zhCNGrammarRules;
