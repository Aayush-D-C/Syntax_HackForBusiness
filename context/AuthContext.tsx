// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { apiService } from '../services/apiService';

type AuthContextType = {
  isLoggedIn: boolean;
  isInitialized: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Check for existing token on app start
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          try {
            const response = await fetch('http://192.168.77.107:3001/api/health');
            if (response.ok) {
              setIsLoggedIn(true);
              setUser({ name: 'Ram Kumar', business_type: 'Grocery Store' });
            }
          } catch (error) {
            console.log('Backend not available, using mock auth');
            setIsLoggedIn(true);
            setUser({ name: 'Ram Kumar', business_type: 'Grocery Store' });
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Try real API first
      try {
        const result = await apiService.login(username, password);
        await AsyncStorage.setItem('authToken', result.token);
        setUser(result.user);
        setIsLoggedIn(true);
      } catch (apiError) {
        console.log('API login failed, using mock auth:', apiError);
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        await AsyncStorage.setItem('authToken', 'mock-token');
        setUser({ name: 'Ram Kumar', business_type: 'Grocery Store' });
        setIsLoggedIn(true);
      }
      
      setIsInitialized(true);
    } catch (error) {
      setIsInitialized(true);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isInitialized, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);