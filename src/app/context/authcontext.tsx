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
  
  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    // Need to use this check for Next.js to prevent localStorage error during SSR
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        checkAuth(storedToken);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const checkAuth = async (existingToken: string | null) => {
    setIsLoading(true);
    
    if (!existingToken) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/validate-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${existingToken}`  
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        if (userData && userData.user) {
          setUser(userData.user);
          setIsAuthenticated(true);
        } else {
          console.warn('Valid response but missing user data');
          handleAuthFailure();
        }
      } else {
        console.log('Not authenticated:', response.status);
        handleAuthFailure();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      handleAuthFailure();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    // Check if we're in a browser environment before using localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };
  
  const login = (newToken: string, userData: User) => {
    console.log('Login successful, setting user data and token');
    
    if (newToken && userData) {
      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', newToken);
      }
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
      // Clear auth state no matter what happens with the logout request
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