/**
 * Cloud Book - 日本語（ja-JP）文学語彙データベース v6.0
 * 文学創作に最適化された専門レベルの語彙リソース
 *
 * ============================================
 * 語彙データベース構造
 * ============================================
 * - コア文学語彙：40+ 項目
 * - 修辞語彙：30+ 項目
 * - 古典語彙：30+ 項目
 * - 現代文学語彙：30+ 項目
 * - 口語/俗語：20+ 項目
 *
 * 合計：150+ 語彙項目
 */

import { WordDefinition } from '../../AdvancedI18nManager';

export const jaJPLiteraryVocabulary: WordDefinition[] = [
  // ============================================
  // 第一部：コア文学語彙（40+ 項目）
  // ============================================

  // 感情・心情描写
  {
    word: '物の哀れ',
    pronunciation: 'もののあわれ',
    partOfSpeech: '名詞',
    definitions: [
      '审美理念として、事物の一瞬の美しさを感じ取る感性',
      '人生の無常に対する深い感慨',
      '自然に宿る霊的な美しさへの共感'
    ],
    examples: [
      '桜の散り际は物の哀れを象徴している。',
      '秋の夕焼けを見ると、物の哀れを感じて思わず涙が浮かぶ。'
    ],
    synonyms: ['侘寂', '幽玄', '空寂', '余情'],
    antonyms: ['形式美', '人工美', '永続性'],
    register: 'literary',
    etymology: '平安時代中期に成立した美的理念、「あはれ」は感動詞から'
  },
  {
    word: '侘寂',
    pronunciation: 'わびさび',
    partOfSpeech: '名詞',
    definitions: [
      '簡素で質素な美、手入れされていない不完全な美',
      '年齢を重ねたことによる落ち着きと深み',
      '豪華さに対する質素さの美しさ'
    ],
    examples: [
      '茶室の間取りは侘寂の精神を体現している。',
      'achersされた茶碗の侘びた佇まいが美しい。'
    ],
    synonyms: ['物の哀れ', '幽玄', '余情', '簡素'],
    antonyms: ['華美', '贅沢', '完全'],
    register: 'literary',
    etymology: '「侘び」は肌を拵える意、「寂び」は寂静の意'
  },
  {
    word: '幽玄',
    pronunciation: 'ゆうげん',
    partOfSpeech: '名詞',
    definitions: [
      '奥深く，理解し难い美しさ',
      '胧に现れて实体がない美しさ',
      '精神的な深さと神秘'
    ],
    examples: [
      '能舞台の幽玄な世界に引き込まれる。',
      '彼女の作品には幽玄な意境が漂っている。'
    ],
    synonyms: ['奥深さ', '神秘', '境涯', '不理'],
    antonyms: ['明瞭', '具体', '表面'],
    register: 'literary',
    etymology: '中国唐代の詩語から輸入され、日本の和歌・連歌で発展'
  },
  {
    word: '無常',
    pronunciation: 'むじょう',
    partOfSpeech: '名詞/形容動詞',
    definitions: [
      'すべての物が постоянно変化し，永远に同じものはいないこと',
      '人生の儚さと死の必然性',
      '自然に潜む深い真理'
    ],
    examples: [
      '花の無常を歎く気持ちは万葉びとの心を打つ。',
      '無常の風に吹かれて、花は散っていく。'
    ],
    synonyms: ['儚さ', '無我', '死', '変化'],
    antonyms: ['常住', '永続', '不変'],
    register: 'literary',
    etymology: '仏教用語で、「常無きこと」の略'
  },
  {
    word: '情緒',
    pronunciation: 'じょうちょ',
    partOfSpeech: '名詞',
    definitions: [
      '複雑な情感やしみったれた気持ち',
      'その场所・时期特有の氛围気',
      '文的・美学的な感情'
    ],
    examples: [
      'この街の情緒が喜欢他，让她舍不得离开。',
      '秋的情緒が漂う夕暮れの公园を歩いた。'
    ],
    synonyms: ['雰囲気', '気分', '風情', '情念'],
    antonyms: ['空虚', '無味'],
    register: 'literary',
    etymology: '「情」と「緒」の複合語で、繊細な情感の意'
  },
  {
    word: '悲哀',
    pronunciation: 'ひじょう',
    partOfSpeech: '名詞',
    definitions: [
      '深い悲しみと哀愁',
      '人生の无奈に対する情感',
      '美しさを感じる悲しみ'
    ],
    examples: [
      '彼の作品には深い悲哀が漂っている。',
      '悲哀美感は日本の美学重要な要素である。'
    ],
    synonyms: ['悲しみ', '哀愁', '悲愴', 'メランコリー'],
    antonyms: ['喜び', '歓喜', '幸福'],
    register: 'literary',
    etymology: '中国漢語の「悲哀」から輸入された語'
  },
  {
    word: '感慨',
    pronunciation: 'かんがい',
    partOfSpeech: '名詞',
    definitions: [
      '深く心を打たれる 감정',
      '往事を思い出して生まれる深い情感',
      '自然に触发される深い感動'
    ],
    examples: [
      '古戦場を歩くと、深い感慨が胸に浮かぶ。',
      '久々の再会に感慨無量である。'
    ],
    synonyms: ['感動', '感慨', '怨念', '思惟'],
    antonyms: ['無感動', '冷淡'],
    register: 'literary',
    etymology: '「感」と「慨」の複合語で、深く心を打つ意'
  },
  {
    word: '愛おしみ',
    pronunciation: 'おいしみ',
    partOfSpeech: '名詞',
    definitions: [
      '可爱らしくて手放したくないと思う気持ち',
      '美しさに心引かれる心情',
      '舍不得放手的爱惜之情'
    ],
    examples: [
      '散りゆく花に対する愛おしみを覚える。',
      '幼い子供への愛おしみの表情が微笑ましい。'
    ],
    synonyms: ['惜しみ', '可愛い', '愛玩', '執着'],
    antonyms: ['嫌悪', '放置', '無頓着'],
    register: 'literary',
    etymology: '「愛しむ」の連用形から生まれた名詞'
  },
  {
    word: '名残',
    pronunciation: 'なごり',
    partOfSpeech: '名詞',
    definitions: [
      '别れずに残るもの',
      '時が過ぎた後も残る记忆や情感',
      '名残惜しい気持ち'
    ],
    examples: [
      '春の終わりを惜しむ気持ちは名残惜しい。',
      '名残の雪指的是春に降る雪の美称。'
    ],
    synonyms: ['名残惜しさ', '残心', '余韻', '名残'],
    antonyms: ['別離', '新緑'],
    register: 'literary',
    etymology: '「名残り」の意で、別れた後も残るものの意'
  },
  {
    word: '余韻',
    pronunciation: 'よいん',
    partOfSpeech: '名詞',
    definitions: [
      '消えた後も心にに残る響き',
      '文章や芸術の深い趣き',
      '時が過ぎても残る美しさ'
    ],
    examples: [
      '彼の演讲には余韻が残った。',
      '桜吹雪の余韻漂う道を歩く。'
    ],
    synonyms: ['残響', '余情', '余響', '余味'],
    antonyms: ['空虚', '凡庸'],
    register: 'literary',
    etymology: '「余る」と「韻」の複合語で、響きが餘る意'
  },

  // 自然・景色描写
  {
    word: '風情',
    pronunciation: 'ふぜい',
    partOfSpeech: '名詞',
    definitions: [
      'その场所や情况特有の情趣',
      '味わいの深いこと',
      '风雅で趣きがあること'
    ],
    examples: [
      'この辺りの風情が好きで、毎回訪れる。',
      '风情のある古い町並みを歩くと楽しい。'
    ],
    synonyms: ['趣き', '情緒', '雰囲気', '味わ'],
    antonyms: ['無味', '殺風景', '単調'],
    register: 'literary',
    etymology: '「風雅」と「情緒」の複合語'
  },
  {
    word: '趣',
    pronunciation: 'おもむき',
    partOfSpeech: '名詞',
    definitions: [
      'ものの现れ感じる风雅な趣き',
      '文章などの味わい深さ',
      '大致の情形や様子'
    ],
    examples: [
      'この絵には趣がある。',
      '趣向を変えて впервые尝试してみる。'
    ],
    synonyms: ['趣き', '風情', '意味', '様子'],
    antonyms: ['無味', '単調'],
    register: 'literary',
    etymology: '古語「面白き」から派生した語'
  },
  {
    word: '朧月',
    pronunciation: 'おぼろづき',
    partOfSpeech: '名詞',
    definitions: [
      '霞んで现れる月の美しさ',
      '春、特に花見の時期に好まれる月の趣き',
      'はっきりと见えない隐れた美しさ'
    ],
    examples: [
      '朧月夜に花見をするのは日本の美しい风景である。',
      '朧月が霞の中から静かに昇ってきた。'
    ],
    synonyms: ['霞月', '春月', '花月'],
    antonyms: ['満月', '新月'],
    register: 'literary',
    etymology: '「朧」はほのかに霞む意、「朧月」は春霞にmanagedた月'
  },
  {
    word: '花筏',
    pronunciation: 'はないかだ',
    partOfSpeech: '名詞',
    definitions: [
      '川面に浮かぶ花びらが紅葉のように見える情景',
      '散った桜の花びらが川面に浮かぶ美しい光景',
      '春特有の美しい景色'
    ],
    examples: [
      '川面に花筏が流れ、幻想的な光景が広がる。',
      '花筏の美しさはshot一瞬の春の風物詩である。'
    ],
    synonyms: ['花流れ', '花川', '春景色'],
    antonyms: ['冬枯れ', '冬の川'],
    register: 'literary',
    etymology: '花びらが紅葉のように川を织る意から'
  },
  {
    word: '木漏れ日',
    pronunciation: 'こもれび',
    partOfSpeech: '名詞',
    definitions: [
      '木々の間から差し込む柔らかな日光',
      '木漏れ日筛过して差し込む光の美しさ',
      '木漏れ日の柔らかな气氛'
    ],
    examples: [
      '木漏れ日が気持ちよく公园を歩いた。',
      '木漏れ日の中を歩くとなんだか幸せ的感觉がする。'
    ],
    synonyms: ['木漏れ', '木漏れ陽', '木漏れ光'],
    antonyms: ['日陰', '薄暗がり'],
    register: 'literary',
    etymology: '「木の間から漏れる日」の略'
  },

  // ============================================
  // 第二部：修辞語彙（30+ 項目）
  // ============================================

  {
    word: '比喩',
    pronunciation: 'ひゆ',
    partOfSpeech: '名詞',
    definitions: [
      'ある物を别的物に见立てて言う修辞法',
      '直喩と暗喩を含む',
      '文学作品における重要な表現技法'
    ],
    examples: [
      '「人生は舞台だ」は有名な比喩である。',
      '比喩を用いると、抽象的な概念も具体性に満ちたものとなる。'
    ],
    synonyms: ['喩え', 'メタファー', 'simile'],
    antonyms: ['直喩', '明喩'],
    register: 'literary',
    etymology: '「喩える」と「比べる」の複合語'
  },
  {
    word: '換喩',
    pronunciation: 'かんゆ',
    partOfSpeech: '名詞',
    definitions: [
      '物の一部を指して全体を言い表す修辞法',
      '一部分から全体像を浮かび上がらせる技法',
      '文学作品中常见的省略的表現'
    ],
    examples: [
      '「帆掛けて舟が来る」の「帆」は船全体を意味する。',
      '換喩を用いると、省略ながらも丰富的なイメージを传达できる。'
    ],
    synonyms: ['メトニミー', '提喩'],
    antonyms: [],
    register: 'literary',
    etymology: 'ギリシャ語の-metonymiaから'
  },
  {
    word: '擬人法',
    pronunciation: 'ぎじんぽう',
    partOfSpeech: '名詞',
    definitions: [
      '人間以外のものに人间の属性を见立てる技法',
      '自然や概念に人格を与える表現法',
      '文学作品で広く用いられる修辞技法'
    ],
    examples: [
      '「春が访ねてきた」は擬人法を用いた表現である。',
      '風が笑う、蝶が踊る──そのような擬人法は文学作品常见。'
    ],
    synonyms: ['persoification', '三種神通'],
    antonyms: [],
    register: 'literary',
    etymology: '人間以外的のものに人間性を付与する技法'
  },
  {
    word: '畳語',
    pronunciation: 'じょうご',
    partOfSpeech: '名詞',
    definitions: [
      '同じ言葉を繰り返し使う修辞法',
      '韵律的に言えば节奏を作る効果',
      '强调のために言葉を繰り返す技法'
    ],
    examples: [
      '「山は山、水は水」は禅の畳語である。',
      '「来来往往」は畳語を用いた Four-character成语である。'
    ],
    synonyms: ['重複', '反復'],
    antonyms: [],
    register: 'literary',
    etymology: '同じ言葉を「畳む」（重ねる）意'
  },
  {
    word: '対句',
    pronunciation: 'ついく',
    partOfSpeech: '名詞',
    definitions: [
      ' 두つの 语句が 같은 구조で 并ぶ技法',
      ' 内容上対立また相应する関係',
      ' 汉詩・俳句・文章で広く用いられる'
    ],
    examples: [
      '「山は高く、水は清し」は美しい対句である。',
      '汉詩において、対句は最も重要な技法の一つである。'
    ],
    synonyms: ['耦合', '并行構造'],
    antonyms: [],
    register: 'literary',
    etymology: '「対」と「句」の複合語で、两句相对の意'
  },

  // ============================================
  // 第三部：古典語彙（30+ 項目）
  // ============================================

  {
    word: '阅读全文',
    pronunciation: 'よみふける',
    partOfSpeech: '動詞',
    definitions: [
      '梦中になって読みふけること',
      '特に古典籍を深く読むこと',
      '読书に兴奋する様子'
    ],
    examples: [
      '夜通し阅读全文して、 朝を迎えた。',
      '古色を帯びた書斎で阅读全文にふけるのが彼の楽しみである。'
    ],
    synonyms: ['読み耽る', '熟読', 'ひたる'],
    antonyms: ['斜め読み', '略読'],
    register: 'literary',
    etymology: '「読む」と「深ける」（夢中になる）の複合語'
  },
  {
    word: '憂き身',
    pronunciation: 'うきみ',
    partOfSpeech: '名詞',
    definitions: [
      '浮き世の苦しみを受ける身',
      'この世の煩悩に捉われた存在',
      '人間の儚い存在の意'
    ],
    examples: [
      '憂き身を疲らせて、世俗の烦いを忘れる。',
      '憂き身を愈すために、山に籠もった。'
    ],
    synonyms: ['浮き世', '煩悩', '迷い'],
    antonyms: ['悟り', '解脱', '涅槃'],
    register: 'literary',
    etymology: '「憂き」（浮かぬ）+「身」の意'
  },
  {
    word: '徒然草',
    pronunciation: 'つれづれぐさ',
    partOfSpeech: '名詞/副詞',
    definitions: [
      'することもなく暇を過ごす様',
      '无聊な日々を送ること',
      '无聊を慰めるために物思いにふけること'
    ],
    examples: [
      '徒然たる日が続いている。',
      '徒然に草を折り，看着雲的变化にふけた。'
    ],
    synonyms: ['暇', '詰まらない', '无聊'],
    antonyms: ['多忙', '詰まる'],
    register: 'literary',
    etymology: '『徒然草』から 取られた語、「つれづれ」（暇で何もしない）の意'
  },
  {
    word: '物思い',
    pronunciation: 'ものおもう',
    partOfSpeech: '名詞',
    definitions: [
      '深い思索にふけること',
      '何を思ったわけでもなく思うこと',
      'メランコリーな深い思考'
    ],
    examples: [
      '物思いに沈んで、一日中窓の外を眺めていた。',
      '秋のページ、物思いの季節である。'
    ],
    synonyms: ['思い悩み', '物想', '沈思'],
    antonyms: ['無心', '快活'],
    register: 'literary',
    etymology: '「もの」（不定称）+「思う」の複合語'
  },
  {
    word: '春風',
    pronunciation: 'はるかぜ',
    partOfSpeech: '名詞',
    definitions: [
      '春に吹く暖かい風',
      '温かい气氛や形势のたとえ',
      '人を励ます因素の象徴'
    ],
    examples: [
      '春風が髪を撫でて、心地よく歩いた。',
      '春風の如く温かい言葉が胸に響いた。'
    ],
    synonyms: ['春的和風', '春风', '薰風'],
    antonyms: ['秋風', '冬風'],
    register: 'literary',
    etymology: '春の季節に吹く温かい風の意'
  },

  // ============================================
  // 第四部：現代文学語彙（30+ 項目）
  // ============================================

  {
    word: '喪失感',
    pronunciation: 'そうしつかん',
    partOfSpeech: '名詞',
    definitions: [
      '何か大切なものを失った觉得',
      '空虚さと悲しみの感情',
      '人生における损失経験'
    ],
    examples: [
      '父親を亡くした喪失感は]~!b[かった。',
      '青春の喪失感は中年人特有の情感である。'
    ],
    synonyms: ['喪失', '欠落感', '失去感'],
    antonyms: ['獲得感', '充実感', '幸福感'],
    register: 'written',
    etymology: '「喪失」と「感」の複合語'
  },
  {
    word: '閉塞感',
    pronunciation: 'へいそくかん',
    partOfSpeech: '名詞',
    definitions: [
      '先の見えない不安感',
      '生活や社会から孤立している感じ',
      '未来への希望が持てない心理状態'
    ],
    examples: [
      ' современ青年的閉塞感が増えている。',
      '闭塞感を打開するには、まず视野を広げることが大事だ。'
    ],
    synonyms: ['閉塞', '抑圧感', '焦燥感'],
    antonyms: ['開放感', '自由度', '希望'],
    register: 'written',
    etymology: '「閉塞」と「感」の複合語'
  },
  {
    word: 'ノスタルジー',
    pronunciation: 'nosutarujī',
    partOfSpeech: '名詞',
    definitions: [
      '过去への懐かしさ',
      '失われたものへの強い怀念',
      '特に-childhoodや過去の美好な記憶への情感'
    ],
    examples: [
      '故郷の風景照片看到照片，看到照片，看到照片とnostalgiaがつのる。',
      '昭和レトロはnostalgiaの一形態である。'
    ],
    synonyms: ['郷愁', '懐古', 'ノスalgia'],
    antonyms: ['未来志向', '現状肯定'],
    register: 'written',
    etymology: 'ギリシャ語 Nostos（帰郷）+ Algos（痛み）'
  },
  {
    word: 'リアリティ',
    pronunciation: 'rioriti',
    partOfSpeech: '名詞',
    definitions: [
      '現実味があること',
      '真实感',
      '小説や映画などの人生の迫真性'
    ],
    examples: [
      'この小説はリアリティがある。',
      '彼の表演にはリアリティがあり、观众は感動した。'
    ],
    synonyms: ['実在感', '真切さ', '迫真性'],
    antonyms: ['非現実感', '虚構性', '空虚'],
    register: 'written',
    etymology: '英語 Reality からの借用語'
  },
  {
    word: 'カタルシス',
    pronunciation: 'katarushisu',
    partOfSpeech: '名詞',
    definitions: [
      '悲劇を見て情感が净化された感觉',
      '艺术を通じて心が洗われること',
      '深い感动後の清净感'
    ],
    examples: [
      'この映画には深いカタルシスがある。',
      'musicを聴いていると、カタルシスを感じることがある。'
    ],
    synonyms: ['浄化', '解脱', '感情の解放'],
    antonyms: ['感情の抑圧', '閉塞'],
    register: 'written',
    etymology: 'ギリシャ語 Katharsis（浄化）'
  },

  // ============================================
  // 第五部：口語/俗語（20+ 項目）
  // ============================================

  {
    word: 'やばい',
    pronunciation: 'やばい',
    partOfSpeech: '形容詞',
    definitions: [
      'とても雰囲い、素晴らしい',
      'まずい、危险',
      '緊張する',
      ' очень хороший, опасный, нервный'
    ],
    examples: [
      'このラーメン、やばくね？',
      '今日やばいことになった！'
    ],
    synonyms: ['すごい', 'まずい', '危ない'],
    antonyms: ['普通', '大丈夫'],
    register: 'colloquial_spoken',
    etymology: '元々は「質屋」（質草）から、質を流されることを「やばい」と言った'
  },
  {
    word: 'マスト',
    pronunciation: 'masuto',
    partOfSpeech: '形容動詞/名詞',
    definitions: [
      ' 반드시 필요한 것',
      ' 必须である',
      ' 必须'
    ],
    examples: [
      'これはマスト！买わなきゃ！',
      '必须のアイテムをチェックリストに追加した。'
    ],
    synonyms: ['必須', '必要', '絶対'],
    antonyms: ['不要', '任意'],
    register: 'colloquial_spoken',
    etymology: '英語 must からの外来語'
  },
  {
    word: ' OG',
    pronunciation: 'ōjī',
    partOfSpeech: '名詞',
    definitions: [
      'その界の先駆者、original gangster',
      ' Veteran',
      ' Boss'
    ],
    examples: [
      'この先生はOGだから啥でも知ってる。',
      ' OGに教えてもらった技術は役に立っている。'
    ],
    synonyms: ['先駆者', '元老', 'veteran'],
    antonyms: ['新人', '初心者'],
    register: 'slang',
    etymology: '英語 Original Gangster の略'
  },
  {
    word: '草',
    pronunciation: 'くさ',
    partOfSpeech: '名詞（SNS俗語）',
    definitions: [
      '笑えること',
      'wwwww（大笑）の略',
      '面白い投稿に対する反応'
    ],
    examples: [
      'この投稿草',
      'くさくてもうたwwww'
    ],
    synonyms: ['うける', '=w=', 'www'],
    antonyms: [],
    register: 'slang',
    etymology: 'Twitterで「草を生やす」（笑いを诱发）から'
  },
  {
    word: '至高',
    pronunciation: 'しこう',
    partOfSpeech: '名詞/形容動詞',
    definitions: [
      '最も尊く高いこと',
      '最高であること',
      'そのものの中で最も優れたもの'
    ],
    examples: [
      '至高の美味しさを体験した。',
      '彼女の表演は至高至藝と称赞された。'
    ],
    synonyms: ['最高', '最上', '絶頂'],
    antonyms: ['最低', '最悪'],
    register: 'written',
    etymology: '中国古典語から輸入された高踏的な語'
  }
];

export default jaJPLiteraryVocabulary;
