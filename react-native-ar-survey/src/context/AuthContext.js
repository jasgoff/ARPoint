import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const STORAGE_KEY = '@ar_survey_user';

// For demo purposes - in production, use your actual backend
const BACKEND_URL = 'https://your-backend-url.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored user on app launch
  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  // For demo: create a local user without OAuth
  const loginDemo = useCallback(async () => {
    const demoUser = {
      id: 'demo_user_' + Date.now(),
      name: 'Demo User',
      email: 'demo@arsurvey.app',
      picture: null,
      isDemo: true
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setIsAuthenticated(true);
    return demoUser;
  }, []);

  // Google OAuth login (requires backend setup)
  const loginWithGoogle = useCallback(async () => {
    try {
      // For Expo, you would typically use expo-auth-session
      // This is a placeholder - implement based on your auth backend
      
      // Option 1: Use Expo Google Auth
      // const [request, response, promptAsync] = Google.useAuthRequest({...});
      
      // Option 2: Use custom OAuth flow with your backend
      // const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      // For now, fall back to demo login
      return await loginDemo();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }, [loginDemo]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    loginDemo,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
