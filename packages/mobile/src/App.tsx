import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ProjectScreen from './screens/ProjectScreen';
import WritingScreen from './screens/WritingScreen';
import CharacterScreen from './screens/CharacterScreen';
import WorldScreen from './screens/WorldScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Project"
          component={ProjectScreen}
          options={{ title: '项目详情' }}
        />
        <Stack.Screen
          name="Writing"
          component={WritingScreen}
          options={{ title: '写作' }}
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
  );
}