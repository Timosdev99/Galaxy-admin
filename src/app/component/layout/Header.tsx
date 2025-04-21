
"use client"

import { Menu } from 'lucide-react';
import UserProfile from '../userprofile';
import ThemeToggle from './ThemeToggle';

export default function Header({ isLightMode, toggleLightMode, toggleMobileMenu }: any) {
  return (
    <header className={`${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-b-2 border-gray-400 sticky top-0 z-50 py-3 md:py-5 shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 sm:h-16 md:h-20">
          <div className="flex items-center">
            <button 
              className={`md:hidden mr-4 ${isLightMode ? 'text-gray-600' : 'text-white'}`}
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-none">
              GhostMarket Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle isLightMode={isLightMode} toggleLightMode={toggleLightMode} />
            {/* <UserProfile />  */}
          </div>
        </div>
      </div>
    </header>
  );
}