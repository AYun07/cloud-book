import type { VocabularyEntry } from '../../types';

export const customVocabulary: VocabularyEntry[] = [
  {
    term: 'placeholder',
    pronunciation: 'ˈpleɪshəldər',
    partOfSpeech: 'noun',
    definition: 'A placeholder term for custom language implementations that require user-defined vocabulary',
    examples: [
      'This is a placeholder entry for custom language vocabulary.',
      'Replace this with actual vocabulary entries for your custom language.'
    ],
    synonyms: ['temporary', 'stand-in', 'dummy'],
    antonyms: ['final', 'actual'],
    register: 'formal_written',
    etymology: 'English: "place" + "holder"',
    literaryAllusion: 'Used in programming and template systems'
  },
  {
    term: 'custom_vocabulary_entry',
    pronunciation: 'ˈkʌstəm ˈvɒkjʊləri ˈɛntri',
    partOfSpeech: 'noun',
    definition: 'User-defined vocabulary entry for specialized or regional language support',
    examples: [
      'Custom vocabulary entries allow for regional dialect support.',
      'Each custom_vocabulary_entry should follow the VocabularyEntry interface.'
    ],
    synonyms: ['user-defined', 'customized', 'specialized'],
    antonyms: ['standard', 'default'],
    register: 'formal_written',
    etymology: 'English compound term',
    literaryAllusion: 'For extensibility in multilingual systems'
  },
  {
    term: 'interlingua',
    pronunciation: 'ɪntərˈlɪŋɡwə',
    partOfSpeech: 'noun',
    definition: 'A constructed auxiliary language designed to be easy to learn for speakers of European languages',
    examples: [
      'Interlingua was designed to facilitate international communication.',
      'The interlingua vocabulary draws from Romance, Germanic, and Slavic languages.'
    ],
    synonyms: ['auxlang', 'constructed language', 'lingua franca'],
    antonyms: ['natural language', 'vernacular'],
    register: 'literary',
    etymology: 'From Latin "inter" (between) + "lingua" (language)',
    literaryAllusion: 'The International Auxiliary Language Association (IALA) developed Interlingua in the 1950s'
  },
  {
    term: 'lingua_franca',
    pronunciation: 'ˈlɪŋɡwə ˈfræŋkə',
    partOfSpeech: 'noun',
    definition: 'A language used for communication between people who do not share a native language',
    examples: [
      'English serves as the modern lingua franca of international business.',
      'Arabic was once the lingua franca of the Islamic world.'
    ],
    synonyms: ['bridge language', 'common language', 'vehicular language'],
    antonyms: ['native tongue', 'mother tongue'],
    register: 'formal_written',
    etymology: 'From Italian "lingua franca" (Frankish language), named for the Mediterranean trade language',
    literaryAllusion: 'Historical linguas francas include Latin, Arabic, Swahili, and Mandarin in their respective spheres'
  },
  {
    term: 'code_switching',
    pronunciation: 'koʊd ˈswɪtʃɪŋ',
    partOfSpeech: 'noun',
    definition: 'The practice of alternating between two or more languages in conversation',
    examples: [
      'Code-switching is common among bilingual speakers.',
      'The novel explores code-switching in the immigrant community.'
    ],
    synonyms: ['code-mixing', 'language alternation', 'diglossia'],
    antonyms: ['monolingualism'],
    register: 'academic',
    etymology: 'English compound term from sociolinguistics',
    literaryAllusion: 'Studied extensively in sociolinguistic literature, particularly in immigrant and diaspora communities'
  },
  {
    term: 'pidgin',
    pronunciation: 'ˈpɪdʒɪn',
    partOfSpeech: 'noun',
    definition: 'A simplified language developed for communication between groups with no common language',
    examples: [
      'Nigerian Pidgin English is widely spoken.',
      'The sailors developed a pidgin for trade purposes.'
    ],
    synonyms: ['contact language', 'simplified language'],
    antonyms: ['creole', 'natural language'],
    register: 'academic',
    etymology: 'Possibly from Chinese "baichin" (business)',
    literaryAllusion: 'Many literary works incorporate pidgin speech to depict colonial and trade settings'
  },
  {
    term: 'creole',
    pronunciation: 'ˈkrioʊl',
    partOfSpeech: 'noun',
    definition: 'A stable natural language developed from a mixture of two or more parent languages',
    examples: [
      'Haitian Creole evolved from French and West African languages.',
      'The novel is written in Louisiana Creole.'
    ],
    synonyms: ['creole language', 'hybrid language'],
    antonyms: ['pidgin', 'monolingual'],
    register: 'academic',
    etymology: 'From French "créole" (created), from Portuguese "criar" (to create)',
    literaryAllusion: 'Creole literature represents a rich tradition, particularly in the Caribbean'
  },
  {
    term: 'regionalism',
    pronunciation: 'ˈriːdʒənəlɪzəm',
    partOfSpeech: 'noun',
    definition: 'A word, phrase, or expression characteristic of a particular region',
    examples: [
      'The author uses regionalisms to establish setting.',
      'Many regionalisms in the South differ from Northern English.'
    ],
    synonyms: ['dialect word', 'regional variation', 'provincialism'],
    antonyms: ['standard language', 'universalism'],
    register: 'academic',
    etymology: 'From "region" + "-ism"',
    literaryAllusion: 'Regionalisms are essential in establishing authenticity in regional literature'
  },
  {
    term: 'archaism',
    pronunciation: 'ɑːrˈkeɪɪzəm',
    partOfSpeech: 'noun',
    definition: 'An old-fashioned word, phrase, or expression no longer in common use',
    examples: [
      'The poem is full of archaisms from Middle English.',
      'Using archaisms can lend a archaic or literary flavor.'
    ],
    synonyms: ['obsolete word', 'dated expression', 'antiquated term'],
    antonyms: ['neologism', 'modernism'],
    register: 'literary',
    etymology: 'From Greek "archaios" (ancient)',
    literaryAllusion: 'Archaisms are often used deliberately in poetry and historical fiction to create atmosphere'
  },
  {
    term: 'neologism',
    pronunciation: 'niːˈɒlədʒɪzəm',
    partOfSpeech: 'noun',
    definition: 'A newly coined word or expression; a word recently added to a language',
    examples: [
      'The internet has generated countless neologisms.',
      'Joyce was famous for creating neologisms in Ulysses.'
    ],
    synonyms: ['new word', 'coinage', 'invented term'],
    antonyms: ['archaism', 'obsolete term'],
    register: 'formal_written',
    etymology: 'From Greek "neos" (new) + "logos" (word)',
    literaryAllusion: 'Modernist literature often experiments with neologisms to express new concepts'
  }
];
