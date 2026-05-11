/**
 * Cloud Book - 本地存储模块
 * 实现项目数据的本地持久化
 */

import * as fs from 'fs';
import * as path from 'path';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export interface StorageConfig {
  basePath: string;
}

export interface ProjectData {
  id: string;
  title: string;
  genre: string;
  language: string;
  creationMode: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    worldSettings?: any;
    characterProfiles?: any;
    plotOutline?: any;
    styleFingerprint?: any;
  };
  chapters: ChapterData[];
  cards: CardData[];
  versions: VersionData[];
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  status: 'draft' | 'revised' | 'final';
  createdAt: string;
  updatedAt: string;
  auditResult?: any;
}

export interface CardData {
  id: string;
  type: 'character' | 'location' | 'item' | 'event' | 'world';
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

export interface VersionData {
  id: string;
  timestamp: string;
  description: string;
  type: 'auto' | 'manual';
  data: any;
}

export class LocalStorage {
  private basePath: string;
  private projectsPath: string;

  constructor(config: StorageConfig) {
    this.basePath = config.basePath || './cloud-book-data';
    this.projectsPath = path.join(this.basePath, 'projects');
    this.ensureDirectory(this.projectsPath);
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getProjectPath(projectId: string): string {
    return path.join(this.projectsPath, projectId);
  }

  // ==================== 项目管理 ====================

  async createProject(data: Partial<ProjectData>): Promise<ProjectData> {
    const project: ProjectData = {
      id: generateId(),
      title: data.title || '未命名项目',
      genre: data.genre || 'fantasy',
      language: data.language || 'zh-CN',
      creationMode: data.creationMode || 'original',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: data.settings || {},
      chapters: [],
      cards: [],
      versions: []
    };

    const projectPath = this.getProjectPath(project.id);
    this.ensureDirectory(projectPath);
    
    await this.writeJSON(path.join(projectPath, 'project.json'), project);
    
    return project;
  }

  async getProject(projectId: string): Promise<ProjectData | null> {
    const filePath = path.join(this.getProjectPath(projectId), 'project.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return this.readJSON(filePath);
  }

  async updateProject(projectId: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const updated = {
      ...project,
      ...data,
      updatedAt: new Date().toISOString()
    };

    const projectPath = this.getProjectPath(projectId);
    await this.writeJSON(path.join(projectPath, 'project.json'), updated);

    // 保存自动版本
    await this.saveAutoVersion(projectId, 'project', updated);

    return updated;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const projectPath = this.getProjectPath(projectId);
    if (!fs.existsSync(projectPath)) {
      return false;
    }

    fs.rmSync(projectPath, { recursive: true, force: true });
    return true;
  }

  async listProjects(): Promise<ProjectData[]> {
    this.ensureDirectory(this.projectsPath);
    
    const dirs = fs.readdirSync(this.projectsPath);
    const projects: ProjectData[] = [];

    for (const dir of dirs) {
      const projectPath = path.join(this.projectsPath, dir);
      const projectFile = path.join(projectPath, 'project.json');
      
      if (fs.statSync(projectPath).isDirectory() && fs.existsSync(projectFile)) {
        try {
          const project = await this.readJSON(projectFile);
          projects.push(project);
        } catch (e) {
          console.error(`Failed to read project ${dir}:`, e);
        }
      }
    }

    return projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // ==================== 章节管理 ====================

  async addChapter(projectId: string, chapter: Partial<ChapterData>): Promise<ChapterData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const newChapter: ChapterData = {
      id: generateId(),
      number: chapter.number || project.chapters.length + 1,
      title: chapter.title || `第${chapter.number || project.chapters.length + 1}章`,
      content: chapter.content || '',
      wordCount: this.countWords(chapter.content || ''),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    project.chapters.push(newChapter);
    await this.updateProject(projectId, { chapters: project.chapters });

    return newChapter;
  }

  async updateChapter(projectId: string, chapterId: string, data: Partial<ChapterData>): Promise<ChapterData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) {
      return null;
    }

    const updatedChapter: ChapterData = {
      ...project.chapters[chapterIndex],
      ...data,
      wordCount: data.content ? this.countWords(data.content) : project.chapters[chapterIndex].wordCount,
      updatedAt: new Date().toISOString()
    };

    project.chapters[chapterIndex] = updatedChapter;
    await this.updateProject(projectId, { chapters: project.chapters });

    return updatedChapter;
  }

  async deleteChapter(projectId: string, chapterId: string): Promise<boolean> {
    const project = await this.getProject(projectId);
    if (!project) {
      return false;
    }

    const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) {
      return false;
    }

    project.chapters.splice(chapterIndex, 1);
    await this.updateProject(projectId, { chapters: project.chapters });

    return true;
  }

