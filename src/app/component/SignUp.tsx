"use client";
import React, { useState } from "react";
import { X, Send, CheckCircle, User, Mail, Lock, LogIn, Shield, ChevronDown } from "lucide-react";
import { useAuth } from '../context/authcontext';
import { useRouter } from 'next/navigation';
import UserProfile from "../component/userprofile";
import { motion, AnimatePresence } from "framer-motion";

interface AuthField {
  name: string;
  id: string;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
  validation?: {
    pattern?: RegExp;
    message?: string;
  };
}

const LoginFields: AuthField[] = [
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email",
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    }
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Enter your password",
    validation: {
      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      message: "Password must be at least 8 characters with uppercase, lowercase, and number"
    }
  },
];

const RegisterFields: AuthField[] = [
  { 
    name: "Name", 
    id: "name", 
    type: "text",
    icon: <User className="text-gray-500" size={18} />,
    placeholder: "Enter your full name",
    validation: {
      pattern: /^[a-zA-Z\s]{3,}$/,
      message: "Name must be at least 3 characters"
    }
  },
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email",
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    }
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Create a password (min 8 chars)",
    validation: {
      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      message: "Password must be at least 8 characters with uppercase, lowercase, and number"
    }
  },
];

interface FormData {
  name?: string;
  email?: string;
  password?: string;
  role: string;
  adminOtp?: string;
  otpId?: string;
  [key: string]: string | undefined;
}

const SignupModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({ role: 'user' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const { login: authLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleModal = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      setTimeout(() => setIsModalVisible(true), 10);
    } else {
      setIsModalVisible(false);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubmitted(false);
        setFormData({ role: 'user' });
        setError(null);
        setOtpError(null);
        setRequiresOtp(false);
        setFieldErrors({});
      }, 300);
    }
  };

  const validateField = (id: string, value: string): boolean => {
    const field = isRegistering 
      ? RegisterFields.find(f => f.id === id) 
      : LoginFields.find(f => f.id === id);
    
    if (!field?.validation) return true;

    if (field.validation.pattern && !field.validation.pattern.test(value)) {
      setFieldErrors(prev => ({ ...prev, [id]: field.validation?.message || 'Invalid input' }));
      return false;
    }

    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    return true;
  };

  const handleInputChange = (id: string, value: string) => {
    validateField(id, value);
    setFormData(prev => ({ ...prev, [id]: value }));
    setError(null);
    if (id === 'adminOtp') setOtpError(null);
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ role: 'user' });
    setError(null);
    setOtpError(null);
    setRequiresOtp(false);
    setFieldErrors({});
  };

  const extractToken = (response: Response): string | null => {
    const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
    return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  };

  const requestAdminOtp = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/request-admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        }),
      });
  
      const data = await response.json();
      console.log(data)
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request admin OTP');
      }
  
      
      if (!data.otpId) {
        throw new Error('OTP ID not received from server');
      }
  
      setRequiresOtp(true);
     
      setFormData(prev => ({ ...prev, otpId: data.otpId }));
    } catch (err) {
      console.error('OTP request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to request OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    setIsLoading(true);
    setError(null);
    setOtpError(null);

    // Validate all fields
    const isValid = RegisterFields.every(field => {
      const value = formData[field.id] || '';
      return validateField(field.id, value);
    });

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
     
      if (formData.role === 'admin' && !requiresOtp) {
        await requestAdminOtp();
        return;
      }

     
      if (formData.role === 'admin' && requiresOtp && !formData.adminOtp) {
        setOtpError('OTP is required for admin registration');
        setIsLoading(false);
        return;
      }

    
      const response = await fetch('https://api.ghostmarket.net/user/v1/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          adminOtp: formData.adminOtp,
          otpId: formData.otpId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message?.toLowerCase().includes('otp')) {
          setOtpError(data.message);
        } else {
          setError(data.message || 'Failed to sign up');
        }
        throw new Error(data.message || 'Failed to sign up');
      }

      const token = extractToken(response) || data.data?.token;
      if (!token) throw new Error('No token received from server');

      
      const userData = data?.user;
      if (!userData) throw new Error('User data not found in response');

      
      localStorage.setItem('token', token);
      authLogin(token, userData);

      setIsSubmitted(true);
      setTimeout(() => {
        toggleModal();
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      if (!error && !otpError) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

   
    const isValid = LoginFields.every(field => {
      const value = formData[field.id] || '';
      return validateField(field.id, value);
    });

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.ghostmarket.net/user/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }

      const data = await response.json();
      const token = extractToken(response) || data.data?.token;
      if (!token) throw new Error('No token received from server');
      
      const userData = data?.user;
      if (!userData) throw new Error('User data not found in response');
      
      localStorage.setItem('token', token);
      authLogin(token, userData);
      
      setIsSubmitted(true);
      setTimeout(() => {
        toggleModal();
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isRegistering) {
      signUp();
    } else {
      handleLogin();
    }
  };

  const selectRole = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
    setShowRoleDropdown(false);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button 
          onClick={toggleModal} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl py-3 px-5 rounded-lg hover:shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
        >
          Login / Register
        </button>
      ) : (
        <div className="relative">
          <UserProfile />
        </div>
      )}

      {isModalOpen && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300 ease-in-out ${isModalVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} 
          onClick={toggleModal}
        >
          <motion.div 
            className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative transition-all duration-300 ease-in-out ${isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {!isSubmitted ? (
              <>  
                <div className="mb-6 relative">
                  <button 
                    onClick={toggleModal} 
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isRegistering ? "Create an Account" : "Welcome Back"}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isRegistering ? "Sign up to get started with our services" : "Sign in to access your account"}
                  </p>
                </div>

                <div className="space-y-6">
                  {isRegistering ? (
                    <>
                      <AuthDisplay 
                        fields={RegisterFields} 
                        onInputChange={handleInputChange} 
                        fieldErrors={fieldErrors}
                      />
                      
                      {/* Role Selection */}
                      <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Account Type
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                          className="w-full border text-left border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Shield className="text-gray-500 mr-2" size={18} />
                            <span className="capitalize">{formData.role}</span>
                          </div>
                          <ChevronDown 
                            className={`text-gray-500 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} 
                            size={18} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {showRoleDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                            >
                              {['user', 'admin'].map(role => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => selectRole(role)}
                                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors capitalize ${formData.role === role ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                  {role}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* OTP Verification Section */}
                      {requiresOtp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                        >
                          <div className="flex flex-col">
                            <label htmlFor="adminOtp" className="text-sm font-medium text-gray-700 mb-1">
                              Admin Verification OTP
                            </label>
                            <input
                              id="adminOtp"
                              name="adminOtp"
                              type="text"
                              value={formData.adminOtp || ''}
                              onChange={e => {
                                setOtpError(null);
                                handleInputChange('adminOtp', e.target.value);
                              }}
                              placeholder="Enter the OTP sent to admin"
                              className={`w-full border text-black border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ${otpError ? 'border-red-300' : ''}`}
                            />
                            {otpError && (
                              <p className="text-red-500 text-xs mt-1">{otpError}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Please contact the administrator to get the verification OTP
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <AuthDisplay 
                      fields={LoginFields} 
                      onInputChange={handleInputChange} 
                      fieldErrors={fieldErrors}
                    />
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start"
                    >
                      <div className="flex-shrink-0 mr-2">
                        <X className="text-red-500" size={18} />
                      </div>
                      <p>{error}</p>
                    </motion.div>
                  )}

                  <button 
                    onClick={handleSubmit} 
                    disabled={isLoading} 
                    className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center space-x-2 active:scale-95`}
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        {isRegistering ? <Send size={20} /> : <LogIn size={20} />}
                        <span>{isRegistering ? (requiresOtp ? 'Verify OTP' : 'Sign Up') : 'Sign In'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button 
                      onClick={toggleAuthMode} 
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center py-12 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CheckCircle size={64} className="text-green-500 animate-bounce" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {isRegistering ? "Registration Successful!" : "Login Successful!"}
                </h3>
                <p className="text-gray-600 text-center">
                  {isRegistering 
                    ? "Your account has been created. Welcome aboard!" 
                    : "Welcome back! You're now signed in."}
                </p>
                <motion.div
                  className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-4"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

interface AuthDisplayProps {
  fields: AuthField[];
  onInputChange: (id: string, value: string) => void;
  fieldErrors: Record<string, string>;
}

const AuthDisplay = ({ fields, onInputChange, fieldErrors }: AuthDisplayProps) => (
  <div className="space-y-4">
    {fields.map(field => (
      <div key={field.id} className="flex flex-col">
        <label htmlFor={field.id} className="text-sm font-medium text-gray-700 mb-1">
          {field.name}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {field.icon}
          </div>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            onChange={e => onInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full border text-black border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ${fieldErrors[field.id] ? 'border-red-300' : ''}`}
          />
        </div>
        {fieldErrors[field.id] && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors[field.id]}</p>
        )}
      </div>
    ))}
  </div>
);

export default SignupModal;