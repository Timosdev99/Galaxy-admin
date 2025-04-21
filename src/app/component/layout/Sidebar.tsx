
import { 
    BarChart, 
    Package, 
    Ticket,  
    User, 
    Settings, 
    MessageCircle
  } from 'lucide-react';
  import Link from 'next/link';
  import NavItems from './NavItems';
  
  export default function Sidebar({ isLightMode }: any) {
    // Navigation items array to make it more maintainable
    const navItems = [
        { icon: BarChart, text: "Dashboard", href: "/", isActive: true },
      { icon: Package, text: "Orders", href: "/orders" },
      { icon: Ticket, text: "Tickets", href: "#" },
      {icon: MessageCircle, text: "Chat", href: "/chats"},
      { icon: User, text: "Customers", href: "#" },
      { icon: Settings, text: "Settings", href: "#" },
     
    ];
  
    return (
      <aside className={`hidden md:flex flex-col w-64 ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-r-2 border-gray-300 h-screen sticky top-20`}>
        <nav className="mt-5 px-2">
          <NavItems items={navItems} isLightMode={isLightMode} />
        </nav>
      </aside>
    );
  }