  // ==================== 卡片管理 ====================

  async addCard(projectId: string, card: Partial<CardData>): Promise<CardData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const newCard: CardData = {
      id: generateId(),
      type: card.type || 'world',
      title: card.title || '未命名卡片',
      content: card.content || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    project.cards.push(newCard);
    await this.updateProject(projectId, { cards: project.cards });

    return newCard;
  }

  async updateCard(projectId: string, cardId: string, data: Partial<CardData>): Promise<CardData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const cardIndex = project.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return null;
    }

    const updatedCard: CardData = {
      ...project.cards[cardIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    project.cards[cardIndex] = updatedCard;
    await this.updateProject(projectId, { cards: project.cards });

    return updatedCard;
  }

  async deleteCard(projectId: string, cardId: string): Promise<boolean> {
    const project = await this.getProject(projectId);
    if (!project) {
      return false;
    }

    const cardIndex = project.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return false;
    }

    project.cards.splice(cardIndex, 1);
    await this.updateProject(projectId, { cards: project.cards });

    return true;
  }

  // ==================== 版本历史 ====================

  async saveAutoVersion(projectId: string, type: string, data: any): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const version: VersionData = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      description: `自动保存 - ${type}`,
      type: 'auto',
      data
    };

    project.versions.push(version);

    // 只保留最近50个版本
    if (project.versions.length > 50) {
      project.versions = project.versions.slice(-50);
    }

    await this.writeJSON(
      path.join(this.getProjectPath(projectId), 'project.json'),
      project
    );
  }

  async saveManualVersion(projectId: string, description: string, data: any): Promise<VersionData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const version: VersionData = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      description,
      type: 'manual',
      data
    };

    project.versions.push(version);
    await this.updateProject(projectId, { versions: project.versions });

    return version;
  }

  async getVersions(projectId: string, limit?: number): Promise<VersionData[]> {
    const project = await this.getProject(projectId);
    if (!project) {
      return [];
    }

    const versions = [...project.versions].reverse();
    return limit ? versions.slice(0, limit) : versions;
  }

  async restoreVersion(projectId: string, versionId: string): Promise<ProjectData | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const version = project.versions.find(v => v.id === versionId);
    if (!version) {
      return null;
    }

    const restored = {
      ...version.data,
      id: project.id,
      updatedAt: new Date().toISOString()
    };

    return this.updateProject(projectId, restored);
  }

  // ==================== 导出功能 ====================

  async exportChapter(projectId: string, chapterId: string, format: 'txt' | 'md'): Promise<string | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const chapter = project.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return null;
    }

    if (format === 'md') {
      return `# ${chapter.title}\n\n${chapter.content}`;
    }

    return chapter.content;
  }

  async exportProject(projectId: string, format: 'txt' | 'md' | 'json'): Promise<string | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    switch (format) {
      case 'json':
        return JSON.stringify(project, null, 2);
      
      case 'md':
        let md = `# ${project.title}\n\n`;
        md += `## 设定\n\n`;
        if (project.settings.worldSettings) {
          md += JSON.stringify(project.settings.worldSettings, null, 2) + '\n\n';
        }
        md += `## 角色\n\n`;
        if (project.settings.characterProfiles) {
          md += JSON.stringify(project.settings.characterProfiles, null, 2) + '\n\n';
        }
        md += `## 正文\n\n`;
        for (const chapter of project.chapters) {
          md += `### ${chapter.title}\n\n${chapter.content}\n\n---\n\n`;
        }
        return md;
      
      case 'txt':
      default:
        let txt = `${project.title}\n\n`;
        for (const chapter of project.chapters) {
          txt += `${chapter.title}\n\n${chapter.content}\n\n\n`;
        }
        return txt;
    }
  }

  // ==================== 工具方法 ====================

  private async readJSON(filePath: string): Promise<any> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async writeJSON(filePath: string, data: any): Promise<void> {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private countWords(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  async getStorageStats(): Promise<{ projectCount: number; totalChapters: number; totalSize: number }> {
    const projects = await this.listProjects();
    let totalChapters = 0;
    let totalSize = 0;

    for (const project of projects) {
      totalChapters += project.chapters.length;
      const projectPath = this.getProjectPath(project.id);
      totalSize += this.getDirectorySize(projectPath);
    }

    return {
      projectCount: projects.length,
      totalChapters,
      totalSize
    };
  }

  private getDirectorySize(dirPath: string): number {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  }

  async clearAllData(): Promise<void> {
    if (fs.existsSync(this.projectsPath)) {
      fs.rmSync(this.projectsPath, { recursive: true, force: true });
    }
    this.ensureDirectory(this.projectsPath);
  }
}

export default LocalStorage;
