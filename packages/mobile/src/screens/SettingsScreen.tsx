import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: any) {
  const [settings, setSettings] = React.useState({
    darkMode: true,
    autoSave: true,
    offlineMode: true,
    notifications: false,
  });

  const handleExportData = () => {
    Alert.alert(
      '导出数据',
      '是否导出所有项目数据？',
      [
        { text: '取消', style: 'cancel' },
        { text: '导出', onPress: () => Alert.alert('提示', '数据导出功能开发中') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '清除', 
          style: 'destructive',
          onPress: () => Alert.alert('成功', '缓存已清除')
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Cloud Book',
      '版本: 1.0.0\n\nAI小说创作平台\n全平台覆盖\n\n© 2024 Cloud Book Team',
      [{ text: '确定' }]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    value?: boolean,
    onValueChange?: (value: boolean) => void,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#e94560" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {value !== undefined && onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: '#e94560' }}
          thumbColor="#fff"
        />
      )}
      {onPress && !value && (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>设置</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通用设置</Text>
          {renderSettingItem(
            'moon-outline',
            '深色模式',
            '使用深色主题界面',
            settings.darkMode,
            (value) => setSettings({ ...settings, darkMode: value })
          )}
          {renderSettingItem(
            'save-outline',
            '自动保存',
            '自动保存创作内容',
            settings.autoSave,
            (value) => setSettings({ ...settings, autoSave: value })
          )}
          {renderSettingItem(
            'cloud-offline-outline',
            '离线模式',
            '启用本地向量搜索',
            settings.offlineMode,
            (value) => setSettings({ ...settings, offlineMode: value })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>大模型配置</Text>
          {renderSettingItem(
            'key-outline',
            'API密钥',
            '配置大模型API密钥',
            undefined,
            undefined,
            () => Alert.alert('提示', '请在环境变量中配置API密钥')
          )}
          {renderSettingItem(
            'server-outline',
            'API地址',
            '配置API服务地址',
            undefined,
            undefined,
            () => Alert.alert('提示', '当前: https://gemini.beijixingxing.com/v1')
          )}
          {renderSettingItem(
            'cube-outline',
            '模型选择',
            '选择使用的AI模型',
            undefined,
            undefined,
            () => Alert.alert('模型列表', 'deepseek-v4-flash\ngemini-2.5-flash[真流]\ngemini-3-flash-preview[真流/假流]')
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          {renderSettingItem(
            'download-outline',
            '导出数据',
            '导出所有项目数据',
            undefined,
            undefined,
            handleExportData
          )}
          {renderSettingItem(
            'cloud-upload-outline',
            '导入数据',
            '从文件导入项目',
            undefined,
            undefined,
            () => Alert.alert('提示', '导入功能开发中')
          )}
          {renderSettingItem(
            'trash-outline',
            '清除缓存',
            '清除临时缓存文件',
            undefined,
            undefined,
            handleClearCache
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          {renderSettingItem(
            'information-circle-outline',
            '关于Cloud Book',
            '版本 1.0.0',
            undefined,
            undefined,
            handleAbout
          )}
          {renderSettingItem(
            'help-circle-outline',
            '帮助与反馈',
            '获取帮助或提交问题',
            undefined,
            undefined,
            () => Linking.openURL('https://github.com/AYun07/cloud-book')
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Cloud Book v1.0.0</Text>
          <Text style={styles.footerSubtext}>全平台AI小说创作平台</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
});
