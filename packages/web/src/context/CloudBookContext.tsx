/**
 * Cloud Book Context - 前端状态管理 V2
 * 真实集成核心库
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  NovelProject,
  Chapter,
  Character,
  WorldSetting,
  CloudBookConfig,
  LLMConfig,
  AuditResult,
  TruthFiles
} from '@cloudbook/core';

interface CloudBookContextType {
  // 状态
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  config: CloudBookConfig | null;
  projects: NovelProject[];
  currentProject: NovelProject | null;
  currentChapter: Chapter | null;
  apiKeyConfigured: boolean;
  
  // 初始化
  initialize: (config: CloudBookConfig) => Promise<void>;
  setAPIKey: (provider: string, apiKey: string, model?: string) => Promise<void>;
  configureLLM: (config: LLMConfig) => void;
  
  // 项目管理
  setCurrentProject: (project: NovelProject | null) => void;
  createProject: (title: string, genre: string, mode: string) => Promise<NovelProject>;
  loadProject: (projectId: string) => Promise<NovelProject | null>;
  saveProject: (project: NovelProject) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  listProjects: () => Promise<NovelProject[]>;
  
  // 章节管理
  setCurrentChapter: (chapter: Chapter | null) => void;
  createChapter: (projectId: string, title: string, number: number) => Promise<Chapter>;
  updateChapter: (projectId: string, chapter: Chapter) => Promise<void>;
  
  // 创作功能
  generateChapter: (
    projectId: string,
    chapterNum: number,
    params: {
      previousContent?: string;
      outline?: string;
      characterDescriptions?: string[];
      worldSetting?: string;
    }
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
  
  // 审计功能
  auditChapter: (
    projectId: string,
    chapterId: string,
    options?: {
      dimensions?: string[];
      threshold?: number;
    }
  ) => Promise<AuditResult>;
  
  humanizeText: (text: string, intensity?: number) => Promise<string>;
  
  // RAG知识库
  searchKnowledge: (query: string, topK?: number) => Promise<any[]>;
  addToKnowledge: (content: string, metadata?: Record<string, any>) => Promise<void>;
  
  // 知识图谱
  addCharacter: (projectId: string, character: Character) => Promise<void>;
  addRelationship: (projectId: string, sourceId: string, targetId: string, type: string) => Promise<void>;
  queryGraph: (startNodeId: string, depth?: number) => Promise<any[]>;
  
  // 导入导出
  importProject: (filePath: string, format?: string) => Promise<NovelProject>;
  exportProject: (projectId: string, format: string) => Promise<string>;
  
  // 工具
  parseNovel: (content: string) => Promise<any>;
  scrapeUrl: (url: string) => Promise<any>;
}

const CloudBookContext = createContext<CloudBookContextType | undefined>(undefined);

export const CloudBookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<CloudBookConfig | null>(null);
  const [projects, setProjects] = useState<NovelProject[]>([]);
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  
  // 核心模块实例
  const [coreInstances, setCoreInstances] = useState<{
    llmManager?: any;
    writingPipeline?: any;
    auditEngine?: any;
    creativeHub?: any;
    knowledgeGraph?: any;
    novelParser?: any;
    webScraper?: any;
  }>({});

  // 初始化 Cloud Book 核心
  const initialize = useCallback(async (cloudConfig: CloudBookConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 动态导入核心模块（实际环境）
      const { 
        LLMManager, 
        WritingPipeline, 
        AIAuditEngine, 
        CreativeHub, 
        KnowledgeGraphManager,
        NovelParser,
        WebScraper
      } = await import('@cloudbook/core');
      
      // 初始化 LLM Manager
      const llmManager = new LLMManager();
      
      // 配置 LLM
      if (cloudConfig.llmConfigs) {
        for (const llmConfig of cloudConfig.llmConfigs) {
          llmManager.addConfig(llmConfig);
        }
        if (cloudConfig.llmConfigs.length > 0) {
          llmManager.setDefault(cloudConfig.llmConfigs[0].name);
          setApiKeyConfigured(!!cloudConfig.llmConfigs[0].apiKey);
        }
      }
      
      // 初始化其他模块
      const writingPipeline = new WritingPipeline(llmManager);
      const auditEngine = new AIAuditEngine({
        dimensions: cloudConfig.auditConfig?.dimensions || [],
        threshold: cloudConfig.auditConfig?.threshold || 0.7,
        autoFix: cloudConfig.auditConfig?.autoFix || true,
        maxIterations: cloudConfig.auditConfig?.maxIterations || 3,
        useSemanticAnalysis: true
      });
      
      const creativeHub = new CreativeHub({
        provider: 'openai',
        apiKey: cloudConfig.llmConfigs?.[0]?.apiKey
      });
      
      const knowledgeGraph = new KnowledgeGraphManager();
      const novelParser = new NovelParser();
      const webScraper = new WebScraper();
      
      // 设置模块间引用
      auditEngine.setLLMProvider(llmManager);
      creativeHub.setLLMProvider(llmManager);
      
      setCoreInstances({
        llmManager,
        writingPipeline,
        auditEngine,
        creativeHub,
        knowledgeGraph,
        novelParser,
        webScraper
      });
      
      setConfig(cloudConfig);
      setIsInitialized(true);
      
      // 加载项目列表
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
      
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : '初始化失败');
      
      // 如果核心库导入失败，使用本地模拟
      setCoreInstances({});
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAPIKey = useCallback(async (provider: string, apiKey: string, model?: string) => {
    if (!config) return;
    
    const newConfigs = [...(config.llmConfigs || [])];
    const existingIndex = newConfigs.findIndex(c => c.provider === provider);
    
    const newConfig: LLMConfig = {
      name: provider,
      provider: provider as any,
      model: model || (provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'deepseek-chat'),
      apiKey
    };
    
    if (existingIndex >= 0) {
      newConfigs[existingIndex] = newConfig;
    } else {
      newConfigs.push(newConfig);
    }
    
    const newCloudConfig = { ...config, llmConfigs: newConfigs };
    setConfig(newCloudConfig);
    setApiKeyConfigured(true);
    
    // 重新初始化以应用新的 API Key
    await initialize(newCloudConfig);
  }, [config, initialize]);

  const configureLLM = useCallback((llmConfig: LLMConfig) => {
    if (!config) return;
    const newConfigs = [...(config.llmConfigs || [])];
    const existingIndex = newConfigs.findIndex(c => c.name === llmConfig.name);
    
    if (existingIndex >= 0) {
      newConfigs[existingIndex] = llmConfig;
    } else {
      newConfigs.push(llmConfig);
    }
    
    setConfig({ ...config, llmConfigs: newConfigs });
  }, [config]);

  const createProject = useCallback(async (title: string, genre: string, mode: string): Promise<NovelProject> => {
    const project: NovelProject = {
      id: `proj_${Date.now()}`,
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
    };
    
    // 保存到浏览器localStorage
    try {
      const projectsStr = localStorage.getItem('cloudbook_projects') || '[]';
      const projectsArr = JSON.parse(projectsStr);
      projectsArr.push(project);
      localStorage.setItem('cloudbook_projects', JSON.stringify(projectsArr));
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
    
    setProjects([...projects, project]);
    return project;
  }, [projects]);

  const loadProject = useCallback(async (projectId: string): Promise<NovelProject | null> => {
    const project = projects.find(p => p.id === projectId) || null;
    setCurrentProject(project);
    return project;
  }, [projects]);

  const saveProject = useCallback(async (project: NovelProject): Promise<void> => {
    const index = projects.findIndex(p => p.id === project.id);
    const updatedProject = { ...project, updatedAt: new Date() };
    
    if (index >= 0) {
      const newProjects = [...projects];
      newProjects[index] = updatedProject;
      setProjects(newProjects);
    } else {
      setProjects([...projects, updatedProject]);
    }
    
    if (currentProject?.id === project.id) {
      setCurrentProject(updatedProject);
    }
    
    // 保存到浏览器localStorage
    try {
      const projectsStr = localStorage.getItem('cloudbook_projects') || '[]';
      const projectsArr: NovelProject[] = JSON.parse(projectsStr);
      const index = projectsArr.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projectsArr[index] = updatedProject;
      } else {
        projectsArr.push(updatedProject);
      }
      localStorage.setItem('cloudbook_projects', JSON.stringify(projectsArr));
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }, [projects, currentProject]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setProjects(projects.filter(p => p.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    
    // 从浏览器localStorage删除
    try {
      const projectsStr = localStorage.getItem('cloudbook_projects') || '[]';
      const projectsArr: NovelProject[] = JSON.parse(projectsStr);
      const filtered = projectsArr.filter(p => p.id !== projectId);
      localStorage.setItem('cloudbook_projects', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }, [projects, currentProject]);

  const listProjects = useCallback(async (): Promise<NovelProject[]> => {
    try {
      const projectsStr = localStorage.getItem('cloudbook_projects') || '[]';
      const loadedProjects: NovelProject[] = JSON.parse(projectsStr);
      return loadedProjects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return [];
    }
  }, []);

  const createChapter = useCallback(async (projectId: string, title: string, number: number): Promise<Chapter> => {
    const chapter: Chapter = {
      id: `chap_${Date.now()}`,
      number,
      title,
      status: 'draft',
      content: '',
      wordCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (currentProject?.id === projectId) {
      const updatedProject = {
        ...currentProject,
        chapters: [...(currentProject.chapters || []), chapter],
        updatedAt: new Date()
      };
      await saveProject(updatedProject);
    }
    
    return chapter;
  }, [currentProject, saveProject]);

  const updateChapter = useCallback(async (projectId: string, chapter: Chapter): Promise<void> => {
    if (currentProject?.id === projectId) {
      const chapters = (currentProject.chapters || []).map(c => 
        c.id === chapter.id ? { ...chapter, updatedAt: new Date() } : c
      );
      const updatedProject = {
        ...currentProject,
        chapters,
        updatedAt: new Date()
      };
      await saveProject(updatedProject);
      setCurrentChapter(chapter);
    }
  }, [currentProject, saveProject]);

  // 核心创作功能
  const generateChapter = useCallback(async (
    projectId: string,
    chapterNum: number,
    params: {
      previousContent?: string;
      outline?: string;
      characterDescriptions?: string[];
      worldSetting?: string;
    }
  ): Promise<Chapter> => {
    setIsLoading(true);
    
    try {
      if (coreInstances.writingPipeline) {
        const result = await coreInstances.writingPipeline.generateChapter(
          projectId,
          chapterNum,
          params
        );
        
        const chapter: Chapter = {
          id: `chap_${Date.now()}`,
          number: chapterNum,
          title: result.title || `第${chapterNum}章`,
          status: 'draft',
          content: result.content || '',
          wordCount: result.content?.length || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await updateChapter(projectId, chapter);
        return chapter;
      }
      
      // 回退
      return {
        id: `chap_${Date.now()}`,
        number: chapterNum,
        title: `第${chapterNum}章`,
        status: 'draft',
        content: '请配置 LLM API Key 后生成内容',
        wordCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances, updateChapter]);

  const continueWriting = useCallback(async (
    projectId: string,
    chapterId: string,
    additionalWords: number = 1000
  ): Promise<string> => {
    if (!coreInstances.writingPipeline || !currentChapter) {
      return '请先选择章节并配置 API Key';
    }
    
    setIsLoading(true);
    try {
      const result = await coreInstances.writingPipeline.continueWriting(
        currentChapter.content,
        additionalWords,
        {
          projectId,
          chapterId
        }
      );
      
      // 更新章节内容
      const updatedChapter = {
        ...currentChapter,
        content: currentChapter.content + result,
        wordCount: (currentChapter.content + result).length,
        updatedAt: new Date()
      };
      
      await updateChapter(projectId, updatedChapter);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances, currentChapter, updateChapter]);

  const rewriteSection = useCallback(async (
    projectId: string,
    chapterId: string,
    startIndex: number,
    endIndex: number,
    instructions: string
  ): Promise<string> => {
    if (!coreInstances.writingPipeline || !currentChapter) {
      return '请先选择章节并配置 API Key';
    }
    
    setIsLoading(true);
    try {
      const section = currentChapter.content.slice(startIndex, endIndex);
      
      const result = await coreInstances.writingPipeline.rewriteSection(
        section,
        instructions,
        {
          projectId,
          chapterId
        }
      );
      
      // 更新章节内容
      const newContent = 
        currentChapter.content.slice(0, startIndex) + 
        result + 
        currentChapter.content.slice(endIndex);
      
      const updatedChapter = {
        ...currentChapter,
        content: newContent,
        wordCount: newContent.length,
        updatedAt: new Date()
      };
      
      await updateChapter(projectId, updatedChapter);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances, currentChapter, updateChapter]);

  const auditChapter = useCallback(async (
    projectId: string,
    chapterId: string,
    options?: { dimensions?: string[]; threshold?: number }
  ): Promise<AuditResult> => {
    if (!coreInstances.auditEngine || !currentChapter) {
      return {
        passed: false,
        dimensions: [],
        issues: [],
        score: 0
      };
    }
    
    setIsLoading(true);
    try {
      const truthFiles: TruthFiles = currentProject?.truthFiles || {};
      
      const result = await coreInstances.auditEngine.audit(
        currentChapter.content,
        truthFiles
      );
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances, currentChapter, currentProject]);

  const humanizeText = useCallback(async (text: string, intensity: number = 5): Promise<string> => {
    if (!coreInstances.llmManager) {
      return text;
    }
    
    setIsLoading(true);
    try {
      const prompt = `请将以下文本改写得更自然、更有文采，降低AI生成痕迹。保持原有意思不变，但改变句式、用词和表达方式。强度：${intensity}/10。

原文：
${text}

改写后（请直接输出改写结果，不要添加解释）：`;
      
      const response = await coreInstances.llmManager.generate(prompt, {
        temperature: 0.8,
        maxTokens: text.length * 2
      });
      
      return response.text || text;
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances]);

  const searchKnowledge = useCallback(async (query: string, topK: number = 5): Promise<any[]> => {
    if (!coreInstances.creativeHub) {
      return [];
    }
    
    const results = await coreInstances.creativeHub.search(query, topK);
    return results;
  }, [coreInstances]);

  const addToKnowledge = useCallback(async (content: string, metadata?: Record<string, any>): Promise<void> => {
    if (!coreInstances.creativeHub) {
      return;
    }
    
    await coreInstances.creativeHub.addDocument(content, metadata);
  }, [coreInstances]);

  const addCharacter = useCallback(async (projectId: string, character: Character): Promise<void> => {
    if (!coreInstances.knowledgeGraph || !currentProject) {
      return;
    }
    
    const node = await coreInstances.knowledgeGraph.addNode(
      'character',
      character.name,
      {
        description: character.description,
        traits: character.traits,
        projectId
      }
    );
    
    // 保存节点ID到项目
    const updatedCharacters = [...(currentProject.characters || []), {
      ...character,
      graphNodeId: node.id
    }];
    
    const updatedProject = {
      ...currentProject,
      characters: updatedCharacters,
      updatedAt: new Date()
    };
    
    await saveProject(updatedProject);
  }, [coreInstances, currentProject, saveProject]);

  const addRelationship = useCallback(async (
    projectId: string,
    sourceId: string,
    targetId: string,
    type: string
  ): Promise<void> => {
    if (!coreInstances.knowledgeGraph) {
      return;
    }
    
    await coreInstances.knowledgeGraph.addRelationship(
      sourceId,
      targetId,
      type
    );
  }, [coreInstances]);

  const queryGraph = useCallback(async (startNodeId: string, depth: number = 3): Promise<any[]> => {
    if (!coreInstances.knowledgeGraph) {
      return [];
    }
    
    const nodes = coreInstances.knowledgeGraph.traverseBFS(startNodeId, { maxDepth: depth });
    return nodes;
  }, [coreInstances]);

  const importProject = useCallback(async (filePath: string, format?: string): Promise<NovelProject> => {
    if (!coreInstances.novelParser) {
      throw new Error('Parser not initialized');
    }
    
    setIsLoading(true);
    try {
      const result = await coreInstances.novelParser.parseFile(filePath);
      
      const project: NovelProject = {
        id: `imported_${Date.now()}`,
        title: result.title || '导入项目',
        genre: (result.metadata?.genre as any) || 'novel',
        literaryGenre: 'novel',
        writingMode: 'original',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: result.chapters || [],
        characters: result.characters || []
      };
      
      await saveProject(project);
      setProjects([...projects, project]);
      
      return project;
    } finally {
      setIsLoading(false);
    }
  }, [coreInstances, projects, saveProject]);

  const exportProject = useCallback(async (projectId: string, format: string): Promise<string> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const { ExportManager } = await import('@cloudbook/core');
    const exporter = new ExportManager();
    
    return exporter.exportProject(project, format as any);
  }, [projects]);

  const parseNovel = useCallback(async (content: string): Promise<any> => {
    if (!coreInstances.novelParser) {
      throw new Error('Parser not initialized');
    }
    
    return coreInstances.novelParser.parseString(content);
  }, [coreInstances]);

  const scrapeUrl = useCallback(async (url: string): Promise<any> => {
    if (!coreInstances.webScraper) {
      throw new Error('WebScraper not initialized');
    }
    
    return coreInstances.webScraper.scrape(url);
  }, [coreInstances]);

  const value: CloudBookContextType = {
    isInitialized,
    isLoading,
    error,
    config,
    projects,
    currentProject,
    currentChapter,
    apiKeyConfigured,
    initialize,
    setAPIKey,
    configureLLM,
    setCurrentProject,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    listProjects,
    setCurrentChapter,
    createChapter,
    updateChapter,
    generateChapter,
    continueWriting,
    rewriteSection,
    auditChapter,
    humanizeText,
    searchKnowledge,
    addToKnowledge,
    addCharacter,
    addRelationship,
    queryGraph,
    importProject,
    exportProject,
    parseNovel,
    scrapeUrl
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
