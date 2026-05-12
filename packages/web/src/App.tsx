import React, { useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, theme } from 'antd';
import { 
  BookOutlined, 
  EditOutlined, 
  AuditOutlined, 
  GlobalOutlined,
  SettingOutlined,
  CloudOutlined,
  UnorderedListOutlined,
  UserOutlined
} from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import WritingPage from './pages/WritingPage';
import OutlinePage from './pages/OutlinePage';
import CharacterPage from './pages/CharacterPage';
import WorldPage from './pages/WorldPage';
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
          colorPrimary: '#667eea',
          colorPrimaryHover: '#764ba2',
          borderRadius: 8,
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            <CloudOutlined style={{ fontSize: 32, color: '#667eea', marginRight: 12 }} />
            <Title level={3} style={{ color: '#fff', margin: 0, flex: 1, fontWeight: 600 }}>
              Cloud Book
            </Title>
            <span style={{ color: '#999', fontSize: 14 }}>AI小说创作平台</span>
          </Header>
          
          <Layout>
            <Sider 
              collapsible 
              collapsed={collapsed} 
              onCollapse={setCollapsed}
              style={{ 
                background: '#16213e',
                borderRight: '1px solid rgba(255,255,255,0.05)'
              }}
              width={220}
            >
              <Menu 
                theme="dark" 
                mode="inline" 
                defaultSelectedKeys={['1']}
                style={{ 
                  background: 'transparent',
                  borderRight: 'none',
                  marginTop: 16
                }}
                items={[
                  {
                    key: '1',
                    icon: <BookOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/" style={{ fontSize: 14 }}>项目管理</Link>,
                  },
                  {
                    key: '2',
                    icon: <EditOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/writing" style={{ fontSize: 14 }}>创作中心</Link>,
                  },
                  {
                    key: '3',
                    icon: <UnorderedListOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/outline" style={{ fontSize: 14 }}>大纲管理</Link>,
                  },
                  {
                    key: '4',
                    icon: <UserOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/characters" style={{ fontSize: 14 }}>角色管理</Link>,
                  },
                  {
                    key: '5',
                    icon: <GlobalOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/world" style={{ fontSize: 14 }}>世界观</Link>,
                  },
                  {
                    key: '6',
                    icon: <AuditOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/audit" style={{ fontSize: 14 }}>质量审计</Link>,
                  },
                  {
                    key: '7',
                    icon: <GlobalOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/settings" style={{ fontSize: 14 }}>系统设置</Link>,
                  },
                ]}
              />
            </Sider>
            
            <Layout style={{ padding: '0 24px 24px', background: '#0f0f1a' }}>
              <Content
                style={{
                  padding: 24,
                  margin: 24,
                  minHeight: 280,
                  background: '#16213e',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Routes>
                  <Route path="/" element={<ProjectPage />} />
                  <Route path="/writing" element={<WritingPage />} />
                  <Route path="/outline" element={<OutlinePage />} />
                  <Route path="/characters" element={<CharacterPage />} />
                  <Route path="/world" element={<WorldPage />} />
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