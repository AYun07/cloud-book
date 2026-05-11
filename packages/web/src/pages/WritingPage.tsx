import React, { useState } from 'react';
import { Card, Button, Typography, Space, Input, Select, Switch, Slider, message, Divider, Progress } from 'antd';
import { PlayCircleOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WritingPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [chapterNum, setChapterNum] = useState(1);
  const [genre, setGenre] = useState('fantasy');
  const [targetWords, setTargetWords] = useState(2500);
  const [autoAudit, setAutoAudit] = useState(true);
  const [autoHumanize, setAutoHumanize] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!content.trim() && chapterNum === 1) {
      message.warning('请先生成大纲或输入章节要求');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return p;
        }
        return p + 10;
      });
    }, 500);

    setTimeout(() => {
      setProgress(100);
      setIsGenerating(false);
      message.success('章节生成完成!');
    }, 5000);
  };

  const handleSave = () => {
    message.success('章节已保存');
  };

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
          >
            生成章节
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>

      {isGenerating && (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>正在生成章节内容...</Text>
            <Progress percent={progress} status="active" />
          </Space>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <Card>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在这里生成章节内容，或输入你的写作要求..."
            style={{ 
              minHeight: 500,
              fontSize: 16,
              lineHeight: 1.8,
              fontFamily: 'Georgia, serif'
            }}
          />
        </Card>

        <Card title="⚙️ 写作设置">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>章节编号</Text>
              <Input 
                type="number" 
                value={chapterNum} 
                onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                style={{ marginTop: 4 }}
              />
            </div>

            <Divider />

            <div>
              <Text strong>小说题材</Text>
              <Select 
                value={genre} 
                onChange={setGenre}
                style={{ width: '100%', marginTop: 4 }}
              >
                <Option value="fantasy">玄幻奇幻</Option>
                <Option value="xianxia">仙侠修真</Option>
                <Option value="urban">都市异能</Option>
                <Option value="scifi">科幻未来</Option>
                <Option value="romance">言情</Option>
              </Select>
            </div>

            <Divider />

            <div>
              <Text strong>目标字数: {targetWords}</Text>
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

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>自动审计</Text>
              <Switch checked={autoAudit} onChange={setAutoAudit} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>去AI味</Text>
              <Switch checked={autoHumanize} onChange={setAutoHumanize} />
            </div>

            <Divider />

            <Button block icon={<ThunderboltOutlined />}>
              批量生成
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default WritingPage;
