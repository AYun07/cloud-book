import React, { useState, useEffect } from 'react';
import { 
  List, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Empty, 
  Tag,
  Spin,
  message,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  BookOutlined, 
  CalendarOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCloudBook } from '../context/CloudBookContext';
import { NovelProject, Genre, WritingMode } from '@cloudbook/core';

const { Title, Text } = Typography;
const { Option } = Select;

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isInitialized, 
    isLoading, 
    apiKeyConfigured, 
    projects, 
    currentProject,
    setCurrentProject, 
    createProject, 
    deleteProject, 
    initialize,
    config,
    setAPIKey
  } = useCloudBook();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [configForm] = Form.useForm();

  // 初始化默认配置
  useEffect(() => {
    if (!isInitialized) {
      initialize({
        llmConfigs: [],
        modelRoutes: [],
        auditConfig: {
          dimensions: [],
          threshold: 0.7,
          autoFix: true,
          maxIterations: 3
        },
        antiDetectionConfig: {
          enabled: true,
          intensity: 5
        },
        storagePath: './cloudbook-projects'
      });
    }
  }, [isInitialized, initialize]);

  // 处理配置API Key
  const handleConfigAPIKey = async (values: any) => {
    try {
      await setAPIKey(values.provider, values.apiKey);
      message.success('API Key 配置成功！');
      setIsConfigModalOpen(false);
    } catch (err) {
      message.error('配置失败：' + (err as Error).message);
    }
  };

  // 处理创建项目
  const handleCreateProject = async (values: any) => {
    try {
      const project = await createProject(values.title, values.genre, values.mode);
      message.success(`项目「${project.title}」创建成功！`);
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (err) {
      message.error('创建失败：' + (err as Error).message);
    }
  };

  // 处理打开项目
  const handleOpenProject = (project: NovelProject) => {
    setCurrentProject(project);
    navigate('/writing');
  };

  // 处理删除项目
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      message.success('项目删除成功！');
    } catch (err) {
      message.error('删除失败：' + (err as Error).message);
    }
  };

  const getGenreIcon = (genre: string) => {
    const icons: Record<string, React.ReactNode> = {
      xianxia: <ThunderboltOutlined />,
      fantasy: <BookOutlined />,
      urban: <ThunderboltOutlined />,
      romance: <ThunderboltOutlined />,
      mystery: <ThunderboltOutlined />,
      scifi: <ThunderboltOutlined />,
      horror: <ThunderboltOutlined />,
      historical: <ThunderboltOutlined />,
      game: <ThunderboltOutlined />,
      other: <ThunderboltOutlined />
    };
    return icons[genre as string] || <ThunderboltOutlined />;
  };

  const getGenreLabel = (genre: string) => {
    const labels: Record<string, string> = {
      xianxia: '仙侠修真',
      fantasy: '玄幻奇幻',
      urban: '都市异能',
      romance: '浪漫言情',
      mystery: '悬疑推理',
      scifi: '科幻未来',
      horror: '恐怖惊悚',
      historical: '历史穿越',
      game: '游戏电竞',
      other: '其他题材'
    };
    return labels[genre as string] || genre;
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      original: '原创创作',
      imitation: '智能仿写',
      derivative: '二次创作',
      fanfic: '同人创作'
    };
    return labels[mode as string] || mode;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      paused: 'orange',
      completed: 'blue',
      archived: 'default'
    };
    return colors[status as string] || 'default';
  };

  return (
    <div className="project-page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            项目管理
          </Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginTop: 4 }}>
            管理您的所有小说创作项目
          </Text>
        </div>
        <Space>
          {!apiKeyConfigured && (
            <Button 
              type="default" 
              icon={<BookOutlined />} 
              onClick={() => setIsConfigModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none'
              }}
            >
              配置 API Key
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!apiKeyConfigured}
            style={{
              background: apiKeyConfigured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            新建项目
          </Button>
        </Space>
      </div>

      {!apiKeyConfigured && (
        <Card 
          style={{ 
            marginBottom: 24,
            background: 'linear-gradient(135deg, #1f4068 0%, #16213e 100%)',
            border: '1px solid #e63946',
            boxShadow: '0 4px 15px rgba(230, 57, 70, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThunderboltOutlined style={{ fontSize: 32, color: '#e63946', marginRight: 16 }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ color: '#e63946', fontSize: 16 }}>
                需要配置 API Key 才能开始创作
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Cloud Book 使用您自己的 LLM API Key 进行创作，数据全部保存在本地
              </Text>
            </div>
            <Button type="primary" onClick={() => setIsConfigModalOpen(true)}>
              立即配置
            </Button>
          </div>
        </Card>
      )}

      <Spin spinning={isLoading}>
        {projects.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="还没有项目"
            style={{ padding: '60px 0' }}
          >
            {apiKeyConfigured && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsCreateModalOpen(true)}
              >
                创建第一个项目
              </Button>
            )}
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            dataSource={projects}
            renderItem={(project) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button type="link" onClick={() => handleOpenProject(project)}>
                      开始创作
                    </Button>,
                    <Popconfirm
                      title="确定要删除这个项目吗？"
                      description="删除后无法恢复"
                      onConfirm={() => handleDeleteProject(project.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" danger>删除</Button>
                    </Popconfirm>
                  ]}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ 
                      fontSize: 48, 
                      marginRight: 16, 
                      lineHeight: 1,
                      color: '#667eea'
                    }}>
                      {getGenreIcon(project.genre as string)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ 
                        color: '#fff', 
                        marginBottom: 8,
                        fontSize: 18,
                        fontWeight: 600
                      }}>
                        {project.title}
                      </Title>
                      <Space wrap style={{ marginBottom: 12 }}>
                        <Tag color="blue">{getGenreLabel(project.genre as string)}</Tag>
                        <Tag color="purple">{getModeLabel(project.writingMode as string)}</Tag>
                        <Tag color={getStatusColor(project.status as string)}>
                          {project.status === 'active' ? '进行中' : project.status}
                        </Tag>
                      </Space>
                      <Space split={<span style={{ color: '#333' }}>•</span>}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {project.chapters?.length || 0} 章
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {project.characters?.length || 0} 角色
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Spin>

      {/* 创建项目模态框 */}
      <Modal
        title="创建新项目"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form 
          form={createForm} 
          onFinish={handleCreateProject}
          layout="vertical"
        >
          <Form.Item
            label="项目名称"
            name="title"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="我的小说" size="large" />
          </Form.Item>
          
          <Form.Item
            label="题材类型"
            name="genre"
            rules={[{ required: true, message: '请选择题材' }]}
            initialValue="xianxia"
          >
            <Select size="large">
              <Option value="xianxia">仙侠修真</Option>
              <Option value="fantasy">玄幻奇幻</Option>
              <Option value="urban">都市异能</Option>
              <Option value="romance">浪漫言情</Option>
              <Option value="mystery">悬疑推理</Option>
              <Option value="scifi">科幻未来</Option>
              <Option value="horror">恐怖惊悚</Option>
              <Option value="historical">历史穿越</Option>
              <Option value="game">游戏电竞</Option>
              <Option value="other">其他题材</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="创作模式"
            name="mode"
            rules={[{ required: true, message: '请选择创作模式' }]}
            initialValue="original"
          >
            <Select size="large">
              <Option value="original">原创创作</Option>
              <Option value="imitation">智能仿写</Option>
              <Option value="derivative">二次创作</Option>
              <Option value="fanfic">同人创作</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button size="large" onClick={() => setIsCreateModalOpen(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                创建项目
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* API Key配置模态框 */}
      <Modal
        title="配置 LLM API Key"
        open={isConfigModalOpen}
        onCancel={() => setIsConfigModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form 
          form={configForm} 
          onFinish={handleConfigAPIKey}
          layout="vertical"
        >
          <Form.Item
            label="LLM 提供商"
            name="provider"
            rules={[{ required: true, message: '请选择提供商' }]}
            initialValue="openai"
          >
            <Select size="large">
              <Option value="openai">OpenAI (GPT-4, GPT-3.5)</Option>
              <Option value="anthropic">Anthropic (Claude)</Option>
              <Option value="deepseek">DeepSeek</Option>
              <Option value="ollama">Ollama (本地)</Option>
              <Option value="custom">自定义 API</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="sk-..." size="large" />
          </Form.Item>

          <Form.Item
            label="模型名称 (可选)"
            name="model"
          >
            <Input placeholder="例如: gpt-4, claude-3-sonnet-20240229" size="large" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button size="large" onClick={() => setIsConfigModalOpen(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                保存配置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
