

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  text: string;
  href: string;
  isActive?: boolean;
}

interface NavItemsProps {
  items: NavItemProps[];
  isLightMode: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ items, isLightMode }) => {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.text}
          href={item.href}
          className={`flex items-center space-x-2 py-2 px-4 rounded-md transition duration-300 ease-in-out ${
            item.isActive
              ? isLightMode ? 'bg-blue-100 text-blue-600 font-semibold' : 'bg-blue-800 text-blue-200 font-semibold'
              : isLightMode ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:bg-slate-800'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.text}</span>
        </Link>
      ))}
    </>
  );
};

export default NavItems;