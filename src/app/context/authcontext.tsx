"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  
  const cleanToken = useCallback((token: string) => {
    return token.replace(/^Bearer\s+/i, '');
  }, []);

 
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const validated = await validateToken(storedToken);
          if (!validated) {
            handleAuthFailure();
          }
        }
      } catch (error) {
        console.error('Initial auth initialization failed:', error);
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (rawToken: string): Promise<boolean> => {
    try {
      const token = cleanToken(rawToken);
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return false;

      const data = await response.json();
      const userData = data?.user || data?.data?.user;

      if (!userData) return false;

      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const login = async (rawToken: string, userData: User) => {
    try {
      const token = cleanToken(rawToken);
      
      
      const isValid = await validateToken(token);
      if (!isValid) {
        throw new Error('Invalid token received');
      }

      
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Login failed:', error);
      handleAuthFailure();
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cleanToken(token)}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      handleAuthFailure();
      router.push('/');
    }
  };

  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        if (event.newValue) {
          validateToken(event.newValue).catch(console.error);
        } else {
          handleAuthFailure();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      token,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};