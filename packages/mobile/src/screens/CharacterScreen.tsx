import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
}

export default function CharacterScreen({ route }: any) {
  const { project } = route.params;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const stored = await AsyncStorage.getItem(`characters_${project.id}`);
      if (stored) {
        setCharacters(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    }
  };

  const addCharacter = async () => {
    if (!newName.trim()) {
      Alert.alert('错误', '请输入角色名称');
      return;
    }

    const character: Character = {
      id: `char_${Date.now()}`,
      name: newName,
      role: newRole || '配角',
      description: ''
    };

    const updated = [...characters, character];
    setCharacters(updated);
    await AsyncStorage.setItem(`characters_${project.id}`, JSON.stringify(updated));
    
    setNewName('');
    setNewRole('');
  };

  const deleteCharacter = (id: string) => {
    Alert.alert(
      '删除角色',
      '确定要删除这个角色吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updated = characters.filter(c => c.id !== id);
            setCharacters(updated);
            await AsyncStorage.setItem(`characters_${project.id}`, JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case '主角': return '#e94560';
      case '反派': return '#ff6b6b';
      default: return '#4ecdc4';
    }
  };

  const renderCharacter = ({ item }: { item: Character }) => (
    <View style={styles.characterCard}>
      <View style={styles.characterHeader}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <Text style={styles.characterName}>{item.name}</Text>
      </View>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteCharacter(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>角色管理</Text>
        <Text style={styles.headerCount}>{characters.length}个角色</Text>
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="角色名称"
          placeholderTextColor="#666"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={[styles.input, styles.roleInput]}
          placeholder="角色定位（主角/反派/配角）"
          placeholderTextColor="#666"
          value={newRole}
          onChangeText={setNewRole}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCharacter}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>添加角色</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={characters}
        renderItem={renderCharacter}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>暂无角色</Text>
            <Text style={styles.emptySubtext}>添加你的第一个角色</Text>
          </View>
        }
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCount: {
    fontSize: 14,
    color: '#888',
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
  roleInput: {
    marginBottom: 15,
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
  list: {
    padding: 15,
    paddingTop: 0,
  },
  characterCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
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
