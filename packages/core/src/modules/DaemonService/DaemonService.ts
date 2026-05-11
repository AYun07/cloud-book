/**
 * 守护进程服务
 * 后台任务调度、通知推送
 */

import { DaemonConfig, NotificationConfig, NovelProject } from '../../types';
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

export class DaemonService {
  private config: DaemonConfig;
  private tasks: Map<string, ScheduledTask> = new Map();
  private notifications: Notification[] = [];
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private llmManager: LLMManager;
  private storagePath: string;

  constructor(config: DaemonConfig, llmManager: LLMManager, storagePath: string = './data/daemon') {
    this.config = config;
    this.llmManager = llmManager;
    this.storagePath = storagePath;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const interval = (this.config.intervalMinutes || 5) * 60 * 1000;
    
    this.intervalId = setInterval(() => {
      this.processTasks();
    }, interval);

    this.sendNotification('info', '守护进程已启动', `每${this.config.intervalMinutes || 5}分钟检查一次任务`);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.sendNotification('info', '守护进程已停止', '所有后台任务已暂停');
  }

  async addTask(task: Omit<ScheduledTask, 'id' | 'status' | 'nextRun'>): Promise<ScheduledTask> {
    const newTask: ScheduledTask = {
      ...task,
      id: this.generateId(),
      status: 'active',
      nextRun: this.calculateNextRun(task.schedule)
    };

    this.tasks.set(newTask.id, newTask);
    await this.saveTasks();
    
    this.sendNotification('success', '任务已添加', `任务 "${task.type}" 已添加到调度队列`);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const updatedTask = { ...task, ...updates };
    if (updates.schedule) {
      updatedTask.nextRun = this.calculateNextRun(updates.schedule);
    }
    
    this.tasks.set(taskId, updatedTask);
    await this.saveTasks();
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      await this.saveTasks();
    }
    return deleted;
  }

  async getTask(taskId: string): Promise<ScheduledTask | undefined> {
    return this.tasks.get(taskId);
  }

  async getAllTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.tasks.values());
  }

  async pauseTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'paused';
      await this.saveTasks();
    }
  }

  async resumeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'active';
      task.nextRun = this.calculateNextRun(task.schedule);
      await this.saveTasks();
    }
  }

  async executeTaskNow(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    try {
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.schedule);
      
      const result = await this.executeTaskType(task);
      task.result = result;
      
      await this.saveTasks();
      this.sendNotification('success', '任务执行成功', `任务 "${task.type}" 已完成`);
      
      return result;
    } catch (error: any) {
      if (this.config.autoRetry && task.result !== undefined) {
        return this.retryTask(task, error);
      }
      this.sendNotification('error', '任务执行失败', error.message);
      throw error;
    }
  }

  private async processTasks(): Promise<void> {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
      if (task.status !== 'active') continue;
      if (!task.nextRun || task.nextRun > now) continue;

      try {
        await this.executeTaskNow(taskId);
      } catch (error) {
        console.error(`Task ${taskId} failed:`, error);
      }
    }
  }

  private async executeTaskType(task: ScheduledTask): Promise<any> {
    switch (task.type) {
      case 'write':
        return this.executeWriteTask(task.params);
      case 'audit':
        return this.executeAuditTask(task.params);
      case 'export':
        return this.executeExportTask(task.params);
      case 'backup':
        return this.executeBackupTask(task.params);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async executeWriteTask(params: Record<string, any>): Promise<any> {
    const { projectId, chapterNumber, autoHumanize } = params;
    
    const prompt = `请根据以下信息生成小说章节：

项目ID：${projectId}
章节号：${chapterNumber}
去AI味：${autoHumanize ? '是' : '否'}

[实际实现中，这里会调用WritingPipeline生成章节]`;

    return { success: true, projectId, chapterNumber, timestamp: new Date() };
  }

  private async executeAuditTask(params: Record<string, any>): Promise<any> {
    const { projectId, chapterId } = params;
    
    return { success: true, projectId, chapterId, timestamp: new Date() };
  }

  private async executeExportTask(params: Record<string, any>): Promise<any> {
    const { projectId, format } = params;
    
    return { success: true, projectId, format, timestamp: new Date() };
  }

  private async executeBackupTask(params: Record<string, any>): Promise<any> {
    const { projectId, destination } = params;
    
    return { success: true, projectId, destination, timestamp: new Date() };
  }

  private async retryTask(task: ScheduledTask, error: any): Promise<any> {
    const maxRetries = this.config.maxRetries || 3;
    const currentRetries = (task.result as any)?._retryCount || 0;
    
    if (currentRetries < maxRetries) {
      this.sendNotification('warning', '任务重试中', `第${currentRetries + 1}次重试`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.executeTaskNow(task.id);
    }
    
    throw error;
  }

  private calculateNextRun(schedule: string): Date {
    const [minute, hour, day, month, dayOfWeek] = schedule.split(' ');
    const now = new Date();
    const next = new Date(now);
    
    if (minute && minute !== '*') next.setMinutes(parseInt(minute));
    if (hour && hour !== '*') next.setHours(parseInt(hour), 0, 0, 0);
    
    if (dayOfWeek && dayOfWeek !== '*') {
      const targetDay = parseInt(dayOfWeek);
      const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
      next.setDate(now.getDate() + daysUntil);
    }
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  async sendNotification(
    type: Notification['type'],
    title: string,
    message: string
  ): Promise<void> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    this.notifications.push(notification);
    
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }

    if (this.config.notifications) {
      await this.sendExternalNotification(this.config.notifications, notification);
    }
  }

  private async sendExternalNotification(
    config: NotificationConfig,
    notification: Notification
  ): Promise<void> {
    if (config.telegram) {
      await this.sendTelegram(config.telegram, notification);
    }
    
    if (config.feishu) {
      await this.sendFeishu(config.feishu, notification);
    }
    
    if (config.webhook) {
      await this.sendWebhook(config.webhook, notification);
    }
  }

  private async sendTelegram(config: any, notification: Notification): Promise<void> {
    const message = `*${notification.title}*\n${notification.message}`;
    
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${config.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        }
      );
      
      if (!response.ok) {
        console.error('Telegram send failed:', await response.text());
      }
    } catch (error) {
      console.error('Telegram send error:', error);
    }
  }

  private async sendFeishu(config: any, notification: Notification): Promise<void> {
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'text',
          content: {
            text: `${notification.title}\n${notification.message}`
          }
        })
      });
      
      if (!response.ok) {
        console.error('Feishu send failed:', await response.text());
      }
    } catch (error) {
      console.error('Feishu send error:', error);
    }
  }

  private async sendWebhook(config: any, notification: Notification): Promise<void> {
    try {
      const body: Record<string, any> = {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.timestamp.toISOString()
      };

      if (config.secret) {
        body.signature = this.generateSignature(JSON.stringify(body), config.secret);
      }

      const response = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        console.error('Webhook send failed:', await response.text());
      }
    } catch (error) {
      console.error('Webhook send error:', error);
    }
  }

  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  getNotifications(unreadOnly: boolean = false): Notification[] {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async clearNotifications(): Promise<void> {
    this.notifications = [];
  }

  isActive(): boolean {
    return this.isRunning;
  }

  private async saveTasks(): Promise<void> {
    try {
      const tasks = Array.from(this.tasks.values());
      const fs = require('fs');
      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
      }
      fs.writeFileSync(
        `${this.storagePath}/tasks.json`,
        JSON.stringify(tasks, null, 2)
      );
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  private generateId(): string {
    return `daemon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default DaemonService;
