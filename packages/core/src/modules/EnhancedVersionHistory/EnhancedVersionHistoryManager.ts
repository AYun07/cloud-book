/**
 * Cloud Book - 深度优化版本历史管理
 * Nobel Prize Edition - v2.0
 * 
 * 核心能力边界（严谨定义）：
 * - Git风格分支与合并
 * - 高级差异比较
 * - 时间旅行与恢复
 * - 自动保存与备份
 */

import { Chapter } from '../../types';

// ============================================
// 版本系统类型定义
// ============================================

export type VersionType = 
  | 'manual'       // 手动保存
  | 'auto'         // 自动保存
  | 'milestone'    // 里程碑版本
  | 'branch'       // 分支创建
  | 'merge'        // 合并提交
  | 'restore'      // 恢复版本
  | 'generation';  // AI生成

export interface EnhancedVersion {
  id: string;
  versionNumber: number;
  branchId: string;
  branchName: string;
  type: VersionType;
  timestamp: Date;
  author?: string;
  title?: string;
  description?: string;
  content: string;
  wordCount: number;
  tags: string[];
  metadata: Record<string, any>;
  parentIds: string[];
  changeStats?: ChangeStats;
  isSignificant: boolean; // 重要版本（标记为里程碑）
  diffPreview?: string;
}

export interface EnhancedBranch {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  chapterId?: string;
  createdAt: Date;
  updatedAt: Date;
  headVersionId: string;
  isProtected: boolean;
  color?: string;
  tags: string[];
  versionCount: number;
}

export interface ChangeStats {
  additions: number;
  deletions: number;
  modifications: number;
  netChange: number;
  similarityScore: number; // 0-1, compared to parent
}

export interface DiffChunk {
  type: 'add' | 'remove' | 'modify' | 'unchanged';
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string[];
}

export interface DiffResult {
  oldVersionId: string;
  newVersionId: string;
  chunks: DiffChunk[];
  stats: ChangeStats;
  conflictZones: ConflictZone[];
}

export interface ConflictZone {
  startLine: number;
  endLine: number;
  ours: string[];
  theirs: string[];
  base?: string[];
  type: 'content' | 'structure' | 'style';
  severity: 'low' | 'medium' | 'high';
}

export interface MergeOptions {
  strategy: 'ours' | 'theirs' | 'merge' | 'interactive';
  autoResolveConflicts?: boolean;
  mergeCommitTitle?: string;
  mergeCommitDescription?: string;
  conflictThreshold?: number;
}

export interface MergeResult {
  success: boolean;
  mergedVersionId?: string;
  conflicts: ConflictZone[];
  autoResolvedCount: number;
  manualResolutionNeeded: ConflictZone[];
}

export interface TimelineView {
  branches: EnhancedBranch[];
  currentBranch: EnhancedBranch;
  versionGraph: VersionNode[];
  currentPosition: VersionNode;
}

export interface VersionNode {
  id: string;
  versionNumber: number;
  branchId: string;
  timestamp: Date;
  title?: string;
  type: VersionType;
  isHead: boolean;
  isSignificant: boolean;
  parentIds: string[];
  childrenIds: string[];
  wordCount: number;
}

export interface AutoSaveStrategy {
  enabled: boolean;
  intervalMs: number;
  idleTimeoutMs: number; // 空闲多久后触发
  maxVersions: number; // 保留多少自动保存版本
  compressOldVersions: boolean;
  watchForChanges: boolean;
  onAutoSave?: (version: EnhancedVersion) => void;
}

export interface RestoreOptions {
  createBackup: boolean;
  createBranch: boolean;
  branchName?: string;
  keepHistory: boolean;
  resetDependencies?: boolean;
}

