import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Space,
  Typography,
  Tag,
  Avatar,
  List,
  message,
  Row,
  Col,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HeartOutlined,
  FlagOutlined,
  FileTextOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useCloudBook } from '../context/CloudBookContext';
import { Character } from '@cloudbook/core';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CharacterPage: React.FC = () => {
  const { currentProject, addCharacter, updateCharacter, deleteCharacter, characters } = useCloudBook();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      form.setFieldsValue({
        name: character.name,
        role: character.role,
        gender: character.gender,
        age: character.age,
        personality: character.personality,
        goals: character.goals?.join('\n') || '',
        background: character.background,
        relationships: character.relationships?.map(r => r.targetName).join('\n') || ''
      });
    } else {
      setEditingCharacter(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (!currentProject) {
      message.warning('请先选择一个项目');
      return;
    }

    const newCharacter: Omit<Character, 'id'> = {
      name: values.name,
      role: values.role,
      gender: values.gender,
      age: values.age,
      personality: values.personality,
      goals: values.goals.split('\n').filter(Boolean),
      background: values.background,
      relationships: values.relationships.split('\n').filter(Boolean).map(name => ({
        targetId: '',
        targetName: name,
        type: 'friend'
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (editingCharacter) {
        await updateCharacter(currentProject.id, { ...editingCharacter, ...newCharacter });
        message.success('角色更新成功');
      } else {
        await addCharacter(currentProject.id, newCharacter);
        message.success('角色创建成功');
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error('操作失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleDelete = async (character: Character) => {
    if (!currentProject) return;
    
    try {
      await deleteCharacter(currentProject.id, character.id);
      message.success('角色删除成功');
    } catch (err) {
      message.error('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'protagonist':
        return <Tag color="red">主角</Tag>;
      case 'antagonist':
        return <Tag color="orange">反派</Tag>;
      default:
        return <Tag color="blue">配角</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>;
      default:
        return <Tag color="gray">非活跃</Tag>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>👤 角色管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          创建角色
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card 
            style={{ 
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {characters && characters.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={characters}
                renderItem={(character) => (
                  <List.Item>
                    <Card 
                      hoverable
                      style={{ 
                        background: '#16213e',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar 
                          size={64} 
                          icon={<UserOutlined />} 
                          style={{ 
                            marginRight: 16,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 16, color: '#fff' }}>{character.name}</Text>
                            <Space style={{ marginLeft: 8 }}>
                              {getRoleTag(character.role)}
                              {getStatusTag(character.status || 'active')}
                            </Space>
                          </div>
                          
                          {character.age && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              年龄: {character.age}岁
                            </Text>
                          )}
                          
                          <Paragraph style={{ margin: '8px 0', color: '#ccc', fontSize: 13 }}>
                            {character.personality}
                          </Paragraph>

                          {character.relationships && character.relationships.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>关系:</Text>
                              <Space>
                                {character.relationships.slice(0, 3).map((rel, idx) => (
                                  <Tag key={idx} color="purple">{rel.targetName}</Tag>
                                ))}
                              </Space>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Button 
                              size="small" 
                              icon={<EditOutlined />}
                              onClick={() => handleOpenModal(character)}
                            >
                              编辑
                            </Button>
                            <Button 
                              size="small" 
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => handleDelete(character)}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                <UserOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <p>暂无角色</p>
                <p style={{ fontSize: 12 }}>点击右上角按钮创建角色</p>
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card 
            title="🎭 角色统计"
            style={{ 
              background: '#16213e',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>总角色数</Text>
                <Badge 
                  count={characters?.length || 0} 
                  style={{ backgroundColor: '#667eea' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>主角</Text>
                <Badge 
                  count={characters?.filter(c => c.role === 'protagonist').length || 0} 
                  style={{ backgroundColor: '#ff4d4f' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>配角</Text>
                <Badge 
                  count={characters?.filter(c => c.role === 'supporting').length || 0} 
                  style={{ backgroundColor: '#1890ff' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>反派</Text>
                <Badge 
                  count={characters?.filter(c => c.role === 'antagonist').length || 0} 
                  style={{ backgroundColor: '#faad14' }}
                />
              </div>
            </Space>
          </Card>

          <Card 
            title="💡 写作提示"
            style={{ 
              marginTop: 16,
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)'
            }}
          >
            <Paragraph style={{ fontSize: 13, color: '#ccc' }}>
              创建角色时，建议详细描述角色的性格、目标和背景故事，这将帮助 AI 更好地理解角色，生成更符合角色设定的对话和行为。
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingCharacter ? '编辑角色' : '创建角色'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如：林辰" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="role"
                label="角色定位"
                rules={[{ required: true, message: '请选择角色定位' }]}
              >
                <Select placeholder="选择定位">
                  <Option value="protagonist">主角</Option>
                  <Option value="antagonist">反派</Option>
                  <Option value="supporting">配角</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="age"
                label="年龄"
              >
                <Input type="number" placeholder="可选" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="personality"
            label="性格特点"
            rules={[{ required: true, message: '请描述性格特点' }]}
          >
            <Input placeholder="如：沉稳冷静，重情重义" />
          </Form.Item>

          <Form.Item
            name="goals"
            label="人生目标"
          >
            <TextArea 
              rows={3} 
              placeholder="每行一个目标" 
            />
          </Form.Item>

          <Form.Item
            name="background"
            label="背景故事"
          >
            <TextArea 
              rows={4} 
              placeholder="描述角色的背景故事..." 
            />
          </Form.Item>

          <Form.Item
            name="relationships"
            label="关系人物"
          >
            <TextArea 
              rows={2} 
              placeholder="每行一个关系人物名称" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CharacterPage;