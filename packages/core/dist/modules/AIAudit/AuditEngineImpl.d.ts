/**
 * Cloud Book - 审计引擎 V2
 * 34维度全面质量审计 - 每个维度都有真正的检测算法
 */
export interface AuditResult {
    score: number;
    dimensions: AuditDimension[];
    issues: AuditIssue[];
    suggestions: string[];
    summary: string;
}
export interface AuditDimension {
    name: string;
    score: number;
    weight: number;
    description: string;
    status: 'pass' | 'warning' | 'fail';
    details?: string;
}
export interface AuditIssue {
    dimension: string;
    severity: 'critical' | 'major' | 'minor';
    message: string;
    location?: {
        start: number;
        end: number;
        line?: number;
    };
    suggestion: string;
}
export declare class AuditEngine {
    private storage;
    constructor();
    audit(content: string, options?: {
        dimensions?: string[];
        strict?: boolean;
        language?: string;
    }): Promise<AuditResult>;
    private getAllDimensions;
    private auditDimension;
    private checkGrammar;
    private checkSpelling;
    private checkPunctuation;
    private checkSentenceStructure;
    private checkParagraphStructure;
    private checkCoherence;
    private checkConsistency;
    private checkCharacterVoice;
    private checkDialogue;
    private checkNarrativeVoice;
    private checkPacing;
    private checkDescription;
    private checkShowDontTell;
    private checkEmotionalImpact;
    private checkConflict;
    private checkTension;
    private checkResolution;
    private checkPlotHoles;
    private checkTimeline;
    private checkWorldbuilding;
    private checkMotivation;
    private checkStakes;
    private checkThemes;
    private checkSymbolism;
    private checkProse;
    private checkReadability;
    private checkAuthenticity;
    private checkRedundancy;
    private checkClarity;
    private checkWordChoice;
    private checkSentenceVariation;
    private checkGenreConvention;
    private checkTargetAudience;
    private checkAIDetection;
    private dimensionToIssues;
    private getSuggestionsForDimension;
    private generateSummary;
    private calculateVariance;
    private extractCharacterNames;
    private extractDialogues;
    private detectRepeatedPhrases;
    private detectTopicShifts;
    private detectTenseInconsistencies;
    private checkPronounReferences;
    private detectConsecutiveSameSpeaker;
    private detectContradictions;
    private detectUnexplainedEvents;
    private detectCharacterInconsistencies;
    private detectMotivationGaps;
    private detectAbilityInconsistencies;
    private detectImpossibleSequences;
    private checkDurationConsistency;
    private checkWorldConsistency;
    private checkActionMotivationPairs;
    private checkThematicDevelopment;
    private detectRepeatedSymbols;
    private assessProseRhythm;
    private calculateFleschScore;
    private countSensoryDetails;
    private calculateWordFrequency;
    private checkConflictEscalation;
    private identifyTensionBuilding;
    private assessLanguageComplexity;
    private assessDialogueComplexity;
    private checkGenreSpecificPatterns;
    destroy(): void;
}
export declare const auditEngine: AuditEngine;
//# sourceMappingURL=AuditEngineImpl.d.ts.map