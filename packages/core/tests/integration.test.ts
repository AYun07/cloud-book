import { describe, it, expect, beforeEach } from 'vitest';
import { WritingPipeline } from '../src/modules/WritingEngine/WritingPipeline';
import { AIAuditEngine } from '../src/modules/AIAudit/AIAuditEngine';
import { LLMManager } from '../src/modules/LLMProvider/LLMManager';
import { ContextManager } from '../src/modules/ContextManager/ContextManager';

describe('Integration: Module Dependencies', () => {
  let writingPipeline: WritingPipeline;
  let auditEngine: AIAuditEngine;
  let llmManager: LLMManager;
  let contextManager: ContextManager;

  beforeEach(() => {
    llmManager = new LLMManager({
      providers: {
        openai: { apiKey: 'test-key', model: 'gpt-3.5-turbo' }
      }
    });
    
    contextManager = new ContextManager();
    auditEngine = new AIAuditEngine(llmManager);
    
    writingPipeline = new WritingPipeline({
      llmManager,
      contextManager,
      auditEngine
    });
  });

  it('should create writing pipeline with all dependencies', () => {
    expect(writingPipeline).toBeDefined();
    expect(writingPipeline).toHaveProperty('generateChapter');
  });

  it('should create audit engine with LLM manager', () => {
    expect(auditEngine).toBeDefined();
    expect(auditEngine).toHaveProperty('setLLMProvider');
  });

  it('should create context manager', () => {
    expect(contextManager).toBeDefined();
    expect(contextManager).toHaveProperty('parseDSL');
  });

  it('should create LLM manager with provider', () => {
    expect(llmManager).toBeDefined();
    expect(llmManager).toHaveProperty('generate');
  });
});

describe('Integration: Context + DSL', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  it('should parse DSL and validate with context manager', () => {
    const dslText = '@character:主角';
    const parsed = contextManager.parseDSL(dslText, {
      id: 'test',
      title: 'Test',
      genre: 'fantasy',
      literaryGenre: 'novel',
      writingMode: 'original',
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: []
    }, {});
    
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe('string');
  });

  it('should validate DSL syntax', () => {
    const result = contextManager.validateDSL('@character:张三');
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('valid');
  });
});
