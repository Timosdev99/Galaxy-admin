"use client"

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';

export default function DashboardLayout({ children }: any) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
      document.documentElement.classList.add("light"); 
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleLightMode = () => {
    setIsLightMode((prev) => !prev);
    
    if (!isLightMode) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-[#121212]' : 'bg-slate-900 text-white'}`}>
      <Header 
        isLightMode={isLightMode} 
        toggleLightMode={toggleLightMode}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      {isMobileMenuOpen && (
        <MobileSidebar isLightMode={isLightMode} />
      )}

      <div className="flex flex-col md:flex-row">
        <Sidebar isLightMode={isLightMode} />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}