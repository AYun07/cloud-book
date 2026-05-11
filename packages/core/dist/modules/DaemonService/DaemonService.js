"use strict";
/**
 * 守护进程服务
 * 后台任务调度、通知推送
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaemonService = void 0;
class DaemonService {
    config;
    tasks = new Map();
    notifications = [];
    isRunning = false;
    intervalId;
    llmManager;
    storagePath;
    constructor(config, llmManager, storagePath = './data/daemon') {
        this.config = config;
        this.llmManager = llmManager;
        this.storagePath = storagePath;
    }
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        const interval = (this.config.intervalMinutes || 5) * 60 * 1000;
        this.intervalId = setInterval(() => {
            this.processTasks();
        }, interval);
        this.sendNotification('info', '守护进程已启动', `每${this.config.intervalMinutes || 5}分钟检查一次任务`);
    }
    async stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        this.sendNotification('info', '守护进程已停止', '所有后台任务已暂停');
    }
    async addTask(task) {
        const newTask = {
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
    async updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = { ...task, ...updates };
        if (updates.schedule) {
            updatedTask.nextRun = this.calculateNextRun(updates.schedule);
        }
        this.tasks.set(taskId, updatedTask);
        await this.saveTasks();
        return updatedTask;
    }
    async deleteTask(taskId) {
        const deleted = this.tasks.delete(taskId);
        if (deleted) {
            await this.saveTasks();
        }
        return deleted;
    }
    async getTask(taskId) {
        return this.tasks.get(taskId);
    }
    async getAllTasks() {
        return Array.from(this.tasks.values());
    }
    async pauseTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'paused';
            await this.saveTasks();
        }
    }
    async resumeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'active';
            task.nextRun = this.calculateNextRun(task.schedule);
            await this.saveTasks();
        }
    }
    async executeTaskNow(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            throw new Error('Task not found');
        try {
            task.lastRun = new Date();
            task.nextRun = this.calculateNextRun(task.schedule);
            const result = await this.executeTaskType(task);
            task.result = result;
            await this.saveTasks();
            this.sendNotification('success', '任务执行成功', `任务 "${task.type}" 已完成`);
            return result;
        }
        catch (error) {
            if (this.config.autoRetry && task.result !== undefined) {
                return this.retryTask(task, error);
            }
            this.sendNotification('error', '任务执行失败', error.message);
            throw error;
        }
    }
    async processTasks() {
        const now = new Date();
        for (const [taskId, task] of this.tasks) {
            if (task.status !== 'active')
                continue;
            if (!task.nextRun || task.nextRun > now)
                continue;
            try {
                await this.executeTaskNow(taskId);
            }
            catch (error) {
                console.error(`Task ${taskId} failed:`, error);
            }
        }
    }
    async executeTaskType(task) {
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
    async executeWriteTask(params) {
        const { projectId, chapterNumber, autoHumanize } = params;
        const prompt = `请根据以下信息生成小说章节：

项目ID：${projectId}
章节号：${chapterNumber}
去AI味：${autoHumanize ? '是' : '否'}

[实际实现中，这里会调用WritingPipeline生成章节]`;
        return { success: true, projectId, chapterNumber, timestamp: new Date() };
    }
    async executeAuditTask(params) {
        const { projectId, chapterId } = params;
        return { success: true, projectId, chapterId, timestamp: new Date() };
    }
    async executeExportTask(params) {
        const { projectId, format } = params;
        return { success: true, projectId, format, timestamp: new Date() };
    }
    async executeBackupTask(params) {
        const { projectId, destination } = params;
        return { success: true, projectId, destination, timestamp: new Date() };
    }
    async retryTask(task, error) {
        const maxRetries = this.config.maxRetries || 3;
        const currentRetries = task.result?._retryCount || 0;
        if (currentRetries < maxRetries) {
            this.sendNotification('warning', '任务重试中', `第${currentRetries + 1}次重试`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return this.executeTaskNow(task.id);
        }
        throw error;
    }
    calculateNextRun(schedule) {
        const [minute, hour, day, month, dayOfWeek] = schedule.split(' ');
        const now = new Date();
        const next = new Date(now);
        if (minute && minute !== '*')
            next.setMinutes(parseInt(minute));
        if (hour && hour !== '*')
            next.setHours(parseInt(hour), 0, 0, 0);
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
    async sendNotification(type, title, message) {
        const notification = {
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
    async sendExternalNotification(config, notification) {
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
    async sendTelegram(config, notification) {
        const message = `*${notification.title}*\n${notification.message}`;
        try {
            const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: config.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            if (!response.ok) {
                console.error('Telegram send failed:', await response.text());
            }
        }
        catch (error) {
            console.error('Telegram send error:', error);
        }
    }
    async sendFeishu(config, notification) {
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
        }
        catch (error) {
            console.error('Feishu send error:', error);
        }
    }
    async sendWebhook(config, notification) {
        try {
            const body = {
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
        }
        catch (error) {
            console.error('Webhook send error:', error);
        }
    }
    generateSignature(payload, secret) {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }
    getNotifications(unreadOnly = false) {
        if (unreadOnly) {
            return this.notifications.filter(n => !n.read);
        }
        return this.notifications;
    }
    async markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }
    async clearNotifications() {
        this.notifications = [];
    }
    isActive() {
        return this.isRunning;
    }
    async saveTasks() {
        try {
            const tasks = Array.from(this.tasks.values());
            const fs = require('fs');
            if (!fs.existsSync(this.storagePath)) {
                fs.mkdirSync(this.storagePath, { recursive: true });
            }
            fs.writeFileSync(`${this.storagePath}/tasks.json`, JSON.stringify(tasks, null, 2));
        }
        catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }
    generateId() {
        return `daemon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.DaemonService = DaemonService;
exports.default = DaemonService;
//# sourceMappingURL=DaemonService.js.map