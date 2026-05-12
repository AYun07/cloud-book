import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ProjectScreen from './src/screens/ProjectScreen';
import WritingScreen from './src/screens/WritingScreen';
import CharacterScreen from './src/screens/CharacterScreen';
import WorldScreen from './src/screens/WorldScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#16213e',
            }
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Cloud Book' }}
          />
          <Stack.Screen 
            name="Project" 
            component={ProjectScreen}
            options={{ title: '项目详情' }}
          />
          <Stack.Screen 
            name="Writing" 
            component={WritingScreen}
            options={{ title: '创作' }}
          />
          <Stack.Screen 
            name="Characters" 
            component={CharacterScreen}
            options={{ title: '角色管理' }}
          />
          <Stack.Screen 
            name="World" 
            component={WorldScreen}
            options={{ title: '世界观设定' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: '设置' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
