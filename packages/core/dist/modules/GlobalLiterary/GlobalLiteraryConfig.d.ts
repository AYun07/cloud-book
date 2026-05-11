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
    length: {
        min: number;
        max: number;
        typical: number;
    };
}
export declare class GlobalLiteraryConfig {
    private genres;
    private forms;
    constructor();
    private initializeGlobalGenres;
    private initializeLiteraryForms;
    getGenreConfig(genre: Genre): GlobalGenreConfig | undefined;
    getFormConfig(form: LiteraryGenre): LiteraryFormConfig | undefined;
    getAllGenres(): GlobalGenreConfig[];
    getAllForms(): LiteraryFormConfig[];
    getGenresByRegion(region: string): GlobalGenreConfig[];
    getGenreNames(genre: Genre, language: Language): string;
    getFormNames(form: LiteraryGenre, language: Language): string;
    searchGenres(query: string, language: Language): GlobalGenreConfig[];
}
export default GlobalLiteraryConfig;
//# sourceMappingURL=GlobalLiteraryConfig.d.ts.map