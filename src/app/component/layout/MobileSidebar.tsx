
import { 
    BarChart, 
    Package, 
    Ticket, 
    FileText, 
    User, 
    Settings, 
    MessageCircle,
    LogOut
  } from 'lucide-react';
  import Link from 'next/link';
  import { useAuth } from './../../context/authcontext';
  import { useRouter } from 'next/navigation';
  import NavItems from './NavItems';
  
  export default function MobileSidebar({ isLightMode }: any) {
    const { logout } = useAuth();
    const router = useRouter();
    
    const handleLogout = () => {
      logout();
      router.push('/');
    };
  
    // Navigation items array
    const navItems = [
      { icon: BarChart, text: "Dashboard", href: "#", isActive: true },
      { icon: Package, text: "Orders", href: "#" },
      { icon: Ticket, text: "Tickets", href: "#" },
      {icon: MessageCircle, text: "Chat", href: "/chat"},
      { icon: User, text: "Customers", href: "#" },
      { icon: Settings, text: "Settings", href: "#" },
      
    ];
  
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