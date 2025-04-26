"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authcontext";
import StatCard from "../component/layout/StatCard";
import { Package, Percent, Ticket } from "lucide-react";
import ProjectTable from "../component/layout/ProjectTable";
import DashboardLayout from "../component/layout/dashboardLayout";

export default function Dashboard() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Load theme preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  // Fetch orders only when token and user are available
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token || !user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`https://galaxy-backend-imkz.onrender.com/order/v1/orders/customer/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        if (data && data.orders) {
          setOrders(data.orders);
        }
        
      } catch (err: any) {
        setError(err);
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && user?.id) {
      fetchOrders();
    }
  }, [token, user]);

  return (
   <DashboardLayout>
     <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
        <h2 className={`text-xl sm:text-2xl font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'} mb-3 sm:mb-0`}>Overview</h2>
        <div>
          <select 
            className="bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 sm:py-3 sm:px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            defaultValue="Last 30 days"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Open Tickets"
          value="42"
          subtitle="/104 total"
          trend="down"
          trendValue="8%"
          icon={Ticket}
          iconText="15 high priority"
          isLightMode={isLightMode}
        />
        
        <StatCard 
          title="Total Orders"
          value="95"
          subtitle="/100 target"
          trend="up"
          trendValue="12%"
          icon={Package}
          iconText="$53,900 revenue"
          isLightMode={isLightMode}
        />
        
        <StatCard 
          title="Discount Tier"
          value="15%"
          subtitle="standard discount"
          trend="premium"
          trendValue="Premium"
          icon={Percent}
          iconText="Up to 25% on bulk orders"
          isLightMode={isLightMode}
        />
      </div>

      <ProjectTable isLightMode={isLightMode} />
    </div>
   </DashboardLayout>
  );
}