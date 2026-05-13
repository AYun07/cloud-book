import React, { useState } from 'react';
import { Card, Typography, Form, Input, Select, Switch, Button, Divider, message, Space, Tag } from 'antd';
import { GlobalOutlined, KeyOutlined, CloudOutlined, SafetyOutlined } from '@ant-design/icons';
import { useCloudBook } from '../context/CloudBookContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { Password } = Input;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { coreInstances, setAPIKey, configureLLM, currentProject } = useCloudBook();
  const [connectionMode, setConnectionMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [enabledProviders, setEnabledProviders] = useState(['openai']);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const apiKeys: Record<string, string> = {};
      if (values.openaiKey) {
        apiKeys['openai'] = values.openaiKey;
      }
      if (values.anthropicKey) {
        apiKeys['anthropic'] = values.anthropicKey;
      }
      if (values.deepseekKey) {
        apiKeys['deepseek'] = values.deepseekKey;
      }
      
      for (const [provider, key] of Object.entries(apiKeys)) {
        await setAPIKey(provider, key);
      }
      
      if (coreInstances?.llmManager) {
        coreInstances.llmManager.setDefaultProvider(values.defaultProvider || 'openai');
      }
      
      message.success('设置已保存');
    } catch (err) {
      message.error('保存失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const hide = message.loading('正在测试连接...', 0);
    
    try {
      if (coreInstances?.llmManager) {
        const isConnected = await coreInstances.llmManager.checkConnection?.() ?? 
                           await coreInstances.auditEngine?.checkConnection?.() ??
                           false;
        
        if (isConnected) {
          message.success('连接测试成功!');
        } else {
          message.warning('连接可能存在问题，请检查 API Key');
        }
      } else {
        message.warning('请先配置 API Key');
      }
    } catch (err) {
      message.error('连接测试失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setTestingConnection(false);
      hide();
    }
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
    { id: 'ollama', name: 'Ollama (本地)', models: ['llama2', 'mistral', 'codellama'] },
  ];

  const languages = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>⚙️ 设置</Title>
        <Button type="primary" onClick={handleSave}>
          保存设置
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card 
          title={
            <Space>
              <KeyOutlined />
              <span>API 配置</span>
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item label="选择启用的大模型">
              <Space wrap>
                {providers.map(p => (
                  <Tag 
                    key={p.id}
                    color={enabledProviders.includes(p.id) ? 'blue' : 'default'}
                    onClick={() => {
                      if (enabledProviders.includes(p.id)) {
                        setEnabledProviders(enabledProviders.filter(x => x !== p.id));
                      } else {
                        setEnabledProviders([...enabledProviders, p.id]);
                      }
                    }}
                    style={{ cursor: 'pointer', padding: '4px 12px' }}
                  >
                    {p.name}
                  </Tag>
                ))}
              </Space>
            </Form.Item>

            {enabledProviders.includes('openai') && (
              <>
                <Divider>OpenAI</Divider>
                <Form.Item name="openaiKey" label="API Key">
                  <Password placeholder="sk-..." />
                </Form.Item>
                <Form.Item name="openaiModel" label="模型">
                  <Select placeholder="选择模型" defaultValue="gpt-4">
                    {providers[0].models.map(m => (
                      <Option key={m} value={m}>{m}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {enabledProviders.includes('anthropic') && (
              <>
                <Divider>Anthropic</Divider>
                <Form.Item name="anthropicKey" label="API Key">
                  <Password placeholder="sk-ant-..." />
                </Form.Item>
                <Form.Item name="anthropicModel" label="模型">
                  <Select placeholder="选择模型" defaultValue="claude-3-sonnet">
                    {providers[1].models.map(m => (
                      <Option key={m} value={m}>{m}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {enabledProviders.includes('deepseek') && (
              <>
                <Divider>DeepSeek</Divider>
                <Form.Item name="deepseekKey" label="API Key">
                  <Password placeholder="DeepSeek API Key" />
                </Form.Item>
              </>
            )}

            {enabledProviders.includes('ollama') && (
              <>
                <Divider>Ollama (本地)</Divider>
                <Form.Item name="ollamaUrl" label="服务地址">
                  <Input placeholder="http://localhost:11434" defaultValue="http://localhost:11434" />
                </Form.Item>
                <Form.Item name="ollamaModel" label="模型">
                  <Select placeholder="选择模型">
                    {providers[3].models.map(m => (
                      <Option key={m} value={m}>{m}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            <Button icon={<CloudOutlined />} onClick={handleTestConnection} loading={testingConnection}>
              测试连接
            </Button>
          </Form>
        </Card>

        <Card
          title={
            <Space>
              <GlobalOutlined />
              <span>多语言设置</span>
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item label="界面语言">
              <Select defaultValue="zh-CN" style={{ width: '100%' }}>
                {languages.map(l => (
                  <Option key={l.code} value={l.code}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="写作语言">
              <Select defaultValue="zh-CN" style={{ width: '100%' }}>
                {languages.map(l => (
                  <Option key={l.code} value={l.code}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="自动检测语言">
              <Switch defaultChecked />
            </Form.Item>

            <Divider />

            <Form.Item label="拼写检查">
              <Switch defaultChecked />
            </Form.Item>

            <Form.Item label="语法检查">
              <Switch defaultChecked />
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={
            <Space>
              <CloudOutlined />
              <span>连接模式</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card 
              hoverable
              onClick={() => setConnectionMode('online')}
              style={{ 
                border: connectionMode === 'online' ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <Text strong>在线模式</Text>
              <br />
              <Text type="secondary">直接调用云端API，需要网络连接</Text>
            </Card>

            <Card 
              hoverable
              onClick={() => setConnectionMode('offline')}
              style={{ 
                border: connectionMode === 'offline' ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <Text strong>离线模式</Text>
              <br />
              <Text type="secondary">使用本地部署的模型（如Ollama）</Text>
            </Card>

            <Card 
              hoverable
              onClick={() => setConnectionMode('hybrid')}
              style={{ 
                border: connectionMode === 'hybrid' ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <Text strong>混合模式</Text>
              <br />
              <Text type="secondary">优先本地，失败时切换云端</Text>
            </Card>
          </Space>
        </Card>

        <Card
          title={
            <Space>
              <SafetyOutlined />
              <span>隐私与安全</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>数据本地存储</Text>
              <Switch defaultChecked />
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>不上传服务器</Text>
              <Switch defaultChecked />
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>离线缓存</Text>
              <Switch defaultChecked />
            </div>
            <Divider />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cloud Book 不存储任何用户数据，所有数据仅保存在本地设备上。
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
