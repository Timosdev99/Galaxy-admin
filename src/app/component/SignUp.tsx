"use client";
import React, { useState, useEffect } from "react";
import { Send, CheckCircle, User, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from '../../app/context/authcontext';
import { useRouter } from 'next/navigation';

interface AuthField {
  name: string;
  id: string;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
}

const LoginFields: AuthField[] = [
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email"
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Enter your password"
  },
];

const RegisterFields: AuthField[] = [
  { 
    name: "Name", 
    id: "name", 
    type: "text",
    icon: <User className="text-gray-500" size={18} />,
    placeholder: "Enter your full name"
  },
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email"
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Create a password"
  },
];

interface AuthDisplayProps {
  fields: AuthField[];
  onInputChange: (id: string, value: string) => void;
}

const AuthDisplay = ({ fields, onInputChange }: AuthDisplayProps) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label
            htmlFor={field.id}
            className="text-sm font-medium text-gray-700 mb-1"
          >
            {field.name}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {field.icon}
            </div>
            <input
              className="w-full border text-black border-gray-300 rounded-md p-2 pl-10 
                       focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              type={field.type}
              name={field.id}
              id={field.id}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface FormData {
  [key: string]: string | undefined;
}

const AuthComponent = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
 
  const { login: authLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Add a useEffect to handle the countdown and redirect
  useEffect(() => {
    if (redirectCountdown === null) return;
    
    if (redirectCountdown <= 0) {
      router.push('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null); 
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({});
    setError(null);
  };

  const signUp = async () => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting signup with:', { email: formData.email, name: formData.name });
      
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'admin'
        }),
      });
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign up');
      }
  
      // Extract data from response
      const data = await response.json();
      
      // Extract token from headers
      let token = null;
      const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
      if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      }
      
      if (!token) {
        console.error('No token found in response');
        throw new Error('No token received from server. Please contact support.');
      }
      
      if (data && data.user) {
        // Update auth context
        authLogin(token, data.user);
        
        // Show success UI and start countdown
        setIsSubmitted(true);
        setRedirectCountdown(2);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }
      
      // Extract data from response
      const data = await response.json();
      
      // Extract token from headers
      let token = null;
      const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
      if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      }
      
      if (!token) {
        console.error('No token found in response');
        throw new Error('No token received from server. Please contact support.');
      }
      
      if (data && data.user) {
        // Update auth context
        authLogin(token, data.user);
        
        // Show success UI and start countdown
        setIsSubmitted(true);
        setRedirectCountdown(2);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    } 
  };
  
  const handleSubmit = () => {
    const relevantFields = isRegistering ? RegisterFields : LoginFields;
    const isValid = relevantFields.every((field) => 
      formData[field.id] && formData[field.id]!.trim() !== ""
    );

    if (isValid) {
      if (isRegistering) {
        signUp();
      } else {
        handleLogin();
      }
    } else {
      setError("Please fill in all fields");
    }
  };

  // If user is already authenticated, don't show the auth form
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white/95 rounded-xl shadow-lg w-full max-w-md p-6">
      {!isSubmitted ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isRegistering ? "Create an Admin Account" : "Welcome Back Admin"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isRegistering 
                ? "Sign up as Admin" 
                : "Sign in to access your account"}
            </p>
          </div>

          <div className="space-y-6">
            <AuthDisplay 
              fields={isRegistering ? RegisterFields : LoginFields}
              onInputChange={handleInputChange} 
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {isRegistering ? <Send size={20} /> : <LogIn size={20} />}
                  <span>{isRegistering ? "Sign Up" : "Sign In"}</span>
                </>
              )}
            </button>
            
            <div className="text-center pt-2">
              <button 
                onClick={toggleAuthMode}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {isRegistering 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </>
      ) 
      : (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <CheckCircle
            size={64}
            className="text-green-500 animate-bounce"
          />
          <h3 className="text-2xl font-bold text-gray-800">
            {isRegistering ? "Registration Successful!" : "Login Successful!"}
          </h3>
          <p className="text-gray-600 text-center">
            {isRegistering 
              ? "Your account has been created. Welcome aboard!" 
              : "Welcome back! You're now signed in."}
          </p>
          {redirectCountdown !== null && (
            <p className="text-gray-500 text-sm">
              Redirecting to home page in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthComponent;