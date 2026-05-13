import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  Form, 
  Space,
  Typography,
  Tag,
  Tabs,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  HeatMapOutlined,
  LineOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface WorldSetting {
  id: string;
  name: string;
  description: string;
  category: 'power' | 'location' | 'faction' | 'history' | 'culture';
  icon: string;
}

interface PowerSystem {
  id: string;
  name: string;
  level: string;
  description: string;
  specialAbility: string;
}

interface Location {
  id: string;
  name: string;
  type: 'city' | 'forest' | 'mountain' | 'ocean' | 'dungeon';
  description: string;
  importance: 'high' | 'medium' | 'low';
}

interface Faction {
  id: string;
  name: string;
  type: 'cult' | 'family' | 'school' | 'empire';
  description: string;
  leader: string;
  strength: number;
}

const mockPowerSystems: PowerSystem[] = [
  {
    id: '1',
    name: '武道',
    level: '九重境界',
    description: '修炼肉身，强化体魄，打破极限',
    specialAbility: '肉身成圣，刀枪不入'
  },
  {
    id: '2',
    name: '魔法',
    level: '九阶法师',
    description: '感悟天地元素，引动自然之力',
    specialAbility: '元素掌控，毁天灭地'
  },
  {
    id: '3',
    name: '炼丹',
    level: '九品丹师',
    description: '萃取天地精华，炼制神奇丹药',
    specialAbility: '生死人肉白骨'
  },
  {
    id: '4',
    name: '阵法',
    level: '九级阵师',
    description: '布置天地大阵，引动星辰之力',
    specialAbility: '困敌杀敌，一念之间'
  }
];

const mockLocations: Location[] = [
  {
    id: '1',
    name: '天元城',
    type: 'city',
    description: '大陆第一大城，万商会聚，龙蛇混杂',
    importance: 'high'
  },
  {
    id: '2',
    name: '迷雾森林',
    type: 'forest',
    description: '神秘古老的森林，蕴含无数宝藏与危险',
    importance: 'high'
  },
  {
    id: '3',
    name: '万仞山',
    type: 'mountain',
    description: '大陆最高峰，传说有仙人遗迹',
    importance: 'medium'
  },
  {
    id: '4',
    name: '无尽海',
    type: 'ocean',
    description: '无边无际的海洋，海中有神秘种族',
    importance: 'medium'
  }
];

const mockFactions: Faction[] = [
  {
    id: '1',
    name: '青云宗',
    type: 'school',
    description: '正道第一宗门，传承千年',
    leader: '玄青真人',
    strength: 95
  },
  {
    id: '2',
    name: '血影教',
    type: 'cult',
    description: '魔道第一势力，行事诡秘',
    leader: '血魔',
    strength: 90
  },
  {
    id: '3',
    name: '轩辕家族',
    type: 'family',
    description: '古老的武道世家',
    leader: '轩辕霸天',
    strength: 85
  },
  {
    id: '4',
    name: '大炎帝国',
    type: 'empire',
    description: '大陆最强帝国，疆域辽阔',
    leader: '炎龙大帝',
    strength: 92
  }
];

const typeLabels: Record<string, string> = {
  city: '城市',
  forest: '森林',
  mountain: '山脉',
  ocean: '海洋',
  dungeon: '秘境',
  cult: '教派',
  family: '家族',
  school: '宗门',
  empire: '帝国'
};

const typeColors: Record<string, string> = {
  city: 'blue',
  forest: 'green',
  mountain: 'grey',
  ocean: 'cyan',
  dungeon: 'purple',
  cult: 'red',
  family: 'gold',
  school: 'blue',
  empire: 'orange'
};

const importanceLabels: Record<string, string> = {
  high: '重要',
  medium: '一般',
  low: '次要'
};

const importanceColors: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'grey'
};

