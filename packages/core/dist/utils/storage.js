"use strict";
/**
 * Cloud Book - 统一存储层
 * 支持并发安全、事务、备份
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
exports.UnifiedStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const errors_js_1 = require("./errors.js");
class FileLock {
    locks = new Map();
    async acquire(filePath) {
        while (this.locks.has(filePath)) {
            await this.locks.get(filePath).promise;
        }
        let resolveLock;
        const promise = new Promise(resolve => {
            resolveLock = resolve;
        });
        this.locks.set(filePath, { resolve: resolveLock, promise });
        return {
            release: () => {
                const lock = this.locks.get(filePath);
                if (lock) {
                    lock.resolve();
                    this.locks.delete(filePath);
                }
            }
        };
    }
    isLocked(filePath) {
        return this.locks.has(filePath);
    }
}
class UnifiedStorage {
    basePath;
    baseResolved;
    enableBackup;
    maxBackups;
    transactionTimeout;
    encryptionKey;
    fileLock;
    transactions = new Map();
    cleanupInterval;
    constructor(config = {}) {
        this.basePath = config.basePath || './data/cloudbook';
        this.baseResolved = path.resolve(this.basePath);
        this.enableBackup = config.enableBackup ?? true;
        this.maxBackups = config.maxBackups || 5;
        this.transactionTimeout = config.transactionTimeout || 30000;
        this.fileLock = new FileLock();
        if (config.encryptionKey) {
            this.encryptionKey = Buffer.from(config.encryptionKey, 'hex');
            if (this.encryptionKey.length !== 32) {
                throw new errors_js_1.StorageError('Encryption key must be 32 bytes (64 hex characters)');
            }
        }
        this.ensureDirectory(this.basePath);
        this.startCleanupInterval();
    }
    ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    encrypt(content) {
        if (!this.encryptionKey)
            return content;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    decrypt(encryptedContent) {
        if (!this.encryptionKey || !encryptedContent.includes(':'))
            return encryptedContent;
        const [ivHex, authTagHex, encrypted] = encryptedContent.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    getFullPath(relativePath) {
        const fullPath = path.resolve(this.basePath, relativePath);
        if (!fullPath.startsWith(this.baseResolved + path.sep) && fullPath !== this.baseResolved) {
            throw new errors_js_1.StorageError('Path traversal detected', { path: relativePath });
        }
        return fullPath;
    }
    createBackup(filePath) {
        if (!this.enableBackup || !fs.existsSync(filePath))
            return null;
        const backupDir = path.join(this.basePath, '.backups');
        this.ensureDirectory(backupDir);
        const timestamp = Date.now();
        const backupPath = path.join(backupDir, `${path.basename(filePath)}.${timestamp}.bak`);
        fs.copyFileSync(filePath, backupPath);
        this.cleanupOldBackups(backupDir);
        return backupPath;
    }
    cleanupOldBackups(backupDir) {
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.bak'))
            .map(f => ({
            name: f,
            path: path.join(backupDir, f),
            mtime: fs.statSync(path.join(backupDir, f)).mtime.getTime()
        }))
            .sort((a, b) => b.mtime - a.mtime);
        const toDelete = files.slice(this.maxBackups);
        for (const file of toDelete) {
            fs.unlinkSync(file.path);
        }
    }
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [id, transaction] of this.transactions) {
                if (!transaction.committed && !transaction.rolledBack) {
                    if (now - transaction.startTime > this.transactionTimeout) {
                        this.rollbackTransaction(id);
                    }
                }
            }
        }, 10000);
    }
    async write(relativePath, content, options = {}) {
        const filePath = this.getFullPath(relativePath);
        try {
            const lock = await this.fileLock.acquire(filePath);
            try {
                this.ensureDirectory(path.dirname(filePath));
                if (options.createBackup !== false && this.enableBackup) {
                    this.createBackup(filePath);
                }
                const contentToWrite = options.encrypt ? this.encrypt(content) : content;
                fs.writeFileSync(filePath, contentToWrite, 'utf8');
            }
            finally {
                lock.release();
            }
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, `Storage.write(${relativePath})`);
        }
    }
    async read(relativePath, options = {}) {
        const filePath = this.getFullPath(relativePath);
        try {
            const lock = await this.fileLock.acquire(filePath);
            try {
                if (!fs.existsSync(filePath)) {
                    throw new errors_js_1.StorageError(`File not found: ${relativePath}`, { path: relativePath });
                }
                let content = fs.readFileSync(filePath, 'utf8');
                if (options.decrypt) {
                    content = this.decrypt(content);
                }
                return content;
            }
            finally {
                lock.release();
            }
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, `Storage.read(${relativePath})`);
        }
    }
    async delete(relativePath, createBackup = true) {
        const filePath = this.getFullPath(relativePath);
        try {
            const lock = await this.fileLock.acquire(filePath);
            try {
                if (createBackup && this.enableBackup) {
                    this.createBackup(filePath);
                }
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            finally {
                lock.release();
            }
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, `Storage.delete(${relativePath})`);
        }
    }
    async exists(relativePath) {
        try {
            const filePath = this.getFullPath(relativePath);
            return fs.existsSync(filePath);
        }
        catch {
            return false;
        }
    }
    async list(relativePath = '', pattern) {
        const dirPath = this.getFullPath(relativePath);
        try {
            if (!fs.existsSync(dirPath)) {
                return [];
            }
            let files = fs.readdirSync(dirPath);
            if (pattern) {
                files = files.filter(f => pattern.test(f));
            }
            return files;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, `Storage.list(${relativePath})`);
        }
    }
    async startTransaction(transactionId) {
        if (this.transactions.has(transactionId)) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} already exists`);
        }
        this.transactions.set(transactionId, {
            id: transactionId,
            operations: [],
            startTime: Date.now(),
            committed: false,
            rolledBack: false
        });
    }
    async addOperation(transactionId, operation) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} not found`);
        }
        if (transaction.committed || transaction.rolledBack) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} already finalized`);
        }
        transaction.operations.push(operation);
    }
    async commitTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} not found`);
        }
        for (const op of transaction.operations) {
            switch (op.type) {
                case 'write':
                    await this.write(op.path, op.content || '', { createBackup: false });
                    break;
                case 'delete':
                    await this.delete(op.path, false);
                    break;
                case 'mkdir':
                    this.ensureDirectory(op.path);
                    break;
            }
        }
        transaction.committed = true;
    }
    async rollbackTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} not found`);
        }
        for (const op of transaction.operations.reverse()) {
            if (op.backupPath && fs.existsSync(op.backupPath)) {
                const targetPath = this.getFullPath(op.path);
                fs.copyFileSync(op.backupPath, targetPath);
            }
        }
        transaction.rolledBack = true;
        this.transactions.delete(transactionId);
    }
    async batchWrite(operations) {
        const transactionId = `batch_${Date.now()}`;
        await this.startTransaction(transactionId);
        try {
            for (const op of operations) {
                await this.addOperation(transactionId, { type: 'write', path: op.path, content: op.content });
            }
            await this.commitTransaction(transactionId);
        }
        catch (error) {
            await this.rollbackTransaction(transactionId);
            throw error;
        }
    }
    async backup(relativePath) {
        const filePath = this.getFullPath(relativePath);
        return this.createBackup(filePath);
    }
    getStats() {
        let totalFiles = 0;
        let totalSize = 0;
        const countFiles = (dir) => {
            if (!fs.existsSync(dir))
                return;
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (!file.startsWith('.')) {
                        countFiles(fullPath);
                    }
                }
                else {
                    totalFiles++;
                    totalSize += stat.size;
                }
            }
        };
        countFiles(this.basePath);
        return { totalFiles, totalSize };
    }
    async close() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
exports.UnifiedStorage = UnifiedStorage;
//# sourceMappingURL=storage.js.map