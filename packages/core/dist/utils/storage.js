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
exports.storage = exports.UnifiedStorage = void 0;
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
    enableBackup;
    maxBackups;
    transactionTimeout;
    encryptionKey;
    fileLock;
    transactions = new Map();
    cleanupInterval;
    constructor(config = {}) {
        this.basePath = config.basePath || './data/cloudbook';
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
        return path.join(this.basePath, relativePath);
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
    async delete(relativePath, options = {}) {
        const filePath = this.getFullPath(relativePath);
        try {
            const lock = await this.fileLock.acquire(filePath);
            try {
                if (!fs.existsSync(filePath)) {
                    return;
                }
                if (options.createBackup !== false && this.enableBackup) {
                    this.createBackup(filePath);
                }
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                }
                else {
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
        const filePath = this.getFullPath(relativePath);
        return fs.existsSync(filePath);
    }
    async list(relativePath, options = {}) {
        const dirPath = this.getFullPath(relativePath);
        try {
            if (!fs.existsSync(dirPath)) {
                return [];
            }
            const results = [];
            if (options.recursive) {
                this.walkDirectory(dirPath, path.dirname(dirPath), results, options.pattern);
            }
            else {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    const fullPath = path.join(relativePath, file);
                    if (!options.pattern || options.pattern.test(fullPath)) {
                        results.push(fullPath);
                    }
                }
            }
            return results;
        }
        catch (error) {
            throw (0, errors_js_1.handleError)(error, `Storage.list(${relativePath})`);
        }
    }
    walkDirectory(dirPath, basePath, results, pattern) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const relativePath = path.relative(basePath, fullPath);
            if (fs.statSync(fullPath).isDirectory()) {
                this.walkDirectory(fullPath, basePath, results, pattern);
            }
            else {
                if (!pattern || pattern.test(relativePath)) {
                    results.push(relativePath);
                }
            }
        }
    }
    beginTransaction() {
        const id = crypto.randomUUID();
        this.transactions.set(id, {
            id,
            operations: [],
            startTime: Date.now(),
            committed: false,
            rolledBack: false
        });
        return id;
    }
    addOperation(transactionId, operation) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} not found`);
        }
        if (transaction.committed || transaction.rolledBack) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} is already ${transaction.committed ? 'committed' : 'rolled back'}`);
        }
        transaction.operations.push(operation);
    }
    async commitTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} not found`);
        }
        if (transaction.committed || transaction.rolledBack) {
            throw new errors_js_1.StorageError(`Transaction ${transactionId} is already ${transaction.committed ? 'committed' : 'rolled back'}`);
        }
        const executedOperations = [];
        try {
            for (const operation of transaction.operations) {
                switch (operation.type) {
                    case 'write':
                        await this.write(operation.path, operation.content, { createBackup: false });
                        break;
                    case 'delete':
                        await this.delete(operation.path, { createBackup: false });
                        break;
                    case 'mkdir':
                        this.ensureDirectory(operation.path);
                        break;
                }
                executedOperations.push(operation);
            }
            transaction.committed = true;
            this.transactions.delete(transactionId);
        }
        catch (error) {
            for (const operation of executedOperations.reverse()) {
                try {
                    if (operation.backupPath && fs.existsSync(operation.backupPath)) {
                        const content = fs.readFileSync(operation.backupPath, 'utf8');
                        await this.write(operation.path, content, { createBackup: false });
                    }
                }
                catch (rollbackError) {
                    console.error(`Failed to rollback operation:`, rollbackError);
                }
            }
            throw (0, errors_js_1.handleError)(error, `Transaction.commit(${transactionId})`);
        }
    }
    async rollbackTransaction(transactionId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            return;
        }
        for (const operation of transaction.operations.reverse()) {
            try {
                if (operation.backupPath && fs.existsSync(operation.backupPath)) {
                    const content = fs.readFileSync(operation.backupPath, 'utf8');
                    await this.write(operation.path, content, { createBackup: false });
                }
            }
            catch (rollbackError) {
                console.error(`Failed to rollback operation:`, rollbackError);
            }
        }
        transaction.rolledBack = true;
        this.transactions.delete(transactionId);
    }
    async batchWrite(operations) {
        const transactionId = this.beginTransaction();
        for (const op of operations) {
            this.addOperation(transactionId, {
                type: 'write',
                path: op.path,
                content: op.content
            });
        }
        await this.commitTransaction(transactionId);
    }
    getStats() {
        let totalFiles = 0;
        let totalSize = 0;
        let lastModified = null;
        const walk = (dirPath) => {
            if (!fs.existsSync(dirPath))
                return;
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (file === '.backups')
                    continue;
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                }
                else {
                    totalFiles++;
                    totalSize += stat.size;
                    if (!lastModified || stat.mtime > lastModified) {
                        lastModified = stat.mtime;
                    }
                }
            }
        };
        walk(this.basePath);
        return {
            totalFiles,
            totalSize,
            lastModified
        };
    }
    async encryptExisting(relativePath) {
        const content = await this.read(relativePath);
        await this.write(relativePath, content, { encrypt: true });
    }
    async decryptExisting(relativePath) {
        const content = await this.read(relativePath, { decrypt: true });
        await this.write(relativePath, content, { encrypt: false });
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.transactions.clear();
    }
}
exports.UnifiedStorage = UnifiedStorage;
exports.storage = new UnifiedStorage();
//# sourceMappingURL=storage.js.map