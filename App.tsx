import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import './src/i18n/config';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}

