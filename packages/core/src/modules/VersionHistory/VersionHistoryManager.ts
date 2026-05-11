/**
 * 版本历史管理器
 * 管理项目和章节的版本历史
 */

import { Chapter } from '../../types';

export interface Version {
  id: string;
  version: number;
  timestamp: Date;
  content: string;
  summary?: string;
  author?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  parentId?: string;
  branch?: string;
}

export interface Branch {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  headVersionId: string;
}

export interface Diff {
  type: 'add' | 'remove' | 'modify';
  lineNumber?: number;
  oldContent?: string;
  newContent?: string;
  context?: string;
}

export interface ChangeStats {
  additions: number;
  deletions: number;
  modifications: number;
}

export class VersionHistoryManager {
  private versions: Map<string, Version[]> = new Map();
  private branches: Map<string, Branch[]> = new Map();
  private currentBranch: Map<string, string> = new Map();
  private storagePath: string;

  constructor(storagePath: string = './data/versioning') {
    this.storagePath = storagePath;
  }

  async initialize(projectId: string): Promise<void> {
    this.versions.set(projectId, []);
    this.branches.set(projectId, []);
    this.currentBranch.set(projectId, 'main');
  }

  createVersion(
    projectId: string,
    content: string,
    options?: {
      summary?: string;
      author?: string;
      tags?: string[];
      metadata?: Record<string, any>;
      branch?: string;
    }
  ): Version {
    const projectVersions = this.versions.get(projectId) || [];
    const branch = options?.branch || this.currentBranch.get(projectId) || 'main';
    const branchVersions = projectVersions.filter(v => v.branch === branch);
    const maxVersion = branchVersions.reduce((max, v) => Math.max(max, v.version), 0);

    const version: Version = {
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

    this.save(projectId);
    return version;
  }

  getVersion(projectId: string, versionId: string): Version | undefined {
    const projectVersions = this.versions.get(projectId) || [];
    return projectVersions.find(v => v.id === versionId);
  }

  getVersionByNumber(projectId: string, versionNumber: number, branch?: string): Version | undefined {
    const projectVersions = this.versions.get(projectId) || [];
    const targetBranch = branch || this.currentBranch.get(projectId) || 'main';
    return projectVersions.find(v => v.version === versionNumber && v.branch === targetBranch);
  }

  getVersionHistory(
    projectId: string,
    options?: {
      limit?: number;
      offset?: number;
      branch?: string;
      tags?: string[];
    }
  ): Version[] {
    const projectVersions = this.versions.get(projectId) || [];
    let filtered = projectVersions;

    if (options?.branch) {
      filtered = filtered.filter(v => v.branch === options.branch);
    } else {
      const currentBranchName = this.currentBranch.get(projectId) || 'main';
      filtered = filtered.filter(v => v.branch === currentBranchName);
    }

    if (options?.tags && options.tags.length > 0) {
      filtered = filtered.filter(v => 
        v.tags && options.tags!.some(tag => v.tags!.includes(tag))
      );
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  getLatestVersion(projectId: string): Version | undefined {
    const history = this.getVersionHistory(projectId, { limit: 1 });
    return history[0];
  }

  createBranch(
    projectId: string,
    name: string,
    description?: string,
    fromVersionId?: string
  ): Branch {
    const projectBranches = this.branches.get(projectId) || [];
    
    if (projectBranches.some(b => b.name === name)) {
      throw new Error(`Branch ${name} already exists`);
    }

    let headVersionId: string;
    
    if (fromVersionId) {
      headVersionId = fromVersionId;
    } else {
      const latest = this.getLatestVersion(projectId);
      headVersionId = latest?.id || '';
    }

    const branch: Branch = {
      id: this.generateId(),
      name,
      description,
      createdAt: new Date(),
      headVersionId
    };

    projectBranches.push(branch);
    this.branches.set(projectId, projectBranches);
    this.save(projectId);

    return branch;
  }

  switchBranch(projectId: string, branchName: string): void {
    const projectBranches = this.branches.get(projectId) || [];
    const branch = projectBranches.find(b => b.name === branchName);
    
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`);
    }

    this.currentBranch.set(projectId, branchName);
    this.save(projectId);
  }

  getBranches(projectId: string): Branch[] {
    return this.branches.get(projectId) || [];
  }

  getCurrentBranch(projectId: string): string {
    return this.currentBranch.get(projectId) || 'main';
  }

  deleteBranch(projectId: string, branchName: string): boolean {
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

    this.save(projectId);
    return true;
  }

  compareVersions(projectId: string, versionId1: string, versionId2: string): Diff[] {
    const v1 = this.getVersion(projectId, versionId1);
    const v2 = this.getVersion(projectId, versionId2);

    if (!v1 || !v2) {
      throw new Error('Version not found');
    }

    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');
    const diffs: Diff[] = [];

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

  private longestCommonSubsequence(arr1: string[], arr2: string[]): Array<{ index1: number; index2: number }> {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const result: Array<{ index1: number; index2: number }> = [];
    let i = m, j = n;

    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift({ index1: i - 1, index2: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return result;
  }

  getChangeStats(projectId: string, fromVersionId?: string, toVersionId?: string): ChangeStats {
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

  restoreVersion(projectId: string, versionId: string): Version {
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

  tagVersion(projectId: string, versionId: string, tag: string): void {
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

    this.save(projectId);
  }

  removeTag(projectId: string, versionId: string, tag: string): void {
    const projectVersions = this.versions.get(projectId) || [];
    const version = projectVersions.find(v => v.id === versionId);
    
    if (version && version.tags) {
      version.tags = version.tags.filter(t => t !== tag);
      this.save(projectId);
    }
  }

  getVersionsByTag(projectId: string, tag: string): Version[] {
    const projectVersions = this.versions.get(projectId) || [];
    return projectVersions.filter(v => v.tags && v.tags.includes(tag));
  }

  private generateId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async save(projectId: string): Promise<void> {
    try {
      const fs = require('fs');
      const dir = `${this.storagePath}/${projectId}`;
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        `${dir}/versions.json`,
        JSON.stringify(this.versions.get(projectId) || [], null, 2)
      );

      fs.writeFileSync(
        `${dir}/branches.json`,
        JSON.stringify(this.branches.get(projectId) || [], null, 2)
      );

      fs.writeFileSync(
        `${dir}/current_branch.json`,
        JSON.stringify(this.currentBranch.get(projectId) || 'main')
      );
    } catch (error) {
      console.error('Failed to save version history:', error);
    }
  }

  async load(projectId: string): Promise<void> {
    try {
      const fs = require('fs');
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
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  }
}

export default VersionHistoryManager;
