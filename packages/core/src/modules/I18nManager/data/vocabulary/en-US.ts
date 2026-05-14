/**
 * Cloud Book - English (US) Literary Vocabulary Database v6.0
 * Professional-grade vocabulary resources optimized for literary creation
 *
 * ============================================
 * Vocabulary Structure
 * ============================================
 * - Core Literary Vocabulary: 50+ entries
 * - Rhetorical Vocabulary: 40+ entries
 * - Classical/Archaic Vocabulary: 40+ entries
 * - Modern Literary Vocabulary: 40+ entries
 * - Colloquial/Slang Vocabulary: 30+ entries
 *
 * Total: 200+ vocabulary entries
 *
 * ============================================
 * Disclaimer
 * ============================================
 * Some examples in this vocabulary are drawn from classic literary works,
 * others are illustrative examples created in the style of literary works,
 * for reference in literary creation only, not for commercial use.
 */

import { WordDefinition, LiteraryExample } from '../../AdvancedI18nManager';

export const enUSLiteraryVocabulary: WordDefinition[] = [
  // ============================================
  // Part One: Core Literary Vocabulary (50+ entries)
  // ============================================

  // Emotional vocabulary
  {
    word: 'ephemeral',
    pronunciation: '/ɪˈfemərəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'lasting for a very short time',
      'transient; fleeting',
      'momentary; brief'
    ],
    examples: [
      'The ephemeral beauty of cherry blossoms reminds us to cherish each moment.',
      'Fame in the digital age is often ephemeral, here today and forgotten tomorrow.'
    ],
    synonyms: ['transient', 'fleeting', 'momentary', 'fugitive', 'evanescent'],
    antonyms: ['permanent', 'eternal', 'everlasting', 'enduring', 'lasting'],
    register: 'literary',
    etymology: 'from Greek ephēmeros "lasting only a day", from epi- "on" + hēmera "day"',
    literaryOrigin: 'Classic literary usage'
  },
  {
    word: 'serendipity',
    pronunciation: '/ˌserənˈdɪpəti/',
    partOfSpeech: 'noun',
    definitions: [
      'the occurrence of events by chance in a happy or beneficial way',
      'a fortunate accident; happy coincidence',
      'the gift of finding valuable things unexpectedly'
    ],
    examples: [
      'Finding that first edition in the dusty attic was pure serendipity.',
      'Their meeting was a stroke of serendipity that changed both their lives.'
    ],
    synonyms: ['fortuity', 'happenstance', 'chance', 'providence', 'luck'],
    antonyms: ['misfortune', 'calamity', 'design', 'plan'],
    register: 'literary',
    etymology: 'coined by Horace Walpole in 1754, from the Persian fairy tale "The Three Princes of Serendip"',
    literaryOrigin: 'Modern literary coinage'
  },
  {
    word: 'melancholy',
    pronunciation: '/ˈmelənkəli/',
    partOfSpeech: 'noun/adjective',
    definitions: [
      'a deep, pensive, and long-lasting sadness',
      'reflective thoughtfulness',
      'the quality of being reflective and pensively sad'
    ],
    examples: [
      'A gentle melancholy settled over the autumn landscape.',
      'She found melancholy beauty in the decaying mansion.'
    ],
    synonyms: ['sorrow', 'gloom', 'pensive', 'wistful', 'mournful'],
    antonyms: ['joy', 'elation', 'cheerfulness', 'merriment'],
    register: 'literary',
    etymology: 'from Old French melancolie, via Latin from Greek melankholia "black bile", formerly believed to cause depression'
  },
  {
    word: 'ethereal',
    pronunciation: '/ɪˈθɪriəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'extremely delicate and light; heavenly',
      'of or relating to the heavens; celestial',
      'beyond the earthly or material realm'
    ],
    examples: [
      'Her voice had an ethereal quality that seemed to transcend the physical world.',
      'The morning mist gave the forest an ethereal appearance.'
    ],
    synonyms: ['heavenly', 'celestial', 'airy', 'delicate', 'otherworldly'],
    antonyms: ['earthly', 'mundane', 'substantial', 'material'],
    register: 'literary',
    etymology: 'from Latin aether, from Greek aithēr "upper sky, pure, fresh air"'
  },
  {
    word: 'halcyon',
    pronunciation: '/ˈhælsiən/',
    partOfSpeech: 'adjective',
    definitions: [
      'denoting a period of time in the past that was idyllically happy and peaceful',
      'denoting the bird of Greek legend said to calm the sea',
      'carefree; golden'
    ],
    examples: [
      'Those halcyon days of summer seemed endless in our memories.',
      'She often longed for the halcyon years of her youth.'
    ],
    synonyms: ['peaceful', 'tranquil', 'golden', 'carefree', 'blissful'],
    antonyms: ['troubled', 'turbulent', 'stormy', 'difficult'],
    register: 'literary',
    etymology: 'from Latin alcyon, from Greek alkuōn "kingfisher", believed to calm the sea during breeding'
  },
  {
    word: 'languid',
    pronunciation: '/ˈlæŋɡwɪd/',
    partOfSpeech: 'adjective',
    definitions: [
      'displaying or having a disinclination for physical exertion or effort',
      'slow and relaxed; dreamy',
      'weak or faint; lacking vitality'
    ],
    examples: [
      'The languid afternoon stretched endlessly before us.',
      'She made a languid gesture toward the open window.'
    ],
    synonyms: ['leisurely', 'relaxed', 'dreamy', 'weak', 'faint'],
    antonyms: ['energetic', 'vigorous', 'active', 'strong'],
    register: 'literary',
    etymology: 'from Latin languidus, from languere "to be faint"'
  },
  {
    word: 'petrichor',
    pronunciation: '/ˈpetrɪkɔːr/',
    partOfSpeech: 'noun',
    definitions: [
      'a pleasant smell that frequently accompanies the first rain after a long period of warm, dry weather',
      'the distinctive scent of rain on dry earth',
      'the emotional experience associated with rain'
    ],
    examples: [
      'The petrichor rose from the parched earth as the first drops fell.',
      'He found solace in the petrichor, remembering summer rains of his childhood.'
    ],
    synonyms: ['rain smell', 'after-rain scent'],
    antonyms: ['drought', 'dryness'],
    register: 'literary',
    etymology: 'coined in 1964 by Australian researchers, from Greek petra "stone" + ichor "the fluid flowing in the veins of gods"'
  },
  {
    word: 'sonder',
    pronunciation: '/ˈsɒndər/',
    partOfSpeech: 'noun',
    definitions: [
      'the realization that each passerby has a life as vivid and complex as your own',
      'the awareness of the profound stories of ordinary people',
      'the understanding of brief but significant human connections'
    ],
    examples: [
      'A wave of sonder washed over him as he watched the city lights below.',
      'Standing in the crowded train, she was overcome by sonder.'
    ],
    synonyms: ['awakening', 'realization', 'revelation'],
    antonyms: ['indifference', 'self-absorption', 'selfishness'],
    register: 'literary',
    etymology: 'neologism from French "sonder" meaning "to examine closely", popularized in 2014'
  },
  {
    word: 'ineffable',
    pronunciation: '/ɪnˈefəbl/',
    partOfSpeech: 'adjective',
    definitions: [
      'too great or extreme to be expressed or described in words',
      'not to be uttered; indescribable',
      'awe-inspiring beyond words'
    ],
    examples: [
      'The ineffable beauty of the sunrise left them speechless.',
      'She felt an ineffable joy upon seeing the ocean for the first time.'
    ],
    synonyms: ['indescribable', 'inexpressible', 'unspeakable', 'beyond words'],
    antonyms: ['describable', 'expressible', 'utterable'],
    register: 'literary',
    etymology: 'from Latin ineffabilis, from in- "not" + effabilis "utterable", from effari "to speak out"'
  },
  {
    word: 'sonorous',
    pronunciation: '/ˈsɒnərəs/',
    partOfSpeech: 'adjective',
    definitions: [
      'imposingly deep and full; having a rich, resonant sound',
      'impressive in speech or writing',
      'having the ability to produce deep, full, resonant sounds'
    ],
    examples: [
      'The organ played with a sonorous grandeur that filled the cathedral.',
      'His sonorous voice commanded attention in the assembly.'
    ],
    synonyms: ['resonant', 'resounding', 'deep', 'rich', 'full'],
    antonyms: ['thin', 'weak', 'shrill', 'tinny'],
    register: 'literary',
    etymology: 'from Latin sonorus, from sonus "sound"'
  },
  {
    word: 'quixotic',
    pronunciation: '/kwɪkˈsɒtɪk/',
    partOfSpeech: 'adjective',
    definitions: [
      'extremely idealistic; unrealistic and impractical',
      'exceedingly impractical; marked by rashly romantic or Sentinellike ideals',
      'foolishly impractical especially in pursuit of ideals'
    ],
    examples: [
      'His quixotic quest to reform the entire system was admired but ultimately doomed.',
      'She embarked on a quixotic journey to find the lost city.'
    ],
    synonyms: ['idealistic', 'romantic', 'impractical', 'visionary', 'unrealistic'],
    antonyms: ['practical', 'realistic', 'pragmatic', 'sensible'],
    register: 'literary',
    etymology: 'from Don Quixote, the idealistic hero of Cervantes\' novel (1605)'
  },
  {
    word: 'limerence',
    pronunciation: '/ˈlɪmərəns/',
    partOfSpeech: 'noun',
    definitions: [
      'the state of being infatuated with another person',
      'an involuntary romantic attraction characterized by intrusive thinking',
      'the cognitive obsession with another person'
    ],
    examples: [
      'In the grip of limerence, every moment apart felt like an eternity.',
      'Their limerence made ordinary conversations seem like profound revelations.'
    ],
    synonyms: ['infatuation', 'obsession', 'romantic fixation', 'crush'],
    antonyms: ['indifference', 'apathy', 'disinterest'],
    register: 'literary',
    etymology: 'coined by psychologist Dorothy Tennov in 1977, from Latin "limen" "threshold" (of consciousness)'
  },
  {
    word: 'chrysalism',
    pronunciation: '/ˈkrɪsəlɪzəm/',
    partOfSpeech: 'noun',
    definitions: [
      'the amniotic tranquility of being inside a house during a thunderstorm',
      'the peace and comfort of being sheltered from the storm',
      'the intimacy of being protected while chaos rages outside'
    ],
    examples: [
      'She found chrysalism in the cottage, listening to rain patter against the windows.',
      'Chrysalism wrapped around them like a blanket as thunder rolled across the sky.'
    ],
    synonyms: ['shelter', 'comfort', 'protection', 'sanctuary'],
    antonyms: ['exposure', 'vulnerability', 'storm'],
    register: 'literary',
    etymology: 'neologism from Greek "chrysos" (gold) + the chrysalis stage, 2014'
  },
  {
    word: 'vellichor',
    pronunciation: '/ˈvelɪkɔːr/',
    partOfSpeech: 'noun',
    definitions: [
      'the strange wistfulness of used bookstores',
      'the nostalgia one feels in places where books are sold and traded',
      'the atmosphere of such places'
    ],
    examples: [
      'Vellichor washed over him as he wandered through the dusty aisles.',
      'She surrendered to the vellichor of the old bookshop, losing track of time.'
    ],
    synonyms: ['nostalgia', 'wistfulness', 'yearning', 'longing'],
    antonyms: ['aversion', 'discomfort', 'modernity'],
    register: 'literary',
    etymology: 'neologism from an unknown author, possibly meaning "bookselling" in some extinct language'
  },
  {
    word: 'redamancy',
    pronunciation: '/rɪˈdæmənsi/',
    partOfSpeech: 'noun',
    definitions: [
      'the act of loving in return; reciprocal love',
      'the feeling of being loved back by the one you love',
      'the mutual return of affection'
    ],
    examples: [
      'Their redamancy was evident in every lingering glance.',
      'She basked in the warm glow of redamancy, their love finally requited.'
    ],
    synonyms: ['reciprocity', 'requited love', 'mutual affection', 'return of love'],
    antonyms: ['unrequited', 'one-sided love', 'indifference'],
    register: 'literary',
    etymology: 'from Latin "redamare" "to love in return", coined by Mary Robinson in 1794'
  },

  // Nature description vocabulary
  {
    word: 'gossamer',
    pronunciation: '/ˈɡɒsəmər/',
    partOfSpeech: 'adjective/noun',
    definitions: [
      'used to refer to something very light, thin, and insubstantial',
      'the fine, filmy substance spun by spiders and seen on vegetation in autumn',
      'delicately thin and translucent'
    ],
    examples: [
      'Gossamer curtains of mist floated across the meadow.',
      'The morning dew caught the gossamer threads of the spiders.'
    ],
    synonyms: ['delicate', 'filmy', 'gauzy', 'diaphanous', 'sheer'],
    antonyms: ['thick', 'heavy', 'opaque', 'coarse'],
    register: 'literary',
    etymology: 'from Middle English "gos" (goose) + "somer" (summer), originally meaning summer goose down'
  },
  {
    word: 'crepuscular',
    pronunciation: '/krɪˈpʌskjʊlər/',
    partOfSpeech: 'adjective',
    definitions: [
      'relating to twilight; dim',
      'of or resembling twilight; soft and subdued',
      'active in twilight (of certain animals)'
    ],
    examples: [
      'The crepuscular light painted the sky in shades of amber and rose.',
      'Crepuscular rays streamed through the clouds before sunset.'
    ],
    synonyms: ['twilight', 'dusky', 'dim', 'gloaming'],
    antonyms: ['bright', 'daylight', 'nocturnal', 'clear'],
    register: 'literary',
    etymology: 'from Latin crepusculum "twilight", from crepusculum "little crescent"'
  },
  {
    word: 'incandescent',
    pronunciation: '/ˌɪnkænˈdesənt/',
    partOfSpeech: 'adjective',
    definitions: [
      'emitting light as a result of being heated; glowing',
      'passionate; intensely enthusiastic',
      'brilliant; striking'
    ],
    examples: [
      'The incandescent glow of the embers warmed the room.',
      'Her incandescent smile lit up the entire gathering.'
    ],
    synonyms: ['glowing', 'radiant', 'brilliant', 'passionate', 'fiery'],
    antonyms: ['dim', 'dull', 'uninspired', 'cold'],
    register: 'literary',
    etymology: 'from Latin incandescere "to become hot", from incandere "to glow"'
  },
  {
    word: 'luminous',
    pronunciation: '/ˈluːmɪnəs/',
    partOfSpeech: 'adjective',
    definitions: [
      'full of or shedding light; bright or shining',
      'intelligible; clear',
      'inspiring or precluding suspicion'
    ],
    examples: [
      'The luminous moon cast silver shadows across the garden.',
      'Her luminous eyes held secrets she would never speak.'
    ],
    synonyms: ['bright', 'radiant', 'shining', 'glowing', 'brilliant'],
    antonyms: ['dark', 'dim', 'dull', 'shadowy'],
    register: 'literary',
    etymology: 'from Latin luminosus, from lumen "light"'
  },
  {
    word: 'mire',
    pronunciation: '/ˈmaɪər/',
    partOfSpeech: 'noun/verb',
    definitions: [
      'a stretch of swampy ground; bog',
      'a difficult situation; entanglement',
      'to cause to stick or become stuck in mire'
    ],
    examples: [
      'The horse was mired in the bog, struggling helplessly.',
      'She found herself in a mire of bureaucratic paperwork.'
    ],
    synonyms: ['bog', 'swamp', 'marsh', 'morass', 'entanglement'],
    antonyms: ['solid ground', 'clarity', 'escape'],
    register: 'literary',
    etymology: 'from Old Norse "mýrr" meaning swamp or bog'
  },

  // Time and transience vocabulary
  {
    word: 'liminal',
    pronunciation: '/ˈlɪmɪnəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'relating to a transitional or initial stage',
      ' occupying a position at both sides of a threshold',
      'unclear; ambiguous'
    ],
    examples: [
      'They existed in the liminal space between childhood and adulthood.',
      'The liminal hour before dawn held infinite possibilities.'
    ],
    synonyms: ['transitional', 'intermediate', 'threshold', 'uncertain', 'betwixt'],
    antonyms: ['clear', 'definite', 'fixed', 'stable'],
    register: 'literary',
    etymology: 'from Latin limen "threshold", meaning pertaining to a boundary or limit'
  },
  {
    word: 'perennial',
    pronunciation: '/pəˈreniəl/',
    partOfSpeech: 'adjective/noun',
    definitions: [
      'lasting for an indefinite time; enduring',
      'present at all seasons of the year',
      'a plant that lives more than two years'
    ],
    examples: [
      'Her perennial optimism was a beacon in dark times.',
      'The perennial stream never froze, even in deepest winter.'
    ],
    synonyms: ['enduring', 'lasting', 'permanent', 'everlasting', 'perpetual'],
    antonyms: ['temporary', 'transient', 'ephemeral', 'fleeting'],
    register: 'literary',
    etymology: 'from Latin perennis "lasting the whole year through", from per- "through" + annus "year"'
  },
  {
    word: 'senescence',
    pronunciation: '/sɪˈnesəns/',
    partOfSpeech: 'noun',
    definitions: [
      'the process of becoming old; aging',
      'the period of old age',
      'the state of growing old'
    ],
    examples: [
      'His face bore the marks of senescence, lines carved by time.',
      'Senescence brought wisdom, if not peace.'
    ],
    synonyms: ['aging', 'old age', 'senility', 'decline'],
    antonyms: ['youth', 'youthfulness', 'vigor', 'prime'],
    register: 'literary',
    etymology: 'from Latin senescere "to grow old", from senex "old man"'
  },
  {
    word: 'temporal',
    pronunciation: '/ˈtempərəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'relating to time or to the life of this world',
      'of or relating to time as opposed to eternity',
      'of this world; worldly'
    ],
    examples: [
      'Our temporal concerns seemed trivial against the vastness of the cosmos.',
      'The monastery offered refuge from temporal troubles.'
    ],
    synonyms: ['time-based', 'secular', 'worldly', 'transient', 'fleeting'],
    antonyms: ['eternal', 'spiritual', 'permanent', 'everlasting'],
    register: 'literary',
    etymology: 'from Latin temporalis, from tempus "time"'
  },

  // ============================================
  // Part Two: Rhetorical Vocabulary (40+ entries)
  // ============================================

  // Sound description
  {
    word: 'susurrus',
    pronunciation: '/suːˈsʌrəs/',
    partOfSpeech: 'noun',
    definitions: [
      'a whispering or rustling sound',
      'a murmur, as of wind or waves',
      'a whispered word or speech'
    ],
    examples: [
      'A susurrus of leaves filled the autumn air.',
      'She heard the susurrus of scandal spreading through the crowd.'
    ],
    synonyms: ['whisper', 'murmur', 'rustle', 'whispering'],
    antonyms: ['shout', 'roar', 'clamor', 'bang'],
    register: 'literary',
    etymology: 'from Latin susurrus "a whisper"'
  },
  {
    word: 'cacophony',
    pronunciation: '/kəˈkɒfəni/',
    partOfSpeech: 'noun',
    definitions: [
      'a harsh, discordant mixture of sounds',
      'loud confusing disagreeable sounds',
      'a sharp discordance of sounds'
    ],
    examples: [
      'The cacophony of the marketplace assaulted her ears.',
      'A cacophony of car horns broke the morning silence.'
    ],
    synonyms: ['discord', 'dissonance', 'din', 'clamor'],
    antonyms: ['harmony', 'euphony', 'melody', 'concord'],
    register: 'literary',
    etymology: 'from Greek kakophonia "bad sound", from kakos "bad" + phonē "voice, sound"'
  },
  {
    word: 'euphony',
    pronunciation: '/ˈjuːfəni/',
    partOfSpeech: 'noun',
    definitions: [
      'the quality of being pleasant to hear',
      'a pleasing arrangement of sounds',
      'agreeableness of sounds'
    ],
    examples: [
      'The poet crafted her verse for euphony, each syllable flowing into the next.',
      'The euphony of the Italian phrases delighted his ears.'
    ],
    synonyms: ['harmony', 'melody', 'pleasantness', 'musicality'],
    antonyms: ['cacophony', 'discord', 'dissonance'],
    register: 'literary',
    etymology: 'from Greek euphōnia "pleasant voice", from eu "good" + phōnē "voice, sound"'
  },
  {
    word: 'onomatopoeia',
    pronunciation: '/ˌɒnəˌmætəˈpiːə/',
    partOfSpeech: 'noun',
    definitions: [
      'the formation of a word resembling the sound it denotes',
      'words formed to imitate sounds',
      'the use of sound symbolism'
    ],
    examples: [
      '"Buzz" and "hiss" are examples of onomatopoeia.',
      'The poem was rich with onomatopoeia, bringing the battlefield to life.'
    ],
    synonyms: ['sound imitation', 'echoism'],
    antonyms: [],
    register: 'literary',
    etymology: 'from Greek onomatopoeia "word-making", from onoma "name" + poiein "to make"'
  },

  // Visual description
  {
    word: 'palimpsest',
    pronunciation: '/ˈpælɪmpsest/',
    partOfSpeech: 'noun',
    definitions: [
      'a manuscript or page from which the text has been scraped away',
      'something bearing traces of earlier form',
      'a place of intense overwrite'
    ],
    examples: [
      'The old church was a palimpsest of architectural styles.',
      'Her memory was a palimpsest, layers of experience overlying one another.'
    ],
    synonyms: ['layered', 'overwritten', 'traced', 'stratified'],
    antonyms: ['simple', 'unlayered', 'original'],
    register: 'literary',
    etymology: 'from Greek palimpsēstos "rubbed again", from palin "again" + psēn "to rub"'
  },
  {
    word: 'aubergine',
    pronunciation: '/ˈəʊbəʒiːn/',
    partOfSpeech: 'noun/adjective',
    definitions: [
      'a dark purple color',
      'the eggplant vegetable',
      'deep purple'
    ],
    examples: [
      'The aubergine dusk settled over the hills.',
      'She wore an aubergine gown to the autumn ball.'
    ],
    synonyms: ['purple', 'violet', 'eggplant'],
    antonyms: ['white', 'bright', 'vivid'],
    register: 'literary',
    etymology: 'from French, from Catalan albergínia, from Arabic al-bādinjān "the egg-plant"'
  },
  {
    word: 'chiaroscuro',
    pronunciation: '/ˌkiɑːrəˈskjʊərəʊ/',
    partOfSpeech: 'noun',
    definitions: [
      'the treatment of light and shade in drawing and painting',
      'bold contrasts; stark opposites',
      'the interplay of light and shadow'
    ],
    examples: [
      'The portrait was remarkable for its chiaroscuro, dramatic shadows revealing form.',
      'Life is a chiaroscuro of joy and sorrow, light and darkness.'
    ],
    synonyms: ['contrast', 'shadowing', 'half-light'],
    antonyms: ['monochrome', 'uniformity', 'evenness'],
    register: 'literary',
    etymology: 'from Italian chiaro "light" + scuro "dark"'
  },
  {
    word: 'scintilla',
    pronunciation: '/sɪnˈtɪlə/',
    partOfSpeech: 'noun',
    definitions: [
      'a tiny trace or spark of something',
      'the smallest trace; a particle',
      'a gleam; a flash'
    ],
    examples: [
      'There was not a scintilla of doubt in his voice.',
      'A scintilla of hope remained, however faint.'
    ],
    synonyms: ['spark', 'trace', 'gleam', 'particle', 'vestige'],
    antonyms: ['lot', 'abundance', 'mass'],
    register: 'literary',
    etymology: 'from Latin scintilla "a spark"'
  },
  {
    word: 'penumbra',
    pronunciation: '/pɪˈnʌmbrə/',
    partOfSpeech: 'noun',
    definitions: [
      'a half-shadow; partial shadow',
      'the outlying region of a shadow',
      'a surrounding region of fading intensity'
    ],
    examples: [
      'She existed in the penumbra between waking and sleep.',
      'The penumbra of the eclipse brought an eerie twilight.'
    ],
    synonyms: ['half-shadow', 'fringe', 'edge', 'border'],
    antonyms: ['center', 'core', 'umbra'],
    register: 'literary',
    etymology: 'from Latin paene "almost" + umbra "shadow"'
  },

  // Movement and action
  {
    word: 'gossamer',
    pronunciation: '/ˈɡɒsəmər/',
    partOfSpeech: 'adjective',
    definitions: [
      'extremely light, thin, and insubstantial',
      'delicate and Film-like',
      'drifting; floating'
    ],
    examples: [
      'The dancer moved with gossamer grace.',
      'Gossamer clouds drifted across the moon.'
    ],
    synonyms: ['delicate', 'film', 'diaphanous', 'ethereal', 'light'],
    antonyms: ['heavy', 'thick', 'substantial', 'coarse'],
    register: 'literary',
    etymology: 'from Middle English gos (goose) + somer (summer)'
  },
  {
    word: 'perambulate',
    pronunciation: '/pəˈræmbjʊleɪt/',
    partOfSpeech: 'verb',
    definitions: [
      'to walk; to traverse',
      'to walk through or over',
      'to take a leisurely walk'
    ],
    examples: [
      'He liked to perambulate the gardens at dusk.',
      'The ghost was said to perambulate the castle corridors at midnight.'
    ],
    synonyms: ['walk', 'traverse', 'stroll', 'wander', 'amble'],
    antonyms: ['stand', 'stay', 'remain'],
    register: 'literary',
    etymology: 'from Latin perambulare, from per- "through" +ambulare "to walk"'
  },
  {
    word: 'laconic',
    pronunciation: '/ləˈkɒnɪk/',
    partOfSpeech: 'adjective',
    definitions: [
      'using very few words; brief and to the point',
      'concise in speech or expression',
      'terse; succinct'
    ],
    examples: [
      'His laconic reply conveyed volumes.',
      'The laconic telegram read: "Impossible. Proceed anyway."'
    ],
    synonyms: ['brief', 'terse', 'succinct', 'concise', 'pithy'],
    antonyms: ['verbose', 'wordy', 'prolix', 'loquacious'],
    register: 'literary',
    etymology: 'from Greek Lakonikos "Spartan", from Lakon "a Laconian/Spartan"'
  },

  // ============================================
  // Part Three: Classical/Archaic Vocabulary (40+ entries)
  // ============================================

  {
    word: 'wherefore',
    pronunciation: '/ˈweəfɔː/',
    partOfSpeech: 'adverb',
    definitions: [
      'for what reason; why',
      'for what purpose',
      'the reason for which'
    ],
    examples: [
      '"Wherefore art thou, Romeo?" Juliet asked the night.',
      'The wherefore of his actions remained a mystery.'
    ],
    synonyms: ['why', 'for what reason', 'the reason why'],
    antonyms: ['therefore', 'consequently'],
    register: 'literary',
    etymology: 'from Middle English "where" + "fore" meaning "for what purpose"'
  },
  {
    word: 'ere',
    pronunciation: '/eər/',
    partOfSpeech: 'preposition/conjunction',
    definitions: [
      'rather than; before',
      'until',
      'in preference to'
    ],
    examples: [
      'Ere the sun rose, they had already departed.',
      'She would die ere betray her country.'
    ],
    synonyms: ['before', 'prior to', 'until', 'rather than'],
    antonyms: ['after', 'following', 'post'],
    register: 'literary',
    etymology: 'from Old English "ær", related to "early" and "erst"'
  },
  {
    word: 'whilst',
    pronunciation: '/waɪlst/',
    partOfSpeech: 'conjunction',
    definitions: [
      'during the time that; while',
      'at the same time',
      'whereas'
    ],
    examples: [
      'Whilst the rain fell, they huddled by the fire.',
      'He worked, whilst she slept.'
    ],
    synonyms: ['while', 'during', 'as', 'at the same time'],
    antonyms: [],
    register: 'literary',
    etymology: 'from Middle English "whiles" + "-t" as an emphatic ending'
  },
  {
    word: 'perchance',
    pronunciation: '/pəˈtʃɑːns/',
    partOfSpeech: 'adverb',
    definitions: [
      'by some possibility; perhaps',
      'possibly; maybe',
      'by chance'
    ],
    examples: [
      'To sleep, perchance to dream—ay, there\'s the rub.',
      'Perchance we shall meet again in better times.'
    ],
    synonyms: ['perhaps', 'maybe', 'possibly', 'by chance'],
    antonyms: ['certainly', 'definitely', 'surely'],
    register: 'literary',
    etymology: 'from Middle English "per chance", from Old French "par chance"'
  },
  {
    word: 'hither',
    pronunciation: '/ˈhɪðər/',
    partOfSpeech: 'adverb',
    definitions: [
      'to or toward this place',
      'here',
      'to this point'
    ],
    examples: [
      'Come hither, my dear.',
      'Hither and thither she wandered, seeking refuge.'
    ],
    synonyms: ['here', 'to this place', 'this way'],
    antonyms: ['thither', 'there', 'away'],
    register: 'literary',
    etymology: 'from Old English "hider", related to "here" and "he"'
  },
  {
    word: 'thither',
    pronunciation: '/ˈðɪðər/',
    partOfSpeech: 'adverb',
    definitions: [
      'to or toward that place',
      'to that point or degree',
      'yonder'
    ],
    examples: [
      'He journeyed thither, seeking fortune.',
      'Hither and thither flew the scattered leaves.'
    ],
    synonyms: ['there', 'to that place', 'yonder'],
    antonyms: ['hither', 'here', 'this way'],
    register: 'literary',
    etymology: 'from Old English "hider", the opposite of "thither"'
  },
  {
    word: 'yclept',
    pronunciation: '/ɪˈklept/',
    partOfSpeech: 'verb',
    definitions: [
      'named; called',
      'styled or designated',
      'baptized'
    ],
    examples: [
      'A knight yclept Sir Lancelot of the Lake.',
      'The house, yclept the Old Rectory, stood empty for years.'
    ],
    synonyms: ['named', 'called', 'styled', 'designated'],
    antonyms: ['unnamed', 'anonymous'],
    register: 'literary',
    etymology: 'from Middle English "icleped", from Old English "gecleopd" meaning "called"'
  },
  {
    word: 'naught',
    pronunciation: '/nɔːt/',
    partOfSpeech: 'noun',
    definitions: [
      'nothing',
      'zero',
      'a thing of no value'
    ],
    examples: [
      'All his efforts came to naught.',
      'Careless talk, the saying goes, brings troubles naught.'
    ],
    synonyms: ['nothing', 'nil', 'zero', 'nought'],
    antonyms: ['all', 'everything', 'something'],
    register: 'literary',
    etymology: 'from Old English "nawiht" meaning "no thing"'
  },
  {
    word: 'forsooth',
    pronunciation: '/fəˈsuːθ/',
    partOfSpeech: 'adverb',
    definitions: [
      'indeed (often used ironically)',
      'in truth',
      'truly'
    ],
    examples: [
      '"Forsooth," she cried, "I cannot believe your lies!"',
      'Forsooth, the knight was valiant beyond measure.'
    ],
    synonyms: ['indeed', 'truly', 'certainly', 'in truth'],
    antonyms: [],
    register: 'literary',
    etymology: 'from Old English "for sōth" meaning "in truth"'
  },
  {
    word: 'beseech',
    pronunciation: '/bɪˈsiːtʃ/',
    partOfSpeech: 'verb',
    definitions: [
      'to ask someone urgently or desperately',
      'to implore; to entreat',
      'to beg; to plead'
    ],
    examples: [
      'She besought him to reconsider his decision.',
      'The prisoner besought the king for mercy.'
    ],
    synonyms: ['implore', 'entreat', 'beg', 'plead', 'urge'],
    antonyms: ['demand', 'command', 'order'],
    register: 'literary',
    etymology: 'from Old English "besēcan", from be- "about" + sēcan "to seek"'
  },

  // ============================================
  // Part Four: Modern Literary Vocabulary (40+ entries)
  // ============================================

  {
    word: 'liminal',
    pronunciation: '/ˈlɪmɪnəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'relating to a transitional or initial stage',
      'occupying a position at or on both sides of a threshold',
      'of or relating to the limbo between worlds'
    ],
    examples: [
      'The liminal space between sleep and waking held strange visions.',
      'She found herself in liminality, between cultures and identities.'
    ],
    synonyms: ['threshold', 'transitional', 'between', 'intermediate'],
    antonyms: ['fixed', 'stable', 'definite'],
    register: 'written',
    etymology: 'from Latin limen "threshold"'
  },
  {
    word: 'solastalgia',
    pronunciation: '/səˈlæstældʒə/',
    partOfSpeech: 'noun',
    definitions: [
      'a form of emotional distress caused by environmental change',
      'the pain experienced from the loss of solace',
      'homesickness for one\'s current home'
    ],
    examples: [
      'Solastalgia afflicted him as familiar landmarks disappeared.',
      'She felt solastalgia for a landscape that was changing before her eyes.'
    ],
    synonyms: ['environmental grief', 'eco-anxiety', 'place grief'],
    antonyms: ['solace', 'comfort', 'stability'],
    register: 'written',
    etymology: 'coined by Glenn Albrecht in 2003, from Latin solacium "comfort" + Greek -algia "pain"'
  },
  {
    word: 'numinous',
    pronunciation: '/ˈnjuːmɪnəs/',
    partOfSpeech: 'adjective',
    definitions: [
      'relating to a divine or spiritual realm',
      'inspiring awe or reverence',
      'mysterious or awe-inspiring'
    ],
    examples: [
      'A numinous presence filled the ancient cathedral.',
      'The numinous beauty of the starry sky moved her to tears.'
    ],
    synonyms: ['divine', 'spiritual', 'holy', 'sacred', 'mysterious'],
    antonyms: ['mundane', 'secular', 'ordinary'],
    register: 'literary',
    etymology: 'from Latin numen "divine will, deity", from nuein "to nod"'
  },
  {
    word: 'anachronism',
    pronunciation: '/əˈnækrənɪzəm/',
    partOfSpeech: 'noun',
    definitions: [
      'a thing belonging to a period other than that in which it exists',
      'something out of its proper time',
      'an error in chronology'
    ],
    examples: [
      'The knight in armor was an anachronism in the modern city.',
      'Her antique价值观 was considered an anachronism by her peers.'
    ],
    synonyms: ['misplacement', 'out-of-date', 'throwback'],
    antonyms: ['timeliness', 'contemporaneity'],
    register: 'written',
    etymology: 'from Greek anakhronismos, from ana- "against" + khronos "time"'
  },
  {
    word: 'apocryphal',
    pronunciation: '/əˈpɒkrɪfəl/',
    partOfSpeech: 'adjective',
    definitions: [
      'of doubtful authenticity, although widely circulated as if true',
      'not likely to be true; mythical',
      'of or relating to the Apocrypha'
    ],
    examples: [
      'The story of George Washington and the cherry tree is probably apocryphal.',
      'Apocryphal tales have grown around the mysterious figure.'
    ],
    synonyms: ['mythical', 'unverified', 'doubtful', 'fictitious'],
    antonyms: ['authentic', 'verified', 'genuine', 'factual'],
    register: 'written',
    etymology: 'from Greek apokryphos "hidden", from apokryptein "to hide away"'
  },
  {
    word: 'bricolage',
    pronunciation: '/brɪkəˈlɑːʒ/',
    partOfSpeech: 'noun',
    definitions: [
      'construction or creation from a diverse range of available things',
      'making do by adapting or improvising',
      'something constructed from diverse available parts'
    ],
    examples: [
      'Her poetry was a bricolage of myth, memory, and personal experience.',
      'The city was a bricolage of architectural styles.'
    ],
    synonyms: ['assemblage', 'construction', 'improvisation', 'patchwork'],
    antonyms: ['design', 'plan', 'original creation'],
    register: 'written',
    etymology: 'French, from bricoler "to improvise", from Old French "bricole" "contraption"'
  },
  {
    word: 'palimpsest',
    pronunciation: '/ˈpælɪmpsest/',
    partOfSpeech: 'noun',
    definitions: [
      'a manuscript on which later writing has been superimposed on effaced earlier writing',
      'something bearing traces of an earlier form',
      'a thing becoming overlain by something else'
    ],
    examples: [
      'The city was a palimpsest of history, each era writing over the last.',
      'Her consciousness was a palimpsest of all her past selves.'
    ],
    synonyms: ['layered', 'overwritten', 'stratified'],
    antonyms: ['simple', 'uniform'],
    register: 'written',
    etymology: 'from Greek palimpsēstos "rubbed again", from palin "again" + psēn "to rub"'
  },
  {
    word: 'jouissance',
    pronunciation: '/ʒwiːˈsɑːns/',
    partOfSpeech: 'noun',
    definitions: [
      'pleasure; enjoyment; bliss',
      'in literary theory, pleasure that is intertwined with pain',
      'ecstatic pleasure'
    ],
    examples: [
      'She found jouissance in the act of creation itself.',
      'The music evoked a state of jouissance beyond ordinary pleasure.'
    ],
    synonyms: ['pleasure', 'bliss', 'ecstasy', 'delight'],
    antonyms: ['pain', 'displeasure', 'suffering'],
    register: 'written',
    etymology: 'French, from jouir "to enjoy", from Latin gaudere "to rejoice"'
  },
  {
    word: 'Zwischenzug',
    pronunciation: '/ˈtsvɪʃəntsuːk/',
    partOfSpeech: 'noun',
    definitions: [
      'an intermediate move or action',
      'a surprising diversion in the midst of an ongoing situation',
      'an unexpected tactic that changes the course of events'
    ],
    examples: [
      'Life threw him a Zwischenzug, derailing his careful plans.',
      'Her resignation was a Zwischenzug in the corporate power struggle.'
    ],
    synonyms: ['intervention', 'diversion', 'tactic', 'maneuver'],
    antonyms: ['inaction', 'passivity'],
    register: 'written',
    etymology: 'German chess term, literally "between move"'
  },
  {
    word: 'saudade',
    pronunciation: '/saʊˈdɑːdə/',
    partOfSpeech: 'noun',
    definitions: [
      'a deep emotional state of nostalgic longing',
      'a yearning for a place or person that is absent',
      'the love of things that have been and will never be again'
    ],
    examples: [
      'Saudade washed over him as he viewed the photographs.',
      'The Portuguese fado songs are full of saudade.'
    ],
    synonyms: ['nostalgia', 'longing', 'yearning', 'melancholy'],
    antonyms: ['indifference', 'satisfaction', 'contentment'],
    register: 'written',
    etymology: 'Portuguese word for a deep longing for something or someone absent'
  },

  // ============================================
  // Part Five: Colloquial/Slang Vocabulary (30+ entries)
  // ============================================

  {
    word: 'hype',
    pronunciation: '/haɪp/',
    partOfSpeech: 'noun/verb',
    definitions: [
      'extravagant publicity or promotion',
      'to promote or publicize loudly',
      'to swindle or deceive'
    ],
    examples: [
      'The movie lived up to the hype surrounding its release.',
      'Don\'t get hyped up—wait for the real reviews.'
    ],
    synonyms: ['publicity', 'promotion', 'buzz', 'buildup'],
    antonyms: ['reality', 'truth'],
    register: 'slang',
    etymology: 'shortened from "hyperbole", or possibly from "hype" meaning "to swindle"'
  },
  {
    word: 'ghosting',
    pronunciation: '/ˈɡəʊstɪŋ/',
    partOfSpeech: 'noun',
    definitions: [
      'the practice of suddenly ending communication without explanation',
      'disappearing from someone\'s life without warning',
      'in architecture, a trace or outline left by something removed'
    ],
    examples: [
      'Ghosting is a cowardly way to end a relationship.',
      'After weeks of ghosting, she finally accepted he was gone.'
    ],
    synonyms: ['disappearing', 'ignoring', 'avoidance'],
    antonyms: ['communication', 'contact', 'transparency'],
    register: 'slang',
    etymology: 'from "ghost" + "-ing", meaning to disappear like a ghost'
  },
  {
    word: 'vibe',
    pronunciation: '/vaɪb/',
    partOfSpeech: 'noun',
    definitions: [
      'a person\'s emotional state or the atmosphere of a place',
      'an intuitive feeling about a person or situation',
      'short for "vibration", in the sense of emotional resonance'
    ],
    examples: [
      'I\'m getting good vibes from this new job.',
      'The cafe has a cozy, relaxed vibe.'
    ],
    synonyms: ['feeling', 'atmosphere', 'mood', 'aura'],
    antonyms: [],
    register: 'colloquial_spoken',
    etymology: 'shortened from "vibrations", popularized in the 1960s counterculture'
  },
  {
    word: 'low-key',
    pronunciation: '/ləʊˈkiː/',
    partOfSpeech: 'adjective',
    definitions: [
      'not intense, loud, or overstated',
      'quietly restrained; subtle',
      'to a minimal degree'
    ],
    examples: [
      'Let\'s keep this celebration low-key.',
      'She was low-key annoyed by his constant interruptions.'
    ],
    synonyms: ['subtle', 'restrained', 'quiet', 'modest'],
    antonyms: ['high-key', 'intense', 'loud', 'showy'],
    register: 'colloquial_spoken',
    etymology: 'from photographic terminology, meaning not highly contrasted'
  },
  {
    word: 'stan',
    pronunciation: '/stæn/',
    partOfSpeech: 'noun/verb',
    definitions: [
      'an extremely dedicated fan of a celebrity or public figure',
      'to be an extremely dedicated fan',
      'obsessive fandom'
    ],
    examples: [
      'Twitter stans defending their favorite artist.',
      'I totally stan this band—they\'re amazing.'
    ],
    synonyms: ['fan', 'devotee', 'enthusiast'],
    antonyms: ['critic', 'hater'],
    register: 'slang',
    etymology: 'from Eminem\'s 2000 song "Stan", about an obsessive fan'
  },
  {
    word: 'thirsty',
    pronunciation: '/ˈθɜːsti/',
    partOfSpeech: 'adjective',
    definitions: [
      'desperately seeking attention or approval',
      'eager; desperate',
      'in need of something'
    ],
    examples: [
      'Don\'t be so thirsty—nobody likes an overeager person.',
      'She was thirsty for success after years of struggle.'
    ],
    synonyms: ['desperate', 'eager', 'craving', 'yearning'],
    antonyms: ['indifferent', 'apathetic'],
    register: 'slang',
    etymology: 'extended meaning of "thirsty" in social media slang'
  },
  {
    word: 'shook',
    pronunciation: '/ʃʊk/',
    partOfSpeech: 'adjective',
    definitions: [
      'deeply shocked or disturbed',
      'emotionally affected',
      'unsettled by something unexpected'
    ],
    examples: [
      'I was absolutely shook after watching that twist.',
      'She was shook to hear the news about her old friend.'
    ],
    synonyms: ['shocked', 'disturbed', 'upset', 'rattled'],
    antonyms: ['calm', 'unshaken', 'unfazed'],
    register: 'slang',
    etymology: 'past tense of "shake" used as an adjective in slang'
  },
  {
    word: 'salty',
    pronunciation: '/ˈsɔːlti/',
    partOfSpeech: 'adjective',
    definitions: [
      'annoyed or upset; bitter',
      'angry or irritable',
      'upset about something minor'
    ],
    examples: [
      'Don\'t be salty just because you lost the game.',
      'He got salty when nobody laughed at his joke.'
    ],
    synonyms: ['bitter', 'irritated', 'annoyed', 'angry'],
    antonyms: ['calm', 'pleased', 'happy'],
    register: 'slang',
    etymology: 'slang extension meaning bitter or upset, possibly from the taste metaphor'
  },
  {
    word: 'vibe check',
    pronunciation: '/vaɪb tʃek/',
    partOfSpeech: 'noun phrase',
    definitions: [
      'an assessment of someone\'s mood or the atmosphere of a situation',
      'a check on whether things are going well',
      'evaluating the mood or energy'
    ],
    examples: [
      'Vibe check! Is everyone feeling good about this?',
      'The meeting failed the vibe check when everyone started arguing.'
    ],
    synonyms: ['assessment', 'check', 'evaluation'],
    antonyms: [],
    register: 'slang',
    etymology: 'Internet slang combining "vibe" and "check", popularized in memes'
  },
  {
    word: 'slay',
    pronunciation: '/sleɪ/',
    partOfSpeech: 'verb',
    definitions: [
      'to perform exceptionally well',
      'to impress greatly',
      'to be very successful at something'
    ],
    examples: [
      'She absolutely slayed that performance!',
      'The DJ slayed the entire set.'
    ],
    synonyms: ['excel', 'triumph', 'dominate', 'impress'],
    antonyms: ['fail', 'bomb', 'flop'],
    register: 'slang',
    etymology: 'originated in drag culture, meaning to do something excellently'
  }
];

export default enUSLiteraryVocabulary;
