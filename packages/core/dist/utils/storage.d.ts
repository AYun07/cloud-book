/**
 * Cloud Book - 统一存储层
 * 支持并发安全、事务、备份
 */
interface StorageConfig {
    basePath: string;
    enableBackup: boolean;
    maxBackups: number;
    transactionTimeout: number;
    encryptionKey?: string;
}
interface FileOperation {
    type: 'write' | 'delete' | 'mkdir';
    path: string;
    content?: string;
    backupPath?: string;
}
export declare class UnifiedStorage {
    private basePath;
    private enableBackup;
    private maxBackups;
    private transactionTimeout;
    private encryptionKey?;
    private fileLock;
    private transactions;
    private cleanupInterval?;
    constructor(config?: Partial<StorageConfig>);
    private ensureDirectory;
    private encrypt;
    private decrypt;
    private getFullPath;
    private createBackup;
    private cleanupOldBackups;
    private startCleanupInterval;
    write(relativePath: string, content: string, options?: {
        encrypt?: boolean;
        createBackup?: boolean;
    }): Promise<void>;
    read(relativePath: string, options?: {
        decrypt?: boolean;
    }): Promise<string>;
    delete(relativePath: string, options?: {
        createBackup?: boolean;
    }): Promise<void>;
    exists(relativePath: string): Promise<boolean>;
    list(relativePath: string, options?: {
        recursive?: boolean;
        pattern?: RegExp;
    }): Promise<string[]>;
    private walkDirectory;
    beginTransaction(): string;
    addOperation(transactionId: string, operation: FileOperation): void;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    batchWrite(operations: Array<{
        path: string;
        content: string;
    }>): Promise<void>;
    getStats(): {
        totalFiles: number;
        totalSize: number;
        lastModified: Date | null;
    };
    encryptExisting(relativePath: string): Promise<void>;
    decryptExisting(relativePath: string): Promise<void>;
    destroy(): void;
}
export declare const storage: UnifiedStorage;
export {};
//# sourceMappingURL=storage.d.ts.map