export interface VersionQuery {
  branchId?: string;
  type?: VersionType[];
  fromDate?: Date;
  toDate?: Date;
  minWords?: number;
  maxWords?: number;
  searchText?: string;
  tags?: string[];
  isSignificant?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================
// 增强型 VersionHistoryManager
// ============================================

export class EnhancedVersionHistoryManager {
  private versions: Map<string, EnhancedVersion> = new Map(); // id -> version
  private branches: Map<string, EnhancedBranch> = new Map(); // id -> branch
  private projectBranches: Map<string, Set<string>> = new Map(); // projectId -> branchIds
  private chapterVersions: Map<string, string[]> = new Map(); // chapterId -> versionIds
  private headPointers: Map<string, string> = new Map(); // branchId -> versionId
  
  private autoSaveStates: Map<string, AutoSaveState> = new Map();
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {}
  
  // ============================================
  // 项目初始化
  // ============================================
  
  async initializeProject(projectId: string): Promise<EnhancedBranch> {
    if (this.projectBranches.has(projectId)) {
      const mainBranchId = Array.from(this.projectBranches.get(projectId)!).find(id => 
        this.branches.get(id)?.name === 'main'
      );
      if (mainBranchId) {
        return this.branches.get(mainBranchId)!;
      }
    }
    
    // 创建主分支
    const mainBranch: EnhancedBranch = {
      id: this.generateId(),
      name: 'main',
      description: '主线版本',
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      headVersionId: '',
      isProtected: true,
      tags: ['main', 'protected'],
      versionCount: 0
    };
    
    this.branches.set(mainBranch.id, mainBranch);
    
    if (!this.projectBranches.has(projectId)) {
      this.projectBranches.set(projectId, new Set());
    }
    this.projectBranches.get(projectId)?.add(mainBranch.id);
    
    return mainBranch;
  }
  
  // ============================================
  // 版本管理
  // ============================================
  
  async createVersion(
    projectId: string,
    chapterId: string,
    content: string,
    options: {
      type?: VersionType;
      title?: string;
      description?: string;
      author?: string;
      tags?: string[];
      isSignificant?: boolean;
      parentIds?: string[];
    } = {}
  ): Promise<EnhancedVersion> {
    const branch = await this.ensureProjectBranch(projectId, chapterId);
    
    const parentIds = options.parentIds || [branch.headVersionId].filter(Boolean);
    const lastVersion = parentIds.length > 0 ? this.versions.get(parentIds[0]) : null;
    
    const changeStats = lastVersion ? this.computeChanges(lastVersion.content, content) : {
      additions: content.split('\n').length,
      deletions: 0,
      modifications: 0,
      netChange: content.split('\n').length,
      similarityScore: 0
    };
    
    const version: EnhancedVersion = {
      id: this.generateId(),
      versionNumber: branch.versionCount + 1,
      branchId: branch.id,
      branchName: branch.name,
      type: options.type || 'manual',
      timestamp: new Date(),
      author: options.author,
      title: options.title || `Version ${branch.versionCount + 1}`,
      description: options.description,
      content,
      wordCount: content.split(/\s+/).length,
      tags: options.tags || [],
      metadata: {},
      parentIds,
      changeStats,
      isSignificant: options.isSignificant || false,
      diffPreview: lastVersion ? this.generateDiffPreview(lastVersion.content, content) : undefined
    };
    
    // 存储版本
    this.versions.set(version.id, version);
    branch.headVersionId = version.id;
    branch.versionCount++;
    branch.updatedAt = new Date();
    this.headPointers.set(branch.id, version.id);
    
    // 记录章节版本
    if (!this.chapterVersions.has(chapterId)) {
      this.chapterVersions.set(chapterId, []);
    }
    this.chapterVersions.get(chapterId)?.push(version.id);
    
    return version;
  }
  
  async getVersion(versionId: string): Promise<EnhancedVersion | undefined> {
    return this.versions.get(versionId);
  }
  
