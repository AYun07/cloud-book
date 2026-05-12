/**
 * Cloud Book 上下文 - 管理前端与核心库的连接
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  NovelProject, 
  Chapter, 
  Character, 
  WorldSetting, 
  CloudBookConfig, 
  LLMConfig 
} from '@cloudbook/core';

// 模拟 CloudBook 核心库 API（实际打包时替换为真实导入）
const createMockCloudBook = () => ({
  projects: [],
  createProject: async (title: string, genre: string, mode: string) => ({
    id: 'proj_' + Date.now(),
    title,
    genre: genre as any,
    literaryGenre: 'novel',
    writingMode: mode as any,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    chapters: [],
    characters: [],
    truthFiles: {
      worldSetting: {},
      characterSheet: {},
      timeline: {},
      bible: {},
      styleGuide: {},
      lore: {}
    }
  } as NovelProject),
  generateChapter: async (projectId: string, chapterNum: number, params: any) => ({
    id: 'chap_' + Date.now(),
    number: chapterNum,
    title: `第${chapterNum}章`,
    status: 'draft',
    content: '正在生成章节内容...',
    wordCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Chapter),
  auditChapter: async (projectId: string, chapterId: string) => ({
    passed: true,
    score: 0.85,
    dimensions: [],
    issues: []
  }),
  humanize: async (text: string) => text,
  exportProjectFull: async (projectId: string, format: string, config?: any) => {
    return `导出 ${projectId} 为 ${format}`;
  }
});

export interface CloudBookContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  config: CloudBookConfig | null;
  projects: NovelProject[];
  currentProject: NovelProject | null;
  apiKeyConfigured: boolean;
  
  // 初始化和配置
  initialize: (config: CloudBookConfig) => Promise<void>;
  setAPIKey: (provider: string, apiKey: string) => void;
  configureLLM: (config: LLMConfig) => void;
  
  // 项目管理
  setCurrentProject: (project: NovelProject | null) => void;
  createProject: (title: string, genre: string, mode: string) => Promise<NovelProject>;
  loadProject: (projectId: string) => Promise<NovelProject | null>;
  saveProject: (project: NovelProject) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // 创作功能
  generateChapter: (
    projectId: string, 
    chapterNum: number, 
    params: any
  ) => Promise<Chapter>;
  continueWriting: (
    projectId: string, 
    chapterId: string, 
    additionalWords?: number
  ) => Promise<string>;
  rewriteSection: (
    projectId: string, 
    chapterId: string, 
    startIndex: number, 
    endIndex: number,
    instructions: string
  ) => Promise<string>;
  
  // 质量功能
  auditChapter: (projectId: string, chapterId: string) => Promise<any>;
  humanizeText: (text: string) => Promise<string>;
  
  // 导入导出
  importProject: (filePath: string, format?: string) => Promise<NovelProject>;
  exportProject: (projectId: string, format: string) => Promise<string>;
}

const CloudBookContext = createContext<CloudBookContextType | undefined>(undefined);

export const CloudBookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<CloudBookConfig | null>(null);
  const [projects, setProjects] = useState<NovelProject[]>([]);
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [cloudBook, setCloudBook] = useState<any>(null);

  // 初始化 Cloud Book
  const initialize = async (config: CloudBookConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      // 在实际环境中，这里会导入真实的 core 库
      // 这里使用模拟实现
      const instance = createMockCloudBook();
      setCloudBook(instance);
      setConfig(config);
      setIsInitialized(true);
      
      // 检查是否已配置 API Key
      const hasKey = config.llmConfigs?.some(c => c.apiKey) || false;
      setApiKeyConfigured(hasKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败');
    } finally {
      setIsLoading(false);
    }
  };

  const setAPIKey = (provider: string, apiKey: string) => {
    if (!config) return;
    const newConfigs = [...(config.llmConfigs || [])];
    const existingIndex = newConfigs.findIndex(c => c.provider === provider);
    
    if (existingIndex >= 0) {
      newConfigs[existingIndex].apiKey = apiKey;
    } else {
      newConfigs.push({
        name: provider,
        provider: provider as any,
        model: provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3' : 'deepseek-chat',
        apiKey
      });
    }
    
    setConfig({ ...config, llmConfigs: newConfigs });
    setApiKeyConfigured(true);
  };

  const configureLLM = (llmConfig: LLMConfig) => {
    if (!config) return;
    const newConfigs = [...(config.llmConfigs || [])];
    const existingIndex = newConfigs.findIndex(c => c.name === llmConfig.name);
    
    if (existingIndex >= 0) {
      newConfigs[existingIndex] = llmConfig;
    } else {
      newConfigs.push(llmConfig);
    }
    
    setConfig({ ...config, llmConfigs: newConfigs });
  };

  const createProject = async (title: string, genre: string, mode: string) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    const project = await cloudBook.createProject(title, genre, mode);
    setProjects([...projects, project]);
    return project;
  };

  const loadProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setCurrentProject(project);
    return project;
  };

  const saveProject = async (project: NovelProject) => {
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      const newProjects = [...projects];
      newProjects[index] = project;
      setProjects(newProjects);
    }
  };

  const deleteProject = async (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const generateChapter = async (projectId: string, chapterNum: number, params: any) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return await cloudBook.generateChapter(projectId, chapterNum, params);
  };

  const continueWriting = async (
    projectId: string, 
    chapterId: string, 
    additionalWords: number = 1000
  ) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return '继续生成...';
  };

  const rewriteSection = async (
    projectId: string, 
    chapterId: string, 
    startIndex: number, 
    endIndex: number,
    instructions: string
  ) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return '重写生成...';
  };

  const auditChapter = async (projectId: string, chapterId: string) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return await cloudBook.auditChapter(projectId, chapterId);
  };

  const humanizeText = async (text: string) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return await cloudBook.humanize(text);
  };

  const importProject = async (filePath: string, format?: string) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return await cloudBook.importProject(filePath, format);
  };

  const exportProject = async (projectId: string, format: string) => {
    if (!cloudBook) throw new Error('Cloud Book 未初始化');
    return await cloudBook.exportProjectFull(projectId, format);
  };

  const value: CloudBookContextType = {
    isInitialized,
    isLoading,
    error,
    config,
    projects,
    currentProject,
    apiKeyConfigured,
    initialize,
    setAPIKey,
    configureLLM,
    setCurrentProject,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    generateChapter,
    continueWriting,
    rewriteSection,
    auditChapter,
    humanizeText,
    importProject,
    exportProject
  };

  return (
    <CloudBookContext.Provider value={value}>
      {children}
    </CloudBookContext.Provider>
  );
};

export const useCloudBook = () => {
  const context = useContext(CloudBookContext);
  if (!context) {
    throw new Error('useCloudBook must be used within a CloudBookProvider');
  }
  return context;
};

export default CloudBookContext;
