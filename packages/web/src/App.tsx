import React, { useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, theme } from 'antd';
import { 
  BookOutlined, 
  WriteOutlined, 
  AuditOutlined, 
  GlobalOutlined,
  SettingOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import WritingPage from './pages/WritingPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '0 24px'
          }}>
            <CloudOutlined style={{ fontSize: 32, color: '#fff', marginRight: 12 }} />
            <Title level={3} style={{ color: '#fff', margin: 0, flex: 1 }}>
              Cloud Book - AI小说创作平台
            </Title>
          </Header>
          
          <Layout>
            <Sider 
              collapsible 
              collapsed={collapsed} 
              onCollapse={setCollapsed}
              style={{ background: '#141414' }}
            >
              <Menu 
                theme="dark" 
                mode="inline" 
                defaultSelectedKeys={['1']}
                items={[
                  {
                    key: '1',
                    icon: <BookOutlined />,
                    label: <Link to="/">项目管理</Link>,
                  },
                  {
                    key: '2',
                    icon: <WriteOutlined />,
                    label: <Link to="/writing">写作</Link>,
                  },
                  {
                    key: '3',
                    icon: <AuditOutlined />,
                    label: <Link to="/audit">质量审计</Link>,
                  },
                  {
                    key: '4',
                    icon: <GlobalOutlined />,
                    label: <Link to="/settings">多语言设置</Link>,
                  },
                ]}
              />
            </Sider>
            
            <Layout style={{ padding: '0 24px 24px' }}>
              <Content
                style={{
                  padding: 24,
                  margin: 0,
                  minHeight: 280,
                  background: '#1a1a1a',
                  borderRadius: 8,
                }}
              >
                <Routes>
                  <Route path="/" element={<ProjectPage />} />
                  <Route path="/writing" element={<WritingPage />} />
                  <Route path="/audit" element={<AuditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
