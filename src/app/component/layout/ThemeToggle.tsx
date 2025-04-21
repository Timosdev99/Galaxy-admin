
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isLightMode, toggleLightMode }: any) {
  return (
    <button
      onClick={toggleLightMode}
      className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors duration-300"
      aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLightMode ? 
        <Moon className="h-5 w-5 text-gray-700" /> : 
        <Sun className="h-5 w-5 text-yellow-400" />
      }
    </button>
  );
}