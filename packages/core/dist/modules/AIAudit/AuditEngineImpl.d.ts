/**
 * Cloud Book - 审计引擎（已填充完整实现）
 * 33维度内容质量审计
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
    private checkRedundancy;
    private checkPacing;
    private checkShowDontTell;
    private checkGenericDimension;
    private analyzeDimensionSpecific;
    private dimensionToIssues;
    private getSuggestionsForDimension;
    private generateSummary;
    destroy(): void;
}
export declare const auditEngine: AuditEngine;
//# sourceMappingURL=AuditEngineImpl.d.ts.map