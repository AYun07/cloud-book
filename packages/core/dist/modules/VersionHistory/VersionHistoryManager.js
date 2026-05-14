"use strict";
/**
 * 版本历史管理器
 * 管理项目和章节的版本历史
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionHistoryManager = void 0;
const fs = __importStar(require("fs"));
class VersionHistoryManager {
    versions = new Map();
    branches = new Map();
    currentBranch = new Map();
    storagePath;
    autoSaveConfig = {
        enabled: true,
        intervalMs: 30000,
        watchChanges: true
    };
    autoSaveState = {
        isRunning: false,
        lastSaveTime: null,
        lastSaveProjectId: null,
        pendingChanges: new Set(),
        saveInProgress: false,
        errorCount: 0
    };
    autoSaveTimers = new Map();
    fileWatchers = new Map();
    constructor(storagePath = './data/versioning', autoSaveConfig) {
        this.storagePath = storagePath;
        if (autoSaveConfig) {
            this.autoSaveConfig = { ...this.autoSaveConfig, ...autoSaveConfig };
        }
    }
    async initialize(projectId) {
        this.versions.set(projectId, []);
        this.branches.set(projectId, []);
        this.currentBranch.set(projectId, 'main');
    }
    createVersion(projectId, content, options) {
        const projectVersions = this.versions.get(projectId) || [];
        const branch = options?.branch || this.currentBranch.get(projectId) || 'main';
        const branchVersions = projectVersions.filter(v => v.branch === branch);
        const maxVersion = branchVersions.reduce((max, v) => Math.max(max, v.version), 0);
        const version = {
            id: this.generateId(),
            version: maxVersion + 1,
            timestamp: new Date(),
            content,
            summary: options?.summary,
            author: options?.author,
            tags: options?.tags,
            metadata: options?.metadata,
            branch
        };
        projectVersions.push(version);
        this.versions.set(projectId, projectVersions);
        this.markPendingChange(projectId);
        return version;
    }
    getVersion(projectId, versionId) {
        const projectVersions = this.versions.get(projectId) || [];
        return projectVersions.find(v => v.id === versionId);
    }
    getVersionByNumber(projectId, versionNumber, branch) {
        const projectVersions = this.versions.get(projectId) || [];
        const targetBranch = branch || this.currentBranch.get(projectId) || 'main';
        return projectVersions.find(v => v.version === versionNumber && v.branch === targetBranch);
    }
    getVersionHistory(projectId, options) {
        const projectVersions = this.versions.get(projectId) || [];
        let filtered = projectVersions;
        if (options?.branch) {
            filtered = filtered.filter(v => v.branch === options.branch);
        }
        else {
            const currentBranchName = this.currentBranch.get(projectId) || 'main';
            filtered = filtered.filter(v => v.branch === currentBranchName);
        }
        if (options?.tags && options.tags.length > 0) {
            filtered = filtered.filter(v => v.tags && options.tags.some(tag => v.tags.includes(tag)));
        }
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const offset = options?.offset || 0;
        const limit = options?.limit || filtered.length;
        return filtered.slice(offset, offset + limit);
    }
    getLatestVersion(projectId) {
        const history = this.getVersionHistory(projectId, { limit: 1 });
        return history[0];
    }
    createBranch(projectId, name, description, fromVersionId) {
        const projectBranches = this.branches.get(projectId) || [];
        if (projectBranches.some(b => b.name === name)) {
            throw new Error(`Branch ${name} already exists`);
        }
        let headVersionId;
        if (fromVersionId) {
            headVersionId = fromVersionId;
        }
        else {
            const latest = this.getLatestVersion(projectId);
            headVersionId = latest?.id || '';
        }
        const branch = {
            id: this.generateId(),
            name,
            description,
            createdAt: new Date(),
            headVersionId
        };
        projectBranches.push(branch);
        this.branches.set(projectId, projectBranches);
        this.markPendingChange(projectId);
        return branch;
    }
    switchBranch(projectId, branchName) {
        const projectBranches = this.branches.get(projectId) || [];
        const branch = projectBranches.find(b => b.name === branchName);
        if (!branch) {
            throw new Error(`Branch ${branchName} not found`);
        }
        this.currentBranch.set(projectId, branchName);
        this.markPendingChange(projectId);
    }
    getBranches(projectId) {
        return this.branches.get(projectId) || [];
    }
    getCurrentBranch(projectId) {
        return this.currentBranch.get(projectId) || 'main';
    }
    deleteBranch(projectId, branchName) {
        if (branchName === 'main') {
            throw new Error('Cannot delete main branch');
        }
        const projectBranches = this.branches.get(projectId) || [];
        const filtered = projectBranches.filter(b => b.name !== branchName);
        if (filtered.length === projectBranches.length) {
            return false;
        }
        this.branches.set(projectId, filtered);
        const projectVersions = this.versions.get(projectId) || [];
        const remainingVersions = projectVersions.filter(v => v.branch !== branchName);
        this.versions.set(projectId, remainingVersions);
        if (this.currentBranch.get(projectId) === branchName) {
            this.currentBranch.set(projectId, 'main');
        }
        this.markPendingChange(projectId);
        return true;
    }
    compareVersions(projectId, versionId1, versionId2) {
        const v1 = this.getVersion(projectId, versionId1);
        const v2 = this.getVersion(projectId, versionId2);
        if (!v1 || !v2) {
            throw new Error('Version not found');
        }
        const lines1 = v1.content.split('\n');
        const lines2 = v2.content.split('\n');
        const diffs = [];
        const lcs = this.longestCommonSubsequence(lines1, lines2);
        let idx1 = 0;
        let idx2 = 0;
        let lineNum = 1;
        for (const match of lcs) {
            while (idx1 < match.index1) {
                diffs.push({
                    type: 'remove',
                    lineNumber: lineNum++,
                    oldContent: lines1[idx1]
                });
                idx1++;
            }
            while (idx2 < match.index2) {
                diffs.push({
                    type: 'add',
                    lineNumber: lineNum,
                    newContent: lines2[idx2]
                });
                idx2++;
            }
            diffs.push({
                type: 'modify',
                lineNumber: lineNum,
                oldContent: lines1[idx1],
                newContent: lines2[idx2]
            });
            idx1++;
            idx2++;
            lineNum++;
        }
        while (idx1 < lines1.length) {
            diffs.push({
                type: 'remove',
                lineNumber: lineNum,
                oldContent: lines1[idx1]
            });
            idx1++;
            lineNum++;
        }
        while (idx2 < lines2.length) {
            diffs.push({
                type: 'add',
                lineNumber: lineNum,
                newContent: lines2[idx2]
            });
            idx2++;
            lineNum++;
        }
        return diffs;
    }
    longestCommonSubsequence(arr1, arr2) {
        const m = arr1.length;
        const n = arr2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }
                else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        const result = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (arr1[i - 1] === arr2[j - 1]) {
                result.unshift({ index1: i - 1, index2: j - 1 });
                i--;
                j--;
            }
            else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            }
            else {
                j--;
            }
        }
        return result;
    }
    getChangeStats(projectId, fromVersionId, toVersionId) {
        const from = fromVersionId ? this.getVersion(projectId, fromVersionId) : this.getVersionHistory(projectId, { limit: 2 })[1];
        const to = toVersionId ? this.getVersion(projectId, toVersionId) : this.getLatestVersion(projectId);
        if (!from || !to) {
            return { additions: 0, deletions: 0, modifications: 0 };
        }
        const diffs = this.compareVersions(projectId, from.id, to.id);
        return {
            additions: diffs.filter(d => d.type === 'add').length,
            deletions: diffs.filter(d => d.type === 'remove').length,
            modifications: diffs.filter(d => d.type === 'modify').length
        };
    }
    restoreVersion(projectId, versionId) {
        const version = this.getVersion(projectId, versionId);
        if (!version) {
            throw new Error('Version not found');
        }
        return this.createVersion(projectId, version.content, {
            summary: `Restored from version ${version.version}`,
            tags: ['restored'],
            branch: version.branch
        });
    }
    tagVersion(projectId, versionId, tag) {
        const projectVersions = this.versions.get(projectId) || [];
        const version = projectVersions.find(v => v.id === versionId);
        if (!version) {
            throw new Error('Version not found');
        }
        if (!version.tags) {
            version.tags = [];
        }
        if (!version.tags.includes(tag)) {
            version.tags.push(tag);
        }
        this.markPendingChange(projectId);
    }
    removeTag(projectId, versionId, tag) {
        const projectVersions = this.versions.get(projectId) || [];
        const version = projectVersions.find(v => v.id === versionId);
        if (version && version.tags) {
            version.tags = version.tags.filter(t => t !== tag);
            this.markPendingChange(projectId);
        }
    }
    getVersionsByTag(projectId, tag) {
        const projectVersions = this.versions.get(projectId) || [];
        return projectVersions.filter(v => v.tags && v.tags.includes(tag));
    }
    generateId() {
        return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    markPendingChange(projectId) {
        if (!this.autoSaveState.pendingChanges.has(projectId)) {
            this.autoSaveState.pendingChanges.add(projectId);
        }
    }
    startAutoSave(projectId) {
        if (!this.autoSaveConfig.enabled) {
            return;
        }
        if (this.autoSaveTimers.has(projectId)) {
            this.stopAutoSave(projectId);
        }
        if (this.autoSaveConfig.watchChanges) {
            this.startFileWatcher(projectId);
        }
        const timer = setInterval(async () => {
            if (this.autoSaveState.pendingChanges.has(projectId)) {
                await this.performAutoSave(projectId);
            }
        }, this.autoSaveConfig.intervalMs);
        this.autoSaveTimers.set(projectId, timer);
        this.autoSaveState.isRunning = true;
    }
    stopAutoSave(projectId) {
        const timer = this.autoSaveTimers.get(projectId);
        if (timer) {
            clearInterval(timer);
            this.autoSaveTimers.delete(projectId);
        }
        this.stopFileWatcher(projectId);
    }
    stopAllAutoSave() {
        Array.from(this.autoSaveTimers.keys()).forEach(projectId => {
            this.stopAutoSave(projectId);
        });
        this.autoSaveState.isRunning = false;
    }
    async performAutoSave(projectId) {
        if (this.autoSaveState.saveInProgress) {
            return;
        }
        try {
            this.autoSaveState.saveInProgress = true;
            this.autoSaveState.pendingChanges.delete(projectId);
            if (this.autoSaveConfig.onAutoSaveStart) {
                this.autoSaveConfig.onAutoSaveStart();
            }
            await this.save(projectId);
            this.autoSaveState.lastSaveTime = new Date();
            this.autoSaveState.lastSaveProjectId = projectId;
            if (this.autoSaveConfig.onAutoSaveComplete) {
                this.autoSaveConfig.onAutoSaveComplete(projectId);
            }
        }
        catch (error) {
            this.autoSaveState.errorCount++;
            if (this.autoSaveConfig.onAutoSaveError) {
                this.autoSaveConfig.onAutoSaveError(projectId, error);
            }
            console.error(`Auto-save failed for project ${projectId}:`, error);
        }
        finally {
            this.autoSaveState.saveInProgress = false;
        }
    }
    startFileWatcher(projectId) {
        const dir = `${this.storagePath}/${projectId}`;
        if (!fs.existsSync(dir)) {
            return;
        }
        if (this.fileWatchers.has(projectId)) {
            return;
        }
        try {
            const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
                if (filename && (filename.endsWith('.json') || filename.endsWith('.md'))) {
                    this.handleExternalChange(projectId, filename, eventType);
                }
            });
            this.fileWatchers.set(projectId, watcher);
        }
        catch (error) {
            console.error(`Failed to start file watcher for project ${projectId}:`, error);
        }
    }
    stopFileWatcher(projectId) {
        const watcher = this.fileWatchers.get(projectId);
        if (watcher) {
            watcher.close();
            this.fileWatchers.delete(projectId);
        }
    }
    handleExternalChange(projectId, filename, eventType) {
        if (eventType === 'change' || eventType === 'rename') {
            if (this.autoSaveConfig.onExternalChange) {
                this.autoSaveConfig.onExternalChange(projectId);
            }
        }
    }
    async save(projectId) {
        try {
            const dir = `${this.storagePath}/${projectId}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(`${dir}/versions.json`, JSON.stringify(this.versions.get(projectId) || [], null, 2));
            fs.writeFileSync(`${dir}/branches.json`, JSON.stringify(this.branches.get(projectId) || [], null, 2));
            fs.writeFileSync(`${dir}/current_branch.json`, JSON.stringify(this.currentBranch.get(projectId) || 'main'));
        }
        catch (error) {
            console.error('Failed to save version history:', error);
            throw error;
        }
    }
    async load(projectId) {
        try {
            const dir = `${this.storagePath}/${projectId}`;
            if (fs.existsSync(`${dir}/versions.json`)) {
                const data = fs.readFileSync(`${dir}/versions.json`, 'utf-8');
                this.versions.set(projectId, JSON.parse(data));
            }
            if (fs.existsSync(`${dir}/branches.json`)) {
                const data = fs.readFileSync(`${dir}/branches.json`, 'utf-8');
                this.branches.set(projectId, JSON.parse(data));
            }
            if (fs.existsSync(`${dir}/current_branch.json`)) {
                const data = fs.readFileSync(`${dir}/current_branch.json`, 'utf-8');
                this.currentBranch.set(projectId, JSON.parse(data));
            }
        }
        catch (error) {
            console.error('Failed to load version history:', error);
            throw error;
        }
    }
    getAutoSaveConfig() {
        return { ...this.autoSaveConfig };
    }
    updateAutoSaveConfig(config) {
        this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
    }
    getAutoSaveState() {
        return {
            ...this.autoSaveState,
            pendingChanges: new Set(this.autoSaveState.pendingChanges)
        };
    }
    triggerAutoSave(projectId) {
        this.markPendingChange(projectId);
    }
    destroy() {
        this.stopAllAutoSave();
        Array.from(this.fileWatchers.values()).forEach(watcher => {
            watcher.close();
        });
        this.fileWatchers.clear();
    }
}
exports.VersionHistoryManager = VersionHistoryManager;
exports.default = VersionHistoryManager;
//# sourceMappingURL=VersionHistoryManager.js.map