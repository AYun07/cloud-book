/**
 * Cloud Book - 完整类型定义
 * 全能AI小说创作引擎
 */
export type Language = 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'en-GB' | 'en-AU' | 'en-CA' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'es-MX' | 'es-AR' | 'fr-FR' | 'fr-CA' | 'fr-BE' | 'de-DE' | 'de-AT' | 'de-CH' | 'pt-BR' | 'pt-PT' | 'ru-RU' | 'uk-UA' | 'it-IT' | 'nl-NL' | 'nl-BE' | 'pl-PL' | 'tr-TR' | 'ar-SA' | 'ar-EG' | 'ar-MA' | 'hi-IN' | 'bn-IN' | 'th-TH' | 'vi-VN' | 'id-ID' | 'ms-MY' | 'he-IL' | 'sv-SE' | 'no-NO' | 'da-DK' | 'fi-FI' | 'cs-CZ' | 'hu-HU' | 'ro-RO' | 'el-GR' | 'custom';
export type ConnectionMode = 'online' | 'offline' | 'hybrid';
export interface I18nConfig {
    primaryLanguage: Language;
    secondaryLanguage?: Language;
    fallbackLanguage: Language;
    autoDetect: boolean;
    grammarCheck: boolean;
    spellCheck: boolean;
}
export type LiteraryGenre = 'novel' | 'short_story' | 'novella' | 'prose' | 'poetry' | 'haiku' | 'free_verse' | 'classical_poetry' | 'drama' | 'screenplay' | 'teleplay' | 'micro_film' | 'fairytale' | 'fable' | 'allegory' | 'myth' | 'legend' | 'biography' | 'autobiography' | 'memoir' | 'reportage' | 'essay' | 'column' | 'blog' | 'script' | 'stage_play' | 'comic_script' | 'game_narrative' | 'visual_novel_script';
export type Genre = 'fantasy' | 'xianxia' | 'wuxia' | 'western_fantasy' | 'dark_fantasy' | 'epic_fantasy' | 'urban_fantasy' | 'scifi' | 'hard_sci-fi' | 'soft_sci-fi' | 'space_opera' | 'cyberpunk' | 'dystopian' | 'post_apocalyptic' | 'alternate_history' | 'time_travel' | 'mystery' | 'detective' | 'locked_room' | 'historical_mystery' | 'psychological_thriller' | 'legal_thriller' | 'medical_thriller' | 'romance' | 'historical_romance' | 'paranormal_romance' | 'science_fiction_romance' | 'young_adult_romance' | 'erotic_romance' | 'urban' | 'modern_urban' | 'workplace_romance' | 'crime_fiction' | 'police_procedural' | 'noir' | 'hardboiled' | 'historical' | 'ancient_china' | 'medieval_europe' | 'ming_qing_fiction' | 'three_kingdoms' | 'republican_era' | 'military' | 'war_story' | 'battlefield_hero' | 'strategic_command' | 'special_forces' | 'aviation' | 'naval' | 'gaming' | 'esports' | 'game_world_immersion' | 'game_mechanics' | 'light_novel' | 'anime_style' | 'school_life' | 'isekai' | 'comedy' | 'slapstick' | 'dark_comedy' | 'romantic_comedy' | 'satire' | 'parody' | 'fanfiction' | 'original_character' | 'cross_over' | 'alternate_universe' | 'slash' | 'femslash' | 'het' | 'horror' | 'supernatural_horror' | 'psychological_horror' | 'body_horror' | 'cosmic_horror' | 'gothic_horror' | 'thriller' | 'suspense' | 'action' | 'martial_arts' | 'adventure' | 'survival' | 'espionage' | 'religious' | 'mythology' | 'folklore' | 'cultivation' | 'system' | 'regression' | 'transmigration' | 'time_loops' | 'game_transmigration' | 'book_transmigration' | 'vampire' | 'werewolf' | 'angel_demon' | 'urban_wizard' | 'superhero' | 'psychological' | 'literary_fiction' | 'metafiction' | 'experimental' | 'blended_genre';
export type WritingMode = 'original' | 'imitation' | 'derivative' | 'fanfic';
export type ChapterStatus = 'outline' | 'drafting' | 'draft' | 'reviewing' | 'revising' | 'finalized' | 'published';
export type WritingMode2 = 'novel' | 'adventure' | 'chatbot';
export interface WorldInfo {
    id: string;
    name: string;
    keywords: string[];
    content: string;
    conditionalLogic?: string;
    depth?: number;
    key?: string;
    secondary?: boolean;
    parentId?: string;
    tags?: string[];
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    children?: WorldInfo[];
}
export interface Memory {
    id: string;
    content: string;
    type: 'memory' | 'authorsNote' | 'systemPrompt';
}
export interface GenerationSettings {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    repeatPenalty: number;
    repeatPenaltyTokens?: number;
    contextThreshold?: number;
    maxContextLength?: number;
}
export interface Story {
    id: string;
    title: string;
    content: string;
    mode: WritingMode2;
    worldInfo: WorldInfo[];
    memories: Memory[];
    settings: GenerationSettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface AutoDirectorResult {
    directions: StoryDirection[];
    selectedDirection?: number;
}
export interface StoryDirection {
    id: string;
    title: string;
    subtitle: string;
    sellingPoints: string[];
    targetAudience: string;
    firstPromise: string;
    chapterPlan: ChapterPlan[];
}
export interface ChapterPlan {
    number: number;
    title: string;
    summary: string;
    hooks: string[];
}
export interface CreativeHubSession {
    id: string;
    projectId: string;
    messages: HubMessage[];
    tools: HubTool[];
    context: HubContext;
}
export interface HubMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}
export interface HubTool {
    name: string;
    description: string;
    execute: Function;
}
export interface HubContext {
    currentChapter?: number;
    characters: string[];
    worldSettings: string[];
    pendingTasks: string[];
}
export interface Card {
    id: string;
    type: string;
    title: string;
    content: Record<string, any>;
    schema: CardSchema;
    parentId?: string;
    children?: string[];
    metadata?: Record<string, any>;
}
export interface CardSchema {
    type: string;
    properties: Record<string, SchemaProperty>;
    required?: string[];
    $defs?: Record<string, SchemaDefinition>;
}
export interface SchemaProperty {
    type: string;
    description?: string;
    default?: any;
    format?: string;
    items?: SchemaProperty;
    $ref?: string;
}
export interface SchemaDefinition {
    type: string;
    properties: Record<string, SchemaProperty>;
}
export interface GraphNode {
    id: string;
    type: 'character' | 'location' | 'item' | 'faction' | 'event' | 'concept';
    name: string;
    properties: Record<string, any>;
}
export interface GraphRelation {
    id: string;
    source: string;
    target: string;
    type: string;
    properties?: Record<string, any>;
}
export interface KnowledgeGraph {
    nodes: GraphNode[];
    relations: GraphRelation[];
}
export interface ContextInjection {
    type: 'card' | 'type' | 'self' | 'parent' | 'knowledge';
    selector: string;
    filters?: ContextFilter[];
    field?: string;
}
export interface ContextFilter {
    type: 'previous' | 'sibling' | 'index' | 'filter';
    expression?: string;
}
export type AgentType = 'architect' | 'writer' | 'auditor' | 'reviser' | 'styleEngineer' | 'radar';
export interface Agent {
    type: AgentType;
    name: string;
    role: string;
    responsibilities: string[];
    tools: string[];
}
export interface TruthFiles {
    currentState: CurrentState;
    particleLedger: Particle[];
    pendingHooks: Hook[];
    chapterSummaries: ChapterSummary[];
    subplotBoard: Subplot[];
    emotionalArcs: EmotionalArc[];
    characterMatrix: CharacterInteraction[];
}
export interface CurrentState {
    protagonist: ProtagonistState;
    knownFacts: string[];
    currentConflicts: string[];
    relationshipSnapshot: Record<string, string>;
    activeSubplots: string[];
}
export interface ProtagonistState {
    id: string;
    name: string;
    location: string;
    status: string;
    level?: string;
    resources?: Record<string, number>;
}
export type WorldState = CurrentState;
export type Resource = Particle;
export interface Particle {
    id: string;
    name: string;
    type: 'item' | 'ability' | 'currency' | 'status';
    owner: string;
    quantity?: number;
    lastUpdatedChapter: number;
    changeLog: ParticleChange[];
}
export interface ParticleChange {
    chapter: number;
    change: string;
}
export interface Hook {
    id: string;
    description: string;
    setInChapter: number;
    payoffChapter?: number;
    status: 'pending' | 'foreshadowed' | 'paid_off' | 'expired';
    type: 'character' | 'plot' | 'world' | 'item';
}
export interface ChapterSummary {
    chapterId: string;
    chapterNumber: number;
    title: string;
    charactersPresent: string[];
    keyEvents: string[];
    stateChanges: string[];
    newHooks: string[];
    resolvedHooks: string[];
}
export interface Subplot {
    id: string;
    name: string;
    status: 'active' | 'resolved' | 'abandoned';
    chapters: number[];
    description: string;
}
export interface EmotionalArc {
    characterId: string;
    characterName: string;
    arcType: 'rise' | 'fall' | 'rise_fall' | 'flat' | 'complex';
    points: EmotionPoint[];
}
export interface EmotionPoint {
    chapter: number;
    emotion: string;
    intensity: number;
}
export interface CharacterInteraction {
    characterId1: string;
    characterId2: string;
    interactions: Interaction[];
}
export interface Interaction {
    chapter: number;
    type: string;
    summary: string;
}
export interface StyleFingerprint {
    sourceText?: string;
    sentenceLengthDistribution: number[];
    wordFrequency: Record<string, number>;
    punctuationPattern: string;
    dialogueRatio: number;
    descriptionDensity: number;
    narrativeVoice: 'first_person' | 'second_person' | 'third_person';
    tense: 'past' | 'present' | 'future';
    emotionalWords: string[];
    signaturePhrases: string[];
    tabooWords: string[];
}
export interface DaemonConfig {
    enabled: boolean;
    intervalMinutes?: number;
    notifications: NotificationConfig;
    autoRetry: boolean;
    maxRetries: number;
}
export interface NotificationConfig {
    telegram?: TelegramConfig;
    feishu?: FeishuConfig;
    webhook?: WebhookConfig;
}
export interface TelegramConfig {
    botToken: string;
    chatId: string;
}
export interface FeishuConfig {
    webhookUrl: string;
}
export interface WebhookConfig {
    url: string;
    secret?: string;
}
export interface WritingStep {
    step: 'constitution' | 'specify' | 'clarify' | 'plan' | 'tasks' | 'write' | 'analyze';
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    output?: any;
}
export interface Constitution {
    id: string;
    title: string;
    corePrinciples: string[];
    writingGuidelines: string[];
    genreSpecificRules: string[];
}
export interface StorySpec {
    id: string;
    title: string;
    premise: string;
    genre: Genre;
    targetAudience: string;
    wordCountTarget: number;
    themes: string[];
    tone: string;
    structure: string;
    requirements: string[];
}
export interface WritingPlan {
    id: string;
    chapters: ChapterOutline[];
    estimatedCompletion: Date;
    milestones: Milestone[];
}
export interface ChapterOutline {
    number: number;
    title: string;
    summary: string;
    wordCountTarget: number;
    keyPoints: string[];
    hooks: string[];
}
export interface Milestone {
    id: string;
    description: string;
    targetChapter: number;
    completed: boolean;
}
export interface TaskItem {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    chapterId?: string;
    estimatedTime?: number;
}
export interface GenreConfig {
    genre: Genre;
    literaryGenre: LiteraryGenre;
    subgenres: string[];
    factions: FactionTemplate[];
    characterAttributes: CharacterAttribute[];
    locationTypes: string[];
    narrativeFrameworks: string[];
    powerSystem?: string;
    requiredElements: string[];
    tabooElements: string[];
    typicalArcPatterns: string[];
    recommendedLength: {
        min: number;
        max: number;
    };
}
export interface FactionTemplate {
    type: string;
    name: string;
    description: string;
    hierarchy?: string[];
    territories?: string[];
}
export interface CharacterAttribute {
    name: string;
    type: 'string' | 'number' | 'list' | 'relationship';
    required?: boolean;
    options?: string[];
}
export interface CharacterArc {
    id: string;
    characterId: string;
    arcType: 'positive' | 'negative' | 'flat' | 'circular' | 'transformation';
    stages: ArcStage[];
}
export interface ArcStage {
    chapter: number;
    description: string;
    change: string;
}
export interface QualityMetrics {
    coherence: number;
    pacing: number;
    characterDevelopment: number;
    worldBuilding: number;
    proseQuality: number;
    dialogueQuality: number;
    overall: number;
}
export interface ReviewLevel {
    level: 'scene' | 'chapter' | 'batch';
    dimensions: string[];
    autoFix: boolean;
}
export interface Character {
    id: string;
    name: string;
    aliases?: string[];
    gender?: 'male' | 'female' | 'other';
    age?: string;
    appearance?: string;
    personality?: string;
    background?: string;
    goals?: string[];
    abilities?: string[];
    inventory?: Item[];
    relationships?: Relationship[];
    speakingStyle?: string;
    psychologicalProfile?: string;
    arc?: CharacterArc;
    familyTree?: FamilyMember[];
}
export interface Item {
    id: string;
    name: string;
    description?: string;
    rarity?: string;
    quantity?: number;
    owner?: string;
}
export interface Relationship {
    targetId: string;
    type: string;
    status: string;
    description?: string;
}
export interface FamilyMember {
    name: string;
    relation: string;
    description?: string;
}
export interface WorldSetting {
    id: string;
    name: string;
    genre: Genre;
    literaryGenre: LiteraryGenre;
    powerSystem?: string;
    locations?: Location[];
    factions?: Faction[];
    timeline?: TimelineEvent[];
    rules?: string[];
    customSettings?: Record<string, any>;
    knowledgeGraph?: KnowledgeGraph;
}
export interface Location {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    connections?: string[];
    mapCoordinates?: {
        x: number;
        y: number;
    };
}
export interface Faction {
    id: string;
    name: string;
    type: string;
    description?: string;
    members?: string[];
    territory?: string;
    allies?: string[];
    enemies?: string[];
}
export interface TimelineEvent {
    id: string;
    time: string;
    description: string;
    chapter?: number;
    impact?: string;
}
export interface Chapter {
    id: string;
    number: number;
    title: string;
    status: ChapterStatus;
    wordCount: number;
    outline?: string;
    content?: string;
    summary?: string;
    characters?: string[];
    location?: string;
    timeline?: string;
    hooks?: Hook[];
    emotionalArc?: string;
    qualityScore?: number;
    auditResult?: AuditResult;
    version?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface NovelProject {
    id: string;
    title: string;
    subtitle?: string;
    author?: string;
    genre: Genre;
    literaryGenre: LiteraryGenre;
    writingMode: WritingMode;
    sourceNovel?: string;
    corePremise?: string;
    sellingPoints?: string[];
    targetAudience?: string;
    volumeCount?: number;
    plannedChapters?: number;
    targetWordCount?: number;
    worldSetting?: WorldSetting;
    characters?: Character[];
    chapters?: Chapter[];
    styleFingerprint?: StyleFingerprint;
    constitution?: Constitution;
    spec?: StorySpec;
    plan?: WritingPlan;
    worldInfo?: WorldInfo[];
    memories?: Memory[];
    truthFiles?: TruthFiles;
    writingSteps?: WritingStep[];
    genreConfig?: GenreConfig;
    settings?: GenerationSettings;
    status: 'planning' | 'writing' | 'completed' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'ollama' | 'koboldcpp' | 'lmstudio' | 'custom';
    name: string;
    endpoint?: string;
    baseURL?: string;
    apiKey?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}
export interface ModelRoute {
    task: 'planning' | 'writing' | 'revision' | 'audit' | 'style' | 'analysis';
    llmConfig: LLMConfig;
}
export interface AuditResult {
    passed: boolean;
    dimensions: AuditDimension[];
    issues: Issue[];
    score: number;
}
export interface AuditDimension {
    name: string;
    score: number;
    passed: boolean;
    details?: string;
}
export interface Issue {
    type: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    location?: IssueLocation;
    suggestion?: string;
}
export interface IssueLocation {
    chapterId: string;
    paragraphIndex?: number;
    characterId?: string;
}
export declare const AUDIT_DIMENSIONS: readonly ["characterConsistency", "worldConsistency", "timelineConsistency", "plotLogic", "foreshadowFulfillment", "resourceTracking", "emotionalArc", "narrativePacing", "dialogueQuality", "descriptionDensity", "aiDetection", "repetitiveness", "grammaticalErrors", "tautology", "logicalGaps", "progressionPacing", "conflictEscalation", "characterMotivation", "stakesClarity", "sensoryDetails", "backstoryIntegration", "povConsistency", "tenseConsistency", "pacingVariation", "showVsTell", "subtext", "symbolism", "thematicCoherence", "readerEngagement", "genreConvention", "culturalSensitivity", "factualAccuracy", "powerConsistency"];
export type AuditDimensionType = typeof AUDIT_DIMENSIONS[number];
export interface AntiDetectionConfig {
    enabled: boolean;
    intensity: number;
    replaceAIWords: boolean;
    varySentenceStructure: boolean;
    addColloquialism: boolean;
    enhanceEmotion: boolean;
    addImperfection: boolean;
    mixStyles: boolean;
}
export interface AuditConfig {
    dimensions: string[];
    threshold: number;
    autoFix: boolean;
    maxIterations: number;
    reviewLevels?: ('scene' | 'chapter' | 'batch')[];
    enableAutoFix?: boolean;
}
export interface DetectionResult {
    isAI: boolean;
    confidence: number;
    indicators: AIIndicator[];
    suggestions: string[];
}
export interface AIIndicator {
    type: string;
    description: string;
    severity: number;
    location?: string;
}
export interface ImportConfig {
    filePath?: string;
    encoding?: string;
    splitPattern?: RegExp;
    preserveFormatting?: boolean;
    extractCharacters?: boolean;
    extractWorldSettings?: boolean;
    analyzeStyle?: boolean;
    chunkSize?: number;
    overlap?: number;
}
export interface ExportConfig {
    format: 'txt' | 'md' | 'epub' | 'pdf' | 'docx' | 'json';
    includeOutline?: boolean;
    includeCharacters?: boolean;
    includeWorldSettings?: boolean;
    platform?: 'qidian' | '番茄' | '飞卢' | 'custom';
    template?: string;
}
export interface ParseResult {
    title: string;
    author?: string;
    genre?: Genre;
    literaryGenre?: LiteraryGenre;
    estimatedWordCount: number;
    chapters: ParsedChapter[];
    characters: ExtractedCharacter[];
    worldSettings: ExtractedWorldSetting;
    writingPatterns: WritingPattern[];
    styleFingerprint: StyleFingerprint;
}
export interface ParsedChapter {
    index: number;
    title: string;
    content: string;
    wordCount: number;
    characters: string[];
    scenes: Scene[];
}
export interface Scene {
    location: string;
    time: string;
    characters: string[];
    summary: string;
}
export interface ExtractedCharacter {
    name: string;
    aliases: string[];
    description: string;
    appearances: number[];
    relationships: {
        name: string;
        type: string;
    }[];
}
export interface ExtractedWorldSetting {
    powerSystem?: string;
    locations: string[];
    factions: string[];
    items: string[];
    timeline: {
        event: string;
        chapter?: number;
    }[];
}
export interface WritingPattern {
    type: 'opening' | 'dialogue' | 'description' | 'action' | 'transition';
    frequency: number;
    examples: string[];
}
export interface CoverConfig {
    style?: 'fantasy' | 'modern' | 'scifi' | 'romance' | 'historical' | 'custom';
    mainColor?: string;
    characters?: string[];
    theme?: string;
}
export interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
    collapsed?: boolean;
}
export interface WritingGoal {
    id: string;
    type: 'daily' | 'weekly' | 'chapter' | 'total';
    target: number;
    current: number;
    deadline?: Date;
    completed: boolean;
}
export interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    commands?: PluginCommand[];
    hooks?: PluginHook[];
}
export interface PluginCommand {
    name: string;
    description: string;
    execute: Function;
}
export interface PluginHook {
    name: string;
    callback: Function;
}
export interface TrendAnalysis {
    popularElements: string[];
    trendingGenres: string[];
    successfulPatterns: string[];
    marketGaps: string[];
}
export interface CompetitorAnalysis {
    title: string;
    author: string;
    genre: Genre;
    wordCount: number;
    updateFrequency: string;
    hotElements: string[];
    strengths: string[];
    weaknesses: string[];
    readerReviews: string[];
}
export interface LocalAPIConfig {
    port: number;
    host?: string;
    ssl?: {
        enabled: boolean;
        keyPath?: string;
        certPath?: string;
    };
    apiKeys: APIKeyConfig[];
    rateLimit?: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
    };
    cache?: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
}
export interface APIKeyConfig {
    provider: string;
    apiKey: string;
    baseUrl?: string;
    models: string[];
    priority?: number;
}
export interface NetworkStatus {
    isOnline: boolean;
    lastCheck: Date;
    latency?: number;
    mode: ConnectionMode;
    fallbackAvailable: boolean;
}
export interface GrammarCheck {
    text: string;
    errors: GrammarError[];
    suggestions: GrammarSuggestion[];
}
export interface GrammarError {
    startIndex: number;
    endIndex: number;
    errorText: string;
    errorType: 'spelling' | 'grammar' | 'punctuation' | 'style';
    message: string;
}
export interface GrammarSuggestion {
    original: string;
    suggestion: string;
    reason?: string;
}
export interface TranslationResult {
    text: string;
    sourceLang: Language;
    targetLang: Language;
    confidence: number;
}
export interface WritingStyle {
    locale: Language;
    formality: 'formal' | 'informal' | 'neutral';
    tone: 'serious' | 'casual' | 'professional' | 'academic' | 'literary';
    voice: 'first' | 'second' | 'third';
    dialect?: string;
}
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
    length: {
        min: number;
        max: number;
        typical: number;
    };
}
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage' | 'disk';
    serializer?: 'json' | 'msgpack' | 'binary';
}
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: number;
    expiresAt: number;
    size: number;
    hits: number;
}
export interface CacheStats {
    size: number;
    maxSize: number;
    hitRate: number;
    hits: number;
    misses: number;
    evictions: number;
}
export interface Version {
    id: string;
    version: number;
    timestamp: Date;
    content: string;
    summary?: string;
    author?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    parentId?: string;
    branch?: string;
}
export interface Branch {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    headVersionId: string;
}
export interface Diff {
    type: 'add' | 'remove' | 'modify';
    lineNumber?: number;
    oldContent?: string;
    newContent?: string;
    context?: string;
}
export interface ChangeStats {
    additions: number;
    deletions: number;
    modifications: number;
}
export interface NetworkConfig {
    checkInterval: number;
    timeout: number;
    fallbackUrls: string[];
}
export interface WritingOptions {
    targetWordCount?: number;
    styleGuidance?: string;
    chapterGuidance?: string;
    autoAudit?: boolean;
    autoHumanize?: boolean;
    parallelCount?: number;
}
//# sourceMappingURL=types.d.ts.map