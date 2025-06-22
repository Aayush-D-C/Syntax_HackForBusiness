// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

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
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // For now, just check if token exists (mock auth)
          setIsLoggedIn(true);
          setUser({ name: 'Ram Kumar', business_type: 'Grocery Store' });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, []); // Empty dependency array to run only once

  const login = useCallback(async (username: string, password: string) => {
    try {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Use mock authentication for now
      console.log('Using mock authentication');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Set mock user data
      const mockUser = { name: 'Ram Kumar', business_type: 'Grocery Store' };
      const mockToken = 'mock-token-' + Date.now();
      
      await AsyncStorage.setItem('authToken', mockToken);
      setUser(mockUser);
      setIsLoggedIn(true);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      // Skip API call for now since we're using mock data
      console.log('Mock logout completed');
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