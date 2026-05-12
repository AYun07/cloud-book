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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HeartOutlined,
  FlagOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Character {
  id: string;
  name: string;
  avatar?: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  gender: 'male' | 'female' | 'other';
  age?: number;
  personality: string;
  goals: string;
  background: string;
  relationships: string[];
  status: 'active' | 'inactive';
}

const mockCharacters: Character[] = [
  {
    id: '1',
    name: '林辰',
    role: 'protagonist',
    gender: 'male',
    age: 18,
    personality: '沉稳冷静，重情重义，有正义感',
    goals: '寻找失散的家人，揭开身世之谜',
    background: '从小在孤儿院长大，拥有神秘的血脉之力',
    relationships: ['苏婉清（恋人）', '赵无极（师父）'],
    status: 'active'
  },
  {
    id: '2',
    name: '苏婉清',
    role: 'supporting',
    gender: 'female',
    age: 17,
    personality: '温柔善良，聪慧机敏，善解人意',
    goals: '成为最强的炼药师',
    background: '丹道世家的千金，天赋异禀',
    relationships: ['林辰（恋人）', '苏震天（父亲）'],
    status: 'active'
  },
  {
    id: '3',
    name: '赵无极',
    role: 'supporting',
    gender: 'male',
    age: 50,
    personality: '严厉但护短，外表粗犷内心细腻',
    goals: '培养出超越自己的弟子',
    background: '曾经的天才武者，因伤隐退',
    relationships: ['林辰（弟子）'],
    status: 'active'
  },
  {
    id: '4',
    name: '血魔',
    role: 'antagonist',
    gender: 'male',
    age: 数百岁,
    personality: '残忍嗜杀，野心勃勃，冷酷无情',
    goals: '夺取神器，称霸大陆',
    background: '上古魔修转世，实力深不可测',
    relationships: [],
    status: 'active'
  }
];

const roleLabels: Record<string, string> = {
  protagonist: '主角',
  antagonist: '反派',
  supporting: '配角'
};

const roleColors: Record<string, string> = {
  protagonist: 'gold',
  antagonist: 'red',
  supporting: 'blue'
};

const genderLabels: Record<string, string> = {
  male: '男',
  female: '女',
  other: '其他'
};

const CharacterPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(mockCharacters);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [form] = Form.useForm();

  const handleAddCharacter = () => {
    setEditingChar(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCharacter = (char: Character) => {
    setEditingChar(char);
    form.setFieldsValue({
      name: char.name,
      role: char.role,
      gender: char.gender,
      age: char.age,
      personality: char.personality,
      goals: char.goals,
      background: char.background,
      relationships: char.relationships.join('\n')
    });
    setIsModalVisible(true);
  };

  const handleDeleteCharacter = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？',
      onOk: () => {
        setCharacters(prev => prev.filter(c => c.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const newChar: Character = {
        id: editingChar?.id || `char${Date.now()}`,
        name: values.name,
        role: values.role,
        gender: values.gender,
        age: values.age || undefined,
        personality: values.personality,
        goals: values.goals,
        background: values.background,
        relationships: values.relationships.split('\n').filter(Boolean),
        status: 'active'
      };

      if (editingChar) {
        setCharacters(prev => prev.map(c => c.id === editingChar.id ? newChar : c));
        message.success('修改成功');
      } else {
        setCharacters(prev => [...prev, newChar]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>角色管理</Title>
          <Text type="secondary">创建和管理小说中的角色</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCharacter}>
          添加角色
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>{characters.length}</Text>
            <div style={{ color: '#999', marginTop: 4 }}>总角色数</div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ffd700' }}>
              {characters.filter(c => c.role === 'protagonist').length}
            </Text>
            <div style={{ color: '#999', marginTop: 4 }}>主角</div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
              {characters.filter(c => c.role === 'supporting').length}
            </Text>
            <div style={{ color: '#999', marginTop: 4 }}>配角</div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#f5222d' }}>
              {characters.filter(c => c.role === 'antagonist').length}
            </Text>
            <div style={{ color: '#999', marginTop: 4 }}>反派</div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ color: '#fff', marginBottom: 16 }}>角色列表</Title>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={characters}
            renderItem={character => (
              <List.Item>
                <Card 
                  style={{ 
                    background: '#0f3460',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: selectedChar?.id === character.id ? '2px solid #667eea' : 'none'
                  }}
                  hoverable
                  onClick={() => setSelectedChar(character)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar size={56} icon={<UserOutlined />} style={{ background: '#667eea' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                          {character.name}
                        </Text>
                        <Tag color={roleColors[character.role]}>
                          {roleLabels[character.role]}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {genderLabels[character.gender]} · {character.age}岁
                      </Text>
                    </div>
                  </div>
                  <Space style={{ marginTop: 12 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={(e) => {
                      e.stopPropagation();
                      handleEditCharacter(character);
                    }}>
                      编辑
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character.id);
                    }}>
                      删除
                    </Button>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </div>

        <div style={{ width: 360 }}>
          <Title level={3} style={{ color: '#fff', marginBottom: 16 }}>角色详情</Title>
          {selectedChar ? (
            <Card style={{ background: '#16213e' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar size={80} icon={<UserOutlined />} style={{ background: '#667eea', marginBottom: 12 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                    {selectedChar.name}
                  </Text>
                  <Tag color={roleColors[selectedChar.role]}>
                    {roleLabels[selectedChar.role]}
                  </Tag>
                </div>
                <Text type="secondary" style={{ marginTop: 4 }}>
                  {genderLabels[selectedChar.gender]} · {selectedChar.age}岁
                </Text>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <HeartOutlined style={{ color: '#ff6b6b' }} />
                    <Text type="secondary">性格</Text>
                  </div>
                  <Text style={{ color: '#fff' }}>{selectedChar.personality}</Text>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FlagOutlined style={{ color: '#4ecdc4' }} />
                    <Text type="secondary">目标</Text>
                  </div>
                  <Text style={{ color: '#fff' }}>{selectedChar.goals}</Text>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileTextOutlined style={{ color: '#ffe66d' }} />
                    <Text type="secondary">背景</Text>
                  </div>
                  <Text style={{ color: '#fff' }}>{selectedChar.background}</Text>
                </div>

                <div>
                  <Text type="secondary" style={{ marginBottom: 8 }}>人际关系</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedChar.relationships.map((rel, idx) => (
                      <Tag key={idx}>{rel}</Tag>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
              <UserOutlined style={{ fontSize: 64, marginBottom: 16 }} />
              <p>选择一个角色查看详情</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingChar ? '编辑角色' : '添加角色'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="角色姓名" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="role" label="角色类型" initialValue="supporting">
              <Select>
                <Option value="protagonist">主角</Option>
                <Option value="antagonist">反派</Option>
                <Option value="supporting">配角</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gender" label="性别" initialValue="male">
              <Select>
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="age" label="年龄">
            <Input type="number" placeholder="年龄" />
          </Form.Item>

          <Form.Item name="personality" label="性格" rules={[{ required: true }]}>
            <Input.TextArea placeholder="描述角色性格特点" rows={3} />
          </Form.Item>

          <Form.Item name="goals" label="目标" rules={[{ required: true }]}>
            <Input.TextArea placeholder="角色的人生目标或追求" rows={3} />
          </Form.Item>

          <Form.Item name="background" label="背景" rules={[{ required: true }]}>
            <Input.TextArea placeholder="角色背景故事" rows={3} />
          </Form.Item>

          <Form.Item name="relationships" label="人际关系">
            <Input.TextArea placeholder="每行一个关系，如：张三（朋友）" rows={3} />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setIsModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default CharacterPage;