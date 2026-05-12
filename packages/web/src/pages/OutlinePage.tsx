import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  List, 
  Tree, 
  Modal, 
  Form, 
  Select,
  Space,
  Typography,
  Tag,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import type { TreeNodeRenderProps } from 'antd/es/tree';

const { Title, Text } = Typography;
const { Option } = Select;

interface OutlineNode {
  id: string;
  title: string;
  type: 'section' | 'chapter' | 'scene';
  wordCount?: number;
  status: 'planned' | 'writing' | 'completed';
  children?: OutlineNode[];
}

const mockOutline: OutlineNode[] = [
  {
    id: 'part1',
    title: '第一部分：觉醒',
    type: 'section',
    status: 'completed',
    children: [
      { id: 'ch1', title: '第一章：平凡的日子', type: 'chapter', wordCount: 3200, status: 'completed' },
      { id: 'ch2', title: '第二章：神秘的力量', type: 'chapter', wordCount: 4100, status: 'completed' },
      { id: 'ch3', title: '第三章：命运的转折', type: 'chapter', wordCount: 2800, status: 'completed' },
    ]
  },
  {
    id: 'part2',
    title: '第二部分：修炼',
    type: 'section',
    status: 'writing',
    children: [
      { id: 'ch4', title: '第四章：踏上征途', type: 'chapter', wordCount: 3500, status: 'completed' },
      { id: 'ch5', title: '第五章：初露锋芒', type: 'chapter', wordCount: 2100, status: 'writing' },
      { id: 'ch6', title: '第六章：秘境探险', type: 'chapter', status: 'planned' },
    ]
  },
  {
    id: 'part3',
    title: '第三部分：崛起',
    type: 'section',
    status: 'planned',
    children: [
      { id: 'ch7', title: '第七章：声名鹊起', type: 'chapter', status: 'planned' },
      { id: 'ch8', title: '第八章：宗门大会', type: 'chapter', status: 'planned' },
      { id: 'ch9', title: '第九章：风云变幻', type: 'chapter', status: 'planned' },
    ]
  }
];

const statusColors: Record<string, string> = {
  planned: 'default',
  writing: 'processing',
  completed: 'success'
};

const statusLabels: Record<string, string> = {
  planned: '待写',
  writing: '创作中',
  completed: '已完成'
};

const typeLabels: Record<string, string> = {
  section: '卷',
  chapter: '章',
  scene: '节'
};

const OutlinePage: React.FC = () => {
  const [outline, setOutline] = useState<OutlineNode[]>(mockOutline);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<OutlineNode | null>(null);
  const [form] = Form.useForm();

  const renderTreeNode = ({ title, type, status, wordCount }: TreeNodeRenderProps & { type?: string; status?: string; wordCount?: number }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={statusColors[status || 'planned']}>
            {typeLabels[type || 'chapter']}
          </Tag>
          <span>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {wordCount && <Text type="secondary">{wordCount.toLocaleString()}字</Text>}
          <Tag color={statusColors[status || 'planned']} size="small">
            {statusLabels[status || 'planned']}
          </Tag>
        </div>
      </div>
    );
  };

  const treeData = outline.map(part => ({
    title: renderTreeNode({ title: part.title, type: part.type, status: part.status }),
    key: part.id,
    children: part.children?.map(chapter => ({
      title: renderTreeNode({ title: chapter.title, type: chapter.type, status: chapter.status, wordCount: chapter.wordCount }),
      key: chapter.id
    }))
  }));

  const handleAddChapter = () => {
    setEditingNode(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditNode = (node: OutlineNode) => {
    setEditingNode(node);
    form.setFieldsValue({
      title: node.title,
      type: node.type,
      status: node.status
    });
    setIsModalVisible(true);
  };

  const handleDeleteNode = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个章节吗？',
      onOk: () => {
        setOutline(prev => prev.map(part => ({
          ...part,
          children: part.children?.filter(ch => ch.id !== id)
        })));
        message.success('删除成功');
      }
    });
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (editingNode) {
        setOutline(prev => prev.map(part => ({
          ...part,
          children: part.children?.map(ch => 
            ch.id === editingNode.id ? { ...ch, ...values } : ch
          )
        })));
        message.success('修改成功');
      } else {
        const newChapter: OutlineNode = {
          id: `ch${Date.now()}`,
          title: values.title,
          type: values.type,
          status: values.status,
          wordCount: 0
        };
        setOutline(prev => prev.map((part, index) => 
          index === 0 ? { ...part, children: [...(part.children || []), newChapter] } : part
        ));
        message.success('添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const totalWords = outline.reduce((total, part) => 
    total + (part.children?.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) || 0), 0
  );

  const completedCount = outline.reduce((total, part) => 
    total + (part.children?.filter(ch => ch.status === 'completed').length || 0), 0
  );

  const totalCount = outline.reduce((total, part) => 
    total + (part.children?.length || 0), 0
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>大纲管理</Title>
          <Text type="secondary">管理小说章节结构，规划故事脉络</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChapter}>
          添加章节
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>{totalCount}</Text>
            <div style={{ color: '#999', marginTop: 4 }}>总章节数</div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>{completedCount}</Text>
            <div style={{ color: '#999', marginTop: 4 }}>已完成</div>
          </div>
        </Card>
        <Card style={{ background: '#0f3460' }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ffa940' }}>{totalWords.toLocaleString()}</Text>
            <div style={{ color: '#999', marginTop: 4 }}>总字数</div>
          </div>
        </Card>
      </div>

      <Card style={{ background: '#0f3460' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ color: '#fff', marginBottom: 16 }}>章节结构</Title>
            <Tree
              treeData={treeData}
              defaultExpandAll
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={(keys) => setSelectedKey(keys[0])}
              showLine
            />
          </div>
          
          <Divider type="vertical" />
          
          <div style={{ width: 320 }}>
            <Title level={3} style={{ color: '#fff', marginBottom: 16 }}>章节详情</Title>
            {selectedKey ? (
              <Card style={{ background: '#16213e' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">标题</Text>
                    <div style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>
                      {outline.flatMap(p => p.children || []).find(c => c.id === selectedKey)?.title}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">状态</Text>
                    <Tag color={statusColors[(outline.flatMap(p => p.children || []).find(c => c.id === selectedKey)?.status) || 'planned']} style={{ marginTop: 4 }}>
                      {statusLabels[(outline.flatMap(p => p.children || []).find(c => c.id === selectedKey)?.status) || 'planned']}
                    </Tag>
                  </div>
                  <div>
                    <Text type="secondary">字数</Text>
                    <div style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>
                      {(outline.flatMap(p => p.children || []).find(c => c.id === selectedKey)?.wordCount || 0).toLocaleString()} 字
                    </div>
                  </div>
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                      const node = outline.flatMap(p => p.children || []).find(c => c.id === selectedKey);
                      if (node) handleEditNode(node);
                    }}>
                      编辑
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteNode(selectedKey)}>
                      删除
                    </Button>
                  </Space>
                </Space>
              </Card>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                <CaretRightOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <p>选择一个章节查看详情</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        title={editingNode ? '编辑章节' : '添加章节'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="章节标题" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="chapter">
            <Select>
              <Option value="chapter">章节</Option>
              <Option value="section">卷</Option>
              <Option value="scene">节</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="planned">
            <Select>
              <Option value="planned">待写</Option>
              <Option value="writing">创作中</Option>
              <Option value="completed">已完成</Option>
            </Select>
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

export default OutlinePage;