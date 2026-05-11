import React, { useState } from 'react';
import { Card, Typography, Space, Button, List, Tag, Progress, message, Badge } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AuditIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion?: string;
}

interface AuditResult {
  passed: boolean;
  score: number;
  issues: AuditIssue[];
}

const AuditPage: React.FC = () => {
  const [content, setContent] = useState(`这是一个测试章节内容，用于展示审计功能。
在这里我们将检测各种质量问题，包括角色一致性、世界观逻辑、伏笔回收等等。
主角张三正在一个神秘的山谷中探索。
突然，天空中出现了一道闪电。
就在这时，山谷深处传来了一阵奇异的光芒。
张三心中一凛，他感觉到了一股强大的力量正在逼近。
然而，就在这时，意外发生了。`);
  
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    setIsAuditing(true);
    
    setTimeout(() => {
      const mockResult: AuditResult = {
        passed: false,
        score: 0.72,
        issues: [
          {
            type: 'ai_detection',
            severity: 'warning',
            description: '检测到"然而"等AI常用连接词',
            suggestion: '建议使用更口语化的表达替代'
          },
          {
            type: 'character_consistency',
            severity: 'info',
            description: '角色称呼可能出现混用',
            suggestion: '保持第三人称叙述的一致性'
          },
          {
            type: 'plot_logic',
            severity: 'info',
            description: '时间逻辑正常',
            suggestion: ''
          }
        ]
      };
      
      setAuditResult(mockResult);
      setIsAuditing(false);
      message.success('审计完成!');
    }, 2000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>🔍 质量审计</Title>
        <Button 
          type="primary" 
          icon={<SafetyCertificateOutlined />}
          onClick={handleAudit}
          loading={isAuditing}
        >
          开始审计
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        <Card title="待审计内容">
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'Georgia, serif',
            lineHeight: 1.8,
            maxHeight: 600,
            overflow: 'auto'
          }}>
            {content}
          </pre>
        </Card>

        <Card title="审计结果">
          {auditResult ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Badge 
                  status={auditResult.passed ? 'success' : 'error'} 
                  text={
                    <Text strong style={{ fontSize: 16 }}>
                      {auditResult.passed ? '通过审计' : '未通过审计'}
                    </Text>
                  }
                />
                <Progress 
                  percent={Math.round(auditResult.score * 100)} 
                  status={auditResult.passed ? 'success' : 'exception'}
                  style={{ marginTop: 8 }}
                />
              </div>

              <Title level={5}>发现问题 ({auditResult.issues.length})</Title>
              
              <List
                size="small"
                dataSource={auditResult.issues}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getSeverityIcon(item.severity)}
                      title={
                        <Space>
                          <Tag color={getSeverityColor(item.severity)}>
                            {item.severity.toUpperCase()}
                          </Tag>
                          <Text>{item.type}</Text>
                        </Space>
                      }
                      description={
                        <Paragraph type="secondary" style={{ margin: 0 }}>
                          {item.description}
                          {item.suggestion && (
                            <><br/><Text type="warning">建议: {item.suggestion}</Text></>
                          )}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <SafetyCertificateOutlined style={{ fontSize: 48, color: '#666' }} />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                点击"开始审计"按钮分析内容质量
              </Paragraph>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuditPage;
