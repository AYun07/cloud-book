/**
 * Cloud Book - 核心引擎
 * 基于统一存储的简化实现
 */

import * as fs from 'fs';
import * as path from 'path';
import { UnifiedStorage } from './utils/storage';
import { CloudBookError, handleError } from './utils/errors';
import { LLMManager } from './modules/LLMProvider/LLMManager';
import { MemoryManager } from './modules/Memory/MemoryManager';
import { NovelProject, Chapter, Character, WorldSetting, TruthFiles, ChapterSummary } from './types';

export class CloudBookCore {
  private storage: UnifiedStorage;
  private llmManager: LLMManager;
  private memoryManager: MemoryManager;

  constructor(options: { 
    storage?: UnifiedStorage;
    llmManager?: LLMManager;
    dataPath?: string;
  } = {}) {
    this.storage = options.storage || new UnifiedStorage({
      basePath: options.dataPath || './data/cloudbook'
    });
    this.llmManager = options.llmManager || new LLMManager();
    this.memoryManager = new MemoryManager();
  }

  async initialize(): Promise<void> {
    await this.memoryManager.initialize('default');
    console.log('CloudBook 初始化完成');
  }

  async createProject(title: string, genre: string = 'fantasy'): Promise<NovelProject> {
    try {
      const project: NovelProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        genre: genre as any,
        literaryGenre: 'novel',
        writingMode: 'original',
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storage.write(`projects/${project.id}/meta.json`, JSON.stringify(project));
      await this.storage.write(`projects/${project.id}/chapters/index.json`, JSON.stringify([]));
      await this.storage.write(`projects/${project.id}/characters/index.json`, JSON.stringify([]));

      return project;
    } catch (error) {
      throw handleError(error, 'CloudBook.createProject');
    }
  }

  async getProject(projectId: string): Promise<NovelProject | null> {
    try {
      const content = await this.storage.read(`projects/${projectId}/meta.json`);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async listProjects(): Promise<NovelProject[]> {
    try {
      const allFiles: string[] = [];
      const listDir = async (dirPath: string) => {
        try {
          const files = await this.storage.list(dirPath);
          for (const file of files) {
            if (file === '.gitkeep') continue;
            const fullPath = dirPath ? `${dirPath}/${file}` : file;
            try {
              const isDir = await this.storage.exists(fullPath);
              if (isDir) {
                await listDir(fullPath);
              } else {
                allFiles.push(fullPath);
              }
            } catch {}
          }
        } catch {}
      };

      try {
        await listDir('projects');
      } catch {}

      const projects: NovelProject[] = [];
      for (const file of allFiles) {
        if (file.endsWith('meta.json') && file.includes('/projects/')) {
          try {
            const content = await this.storage.read(file);
            projects.push(JSON.parse(content));
          } catch {}
        }
      }

      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      throw handleError(error, 'CloudBook.listProjects');
    }
  }

  async updateProject(projectId: string, updates: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const updatedProject: NovelProject = {
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
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const allFiles: string[] = [];
      const listDir = async (dirPath: string) => {
        try {
          const files = await this.storage.list(dirPath);
          for (const file of files) {
            if (file === '.gitkeep') continue;
            const fullPath = dirPath ? `${dirPath}/${file}` : file;
            try {
              const isDir = await this.storage.exists(fullPath);
              if (isDir) {
                await listDir(fullPath);
              } else {
                allFiles.push(fullPath);
              }
            } catch {}
          }
        } catch {}
      };

      await listDir(`projects/${projectId}`);

      for (const file of allFiles.reverse()) {
        try {
          await this.storage.delete(file, false);
        } catch {}
      }

      try {
        await this.storage.delete(`projects/${projectId}`, false);
      } catch {}
    } catch (error) {
      throw handleError(error, 'CloudBook.deleteProject');
    }
  }

  async createChapter(projectId: string, title: string, content: string = ''): Promise<Chapter> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const chapters: Chapter[] = project.chapters || [];
      const chapterNumber = chapters.length + 1;
      
      const chapter: Chapter = {
        id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        number: chapterNumber,
        title,
        status: 'outline',
        wordCount: this.countWords(content),
        content: content
      };

      chapters.push(chapter);
      project.chapters = chapters;
      project.updatedAt = new Date();

      await this.storage.write(`projects/${projectId}/chapters/ch_${chapter.id}.json`, JSON.stringify(chapter));
      await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));

