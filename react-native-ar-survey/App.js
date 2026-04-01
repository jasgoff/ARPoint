import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A0A0A',
    card: '#141414',
    text: '#FFFFFF',
    border: '#333333',
    primary: '#FF4500',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer theme={DarkTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
