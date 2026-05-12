/**
 * 目标管理器
 * 管理写作目标、进度追踪、习惯养成
 */
export interface WritingGoal {
    id: string;
    type: 'daily' | 'weekly' | 'monthly' | 'chapter' | 'word';
    target: number;
    current: number;
    unit: 'words' | 'chapters' | 'minutes' | 'pages';
    deadline?: Date;
    createdAt: Date;
    completedAt?: Date;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    projectId?: string;
}
export interface GoalStreak {
    current: number;
    longest: number;
    lastActiveDate: Date;
}
export interface DailyProgress {
    date: string;
    wordsWritten: number;
    chaptersCompleted: number;
    minutesSpent: number;
    goalsMet: string[];
    notes?: string;
}
export interface GoalStats {
    totalGoalsCompleted: number;
    currentStreak: number;
    longestStreak: number;
    averageWordsPerDay: number;
    totalWordsWritten: number;
    totalChaptersCompleted: number;
    completionRate: number;
}
export declare class GoalManager {
    private goals;
    private currentGoal;
    private dailyProgress;
    private streak;
    constructor(storagePath?: string);
    setGoal(goal: WritingGoal): void;
    getCurrentGoal(): WritingGoal | null;
    recordWriting(words: number, date?: Date): void;
    createGoal(goal: Omit<WritingGoal, 'id' | 'createdAt' | 'status' | 'current'>): WritingGoal;
    updateProgress(goalId: string, amount: number): WritingGoal | null;
    setProgress(goalId: string, value: number): WritingGoal | null;
    recordDailyProgress(data: {
        wordsWritten?: number;
        chaptersCompleted?: number;
        minutesSpent?: number;
        goalId?: string;
        notes?: string;
    }): DailyProgress;
    getDailyProgress(date?: Date): DailyProgress | null;
    getProgressRange(startDate: Date, endDate: Date): DailyProgress[];
    getActiveGoals(): WritingGoal[];
    getGoal(goalId: string): WritingGoal | null;
    getGoalsByType(type: WritingGoal['type']): WritingGoal[];
    getGoalsByProject(projectId: string): WritingGoal[];
    pauseGoal(goalId: string): WritingGoal | null;
    resumeGoal(goalId: string): WritingGoal | null;
    cancelGoal(goalId: string): WritingGoal | null;
    deleteGoal(goalId: string): boolean;
    getStreak(): GoalStreak;
    private updateStreak;
    getStats(days?: number): GoalStats;
    generateReport(days?: number): {
        summary: string;
        achievements: string[];
        improvements: string[];
        recommendations: string[];
    };
    createPresetGoal(preset: 'daily_1000' | 'daily_2000' | 'daily_5000' | 'weekly_10k' | 'monthly_chapter30', projectId?: string): WritingGoal;
    private getEndOfDay;
    private getEndOfWeek;
    private getEndOfMonth;
    private generateId;
    private saveData;
    private loadData;
    resetAllData(): void;
}
export default GoalManager;
//# sourceMappingURL=GoalManager.d.ts.map