import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../src/modules/ContextManager/ContextManager';
import { NovelProject } from '../src/types';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockProject: NovelProject;

  beforeEach(() => {
    contextManager = new ContextManager();
    
    mockProject = {
      id: 'test-project',
      title: '测试小说',
      genre: 'fantasy',
      literaryGenre: 'novel',
      writingMode: 'original',
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: []
    };
  });

  describe('parseDSL', () => {
    it('should parse @character syntax', () => {
      const result = contextManager.parseDSL('@character:张三', mockProject, {});
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should parse @location syntax', () => {
      const result = contextManager.parseDSL('@location', mockProject, {});
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return original for plain text', () => {
      const text = '普通文本';
      const result = contextManager.parseDSL(text, mockProject, {});
      
      expect(result).toBe(text);
    });
  });

  describe('validateDSL', () => {
    it('should validate DSL syntax', () => {
      const result = contextManager.validateDSL('@character:张三');
      
      expect(result).toBeDefined();
    });
  });
});
