"use strict";
/**
 * 守护进程服务
 * 后台任务调度、通知推送
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaemonService = void 0;
const storage_1 = require("../../utils/storage");
class DaemonService {
    config;
    tasks = new Map();
    notifications = [];
    isRunning = false;
    intervalId;
    llmManager;
    storage;
    storagePath;
    constructor(config, llmManager, storagePath = './data/daemon') {
        this.config = config;
        this.llmManager = llmManager;
        this.storagePath = storagePath;
        this.storage = new storage_1.UnifiedStorage({ basePath: storagePath });
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
        try {
            const projectData = await this.loadProjectData(projectId);
            if (!projectData) {
                throw new Error(`项目 ${projectId} 不存在`);
            }
            const previousChapter = projectData.chapters?.find((c) => c.index === chapterNumber - 1);
            const contextPrompt = this.buildChapterContext(projectData, previousChapter);
            const writingPrompt = `${contextPrompt}

请生成第${chapterNumber}章内容。要求：
1. 符合项目设定的世界观和角色
2. 与前文保持连贯
3. ${autoHumanize ? '使用自然的写作风格，避免AI痕迹' : '保持文笔流畅'}
4. 字数控制在2000-3000字`;
            const content = await this.llmManager.complete(writingPrompt, {
                task: 'generation',
                temperature: 0.8,
                maxTokens: 4000
            });
            const chapter = {
                id: `ch_${Date.now()}`,
                projectId,
                index: chapterNumber,
                title: this.generateChapterTitle(chapterNumber, content),
                content: autoHumanize ? await this.humanizeContent(content) : content,
                wordCount: this.countWords(content),
                createdAt: new Date(),
                status: 'draft'
            };
            return {
                success: true,
                projectId,
                chapterNumber,
                chapter,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                projectId,
                chapterNumber,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    async loadProjectData(projectId) {
        try {
            const metaPath = `projects/${projectId}/meta.json`;
            if (await this.storage.exists(metaPath)) {
                const metaContent = await this.storage.read(metaPath);
                const meta = JSON.parse(metaContent);
                const chapters = [];
                const chaptersIndexPath = `projects/${projectId}/chapters/index.json`;
                if (await this.storage.exists(chaptersIndexPath)) {
                    const indexContent = await this.storage.read(chaptersIndexPath);
                    const index = JSON.parse(indexContent);
                    for (const chapterId of index.chapters || []) {
                        const chapterPath = `projects/${projectId}/chapters/${chapterId}.json`;
                        if (await this.storage.exists(chapterPath)) {
                            const chapterContent = await this.storage.read(chapterPath);
                            chapters.push(JSON.parse(chapterContent));
                        }
                    }
                }
                const characters = [];
                const charactersIndexPath = `projects/${projectId}/characters/index.json`;
                if (await this.storage.exists(charactersIndexPath)) {
                    const charactersContent = await this.storage.read(charactersIndexPath);
                    characters.push(...JSON.parse(charactersContent).characters || []);
                }
                return {
                    id: meta.id,
                    title: meta.title,
                    genre: meta.genre,
                    worldInfo: meta.worldSetting ? JSON.stringify(meta.worldSetting, null, 2) : '',
                    characters: characters.map(c => c.name).join(', '),
                    chapters: chapters.map(c => ({
                        id: c.id,
                        index: c.number,
                        title: c.title,
                        content: c.content,
                        wordCount: c.wordCount
                    })),
                    metadata: meta
                };
            }
            return null;
        }
        catch (error) {
            console.error(`Failed to load project ${projectId}:`, error);
            return null;
        }
    }
    buildChapterContext(projectData, previousChapter) {
        const contextParts = [];
        if (projectData.worldInfo) {
            contextParts.push(`【世界观设定】\n${projectData.worldInfo}`);
        }
        if (projectData.characters) {
            contextParts.push(`【主要角色】\n${projectData.characters}`);
        }
        if (previousChapter) {
            contextParts.push(`【前情提要】\n${previousChapter.content.slice(-500)}`);
        }
        return contextParts.join('\n\n');
    }
    generateChapterTitle(chapterNumber, content) {
        const firstLine = content.split('\n')[0];
        if (firstLine && firstLine.length < 30) {
            return firstLine.replace(/^#+\s*/, '');
        }
        return `第${chapterNumber}章`;
    }
    async humanizeContent(content) {
        const antiPatterns = [
            { from: /首先/gi, to: '先' },
            { from: /其次/gi, to: '然后' },
            { from: /最后/gi, to: '最后' },
            { from: /然而/gi, to: '可是' },
            { from: /因此/gi, to: '所以' },
            { from: /综上所述/gi, to: '总的说来' },
            { from: /值得注意的是/gi, to: '' },
            { from: /毋庸置疑/gi, to: '不用说' }
        ];
        let result = content;
        for (const { from, to } of antiPatterns) {
            result = result.replace(from, to);
        }
        return result;
    }
    countWords(text) {
        const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const english = (text.match(/[a-zA-Z]+/g) || []).length;
        return chinese + english;
    }
    async executeAuditTask(params) {
        const { projectId, chapterId, content } = params;
        try {
            const auditPrompt = `请审计以下小说章节的质量：

${content || '章节内容未提供'}

请从以下维度评分（0-100）：
1. 语法正确性
2. 叙事连贯性
3. 角色塑造
4. 情感表达
5. 节奏控制
6. 对话自然度
7. 细节描写

请以JSON格式输出评分和建议。`;
            const result = await this.llmManager.complete(auditPrompt, {
                task: 'analysis',
                temperature: 0.3,
                maxTokens: 2000
            });
            const parsedResult = this.parseAuditResult(result);
            return {
                success: true,
                projectId,
                chapterId,
                audit: parsedResult,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                projectId,
                chapterId,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    parseAuditResult(result) {
        try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch { }
        return { rawResult: result, score: 0, issues: [] };
    }
    async executeExportTask(params) {
        const { projectId, format } = params;
        try {
            const projectData = await this.loadProjectData(projectId);
            if (!projectData) {
                throw new Error(`项目 ${projectId} 不存在`);
            }
            let exportedContent;
            let fileExtension;
            switch (format) {
                case 'txt':
                    exportedContent = this.exportAsTxt(projectData);
                    fileExtension = 'txt';
                    break;
                case 'markdown':
                    exportedContent = this.exportAsMarkdown(projectData);
                    fileExtension = 'md';
                    break;
                case 'html':
                    exportedContent = this.exportAsHtml(projectData);
                    fileExtension = 'html';
                    break;
                case 'json':
                    exportedContent = JSON.stringify(projectData, null, 2);
                    fileExtension = 'json';
                    break;
                default:
                    throw new Error(`不支持的格式: ${format}`);
            }
            const fileName = `${projectData.title || 'untitled'}_${Date.now()}.${fileExtension}`;
            return {
                success: true,
                projectId,
                format,
                fileName,
                content: exportedContent,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                projectId,
                format,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    exportAsTxt(projectData) {
        const lines = [];
        lines.push(`# ${projectData.title || '无标题'}`);
        lines.push('');
        if (projectData.chapters) {
            for (const chapter of projectData.chapters) {
                lines.push(`\n## ${chapter.title || `第${chapter.index}章`}`);
                lines.push(chapter.content);
                lines.push('');
            }
        }
        return lines.join('\n');
    }
    exportAsMarkdown(projectData) {
        const lines = [];
        lines.push(`# ${projectData.title || '无标题'}`);
        lines.push('');
        if (projectData.worldInfo) {
            lines.push('## 世界观设定');
            lines.push(projectData.worldInfo);
            lines.push('');
        }
        if (projectData.characters) {
            lines.push('## 角色设定');
            lines.push(projectData.characters);
            lines.push('');
        }
        if (projectData.chapters) {
            for (const chapter of projectData.chapters) {
                lines.push(`## ${chapter.title || `第${chapter.index}章`}`);
                lines.push(chapter.content);
                lines.push('');
            }
        }
        return lines.join('\n');
    }
    escapeHtml(text) {
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return text.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
    }
    exportAsHtml(projectData) {
        const escapeHtml = this.escapeHtml;
        const markdown = this.exportAsMarkdown(projectData);
        const escapeInline = (text) => text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>');
        const bodyContent = markdown
            .replace(/^#\s+(.+)$/gm, (_, title) => `<h1>${escapeHtml(title)}</h1>`)
            .replace(/^##\s+(.+)$/gm, (_, title) => `<h2>${escapeHtml(title)}</h2>`)
            .replace(/^###\s+(.+)$/gm, (_, title) => `<h3>${escapeHtml(title)}</h3>`)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(projectData.title || '无标题')}</title>
  <style>
    body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    p { line-height: 1.8; text-align: justify; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    strong { color: #333; }
  </style>
</head>
<body>
<p>${bodyContent}</p>
</body>
</html>`;
    }
    async executeBackupTask(params) {
        const { projectId, destination } = params;
        try {
            const projectData = await this.loadProjectData(projectId);
            if (!projectData) {
                throw new Error(`项目 ${projectId} 不存在`);
            }
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                projectId,
                data: projectData,
                metadata: {
                    chapterCount: projectData.chapters?.length || 0,
                    wordCount: this.calculateTotalWords(projectData),
                    lastModified: new Date().toISOString()
                }
            };
            const backupJson = JSON.stringify(backupData, null, 2);
            const backupFileName = `backup_${projectId}_${Date.now()}.json`;
            return {
                success: true,
                projectId,
                destination,
                backupFileName,
                backupContent: backupJson,
                metadata: backupData.metadata,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                projectId,
                destination,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    calculateTotalWords(projectData) {
        if (!projectData.chapters)
            return 0;
        return projectData.chapters.reduce((sum, ch) => sum + (ch.wordCount || this.countWords(ch.content || '')), 0);
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