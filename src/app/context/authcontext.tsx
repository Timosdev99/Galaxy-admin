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
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // Set isClient flag once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load token from localStorage on mount - with better debug
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const storedToken = localStorage.getItem('token');
      console.log('Checking localStorage for token:', !!storedToken);
      
      if (storedToken) {
        console.log('Found token in localStorage, validating...');
        setToken(storedToken);
        validateToken(storedToken);
      } else {
        console.log('No token found in localStorage');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setIsLoading(false);
    }
  }, [isClient]);
  
  // Validate token function with better error handling
  const validateToken = async (tokenToValidate: string) => {
    console.log('Validating token:', tokenToValidate?.substring(0, 10) + '...');
    
    try {
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/validate-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToValidate}`  
        },
      });
      
      console.log('Token validation response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Token validation succeeded, user data:', userData);
        
        if (userData && userData.user) {
          setUser(userData.user);
          setIsAuthenticated(true);
          console.log('User authenticated:', userData.user);
        } else {
          console.error('Invalid user data structure:', userData);
          handleAuthFailure();
        }
      } else {
        const errorText = await response.text();
        console.error('Token validation failed:', response.status, errorText);
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
    console.log('Authentication failed, clearing state');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    try {
      localStorage.removeItem('token');
      console.log('Removed token from localStorage');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  };
  
  const login = (newToken: string, userData: User) => {
    console.log('Login attempt with token and user:', !!newToken, userData);
    
    if (newToken && userData) {
      // Format the token consistently
      const formattedToken = newToken.startsWith('Bearer ') ? newToken.substring(7) : newToken;
      
      try {
        // Set in localStorage first to ensure it works
        localStorage.setItem('token', formattedToken);
        console.log('Token saved in localStorage');
        
        // Then update state
        setToken(formattedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('Authentication state updated successful');
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }
    } else {
      console.error('Login attempted with invalid token or user data');
    }
  };
  
  const logout = async () => {
    console.log('Logout initiated');
    
    try {
      if (token) {
        const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  
          },
        });
        console.log('Logout API response:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleAuthFailure();
      router.push('/');
    }
  };
  
  // Event listener for storage changes (for multi-tab support)
  useEffect(() => {
    if (!isClient) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        console.log('Token changed in another tab/window');
        if (event.newValue) {
          setToken(event.newValue);
          validateToken(event.newValue);
        } else {
          handleAuthFailure();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isClient]);
  
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