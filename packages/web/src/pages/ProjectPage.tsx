import React, { useState } from 'react';
import { Card, Button, List, Modal, Form, Input, Select, message, Tag, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProjectItem {
  id: string;
  title: string;
  genre: string;
  status: string;
  chapters: number;
  updatedAt: string;
}

const ProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: '1', title: '修仙之途', genre: 'xianxia', status: '进行中', chapters: 50, updatedAt: '2024-01-15' },
    { id: '2', title: '都市奇缘', genre: 'urban', status: '已完成', chapters: 200, updatedAt: '2024-01-10' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateProject = (values: any) => {
    const newProject: ProjectItem = {
      id: Date.now().toString(),
      title: values.title,
      genre: values.genre,
      status: '规划中',
      chapters: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('项目创建成功!');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    message.success('项目已删除');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/import',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const genreColors: Record<string, string> = {
    xianxia: 'purple',
    fantasy: 'blue',
    urban: 'green',
    scifi: 'cyan',
    romance: 'red',
    mystery: 'gold',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>📚 我的项目</Title>
        <Space>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>导入小说</Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            新建项目
          </Button>
        </Space>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
        dataSource={projects}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <EditOutlined key="edit" />,
                <DeleteOutlined key="delete" onClick={() => handleDeleteProject(item.id)} />,
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Tag color={genreColors[item.genre] || 'default'}>
                      {item.genre.toUpperCase()}
                    </Tag>
                    <Text type="secondary">章节数: {item.chapters}</Text>
                    <Text type="secondary">状态: {item.status}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      更新: {item.updatedAt}
                    </Text>
                  </Space>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="新建创作项目"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="title"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入小说名称" />
          </Form.Item>

          <Form.Item
            name="genre"
            label="选择题材"
            rules={[{ required: true, message: '请选择题材' }]}
          >
            <Select placeholder="选择题材">
              <Option value="xianxia">仙侠修真</Option>
              <Option value="fantasy">玄幻奇幻</Option>
              <Option value="urban">都市异能</Option>
              <Option value="scifi">科幻未来</Option>
              <Option value="romance">浪漫言情</Option>
              <Option value="mystery">悬疑推理</Option>
              <Option value="historical">历史穿越</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="mode"
            label="创作模式"
            rules={[{ required: true, message: '请选择创作模式' }]}
          >
            <Select placeholder="选择创作模式">
              <Option value="original">原创</Option>
              <Option value="imitation">仿写</Option>
              <Option value="derivative">二创</Option>
              <Option value="fanfic">同人</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea rows={3} placeholder="简要描述你的小说..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建项目
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