      return chapter;
    } catch (error) {
      throw handleError(error, 'CloudBook.createChapter');
    }
  }

  async getChapter(projectId: string, chapterId: string): Promise<Chapter | null> {
    try {
      const content = await this.storage.read(`projects/${projectId}/chapters/ch_${chapterId}.json`);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async updateChapter(projectId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter> {
    try {
      const chapter = await this.getChapter(projectId, chapterId);
      if (!chapter) {
        throw new CloudBookError('Chapter not found', 'NOT_FOUND', { projectId, chapterId }, 404);
      }

      const updatedChapter: Chapter = {
        ...chapter,
        ...updates,
        id: chapter.id,
        number: chapter.number
      };

      if (updates.content !== undefined) {
        updatedChapter.wordCount = this.countWords(updates.content);
      }

      await this.storage.write(
        `projects/${projectId}/chapters/ch_${chapterId}.json`,
        JSON.stringify(updatedChapter)
      );

      const project = await this.getProject(projectId);
      if (project && project.chapters) {
        const chapterIndex = project.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex !== -1) {
          project.chapters[chapterIndex] = {
            id: chapter.id,
            number: updatedChapter.number,
            title: updatedChapter.title,
            status: updatedChapter.status,
            wordCount: updatedChapter.wordCount
          };
          project.updatedAt = new Date();
          await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
        }
      }

      return updatedChapter;
    } catch (error) {
      throw handleError(error, 'CloudBook.updateChapter');
    }
  }

  async deleteChapter(projectId: string, chapterId: string): Promise<void> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      await this.storage.delete(`projects/${projectId}/chapters/ch_${chapterId}.json`, false);

      if (project.chapters) {
        project.chapters = project.chapters.filter(c => c.id !== chapterId);
        project.chapters.forEach((c, i) => {
          c.number = i + 1;
        });
        project.updatedAt = new Date();
        await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
      }
    } catch (error) {
      throw handleError(error, 'CloudBook.deleteChapter');
    }
  }

  async createCharacter(projectId: string, character: Omit<Character, 'id'>): Promise<Character> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
      }

      const fullCharacter: Character = {
        ...character,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await this.storage.write(
        `projects/${projectId}/characters/char_${fullCharacter.id}.json`,
        JSON.stringify(fullCharacter)
      );

      const characters = project.characters || [];
      characters.push({
        id: fullCharacter.id,
        name: fullCharacter.name
      });
      project.characters = characters;
      project.updatedAt = new Date();
      await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));

      return fullCharacter;
    } catch (error) {
      throw handleError(error, 'CloudBook.createCharacter');
    }
  }

  async getCharacter(projectId: string, characterId: string): Promise<Character | null> {
    try {
      const content = await this.storage.read(`projects/${projectId}/characters/char_${characterId}.json`);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async updateCharacter(projectId: string, characterId: string, updates: Partial<Character>): Promise<Character> {
    try {
      const character = await this.getCharacter(projectId, characterId);
      if (!character) {
        throw new CloudBookError('Character not found', 'NOT_FOUND', { projectId, characterId }, 404);
      }

      const updatedCharacter: Character = {
        ...character,
        ...updates,
        id: character.id
      };

      await this.storage.write(
        `projects/${projectId}/characters/char_${characterId}.json`,
        JSON.stringify(updatedCharacter)
      );

      return updatedCharacter;
    } catch (error) {
      throw handleError(error, 'CloudBook.updateCharacter');
    }
  }

  async deleteCharacter(projectId: string, characterId: string): Promise<void> {
    try {
      await this.storage.delete(`projects/${projectId}/characters/char_${characterId}.json`, false);

      const project = await this.getProject(projectId);
      if (project && project.characters) {
        project.characters = project.characters.filter(c => c.id !== characterId);
        project.updatedAt = new Date();
        await this.storage.write(`projects/${projectId}/meta.json`, JSON.stringify(project));
      }
    } catch (error) {
      throw handleError(error, 'CloudBook.deleteCharacter');
    }
  }

  async getTruthFiles(projectId: string): Promise<TruthFiles> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new CloudBookError('Project not found', 'NOT_FOUND', { projectId }, 404);
    }

    const characters: Character[] = [];
    if (project.characters) {
      for (const char of project.characters) {
        const fullChar = await this.getCharacter(projectId, char.id);
        if (fullChar) characters.push(fullChar);
      }
    }

    const chapters: Chapter[] = [];
    if (project.chapters) {
      for (const ch of project.chapters) {
        const fullCh = await this.getChapter(projectId, ch.id);
        if (fullCh) chapters.push(fullCh);
      }
    }

    const summaries: ChapterSummary[] = chapters.map(c => ({
      chapterId: c.id,
      chapterNumber: c.number,
      title: c.title,
      summary: c.summary || c.content?.slice(0, 200) || '',
      charactersPresent: c.characters || [],
      keyEvents: [],
      worldStateChanges: [],
      emotionalBeat: '',
      pacingNote: ''
    }));

    return {
      currentState: {
        protagonist: {
          id: characters[0]?.id || '',
          name: characters[0]?.name || '',
          location: '',
          status: ''
        },
        knownFacts: [],
        currentConflicts: [],
        relationshipSnapshot: {},
        activeSubplots: []
      },
      particleLedger: [],
      pendingHooks: [],
      chapterSummaries: summaries,
      subplotBoard: [],
      emotionalArcs: [],
      characterMatrix: []
    };
  }

  private countWords(text: string): number {
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (text.match(/[a-zA-Z]+/g) || []).length;
    return chinese + english;
  }

  async close(): Promise<void> {
    await this.storage.close();
  }
}
