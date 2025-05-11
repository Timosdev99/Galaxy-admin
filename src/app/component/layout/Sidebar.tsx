import {
  BarChart,
  Package,
  Ticket,
  User,
  Settings,
  MessageCircle,
  Home,
  LucideIcon,
  Store,
} from 'lucide-react';
import NavItems from './NavItems';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  icon: LucideIcon;
  text: string;
  href: string;
  isActive?: boolean;
}

export default function Sidebar({ isLightMode }: any) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([
    { icon: BarChart, text: "Dashboard", href: "/dashboard" },
    { icon: Package, text: "Orders", href: "/orders" },
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
    <aside className={`hidden md:flex flex-col w-64 ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-r-2 border-gray-300 h-screen sticky top-20`}>
      <nav className="mt-5 px-2">
        <NavItems items={navItems} isLightMode={isLightMode} />
      </nav>
    </aside>
  );
}