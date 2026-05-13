import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorldElement {
  id: string;
  category: string;
  name: string;
  description: string;
}

const CATEGORIES = ['地理', '势力', '武学', '宝物', '规则'];

export default function WorldScreen({ route }: any) {
  const { project } = route.params;
  const [elements, setElements] = useState<WorldElement[]>([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('地理');
  const [newDescription, setNewDescription] = useState('');

  const addElement = async () => {
    if (!newName.trim()) {
      Alert.alert('错误', '请输入名称');
      return;
    }

    const element: WorldElement = {
      id: `world_${Date.now()}`,
      category: newCategory,
      name: newName,
      description: newDescription
    };

    const updated = [...elements, element];
    setElements(updated);
    await AsyncStorage.setItem(`world_${project.id}`, JSON.stringify(updated));
    
    setNewName('');
    setNewDescription('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '地理': return 'map-outline';
      case '势力': return 'flag-outline';
      case '武学': return 'fitness-outline';
      case '宝物': return 'diamond-outline';
      case '规则': return 'document-text-outline';
      default: return 'ellipse-outline';
    }
  };

  const groupedElements = CATEGORIES.map(category => ({
    category,
    data: elements.filter(e => e.category === category)
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>世界观设定</Text>
          <Text style={styles.headerSubtitle}>{project.title}</Text>
        </View>

        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="名称"
            placeholderTextColor="#666"
            value={newName}
            onChangeText={setNewName}
          />
          
          <View style={styles.categoryPicker}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  newCategory === cat && styles.categoryChipActive
                ]}
                onPress={() => setNewCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  newCategory === cat && styles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="描述（可选）"
            placeholderTextColor="#666"
            multiline
            value={newDescription}
            onChangeText={setNewDescription}
          />

          <TouchableOpacity style={styles.addButton} onPress={addElement}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addButtonText}>添加设定</Text>
          </TouchableOpacity>
        </View>

        {groupedElements.map(group => (
          group.data.length > 0 && (
            <View key={group.category} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={getCategoryIcon(group.category) as any} size={20} color="#e94560" />
                <Text style={styles.sectionTitle}>{group.category}</Text>
                <Text style={styles.sectionCount}>{group.data.length}</Text>
              </View>
              
              {group.data.map(element => (
                <View key={element.id} style={styles.elementCard}>
                  <Text style={styles.elementName}>{element.name}</Text>
                  {element.description ? (
                    <Text style={styles.elementDescription}>{element.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )
        ))}

        {elements.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="globe-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>暂无世界观设定</Text>
            <Text style={styles.emptySubtext}>构建你的小说世界</Text>
          </View>
        )}
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
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  addSection: {
    padding: 15,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryChipActive: {
    backgroundColor: '#e94560',
  },
  categoryText: {
    color: '#888',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    padding: 15,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: '#888',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  elementCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  elementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  elementDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    marginTop: 15,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});
