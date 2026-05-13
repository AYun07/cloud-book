#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CloudBook, LLMConfig, ModelRoute, Genre, WritingOptions } from '@cloud-book/core';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('cloud-book')
  .description('☁️ Cloud Book - AI驱动的下一代小说创作平台')
  .version('1.0.0');

program
  .command('init')
  .description('初始化新项目')
  .action(async () => {
    console.log(chalk.blue('☁️ Cloud Book 项目初始化向导'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: '小说标题:',
        default: '我的小说'
      },
      {
        type: 'list',
        name: 'genre',
        message: '选择题材:',
        choices: [
          'fantasy - 玄幻奇幻',
          'xianxia - 仙侠修真',
          'urban - 都市异能',
          'scifi - 科幻未来',
          'romance - 浪漫言情',
          'mystery - 悬疑推理',
          'horror - 恐怖惊悚',
          'historical - 历史穿越',
          'game - 游戏电竞',
          'other - 其他'
        ]
      },
      {
        type: 'list',
        name: 'mode',
        message: '创作模式:',
        choices: [
          'original - 原创',
          'imitation - 仿写',
          'derivative - 二创',
          'fanfic - 同人'
        ]
      }
    ]);

    const config: any = {
      llmConfigs: [],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: 5 },
      storagePath: './cloud-book-projects'
    };

    const cloudBook = new CloudBook(config);
    
    const genreMap: Record<string, Genre> = {
      'fantasy': 'fantasy',
      'xianxia': 'xianxia',
      'urban': 'urban',
      'scifi': 'scifi',
      'romance': 'romance',
      'mystery': 'mystery',
      'horror': 'horror',
      'historical': 'historical'
    };

    const modeMap: Record<string, any> = {
      'original': 'original',
      'imitation': 'imitation',
      'derivative': 'derivative',
      'fanfic': 'fanfic'
    };

    try {
      const project = await cloudBook.createProject(
        answers.title,
        genreMap[answers.genre] || 'fantasy',
        modeMap[answers.mode]
      );

      console.log(chalk.green(`\n✅ 项目创建成功!`));
      console.log(chalk.gray(`项目ID: ${project.id}`));
      console.log(chalk.gray(`保存位置: ./cloud-book-projects`));
    } catch (error: any) {
      console.log(chalk.red(`\n❌ 项目创建失败: ${error.message}`));
    }
  });

program
  .command('write <chapter>')
  .description('生成指定章节')
  .option('-p, --project <id>', '项目ID')
  .option('-o, --output <file>', '输出文件')
  .option('-a, --audit', '自动审计', true)
  .option('-h, --humanize', '自动去AI味', false)
  .action(async (chapter: string, options: any) => {
    console.log(chalk.blue(`📝 正在生成第${chapter}章...`));
    
    const projectId = options.project || process.env.CLOUDBOOK_PROJECT_ID;
    
    if (!projectId) {
      console.log(chalk.red('❌ 请指定项目ID (--project) 或设置 CLOUDBOOK_PROJECT_ID 环境变量'));
      return;
    }

    const config: any = {
      llmConfigs: [{
        name: 'default',
        provider: 'openai',
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || ''
      }],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: 5 },
      storagePath: './cloud-book-projects'
    };

    const cloudBook = new CloudBook(config);

    try {
      const writingOptions: WritingOptions = {
        autoAudit: options.audit,
        autoHumanize: options.humanize,
        targetWordCount: 2500
      };

      const chapterResult = await cloudBook.generateChapter(
        projectId,
        parseInt(chapter),
        writingOptions
      );

      console.log(chalk.green(`\n✅ 第${chapter}章生成完成!`));
      console.log(chalk.gray(`字数: ${chapterResult.wordCount}`));
      console.log(chalk.gray(`状态: ${chapterResult.status}`));

      if (options.output) {
        fs.writeFileSync(options.output, chapterResult.content || '', 'utf-8');
        console.log(chalk.gray(`已保存至: ${options.output}`));
      } else {
        console.log('\n' + chapterResult.content);
      }
    } catch (error: any) {
      console.log(chalk.red(`\n❌ 章节生成失败: ${error.message}`));
    }
  });