  async getVersions(projectId: string, query: VersionQuery = {}): Promise<EnhancedVersion[]> {
    const branchIds = this.projectBranches.get(projectId) || new Set();
    let versions: EnhancedVersion[] = [];
    
    for (const branchId of branchIds) {
      if (query.branchId && query.branchId !== branchId) continue;
      
      const branch = this.branches.get(branchId);
      if (!branch) continue;
      
      const branchVersions = this.getBranchVersions(branchId);
      versions.push(...branchVersions);
    }
    
    // 应用过滤器
    versions = versions.filter(v => {
      if (query.type?.length && !query.type.includes(v.type)) return false;
      if (query.fromDate && v.timestamp < query.fromDate) return false;
      if (query.toDate && v.timestamp > query.toDate) return false;
      if (query.minWords !== undefined && v.wordCount < query.minWords) return false;
      if (query.maxWords !== undefined && v.wordCount > query.maxWords) return false;
      if (query.isSignificant !== undefined && v.isSignificant !== query.isSignificant) return false;
      if (query.tags?.length && !query.tags.some(t => v.tags.includes(t))) return false;
      if (query.searchText) {
        const searchLower = query.searchText.toLowerCase();
        if (!v.title?.toLowerCase().includes(searchLower) &&
            !v.description?.toLowerCase().includes(searchLower) &&
            !v.content.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
    
    // 排序和分页
    versions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (query.offset) versions = versions.slice(query.offset);
    if (query.limit) versions = versions.slice(0, query.limit);
    
    return versions;
  }
  
  private getBranchVersions(branchId: string): EnhancedVersion[] {
    return Array.from(this.versions.values())
      .filter(v => v.branchId === branchId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }
  
  // ============================================
  // 分支管理
  // ============================================
  
  async createBranch(
    projectId: string,
    name: string,
    options: {
      fromBranchId?: string;
      fromVersionId?: string;
      description?: string;
      color?: string;
      tags?: string[];
    } = {}
  ): Promise<EnhancedBranch> {
    const sourceBranchId = options.fromBranchId || await this.getDefaultBranchId(projectId);
    if (!sourceBranchId) throw new Error('No default branch found');
    
    const sourceBranch = this.branches.get(sourceBranchId);
    if (!sourceBranch) throw new Error('Source branch not found');
    
    const fromVersionId = options.fromVersionId || sourceBranch.headVersionId;
    const fromVersion = this.versions.get(fromVersionId);
    
    if (!fromVersion) throw new Error('Source version not found');
    
    const newBranch: EnhancedBranch = {
      id: this.generateId(),
      name,
      description: options.description,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      headVersionId: fromVersionId,
      isProtected: false,
      color: options.color || this.getRandomColor(),
      tags: options.tags || [],
      versionCount: sourceBranch.versionCount
    };
    
    this.branches.set(newBranch.id, newBranch);
    this.projectBranches.get(projectId)?.add(newBranch.id);
    this.headPointers.set(newBranch.id, fromVersionId);
    
    // 创建分支点版本标记
    const branchVersion: EnhancedVersion = {
      ...fromVersion,
      id: this.generateId(),
      versionNumber: 1,
      branchId: newBranch.id,
      branchName: name,
      type: 'branch',
      timestamp: new Date(),
      title: `Branch: ${name}`,
      parentIds: [fromVersionId]
    };
    
    this.versions.set(branchVersion.id, branchVersion);
    
    return newBranch;
  }
  
  async mergeBranches(
    sourceBranchId: string,
    targetBranchId: string,
    options: MergeOptions = { strategy: 'merge' }
  ): Promise<MergeResult> {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);
    
    if (!sourceBranch || !targetBranch) {
      return { success: false, conflicts: [], autoResolvedCount: 0, manualResolutionNeeded: [] };
    }
    
    const sourceVersion = this.versions.get(sourceBranch.headVersionId);
    const targetVersion = this.versions.get(targetBranch.headVersionId);
    
    if (!sourceVersion || !targetVersion) {
      return { success: false, conflicts: [], autoResolvedCount: 0, manualResolutionNeeded: [] };
    }
    
    // 计算差异
    const diff = this.computeDiff(targetVersion.content, sourceVersion.content);
    
    // 冲突解决
    const result = this.resolveConflicts(diff, options);
    
    if (result.conflicts.length === 0 || options.autoResolveConflicts) {
      // 创建合并版本
      const mergedContent = this.applyMerge(targetVersion.content, diff, result);
      
      await this.createVersion(targetBranch.projectId, '', mergedContent, {
        type: 'merge',
        title: options.mergeCommitTitle || `Merge ${sourceBranch.name} into ${targetBranch.name}`,
        description: options.mergeCommitDescription,
        parentIds: [targetBranch.headVersionId, sourceBranch.headVersionId],
        isSignificant: true
      });
      
      return { ...result, success: true };
    }
    
    return { ...result, success: false };
  }
  
  async getBranches(projectId: string): Promise<EnhancedBranch[]> {
    const branchIds = this.projectBranches.get(projectId) || new Set();
    return Array.from(branchIds).map(id => this.branches.get(id)!).filter(Boolean);
  }
  
  async getTimeline(projectId: string): Promise<TimelineView> {
    const branches = await this.getBranches(projectId);
    const mainBranch = branches.find(b => b.name === 'main') || branches[0];
    
    const versionGraph: VersionNode[] = [];
    const processed = new Set<string>();
    
    const buildGraph = (versionId: string): void => {
      if (processed.has(versionId)) return;
      processed.add(versionId);
      
      const version = this.versions.get(versionId);
      if (!version) return;
      
      const branch = this.branches.get(version.branchId);
      if (!branch) return;
      
      const node: VersionNode = {
        id: version.id,
        versionNumber: version.versionNumber,
        branchId: version.branchId,
        timestamp: version.timestamp,
        title: version.title,
        type: version.type,
        isHead: branch.headVersionId === version.id,
        isSignificant: version.isSignificant,
        parentIds: version.parentIds,
        childrenIds: [],
        wordCount: version.wordCount
      };
      
      versionGraph.push(node);
      
      for (const parentId of version.parentIds) {
        buildGraph(parentId);
      }
    };
    
    // 从所有分支头开始构建
    for (const branch of branches) {
      if (branch.headVersionId) {
        buildGraph(branch.headVersionId);
      }
    }
    
    // 构建子节点关系
    const nodeMap = new Map(versionGraph.map(n => [n.id, n]));
    for (const node of versionGraph) {
      for (const parentId of node.parentIds) {
        const parent = nodeMap.get(parentId);
        if (parent) {
          parent.childrenIds.push(node.id);
        }
      }
    }
    
    return {
      branches,
      currentBranch: mainBranch,
      versionGraph,
      currentPosition: versionGraph.find(n => n.id === mainBranch.headVersionId) || versionGraph[0]
    };
  }
  
  // ============================================
  // 恢复与时间旅行
  // ============================================
  
  async restoreVersion(
    versionId: string,
    options: RestoreOptions = { createBackup: true, createBranch: false, keepHistory: true }
  ): Promise<EnhancedVersion> {
    const sourceVersion = this.versions.get(versionId);
    if (!sourceVersion) throw new Error('Version not found');
    
    const branch = this.branches.get(sourceVersion.branchId);
    if (!branch) throw new Error('Branch not found');
    
    // 先备份当前状态
    if (options.createBackup && branch.headVersionId) {
      const currentVersion = this.versions.get(branch.headVersionId);
      if (currentVersion) {
        await this.createVersion(branch.projectId, '', currentVersion.content, {
          type: 'milestone',
          title: 'Backup before restore',
          isSignificant: true
        });
      }
    }
    
    // 创建分支（如果需要）
    if (options.createBranch) {
      const newBranch = await this.createBranch(branch.projectId, `restore-${versionId.slice(0, 8)}`, {
        fromBranchId: branch.id,
        fromVersionId: versionId,
        description: `Restore from ${sourceVersion.title}`
      });
      return this.versions.get(newBranch.headVersionId)!;
    }
    
    // 创建新的恢复版本
    const restoredVersion = await this.createVersion(branch.projectId, '', sourceVersion.content, {
      type: 'restore',
      title: `Restore: ${sourceVersion.title}`,
      description: `Restored from version ${versionId.slice(0, 8)}`,
      parentIds: [branch.headVersionId].filter(Boolean),
      isSignificant: true
    });
    
    return restoredVersion;
  }
  
  // ============================================
  // 差异比较
  // ============================================
  
  async compareVersions(versionId1: string, versionId2: string): Promise<DiffResult> {
    const v1 = this.versions.get(versionId1);
    const v2 = this.versions.get(versionId2);
    
    if (!v1 || !v2) throw new Error('Version not found');
    
    return this.computeDiff(v1.content, v2.content);
  }
  
  private computeDiff(oldText: string, newText: string): DiffResult {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const chunks: DiffChunk[] = [];
    const conflicts: ConflictZone[] = [];
    
    // 简化的差异算法
    let i = 0, j = 0;
    
    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        const unchangedStart = i;
        while (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
          i++; j++;
        }
        chunks.push({
          type: 'unchanged',
          oldStart: unchangedStart,
          oldLines: i - unchangedStart,
          newStart: unchangedStart,
          newLines: i - unchangedStart,
          content: oldLines.slice(unchangedStart, i)
        });
      } else {
        // 查找下一个匹配点
        let foundMatch = false;
        for (let lookahead = 1; lookahead <= Math.min(3, oldLines.length - i, newLines.length - j); lookahead++) {
          if (i + lookahead < oldLines.length && j + lookahead < newLines.length) {
            if (oldLines.slice(i, i + lookahead).join('\n') === newLines.slice(j, j + lookahead).join('\n')) {
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          // 添加差异块
          const removeChunk: DiffChunk = {
            type: 'remove',
            oldStart: i,
            oldLines: 1,
            newStart: j,
            newLines: 0,
            content: oldLines.slice(i, i + 1)
          };
          
          const addChunk: DiffChunk = {
            type: 'add',
            oldStart: i,
            oldLines: 0,
            newStart: j,
            newLines: 1,
            content: newLines.slice(j, j + 1)
          };
          
          if (i < oldLines.length) chunks.push(removeChunk);
          if (j < newLines.length) chunks.push(addChunk);
          
          if (i < oldLines.length && j < newLines.length) {
            conflicts.push({
              startLine: i,
              endLine: i + 1,
              ours: oldLines.slice(i, i + 1),
              theirs: newLines.slice(j, j + 1),
              type: 'content',
              severity: 'medium'
            });
          }
          
          if (i < oldLines.length) i++;
          if (j < newLines.length) j++;
        }
      }
    }
    
    const stats = this.computeChanges(oldText, newText);
    
    return {
      oldVersionId: '',
      newVersionId: '',
      chunks,
      stats,
      conflictZones: conflicts
    };
  }
  
  private computeChanges(oldText: string, newText: string): ChangeStats {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    let additions = 0, deletions = 0, modifications = 0;
    
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);
    
    for (const line of newLines) {
      if (!oldSet.has(line)) additions++;
    }
    
    for (const line of oldLines) {
      if (!newSet.has(line)) deletions++;
    }
    
    return {
      additions,
      deletions,
      modifications,
      netChange: additions - deletions,
      similarityScore: 1 - Math.min(1, Math.abs(additions - deletions) / Math.max(oldLines.length, newLines.length, 1))
    };
  }
  
  private generateDiffPreview(oldText: string, newText: string): string {
    const diff = this.computeDiff(oldText, newText);
    const preview = diff.chunks
      .filter(c => c.type !== 'unchanged')
      .slice(0, 5)
      .map(c => {
        const prefix = c.type === 'add' ? '+ ' : c.type === 'remove' ? '- ' : '  ';
        return c.content.map(l => prefix + l).join('\n');
      })
      .join('\n');
    
    return preview.length > 500 ? preview.slice(0, 500) + '...' : preview;
  }
  
  private resolveConflicts(diff: DiffResult, options: MergeOptions): MergeResult {
    const conflicts = diff.conflictZones;
    const autoResolved: ConflictZone[] = [];
    const needsManual: ConflictZone[] = [];
    
    for (const conflict of conflicts) {
      if (options.strategy === 'ours') {
        autoResolved.push(conflict);
      } else if (options.strategy === 'theirs') {
        autoResolved.push(conflict);
      } else if (options.autoResolveConflicts && conflict.severity === 'low') {
        autoResolved.push(conflict);
      } else {
        needsManual.push(conflict);
      }
    }
    
    return {
      success: needsManual.length === 0,
      conflicts,
      autoResolvedCount: autoResolved.length,
      manualResolutionNeeded: needsManual
    };
  }
  
  private applyMerge(baseText: string, diff: DiffResult, result: MergeResult): string {
    const lines = baseText.split('\n');
    // 简单合并策略
    // 实际实现需要更复杂的合并算法
    return baseText;
  }
  
  // ============================================
  // 自动保存
  // ============================================
  
  async startAutoSave(
    projectId: string,
    chapterId: string,
    options: AutoSaveStrategy = {
      enabled: true,
      intervalMs: 30000,
      idleTimeoutMs: 5000,
      maxVersions: 50,
      compressOldVersions: true,
      watchForChanges: true
    }
  ): Promise<void> {
    await this.initializeProject(projectId);
    
    const state: AutoSaveState = {
      enabled: options.enabled,
      lastSaveTime: null,
      lastContent: '',
      isIdle: false,
      idleSince: null,
      pendingContent: ''
    };
    
    this.autoSaveStates.set(chapterId, state);
    
    if (options.enabled) {
      const timer = setInterval(() => {
        const currentState = this.autoSaveStates.get(chapterId);
        if (currentState?.pendingContent && currentState.pendingContent !== currentState.lastContent) {
          // 触发自动保存
          this.createVersion(projectId, chapterId, currentState.pendingContent, { type: 'auto' });
          currentState.lastContent = currentState.pendingContent;
          currentState.lastSaveTime = new Date();
        }
      }, options.intervalMs);
      
      this.autoSaveTimers.set(chapterId, timer);
    }
  }
  
  async updatePendingContent(chapterId: string, content: string): Promise<void> {
    const state = this.autoSaveStates.get(chapterId);
    if (state) {
      state.pendingContent = content;
      state.isIdle = false;
      state.idleSince = null;
    }
  }
  
  async stopAutoSave(chapterId: string): Promise<void> {
    const timer = this.autoSaveTimers.get(chapterId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(chapterId);
    }
  }
  
  // ============================================
  // 辅助方法
  // ============================================
  
  private async ensureProjectBranch(projectId: string, chapterId?: string): Promise<EnhancedBranch> {
    const branches = await this.getBranches(projectId);
    let mainBranch = branches.find(b => b.name === 'main');
    
    if (!mainBranch) {
      mainBranch = await this.initializeProject(projectId);
    }
    
    return mainBranch;
  }
  
  private async getDefaultBranchId(projectId: string): Promise<string | null> {
    const branches = await this.getBranches(projectId);
    const mainBranch = branches.find(b => b.name === 'main');
    return mainBranch?.id || branches[0]?.id || null;
  }
  
  private generateId(): string {
    return `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getRandomColor(): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export interface AutoSaveState {
  enabled: boolean;
  lastSaveTime: Date | null;
  lastContent: string;
  isIdle: boolean;
  idleSince: Date | null;
  pendingContent: string;
}

export default EnhancedVersionHistoryManager;
