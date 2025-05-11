
import { 
  BarChart, 
  Package, 
  Ticket,  
  Settings, 
  Home,
  Store,
  LogOut,
  MessageCircle,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../context/authcontext';
import { usePathname, useRouter } from 'next/navigation';
import NavItems from './NavItems';
import { useEffect, useState } from 'react';

interface NavItem {
icon: LucideIcon;
text: string;
href: string;
isActive?: boolean;
}

export default function MobileSidebar({ isLightMode }: any) {
  const { logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([
     { icon: BarChart, text: "Dashboard", href: "/dashboard" },
     { icon: Package, text: "Order", href: "/orders" },
     { icon: MessageCircle, text: "Chat", href: "/chats" },
     { icon: Ticket, text: "Tickets", href: "#" },
     {icon: Store, text: "MarketPlace", href: "create"}
   ]);

   useEffect(() => {
      const updatedNavItems = navItems.map((item) => ({
        ...item,
        isActive: item.href === pathname,
      }));
      setNavItems(updatedNavItems);
    }, [pathname]);

  return (
    <aside className={`md:hidden flex flex-col w-full ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-b-2 border-gray-300 z-40`}>
      <nav className="py-2">
        <NavItems items={navItems} isLightMode={isLightMode} />
        <button 
          onClick={handleLogout}
          className={`group flex items-center px-4 py-3 text-sm font-medium w-full text-left ${isLightMode ? 'text-red-600' : 'text-red-400'} rounded-md hover:bg-gray-50 hover:text-red-700`}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}