program
  .command('import <file>')
  .description('导入现有小说文件进行分析')
  .option('-t, --type <type>', '文件类型', 'auto')
  .action(async (file: string, options: any) => {
    console.log(chalk.blue(`📖 正在分析文件: ${file}`));

    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ 文件不存在: ${file}`));
      return;
    }

    const config: any = {
      llmConfigs: [],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: 5 },
      storagePath: './cloud-book-projects'
    };

    const cloudBook = new CloudBook(config);

    try {
      const result = await cloudBook.importNovel(file);
      
      console.log(chalk.green('\n✅ 文件分析完成!'));
      console.log(chalk.gray(`标题: ${result.title}`));
      console.log(chalk.gray(`作者: ${result.author || '未知'}`));
      console.log(chalk.gray(`预估字数: ${result.estimatedWordCount}`));
      console.log(chalk.gray(`章节数: ${result.chapters.length}`));
      console.log(chalk.gray(`角色数: ${result.characters.length}`));

      const outputFile = file.replace(/\.[^.]+$/, '') + '.analysis.json';
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
      console.log(chalk.gray(`\n分析结果已保存至: ${outputFile}`));
    } catch (error: any) {
      console.log(chalk.red(`\n❌ 文件分析失败: ${error.message}`));
    }
  });

program
  .command('audit <file>')
  .description('审计章节质量')
  .option('-s, --score <n>', '最低分数', '0.7')
  .action(async (file: string, options: any) => {
    console.log(chalk.blue(`🔍 正在审计: ${file}`));

    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ 文件不存在: ${file}`));
      return;
    }

    const content = fs.readFileSync(file, 'utf-8');

    const config: any = {
      llmConfigs: [{
        name: 'default',
        provider: 'openai',
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || ''
      }],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: parseFloat(options.score), autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: 5 },
      storagePath: './cloud-book-projects'
    };

    const cloudBook = new CloudBook(config);

    try {
      const result = await cloudBook.auditContent(content, { threshold: parseFloat(options.score) });
      console.log(chalk.green('\n✅ 审计完成!'));
      console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.log(chalk.red(`\n❌ 审计失败: ${error.message}`));
    }
  });

program
  .command('humanize <file>')
  .description('去AI味处理')
  .option('-o, --output <file>', '输出文件')
  .option('-i, --intensity <n>', '处理强度 (1-10)', '5')
  .action(async (file: string, options: any) => {
    console.log(chalk.blue(`✨ 正在去AI味处理: ${file}`));

    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ 文件不存在: ${file}`));
      return;
    }

    const content = fs.readFileSync(file, 'utf-8');

    const config: any = {
      llmConfigs: [{
        name: 'default',
        provider: 'openai',
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || ''
      }],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: parseInt(options.intensity) },
      storagePath: './cloud-book-projects'
    };

    const cloudBook = new CloudBook(config);

    try {
      const result = await cloudBook.humanize(content);
      
      const outputFile = options.output || file.replace(/\.[^.]+$/, '') + '.humanized.txt';
      fs.writeFileSync(outputFile, result, 'utf-8');
      
      console.log(chalk.green(`\n✅ 去AI味完成!`));
      console.log(chalk.gray(`已保存至: ${outputFile}`));
    } catch (error: any) {
      console.log(chalk.red(`\n❌ 处理失败: ${error.message}`));
    }
  });

program
  .command('model add')
  .description('添加模型配置')
  .action(async () => {
    console.log(chalk.blue('🔧 添加模型配置向导'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '模型名称:',
        default: 'my-model'
      },
      {
        type: 'list',
        name: 'provider',
        message: '选择提供商:',
        choices: [
          'openai - OpenAI',
          'anthropic - Anthropic',
          'deepseek - DeepSeek',
          'ollama - Ollama (本地)',
          'custom - 自定义'
        ]
      },
      {
        type: 'input',
        name: 'model',
        message: '模型名称:',
        default: 'gpt-4'
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'API Key:',
        mask: true
      },
      {
        type: 'input',
        name: 'endpoint',
        message: 'API Endpoint (留空使用默认):'
      }
    ]);

    const config: any = {
      llmConfigs: [{
        name: answers.name,
        provider: answers.provider as any,
        model: answers.model,
        apiKey: answers.apiKey,
        endpoint: answers.endpoint || undefined
      }],
      modelRoutes: [],
      auditConfig: { dimensions: [], threshold: 0.7, autoFix: true, maxIterations: 3 },
      antiDetectionConfig: { enabled: true, intensity: 5 },
      storagePath: './cloud-book-projects'
    };

    console.log(chalk.green('\n✅ 模型配置已创建!'));
    console.log(chalk.gray('请将以下内容添加到您的项目配置中:'));
    console.log(JSON.stringify(config.llmConfigs[0], null, 2));
  });

program
  .command('lang')
  .description('设置语言')
  .action(async () => {
    console.log(chalk.blue('🌐 选择界面语言'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: '选择语言:',
        choices: [
          'zh-CN - 简体中文',
          'zh-TW - 繁體中文',
          'en-US - English',
          'ja-JP - 日本語',
          'ko-KR - 한국어',
          'es-ES - Español',
          'fr-FR - Français',
          'de-DE - Deutsch'
        ]
      }
    ]);

    const langMap: Record<string, string> = {
      'zh-CN': '简体中文已设置',
      'zh-TW': '繁體中文已設置',
      'en-US': 'English language set',
      'ja-JP': '日本語が設定されました',
      'ko-KR': '한국어로 설정됨',
      'es-ES': 'Idioma español establecido',
      'fr-FR': 'Langue française définie',
      'de-DE': 'Sprache auf Deutsch eingestellt'
    };

    console.log(chalk.green(`\n✅ ${langMap[answers.language]}`));
  });

program.parse();
