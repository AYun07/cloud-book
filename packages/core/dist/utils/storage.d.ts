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
    private baseResolved;
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
    delete(relativePath: string, createBackup?: boolean): Promise<void>;
    exists(relativePath: string): Promise<boolean>;
    list(relativePath?: string, pattern?: RegExp): Promise<string[]>;
    startTransaction(transactionId: string): Promise<void>;
    addOperation(transactionId: string, operation: FileOperation): Promise<void>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    batchWrite(operations: Array<{
        path: string;
        content: string;
        options?: {
            encrypt?: boolean;
        };
    }>): Promise<void>;
    backup(relativePath: string): Promise<string | null>;
    getStats(): {
        totalFiles: number;
        totalSize: number;
    };
    close(): Promise<void>;
    destroy(): void;
}
export {};
//# sourceMappingURL=storage.d.ts.map