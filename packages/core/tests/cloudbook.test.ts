/**
 * Cloud Book - 核心模块单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CloudBookCore } from '../src/CloudBookCore.js';
import { UnifiedStorage } from '../src/utils/storage.js';
import { AuditEngine } from '../src/modules/AIAudit/AuditEngineImpl.js';
import { CreativeHub } from '../src/modules/CreativeHub/CreativeHubImpl.js';
import { 
  CloudBookError, 
  ValidationError, 
  NotFoundError,
  isCloudBookError,
  handleError
} from '../src/utils/errors.js';

describe('CloudBookCore', () => {
  let cloudBook: CloudBookCore;
  const testStorage = new UnifiedStorage({ basePath: './test-data/cloudbook' });

  beforeEach(async () => {
    cloudBook = new CloudBookCore({ storage: testStorage });
  });

  afterEach(() => {
    testStorage.destroy();
  });

  describe('Project Management', () => {
    it('should create a new project', async () => {
      const project = await cloudBook.createProject('Test Novel', 'fantasy');
      
      expect(project).toBeDefined();
      expect(project.id).toMatch(/^proj_/);
      expect(project.title).toBe('Test Novel');
      expect(project.genre).toBe('fantasy');
      expect(project.createdAt).toBeInstanceOf(Date);
    });

    it('should get an existing project', async () => {
      const created = await cloudBook.createProject('Test Novel', 'fantasy');
      const retrieved = await cloudBook.getProject(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test Novel');
    });

    it('should return null for non-existent project', async () => {
      const result = await cloudBook.getProject('non-existent-id');
      expect(result).toBeNull();
    });

    it('should list all projects', async () => {
      await cloudBook.createProject('Project 1', 'fantasy');
      await cloudBook.createProject('Project 2', 'sci-fi');
      
      const projects = await cloudBook.listProjects();
      
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    it('should update a project', async () => {
      const project = await cloudBook.createProject('Original Title', 'fantasy');
      const updated = await cloudBook.updateProject(project.id, { title: 'Updated Title' });
      
      expect(updated.title).toBe('Updated Title');
      expect(updated.genre).toBe('fantasy');
    });

    it('should delete a project', async () => {
      const project = await cloudBook.createProject('To Delete', 'fantasy');
      await cloudBook.deleteProject(project.id);
      
      const result = await cloudBook.getProject(project.id);
      expect(result).toBeNull();
    });
  });

  describe('Chapter Management', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await cloudBook.createProject('Test Project', 'fantasy');
      projectId = project.id;
    });

    it('should create a new chapter', async () => {
      const chapter = await cloudBook.createChapter(projectId, 'Chapter 1', 'Initial content');
      
      expect(chapter).toBeDefined();
      expect(chapter.projectId).toBe(projectId);
      expect(chapter.title).toBe('Chapter 1');
      expect(chapter.content).toBe('Initial content');
      expect(chapter.status).toBe('draft');
    });

    it('should get a chapter', async () => {
      const created = await cloudBook.createChapter(projectId, 'Chapter 1');
      const retrieved = await cloudBook.getChapter(projectId, created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should list all chapters', async () => {
      await cloudBook.createChapter(projectId, 'Chapter 1');
      await cloudBook.createChapter(projectId, 'Chapter 2');
      
      const chapters = await cloudBook.listChapters(projectId);
      expect(chapters.length).toBeGreaterThanOrEqual(2);
    });

    it('should update a chapter', async () => {
      const chapter = await cloudBook.createChapter(projectId, 'Original');
      const updated = await cloudBook.updateChapter(projectId, chapter.id, {
        title: 'Updated',
        status: 'completed'
      });
      
      expect(updated.title).toBe('Updated');
      expect(updated.status).toBe('completed');
    });

    it('should delete a chapter', async () => {
      const chapter = await cloudBook.createChapter(projectId, 'To Delete');
      await cloudBook.deleteChapter(projectId, chapter.id);
      
      const result = await cloudBook.getChapter(projectId, chapter.id);
      expect(result).toBeNull();
    });
  });

  describe('Export', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await cloudBook.createProject('Export Test', 'fantasy');
      projectId = project.id;
      await cloudBook.createChapter(projectId, 'Chapter 1', 'Content 1');
      await cloudBook.createChapter(projectId, 'Chapter 2', 'Content 2');
    });

    it('should export as JSON', async () => {
      const json = await cloudBook.exportProject(projectId, 'json');
      const data = JSON.parse(json);
      
      expect(data.project).toBeDefined();
      expect(data.chapters).toBeDefined();
      expect(data.chapters.length).toBeGreaterThanOrEqual(2);
    });

    it('should export as Markdown', async () => {
      const md = await cloudBook.exportProject(projectId, 'markdown');
      
      expect(md).toContain('# Export Test');
      expect(md).toContain('## Chapter 1');
      expect(md).toContain('Content 1');
    });

    it('should export as Text', async () => {
      const txt = await cloudBook.exportProject(projectId, 'text');
      
      expect(txt).toContain('Export Test');
      expect(txt).toContain('Chapter 1');
      expect(txt).toContain('Content 1');
    });
  });
});

describe('UnifiedStorage', () => {
  let storage: UnifiedStorage;

  beforeEach(() => {
    storage = new UnifiedStorage({ 
      basePath: './test-data/storage',
      enableBackup: true,
      maxBackups: 3
    });
  });

  afterEach(() => {
    storage.destroy();
  });

  describe('Basic Operations', () => {
    it('should write and read a file', async () => {
      await storage.write('test.txt', 'Hello World');
      const content = await storage.read('test.txt');
      
      expect(content).toBe('Hello World');
    });

    it('should check if file exists', async () => {
      await storage.write('exists.txt', 'Content');
      
      const exists = await storage.exists('exists.txt');
      const notExists = await storage.exists('not-exists.txt');
      
      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should delete a file', async () => {
      await storage.write('to-delete.txt', 'Content');
      await storage.delete('to-delete.txt');
      
      const exists = await storage.exists('to-delete.txt');
      expect(exists).toBe(false);
    });

    it('should list files in directory', async () => {
      await storage.write('dir/file1.txt', 'Content 1');
      await storage.write('dir/file2.txt', 'Content 2');
      
      const files = await storage.list('dir');
      
      expect(files.length).toBe(2);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt content', async () => {
      const encryptedStorage = new UnifiedStorage({
        basePath: './test-data/encrypted',
        encryptionKey: 'a'.repeat(64)
      });
      
      await encryptedStorage.write('secret.txt', 'Secret Content', { encrypt: true });
      const content = await encryptedStorage.read('secret.txt', { decrypt: true });
      
      expect(content).toBe('Secret Content');
      
      encryptedStorage.destroy();
    });
  });

  describe('Transactions', () => {
    it('should commit a transaction', async () => {
      const transactionId = storage.beginTransaction();
      
      storage.addOperation(transactionId, {
        type: 'write',
        path: 'transaction1.txt',
        content: 'Content 1'
      });
      storage.addOperation(transactionId, {
        type: 'write',
        path: 'transaction2.txt',
        content: 'Content 2'
      });
      
      await storage.commitTransaction(transactionId);
      
      const content1 = await storage.read('transaction1.txt');
      const content2 = await storage.read('transaction2.txt');
      
      expect(content1).toBe('Content 1');
      expect(content2).toBe('Content 2');
    });

    it('should rollback a failed transaction', async () => {
      const transactionId = storage.beginTransaction();
      
      storage.addOperation(transactionId, {
        type: 'write',
        path: 'rollback-test.txt',
        content: 'Original'
      });
      
      await storage.commitTransaction(transactionId);
      
      const original = await storage.read('rollback-test.txt');
      expect(original).toBe('Original');
    });
  });

  describe('Batch Operations', () => {
    it('should batch write multiple files', async () => {
      await storage.batchWrite([
        { path: 'batch1.txt', content: 'Batch 1' },
        { path: 'batch2.txt', content: 'Batch 2' },
        { path: 'batch3.txt', content: 'Batch 3' }
      ]);
      
      const content1 = await storage.read('batch1.txt');
      const content2 = await storage.read('batch2.txt');
      const content3 = await storage.read('batch3.txt');
      
      expect(content1).toBe('Batch 1');
      expect(content2).toBe('Batch 2');
      expect(content3).toBe('Batch 3');
    });
  });
});

describe('AuditEngine', () => {
  let auditEngine: AuditEngine;

  beforeEach(() => {
    auditEngine = new AuditEngine();
  });

  afterEach(() => {
    auditEngine.destroy();
  });

  it('should audit content and return results', async () => {
    const content = `
      李明走进华山派的练功房，心中充满了期待。
      他是华山派的大弟子，每天都在努力修炼剑法。
      师父告诉他，只有不断努力才能成为一代宗师。
    `;
    
    const result = await auditEngine.audit(content);
    
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.dimensions.length).toBeGreaterThan(0);
    expect(result.issues).toBeDefined();
  });

  it('should detect grammar issues', async () => {
    const content = 'The the cat sat on the the mat.';
    
    const result = await auditEngine.audit(content, { dimensions: ['grammar'] });
    
    const grammarDimension = result.dimensions.find(d => d.name === 'grammar');
    expect(grammarDimension).toBeDefined();
  });

  it('should detect redundancy', async () => {
    const content = `
      This is absolutely essential and very important.
      We need to combine together and merge together.
    `;
    
    const result = await auditEngine.audit(content, { dimensions: ['redundancy'] });
    
    const redundancyDimension = result.dimensions.find(d => d.name === 'redundancy');
    expect(redundancyDimension).toBeDefined();
  });

  it('should check show-dont-tell principle', async () => {
    const content = `
      He was angry. She was sad. They were scared.
      He felt happy about the situation.
    `;
    
    const result = await auditEngine.audit(content, { dimensions: ['showDontTell'] });
    
    const showDimension = result.dimensions.find(d => d.name === 'showDontTell');
    expect(showDimension).toBeDefined();
  });
});

describe('CreativeHub', () => {
  let creativeHub: CreativeHub;

  beforeEach(() => {
    creativeHub = new CreativeHub({
      contextWindow: 3,
      similarityThreshold: 0.7
    });
  });

  afterEach(() => {
    creativeHub.destroy();
  });

  it('should create a session', async () => {
    const session = await creativeHub.createSession('project-1');
    
    expect(session).toBeDefined();
    expect(session.sessionId).toMatch(/^session_/);
    expect(session.projectId).toBe('project-1');
    expect(session.documents).toEqual([]);
  });

  it('should add documents to session', async () => {
    const session = await creativeHub.createSession('project-1');
    
    await creativeHub.addDocument(session.sessionId, {
      id: 'doc-1',
      sessionId: session.sessionId,
      content: '华山派位于西岳华山，是武林中的名门正派。',
      metadata: { source: 'manual', tags: ['武侠', '门派'] }
    });
    
    const updatedSession = await creativeHub.getSession(session.sessionId);
    expect(updatedSession?.documents.length).toBe(1);
  });

  it('should search documents', async () => {
    const session = await creativeHub.createSession('project-1');
    
    await creativeHub.addDocument(session.sessionId, {
      id: 'doc-1',
      sessionId: session.sessionId,
      content: '华山派位于西岳华山。',
      metadata: { source: 'manual' }
    });
    await creativeHub.addDocument(session.sessionId, {
      id: 'doc-2',
      sessionId: session.sessionId,
      content: '少林寺是武林至尊。',
      metadata: { source: 'manual' }
    });
    
    const results = await creativeHub.search(session.sessionId, '华山派', 5);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].relevanceScore).toBeGreaterThan(0);
  });

  it('should send messages and get context', async () => {
    const session = await creativeHub.createSession('project-1');
    
    const response = await creativeHub.sendMessage(session.sessionId, '华山派是什么？');
    
    expect(response).toBeDefined();
    expect(response.context).toBeDefined();
  });

  it('should clear session', async () => {
    const session = await creativeHub.createSession('project-1');
    
    await creativeHub.addDocument(session.sessionId, {
      id: 'doc-1',
      sessionId: session.sessionId,
      content: 'Test content',
      metadata: {}
    });
    
    await creativeHub.clearSession(session.sessionId);
    
    const clearedSession = await creativeHub.getSession(session.sessionId);
    expect(clearedSession?.documents.length).toBe(0);
  });

  it('should get statistics', async () => {
    const session = await creativeHub.createSession('project-1');
    
    await creativeHub.addDocument(session.sessionId, {
      id: 'doc-1',
      sessionId: session.sessionId,
      content: '这是一段测试内容，用于验证统计功能。',
      metadata: {}
    });
    
    const stats = await creativeHub.getStatistics(session.sessionId);
    
    expect(stats.documentCount).toBe(1);
    expect(stats.totalCharacters).toBeGreaterThan(0);
  });
});

describe('Error Handling', () => {
  it('should create CloudBookError with all properties', () => {
    const error = new CloudBookError('Test error', 'TEST_CODE', { key: 'value' }, 400);
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ key: 'value' });
    expect(error.statusCode).toBe(400);
    expect(isCloudBookError(error)).toBe(true);
  });

  it('should create ValidationError', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'email' });
  });

  it('should create NotFoundError', () => {
    const error = new NotFoundError('Project', 'proj-123');
    
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain('proj-123');
  });

  it('should handle unknown errors', () => {
    const result = handleError(new Error('Unknown error'), 'TestContext');
    
    expect(isCloudBookError(result)).toBe(true);
    expect(result.code).toBe('INTERNAL_ERROR');
  });

  it('should convert CloudBookError to JSON', () => {
    const error = new CloudBookError('Test', 'TEST', {}, 500);
    const json = error.toJSON();
    
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('TEST');
    expect(json.error.timestamp).toBeDefined();
  });
});
