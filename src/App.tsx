import { DarkTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StatusBar } from 'react-native';
import { Navigation } from './navigation';
import { SmokingProvider } from './context/SmokingContext';

SplashScreen.preventAutoHideAsync();

const dumanTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0F1A',
    card: '#1A1A2E',
    primary: '#00D9A6',
    text: '#FFFFFF',
    border: '#2E2E48',
    notification: '#FF6B6B',
  },
};

export function App() {
  return (
    <SmokingProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <Navigation
        theme={dumanTheme}
        linking={{
          enabled: 'auto',
          prefixes: [],
        }}
        onReady={() => {
          SplashScreen.hideAsync();
        }}
      />
    </SmokingProvider>
  );
}
