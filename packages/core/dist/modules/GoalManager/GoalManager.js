"use strict";
/**
 * 目标管理器
 * 管理写作目标、进度追踪、习惯养成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalManager = void 0;
class GoalManager {
    goals = [];
    dailyProgress = [];
    streak = {
        current: 0,
        longest: 0,
        lastActiveDate: new Date()
    };
    constructor() {
        this.loadData();
    }
    createGoal(goal) {
        const newGoal = {
            ...goal,
            id: this.generateId(),
            createdAt: new Date(),
            current: 0,
            status: 'active'
        };
        this.goals.push(newGoal);
        this.saveData();
        return newGoal;
    }
    updateProgress(goalId, amount) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal)
            return null;
        goal.current += amount;
        if (goal.current >= goal.target) {
            goal.current = goal.target;
            goal.status = 'completed';
            goal.completedAt = new Date();
        }
        this.updateStreak();
        this.saveData();
        return goal;
    }
    setProgress(goalId, value) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal)
            return null;
        goal.current = Math.min(value, goal.target);
        if (goal.current >= goal.target) {
            goal.status = 'completed';
            goal.completedAt = new Date();
        }
        this.updateStreak();
        this.saveData();
        return goal;
    }
    recordDailyProgress(data) {
        const today = new Date().toISOString().split('T')[0];
        let progress = this.dailyProgress.find(p => p.date === today);
        if (!progress) {
            progress = {
                date: today,
                wordsWritten: 0,
                chaptersCompleted: 0,
                minutesSpent: 0,
                goalsMet: []
            };
            this.dailyProgress.push(progress);
        }
        if (data.wordsWritten) {
            progress.wordsWritten += data.wordsWritten;
        }
        if (data.chaptersCompleted) {
            progress.chaptersCompleted += data.chaptersCompleted;
        }
        if (data.minutesSpent) {
            progress.minutesSpent += data.minutesSpent;
        }
        if (data.notes) {
            progress.notes = data.notes;
        }
        if (data.goalId) {
            const goal = this.goals.find(g => g.id === data.goalId);
            if (goal && goal.current >= goal.target && !progress.goalsMet.includes(goal.id)) {
                progress.goalsMet.push(goal.id);
            }
        }
        this.updateStreak();
        this.saveData();
        return progress;
    }
    getDailyProgress(date) {
        const dateStr = (date || new Date()).toISOString().split('T')[0];
        return this.dailyProgress.find(p => p.date === dateStr) || null;
    }
    getProgressRange(startDate, endDate) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return this.dailyProgress.filter(p => p.date >= start && p.date <= end).sort((a, b) => a.date.localeCompare(b.date));
    }
    getActiveGoals() {
        return this.goals.filter(g => g.status === 'active');
    }
    getGoal(goalId) {
        return this.goals.find(g => g.id === goalId) || null;
    }
    getGoalsByType(type) {
        return this.goals.filter(g => g.type === type);
    }
    getGoalsByProject(projectId) {
        return this.goals.filter(g => g.projectId === projectId);
    }
    pauseGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal && goal.status === 'active') {
            goal.status = 'paused';
            this.saveData();
        }
        return goal || null;
    }
    resumeGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal && goal.status === 'paused') {
            goal.status = 'active';
            this.saveData();
        }
        return goal || null;
    }
    cancelGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.status = 'cancelled';
            this.saveData();
        }
        return goal || null;
    }
    deleteGoal(goalId) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            this.goals.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    getStreak() {
        return { ...this.streak };
    }
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (this.streak.lastActiveDate.toISOString().split('T')[0] === today) {
            return;
        }
        if (this.streak.lastActiveDate.toISOString().split('T')[0] === yesterday) {
            this.streak.current++;
        }
        else {
            this.streak.current = 1;
        }
        if (this.streak.current > this.streak.longest) {
            this.streak.longest = this.streak.current;
        }
        this.streak.lastActiveDate = new Date();
    }
    getStats(days = 30) {
        const startDate = new Date(Date.now() - days * 86400000);
        const progress = this.getProgressRange(startDate, new Date());
        const totalWords = progress.reduce((sum, p) => sum + p.wordsWritten, 0);
        const totalChapters = progress.reduce((sum, p) => sum + p.chaptersCompleted, 0);
        const totalMinutes = progress.reduce((sum, p) => sum + p.minutesSpent, 0);
        const completedGoals = this.goals.filter(g => g.status === 'completed').length;
        const allGoals = this.goals.length;
        const completionRate = allGoals > 0 ? (completedGoals / allGoals) * 100 : 0;
        return {
            totalGoalsCompleted: completedGoals,
            currentStreak: this.streak.current,
            longestStreak: this.streak.longest,
            averageWordsPerDay: days > 0 ? totalWords / days : 0,
            totalWordsWritten: totalWords,
            totalChaptersCompleted: totalChapters,
            completionRate
        };
    }
    generateReport(days = 7) {
        const stats = this.getStats(days);
        const recentProgress = this.getProgressRange(new Date(Date.now() - days * 86400000), new Date());
        const achievements = [];
        const improvements = [];
        const recommendations = [];
        if (stats.currentStreak >= 7) {
            achievements.push(`连续写作${stats.currentStreak}天！`);
        }
        if (stats.currentStreak > stats.longestStreak * 0.8) {
            achievements.push('接近历史最长连续记录！');
        }
        const avgWords = stats.averageWordsPerDay;
        if (avgWords >= 3000) {
            achievements.push('日均写作超过3000字！');
        }
        else if (avgWords < 1000) {
            improvements.push('日均写作量偏低，建议提高');
            recommendations.push('尝试设定每日最低写作字数目标');
        }
        const completedGoals = recentProgress.filter(p => p.goalsMet.length > 0).length;
        if (completedGoals >= days * 0.7) {
            achievements.push('大部分日子都完成了目标');
        }
        else if (completedGoals < days * 0.3) {
            improvements.push('目标完成率有待提高');
            recommendations.push('考虑调整目标难度');
        }
        if (stats.longestStreak > stats.currentStreak * 2) {
            recommendations.push('尝试打破历史最长连续记录');
        }
        if (avgWords < 2000) {
            recommendations.push('尝试番茄工作法，每25分钟专注写作');
        }
        const summary = `在过去${days}天里，你写了${stats.totalWordsWritten}字，` +
            `完成了${stats.totalChaptersCompleted}章，` +
            `当前连续写作${stats.currentStreak}天。`;
        return { summary, achievements, improvements, recommendations };
    }
    createPresetGoal(preset, projectId) {
        const presets = {
            'daily_1000': { type: 'daily', target: 1000, unit: 'words', deadline: this.getEndOfDay() },
            'daily_2000': { type: 'daily', target: 2000, unit: 'words', deadline: this.getEndOfDay() },
            'daily_5000': { type: 'daily', target: 5000, unit: 'words', deadline: this.getEndOfDay() },
            'weekly_10k': { type: 'weekly', target: 10000, unit: 'words', deadline: this.getEndOfWeek() },
            'monthly_chapter30': { type: 'monthly', target: 30, unit: 'chapters', deadline: this.getEndOfMonth() }
        };
        const presetData = presets[preset];
        if (!presetData) {
            throw new Error(`Unknown preset: ${preset}`);
        }
        return this.createGoal({ ...presetData, projectId });
    }
    getEndOfDay() {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return now;
    }
    getEndOfWeek() {
        const now = new Date();
        const daysUntilSunday = 7 - now.getDay();
        now.setDate(now.getDate() + daysUntilSunday);
        now.setHours(23, 59, 59, 999);
        return now;
    }
    getEndOfMonth() {
        const now = new Date();
        now.setMonth(now.getMonth() + 1, 0);
        now.setHours(23, 59, 59, 999);
        return now;
    }
    generateId() {
        return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    saveData() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('cloudbook_goals', JSON.stringify({
                    goals: this.goals,
                    dailyProgress: this.dailyProgress,
                    streak: this.streak
                }));
            }
        }
        catch { }
    }
    loadData() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('cloudbook_goals');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.goals = data.goals || [];
                    this.dailyProgress = data.dailyProgress || [];
                    this.streak = data.streak || { current: 0, longest: 0, lastActiveDate: new Date() };
                    this.goals = this.goals.map((g) => ({
                        ...g,
                        createdAt: new Date(g.createdAt),
                        completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
                        deadline: g.deadline ? new Date(g.deadline) : undefined
                    }));
                    this.dailyProgress = this.dailyProgress.map((p) => ({
                        ...p
                    }));
                    this.streak.lastActiveDate = new Date(this.streak.lastActiveDate);
                }
            }
        }
        catch {
            this.goals = [];
            this.dailyProgress = [];
            this.streak = { current: 0, longest: 0, lastActiveDate: new Date() };
        }
    }
    resetAllData() {
        this.goals = [];
        this.dailyProgress = [];
        this.streak = { current: 0, longest: 0, lastActiveDate: new Date() };
        this.saveData();
    }
}
exports.GoalManager = GoalManager;
exports.default = GoalManager;
//# sourceMappingURL=GoalManager.js.map