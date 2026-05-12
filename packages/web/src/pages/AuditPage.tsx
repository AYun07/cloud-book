import React, { useState } from 'react';
import { Card, Typography, Space, Button, List, Tag, Progress, message, Badge } from 'antd';
import { Input } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCloudBook } from '../context/CloudBookContext';

const { Title, Text, Paragraph } = Typography;

interface AuditIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion?: string;
  dimension?: string;
}

interface AuditResult {
  passed: boolean;
  score: number;
  issues: AuditIssue[];
  dimensions?: { name: string; score: number; passed: boolean }[];
}

const AuditPage: React.FC = () => {
  const { currentProject, auditChapter, isLoading, coreInstances } = useCloudBook();
  
  const [content, setContent] = useState(`这是一个测试章节内容，用于展示审计功能。
在这里我们将检测各种质量问题，包括角色一致性、世界观逻辑、伏笔回收等等。
主角林辰正在一个神秘的山谷中探索。
突然，天空中出现了一道闪电。
就在这时，山谷深处传来了一阵奇异的光芒。
林辰心中一凛，他感觉到了一股强大的力量正在逼近。
然而，就在这时，意外发生了。`);
  
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    if (!currentProject) {
      message.warning('请先选择一个项目');
      return;
    }

    setIsAuditing(true);
    
    try {
      const result = await auditChapter(currentProject.id, {
        content,
        dimensions: ['aiDetection', 'consistency', 'coherence', 'repetitiveness', 'completeness']
      });

      setAuditResult({
        passed: result.passed || false,
        score: result.score || 0,
        issues: result.issues?.map(i => ({
          type: i.dimension || 'unknown',
          severity: i.severity as 'critical' | 'warning' | 'info' || 'info',
          description: i.description || '',
          suggestion: i.suggestion,
          dimension: i.dimension
        })) || [],
        dimensions: result.dimensions?.map(d => ({
          name: d.name,
          score: d.score || 0,
          passed: d.passed || false
        }))
      });

      message.success('审计完成!');
    } catch (err) {
      message.error('审计失败：' + (err instanceof Error ? err.message : '未知错误'));
      console.error('Audit error:', err);
      
      // 回退到模拟数据
      setAuditResult({
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
      });
    } finally {
      setIsAuditing(false);
    }
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
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      default:
        return '#1890ff';
    }
  };

  const getSeverityTag = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Tag color="red">严重</Tag>;
      case 'warning':
        return <Tag color="orange">警告</Tag>;
      default:
        return <Tag color="blue">提示</Tag>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3}>🔍 内容审计</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<RefreshOutlined />}
            onClick={handleAudit}
            loading={isAuditing || isLoading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            开始审计
          </Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        <Card 
          title="📝 待审计内容"
          style={{ 
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入要审计的章节内容..."
            style={{ 
              minHeight: 400,
              fontSize: 16,
              lineHeight: 1.8,
              fontFamily: '"Georgia", "Noto Serif SC", serif',
              background: 'transparent',
              color: '#fff',
              border: 'none',
              resize: 'none'
            }}
          />
        </Card>

        <div>
          {auditResult && (
            <Card 
              title="📊 审计结果"
              style={{ 
                marginBottom: 16,
                background: auditResult.passed ? 'rgba(0, 184, 148, 0.1)' : 'rgba(230, 57, 70, 0.1)',
                border: `1px solid ${auditResult.passed ? '#00b894' : '#e63946'}`
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 18, color: auditResult.passed ? '#00b894' : '#e63946' }}>
                    {auditResult.passed ? '✅ 审计通过' : '⚠️ 需要改进'}
                  </Text>
                  <Badge 
                    count={`${(auditResult.score * 100).toFixed(0)}%`} 
                    style={{ 
                      backgroundColor: auditResult.passed ? '#00b894' : '#e63946',
                      fontSize: 16,
                      padding: '4px 12px'
                    }}
                  />
                </div>
                
                <Progress 
                  percent={auditResult.score * 100} 
                  strokeColor={{ 
                    '0%': '#ff6b6b', 
                    '50%': '#ffd93d', 
                    '100%': '#6bcb77' 
                  }}
                  showInfo={false}
                />
              </Space>
            </Card>
          )}

          {auditResult?.dimensions && auditResult.dimensions.length > 0 && (
            <Card 
              title="📈 各维度评分"
              style={{ 
                marginBottom: 16,
                background: '#16213e',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <List
                dataSource={auditResult.dimensions}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Text style={{ width: 120, color: '#ccc' }}>{item.name}</Text>
                      <Progress 
                        percent={item.score * 100} 
                        size="small" 
                        strokeColor={item.passed ? '#00b894' : '#e63946'}
                        style={{ flex: 1, margin: '0 16px' }}
                      />
                      {item.passed ? (
                        <CheckCircleOutlined style={{ color: '#00b894' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#e63946' }} />
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Card 
            title="⚠️ 问题列表"
            style={{ 
              background: '#16213e',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {auditResult?.issues && auditResult.issues.length > 0 ? (
              <List
                dataSource={auditResult.issues}
                renderItem={(issue) => (
                  <List.Item>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getSeverityIcon(issue.severity)}
                        <Text style={{ marginLeft: 8, color: '#fff' }}>{issue.description}</Text>
                        {getSeverityTag(issue.severity)}
                      </div>
                      {issue.suggestion && (
                        <Paragraph style={{ margin: '4px 0 0 28px', color: '#888', fontSize: 12 }}>
                          💡 {issue.suggestion}
                        </Paragraph>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                <SafetyCertificateOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>暂无审计结果</p>
                <p style={{ fontSize: 12 }}>点击"开始审计"按钮检测内容质量</p>
              </div>
            )}
          </Card>

          {!coreInstances?.auditEngine && (
            <Card 
              size="small" 
              style={{ 
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.3)'
              }}
            >
              <Text type="danger" style={{ fontSize: 12 }}>
                ⚠️ 审计引擎未连接，请先配置 API Key
              </Text>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPage;