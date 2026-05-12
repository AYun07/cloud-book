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
  private enableBackup: boolean;
  private maxBackups: number;
  private transactionTimeout: number;
  private encryptionKey?: Buffer;
  private fileLock: FileLock;
  private transactions: Map<string, Transaction> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<StorageConfig> = {}) {
    this.basePath = config.basePath || './data/cloudbook';
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
    return path.join(this.basePath, relativePath);
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

  async delete(relativePath: string, options: { createBackup?: boolean } = {}): Promise<void> {
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
        
        fs.unlinkSync(filePath);
      } finally {
        lock.release();
      }
    } catch (error) {
      throw handleError(error, `Storage.delete(${relativePath})`);
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    const filePath = this.getFullPath(relativePath);
    return fs.existsSync(filePath);
  }

  async list(relativePath: string, options: { recursive?: boolean; pattern?: RegExp } = {}): Promise<string[]> {
    const dirPath = this.getFullPath(relativePath);
    
    try {
      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const results: string[] = [];
      
      if (options.recursive) {
        this.walkDirectory(dirPath, path.dirname(dirPath), results, options.pattern);
      } else {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const fullPath = path.join(relativePath, file);
          if (!options.pattern || options.pattern.test(fullPath)) {
            results.push(fullPath);
          }
        }
      }
      
      return results;
    } catch (error) {
      throw handleError(error, `Storage.list(${relativePath})`);
    }
  }

  private walkDirectory(dirPath: string, basePath: string, results: string[], pattern?: RegExp): void {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const relativePath = path.relative(basePath, fullPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        this.walkDirectory(fullPath, basePath, results, pattern);
      } else {
        if (!pattern || pattern.test(relativePath)) {
          results.push(relativePath);
        }
      }
    }
  }

  beginTransaction(): string {
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

  addOperation(transactionId: string, operation: FileOperation): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new StorageError(`Transaction ${transactionId} not found`);
    }
    if (transaction.committed || transaction.rolledBack) {
      throw new StorageError(`Transaction ${transactionId} is already ${transaction.committed ? 'committed' : 'rolled back'}`);
    }
    transaction.operations.push(operation);
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new StorageError(`Transaction ${transactionId} not found`);
    }
    if (transaction.committed || transaction.rolledBack) {
      throw new StorageError(`Transaction ${transactionId} is already ${transaction.committed ? 'committed' : 'rolled back'}`);
    }

    const executedOperations: FileOperation[] = [];

    try {
      for (const operation of transaction.operations) {
        switch (operation.type) {
          case 'write':
            await this.write(operation.path, operation.content!, { createBackup: false });
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
    } catch (error) {
      for (const operation of executedOperations.reverse()) {
        try {
          if (operation.backupPath && fs.existsSync(operation.backupPath)) {
            const content = fs.readFileSync(operation.backupPath, 'utf8');
            await this.write(operation.path, content, { createBackup: false });
          }
        } catch (rollbackError) {
          console.error(`Failed to rollback operation:`, rollbackError);
        }
      }
      throw handleError(error, `Transaction.commit(${transactionId})`);
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
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
      } catch (rollbackError) {
        console.error(`Failed to rollback operation:`, rollbackError);
      }
    }

    transaction.rolledBack = true;
    this.transactions.delete(transactionId);
  }

  async batchWrite(operations: Array<{ path: string; content: string }>): Promise<void> {
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

  getStats(): {
    totalFiles: number;
    totalSize: number;
    lastModified: Date | null;
  } {
    let totalFiles = 0;
    let totalSize = 0;
    let lastModified: Date | null = null;

    const walk = (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;
      
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file === '.backups') continue;
        
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
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

  async encryptExisting(relativePath: string): Promise<void> {
    const content = await this.read(relativePath);
    await this.write(relativePath, content, { encrypt: true });
  }

  async decryptExisting(relativePath: string): Promise<void> {
    const content = await this.read(relativePath, { decrypt: true });
    await this.write(relativePath, content, { encrypt: false });
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.transactions.clear();
  }
}

export const storage = new UnifiedStorage();
