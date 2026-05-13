import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WritingScreen({ route, navigation }: any) {
  const { project, chapter } = route.params;
  const [content, setContent] = useState(chapter?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = async () => {
    setIsSaving(true);
    try {
      const chaptersStr = await AsyncStorage.getItem(`chapters_${project.id}`) || '[]';
      const chapters = JSON.parse(chaptersStr);
      
      const chapterIndex = chapters.findIndex((c: any) => c.id === chapter?.id);
      if (chapterIndex >= 0) {
        chapters[chapterIndex].content = content;
        chapters[chapterIndex].updatedAt = new Date();
      } else {
        chapters.push({
          id: chapter?.id || `ch_${Date.now()}`,
          title: chapter?.title || '新章节',
          content,
          updatedAt: new Date()
        });
      }
      
      await AsyncStorage.setItem(`chapters_${project.id}`, JSON.stringify(chapters));
      Alert.alert('保存成功', '章节内容已保存');
    } catch (error) {
      Alert.alert('保存失败', '无法保存章节内容');
    } finally {
      setIsSaving(false);
    }
  };

  const generateContent = () => {
    Alert.alert(
      'AI创作',
      '是否使用AI生成内容？（需要配置大模型API）',
      [
        { text: '取消', style: 'cancel' },
        { text: '生成', onPress: () => {
          Alert.alert('提示', '请在设置中配置大模型API');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {chapter?.title || '新章节'}
          </Text>
          <View style={styles.toolbarActions}>
            <TouchableOpacity onPress={generateContent} style={styles.toolButton}>
              <Ionicons name="bulb-outline" size={24} color="#e94560" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveContent} style={styles.toolButton}>
              <Ionicons name={isSaving ? "hourglass" : "save-outline"} size={24} color="#e94560" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <TextInput
            style={styles.editor}
            multiline
            placeholder="开始创作..."
            placeholderTextColor="#666"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="text-outline" size={20} color="#888" />
            <Text style={styles.bottomText}>字数: {content.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="scan-outline" size={20} color="#888" />
            <Text style={styles.bottomText}>审计</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  keyboardView: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 15,
  },
  toolbarActions: {
    flexDirection: 'row',
  },
  toolButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  editor: {
    flex: 1,
    fontSize: 18,
    lineHeight: 32,
    color: '#fff',
    padding: 20,
    minHeight: 500,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomText: {
    color: '#888',
    marginLeft: 5,
    fontSize: 14,
  },
});
