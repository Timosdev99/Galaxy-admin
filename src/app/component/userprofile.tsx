"use client";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from '../../app/context/authcontext';
import { useRouter } from 'next/navigation';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  
  const getInitial = () => {
    if (user?.name) {
      return  user.name.charAt(0).toUpperCase();
    }
    return <User/>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold"
        aria-expanded={isOpen}
      >
        {getInitial()}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-lg font-medium text-gray-900">{user?.name}</p>
            <p className="text-lg text-black truncate">{user?.email}</p>
            {user?.id && <p className="text-sm text-black mt-1">ID: {user.id}</p>}
          </div>
          
          <div className="py-1">
            <button
              onClick={navigateToDashboard}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;