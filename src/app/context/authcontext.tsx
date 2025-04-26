"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
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
  
  // Single authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('auth_token');
      
      if (!storedToken) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/validate-token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`  
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          if (userData && userData.user) {
            setToken(storedToken);
            setUser(userData.user);
            setIsAuthenticated(true);
          } else {
            handleAuthFailure();
          }
        } else {
          handleAuthFailure();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };
  
  const login = (newToken: string, userData: User) => {
    console.log('Login successful, setting user data and token');
    
    if (newToken && userData) {
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      console.error('Login attempted with invalid token or user data');
    }
  };
  
  const logout = async () => {
    try {
      if (token) {
        await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleAuthFailure();
      router.push('/');
    }
  };
  
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};