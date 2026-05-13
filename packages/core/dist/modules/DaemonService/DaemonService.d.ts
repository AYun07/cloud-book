/**
 * 守护进程服务
 * 后台任务调度、通知推送
 */
import { DaemonConfig } from '../../types';
import { LLMManager } from '../LLMProvider/LLMManager';
export interface ScheduledTask {
    id: string;
    type: 'write' | 'audit' | 'export' | 'backup';
    schedule: string;
    params: Record<string, any>;
    lastRun?: Date;
    nextRun?: Date;
    status: 'active' | 'paused' | 'completed';
    result?: any;
}
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}
export declare class DaemonService {
    private config;
    private tasks;
    private notifications;
    private isRunning;
    private intervalId?;
    private llmManager;
    private storage;
    private storagePath;
    constructor(config: DaemonConfig, llmManager: LLMManager, storagePath?: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    addTask(task: Omit<ScheduledTask, 'id' | 'status' | 'nextRun'>): Promise<ScheduledTask>;
    updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null>;
    deleteTask(taskId: string): Promise<boolean>;
    getTask(taskId: string): Promise<ScheduledTask | undefined>;
    getAllTasks(): Promise<ScheduledTask[]>;
    pauseTask(taskId: string): Promise<void>;
    resumeTask(taskId: string): Promise<void>;
    executeTaskNow(taskId: string): Promise<any>;
    private processTasks;
    private executeTaskType;
    private executeWriteTask;
    private loadProjectData;
    private buildChapterContext;
    private generateChapterTitle;
    private humanizeContent;
    private countWords;
    private executeAuditTask;
    private parseAuditResult;
    private executeExportTask;
    private exportAsTxt;
    private exportAsMarkdown;
    private escapeHtml;
    private exportAsHtml;
    private executeBackupTask;
    private calculateTotalWords;
    private retryTask;
    private calculateNextRun;
    sendNotification(type: Notification['type'], title: string, message: string): Promise<void>;
    private sendExternalNotification;
    private sendTelegram;
    private sendFeishu;
    private sendWebhook;
    private generateSignature;
    getNotifications(unreadOnly?: boolean): Notification[];
    markNotificationRead(notificationId: string): Promise<void>;
    clearNotifications(): Promise<void>;
    isActive(): boolean;
    private saveTasks;
    private generateId;
}
export default DaemonService;
//# sourceMappingURL=DaemonService.d.ts.map