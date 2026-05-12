import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  updatedAt: Date;
  chapterCount: number;
}

export default function HomeScreen({ navigation }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const stored = localStorage.getItem('cloudbook_projects');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const createNewProject = () => {
    Alert.prompt(
      '新建项目',
      '请输入项目名称：',
      async (title) => {
        if (title) {
          const newProject: Project = {
            id: `proj_${Date.now()}`,
            title,
            genre: '武侠',
            status: 'active',
            updatedAt: new Date(),
            chapterCount: 0
          };
          
          const updatedProjects = [newProject, ...projects];
          setProjects(updatedProjects);
          localStorage.setItem('cloudbook_projects', JSON.stringify(updatedProjects));
          
          navigation.navigate('Project', { project: newProject });
        }
      }
    );
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => navigation.navigate('Project', { project: item })}
    >
      <View style={styles.projectHeader}>
        <Ionicons name="book" size={24} color="#e94560" />
        <Text style={styles.projectTitle}>{item.title}</Text>
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectMeta}>类型: {item.genre}</Text>
        <Text style={styles.projectMeta}>章节: {item.chapterCount}</Text>
      </View>
      <Text style={styles.projectDate}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cloud Book</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索项目..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>暂无项目</Text>
            <Text style={styles.emptySubtext}>点击下方按钮创建第一个项目</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={createNewProject}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  projectCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  projectInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  projectMeta: {
    fontSize: 14,
    color: '#888',
    marginRight: 15,
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
