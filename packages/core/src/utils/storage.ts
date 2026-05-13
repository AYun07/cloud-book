/**
 * Cloud Book - 统一存储层
 * 支持并发安全、事务、备份
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { StorageError, handleError } from './errors.js';

interface StorageConfig {
  basePath: string;
  enableBackup: boolean;
  maxBackups: number;
  transactionTimeout: number;
  encryptionKey?: string;
}

interface Transaction {
  id: string;
  operations: FileOperation[];
  startTime: number;
  committed: boolean;
  rolledBack: boolean;
}

interface FileOperation {
  type: 'write' | 'delete' | 'mkdir';
  path: string;
  content?: string;
  backupPath?: string;
}

interface LockHandle {
  release: () => void;
}

class FileLock {
  private locks: Map<string, { resolve: () => void; promise: Promise<void> }> = new Map();

  async acquire(filePath: string): Promise<LockHandle> {
    while (this.locks.has(filePath)) {
      await this.locks.get(filePath)!.promise;
    }

    let resolveLock: () => void;
    const promise = new Promise<void>(resolve => {
      resolveLock = resolve;
    });

    this.locks.set(filePath, { resolve: resolveLock!, promise });

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

  isLocked(filePath: string): boolean {
    return this.locks.has(filePath);
  }
}

export class UnifiedStorage {
  private basePath: string;
  private baseResolved: string;
  private enableBackup: boolean;
  private maxBackups: number;
  private transactionTimeout: number;
  private encryptionKey?: Buffer;
  private fileLock: FileLock;
  private transactions: Map<string, Transaction> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<StorageConfig> = {}) {
    this.basePath = config.basePath || './data/cloudbook';
    this.baseResolved = path.resolve(this.basePath);
    this.enableBackup = config.enableBackup ?? true;
    this.maxBackups = config.maxBackups || 5;
    this.transactionTimeout = config.transactionTimeout || 30000;
    this.fileLock = new FileLock();

    if (config.encryptionKey) {
      this.encryptionKey = Buffer.from(config.encryptionKey, 'hex');
      if (this.encryptionKey.length !== 32) {
        throw new StorageError('Encryption key must be 32 bytes (64 hex characters)');
      }
    }

    this.ensureDirectory(this.basePath);
    this.startCleanupInterval();
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private encrypt(content: string): string {
    if (!this.encryptionKey) return content;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decrypt(encryptedContent: string): string {
    if (!this.encryptionKey || !encryptedContent.includes(':')) return encryptedContent;

    const [ivHex, authTagHex, encrypted] = encryptedContent.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private getFullPath(relativePath: string): string {
    const fullPath = path.resolve(this.basePath, relativePath);
    if (!fullPath.startsWith(this.baseResolved + path.sep) && fullPath !== this.baseResolved) {
      throw new StorageError('Path traversal detected', { path: relativePath });
    }
    return fullPath;
  }

  private createBackup(filePath: string): string | null {
    if (!this.enableBackup || !fs.existsSync(filePath)) return null;

    const backupDir = path.join(this.basePath, '.backups');
    this.ensureDirectory(backupDir);

    const timestamp = Date.now();
    const backupPath = path.join(backupDir, `${path.basename(filePath)}.${timestamp}.bak`);

    fs.copyFileSync(filePath, backupPath);

    this.cleanupOldBackups(backupDir);

    return backupPath;
  }

  private cleanupOldBackups(backupDir: string): void {
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

  private startCleanupInterval(): void {
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

  async write(relativePath: string, content: string, options: { encrypt?: boolean; createBackup?: boolean } = {}): Promise<void> {
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
      } finally {
        lock.release();
      }
    } catch (error) {
      throw handleError(error, `Storage.write(${relativePath})`);
    }
  }

  async read(relativePath: string, options: { decrypt?: boolean } = {}): Promise<string> {
    const filePath = this.getFullPath(relativePath);

    try {
      const lock = await this.fileLock.acquire(filePath);

      try {
        if (!fs.existsSync(filePath)) {
          throw new StorageError(`File not found: ${relativePath}`, { path: relativePath });
        }

        let content = fs.readFileSync(filePath, 'utf8');

        if (options.decrypt) {
          content = this.decrypt(content);
        }

        return content;
      } finally {
        lock.release();
      }
    } catch (error) {
      throw handleError(error, `Storage.read(${relativePath})`);
    }
  }

  async delete(relativePath: string, createBackup: boolean = true): Promise<void> {
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
      } finally {
        lock.release();
      }
    } catch (error) {
      throw handleError(error, `Storage.delete(${relativePath})`);
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const filePath = this.getFullPath(relativePath);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  async list(relativePath: string = '', pattern?: RegExp): Promise<string[]> {
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
    } catch (error) {
      throw handleError(error, `Storage.list(${relativePath})`);
    }
  }

  async startTransaction(transactionId: string): Promise<void> {
    if (this.transactions.has(transactionId)) {
      throw new StorageError(`Transaction ${transactionId} already exists`);
    }

    this.transactions.set(transactionId, {
      id: transactionId,
      operations: [],
      startTime: Date.now(),
      committed: false,
      rolledBack: false
    });
  }

  async addOperation(transactionId: string, operation: FileOperation): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new StorageError(`Transaction ${transactionId} not found`);
    }

    if (transaction.committed || transaction.rolledBack) {
      throw new StorageError(`Transaction ${transactionId} already finalized`);
    }

    transaction.operations.push(operation);
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new StorageError(`Transaction ${transactionId} not found`);
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

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new StorageError(`Transaction ${transactionId} not found`);
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

  async batchWrite(operations: Array<{ path: string; content: string; options?: { encrypt?: boolean } }>): Promise<void> {
    const transactionId = `batch_${Date.now()}`;
    await this.startTransaction(transactionId);

    try {
      for (const op of operations) {
        await this.addOperation(transactionId, { type: 'write', path: op.path, content: op.content });
      }
      await this.commitTransaction(transactionId);
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  async backup(relativePath: string): Promise<string | null> {
    const filePath = this.getFullPath(relativePath);
    return this.createBackup(filePath);
  }

  getStats(): { totalFiles: number; totalSize: number } {
    let totalFiles = 0;
    let totalSize = 0;

    const countFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!file.startsWith('.')) {
            countFiles(fullPath);
          }
        } else {
          totalFiles++;
          totalSize += stat.size;
        }
      }
    };

    countFiles(this.basePath);
    return { totalFiles, totalSize };
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
