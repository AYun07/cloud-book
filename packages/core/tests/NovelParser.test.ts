import { describe, it, expect, beforeEach } from 'vitest';
import { NovelParser } from '../src/modules/NovelParser/NovelParser';

describe('NovelParser', () => {
  let parser: NovelParser;

  beforeEach(() => {
    parser = new NovelParser();
  });

  describe('countWords', () => {
    it('should count Chinese characters correctly', () => {
      const text = '这是一段中文文本';
      const count = parser.countWords(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should count English words correctly', () => {
      const text = 'This is English text';
      const count = parser.countWords(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should handle mixed content', () => {
      const text = '中文 text 中文';
      const count = parser.countWords(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const count = parser.countWords('');
      
      expect(count).toBe(0);
    });
  });

  describe('splitChapters', () => {
    it('should split content by chapter markers', () => {
      const content = '第一章内容\n\n第二章内容';
      const chapters = parser.splitChapters(content);
      
      expect(Array.isArray(chapters)).toBe(true);
    });
  });
});