const WorldPage: React.FC = () => {
  const [powers, setPowers] = useState<PowerSystem[]>(mockPowerSystems);
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [factions, setFactions] = useState<Faction[]>(mockFactions);
  const [activeTab, setActiveTab] = useState('power');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'power' | 'location' | 'faction'>('power');
  const [form] = Form.useForm();

  const handleAdd = (type: 'power' | 'location' | 'faction') => {
    setModalType(type);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (modalType === 'power') {
        const newPower: PowerSystem = {
          id: `power${Date.now()}`,
          name: values.name,
          level: values.level,
          description: values.description,
          specialAbility: values.specialAbility
        };
        setPowers(prev => [...prev, newPower]);
      } else if (modalType === 'location') {
        const newLoc: Location = {
          id: `loc${Date.now()}`,
          name: values.name,
          type: values.type,
          description: values.description,
          importance: values.importance
        };
        setLocations(prev => [...prev, newLoc]);
      } else {
        const newFaction: Faction = {
          id: `faction${Date.now()}`,
          name: values.name,
          type: values.type,
          description: values.description,
          leader: values.leader,
          strength: values.strength
        };
        setFactions(prev => [...prev, newFaction]);
      }
      message.success('添加成功');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>世界观设定</Title>
          <Text type="secondary">构建小说世界的规则与背景</Text>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LineOutlined style={{ fontSize: 28, color: '#667eea' }} />
            <div>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{powers.length}</Text>
              <div style={{ color: '#999', fontSize: 12 }}>力量体系</div>
            </div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HeatMapOutlined style={{ fontSize: 28, color: '#52c41a' }} />
            <div>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{locations.length}</Text>
              <div style={{ color: '#999', fontSize: 12 }}>地点</div>
            </div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TeamOutlined style={{ fontSize: 28, color: '#ffa940' }} />
            <div>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{factions.length}</Text>
              <div style={{ color: '#999', fontSize: 12 }}>势力</div>
            </div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GlobalOutlined style={{ fontSize: 28, color: '#1890ff' }} />
            <div>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>完整</Text>
              <div style={{ color: '#999', fontSize: 12 }}>世界框架</div>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ background: '#0f3460' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="力量体系" key="power">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('power')}>
                添加体系
              </Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {powers.map(power => (
                <Card key={power.id} style={{ background: '#16213e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{power.name}</Text>
                      <Tag color="purple" style={{ marginLeft: 8 }}>{power.level}</Tag>
                    </div>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} />
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Space>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>描述</Text>
                    <Text style={{ color: '#fff' }}>{power.description}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>特殊能力</Text>
                    <Text style={{ color: '#667eea' }}>{power.specialAbility}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>

          <TabPane tab="地点地图" key="location">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('location')}>
                添加地点
              </Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {locations.map(loc => (
                <Card key={loc.id} style={{ background: '#16213e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{loc.name}</Text>
                      <Tag color={typeColors[loc.type]} style={{ marginLeft: 8 }}>{typeLabels[loc.type]}</Tag>
                    </div>
                    <Tag color={importanceColors[loc.importance]}>{importanceLabels[loc.importance]}</Tag>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Text style={{ color: '#fff' }}>{loc.description}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>

          <TabPane tab="势力组织" key="faction">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('faction')}>
                添加势力
              </Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {factions.map(faction => (
                <Card key={faction.id} style={{ background: '#16213e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{faction.name}</Text>
                      <Tag color={typeColors[faction.type]} style={{ marginLeft: 8 }}>{typeLabels[faction.type]}</Tag>
                    </div>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} />
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Space>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">领袖：</Text>
                    <Text style={{ color: '#fff' }}>{faction.leader}</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">实力：</Text>
                    <Text style={{ color: '#667eea' }}>{faction.strength}/100</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: '#fff' }}>{faction.description}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`添加${modalType === 'power' ? '力量体系' : modalType === 'location' ? '地点' : '势力'}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="名称" />
          </Form.Item>

          {modalType === 'power' && (
            <>
              <Form.Item name="level" label="等级划分" rules={[{ required: true }]}>
                <Input placeholder="如：九重境界" />
              </Form.Item>
              <Form.Item name="specialAbility" label="特殊能力" rules={[{ required: true }]}>
                <Input.TextArea placeholder="该体系的特殊能力" rows={2} />
              </Form.Item>
            </>
          )}

          {modalType === 'location' && (
            <>
              <Form.Item name="type" label="类型" initialValue="city">
                <Select>
                  <Option value="city">城市</Option>
                  <Option value="forest">森林</Option>
                  <Option value="mountain">山脉</Option>
                  <Option value="ocean">海洋</Option>
                  <Option value="dungeon">秘境</Option>
                </Select>
              </Form.Item>
              <Form.Item name="importance" label="重要性" initialValue="medium">
                <Select>
                  <Option value="high">重要</Option>
                  <Option value="medium">一般</Option>
                  <Option value="low">次要</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {modalType === 'faction' && (
            <>
              <Form.Item name="type" label="类型" initialValue="school">
                <Select>
                  <Option value="cult">教派</Option>
                  <Option value="family">家族</Option>
                  <Option value="school">宗门</Option>
                  <Option value="empire">帝国</Option>
                </Select>
              </Form.Item>
              <Form.Item name="leader" label="领袖" rules={[{ required: true }]}>
                <Input placeholder="领袖姓名" />
              </Form.Item>
              <Form.Item name="strength" label="实力值" rules={[{ required: true }]}>
                <Input type="number" min={0} max={100} placeholder="0-100" />
              </Form.Item>
            </>
          )}

          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea placeholder="详细描述" rows={3} />
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

export default WorldPage;