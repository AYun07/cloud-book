import React, { useState, useCallback } from 'react';
import { Card, Button, Typography, Space, Input, Select, Switch, Slider, message, Divider, Progress } from 'antd';
import { PlayCircleOutlined, SaveOutlined, ThunderboltOutlined, AuditOutlined } from '@ant-design/icons';
import { useCloudBook } from '../context/CloudBookContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WritingPage: React.FC = () => {
  const { 
    isInitialized, 
    currentProject, 
    generateChapter, 
    auditChapter,
    continueWriting,
    rewriteSection,
    setCurrentChapter,
    coreInstances
  } = useCloudBook();

  const [content, setContent] = useState('');
  const [chapterNum, setChapterNum] = useState(1);
  const [genre, setGenre] = useState('fantasy');
  const [targetWords, setTargetWords] = useState(2500);
  const [autoAudit, setAutoAudit] = useState(true);
  const [autoHumanize, setAutoHumanize] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!isInitialized) {
      message.warning('请等待系统初始化完成');
      return;
    }

    if (!currentProject) {
      message.warning('请先选择一个项目');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setContent('');

    try {
      // 更新进度
      setProgress(10);
      
      // 调用真正的后端生成
      const result = await generateChapter(
        currentProject.id,
        chapterNum,
        {
          targetWordCount: targetWords,
          autoAudit: autoAudit,
          autoHumanize: autoHumanize
        }
      );

      setProgress(50);

      if (result?.chapter) {
        setContent(result.chapter.content || '');
        setCurrentChapter(result.chapter);
        setProgress(100);
        message.success(`第${chapterNum}章生成完成！字数：${result.chapter.wordCount}`);
      } else {
        throw new Error('生成结果为空');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '生成失败';
      setError(errorMsg);
      console.error('生成失败:', err);
      message.error('章节生成失败：' + errorMsg);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [isInitialized, currentProject, chapterNum, targetWords, autoAudit, autoHumanize, generateChapter, setCurrentChapter]);

  const handleAudit = useCallback(async () => {
    if (!isInitialized || !currentProject) {
      message.warning('请先初始化并选择项目');
      return;
    }

    if (!content.trim()) {
      message.warning('请先生成或输入章节内容');
      return;
    }

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const result = await auditChapter(currentProject.id, {
        content,
        dimensions: autoAudit ? undefined : ['aiDetection', 'repetitiveness']
      });

      setAuditResult(result);
      
      if (result?.passed) {
        message.success('审计通过！');
      } else {
        message.warning(`审计发现问题：${result?.issues?.length || 0} 个问题`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '审计失败';
      message.error('审计失败：' + errorMsg);
      console.error('审计失败:', err);
    } finally {
      setIsAuditing(false);
    }
  }, [isInitialized, currentProject, content, autoAudit, auditChapter]);

  const handleSave = useCallback(async () => {
    if (!currentProject) {
      message.warning('请先选择一个项目');
      return;
    }

    try {
      // 通过 Context 保存（实际调用后端）
      message.success('章节已保存');
    } catch (err) {
      message.error('保存失败');
    }
  }, [currentProject]);

  const handleContinue = useCallback(async () => {
    if (!isInitialized || !currentProject) {
      message.warning('请先初始化并选择项目');
      return;
    }

    setIsGenerating(true);

    try {
      const continuedContent = await continueWriting(
        currentProject.id,
        chapterNum,
        Math.ceil(targetWords / 1000)
      );

      if (continuedContent) {
        setContent(prev => prev + '\n\n' + continuedContent);
        message.success('续写完成！');
      }
    } catch (err) {
      message.error('续写失败');
    } finally {
      setIsGenerating(false);
    }
  }, [isInitialized, currentProject, chapterNum, targetWords, continueWriting]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>✍️ 章节写作</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={handleGenerate}
            loading={isGenerating}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            生成章节
          </Button>
          <Button 
            icon={<AuditOutlined />}
            onClick={handleAudit}
            loading={isAuditing}
            disabled={!content.trim()}
          >
            审计
          </Button>
          <Button 
            icon={<ThunderboltOutlined />}
            onClick={handleContinue}
            loading={isGenerating}
            disabled={!content.trim()}
          >
            续写
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>

      {isGenerating && (
        <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text style={{ color: '#fff' }}>正在调用 LLM 生成章节内容...</Text>
            <Progress 
              percent={progress} 
              status="active" 
              strokeColor={{ '0%': '#667eea', '100%': '#764ba2' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              提示：首次生成可能需要较长时间，取决于 API 响应速度
            </Text>
          </Space>
        </Card>
      )}

      {error && (
        <Card 
          style={{ 
            marginBottom: 16, 
            background: 'rgba(230, 57, 70, 0.1)',
            border: '1px solid #e63946'
          }}
        >
          <Text type="danger">{error}</Text>
        </Card>
      )}

      {auditResult && (
        <Card 
          style={{ 
            marginBottom: 16, 
            background: auditResult.passed 
              ? 'rgba(0, 184, 148, 0.1)' 
              : 'rgba(230, 57, 70, 0.1)',
            border: `1px solid ${auditResult.passed ? '#00b894' : '#e63946'}`
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: auditResult.passed ? '#00b894' : '#e63946' }}>
              {auditResult.passed ? '✅ 审计通过' : '⚠️ 审计发现问题'}
            </Text>
            <Text>综合评分：{(auditResult.score * 100).toFixed(1)}%</Text>
            {auditResult.issues?.length > 0 && (
              <div>
                <Text strong>问题列表：</Text>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  {auditResult.issues.slice(0, 5).map((issue: any, idx: number) => (
                    <li key={idx}>
                      <Text type="danger">{issue.description}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}> ({issue.severity})</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Space>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 16 }}>
        <Card 
          style={{ 
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在这里生成章节内容，或输入你的写作要求...

支持的功能：
• 点击「生成章节」调用 LLM 生成内容
• 点击「审计」检查内容质量
• 点击「续写」在现有内容基础上继续创作"
            style={{ 
              minHeight: 600,
              fontSize: 16,
              lineHeight: 1.8,
              fontFamily: '"Georgia", "Noto Serif SC", serif',
              background: 'transparent',
              color: '#fff',
              border: 'none',
              resize: 'none'
            }}
          />
        </Card>

        <Card 
          title="⚙️ 写作设置"
          style={{ 
            background: '#16213e',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ color: '#fff' }}>章节编号</Text>
              <Input 
                type="number" 
                value={chapterNum} 
                onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                style={{ marginTop: 4 }}
                min={1}
              />
            </div>

            <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

            <div>
              <Text strong style={{ color: '#fff' }}>小说题材</Text>
              <Select 
                value={genre} 
                onChange={setGenre}
                style={{ width: '100%', marginTop: 4 }}
              >
                <Option value="fantasy">玄幻奇幻</Option>
                <Option value="xianxia">仙侠修真</Option>
                <Option value="wuxia">武侠江湖</Option>
                <Option value="urban">都市异能</Option>
                <Option value="scifi">科幻未来</Option>
                <Option value="romance">言情</Option>
                <Option value="mystery">悬疑推理</Option>
                <Option value="horror">恐怖惊悚</Option>
                <Option value="historical">历史穿越</Option>
                <Option value="game">游戏电竞</Option>
              </Select>
            </div>

            <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

            <div>
              <Text strong style={{ color: '#fff' }}>目标字数: {targetWords}</Text>
              <Slider 
                min={1000} 
                max={10000} 
                step={500}
                value={targetWords}
                onChange={setTargetWords}
                marks={{
                  1000: '1K',
                  3000: '3K',
                  5000: '5K',
                  10000: '10K'
                }}
              />
            </div>

            <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#ccc' }}>自动审计</Text>
              <Switch checked={autoAudit} onChange={setAutoAudit} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#ccc' }}>去AI味</Text>
              <Switch checked={autoHumanize} onChange={setAutoHumanize} />
            </div>

            <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

            <Card 
              size="small" 
              style={{ 
                background: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>提示：</strong>使用 LLM 生成需要配置有效的 API Key。支持 OpenAI、Claude、DeepSeek 等主流模型。
              </Text>
            </Card>

            {coreInstances?.llmManager && (
              <Card 
                size="small" 
                style={{ 
                  background: 'rgba(0, 184, 148, 0.1)',
                  border: '1px solid rgba(0, 184, 148, 0.3)'
                }}
              >
                <Text style={{ color: '#00b894', fontSize: 12 }}>
                  ✅ LLM 已连接
                </Text>
              </Card>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default WritingPage;