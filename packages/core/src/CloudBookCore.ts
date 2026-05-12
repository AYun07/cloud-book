/**
 * Cloud Book - 核心协调器
 * 单一职责：协调各子系统，不直接实现业务逻辑
 */

import { CloudBookError, handleError } from './utils/errors.js';
import { UnifiedStorage } from './utils/storage.js';

export interface CloudBookConfig {
  storage?: UnifiedStorage;
  enableEncryption?: boolean;
  encryptionKey?: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: 'draft' | 'writing' | 'completed' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingResult {
  chapter: Chapter;
  success: boolean;
  metadata: {
    tokensUsed: number;
    cost: number;
    duration: number;
  };
}

export class CloudBookCore {
  private storage: UnifiedStorage;
  private config: CloudBookConfig;

  constructor(config: CloudBookConfig = {}) {
    this.config = config;
    this.storage = config.storage || new UnifiedStorage({
      encryptionKey: config.encryptionKey,
      enableBackup: true,
      maxBackups: 5
    });
  }

  async initialize(): Promise<void> {
    await this.storage.write('meta/version.json', JSON.stringify({ version: '1.0.0' }));
  }

  async createProject(title: string, genre: string): Promise<Project> {
    try {
      const project: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        genre,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storage.batchWrite([
        { path: `projects/${project.id}/meta.json`, content: JSON.stringify(project) },
        { path: `projects/${project.id}/chapters/index.json`, content: JSON.stringify([]) },
        { path: `projects/${project.id}/characters/index.json`, content: JSON.stringify([]) },
        { path: `projects/${project.id}/world/index.json`, content: JSON.stringify({ characters: [], locations: [], factions: [], timeline: [] }) }
      ]);

      return project;
    } catch (error) {
      throw handleError(error, 'CloudBook.createProject');
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const content = await this.storage.read(`projects/${projectId}/meta.json`);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof CloudBookError && error.code === 'STORAGE_ERROR') {
        return null;
      }
      throw handleError(error, 'CloudBook.getProject');
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      const files = await this.storage.list('projects', { recursive: false });
      const projects: Project[] = [];

      for (const file of files) {
        if (file.endsWith('/meta.json')) {
          const content = await this.storage.read(file);
          projects.push(JSON.parse(content));
        }
      }

      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      throw handleError(error, 'CloudBook.listProjects');
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const updatedProject: Project = {
        ...project,
        ...updates,
        id: project.id,
        createdAt: project.createdAt,
        updatedAt: new Date()
      };

      await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(updatedProject));
      return updatedProject;
    } catch (error) {
      throw handleError(error, 'CloudBook.updateProject');
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const files = await this.storage.list(`projects/${projectId}`, { recursive: true });
      for (const file of files) {
        await this.storage.delete(file, { createBackup: false });
      }
    } catch (error) {
      throw handleError(error, 'CloudBook.deleteProject');
    }
  }

  async createChapter(projectId: string, title: string, content: string = ''): Promise<Chapter> {
    try {
      const chapter: Chapter = {
        id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        title,
        content,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
      const chapters: Chapter[] = JSON.parse(indexContent);
      chapters.push(chapter);
      await this.storage.batchWrite([
        { path: `projects/${projectId}/chapters/${chapter.id}.json`, content: JSON.stringify(chapter) },
        { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(chapters) }
      ]);

      return chapter;
    } catch (error) {
      throw handleError(error, 'CloudBook.createChapter');
    }
  }

  async getChapter(projectId: string, chapterId: string): Promise<Chapter | null> {
    try {
      const content = await this.storage.read(`projects/${projectId}/chapters/${chapterId}.json`);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof CloudBookError && error.code === 'STORAGE_ERROR') {
        return null;
      }
      throw handleError(error, 'CloudBook.getChapter');
    }
  }

  async listChapters(projectId: string): Promise<Chapter[]> {
    try {
      const content = await this.storage.read(`projects/${projectId}/chapters/index.json`);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof CloudBookError && error.code === 'STORAGE_ERROR') {
        return [];
      }
      throw handleError(error, 'CloudBook.listChapters');
    }
  }

  async updateChapter(projectId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter> {
    try {
      const chapter = await this.getChapter(projectId, chapterId);
      if (!chapter) {
        throw new CloudBookError('Chapter not found', 'NOT_FOUND', { chapterId }, 404);
      }

      const updatedChapter: Chapter = {
        ...chapter,
        ...updates,
        id: chapter.id,
        projectId: chapter.projectId,
        createdAt: chapter.createdAt,
        updatedAt: new Date()
      };

      const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
      const chapters: Chapter[] = JSON.parse(indexContent);
      const index = chapters.findIndex(c => c.id === chapterId);
      if (index >= 0) {
        chapters[index] = updatedChapter;
      }

      await this.storage.batchWrite([
        { path: `projects/${projectId}/chapters/${chapterId}.json`, content: JSON.stringify(updatedChapter) },
        { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(chapters) }
      ]);

      return updatedChapter;
    } catch (error) {
      throw handleError(error, 'CloudBook.updateChapter');
    }
  }

  async deleteChapter(projectId: string, chapterId: string): Promise<void> {
    try {
      const indexContent = await this.storage.read(`projects/${projectId}/chapters/index.json`);
      const chapters: Chapter[] = JSON.parse(indexContent);
      const filtered = chapters.filter(c => c.id !== chapterId);

      await this.storage.batchWrite([
        { path: `projects/${projectId}/chapters/${chapterId}.json`, content: '' },
        { path: `projects/${projectId}/chapters/index.json`, content: JSON.stringify(filtered) }
      ]);

      await this.storage.delete(`projects/${projectId}/chapters/${chapterId}.json`);
    } catch (error) {
      throw handleError(error, 'CloudBook.deleteChapter');
    }
  }

  async exportProject(projectId: string, format: 'json' | 'markdown' | 'text'): Promise<string> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const chapters = await this.listChapters(projectId);

      switch (format) {
        case 'json':
          return JSON.stringify({ project, chapters }, null, 2);

        case 'markdown':
          let md = `# ${project.title}\n\n`;
          md += `**类型**: ${project.genre}\n\n`;
          md += `---\n\n`;
          for (const chapter of chapters) {
            md += `## ${chapter.title}\n\n`;
            md += `${chapter.content}\n\n`;
            md += `---\n\n`;
          }
          return md;

        case 'text':
          let txt = `${project.title}\n`;
          txt += `${'='.repeat(project.title.length)}\n\n`;
          for (const chapter of chapters) {
            txt += `${chapter.title}\n`;
            txt += `${'-'.repeat(chapter.title.length)}\n\n`;
            txt += `${chapter.content}\n\n`;
          }
          return txt;

        default:
          throw new CloudBookError(`Unsupported format: ${format}`, 'VALIDATION_ERROR');
      }
    } catch (error) {
      throw handleError(error, 'CloudBook.exportProject');
    }
  }

  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    const stats = this.storage.getStats();
    return {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize
    };
  }

  destroy(): void {
    this.storage.destroy();
  }
}

export const cloudBook = new CloudBookCore();
