import 'react-native-get-random-values';
import '@azure/core-asynciterator-polyfill';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './navigation/Navigation';
import { testSupabaseConnection, testAuth } from './testConnection';

export default function App() {
  useEffect(() => {
    // Test Supabase connection on app start
    const initializeApp = async () => {
      console.log('🚀 Initializing AFRI-Plates app...');
      
      // Test connection
      const connectionResult = await testSupabaseConnection();
      
      if (connectionResult.success) {
        console.log('✅ Authentication is now enabled!');
        console.log('🔐 You can now use login, signup, and profile features.');
      } else if (connectionResult.needsSetup) {
        console.log('⚠️ Database setup required. Please run the setup scripts.');
      } else {
        console.log('❌ Connection failed. Check your Supabase credentials.');
      }
      
      // Test auth
      await testAuth();
    };
    
    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <StatusBar style="auto" />
            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
