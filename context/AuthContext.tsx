// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isInitialized: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Replace with actual authentication logic
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty credentials
      setIsLoggedIn(true);
      setIsInitialized(true);
    } catch (error) {
      setIsInitialized(true);
      throw error;
    }
  }, []);


  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);