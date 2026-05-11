/**
 * 题材配置管理器
 * 支持所有文学题材的专属配置和模板
 */
import { Genre, GenreConfig, FactionTemplate, CharacterAttribute } from '../../types';
export interface GenreTemplate {
    genre: Genre;
    literaryGenre?: string;
    name: string;
    description: string;
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
export declare class GenreConfigManager {
    private templates;
    constructor();
    private initializeTemplates;
    getTemplate(genre: Genre): GenreTemplate | undefined;
    getAllTemplates(): GenreTemplate[];
    getSubgenres(genre: Genre): string[];
    getFactions(genre: Genre): FactionTemplate[];
    getCharacterAttributes(genre: Genre): CharacterAttribute[];
    getLocationTypes(genre: Genre): string[];
    getRecommendedLength(genre: Genre): {
        min: number;
        max: number;
    } | undefined;
    createProjectConfig(genre: Genre, options?: {
        subgenre?: string;
        customFactions?: FactionTemplate[];
    }): Promise<GenreConfig>;
    validateCharacter(genre: Genre, character: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
    getWritingGuidance(genre: Genre): string;
    addCustomTemplate(template: GenreTemplate): void;
    updateTemplate(genre: Genre, updates: Partial<GenreTemplate>): void;
    deleteTemplate(genre: Genre): boolean;
}
export default GenreConfigManager;
//# sourceMappingURL=GenreConfigManager.d.ts.map