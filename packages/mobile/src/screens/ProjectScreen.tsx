import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectScreen({ route, navigation }: any) {
  const { project } = route.params;
  const [chapters, setChapters] = useState<any[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const addChapter = () => {
    Alert.prompt(
      '新增章节',
      '请输入章节标题：',
      (title) => {
        if (title) {
          const chapter = {
            id: `ch_${Date.now()}`,
            title,
            content: '',
            status: 'editing',
            createdAt: new Date(),
          };
          setChapters([...chapters, chapter]);
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectMeta}>类型: {project.genre}</Text>
          <Text style={styles.projectMeta}>状态: {project.status}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Writing', { project, chapters })}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>开始创作</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Characters', { project })}
          >
            <Ionicons name="people-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>角色管理</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('World', { project })}
          >
            <Ionicons name="globe-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>世界观</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chaptersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>章节列表</Text>
            <TouchableOpacity onPress={addChapter}>
              <Ionicons name="add-circle" size={28} color="#e94560" />
            </TouchableOpacity>
          </View>

          {chapters.length === 0 ? (
            <View style={styles.emptyChapters}>
              <Text style={styles.emptyText}>暂无章节</Text>
              <Text style={styles.emptySubtext}>点击右上角添加章节</Text>
            </View>
          ) : (
            chapters.map((chapter, index) => (
              <TouchableOpacity 
                key={chapter.id}
                style={styles.chapterItem}
                onPress={() => navigation.navigate('Writing', { project, chapter })}
              >
                <Text style={styles.chapterNumber}>第{index + 1}章</Text>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))
          )}
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
  scrollView: {
    flex: 1,
  },
  projectInfo: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 10,
  },
  projectMeta: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  actionButton: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
  chaptersSection: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  chapterItem: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterNumber: {
    color: '#e94560',
    fontSize: 14,
    marginRight: 10,
  },
  chapterTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  emptyChapters: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});
